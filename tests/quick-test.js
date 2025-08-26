#!/usr/bin/env node
/**
 * Quick Test Execution Script
 * Runs essential tests to verify system functionality
 */

import axios from 'axios';
import WebSocket from 'ws';

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

async function quickTest() {
  console.log(`${colors.bold}${colors.blue}🚀 DASH Racing Platform - Quick System Test${colors.reset}\n`);
  
  const tests = [
    { name: 'Backend Server Health', test: testBackendHealth },
    { name: 'WebSocket Connection', test: testWebSocketConnection },
    { name: 'Database Connectivity', test: testDatabaseConnection },
    { name: 'Authentication System', test: testAuthentication },
    { name: 'Car Management API', test: testCarAPI },
    { name: 'AI Analysis System', test: testAISystem },
    { name: 'Live Location API', test: testLocationAPI },
    { name: 'Real-time Communication', test: testRealTimeComm }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      console.log(`${colors.yellow}⏳ Testing ${test.name}...${colors.reset}`);
      await test.test();
      console.log(`${colors.green}✅ ${test.name} - PASSED${colors.reset}`);
      passedTests++;
    } catch (error) {
      console.log(`${colors.red}❌ ${test.name} - FAILED: ${error.message}${colors.reset}`);
    }
    console.log('');
  }

  // Results summary
  console.log(`${colors.bold}📊 Test Results Summary:${colors.reset}`);
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${colors.green}${passedTests}${colors.reset}`);
  console.log(`Failed: ${colors.red}${totalTests - passedTests}${colors.reset}`);
  console.log(`Success Rate: ${colors.bold}${((passedTests / totalTests) * 100).toFixed(1)}%${colors.reset}\n`);

  if (passedTests === totalTests) {
    console.log(`${colors.bold}${colors.green}🎉 All systems operational! DASH Racing Platform is ready.${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.bold}${colors.red}⚠️  Some systems need attention before going live.${colors.reset}`);
    process.exit(1);
  }
}

async function testBackendHealth() {
  const response = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  if (!response.data || response.data.status !== 'healthy') {
    throw new Error('Health check returned invalid response');
  }
}

async function testWebSocketConnection() {
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

async function testDatabaseConnection() {
  // Test database through an endpoint that requires database access
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'nonexistent@test.com',
      password: 'test'
    }, { timeout: 5000 });
  } catch (error) {
    // We expect this to fail with 401, not a database error
    if (error.response && error.response.status === 401) {
      return; // Database is accessible
    }
    throw new Error('Database connection issue');
  }
}

async function testAuthentication() {
  // Test user registration
  const testUser = {
    email: `quicktest${Date.now()}@dash.com`,
    password: 'TestPass123!',
    handle: `quicktest${Date.now()}`,
    displayName: 'Quick Test User'
  };

  const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser, { timeout: 5000 });
  if (registerResponse.status !== 201) {
    throw new Error(`Registration failed with status ${registerResponse.status}`);
  }

  if (!registerResponse.data.token) {
    throw new Error('No authentication token received');
  }

  // Test login
  const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
    email: testUser.email,
    password: testUser.password
  }, { timeout: 5000 });

  if (loginResponse.status !== 200) {
    throw new Error(`Login failed with status ${loginResponse.status}`);
  }

  return registerResponse.data.token;
}

async function testCarAPI() {
  const token = await testAuthentication();
  
  // Test car creation
  const testCar = {
    name: 'Toyota Supra',
    make: 'Toyota',
    model: 'Supra',
    year: 2023,
    whp: 382,
    weightKg: 1540,
    drivetrain: 'RWD'
  };

  const createResponse = await axios.post(`${BASE_URL}/cars`, testCar, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 5000
  });

  if (createResponse.status !== 200) {
    throw new Error(`Car creation failed with status ${createResponse.status}`);
  }

  const carId = createResponse.data.id;

  // Test car retrieval
  const getResponse = await axios.get(`${BASE_URL}/cars`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 5000
  });

  if (getResponse.status !== 200) {
    throw new Error(`Car retrieval failed with status ${getResponse.status}`);
  }

  if (!Array.isArray(getResponse.data)) {
    throw new Error('Cars list should be an array');
  }
}

async function testAISystem() {
  const token = await testAuthentication();

  // First create a test car to analyze
  const testCar = {
    name: 'Test McLaren',
    make: 'McLaren',
    model: '720S',
    year: 2023,
    whp: 710,
    weightKg: 1445
  };

  const carResponse = await axios.post(`${BASE_URL}/cars`, testCar, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 5000
  });

  const carId = carResponse.data.id;

  const analysisRequest = {
    carId: carId,
    modifications: []
  };

  const response = await axios.post(`${BASE_URL}/ai/analyze-performance`, analysisRequest, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 10000
  });

  if (response.status !== 200) {
    throw new Error(`AI analysis failed with status ${response.status}`);
  }

  if (!response.data.performanceScore) {
    throw new Error('AI analysis response missing performance score');
  }
}

async function testLocationAPI() {
  const token = await testAuthentication();

  // Test location update
  const locationData = {
    lat: 40.7128,
    lon: -74.0060,
    presenceMode: 'METRO'
  };

  const updateResponse = await axios.post(`${BASE_URL}/livemap/location`, locationData, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 5000
  });

  if (updateResponse.status !== 200) {
    throw new Error(`Location update failed with status ${updateResponse.status}`);
  }

  // Test getting nearby data
  const nearbyResponse = await axios.get(`${BASE_URL}/livemap/nearby?lat=40.7128&lon=-74.0060`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 5000
  });

  if (nearbyResponse.status !== 200) {
    throw new Error(`Get nearby data failed with status ${nearbyResponse.status}`);
  }

  if (!nearbyResponse.data.events || !nearbyResponse.data.users) {
    throw new Error('Nearby data missing events or users');
  }
}

async function testRealTimeComm() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WEBSOCKET_URL);
    let connectionReceived = false;
    let pongReceived = false;

    const timeout = setTimeout(() => {
      ws.close();
      if (!connectionReceived && !pongReceived) {
        reject(new Error('WebSocket message test timeout'));
      }
    }, 8000);

    ws.on('open', () => {
      // Send test message
      ws.send(JSON.stringify({
        type: 'ping',
        data: 'test-communication',
        timestamp: Date.now()
      }));
    });

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'connected') {
          connectionReceived = true;
        } else if (message.type === 'pong') {
          pongReceived = true;
          clearTimeout(timeout);
          ws.close();
          resolve();
        }
      } catch (error) {
        clearTimeout(timeout);
        ws.close();
        reject(error);
      }
    });

    ws.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

// Run quick test
quickTest().catch((error) => {
  console.error(`${colors.red}💥 Quick test failed: ${error.message}${colors.reset}`);
  process.exit(1);
});