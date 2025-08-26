import { prisma } from '../prisma.js';

/**
 * VehicleDatabase Service - Manages our growing AI-powered vehicle knowledge base
 * 
 * Features:
 * - Intelligent caching to avoid redundant AI calls
 * - Growing database that learns from user queries
 * - Popularity-based optimization
 * - Data verification and quality scoring
 * - Cost-effective AI usage
 */
export class VehicleDatabaseService {
  
  /**
   * Get vehicle data - checks cache first, generates with AI if needed
   */
  static async getVehicleData(year: number, make: string, model: string, trim?: string, userId?: string): Promise<any> {
    try {
      // Step 1: Check if we have this vehicle in our database
      const existingVehicle = await this.findExistingVehicle(year, make, model, trim);
      
      if (existingVehicle) {
        // Update usage statistics
        await this.updateUsageStats(existingVehicle.id);
        
        console.log(`📊 Vehicle data found in database: ${year} ${make} ${model} ${trim || ''}`);
        console.log(`   Lookup count: ${existingVehicle.lookupCount + 1}, Confidence: ${existingVehicle.confidence}`);
        
        return this.formatVehicleDataResponse(existingVehicle, 'Database Cache');
      }
      
      // Step 2: Vehicle not in database - generate with AI
      console.log(`🤖 Generating new vehicle data: ${year} ${make} ${model} ${trim || ''}`);
      const aiData = await this.generateVehicleDataWithAI(year, make, model, trim);
      
      if (!aiData) {
        console.log('⚠️  AI generation failed, using fallback data');
        return this.createFallbackVehicleData(year, make, model, trim);
      }
      
      // Step 3: Store in our database for future use
      const storedVehicle = await this.storeVehicleData(aiData, userId);
      
      console.log(`✅ New vehicle data stored in database with ID: ${storedVehicle.id}`);
      
      return this.formatVehicleDataResponse(storedVehicle, 'AI-Generated & Cached');
      
    } catch (error) {
      console.error('VehicleDatabase error:', error);
      return this.createFallbackVehicleData(year, make, model, trim);
    }
  }
  
  /**
   * Find existing vehicle in our database
   */
  private static async findExistingVehicle(year: number, make: string, model: string, trim?: string) {
    // Try exact match first
    let vehicle = await prisma.vehicleDatabase.findUnique({
      where: {
        year_make_model_trim: {
          year,
          make: make.toLowerCase(),
          model: model.toLowerCase(),
          trim: trim?.toLowerCase() || null
        }
      }
    });
    
    // If no exact match and trim was provided, try without trim
    if (!vehicle && trim) {
      vehicle = await prisma.vehicleDatabase.findFirst({
        where: {
          year,
          make: make.toLowerCase(),
          model: model.toLowerCase(),
          trim: null
        },
        orderBy: [
          { popularityScore: 'desc' },
          { lookupCount: 'desc' }
        ]
      });
    }
    
    // If still no match, try fuzzy matching on make/model
    if (!vehicle) {
      vehicle = await prisma.vehicleDatabase.findFirst({
        where: {
          year,
          make: {
            contains: make.toLowerCase()
          },
          model: {
            contains: model.toLowerCase()
          }
        },
        orderBy: [
          { confidence: 'desc' },
          { popularityScore: 'desc' }
        ]
      });
    }
    
    return vehicle;
  }
  
  /**
   * Update usage statistics for a vehicle
   */
  private static async updateUsageStats(vehicleId: string) {
    await prisma.vehicleDatabase.update({
      where: { id: vehicleId },
      data: {
        lookupCount: { increment: 1 },
        lastUsed: new Date(),
        popularityScore: { increment: 0.1 } // Increase popularity
      }
    });
  }
  
