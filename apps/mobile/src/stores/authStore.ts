import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { User } from '@dash/types';
import { supabase } from '../services/supabase';
import { FeatureService } from '../services/FeatureService';

interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  signIn: (email: string) => Promise<void>;
  signInWithPhone: (phone: string) => Promise<void>;
  verifyOTP: (token: string, type: 'email' | 'sms') => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  acceptTerms: (version: number) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector((set, get) => ({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,

    signIn: async (email: string) => {
      set({ isLoading: true });
      
      try {
        const { error } = await supabase.auth.signInWithOtp({ email });
        
        if (error) throw error;
        
        // OTP sent successfully
      } catch (error) {
        console.error('Sign in error:', error);
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    signInWithPhone: async (phone: string) => {
      set({ isLoading: true });
      
      try {
        const { error } = await supabase.auth.signInWithOtp({ phone });
        
        if (error) throw error;
        
        // OTP sent successfully
      } catch (error) {
        console.error('Phone sign in error:', error);
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    verifyOTP: async (token: string, type: 'email' | 'sms') => {
      set({ isLoading: true });
      
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          token,
          type,
        });
        
        if (error) throw error;
        
        if (data.user) {
          // Initialize feature service
          await FeatureService.initialize(data.user.id);
          
          // Fetch user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          set({
            user: profile,
            session: data.session,
            isAuthenticated: true,
          });
        }
      } catch (error) {
        console.error('OTP verification error:', error);
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    signOut: async () => {
      set({ isLoading: true });
      
      try {
        const { error } = await supabase.auth.signOut();
        
        if (error) throw error;
        
        set({
          user: null,
          session: null,
          isAuthenticated: false,
        });
      } catch (error) {
        console.error('Sign out error:', error);
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    updateProfile: async (updates: Partial<User>) => {
      const { user } = get();
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single();

        if (error) throw error;

        set({ user: data });
      } catch (error) {
        console.error('Profile update error:', error);
        throw error;
      }
    },

    acceptTerms: async (version: number) => {
      const { user } = get();
      if (!user) return;

      await get().updateProfile({
        termsVersion: version,
        termsAcceptedAt: new Date().toISOString(),
      });
    },
  }))
);

// Initialize auth state listener
supabase.auth.onAuthStateChange(async (event, session) => {
  const { set } = useAuthStore.getState();

  if (event === 'SIGNED_IN' && session?.user) {
    try {
      // Initialize feature service
      await FeatureService.initialize(session.user.id);
      
      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      set({
        user: profile,
        session,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Auth state change error:', error);
      set({ isLoading: false });
    }
  } else if (event === 'SIGNED_OUT') {
    set({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
    });
  } else {
    set({ isLoading: false });
  }
});