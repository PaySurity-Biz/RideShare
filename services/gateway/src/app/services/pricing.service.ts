@@ .. @@
 import { Injectable } from '@nestjs/common';
+import { SupabaseService } from './supabase.service';
 
 interface QuoteRequest {
@@ .. @@
 @Injectable()
 export class PricingService {
+  constructor(private readonly supabaseService: SupabaseService) {}
+
   async calculateQuote(request: QuoteRequest): Promise<QuoteResponse> {
+    const supabase = this.supabaseService.getClient();
+
     try {
       // Calculate base distance and time
       const distance = this.calculateDistance(
@@ .. @@
       const estimatedDuration = Math.ceil(distance * 2.5); // 2.5 minutes per mile average
       
+      // Get current surge multiplier from database
+      const surgeMultiplier = await this.getCurrentSurgeMultiplier(
+        request.pickup.lat,
+        request.pickup.lng
+      );
+
       // Base pricing structure
       const baseFare = this.getBaseFare(request.category);
       const distanceFare = distance * this.getDistanceRate(request.category);
       const timeFare = estimatedDuration * this.getTimeRate(request.category);
       
+      // Airport fee if applicable
+      const airportFee = this.calculateAirportFee(request.pickup, request.dropoff);
+      
       // Calculate surge pricing
-      const surgeMultiplier = this.calculateSurgeMultiplier(request.pickup.lat, request.pickup.lng);
       const surgeCap = 2.0; // Maximum 2x surge
       const effectiveSurge = Math.min(surgeMultiplier, surgeCap);
       
-      const subtotal = (baseFare + distanceFare + timeFare) * effectiveSurge;
+      const subtotal = (baseFare + distanceFare + timeFare + airportFee) * effectiveSurge;
       
       // Line items for transparency
       const lineItems = [
@@ .. @@
         {
           name: 'Time',
           amount_cents: Math.round(timeFare * 100),
           description: `${estimatedDuration} minutes`
         }
       ];
+
+      if (airportFee > 0) {
+        lineItems.push({
+          name: 'Airport Fee',
+          amount_cents: Math.round(airportFee * 100)
+        });
+      }
       
       if (effectiveSurge > 1.0) {
@@ .. @@
       throw new Error('Failed to calculate quote');
     }
   }
+
+  private async getCurrentSurgeMultiplier(lat: number, lng: number): Promise<number> {
+    const supabase = this.supabaseService.getClient();
+
+    try {
+      // Get demand data from recent trip requests in the area
+      const { data: recentTrips, error } = await supabase
+        .from('trips')
+        .select('created_at')
+        .gte('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString()) // Last 30 minutes
+        .order('created_at', { ascending: false });
+
+      if (error || !recentTrips) {
+        return 1.0; // Default no surge
+      }
+
+      // Simple surge calculation based on recent demand
+      const demandCount = recentTrips.length;
+      
+      if (demandCount > 20) return 1.8;
+      if (demandCount > 15) return 1.5;
+      if (demandCount > 10) return 1.3;
+      if (demandCount > 5) return 1.2;
+      
+      return 1.0;
+
+    } catch (error) {
+      console.error('Error calculating surge:', error);
+      return 1.0;
+    }
+  }
+
+  private calculateAirportFee(pickup: any, dropoff: any): number {
+    const airports = [
+      { name: 'ORD', lat: 41.9786, lng: -87.9048, fee: 5.00 },
+      { name: 'MDW', lat: 41.7868, lng: -87.7524, fee: 3.00 }
+    ];
+
+    for (const airport of airports) {
+      const pickupDistance = this.calculateDistance(pickup.lat, pickup.lng, airport.lat, airport.lng);
+      const dropoffDistance = this.calculateDistance(dropoff.lat, dropoff.lng, airport.lat, airport.lng);
+      
+      // If pickup or dropoff is within 2 miles of airport
+      if (pickupDistance <= 2 || dropoffDistance <= 2) {
+        return airport.fee;
+      }
+    }
+
+    return 0;
+  }
 
   private getBaseFare(category: string): number {
@@ .. @@
     }
   }
 
-  private calculateSurgeMultiplier(lat: number, lng: number): number {
-    // Simple surge calculation based on time and location
-    const hour = new Date().getHours();
-    
-    // Rush hour surge
-    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
-      return 1.5;
-    }
-    
-    // Weekend night surge
-    const day = new Date().getDay();
-    if ((day === 5 || day === 6) && (hour >= 22 || hour <= 2)) {
-      return 1.8;
-    }
-    
-    return 1.0;
-  }
-
   private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {