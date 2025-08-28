/**
 * Simple test to verify environment variables are loading in React Native
 * This can be loaded in a web browser to check Metro bundling
 */

// Test the environment import
import {
  EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY,
} from '@env';

console.log('ENV_TEST Environment Variable Test Results:');
console.log('=====================================');
console.log('EXPO_PUBLIC_SUPABASE_URL:', EXPO_PUBLIC_SUPABASE_URL);
console.log('Type:', typeof EXPO_PUBLIC_SUPABASE_URL);
console.log('Length:', EXPO_PUBLIC_SUPABASE_URL?.length);
console.log('');
console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY:', EXPO_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
console.log('Type:', typeof EXPO_PUBLIC_SUPABASE_ANON_KEY);
console.log('Length:', EXPO_PUBLIC_SUPABASE_ANON_KEY?.length);
console.log('=====================================');

// Test Supabase import
import { supabase } from './lib/supabase';

console.log('SUPABASE_TEST Supabase Client Test Results:');
console.log('=================================');
console.log('Supabase client:', typeof supabase);
console.log('Is undefined:', supabase === undefined);
console.log('Is null:', supabase === null);
console.log('Has auth:', !!supabase?.auth);
console.log('Has from:', !!supabase?.from);
console.log('=================================');

export default function DebugTest() {
  return null; // This is just for testing imports
}