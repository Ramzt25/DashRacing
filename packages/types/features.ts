export interface FeatureFlag {
  key: string;
  value: any;
  updatedAt: string;
}

export interface UserEntitlements {
  userId: string;
  plan: 'free' | 'premium';
  source: 'purchase' | 'promo' | 'admin';
  renewedAt: string;
  expiresAt: string;
}

export interface FeatureGate {
  feature: string;
  requiresPremium: boolean;
  enabled: boolean;
  reason?: string;
}

export const FREE_LIMITS = {
  maxVehicles: 1,
  maxMeetRadius: 50000, // 50km
  maxMeetAttendees: 50,
  upgradesPlannerEnabled: false,
} as const;

export const PREMIUM_BENEFITS = {
  maxVehicles: Infinity,
  maxMeetRadius: Infinity,
  maxMeetAttendees: Infinity,
  upgradesPlannerEnabled: true,
  prioritySupport: true,
  advancedFilters: true,
} as const;