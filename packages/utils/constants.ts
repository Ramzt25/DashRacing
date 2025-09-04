// Design tokens and theme
export const theme = {
  colors: {
    background: '#0b0b0c',
    surface: '#111214',
    primary: '#d3132a',
    accent: '#f7b500',
    textPrimary: '#f5f7fa',
    textMuted: '#b4b8bf',
    success: '#21c27a',
    warning: '#f7b500',
    danger: '#ff3b30',
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 20,
  },
  blur: {
    header: 12,
    bottomBar: 16,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
} as const;

// App constants
export const APP_CONFIG = {
  name: 'Dash',
  version: '1.0.0',
  bundleId: {
    ios: 'com.dash.app',
    android: 'com.dash.app',
  },
  deepLinkScheme: 'dash',
  termsVersion: 1,
  privacyVersion: 1,
} as const;

// Feature flags and limits
export const LIMITS = {
  free: {
    maxVehicles: 1,
    maxMeetRadius: 50000, // meters
    maxMeetAttendees: 50,
    aiCallsPerDay: 0,
  },
  premium: {
    maxVehicles: 999,
    maxMeetRadius: 999999,
    maxMeetAttendees: 999,
    aiCallsPerDay: 50,
  },
} as const;

// Map settings
export const MAP_CONFIG = {
  defaultZoom: 14,
  maxZoom: 18,
  minZoom: 10,
  clusterDistance: 50,
  pinTTL: {
    police: 45 * 60 * 1000, // 45 minutes
    hazard: 2 * 60 * 60 * 1000, // 2 hours
    construction: 24 * 60 * 60 * 1000, // 24 hours
    camera: 7 * 24 * 60 * 60 * 1000, // 7 days
    pothole: 48 * 60 * 60 * 1000, // 48 hours
  },
  safeDrivingSpeedThreshold: 25, // mph
} as const;

// Location settings
export const LOCATION_CONFIG = {
  updateInterval: 5000, // 5 seconds
  snapshotInterval: 60000, // 1 minute
  highAccuracyDistance: 150, // meters
  backgroundLocationTitle: 'Dash is tracking your location',
  backgroundLocationMessage: 'This allows friends to see your location when you enable live sharing.',
} as const;

// Push notification types
export const NOTIFICATION_TYPES = {
  MEET_CREATED: 'meet_created',
  MEET_UPDATE: 'meet_update',
  FRIEND_NEARBY: 'friend_nearby',
  HAZARD_ALERT: 'hazard_alert',
  FRIEND_REQUEST: 'friend_request',
} as const;

// API rate limits
export const RATE_LIMITS = {
  pinCreation: 2 * 60 * 1000, // 2 minutes between pins
  aiUpgradesPerVehiclePerDay: 5,
  meetCreationPerDay: 10,
} as const;