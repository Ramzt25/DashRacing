import { FREE_LIMITS, PREMIUM_BENEFITS } from '@dash/utils';
import { UserEntitlements, FeatureGate } from '@dash/types';
import { supabase } from './supabase';

/**
 * Feature Service handles feature gating and entitlements
 * All premium features must be verified server-side
 */
export class FeatureService {
  private static entitlements: UserEntitlements | null = null;
  private static featureFlags: Record<string, any> = {};

  /**
   * Initialize feature service with user entitlements
   */
  static async initialize(userId: string): Promise<void> {
    try {
      // Fetch user entitlements from server
      const { data: entitlements } = await supabase
        .from('entitlements')
        .select('*')
        .eq('user_id', userId)
        .single();

      this.entitlements = entitlements;

      // Fetch feature flags
      const { data: flags } = await supabase
        .from('feature_flags')
        .select('*');

      this.featureFlags = flags?.reduce((acc, flag) => {
        acc[flag.key] = flag.value;
        return acc;
      }, {} as Record<string, any>) || {};
    } catch (error) {
      console.warn('Failed to initialize feature service:', error);
      // Fallback to free tier
      this.entitlements = {
        userId,
        plan: 'free',
        source: 'admin',
        renewedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      };
    }
  }

  /**
   * Check if user has premium access
   */
  static isPremium(): boolean {
    if (!this.entitlements) return false;
    
    const now = new Date();
    const expiresAt = new Date(this.entitlements.expiresAt);
    
    return this.entitlements.plan === 'premium' && expiresAt > now;
  }

  /**
   * Check if a feature is available to the user
   */
  static canUseFeature(feature: string): FeatureGate {
    const isPremium = this.isPremium();

    switch (feature) {
      case 'garage_unlimited_vehicles':
        return {
          feature,
          requiresPremium: true,
          enabled: isPremium,
          reason: isPremium ? undefined : 'Premium required for unlimited vehicles',
        };

      case 'upgrades_planner':
        return {
          feature,
          requiresPremium: true,
          enabled: isPremium,
          reason: isPremium ? undefined : 'Premium required for AI upgrades planner',
        };

      case 'advanced_meet_filters':
        return {
          feature,
          requiresPremium: true,
          enabled: isPremium,
          reason: isPremium ? undefined : 'Premium required for advanced filters',
        };

      case 'priority_meet_creation':
        return {
          feature,
          requiresPremium: true,
          enabled: isPremium,
          reason: isPremium ? undefined : 'Premium required for priority creation',
        };

      case 'basic_meet_creation':
      case 'garage_single_vehicle':
      case 'pin_creation':
      case 'friend_system':
        return {
          feature,
          requiresPremium: false,
          enabled: true,
        };

      default:
        // Check feature flags for other features
        const flagEnabled = this.featureFlags[feature] !== false;
        return {
          feature,
          requiresPremium: false,
          enabled: flagEnabled,
          reason: flagEnabled ? undefined : 'Feature disabled',
        };
    }
  }

  /**
   * Get current user limits based on plan
   */
  static getCurrentLimits() {
    return this.isPremium() ? PREMIUM_BENEFITS : FREE_LIMITS;
  }

  /**
   * Verify entitlement with server (for protected actions)
   */
  static async verifyEntitlement(feature: string): Promise<boolean> {
    try {
      const { data } = await supabase.functions.invoke('verify-entitlement', {
        body: { feature },
      });

      return data?.allowed === true;
    } catch (error) {
      console.warn('Failed to verify entitlement:', error);
      return false;
    }
  }

  /**
   * Get feature flag value
   */
  static getFeatureFlag(key: string, defaultValue: any = false): any {
    return this.featureFlags[key] ?? defaultValue;
  }

  /**
   * Refresh entitlements (call after purchase)
   */
  static async refresh(): Promise<void> {
    if (!this.entitlements?.userId) return;
    await this.initialize(this.entitlements.userId);
  }
}