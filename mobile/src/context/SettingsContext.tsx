import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SpeedUnit = 'mph' | 'kmh';
export type DistanceUnit = 'miles' | 'kilometers';

interface AppSettings {
  speedUnit: SpeedUnit;
  distanceUnit: DistanceUnit;
  enableNotifications: boolean;
  enableSounds: boolean;
  autoStartGPS: boolean;
  theme: 'dark' | 'light';
}

interface SettingsContextType {
  settings: AppSettings;
  updateSpeedUnit: (unit: SpeedUnit) => Promise<void>;
  updateDistanceUnit: (unit: DistanceUnit) => Promise<void>;
  updateNotifications: (enabled: boolean) => Promise<void>;
  updateSounds: (enabled: boolean) => Promise<void>;
  updateAutoStartGPS: (enabled: boolean) => Promise<void>;
  updateTheme: (theme: 'dark' | 'light') => Promise<void>;
  convertSpeed: (speed: number, fromUnit?: SpeedUnit) => number;
  convertDistance: (distance: number, fromUnit?: DistanceUnit) => number;
  getSpeedUnitLabel: () => string;
  getDistanceUnitLabel: () => string;
  isLoading: boolean;
}

const defaultSettings: AppSettings = {
  speedUnit: 'mph',
  distanceUnit: 'miles',
  enableNotifications: true,
  enableSounds: true,
  autoStartGPS: true,
  theme: 'dark',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const updateSpeedUnit = async (unit: SpeedUnit) => {
    const newSettings = { ...settings, speedUnit: unit };
    const distanceUnit = unit === 'mph' ? 'miles' : 'kilometers';
    newSettings.distanceUnit = distanceUnit;
    await saveSettings(newSettings);
  };

  const updateDistanceUnit = async (unit: DistanceUnit) => {
    const newSettings = { ...settings, distanceUnit: unit };
    await saveSettings(newSettings);
  };

  const updateNotifications = async (enabled: boolean) => {
    const newSettings = { ...settings, enableNotifications: enabled };
    await saveSettings(newSettings);
  };

  const updateSounds = async (enabled: boolean) => {
    const newSettings = { ...settings, enableSounds: enabled };
    await saveSettings(newSettings);
  };

  const updateAutoStartGPS = async (enabled: boolean) => {
    const newSettings = { ...settings, autoStartGPS: enabled };
    await saveSettings(newSettings);
  };

  const updateTheme = async (theme: 'dark' | 'light') => {
    const newSettings = { ...settings, theme };
    await saveSettings(newSettings);
  };

  // Speed conversion utilities
  const convertSpeed = (speed: number, fromUnit: SpeedUnit = 'mph'): number => {
    if (fromUnit === settings.speedUnit) return speed;
    
    if (fromUnit === 'mph' && settings.speedUnit === 'kmh') {
      return speed * 1.60934; // mph to kmh
    } else if (fromUnit === 'kmh' && settings.speedUnit === 'mph') {
      return speed * 0.621371; // kmh to mph
    }
    
    return speed;
  };

  // Distance conversion utilities
  const convertDistance = (distance: number, fromUnit: DistanceUnit = 'miles'): number => {
    if (fromUnit === settings.distanceUnit) return distance;
    
    if (fromUnit === 'miles' && settings.distanceUnit === 'kilometers') {
      return distance * 1.60934; // miles to km
    } else if (fromUnit === 'kilometers' && settings.distanceUnit === 'miles') {
      return distance * 0.621371; // km to miles
    }
    
    return distance;
  };

  const getSpeedUnitLabel = (): string => {
    return settings.speedUnit === 'mph' ? 'MPH' : 'KM/H';
  };

  const getDistanceUnitLabel = (): string => {
    return settings.distanceUnit === 'miles' ? 'MI' : 'KM';
  };

  const value: SettingsContextType = {
    settings,
    updateSpeedUnit,
    updateDistanceUnit,
    updateNotifications,
    updateSounds,
    updateAutoStartGPS,
    updateTheme,
    convertSpeed,
    convertDistance,
    getSpeedUnitLabel,
    getDistanceUnitLabel,
    isLoading,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}