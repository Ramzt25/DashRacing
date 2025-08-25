import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { EdmundsApiService } from '../services/EdmundsApiService';

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

      const vehicles = await EdmundsApiService.searchVehicles({
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

      const details = await EdmundsApiService.getVehicleDetails(make, model, year);

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

      const trims = await EdmundsApiService.getVehicleTrims(make, model, year);

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

      const pricing = await EdmundsApiService.getVehiclePricing(make, model, year, trim, zip);

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

      const specs = await EdmundsApiService.getVehicleSpecifications(make, model, year);

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

      const reviews = await EdmundsApiService.getVehicleReviews(make, model, year);

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

      const recalls = await EdmundsApiService.getVehicleRecalls(make, model, year);

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

      const comparison = await EdmundsApiService.compareVehicles(vehicles);

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
      const popular = await EdmundsApiService.getPopularVehicles();

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
      const makes = await EdmundsApiService.getVehicleMakes();

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

      const models = await EdmundsApiService.getModelsForMake(make);

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
}