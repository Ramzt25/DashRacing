// Database model types - matches Prisma schema

export interface User {
  id: string;
  email: string;
  handle: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  role: string;
  presenceMode: string;
  isPro: boolean;
  subscriptionTier?: string;
  subscriptionStart?: Date;
  subscriptionEnd?: Date;
  subscriptionId?: string;
}

export interface Car {
  id: string;
  userId: string;
  name: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  class: string;
  owned: boolean;
  estimatedValue?: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // AI Performance Analysis
  basePower?: number;
  baseTorque?: number;
  baseWeight?: number;
  currentPower?: number;
  currentTorque?: number;
  currentWeight?: number;
  performanceScore?: number;
  aiAnalysisDate?: Date;
}

export interface Mod {
  id: string;
  carId: string;
  category: string;
  name: string;
  brand?: string;
  notes?: string;
  
  // AI Enhancement Data
  powerGain?: number;
  torqueGain?: number;
  weightChange?: number;
  reliabilityImpact?: number;
  compatibilityScore?: number;
  performanceGain?: number;
  aiConfidence?: number;
  
  // Web Scraped Data
  marketPrice?: number;
  availability?: string;
  vendorUrl?: string;
  reviews?: any;
  lastPriceUpdate?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Race {
  id: string;
  createdById: string;
  name?: string;
  raceType: string;
  status: string;
  maxParticipants: number;
  startTime: Date;
  endTime?: Date;
  distance?: number;
  entryFee?: number;
  prizePayout?: number;
  locationName?: string;
  locationAddress?: string;
  locationLat?: number;
  locationLon?: number;
  rules?: any;
  weather?: any;
  trackConditions?: any;
  safetyFeatures?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface RaceResult {
  id: string;
  raceId?: string;
  sessionId?: string;
  participantId: string;
  carId?: string;
  position: number;
  timeElapsed?: number;
  topSpeed?: number;
  avgSpeed?: number;
  distance?: number;
  isWinner: boolean;
  
  // AI Performance Analysis
  reactionTime?: number;
  consistencyScore?: number;
  skillRating?: number;
  performanceVsExpected?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface RaceSession {
  id: string;
  raceId?: string;
  userId: string;
  carId?: string;
  startTime: Date;
  endTime?: Date;
  isCompleted: boolean;
  sessionType: string;
  totalDistance?: number;
  maxSpeed?: number;
  averageSpeed?: number;
  
  // AI Performance Analysis
  performanceScore?: number;
  drivingStyle?: string;
  improvementTips?: any;
  
  createdAt: Date;
  updatedAt: Date;
}