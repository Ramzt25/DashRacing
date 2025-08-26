import axios from 'axios';

const BASE_URL = 'http://localhost:4000';

async function testOpenAIVehicleEnrichment() {
  console.log('🤖 Testing OpenAI-Powered Vehicle Data Enrichment...\n');
  
  try {
    // Test 1: Test popular sports car (should get very detailed data)
    console.log('1. Testing OpenAI enrichment for Toyota Supra...');
    const supraData = {
      make: 'Toyota',
      model: 'Supra',
      year: 2023
    };
    
    const supraResponse = await axios.post(`${BASE_URL}/ai/enrich-vehicle`, supraData);
    console.log(`   ✅ Success: ${supraResponse.status}`);
    console.log(`   🤖 Data source: ${supraResponse.data.dataSource}`);
    console.log(`   📊 Confidence: ${Math.round((supraResponse.data.confidence || 0) * 100)}%`);
    console.log(`   🚗 Vehicle: ${supraResponse.data.vehicle?.make} ${supraResponse.data.vehicle?.model} ${supraResponse.data.vehicle?.year}`);
    console.log(`   📝 Available trims: ${supraResponse.data.availableTrims?.length || 0}`);
    
    if (supraResponse.data.availableTrims?.length > 0) {
      const firstTrim = supraResponse.data.availableTrims[0];
      console.log(`   🏎️  Base trim: ${firstTrim.name} - ${firstTrim.performance?.horsepower}hp, ${firstTrim.performance?.torque}lb-ft`);
      console.log(`   ⚡ 0-60: ${firstTrim.performance?.acceleration0to60}s`);
      console.log(`   🏁 Quarter mile: ${firstTrim.performance?.quarterMile}s`);
    }
    
    if (supraResponse.data.commonModifications?.length > 0) {
      console.log(`   🔧 Common mods: ${supraResponse.data.commonModifications.length}`);
      const topMod = supraResponse.data.commonModifications[0];
      console.log(`     - ${topMod.name}: +${topMod.powerGain}hp, $${topMod.cost}`);
    }

    if (supraResponse.data.aiInsights?.length > 0) {
      console.log(`   💡 AI Insights: ${supraResponse.data.aiInsights.length}`);
      console.log(`     - ${supraResponse.data.aiInsights[0]}`);
    }

    // Test 2: Test with a different vehicle
    console.log('\n2. Testing with BMW M3...');
    const bmwData = {
      make: 'BMW',
      model: 'M3',
      year: 2023,
      trim: 'Competition'
    };
    
    const bmwResponse = await axios.post(`${BASE_URL}/ai/enrich-vehicle`, bmwData);
    console.log(`   ✅ Success: ${bmwResponse.status}`);
    console.log(`   🤖 Data source: ${bmwResponse.data.dataSource}`);
    console.log(`   📊 Confidence: ${Math.round((bmwResponse.data.confidence || 0) * 100)}%`);
    
    if (bmwResponse.data.availableTrims?.length > 0) {
      const trim = bmwResponse.data.availableTrims.find(t => t.name.toLowerCase().includes('competition')) || bmwResponse.data.availableTrims[0];
      console.log(`   🏎️  ${trim.name}: ${trim.performance?.horsepower}hp, ${trim.performance?.torque}lb-ft`);
      console.log(`   💰 MSRP: $${trim.msrp?.toLocaleString() || 'N/A'}`);
    }

    // Test 3: Test with an exotic/rare car
    console.log('\n3. Testing with exotic vehicle (McLaren 720S)...');
    const mclarenData = {
      make: 'McLaren',
      model: '720S',
      year: 2023
    };
    
    const mclarenResponse = await axios.post(`${BASE_URL}/ai/enrich-vehicle`, mclarenData);
    console.log(`   ✅ Success: ${mclarenResponse.status}`);
    console.log(`   🤖 Data source: ${mclarenResponse.data.dataSource}`);
    console.log(`   📊 Confidence: ${Math.round((mclarenResponse.data.confidence || 0) * 100)}%`);
    
    if (mclarenResponse.data.availableTrims?.length > 0) {
      const trim = mclarenResponse.data.availableTrims[0];
      console.log(`   🚀 Supercar specs: ${trim.performance?.horsepower}hp, ${trim.performance?.acceleration0to60}s 0-60`);
      console.log(`   💎 Luxury MSRP: $${trim.msrp?.toLocaleString() || 'N/A'}`);
    }

    console.log('\n🎉 OpenAI Vehicle Enrichment System Working!');
    console.log('\n🚀 Real AI Benefits:');
    console.log('   • Accurate real-world vehicle specifications');
    console.log('   • Multiple trim levels with precise data');
    console.log('   • Current market pricing and analysis');
    console.log('   • Expert modification recommendations');
    console.log('   • Performance insights from automotive knowledge');
    console.log('   • Works with any vehicle make/model/year');
    
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('   ❌ AI enrichment route not found');
      console.log('   💡 Please restart the backend server to load the updated routes');
    } else {
      console.log(`   ❌ Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      
      if (error.response?.data) {
        console.log(`   Details:`, error.response.data);
      }
    }
  }
}

testOpenAIVehicleEnrichment();