/**
 * Enhanced Race Stats Service - Week 4 Frontend Integration
 * Connects mobile app to backend race statistics and user performance data
 */

import { apiRequest, API_CONFIG } from '../config/api';

// Enhanced interfaces for Week 4 integration
export interface UserRaceStats {
  // Basic stats
  totalSessions: number;
  totalRaces: number;
  wins: number;
  losses: number;
  winRate: number;
  
  // Performance metrics
  totalDistance: number;
  totalTime: number;
  maxSpeed: number;
  averageSpeed: number;
  bestZeroToSixty: number | null;
  bestQuarterMile: number | null;
  
  // Recent activity
  sessionsThisWeek: number;
  sessionsThisMonth: number;
  lastRaceDate: string | null;
  recentPerformance: {
    averageSpeedLast10: number;
    improvementTrend: 'improving' | 'declining' | 'stable';
    personalBests: number;
  };
  
  // Rankings and achievements  
  globalRank: number | null;
  localRank: number | null;
  achievements: number;
  experience: number;
  level: number;
}

export interface LiveMapStats {
  onlineFriends: number;
  activeMeetups: number;
  nearbyUsers: number;
  gpsActive: boolean;
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
  nearbyEvents: Array<{
    id: string;
    name: string;
    type: string;
    distance: number;
    participants: number;
  }>;
}

export interface UserInsights {
  insights: string[];
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  performance: {
    bestCar: string | null;
    averageScore: number;
    totalCars: number;
    improvementAreas: string[];
  };
}

/**
 * Enhanced Race Stats Service with Week 4 Backend Integration
 */
