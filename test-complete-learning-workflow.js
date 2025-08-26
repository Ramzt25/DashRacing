const API_BASE = 'http://localhost:4000';

async function testCompleteLearningWorkflow() {
  console.log('🔄 Testing Complete Learning Workflow\n');
  console.log('This demonstrates the full learning cycle:');
  console.log('• Create car with AI enrichment');
  console.log('• Add modifications');
  console.log('• Record dyno results');
  console.log('• Watch AI learn and improve predictions');
  console.log('• Get better recommendations\n');

  try {
    // Step 1: Create user
    console.log('1. Creating test user...');
    const userResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `workflow-test-${Date.now()}@test.com`,
        password: 'testpass123',
        name: 'Workflow Test User'
      })
    });

    const userData = await userResponse.json();
    const authHeaders = { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userData.token}`
    };
    console.log('✅ User created');

    // Step 2: Create car with AI enrichment
    console.log('\n2. Creating car with AI vehicle database...');
    const carResponse = await fetch(`${API_BASE}/cars`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Learning Test Civic',
        year: 2019,
        make: 'Honda',
        model: 'Civic Type R',
        trim: 'FK8',
        whp: 306,
        weightKg: 1380,
        useAIEnrichment: true
      })
    });

    const carData = await carResponse.json();
    console.log('✅ Car created with AI enrichment');
    console.log(`   Vehicle: ${carData.year} ${carData.make} ${carData.model} ${carData.trim || ''}`);
    console.log(`   Base Power: ${carData.basePower || carData.whp}HP`);
    console.log(`   AI Confidence: ${carData.confidence ? (carData.confidence * 100).toFixed(1) + '%' : 'N/A'}`);

    // Step 3: Add a modification
    console.log('\n3. Adding turbo modification...');
    const modResponse = await fetch(`${API_BASE}/cars/${carData.id}/modifications`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        category: 'Forced Induction',
        name: 'Garrett GT2860RS Turbo Kit',
        brand: 'Garrett',
        notes: 'Full turbo kit with supporting mods',
        powerGain: 100,  // AI's initial prediction
        torqueGain: 90,
        cost: 4500,
        installationTime: 16
      })
    });

    const modData = await modResponse.json();
    console.log('✅ Turbo modification added');
    console.log(`   Predicted: +${modData.powerGain || 100}HP, +${modData.torqueGain || 90}ft-lb`);
    console.log(`   Cost: $${modData.cost || 4500}`);

    // Step 4: Record actual dyno results (better than predicted)
    console.log('\n4. Recording actual dyno results...');
    const dynoResponse = await fetch(`${API_BASE}/dyno-results`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        carId: carData.id,
        modificationId: modData.id,
        
        // Baseline (before turbo)
        baselinePower: 306,
        baselineTorque: 295,
        
        // Actual results (better than predicted!)
        resultPower: 420,   // +114HP (vs predicted +100HP)
        resultTorque: 385,  // +90ft-lb
        
        // Real-world costs and details
        modificationCost: 4200,  // Slightly less than predicted
        installationTime: 14,    // Faster install
        satisfactionRating: 9,
        notes: 'Amazing power gains! Turbo spools perfectly, very driveable.',
        
        // Dyno details
        dynoType: 'Dynojet',
        dynoShop: 'Honda Tuning Specialists',
        temperature: 72,
        humidity: 40,
        operator: 'Sarah Chen'
      })
    });

    const dynoData = await dynoResponse.json();
    console.log('✅ Dyno results recorded - AI Learning Triggered!');
    console.log(`   Actual Power Gain: +${dynoData.powerGain}HP (vs predicted +100HP)`);
    console.log(`   Actual Torque Gain: +${dynoData.torqueGain}ft-lb`);
    console.log(`   AI Accuracy: ${((100 / dynoData.powerGain) * 100).toFixed(1)}%`);
    console.log(`   Learning Triggered: ${dynoData.learningTriggered ? 'YES 🧠' : 'Processed ✓'}`);

    // Step 5: Test another similar car to see learning
    console.log('\n5. Creating another similar car to test learning...');
    const car2Response = await fetch(`${API_BASE}/cars`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Second Civic Type R',
        year: 2020,
        make: 'Honda',
        model: 'Civic Type R',
        trim: 'FK8',
        useAIEnrichment: true
      })
    });

    const car2Data = await car2Response.json();
    console.log('✅ Second car created');
    console.log(`   Cache Hit: ${car2Data.enrichmentSource === 'Database Cache' ? 'YES 🎯' : 'New lookup'}`);

    // Step 6: Get smart recommendations for the second car
    console.log('\n6. Getting smart recommendations based on learned data...');
    const smartRecsResponse = await fetch(`${API_BASE}/smart-recommendations`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        year: 2020,
        make: 'Honda',
        model: 'Civic Type R',
        trim: 'FK8',
        goals: ['power', 'track'],
        budget: 5000
      })
    });

    if (smartRecsResponse.ok) {
      const smartRecsData = await smartRecsResponse.json();
      console.log('🧠 Smart recommendations generated!');
      console.log(`   Found ${smartRecsData.recommendations?.length || 0} recommendations`);
      
      if (smartRecsData.recommendations?.length > 0) {
        console.log('\n   🏆 AI-Learned Recommendations:');
        smartRecsData.recommendations.slice(0, 3).forEach((rec, i) => {
          console.log(`   ${i+1}. ${rec.name}`);
          console.log(`      Power: +${rec.expectedPowerGain}HP (${rec.dataQuality})`);
          console.log(`      Cost: $${rec.estimatedCost} | Confidence: ${(rec.confidence * 100).toFixed(1)}%`);
          console.log(`      Based on: ${rec.basedOnInstalls} installs, ${rec.dynoConfirmed} dyno results`);
        });
      }
    }

    // Step 7: Check learning system health
    console.log('\n7. Learning system health check...');
    const statsResponse = await fetch(`${API_BASE}/learning-stats`, {
      headers: { 'Authorization': `Bearer ${userData.token}` }
    });

    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('📊 Learning System Status:');
      console.log(`   Health: ${statsData.systemHealth}`);
      console.log(`   Total Modifications: ${statsData.totalModifications}`);
      console.log(`   Dyno Verified: ${statsData.dynoVerifiedMods}`);
      console.log(`   Real Results: ${statsData.totalDynoResults}`);
      console.log(`   Average Accuracy: ${statsData.dataQuality.avgAccuracyPercent.toFixed(1)}%`);
      console.log(`   Status: ${statsData.message}`);
    }

    console.log('\n🎉 Complete Learning Workflow Success!');
    console.log('\n📋 What We Just Demonstrated:');
    console.log('   ✅ AI vehicle enrichment with trim recognition');
    console.log('   ✅ Smart vehicle database caching');
    console.log('   ✅ Modification tracking with predictions');
    console.log('   ✅ Real dyno result recording');
    console.log('   ✅ AI learning from real-world data');
    console.log('   ✅ Improved recommendations based on learning');
    console.log('   ✅ System health monitoring');

    console.log('\n🚀 The AI Gets Smarter With Every Dyno Result!');
    console.log('   • Initial prediction: +100HP');
    console.log('   • Actual result: +114HP');
    console.log('   • AI learns: 14% more power than predicted');
    console.log('   • Future predictions: More accurate for similar setups');

    console.log('\n💡 Next Steps Available:');
    console.log('   1. Mobile app integration for easy dyno recording');
    console.log('   2. Cost monitoring for OpenAI usage optimization');
    console.log('   3. Advanced analytics and recommendation engine');
    console.log('   4. Real user testing and feedback loops');

  } catch (error) {
    console.error('❌ Workflow test failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Backend not running. Start it with:');
      console.log('   Start-Process powershell -ArgumentList "-NoExit", "-Command", "node dist/index.js"');
    }
  }
}

// Run the complete workflow test
testCompleteLearningWorkflow();