  /**
   * Generate vehicle data using AI
   */
  private static async generateVehicleDataWithAI(year: number, make: string, model: string, trim?: string): Promise<any> {
    if (!process.env.OPENAI_API_KEY) {
      console.log('⚠️  OpenAI API key not configured');
      return null;
    }
    
    const vehicleString = `${year} ${make} ${model}${trim ? ` ${trim}` : ''}`;
    
    const prompt = `As an automotive expert, provide comprehensive data for this vehicle: ${vehicleString}

Please provide detailed information in this exact JSON format:
{
  "vehicle": {
    "year": ${year},
    "make": "${make}",
    "model": "${model}",
    "trim": "${trim || ''}",
    "generation": "Vehicle generation code (e.g., F80, E46)",
    "category": "Vehicle category (Sports Car, Sedan, SUV, etc.)",
    "bodyStyle": "Body style (Coupe, Sedan, Hatchback, etc.)",
    "vehicleClass": "Size class (Compact, Mid-size, Full-size)",
    "segment": "Market segment (Entry-level, Luxury, Performance)"
  },
  "engine": {
    "displacement": 3.0,
    "configuration": "V6",
    "aspiration": "Turbocharged",
    "fuelType": "Gasoline"
  },
  "performance": {
    "horsepower": 400,
    "horsepowerWheel": 350,
    "torque": 350,
    "acceleration0to60": 4.2,
    "quarterMile": 12.5,
    "topSpeed": 155,
    "powerToWeight": 0.12
  },
  "specifications": {
    "weight": 3500,
    "weightKg": 1588,
    "length": 185.7,
    "width": 73.2,
    "height": 54.8,
    "wheelbase": 110.2
  },
  "drivetrain": {
    "type": "RWD",
    "transmission": "8-Speed Automatic",
    "gears": 8
  },
  "marketData": {
    "originalMSRP": 45000,
    "currentMarketValue": 38000,
    "productionYears": "2015-2023",
    "productionNumbers": 150000
  },
  "aiInsights": [
    "This vehicle offers excellent performance for its price range",
    "Known for reliable drivetrain and strong aftermarket support",
    "Popular choice for both daily driving and track use"
  ],
  "commonModifications": [
    {
      "category": "Engine",
      "name": "Cold Air Intake",
      "powerGain": 15,
      "torqueGain": 12,
      "cost": 350,
      "difficulty": "Easy",
      "popularity": 95
    },
    {
      "category": "Exhaust",
      "name": "Cat-Back Exhaust",
      "powerGain": 20,
      "torqueGain": 18,
      "cost": 1200,
      "difficulty": "Moderate",
      "popularity": 88
    }
  ],
  "reliabilityScore": 0.85,
  "performanceScore": 425,
  "valueScore": 0.78,
  "confidence": 0.92
}

Important guidelines:
1. Provide realistic, accurate specifications based on the actual vehicle
2. Include only modifications that are appropriate for this specific vehicle
3. Use real-world market values and production data
4. Ensure all numeric values are realistic and properly scaled
5. Consider the vehicle's actual performance characteristics

Only return valid JSON, no additional text.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a professional automotive engineer and historian with comprehensive knowledge of vehicle specifications, performance data, and market information. Provide accurate, detailed vehicle data based on real-world specifications.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2, // Lower temperature for more factual responses
          max_tokens: 2500
        })
      });
      
      if (!response.ok) {
        console.error(`OpenAI API error: ${response.status}`);
        return null;
      }
      
      const data = await response.json() as any;
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        console.error('No content received from OpenAI');
        return null;
      }
      
      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No valid JSON found in OpenAI response');
        return null;
      }
      
      const vehicleData = JSON.parse(jsonMatch[0]);
      
      // Add metadata
      vehicleData.dataSource = 'AI-Generated';
      vehicleData.aiModel = 'gpt-4o-mini';
      vehicleData.generatedAt = new Date().toISOString();
      
      return vehicleData;
      
    } catch (error) {
      console.error('OpenAI vehicle generation failed:', error);
      return null;
    }
  }
  
  /**
   * Store AI-generated vehicle data in our database
   */
  private static async storeVehicleData(aiData: any, userId?: string) {
    try {
      const vehicle = aiData.vehicle || {};
      const engine = aiData.engine || {};
      const performance = aiData.performance || {};
      const specifications = aiData.specifications || {};
      const drivetrain = aiData.drivetrain || {};
      const marketData = aiData.marketData || {};
      
      const storedVehicle = await prisma.vehicleDatabase.create({
        data: {
          // Vehicle identification
          year: vehicle.year,
          make: vehicle.make?.toLowerCase(),
          model: vehicle.model?.toLowerCase(),
          trim: vehicle.trim?.toLowerCase() || null,
          generation: vehicle.generation,
          
          // Classification
          category: vehicle.category,
          bodyStyle: vehicle.bodyStyle,
          vehicleClass: vehicle.vehicleClass,
          segment: vehicle.segment,
          
          // Engine
          engineDisplacement: engine.displacement,
          engineConfiguration: engine.configuration,
          aspiration: engine.aspiration,
          fuelType: engine.fuelType,
          
          // Performance
          horsepower: performance.horsepower,
          horsepowerWheel: performance.horsepowerWheel,
          torque: performance.torque,
          acceleration0to60: performance.acceleration0to60,
          quarterMile: performance.quarterMile,
          topSpeed: performance.topSpeed,
          powerToWeight: performance.powerToWeight,
          
          // Specifications
          weight: specifications.weight,
          weightKg: specifications.weightKg,
          length: specifications.length,
          width: specifications.width,
          height: specifications.height,
          wheelbase: specifications.wheelbase,
          
          // Drivetrain
          drivetrain: drivetrain.type,
          transmission: drivetrain.transmission,
          gears: drivetrain.gears,
          
          // Market data
          originalMSRP: marketData.originalMSRP,
          currentMarketValue: marketData.currentMarketValue,
          productionYears: marketData.productionYears,
          productionNumbers: marketData.productionNumbers,
          
          // AI data
          aiInsights: aiData.aiInsights || [],
          commonModifications: aiData.commonModifications || [],
          reliabilityScore: aiData.reliabilityScore,
          performanceScore: aiData.performanceScore,
          valueScore: aiData.valueScore,
          
          // Metadata
          dataSource: 'AI-Generated',
          confidence: aiData.confidence || 0.8,
          aiModel: 'gpt-4o-mini',
          generatedBy: userId,
          
          // Initialize usage stats
          lookupCount: 1,
          lastUsed: new Date(),
          popularityScore: 0
        }
      });
      
      return storedVehicle;
      
    } catch (error) {
      console.error('Failed to store vehicle data:', error);
      throw error;
    }
  }
  
  /**
   * Format vehicle data for API response
   */
  private static formatVehicleDataResponse(vehicleData: any, source: string) {
    return {
      vehicle: {
        year: vehicleData.year,
        make: vehicleData.make,
        model: vehicleData.model,
        trim: vehicleData.trim,
        generation: vehicleData.generation,
        category: vehicleData.category,
        bodyStyle: vehicleData.bodyStyle,
        drivetrain: vehicleData.drivetrain
      },
      engine: {
        displacement: vehicleData.engineDisplacement,
        configuration: vehicleData.engineConfiguration,
        aspiration: vehicleData.aspiration,
        fuelType: vehicleData.fuelType
      },
      performance: {
        horsepower: vehicleData.horsepower,
        horsepowerWheel: vehicleData.horsepowerWheel,
        torque: vehicleData.torque,
        acceleration0to60: vehicleData.acceleration0to60,
        quarterMile: vehicleData.quarterMile,
        topSpeed: vehicleData.topSpeed,
        powerToWeight: vehicleData.powerToWeight
      },
      specifications: {
        weight: vehicleData.weight,
        weightKg: vehicleData.weightKg,
        length: vehicleData.length,
        width: vehicleData.width,
        height: vehicleData.height,
        wheelbase: vehicleData.wheelbase
      },
      marketData: {
        originalMSRP: vehicleData.originalMSRP,
        currentMarketValue: vehicleData.currentMarketValue,
        productionYears: vehicleData.productionYears,
        productionNumbers: vehicleData.productionNumbers
      },
      aiInsights: vehicleData.aiInsights || [],
      commonModifications: vehicleData.commonModifications || [],
      
      // Metadata
      dataSource: source,
      confidence: vehicleData.confidence,
      databaseId: vehicleData.id,
      lookupCount: vehicleData.lookupCount,
      popularityScore: vehicleData.popularityScore,
      lastUsed: vehicleData.lastUsed,
      isVerified: vehicleData.isVerified
    };
  }
  
  /**
   * Create fallback vehicle data when AI fails
   */
  private static createFallbackVehicleData(year: number, make: string, model: string, trim?: string) {
    return {
      vehicle: { year, make, model, trim, category: 'Unknown' },
      engine: {},
      performance: {},
      specifications: {},
      marketData: {},
      aiInsights: ['Data not available - please add vehicle manually'],
      commonModifications: [],
      dataSource: 'Fallback',
      confidence: 0.1
    };
  }
  
  /**
   * Get popular vehicles from our database
   */
  static async getPopularVehicles(limit: number = 20) {
    return await prisma.vehicleDatabase.findMany({
      take: limit,
      orderBy: [
        { popularityScore: 'desc' },
        { lookupCount: 'desc' }
      ],
      select: {
        id: true,
        year: true,
        make: true,
        model: true,
        trim: true,
        category: true,
        bodyStyle: true,
        horsepower: true,
        lookupCount: true,
        popularityScore: true,
        confidence: true
      }
    });
  }
  
  /**
   * Get database statistics
   */
  static async getDatabaseStats() {
    const totalVehicles = await prisma.vehicleDatabase.count();
    const verifiedVehicles = await prisma.vehicleDatabase.count({ where: { isVerified: true } });
    const aiGenerated = await prisma.vehicleDatabase.count({ where: { dataSource: 'AI-Generated' } });
    const totalLookups = await prisma.vehicleDatabase.aggregate({
      _sum: { lookupCount: true }
    });
    
    const topMakes = await prisma.vehicleDatabase.groupBy({
      by: ['make'],
      _count: { make: true },
      orderBy: { _count: { make: 'desc' } },
      take: 10
    });
    
    return {
      totalVehicles,
      verifiedVehicles,
      aiGenerated,
      totalLookups: totalLookups._sum.lookupCount || 0,
      verificationRate: totalVehicles > 0 ? (verifiedVehicles / totalVehicles) : 0,
      topMakes: topMakes.map(m => ({ make: m.make, count: m._count.make }))
    };
  }
}

export default VehicleDatabaseService;