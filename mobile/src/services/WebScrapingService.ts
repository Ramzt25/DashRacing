interface ScrapedPartData {
  name: string;
  brand: string;
  partNumber?: string;
  price: number;
  originalPrice?: number;
  availability: 'in-stock' | 'backorder' | 'discontinued' | 'limited';
  vendorName: string;
  vendorUrl: string;
  imageUrl?: string;
  description: string;
  reviews: {
    averageRating: number;
    totalReviews: number;
    highlights: string[];
  };
  specifications: { [key: string]: string };
  compatibilityNotes: string[];
  shippingInfo: {
    estimatedDays: number;
    cost: number;
    freeShippingThreshold?: number;
  };
  lastUpdated: Date;
}

interface MarketAnalysis {
  partName: string;
  averagePrice: number;
  priceRange: [number, number];
  bestDeal: ScrapedPartData;
  marketTrend: 'rising' | 'falling' | 'stable';
  popularityScore: number;
  competitorCount: number;
  lastAnalyzed: Date;
}

interface PerformanceReview {
  partId: string;
  userRating: number;
  performanceGain: number;
  reliabilityRating: number;
  installationDifficulty: number;
  valueForMoney: number;
  reviewText: string;
  verifiedPurchase: boolean;
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
  };
  createdAt: Date;
}

export class WebScrapingService {
  private static readonly API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.168.28:4000';
  
  /**
   * Search for performance parts across multiple vendors
   */
  static async searchPerformanceParts(
    carMake: string,
    carModel: string,
    carYear: number,
    category: string,
    budget?: number
  ): Promise<ScrapedPartData[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/scraping/search-parts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carMake,
          carModel,
          carYear,
          category,
          budget,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Parts search failed');
      }
      
