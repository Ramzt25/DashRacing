// Configuration constants for the DASH Racing app
// Environment-specific API configuration

// Development/Local environment
const DEV_CONFIG = {
  API_BASE_URL: 'http://192.168.18.27:4000',
  WS_BASE_URL: 'ws://192.168.18.27:4000',
  ENVIRONMENT: 'development',
};

// Production/Azure environment
const PROD_CONFIG = {
  API_BASE_URL: 'https://dash-racing-api.azurecontainerapps.io',
  WS_BASE_URL: 'wss://dash-racing-api.azurecontainerapps.io',
  ENVIRONMENT: 'production',
};

// Staging environment
const STAGING_CONFIG = {
  API_BASE_URL: 'https://dash-racing-api-staging.azurecontainerapps.io',
  WS_BASE_URL: 'wss://dash-racing-api-staging.azurecontainerapps.io',
  ENVIRONMENT: 'staging',
};

// Determine current environment
// @ts-ignore - __DEV__ is available in React Native
const isDevelopment = (typeof __DEV__ !== 'undefined' && __DEV__) || process.env.NODE_ENV === 'development';
const isStaging = process.env.EXPO_PUBLIC_ENVIRONMENT === 'staging';

// Select configuration based on environment
const config = isDevelopment 
  ? DEV_CONFIG 
  : isStaging 
    ? STAGING_CONFIG 
    : PROD_CONFIG;

// Export configuration constants
export const API_BASE_URL = config.API_BASE_URL;
export const WS_BASE_URL = config.WS_BASE_URL;
export const ENVIRONMENT = config.ENVIRONMENT;

// API endpoints
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  MEETUPS: '/api/meetups',
  RACES: '/api/races',
  VEHICLES: '/api/vehicles',
  EVENTS: '/api/events',
  LOCATIONS: '/api/locations',
} as const;

// App constants
export const APP_CONFIG = {
  // Location settings
  DEFAULT_LOCATION_RADIUS: 50, // km
  MIN_LOCATION_ACCURACY: 100, // meters
  LOCATION_UPDATE_INTERVAL: 5000, // ms
  
  // Race settings
  MIN_RACE_DURATION: 10, // seconds
  MAX_RACE_DURATION: 3600, // seconds
  DEFAULT_MEETUP_RADIUS: 25, // km
  
  // Performance tracking
  PERFORMANCE_SAMPLE_RATE: 100, // ms
  GPS_HIGH_ACCURACY_TIMEOUT: 10000, // ms
  
  // UI settings
  DEFAULT_MAP_ZOOM: 15,
  ANIMATION_DURATION: 300, // ms
  DEBOUNCE_DELAY: 500, // ms
  
  // Caching
  CACHE_TTL: 300000, // 5 minutes in ms
  MAX_CACHE_SIZE: 100, // items
} as const;

// Feature flags
export const FEATURES = {
  ENABLE_LIVE_TRACKING: true,
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_OFFLINE_MODE: true,
  ENABLE_ANALYTICS: true,
  ENABLE_CRASH_REPORTING: true,
  ENABLE_PERFORMANCE_MONITORING: true,
} as const;

// Debug settings (only in development)
export const DEBUG = {
  ENABLE_REDUX_LOGGER: isDevelopment,
  ENABLE_NETWORK_LOGGER: isDevelopment,
  SHOW_PERFORMANCE_MONITOR: isDevelopment && false, // Set to true when needed
  MOCK_LOCATION_DATA: isDevelopment && false, // For testing without GPS
} as const;