export interface Vehicle {
  id: string;
  userId: string;
  vin?: string;
  make: string;
  model: string;
  year: number;
  trim?: string;
  specs?: VehicleSpecs;
  photos: string[];
  modPlan?: ModificationPlan;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleSpecs {
  engine?: {
    type: string;
    displacement: number;
    cylinders: number;
    horsepower?: number;
    torque?: number;
  };
  transmission?: {
    type: 'manual' | 'automatic' | 'cvt';
    speeds: number;
  };
  drivetrain?: 'fwd' | 'rwd' | 'awd' | '4wd';
  weight?: number;
  options?: string[];
}

export interface ModificationPlan {
  id: string;
  vehicleId: string;
  modifications: Modification[];
  totalEstimatedCost: number;
  estimatedTimeframe: string;
  createdAt: string;
  updatedAt: string;
}

export interface Modification {
  id: string;
  category: 'performance' | 'handling' | 'braking' | 'aesthetics';
  name: string;
  description: string;
  estimatedCost: number;
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Expert';
  priority: 'High' | 'Medium' | 'Low';
  compatibility: 'Direct fit' | 'Minor modifications' | 'Major modifications';
  reliability: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  installTime: string;
  requiredTools: string[];
  performanceGain?: {
    acceleration?: string;
    topSpeed?: string;
    throttleResponse?: string;
  };
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleAICache {
  id: string;
  key: string; // vin:1HGCM82633A004352 or mmy:subaru:wrx:2019:us
  provider: string;
  payload: any;
  createdAt: string;
}