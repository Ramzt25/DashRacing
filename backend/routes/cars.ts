import { FastifyInstance } from 'fastify';
import { prisma } from '../prisma.js';
import { z } from 'zod';
import { authGuard } from '../auth.js';
import VehicleDatabaseService from '../services/VehicleDatabaseService.js';

const carSchema = z.object({
  name: z.string(),
  year: z.number().int().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  trim: z.string().optional(),
  weightKg: z.number().optional(),
  whp: z.number().optional(),
  drivetrain: z.string().optional(),
  useAIEnrichment: z.boolean().optional().default(true), // New flag for AI enrichment
});

// AI Vehicle Data Service import
class AIVehicleDataService {
  static async enrichVehicleData(make: string, model: string, year: number, trim?: string): Promise<any> {
    try {
      // Call the AI enrichment API
      const response = await fetch(`http://localhost:4000/ai/enrich-vehicle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ make, model, year, trim }),
      });
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('AI enrichment failed, using basic data:', error);
    }
    
    return null;
  }
}

export async function registerCarRoutes(app: FastifyInstance) {
  app.post('/cars', { preHandler: [authGuard] }, async (req: any) => {
    const body = carSchema.parse(req.body);
    
    let enrichedData = null;
    
    // Use AI enrichment if requested and we have enough data
    if (body.useAIEnrichment && body.make && body.model && body.year) {
      try {
        console.log(`🤖 Using VehicleDatabase service for: ${body.year} ${body.make} ${body.model}`);
        enrichedData = await VehicleDatabaseService.getVehicleData(
          body.year, 
          body.make, 
          body.model, 
          body.trim,
          req.user.sub // Pass user ID for tracking
        );
      } catch (error) {
        console.warn('Vehicle database enrichment failed:', error);
      }
    }
    
    // Prepare car data
    const carData: any = {
      name: body.name,
      userId: req.user.sub,
      year: body.year,
      make: body.make,
      model: body.model,
      trim: body.trim,
      weightKg: body.weightKg,
      whp: body.whp,
      drivetrain: body.drivetrain,
    };
    
    // Enhance with AI data if available
    if (enrichedData) {
      const selectedTrim = enrichedData.availableTrims?.[0] || enrichedData;
      
      // Instead of creating enrichedData field, populate existing car fields with AI data
      carData.whp = carData.whp || selectedTrim.performance?.horsepower || enrichedData.performance?.horsepower;
      carData.weightKg = carData.weightKg || selectedTrim.specifications?.weightKg || enrichedData.specifications?.weightKg;
      carData.drivetrain = carData.drivetrain || enrichedData.vehicle?.drivetrain || enrichedData.drivetrain?.type;
      
      // Set AI analysis fields
      carData.basePower = selectedTrim.performance?.horsepower || enrichedData.performance?.horsepower;
      carData.baseTorque = selectedTrim.performance?.torque || enrichedData.performance?.torque;
      carData.baseWeight = selectedTrim.specifications?.weightKg || enrichedData.specifications?.weightKg;
      carData.currentPower = carData.whp;
      carData.currentTorque = carData.baseTorque;
      carData.currentWeight = carData.weightKg;
      carData.performanceScore = enrichedData.performanceScore || 200;
      carData.aiAnalysisDate = new Date();
      
      // Set estimated value from AI data
      carData.estimatedValue = enrichedData.marketData?.currentMarketValue || enrichedData.currentMarketValue;
      
      // Link to vehicle database entry if available
      if (enrichedData.databaseId) {
        carData.vehicleDataId = enrichedData.databaseId;
      }
    }
    
    const car = await prisma.car.create({ 
      data: carData,
      include: { 
        modifications: true
        // vehicleData will be available after migration
      }
    });
    
    return {
      ...car,
      aiEnriched: !!enrichedData,
      vehicleDbData: enrichedData || null,
      enrichmentSource: enrichedData?.dataSource || null,
      confidence: enrichedData?.confidence || null,
    };
  });

  app.get('/cars', { preHandler: [authGuard] }, async (req: any) => {
    const userId = (req.query as any).userId ?? req.user.sub;
    const cars = await prisma.car.findMany({ where: { userId }, include: { modifications: true } });
    return cars;
  });

  app.patch('/cars/:id', { preHandler: [authGuard] }, async (req: any, reply) => {
    const { id } = req.params as any;
    const body = carSchema.partial().parse(req.body);
    const car = await prisma.car.update({ where: { id }, data: body });
    return car;
  });

  app.post('/cars/:id/mods', { preHandler: [authGuard] }, async (req: any) => {
    const { id } = req.params as any;
    const mod = await prisma.modification.create({ data: { carId: id, ...(req.body as any) } });
    return mod;
  });
}
