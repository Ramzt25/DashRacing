/**
 * API Configuration for Dash Mobile App
 * Week 4 Frontend Integration - Backend Connection Configuration
 */

// API Base URL Configuration
export const API_CONFIG = {
  // Backend server URL (updated for Week 4 integration)
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000',
  
  // API Endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      REFRESH: '/auth/refresh',
      LOGOUT: '/auth/logout',
    },
    
    // Races and Sessions
    RACES: {
      LIST: '/races',
      CREATE: '/races',
      JOIN: (raceId: string) => `/races/${raceId}/join`,
      LEAVE: (raceId: string) => `/races/${raceId}/leave`,
      SESSIONS: '/races/sessions',
      SESSION: (sessionId: string) => `/races/sessions/${sessionId}`,
      STATS: '/races/stats',
    },
    
    // Cars and Vehicles
    CARS: {
      LIST: '/cars',
      CREATE: '/cars',
      DETAIL: (carId: string) => `/cars/${carId}`,
      UPDATE: (carId: string) => `/cars/${carId}`,
      DELETE: (carId: string) => `/cars/${carId}`,
      MODIFICATIONS: (carId: string) => `/cars/${carId}/modifications`,
    },
    
    // Events and Meetups
    EVENTS: {
      LIST: '/events',
      CREATE: '/events',
      DETAIL: (eventId: string) => `/events/${eventId}`,
      JOIN: (eventId: string) => `/events/${eventId}/join`,
      LEAVE: (eventId: string) => `/events/${eventId}/leave`,
    },
    
    // Meetups
    MEETUPS: {
      LIST: '/meetups',
      CREATE: '/meetups',
      DETAIL: (meetupId: string) => `/meetups/${meetupId}`,
      JOIN: (meetupId: string) => `/meetups/${meetupId}/join`,
      LEAVE: (meetupId: string) => `/meetups/${meetupId}/leave`,
    },
    
    // Live Map and Location
    LIVE_MAP: {
      PLAYERS: '/livemap/players',
      EVENTS: '/livemap/events',
      UPDATE_LOCATION: '/livemap/location',
      PRESENCE: '/livemap/presence',
      STATUS: '/livemap/status',
    },
    
    // User Stats
    USER_STATS: {
      OVERVIEW: '/userstats/overview',
      PERFORMANCE: '/userstats/performance',
      ACHIEVEMENTS: '/userstats/achievements',
      LEADERBOARD: '/userstats/leaderboard',
    },
    
    // AI Services
    AI: {
      ANALYZE_PERFORMANCE: '/ai/analyze-performance',
      COMPARE_VEHICLES: '/ai/compare-vehicles',
      UPGRADE_RECOMMENDATIONS: '/ai/upgrade-recommendations',
      PREDICT_RACE_PERFORMANCE: '/ai/predict-race-performance',
      USER_INSIGHTS: (userId: string) => `/ai/user-insights/${userId}`,
    },
    
    // Web Scraping Services
    SCRAPING: {
      SEARCH_PARTS: '/scraping/search-parts',
      MARKET_ANALYSIS: '/scraping/market-analysis',
      PRICE_MONITOR: '/scraping/price-monitor',
      COMPATIBILITY_CHECK: '/scraping/compatibility-check',
      TRENDING_PARTS: '/scraping/trending-parts',
      PRICE_ALERTS: (userId: string) => `/scraping/price-alerts/${userId}`,
    },
  },
  
  // Request configuration
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  
  // Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

/**
 * Build full URL for API endpoint
 */
export function buildApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

/**
 * Get authorization header with token
 */
export async function getAuthHeader(): Promise<{ Authorization?: string }> {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const user = await AsyncStorage.getItem('user');
    
    if (user) {
      const userData = JSON.parse(user);
      if (userData.token) {
        return { Authorization: `Bearer ${userData.token}` };
      }
    }
    
    return {};
  } catch (error) {
    console.warn('Failed to get auth token:', error);
    return {};
  }
}

/**
 * Standard API request function with authentication and error handling
 */
export async function apiRequest<T = any>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = buildApiUrl(endpoint);
  const authHeader = await getAuthHeader();
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...authHeader,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: `HTTP ${response.status}: ${response.statusText}` 
      })) as { error?: string };
      throw new Error(errorData.error || `API request failed: ${response.status}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error(`API Request failed for ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Week 4 Integration Status
 */
export const INTEGRATION_STATUS = {
  BACKEND_CONNECTED: true,
  BASE_URL: API_CONFIG.BASE_URL,
  SERVICES_INTEGRATED: [
    'Race Statistics',
    'Live Map Data', 
    'User Authentication',
    'Car Management',
    'Events & Meetups',
    'AI Performance Analysis',
    'Web Scraping Services',
  ],
  LAST_UPDATED: new Date().toISOString(),
  VERSION: '4.0.0',
} as const;