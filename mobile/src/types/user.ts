export interface User {
  id: string;
  username: string;
  email: string;
  profile: UserProfile;
  vehicles: string[]; // Vehicle IDs
  raceHistory: string[]; // Race IDs
  crews: string[]; // Crew IDs
  achievements: Achievement[];
  settings: UserSettings;
  subscription?: SubscriptionInfo;
  statistics: UserStatistics;
  socialConnections: SocialConnection[];
  emergencyContacts: EmergencyContact[];
  createdAt: Date;
  lastActive: Date;
  isVerified: boolean;
  isBanned: boolean;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  location: {
    city?: string;
    state?: string;
    country: string;
  };
  birthDate?: Date;
  phone?: string;
  driverLicense?: {
    number: string;
    state: string;
    expirationDate: Date;
    class: string;
  };
  racingLicense?: {
    organization: string;
    number: string;
    level: string;
    expirationDate: Date;
  };
  experience: ExperienceLevel;
  favoriteTrack?: string;
  racingStyle: RacingStyle[];
  visibility: PrivacyLevel;
}

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'professional';
export type RacingStyle = 'drag' | 'circuit' | 'drift' | 'autocross' | 'street' | 'track_day';
export type PrivacyLevel = 'public' | 'friends' | 'private';

export interface Achievement {
  id: string;
  type: AchievementType;
  title: string;
  description: string;
  icon: string;
  earnedAt: Date;
  progress?: {
    current: number;
    target: number;
  };
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export type AchievementType = 
  | 'first_race'
  | 'first_win'
  | 'speed_demon'
  | 'consistent_racer'
  | 'track_master'
  | 'crew_leader'
  | 'photographer'
  | 'mechanic'
  | 'social_butterfly'
  | 'veteran';

export interface UserSettings {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  safety: SafetySettings;
  display: DisplaySettings;
  location: LocationSettings;
}

export interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  raceInvites: boolean;
  crewUpdates: boolean;
  achievements: boolean;
  maintenance: boolean;
  security: boolean;
  marketing: boolean;
}

export interface PrivacySettings {
  profileVisibility: PrivacyLevel;
  locationSharing: 'always' | 'racing_only' | 'never';
  showRealName: boolean;
  showVehicles: boolean;
  showStats: boolean;
  allowMessages: 'everyone' | 'friends' | 'none';
  allowCrewInvites: boolean;
}

export interface SafetySettings {
  trackOnlyMode: boolean;
  speedWarnings: boolean;
  maxSpeedAlert: number; // in mph
  emergencyContactNotification: boolean;
  automaticCrashDetection: boolean;
  sobrietyReminders: boolean;
}

export interface DisplaySettings {
  theme: 'dark' | 'light' | 'auto';
  units: 'imperial' | 'metric';
  language: string;
  timezone: string;
  mapStyle: 'standard' | 'satellite' | 'hybrid';
}

export interface LocationSettings {
  highAccuracyGPS: boolean;
  backgroundLocation: boolean;
  shareLocation: boolean;
  saveRoutes: boolean;
}

export interface UserStatistics {
  totalRaces: number;
  wins: number;
  podiumFinishes: number;
  totalDistance: number; // in miles
  totalTime: number; // in seconds
  averagePosition: number;
  bestLapTime?: number;
  topSpeed: number;
  favoriteTrack?: string;
  mostUsedVehicle?: string;
  winRate: number; // percentage
  experiencePoints: number;
  level: number;
  rankingPosition?: number;
  reputation: number; // 0-5 star rating
}

export interface SocialConnection {
  userId: string;
  username: string;
  relationship: 'friend' | 'crew_member' | 'blocked';
  connectedAt: Date;
  mutualFriends?: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
  notifyOnRace: boolean;
}

export interface Crew {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  foundedDate: Date;
  leaderId: string;
  members: CrewMember[];
  stats: CrewStatistics;
  events: string[]; // Event IDs
  visibility: PrivacyLevel;
  requirements?: string;
  location?: {
    city: string;
    state: string;
    country: string;
  };
}

export interface CrewMember {
  userId: string;
  username: string;
  role: CrewRole;
  joinedAt: Date;
  contributions: {
    races: number;
    wins: number;
    events: number;
  };
}

export type CrewRole = 'leader' | 'officer' | 'mechanic' | 'photographer' | 'member';

export interface CrewStatistics {
  totalMembers: number;
  totalRaces: number;
  totalWins: number;
  averagePosition: number;
  reputation: number;
  level: number;
  experiencePoints: number;
}

export interface SubscriptionInfo {
  plan: 'free' | 'pro' | 'premium';
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startDate: Date;
  endDate: Date;
  features: string[];
  price: number;
  currency: string;
  paymentMethod?: string;
}