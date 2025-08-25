// Week 6 Enhanced Google Maps Service for Mobile App
// Connects to backend GoogleMapsService for racing venue discovery and navigation

interface GoogleMapsPlace {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  types: string[];
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
}

interface RacingVenue extends GoogleMapsPlace {
  venue_type: 'drag_strip' | 'race_track' | 'circuit' | 'parking_lot' | 'autocross' | 'other';
  features?: {
    length?: number; // in meters
    surface: 'asphalt' | 'concrete' | 'dirt' | 'other';
    safety_rating?: number;
    timing_system?: boolean;
    pit_area?: boolean;
    spectator_area?: boolean;
    restrooms?: boolean;
    parking?: boolean;
  };
  operating_hours?: {
    [key: string]: string;
  };
  contact?: {
    phone?: string;
    website?: string;
    email?: string;
  };
  events?: Array<{
    name: string;
    date: string;
    type: string;
    description?: string;
  }>;
  distance?: number; // distance from user in meters
}

interface NavigationRoute {
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  overview_polyline: {
    points: string;
  };
  steps: Array<{
    distance: {
      text: string;
      value: number;
    };
    duration: {
      text: string;
      value: number;
    };
    html_instructions: string;
    start_location: {
      lat: number;
      lng: number;
    };
    end_location: {
      lat: number;
      lng: number;
    };
    polyline: {
      points: string;
    };
  }>;
}

interface TrafficConditions {
  duration: number;
  durationInTraffic: number;
  status: string;
  trafficLevel: 'light' | 'moderate' | 'heavy' | 'severe';
}

interface LocationSearchResult {
  predictions: Array<{
    place_id: string;
    description: string;
    structured_formatting: {
      main_text: string;
      secondary_text: string;
    };
    types: string[];
  }>;
}

export class GoogleMapsIntegrationService {
  private static apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

  // Get authentication token
  private static async getAuthToken(): Promise<string> {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const user = await AsyncStorage.getItem('user');
    const token = user ? JSON.parse(user).token : null;
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    return token;
  }

