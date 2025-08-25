// Week 7 - Advanced Vehicle Customization Service
// Visual mods, performance tuning, and garage enhancements

interface VehicleCustomization {
  vehicleId: string;
  ownerId: string;
  
  // Visual Customizations
  visual: {
    paintJob: {
      primaryColor: string;
      secondaryColor?: string;
      paintType: 'solid' | 'metallic' | 'pearlescent' | 'matte' | 'chrome';
      finish: 'gloss' | 'matte' | 'satin';
    };
    
    decals: Array<{
      id: string;
      type: 'racing_stripe' | 'flame' | 'tribal' | 'carbon_fiber' | 'sponsor' | 'custom';
      position: 'hood' | 'side' | 'roof' | 'rear' | 'door';
      color: string;
      opacity: number; // 0-1
      size: 'small' | 'medium' | 'large';
    }>;
    
    wheels: {
      brand: string;
      model: string;
      size: number; // inches
      width: number; // mm
      color: string;
      finish: 'chrome' | 'black' | 'gunmetal' | 'bronze' | 'white';
    };
    
    bodyKit: {
      frontBumper?: string;
      rearBumper?: string;
      sideskirts?: string;
      spoiler?: string;
      hood?: string;
      fenders?: string;
    };
    
    lighting: {
      headlights: 'stock' | 'hid' | 'led' | 'angel_eyes';
      taillights: 'stock' | 'led' | 'smoked' | 'clear';
      underglow?: {
        enabled: boolean;
        color: string;
        pattern: 'solid' | 'breathing' | 'rainbow' | 'strobe';
      };
    };
    
    interior: {
      seatColor: string;
      dashColor: string;
      accentColor: string;
      steeringWheel: 'stock' | 'sport' | 'racing';
      shifter: 'stock' | 'short_throw' | 'custom';
    };
  };
  
  // Performance Modifications
  performance: {
    engine: {
      airIntake: 'stock' | 'cold_air' | 'ram_air' | 'turbo';
      exhaust: 'stock' | 'cat_back' | 'axle_back' | 'turbo_back';
      tuning: 'stock' | 'stage_1' | 'stage_2' | 'stage_3' | 'custom';
      internals: 'stock' | 'forged_pistons' | 'full_build';
      forced_induction?: {
        type: 'turbo' | 'supercharger' | 'twin_turbo';
        boost: number; // PSI
      };
      
      // Performance gains
      horsepowerGain: number;
      torqueGain: number;
      efficiencyLoss: number; // 0-1 (reliability trade-off)
    };
    
    drivetrain: {
      transmission: 'stock' | 'short_gear' | 'racing';
      differential: 'stock' | 'limited_slip' | 'welded';
      clutch: 'stock' | 'stage_1' | 'stage_2' | 'stage_3';
      
      // Performance effects
      accelerationBonus: number; // 0-1
      topSpeedBonus: number; // 0-1
    };
    
    suspension: {
      type: 'stock' | 'lowering_springs' | 'coilovers' | 'air_ride';
      height: number; // mm from stock
      stiffness: number; // 1-10
      camber: number; // degrees
      
      // Handling effects
      corneringBonus: number; // 0-1
      stabilityBonus: number; // 0-1
    };
    
    brakes: {
      pads: 'stock' | 'ceramic' | 'carbon' | 'racing';
      rotors: 'stock' | 'slotted' | 'drilled' | 'carbon_ceramic';
      calipers: 'stock' | 'multi_piston' | 'racing';
      
      // Braking performance
      stoppingPowerBonus: number; // 0-1
      fadeResistanceBonus: number; // 0-1
    };
    
    tires: {
      compound: 'street' | 'sport' | 'track' | 'drag' | 'drift';
      brand: string;
      model: string;
      width: number; // mm
      profile: number; // %
      
      // Tire performance
      gripBonus: number; // 0-1
      durabilityLoss: number; // 0-1
    };
  };
  
