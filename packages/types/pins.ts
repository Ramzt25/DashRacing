export interface Pin {
  id: string;
  userId: string;
  type: 'police' | 'hazard' | 'construction' | 'camera' | 'pothole';
  location: {
    latitude: number;
    longitude: number;
  };
  description?: string;
  photo?: string;
  expiresAt: string;
  status: 'pending' | 'verified' | 'hidden';
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down';
  createdAt: string;
}

export interface PinVote {
  pinId: string;
  userId: string;
  vote: 'up' | 'down';
  createdAt: string;
}

export interface PinTypeConfig {
  type: 'police' | 'hazard' | 'construction' | 'camera' | 'pothole';
  icon: string;
  color: string;
  ttlMinutes: number;
  verificationThreshold: number;
  hideThreshold: number;
}

export const PIN_CONFIGS: Record<string, PinTypeConfig> = {
  police: {
    type: 'police',
    icon: '🚔',
    color: '#FF3B30',
    ttlMinutes: 45,
    verificationThreshold: 3,
    hideThreshold: -2,
  },
  hazard: {
    type: 'hazard',
    icon: '⚠️',
    color: '#F7B500',
    ttlMinutes: 120,
    verificationThreshold: 2,
    hideThreshold: -3,
  },
  construction: {
    type: 'construction',
    icon: '🚧',
    color: '#F7B500',
    ttlMinutes: 1440, // 24 hours
    verificationThreshold: 2,
    hideThreshold: -3,
  },
  camera: {
    type: 'camera',
    icon: '📷',
    color: '#007AFF',
    ttlMinutes: 10080, // 7 days
    verificationThreshold: 5,
    hideThreshold: -2,
  },
  pothole: {
    type: 'pothole',
    icon: '🕳️',
    color: '#8E8E93',
    ttlMinutes: 2880, // 48 hours
    verificationThreshold: 2,
    hideThreshold: -3,
  },
};