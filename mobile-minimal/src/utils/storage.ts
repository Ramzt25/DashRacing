import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  RACE_STATS: 'race_stats',
  CAR_DATA: 'car_data',
  SETTINGS: 'app_settings',
} as const;

// Type definitions
export interface UserPreferences {
  notifications: boolean;
  location: boolean;
  darkMode: boolean;
  units: 'metric' | 'imperial';
}

export interface RaceStats {
  totalRaces: number;
  wins: number;
  losses: number;
  bestTime: number | null;
  totalDistance: number;
}

export interface CarData {
  selectedCar: string | null;
  ownedCars: string[];
  customizations: Record<string, any>;
}

export interface AppSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  language: string;
  theme: 'light' | 'dark' | 'auto';
}

// Default values
const DEFAULT_USER_PREFERENCES: UserPreferences = {
  notifications: true,
  location: false,
  darkMode: false,
  units: 'metric',
};

const DEFAULT_RACE_STATS: RaceStats = {
  totalRaces: 0,
  wins: 0,
  losses: 0,
  bestTime: null,
  totalDistance: 0,
};

const DEFAULT_CAR_DATA: CarData = {
  selectedCar: null,
  ownedCars: [],
  customizations: {},
};

const DEFAULT_APP_SETTINGS: AppSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  language: 'en',
  theme: 'auto',
};

// Storage utility functions
export class StorageService {
  static async getItem<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) {
        return defaultValue;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      console.warn(`Error reading storage key ${key}:`, error);
      return defaultValue;
    }
  }

  static async setItem<T>(key: string, value: T): Promise<boolean> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Error writing storage key ${key}:`, error);
      return false;
    }
  }

  static async removeItem(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Error removing storage key ${key}:`, error);
      return false;
    }
  }

  static async clearAll(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.warn('Error clearing all storage:', error);
      return false;
    }
  }

  // Convenience methods for specific data types
  static async getUserPreferences(): Promise<UserPreferences> {
    return this.getItem(STORAGE_KEYS.USER_PREFERENCES, DEFAULT_USER_PREFERENCES);
  }

  static async setUserPreferences(preferences: UserPreferences): Promise<boolean> {
    return this.setItem(STORAGE_KEYS.USER_PREFERENCES, preferences);
  }

  static async getRaceStats(): Promise<RaceStats> {
    return this.getItem(STORAGE_KEYS.RACE_STATS, DEFAULT_RACE_STATS);
  }

  static async setRaceStats(stats: RaceStats): Promise<boolean> {
    return this.setItem(STORAGE_KEYS.RACE_STATS, stats);
  }

  static async getCarData(): Promise<CarData> {
    return this.getItem(STORAGE_KEYS.CAR_DATA, DEFAULT_CAR_DATA);
  }

  static async setCarData(data: CarData): Promise<boolean> {
    return this.setItem(STORAGE_KEYS.CAR_DATA, data);
  }

  static async getAppSettings(): Promise<AppSettings> {
    return this.getItem(STORAGE_KEYS.SETTINGS, DEFAULT_APP_SETTINGS);
  }

  static async setAppSettings(settings: AppSettings): Promise<boolean> {
    return this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }
}