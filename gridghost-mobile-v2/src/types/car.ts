export interface CarColor {
  name: string;
  hex: string;
  metallic?: boolean;
  premium?: boolean;
}

export interface CarMod {
  id: string;
  name: string;
  category: 'Engine' | 'Exhaust' | 'Intake' | 'Turbo' | 'Suspension' | 'Brakes' | 'Tires' | 'Aero' | 'ECU' | 'Other';
  description: string;
  hpGain: number;
  torqueGain: number;
  weightChange: number; // positive for added weight, negative for weight reduction
  cost?: number;
  brand?: string;
  dateAdded: string;
}

export interface CarSpecs {
  hp: number;
  torque: number;
  topSpeed: number;
  acceleration: number; // 0-60 mph
  weight: number;
  engineType: string;
  transmission: string;
  drivetrain: string;
  fuelType: string;
}

export interface Car {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  trim?: string;
  color: string;
  class: 'Sports' | 'Super' | 'Hyper' | 'Luxury' | 'Muscle' | 'JDM' | 'Euro' | 'Classic' | 'Exotic';
  owned: boolean;
  
  // Base specifications (stock)
  baseSpecs: CarSpecs;
  
  // Current specifications (including mods)
  currentSpecs: CarSpecs;
  
  // Modifications
  mods: CarMod[];
  
  // Images
  images: string[]; // URLs or base64 strings
  primaryImageIndex: number;
  
  // AI-generated if no custom image
  hasAIGeneratedImage: boolean;
  
  // Metadata
  dateAdded: string;
  lastModified: string;
}

export interface CarTemplate {
  make: string;
  model: string;
  year: number;
  trim?: string;
  baseSpecs: CarSpecs;
  class: Car['class'];
  defaultColor: string;
}

export interface ModTemplate {
  name: string;
  category: CarMod['category'];
  description: string;
  estimatedHpGain: number;
  estimatedTorqueGain: number;
  estimatedWeightChange: number;
  cost?: number;
  compatibleMakes?: string[];
}