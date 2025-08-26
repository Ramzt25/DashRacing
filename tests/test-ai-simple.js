import axios from 'axios';

const BASE_URL = 'http://localhost:4000';

async function testSimpleAIEnrichment() {
  console.log('🧪 Testing if backend is updated with AI routes...\n');
  
  try {
    // Test the AI enrichment endpoint directly
    console.log('1. Testing AI vehicle enrichment endpoint...');
    const enrichmentData = {
      make: 'Toyota',
      model: 'Supra', 
      year: 2023
    };
    
    const response = await axios.post(`${BASE_URL}/ai/enrich-vehicle`, enrichmentData);
    console.log(`   ✅ AI enrichment successful: ${response.status}`);
    console.log(`   🚗 Vehicle: ${response.data.vehicle?.make} ${response.data.vehicle?.model} ${response.data.vehicle?.year}`);
    console.log(`   🏎️  Horsepower: ${response.data.performance?.horsepower || 'N/A'}`);
    console.log(`   📊 Available trims: ${response.data.availableTrims?.length || 0}`);
    
    if (response.data.availableTrims?.length > 0) {
      console.log('   📝 Trim details:');
      response.data.availableTrims.forEach((trim, index) => {
        console.log(`     ${index + 1}. ${trim.name} - ${trim.performance?.horsepower}hp, ${trim.performance?.torque}lb-ft`);
      });
    }
    
    if (response.data.commonModifications?.length > 0) {
      console.log('   🔧 Common modifications:');
      response.data.commonModifications.slice(0, 3).forEach((mod, index) => {
        console.log(`     ${index + 1}. ${mod.name} - +${mod.powerGain}hp, $${mod.cost}`);
      });
    }
    
    console.log('\n🎉 AI enrichment system is working!');
    console.log('✨ You can now restart the backend server to use the new features');
    
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('   ❌ AI enrichment route not found');
      console.log('   💡 Please restart the backend server to load the new AI routes');
      console.log('   🔄 After restarting, run this test again');
    } else {
      console.log(`   ❌ Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }
  }
}

testSimpleAIEnrichment();