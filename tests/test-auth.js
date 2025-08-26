import axios from 'axios';

const BASE_URL = 'http://localhost:4000';

async function testAuth() {
  console.log('🔐 Testing Authentication System...\n');
  
  try {
    // Test 1: User Registration
    console.log('1. Testing user registration...');
    const testUser = {
      email: `testuser${Date.now()}@dash.com`,
      password: 'TestPass123!',
      handle: `testuser${Date.now()}`,
      displayName: 'Test User'
    };
    
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
      console.log(`   ✅ Registration successful: ${registerResponse.status}`);
      console.log(`   Token received: ${!!registerResponse.data.token}`);
      
      // Test 2: User Login
      console.log('2. Testing user login...');
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      console.log(`   ✅ Login successful: ${loginResponse.status}`);
      console.log(`   Token received: ${!!loginResponse.data.token}`);
      
      const token = loginResponse.data.token;
      
      // Test 3: Protected endpoint
      console.log('3. Testing protected endpoint...');
      const protectedResponse = await axios.get(`${BASE_URL}/cars`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`   ✅ Protected endpoint access: ${protectedResponse.status}`);
      
    } catch (error) {
      console.log(`   ❌ Auth error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      
      if (error.response?.data) {
        console.log(`   Details:`, error.response.data);
      }
    }
    
  } catch (error) {
    console.error(`❌ Test setup failed: ${error.message}`);
  }
}

testAuth();