import axios from 'axios';

const BASE_URL = 'http://localhost:4000';

async function testCarSystem() {
  console.log('🚗 Testing Car Management System...\n');
  
  try {
    // First authenticate
    console.log('1. Authenticating user...');
    const testUser = {
      email: `cartest${Date.now()}@dash.com`,
      password: 'TestPass123!',
      handle: `cartest${Date.now()}`,
      displayName: 'Car Test User'
    };
    
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
    const token = registerResponse.data.token;
    console.log(`   ✅ User authenticated`);
    
    // Test 2: Create a car
    console.log('2. Testing car creation...');
    const testCar = {
      name: 'Test Toyota Supra',
      make: 'Toyota',
      model: 'Supra',
      year: 2023,
      whp: 382,
      weightKg: 1540,
      drivetrain: 'RWD'
    };
    
    const createResponse = await axios.post(`${BASE_URL}/cars`, testCar, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   ✅ Car created: ${createResponse.status}`);
    console.log(`   Car ID: ${createResponse.data.id}`);
    
    const carId = createResponse.data.id;
    
    // Test 3: Get user's cars
    console.log('3. Testing car retrieval...');
    const getResponse = await axios.get(`${BASE_URL}/cars`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   ✅ Cars retrieved: ${getResponse.status}`);
    console.log(`   Number of cars: ${getResponse.data.length}`);
    
    // Test 4: Update car
    console.log('4. Testing car update...');
    const updateData = { whp: 400 };
    const updateResponse = await axios.patch(`${BASE_URL}/cars/${carId}`, updateData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   ✅ Car updated: ${updateResponse.status}`);
    
    // Test 5: Get specific car
    console.log('5. Testing specific car retrieval...');
    const getOneResponse = await axios.get(`${BASE_URL}/cars/${carId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   ✅ Specific car retrieved: ${getOneResponse.status}`);
    console.log(`   Updated WHP: ${getOneResponse.data.whp}`);
    
  } catch (error) {
    console.log(`   ❌ Car system error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    
    if (error.response?.data) {
      console.log(`   Details:`, error.response.data);
    }
  }
}

testCarSystem();