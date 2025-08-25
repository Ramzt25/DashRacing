// External API integration service for Edmunds vehicle data
export interface EdmundsVehicleData {
  make: string;
  model: string;
  year: number;
  trim?: string;
  engine: {
    type: string;
    displacement: number;
    cylinders: number;
    horsepower: number;
    torque: number;
  };
  transmission: {
    type: string;
    speeds: number;
  };
  drivetrain: string;
  fuelEconomy: {
    city: number;
    highway: number;
    combined: number;
  };
  dimensions: {
    length: number;
    width: number;
    height: number;
    wheelbase: number;
    weight: number;
  };
  pricing: {
    msrp: number;
    invoice: number;
  };
  specifications: {
    acceleration0to60: number;
    topSpeed: number;
    quarterMile: number;
  };
  images: string[];
}

export interface VehicleSearchResult {
  make: string;
  model: string;
  years: number[];
  category: string;
  popularity: number;
}

export class EdmundsApiService {
  private static readonly BASE_URL = 'https://api.edmunds.com/api/vehicle/v2';
  private static readonly API_KEY = process.env.EXPO_PUBLIC_EDMUNDS_API_KEY || 'demo-key';

  /**
   * Search for vehicle makes and models
   */
  static async searchVehicles(query: string): Promise<VehicleSearchResult[]> {
    try {
      if (!this.API_KEY || this.API_KEY === 'demo-key') {
        console.warn('Edmunds API key not configured, using mock data');
        return this.getMockSearchResults(query);
      }

      const response = await fetch(
        `${this.BASE_URL}/makes?fmt=json&api_key=${this.API_KEY}&view=basic`
      );

      if (!response.ok) {
        throw new Error(`Edmunds API error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      
      // Filter results based on query
      const filteredResults = data.makes
        .filter((make: any) => 
          make.name.toLowerCase().includes(query.toLowerCase()) ||
          make.models?.some((model: any) => 
            model.name.toLowerCase().includes(query.toLowerCase())
          )
        )
        .map((make: any) => ({
          make: make.name,
          model: make.models?.[0]?.name || '',
          years: make.models?.[0]?.years?.map((y: any) => y.year) || [],
          category: make.models?.[0]?.categories?.[0] || 'Unknown',
          popularity: Math.floor(Math.random() * 100),
        }));

      return filteredResults.slice(0, 10);
    } catch (error) {
      console.warn('Edmunds API unavailable, using mock data:', error);
      return this.getMockSearchResults(query);
    }
  }

  /**
   * Get detailed vehicle information
   */
  static async getVehicleDetails(make: string, model: string, year: number): Promise<EdmundsVehicleData> {
    try {
      if (!this.API_KEY || this.API_KEY === 'demo-key') {
        console.warn('Edmunds API key not configured, using mock data');
        return this.getMockVehicleData(make, model, year);
      }

      const response = await fetch(
        `${this.BASE_URL}/${make.toLowerCase()}/${model.toLowerCase()}/${year}?fmt=json&api_key=${this.API_KEY}&view=full`
      );

      if (!response.ok) {
        throw new Error(`Edmunds API error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      
      return this.transformEdmundsData(data);
    } catch (error) {
      console.warn('Edmunds API unavailable, using mock data:', error);
      return this.getMockVehicleData(make, model, year);
    }
  }

  /**
   * Get vehicle trims for a specific model and year
   */
  static async getVehicleTrims(make: string, model: string, year: number): Promise<string[]> {
    try {
      if (!this.API_KEY || this.API_KEY === 'demo-key') {
        return this.getMockTrims(make, model, year);
      }

      const response = await fetch(
        `${this.BASE_URL}/${make.toLowerCase()}/${model.toLowerCase()}/${year}/styles?fmt=json&api_key=${this.API_KEY}&view=basic`
      );

      if (!response.ok) {
        throw new Error(`Edmunds API error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      
      return data.styles?.map((style: any) => style.name) || [];
    } catch (error) {
      console.warn('Edmunds API unavailable, using mock trims:', error);
      return this.getMockTrims(make, model, year);
    }
  }

  /**
   * Get vehicle pricing information
   */
  static async getVehiclePricing(make: string, model: string, year: number, trim?: string): Promise<{
    msrp: number;
    invoice: number;
    marketValue: number;
    depreciation: number;
  }> {
    try {
      if (!this.API_KEY || this.API_KEY === 'demo-key') {
        return this.getMockPricing(make, model, year);
      }

      const response = await fetch(
        `${this.BASE_URL}/${make.toLowerCase()}/${model.toLowerCase()}/${year}/styles?fmt=json&api_key=${this.API_KEY}&view=full`
      );

      if (!response.ok) {
        throw new Error(`Edmunds API error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      
      const style = trim 
        ? data.styles?.find((s: any) => s.name.toLowerCase().includes(trim.toLowerCase()))
        : data.styles?.[0];

      return {
        msrp: style?.price?.baseMSRP || 25000,
        invoice: style?.price?.baseInvoice || 23000,
        marketValue: style?.price?.estimatedTmv || 22000,
        depreciation: this.calculateDepreciation(year, style?.price?.baseMSRP || 25000),
      };
    } catch (error) {
      console.warn('Edmunds API unavailable, using mock pricing:', error);
      return this.getMockPricing(make, model, year);
    }
  }

  /**
   * Transform Edmunds API data to our format
   */
  private static transformEdmundsData(data: any): EdmundsVehicleData {
    const style = data.styles?.[0] || {};
    const engine = style.engine || {};
    
    return {
      make: data.make?.name || '',
      model: data.model?.name || '',
      year: data.year || 2020,
      trim: style.name || '',
      engine: {
        type: engine.type || 'Unknown',
        displacement: engine.displacement || 2.0,
        cylinders: engine.cylinder || 4,
        horsepower: engine.horsepower || 200,
        torque: engine.torque || 200,
      },
      transmission: {
        type: style.transmission?.transmissionType || 'Manual',
        speeds: style.transmission?.numberOfSpeeds || 6,
      },
      drivetrain: style.drivenWheels || 'FWD',
      fuelEconomy: {
        city: style.MPG?.city || 25,
        highway: style.MPG?.highway || 35,
        combined: Math.round(((style.MPG?.city || 25) + (style.MPG?.highway || 35)) / 2),
      },
      dimensions: {
        length: style.length || 180,
        width: style.width || 70,
        height: style.height || 55,
        wheelbase: style.wheelbase || 105,
        weight: style.curbWeight || 3000,
      },
      pricing: {
        msrp: style.price?.baseMSRP || 25000,
        invoice: style.price?.baseInvoice || 23000,
      },
      specifications: {
        acceleration0to60: this.estimateAcceleration(engine.horsepower, style.curbWeight),
        topSpeed: this.estimateTopSpeed(engine.horsepower),
        quarterMile: this.estimateQuarterMile(engine.horsepower, style.curbWeight),
      },
      images: data.photos?.map((photo: any) => photo.photoSrcs?.[0]?.link) || [],
    };
  }

  /**
   * Mock data generators for when API is unavailable
   */
  private static getMockSearchResults(query: string): VehicleSearchResult[] {
    const mockResults = [
      { make: 'Honda', model: 'Civic', years: [2018, 2019, 2020, 2021, 2022, 2023], category: 'Compact', popularity: 95 },
      { make: 'Toyota', model: 'Camry', years: [2018, 2019, 2020, 2021, 2022, 2023], category: 'Midsize', popularity: 90 },
      { make: 'Ford', model: 'Mustang', years: [2018, 2019, 2020, 2021, 2022, 2023], category: 'Sports', popularity: 85 },
      { make: 'Chevrolet', model: 'Corvette', years: [2019, 2020, 2021, 2022, 2023], category: 'Sports', popularity: 80 },
      { make: 'BMW', model: 'M3', years: [2018, 2019, 2020, 2021, 2022, 2023], category: 'Luxury Sports', popularity: 75 },
      { make: 'Audi', model: 'RS4', years: [2018, 2019, 2020, 2021, 2022], category: 'Luxury Sports', popularity: 70 },
      { make: 'Subaru', model: 'WRX', years: [2018, 2019, 2020, 2021, 2022, 2023], category: 'Sports', popularity: 78 },
      { make: 'Nissan', model: '370Z', years: [2018, 2019, 2020], category: 'Sports', popularity: 65 },
    ];

    return mockResults.filter(result => 
      result.make.toLowerCase().includes(query.toLowerCase()) ||
      result.model.toLowerCase().includes(query.toLowerCase())
    );
  }

  private static getMockVehicleData(make: string, model: string, year: number): EdmundsVehicleData {
    const baseHorsepower = this.getBaseHorsepower(make, model);
    const baseWeight = this.getBaseWeight(make, model);
    
    return {
      make,
      model,
      year,
      trim: 'Standard',
      engine: {
        type: 'Inline-4',
        displacement: 2.0,
        cylinders: 4,
        horsepower: baseHorsepower,
        torque: Math.round(baseHorsepower * 0.85),
      },
      transmission: {
        type: 'Manual',
        speeds: 6,
      },
      drivetrain: 'FWD',
      fuelEconomy: {
        city: 26,
        highway: 35,
        combined: 30,
      },
      dimensions: {
        length: 182,
        width: 71,
        height: 56,
        wheelbase: 106,
        weight: baseWeight,
      },
      pricing: {
        msrp: this.estimatePricing(make, model, year),
        invoice: this.estimatePricing(make, model, year) * 0.92,
      },
      specifications: {
        acceleration0to60: this.estimateAcceleration(baseHorsepower, baseWeight),
        topSpeed: this.estimateTopSpeed(baseHorsepower),
        quarterMile: this.estimateQuarterMile(baseHorsepower, baseWeight),
      },
      images: [
        `https://example.com/${make.toLowerCase()}-${model.toLowerCase()}-${year}-1.jpg`,
        `https://example.com/${make.toLowerCase()}-${model.toLowerCase()}-${year}-2.jpg`,
      ],
    };
  }

  private static getMockTrims(make: string, model: string, year: number): string[] {
    const trimOptions = {
      'honda civic': ['LX', 'Sport', 'EX', 'EX-L', 'Touring', 'Si', 'Type R'],
      'toyota camry': ['L', 'LE', 'SE', 'XLE', 'XSE', 'TRD'],
      'ford mustang': ['EcoBoost', 'GT', 'Mach 1', 'Shelby GT350', 'Shelby GT500'],
      'chevrolet corvette': ['Stingray', 'Z51', 'Z06', 'ZR1'],
      'bmw m3': ['Base', 'Competition', 'CS'],
      'default': ['Base', 'Sport', 'Premium'],
    };

    const key = `${make.toLowerCase()} ${model.toLowerCase()}`;
    return trimOptions[key as keyof typeof trimOptions] || trimOptions.default;
  }

  private static getMockPricing(make: string, model: string, year: number): {
    msrp: number;
    invoice: number;
    marketValue: number;
    depreciation: number;
  } {
    const baseMsrp = this.estimatePricing(make, model, year);
    const depreciation = this.calculateDepreciation(year, baseMsrp);
    
    return {
      msrp: baseMsrp,
      invoice: Math.round(baseMsrp * 0.92),
      marketValue: Math.round(baseMsrp - depreciation),
      depreciation,
    };
  }

  // Helper methods for calculations
  private static getBaseHorsepower(make: string, model: string): number {
    const powerMap: { [key: string]: number } = {
      'honda civic': 158,
      'toyota camry': 203,
      'ford mustang': 310,
      'chevrolet corvette': 495,
      'bmw m3': 473,
      'audi rs4': 444,
      'subaru wrx': 268,
      'nissan 370z': 332,
    };
    
    const key = `${make.toLowerCase()} ${model.toLowerCase()}`;
    return powerMap[key] || 200;
  }

  private static getBaseWeight(make: string, model: string): number {
    const weightMap: { [key: string]: number } = {
      'honda civic': 2906,
      'toyota camry': 3340,
      'ford mustang': 3705,
      'chevrolet corvette': 3366,
      'bmw m3': 3835,
      'audi rs4': 4178,
      'subaru wrx': 3267,
      'nissan 370z': 3232,
    };
    
    const key = `${make.toLowerCase()} ${model.toLowerCase()}`;
    return weightMap[key] || 3200;
  }

  private static estimatePricing(make: string, model: string, year: number): number {
    const basePrice = {
      'honda': 25000,
      'toyota': 28000,
      'ford': 35000,
      'chevrolet': 45000,
      'bmw': 65000,
      'audi': 70000,
      'subaru': 32000,
      'nissan': 35000,
    };

    const makeLower = make.toLowerCase();
    const base = basePrice[makeLower as keyof typeof basePrice] || 30000;
    
    // Adjust for year (newer = more expensive)
    const yearAdjustment = (year - 2018) * 1000;
    
    return base + yearAdjustment;
  }

  private static calculateDepreciation(year: number, msrp: number): number {
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    
    // Standard depreciation: 20% first year, 15% per year after
    let depreciationRate = 0;
    if (age >= 1) {
      depreciationRate = 0.20 + ((age - 1) * 0.15);
    }
    
    return Math.round(msrp * Math.min(depreciationRate, 0.80)); // Max 80% depreciation
  }

  private static estimateAcceleration(horsepower: number, weight: number): number {
    // Power-to-weight ratio formula for 0-60 estimation
    const powerToWeight = horsepower / (weight / 1000);
    const acceleration = 6.5 - (powerToWeight / 100);
    return Math.max(acceleration, 2.5); // Minimum 2.5 seconds
  }

  private static estimateTopSpeed(horsepower: number): number {
    // Rough estimation based on horsepower
    return Math.round(100 + (horsepower / 10));
  }

  private static estimateQuarterMile(horsepower: number, weight: number): number {
    // Quarter mile estimation
    const powerToWeight = horsepower / (weight / 1000);
    const quarterMile = 16 - (powerToWeight / 50);
    return Math.max(quarterMile, 9.0); // Minimum 9 seconds
  }
}