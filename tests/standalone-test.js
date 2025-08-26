#!/usr/bin/env node

import axios from 'axios';
import WebSocket from 'ws';

const BASE_URL = 'http://localhost:4000';

async function testAPI() {
  console.log('🧪 Testing GridGhost API...\n');
  
  try {
    // Test 1: Health Check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log(`   ✅ Health check: ${healthResponse.status} - ${healthResponse.data.status}`);
    
    // Test 2: Root endpoint
    console.log('2. Testing root endpoint...');
    const rootResponse = await axios.get(`${BASE_URL}/`);
    console.log(`   ✅ Root endpoint: ${rootResponse.status} - ${rootResponse.data.service} v${rootResponse.data.version}`);
    
    // Test 3: Auth endpoint structure
    console.log('3. Testing auth endpoint...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {});
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(`   ✅ Auth endpoint exists and validates input properly`);
      } else {
        console.log(`   ❌ Auth endpoint error: ${error.message}`);
      }
    }
    
    // Test 4: WebSocket check
    console.log('4. Testing WebSocket connection...');
    const wsUrl = 'ws://localhost:3001';
    
    const wsTest = new Promise((resolve, reject) => {
      const ws = new WebSocket(wsUrl);
      
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('WebSocket timeout'));
      }, 5000);
      
      ws.on('open', () => {
        clearTimeout(timeout);
        ws.close();
        resolve('Connected');
      });
      
      ws.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
    
    try {
      await wsTest;
      console.log(`   ✅ WebSocket connection successful`);
    } catch (error) {
      console.log(`   ❌ WebSocket connection failed: ${error.message}`);
    }
    
    console.log('\n🎉 Basic API tests completed!');
    
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      console.error('   🔍 Make sure the backend server is running on port 4000');
    }
    process.exit(1);
  }
}

testAPI();