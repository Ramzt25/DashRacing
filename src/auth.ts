import { FastifyInstance } from 'fastify';
import { prisma } from './prisma.js';
import { z } from 'zod';
import * as argon from 'argon2';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  handle: z.string().min(3).regex(/^[a-zA-Z0-9_]+$/).optional(),
  displayName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const upgradeSchema = z.object({
  subscriptionTier: z.enum(['monthly', 'yearly']),
  paymentToken: z.string().optional(), // For payment processor integration
});

export async function registerAuthRoutes(app: FastifyInstance) {
  // Register route (alias for signup to match tests)
  app.post('/auth/register', async (req, reply) => {
    const body = signupSchema.parse(req.body);
    const exists = await prisma.user.findFirst({ where: { OR: [{ email: body.email }, { handle: body.handle }] } });
    if (exists) return reply.badRequest('Email or handle already in use');
    const passwordHash = await argon.hash(body.password);
    const user = await prisma.user.create({
      data: { 
        email: body.email, 
        passwordHash, 
        handle: body.handle || `user_${Date.now()}`, // Generate handle if not provided
        displayName: body.displayName ?? null,
        firstName: body.firstName ?? null,
        lastName: body.lastName ?? null,
      }
    });
    const token = app.jwt.sign({ sub: user.id });
    reply.status(201).send({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        handle: user.handle, 
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        isPro: user.isPro,
      } 
    });
  });

  app.post('/auth/signup', async (req, reply) => {
    const body = signupSchema.parse(req.body);
    const exists = await prisma.user.findFirst({ where: { OR: [{ email: body.email }, { handle: body.handle }] } });
    if (exists) return reply.badRequest('Email or handle already in use');
    const passwordHash = await argon.hash(body.password);
    const user = await prisma.user.create({
      data: { 
        email: body.email, 
        passwordHash, 
        handle: body.handle || body.email.split('@')[0], 
        displayName: body.displayName ?? null,
        firstName: body.firstName ?? null,
        lastName: body.lastName ?? null,
      }
    });
    const token = app.jwt.sign({ sub: user.id });
    reply.send({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        handle: user.handle, 
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        isPro: user.isPro,
      } 
    });
  });

  app.post('/auth/login', async (req, reply) => {
    const body = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) return reply.unauthorized('Invalid credentials');
    const ok = await argon.verify(user.passwordHash, body.password);
    if (!ok) return reply.unauthorized('Invalid credentials');
    const token = app.jwt.sign({ sub: user.id });
    reply.send({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        handle: user.handle, 
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        isPro: user.isPro,
        subscriptionTier: user.subscriptionTier,
      } 
    });
  });

  app.get('/me', { preHandler: [authGuard] }, async (req: any) => {
    const me = await prisma.user.findUnique({ where: { id: req.user.sub } });
    return { 
      id: me!.id, 
      email: me!.email, 
      handle: me!.handle, 
      displayName: me!.displayName,
      firstName: me!.firstName,
      lastName: me!.lastName,
      isPro: me!.isPro,
      subscriptionTier: me!.subscriptionTier,
      subscriptionEnd: me!.subscriptionEnd,
    };
  });

  // Profile route (alias for /me to match tests)
  app.get('/auth/profile', { preHandler: [authGuard] }, async (req: any) => {
    const me = await prisma.user.findUnique({ where: { id: req.user.sub } });
    return { 
      id: me!.id, 
      email: me!.email, 
      handle: me!.handle, 
      displayName: me!.displayName,
      firstName: me!.firstName,
      lastName: me!.lastName,
      isPro: me!.isPro,
      subscriptionTier: me!.subscriptionTier,
      subscriptionEnd: me!.subscriptionEnd,
    };
  });

  // Subscription management routes
  app.post('/auth/upgrade', { preHandler: [authGuard] }, async (req: any, reply) => {
    try {
      const body = upgradeSchema.parse(req.body);
      const userId = req.user.sub;
      
      // Calculate subscription dates
      const subscriptionStart = new Date();
      const subscriptionEnd = new Date();
      
      if (body.subscriptionTier === 'yearly') {
        subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
      } else {
        subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
      }
      
      // In a real app, you would:
      // 1. Process payment with stripe/paypal/etc using paymentToken
      // 2. Verify payment success
      // 3. Create subscription record in payment processor
      // For demo purposes, we'll simulate success
      
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          isPro: true,
          subscriptionTier: body.subscriptionTier,
          subscriptionStart,
          subscriptionEnd,
          subscriptionId: `sub_${Date.now()}`, // Mock subscription ID
        },
      });
      
      return {
        success: true,
        message: 'Successfully upgraded to Pro!',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          handle: updatedUser.handle,
          displayName: updatedUser.displayName,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          isPro: updatedUser.isPro,
          subscriptionTier: updatedUser.subscriptionTier,
          subscriptionEnd: updatedUser.subscriptionEnd,
        },
      };
    } catch (error) {
      console.error('Upgrade error:', error);
      return reply.status(500).send({ error: 'Failed to process upgrade' });
    }
  });

  app.post('/auth/cancel-subscription', { preHandler: [authGuard] }, async (req: any, reply) => {
    try {
      const userId = req.user.sub;
      
      // In a real app, you would:
      // 1. Cancel subscription with payment processor
      // 2. Handle pro-rated refunds if applicable
      
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          isPro: false,
          subscriptionTier: null,
          subscriptionStart: null,
          subscriptionEnd: null,
          subscriptionId: null,
        },
      });
      
      return {
        success: true,
        message: 'Subscription cancelled successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          handle: updatedUser.handle,
          displayName: updatedUser.displayName,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          isPro: updatedUser.isPro,
          subscriptionTier: updatedUser.subscriptionTier,
        },
      };
    } catch (error) {
      console.error('Cancel subscription error:', error);
      return reply.status(500).send({ error: 'Failed to cancel subscription' });
    }
  });
}

export async function authGuard(req: any, reply: any) {
  try {
    await req.jwtVerify();
  } catch {
    return reply.unauthorized('Missing or invalid token');
  }
}
