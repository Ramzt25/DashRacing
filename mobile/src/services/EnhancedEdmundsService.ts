/**
 * Enhanced Edmunds API Service - Week 5 External API UI Integration
 * Connects mobile app to both backend EdmundsApiService and direct API calls
 */

import { apiRequest, API_CONFIG } from '../config/api';
import { EdmundsApiService, EdmundsVehicleData, VehicleSearchResult } from './EdmundsApiService';

export interface VehicleSearchParams {
  query?: string;
  make?: string;
  model?: string;
  year?: number;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  category?: VehicleCategory;
  bodyType?: BodyType;
}

export interface EnhancedVehicleData extends EdmundsVehicleData {
  // Additional data from backend integration
  backendData?: {
    id: string;
    userRating?: number;
    reviewCount?: number;
    popularityScore?: number;
    marketTrends?: {
      priceDirection: 'up' | 'down' | 'stable';
      demandLevel: 'low' | 'medium' | 'high';
      inventoryLevel: 'low' | 'medium' | 'high';
    };
    recommendations?: {
      alternatives: string[];
      upgrades: string[];
      accessories: string[];
    };
  };
  
  // Performance analysis
  performanceData?: {
    trackRating: number;
    streetRating: number;
    modificationPotential: number;
    maintenanceCost: 'low' | 'medium' | 'high';
    reliabilityScore: number;
  };
  
  // Pricing insights
  pricingInsights?: {
    currentMarketValue: number;
    projectedValue1Year: number;
    projectedValue3Year: number;
    costOfOwnership3Year: number;
    insuranceEstimate: number;
    maintenanceEstimate: number;
  };
}

export type VehicleCategory = 
  | 'Sports' 
  | 'Luxury' 
  | 'Electric' 
  | 'Truck' 
  | 'SUV' 
  | 'Sedan' 
  | 'Hatchback' 
  | 'Convertible' 
  | 'Coupe';

export type BodyType = 
  | 'Sedan' 
  | 'Coupe' 
  | 'Hatchback' 
  | 'SUV' 
  | 'Truck' 
  | 'Convertible' 
  | 'Wagon' 
  | 'Minivan';

export interface VehicleComparison {
  vehicles: EnhancedVehicleData[];
  analysis: {
    performance: {
      fastest: EnhancedVehicleData;
      mostPowerful: EnhancedVehicleData;
      bestFuelEconomy: EnhancedVehicleData;
    };
    value: {
      bestValue: EnhancedVehicleData;
      cheapest: EnhancedVehicleData;
      bestResale: EnhancedVehicleData;
    };
    practical: {
      mostReliable: EnhancedVehicleData;
      lowestMaintenance: EnhancedVehicleData;
      bestInsurance: EnhancedVehicleData;
    };
  };
  recommendation: {
    overall: EnhancedVehicleData;
    reasoning: string;
    tradeoffs: string[];
  };
}

export interface MarketInsights {
  trendingVehicles: Array<{
    vehicle: EnhancedVehicleData;
    trendScore: number;
    reason: string;
  }>;
  
  priceAlerts: Array<{
    vehicle: EnhancedVehicleData;
    currentPrice: number;
    targetPrice: number;
    alertType: 'price_drop' | 'good_deal' | 'market_change';
  }>;
  
  recommendations: Array<{
    vehicle: EnhancedVehicleData;
    matchScore: number;
    reasons: string[];
  }>;
}

export class EnhancedEdmundsService {
  /**
   * Search vehicles with enhanced filtering and backend integration
   */
  static async searchVehiclesAdvanced(params: VehicleSearchParams): Promise<VehicleSearchResult[]> {
    try {
      // Try backend integration first
      const backendResults = await this.searchVehiclesBackend(params);
      if (backendResults.length > 0) {
        return backendResults;
      }
    } catch (error) {
      console.warn('Backend vehicle search failed, falling back to direct API:', error);
    }
    
    // Fallback to direct Edmunds API
    return EdmundsApiService.searchVehicles(params.query || '');
  }

  /**
   * Get enhanced vehicle details with backend analysis
   */
  static async getEnhancedVehicleDetails(
    make: string, 
    model: string, 
    year: number
  ): Promise<EnhancedVehicleData> {
    try {
      // Get base vehicle data from Edmunds
      const edmundsData = await EdmundsApiService.getVehicleDetails(make, model, year);
      
      // Get enhanced data from backend
      const enhancedData = await this.getBackendVehicleAnalysis(make, model, year);
      
      return {
        ...edmundsData,
        ...enhancedData,
      };
    } catch (error) {
      console.warn('Enhanced vehicle details failed, using basic data:', error);
      return EdmundsApiService.getVehicleDetails(make, model, year);
    }
  }

