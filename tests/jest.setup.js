/**
 * Jest Setup File
 * Global configuration and setup for test environment
 */

// Increase timeout for all tests
jest.setTimeout(30000);

// Global test configuration
global.testConfig = {
  baseURL: 'http://localhost:4000',
  websocketURL: 'ws://localhost:3001',
  timeout: 10000
};

// Console formatting for better test output
const originalConsoleLog = console.log;
console.log = (...args) => {
  const timestamp = new Date().toISOString();
  originalConsoleLog(`[${timestamp}]`, ...args);
};

// Handle unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Clean up after tests
afterEach(() => {
  // Clean up any timers or async operations
  jest.clearAllTimers();
});