  // Total vehicle stats after modifications
  finalStats: {
    horsepower: number;
    torque: number;
    weight: number; // kg
    acceleration: number; // 0-60 mph time
    topSpeed: number; // mph
    handling: number; // 1-10 scale
    braking: number; // 1-10 scale
    reliability: number; // 1-10 scale
    
    // Racing categories
    dragRating: number; // 1-10
    circuitRating: number; // 1-10
    driftRating: number; // 1-10
    streetRating: number; // 1-10
  };
  
  // Customization metadata
  createdAt: Date;
  lastModified: Date;
  totalCost: number; // Total spent on modifications
  popularityRating: number; // How many likes/views from other users
  isPublic: boolean; // Whether other users can view this build
}

interface ModificationCatalog {
  category: 'visual' | 'performance';
  subcategory: string;
  items: Array<{
    id: string;
    name: string;
    description: string;
    brand: string;
    price: number;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    performanceGains?: {
      horsepower?: number;
      torque?: number;
      weight?: number;
      handling?: number;
      reliability?: number;
    };
    visualPreview?: string; // Image URL
    compatibleVehicles?: string[]; // Vehicle IDs
    requirements?: string[]; // Prerequisites
    unlockConditions?: {
      level?: number;
      achievements?: string[];
      races_won?: number;
    };
  }>;
}

class AdvancedVehicleCustomizationService {
  private static apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';
  private static modificationCache: Map<string, ModificationCatalog> = new Map();

