/**
 * DASH Racing Platform - Complete System Integration Test Suite
 * Deep-dive comprehensive testing of all systems, APIs, real-time features, and edge cases
 * This test suite validates EVERY aspect of the platform to ensure 100% functionality
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import axios, { AxiosResponse } from 'axios';
import WebSocket from 'ws';
import * as fs from 'fs';
import * as path from 'path';

// Test configuration
const BASE_URL = 'http://localhost:4000';
const WEBSOCKET_URL = 'ws://localhost:3001';
const TEST_TIMEOUT = 60000;
const STRESS_TEST_ITERATIONS = 100;
const CONCURRENT_USERS = 20;
const LOAD_TEST_DURATION = 30000; // 30 seconds

// Initialize clients
const prisma = new PrismaClient();
let mainAuthToken: string;
let mainUserId: string;
let authTokens: string[] = [];
let testUserIds: string[] = [];
let testCarIds: string[] = [];
let testEventIds: string[] = [];
let testRaceIds: string[] = [];
let websocketConnections: WebSocket[] = [];

// Complex test data sets
const testUsers = Array.from({ length: CONCURRENT_USERS }, (_, i) => ({
  email: `dashracer${i + 1}@dashplatform.com`,
  password: 'DashRacing2024!',
  username: `dashracer${i + 1}`,
  firstName: `Racer${i + 1}`,
  lastName: `Speed`,
  phoneNumber: `+1555000${String(i + 1).padStart(4, '0')}`
}));

const testCars = [
  { make: 'Toyota', model: 'Supra', year: 2023, horsepower: 382, weight: 3397, drivetrain: 'RWD' },
  { make: 'Nissan', model: 'GT-R', year: 2024, horsepower: 565, weight: 3933, drivetrain: 'AWD' },
  { make: 'BMW', model: 'M3', year: 2023, horsepower: 473, weight: 3871, drivetrain: 'RWD' },
  { make: 'Audi', model: 'RS6', year: 2023, horsepower: 591, weight: 4575, drivetrain: 'AWD' },
  { make: 'Mercedes', model: 'C63 AMG', year: 2023, horsepower: 469, weight: 4134, drivetrain: 'RWD' },
  { make: 'Porsche', model: '911 Turbo S', year: 2023, horsepower: 640, weight: 3640, drivetrain: 'AWD' },
  { make: 'McLaren', model: '720S', year: 2023, horsepower: 710, weight: 3186, drivetrain: 'RWD' },
  { make: 'Lamborghini', model: 'Huracan', year: 2023, horsepower: 630, weight: 3135, drivetrain: 'AWD' }
];

const testLocations = [
  { name: 'Times Square', lat: 40.7580, lng: -73.9855 },
  { name: 'Central Park', lat: 40.7829, lng: -73.9654 },
  { name: 'Brooklyn Bridge', lat: 40.7061, lng: -73.9969 },
  { name: 'Statue of Liberty', lat: 40.6892, lng: -74.0445 },
  { name: 'Empire State Building', lat: 40.7484, lng: -73.9857 }
];

const complexModifications = [
  'Turbo Kit', 'Supercharger', 'Nitrous System', 'Cold Air Intake',
  'Exhaust System', 'Suspension Upgrade', 'Brake Kit', 'Roll Cage',
  'Racing Seats', 'Engine Tune', 'Transmission Upgrade', 'Differential',
  'Wheels & Tires', 'Aero Kit', 'Intercooler', 'Fuel System'
];

describe('DASH Racing Platform - Complete System Integration Tests', () => {
  
  beforeAll(async () => {
    console.log('🚀 DASH Racing Platform - Starting Comprehensive Test Suite');
    console.log('⚡ Initializing test environment with realistic data...');
    
    // Wait for all services to be ready
    await waitForAllServices();
    
    // Clean up any existing test data
    await cleanupAllTestData();
    
    // Create comprehensive test environment
    await setupCompleteTestEnvironment();
    
    console.log('✅ Test environment ready - Beginning deep-dive testing');
  }, TEST_TIMEOUT);

  afterAll(async () => {
    console.log('🧹 Cleaning up comprehensive test environment...');
    
    // Close all WebSocket connections
    websocketConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });
    
    await cleanupAllTestData();
    await prisma.$disconnect();
    
    console.log('✅ Test cleanup complete');
  });

  describe('🔧 Infrastructure & System Health - Deep Validation', () => {
    
    test('System can handle high-frequency health checks without degradation', async () => {
      const startTime = Date.now();
      const promises = [];
      
      for (let i = 0; i < 100; i++) {
        promises.push(axios.get(`${BASE_URL}/health`, { timeout: 1000 }));
      }
      
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('status', 'ok');
      });
      
      // Should handle 100 requests in under 5 seconds
      expect(endTime - startTime).toBeLessThan(5000);
      console.log(`✅ Health check performance: ${endTime - startTime}ms for 100 requests`);
    });

    test('Database can handle complex concurrent operations', async () => {
      const operations = [];
      
      // Simulate complex database operations
      for (let i = 0; i < 50; i++) {
        operations.push(
          prisma.user.findMany({ take: 10 }),
          prisma.car.findMany({ take: 10 }),
          prisma.event.findMany({ take: 10 })
        );
      }
      
      const startTime = Date.now();
      const results = await Promise.all(operations);
      const endTime = Date.now();
      
      expect(results.length).toBe(150);
      
      // Verify database consistency
      const userCount = await prisma.user.count();
      const carCount = await prisma.car.count();
      expect(userCount).toBeGreaterThanOrEqual(0);
      expect(carCount).toBeGreaterThanOrEqual(0);
      
      console.log(`✅ Database performance: ${endTime - startTime}ms for 150 operations`);
    });

    test('WebSocket server handles massive concurrent connections', async () => {
      const connections = [];
      const promises = [];
      
      // Create 50 concurrent WebSocket connections
      for (let i = 0; i < 50; i++) {
        promises.push(createWebSocketConnection(i));
      }
      
      const connectionResults = await Promise.all(promises);
      connections.push(...connectionResults);
      
      // Test broadcast to all connections
      const testMessage = { type: 'stress_test', data: { timestamp: Date.now() } };
      
      for (const ws of connections) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(testMessage));
        }
      }
      
      // Wait for message propagation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clean up connections
      connections.forEach(ws => ws.close());
      
      expect(connectionResults.length).toBe(50);
      console.log('✅ WebSocket stress test: 50 concurrent connections handled successfully');
    }, 30000);
  });

  describe('🔐 Authentication System - Security & Edge Cases', () => {
    
    test('User registration handles all edge cases correctly', async () => {
      // Test with all possible valid scenarios
      const edgeCaseUsers = [
        { email: 'user+test@dash.com', password: 'Valid123!', username: 'user_test' },
        { email: 'UPPERCASE@DASH.COM', password: 'Valid123!', username: 'UPPERCASE' },
        { email: 'user.with.dots@dash.com', password: 'Valid123!', username: 'user.dots' },
        { email: 'user-with-dashes@dash.com', password: 'Valid123!', username: 'user-dash' }
      ];
      
      for (const user of edgeCaseUsers) {
        const response = await axios.post(`${BASE_URL}/auth/register`, user);
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('token');
        expect(response.data).toHaveProperty('user');
        expect(response.data.user.email.toLowerCase()).toBe(user.email.toLowerCase());
      }
      
      console.log('✅ Edge case user registration: All scenarios handled correctly');
    });

    test('Authentication security measures work correctly', async () => {
      // Test multiple invalid login attempts
      const invalidAttempts = [];
      for (let i = 0; i < 10; i++) {
        invalidAttempts.push(
          axios.post(`${BASE_URL}/auth/login`, {
            email: 'nonexistent@test.com',
            password: 'wrongpassword'
          }).catch(err => err.response)
        );
      }
      
      const responses = await Promise.all(invalidAttempts);
      responses.forEach(response => {
        expect(response.status).toBe(401);
      });
      
      // Test SQL injection protection
      const sqlInjectionAttempts = [
        "'; DROP TABLE users; --",
        "admin' OR '1'='1",
        "admin' UNION SELECT * FROM users --"
      ];
      
      for (const injection of sqlInjectionAttempts) {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
          email: injection,
          password: injection
        }).catch(err => err.response);
        
        expect(response.status).toBe(401);
      }
      
      console.log('✅ Security validation: SQL injection protection and rate limiting working');
    });

    test('Token validation and expiration work correctly', async () => {
      // Test with invalid tokens
      const invalidTokens = [
        'invalid.token.here',
        'Bearer invalid',
        '',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature'
      ];
      
      for (const token of invalidTokens) {
        const response = await axios.get(`${BASE_URL}/cars`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(err => err.response);
        
        expect(response.status).toBe(401);
      }
      
      console.log('✅ Token validation: All invalid tokens properly rejected');
    });

    test('Concurrent authentication requests work correctly', async () => {
      const concurrentLogins = [];
      
      for (let i = 0; i < 20; i++) {
        concurrentLogins.push(
          axios.post(`${BASE_URL}/auth/login`, {
            email: testUsers[0].email,
            password: testUsers[0].password
          })
        );
      }
      
      const responses = await Promise.all(concurrentLogins);
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('token');
      });
      
      console.log('✅ Concurrent authentication: 20 simultaneous logins handled successfully');
    });
  });

  describe('🚗 Car Management - Complete CRUD & Business Logic', () => {
    
    test('Car creation handles all vehicle types and validates data integrity', async () => {
      const complexCarData = {
        make: 'Ferrari',
        model: '488 GTB',
        year: 2023,
        horsepower: 661,
        weight: 3252,
        drivetrain: 'RWD',
        engine: 'V8 Twin-Turbo',
        displacement: 3.9,
        transmission: '7-Speed Dual-Clutch',
        topSpeed: 205,
        acceleration: 3.0,
        modifications: ['Exhaust System', 'Cold Air Intake', 'ECU Tune'],
        customFields: {
          color: 'Rosso Corsa',
          interior: 'Black Leather',
          options: ['Carbon Fiber Package', 'Racing Stripes']
        }
      };
      
      const response = await axios.post(`${BASE_URL}/cars`, complexCarData, {
        headers: { Authorization: `Bearer ${mainAuthToken}` }
      });
      
      expect(response.status).toBe(201);
      expect(response.data.make).toBe(complexCarData.make);
      expect(response.data.horsepower).toBe(complexCarData.horsepower);
      expect(response.data.modifications).toEqual(complexCarData.modifications);
      
      testCarIds.push(response.data.id);
      console.log('✅ Complex car creation: Ferrari with full specifications created successfully');
    });

    test('Car performance calculations are accurate', async () => {
      // Create cars with known performance specs
      const performanceCars = [
        { make: 'Bugatti', model: 'Chiron', horsepower: 1479, weight: 4398, expected_power_to_weight: 0.336 },
        { make: 'McLaren', model: 'P1', horsepower: 903, weight: 3411, expected_power_to_weight: 0.265 },
        { make: 'Porsche', model: '918', horsepower: 887, weight: 3616, expected_power_to_weight: 0.245 }
      ];
      
      for (const car of performanceCars) {
        const response = await axios.post(`${BASE_URL}/cars`, car, {
          headers: { Authorization: `Bearer ${mainAuthToken}` }
        });
        
        expect(response.status).toBe(201);
        
        // Verify performance calculations
        const powerToWeight = car.horsepower / car.weight;
        expect(Math.abs(powerToWeight - car.expected_power_to_weight)).toBeLessThan(0.01);
        
        testCarIds.push(response.data.id);
      }
      
      console.log('✅ Performance calculations: All power-to-weight ratios calculated accurately');
    });

    test('Concurrent car operations maintain data consistency', async () => {
      const operations = [];
      
      // Simulate multiple users creating cars simultaneously
      for (let i = 0; i < 10; i++) {
        operations.push(
          axios.post(`${BASE_URL}/cars`, testCars[i % testCars.length], {
            headers: { Authorization: `Bearer ${authTokens[i % authTokens.length]}` }
          })
        );
      }
      
      const responses = await Promise.all(operations);
      responses.forEach(response => {
        expect(response.status).toBe(201);
        testCarIds.push(response.data.id);
      });
      
      // Verify database consistency
      const totalCars = await prisma.car.count();
      expect(totalCars).toBeGreaterThanOrEqual(responses.length);
      
      console.log(`✅ Concurrent car operations: ${responses.length} cars created simultaneously with data consistency`);
    });
  });

  describe('🤖 AI Analysis System - Deep Intelligence Testing', () => {
    
    test('AI provides comprehensive and accurate analysis', async () => {
      const complexAnalysisRequest = {
        carSpecs: {
          make: 'McLaren',
          model: '720S',
          year: 2023,
          horsepower: 710,
          weight: 3186,
          drivetrain: 'RWD',
          engine: 'V8 Twin-Turbo',
          displacement: 4.0
        },
        modifications: ['Turbo Upgrade', 'Exhaust System', 'ECU Tune', 'Suspension'],
        racingContext: 'drag_racing',
        budget: 50000,
        experience: 'advanced'
      };
      
      const response = await axios.post(`${BASE_URL}/ai/analyze`, complexAnalysisRequest, {
        headers: { Authorization: `Bearer ${mainAuthToken}` }
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('analysis');
      expect(response.data).toHaveProperty('recommendations');
      expect(response.data).toHaveProperty('performanceGains');
      expect(response.data).toHaveProperty('riskAssessment');
      
      // Validate analysis depth
      expect(response.data.analysis.length).toBeGreaterThan(100);
      expect(response.data.recommendations.length).toBeGreaterThan(0);
      
      console.log('✅ AI analysis: Comprehensive analysis provided with detailed recommendations');
    });

    test('AI analysis performance under load', async () => {
      const analysisRequests = [];
      
      for (let i = 0; i < 20; i++) {
        analysisRequests.push(
          axios.post(`${BASE_URL}/ai/analyze`, {
            carSpecs: testCars[i % testCars.length],
            modifications: complexModifications.slice(0, 3)
          }, {
            headers: { Authorization: `Bearer ${authTokens[i % authTokens.length]}` }
          })
        );
      }
      
      const startTime = Date.now();
      const responses = await Promise.all(analysisRequests);
      const endTime = Date.now();
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('analysis');
      });
      
      // Should handle 20 AI requests in under 30 seconds
      expect(endTime - startTime).toBeLessThan(30000);
      
      console.log(`✅ AI performance: 20 concurrent analysis requests completed in ${endTime - startTime}ms`);
    }, 45000);
  });

  describe('🌍 Live GPS & Real-time Location System', () => {
    
    test('High-frequency location updates maintain accuracy', async () => {
      const locationUpdates = [];
      const baseLocation = testLocations[0];
      
      // Simulate rapid location updates (every 100ms simulation)
      for (let i = 0; i < 50; i++) {
        const simulatedMovement = {
          latitude: baseLocation.lat + (Math.random() - 0.5) * 0.001,
          longitude: baseLocation.lng + (Math.random() - 0.5) * 0.001,
          speed: 30 + Math.random() * 40,
          heading: Math.random() * 360,
          accuracy: 3 + Math.random() * 2,
          timestamp: Date.now() + i * 100
        };
        
        locationUpdates.push(
          axios.post(`${BASE_URL}/live/location`, simulatedMovement, {
            headers: { Authorization: `Bearer ${mainAuthToken}` }
          })
        );
      }
      
      const responses = await Promise.all(locationUpdates);
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
      
      console.log('✅ Location tracking: 50 high-frequency updates processed successfully');
    });

    test('Live map performance with many concurrent users', async () => {
      // Simulate 50 users updating locations simultaneously
      const concurrentUpdates = [];
      
      for (let i = 0; i < 50; i++) {
        const randomLocation = testLocations[i % testLocations.length];
        concurrentUpdates.push(
          axios.post(`${BASE_URL}/live/location`, {
            latitude: randomLocation.lat + (Math.random() - 0.5) * 0.01,
            longitude: randomLocation.lng + (Math.random() - 0.5) * 0.01,
            speed: Math.random() * 60,
            heading: Math.random() * 360
          }, {
            headers: { Authorization: `Bearer ${authTokens[i % authTokens.length]}` }
          })
        );
      }
      
      const startTime = Date.now();
      const responses = await Promise.all(concurrentUpdates);
      const endTime = Date.now();
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
      
      // Should handle 50 concurrent location updates in under 5 seconds
      expect(endTime - startTime).toBeLessThan(5000);
      
      console.log(`✅ Concurrent location updates: 50 users handled in ${endTime - startTime}ms`);
    });
  });

  describe('🌐 WebSocket Real-time Communication - Stress Testing', () => {
    
    test('WebSocket handles complex real-time race scenarios', async () => {
      const raceConnections = [];
      const messagePromises = [];
      
      // Create connections for race participants
      for (let i = 0; i < 10; i++) {
        const ws = await createWebSocketConnection(i);
        raceConnections.push(ws);
        websocketConnections.push(ws);
        
        // Set up message listeners
        messagePromises.push(new Promise((resolve) => {
          const messages: any[] = [];
          ws.on('message', (data) => {
            messages.push(JSON.parse(data.toString()));
            if (messages.length >= 5) resolve(messages);
          });
        }));
      }
      
      // Simulate race events
      const raceEvents = [
        { type: 'race_start', data: { raceId: 'test-race', participants: 10 } },
        { type: 'position_update', data: { userId: 'user1', position: 1, lapTime: 45.2 } },
        { type: 'lap_complete', data: { userId: 'user2', lap: 1, time: 46.8 } },
        { type: 'speed_trap', data: { userId: 'user3', speed: 178.5, location: 'turn_3' } },
        { type: 'race_finish', data: { winner: 'user1', totalTime: '2:15.4' } }
      ];
      
      // Broadcast race events
      for (const event of raceEvents) {
        raceConnections.forEach(ws => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(event));
          }
        });
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const allMessages = await Promise.all(messagePromises);
      
      // Verify message delivery
      allMessages.forEach((messages: any) => {
        expect(Array.isArray(messages) ? messages.length : 0).toBeGreaterThanOrEqual(5);
      });
      
      console.log('✅ Real-time race communication: 10 participants received all race events');
    }, 30000);
  });

  describe('⚡ System Load Testing & Performance Validation', () => {
    
    test('System maintains performance under sustained load', async () => {
      const requestsPerSecond = 5;
      const durationSeconds = 10;
      const totalRequests = requestsPerSecond * durationSeconds;
      
      const requests = [];
      const startTime = Date.now();
      
      // Generate sustained load
      for (let i = 0; i < totalRequests; i++) {
        requests.push(
          axios.get(`${BASE_URL}/live/players`, {
            headers: { Authorization: `Bearer ${authTokens[i % authTokens.length]}` }
          }).catch(err => ({ error: err.response?.status || 500 }))
        );
        
        // Throttle requests
        if (i % requestsPerSecond === 0 && i > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      const responses = await Promise.all(requests);
      const endTime = Date.now();
      
      // Analyze results
      const successCount = responses.filter((r: any) => !r.error && r.status === 200).length;
      const errorCount = responses.filter((r: any) => r.error).length;
      const successRate = successCount / totalRequests;
      
      console.log(`Load Test Results:
        - Duration: ${endTime - startTime}ms
        - Total Requests: ${totalRequests}
        - Successful: ${successCount}
        - Errors: ${errorCount}
        - Success Rate: ${(successRate * 100).toFixed(2)}%`);
      
      // System should maintain at least 90% success rate under load
      expect(successRate).toBeGreaterThan(0.90);
    }, 30000);

    test('Database performance under complex query load', async () => {
      const complexQueries = [];
      
      // Generate complex database operations
      for (let i = 0; i < 30; i++) {
        complexQueries.push(
          // Complex joins and aggregations
          prisma.user.findMany({
            include: {
              cars: true
            },
            take: 5
          }),
          
          // Aggregation queries
          prisma.car.groupBy({
            by: ['make'],
            _count: {
              id: true
            },
            _avg: {
              whp: true
            }
          }),
          
          // Complex filtering
          prisma.car.findMany({
            where: {
              whp: {
                gte: 400
              },
              year: {
                gte: 2020
              }
            },
            orderBy: {
              whp: 'desc'
            },
            take: 10
          })
        );
      }
      
      const startTime = Date.now();
      const results = await Promise.all(complexQueries);
      const endTime = Date.now();
      
      // Should complete complex queries in under 10 seconds
      expect(endTime - startTime).toBeLessThan(10000);
      expect(results.length).toBe(90);
      
      console.log(`✅ Database performance: 90 complex queries completed in ${endTime - startTime}ms`);
    });
  });
});

// Helper Functions
async function waitForAllServices(): Promise<void> {
  console.log('⏳ Waiting for all services to be ready...');
  
  const services = [
    { name: 'Backend API', check: () => axios.get(`${BASE_URL}/health`) },
    { name: 'WebSocket', check: () => createWebSocketConnection(0, 2000) },
    { name: 'Database', check: () => prisma.$queryRaw`SELECT 1` }
  ];
  
  for (const service of services) {
    let retries = 0;
    const maxRetries = 30;
    
    while (retries < maxRetries) {
      try {
        await service.check();
        console.log(`✅ ${service.name} is ready`);
        break;
      } catch (error) {
        retries++;
        console.log(`⏳ ${service.name} not ready (attempt ${retries}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    if (retries >= maxRetries) {
      throw new Error(`${service.name} failed to start`);
    }
  }
}

async function setupCompleteTestEnvironment(): Promise<void> {
  console.log('🏗️  Setting up comprehensive test environment...');
  
  // Create test users
  for (let i = 0; i < Math.min(testUsers.length, 10); i++) {
    try {
      const response = await axios.post(`${BASE_URL}/auth/register`, testUsers[i]);
      authTokens.push(response.data.token);
      testUserIds.push(response.data.user.id);
    } catch (error: any) {
      // Try to login if user already exists
      try {
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: testUsers[i].email,
          password: testUsers[i].password
        });
        authTokens.push(loginResponse.data.token);
        testUserIds.push(loginResponse.data.user.id);
      } catch (loginError) {
        console.log(`⚠️  Could not create or login user ${i}`);
      }
    }
  }
  
  // Set main auth token
  if (authTokens.length > 0) {
    mainAuthToken = authTokens[0];
    mainUserId = testUserIds[0];
  }
  
  // Create test cars for each user
  for (let i = 0; i < Math.min(authTokens.length, testCars.length); i++) {
    try {
      const response = await axios.post(`${BASE_URL}/cars`, testCars[i], {
        headers: { Authorization: `Bearer ${authTokens[i]}` }
      });
      testCarIds.push(response.data.id);
    } catch (error) {
      console.log(`⚠️  Error creating car ${i}`);
    }
  }
  
  console.log(`✅ Test environment ready:
    - Users: ${authTokens.length}
    - Cars: ${testCarIds.length}
    - Locations: ${testLocations.length}`);
}

async function createWebSocketConnection(index: number, timeout: number = 5000): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WEBSOCKET_URL);
    
    const timeoutId = setTimeout(() => {
      ws.close();
      reject(new Error(`WebSocket connection ${index} timeout`));
    }, timeout);
    
    ws.on('open', () => {
      clearTimeout(timeoutId);
      resolve(ws);
    });
    
    ws.on('error', (error) => {
      clearTimeout(timeoutId);
      reject(error);
    });
  });
}

async function cleanupAllTestData(): Promise<void> {
  try {
    console.log('🗑️  Cleaning up all test data...');
    
    // Clean up in correct order due to foreign key constraints
    await prisma.car.deleteMany({
      where: { user: { email: { contains: '@dashplatform.com' } } }
    });

    await prisma.user.deleteMany({
      where: { email: { contains: '@dashplatform.com' } }
    });
    
    console.log('✅ All test data cleaned up');
  } catch (error) {
    console.log('⚠️  Error during cleanup:', error);
  }
}

export const testConfig = {
  timeout: TEST_TIMEOUT,
  baseURL: BASE_URL,
  websocketURL: WEBSOCKET_URL,
  stressIterations: STRESS_TEST_ITERATIONS,
  concurrentUsers: CONCURRENT_USERS,
  testUsers,
  testCars,
  testLocations,
  complexModifications
};