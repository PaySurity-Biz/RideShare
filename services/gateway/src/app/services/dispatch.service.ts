import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { RealtimeService } from './realtime.service';

interface RideRequest {
  riderId: string;
  riderName: string;
  riderPhone: string;
  pickup: {
    address: string;
    lat: number;
    lng: number;
  };
  dropoff: {
    address: string;
    lat: number;
    lng: number;
  };
  category: string;
  estimatedFare: number;
  specialInstructions?: string;
}

interface DriverMatch {
  driverId: string;
  distance: number;
  eta: number;
  rating: number;
  vehicleCategory: string;
}

@Injectable()
export class DispatchService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly realtimeService: RealtimeService
  ) {}

  async findAvailableDrivers(
    pickupLat: number,
    pickupLng: number,
    category: string,
    maxDistance: number = 10
  ): Promise<DriverMatch[]> {
    const supabase = this.supabaseService.getClient();

    try {
      // Find online drivers with matching vehicle category within radius
      const { data: drivers, error } = await supabase
        .from('drivers')
        .select(`
          id,
          rating,
          vehicles!inner (
            category
          ),
          driver_locations!inner (
            lat,
            lng,
            updated_at
          )
        `)
        .eq('status', 'online')
        .eq('is_active', true)
        .eq('vehicles.category', category)
        .gte('driver_locations.updated_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Within last 5 minutes
        .order('rating', { ascending: false });

      if (error || !drivers) {
        console.error('Error finding drivers:', error);
        return [];
      }

      // Calculate distances and filter by radius
      const matches: DriverMatch[] = [];
      
      for (const driver of drivers) {
        const driverLat = driver.driver_locations[0]?.lat;
        const driverLng = driver.driver_locations[0]?.lng;
        
        if (!driverLat || !driverLng) continue;

        const distance = this.calculateDistance(pickupLat, pickupLng, driverLat, driverLng);
        
        if (distance <= maxDistance) {
          const eta = Math.ceil(distance * 2.5); // Rough estimate: 2.5 minutes per mile
          
          matches.push({
            driverId: driver.id,
            distance,
            eta,
            rating: driver.rating,
            vehicleCategory: driver.vehicles[0].category
          });
        }
      }

      // Sort by distance, then by rating
      return matches.sort((a, b) => {
        if (a.distance !== b.distance) {
          return a.distance - b.distance;
        }
        return b.rating - a.rating;
      });

    } catch (error) {
      console.error('Error in findAvailableDrivers:', error);
      return [];
    }
  }

  async dispatchRide(rideRequest: RideRequest): Promise<string | null> {
    const supabase = this.supabaseService.getClient();

    try {
      // Find available drivers
      const availableDrivers = await this.findAvailableDrivers(
        rideRequest.pickup.lat,
        rideRequest.pickup.lng,
        rideRequest.category
      );

      if (availableDrivers.length === 0) {
        console.log('No available drivers found');
        return null;
      }

      // Create trip record
      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .insert({
          rider_id: rideRequest.riderId,
          pickup_address: rideRequest.pickup.address,
          dropoff_address: rideRequest.dropoff.address,
          pickup_lat: rideRequest.pickup.lat,
          pickup_lng: rideRequest.pickup.lng,
          dropoff_lat: rideRequest.dropoff.lat,
          dropoff_lng: rideRequest.dropoff.lng,
          distance_miles: this.calculateDistance(
            rideRequest.pickup.lat,
            rideRequest.pickup.lng,
            rideRequest.dropoff.lat,
            rideRequest.dropoff.lng
          ),
          fare_cents: rideRequest.estimatedFare,
          net_payout_cents: Math.floor(rideRequest.estimatedFare * 0.8), // 80% to driver
          commission_cents: Math.floor(rideRequest.estimatedFare * 0.2), // 20% commission
          status: 'requested',
          special_instructions: rideRequest.specialInstructions
        })
        .select()
        .single();

      if (tripError || !trip) {
        console.error('Error creating trip:', tripError);
        return null;
      }

      // Send offers to top 3 drivers
      const topDrivers = availableDrivers.slice(0, 3);
      const offerPromises = topDrivers.map(driver => this.sendRideOffer(driver, trip, rideRequest));
      
      await Promise.all(offerPromises);

      return trip.id;

    } catch (error) {
      console.error('Error dispatching ride:', error);
      return null;
    }
  }

  private async sendRideOffer(driver: DriverMatch, trip: any, rideRequest: RideRequest) {
    const supabase = this.supabaseService.getClient();
    
    const expiresAt = new Date(Date.now() + 15000); // 15 seconds to respond

    try {
      const { error } = await supabase
        .from('ride_offers')
        .insert({
          driver_id: driver.driverId,
          trip_id: trip.id,
          rider_name: rideRequest.riderName,
          rider_phone: rideRequest.riderPhone,
          pickup_address: rideRequest.pickup.address,
          dropoff_address: rideRequest.dropoff.address,
          pickup_lat: rideRequest.pickup.lat,
          pickup_lng: rideRequest.pickup.lng,
          dropoff_lat: rideRequest.dropoff.lat,
          dropoff_lng: rideRequest.dropoff.lng,
          estimated_fare_cents: rideRequest.estimatedFare,
          net_payout_cents: Math.floor(rideRequest.estimatedFare * 0.8),
          estimated_distance_miles: trip.distance_miles,
          estimated_duration_minutes: Math.ceil(trip.distance_miles * 2.5),
          pickup_eta_minutes: driver.eta,
          category: rideRequest.category,
          special_instructions: rideRequest.specialInstructions,
          expires_at: expiresAt.toISOString()
        });

      if (error) {
        console.error('Error sending ride offer:', error);
      }

      // Auto-expire the offer
      setTimeout(async () => {
        await supabase
          .from('ride_offers')
          .update({ status: 'expired' })
          .eq('driver_id', driver.driverId)
          .eq('trip_id', trip.id)
          .eq('status', 'pending');
      }, 15000);

    } catch (error) {
      console.error('Error in sendRideOffer:', error);
    }
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  async acceptRideOffer(driverId: string, offerId: string): Promise<boolean> {
    const supabase = this.supabaseService.getClient();

    try {
      // Get the offer
      const { data: offer, error: offerError } = await supabase
        .from('ride_offers')
        .select('*')
        .eq('id', offerId)
        .eq('driver_id', driverId)
        .eq('status', 'pending')
        .single();

      if (offerError || !offer) {
        return false;
      }

      // Accept the offer and decline all others for this trip
      const { error: updateError } = await supabase
        .from('ride_offers')
        .update({ status: 'accepted' })
        .eq('id', offerId);

      if (updateError) {
        return false;
      }

      // Decline other offers for the same trip
      await supabase
        .from('ride_offers')
        .update({ status: 'declined' })
        .eq('trip_id', offer.trip_id)
        .neq('id', offerId)
        .eq('status', 'pending');

      // Update trip status
      await supabase
        .from('trips')
        .update({ 
          driver_id: driverId,
          status: 'accepted' 
        })
        .eq('id', offer.trip_id);

      // Update driver status
      await supabase
        .from('drivers')
        .update({ status: 'en_route_pickup' })
        .eq('id', driverId);

      return true;

    } catch (error) {
      console.error('Error accepting ride offer:', error);
      return false;
    }
  }
}