import { EdmundsApiService } from '../services/EdmundsApiService';
export default async function vehicleRoutes(fastify) {
    // Search vehicles
    fastify.get('/search', async (request, reply) => {
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
        }
        catch (error) {
            fastify.log.error('Vehicle search failed');
            reply.status(500).send({
                success: false,
                error: 'Failed to search vehicles',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });
    // Get vehicle details
    fastify.get('/details/:make/:model/:year', async (request, reply) => {
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
        }
        catch (error) {
            fastify.log.error('Failed to get vehicle details');
            reply.status(500).send({
                success: false,
                error: 'Failed to get vehicle details',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });
    // Get vehicle trims
    fastify.get('/trims/:make/:model/:year', async (request, reply) => {
        try {
            const { make, model, year } = request.params;
            const trims = await EdmundsApiService.getVehicleTrims(make, model, year);
            reply.send({
                success: true,
                data: trims,
                count: trims.length,
            });
        }
        catch (error) {
            fastify.log.error('Failed to get vehicle trims');
            reply.status(500).send({
                success: false,
                error: 'Failed to get vehicle trims',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });
    // Get vehicle pricing
    fastify.get('/pricing/:make/:model/:year', async (request, reply) => {
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
        }
        catch (error) {
            fastify.log.error('Failed to get vehicle pricing');
            reply.status(500).send({
                success: false,
                error: 'Failed to get vehicle pricing',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });
    // Get vehicle specifications
    fastify.get('/specs/:make/:model/:year', async (request, reply) => {
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
        }
        catch (error) {
            fastify.log.error('Failed to get vehicle specifications');
            reply.status(500).send({
                success: false,
                error: 'Failed to get vehicle specifications',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });
    // Get vehicle reviews
    fastify.get('/reviews/:make/:model/:year', async (request, reply) => {
        try {
            const { make, model, year } = request.params;
            const reviews = await EdmundsApiService.getVehicleReviews(make, model, year);
            reply.send({
                success: true,
                data: reviews,
                count: reviews.length,
            });
        }
        catch (error) {
            fastify.log.error('Failed to get vehicle reviews');
            reply.status(500).send({
                success: false,
                error: 'Failed to get vehicle reviews',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });
    // Get vehicle recalls
    fastify.get('/recalls/:make/:model/:year', async (request, reply) => {
        try {
            const { make, model, year } = request.params;
            const recalls = await EdmundsApiService.getVehicleRecalls(make, model, year);
            reply.send({
                success: true,
                data: recalls,
                count: recalls.length,
                hasRecalls: recalls.length > 0,
            });
        }
        catch (error) {
            fastify.log.error('Failed to get vehicle recalls');
            reply.status(500).send({
                success: false,
                error: 'Failed to get vehicle recalls',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });
    // Compare vehicles
    fastify.post('/compare', async (request, reply) => {
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
        }
        catch (error) {
            fastify.log.error('Vehicle comparison failed');
            reply.status(500).send({
                success: false,
                error: 'Failed to compare vehicles',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });
    // Get popular vehicles
    fastify.get('/popular', async (request, reply) => {
        try {
            const popular = await EdmundsApiService.getPopularVehicles();
            reply.send({
                success: true,
                data: popular,
                count: popular.length,
            });
        }
        catch (error) {
            fastify.log.error('Failed to get popular vehicles');
            reply.status(500).send({
                success: false,
                error: 'Failed to get popular vehicles',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });
    // Get vehicle makes
    fastify.get('/makes', async (request, reply) => {
        try {
            const makes = await EdmundsApiService.getVehicleMakes();
            reply.send({
                success: true,
                data: makes,
                count: makes.length,
            });
        }
        catch (error) {
            fastify.log.error('Failed to get vehicle makes');
            reply.status(500).send({
                success: false,
                error: 'Failed to get vehicle makes',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });
    // Get models for a make
    fastify.get('/makes/:make/models', async (request, reply) => {
        try {
            const { make } = request.params;
            const models = await EdmundsApiService.getModelsForMake(make);
            reply.send({
                success: true,
                data: models,
                count: models.length,
                make,
            });
        }
        catch (error) {
            fastify.log.error('Failed to get models for make');
            reply.status(500).send({
                success: false,
                error: 'Failed to get models',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });
    // Health check endpoint
    fastify.get('/health', async (request, reply) => {
        reply.send({
            success: true,
            service: 'vehicle-api',
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
        });
    });
}
//# sourceMappingURL=vehicles.js.map