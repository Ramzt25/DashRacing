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
  type: 'drag_race' | 'street_race' | 'time_trial' | 'drift_competition' | 'car_meet';
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

export class LiveMapService {
  static async updatePresence(presence: UserPresence): Promise<{ success: boolean }> {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.168.28:4000';
    
    // Get auth token from AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const user = await AsyncStorage.getItem('user');
    const token = user ? JSON.parse(user).token : null;
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/live/presence`, {
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
  }

  static async getNearbyPlayers(latitude: number, longitude: number, radius: number = 10): Promise<{ players: LivePlayer[] }> {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.168.28:4000';
    
    // Get auth token from AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const user = await AsyncStorage.getItem('user');
    const token = user ? JSON.parse(user).token : null;
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/live/players?lat=${latitude}&lng=${longitude}&radius=${radius}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to load nearby players' })) as { error?: string };
      throw new Error(errorData.error || 'Failed to load nearby players');
    }

    const data = await response.json() as { users: any[]; count: number; location: any };
    
    // Transform the data to ensure dates are parsed correctly
    const players: LivePlayer[] = (data.users || []).map(player => ({
      ...player,
      lastSeen: new Date(player.lastSeen),
    }));

    return { players };
  }

  static async getNearbyEvents(latitude: number, longitude: number, radius: number = 10): Promise<{ events: LiveEvent[] }> {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.168.28:4000';
    
    // Get auth token from AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const user = await AsyncStorage.getItem('user');
    const token = user ? JSON.parse(user).token : null;
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/live/events?lat=${latitude}&lng=${longitude}&radius=${radius}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to load nearby events' })) as { error?: string };
      throw new Error(errorData.error || 'Failed to load nearby events');
    }

    const data = await response.json() as { events: any[]; count: number; location: any };
    
    // Transform the data to ensure dates are parsed correctly
    const events: LiveEvent[] = (data.events || []).map(event => ({
      ...event,
      startTime: new Date(event.startTime),
    }));

    return { events };
  }

  static async joinEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.168.28:4000';
    
    // Get auth token from AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const user = await AsyncStorage.getItem('user');
    const token = user ? JSON.parse(user).token : null;
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/live/events/${eventId}/join`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to join event' })) as { error?: string };
      throw new Error(errorData.error || 'Failed to join event');
    }

    return response.json() as Promise<{ success: boolean; error?: string }>;
  }

  static async leaveEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.168.28:4000';
    
    // Get auth token from AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const user = await AsyncStorage.getItem('user');
    const token = user ? JSON.parse(user).token : null;
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/live/events/${eventId}/leave`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to leave event' })) as { error?: string };
      throw new Error(errorData.error || 'Failed to leave event');
    }

    return response.json() as Promise<{ success: boolean; error?: string }>;
  }

  static async getLiveStatus(): Promise<LiveStatus> {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.168.28:4000';
    
    // Get auth token from AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const user = await AsyncStorage.getItem('user');
    const token = user ? JSON.parse(user).token : null;
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/live/status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to load live status' })) as { error?: string };
      throw new Error(errorData.error || 'Failed to load live status');
    }

    return response.json() as Promise<LiveStatus>;
  }
}
