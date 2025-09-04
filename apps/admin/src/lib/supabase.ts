import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types - matches the mobile app
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          handle: string;
          bio?: string;
          home_geo?: any;
          terms_version: number;
          terms_accepted_at?: string;
          live_sharing_enabled: boolean;
          live_sharing_scope: string;
          created_at: string;
          updated_at: string;
        };
      };
      meets: {
        Row: {
          id: string;
          host_id: string;
          title: string;
          description?: string;
          start_at: string;
          end_at: string;
          location: any;
          radius_meters: number;
          visibility: string;
          rules?: string;
          max_attendees?: number;
          verified: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      pins: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          location: any;
          description?: string;
          photo?: string;
          expires_at: string;
          status: string;
          created_at: string;
        };
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          target_type: string;
          target_id: string;
          reason: string;
          description?: string;
          status: string;
          created_at: string;
        };
      };
      feature_flags: {
        Row: {
          key: string;
          value: any;
          updated_at: string;
        };
      };
    };
  };
}