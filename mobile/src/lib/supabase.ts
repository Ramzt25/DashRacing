import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY,
} from '@env';

// Debug environment variables
console.log('🔧 Environment check:', {
  supabaseUrl: EXPO_PUBLIC_SUPABASE_URL,
  anonKeyLength: EXPO_PUBLIC_SUPABASE_ANON_KEY?.length,
  env: process.env.NODE_ENV,
});

// Additional debugging
console.log('🔧 Detailed environment check:', {
  supabaseUrl: typeof EXPO_PUBLIC_SUPABASE_URL,
  supabaseUrlValue: EXPO_PUBLIC_SUPABASE_URL,
  anonKey: typeof EXPO_PUBLIC_SUPABASE_ANON_KEY,
  anonKeyLength: EXPO_PUBLIC_SUPABASE_ANON_KEY?.length,
  anonKeyStart: EXPO_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
});

const supabaseUrl = EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('❌ supabaseUrl is undefined:', { supabaseUrl, type: typeof supabaseUrl });
  throw new Error('supabaseUrl is required.');
}

if (!supabaseAnonKey) {
  console.error('❌ supabaseAnonKey is undefined:', { supabaseAnonKey, type: typeof supabaseAnonKey });
  throw new Error('supabaseAnonKey is required.');
}

console.log('✅ Creating Supabase client with valid credentials');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

console.log('✅ Supabase client created successfully:', {
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