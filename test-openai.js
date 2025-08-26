const API_BASE = 'http://localhost:4000';

async function testOpenAIIntegration() {
  console.log('🤖 Testing OpenAI Integration Specifically\n');

  try {
    // Test 1: Create user and car
    const userResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `openai-test-${Date.now()}@test.com`,
        password: 'testpass123',
        name: 'OpenAI Test User'
      })
    });

    const userData = await userResponse.json();
    console.log('✅ User created');

    const carResponse = await fetch(`${API_BASE}/cars`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userData.token}`
      },
      body: JSON.stringify({
        name: 'OpenAI Test Car',
        year: 2018,
        make: 'Ford',
        model: 'Mustang GT',
        whp: 435,
        weightKg: 1640,
        useAIEnrichment: true  // This should trigger OpenAI
      })
    });

    if (!carResponse.ok) {
      const errorText = await carResponse.text();
      console.log(`❌ Car with AI enrichment failed: ${carResponse.status}`);
      console.log(`Error: ${errorText}`);
      return;
    }

    const carData = await carResponse.json();
    console.log('✅ Car created with AI enrichment request');
    console.log(`   Car ID: ${carData.id}`);
    console.log(`   AI Enriched: ${carData.aiEnrichedData ? 'YES! 🎉' : 'No (using fallback)'}`);
    
    if (carData.aiEnrichedData) {
      console.log('   🤖 OpenAI Successfully Enriched Vehicle Data!');
      console.log(`   Confidence: ${carData.aiEnrichedData.confidence}`);
      console.log(`   Source: ${carData.aiEnrichedData.dataSource}`);
    }

    // Test 2: AI Upgrade Recommendations with OpenAI  
    console.log('\n2. Testing OpenAI upgrade recommendations...');
    const upgradeResponse = await fetch(`${API_BASE}/ai/upgrade-recommendations`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userData.token}`
      },
      body: JSON.stringify({
        carId: carData.id,
        budget: 5000,
        goals: ['power', 'acceleration'],
        experience: 'advanced'
      })
    });

    if (upgradeResponse.ok) {
      const upgradeData = await upgradeResponse.json();
      console.log(`✅ Upgrade recommendations received`);
      console.log(`   Data Source: ${upgradeData.dataSource || 'Local Fallback'}`);
      console.log(`   Confidence: ${upgradeData.confidence ? (upgradeData.confidence * 100).toFixed(1) + '%' : 'N/A'}`);
      
      if (upgradeData.dataSource === 'OpenAI Expert Analysis') {
        console.log('   🎉 OpenAI-Powered Recommendations Working!');
        
        if (upgradeData.recommendations && upgradeData.recommendations.length > 0) {
          console.log('\n   🔧 AI Recommendations:');
          upgradeData.recommendations.slice(0, 2).forEach((rec, i) => {
            console.log(`   ${i+1}. ${rec.name} (+${rec.powerGain}HP, $${rec.cost})`);
          });
        }
        
        if (upgradeData.expertInsights) {
          console.log('\n   💡 AI Expert Insights:');
          upgradeData.expertInsights.slice(0, 2).forEach(insight => {
            console.log(`   • ${insight}`);
          });
        }
      } else {
        console.log('   ⚠️  Using local fallback (OpenAI may not be configured)');
      }
    } else {
      console.log(`❌ Upgrade recommendations failed: ${upgradeResponse.status}`);
    }

    // Test 3: Check if OpenAI API key is working
    console.log('\n3. Checking OpenAI API configuration...');
    
    // Make a direct test of vehicle data enrichment
    const vehicleDataResponse = await fetch(`${API_BASE}/ai/vehicle-data`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userData.token}`
      },
      body: JSON.stringify({
        year: 2020,
        make: 'Toyota',
        model: 'Supra',
        trim: '3.0'
      })
    });

    if (vehicleDataResponse.ok) {
      const vehicleData = await vehicleDataResponse.json();
      console.log('✅ Vehicle data enrichment working');
      console.log(`   Source: ${vehicleData.dataSource || 'Local'}`);
      console.log(`   Confidence: ${vehicleData.confidence ? (vehicleData.confidence * 100).toFixed(1) + '%' : 'N/A'}`);
      
      if (vehicleData.dataSource === 'OpenAI GPT-4o-mini') {
        console.log('   🎉 OpenAI Vehicle Enrichment Working!');
      }
    } else {
      console.log(`⚠️  Vehicle data enrichment failed: ${vehicleDataResponse.status}`);
    }

    console.log('\n📊 OpenAI Integration Status:');
    console.log(`   🔑 API Key: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Missing'}`);
    console.log(`   🚗 Vehicle Enrichment: ${carData.aiEnrichedData ? '✅ Working' : '⚠️  Fallback mode'}`);
    
  } catch (error) {
    console.error('❌ OpenAI test failed:', error.message);
  }
}

// Run the test
testOpenAIIntegration();