export class RaceStatsService {
  /**
   * Get comprehensive user race statistics from backend
   */
  static async getUserRaceStats(): Promise<UserRaceStats> {
    try {
      // Fetch from backend user stats endpoint
      const response = await apiRequest<{
        sessions: any[];
        performance: any;
        overview: any;
      }>(API_CONFIG.ENDPOINTS.USER_STATS.OVERVIEW);
      
      // Process backend data into UserRaceStats format
      const sessions = response.sessions || [];
      const performance = response.performance || {};
      const overview = response.overview || {};
      
      // Calculate statistics from sessions data
      const totalSessions = sessions.length;
      const completedRaces = sessions.filter(s => s.isCompleted && s.sessionType === 'race');
      const wins = completedRaces.filter(s => s.position === 1).length;
      const winRate = completedRaces.length > 0 ? (wins / completedRaces.length) * 100 : 0;
      
      // Performance metrics
      const maxSpeed = performance.maxSpeed || 0;
      const averageSpeed = performance.averageSpeed || 0;
      const totalDistance = performance.totalDistance || 0;
      const totalTime = performance.totalTime || 0;
      
      // Recent activity
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const sessionsThisWeek = sessions.filter(s => 
        new Date(s.createdAt) >= oneWeekAgo
      ).length;
      
      const sessionsThisMonth = sessions.filter(s => 
        new Date(s.createdAt) >= oneMonthAgo
      ).length;
      
      const lastSession = sessions
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      
      // Recent performance analysis
      const recentSessions = sessions
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);
      
      const averageSpeedLast10 = recentSessions.length > 0
        ? recentSessions.reduce((sum, s) => sum + (s.performanceMetrics?.averageSpeed || 0), 0) / recentSessions.length
        : 0;
      
      // Calculate improvement trend
      const oldSessions = recentSessions.slice(5);
      const newSessions = recentSessions.slice(0, 5);
      const oldAvg = oldSessions.length > 0 
        ? oldSessions.reduce((sum, s) => sum + (s.performanceMetrics?.averageSpeed || 0), 0) / oldSessions.length
        : 0;
      const newAvg = newSessions.length > 0
        ? newSessions.reduce((sum, s) => sum + (s.performanceMetrics?.averageSpeed || 0), 0) / newSessions.length
        : 0;
      
      let improvementTrend: 'improving' | 'declining' | 'stable';
      if (newAvg > oldAvg * 1.05) improvementTrend = 'improving';
      else if (newAvg < oldAvg * 0.95) improvementTrend = 'declining';
      else improvementTrend = 'stable';
      
      return {
        totalSessions,
        totalRaces: completedRaces.length,
        wins,
        losses: completedRaces.length - wins,
        winRate,
        totalDistance,
        totalTime,
        maxSpeed,
        averageSpeed,
        bestZeroToSixty: performance.bestZeroToSixty || null,
        bestQuarterMile: performance.bestQuarterMile || null,
        sessionsThisWeek,
        sessionsThisMonth,
        lastRaceDate: lastSession ? lastSession.createdAt : null,
        recentPerformance: {
          averageSpeedLast10,
          improvementTrend,
          personalBests: performance.personalBests || 0,
        },
        globalRank: overview.globalRank || null,
        localRank: overview.localRank || null,
        achievements: overview.achievements || 0,
        experience: overview.experience || 0,
        level: overview.level || 1,
      };
    } catch (error) {
      console.warn('Backend stats unavailable, using fallback data:', error);
      
      // Fallback to mock data for development
      return {
        totalSessions: 15,
        totalRaces: 12,
        wins: 7,
        losses: 5,
        winRate: 58.3,
        totalDistance: 245.7,
        totalTime: 4320, // minutes
        maxSpeed: 156,
        averageSpeed: 89,
        bestZeroToSixty: 4.2,
        bestQuarterMile: 12.8,
        sessionsThisWeek: 3,
        sessionsThisMonth: 8,
        lastRaceDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        recentPerformance: {
          averageSpeedLast10: 92,
          improvementTrend: 'improving',
          personalBests: 3,
        },
        globalRank: 1247,
        localRank: 23,
        achievements: 12,
        experience: 2850,
        level: 8,
      };
    }
  }
  
  /**
   * Get live map statistics and nearby activity
   */
  static async getLiveMapStats(userLocation?: { latitude: number; longitude: number }): Promise<LiveMapStats> {
    try {
      if (!userLocation) {
        return {
          onlineFriends: 0,
          activeMeetups: 0,
          nearbyUsers: 0,
          gpsActive: false,
          userLocation: null,
          nearbyEvents: [],
        };
      }
      
      // Fetch live map data from backend
      const [playersResponse, eventsResponse, statusResponse] = await Promise.all([
        apiRequest<{ players: any[] }>(
          `${API_CONFIG.ENDPOINTS.LIVE_MAP.PLAYERS}?lat=${userLocation.latitude}&lng=${userLocation.longitude}&radius=25`
        ),
        apiRequest<{ events: any[] }>(
          `${API_CONFIG.ENDPOINTS.LIVE_MAP.EVENTS}?lat=${userLocation.latitude}&lng=${userLocation.longitude}&radius=25`
        ),
        apiRequest<{ gpsActive: boolean; onlineUsers: number }>(
          API_CONFIG.ENDPOINTS.LIVE_MAP.STATUS
        ).catch(() => ({ gpsActive: true, onlineUsers: 0 }))
      ]);
      
      const players = playersResponse.players || [];
      const events = eventsResponse.events || [];
      
      // Calculate statistics
      const onlineFriends = players.filter(p => p.isFriend && p.isOnline).length;
      const activeMeetups = events.filter(e => e.status === 'active' && e.type === 'meetup').length;
      const nearbyUsers = players.length;
      
      // Format nearby events
      const nearbyEvents = events.slice(0, 5).map(event => ({
        id: event.id,
        name: event.name,
        type: event.type,
        distance: event.distance || 0,
        participants: event.participants?.length || 0,
      }));
      
      return {
        onlineFriends,
        activeMeetups,
        nearbyUsers,
        gpsActive: statusResponse.gpsActive,
        userLocation,
        nearbyEvents,
      };
    } catch (error) {
      console.warn('Live map data unavailable, using fallback:', error);
      
      // Fallback data for development
      return {
        onlineFriends: Math.floor(Math.random() * 15) + 3,
        activeMeetups: Math.floor(Math.random() * 5) + 1,
        nearbyUsers: Math.floor(Math.random() * 20) + 5,
        gpsActive: userLocation !== undefined,
        userLocation: userLocation || null,
        nearbyEvents: [
          {
            id: 'event_1',
            name: 'Street Racing Meet',
            type: 'race',
            distance: 2.3,
            participants: 8,
          },
          {
            id: 'event_2', 
            name: 'Car Show Meetup',
            type: 'meetup',
            distance: 5.7,
            participants: 15,
          },
        ],
      };
    }
  }
  
  /**
   * Get AI-powered user insights and recommendations
   */
  static async getUserInsights(userId: string): Promise<UserInsights> {
    try {
      const response = await apiRequest<UserInsights>(
        API_CONFIG.ENDPOINTS.AI.USER_INSIGHTS(userId)
      );
      
      return response;
    } catch (error) {
      console.warn('AI insights unavailable, using fallback:', error);
      
      // Fallback insights for development
      return {
        insights: [
          'Your recent performance shows consistent improvement in average speed',
          'You have completed 15 racing sessions this month - great activity!',
          'Your best quarter mile time ranks in the top 25% locally',
        ],
        recommendations: [
          {
            type: 'performance',
            title: 'Upgrade Intake System',
            description: 'A cold air intake could improve your acceleration by 8-12%',
            priority: 'high',
          },
          {
            type: 'social',
            title: 'Join Local Meetup',
            description: 'There\'s an active car meetup 2.3 miles away with 8 participants',
            priority: 'medium',
          },
        ],
        performance: {
          bestCar: 'Honda Civic Type R',
          averageScore: 847,
          totalCars: 2,
          improvementAreas: ['Cornering Speed', 'Launch Technique'],
        },
      };
    }
  }
  
  /**
   * Update user presence and location for live features
   */
  static async updatePresence(location: { latitude: number; longitude: number }, status: string = 'online'): Promise<void> {
    try {
      await apiRequest(API_CONFIG.ENDPOINTS.LIVE_MAP.UPDATE_LOCATION, {
        method: 'POST',
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          status,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.warn('Failed to update presence:', error);
      // Fail silently for now
    }
  }
}