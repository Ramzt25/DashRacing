import { FastifyInstance } from 'fastify';
import { prisma } from '../prisma.js';
import { authGuard } from '../auth.js';

export async function registerAdminRoutes(app: FastifyInstance) {
  // Admin authentication guard - check if user has admin role
  const adminGuard = async (request: any, reply: any) => {
    await authGuard(request, reply);
    
    // Check if user has admin role
    const user = await prisma.user.findUnique({
      where: { id: request.user.sub },
      select: { role: true }
    });

    if (!user || user.role !== 'admin') {
      return reply.status(403).send({ error: 'Admin access required' });
    }
  };

  // Dashboard Stats
  app.get('/admin/dashboard/stats', { preHandler: [adminGuard] }, async () => {
    const [
      totalUsers,
      activeUsers,
      totalRaces,
      activeRaces,
      totalCars,
      totalEvents
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      }),
      prisma.race.count(),
      prisma.race.count({
        where: {
          status: {
            in: ['pending', 'starting', 'active']
          }
        }
      }),
      prisma.car.count(),
      prisma.event.count()
    ]);

    return {
      totalUsers,
      activeUsers,
      totalRaces,
      activeRaces,
      totalCars,
      totalEvents,
      recentActivity: [] // Placeholder for activity items
    };
  });

  // System Health
  app.get('/admin/health', { preHandler: [adminGuard] }, async () => {
    const startTime = Date.now();
    
    try {
      // Test database connection
      await prisma.user.count();
      const dbResponseTime = Date.now() - startTime;

      // Mock system metrics (in production, get from actual system monitoring)
      const memoryUsage = process.memoryUsage();
      
      return {
        status: 'healthy',
        version: '1.0.0',
        uptime: process.uptime(),
        database: {
          status: 'connected',
          responseTime: dbResponseTime
        },
        memory: {
          used: memoryUsage.heapUsed,
          total: memoryUsage.heapTotal,
          percentage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
        },
        cpu: {
          usage: Math.random() * 100 // Mock CPU usage
        },
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: 'Database connection failed',
        lastChecked: new Date().toISOString()
      };
    }
  });

  // Users Management
  app.get('/admin/users', { preHandler: [adminGuard] }, async (req) => {
    const { page = 1, limit = 50, search } = req.query as any;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = search ? {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { handle: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ]
    } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: offset,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    return {
      users,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    };
  });

  app.get('/admin/users/:id', { preHandler: [adminGuard] }, async (req) => {
    const { id } = req.params as { id: string };
    
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        cars: true,
        _count: {
          select: {
            raceResults: true,
            createdRaces: true,
            attendances: true
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  });

  app.put('/admin/users/:id', { preHandler: [adminGuard] }, async (req) => {
    const { id } = req.params as { id: string };
    const updateData = req.body as any;

    const user = await prisma.user.update({
      where: { id },
      data: updateData
    });

    return user;
  });

  app.delete('/admin/users/:id', { preHandler: [adminGuard] }, async (req) => {
    const { id } = req.params as { id: string };

    await prisma.user.delete({
      where: { id }
    });

    return { success: true };
  });

  // Cars Management
  app.get('/admin/cars', { preHandler: [adminGuard] }, async (req) => {
    const { page = 1, limit = 50, userId } = req.query as any;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = userId ? { userId } : {};

    const [cars, total] = await Promise.all([
      prisma.car.findMany({
        where,
        skip: offset,
        take: parseInt(limit),
        include: {
          user: {
            select: {
              id: true,
              handle: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.car.count({ where })
    ]);

    return {
      cars,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    };
  });

  // Races Management
  app.get('/admin/races', { preHandler: [adminGuard] }, async (req) => {
    const { page = 1, limit = 50, status } = req.query as any;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = status ? { status } : {};

    const [races, total] = await Promise.all([
      prisma.race.findMany({
        where,
        skip: offset,
        take: parseInt(limit),
        include: {
          createdBy: {
            select: {
              id: true,
              handle: true,
              firstName: true,
              lastName: true
            }
          },
          _count: {
            select: {
              participants: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.race.count({ where })
    ]);

    return {
      races,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    };
  });

  // Events Management
  app.get('/admin/events', { preHandler: [adminGuard] }, async (req) => {
    const { page = 1, limit = 50, status } = req.query as any;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = status ? { status } : {};

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip: offset,
        take: parseInt(limit),
        include: {
          _count: {
            select: {
              attendances: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.event.count({ where })
    ]);

    return {
      events,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    };
  });

  // Analytics
  app.get('/admin/analytics', { preHandler: [adminGuard] }, async (req) => {
    const { range = '7d' } = req.query as any;
    
    // Calculate date range
    const days = parseInt(range.replace('d', ''));
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Mock analytics data (replace with real analytics queries)
    const dailyStats = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      dailyStats.push({
        date: date.toISOString().split('T')[0],
        users: Math.floor(Math.random() * 100) + 50,
        races: Math.floor(Math.random() * 30) + 10,
        events: Math.floor(Math.random() * 10) + 2
      });
    }

    return {
      dailyStats,
      summary: {
        totalUsers: await prisma.user.count(),
        totalRaces: await prisma.race.count(),
        totalEvents: await prisma.event.count(),
        avgDailyUsers: Math.floor(dailyStats.reduce((sum, day) => sum + day.users, 0) / dailyStats.length)
      }
    };
  });

  // Recent Activity
  app.get('/admin/activity', { preHandler: [adminGuard] }, async (req) => {
    const { limit = 20 } = req.query as any;

    // Get recent activity from various sources
    const [recentUsers, recentRaces, recentCars] = await Promise.all([
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, handle: true, createdAt: true }
      }),
      prisma.race.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, createdAt: true }
      }),
      prisma.car.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, createdAt: true }
      })
    ]);

    // Combine and format activity items
    const activities = [
      ...recentUsers.map(user => ({
        id: `user-${user.id}`,
        type: 'user_registered',
        description: `New user @${user.handle} registered`,
        timestamp: user.createdAt,
        userId: user.id
      })),
      ...recentRaces.map(race => ({
        id: `race-${race.id}`,
        type: 'race_created',
        description: `New race "${race.name || 'Untitled'}" created`,
        timestamp: race.createdAt,
        relatedId: race.id
      })),
      ...recentCars.map(car => ({
        id: `car-${car.id}`,
        type: 'car_added',
        description: `New car "${car.name}" added`,
        timestamp: car.createdAt,
        relatedId: car.id
      }))
    ];

    // Sort by timestamp and limit
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, parseInt(limit));
  });
}