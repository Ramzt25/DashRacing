// Week 6 Enhanced Live Map Service - Race Anywhere on the Map
// No venue restrictions - racing can happen anywhere!

import { GoogleMapsIntegrationService } from './GoogleMapsIntegrationService';

interface LivePlayer {
  id: string;
  username: string;
  displayName?: string;
  location: {
    latitude: number;
    longitude: number;
    timestamp: number;
  };
  speed: number;
  heading: number;
  isFriend: boolean;
  status: 'online' | 'racing' | 'away';
  vehicle: {
    make: string;
    model: string;
    color: string;
  };
  lastSeen: Date;
}

interface LiveEvent {
  id: string;
  title: string;
  type: 'drag_race' | 'street_race' | 'time_trial' | 'drift_competition' | 'car_meet' | 'custom_race';
  location: {
    latitude: number;
    longitude: number;
    timestamp: number;
  };
  startTime: Date;
  duration: number; // minutes
  participants: number;
  maxParticipants: number;
  entryFee?: number;
  prizePool?: number;
  status: 'starting_soon' | 'active' | 'finished';
  difficulty: 'beginner' | 'intermediate' | 'expert';
  requirements?: string[];
  route?: Array<{ latitude: number; longitude: number }>;
  isCustomLocation: boolean; // TRUE - races can be anywhere!
  surfaceType?: 'street' | 'highway' | 'parking_lot' | 'track' | 'dirt' | 'other';
  description?: string;
  createdBy?: string;
}

interface CustomRaceLocation {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
  surfaceType: 'street' | 'highway' | 'parking_lot' | 'track' | 'dirt' | 'other';
  safetyRating: 1 | 2 | 3 | 4 | 5; // 1 = unsafe, 5 = very safe
  description?: string;
  photos?: string[];
}

interface QuickRaceChallenge {
  id: string;
  challengerId: string;
  challengerName: string;
  targetId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  raceType: 'drag' | 'circuit' | 'time_trial' | 'drift';
  distance: number; // meters
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  expiresAt: Date;
  startTime?: Date;
}

interface UserPresence {
  status: 'online' | 'racing' | 'away';
  location?: {
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
    timestamp: number;
  };
}

interface LiveStatus {
  presenceMode: string;
  isInEvent: boolean;
  currentEvents: Array<{
    id: string;
    name: string;
    type: string;
    startTime: string;
    endTime: string;
  }>;
}

export class EnhancedLiveMapService {
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

