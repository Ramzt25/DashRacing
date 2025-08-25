// Quick test user creation script
const testUser = {
  email: 'test@gridghost.com',
  password: 'Test123!',
  firstName: 'Test',
  lastName: 'User',
  handle: 'testuser'
};

async function createTestUser() {
  try {
    const response = await fetch('http://localhost:4000/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Test user created successfully!');
      console.log('Email:', testUser.email);
      console.log('Password:', testUser.password);
      console.log('User ID:', result.user.id);
      console.log('Token:', result.token);
    } else {
      const error = await response.json();
      console.log('❌ Error creating user:', error);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

createTestUser();