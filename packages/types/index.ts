export * from './user';
export * from './garage';
export * from './meets';
export * from './pins';
export * from './features';

// Common types
export interface Location {
  latitude: number;
  longitude: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Real-time presence types
export interface UserPresence {
  userId: string;
  status: 'online' | 'away' | 'offline';
  location?: Location;
  heading?: number;
  updatedAt: string;
}

export interface PresenceChannel {
  channel: string;
  users: UserPresence[];
}

// Analytics events
export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: string;
}