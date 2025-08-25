import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
}

declare module 'fastify' {
  interface FastifyRequest {
    authenticatedUser?: AuthenticatedUser;
  }
}

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * JWT Authentication middleware for Fastify
 */
export async function authenticateToken(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      reply.status(401).send({
        error: 'Access denied',
        message: 'No token provided'
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      reply.status(500).send({
        error: 'Server configuration error',
        message: 'JWT secret not configured'
      });
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    
    // Fetch fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        handle: true,
        displayName: true,
        role: true,
        isPro: true,
        subscriptionTier: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      reply.status(401).send({
        error: 'Access denied',
        message: 'User not found'
      });
      return;
    }

    // Add user to request object
    request.authenticatedUser = {
      id: user.id,
      email: user.email,
      username: user.handle,
      role: user.role as 'USER' | 'ADMIN' | 'MODERATOR'
    };

    // Note: Skip updating lastSeenAt for now to avoid schema issues
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: { lastSeenAt: new Date() }
    // });

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      reply.status(401).send({
        error: 'Access denied',
        message: 'Invalid token'
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      reply.status(401).send({
        error: 'Access denied',
        message: 'Token expired'
      });
      return;
    }

    console.error('Authentication error:', error);
    reply.status(500).send({
      error: 'Internal server error',
      message: 'Authentication failed'
    });
  }
}

/**
 * Authorization middleware to check user roles
 */
export function requireRole(allowedRoles: string[]) {
  return async function(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    if (!request.authenticatedUser) {
      reply.status(401).send({
        error: 'Access denied',
        message: 'Authentication required'
      });
      return;
    }

    if (!allowedRoles.includes(request.authenticatedUser.role)) {
      reply.status(403).send({
        error: 'Forbidden',
        message: 'Insufficient permissions'
      });
      return;
    }
  };
}

/**
 * Rate limiting middleware
 */
interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(options: RateLimitOptions) {
  return async function(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const clientId = request.authenticatedUser?.id || request.ip;
    const now = Date.now();
    
    // Clean up expired entries
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }

    const current = rateLimitStore.get(clientId);
    
    if (!current) {
      rateLimitStore.set(clientId, {
        count: 1,
        resetTime: now + options.windowMs
      });
      return;
    }

    if (now > current.resetTime) {
      rateLimitStore.set(clientId, {
        count: 1,
        resetTime: now + options.windowMs
      });
      return;
    }

    if (current.count >= options.maxRequests) {
      reply.status(429).send({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded',
        retryAfter: Math.ceil((current.resetTime - now) / 1000)
      });
      return;
    }

    current.count++;
  };
}

/**
 * Input validation middleware
 */
export function validateInput(schema: any) {
  return async function(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      // This would integrate with a validation library like Joi or Yup
      // For now, just basic validation
      if (schema.required && schema.required.length > 0) {
        const body = request.body as any;
        for (const field of schema.required) {
          if (!body || !body[field]) {
            reply.status(400).send({
              error: 'Validation error',
              message: `Required field '${field}' is missing`
            });
            return;
          }
        }
      }
    } catch (error) {
      reply.status(400).send({
        error: 'Validation error',
        message: 'Invalid input data'
      });
    }
  };
}

/**
 * CORS middleware for mobile app
 */
export async function corsHandler(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const origin = request.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8081',
    'https://gridghost.app',
    'capacitor://localhost',
    'http://localhost'
  ];

  if (allowedOrigins.includes(origin || '')) {
    reply.header('Access-Control-Allow-Origin', origin);
  }

  reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  reply.header('Access-Control-Allow-Credentials', 'true');
  reply.header('Access-Control-Max-Age', '86400');

  if (request.method === 'OPTIONS') {
    reply.status(200).send();
    return;
  }
}

/**
 * Error handling middleware
 */
export async function errorHandler(
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  console.error('Request error:', {
    error: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method,
    user: request.authenticatedUser?.id
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (error.name === 'ValidationError') {
    reply.status(400).send({
      error: 'Validation Error',
      message: isDevelopment ? error.message : 'Invalid input data'
    });
    return;
  }

  if (error.name === 'PrismaClientKnownRequestError') {
    reply.status(400).send({
      error: 'Database Error',
      message: isDevelopment ? error.message : 'Data operation failed'
    });
    return;
  }

  reply.status(500).send({
    error: 'Internal Server Error',
    message: isDevelopment ? error.message : 'Something went wrong'
  });
}

/**
 * Request logging middleware
 */
export async function requestLogger(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const start = Date.now();
  
  // Store the original send method
  const originalSend = reply.send.bind(reply);
  
  // Override send to log after response
  reply.send = function(payload?: any) {
    const duration = Date.now() - start;
    console.log(`${request.method} ${request.url} - ${reply.statusCode} - ${duration}ms - User: ${request.authenticatedUser?.id || 'Anonymous'}`);
    return originalSend(payload);
  };
}

/**
 * Health check endpoint
 */
export async function healthCheck(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    reply.send({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      database: 'connected'
    });
  } catch (error) {
    reply.status(503).send({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
}

/**
 * Generate JWT token for user
 */
export function generateToken(user: AuthenticatedUser): string {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET not configured');
  }

  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    username: user.username,
    role: user.role
  };

  return jwt.sign(payload, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    issuer: 'gridghost-api'
  } as jwt.SignOptions);
}

/**
 * Refresh token functionality
 */
export async function refreshToken(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    if (!request.authenticatedUser) {
      reply.status(401).send({
        error: 'Access denied',
        message: 'Authentication required'
      });
      return;
    }

    // Generate new token
    const newToken = generateToken(request.authenticatedUser);
    
    reply.send({
      token: newToken,
      user: request.authenticatedUser,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to refresh token'
    });
  }
}