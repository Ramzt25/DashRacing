/**
 * Logging API Routes for GridGhost
 * Handles log collection from mobile and admin clients
 */
import { FastifyInstance } from 'fastify';
import { logger } from '../lib/logger.js';
import { authenticateToken } from '../middleware/auth.js';

export async function registerLoggingRoutes(app: FastifyInstance) {
  // Receive logs from mobile clients
  app.post('/api/logs', async (request, reply) => {
    try {
      const { sessionId, platform, logs, deviceInfo } = request.body as any;
      
      // Log receipt of mobile logs
      logger.info('LOG_COLLECTION', `Received ${logs?.length || 0} logs from ${platform}`, {
        sessionId,
        platform,
        deviceInfo,
        logsCount: logs?.length || 0
      });

      // Process each log entry
      if (Array.isArray(logs)) {
        for (const logEntry of logs) {
          // Re-log mobile entries through backend logger for centralized storage
          const { level, category, message, context, userId, screen, action } = logEntry;
          
          const enhancedContext = {
            ...context,
            originalPlatform: platform,
            sessionId,
            screen,
            action,
            userId,
            deviceInfo
          };

          switch (level) {
            case 'debug':
              logger.debug(`MOBILE_${category}`, message, enhancedContext);
              break;
            case 'info':
              logger.info(`MOBILE_${category}`, message, enhancedContext);
              break;
            case 'warn':
              logger.warn(`MOBILE_${category}`, message, enhancedContext);
              break;
            case 'error':
              logger.error(`MOBILE_${category}`, message, new Error(logEntry.error || message), enhancedContext);
              break;
            case 'critical':
              logger.critical(`MOBILE_${category}`, message, new Error(logEntry.error || message), enhancedContext);
              break;
          }
        }
      }

      reply.send({ success: true, received: logs?.length || 0 });
    } catch (error) {
      logger.error('LOG_COLLECTION', 'Failed to process mobile logs', error);
      reply.status(500).send({ error: 'Failed to process logs' });
    }
  });

  // Get recent logs (authenticated endpoint for debugging)
  app.get('/api/logs/recent', { preHandler: authenticateToken }, async (request, reply) => {
    try {
      const stats = logger.getStats();
      reply.send({
        success: true,
        stats,
        recentLogs: stats.recentEntries
      });
    } catch (error) {
      logger.error('LOG_RETRIEVAL', 'Failed to get recent logs', error);
      reply.status(500).send({ error: 'Failed to retrieve logs' });
    }
  });

  // Generate error report (authenticated endpoint)
  app.get('/api/logs/error-report', { preHandler: authenticateToken }, async (request, reply) => {
    try {
      const report = logger.generateErrorReport();
      reply.send({
        success: true,
        report: JSON.parse(report)
      });
    } catch (error) {
      logger.error('REPORT_GENERATION', 'Failed to generate error report', error);
      reply.status(500).send({ error: 'Failed to generate report' });
    }
  });

  // Real-time log streaming endpoint (for development)
  app.get('/api/logs/stream', { preHandler: authenticateToken }, async (request, reply) => {
    reply.type('text/event-stream');
    reply.header('Cache-Control', 'no-cache');
    reply.header('Connection', 'keep-alive');
    reply.header('Access-Control-Allow-Origin', '*');

    // Send initial connection message
    reply.raw.write('data: {"type":"connected","message":"Log stream connected"}\n\n');

    // Set up log streaming (simplified version)
    const logInterval = setInterval(() => {
      const stats = logger.getStats();
      reply.raw.write(`data: ${JSON.stringify({
        type: 'stats',
        data: stats
      })}\n\n`);
    }, 5000);

    // Clean up on disconnect
    request.raw.on('close', () => {
      clearInterval(logInterval);
    });
  });

  // Health check for logging system
  app.get('/api/logs/health', async (request, reply) => {
    try {
      const stats = logger.getStats();
      reply.send({
        status: 'healthy',
        loggingSystem: {
          sessionId: stats.sessionId,
          bufferSize: stats.bufferSize,
          totalErrors: stats.totalErrors,
          uniqueErrors: stats.uniqueErrors
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      reply.status(500).send({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
}