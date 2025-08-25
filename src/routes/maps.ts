import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { GoogleMapsService } from '../services/GoogleMapsService';

interface LocationParams {
  latitude: number;
  longitude: number;
}

interface NearbyParams extends LocationParams {
  radius?: number;
  type?: string;
}

interface DirectionsParams {
  origin: string;
  destination: string;
  mode?: 'driving' | 'walking' | 'bicycling' | 'transit';
}

interface PlaceSearchParams {
  query: string;
  location?: string;
  radius?: number;
}

export default async function mapsRoutes(fastify: FastifyInstance) {
  // Get current location (for server-side geocoding)
  fastify.post<{
    Body: { address: string };
  }>('/geocode', async (request: FastifyRequest<{ Body: { address: string } }>, reply: FastifyReply) => {
    try {
      const { address } = request.body;

      if (!address) {
        reply.status(400).send({
          success: false,
          error: 'Address is required',
        });
        return;
      }

      const location = await GoogleMapsService.geocodeAddress(address);

      if (!location) {
        reply.status(404).send({
          success: false,
          error: 'Address not found',
          message: `Could not geocode address: ${address}`,
        });
        return;
      }

      reply.send({
        success: true,
        data: location,
      });
    } catch (error) {
      fastify.log.error('Geocoding failed');
      reply.status(500).send({
        success: false,
        error: 'Failed to geocode address',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Reverse geocode coordinates to address
  fastify.post<{
    Body: LocationParams;
  }>('/reverse-geocode', async (request: FastifyRequest<{ Body: LocationParams }>, reply: FastifyReply) => {
    try {
      const { latitude, longitude } = request.body;

      if (!latitude || !longitude) {
        reply.status(400).send({
          success: false,
          error: 'Latitude and longitude are required',
        });
        return;
      }

      const address = await GoogleMapsService.reverseGeocode(latitude, longitude);

      if (!address) {
        reply.status(404).send({
          success: false,
          error: 'Address not found',
          message: `Could not reverse geocode coordinates: ${latitude}, ${longitude}`,
        });
        return;
      }

      reply.send({
        success: true,
        data: { address },
      });
    } catch (error) {
      fastify.log.error('Reverse geocoding failed');
      reply.status(500).send({
        success: false,
        error: 'Failed to reverse geocode coordinates',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Get nearby racers
  fastify.post<{
    Body: NearbyParams;
  }>('/nearby-racers', async (request: FastifyRequest<{ Body: NearbyParams }>, reply: FastifyReply) => {
    try {
      const { latitude, longitude, radius = 5000 } = request.body;

      if (!latitude || !longitude) {
        reply.status(400).send({
          success: false,
          error: 'Latitude and longitude are required',
        });
        return;
      }

      const nearbyRacers = await GoogleMapsService.getNearbyRacers(latitude, longitude, radius);

      reply.send({
        success: true,
        data: nearbyRacers,
        count: nearbyRacers.length,
        radius,
        center: { latitude, longitude },
      });
    } catch (error) {
      fastify.log.error('Failed to get nearby racers');
      reply.status(500).send({
        success: false,
        error: 'Failed to get nearby racers',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Get race routes
  fastify.post<{
    Body: {
      raceId: string;
      startLocation: LocationParams;
      endLocation: LocationParams;
    };
  }>('/race-routes', async (request: FastifyRequest<{
    Body: {
      raceId: string;
      startLocation: LocationParams;
      endLocation: LocationParams;
    };
  }>, reply: FastifyReply) => {
    try {
      const { raceId, startLocation, endLocation } = request.body;

      if (!raceId || !startLocation || !endLocation) {
        reply.status(400).send({
          success: false,
          error: 'Race ID, start location, and end location are required',
        });
        return;
      }

      const routes = await GoogleMapsService.getRaceRoutes(
        startLocation.latitude,
        startLocation.longitude,
        endLocation.latitude,
        endLocation.longitude
      );

      reply.send({
        success: true,
        data: routes,
        raceId,
        count: routes.length,
      });
    } catch (error) {
      fastify.log.error('Failed to get race routes');
      reply.status(500).send({
        success: false,
        error: 'Failed to get race routes',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Get directions between two points
  fastify.post<{
    Body: DirectionsParams;
  }>('/directions', async (request: FastifyRequest<{ Body: DirectionsParams }>, reply: FastifyReply) => {
    try {
      const { origin, destination, mode = 'driving' } = request.body;

      if (!origin || !destination) {
        reply.status(400).send({
          success: false,
          error: 'Origin and destination are required',
        });
        return;
      }

      const directions = await GoogleMapsService.getDirections(origin, destination, mode);

      if (!directions) {
        reply.status(404).send({
          success: false,
          error: 'Directions not found',
          message: `Could not find directions from ${origin} to ${destination}`,
        });
        return;
      }

      reply.send({
        success: true,
        data: directions,
      });
    } catch (error) {
      fastify.log.error('Failed to get directions');
      reply.status(500).send({
        success: false,
        error: 'Failed to get directions',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Get traffic information
  fastify.post<{
    Body: {
      route: Array<LocationParams>;
    };
  }>('/traffic', async (request: FastifyRequest<{
    Body: {
      route: Array<LocationParams>;
    };
  }>, reply: FastifyReply) => {
    try {
      const { route } = request.body;

      if (!route || route.length < 2) {
        reply.status(400).send({
          success: false,
          error: 'Route with at least 2 points is required',
        });
        return;
      }

      const trafficInfo = await GoogleMapsService.getTrafficInfo(route);

      reply.send({
        success: true,
        data: trafficInfo,
      });
    } catch (error) {
      fastify.log.error('Failed to get traffic info');
      reply.status(500).send({
        success: false,
        error: 'Failed to get traffic information',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Search for nearby places
  fastify.post<{
    Body: PlaceSearchParams;
  }>('/search-places', async (request: FastifyRequest<{ Body: PlaceSearchParams }>, reply: FastifyReply) => {
    try {
      const { query, location, radius = 5000 } = request.body;

      if (!query) {
        reply.status(400).send({
          success: false,
          error: 'Search query is required',
        });
        return;
      }

      const places = await GoogleMapsService.searchNearbyPlaces(query, location, radius);

      reply.send({
        success: true,
        data: places,
        count: places.length,
        query,
        radius,
      });
    } catch (error) {
      fastify.log.error('Failed to search places');
      reply.status(500).send({
        success: false,
        error: 'Failed to search places',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Get elevation data for a route
  fastify.post<{
    Body: {
      route: Array<LocationParams>;
    };
  }>('/elevation', async (request: FastifyRequest<{
    Body: {
      route: Array<LocationParams>;
    };
  }>, reply: FastifyReply) => {
    try {
      const { route } = request.body;

      if (!route || route.length === 0) {
        reply.status(400).send({
          success: false,
          error: 'Route points are required',
        });
        return;
      }

      const elevationData = await GoogleMapsService.getElevationData(route);

      reply.send({
        success: true,
        data: elevationData,
        count: elevationData.length,
      });
    } catch (error) {
      fastify.log.error('Failed to get elevation data');
      reply.status(500).send({
        success: false,
        error: 'Failed to get elevation data',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Get road conditions for a route
  fastify.post<{
    Body: {
      route: Array<LocationParams>;
    };
  }>('/road-conditions', async (request: FastifyRequest<{
    Body: {
      route: Array<LocationParams>;
    };
  }>, reply: FastifyReply) => {
    try {
      const { route } = request.body;

      if (!route || route.length === 0) {
        reply.status(400).send({
          success: false,
          error: 'Route points are required',
        });
        return;
      }

      const roadConditions = await GoogleMapsService.getRoadConditions(route);

      reply.send({
        success: true,
        data: roadConditions,
      });
    } catch (error) {
      fastify.log.error('Failed to get road conditions');
      reply.status(500).send({
        success: false,
        error: 'Failed to get road conditions',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Start live location tracking session
  fastify.post<{
    Body: {
      userId: string;
      raceId?: string;
      trackingOptions?: {
        highAccuracy?: boolean;
        distanceFilter?: number;
        timeInterval?: number;
      };
    };
  }>('/start-tracking', async (request: FastifyRequest<{
    Body: {
      userId: string;
      raceId?: string;
      trackingOptions?: {
        highAccuracy?: boolean;
        distanceFilter?: number;
        timeInterval?: number;
      };
    };
  }>, reply: FastifyReply) => {
    try {
      const { userId, raceId, trackingOptions } = request.body;

      if (!userId) {
        reply.status(400).send({
          success: false,
          error: 'User ID is required',
        });
        return;
      }

      const trackingSession = await GoogleMapsService.startLocationTracking(
        userId,
        raceId,
        trackingOptions
      );

      reply.send({
        success: true,
        data: trackingSession,
        message: 'Location tracking started',
      });
    } catch (error) {
      fastify.log.error('Failed to start location tracking');
      reply.status(500).send({
        success: false,
        error: 'Failed to start location tracking',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Stop location tracking session
  fastify.post<{
    Body: {
      userId: string;
      sessionId: string;
    };
  }>('/stop-tracking', async (request: FastifyRequest<{
    Body: {
      userId: string;
      sessionId: string;
    };
  }>, reply: FastifyReply) => {
    try {
      const { userId, sessionId } = request.body;

      if (!userId || !sessionId) {
        reply.status(400).send({
          success: false,
          error: 'User ID and session ID are required',
        });
        return;
      }

      const result = await GoogleMapsService.stopLocationTracking(userId, sessionId);

      if (!result) {
        reply.status(404).send({
          success: false,
          error: 'Tracking session not found',
        });
        return;
      }

      reply.send({
        success: true,
        data: result,
        message: 'Location tracking stopped',
      });
    } catch (error) {
      fastify.log.error('Failed to stop location tracking');
      reply.status(500).send({
        success: false,
        error: 'Failed to stop location tracking',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Health check endpoint
  fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    reply.send({
      success: true,
      service: 'maps-api',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  });
}