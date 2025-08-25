import { FastifyInstance } from 'fastify';
import { prisma } from '../prisma.js';
import { z } from 'zod';
import { authGuard } from '../auth.js';

export async function registerRaceRoutes(app: FastifyInstance) {
  // Get all races
  app.get('/races', async () => {
    const races = await prisma.race.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            handle: true,
            firstName: true,
            lastName: true,
          },
        },
        participants: {
          include: {
            racer: {
              select: {
                id: true,
                handle: true,
                firstName: true,
                lastName: true,
              },
            },
            car: {
              select: {
                id: true,
                name: true,
                make: true,
                model: true,
                year: true,
              },
            },
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    return races;
  });

  // Get race by ID
  app.get('/races/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    
    const race = await prisma.race.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            handle: true,
            firstName: true,
            lastName: true,
          },
        },
        participants: {
          include: {
            racer: {
              select: {
                id: true,
                handle: true,
                firstName: true,
                lastName: true,
              },
            },
            car: {
              select: {
                id: true,
                name: true,
                make: true,
                model: true,
                year: true,
              },
            },
          },
        },
        results: {
          include: {
            racer: {
              select: {
                id: true,
                handle: true,
                firstName: true,
                lastName: true,
              },
            },
            car: {
              select: {
                id: true,
                name: true,
                make: true,
                model: true,
                year: true,
              },
            },
          },
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    if (!race) {
      return reply.status(404).send({ error: 'Race not found' });
    }

    return race;
  });

  // Create a new race
  const CreateRaceSchema = z.object({
    name: z.string().optional(),
    raceType: z.enum(['drag', 'circuit', 'street', 'track']),
    startTime: z.string().transform(str => new Date(str)),
    endTime: z.string().transform(str => new Date(str)).optional(),
    maxParticipants: z.number().min(2).max(50).default(8),
    distance: z.number().positive().optional(),
    entryFee: z.number().min(0).optional(),
    prizePayout: z.number().min(0).optional(),
    locationName: z.string().optional(),
    locationAddress: z.string().optional(),
    locationLat: z.number().optional(),
    locationLon: z.number().optional(),
    rules: z.any().optional(),
    safetyFeatures: z.any().optional(),
  });

  app.post('/races', { preHandler: [authGuard] }, async (req: any, reply) => {
    try {
      const data = CreateRaceSchema.parse(req.body);
      
      const race = await prisma.race.create({
        data: {
          ...data,
          createdById: req.user.sub,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              handle: true,
              firstName: true,
              lastName: true,
            },
          },
          participants: {
            include: {
              racer: {
                select: {
                  id: true,
                  handle: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      return { success: true, race };
    } catch (error) {
      console.error('Error creating race:', error);
      return reply.status(500).send({ error: 'Failed to create race' });
    }
  });

  // Join a race
  app.post('/races/:id/join', { preHandler: [authGuard] }, async (req: any, reply) => {
    try {
      const { id: raceId } = req.params as { id: string };
      const { carId } = req.body as { carId?: string };

      // Check if race exists and is joinable
      const race = await prisma.race.findUnique({
        where: { id: raceId },
        include: {
          participants: true,
        },
      });

      if (!race) {
        return reply.status(404).send({ error: 'Race not found' });
      }

      if (race.status !== 'pending') {
        return reply.status(400).send({ error: 'Race is not accepting participants' });
      }

      if (race.participants.length >= race.maxParticipants) {
        return reply.status(400).send({ error: 'Race is full' });
      }

      // Check if user already joined
      const existingParticipant = await prisma.raceParticipant.findUnique({
        where: {
          raceId_racerId: {
            raceId,
            racerId: req.user.sub,
          },
        },
      });

      if (existingParticipant) {
        return reply.status(400).send({ error: 'Already joined this race' });
      }

      // Join the race
      const participant = await prisma.raceParticipant.create({
        data: {
          raceId,
          racerId: req.user.sub,
          carId,
        },
      });

      return { success: true, participant };
    } catch (error) {
      console.error('Error joining race:', error);
      return reply.status(500).send({ error: 'Failed to join race' });
    }
  });

  // Leave a race
  app.delete('/races/:id/leave', { preHandler: [authGuard] }, async (req: any, reply) => {
    try {
      const { id: raceId } = req.params as { id: string };

      const participant = await prisma.raceParticipant.findUnique({
        where: {
          raceId_racerId: {
            raceId,
            racerId: req.user.sub,
          },
        },
      });

      if (!participant) {
        return reply.status(404).send({ error: 'Not participating in this race' });
      }

      await prisma.raceParticipant.delete({
        where: {
          raceId_racerId: {
            raceId,
            racerId: req.user.sub,
          },
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Error leaving race:', error);
      return reply.status(500).send({ error: 'Failed to leave race' });
    }
  });

  // Get participants for a race
  app.get('/races/:id/participants', async (req, reply) => {
    const { id: raceId } = req.params as { id: string };

    const participants = await prisma.raceParticipant.findMany({
      where: { raceId },
      include: {
        racer: {
          select: {
            id: true,
            handle: true,
            firstName: true,
            lastName: true,
          },
        },
        car: {
          select: {
            id: true,
            name: true,
            make: true,
            model: true,
            year: true,
          },
        },
      },
    });

    return participants;
  });

  // Submit race results
  const SubmitResultSchema = z.object({
    participantId: z.string(),
    carId: z.string().optional(),
    position: z.number().positive().optional(),
    timeSeconds: z.number().positive().optional(),
    topSpeed: z.number().positive().optional(),
    lapTimes: z.array(z.number()).optional(),
    telemetryData: z.any().optional(),
    weatherConditions: z.string().optional(),
    trackCondition: z.string().optional(),
  });

  app.post('/races/:id/results', { preHandler: [authGuard] }, async (req: any, reply) => {
    try {
      const { id: raceId } = req.params as { id: string };
      const data = SubmitResultSchema.parse(req.body);

      // Verify race exists and user has permission
      const race = await prisma.race.findUnique({
        where: { id: raceId },
      });

      if (!race) {
        return reply.status(404).send({ error: 'Race not found' });
      }

      if (race.createdById !== req.user.sub) {
        return reply.status(403).send({ error: 'Only race creator can submit results' });
      }

      // Create or update race result
      const result = await prisma.raceResult.upsert({
        where: {
          raceId_participantId: {
            raceId,
            participantId: data.participantId,
          },
        },
        update: data,
        create: {
          raceId,
          ...data,
        },
      });

      return { success: true, result };
    } catch (error) {
      console.error('Error submitting race result:', error);
      return reply.status(500).send({ error: 'Failed to submit race result' });
    }
  });

  // Start a race session for practice/qualifying
  const StartSessionSchema = z.object({
    carId: z.string().optional(),
    sessionType: z.enum(['practice', 'qualifying', 'race']).default('practice'),
  });

  app.post('/races/:id/sessions', { preHandler: [authGuard] }, async (req: any, reply) => {
    try {
      const { id: raceId } = req.params as { id: string };
      const data = StartSessionSchema.parse(req.body);

      const session = await prisma.raceSession.create({
        data: {
          raceId,
          userId: req.user.sub,
          carId: data.carId,
          sessionType: data.sessionType,
          startTime: new Date(),
        },
      });

      return { success: true, session };
    } catch (error) {
      console.error('Error starting race session:', error);
      return reply.status(500).send({ error: 'Failed to start race session' });
    }
  });

  // End a race session
  const EndSessionSchema = z.object({
    totalDistance: z.number().positive().optional(),
    maxSpeed: z.number().positive().optional(),
    averageSpeed: z.number().positive().optional(),
    zeroToSixty: z.number().positive().optional(),
    quarterMile: z.number().positive().optional(),
    halfMile: z.number().positive().optional(),
    lapTimes: z.array(z.number()).optional(),
    gForces: z.any().optional(),
    performanceScore: z.number().min(0).max(100).optional(),
    drivingStyle: z.string().optional(),
    improvementTips: z.any().optional(),
  });

  app.patch('/races/sessions/:sessionId/end', { preHandler: [authGuard] }, async (req: any, reply) => {
    try {
      const { sessionId } = req.params as { sessionId: string };
      const data = EndSessionSchema.parse(req.body);

      // Verify session belongs to user
      const session = await prisma.raceSession.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        return reply.status(404).send({ error: 'Session not found' });
      }

      if (session.userId !== req.user.sub) {
        return reply.status(403).send({ error: 'Not your session' });
      }

      if (session.isCompleted) {
        return reply.status(400).send({ error: 'Session already completed' });
      }

      const updatedSession = await prisma.raceSession.update({
        where: { id: sessionId },
        data: {
          ...data,
          endTime: new Date(),
          isCompleted: true,
        },
      });

      return { success: true, session: updatedSession };
    } catch (error) {
      console.error('Error ending race session:', error);
      return reply.status(500).send({ error: 'Failed to end race session' });
    }
  });
}