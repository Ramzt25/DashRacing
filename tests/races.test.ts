import { test, expect } from '@jest/globals';
import { buildServer } from '../backend/plugins';
import { registerAuthRoutes } from '../backend/auth';

describe('Races API', () => {
  let app: any;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    app = buildServer();
    await registerAuthRoutes(app);
    await app.ready();

    // Create test user and get auth token
    const registerResponse = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'racer-test@example.com',
        password: 'TestPassword123!',
        firstName: 'Racer',
        lastName: 'Test'
      }
    });

    const body = JSON.parse(registerResponse.body);
    authToken = body.token;
    userId = body.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  test('POST /races should create new race', async () => {
    const raceData = {
      name: 'Test Street Race',
      location: {
        latitude: 34.0522,
        longitude: -118.2437
      },
      startTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      maxParticipants: 8,
      raceType: 'street'
    };

    const response = await app.inject({
      method: 'POST',
      url: '/races',
      headers: {
        authorization: `Bearer ${authToken}`
      },
      payload: raceData
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body.name).toBe(raceData.name);
    expect(body.organizer.id).toBe(userId);
    expect(body.status).toBe('scheduled');
  });

  test('GET /races should list races', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/races',
      headers: {
        authorization: `Bearer ${authToken}`
      }
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
  });

  test('GET /races/nearby should find races by location', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/races/nearby',
      query: {
        latitude: '34.0522',
        longitude: '-118.2437',
        radius: '10'
      },
      headers: {
        authorization: `Bearer ${authToken}`
      }
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
  });

  test('POST /races/:id/join should allow joining race', async () => {
    // First create a race
    const raceResponse = await app.inject({
      method: 'POST',
      url: '/races',
      headers: {
        authorization: `Bearer ${authToken}`
      },
      payload: {
        name: 'Joinable Race',
        location: {
          latitude: 34.0522,
          longitude: -118.2437
        },
        startTime: new Date(Date.now() + 3600000).toISOString(),
        maxParticipants: 8,
        raceType: 'street'
      }
    });

    const race = JSON.parse(raceResponse.body);

    // Create another user
    const userResponse = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'joiner@example.com',
        password: 'TestPassword123!',
        firstName: 'Joiner',
        lastName: 'Test'
      }
    });

    const joinerToken = JSON.parse(userResponse.body).token;

    // Join the race
    const joinResponse = await app.inject({
      method: 'POST',
      url: `/races/${race.id}/join`,
      headers: {
        authorization: `Bearer ${joinerToken}`
      }
    });

    expect(joinResponse.statusCode).toBe(200);
    const body = JSON.parse(joinResponse.body);
    expect(body.participants).toHaveLength(2); // organizer + joiner
  });

  test('DELETE /races/:id should cancel race', async () => {
    // Create a race
    const raceResponse = await app.inject({
      method: 'POST',
      url: '/races',
      headers: {
        authorization: `Bearer ${authToken}`
      },
      payload: {
        name: 'Cancellable Race',
        location: {
          latitude: 34.0522,
          longitude: -118.2437
        },
        startTime: new Date(Date.now() + 3600000).toISOString(),
        maxParticipants: 8,
        raceType: 'street'
      }
    });

    const race = JSON.parse(raceResponse.body);

    // Cancel the race
    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/races/${race.id}`,
      headers: {
        authorization: `Bearer ${authToken}`
      }
    });

    expect(deleteResponse.statusCode).toBe(200);
    const body = JSON.parse(deleteResponse.body);
    expect(body.status).toBe('cancelled');
  });
});