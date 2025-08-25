export interface User {
  id: string;
  email: string;
  handle: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  presenceMode: string;
  isPro: boolean;
  subscriptionTier?: string;
  subscriptionStart?: string;
  subscriptionEnd?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Car {
  id: string;
  userId: string;
  name: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  class?: string;
  owned: boolean;
  estimatedValue?: number;
  imageUrl?: string;
  weightKg?: number;
  whp?: number;
  drivetrain?: string;
  performanceScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Race {
  id: string;
  createdById: string;
  name?: string;
  raceType: 'drag' | 'circuit' | 'street' | 'track';
  status: 'pending' | 'starting' | 'active' | 'completed' | 'cancelled';
  maxParticipants: number;
  startTime: string;
  endTime?: string;
  distance?: number;
  entryFee?: number;
  prizePayout?: number;
  locationName?: string;
  locationAddress?: string;
  locationLat?: number;
  locationLon?: number;
  createdBy?: User;
  participants?: RaceParticipant[];
  _count?: {
    participants: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RaceParticipant {
  id: string;
  raceId: string;
  racerId: string;
  carId?: string;
  position?: number;
  time?: number;
  racer?: User;
  car?: Car;
}

export interface RaceResult {
  id: string;
  raceId: string;
  participantId: string;
  carId?: string;
  position?: number;
  timeSeconds?: number;
  topSpeed?: number;
  performanceScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  eventType: 'meetup' | 'race' | 'show' | 'cruise';
  startTime: string;
  endTime?: string;
  locationName?: string;
  locationAddress?: string;
  locationLat?: number;
  locationLon?: number;
  maxAttendees?: number;
  entryFee?: number;
  isPublic: boolean;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  user: User;
  stats: {
    totalRaces: number;
    wins: number;
    podiums: number;
    winRate: number;
    bestLapTimes: number[];
  };
  cars: Car[];
  recentRaces: any[];
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  wins: number;
  totalRaces: number;
  winRate: number;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  database: {
    status: 'connected' | 'disconnected';
    responseTime: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
  };
  lastChecked: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRaces: number;
  activeRaces: number;
  totalCars: number;
  totalEvents: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'user_registered' | 'race_created' | 'race_completed' | 'car_added' | 'event_created';
  description: string;
  timestamp: string;
  userId?: string;
  relatedId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}