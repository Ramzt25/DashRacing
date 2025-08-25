import { Car, Mod, RaceResult } from '../types/database';

interface CarSpecs {
  horsepower: number;
  torque: number;
  weight: number;
  drivetrain: string;
  engineType: string;
  displacement: number;
}

interface ModEffect {
  powerGain: number;
  torqueGain: number;
  weightChange: number;
  reliabilityImpact: number;
  compatibilityScore: number;
  performanceGain: number;
  confidence: number;
}

interface PerformanceComparison {
  winProbability: number;
  expectedLapTime: number;
  strengthAreas: string[];
  weaknessAreas: string[];
  recommendations: string[];
}

interface UpgradeRecommendation {
  modId: string;
  name: string;
  category: string;
  brand: string;
  expectedGain: number;
  costEffectiveness: number;
  priority: 'low' | 'medium' | 'high';
  reasoning: string;
  marketPrice: number;
  availability: string;
}

export class AIPerformanceService {
  private static readonly API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
  
  /**
   * AI-powered car performance analysis
   */
  static async analyzeCarPerformance(car: Car, mods: Mod[]): Promise<{
    currentPower: number;
    currentTorque: number;
    currentWeight: number;
    performanceScore: number;
    improvementPotential: number;
  }> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/ai/analyze-performance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ car, mods }),
      });
      
      if (!response.ok) {
        throw new Error('AI analysis failed');
      }
      
      return await response.json() as {
        currentPower: number;
        currentTorque: number;
        currentWeight: number;
        performanceScore: number;
        improvementPotential: number;
      };
    } catch (error) {
      console.error('AI Performance analysis error:', error);
      // Fallback to local estimation
      return this.estimatePerformanceLocally(car, mods);
    }
  }
  
  /**
   * Compare two cars and predict race outcome
   */
  static async compareVehicles(car1: Car, car2: Car, raceType: string = 'drag'): Promise<PerformanceComparison> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/ai/compare-vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ car1, car2, raceType }),
      });
      
      if (!response.ok) {
        throw new Error('Vehicle comparison failed');
      }
      
      return await response.json() as PerformanceComparison;
    } catch (error) {
      console.error('AI Comparison error:', error);
      return this.compareVehiclesLocally(car1, car2, raceType);
    }
  }
  
  /**
   * Get AI-powered upgrade recommendations
   */
  static async getUpgradeRecommendations(car: Car, budget: number = 5000): Promise<UpgradeRecommendation[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/ai/upgrade-recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ car, budget }),
      });
      
      if (!response.ok) {
        throw new Error('Upgrade recommendations failed');
      }
      
      return await response.json() as UpgradeRecommendation[];
    } catch (error) {
      console.error('AI Upgrade recommendations error:', error);
      return this.getUpgradeRecommendationsLocally(car, budget);
    }
  }
  
  /**
   * Analyze mod effects using AI
   */
  static async analyzeModEffects(car: Car, mod: Partial<Mod>): Promise<ModEffect> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/ai/analyze-mod`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ car, mod }),
      });
      
      if (!response.ok) {
        throw new Error('Mod analysis failed');
      }
      
      return await response.json() as ModEffect;
    } catch (error) {
      console.error('AI Mod analysis error:', error);
      return this.analyzeModEffectsLocally(car, mod);
    }
  }
  
  /**
   * Predict race performance based on historical data
   */
  static async predictRacePerformance(
    car: Car, 
    raceType: string, 
    historicalResults: RaceResult[]
  ): Promise<{
    expectedTime: number;
    confidenceInterval: [number, number];
    winProbability: number;
    improvementTips: string[];
  }> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/ai/predict-performance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ car, raceType, historicalResults }),
      });
      
      if (!response.ok) {
        throw new Error('Performance prediction failed');
      }
      
      return await response.json() as {
        expectedTime: number;
        confidenceInterval: [number, number];
        winProbability: number;
        improvementTips: string[];
      };
    } catch (error) {
      console.error('AI Performance prediction error:', error);
      return this.predictRacePerformanceLocally(car, raceType, historicalResults);
    }
  }
  
  // ===== LOCAL FALLBACK METHODS =====
  
  private static estimatePerformanceLocally(car: Car, mods: Mod[]): {
    currentPower: number;
    currentTorque: number;
    currentWeight: number;
    performanceScore: number;
    improvementPotential: number;
  } {
    // AI-inspired local algorithms
    const basePower = car.basePower || this.estimateBasePower(car);
    const baseTorque = car.baseTorque || this.estimateBaseTorque(car);
    const baseWeight = car.baseWeight || this.estimateBaseWeight(car);
    
    let totalPowerGain = 0;
    let totalTorqueGain = 0;
    let totalWeightChange = 0;
    
    mods.forEach(mod => {
      const modEffect = this.estimateModEffectLocally(car, mod);
      totalPowerGain += modEffect.powerGain;
      totalTorqueGain += modEffect.torqueGain;
      totalWeightChange += modEffect.weightChange;
    });
    
    const currentPower = basePower + totalPowerGain;
    const currentTorque = baseTorque + totalTorqueGain;
    const currentWeight = baseWeight + totalWeightChange;
    
    // Power-to-weight ratio based performance score
    const powerToWeight = currentPower / (currentWeight / 1000); // HP per kg
    const performanceScore = Math.min(100, powerToWeight * 0.5); // Normalize to 0-100
    
    // Calculate improvement potential
    const maxRealisticPower = basePower * 1.8; // 80% increase is aggressive but possible
    const improvementPotential = Math.max(0, (maxRealisticPower - currentPower) / maxRealisticPower * 100);
    
    return {
      currentPower,
      currentTorque,
      currentWeight,
      performanceScore,
      improvementPotential,
    };
  }
  
  private static compareVehiclesLocally(car1: Car, car2: Car, raceType: string): PerformanceComparison {
    const car1Power = car1.currentPower || car1.basePower || this.estimateBasePower(car1);
    const car1Weight = car1.currentWeight || car1.baseWeight || this.estimateBaseWeight(car1);
    const car2Power = car2.currentPower || car2.basePower || this.estimateBasePower(car2);
    const car2Weight = car2.currentWeight || car2.baseWeight || this.estimateBaseWeight(car2);
    
    const car1PowerToWeight = car1Power / (car1Weight / 1000);
    const car2PowerToWeight = car2Power / (car2Weight / 1000);
    
    // Simple win probability based on power-to-weight ratio
    const ratio = car1PowerToWeight / car2PowerToWeight;
    const winProbability = Math.max(0.1, Math.min(0.9, 0.5 + (ratio - 1) * 0.3));
    
    // Expected lap time difference (simplified)
    const baseTime = 60; // 60 second base lap time
    const car1ExpectedTime = baseTime / (car1PowerToWeight / 100);
    
    return {
      winProbability,
      expectedLapTime: car1ExpectedTime,
      strengthAreas: car1PowerToWeight > car2PowerToWeight ? ['Power advantage', 'Acceleration'] : ['Handling', 'Consistency'],
      weaknessAreas: car1PowerToWeight < car2PowerToWeight ? ['Power deficit', 'Top speed'] : ['Weight', 'Efficiency'],
      recommendations: [
        'Consider aerodynamic upgrades for better high-speed performance',
        'Weight reduction modifications could improve overall lap times',
        'Engine tuning may provide additional power gains',
      ],
    };
  }
  
  private static getUpgradeRecommendationsLocally(car: Car, budget: number): UpgradeRecommendation[] {
    const recommendations: UpgradeRecommendation[] = [];
    
    // Engine upgrades
    if (budget >= 1500) {
      recommendations.push({
        modId: 'cold-air-intake',
        name: 'Cold Air Intake System',
        category: 'Engine',
        brand: 'K&N',
        expectedGain: 15, // HP
        costEffectiveness: 8.5,
        priority: 'high',
        reasoning: 'Excellent price-to-performance ratio, easy installation',
        marketPrice: 250,
        availability: 'In Stock',
      });
    }
    
    if (budget >= 3000) {
      recommendations.push({
        modId: 'turbo-upgrade',
        name: 'Turbocharger Upgrade',
        category: 'Forced Induction',
        brand: 'Garrett',
        expectedGain: 80,
        costEffectiveness: 9.2,
        priority: 'high',
        reasoning: 'Significant power gains for forced induction vehicles',
        marketPrice: 2800,
        availability: 'In Stock',
      });
    }
    
    // Exhaust upgrades
    if (budget >= 800) {
      recommendations.push({
        modId: 'cat-back-exhaust',
        name: 'Cat-Back Exhaust System',
        category: 'Exhaust',
        brand: 'Borla',
        expectedGain: 12,
        costEffectiveness: 7.8,
        priority: 'medium',
        reasoning: 'Improves exhaust flow and sound, moderate power gains',
        marketPrice: 750,
        availability: 'In Stock',
      });
    }
    
    return recommendations.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      return (priorityWeight[b.priority] * b.costEffectiveness) - 
             (priorityWeight[a.priority] * a.costEffectiveness);
    });
  }
  
  private static analyzeModEffectsLocally(car: Car, mod: Partial<Mod>): ModEffect {
    return this.estimateModEffectLocally(car, mod as Mod);
  }
  
  private static estimateModEffectLocally(car: Car, mod: Mod): ModEffect {
    let powerGain = 0;
    let torqueGain = 0;
    let weightChange = 0;
    let reliabilityImpact = 0.95; // Default high reliability
    
    // Category-based estimates
    switch (mod.category.toLowerCase()) {
      case 'engine':
        if (mod.name.toLowerCase().includes('intake')) {
          powerGain = 10 + Math.random() * 10;
          torqueGain = 8 + Math.random() * 8;
        } else if (mod.name.toLowerCase().includes('turbo')) {
          powerGain = 50 + Math.random() * 50;
          torqueGain = 60 + Math.random() * 40;
          reliabilityImpact = 0.85;
        }
        break;
      case 'exhaust':
        powerGain = 5 + Math.random() * 15;
        torqueGain = 8 + Math.random() * 12;
        weightChange = -10 + Math.random() * -5; // Lighter
        break;
      case 'suspension':
        powerGain = 0;
        torqueGain = 0;
        weightChange = 5 + Math.random() * 15; // Heavier
        break;
      case 'weight reduction':
        weightChange = -20 + Math.random() * -30;
        break;
    }
    
    const performanceGain = (powerGain * 0.7 + torqueGain * 0.3) / 
                           ((car.basePower || this.estimateBasePower(car)) * 0.01);
    
    return {
      powerGain,
      torqueGain,
      weightChange,
      reliabilityImpact,
      compatibilityScore: 0.9 + Math.random() * 0.1, // High compatibility by default
      performanceGain,
      confidence: 0.75 + Math.random() * 0.2, // 75-95% confidence
    };
  }
  
  private static predictRacePerformanceLocally(
    car: Car, 
    raceType: string, 
    historicalResults: RaceResult[]
  ): {
    expectedTime: number;
    confidenceInterval: [number, number];
    winProbability: number;
    improvementTips: string[];
  } {
    const avgTime = historicalResults.length > 0 
      ? historicalResults.reduce((sum, r) => sum + (r.timeElapsed || 60), 0) / historicalResults.length
      : 60;
    
    const improvement = Math.random() * 0.1 - 0.05; // ±5% variation
    const expectedTime = avgTime * (1 + improvement);
    
    return {
      expectedTime,
      confidenceInterval: [expectedTime * 0.95, expectedTime * 1.05],
      winProbability: 0.3 + Math.random() * 0.4, // 30-70%
      improvementTips: [
        'Focus on consistent launch technique',
        'Practice shift timing for optimal acceleration',
        'Consider weight reduction modifications',
        'Improve reaction time at the start line',
      ],
    };
  }
  
  // Helper methods for base estimates
  private static estimateBasePower(car: Car): number {
    const makeMultipliers: { [key: string]: number } = {
      'bmw': 250, 'mercedes': 280, 'audi': 260, 'porsche': 350,
      'ferrari': 450, 'lamborghini': 500, 'mclaren': 600,
      'toyota': 200, 'honda': 180, 'nissan': 220, 'mazda': 160,
      'ford': 230, 'chevrolet': 300, 'dodge': 350,
    };
    
    const basePower = makeMultipliers[car.make.toLowerCase()] || 200;
    const yearMultiplier = Math.max(0.8, Math.min(1.3, (car.year - 1990) / 30));
    
    return Math.round(basePower * yearMultiplier);
  }
  
  private static estimateBaseTorque(car: Car): number {
    return this.estimateBasePower(car) * 1.2; // Rough torque estimate
  }
  
  private static estimateBaseWeight(car: Car): number {
    const classWeights: { [key: string]: number } = {
      'compact': 1200, 'sedan': 1500, 'suv': 2000,
      'sports': 1400, 'luxury': 1800, 'truck': 2500,
    };
    
    return classWeights[car.class.toLowerCase()] || 1500;
  }
}