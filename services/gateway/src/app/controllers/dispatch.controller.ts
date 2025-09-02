import { Controller, Post, Body, Get, Param, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DispatchService } from '../services/dispatch.service';

@ApiTags('dispatch')
@Controller('dispatch')
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Post('find-drivers')
  @ApiOperation({ summary: 'Find available drivers for a pickup location' })
  @ApiResponse({ status: 200, description: 'List of available drivers' })
  async findDrivers(@Body() request: {
    pickup_lat: number;
    pickup_lng: number;
    category: string;
    max_distance?: number;
  }) {
    const drivers = await this.dispatchService.findAvailableDrivers(
      request.pickup_lat,
      request.pickup_lng,
      request.category,
      request.max_distance
    );

    return {
      success: true,
      drivers,
      count: drivers.length
    };
  }

  @Post('dispatch-ride')
  @ApiOperation({ summary: 'Dispatch a ride to available drivers' })
  @ApiResponse({ status: 200, description: 'Ride dispatched successfully' })
  async dispatchRide(@Body() request: {
    rider_id: string;
    rider_name: string;
    rider_phone: string;
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
    estimated_fare: number;
    special_instructions?: string;
  }) {
    const tripId = await this.dispatchService.dispatchRide({
      riderId: request.rider_id,
      riderName: request.rider_name,
      riderPhone: request.rider_phone,
      pickup: request.pickup,
      dropoff: request.dropoff,
      category: request.category,
      estimatedFare: request.estimated_fare,
      specialInstructions: request.special_instructions
    });

    if (!tripId) {
      return {
        success: false,
        message: 'No available drivers found'
      };
    }

    return {
      success: true,
      trip_id: tripId,
      message: 'Ride dispatched to available drivers'
    };
  }

  @Put('accept-offer/:offerId')
  @ApiOperation({ summary: 'Accept a ride offer' })
  @ApiResponse({ status: 200, description: 'Offer accepted successfully' })
  async acceptOffer(
    @Param('offerId') offerId: string,
    @Body() request: { driver_id: string }
  ) {
    const success = await this.dispatchService.acceptRideOffer(
      request.driver_id,
      offerId
    );

    return {
      success,
      message: success ? 'Offer accepted successfully' : 'Failed to accept offer'
    };
  }
}