  // Geocode address to coordinates
  static async geocodeAddress(address: string): Promise<{ latitude: number; longitude: number; formatted_address: string } | null> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.apiBaseUrl}/maps/geocode?address=${encodeURIComponent(address)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data = await response.json();
      return data.location;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  // Reverse geocode coordinates to address
  static async reverseGeocode(latitude: number, longitude: number): Promise<{ address: string; place_id: string } | null> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.apiBaseUrl}/maps/reverse-geocode?lat=${latitude}&lng=${longitude}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }

      const data = await response.json();
      return data.location;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  // Find racing venues near location
  static async findRacingVenues(latitude: number, longitude: number, radius: number = 50000): Promise<RacingVenue[]> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(
        `${this.apiBaseUrl}/maps/racing-venues?lat=${latitude}&lng=${longitude}&radius=${radius}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to find racing venues');
      }

      const data = await response.json() as { venues: any[] };
      return data.venues.map((venue: any) => ({
        ...venue,
        distance: this.calculateDistance(latitude, longitude, venue.geometry.location.lat, venue.geometry.location.lng)
      }));
    } catch (error) {
      console.error('Racing venues search error:', error);
      return [];
    }
  }

  // Find nearby automotive places (gas stations, dealerships, etc.)
  static async findNearbyAutomotivePlaces(
    latitude: number, 
    longitude: number, 
    type: 'gas_station' | 'car_dealer' | 'car_repair' | 'car_wash' | 'parking',
    radius: number = 10000
  ): Promise<GoogleMapsPlace[]> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(
        `${this.apiBaseUrl}/maps/nearby?lat=${latitude}&lng=${longitude}&type=${type}&radius=${radius}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to find nearby places');
      }

      const data = await response.json() as { places: GoogleMapsPlace[] };
      return data.places;
    } catch (error) {
      console.error('Nearby places search error:', error);
      return [];
    }
  }

  // Get navigation directions between two points
  static async getDirections(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    mode: 'driving' | 'walking' | 'transit' = 'driving'
  ): Promise<NavigationRoute | null> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(
        `${this.apiBaseUrl}/maps/directions?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=${mode}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get directions');
      }

      const data = await response.json() as { route: NavigationRoute };
      return data.route;
    } catch (error) {
      console.error('Directions error:', error);
      return null;
    }
  }

  // Get current traffic conditions
  static async getTrafficConditions(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<TrafficConditions | null> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(
        `${this.apiBaseUrl}/maps/traffic?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get traffic conditions');
      }

      const data = await response.json() as { duration: number; durationInTraffic: number; status: string };
      
      // Determine traffic level based on duration difference
      const trafficDelay = data.durationInTraffic - data.duration;
      const delayPercentage = (trafficDelay / data.duration) * 100;
      
      let trafficLevel: TrafficConditions['trafficLevel'] = 'light';
      if (delayPercentage > 50) trafficLevel = 'severe';
      else if (delayPercentage > 25) trafficLevel = 'heavy';
      else if (delayPercentage > 10) trafficLevel = 'moderate';
      
      return {
        ...data,
        trafficLevel
      };
    } catch (error) {
      console.error('Traffic conditions error:', error);
      return null;
    }
  }

  // Search for places with autocomplete
  static async searchPlaces(query: string, location?: { lat: number; lng: number }): Promise<LocationSearchResult['predictions']> {
    try {
      const token = await this.getAuthToken();
      let url = `${this.apiBaseUrl}/maps/search?query=${encodeURIComponent(query)}`;
      
      if (location) {
        url += `&lat=${location.lat}&lng=${location.lng}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Places search failed');
      }

      const data = await response.json() as { predictions: LocationSearchResult['predictions'] };
      return data.predictions;
    } catch (error) {
      console.error('Places search error:', error);
      return [];
    }
  }

  // Get detailed place information
  static async getPlaceDetails(placeId: string): Promise<GoogleMapsPlace | null> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.apiBaseUrl}/maps/place/${placeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get place details');
      }

      const data = await response.json() as { place: GoogleMapsPlace };
      return data.place;
    } catch (error) {
      console.error('Place details error:', error);
      return null;
    }
  }

  // Get photo URL from photo reference
  static getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
    return `${this.apiBaseUrl}/maps/photo/${photoReference}?maxWidth=${maxWidth}`;
  }

  // Get static map image URL
  static getStaticMapUrl(
    center: { lat: number; lng: number },
    zoom: number = 15,
    size: { width: number; height: number } = { width: 400, height: 400 },
    markers?: Array<{ lat: number; lng: number; label?: string }>
  ): string {
    let url = `${this.apiBaseUrl}/maps/static?center=${center.lat},${center.lng}&zoom=${zoom}&size=${size.width}x${size.height}`;
    
    if (markers && markers.length > 0) {
      markers.forEach((marker, index) => {
        const label = marker.label || String.fromCharCode(65 + index); // A, B, C...
        url += `&markers=${label}|${marker.lat},${marker.lng}`;
      });
    }
    
    return url;
  }

  // Calculate distance between two coordinates (in meters)
  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  // Format distance for display
  static formatDistance(meters: number, useMetric: boolean = true): string {
    if (useMetric) {
      if (meters < 1000) {
        return `${Math.round(meters)}m`;
      }
      return `${(meters / 1000).toFixed(1)}km`;
    } else {
      const feet = meters * 3.28084;
      if (feet < 5280) {
        return `${Math.round(feet)}ft`;
      }
      const miles = feet / 5280;
      return `${miles.toFixed(1)}mi`;
    }
  }

  // Format duration for display
  static formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  }

  // Decode polyline points for route display
  static decodePolyline(encoded: string): Array<{ latitude: number; longitude: number }> {
    const points: Array<{ latitude: number; longitude: number }> = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b: number;
      let shift = 0;
      let result = 0;
      
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      
      const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      
      const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5
      });
    }

    return points;
  }

  // Get traffic color based on conditions
  static getTrafficColor(trafficLevel: TrafficConditions['trafficLevel']): string {
    switch (trafficLevel) {
      case 'light': return '#00AA00';
      case 'moderate': return '#FFAA00';
      case 'heavy': return '#FF4400';
      case 'severe': return '#AA0000';
      default: return '#888888';
    }
  }

  // Validate coordinates
  static validateCoordinates(latitude: number, longitude: number): boolean {
    return (
      latitude >= -90 && latitude <= 90 &&
      longitude >= -180 && longitude <= 180
    );
  }

  // Get recommended racing venues based on user preferences
  static async getRecommendedVenues(
    latitude: number, 
    longitude: number, 
    preferences: {
      venueTypes: string[];
      maxDistance: number;
      difficulty: string[];
      features: string[];
    }
  ): Promise<RacingVenue[]> {
    try {
      const allVenues = await this.findRacingVenues(latitude, longitude, preferences.maxDistance);
      
      // Filter based on preferences
      return allVenues.filter(venue => {
        // Filter by venue type
        if (preferences.venueTypes.length > 0 && !preferences.venueTypes.includes(venue.venue_type)) {
          return false;
        }
        
        // Filter by features if specified
        if (preferences.features.length > 0 && venue.features) {
          const hasRequiredFeatures = preferences.features.some(feature => {
            switch (feature) {
              case 'timing_system': return venue.features?.timing_system;
              case 'pit_area': return venue.features?.pit_area;
              case 'spectator_area': return venue.features?.spectator_area;
              case 'restrooms': return venue.features?.restrooms;
              case 'parking': return venue.features?.parking;
              default: return false;
            }
          });
          
          if (!hasRequiredFeatures) return false;
        }
        
        return true;
      }).sort((a, b) => (a.distance || 0) - (b.distance || 0)); // Sort by distance
    } catch (error) {
      console.error('Error getting recommended venues:', error);
      return [];
    }
  }

  // Get venue events and schedule
  static async getVenueEvents(placeId: string): Promise<Array<{
    name: string;
    date: string;
    type: string;
    description?: string;
    registrationUrl?: string;
  }>> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.apiBaseUrl}/maps/venue/${placeId}/events`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get venue events');
      }

      const data = await response.json() as { events: Array<{ name: string; date: string; type: string; description?: string; registrationUrl?: string }> };
      return data.events;
    } catch (error) {
      console.error('Venue events error:', error);
      return [];
    }
  }
}

export default GoogleMapsIntegrationService;