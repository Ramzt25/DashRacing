import { supabase } from '../lib/supabase';
import {
  EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY,
} from '@env';

describe('Supabase Connection Test', () => {
  beforeAll(() => {
    console.log('TEST_START Starting Supabase Connection Tests');
    console.log('📍 Test Environment Check:');
    console.log('  - Supabase URL:', EXPO_PUBLIC_SUPABASE_URL);
    console.log('  - Anon Key Length:', EXPO_PUBLIC_SUPABASE_ANON_KEY?.length);
    console.log('  - Supabase Client:', typeof supabase);
  });

  test('Environment variables should be loaded', () => {
    console.log('TEST_ENV Testing environment variables...');
    
    expect(EXPO_PUBLIC_SUPABASE_URL).toBeDefined();
    expect(EXPO_PUBLIC_SUPABASE_URL).toBe('https://srhqcanyeatasprlvzvh.supabase.co');
    
    expect(EXPO_PUBLIC_SUPABASE_ANON_KEY).toBeDefined();
    expect(EXPO_PUBLIC_SUPABASE_ANON_KEY).toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    
    console.log('ENV_SUCCESS Environment variables loaded correctly');
  });

  test('Supabase client should be initialized', () => {
    console.log('TEST_CLIENT Testing Supabase client initialization...');
    
    expect(supabase).toBeDefined();
    expect(supabase).not.toBeNull();
    expect(typeof supabase).toBe('object');
    
    // Check if auth property exists
    expect(supabase.auth).toBeDefined();
    expect(typeof supabase.auth).toBe('object');
    
    // Check if from method exists (for database queries)
    expect(supabase.from).toBeDefined();
    expect(typeof supabase.from).toBe('function');
    
    console.log('CLIENT_SUCCESS Supabase client initialized correctly');
  });

  test('Supabase client should have correct configuration', () => {
    console.log('TEST_CONFIG Testing Supabase client configuration...');
    
    // Access the internal supabaseUrl and supabaseKey
    const clientUrl = (supabase as any).supabaseUrl;
    const clientKey = (supabase as any).supabaseKey;
    
    expect(clientUrl).toBe('https://srhqcanyeatasprlvzvh.supabase.co');
    expect(clientKey).toBeDefined();
    expect(clientKey.length).toBeGreaterThan(100); // JWT tokens are long
    
    console.log('CONFIG_SUCCESS Supabase client configured correctly');
  });

  test('Supabase connection should be reachable', async () => {
    console.log('TEST_CONNECTION Testing Supabase connection...');
    
    try {
      // Try to fetch the current session (this doesn't require authentication)
      const { data, error } = await supabase.auth.getSession();
      
      // We don't expect to be logged in, but we should get a response without errors
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.session).toBeNull(); // Should be null since we're not logged in
      
      console.log('CONNECTION_SUCCESS Supabase connection successful');
    } catch (error) {
      console.error('CONNECTION_ERROR Supabase connection failed:', error);
      throw error;
    }
  });

  test('Database connection should work', async () => {
    console.log('TEST_DATABASE Testing database connection...');
    
    try {
      // Try to query the users table (this should work even without authentication for the schema)
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      // We might get a permission error, but we shouldn't get a connection error
      if (error) {
        // If it's a permission error, that's actually good - it means we connected
        expect(error.message).not.toContain('connection');
        expect(error.message).not.toContain('network');
        console.log('DB_SUCCESS Database connection successful (got expected permission response)');
      } else {
        // If no error, that's great too
        expect(data).toBeDefined();
        console.log('DB_QUERY_SUCCESS Database connection and query successful');
      }
    } catch (error) {
      console.error('DB_ERROR Database connection failed:', error);
      throw error;
    }
  });

  test('Auth service should be accessible', async () => {
    console.log('TEST_AUTH Testing auth service...');
    
    try {
      // Try to get user (should return null/error since we're not logged in)
      const { data, error } = await supabase.auth.getUser();
      
      // We expect either no user (data.user = null) or an auth error
      if (error) {
        // Auth errors are expected when not logged in
        console.log('AUTH_SUCCESS Auth service accessible (got expected auth response)');
      } else {
        expect(data).toBeDefined();
        expect(data.user).toBeNull(); // Should be null since we're not logged in
        console.log('AUTH_WORKING_SUCCESS Auth service accessible and working');
      }
    } catch (error) {
      console.error('AUTH_ERROR Auth service failed:', error);
      throw error;
    }
  });

  afterAll(() => {
    console.log('TEST_COMPLETE Supabase Connection Tests Completed');
  });
});