import { test, expect, describe, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { buildServer } from '../backend/plugins.js';
import { registerAuthRoutes } from '../backend/auth.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Authentication API Tests', () => {
  let app: any;

  beforeAll(async () => {
    app = buildServer();
    await registerAuthRoutes(app);
    await app.ready();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'gridghost.com'
        }
      }
    });
  });

  afterAll(async () => {
    // Final cleanup
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'gridghost.com'
        }
      }
    });
    await prisma.$disconnect();
    await app.close();
  });

  describe('User Registration', () => {
    test('should create new user with valid data', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'test@gridghost.com',
          password: 'TestPassword123!',
          firstName: 'Test',
          lastName: 'User'
        }
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('user');
      expect(body).toHaveProperty('token');
      expect(body.user.email).toBe('test@gridghost.com');
    });

    test('should reject duplicate email registration', async () => {
      // First registration
      await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'duplicate@gridghost.com',
          password: 'TestPassword123!',
          firstName: 'First',
          lastName: 'User'
        }
      });

      // Second registration with same email
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'duplicate@gridghost.com',
          password: 'TestPassword123!',
          firstName: 'Second',
          lastName: 'User'
        }
      });

      expect(response.statusCode).toBe(409);
    });
  });

  describe('User Authentication', () => {
    test('should authenticate user with valid credentials', async () => {
      // Register user first
      await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'login-test@gridghost.com',
          password: 'TestPassword123!',
          firstName: 'Login',
          lastName: 'Test'
        }
      });

      // Then try to login
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'login-test@gridghost.com',
          password: 'TestPassword123!'
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('user');
      expect(body).toHaveProperty('token');
    });

    test('should reject invalid credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'nonexistent@gridghost.com',
          password: 'wrongpassword'
        }
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('Protected Routes', () => {
    test('should require authentication for profile access', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/auth/profile'
      });

      expect(response.statusCode).toBe(401);
    });

    test('should return user data when authenticated', async () => {
      // Register and login to get token
      const registerResponse = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'profile-test@gridghost.com',
          password: 'TestPassword123!',
          firstName: 'Profile',
          lastName: 'Test'
        }
      });

      const { token } = JSON.parse(registerResponse.body);

      const response = await app.inject({
        method: 'GET',
        url: '/auth/profile',
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.email).toBe('profile-test@gridghost.com');
    });
  });

  describe('Premium Subscription', () => {
    test('should allow subscription upgrade', async () => {
      // Register user
      const registerResponse = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'premium-test@gridghost.com',
          password: 'TestPassword123!',
          firstName: 'Premium',
          lastName: 'Test'
        }
      });

      const { token } = JSON.parse(registerResponse.body);

      // Upgrade to premium
      const response = await app.inject({
        method: 'POST',
        url: '/auth/upgrade',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: {
          subscriptionTier: 'monthly'
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.user.subscriptionTier).toBe('monthly');
    });
  });
});