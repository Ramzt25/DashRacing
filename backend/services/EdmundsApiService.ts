// Backend EdmundsApiService - server-side implementation

export interface VehicleSearchParams {
  make?: string;
  model?: string;
  year?: number;
  limit?: number;
}

export interface VehicleBasicInfo {
  id: string;
  make: string;
  model: string;
  year: number;
  trim?: string;
  submodel?: string;
  niceName: string;
}

export interface VehicleDetails {
  id: string;
  make: string;
  model: string;
  year: number;
  trim: string;
  submodel: string;
  niceName: string;
  description: string;
  msrp: number;
  invoice: number;
  tmv: number; // True Market Value
  drivetrain: string;
  engine: {
    type: string;
    cylinders: number;
    displacement: number;
    horsepower: number;
    torque: number;
    fuelType: string;
  };
  transmission: {
    type: string;
    gears: number;
  };
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
    groundClearance: number;
  };
  weight: {
    curb: number;
    gross: number;
  };
  capacity: {
    seating: number;
    cargo: number;
    fuel: number;
  };
  safety: {
    overallRating: number;
    nhtsa?: number;
    iihs?: string;
  };
}

export interface VehicleTrim extends VehicleBasicInfo {
  price: {
    baseMSRP: number;
    baseInvoice: number;
    deliveryCharges: number;
  };
  engine: {
    type: string;
    horsepower: number;
    torque: number;
  };
  fuelEconomy: {
    city: number;
    highway: number;
    combined: number;
  };
}

export interface VehiclePricing {
  vehicleId: string;
  make: string;
  model: string;
  year: number;
  trim: string;
  msrp: number;
  invoice: number;
  tmv: number;
  incentives: Array<{
    name: string;
    amount: number;
    description: string;
    eligibility: string;
  }>;
  regionalAdjustment: number;
  totalWithIncentives: number;
  estimatedMonthlyPayment: {
    lease: number;
    finance: number;
  };
}

export class EdmundsApiService {
  private static readonly API_KEY = process.env.EDMUNDS_API_KEY || '';
  private static readonly BASE_URL = 'https://api.edmunds.com/api/vehicle/v2';
  