  /**
   * Compare multiple vehicles with AI analysis
   */
  static async compareVehicles(
    vehicles: Array<{ make: string; model: string; year: number }>
  ): Promise<VehicleComparison> {
    try {
      // Get enhanced data for all vehicles
      const vehicleData = await Promise.all(
        vehicles.map(v => this.getEnhancedVehicleDetails(v.make, v.model, v.year))
      );

      // Get AI comparison analysis from backend
      const analysis = await apiRequest<any>('/ai/compare-vehicles', {
        method: 'POST',
        body: JSON.stringify({ vehicles: vehicleData }),
      });

      return {
        vehicles: vehicleData,
        analysis: this.processComparisonAnalysis(vehicleData, analysis),
        recommendation: this.generateRecommendation(vehicleData, analysis),
      };
    } catch (error) {
      console.warn('Vehicle comparison failed:', error);
      return this.fallbackComparison(vehicles);
    }
  }

  /**
   * Get market insights and trending vehicles
   */
  static async getMarketInsights(userPreferences?: {
    categories?: VehicleCategory[];
    priceRange?: { min: number; max: number };
    yearRange?: { min: number; max: number };
  }): Promise<MarketInsights> {
    try {
      return await apiRequest<MarketInsights>('/api/vehicles/market-insights', {
        method: 'POST',
        body: JSON.stringify({ preferences: userPreferences }),
      });
    } catch (error) {
      console.warn('Market insights failed, using mock data:', error);
      return this.getMockMarketInsights();
    }
  }

  /**
   * Get vehicle recommendations based on user profile and history
   */
  static async getPersonalizedRecommendations(userId: string): Promise<EnhancedVehicleData[]> {
    try {
      return await apiRequest<EnhancedVehicleData[]>(`/api/vehicles/recommendations/${userId}`);
    } catch (error) {
      console.warn('Personalized recommendations failed:', error);
      return this.getMockRecommendations();
    }
  }

