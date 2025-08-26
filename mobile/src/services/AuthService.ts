import { supabase } from '../lib/supabase';

// Debug the import
console.log('🔧 AuthService: Imported supabase client:', {
  supabaseType: typeof supabase,
  isUndefined: supabase === undefined,
  isNull: supabase === null,
  hasAuth: supabase && typeof supabase.auth,
  hasFrom: supabase && typeof supabase.from,
});

interface LoginRequest {
  email: string;
  password: string;
}

interface SignupRequest {
  email: string;
  password: string;
  handle: string;
  displayName?: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    handle: string;
    displayName: string | null;
    firstName?: string | null;
    lastName?: string | null;
    isPro?: boolean;
    subscriptionTier?: string | null;
    subscriptionEnd?: Date | null;
  };
}

interface UpgradeRequest {
  subscriptionTier: 'monthly' | 'yearly';
  paymentToken?: string;
}

interface UpgradeResponse {
  success: boolean;
  message: string;
  user: AuthResponse['user'];
}

interface ApiError {
  error: string;
  message?: string;
}

export class AuthService {
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log('🌐 AuthService.login called with Supabase:', { 
      email: credentials.email, 
      passwordLength: credentials.password.length 
    });
    
    try {
      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      console.log('📡 Supabase login response:', { 
        success: !!data.user,
        hasSession: !!data.session,
        error: error?.message 
      });

      if (error) {
        console.error('❌ Supabase login failed:', error);
        throw new Error(error.message);
      }

      if (!data.user || !data.session) {
        throw new Error('Login failed - no user or session returned');
      }

      // Get user profile from public.users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('❌ Profile fetch failed:', profileError);
        throw new Error('Failed to get user profile');
      }

      const result: AuthResponse = {
        token: data.session.access_token,
        user: {
          id: data.user.id,
          email: data.user.email!,
          handle: profile.handle,
          displayName: profile.display_name,
          firstName: profile.first_name,
          lastName: profile.last_name,
          isPro: profile.is_pro,
          subscriptionTier: profile.subscription_tier,
          subscriptionEnd: profile.subscription_end ? new Date(profile.subscription_end) : null,
        }
      };

      console.log('✅ Login successful:', { 
        userId: result.user.id, 
        userEmail: result.user.email,
        hasToken: !!result.token 
      });
      
      return result;
    } catch (error) {
      console.error('🚨 AuthService.login error:', error);
      throw error;
    }
  }

  static async signup(userData: SignupRequest): Promise<AuthResponse> {
    console.log('🌐 AuthService.signup called with Supabase:', { 
      email: userData.email,
      handle: userData.handle,
      passwordLength: userData.password.length 
    });

    try {
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            handle: userData.handle,
            display_name: userData.displayName,
          }
        }
      });

      console.log('📡 Supabase signup response:', { 
        success: !!data.user,
        hasSession: !!data.session,
        error: error?.message 
      });

      if (error) {
        console.error('❌ Supabase signup failed:', error);
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Signup failed - no user returned');
      }

      // If we have a session (email confirmation disabled), return the response
      if (data.session) {
        // Get user profile from public.users table (should be created by trigger)
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('❌ Profile fetch failed:', profileError);
          throw new Error('Failed to get user profile');
        }

        const result: AuthResponse = {
          token: data.session.access_token,
          user: {
            id: data.user.id,
            email: data.user.email!,
            handle: profile.handle,
            displayName: profile.display_name,
            firstName: profile.first_name,
            lastName: profile.last_name,
            isPro: profile.is_pro,
            subscriptionTier: profile.subscription_tier,
            subscriptionEnd: profile.subscription_end ? new Date(profile.subscription_end) : null,
          }
        };

        console.log('✅ Signup successful:', { 
          userId: result.user.id, 
          userEmail: result.user.email,
          hasToken: !!result.token 
        });
        
        return result;
      } else {
        // Email confirmation required
        throw new Error('Please check your email for a confirmation link');
      }
    } catch (error) {
      console.error('🚨 AuthService.signup error:', error);
      throw error;
    }
  }

  static async getCurrentUser(token: string): Promise<AuthResponse['user']> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        throw new Error('No authenticated user');
      }

      // Get user profile from public.users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw new Error('Failed to get user profile');
      }

      return {
        id: user.id,
        email: user.email!,
        handle: profile.handle,
        displayName: profile.display_name,
        firstName: profile.first_name,
        lastName: profile.last_name,
        isPro: profile.is_pro,
        subscriptionTier: profile.subscription_tier,
        subscriptionEnd: profile.subscription_end ? new Date(profile.subscription_end) : null,
      };
    } catch (error) {
      console.error('🚨 AuthService.getCurrentUser error:', error);
      throw error;
    }
  }

  static async validateToken(token: string): Promise<boolean> {
    try {
      await this.getCurrentUser(token);
      return true;
    } catch (error) {
      return false;
    }
  }

  static async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  static async upgradeToPro(upgradeData: UpgradeRequest, token: string): Promise<UpgradeResponse> {
    // This would integrate with your payment processor
    // For now, we'll simulate an upgrade
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        throw new Error('No authenticated user');
      }

      // Update subscription in users table
      const subscriptionStart = new Date();
      const subscriptionEnd = new Date();
      
      if (upgradeData.subscriptionTier === 'yearly') {
        subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
      } else {
        subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
      }

      const { data: updatedProfile, error: updateError } = await supabase
        .from('users')
        .update({
          is_pro: true,
          subscription_tier: upgradeData.subscriptionTier,
          subscription_start: subscriptionStart.toISOString(),
          subscription_end: subscriptionEnd.toISOString(),
          subscription_id: `sub_${Date.now()}`, // Mock subscription ID
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        throw new Error('Failed to update subscription');
      }

      return {
        success: true,
        message: 'Successfully upgraded to Pro!',
        user: {
          id: user.id,
          email: user.email!,
          handle: updatedProfile.handle,
          displayName: updatedProfile.display_name,
          firstName: updatedProfile.first_name,
          lastName: updatedProfile.last_name,
          isPro: updatedProfile.is_pro,
          subscriptionTier: updatedProfile.subscription_tier,
          subscriptionEnd: new Date(updatedProfile.subscription_end),
        },
      };
    } catch (error) {
      console.error('🚨 AuthService.upgradeToPro error:', error);
      throw error;
    }
  }

  static async cancelSubscription(token: string): Promise<UpgradeResponse> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        throw new Error('No authenticated user');
      }

      const { data: updatedProfile, error: updateError } = await supabase
        .from('users')
        .update({
          is_pro: false,
          subscription_tier: null,
          subscription_start: null,
          subscription_end: null,
          subscription_id: null,
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        throw new Error('Failed to cancel subscription');
      }

      return {
        success: true,
        message: 'Subscription cancelled successfully',
        user: {
          id: user.id,
          email: user.email!,
          handle: updatedProfile.handle,
          displayName: updatedProfile.display_name,
          firstName: updatedProfile.first_name,
          lastName: updatedProfile.last_name,
          isPro: updatedProfile.is_pro,
          subscriptionTier: updatedProfile.subscription_tier,
        },
      };
    } catch (error) {
      console.error('🚨 AuthService.cancelSubscription error:', error);
      throw error;
    }
  }
}