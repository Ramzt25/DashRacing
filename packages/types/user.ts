export interface User {
  id: string;
  displayName: string;
  handle: string;
  bio?: string;
  homeGeo?: {
    latitude: number;
    longitude: number;
    radiusMeters: number;
  };
  termsVersion: number;
  termsAcceptedAt: string;
  liveSharingEnabled: boolean;
  liveSharingScope: 'friends' | 'events' | 'nobody';
  quietHours?: {
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
  emergencyContact?: {
    name: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  friendsCount: number;
  vehiclesCount: number;
  meetsHosted: number;
  meetsAttended: number;
}

export interface Friend {
  id: string;
  displayName: string;
  handle: string;
  status: 'pending' | 'accepted' | 'blocked';
  isOnline: boolean;
  lastSeen?: string;
  location?: {
    latitude: number;
    longitude: number;
    updatedAt: string;
  };
  createdAt: string;
}