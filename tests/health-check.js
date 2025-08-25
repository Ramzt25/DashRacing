/**
 * Health Check Script
 * Quick verification that all services are running before running comprehensive tests
 */

const axios = require('axios');
const WebSocket = require('ws');

const BASE_URL = 'http://localhost:4000';
const WEBSOCKET_URL = 'ws://localhost:3001';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

async function healthCheck() {
  console.log(`${colors.bold}${colors.blue}🔍 GridGhost Racing Platform - Health Check${colors.reset}\n`);
  
  const checks = [
    { name: 'Backend Server', test: checkBackendServer },
    { name: 'WebSocket Server', test: checkWebSocketServer },
    { name: 'Database Connection', test: checkDatabaseConnection },
    { name: 'API Endpoints', test: checkAPIEndpoints }
  ];

  let allPassed = true;
  
  for (const check of checks) {
    try {
      console.log(`${colors.yellow}⏳ Checking ${check.name}...${colors.reset}`);
      await check.test();
      console.log(`${colors.green}✅ ${check.name} - OK${colors.reset}`);
    } catch (error) {
      console.log(`${colors.red}❌ ${check.name} - FAILED${colors.reset}`);
      console.log(`   Error: ${error.message}`);
      allPassed = false;
    }
    console.log('');
  }

  if (allPassed) {
    console.log(`${colors.bold}${colors.green}🎉 All health checks passed! Ready to run comprehensive tests.${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.bold}${colors.red}⚠️  Some health checks failed. Please fix issues before running tests.${colors.reset}`);
    process.exit(1);
  }
}

async function checkBackendServer() {
  const response = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
  if (response.status !== 200) {
    throw new Error(`Server responded with status ${response.status}`);
  }
}

async function checkWebSocketServer() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WEBSOCKET_URL);
    
    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('WebSocket connection timeout'));
    }, 5000);

    ws.on('open', () => {
      clearTimeout(timeout);
      ws.close();
      resolve();
    });

    ws.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

async function checkDatabaseConnection() {
  // Try to hit an endpoint that requires database access
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'nonexistent@test.com',
      password: 'test'
    }, { timeout: 5000 });
  } catch (error) {
    // We expect this to fail with 401/404, not a database error
    if (error.response && (error.response.status === 401 || error.response.status === 404)) {
      return; // Database is accessible
    }
    throw new Error('Database connection issue');
  }
}

async function checkAPIEndpoints() {
  const endpoints = [
    '/health',
    // Add other public endpoints here
  ];

  for (const endpoint of endpoints) {
    const response = await axios.get(`${BASE_URL}${endpoint}`, { timeout: 3000 });
    if (response.status >= 400) {
      throw new Error(`Endpoint ${endpoint} returned status ${response.status}`);
    }
  }
}

// Run health check
healthCheck().catch((error) => {
  console.error(`${colors.red}❌ Health check failed:${colors.reset}`, error.message);
  process.exit(1);
});