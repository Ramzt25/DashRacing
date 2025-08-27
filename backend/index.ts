import { buildServer } from './plugins.js';
import { registerAuthRoutes } from './auth.js';
import { registerCarRoutes } from './routes/cars.js';
import { registerEventRoutes } from './routes/events.js';
import { registerMeetupRoutes } from './routes/meetups.js';
import { registerRaceRoutes } from './routes/races.js';
import { registerLiveMapRoutes } from './routes/livemap.js';
import { registerAIRoutes } from './routes/ai.js';
import { registerAIVehicleDataRoutes } from './routes/ai-vehicle-data.js';
import registerModLearningRoutes from './routes/mod-learning.js';
import { registerWebScrapingRoutes } from './routes/webscraping.js';
import { registerUserStatsRoutes } from './routes/userstats.js';
import { registerLiveRoutes } from './routes/live.js';
import { registerAdminRoutes } from './routes/admin.js';
import { registerLoggingRoutes } from './routes/logging.js';
import registerVehicleRoutes from './routes/vehicles.js';
import { ENV } from './env.js';
import { logger } from './lib/logger.js';

// Import new services
import RealTimeRaceManager from './services/RealTimeRaceManager.js';
import { 
  authenticateToken, 
  requireRole,
  rateLimit
} from './middleware/auth.js';

// Extend FastifyRequest interface for logging
declare module 'fastify' {
  interface FastifyRequest {
    requestStart?: number;
    requestId?: string;
  }
}

const app = buildServer();

// Enhanced request logging middleware
app.addHook('onRequest', async (request, reply) => {
  const start = Date.now();
  request.requestStart = start;
  request.requestId = `req_${start}_${Math.random().toString(36).substr(2, 6)}`;
  
  // Log incoming request
  logger.info('HTTP_REQUEST', `${request.method} ${request.url}`, {
    method: request.method,
    url: request.url,
    userAgent: request.headers['user-agent'],
    ip: request.ip,
    requestId: request.requestId
  });
});

// Enhanced response logging
app.addHook('onSend', async (request, reply, payload) => {
  const duration = Date.now() - (request.requestStart || 0);
  const userId = (request as any).authenticatedUser?.id;
  
  logger.logRequest(
    request.method,
    request.url,
    reply.statusCode,
    duration,
    userId,
    request.requestId
  );
  
  // Log slow requests
  if (duration > 1000) {
    logger.warn('SLOW_REQUEST', `Slow request detected: ${request.method} ${request.url} took ${duration}ms`, {
      duration,
      method: request.method,
      url: request.url,
      userId,
      requestId: request.requestId
    });
  }
  
  return payload;
});

// Error handling hook
app.setErrorHandler(async (error, request, reply) => {
  const userId = (request as any).authenticatedUser?.id;
  
  logger.error('REQUEST_ERROR', `Error in ${request.method} ${request.url}`, error, {
    method: request.method,
    url: request.url,
    userId,
    requestId: request.requestId,
    statusCode: reply.statusCode
  });
  
  // Don't expose internal errors in production
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    reply.status(500).send({ error: 'Internal server error' });
  } else {
    reply.status(500).send({ 
      error: error.message, 
      stack: error.stack,
      requestId: request.requestId
    });
  }
});

// Apply rate limiting only to non-live routes
// Skip rate limiting for live map updates which happen frequently
app.addHook('onRequest', async (request, reply) => {
  // Skip rate limiting for live endpoints
  if (request.url.startsWith('/live/') || request.url.startsWith('/friends/')) {
    return;
  }
  
  // Apply rate limiting to other routes
  await rateLimit({
    maxRequests: 1000,
    windowMs: 60000 // 1 minute
  })(request, reply);
});

await registerAuthRoutes(app);
await registerCarRoutes(app);
await registerEventRoutes(app);
await registerMeetupRoutes(app);
app.register(registerMeetupRoutes, { prefix: '/api' });
await registerRaceRoutes(app);
await registerLiveMapRoutes(app);
await registerAIRoutes(app);
await registerAIVehicleDataRoutes(app);
await registerModLearningRoutes(app);
await registerWebScrapingRoutes(app);
await registerUserStatsRoutes(app);
await registerLiveRoutes(app);
await registerAdminRoutes(app);
await registerLoggingRoutes(app);  // Add logging routes
app.register(registerVehicleRoutes, { prefix: '/vehicles' });
app.register(registerVehicleRoutes, { prefix: '/api/vehicles' });