  /**
   * Search vehicles through backend with enhanced filtering
   */
  private static async searchVehiclesBackend(params: VehicleSearchParams): Promise<VehicleSearchResult[]> {
    return apiRequest<VehicleSearchResult[]>('/api/vehicles/search', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Get backend vehicle analysis and market data
   */
  private static async getBackendVehicleAnalysis(
    make: string, 
    model: string, 
    year: number
  ): Promise<Partial<EnhancedVehicleData>> {
    try {
      return await apiRequest<Partial<EnhancedVehicleData>>('/api/vehicles/analysis', {
        method: 'POST',
        body: JSON.stringify({ make, model, year }),
      });
    } catch (error) {
      console.warn('Backend analysis failed, using estimates:', error);
      return this.estimateVehicleAnalysis(make, model, year);
    }
  }

  /**
   * Process AI comparison analysis
   */
  private static processComparisonAnalysis(
    vehicles: EnhancedVehicleData[], 
    analysis: any
  ): VehicleComparison['analysis'] {
    const findVehicleByMetric = (metric: (v: EnhancedVehicleData) => number) => {
      return vehicles.reduce((best, current) => 
        metric(current) > metric(best) ? current : best
      );
    };

    return {
      performance: {
        fastest: findVehicleByMetric(v => v.specifications.acceleration0to60 ? 60 / v.specifications.acceleration0to60 : 0),
        mostPowerful: findVehicleByMetric(v => v.engine.horsepower),
        bestFuelEconomy: findVehicleByMetric(v => v.fuelEconomy.combined),
      },
      value: {
        bestValue: findVehicleByMetric(v => v.engine.horsepower / (v.pricing.msrp / 1000)),
        cheapest: vehicles.reduce((cheapest, current) => 
          current.pricing.msrp < cheapest.pricing.msrp ? current : cheapest
        ),
        bestResale: findVehicleByMetric(v => v.pricingInsights?.projectedValue3Year || 0),
      },
      practical: {
        mostReliable: findVehicleByMetric(v => v.performanceData?.reliabilityScore || 0),
        lowestMaintenance: vehicles.reduce((lowest, current) => {
          const currentCost = current.pricingInsights?.maintenanceEstimate || Infinity;
          const lowestCost = lowest.pricingInsights?.maintenanceEstimate || Infinity;
          return currentCost < lowestCost ? current : lowest;
        }),
        bestInsurance: vehicles.reduce((lowest, current) => {
          const currentCost = current.pricingInsights?.insuranceEstimate || Infinity;
          const lowestCost = lowest.pricingInsights?.insuranceEstimate || Infinity;
          return currentCost < lowestCost ? current : lowest;
        }),
      },
    };
  }

  /**
   * Generate AI-powered recommendation
   */
  private static generateRecommendation(
    vehicles: EnhancedVehicleData[], 
    analysis: any
  ): VehicleComparison['recommendation'] {
    // Simple scoring algorithm - in real implementation, this would use AI
    const scores = vehicles.map(vehicle => {
      const performanceScore = (vehicle.engine.horsepower / 100) + (60 / vehicle.specifications.acceleration0to60);
      const valueScore = (vehicle.engine.horsepower / (vehicle.pricing.msrp / 1000)) * 10;
      const practicalScore = (vehicle.performanceData?.reliabilityScore || 50) / 10;
      
      return {
        vehicle,
        totalScore: performanceScore + valueScore + practicalScore,
      };
    });

    const bestVehicle = scores.reduce((best, current) => 
      current.totalScore > best.totalScore ? current : best
    );

    return {
      overall: bestVehicle.vehicle,
      reasoning: `Based on performance, value, and reliability metrics, the ${bestVehicle.vehicle.year} ${bestVehicle.vehicle.make} ${bestVehicle.vehicle.model} offers the best overall package.`,
      tradeoffs: [
        'Higher performance may mean lower fuel economy',
        'Best value vehicles may have higher maintenance costs',
        'Most reliable options might be less exciting to drive',
      ],
    };
  }

  /**
   * Fallback comparison when backend is unavailable
   */
  private static async fallbackComparison(
    vehicles: Array<{ make: string; model: string; year: number }>
  ): Promise<VehicleComparison> {
    const vehicleData = await Promise.all(
      vehicles.map(v => EdmundsApiService.getVehicleDetails(v.make, v.model, v.year))
    );

    return {
      vehicles: vehicleData,
      analysis: this.processComparisonAnalysis(vehicleData, {}),
      recommendation: {
        overall: vehicleData[0],
        reasoning: 'Limited analysis available - backend connection required for full comparison',
        tradeoffs: ['Full analysis requires backend connection'],
      },
    };
  }

  /**
   * Estimate vehicle analysis when backend is unavailable
   */
  private static estimateVehicleAnalysis(
    make: string, 
    model: string, 
    year: number
  ): Partial<EnhancedVehicleData> {
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    
    return {
      performanceData: {
        trackRating: Math.max(1, 5 - (age * 0.2)),
        streetRating: Math.max(1, 4.5 - (age * 0.1)),
        modificationPotential: this.estimateModPotential(make, model),
        maintenanceCost: age > 5 ? 'high' : age > 2 ? 'medium' : 'low',
        reliabilityScore: Math.max(60, 85 - (age * 3)),
      },
      pricingInsights: {
        currentMarketValue: 0, // Would be calculated with real market data
        projectedValue1Year: 0,
        projectedValue3Year: 0,
        costOfOwnership3Year: 0,
        insuranceEstimate: this.estimateInsurance(make, model, year),
        maintenanceEstimate: this.estimateMaintenance(make, model, year),
      },
    };
  }

  private static estimateModPotential(make: string, model: string): number {
    const sportsCarMakes = ['ford', 'chevrolet', 'dodge', 'bmw', 'audi', 'nissan', 'subaru'];
    const sportsCarModels = ['mustang', 'camaro', 'corvette', 'challenger', 'm3', 'm4', '370z', 'wrx'];
    
    const makeBonus = sportsCarMakes.includes(make.toLowerCase()) ? 20 : 0;
    const modelBonus = sportsCarModels.some(m => model.toLowerCase().includes(m)) ? 30 : 0;
    
    return Math.min(100, 40 + makeBonus + modelBonus);
  }

  private static estimateInsurance(make: string, model: string, year: number): number {
    const luxuryBrands = ['bmw', 'mercedes', 'audi', 'lexus', 'porsche'];
    const sportsBrands = ['ford', 'chevrolet', 'dodge'];
    
    let baseRate = 1200; // Base annual insurance
    
    if (luxuryBrands.includes(make.toLowerCase())) baseRate *= 1.8;
    if (sportsBrands.includes(make.toLowerCase())) baseRate *= 1.5;
    if (model.toLowerCase().includes('turbo') || model.toLowerCase().includes('sport')) baseRate *= 1.3;
    
    const ageMultiplier = Math.max(0.7, 1 - ((new Date().getFullYear() - year) * 0.05));
    
    return Math.round(baseRate * ageMultiplier);
  }

  private static estimateMaintenance(make: string, model: string, year: number): number {
    const luxuryBrands = ['bmw', 'mercedes', 'audi', 'lexus', 'porsche'];
    const reliableBrands = ['toyota', 'honda', 'mazda'];
    
    let baseRate = 800; // Base annual maintenance
    
    if (luxuryBrands.includes(make.toLowerCase())) baseRate *= 2.5;
    if (reliableBrands.includes(make.toLowerCase())) baseRate *= 0.7;
    
    const ageMultiplier = 1 + ((new Date().getFullYear() - year) * 0.15);
    
    return Math.round(baseRate * ageMultiplier);
  }

  /**
   * Mock market insights for development
   */
  private static getMockMarketInsights(): MarketInsights {
    return {
      trendingVehicles: [],
      priceAlerts: [],
      recommendations: [],
    };
  }

  /**
   * Mock recommendations for development
   */
  private static getMockRecommendations(): EnhancedVehicleData[] {
    return [];
  }
}