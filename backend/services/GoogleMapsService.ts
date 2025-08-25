// Backend GoogleMapsService - server-side implementation

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface NearbyRacer {
  id: string;
  username: string;
  location: LocationCoordinates;
  distance: number;
  lastSeen: Date;
  car: {
    make: string;
    model: string;
    year: number;
  };
  status: 'online' | 'racing' | 'idle';
}

export interface RaceRoute {
  id: string;
  name: string;
  description: string;
  distance: number;
  estimatedTime: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  coordinates: LocationCoordinates[];
  waypoints: Array<{
    name: string;
    location: LocationCoordinates;
    type: 'start' | 'checkpoint' | 'finish';
  }>;
  elevation: {
    gain: number;
    loss: number;
    profile: Array<{ distance: number; elevation: number }>;
  };
}

export interface DirectionsResult {
  routes: Array<{
    distance: number;
    duration: number;
    polyline: string;
    steps: Array<{
      instruction: string;
      distance: number;
      duration: number;
      startLocation: LocationCoordinates;
      endLocation: LocationCoordinates;
    }>;
  }>;
  status: string;
}

export interface TrafficInfo {
  overallCondition: 'light' | 'moderate' | 'heavy' | 'severe';
  averageSpeed: number;
  congestionAreas: Array<{
    location: LocationCoordinates;
    severity: 'light' | 'moderate' | 'heavy';
    duration: number;
  }>;
  estimatedDelay: number;
  alternativeRoutes: number;
}

export interface PlaceResult {
  id: string;
  name: string;
  location: LocationCoordinates;
  address: string;
  rating: number;
  type: string;
  distance: number;
  phoneNumber?: string;
  website?: string;
  openingHours?: string[];
}

export interface LocationTrackingSession {
  sessionId: string;
  userId: string;
  raceId?: string;
  startTime: Date;
  isActive: boolean;
  options: {
    highAccuracy: boolean;
    distanceFilter: number;
    timeInterval: number;
  };
  lastLocation?: LocationCoordinates;
  totalDistance: number;
  trackPoints: Array<{
    location: LocationCoordinates;
    timestamp: Date;
    speed?: number;
    heading?: number;
  }>;
}

export class GoogleMapsService {
  private static readonly API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';
  private static readonly GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
  private static readonly DIRECTIONS_URL = 'https://maps.googleapis.com/maps/api/directions/json';
  private static readonly PLACES_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
  private static readonly ELEVATION_URL = 'https://maps.googleapis.com/maps/api/elevation/json';
  
  // In-memory storage for tracking sessions (in production, use a database)
  private static trackingSessions: Map<string, LocationTrackingSession> = new Map();

  /**
   * Geocode an address to coordinates
   */
  static async geocodeAddress(address: string): Promise<LocationCoordinates | null> {
    try {
      if (!this.API_KEY) {
        console.warn('Google Maps API key not configured, using mock data');
        return this.getMockGeocodeResult(address);
      }

      const url = `${this.GEOCODING_URL}?address=${encodeURIComponent(address)}&key=${this.API_KEY}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Google Maps API error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      
      if (data.status !== 'OK' || !data.results.length) {
        return null;
      }

      const location = data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
      };
    } catch (error) {
      console.warn('Geocoding failed, using mock data:', error);
      return this.getMockGeocodeResult(address);
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  static async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    try {
      if (!this.API_KEY) {
        console.warn('Google Maps API key not configured, using mock data');
        return this.getMockReverseGeocodeResult(latitude, longitude);
      }

      const url = `${this.GEOCODING_URL}?latlng=${latitude},${longitude}&key=${this.API_KEY}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Google Maps API error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      
      if (data.status !== 'OK' || !data.results.length) {
        return null;
      }

      return data.results[0].formatted_address;
    } catch (error) {
      console.warn('Reverse geocoding failed, using mock data:', error);
      return this.getMockReverseGeocodeResult(latitude, longitude);
    }
  }

