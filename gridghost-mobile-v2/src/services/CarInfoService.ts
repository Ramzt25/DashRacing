import { ApiService } from './ApiService';

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

export interface CarTrim {
  name: string;
  specs: CarSpecs;
  year: number;
  msrp?: number;
}

export interface CarMod {
  id: string;
  name: string;
  category: 'Engine' | 'Exhaust' | 'Intake' | 'Turbo' | 'Suspension' | 'Brakes' | 'Tires' | 'Aero' | 'ECU' | 'Other';
  description: string;
  estimatedHpGain: number;
  estimatedTorqueGain: number;
  estimatedWeightChange: number;
  cost?: number;
  brand?: string;
}

export interface CarLookupParams {
  make: string;
  model: string;
  year: number;
  trim?: string;
}

export interface CarColor {
  name: string;
  hex: string;
  metallic?: boolean;
  premium?: boolean;
}

// Common car colors
export const COMMON_CAR_COLORS: CarColor[] = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Silver', hex: '#C0C0C0', metallic: true },
  { name: 'Gray', hex: '#808080' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Green', hex: '#008000' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Brown', hex: '#8B4513' },
  { name: 'Gold', hex: '#FFD700', metallic: true },
  { name: 'Pearl White', hex: '#F8F8FF', premium: true },
  { name: 'Midnight Blue', hex: '#191970', premium: true },
  { name: 'Racing Red', hex: '#DC143C', premium: true },
];

// Popular modification categories
export const MOD_CATEGORIES = [
  'Engine',
  'Exhaust', 
  'Intake',
  'Turbo',
  'Suspension',
  'Brakes',
  'Tires',
  'Aero',
  'ECU',
  'Other'
] as const;

export class CarInfoService {
  // Database-backed car lookup with AI assistance
  static async lookupCarSpecs(params: CarLookupParams): Promise<CarSpecs | null> {
    try {
      // First try to get from database
      const response = await ApiService.getVehicles() as { vehicles?: any[] };
      const existingCar = response.vehicles?.find((v: any) => 
        v.make?.toLowerCase() === params.make.toLowerCase() &&
        v.model?.toLowerCase() === params.model.toLowerCase() &&
        v.year === params.year
      );

      if (existingCar && existingCar.baseSpecs) {
        return existingCar.baseSpecs;
      }

      // If not in database, use AI to get specs
      return await this.getSpecsFromAI(params);
    } catch (error) {
      console.error('Error looking up car specs:', error);
      return this.getFallbackSpecs(params);
    }
  }

  // AI-powered car specs lookup
  private static async getSpecsFromAI(params: CarLookupParams): Promise<CarSpecs> {
    // This would call an AI service or automotive database API
    // For now, return realistic mock data based on car characteristics
    const { make, model, year } = params;
    
    // Mock AI estimation based on make/model patterns
    let baseHp = 200;
    let baseTorque = 200;
    let topSpeed = 140;
    let acceleration = 6.5;
    let weight = 3200;
    let engineType = 'V6';
    let transmission = 'Automatic';
    let drivetrain = 'RWD';
    let fuelType = 'Gasoline';

    // Adjust based on make characteristics
    if (make.toLowerCase().includes('ferrari') || make.toLowerCase().includes('lamborghini')) {
      baseHp = 500 + Math.random() * 200;
      topSpeed = 180 + Math.random() * 30;
      acceleration = 3.0 + Math.random() * 1.5;
      engineType = 'V12';
      weight = 3000;
    } else if (make.toLowerCase().includes('porsche')) {
      baseHp = 350 + Math.random() * 150;
      topSpeed = 160 + Math.random() * 25;
      acceleration = 3.5 + Math.random() * 1.0;
      engineType = 'Flat-6';
      drivetrain = 'AWD';
    } else if (make.toLowerCase().includes('bmw') || make.toLowerCase().includes('mercedes')) {
      baseHp = 250 + Math.random() * 100;
      topSpeed = 150 + Math.random() * 20;
      acceleration = 4.5 + Math.random() * 1.5;
      engineType = 'Inline-6';
    } else if (make.toLowerCase().includes('honda') || make.toLowerCase().includes('toyota')) {
      baseHp = 180 + Math.random() * 80;
      topSpeed = 130 + Math.random() * 15;
      acceleration = 6.0 + Math.random() * 2.0;
      engineType = 'Inline-4';
      drivetrain = 'FWD';
    }

    // Adjust for year (newer cars generally more powerful)
    const yearFactor = Math.max(0.8, Math.min(1.2, (year - 2000) / 25));
    baseHp *= yearFactor;
    baseTorque = baseHp * 0.9; // Rough torque estimation

    return {
      hp: Math.round(baseHp),
      torque: Math.round(baseTorque),
      topSpeed: Math.round(topSpeed),
      acceleration: Math.round(acceleration * 10) / 10,
      weight: Math.round(weight),
      engineType,
      transmission,
      drivetrain,
      fuelType
    };
  }

