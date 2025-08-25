// Jest setup file for tests
import { beforeAll, afterAll } from '@jest/globals';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.DATABASE_URL = 'file:./test.db';
process.env.PORT = '3001';
process.env.ORIGIN = 'http://localhost:3000';

// Global test timeout
jest.setTimeout(10000);

// Clean up function that runs after all tests
afterAll(async () => {
  // Add any global cleanup here
  console.log('Test suite cleanup completed');
});