      return await response.json() as ScrapedPartData[];
    } catch (error) {
      console.error('Web scraping error:', error);
      // Fallback to mock data for development
      return this.getMockPartsData(carMake, carModel, carYear, category);
    }
  }
  
  /**
   * Get real-time pricing for specific parts
   */
  static async getPartPricing(partNumbers: string[]): Promise<{ [partNumber: string]: ScrapedPartData[] }> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/scraping/part-pricing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partNumbers }),
      });
      
      if (!response.ok) {
        throw new Error('Pricing lookup failed');
      }
      
      return await response.json() as { [partNumber: string]: ScrapedPartData[] };
    } catch (error) {
      console.error('Pricing lookup error:', error);
      return this.getMockPricingData(partNumbers);
    }
  }
  
  /**
   * Analyze market trends for specific part categories
   */
  static async analyzeMarketTrends(
    carMake: string,
    carModel: string,
    categories: string[]
  ): Promise<MarketAnalysis[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/scraping/market-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carMake, carModel, categories }),
      });
      
      if (!response.ok) {
        throw new Error('Market analysis failed');
      }
      
      return await response.json() as MarketAnalysis[];
    } catch (error) {
      console.error('Market analysis error:', error);
      return this.getMockMarketAnalysis(categories);
    }
  }
  
  /**
   * Scrape performance reviews from forums and vendor sites
   */
  static async scrapePerformanceReviews(
    partName: string,
    carMake: string,
    carModel: string
  ): Promise<PerformanceReview[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/scraping/performance-reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partName, carMake, carModel }),
      });
      
      if (!response.ok) {
        throw new Error('Review scraping failed');
      }
      
      return await response.json() as PerformanceReview[];
    } catch (error) {
      console.error('Review scraping error:', error);
      return this.getMockReviewData(partName);
    }
  }
  
  /**
   * Monitor price changes for saved parts
   */
  static async monitorPriceChanges(partIds: string[]): Promise<{
    [partId: string]: {
      currentPrice: number;
      priceChange: number;
      priceChangePercent: number;
      priceHistory: { date: Date; price: number }[];
      alert: 'price-drop' | 'price-increase' | 'back-in-stock' | null;
    };
  }> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/scraping/price-monitoring`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partIds }),
      });
      
      if (!response.ok) {
        throw new Error('Price monitoring failed');
      }
      
      return await response.json() as {
        [partId: string]: {
          currentPrice: number;
          priceChange: number;
          priceChangePercent: number;
          priceHistory: { date: Date; price: number }[];
          alert: 'price-drop' | 'price-increase' | 'back-in-stock' | null;
        };
      };
    } catch (error) {
      console.error('Price monitoring error:', error);
      return this.getMockPriceMonitoring(partIds);
    }
  }
  
  /**
   * Find compatible parts based on current modifications
   */
  static async findCompatibleParts(
    carMake: string,
    carModel: string,
    carYear: number,
    existingMods: string[]
  ): Promise<{
    compatible: ScrapedPartData[];
    conflicts: { part: ScrapedPartData; conflictReason: string }[];
    recommendations: ScrapedPartData[];
  }> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/scraping/compatibility-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carMake, carModel, carYear, existingMods }),
      });
      
      if (!response.ok) {
        throw new Error('Compatibility check failed');
      }
      
      return await response.json() as {
        compatible: ScrapedPartData[];
        conflicts: { part: ScrapedPartData; conflictReason: string }[];
        recommendations: ScrapedPartData[];
      };
    } catch (error) {
      console.error('Compatibility check error:', error);
      return this.getMockCompatibilityData();
    }
  }
  
  // ===== MOCK DATA METHODS FOR DEVELOPMENT =====
  
  private static getMockPartsData(make: string, model: string, year: number, category: string): ScrapedPartData[] {
    const mockParts: ScrapedPartData[] = [];
    
    if (category.toLowerCase() === 'engine') {
      mockParts.push({
        name: 'Cold Air Intake System',
        brand: 'K&N',
        partNumber: 'KN-57-0643',
        price: 249.99,
        originalPrice: 299.99,
        availability: 'in-stock',
        vendorName: 'Summit Racing',
        vendorUrl: 'https://summitracing.com',
        imageUrl: 'https://example.com/cold-air-intake.jpg',
        description: 'High-flow cold air intake system designed to increase airflow and horsepower',
        reviews: {
          averageRating: 4.5,
          totalReviews: 127,
          highlights: ['Easy installation', 'Noticeable power gain', 'Great sound'],
        },
        specifications: {
          'Material': 'Aluminum',
          'Filter Type': 'Reusable Cotton',
          'Expected HP Gain': '10-15 HP',
        },
        compatibilityNotes: [`Compatible with ${year} ${make} ${model}`, 'May require tune for optimal performance'],
        shippingInfo: {
          estimatedDays: 3,
          cost: 15.99,
          freeShippingThreshold: 99,
        },
        lastUpdated: new Date(),
      });
      
      mockParts.push({
        name: 'Performance Turbocharger',
        brand: 'Garrett',
        partNumber: 'GTX2863R',
        price: 2899.99,
        availability: 'backorder',
        vendorName: 'TurboTechRacing',
        vendorUrl: 'https://turbotechracing.com',
        description: 'High-performance turbocharger for significant power gains',
        reviews: {
          averageRating: 4.8,
          totalReviews: 45,
          highlights: ['Massive power gains', 'Excellent build quality', 'Professional installation recommended'],
        },
        specifications: {
          'Compressor Wheel': 'Forged billet',
          'Expected HP Gain': '80-120 HP',
          'Max Boost': '25 PSI',
        },
        compatibilityNotes: [`Requires supporting modifications for ${year} ${make} ${model}`, 'Professional installation highly recommended'],
        shippingInfo: {
          estimatedDays: 14,
          cost: 0,
        },
        lastUpdated: new Date(),
      });
    }
    
    if (category.toLowerCase() === 'exhaust') {
      mockParts.push({
        name: 'Cat-Back Exhaust System',
        brand: 'Borla',
        partNumber: 'BOR-140759',
        price: 899.99,
        availability: 'in-stock',
        vendorName: 'AutoZone Pro',
        vendorUrl: 'https://autozonepro.com',
        description: 'Performance cat-back exhaust system with aggressive sound',
        reviews: {
          averageRating: 4.3,
          totalReviews: 89,
          highlights: ['Aggressive sound', 'Quality construction', 'Moderate power gain'],
        },
        specifications: {
          'Material': '304 Stainless Steel',
          'Tip Size': '4 inch',
          'Sound Level': 'Aggressive',
          'Expected HP Gain': '8-12 HP',
        },
        compatibilityNotes: [`Direct fit for ${year} ${make} ${model}`, 'No modifications required'],
        shippingInfo: {
          estimatedDays: 5,
          cost: 0,
          freeShippingThreshold: 50,
        },
        lastUpdated: new Date(),
      });
    }
    
    return mockParts;
  }
  
  private static getMockPricingData(partNumbers: string[]): { [partNumber: string]: ScrapedPartData[] } {
    const result: { [partNumber: string]: ScrapedPartData[] } = {};
    
    partNumbers.forEach(partNumber => {
      result[partNumber] = [
        {
          name: `Part ${partNumber}`,
          brand: 'Generic',
          partNumber,
          price: 199.99 + Math.random() * 500,
          availability: 'in-stock',
          vendorName: 'Vendor A',
          vendorUrl: 'https://vendora.com',
          description: 'High-quality performance part',
          reviews: {
            averageRating: 4.0 + Math.random(),
            totalReviews: Math.floor(Math.random() * 100),
            highlights: ['Good quality', 'Fair price', 'Easy install'],
          },
          specifications: {},
          compatibilityNotes: [],
          shippingInfo: {
            estimatedDays: 3,
            cost: 15.99,
          },
          lastUpdated: new Date(),
        },
      ];
    });
    
    return result;
  }
  
  private static getMockMarketAnalysis(categories: string[]): MarketAnalysis[] {
    return categories.map(category => ({
      partName: `${category} Parts`,
      averagePrice: 300 + Math.random() * 700,
      priceRange: [100 + Math.random() * 200, 800 + Math.random() * 500],
      bestDeal: this.getMockPartsData('BMW', 'M3', 2023, category)[0],
      marketTrend: ['rising', 'falling', 'stable'][Math.floor(Math.random() * 3)] as 'rising' | 'falling' | 'stable',
      popularityScore: Math.random() * 100,
      competitorCount: Math.floor(Math.random() * 20) + 5,
      lastAnalyzed: new Date(),
    }));
  }
  
  private static getMockReviewData(partName: string): PerformanceReview[] {
    return [
      {
        partId: 'mock-part-1',
        userRating: 4.5,
        performanceGain: 8.2,
        reliabilityRating: 4.3,
        installationDifficulty: 3.0,
        valueForMoney: 4.1,
        reviewText: `Great ${partName}! Noticed immediate improvement in performance and sound.`,
        verifiedPurchase: true,
        vehicleInfo: {
          make: 'BMW',
          model: 'M3',
          year: 2023,
        },
        createdAt: new Date(),
      },
      {
        partId: 'mock-part-2',
        userRating: 3.8,
        performanceGain: 5.5,
        reliabilityRating: 4.0,
        installationDifficulty: 4.2,
        valueForMoney: 3.5,
        reviewText: `Installation was challenging but worth it. ${partName} delivers as promised.`,
        verifiedPurchase: true,
        vehicleInfo: {
          make: 'Toyota',
          model: 'Supra',
          year: 2022,
        },
        createdAt: new Date(),
      },
    ];
  }
  
  private static getMockPriceMonitoring(partIds: string[]) {
    const result: any = {};
    
    partIds.forEach(partId => {
      const currentPrice = 299.99 + Math.random() * 500;
      const priceChange = (Math.random() - 0.5) * 50;
      
      result[partId] = {
        currentPrice,
        priceChange,
        priceChangePercent: (priceChange / currentPrice) * 100,
        priceHistory: [
          { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), price: currentPrice - priceChange },
          { date: new Date(), price: currentPrice },
        ],
        alert: priceChange < -20 ? 'price-drop' : null,
      };
    });
    
    return result;
  }
  
  private static getMockCompatibilityData() {
    return {
      compatible: this.getMockPartsData('BMW', 'M3', 2023, 'engine').slice(0, 3),
      conflicts: [
        {
          part: this.getMockPartsData('BMW', 'M3', 2023, 'engine')[1],
          conflictReason: 'May conflict with existing cold air intake system',
        },
      ],
      recommendations: this.getMockPartsData('BMW', 'M3', 2023, 'exhaust'),
    };
  }
}
