/**
 * Basic API Tests - Simple validation that the backend is working
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

describe('Basic API Functionality', () => {
  test('Health endpoint should return OK', async () => {
    const response = await axios.get(`${BASE_URL}/health`);
    expect(response.status).toBe(200);
    expect(response.data.status).toBe('healthy');
    expect(response.data.service).toBe('GridGhost Racing API');
  });

  test('Root endpoint should return service info', async () => {
    const response = await axios.get(`${BASE_URL}/`);
    expect(response.status).toBe(200);
    expect(response.data.ok).toBe(true);
    expect(response.data.service).toBe('GridGhost Racing API');
    expect(response.data.version).toBe('2.0.0');
  });

  test('Invalid endpoint should return 404', async () => {
    try {
      await axios.get(`${BASE_URL}/nonexistent-endpoint`);
    } catch (error: any) {
      expect(error.response.status).toBe(404);
    }
  });

  test('Authentication endpoint exists', async () => {
    try {
      // This should fail with 400 (bad request) not 500 (server error)
      await axios.post(`${BASE_URL}/auth/login`, {});
    } catch (error: any) {
      expect(error.response.status).toBe(400);
    }
  });
});