  /**
   * Search for vehicles based on criteria
   */
  static async searchVehicles(params: VehicleSearchParams): Promise<VehicleBasicInfo[]> {
    try {
      if (!this.API_KEY) {
        console.warn('Edmunds API key not configured, using mock data');
        return this.getMockVehicleSearch(params);
      }

      const queryParams = new URLSearchParams();
      if (params.make) queryParams.append('make', params.make);
      if (params.model) queryParams.append('model', params.model);
      if (params.year) queryParams.append('year', params.year.toString());
      queryParams.append('pagesize', (params.limit || 20).toString());
      queryParams.append('api_key', this.API_KEY);

      const response = await fetch(`${this.BASE_URL}/makes?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Edmunds API error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      return this.transformVehicleSearchResults(data);
    } catch (error) {
      console.warn('Edmunds API search failed, using mock data:', error);
      return this.getMockVehicleSearch(params);
    }
  }

  /**
   * Get detailed vehicle information
   */
  static async getVehicleDetails(make: string, model: string, year: number): Promise<VehicleDetails | null> {
    try {
      if (!this.API_KEY) {
        console.warn('Edmunds API key not configured, using mock data');
        return this.getMockVehicleDetails(make, model, year);
      }

      const response = await fetch(
        `${this.BASE_URL}/${make}/${model}/${year}?api_key=${this.API_KEY}`
      );

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Edmunds API error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      return this.transformVehicleDetails(data);
    } catch (error) {
      console.warn('Edmunds API details failed, using mock data:', error);
      return this.getMockVehicleDetails(make, model, year);
    }
  }

  /**
   * Get vehicle trims for a specific make/model/year
   */
  static async getVehicleTrims(make: string, model: string, year: number): Promise<VehicleTrim[]> {
    try {
      if (!this.API_KEY) {
        console.warn('Edmunds API key not configured, using mock data');
        return this.getMockVehicleTrims(make, model, year);
      }

      const response = await fetch(
        `${this.BASE_URL}/${make}/${model}/${year}/styles?api_key=${this.API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`Edmunds API error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      return this.transformVehicleTrims(data);
    } catch (error) {
      console.warn('Edmunds API trims failed, using mock data:', error);
      return this.getMockVehicleTrims(make, model, year);
    }
  }

  /**
   * Get vehicle pricing information
   */
  static async getVehiclePricing(
    make: string, 
    model: string, 
    year: number, 
    trim?: string, 
    zip?: string
  ): Promise<VehiclePricing | null> {
    try {
      if (!this.API_KEY) {
        console.warn('Edmunds API key not configured, using mock data');
        return this.getMockVehiclePricing(make, model, year, trim);
      }

      const queryParams = new URLSearchParams({ api_key: this.API_KEY });
      if (zip) queryParams.append('zip', zip);

      const response = await fetch(
        `${this.BASE_URL}/${make}/${model}/${year}/pricing?${queryParams.toString()}`
      );

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Edmunds API error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      return this.transformVehiclePricing(data, make, model, year, trim);
    } catch (error) {
      console.warn('Edmunds API pricing failed, using mock data:', error);
      return this.getMockVehiclePricing(make, model, year, trim);
    }
  }

  /**
   * Get vehicle specifications
   */
  static async getVehicleSpecifications(make: string, model: string, year: number): Promise<any> {
    try {
      if (!this.API_KEY) {
        return this.getMockVehicleSpecifications(make, model, year);
      }

      const response = await fetch(
        `${this.BASE_URL}/${make}/${model}/${year}/specs?api_key=${this.API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`Edmunds API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('Edmunds API specs failed, using mock data:', error);
      return this.getMockVehicleSpecifications(make, model, year);
    }
  }

  /**
   * Get vehicle reviews
   */
  static async getVehicleReviews(make: string, model: string, year: number): Promise<any[]> {
    try {
      if (!this.API_KEY) {
        return this.getMockVehicleReviews(make, model, year);
      }

      const response = await fetch(
        `${this.BASE_URL}/${make}/${model}/${year}/reviews?api_key=${this.API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`Edmunds API error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      return data.reviews || [];
    } catch (error) {
      console.warn('Edmunds API reviews failed, using mock data:', error);
      return this.getMockVehicleReviews(make, model, year);
    }
  }

  /**
   * Get vehicle recalls
   */
  static async getVehicleRecalls(make: string, model: string, year: number): Promise<any[]> {
    try {
      if (!this.API_KEY) {
        return this.getMockVehicleRecalls(make, model, year);
      }

      const response = await fetch(
        `${this.BASE_URL}/${make}/${model}/${year}/recalls?api_key=${this.API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`Edmunds API error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      return data.recalls || [];
    } catch (error) {
      console.warn('Edmunds API recalls failed, using mock data:', error);
      return this.getMockVehicleRecalls(make, model, year);
    }
  }

  /**
   * Compare multiple vehicles
   */
  static async compareVehicles(vehicles: Array<{ make: string; model: string; year: number }>): Promise<any> {
    try {
      const vehicleDetails = await Promise.all(
        vehicles.map(v => this.getVehicleDetails(v.make, v.model, v.year))
      );

      return {
        vehicles: vehicleDetails.filter(Boolean),
        comparison: this.generateComparison(vehicleDetails.filter(Boolean) as VehicleDetails[]),
      };
    } catch (error) {
      console.warn('Vehicle comparison failed:', error);
      return { vehicles: [], comparison: {} };
    }
  }

  /**
   * Get popular vehicles
   */
  static async getPopularVehicles(): Promise<VehicleBasicInfo[]> {
    try {
      if (!this.API_KEY) {
        return this.getMockPopularVehicles();
      }

      const response = await fetch(`${this.BASE_URL}/makes/popular?api_key=${this.API_KEY}`);
      
      if (!response.ok) {
        throw new Error(`Edmunds API error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      return this.transformPopularVehicles(data);
    } catch (error) {
      console.warn('Edmunds API popular vehicles failed, using mock data:', error);
      return this.getMockPopularVehicles();
    }
  }

  /**
   * Get all vehicle makes
   */
  static async getVehicleMakes(): Promise<string[]> {
    try {
      if (!this.API_KEY) {
        return this.getMockVehicleMakes();
      }

      const response = await fetch(`${this.BASE_URL}/makes?api_key=${this.API_KEY}`);
      
      if (!response.ok) {
        throw new Error(`Edmunds API error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      return data.makes?.map((make: any) => make.name) || this.getMockVehicleMakes();
    } catch (error) {
      console.warn('Edmunds API makes failed, using mock data:', error);
      return this.getMockVehicleMakes();
    }
  }

  /**
   * Get models for a specific make
   */
  static async getModelsForMake(make: string): Promise<string[]> {
    try {
      if (!this.API_KEY) {
        return this.getMockModelsForMake(make);
      }

      const response = await fetch(`${this.BASE_URL}/${make}?api_key=${this.API_KEY}`);
      
      if (!response.ok) {
        throw new Error(`Edmunds API error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      return data.models?.map((model: any) => model.name) || this.getMockModelsForMake(make);
    } catch (error) {
      console.warn('Edmunds API models failed, using mock data:', error);
      return this.getMockModelsForMake(make);
    }
  }

  // Mock data methods for development without API key
  private static getMockVehicleSearch(params: VehicleSearchParams): VehicleBasicInfo[] {
    const allVehicles = [
      { id: '1', make: 'Ford', model: 'Mustang', year: 2024, trim: 'GT', niceName: 'ford-mustang-2024-gt' },
      { id: '2', make: 'Chevrolet', model: 'Camaro', year: 2024, trim: 'SS', niceName: 'chevrolet-camaro-2024-ss' },
      { id: '3', make: 'Dodge', model: 'Challenger', year: 2024, trim: 'SRT', niceName: 'dodge-challenger-2024-srt' },
      { id: '4', make: 'BMW', model: 'M3', year: 2024, trim: 'Competition', niceName: 'bmw-m3-2024-competition' },
      { id: '5', make: 'Mercedes', model: 'C63 AMG', year: 2024, trim: 'S', niceName: 'mercedes-c63-amg-2024-s' },
    ];

    return allVehicles.filter(v => {
      if (params.make && v.make.toLowerCase() !== params.make.toLowerCase()) return false;
      if (params.model && v.model.toLowerCase() !== params.model.toLowerCase()) return false;
      if (params.year && v.year !== params.year) return false;
      return true;
    }).slice(0, params.limit || 20);
  }

  private static getMockVehicleDetails(make: string, model: string, year: number): VehicleDetails {
    return {
      id: `${make}-${model}-${year}`,
      make,
      model,
      year,
      trim: 'GT Premium',
      submodel: 'Fastback',
      niceName: `${make.toLowerCase()}-${model.toLowerCase()}-${year}-gt-premium`,
      description: `The ${year} ${make} ${model} represents the pinnacle of performance engineering.`,
      msrp: 45000,
      invoice: 42000,
      tmv: 44000,
      drivetrain: 'RWD',
      engine: {
        type: 'V8',
        cylinders: 8,
        displacement: 5.0,
        horsepower: 450,
        torque: 410,
        fuelType: 'Premium Gasoline',
      },
      transmission: {
        type: 'Manual',
        gears: 6,
      },
      fuelEconomy: {
        city: 15,
        highway: 25,
        combined: 19,
      },
      dimensions: {
        length: 188.2,
        width: 75.4,
        height: 54.4,
        wheelbase: 107.1,
        groundClearance: 5.1,
      },
      weight: {
        curb: 3705,
        gross: 4365,
      },
      capacity: {
        seating: 4,
        cargo: 13.5,
        fuel: 16.0,
      },
      safety: {
        overallRating: 5,
        nhtsa: 5,
        iihs: 'Top Safety Pick',
      },
    };
  }

  private static getMockVehicleTrims(make: string, model: string, year: number): VehicleTrim[] {
    return [
      {
        id: `${make}-${model}-${year}-base`,
        make,
        model,
        year,
        trim: 'Base',
        niceName: `${make.toLowerCase()}-${model.toLowerCase()}-${year}-base`,
        price: { baseMSRP: 35000, baseInvoice: 32000, deliveryCharges: 1200 },
        engine: { type: 'V6', horsepower: 310, torque: 280 },
        fuelEconomy: { city: 19, highway: 28, combined: 22 },
      },
      {
        id: `${make}-${model}-${year}-premium`,
        make,
        model,
        year,
        trim: 'Premium',
        niceName: `${make.toLowerCase()}-${model.toLowerCase()}-${year}-premium`,
        price: { baseMSRP: 42000, baseInvoice: 39000, deliveryCharges: 1200 },
        engine: { type: 'V8', horsepower: 450, torque: 410 },
        fuelEconomy: { city: 15, highway: 25, combined: 19 },
      },
    ];
  }

  private static getMockVehiclePricing(make: string, model: string, year: number, trim?: string): VehiclePricing {
    return {
      vehicleId: `${make}-${model}-${year}`,
      make,
      model,
      year,
      trim: trim || 'GT Premium',
      msrp: 45000,
      invoice: 42000,
      tmv: 44000,
      incentives: [
        { name: 'Cash Back', amount: 2000, description: 'Manufacturer cash back', eligibility: 'All buyers' },
        { name: 'Trade-in Bonus', amount: 1500, description: 'Additional trade-in value', eligibility: 'Trade-in required' },
      ],
      regionalAdjustment: -500,
      totalWithIncentives: 41000,
      estimatedMonthlyPayment: { lease: 520, finance: 680 },
    };
  }

  private static getMockVehicleSpecifications(make: string, model: string, year: number): any {
    return {
      engine: { type: 'V8', displacement: '5.0L', horsepower: 450, torque: 410 },
      transmission: { type: 'Manual', gears: 6 },
      performance: { acceleration: '4.2s 0-60', topSpeed: '155 mph', quarterMile: '12.3s' },
      dimensions: { length: '188.2"', width: '75.4"', height: '54.4"', wheelbase: '107.1"' },
      weight: '3,705 lbs',
      fuelCapacity: '16.0 gallons',
      seatingCapacity: 4,
    };
  }

  private static getMockVehicleReviews(make: string, model: string, year: number): any[] {
    return [
      {
        id: '1',
        rating: 4.5,
        title: 'Outstanding Performance',
        review: 'This car delivers incredible performance and handling.',
        author: 'Car Enthusiast',
        date: '2024-01-15',
      },
      {
        id: '2',
        rating: 4.2,
        title: 'Great Value',
        review: 'Excellent value for the performance you get.',
        author: 'Racing Fan',
        date: '2024-01-10',
      },
    ];
  }

  private static getMockVehicleRecalls(make: string, model: string, year: number): any[] {
    return []; // Most vehicles have no active recalls
  }

  private static getMockPopularVehicles(): VehicleBasicInfo[] {
    return [
      { id: '1', make: 'Ford', model: 'F-150', year: 2024, niceName: 'ford-f-150-2024' },
      { id: '2', make: 'Chevrolet', model: 'Silverado', year: 2024, niceName: 'chevrolet-silverado-2024' },
      { id: '3', make: 'Toyota', model: 'Camry', year: 2024, niceName: 'toyota-camry-2024' },
      { id: '4', make: 'Honda', model: 'Civic', year: 2024, niceName: 'honda-civic-2024' },
      { id: '5', make: 'Tesla', model: 'Model 3', year: 2024, niceName: 'tesla-model-3-2024' },
    ];
  }

  private static getMockVehicleMakes(): string[] {
    return [
      'Acura', 'Audi', 'BMW', 'Chevrolet', 'Dodge', 'Ford', 'Honda', 'Hyundai',
      'Infiniti', 'Jaguar', 'Kia', 'Lexus', 'Mercedes', 'Nissan', 'Porsche',
      'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
    ];
  }

  private static getMockModelsForMake(make: string): string[] {
    const makeModels: { [key: string]: string[] } = {
      'Ford': ['Mustang', 'F-150', 'Explorer', 'Escape', 'Focus'],
      'Chevrolet': ['Camaro', 'Corvette', 'Silverado', 'Equinox', 'Malibu'],
      'BMW': ['M3', 'M4', 'X3', 'X5', '3 Series', '5 Series'],
      'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Prius'],
      'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'HR-V'],
    };

    return makeModels[make] || ['Model 1', 'Model 2', 'Model 3'];
  }

  // Transform methods for API responses
  private static transformVehicleSearchResults(data: any): VehicleBasicInfo[] {
    // Transform Edmunds API response to our format
    return data.makes?.flatMap((make: any) => 
      make.models?.flatMap((model: any) => 
        model.years?.map((year: any) => ({
          id: `${make.name}-${model.name}-${year.year}`,
          make: make.name,
          model: model.name,
          year: year.year,
          niceName: `${make.niceName}-${model.niceName}-${year.year}`,
        }))
      )
    ) || [];
  }

  private static transformVehicleDetails(data: any): VehicleDetails {
    // Transform Edmunds API response to our format
    return {
      id: data.id || 'unknown',
      make: data.make?.name || 'Unknown',
      model: data.model?.name || 'Unknown',
      year: data.year || 2024,
      trim: data.trim || 'Base',
      submodel: data.submodel || '',
      niceName: data.niceName || '',
      description: data.description || '',
      msrp: data.price?.baseMSRP || 0,
      invoice: data.price?.baseInvoice || 0,
      tmv: data.price?.tmv || 0,
      drivetrain: data.drivetrain || 'Unknown',
      engine: {
        type: data.engine?.type || 'Unknown',
        cylinders: data.engine?.cylinders || 0,
        displacement: data.engine?.displacement || 0,
        horsepower: data.engine?.horsepower || 0,
        torque: data.engine?.torque || 0,
        fuelType: data.engine?.fuelType || 'Gasoline',
      },
      transmission: {
        type: data.transmission?.type || 'Unknown',
        gears: data.transmission?.gears || 0,
      },
      fuelEconomy: {
        city: data.mpg?.city || 0,
        highway: data.mpg?.highway || 0,
        combined: data.mpg?.combined || 0,
      },
      dimensions: {
        length: data.dimensions?.length || 0,
        width: data.dimensions?.width || 0,
        height: data.dimensions?.height || 0,
        wheelbase: data.dimensions?.wheelbase || 0,
        groundClearance: data.dimensions?.groundClearance || 0,
      },
      weight: {
        curb: data.weight?.curb || 0,
        gross: data.weight?.gross || 0,
      },
      capacity: {
        seating: data.seating || 0,
        cargo: data.cargo || 0,
        fuel: data.fuelCapacity || 0,
      },
      safety: {
        overallRating: data.safety?.overall || 0,
        nhtsa: data.safety?.nhtsa,
        iihs: data.safety?.iihs,
      },
    };
  }

  private static transformVehicleTrims(data: any): VehicleTrim[] {
    return data.styles?.map((style: any) => ({
      id: style.id,
      make: style.make?.name || 'Unknown',
      model: style.model?.name || 'Unknown',
      year: style.year || 2024,
      trim: style.trim || 'Base',
      niceName: style.niceName || '',
      price: {
        baseMSRP: style.price?.baseMSRP || 0,
        baseInvoice: style.price?.baseInvoice || 0,
        deliveryCharges: style.price?.deliveryCharges || 0,
      },
      engine: {
        type: style.engine?.type || 'Unknown',
        horsepower: style.engine?.horsepower || 0,
        torque: style.engine?.torque || 0,
      },
      fuelEconomy: {
        city: style.mpg?.city || 0,
        highway: style.mpg?.highway || 0,
        combined: style.mpg?.combined || 0,
      },
    })) || [];
  }

  private static transformVehiclePricing(data: any, make: string, model: string, year: number, trim?: string): VehiclePricing {
    return {
      vehicleId: `${make}-${model}-${year}`,
      make,
      model,
      year,
      trim: trim || 'Base',
      msrp: data.price?.baseMSRP || 0,
      invoice: data.price?.baseInvoice || 0,
      tmv: data.price?.tmv || 0,
      incentives: data.incentives || [],
      regionalAdjustment: data.regionalAdjustment || 0,
      totalWithIncentives: data.totalWithIncentives || 0,
      estimatedMonthlyPayment: {
        lease: data.monthlyPayment?.lease || 0,
        finance: data.monthlyPayment?.finance || 0,
      },
    };
  }

  private static transformPopularVehicles(data: any): VehicleBasicInfo[] {
    return data.popular?.map((vehicle: any) => ({
      id: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      niceName: vehicle.niceName,
    })) || [];
  }

  private static generateComparison(vehicles: VehicleDetails[]): any {
    if (vehicles.length < 2) return {};

    return {
      performance: {
        mostPowerful: vehicles.reduce((prev, current) => 
          prev.engine.horsepower > current.engine.horsepower ? prev : current
        ),
        mostFuelEfficient: vehicles.reduce((prev, current) => 
          prev.fuelEconomy.combined > current.fuelEconomy.combined ? prev : current
        ),
      },
      pricing: {
        mostAffordable: vehicles.reduce((prev, current) => 
          prev.msrp < current.msrp ? prev : current
        ),
        bestValue: vehicles.reduce((prev, current) => 
          prev.tmv < current.tmv ? prev : current
        ),
      },
      specifications: {
        largest: vehicles.reduce((prev, current) => 
          prev.dimensions.length > current.dimensions.length ? prev : current
        ),
        safest: vehicles.reduce((prev, current) => 
          prev.safety.overallRating > current.safety.overallRating ? prev : current
        ),
      },
    };
  }
}