// Real-time race endpoints
app.register(async function (fastify) {
  fastify.addHook('onRequest', authenticateToken);
  
  fastify.post('/api/races/create-realtime', async (request, reply) => {
    const raceManager = RealTimeRaceManager.getInstance();
    const userId = request.authenticatedUser!.id;
    
    try {
      const raceId = await raceManager.createRace(userId, request.body);
      reply.send({ 
        success: true, 
        raceId,
        message: 'Real-time race created successfully',
        websocketUrl: `ws://localhost:${process.env.WS_PORT || '3001'}?token=${request.headers.authorization?.split(' ')[1]}`
      });
    } catch (error) {
      reply.status(500).send({ 
        error: 'Failed to create race',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  fastify.get('/api/races/active', async (request, reply) => {
    const raceManager = RealTimeRaceManager.getInstance();
    const activeRaces = raceManager.getActiveRaces();
    
    const publicRaces = activeRaces
      .filter(race => race.settings.publicRace)
      .map(race => ({
        id: race.id,
        name: race.name,
        status: race.status,
        participantCount: race.participants.size,
        maxParticipants: race.settings.maxParticipants,
        startTime: race.startTime,
        vehicleRestrictions: race.settings.vehicleRestrictions
      }));
    
    reply.send(publicRaces);
  });
});

// Admin endpoints
app.register(async function (fastify) {
  fastify.addHook('onRequest', authenticateToken);
  fastify.addHook('onRequest', requireRole(['ADMIN', 'MODERATOR']));
  
  fastify.get('/api/admin/race-stats', async (request, reply) => {
    const raceManager = RealTimeRaceManager.getInstance();
    const activeRaces = raceManager.getActiveRaces();
    
    const stats = {
      activeRaces: activeRaces.length,
      totalParticipants: activeRaces.reduce((sum, race) => sum + race.participants.size, 0),
      racesByStatus: {
        waiting: activeRaces.filter(r => r.status === 'WAITING').length,
        active: activeRaces.filter(r => r.status === 'ACTIVE').length,
        finished: activeRaces.filter(r => r.status === 'FINISHED').length
      },
      serverUptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
    
    reply.send(stats);
  });
});

app.get('/', async () => ({ 
  ok: true, 
  service: 'GridGhost Racing API',
  version: '2.0.0',
  features: ['real-time-racing', 'push-notifications', 'performance-optimized']
}));

app.get('/health', async () => ({ 
  status: 'healthy', 
  timestamp: new Date().toISOString(),
  service: 'GridGhost Racing API',
  version: '2.0.0',
  websocket: `ws://localhost:${process.env.WS_PORT || '3001'}`
}));

// Initialize services
async function initializeServices() {
  try {
    // Initialize real-time race manager
    const raceManager = RealTimeRaceManager.getInstance();
    console.log('✅ Real-time race manager initialized');
    console.log(`🔌 WebSocket server will start on port ${process.env.WS_PORT || '3001'}`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    return false;
  }
}

// Start server
async function start() {
  const servicesInitialized = await initializeServices();
  
  if (!servicesInitialized) {
    process.exit(1);
  }

  app.listen({ port: ENV.PORT, host: '0.0.0.0' })
    .then(address => {
      app.log.info(`🚀 GridGhost API server listening on ${address}`);
      console.log(`🎮 Real-time racing features enabled`);
      console.log(`📱 Push notifications ready`);
      console.log(`⚡ Performance optimizations active`);
    })
    .catch(err => { 
      app.log.error(err); 
      process.exit(1); 
    });
}

// Graceful shutdown
const shutdown = async () => {
  console.log('🛑 Shutting down GridGhost API...');
  const raceManager = RealTimeRaceManager.getInstance();
  await raceManager.shutdown();
  await app.close();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
