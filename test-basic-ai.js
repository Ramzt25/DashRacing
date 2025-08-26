const API_BASE = 'http://localhost:4000';

async function testBasicAI() {
  console.log('🤖 Testing Basic AI Functionality\n');

  try {
    // Test 1: Create user
    console.log('1. Creating test user...');
    const userResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `ai-test-${Date.now()}@test.com`,
        password: 'testpass123',
        name: 'AI Test User'
      })
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.log(`❌ User creation failed: ${userResponse.status}`);
      console.log(`Error: ${errorText}`);
      return;
    }

    const userData = await userResponse.json();
    console.log('✅ User created successfully');
    console.log(`   Token: ${userData.token ? 'Present' : 'Missing'}`);

    // Test 2: Simple car creation without AI
    console.log('\n2. Creating basic car...');
    const carResponse = await fetch(`${API_BASE}/cars`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userData.token}`
      },
      body: JSON.stringify({
        name: 'Test Honda Civic',
        year: 2015,
        make: 'Honda',
        model: 'Civic',
        whp: 200,
        weightKg: 1300
      })
    });

    if (!carResponse.ok) {
      const errorText = await carResponse.text();
      console.log(`❌ Car creation failed: ${carResponse.status}`);
      console.log(`Error: ${errorText}`);
      return;
    }

    const carData = await carResponse.json();
    console.log('✅ Basic car created successfully');
    console.log(`   Car ID: ${carData.id}`);

    // Test 3: Test AI performance analysis (existing route)
    console.log('\n3. Testing AI performance analysis...');
    const analysisResponse = await fetch(`${API_BASE}/ai/analyze-performance`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userData.token}`
      },
      body: JSON.stringify({
        carId: carData.id,
        trackType: 'circuit',
        conditions: {
          weather: 'dry',
          temperature: 75,
          surface: 'asphalt'
        }
      })
    });

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.log(`⚠️  AI analysis failed: ${analysisResponse.status}`);
      console.log(`Error: ${errorText}`);
    } else {
      const analysisData = await analysisResponse.json();
      console.log('✅ AI performance analysis working!');
      console.log(`   Performance Score: ${analysisData.performanceScore}`);
      console.log(`   Current Power: ${analysisData.currentPower} HP`);
    }

    // Test 4: Test new AI upgrade recommendations
    console.log('\n4. Testing NEW AI upgrade recommendations...');
    const upgradeResponse = await fetch(`${API_BASE}/ai/upgrade-recommendations`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userData.token}`
      },
      body: JSON.stringify({
        carId: carData.id,
        budget: 3000,
        goals: ['power'],
        experience: 'intermediate'
      })
    });

    if (!upgradeResponse.ok) {
      const errorText = await upgradeResponse.text();
      console.log(`⚠️  AI upgrade recommendations failed: ${upgradeResponse.status}`);
      console.log(`Error: ${errorText}`);
      
      if (upgradeResponse.status === 404) {
        console.log('   💡 This suggests the new AI routes are not loaded yet');
        console.log('   Try restarting the backend server');
      }
    } else {
      const upgradeData = await upgradeResponse.json();
      console.log('🎉 NEW AI upgrade recommendations working!');
      console.log(`   Data Source: ${upgradeData.dataSource}`);
      if (upgradeData.recommendations) {
        console.log(`   Recommendations: ${upgradeData.recommendations.length} found`);
      }
    }

    // Test 5: Test new AI cost estimation
    console.log('\n5. Testing NEW AI cost estimation...');
    const costResponse = await fetch(`${API_BASE}/ai/estimate-cost`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userData.token}`
      },
      body: JSON.stringify({
        name: 'Cold Air Intake',
        category: 'Intake',
        brand: 'K&N',
        vehicleInfo: '2015 Honda Civic'
      })
    });

    if (!costResponse.ok) {
      const errorText = await costResponse.text();
      console.log(`⚠️  AI cost estimation failed: ${costResponse.status}`);
      console.log(`Error: ${errorText}`);
      
      if (costResponse.status === 404) {
        console.log('   💡 This suggests the new AI routes are not loaded yet');
        console.log('   Try restarting the backend server');
      }
    } else {
      const costData = await costResponse.json();
      console.log('🎉 NEW AI cost estimation working!');
      console.log(`   Total Cost: $${costData.totalCost}`);
      console.log(`   Data Source: ${costData.dataSource}`);
    }

    console.log('\n📊 Test Summary:');
    console.log('   ✅ Backend server running');
    console.log('   ✅ User authentication working');
    console.log('   ✅ Basic car creation working');
    console.log(`   ${analysisResponse.ok ? '✅' : '❌'} Existing AI analysis working`);
    console.log(`   ${upgradeResponse.ok ? '🎉' : '⚠️ '} NEW AI upgrade recommendations ${upgradeResponse.ok ? 'working!' : 'need backend restart'}`);
    console.log(`   ${costResponse.ok ? '🎉' : '⚠️ '} NEW AI cost estimation ${costResponse.ok ? 'working!' : 'need backend restart'}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Backend not running. Start with: node dist/index.js');
    }
  }
}

// Run the test
testBasicAI();