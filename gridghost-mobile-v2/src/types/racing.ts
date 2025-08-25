export interface GPSCoordinate {
  latitude: number;
  longitude: number;
  altitude?: number;
  timestamp: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
}

export interface RaceResult {
  participantId: string;
  username: string;
  position: number;
  finishTime: number;
  bestLap?: number;
  averageSpeed: number;
  maxSpeed: number;
  vehicleId: string;
  penalties: RacePenalty[];
}

export interface RacePenalty {
  type: 'false_start' | 'lane_violation' | 'speed_limit' | 'dangerous_driving';
  description: string;
  timeAdded: number;
  timestamp: number;
}

export interface PerformanceMetrics {
  zeroToSixty: number; // in seconds
  quarterMile: number; // in seconds
  halfMile: number; // in seconds
  topSpeed: number; // in mph
  averageSpeed: number; // in mph
  totalDistance: number; // in miles
  lapTimes: number[]; // array of lap times in seconds
  gForces: {
    max: number;
    average: number;
    lateral: number;
  };
}

export interface Race {
  id: string;
  createdBy: string;
  participants: string[];
  maxParticipants: number;
  startTime: Date;
  endTime?: Date;
  route: GPSCoordinate[];
  results: RaceResult[];
  status: 'pending' | 'starting' | 'active' | 'completed' | 'cancelled';
  raceType: 'drag' | 'circuit' | 'street' | 'track';
  distance: number; // in miles
  entryFee?: number;
  prizePayout?: number;
  rules: RaceRules;
  location: {
    name: string;
    address: string;
    coordinates: GPSCoordinate;
  };
  weather?: WeatherConditions;
  trackConditions?: TrackConditions;
  safetyFeatures: SafetyFeature[];
}

export interface RaceRules {
  maxSpeed?: number;
  vehicleRestrictions: string[];
  safetyRequirements: string[];
  trackOnly: boolean;
  ageRestriction: number;
  licenseRequired: boolean;
}

export interface WeatherConditions {
  temperature: number; // in Fahrenheit
  humidity: number; // percentage
  windSpeed: number; // in mph
  windDirection: number; // in degrees
  visibility: number; // in miles
  conditions: 'clear' | 'cloudy' | 'rain' | 'snow' | 'fog';
}

export interface TrackConditions {
  surface: 'dry' | 'wet' | 'damp';
  grip: 'excellent' | 'good' | 'fair' | 'poor';
  temperature: number; // surface temp in Fahrenheit
}

export interface SafetyFeature {
  type: 'medical_team' | 'fire_safety' | 'barriers' | 'emergency_exits';
  description: string;
  location?: GPSCoordinate;
  contactInfo?: string;
}

export interface LiveRaceData {
  raceId: string;
  currentPositions: {
    participantId: string;
    position: number;
    currentSpeed: number;
    location: GPSCoordinate;
    lapTime?: number;
    lastLapTime?: number;
  }[];
  raceProgress: number; // percentage complete
  timeRemaining?: number; // in seconds
  currentLap?: number;
  totalLaps?: number;
  leaderboard: {
    participantId: string;
    username: string;
    position: number;
    gap: number; // time behind leader in seconds
    fastestLap?: number;
  }[];
}