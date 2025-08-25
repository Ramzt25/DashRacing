import { FastifyInstance } from 'fastify';
import { prisma } from '../prisma.js';
import { z } from 'zod';
import { authGuard } from '../auth.js';

export async function registerEventRoutes(app: FastifyInstance) {
  app.get('/events', async (req) => {
    const eventType = (req.query as any).eventType as string | undefined;
    const where = eventType ? { eventType } : {};
    return prisma.event.findMany({ where });
  });

  app.post('/events/:id/rsvp', { preHandler: [authGuard] }, async (req: any) => {
    const { id } = req.params as any;
    const attendance = await prisma.attendance.upsert({
      where: { eventId_userId: { userId: req.user.sub, eventId: id } },
      update: {},
      create: { userId: req.user.sub, eventId: id }
    });
    return attendance;
  });

  const CheckInSchema = z.object({ lat: z.number(), lon: z.number(), carId: z.string().optional() });

  app.post('/events/:id/checkin', { preHandler: [authGuard] }, async (req: any, reply) => {
    const { id } = req.params as any;
    const { lat, lon, carId } = CheckInSchema.parse(req.body);
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return reply.notFound('Event not found');
    
    // event must be Live (simple check for demo: now between start/end)
    const now = new Date();
    if (!(now >= event.startTime && now <= (event.endTime || event.startTime))) {
      return reply.badRequest('Event is not live');
    }
    
    // For now, accept check-in without geofence validation
    // TODO: Implement geofence validation with locationLat/locationLon
    const attendance = await prisma.attendance.upsert({
      where: { eventId_userId: { userId: req.user.sub, eventId: id } },
      update: { carId: carId ?? null },
      create: { userId: req.user.sub, eventId: id, carId: carId ?? null }
    });
    return attendance;
  });
}