  // Get vehicle customization data
  static async getVehicleCustomization(vehicleId: string): Promise<VehicleCustomization | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/vehicles/${vehicleId}/customization`);
      if (!response.ok) return null;
      
      return await response.json() as VehicleCustomization;
    } catch (error) {
      console.error('Failed to get vehicle customization:', error);
      return null;
    }
  }

  // Save vehicle customization
  static async saveVehicleCustomization(customization: VehicleCustomization): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/vehicles/${customization.vehicleId}/customization`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add auth header
        },
        body: JSON.stringify(customization),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to save vehicle customization:', error);
      return false;
    }
  }

  // Get modification catalog
  static async getModificationCatalog(category?: string): Promise<ModificationCatalog[]> {
    try {
      const url = category 
        ? `${this.apiBaseUrl}/modifications/catalog?category=${category}`
        : `${this.apiBaseUrl}/modifications/catalog`;
        
      const response = await fetch(url);
      if (!response.ok) return [];
      
      return await response.json() as ModificationCatalog[];
    } catch (error) {
      console.error('Failed to get modification catalog:', error);
      return this.getMockModificationCatalog();
    }
  }

  // Apply modification to vehicle
  static async applyModification(vehicleId: string, modificationId: string): Promise<VehicleCustomization | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/vehicles/${vehicleId}/modifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add auth header
        },
        body: JSON.stringify({ modificationId }),
      });

      if (!response.ok) return null;
      return await response.json() as VehicleCustomization;
    } catch (error) {
      console.error('Failed to apply modification:', error);
      return null;
    }
  }

  // Calculate performance impact of modifications
  static calculatePerformanceImpact(baseStats: any, modifications: VehicleCustomization['performance']): VehicleCustomization['finalStats'] {
    let horsepower = baseStats.horsepower;
    let torque = baseStats.torque;
    let weight = baseStats.weight;
    let reliability = 10; // Start at max reliability

    // Engine modifications
    horsepower += modifications.engine.horsepowerGain;
    torque += modifications.engine.torqueGain;
    reliability -= modifications.engine.efficiencyLoss * 3; // Reliability trade-off

    // Weight modifications (body kit, wheels, etc.)
    // TODO: Calculate weight changes based on parts

    // Calculate derived stats
    const powerToWeight = horsepower / (weight / 1000); // HP per ton
    const acceleration = Math.max(2.5, 14 - (powerToWeight * 0.15)); // 0-60 time
    const topSpeed = Math.min(300, 100 + (horsepower * 0.3)); // Top speed estimate

    // Handling calculation
    const handling = Math.min(10, 
      5 + 
      (modifications.suspension.corneringBonus * 2) + 
      (modifications.tires.gripBonus * 2) +
      (modifications.suspension.stabilityBonus * 1)
    );

    // Braking calculation
    const braking = Math.min(10,
      5 +
      (modifications.brakes.stoppingPowerBonus * 3) +
      (modifications.brakes.fadeResistanceBonus * 2)
    );

    // Racing category ratings
    const dragRating = Math.min(10, (horsepower / 100) + (modifications.drivetrain.accelerationBonus * 3));
    const circuitRating = Math.min(10, (handling * 0.4) + (braking * 0.3) + (powerToWeight * 0.3));
    const driftRating = Math.min(10, (horsepower / 100) + (modifications.tires.gripBonus < 0.7 ? 3 : 0) + 2);
    const streetRating = Math.min(10, (reliability * 0.4) + (horsepower / 150) + (handling * 0.3));

    return {
      horsepower: Math.round(horsepower),
      torque: Math.round(torque),
      weight: Math.round(weight),
      acceleration: Math.round(acceleration * 10) / 10,
      topSpeed: Math.round(topSpeed),
      handling: Math.round(handling * 10) / 10,
      braking: Math.round(braking * 10) / 10,
      reliability: Math.max(1, Math.round(reliability * 10) / 10),
      dragRating: Math.round(dragRating * 10) / 10,
      circuitRating: Math.round(circuitRating * 10) / 10,
      driftRating: Math.round(driftRating * 10) / 10,
      streetRating: Math.round(streetRating * 10) / 10,
    };
  }

  // Generate 3D preview of customized vehicle
  static async generateVehiclePreview(customization: VehicleCustomization): Promise<string | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/vehicles/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicleId: customization.vehicleId,
          visual: customization.visual,
        }),
      });

      if (!response.ok) return null;
      const result = await response.json() as { previewUrl: string };
      return result.previewUrl;
    } catch (error) {
      console.error('Failed to generate vehicle preview:', error);
      // Return placeholder image
      return `https://via.placeholder.com/400x300/333/fff?text=Custom+${customization.vehicleId}`;
    }
  }

  // Get popular customizations for inspiration
  static async getPopularCustomizations(vehicleModel?: string): Promise<VehicleCustomization[]> {
    try {
      const url = vehicleModel 
        ? `${this.apiBaseUrl}/customizations/popular?vehicle=${vehicleModel}`
        : `${this.apiBaseUrl}/customizations/popular`;
        
      const response = await fetch(url);
      if (!response.ok) return [];
      
      return await response.json() as VehicleCustomization[];
    } catch (error) {
      console.error('Failed to get popular customizations:', error);
      return [];
    }
  }

  // Share customization with community
  static async shareCustomization(vehicleId: string, isPublic: boolean = true): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/vehicles/${vehicleId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add auth header
        },
        body: JSON.stringify({ isPublic }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to share customization:', error);
      return false;
    }
  }

  // Mock modification catalog for development
  private static getMockModificationCatalog(): ModificationCatalog[] {
    return [
      {
        category: 'performance',
        subcategory: 'engine',
        items: [
          {
            id: 'cold_air_intake_001',
            name: 'K&N Cold Air Intake',
            description: 'High-flow cold air intake system for improved airflow and power',
            brand: 'K&N',
            price: 350,
            rarity: 'common',
            performanceGains: { horsepower: 15, torque: 10 },
          },
          {
            id: 'turbo_kit_001',
            name: 'Garrett GT2860RS Turbo Kit',
            description: 'Complete turbo kit with all supporting modifications',
            brand: 'Garrett',
            price: 4500,
            rarity: 'epic',
            performanceGains: { horsepower: 150, torque: 120, reliability: -2 },
          },
        ],
      },
      {
        category: 'visual',
        subcategory: 'paint',
        items: [
          {
            id: 'paint_chrome_001',
            name: 'Chrome Finish',
            description: 'Ultra-reflective chrome paint finish',
            brand: 'Auto Paint Pro',
            price: 1200,
            rarity: 'rare',
          },
          {
            id: 'paint_matte_black_001',
            name: 'Matte Black',
            description: 'Deep matte black finish with protective coating',
            brand: 'Elite Paint',
            price: 800,
            rarity: 'common',
          },
        ],
      },
    ];
  }
}

export default AdvancedVehicleCustomizationService;
export type { VehicleCustomization, ModificationCatalog };