  // Fallback specs if API fails
  private static getFallbackSpecs(params: CarLookupParams): CarSpecs {
    return {
      hp: 200,
      torque: 180,
      topSpeed: 140,
      acceleration: 6.5,
      weight: 3200,
      engineType: 'V6',
      transmission: 'Automatic',
      drivetrain: 'RWD',
      fuelType: 'Gasoline'
    };
  }

  // Get available trims for a car
  static async getAvailableTrims(make: string, model: string, year: number): Promise<CarTrim[]> {
    try {
      // This would query a comprehensive automotive database
      // For now, return mock trims
      const baseSpecs = await this.lookupCarSpecs({ make, model, year });
      if (!baseSpecs) return [];

      return [
        {
          name: 'Base',
          specs: baseSpecs,
          year
        },
        {
          name: 'Sport',
          specs: {
            ...baseSpecs,
            hp: baseSpecs.hp + 30,
            torque: baseSpecs.torque + 25,
            acceleration: baseSpecs.acceleration - 0.5
          },
          year
        },
        {
          name: 'Performance',
          specs: {
            ...baseSpecs,
            hp: baseSpecs.hp + 60,
            torque: baseSpecs.torque + 50,
            acceleration: baseSpecs.acceleration - 1.0,
            topSpeed: baseSpecs.topSpeed + 15
          },
          year
        }
      ];
    } catch (error) {
      console.error('Error getting trims:', error);
      return [];
    }
  }

  // AI-powered modification performance estimation
  static async estimateModPerformance(carSpecs: CarSpecs, modification: Partial<CarMod>): Promise<{
    hpGain: number;
    torqueGain: number;
    weightChange: number;
    confidence: number;
    reasoning: string;
  }> {
    try {
      const result = await ApiService.estimateModPerformance(carSpecs, modification);
      return {
        hpGain: result.estimatedHpGain,
        torqueGain: result.estimatedTorqueGain,
        weightChange: result.estimatedWeightChange,
        confidence: result.confidence,
        reasoning: result.reasoning
      };
    } catch (error) {
      console.error('Error estimating mod performance:', error);
      
      // Fallback estimation
      const category = modification.category || 'Other';
      const baseHpGain = category === 'Engine' ? 25 :
                        category === 'Turbo' ? 50 :
                        category === 'Exhaust' ? 15 :
                        category === 'Intake' ? 10 : 5;
      
      return {
        hpGain: baseHpGain,
        torqueGain: Math.round(baseHpGain * 0.8),
        weightChange: category === 'Aero' ? 15 : category === 'Brakes' ? -5 : 0,
        confidence: 0.7,
        reasoning: 'Estimated based on typical performance gains for this modification category.'
      };
    }
  }

  // Generate car image with AI fallback
  static async generateCarImage(make: string, model: string, year: number, color: string): Promise<{
    imageUrl: string;
    isAIGenerated: boolean;
  }> {
    try {
      return await ApiService.generateCarImage(make, model, year, color);
    } catch (error) {
      console.error('Error generating car image:', error);
      return {
        imageUrl: `https://via.placeholder.com/400x300/333333/FFFFFF?text=${make}+${model}+${year}`,
        isAIGenerated: true
      };
    }
  }
}