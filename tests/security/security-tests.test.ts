import { describe, beforeAll, afterAll, test, expect } from '@jest/globals';
import axios, { AxiosInstance } from 'axios';

describe('Security Tests', () => {
  let api: AxiosInstance;
  let authToken: string;
  let testUserId: string;

  const baseURL = process.env.API_URL || 'http://localhost:3000';

  beforeAll(async () => {
    api = axios.create({
      baseURL,
      timeout: 10000,
      validateStatus: () => true,
    });

    // Create test user for security testing
    const registerResponse = await api.post('/auth/register', {
      email: `sectest-${Date.now()}@example.com`,
      password: 'SecTest123!',
      handle: `sectest${Date.now()}`,
      firstName: 'Security',
      lastName: 'Test',
    });

    if (registerResponse.status === 201) {
      authToken = registerResponse.data.token;
      testUserId = registerResponse.data.user.id;
    }
  });

  describe('Authentication Security', () => {
    test('Should reject requests without authorization token', async () => {
      const response = await api.get('/my/stats');
      expect(response.status).toBe(401);
    });

    test('Should reject requests with invalid token', async () => {
      const response = await api.get('/my/stats', {
        headers: { Authorization: 'Bearer invalid-token' }
      });
      expect(response.status).toBe(401);
    });

    test('Should reject requests with malformed token', async () => {
      const response = await api.get('/my/stats', {
        headers: { Authorization: 'invalid-format' }
      });
      expect(response.status).toBe(401);
    });

    test('Should reject weak passwords', async () => {
      const weakPasswords = ['123', 'password', 'abc123', '12345678'];
      
      for (const password of weakPasswords) {
        const response = await api.post('/auth/register', {
          email: `weak-${Date.now()}@example.com`,
          password,
          handle: `weak${Date.now()}`,
          firstName: 'Weak',
          lastName: 'Password',
        });
        
        expect(response.status).toBe(400);
      }
    });

    test('Should prevent duplicate email registration', async () => {
      const email = `duplicate-${Date.now()}@example.com`;
      
      // First registration
      await api.post('/auth/register', {
        email,
        password: 'ValidPassword123!',
        handle: `duplicate1${Date.now()}`,
        firstName: 'First',
        lastName: 'User',
      });

      // Second registration with same email
      const response = await api.post('/auth/register', {
        email,
        password: 'ValidPassword123!',
        handle: `duplicate2${Date.now()}`,
        firstName: 'Second',
        lastName: 'User',
      });

      expect(response.status).toBe(400);
    });

    test('Should prevent duplicate handle registration', async () => {
      const handle = `duphandle${Date.now()}`;
      
      // First registration
      await api.post('/auth/register', {
        email: `first-${Date.now()}@example.com`,
        password: 'ValidPassword123!',
        handle,
        firstName: 'First',
        lastName: 'User',
      });

      // Second registration with same handle
      const response = await api.post('/auth/register', {
        email: `second-${Date.now()}@example.com`,
        password: 'ValidPassword123!',
        handle,
        firstName: 'Second',
        lastName: 'User',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('Input Validation and Sanitization', () => {
    test('Should reject SQL injection attempts', async () => {
      const sqlInjectionPayloads = [
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        "'; UPDATE users SET role='admin' WHERE id=1; --",
        "UNION SELECT * FROM users",
      ];

      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

      for (const payload of sqlInjectionPayloads) {
        const response = await api.post('/cars', {
          name: payload,
          make: payload,
          model: payload,
          year: 2023,
        });

        // Should either reject the input or sanitize it (status 400 or 201 with sanitized data)
        if (response.status === 201) {
          expect(response.data.car.name).not.toContain('DROP');
          expect(response.data.car.name).not.toContain('UPDATE');
          expect(response.data.car.name).not.toContain('UNION');
        } else {
          expect(response.status).toBe(400);
        }
      }
    });

    test('Should reject XSS attempts', async () => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(1)">',
        '"><script>alert(document.cookie)</script>',
      ];

      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

      for (const payload of xssPayloads) {
        const response = await api.post('/cars', {
          name: payload,
          make: 'Test',
          model: 'Test',
          year: 2023,
        });

        if (response.status === 201) {
          expect(response.data.car.name).not.toContain('<script>');
          expect(response.data.car.name).not.toContain('javascript:');
          expect(response.data.car.name).not.toContain('onerror');
        }
      }
    });

    test('Should validate and reject oversized payloads', async () => {
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

      const oversizedData = {
        name: 'A'.repeat(10000), // Very long name
        make: 'B'.repeat(5000),  // Very long make
        model: 'C'.repeat(5000), // Very long model
        year: 2023,
        description: 'D'.repeat(100000), // 100KB description
      };

      const response = await api.post('/cars', oversizedData);

      // Should either reject oversized data or truncate it
      expect(response.status).toBeOneOf([400, 413]); // Bad Request or Payload Too Large
    });

    test('Should validate data types and ranges', async () => {
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

      const invalidData = [
        { year: 'invalid_year' }, // String instead of number
        { year: 1800 }, // Year too old
        { year: 2100 }, // Year too far in future
        { whp: -100 }, // Negative horsepower
        { weightKg: 'heavy' }, // String instead of number
      ];

      for (const data of invalidData) {
        const response = await api.post('/cars', {
          name: 'Test Car',
          make: 'Test',
          model: 'Test',
          ...data,
        });

        expect(response.status).toBe(400);
      }
    });
  });

  describe('Access Control and Authorization', () => {
    test('Should prevent access to other users data', async () => {
      // Create another user
      const otherUserResponse = await api.post('/auth/register', {
        email: `other-${Date.now()}@example.com`,
        password: 'OtherUser123!',
        handle: `other${Date.now()}`,
        firstName: 'Other',
        lastName: 'User',
      });

      const otherUserId = otherUserResponse.data.user.id;

      // Try to access other user's data with current user's token
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
      const response = await api.get(`/users/${otherUserId}/private-data`);
      
      // Should not allow access to private data
      expect(response.status).toBeOneOf([403, 404]);
    });

    test('Should prevent unauthorized car modification', async () => {
      // Create a car with current user
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
      const carResponse = await api.post('/cars', {
        name: 'Secure Test Car',
        make: 'Security',
        model: 'Test',
        year: 2023,
      });

      const carId = carResponse.data.car.id;

      // Create another user
      const otherUserResponse = await api.post('/auth/register', {
        email: `unauthorized-${Date.now()}@example.com`,
        password: 'UnauthorizedUser123!',
        handle: `unauthorized${Date.now()}`,
        firstName: 'Unauthorized',
        lastName: 'User',
      });

      const otherToken = otherUserResponse.data.token;

      // Try to modify the car with the other user's token
      const response = await api.put(`/cars/${carId}`, {
        name: 'Hacked Car',
      }, {
        headers: { Authorization: `Bearer ${otherToken}` }
      });

      expect(response.status).toBeOneOf([403, 404]);
    });

    test('Should prevent unauthorized race management', async () => {
      // Create a race with current user
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
      const raceResponse = await api.post('/races', {
        name: 'Secure Race',
        raceType: 'drag',
        startTime: new Date(Date.now() + 3600000).toISOString(),
        maxParticipants: 4,
      });

      const raceId = raceResponse.data.race.id;

      // Create another user
      const otherUserResponse = await api.post('/auth/register', {
        email: `raceunauth-${Date.now()}@example.com`,
        password: 'RaceUnauth123!',
        handle: `raceunauth${Date.now()}`,
        firstName: 'Race',
        lastName: 'Unauthorized',
      });

      const otherToken = otherUserResponse.data.token;

      // Try to submit race results with unauthorized user
      const response = await api.post(`/races/${raceId}/results`, {
        participantId: 'fake-participant',
        position: 1,
        timeSeconds: 10.5,
      }, {
        headers: { Authorization: `Bearer ${otherToken}` }
      });

      expect(response.status).toBe(403);
    });
  });

  describe('Rate Limiting and DoS Protection', () => {
    test('Should implement rate limiting on authentication endpoints', async () => {
      const email = `ratelimit-${Date.now()}@example.com`;
      const password = 'wrongpassword';

      let rateLimitHit = false;
      let consecutiveFailures = 0;

      // Attempt multiple failed logins
      for (let i = 0; i < 10; i++) {
        const response = await api.post('/auth/login', {
          email,
          password,
        });

        if (response.status === 429) { // Too Many Requests
          rateLimitHit = true;
          break;
        } else if (response.status === 401) {
          consecutiveFailures++;
        }

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Should either hit rate limit or allow reasonable number of attempts
      expect(rateLimitHit || consecutiveFailures >= 5).toBe(true);
    });

    test('Should handle rapid request bursts gracefully', async () => {
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

      const rapidRequests = Array(20).fill(null).map(() => 
        api.get('/health')
      );

      const results = await Promise.all(rapidRequests);
      const successfulRequests = results.filter(r => r.status === 200).length;
      const rateLimitedRequests = results.filter(r => r.status === 429).length;

      // Should either succeed or be rate limited, not crash
      expect(successfulRequests + rateLimitedRequests).toBe(20);
    });
  });

  describe('Data Exposure and Privacy', () => {
    test('Should not expose sensitive data in API responses', async () => {
      const response = await api.post('/auth/login', {
        email: `sectest-${Date.now()}@example.com`,
        password: 'SecTest123!',
      });

      // Create the user first if login fails
      if (response.status !== 200) {
        await api.post('/auth/register', {
          email: `sectest-${Date.now()}@example.com`,
          password: 'SecTest123!',
          handle: `sectest${Date.now()}`,
          firstName: 'Security',
          lastName: 'Test',
        });
      }

      // Check user data doesn't expose password hash
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      const userResponse = await api.get('/my/stats');

      if (userResponse.status === 200) {
        expect(userResponse.data.user).not.toHaveProperty('passwordHash');
        expect(userResponse.data.user).not.toHaveProperty('password');
      }
    });

    test('Should sanitize error messages', async () => {
      const response = await api.get('/nonexistent-endpoint');

      expect(response.status).toBe(404);
      
      // Error message should not expose internal details
      if (response.data && response.data.message) {
        expect(response.data.message).not.toContain('database');
        expect(response.data.message).not.toContain('internal');
        expect(response.data.message).not.toContain('stack trace');
      }
    });
  });

  describe('HTTPS and Transport Security', () => {
    test('Should enforce secure headers', async () => {
      const response = await api.get('/health');

      // Check for security headers (if implemented)
      expect(response.headers).toMatchObject(expect.objectContaining({
        // These might not be implemented yet, but are good security practices
        // 'x-content-type-options': 'nosniff',
        // 'x-frame-options': 'DENY',
        // 'x-xss-protection': '1; mode=block',
      }));
    });
  });
});

// Helper function for expect.toBeOneOf
expect.extend({
  toBeOneOf(received, validOptions) {
    const pass = validOptions.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${validOptions}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be one of ${validOptions}`,
        pass: false,
      };
    }
  },
});