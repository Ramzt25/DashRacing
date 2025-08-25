// Live data endpoints for GridGhost mobile app
import { FastifyInstance } from 'fastify';
import { prisma } from '../prisma.js';

export async function registerLiveRoutes(app: FastifyInstance) {
  // Get nearby users (changed from players to users)
  app.get('/live/players', async (request, reply) => {
    const { lat, lng, radius = 50 } = request.query as any;
    
    try {
      // For now, return empty array (can be enhanced later with real geo queries)
      const users = [];
      
      reply.send({
        users, // Changed from players to users
        count: users.length,
        location: { lat: parseFloat(lat), lng: parseFloat(lng), radius: parseFloat(radius) }
      });
    } catch (error) {
      console.error('Get nearby users error:', error);
      reply.status(500).send({ error: 'Failed to get nearby users' });
    }
  });

  // Get nearby events
  app.get('/live/events', async (request, reply) => {
    const { lat, lng, radius = 50 } = request.query as any;
    
    try {
      // Get events from database (simplified for now)
      const events = await prisma.event.findMany({
        take: 10,
        where: {
          status: 'Scheduled'
        }
      });
      
      reply.send({
        events,
        count: events.length,
        location: { lat: parseFloat(lat), lng: parseFloat(lng), radius: parseFloat(radius) }
      });
    } catch (error) {
      console.error('Get nearby events error:', error);
      reply.status(500).send({ error: 'Failed to get nearby events' });
    }
  });

  // Get friend map markers
  app.get('/friends/map-markers', async (request, reply) => {
    try {
      // For now, return empty array (requires friendship system)
      const markers = [];
      
      reply.send({
        markers,
        count: markers.length
      });
    } catch (error) {
      console.error('Get friend markers error:', error);
      reply.status(500).send({ error: 'Failed to get friend markers' });
    }
  });

  // Get user stats overview
  app.get('/userstats/overview', async (request, reply) => {
    try {
      // Return basic stats structure
      const stats = {
        totalRaces: 0,
        wins: 0,
        winRate: 0,
        bestSpeed: 0,
        totalDistance: 0,
        averageSpeed: 0,
        achievements: [],
        rank: 'Rookie',
        level: 1,
        experience: 0
      };
      
      reply.send(stats);
    } catch (error) {
      console.error('Get user stats error:', error);
      reply.status(500).send({ error: 'Failed to get user stats' });
    }
  });
}