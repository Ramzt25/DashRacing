import { ApiService } from './ApiService';
import { Race, PerformanceMetrics, GPSCoordinate } from '../types/racing';

interface RaceSessionData {
  raceId?: string;
  carId?: string;
  sessionType?: 'practice' | 'qualifying' | 'race';
  routeData: GPSCoordinate[];
  performanceMetrics?: PerformanceMetrics;
  startTime: string;
  endTime?: string;
}

interface RaceSession {
  id: string;
  raceId?: string;
  carId?: string;
  car?: any;
  race?: any;
  startTime: string;
  endTime?: string;
  isCompleted: boolean;
  sessionType: string;
  performanceMetrics: PerformanceMetrics;
  routeData: GPSCoordinate[];
  createdAt: string;
}

interface RaceStats {
  totalSessions: number;
  totalDistance: number;
  maxSpeed: number;
  averageSpeed: number;
  bestZeroToSixty: number | null;
  bestQuarterMile: number | null;
  sessionsThisMonth: number;
}

export class RaceService {
  static async saveRaceSession(sessionData: RaceSessionData): Promise<{ success: boolean; sessionId: string }> {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
    
    // Get auth token from AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const user = await AsyncStorage.getItem('user');
    const token = user ? JSON.parse(user).token : null;
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/races/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(sessionData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to save race session' })) as { error?: string };
      throw new Error(errorData.error || 'Failed to save race session');
    }

    return response.json() as Promise<{ success: boolean; sessionId: string }>;
  }

  static async loadRaceSession(sessionId: string): Promise<RaceSession> {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
    
    // Get auth token from AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const user = await AsyncStorage.getItem('user');
    const token = user ? JSON.parse(user).token : null;
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/races/sessions/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to load race session' })) as { error?: string };
      throw new Error(errorData.error || 'Failed to load race session');
    }

    return response.json() as Promise<RaceSession>;
  }

  static async getUserRaceSessions(): Promise<RaceSession[]> {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
    
    // Get auth token from AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const user = await AsyncStorage.getItem('user');
    const token = user ? JSON.parse(user).token : null;
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/races/sessions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to load race sessions' })) as { error?: string };
      throw new Error(errorData.error || 'Failed to load race sessions');
    }

    return response.json() as Promise<RaceSession[]>;
  }

  static async updateRaceSession(sessionId: string, updates: Partial<RaceSessionData>): Promise<{ success: boolean }> {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
    
    // Get auth token from AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const user = await AsyncStorage.getItem('user');
    const token = user ? JSON.parse(user).token : null;
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/races/sessions/${sessionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to update race session' })) as { error?: string };
      throw new Error(errorData.error || 'Failed to update race session');
    }

    return response.json() as Promise<{ success: boolean }>;
  }

  static async deleteRaceSession(sessionId: string): Promise<{ success: boolean }> {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
    
    // Get auth token from AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const user = await AsyncStorage.getItem('user');
    const token = user ? JSON.parse(user).token : null;
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/races/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to delete race session' })) as { error?: string };
      throw new Error(errorData.error || 'Failed to delete race session');
    }

    return response.json() as Promise<{ success: boolean }>;
  }

  static async getUserRaceStats(): Promise<RaceStats> {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
    
    // Get auth token from AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const user = await AsyncStorage.getItem('user');
    const token = user ? JSON.parse(user).token : null;
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/races/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to load race stats' })) as { error?: string };
      throw new Error(errorData.error || 'Failed to load race stats');
    }

    return response.json() as Promise<RaceStats>;
  }

  // Race management methods
  static async createRace(raceData: {
    name: string;
    raceType: string;
    maxParticipants?: number;
    startTime: string;
    distance?: number | null;
    entryFee?: number;
    prizePayout?: number;
    locationName?: string;
    locationAddress?: string;
    location?: { latitude: number; longitude: number };
    rules?: Record<string, any>;
    settings?: Record<string, any>;
  }): Promise<{ success: boolean; raceId: string; race: any }> {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';
    
    // Get auth token from AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const user = await AsyncStorage.getItem('user');
    const token = user ? JSON.parse(user).token : null;
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const payload = {
      ...raceData,
      locationLat: raceData.location?.latitude,
      locationLon: raceData.location?.longitude,
    };
    delete (payload as any).location;

    const response = await fetch(`${API_BASE_URL}/races`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to create race' })) as { error?: string };
      throw new Error(errorData.error || 'Failed to create race');
    }

    const result = await response.json() as { success: boolean; race: any };
    return {
      success: result.success,
      raceId: result.race.id,
      race: result.race,
    };
  }

  static async getRaces(): Promise<any[]> {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';
    
    const response = await fetch(`${API_BASE_URL}/races`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch races' })) as { error?: string };
      throw new Error(errorData.error || 'Failed to fetch races');
    }

    return response.json() as Promise<any[]>;
  }

  static async joinRace(raceId: string, carId?: string): Promise<{ success: boolean; message: string }> {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';
    
    // Get auth token from AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const user = await AsyncStorage.getItem('user');
    const token = user ? JSON.parse(user).token : null;
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/races/${raceId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ carId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to join race' })) as { error?: string };
      throw new Error(errorData.error || 'Failed to join race');
    }

    return response.json() as Promise<{ success: boolean; message: string }>;
  }

  static async leaveRace(raceId: string): Promise<{ success: boolean; message: string }> {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';
    
    // Get auth token from AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const user = await AsyncStorage.getItem('user');
    const token = user ? JSON.parse(user).token : null;
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/races/${raceId}/leave`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to leave race' })) as { error?: string };
      throw new Error(errorData.error || 'Failed to leave race');
    }

    return response.json() as Promise<{ success: boolean; message: string }>;
  }
}