  /**
   * Get nearby racers within radius
   */
  static async getNearbyRacers(
    latitude: number, 
    longitude: number, 
    radius: number = 5000
  ): Promise<NearbyRacer[]> {
    try {
      // In production, this would query a real-time database of active racers
      // For now, return mock data based on location
      return this.getMockNearbyRacers(latitude, longitude, radius);
    } catch (error) {
      console.warn('Failed to get nearby racers:', error);
      return [];
    }
  }

  /**
   * Get race routes between two points
   */
  static async getRaceRoutes(
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number
  ): Promise<RaceRoute[]> {
    try {
      // Generate multiple route options for racing
      return this.generateRaceRoutes(startLat, startLng, endLat, endLng);
    } catch (error) {
      console.warn('Failed to get race routes:', error);
      return [];
    }
  }

  /**
   * Get directions between two points
   */
  static async getDirections(
    origin: string,
    destination: string,
    mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
  ): Promise<DirectionsResult | null> {
    try {
      if (!this.API_KEY) {
        console.warn('Google Maps API key not configured, using mock data');
        return this.getMockDirections(origin, destination, mode);
      }

      const url = `${this.DIRECTIONS_URL}?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${mode}&key=${this.API_KEY}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Google Maps API error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      return this.transformDirectionsResult(data);
    } catch (error) {
      console.warn('Directions failed, using mock data:', error);
      return this.getMockDirections(origin, destination, mode);
    }
  }

  /**
   * Get traffic information for a route
   */
  static async getTrafficInfo(route: LocationCoordinates[]): Promise<TrafficInfo> {
    try {
      // In production, this would use Google Maps Traffic API
      return this.getMockTrafficInfo(route);
    } catch (error) {
      console.warn('Failed to get traffic info:', error);
      return this.getMockTrafficInfo(route);
    }
  }

  /**
   * Search for nearby places
   */
  static async searchNearbyPlaces(
    query: string,
    location?: string,
    radius: number = 5000
  ): Promise<PlaceResult[]> {
    try {
      if (!this.API_KEY) {
        console.warn('Google Maps API key not configured, using mock data');
        return this.getMockPlaceSearch(query, location, radius);
      }

      // For location-based search, we need coordinates
      let coordinates: LocationCoordinates | null = null;
      if (location) {
        coordinates = await this.geocodeAddress(location);
      }

      if (!coordinates && location) {
        // If geocoding failed, use mock data
        return this.getMockPlaceSearch(query, location, radius);
      }

      const url = coordinates 
        ? `${this.PLACES_URL}?location=${coordinates.latitude},${coordinates.longitude}&radius=${radius}&keyword=${encodeURIComponent(query)}&key=${this.API_KEY}`
        : `${this.PLACES_URL}?keyword=${encodeURIComponent(query)}&key=${this.API_KEY}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Google Maps API error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      return this.transformPlaceResults(data);
    } catch (error) {
      console.warn('Place search failed, using mock data:', error);
      return this.getMockPlaceSearch(query, location, radius);
    }
  }

