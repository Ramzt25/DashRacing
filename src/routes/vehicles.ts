import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

// Simple fallback service for vehicles
class VehicleService {
  static async searchVehicles(params: any) {
    return [
      { make: 'Toyota', model: 'Camry', year: 2024, type: 'sedan' },
      { make: 'Honda', model: 'Civic', year: 2024, type: 'sedan' },
      { make: 'Ford', model: 'Mustang', year: 2024, type: 'coupe' }
    ];
  }

  static async getVehicleDetails(make: string, model: string, year: number) {
    return {
      make,
      model,
      year,
      type: 'sedan',
      engine: '2.0L',
      mpg: 28,
      price: 25000
    };
  }

  static async getVehicleTrims(make: string, model: string, year: number) {
    return [
      { name: 'Base', price: 25000 },
      { name: 'Sport', price: 28000 },
      { name: 'Premium', price: 32000 }
    ];
  }

  static async getVehiclePricing(make: string, model: string, year: number, trim?: string, zip?: string) {
    return {
      msrp: 25000,
      invoice: 23000,
      marketPrice: 24000,
      trim: trim || 'Base'
    };
  }

  static async getVehicleSpecifications(make: string, model: string, year: number) {
    return {
      engine: '2.0L 4-cylinder',
      horsepower: 190,
      torque: 180,
      transmission: 'CVT',
      mpgCity: 25,
      mpgHighway: 32
    };
  }

  static async getVehicleReviews(make: string, model: string, year: number) {
    return [
      { rating: 4.5, review: 'Great car for daily driving', reviewer: 'CarExpert' }
    ];
  }

  static async getVehicleRecalls(make: string, model: string, year: number) {
    return [];
  }

  static async compareVehicles(vehicles: any[]) {
    return {
      comparison: vehicles.map(v => ({
        ...v,
        rating: 4.2,
        price: 25000
      }))
    };
  }

  static async getPopularVehicles() {
    return [
      { make: 'Toyota', model: 'Camry', popularity: 95 },
      { make: 'Honda', model: 'Civic', popularity: 90 }
    ];
  }

  static async getVehicleMakes() {
    return ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan'];
  }

  static async getModelsForMake(make: string) {
    const models: Record<string, string[]> = {
      Toyota: ['Camry', 'Corolla', 'Prius', 'RAV4'],
      Honda: ['Civic', 'Accord', 'CR-V', 'Pilot'],
      Ford: ['Mustang', 'F-150', 'Explorer', 'Focus']
    };
    return models[make] || [];
  }
}

interface VehicleSearchParams {
  make?: string;
  model?: string;
  year?: number;
  limit?: number;
}

interface VehicleDetailsParams {
  make: string;
  model: string;
  year: number;
}

interface VehicleTrimsParams {
  make: string;
  model: string;
  year: number;
}

interface VehiclePricingParams {
  make: string;
  model: string;
  year: number;
  trim?: string;
  zip?: string;
}

