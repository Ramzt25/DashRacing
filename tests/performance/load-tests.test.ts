import { describe, beforeAll, afterAll, test, expect } from '@jest/globals';
import axios, { AxiosInstance } from 'axios';

interface LoadTestResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
}

describe('Performance and Load Tests', () => {
  let api: AxiosInstance;
  let authToken: string;

  const baseURL = process.env.API_URL || 'http://localhost:3000';

  beforeAll(async () => {
    api = axios.create({
      baseURL,
      timeout: 30000,
      validateStatus: () => true,
    });

    // Create test user and get auth token
    const registerResponse = await api.post('/auth/register', {
      email: `perftest-${Date.now()}@example.com`,
      password: 'PerfTest123!',
      handle: `perftest${Date.now()}`,
      firstName: 'Perf',
      lastName: 'Test',
    });

    if (registerResponse.status === 201) {
      authToken = registerResponse.data.token;
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    }
  });

  async function performLoadTest(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    data?: any,
    concurrency: number = 10,
    totalRequests: number = 100
  ): Promise<LoadTestResult> {
    const results: number[] = [];
    const errors: number[] = [];
    const startTime = Date.now();

    const batches = Math.ceil(totalRequests / concurrency);
    
    for (let batch = 0; batch < batches; batch++) {
      const batchSize = Math.min(concurrency, totalRequests - batch * concurrency);
      const promises: Promise<any>[] = [];

      for (let i = 0; i < batchSize; i++) {
        const requestStart = Date.now();
        
        const promise = (method === 'POST' ? 
          api.post(endpoint, data) : 
          api.get(endpoint)
        ).then(response => {
          const responseTime = Date.now() - requestStart;
          if (response.status >= 200 && response.status < 300) {
            results.push(responseTime);
          } else {
            errors.push(response.status);
          }
        }).catch(() => {
          errors.push(0); // Network error
        });

        promises.push(promise);
      }

      await Promise.all(promises);
    }

    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000; // Convert to seconds

    return {
      totalRequests,
      successfulRequests: results.length,
      failedRequests: errors.length,
      averageResponseTime: results.length > 0 ? results.reduce((a, b) => a + b, 0) / results.length : 0,
      minResponseTime: results.length > 0 ? Math.min(...results) : 0,
      maxResponseTime: results.length > 0 ? Math.max(...results) : 0,
      requestsPerSecond: totalRequests / totalTime,
    };
  }

  describe('API Response Time Tests', () => {
    test('GET /health - should respond within 100ms', async () => {
      const start = Date.now();
      const response = await api.get('/health');
      const responseTime = Date.now() - start;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(100);
    });

    test('GET /races - should respond within 500ms', async () => {
      const start = Date.now();
      const response = await api.get('/races');
      const responseTime = Date.now() - start;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(500);
    });

    test('GET /leaderboard - should respond within 1000ms', async () => {
      const start = Date.now();
      const response = await api.get('/leaderboard');
      const responseTime = Date.now() - start;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(1000);
    });

    test('GET /my/stats - should respond within 500ms', async () => {
      const start = Date.now();
      const response = await api.get('/my/stats');
      const responseTime = Date.now() - start;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(500);
    });
  });

  describe('Load Testing', () => {
    test('Health endpoint load test - 100 requests, 10 concurrent', async () => {
      const result = await performLoadTest('/health', 'GET', undefined, 10, 100);

      expect(result.successfulRequests).toBeGreaterThan(95); // 95% success rate
      expect(result.averageResponseTime).toBeLessThan(200); // Average under 200ms
      expect(result.requestsPerSecond).toBeGreaterThan(10); // At least 10 RPS

      console.log('Health endpoint load test results:', result);
    }, 30000);

    test('Races endpoint load test - 50 requests, 5 concurrent', async () => {
      const result = await performLoadTest('/races', 'GET', undefined, 5, 50);

      expect(result.successfulRequests).toBeGreaterThan(45); // 90% success rate
      expect(result.averageResponseTime).toBeLessThan(1000); // Average under 1s
      expect(result.requestsPerSecond).toBeGreaterThan(5); // At least 5 RPS

      console.log('Races endpoint load test results:', result);
    }, 30000);

    test('Leaderboard endpoint load test - 30 requests, 3 concurrent', async () => {
      const result = await performLoadTest('/leaderboard', 'GET', undefined, 3, 30);

      expect(result.successfulRequests).toBeGreaterThan(27); // 90% success rate
      expect(result.averageResponseTime).toBeLessThan(2000); // Average under 2s
      expect(result.requestsPerSecond).toBeGreaterThan(2); // At least 2 RPS

      console.log('Leaderboard endpoint load test results:', result);
    }, 30000);

    test('Authentication load test - 20 logins, 2 concurrent', async () => {
      // First create test users
      const testUsers = [];
      for (let i = 0; i < 20; i++) {
        const userData = {
          email: `loadtest${i}-${Date.now()}@example.com`,
          password: 'LoadTest123!',
          handle: `loadtest${i}${Date.now()}`,
          firstName: 'Load',
          lastName: 'Test',
        };
        
        await api.post('/auth/register', userData);
        testUsers.push(userData);
      }

      // Test login performance
      let successCount = 0;
      let responseTimes = [];
      
      for (const user of testUsers) {
        const start = Date.now();
        const response = await api.post('/auth/login', {
          email: user.email,
          password: user.password,
        });
        const responseTime = Date.now() - start;
        
        if (response.status === 200) {
          successCount++;
        }
        responseTimes.push(responseTime);
      }

      const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

      expect(successCount).toBeGreaterThan(18); // 90% success rate
      expect(averageResponseTime).toBeLessThan(1000); // Average under 1s

      console.log('Authentication load test results:', {
        successfulLogins: successCount,
        averageResponseTime,
        maxResponseTime: Math.max(...responseTimes),
        minResponseTime: Math.min(...responseTimes),
      });
    }, 45000);
  });

  describe('Memory and Resource Usage Tests', () => {
    test('Large payload handling - should handle large car data', async () => {
      const largeCarData = {
        name: 'Large Test Car',
        make: 'TestMake',
        model: 'TestModel',
        year: 2023,
        color: 'Blue',
        class: 'Sports',
        owned: true,
        weightKg: 1500,
        whp: 400,
        drivetrain: 'RWD',
        // Add large description to test payload handling
        description: 'A'.repeat(10000), // 10KB description
        notes: 'B'.repeat(5000), // 5KB notes
      };

      const start = Date.now();
      const response = await api.post('/cars', largeCarData);
      const responseTime = Date.now() - start;

      expect(response.status).toBe(201);
      expect(responseTime).toBeLessThan(2000); // Should handle large payloads within 2s
    });

    test('Concurrent car creation - stress test', async () => {
      const concurrentRequests = 5;
      const promises = [];

      for (let i = 0; i < concurrentRequests; i++) {
        const carData = {
          name: `Stress Test Car ${i}`,
          make: 'StressTest',
          model: `Model${i}`,
          year: 2023,
          color: 'Red',
          class: 'Sports',
          owned: true,
        };

        promises.push(api.post('/cars', carData));
      }

      const results = await Promise.all(promises);
      const successfulCreations = results.filter(r => r.status === 201).length;

      expect(successfulCreations).toBeGreaterThan(3); // At least 60% success under stress
    });
  });

  describe('Database Performance Tests', () => {
    test('Large dataset queries - leaderboard performance', async () => {
      // Test with different limit sizes to check query performance
      const limits = [10, 50, 100];
      
      for (const limit of limits) {
        const start = Date.now();
        const response = await api.get(`/leaderboard?limit=${limit}`);
        const responseTime = Date.now() - start;

        expect(response.status).toBe(200);
        expect(responseTime).toBeLessThan(2000 + limit * 10); // Allow more time for larger datasets
        
        console.log(`Leaderboard query (limit ${limit}): ${responseTime}ms`);
      }
    });

    test('Complex stats queries - user statistics performance', async () => {
      const start = Date.now();
      const response = await api.get('/my/stats');
      const responseTime = Date.now() - start;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(1500); // Complex aggregation queries
      
      console.log(`User stats query: ${responseTime}ms`);
    });
  });
});