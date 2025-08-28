console.log('=== ENVIRONMENT DEBUG ===');
console.log('process.env keys:', Object.keys(process.env).filter(key => key.includes('SUPABASE')));
console.log('EXPO_PUBLIC_SUPABASE_URL from process.env:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY from process.env:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

// Try importing from @env
try {
  const { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY } = require('@env');
  console.log('From @env - URL:', EXPO_PUBLIC_SUPABASE_URL);
  console.log('From @env - KEY:', EXPO_PUBLIC_SUPABASE_ANON_KEY);
} catch (error) {
  console.error('Error importing from @env:', error.message);
}