  /**
   * Get elevation data for route points
   */
  static async getElevationData(route: LocationCoordinates[]): Promise<Array<{ location: LocationCoordinates; elevation: number }>> {
    try {
      if (!this.API_KEY) {
        console.warn('Google Maps API key not configured, using mock data');
        return this.getMockElevationData(route);
      }

      const locations = route.map(point => `${point.latitude},${point.longitude}`).join('|');
      const url = `${this.ELEVATION_URL}?locations=${locations}&key=${this.API_KEY}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Google Maps API error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      return this.transformElevationData(data);
    } catch (error) {
      console.warn('Elevation data failed, using mock data:', error);
      return this.getMockElevationData(route);
    }
  }

  /**
   * Get road conditions for a route
   */
  static async getRoadConditions(route: LocationCoordinates[]): Promise<any> {
    try {
      // This would integrate with road condition APIs in production
      return this.getMockRoadConditions(route);
    } catch (error) {
      console.warn('Failed to get road conditions:', error);
      return this.getMockRoadConditions(route);
    }
  }

  /**
   * Start location tracking session
   */
  static async startLocationTracking(
    userId: string,
    raceId?: string,
    options?: {
      highAccuracy?: boolean;
      distanceFilter?: number;
      timeInterval?: number;
    }
  ): Promise<LocationTrackingSession> {
    const sessionId = `session_${userId}_${Date.now()}`;
    const trackingOptions = {
      highAccuracy: options?.highAccuracy ?? true,
      distanceFilter: options?.distanceFilter ?? 10, // meters
      timeInterval: options?.timeInterval ?? 1000, // milliseconds
    };

    const session: LocationTrackingSession = {
      sessionId,
      userId,
      raceId,
      startTime: new Date(),
      isActive: true,
      options: trackingOptions,
      totalDistance: 0,
      trackPoints: [],
    };

    this.trackingSessions.set(sessionId, session);
    
    return session;
  }

  /**
   * Stop location tracking session
   */
  static async stopLocationTracking(userId: string, sessionId: string): Promise<LocationTrackingSession | null> {
    const session = this.trackingSessions.get(sessionId);
    
    if (!session || session.userId !== userId) {
      return null;
    }

    session.isActive = false;
    this.trackingSessions.set(sessionId, session);
    
    return session;
  }

  /**
   * Update location for tracking session
   */
  static async updateTrackingLocation(
    sessionId: string,
    location: LocationCoordinates,
    speed?: number,
    heading?: number
  ): Promise<boolean> {
    const session = this.trackingSessions.get(sessionId);
    
    if (!session || !session.isActive) {
      return false;
    }

    const trackPoint = {
      location,
      timestamp: new Date(),
      speed,
      heading,
    };

    session.trackPoints.push(trackPoint);
    session.lastLocation = location;

    // Calculate distance from previous point
    if (session.trackPoints.length > 1) {
      const prevPoint = session.trackPoints[session.trackPoints.length - 2];
      const distance = this.calculateDistance(
        prevPoint.location,
        location
      );
      session.totalDistance += distance;
    }

    this.trackingSessions.set(sessionId, session);
    return true;
  }

  /**
   * Calculate distance between two coordinates (in meters)
   */
  private static calculateDistance(coord1: LocationCoordinates, coord2: LocationCoordinates): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = coord1.latitude * Math.PI / 180;
    const φ2 = coord2.latitude * Math.PI / 180;
    const Δφ = (coord2.latitude - coord1.latitude) * Math.PI / 180;
    const Δλ = (coord2.longitude - coord1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  // Mock data methods for development
  private static getMockGeocodeResult(address: string): LocationCoordinates {
    // Return coordinates for common locations or generate based on address
    const mockLocations: { [key: string]: LocationCoordinates } = {
      'new york': { latitude: 40.7128, longitude: -74.0060 },
      'los angeles': { latitude: 34.0522, longitude: -118.2437 },
      'chicago': { latitude: 41.8781, longitude: -87.6298 },
      'miami': { latitude: 25.7617, longitude: -80.1918 },
      'las vegas': { latitude: 36.1699, longitude: -115.1398 },
    };

    const normalized = address.toLowerCase();
    for (const [key, coords] of Object.entries(mockLocations)) {
      if (normalized.includes(key)) {
        return coords;
      }
    }

    // Generate pseudo-random coordinates based on address hash
    const hash = address.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return {
      latitude: 40 + (hash % 100) / 100, // Roughly US latitude range
      longitude: -120 + (hash % 80) / 100, // Roughly US longitude range
    };
  }

  private static getMockReverseGeocodeResult(latitude: number, longitude: number): string {
    return `${Math.abs(latitude).toFixed(4)}°${latitude >= 0 ? 'N' : 'S'}, ${Math.abs(longitude).toFixed(4)}°${longitude >= 0 ? 'E' : 'W'}`;
  }

  private static getMockNearbyRacers(lat: number, lng: number, radius: number): NearbyRacer[] {
    const carMakes = ['Ford', 'Chevrolet', 'BMW', 'Mercedes', 'Audi', 'Nissan', 'Toyota'];
    const carModels = ['Mustang', 'Camaro', 'M3', 'C63', 'RS4', 'GT-R', 'Supra'];
    const statuses: Array<'online' | 'racing' | 'idle'> = ['online', 'racing', 'idle'];

    return Array.from({ length: Math.floor(Math.random() * 8) + 2 }, (_, i) => ({
      id: `racer_${i + 1}`,
      username: `Racer${i + 1}`,
      location: {
        latitude: lat + (Math.random() - 0.5) * 0.01,
        longitude: lng + (Math.random() - 0.5) * 0.01,
      },
      distance: Math.floor(Math.random() * radius),
      lastSeen: new Date(Date.now() - Math.random() * 300000), // Last 5 minutes
      car: {
        make: carMakes[Math.floor(Math.random() * carMakes.length)],
        model: carModels[Math.floor(Math.random() * carModels.length)],
        year: 2020 + Math.floor(Math.random() * 5),
      },
      status: statuses[Math.floor(Math.random() * statuses.length)],
    }));
  }

  private static generateRaceRoutes(startLat: number, startLng: number, endLat: number, endLng: number): RaceRoute[] {
    const distance = this.calculateDistance(
      { latitude: startLat, longitude: startLng },
      { latitude: endLat, longitude: endLng }
    );

    const routes: RaceRoute[] = [];
    const routeTypes = [
      { name: 'Direct Route', difficulty: 'easy' as const, factor: 1.0 },
      { name: 'Scenic Route', difficulty: 'medium' as const, factor: 1.3 },
      { name: 'Challenge Route', difficulty: 'hard' as const, factor: 1.1 },
    ];

    routeTypes.forEach((type, index) => {
      const routeDistance = distance * type.factor;
      routes.push({
        id: `route_${index + 1}`,
        name: type.name,
        description: `${type.name} from start to finish`,
        distance: routeDistance,
        estimatedTime: routeDistance / 20, // Rough estimate at 20 m/s average
        difficulty: type.difficulty,
        coordinates: this.generateRouteCoordinates(startLat, startLng, endLat, endLng, type.factor),
        waypoints: [
          { name: 'Start', location: { latitude: startLat, longitude: startLng }, type: 'start' },
          { name: 'Finish', location: { latitude: endLat, longitude: endLng }, type: 'finish' },
        ],
        elevation: {
          gain: Math.floor(Math.random() * 200),
          loss: Math.floor(Math.random() * 200),
          profile: [],
        },
      });
    });

    return routes;
  }

  private static generateRouteCoordinates(
    startLat: number, 
    startLng: number, 
    endLat: number, 
    endLng: number, 
    factor: number
  ): LocationCoordinates[] {
    const points = Math.floor(10 * factor);
    const coordinates: LocationCoordinates[] = [];

    for (let i = 0; i <= points; i++) {
      const progress = i / points;
      const lat = startLat + (endLat - startLat) * progress;
      const lng = startLng + (endLng - startLng) * progress;
      
      // Add some random variation for more realistic routes
      const variation = 0.001 * (factor - 1);
      coordinates.push({
        latitude: lat + (Math.random() - 0.5) * variation,
        longitude: lng + (Math.random() - 0.5) * variation,
      });
    }

    return coordinates;
  }

  private static getMockDirections(origin: string, destination: string, mode: string): DirectionsResult {
    return {
      routes: [{
        distance: 15000 + Math.floor(Math.random() * 10000), // 15-25km
        duration: 1200 + Math.floor(Math.random() * 600), // 20-30 minutes
        polyline: 'mock_encoded_polyline',
        steps: [
          {
            instruction: 'Head north on Main St',
            distance: 500,
            duration: 60,
            startLocation: { latitude: 40.7128, longitude: -74.0060 },
            endLocation: { latitude: 40.7178, longitude: -74.0060 },
          },
          {
            instruction: 'Turn right onto Highway 1',
            distance: 2000,
            duration: 180,
            startLocation: { latitude: 40.7178, longitude: -74.0060 },
            endLocation: { latitude: 40.7178, longitude: -73.9860 },
          },
        ],
      }],
      status: 'OK',
    };
  }

  private static getMockTrafficInfo(route: LocationCoordinates[]): TrafficInfo {
    const conditions: Array<'light' | 'moderate' | 'heavy' | 'severe'> = ['light', 'moderate', 'heavy', 'severe'];
    return {
      overallCondition: conditions[Math.floor(Math.random() * conditions.length)],
      averageSpeed: 45 + Math.random() * 30,
      congestionAreas: route.slice(0, Math.floor(Math.random() * 3)).map(location => ({
        location,
        severity: conditions[Math.floor(Math.random() * 3)] as 'light' | 'moderate' | 'heavy',
        duration: Math.floor(Math.random() * 600),
      })),
      estimatedDelay: Math.floor(Math.random() * 300),
      alternativeRoutes: Math.floor(Math.random() * 3) + 1,
    };
  }

  private static getMockPlaceSearch(query: string, location?: string, radius?: number): PlaceResult[] {
    const places = [
      'Gas Station', 'Auto Parts Store', 'Car Wash', 'Tire Shop', 'Restaurant',
      'Coffee Shop', 'Parking Garage', 'Hotel', 'Shopping Center', 'Bank'
    ];

    return places.slice(0, Math.floor(Math.random() * 5) + 3).map((place, index) => ({
      id: `place_${index + 1}`,
      name: `${place} ${index + 1}`,
      location: {
        latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
        longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
      },
      address: `${Math.floor(Math.random() * 9999)} Main St, City, State`,
      rating: 3.5 + Math.random() * 1.5,
      type: place.toLowerCase().replace(' ', '_'),
      distance: Math.floor(Math.random() * (radius || 5000)),
      phoneNumber: `(555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    }));
  }

  private static getMockElevationData(route: LocationCoordinates[]): Array<{ location: LocationCoordinates; elevation: number }> {
    return route.map(location => ({
      location,
      elevation: 100 + Math.random() * 500, // 100-600m elevation
    }));
  }

  private static getMockRoadConditions(route: LocationCoordinates[]): any {
    return {
      overall: 'good',
      conditions: route.map((location, index) => ({
        location,
        surface: 'asphalt',
        quality: Math.random() > 0.2 ? 'good' : 'fair',
        weather: 'clear',
        visibility: 'excellent',
      })),
    };
  }

  private static transformDirectionsResult(data: any): DirectionsResult {
    if (!data.routes || data.routes.length === 0) {
      return { routes: [], status: data.status || 'NO_ROUTES' };
    }

    return {
      routes: data.routes.map((route: any) => ({
        distance: route.legs.reduce((total: number, leg: any) => total + leg.distance.value, 0),
        duration: route.legs.reduce((total: number, leg: any) => total + leg.duration.value, 0),
        polyline: route.overview_polyline.points,
        steps: route.legs.flatMap((leg: any) => 
          leg.steps.map((step: any) => ({
            instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
            distance: step.distance.value,
            duration: step.duration.value,
            startLocation: {
              latitude: step.start_location.lat,
              longitude: step.start_location.lng,
            },
            endLocation: {
              latitude: step.end_location.lat,
              longitude: step.end_location.lng,
            },
          }))
        ),
      })),
      status: data.status,
    };
  }

  private static transformPlaceResults(data: any): PlaceResult[] {
    if (!data.results) return [];

    return data.results.map((result: any) => ({
      id: result.place_id,
      name: result.name,
      location: {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
      },
      address: result.vicinity || result.formatted_address,
      rating: result.rating || 0,
      type: result.types?.[0] || 'establishment',
      distance: 0, // Would be calculated based on user location
    }));
  }

  private static transformElevationData(data: any): Array<{ location: LocationCoordinates; elevation: number }> {
    if (!data.results) return [];

    return data.results.map((result: any) => ({
      location: {
        latitude: result.location.lat,
        longitude: result.location.lng,
      },
      elevation: result.elevation,
    }));
  }
}