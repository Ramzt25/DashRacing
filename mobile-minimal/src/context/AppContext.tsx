import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { StorageService, UserPreferences, RaceStats, CarData, AppSettings } from '../utils/storage';

// State interface
interface AppState {
  isLoading: boolean;
  userPreferences: UserPreferences;
  raceStats: RaceStats;
  carData: CarData;
  appSettings: AppSettings;
  error: string | null;
}

// Action types
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER_PREFERENCES'; payload: UserPreferences }
  | { type: 'SET_RACE_STATS'; payload: RaceStats }
  | { type: 'SET_CAR_DATA'; payload: CarData }
  | { type: 'SET_APP_SETTINGS'; payload: AppSettings }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'INIT_SUCCESS'; payload: Omit<AppState, 'isLoading' | 'error'> };

// Initial state
const initialState: AppState = {
  isLoading: true,
  userPreferences: {
    notifications: true,
    location: false,
    darkMode: false,
    units: 'metric',
  },
  raceStats: {
    totalRaces: 0,
    wins: 0,
    losses: 0,
    bestTime: null,
    totalDistance: 0,
  },
  carData: {
    selectedCar: null,
    ownedCars: [],
    customizations: {},
  },
  appSettings: {
    soundEnabled: true,
    vibrationEnabled: true,
    language: 'en',
    theme: 'auto',
  },
  error: null,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER_PREFERENCES':
      return { ...state, userPreferences: action.payload };
    case 'SET_RACE_STATS':
      return { ...state, raceStats: action.payload };
    case 'SET_CAR_DATA':
      return { ...state, carData: action.payload };
    case 'SET_APP_SETTINGS':
      return { ...state, appSettings: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'INIT_SUCCESS':
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        error: null,
      };
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  updateUserPreferences: (preferences: UserPreferences) => Promise<void>;
  updateRaceStats: (stats: RaceStats) => Promise<void>;
  updateCarData: (data: CarData) => Promise<void>;
  updateAppSettings: (settings: AppSettings) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize data on mount
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Load all data in parallel
      const [userPreferences, raceStats, carData, appSettings] = await Promise.all([
        StorageService.getUserPreferences(),
        StorageService.getRaceStats(),
        StorageService.getCarData(),
        StorageService.getAppSettings(),
      ]);

      dispatch({
        type: 'INIT_SUCCESS',
        payload: {
          userPreferences,
          raceStats,
          carData,
          appSettings,
        },
      });
    } catch (error) {
      console.error('Error initializing app data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load app data' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateUserPreferences = async (preferences: UserPreferences) => {
    try {
      const success = await StorageService.setUserPreferences(preferences);
      if (success) {
        dispatch({ type: 'SET_USER_PREFERENCES', payload: preferences });
      }
    } catch (error) {
      console.error('Error updating user preferences:', error);
    }
  };

  const updateRaceStats = async (stats: RaceStats) => {
    try {
      const success = await StorageService.setRaceStats(stats);
      if (success) {
        dispatch({ type: 'SET_RACE_STATS', payload: stats });
      }
    } catch (error) {
      console.error('Error updating race stats:', error);
    }
  };

  const updateCarData = async (data: CarData) => {
    try {
      const success = await StorageService.setCarData(data);
      if (success) {
        dispatch({ type: 'SET_CAR_DATA', payload: data });
      }
    } catch (error) {
      console.error('Error updating car data:', error);
    }
  };

  const updateAppSettings = async (settings: AppSettings) => {
    try {
      const success = await StorageService.setAppSettings(settings);
      if (success) {
        dispatch({ type: 'SET_APP_SETTINGS', payload: settings });
      }
    } catch (error) {
      console.error('Error updating app settings:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        state,
        updateUserPreferences,
        updateRaceStats,
        updateCarData,
        updateAppSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// Hook to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}