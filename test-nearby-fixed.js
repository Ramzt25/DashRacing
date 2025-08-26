// Simple test for nearby endpoint
import axios from 'axios';

async function testNearby() {
  try {
    // First register a user if needed
    try {
      const registerResponse = await axios.post('http://localhost:4000/auth/register', {
        email: 'test@example.com',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User'
      });
      console.log('✅ User registered');
    } catch (regError) {
      console.log('ℹ️ User may already exist');
    }
    
    // Login to get token
    const loginResponse = await axios.post('http://localhost:4000/auth/login', {
      email: 'test@example.com',
      password: 'TestPassword123!'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Test nearby endpoint
    const nearbyResponse = await axios.get('http://localhost:4000/races/nearby?latitude=34.0522&longitude=-118.2437&radius=10', {
      headers: {
        authorization: `Bearer ${token}`
      }
    });
    
    console.log('✅ Nearby endpoint status:', nearbyResponse.status);
    console.log('✅ Nearby response:', nearbyResponse.data);
    
  } catch (error) {
    console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
  }
}

testNearby();