  // Update user presence (location, speed, etc.)
  static async updatePresence(presence: UserPresence): Promise<{ success: boolean }> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.apiBaseUrl}/live/presence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(presence),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update presence' })) as { error?: string };
        throw new Error(errorData.error || 'Failed to update presence');
      }

      return response.json() as Promise<{ success: boolean }>;
    } catch (error) {
      console.error('Update presence error:', error);
      throw error;
    }
  }

  // Get nearby players for live map
  static async getNearbyPlayers(latitude: number, longitude: number, radius: number = 10): Promise<{ players: LivePlayer[] }> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.apiBaseUrl}/live/players?lat=${latitude}&lng=${longitude}&radius=${radius}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to load nearby players' })) as { error?: string };
        throw new Error(errorData.error || 'Failed to load nearby players');
      }

      const data = await response.json() as { players: any[] };
      
      // Transform the data to ensure dates are parsed correctly
      const players: LivePlayer[] = data.players.map(player => ({
        ...player,
        lastSeen: new Date(player.lastSeen),
      }));

      return { players };
    } catch (error) {
      console.error('Get nearby players error:', error);
      return { players: [] }; // Return empty array on error
    }
  }

  // Get nearby events - NO VENUE RESTRICTIONS!
  static async getNearbyEvents(latitude: number, longitude: number, radius: number = 10): Promise<{ events: LiveEvent[] }> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.apiBaseUrl}/live/events?lat=${latitude}&lng=${longitude}&radius=${radius}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to load nearby events' })) as { error?: string };
        throw new Error(errorData.error || 'Failed to load nearby events');
      }

      const data = await response.json() as { events: any[] };
      
      // Transform the data to ensure dates are parsed correctly
      const events: LiveEvent[] = data.events.map(event => ({
        ...event,
        startTime: new Date(event.startTime),
        isCustomLocation: event.isCustomLocation !== false, // Default to true - racing anywhere!
      }));

      return { events };
    } catch (error) {
      console.error('Get nearby events error:', error);
      return { events: [] }; // Return empty array on error
    }
  }

  // CREATE A RACE ANYWHERE ON THE MAP! 🎯
  static async createCustomRace(raceData: {
    title: string;
    type: LiveEvent['type'];
    location: { latitude: number; longitude: number };
    maxParticipants: number;
    startTime: Date;
    duration: number;
    entryFee?: number;
    prizePool?: number;
    difficulty: 'beginner' | 'intermediate' | 'expert';
    description?: string;
    surfaceType?: CustomRaceLocation['surfaceType'];
    route?: Array<{ latitude: number; longitude: number }>;
  }): Promise<{ success: boolean; eventId?: string; error?: string }> {
    try {
      const token = await this.getAuthToken();
      
      // Get address for the custom location
      const locationInfo = await GoogleMapsIntegrationService.reverseGeocode(
        raceData.location.latitude, 
        raceData.location.longitude
      );
      
      const response = await fetch(`${this.apiBaseUrl}/live/events/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...raceData,
          isCustomLocation: true, // Always true - no venue restrictions!
          locationAddress: locationInfo?.address || 'Custom Location',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create race' })) as { error?: string };
        return { success: false, error: errorData.error || 'Failed to create race' };
      }

      const result = await response.json() as { success: boolean; eventId?: string };
      return result;
    } catch (error) {
      console.error('Create custom race error:', error);
      return { success: false, error: 'Failed to create race. Please try again.' };
    }
  }

  // CREATE AN EVENT/MEETUP ANYWHERE ON THE MAP! 🎉
  static async createCustomEvent(eventData: {
    title: string;
    description: string;
    eventType: 'car_meet' | 'cruise' | 'show_and_tell' | 'photo_session';
    location: { latitude: number; longitude: number };
    maxParticipants: number;
    startTime: Date;
    duration: number;
    isPrivate: boolean;
    requirements?: string[];
    entryFee?: number;
    type: 'car_meet'; // Maps to LiveEvent interface
  }): Promise<{ success: boolean; eventId?: string; error?: string }> {
    try {
      const token = await this.getAuthToken();
      
      // Get address for the custom location
      const locationInfo = await GoogleMapsIntegrationService.reverseGeocode(
        eventData.location.latitude, 
        eventData.location.longitude
      );
      
      const response = await fetch(`${this.apiBaseUrl}/live/events/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: eventData.title,
          description: eventData.description,
          type: eventData.type, // 'car_meet'
          location: eventData.location,
          maxParticipants: eventData.maxParticipants,
          startTime: eventData.startTime,
          duration: eventData.duration,
          entryFee: eventData.entryFee,
          requirements: eventData.requirements,
          isCustomLocation: true, // Always true - events can be anywhere!
          isPrivateEvent: eventData.isPrivate,
          eventCategory: eventData.eventType, // Specific meetup type
          locationAddress: locationInfo?.address || 'Custom Location',
          difficulty: 'beginner', // Events are generally accessible to all
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create event' })) as { error?: string };
        return { success: false, error: errorData.error || 'Failed to create event' };
      }

      const result = await response.json() as { success: boolean; eventId?: string };
      return result;
    } catch (error) {
      console.error('Create custom event error:', error);
      return { success: false, error: 'Failed to create event. Please try again.' };
    }
  }

  // Send quick race challenge to another player
  static async sendQuickChallenge(challenge: {
    targetId: string;
    location: { latitude: number; longitude: number };
    raceType: QuickRaceChallenge['raceType'];
    distance: number;
  }): Promise<{ success: boolean; challengeId?: string; error?: string }> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.apiBaseUrl}/live/challenge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(challenge),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to send challenge' })) as { error?: string };
        return { success: false, error: errorData.error || 'Failed to send challenge' };
      }

      const result = await response.json() as { success: boolean; challengeId?: string };
      return result;
    } catch (error) {
      console.error('Send quick challenge error:', error);
      return { success: false, error: 'Failed to send challenge. Please try again.' };
    }
  }

  // Respond to race challenge
  static async respondToChallenge(challengeId: string, accept: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.apiBaseUrl}/live/challenge/${challengeId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ accept }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to respond to challenge' })) as { error?: string };
        return { success: false, error: errorData.error || 'Failed to respond to challenge' };
      }

      const result = await response.json() as { success: boolean };
      return result;
    } catch (error) {
      console.error('Respond to challenge error:', error);
      return { success: false, error: 'Failed to respond to challenge. Please try again.' };
    }
  }

  // Get pending challenges for current user
  static async getPendingChallenges(): Promise<{ challenges: QuickRaceChallenge[] }> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.apiBaseUrl}/live/challenges`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get challenges');
      }

      const data = await response.json() as { challenges: any[] };
      const challenges: QuickRaceChallenge[] = data.challenges.map(challenge => ({
        ...challenge,
        expiresAt: new Date(challenge.expiresAt),
        startTime: challenge.startTime ? new Date(challenge.startTime) : undefined,
      }));

      return { challenges };
    } catch (error) {
      console.error('Get pending challenges error:', error);
      return { challenges: [] };
    }
  }

  // Join any event (venue or custom location)
  static async joinEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.apiBaseUrl}/live/events/${eventId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to join event' })) as { error?: string };
        return { success: false, error: errorData.error || 'Failed to join event' };
      }

      const result = await response.json() as { success: boolean };
      return result;
    } catch (error) {
      console.error('Join event error:', error);
      return { success: false, error: 'Failed to join event. Please try again.' };
    }
  }

  // Leave event
  static async leaveEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.apiBaseUrl}/live/events/${eventId}/leave`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to leave event' })) as { error?: string };
        return { success: false, error: errorData.error || 'Failed to leave event' };
      }

      const result = await response.json() as { success: boolean };
      return result;
    } catch (error) {
      console.error('Leave event error:', error);
      return { success: false, error: 'Failed to leave event. Please try again.' };
    }
  }

  // Get live status
  static async getLiveStatus(): Promise<LiveStatus> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.apiBaseUrl}/live/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load live status');
      }

      return response.json() as Promise<LiveStatus>;
    } catch (error) {
      console.error('Get live status error:', error);
      // Return default status on error
      return {
        presenceMode: 'online',
        isInEvent: false,
        currentEvents: []
      };
    }
  }

  // Validate race location safety
  static async validateRaceLocation(location: { latitude: number; longitude: number }): Promise<{
    isValid: boolean;
    safetyRating: number;
    warnings: string[];
    suggestions: string[];
  }> {
    try {
      // Get location details
      const locationInfo = await GoogleMapsIntegrationService.reverseGeocode(
        location.latitude, 
        location.longitude
      );
      
      // Find nearby automotive places for safety assessment
      const nearbyPlaces = await GoogleMapsIntegrationService.findNearbyAutomotivePlaces(
        location.latitude,
        location.longitude,
        'gas_station',
        1000 // 1km radius
      );
      
      const warnings: string[] = [];
      const suggestions: string[] = [];
      let safetyRating = 5; // Start with max safety, reduce based on factors
      
      // Basic validations (always allow racing, but warn about safety)
      if (!locationInfo?.address.toLowerCase().includes('parking')) {
        warnings.push('Racing on public roads may be dangerous and illegal');
        safetyRating -= 2;
      }
      
      if (nearbyPlaces.length === 0) {
        warnings.push('No nearby facilities for fuel or assistance');
        safetyRating -= 1;
        suggestions.push('Consider choosing a location near gas stations or repair shops');
      }
      
      // Check if it's near highways (potentially dangerous)
      if (locationInfo?.address.toLowerCase().includes('highway') || 
          locationInfo?.address.toLowerCase().includes('freeway')) {
        warnings.push('Highway racing is extremely dangerous');
        safetyRating -= 3;
        suggestions.push('Consider using a closed course or parking lot');
      }
      
      // Minimum safety rating of 1
      safetyRating = Math.max(1, safetyRating);
      
      return {
        isValid: true, // ALWAYS VALID - no restrictions!
        safetyRating,
        warnings,
        suggestions
      };
    } catch (error) {
      console.error('Validate race location error:', error);
      return {
        isValid: true, // Always allow racing
        safetyRating: 3,
        warnings: ['Unable to assess location safety'],
        suggestions: ['Please ensure the location is safe for racing']
      };
    }
  }

  // Get race history for a location
  static async getLocationRaceHistory(location: { latitude: number; longitude: number }, radius: number = 500): Promise<{
    races: Array<{
      id: string;
      title: string;
      type: string;
      date: Date;
      participants: number;
      winner?: string;
    }>;
  }> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(
        `${this.apiBaseUrl}/live/location-history?lat=${location.latitude}&lng=${location.longitude}&radius=${radius}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get location race history');
      }

      const data = await response.json() as { races: any[] };
      const races = data.races.map(race => ({
        ...race,
        date: new Date(race.date)
      }));

      return { races };
    } catch (error) {
      console.error('Get location race history error:', error);
      return { races: [] };
    }
  }

  // Calculate optimal race route between two points
  static async calculateRaceRoute(
    start: { latitude: number; longitude: number },
    end: { latitude: number; longitude: number },
    raceType: 'drag' | 'circuit' | 'time_trial'
  ): Promise<{
    route: Array<{ latitude: number; longitude: number }>;
    distance: number;
    estimatedTime: number;
    surfaceQuality: 'excellent' | 'good' | 'fair' | 'poor';
  } | null> {
    try {
      const directions = await GoogleMapsIntegrationService.getDirections(
        { lat: start.latitude, lng: start.longitude },
        { lat: end.latitude, lng: end.longitude },
        'driving'
      );
      
      if (!directions) return null;
      
      // Decode the polyline to get route coordinates
      const route = GoogleMapsIntegrationService.decodePolyline(directions.overview_polyline.points);
      
      // Estimate surface quality based on route (simplified)
      let surfaceQuality: 'excellent' | 'good' | 'fair' | 'poor' = 'good';
      if (directions.distance.value < 500) surfaceQuality = 'excellent'; // Short routes likely parking lots
      else if (directions.distance.value > 5000) surfaceQuality = 'fair'; // Long routes may have mixed surfaces
      
      return {
        route,
        distance: directions.distance.value,
        estimatedTime: directions.duration.value,
        surfaceQuality
      };
    } catch (error) {
      console.error('Calculate race route error:', error);
      return null;
    }
  }
}

export default EnhancedLiveMapService;