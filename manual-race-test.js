// Manual race API testing to validate all endpoints
import axios from 'axios';

const BASE_URL = 'http://localhost:4000';
let authToken = '';
let userId = '';
let testRaceId = '';

async function runRaceTests() {
  console.log('🏁 Starting comprehensive race API tests...\n');
  
  try {
    // Test 1: Register and login user
    console.log('📝 Test 1: User Registration and Login');
    const uniqueEmail = `racer-test-${Date.now()}@example.com`;
    
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      email: uniqueEmail,
      password: 'TestPassword123!',
      firstName: 'Racer',
      lastName: 'Test'
    });
    
    if (registerResponse.status !== 201) {
      throw new Error(`Registration failed: ${registerResponse.status}`);
    }
    
    authToken = registerResponse.data.token;
    userId = registerResponse.data.user.id;
    console.log('✅ User registered and authenticated successfully');
    console.log(`   User ID: ${userId}`);
    console.log(`   Auth token received: ${authToken.substring(0, 20)}...`);

    // Test 2: Create a race
    console.log('\n🏎️ Test 2: POST /races - Create new race');
    const raceData = {
      name: 'Test Street Race',
      location: {
        latitude: 34.0522,
        longitude: -118.2437
      },
      startTime: new Date(Date.now() + 3600000).toISOString(),
      maxParticipants: 8,
      raceType: 'street'
    };
    
    const createRaceResponse = await axios.post(`${BASE_URL}/races`, raceData, {
      headers: { authorization: `Bearer ${authToken}` }
    });
    
    if (createRaceResponse.status !== 201) {
      throw new Error(`Race creation failed: ${createRaceResponse.status}`);
    }
    
    testRaceId = createRaceResponse.data.id;
    console.log('✅ Race created successfully');
    console.log(`   Race ID: ${testRaceId}`);
    console.log(`   Race name: ${createRaceResponse.data.name}`);
    console.log(`   Status: ${createRaceResponse.data.status}`);

    // Test 3: List races
    console.log('\n📋 Test 3: GET /races - List all races');
    const listRacesResponse = await axios.get(`${BASE_URL}/races`);
    
    if (listRacesResponse.status !== 200) {
      throw new Error(`List races failed: ${listRacesResponse.status}`);
    }
    
    console.log('✅ Races listed successfully');
    console.log(`   Found ${listRacesResponse.data.length} races`);
    console.log(`   Our race is included: ${listRacesResponse.data.some(r => r.id === testRaceId)}`);

    // Test 4: Get nearby races
    console.log('\n📍 Test 4: GET /races/nearby - Find races by location');
    const nearbyResponse = await axios.get(`${BASE_URL}/races/nearby`, {
      params: {
        latitude: '34.0522',
        longitude: '-118.2437',
        radius: '10'
      },
      headers: { authorization: `Bearer ${authToken}` }
    });
    
    if (nearbyResponse.status !== 200) {
      throw new Error(`Nearby races failed: ${nearbyResponse.status}`);
    }
    
    console.log('✅ Nearby races endpoint working');
    console.log(`   Found ${nearbyResponse.data.length} nearby races`);
    console.log(`   Our race is nearby: ${nearbyResponse.data.some(r => r.id === testRaceId)}`);

    // Test 5: Create second user and join race
    console.log('\n👥 Test 5: POST /races/:id/join - Join race with second user');
    const joinerEmail = `joiner-${Date.now()}@example.com`;
    
    const joinerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      email: joinerEmail,
      password: 'TestPassword123!',
      firstName: 'Joiner',
      lastName: 'Test'
    });
    
    const joinerToken = joinerResponse.data.token;
    console.log(`   Created second user: ${joinerResponse.data.user.id}`);
    
    const joinResponse = await axios.post(`${BASE_URL}/races/${testRaceId}/join`, {}, {
      headers: { authorization: `Bearer ${joinerToken}` }
    });
    
    if (joinResponse.status !== 200) {
      throw new Error(`Join race failed: ${joinResponse.status}`);
    }
    
    console.log('✅ Successfully joined race');
    console.log(`   Participant count: ${joinResponse.data.participants?.length || 'N/A'}`);

    // Test 6: Cancel race
    console.log('\n❌ Test 6: DELETE /races/:id - Cancel race');
    const cancelResponse = await axios.delete(`${BASE_URL}/races/${testRaceId}`, {
      headers: { authorization: `Bearer ${authToken}` }
    });
    
    if (cancelResponse.status !== 200) {
      throw new Error(`Cancel race failed: ${cancelResponse.status}`);
    }
    
    console.log('✅ Race canceled successfully');
    console.log(`   Final status: ${cancelResponse.data.status}`);
    
    // Summary
    console.log('\n🎉 ALL RACE API TESTS PASSED! 🎉');
    console.log('Summary:');
    console.log('✅ POST /races - Create race');
    console.log('✅ GET /races - List races');
    console.log('✅ GET /races/nearby - Find nearby races');
    console.log('✅ POST /races/:id/join - Join race');
    console.log('✅ DELETE /races/:id - Cancel race');
    console.log('\n🏁 All 5 race API endpoints are working correctly!');
    
  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error(`   Status: ${error.response?.status || 'Network Error'}`);
    console.error(`   Message: ${error.response?.data?.error || error.message}`);
    console.error(`   URL: ${error.config?.url || 'Unknown'}`);
    
    if (error.response?.data) {
      console.error('   Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

runRaceTests();