export default async function vehicleRoutes(fastify: FastifyInstance) {
  // Search vehicles
  fastify.get<{
    Querystring: VehicleSearchParams;
  }>('/search', async (request: FastifyRequest<{ Querystring: VehicleSearchParams }>, reply: FastifyReply) => {
    try {
      const { make, model, year, limit = 20 } = request.query;

      const vehicles = await VehicleService.searchVehicles({
        make,
        model,
        year,
        limit,
      });

      reply.send({
        success: true,
        data: vehicles,
        count: vehicles.length,
      });
    } catch (error) {
      fastify.log.error('Vehicle search failed');
      reply.status(500).send({
        success: false,
        error: 'Failed to search vehicles',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Get vehicle details
  fastify.get<{
    Params: VehicleDetailsParams;
  }>('/details/:make/:model/:year', async (request: FastifyRequest<{ Params: VehicleDetailsParams }>, reply: FastifyReply) => {
    try {
      const { make, model, year } = request.params;

      const details = await VehicleService.getVehicleDetails(make, model, year);

      if (!details) {
        reply.status(404).send({
          success: false,
          error: 'Vehicle not found',
          message: `No details found for ${year} ${make} ${model}`,
        });
        return;
      }

      reply.send({
        success: true,
        data: details,
      });
    } catch (error) {
      fastify.log.error('Failed to get vehicle details');
      reply.status(500).send({
        success: false,
        error: 'Failed to get vehicle details',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Get vehicle trims
  fastify.get<{
    Params: VehicleTrimsParams;
  }>('/trims/:make/:model/:year', async (request: FastifyRequest<{ Params: VehicleTrimsParams }>, reply: FastifyReply) => {
    try {
      const { make, model, year } = request.params;

      const trims = await VehicleService.getVehicleTrims(make, model, year);

      reply.send({
        success: true,
        data: trims,
        count: trims.length,
      });
    } catch (error) {
      fastify.log.error('Failed to get vehicle trims');
      reply.status(500).send({
        success: false,
        error: 'Failed to get vehicle trims',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Get vehicle pricing
  fastify.get<{
    Params: VehicleDetailsParams;
    Querystring: { trim?: string; zip?: string };
  }>('/pricing/:make/:model/:year', async (request: FastifyRequest<{ 
    Params: VehicleDetailsParams; 
    Querystring: { trim?: string; zip?: string };
  }>, reply: FastifyReply) => {
    try {
      const { make, model, year } = request.params;
      const { trim, zip } = request.query;

      const pricing = await VehicleService.getVehiclePricing(make, model, year, trim, zip);

      if (!pricing) {
        reply.status(404).send({
          success: false,
          error: 'Pricing not found',
          message: `No pricing found for ${year} ${make} ${model}`,
        });
        return;
      }

      reply.send({
        success: true,
        data: pricing,
      });
    } catch (error) {
      fastify.log.error('Failed to get vehicle pricing');
      reply.status(500).send({
        success: false,
        error: 'Failed to get vehicle pricing',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Get vehicle specifications
  fastify.get<{
    Params: VehicleDetailsParams;
  }>('/specs/:make/:model/:year', async (request: FastifyRequest<{ Params: VehicleDetailsParams }>, reply: FastifyReply) => {
    try {
      const { make, model, year } = request.params;

      const specs = await VehicleService.getVehicleSpecifications(make, model, year);

      if (!specs) {
        reply.status(404).send({
          success: false,
          error: 'Specifications not found',
          message: `No specifications found for ${year} ${make} ${model}`,
        });
        return;
      }

      reply.send({
        success: true,
        data: specs,
      });
    } catch (error) {
      fastify.log.error('Failed to get vehicle specifications');
      reply.status(500).send({
        success: false,
        error: 'Failed to get vehicle specifications',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Get vehicle reviews
  fastify.get<{
    Params: VehicleDetailsParams;
  }>('/reviews/:make/:model/:year', async (request: FastifyRequest<{ Params: VehicleDetailsParams }>, reply: FastifyReply) => {
    try {
      const { make, model, year } = request.params;

      const reviews = await VehicleService.getVehicleReviews(make, model, year);

      reply.send({
        success: true,
        data: reviews,
        count: reviews.length,
      });
    } catch (error) {
      fastify.log.error('Failed to get vehicle reviews');
      reply.status(500).send({
        success: false,
        error: 'Failed to get vehicle reviews',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Get vehicle recalls
  fastify.get<{
    Params: VehicleDetailsParams;
  }>('/recalls/:make/:model/:year', async (request: FastifyRequest<{ Params: VehicleDetailsParams }>, reply: FastifyReply) => {
    try {
      const { make, model, year } = request.params;

      const recalls = await VehicleService.getVehicleRecalls(make, model, year);

      reply.send({
        success: true,
        data: recalls,
        count: recalls.length,
        hasRecalls: recalls.length > 0,
      });
    } catch (error) {
      fastify.log.error('Failed to get vehicle recalls');
      reply.status(500).send({
        success: false,
        error: 'Failed to get vehicle recalls',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Compare vehicles
  fastify.post<{
    Body: {
      vehicles: Array<{
        make: string;
        model: string;
        year: number;
      }>;
    };
  }>('/compare', async (request: FastifyRequest<{
    Body: {
      vehicles: Array<{
        make: string;
        model: string;
        year: number;
      }>;
    };
  }>, reply: FastifyReply) => {
    try {
      const { vehicles } = request.body;

      if (!vehicles || vehicles.length < 2) {
        reply.status(400).send({
          success: false,
          error: 'Invalid request',
          message: 'At least 2 vehicles are required for comparison',
        });
        return;
      }

      if (vehicles.length > 5) {
        reply.status(400).send({
          success: false,
          error: 'Too many vehicles',
          message: 'Maximum 5 vehicles can be compared at once',
        });
        return;
      }

      const comparison = await VehicleService.compareVehicles(vehicles);

      reply.send({
        success: true,
        data: comparison,
      });
    } catch (error) {
      fastify.log.error('Vehicle comparison failed');
      reply.status(500).send({
        success: false,
        error: 'Failed to compare vehicles',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Get popular vehicles
  fastify.get('/popular', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const popular = await VehicleService.getPopularVehicles();

      reply.send({
        success: true,
        data: popular,
        count: popular.length,
      });
    } catch (error) {
      fastify.log.error('Failed to get popular vehicles');
      reply.status(500).send({
        success: false,
        error: 'Failed to get popular vehicles',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Get vehicle makes
  fastify.get('/makes', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const makes = await VehicleService.getVehicleMakes();

      reply.send({
        success: true,
        data: makes,
        count: makes.length,
      });
    } catch (error) {
      fastify.log.error('Failed to get vehicle makes');
      reply.status(500).send({
        success: false,
        error: 'Failed to get vehicle makes',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Get models for a make
  fastify.get<{
    Params: { make: string };
  }>('/makes/:make/models', async (request: FastifyRequest<{ Params: { make: string } }>, reply: FastifyReply) => {
    try {
      const { make } = request.params;

      const models = await VehicleService.getModelsForMake(make);

      reply.send({
        success: true,
        data: models,
        count: models.length,
        make,
      });
    } catch (error) {
      fastify.log.error('Failed to get models for make');
      reply.status(500).send({
        success: false,
        error: 'Failed to get models',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Health check endpoint
  fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    reply.send({
      success: true,
      service: 'vehicle-api',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  });

  // Market insights endpoint
  fastify.post('/market-insights', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // For now, return sample market insights data
      const insights = {
        success: true,
        data: {
          marketTrends: {
            avgPrice: 28500,
            priceChange: '+2.3%',
            demandLevel: 'High',
            inventoryLevel: 'Medium'
          },
          popularModels: [
            { make: 'Toyota', model: 'Camry', popularity: 95 },
            { make: 'Honda', model: 'Civic', popularity: 90 },
            { make: 'Ford', model: 'F-150', popularity: 88 }
          ],
          insights: [
            'Electric vehicle adoption is accelerating',
            'SUV demand remains strong in current market',
            'Compact cars showing price stability'
          ]
        },
        timestamp: new Date().toISOString()
      };

      reply.send(insights);
    } catch (error) {
      fastify.log.error('Failed to get market insights');
      reply.status(500).send({
        success: false,
        error: 'Failed to get market insights',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}