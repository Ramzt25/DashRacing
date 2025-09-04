export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: string;
}

/**
 * Analytics tracking utility that supports multiple providers
 */
export class Analytics {
  private static providers: AnalyticsProvider[] = [];

  static addProvider(provider: AnalyticsProvider) {
    this.providers.push(provider);
  }

  static track(event: string, properties?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: new Date().toISOString(),
    };

    this.providers.forEach(provider => {
      try {
        provider.track(analyticsEvent);
      } catch (error) {
        console.warn('Analytics provider error:', error);
      }
    });
  }

  static identify(userId: string, properties?: Record<string, any>) {
    this.providers.forEach(provider => {
      try {
        provider.identify?.(userId, properties);
      } catch (error) {
        console.warn('Analytics provider error:', error);
      }
    });
  }

  static screen(screenName: string, properties?: Record<string, any>) {
    this.track('screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }
}

export interface AnalyticsProvider {
  track(event: AnalyticsEvent): void;
  identify?(userId: string, properties?: Record<string, any>): void;
}

// Predefined events for consistency
export const ANALYTICS_EVENTS = {
  // Authentication
  SIGN_IN: 'sign_in',
  SIGN_UP: 'sign_up',
  SIGN_OUT: 'sign_out',
  
  // Permissions
  PERMISSION_GRANTED: 'permission_granted',
  PERMISSION_DENIED: 'permission_denied',
  
  // Location & Maps
  LIVE_SHARE_START: 'live_share_start',
  LIVE_SHARE_STOP: 'live_share_stop',
  MAP_VIEW: 'map_view',
  
  // Pins
  PIN_CREATE: 'pin_create',
  PIN_VOTE: 'pin_vote',
  PIN_REPORT: 'pin_report',
  
  // Meets
  MEET_CREATE: 'meet_create',
  MEET_RSVP: 'meet_rsvp',
  MEET_CHECK_IN: 'meet_check_in',
  
  // Garage
  VEHICLE_ADD: 'vehicle_add',
  VEHICLE_RESOLVE: 'vehicle_resolve',
  UPGRADES_PLANNER_OPEN: 'upgrades_planner_open',
  UPGRADES_SUGGESTION_VIEW: 'upgrades_suggestion_view',
  
  // Premium
  UPGRADE_ATTEMPT: 'upgrade_attempt',
  UPGRADE_SUCCESS: 'upgrade_success',
  FEATURE_GATE_HIT: 'feature_gate_hit',
  
  // AI
  AI_COST: 'ai_cost',
  AI_CACHE_HIT: 'ai_cache_hit',
  AI_CACHE_MISS: 'ai_cache_miss',
} as const;