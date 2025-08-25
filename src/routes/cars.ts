import { FastifyInstance } from 'fastify';
import { prisma } from '../prisma.js';
import { z } from 'zod';
import { authGuard } from '../auth.js';

const carSchema = z.object({
  name: z.string(),
  year: z.number().int().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  weightKg: z.number().optional(),
  whp: z.number().optional(),
  drivetrain: z.string().optional(),
});

export async function registerCarRoutes(app: FastifyInstance) {
  app.post('/cars', { preHandler: [authGuard] }, async (req: any) => {
    const body = carSchema.parse(req.body);
    const car = await prisma.car.create({ data: { ...body, userId: req.user.sub } });
    return car;
  });

  app.get('/cars', { preHandler: [authGuard] }, async (req: any) => {
    const userId = (req.query as any).userId ?? req.user.sub;
    const cars = await prisma.car.findMany({ where: { userId }, include: { modifications: true } });
    return cars;
  });

  app.patch('/cars/:id', { preHandler: [authGuard] }, async (req: any, reply) => {
    const { id } = req.params as any;
    const body = carSchema.partial().parse(req.body);
    const car = await prisma.car.update({ where: { id }, data: body });
    return car;
  });

  app.post('/cars/:id/mods', { preHandler: [authGuard] }, async (req: any) => {
    const { id } = req.params as any;
    const mod = await prisma.modification.create({ data: { carId: id, ...(req.body as any) } });
    return mod;
  });
}
