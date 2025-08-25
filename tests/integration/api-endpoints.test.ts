import { describe, beforeAll, afterAll, test, expect } from '@jest/globals';
import axios, { AxiosInstance } from 'axios';

describe('API Endpoints Integration Tests', () => {
  let api: AxiosInstance;
  let authToken: string;
  let testUserId: string;
  let testCarId: string;
  let testRaceId: string;

  const baseURL = process.env.API_URL || 'http://localhost:3000';

  beforeAll(async () => {
    api = axios.create({
      baseURL,
      timeout: 10000,
      validateStatus: () => true, // Don't throw on HTTP errors
    });

    // Create test user and get auth token
    const registerResponse = await api.post('/auth/register', {
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      handle: `testuser${Date.now()}`,
      firstName: 'Test',
      lastName: 'User',
    });

    if (registerResponse.status === 201) {
      authToken = registerResponse.data.token;
      testUserId = registerResponse.data.user.id;
      
      // Set default auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    }
  });

  afterAll(async () => {
    // Cleanup test data if needed
    if (testCarId) {
      await api.delete(`/cars/${testCarId}`);
    }
    if (testRaceId) {
      await api.delete(`/races/${testRaceId}`);
    }
  });

  describe('Authentication Endpoints', () => {
    test('POST /auth/register - should create new user', async () => {
      const response = await api.post('/auth/register', {
        email: `newuser-${Date.now()}@example.com`,
        password: 'NewPassword123!',
        handle: `newuser${Date.now()}`,
        firstName: 'New',
        lastName: 'User',
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('token');
      expect(response.data).toHaveProperty('user');
      expect(response.data.user).toHaveProperty('id');
      expect(response.data.user.email).toMatch(/newuser-.*@example\.com/);
    });

    test('POST /auth/login - should authenticate user', async () => {
      // First register a user
      const email = `logintest-${Date.now()}@example.com`;
      const password = 'LoginTest123!';
      
      await api.post('/auth/register', {
        email,
        password,
        handle: `logintest${Date.now()}`,
        firstName: 'Login',
        lastName: 'Test',
      });

      // Then try to login
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('token');
      expect(response.data).toHaveProperty('user');
    });

    test('POST /auth/login - should reject invalid credentials', async () => {
      const response = await api.post('/auth/login', {
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
    });
  });

  describe('Car Management Endpoints', () => {
    test('POST /cars - should create a new car', async () => {
      const carData = {
        name: 'Test Car',
        make: 'Toyota',
        model: 'Supra',
        year: 2023,
        color: 'Blue',
        class: 'Sports',
        owned: true,
        weightKg: 1500,
        whp: 400,
        drivetrain: 'RWD',
      };

      const response = await api.post('/cars', carData);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data.car).toMatchObject(carData);
      
      testCarId = response.data.car.id;
    });

    test('GET /cars - should list user cars', async () => {
      const response = await api.get('/cars');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      if (response.data.length > 0) {
        expect(response.data[0]).toHaveProperty('id');
        expect(response.data[0]).toHaveProperty('name');
        expect(response.data[0]).toHaveProperty('make');
      }
    });

    test('GET /cars/:id - should get specific car', async () => {
      if (!testCarId) {
        return; // Skip if no test car was created
      }

      const response = await api.get(`/cars/${testCarId}`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', testCarId);
      expect(response.data).toHaveProperty('name', 'Test Car');
    });

    test('PUT /cars/:id - should update car', async () => {
      if (!testCarId) {
        return; // Skip if no test car was created
      }

      const updateData = {
        name: 'Updated Test Car',
        whp: 450,
      };

      const response = await api.put(`/cars/${testCarId}`, updateData);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data.car.name).toBe('Updated Test Car');
      expect(response.data.car.whp).toBe(450);
    });
  });

  describe('Race Management Endpoints', () => {
    test('POST /races - should create a new race', async () => {
      const raceData = {
        name: 'Test Race',
        raceType: 'drag',
        startTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        maxParticipants: 4,
        distance: 0.25,
        locationName: 'Test Track',
        locationLat: 40.7128,
        locationLon: -74.0060,
      };

      const response = await api.post('/races', raceData);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data.race).toMatchObject({
        name: raceData.name,
        raceType: raceData.raceType,
        maxParticipants: raceData.maxParticipants,
      });
      
      testRaceId = response.data.race.id;
    });

    test('GET /races - should list races', async () => {
      const response = await api.get('/races');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      if (response.data.length > 0) {
        expect(response.data[0]).toHaveProperty('id');
        expect(response.data[0]).toHaveProperty('raceType');
        expect(response.data[0]).toHaveProperty('status');
      }
    });

    test('POST /races/:id/join - should join a race', async () => {
      if (!testRaceId || !testCarId) {
        return; // Skip if no test race or car
      }

      const response = await api.post(`/races/${testRaceId}/join`, {
        carId: testCarId,
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data.participant).toHaveProperty('raceId', testRaceId);
    });

    test('GET /races/:id/participants - should list race participants', async () => {
      if (!testRaceId) {
        return; // Skip if no test race
      }

      const response = await api.get(`/races/${testRaceId}/participants`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe('User Statistics Endpoints', () => {
    test('GET /my/stats - should get current user stats', async () => {
      const response = await api.get('/my/stats');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('user');
      expect(response.data).toHaveProperty('stats');
      expect(response.data.stats).toHaveProperty('totalRaces');
      expect(response.data.stats).toHaveProperty('wins');
      expect(response.data.stats).toHaveProperty('winRate');
    });

    test('GET /leaderboard - should get leaderboard', async () => {
      const response = await api.get('/leaderboard?limit=5');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('leaderboard');
      expect(Array.isArray(response.data.leaderboard)).toBe(true);
      expect(response.data).toHaveProperty('filters');
    });

    test('GET /users/:id/stats - should get specific user stats', async () => {
      const response = await api.get(`/users/${testUserId}/stats`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('user');
      expect(response.data).toHaveProperty('stats');
      expect(response.data.user.id).toBe(testUserId);
    });
  });

  describe('Event Management Endpoints', () => {
    test('GET /events - should list events', async () => {
      const response = await api.get('/events');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    test('POST /events - should create new event', async () => {
      const eventData = {
        title: 'Test Car Meet',
        description: 'A test car meetup event',
        eventType: 'meetup',
        startTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
        locationName: 'Test Location',
        maxAttendees: 20,
        isPublic: true,
      };

      const response = await api.post('/events', eventData);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data.event).toMatchObject({
        title: eventData.title,
        eventType: eventData.eventType,
      });
    });
  });

  describe('Health and System Endpoints', () => {
    test('GET /health - should return system health', async () => {
      const response = await api.get('/health');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status');
      expect(response.data.status).toBe('healthy');
    });

    test('GET / - should return API info', async () => {
      const response = await api.get('/');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('message');
    });
  });
});