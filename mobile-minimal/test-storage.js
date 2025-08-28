/**
 * Quick test to verify async storage is working
 */

import { StorageService } from './src/utils/storage';

async function testAsyncStorage() {
  console.log('Testing AsyncStorage functionality...');
  
  try {
    // Test basic storage operations
    const testData = { test: true, timestamp: Date.now() };
    
    console.log('1. Testing setItem...');
    const setResult = await StorageService.setItem('test_key', testData);
    console.log('Set result:', setResult);
    
    console.log('2. Testing getItem...');
    const getResult = await StorageService.getItem('test_key', {});
    console.log('Get result:', getResult);
    
    console.log('3. Testing user preferences...');
    const prefs = await StorageService.getUserPreferences();
    console.log('User preferences:', prefs);
    
    console.log('4. Testing race stats...');
    const stats = await StorageService.getRaceStats();
    console.log('Race stats:', stats);
    
    console.log('✅ AsyncStorage test completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ AsyncStorage test failed:', error);
    return false;
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testAsyncStorage();
}

export default testAsyncStorage;