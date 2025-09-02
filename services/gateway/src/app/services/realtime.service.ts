import { Injectable, OnModuleInit } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { RealtimeChannel } from '@supabase/supabase-js';

@Injectable()
export class RealtimeService implements OnModuleInit {
  private channels: Map<string, RealtimeChannel> = new Map();

  constructor(private readonly supabaseService: SupabaseService) {}

  onModuleInit() {
    this.setupRealtimeChannels();
  }

  private setupRealtimeChannels() {
    const supabase = this.supabaseService.getClient();

    // Driver location updates channel
    const locationChannel = supabase
      .channel('driver-locations')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'driver_locations' },
        (payload) => {
          console.log('Driver location updated:', payload);
          // Broadcast to relevant clients
          this.broadcastLocationUpdate(payload);
        }
      )
      .subscribe();

    this.channels.set('driver-locations', locationChannel);

    // Ride offers channel
    const offersChannel = supabase
      .channel('ride-offers')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'ride_offers' },
        (payload) => {
          console.log('Ride offer updated:', payload);
          this.broadcastRideOfferUpdate(payload);
        }
      )
      .subscribe();

    this.channels.set('ride-offers', offersChannel);

    // Trip status updates channel
    const tripsChannel = supabase
      .channel('trips')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'trips' },
        (payload) => {
          console.log('Trip updated:', payload);
          this.broadcastTripUpdate(payload);
        }
      )
      .subscribe();

    this.channels.set('trips', tripsChannel);
  }

  private broadcastLocationUpdate(payload: any) {
    // In a production app, you'd broadcast to WebSocket clients
    // For now, we'll log the update
    console.log('Broadcasting location update to clients:', payload);
  }

  private broadcastRideOfferUpdate(payload: any) {
    console.log('Broadcasting ride offer update to clients:', payload);
  }

  private broadcastTripUpdate(payload: any) {
    console.log('Broadcasting trip update to clients:', payload);
  }

  async subscribeToDriverUpdates(driverId: string, callback: (data: any) => void) {
    const supabase = this.supabaseService.getClient();
    
    const channel = supabase
      .channel(`driver-${driverId}`)
      .on('postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'ride_offers',
          filter: `driver_id=eq.${driverId}`
        },
        callback
      )
      .subscribe();

    return channel;
  }

  async unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName);
    if (channel) {
      await channel.unsubscribe();
      this.channels.delete(channelName);
    }
  }
}