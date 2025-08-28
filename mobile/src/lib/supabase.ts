import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Direct values for debugging - this should work
const supabaseUrl = 'https://srhqcanyeatasprlvzvh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyaHFjYW55ZWF0YXNwcmx2enZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMzY4MjEsImV4cCI6MjA3MTgxMjgyMX0.Xv3CPkQCLJA1bEhBigPhnzFOK6z75v6-G_HyzBsUarc';

// Debug environment variables
console.log('Environment check:', {
  supabaseUrl: supabaseUrl,
  anonKeyLength: supabaseAnonKey?.length,
  env: process.env.NODE_ENV,
});

// Try to import from @env for comparison
try {
  const { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY } = require('@env');
  console.log('@env comparison:', {
    envUrl: EXPO_PUBLIC_SUPABASE_URL,
    envKey: EXPO_PUBLIC_SUPABASE_ANON_KEY,
    directUrl: supabaseUrl,
    directKey: supabaseAnonKey,
  });
} catch (error) {
  console.log('@env import failed:', error.message);
}

if (!supabaseUrl) {
  console.error('ERROR supabaseUrl is undefined:', { supabaseUrl, type: typeof supabaseUrl });
  throw new Error('supabaseUrl is required.');
}

if (!supabaseAnonKey) {
  console.error('ERROR supabaseAnonKey is undefined:', { supabaseAnonKey, type: typeof supabaseAnonKey });
  throw new Error('supabaseAnonKey is required.');
}

console.log('SUCCESS Creating Supabase client with valid credentials');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

console.log('SUCCESS Supabase client created successfully:', {
  clientType: typeof supabase,
  hasAuth: !!supabase.auth,
  hasFrom: !!supabase.from,
});

// Export types for better TypeScript support
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          handle: string;
          display_name: string | null;
          first_name: string | null;
          last_name: string | null;
          role: string;
          presence_mode: string;
          is_pro: boolean;
          subscription_tier: string | null;
          subscription_start: string | null;
          subscription_end: string | null;
          subscription_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          handle: string;
          display_name?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          role?: string;
          presence_mode?: string;
          is_pro?: boolean;
          subscription_tier?: string | null;
          subscription_start?: string | null;
          subscription_end?: string | null;
          subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          handle?: string;
          display_name?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          role?: string;
          presence_mode?: string;
          is_pro?: boolean;
          subscription_tier?: string | null;
          subscription_start?: string | null;
          subscription_end?: string | null;
          subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};