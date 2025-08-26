import axios from 'axios';

const BASE_URL = 'http://localhost:4000';

async function testAIEnhancedCarSystem() {
  console.log('🤖 Testing AI-Enhanced Car Data System...\n');
  
  try {
    // First authenticate
    console.log('1. Authenticating user...');
    const testUser = {
      email: `aicartest${Date.now()}@dash.com`,
      password: 'TestPass123!',
      handle: `aicartest${Date.now()}`,
      displayName: 'AI Car Test User'
    };
    
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
    const token = registerResponse.data.token;
    console.log(`   ✅ User authenticated`);
    
    // Test 2: Direct AI enrichment API
    console.log('2. Testing AI vehicle data enrichment...');
    const enrichmentData = {
      make: 'Toyota',
      model: 'Supra',
      year: 2023,
      trim: 'Premium'
    };
    
    const enrichResponse = await axios.post(`${BASE_URL}/ai/enrich-vehicle`, enrichmentData);
    console.log(`   ✅ AI enrichment successful: ${enrichResponse.status}`);
    console.log(`   📊 Found ${enrichResponse.data.availableTrims?.length || 0} trims`);
    console.log(`   🏎️  Base horsepower: ${enrichResponse.data.performance?.horsepower || 'N/A'}`);
    console.log(`   🔧 Common modifications: ${enrichResponse.data.commonModifications?.length || 0}`);
    console.log(`   💡 AI insights: ${enrichResponse.data.aiInsights?.length || 0}`);
    
    // Test 3: Create car with AI enhancement
    console.log('3. Testing AI-enhanced car creation...');
    const aiEnhancedCar = {
      name: 'My AI-Enhanced Toyota Supra',
      make: 'Toyota',
      model: 'Supra',
      year: 2023,
      useAIEnrichment: true
    };
    
    const createResponse = await axios.post(`${BASE_URL}/cars`, aiEnhancedCar, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   ✅ AI-enhanced car created: ${createResponse.status}`);
    console.log(`   🤖 AI enriched: ${createResponse.data.aiEnriched}`);
    console.log(`   📝 Available trims: ${createResponse.data.availableTrims?.length || 0}`);
    console.log(`   💪 AI-detected horsepower: ${createResponse.data.whp || 'Not set'}`);
    
    // Test 4: Create car without AI enhancement (traditional way)
    console.log('4. Testing traditional car creation...');
    const traditionalCar = {
      name: 'My Manual Honda Civic',
      make: 'Honda',
      model: 'Civic',
      year: 2022,
      whp: 158,
      weightKg: 1300,
      drivetrain: 'FWD',
      useAIEnrichment: false
    };
    
    const traditionalResponse = await axios.post(`${BASE_URL}/cars`, traditionalCar, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   ✅ Traditional car created: ${traditionalResponse.status}`);
    console.log(`   🤖 AI enriched: ${traditionalResponse.data.aiEnriched}`);
    
    // Test 5: Test with exotic car
    console.log('5. Testing with exotic/unknown vehicle...');
    const exoticCar = {
      name: 'My McLaren 720S',
      make: 'McLaren',
      model: '720S',
      year: 2023,
      useAIEnrichment: true
    };
    
    const exoticResponse = await axios.post(`${BASE_URL}/cars`, exoticCar, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   ✅ Exotic car created: ${exoticResponse.status}`);
    console.log(`   🤖 AI enriched: ${exoticResponse.data.aiEnriched}`);
    console.log(`   🚀 AI-estimated horsepower: ${exoticResponse.data.whp || 'Not estimated'}`);
    
    // Test 6: Get all cars to see the difference
    console.log('6. Comparing AI vs traditional car data...');
    const getAllResponse = await axios.get(`${BASE_URL}/cars`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   ✅ Retrieved ${getAllResponse.data.length} cars`);
    
    getAllResponse.data.forEach((car, index) => {
      console.log(`   Car ${index + 1}: ${car.name}`);
      console.log(`     - Horsepower: ${car.whp || 'Not set'}`);
      console.log(`     - Weight: ${car.weightKg || 'Not set'}kg`);
      console.log(`     - AI Enhanced: ${car.enrichedData ? 'Yes' : 'No'}`);
      if (car.enrichedData) {
        console.log(`     - AI Confidence: ${Math.round((car.enrichedData.confidence || 0) * 100)}%`);
        console.log(`     - Engine: ${car.enrichedData.engineConfiguration || 'Unknown'} ${car.enrichedData.engineDisplacement || ''}L`);
      }
    });
    
    console.log('\n🎉 AI-Enhanced Car System test completed successfully!');
    console.log('\n📈 Benefits of AI Enhancement:');
    console.log('   • Automatic horsepower and torque detection');
    console.log('   • Multiple trim level suggestions');
    console.log('   • Common modification recommendations');
    console.log('   • Market value analysis');
    console.log('   • Performance insights and tips');
    console.log('   • Detailed technical specifications');
    
  } catch (error) {
    console.log(`   ❌ AI car system error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    
    if (error.response?.data) {
      console.log(`   Details:`, error.response.data);
    }
  }
}

testAIEnhancedCarSystem();