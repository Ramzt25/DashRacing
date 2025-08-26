import Geolocation from 'react-native-geolocation-service';

export interface MapCoordinate {
  latitude: number;
  longitude: number;
}

export interface RacerLocation extends MapCoordinate {
  userId: string;
  username: string;
  speed: number;
  heading: number;
  timestamp: Date;
  isRacing: boolean;
  carInfo?: {
    make: string;
    model: string;
    color: string;
  };
}

export interface RouteInfo {
  coordinates: MapCoordinate[];
  distance: number; // in miles
  duration: number; // in seconds
  difficulty: 'easy' | 'medium' | 'hard';
  name: string;
  description: string;
}

export interface TrafficInfo {
  level: 'light' | 'moderate' | 'heavy';
  incidents: Array<{
    type: 'accident' | 'construction' | 'closure';
    location: MapCoordinate;
    description: string;
  }>;
}

export class GoogleMapsService {
  private static readonly GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'demo-key';
  private static readonly BASE_URL = 'https://maps.googleapis.com/maps/api';

  /**
   * Get user's current location
   */
  static async getCurrentLocation(): Promise<MapCoordinate> {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.warn('Failed to get current location:', error);
      // Fallback to demo location (San Francisco)
      return {
        latitude: 37.7749,
        longitude: -122.4194,
      };
    }
  }

  /**
   * Start tracking user location for racing
   */
  static async startLocationTracking(
    onLocationUpdate: (location: RacerLocation) => void,
    userInfo: { userId: string; username: string; carInfo?: any }
  ): Promise<{ stop: () => void }> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000, // Update every second
          distanceInterval: 1, // Update every meter
        },
        (location) => {
          const racerLocation: RacerLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            userId: userInfo.userId,
            username: userInfo.username,
            speed: location.coords.speed || 0,
            heading: location.coords.heading || 0,
            timestamp: new Date(),
            isRacing: true,
            carInfo: userInfo.carInfo,
          };

          onLocationUpdate(racerLocation);
        }
      );

      return {
        stop: () => subscription.remove(),
      };
    } catch (error) {
      console.warn('Failed to start location tracking:', error);
      
      // Fallback to simulated tracking
      return this.simulateLocationTracking(onLocationUpdate, userInfo);
    }
  }

  /**
   * Get nearby racers from backend
   */
  static async getNearbyRacers(
    location: MapCoordinate,
    radius: number = 5 // miles
  ): Promise<RacerLocation[]> {
    try {
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.168.28:4000/api';
      
      const response = await fetch(
        `${API_BASE_URL}/livemap/nearby-racers?lat=${location.latitude}&lng=${location.longitude}&radius=${radius}`
      );

      if (response.ok) {
        return await response.json() as RacerLocation[];
      }
    } catch (error) {
      console.warn('Failed to get nearby racers from backend:', error);
    }

    // Fallback to mock nearby racers
    return this.getMockNearbyRacers(location, radius);
  }

  /**
   * Get race routes in area
   */
  static async getRaceRoutes(location: MapCoordinate, radius: number = 10): Promise<RouteInfo[]> {
    try {
      if (!this.GOOGLE_MAPS_API_KEY || this.GOOGLE_MAPS_API_KEY === 'demo-key') {
        return this.getMockRaceRoutes(location);
      }

      // Use Google Roads API to find good racing routes
      const routes = await this.findOptimalRoutes(location, radius);
      return routes;
    } catch (error) {
      console.warn('Failed to get race routes:', error);
      return this.getMockRaceRoutes(location);
    }
  }

  /**
   * Get directions between two points
   */
  static async getDirections(
    start: MapCoordinate,
    end: MapCoordinate,
    waypoints?: MapCoordinate[]
  ): Promise<{
    route: MapCoordinate[];
    distance: number;
    duration: number;
    instructions: string[];
  }> {
    try {
      if (!this.GOOGLE_MAPS_API_KEY || this.GOOGLE_MAPS_API_KEY === 'demo-key') {
        return this.getMockDirections(start, end, waypoints);
      }

      const waypointsParam = waypoints 
        ? waypoints.map(wp => `${wp.latitude},${wp.longitude}`).join('|')
        : '';

      const url = `${this.BASE_URL}/directions/json?` +
        `origin=${start.latitude},${start.longitude}&` +
        `destination=${end.latitude},${end.longitude}&` +
        `waypoints=${waypointsParam}&` +
        `key=${this.GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json() as any;

      if (data.status === 'OK' && data.routes.length > 0) {
        const route = data.routes[0];
        const decodedPath = this.decodePolyline(route.overview_polyline.points);
        
        return {
          route: decodedPath,
          distance: route.legs.reduce((total: number, leg: any) => total + leg.distance.value, 0) / 1609.34, // Convert to miles
          duration: route.legs.reduce((total: number, leg: any) => total + leg.duration.value, 0),
          instructions: route.legs.flatMap((leg: any) => 
            leg.steps.map((step: any) => step.html_instructions.replace(/<[^>]*>/g, ''))
          ),
        };
      }
    } catch (error) {
      console.warn('Failed to get directions from Google Maps:', error);
    }

    return this.getMockDirections(start, end, waypoints);
  }

  /**
   * Get traffic information for area
   */
  static async getTrafficInfo(location: MapCoordinate, radius: number = 5): Promise<TrafficInfo> {
    try {
      // In production, this would use Google Maps Traffic API
      // For now, return mock traffic data
      return this.getMockTrafficInfo(location);
    } catch (error) {
      console.warn('Failed to get traffic info:', error);
      return this.getMockTrafficInfo(location);
    }
  }

  /**
   * Search for places near location
   */
  static async searchNearbyPlaces(
    location: MapCoordinate,
    type: 'gas_station' | 'car_repair' | 'parking' | 'restaurant',
    radius: number = 2000 // meters
  ): Promise<Array<{
    name: string;
    location: MapCoordinate;
    rating: number;
    isOpen: boolean;
    distance: number;
  }>> {
    try {
      if (!this.GOOGLE_MAPS_API_KEY || this.GOOGLE_MAPS_API_KEY === 'demo-key') {
        return this.getMockNearbyPlaces(location, type);
      }

      const url = `${this.BASE_URL}/place/nearbysearch/json?` +
        `location=${location.latitude},${location.longitude}&` +
        `radius=${radius}&` +
        `type=${type}&` +
        `key=${this.GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json() as any;

      if (data.status === 'OK') {
        return data.results.map((place: any) => ({
          name: place.name,
          location: {
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
          },
          rating: place.rating || 0,
          isOpen: place.opening_hours?.open_now || false,
          distance: this.calculateDistance(location, {
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
          }),
        }));
      }
    } catch (error) {
      console.warn('Failed to search nearby places:', error);
    }

    return this.getMockNearbyPlaces(location, type);
  }

  /**
   * Reverse geocoding - get address from coordinates
   */
  static async reverseGeocode(location: MapCoordinate): Promise<string> {
    try {
      if (!this.GOOGLE_MAPS_API_KEY || this.GOOGLE_MAPS_API_KEY === 'demo-key') {
        return this.getMockAddress(location);
      }

      const url = `${this.BASE_URL}/geocode/json?` +
        `latlng=${location.latitude},${location.longitude}&` +
        `key=${this.GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json() as any;

      if (data.status === 'OK' && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
    } catch (error) {
      console.warn('Failed to reverse geocode:', error);
    }

    return this.getMockAddress(location);
  }

  // Utility methods
  static calculateDistance(point1: MapCoordinate, point2: MapCoordinate): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLon = this.toRadians(point2.longitude - point1.longitude);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.latitude)) * Math.cos(this.toRadians(point2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private static decodePolyline(encoded: string): MapCoordinate[] {
    const points = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return points;
  }

  // Mock data generators
  private static simulateLocationTracking(
    onLocationUpdate: (location: RacerLocation) => void,
    userInfo: { userId: string; username: string; carInfo?: any }
  ): { stop: () => void } {
    let lat = 37.7749; // San Francisco
    let lng = -122.4194;
    let speed = 25;

    const interval = setInterval(() => {
      // Simulate movement
      lat += (Math.random() - 0.5) * 0.001;
      lng += (Math.random() - 0.5) * 0.001;
      speed = Math.max(0, speed + (Math.random() - 0.5) * 10);

      const racerLocation: RacerLocation = {
        latitude: lat,
        longitude: lng,
        userId: userInfo.userId,
        username: userInfo.username,
        speed,
        heading: Math.random() * 360,
        timestamp: new Date(),
        isRacing: true,
        carInfo: userInfo.carInfo,
      };

      onLocationUpdate(racerLocation);
    }, 1000);

    return {
      stop: () => clearInterval(interval),
    };
  }

  private static getMockNearbyRacers(location: MapCoordinate, radius: number): RacerLocation[] {
    const racers = [];
    const numRacers = Math.floor(Math.random() * 8) + 2; // 2-10 racers

    for (let i = 0; i < numRacers; i++) {
      // Generate random location within radius
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * radius / 69; // Convert miles to degrees roughly
      
      racers.push({
        latitude: location.latitude + distance * Math.cos(angle),
        longitude: location.longitude + distance * Math.sin(angle),
        userId: `racer_${i}`,
        username: `Racer${i + 1}`,
        speed: Math.random() * 60 + 20, // 20-80 mph
        heading: Math.random() * 360,
        timestamp: new Date(),
        isRacing: Math.random() > 0.3,
        carInfo: {
          make: ['Honda', 'Toyota', 'Ford', 'BMW'][Math.floor(Math.random() * 4)],
          model: ['Civic', 'Camry', 'Mustang', 'M3'][Math.floor(Math.random() * 4)],
          color: ['Red', 'Blue', 'Black', 'White'][Math.floor(Math.random() * 4)],
        },
      });
    }

    return racers;
  }

  private static getMockRaceRoutes(location: MapCoordinate): RouteInfo[] {
    return [
      {
        coordinates: [
          location,
          { latitude: location.latitude + 0.01, longitude: location.longitude + 0.01 },
          { latitude: location.latitude + 0.02, longitude: location.longitude },
          { latitude: location.latitude + 0.01, longitude: location.longitude - 0.01 },
          location,
        ],
        distance: 2.5,
        duration: 180, // 3 minutes
        difficulty: 'easy',
        name: 'City Circuit',
        description: 'A beginner-friendly route through the city streets',
      },
      {
        coordinates: [
          location,
          { latitude: location.latitude + 0.02, longitude: location.longitude + 0.02 },
          { latitude: location.latitude + 0.04, longitude: location.longitude - 0.01 },
          { latitude: location.latitude + 0.02, longitude: location.longitude - 0.03 },
          location,
        ],
        distance: 5.2,
        duration: 300, // 5 minutes
        difficulty: 'medium',
        name: 'Highway Loop',
        description: 'Fast-paced highway racing with challenging turns',
      },
      {
        coordinates: [
          location,
          { latitude: location.latitude + 0.03, longitude: location.longitude + 0.03 },
          { latitude: location.latitude + 0.06, longitude: location.longitude },
          { latitude: location.latitude + 0.03, longitude: location.longitude - 0.03 },
          location,
        ],
        distance: 8.1,
        duration: 420, // 7 minutes
        difficulty: 'hard',
        name: 'Mountain Pass',
        description: 'Challenging route with elevation changes and tight corners',
      },
    ];
  }

  private static getMockDirections(
    start: MapCoordinate,
    end: MapCoordinate,
    waypoints?: MapCoordinate[]
  ): {
    route: MapCoordinate[];
    distance: number;
    duration: number;
    instructions: string[];
  } {
    const route = [start];
    
    if (waypoints) {
      route.push(...waypoints);
    }
    
    route.push(end);
    
    const distance = this.calculateDistance(start, end);
    const duration = Math.round(distance / 45 * 3600); // Assume 45 mph average speed

    return {
      route,
      distance,
      duration,
      instructions: [
        'Head northeast on Main St',
        'Turn right onto Highway 101',
        'Continue for 2.5 miles',
        'Take exit 42 toward Downtown',
        'Turn left at the traffic light',
        'Destination will be on your right',
      ],
    };
  }

  private static getMockTrafficInfo(location: MapCoordinate): TrafficInfo {
    return {
      level: ['light', 'moderate', 'heavy'][Math.floor(Math.random() * 3)] as any,
      incidents: [
        {
          type: 'construction',
          location: {
            latitude: location.latitude + 0.01,
            longitude: location.longitude + 0.01,
          },
          description: 'Road construction causing lane closures',
        },
      ],
    };
  }

  private static getMockNearbyPlaces(
    location: MapCoordinate,
    type: string
  ): Array<{
    name: string;
    location: MapCoordinate;
    rating: number;
    isOpen: boolean;
    distance: number;
  }> {
    const places = [];
    const numPlaces = Math.floor(Math.random() * 5) + 3; // 3-8 places

    for (let i = 0; i < numPlaces; i++) {
      const placeLocation = {
        latitude: location.latitude + (Math.random() - 0.5) * 0.02,
        longitude: location.longitude + (Math.random() - 0.5) * 0.02,
      };

      places.push({
        name: `${type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} ${i + 1}`,
        location: placeLocation,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0-5.0
        isOpen: Math.random() > 0.2, // 80% chance of being open
        distance: this.calculateDistance(location, placeLocation),
      });
    }

    return places.sort((a, b) => a.distance - b.distance);
  }

  private static getMockAddress(location: MapCoordinate): string {
    const streetNumber = Math.floor(Math.random() * 9999) + 1;
    const streets = ['Main St', 'Oak Ave', 'Pine Rd', 'Elm Dr', 'Maple Blvd'];
    const street = streets[Math.floor(Math.random() * streets.length)];
    
    return `${streetNumber} ${street}, San Francisco, CA 94102`;
  }

  private static async findOptimalRoutes(location: MapCoordinate, radius: number): Promise<RouteInfo[]> {
    // In production, this would use Google Roads API to find good racing routes
    // For now, return mock routes
    return this.getMockRaceRoutes(location);
  }
}
