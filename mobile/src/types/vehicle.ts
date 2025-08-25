export interface Vehicle {
  id: string;
  ownerId: string;
  make: string;
  model: string;
  year: number;
  trim?: string;
  vin?: string;
  color: string;
  mileage: number;
  engine: EngineSpecs;
  drivetrain: DrivetrainSpecs;
  modifications: Modification[];
  photos: VehiclePhoto[];
  performanceData: VehiclePerformance;
  maintenanceHistory: MaintenanceRecord[];
  insurance?: InsuranceInfo;
  registration?: RegistrationInfo;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EngineSpecs {
  displacement: number; // in liters
  cylinders: number;
  configuration: 'inline' | 'v' | 'flat' | 'rotary';
  aspiration: 'naturally_aspirated' | 'turbocharged' | 'supercharged' | 'twin_turbo';
  fuel: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  horsepower: number;
  torque: number; // in lb-ft
  redline: number; // in RPM
}

export interface DrivetrainSpecs {
  layout: 'fwd' | 'rwd' | 'awd' | '4wd';
  transmission: TransmissionSpecs;
  differentials: DifferentialSpecs[];
  finalDriveRatio: number;
}

export interface TransmissionSpecs {
  type: 'manual' | 'automatic' | 'cvt' | 'dual_clutch';
  gears: number;
  gearRatios: number[];
  brand?: string;
  model?: string;
}

export interface DifferentialSpecs {
  position: 'front' | 'rear' | 'center';
  type: 'open' | 'limited_slip' | 'locking' | 'electronic';
  ratio: number;
  brand?: string;
  model?: string;
}

export interface Modification {
  id: string;
  category: ModificationCategory;
  part: string;
  brand: string;
  model: string;
  description?: string;
  installDate: Date;
  cost: number;
  powerGain?: number; // in HP
  torqueGain?: number; // in lb-ft
  weightChange?: number; // in lbs (negative for reduction)
  photos: string[];
  receipt?: string;
  installer?: string;
  warranty?: WarrantyInfo;
}

export type ModificationCategory = 
  | 'engine'
  | 'exhaust'
  | 'intake'
  | 'turbo_supercharger'
  | 'fuel_system'
  | 'ignition'
  | 'transmission'
  | 'drivetrain'
  | 'suspension'
  | 'brakes'
  | 'wheels_tires'
  | 'body'
  | 'interior'
  | 'electronics'
  | 'safety';

export interface VehiclePhoto {
  id: string;
  url: string;
  type: 'exterior' | 'interior' | 'engine' | 'modification' | 'damage';
  caption?: string;
  takenAt: Date;
  isPrimary: boolean;
}

export interface VehiclePerformance {
  dynoRuns: DynoRun[];
  trackTimes: TrackTime[];
  dragTimes: DragTime[];
  fuelEconomy: FuelEconomyData;
  lastUpdated: Date;
}

export interface DynoRun {
  id: string;
  date: Date;
  location: string;
  operator: string;
  horsepower: number;
  torque: number;
  airFuelRatio: number;
  temperature: number;
  humidity: number;
  pressure: number;
  chart?: string; // URL to dyno chart image
  notes?: string;
}

export interface TrackTime {
  id: string;
  trackName: string;
  date: Date;
  lapTime: number; // in seconds
  conditions: 'dry' | 'wet' | 'mixed';
  temperature: number;
  notes?: string;
  telemetryData?: string; // URL to telemetry file
}

export interface DragTime {
  id: string;
  location: string;
  date: Date;
  reactionTime: number;
  sixtyFoot: number;
  quarterMile: number;
  quarterMileMPH: number;
  halfMile?: number;
  halfMileMPH?: number;
  conditions: 'dry' | 'wet';
  temperature: number;
  notes?: string;
}

export interface FuelEconomyData {
  city: number; // MPG
  highway: number; // MPG
  combined: number; // MPG
  lastCalculated: Date;
}

export interface MaintenanceRecord {
  id: string;
  date: Date;
  mileage: number;
  type: MaintenanceType;
  description: string;
  cost: number;
  parts: string[];
  labor: number; // hours
  shop?: string;
  technician?: string;
  receipt?: string;
  nextDue?: {
    mileage: number;
    date: Date;
  };
}

export type MaintenanceType = 
  | 'oil_change'
  | 'tire_rotation'
  | 'brake_service'
  | 'transmission_service'
  | 'coolant_flush'
  | 'tune_up'
  | 'inspection'
  | 'repair'
  | 'upgrade';

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  coverage: string[];
  premium: number;
  deductible: number;
  expirationDate: Date;
}

export interface RegistrationInfo {
  state: string;
  plateNumber: string;
  expirationDate: Date;
  registrationNumber?: string;
}

export interface WarrantyInfo {
  provider: string;
  type: 'manufacturer' | 'extended' | 'aftermarket';
  coverage: string;
  startDate: Date;
  endDate: Date;
  mileageLimit?: number;
}