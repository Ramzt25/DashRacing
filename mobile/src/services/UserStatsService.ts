import { ApiService } from './ApiService';

// Add a generic API helper since ApiService doesn't have a get method
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.168.28:4000/api';
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get auth token from AsyncStorage
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  const user = await AsyncStorage.getItem('user');
  const token = user ? JSON.parse(user).token : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response;
}

export interface UserStats {
  totalRaces: number;
  wins: number;
  winRate: number;
  bestLapTime: string;
  totalDistance: number;
  favoriteTrack: string;
  averageSpeed: number;
  totalCars: number;
  totalMods: number;
  performanceScore: number;
  achievements: Achievement[];
  weeklyProgress: WeeklyProgress[];
  recentActivity: RecentActivity[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  category: 'racing' | 'garage' | 'social' | 'performance';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface WeeklyProgress {
  week: string;
  races: number;
  distance: number;
  improvements: number;
}

export interface RecentActivity {
  id: string;
  type: 'race' | 'mod' | 'achievement' | 'meetup';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
}

export class UserStatsService {
  /**
   * Get comprehensive user statistics
   */
  static async getUserStats(userId: string, authToken: string): Promise<UserStats> {
    try {
      // Try to get real stats from backend
      const response = await fetchWithAuth(`/users/${userId}/stats`);

      if (response.ok) {
        return await response.json() as UserStats;
      }

      // If backend call fails, check for cached data
      const cachedStats = await this.getCachedStats(userId);
      if (cachedStats) {
        return cachedStats;
      }
    } catch (error) {
      console.warn('Failed to fetch user stats from backend, using fallback:', error);
    }

    // Fallback to local/demo statistics with realistic data
    return this.generateDemoStats(userId);
  }

  /**
   * Get race statistics specifically
   */
  static async getRaceStats(userId: string, authToken: string): Promise<{
    totalRaces: number;
    wins: number;
    losses: number;
    winRate: number;
    bestLapTime: string;
    averageLapTime: string;
    totalDistance: number;
    favoriteTrack: string;
    recentRaces: any[];
  }> {
    try {
      const response = await fetchWithAuth(`/users/${userId}/race-stats`);

      if (response.ok) {
        return await response.json() as {
          totalRaces: number;
          wins: number;
          losses: number;
          winRate: number;
          bestLapTime: string;
          averageLapTime: string;
          totalDistance: number;
          favoriteTrack: string;
          recentRaces: any[];
        };
      }
    } catch (error) {
      console.warn('Failed to fetch race stats, using demo data:', error);
    }

    // Demo race statistics
    const totalRaces = Math.floor(Math.random() * 50) + 10;
    const wins = Math.floor(totalRaces * (0.3 + Math.random() * 0.4)); // 30-70% win rate
    const winRate = Math.round((wins / totalRaces) * 100);

    return {
      totalRaces,
      wins,
      losses: totalRaces - wins,
      winRate,
      bestLapTime: this.generateLapTime(85, 95), // Fast lap time
      averageLapTime: this.generateLapTime(95, 110), // Average lap time
      totalDistance: Math.round((Math.random() * 500 + 100) * 10) / 10, // 100-600 miles
      favoriteTrack: ['Sunset Strip', 'Downtown Circuit', 'Highway 1', 'Industrial District'][Math.floor(Math.random() * 4)],
      recentRaces: this.generateRecentRaces(5),
    };
  }

  /**
   * Get garage/vehicle statistics
   */
  static async getGarageStats(userId: string, authToken: string): Promise<{
    totalCars: number;
    totalMods: number;
    totalValue: number;
    averagePerformance: number;
    favoriteManufacturer: string;
    newestCar: any;
    highestPerformanceCar: any;
  }> {
    try {
      const response = await fetchWithAuth(`/users/${userId}/garage-stats`);

      if (response.ok) {
        return await response.json() as {
          totalCars: number;
          totalMods: number;
          totalValue: number;
          averagePerformance: number;
          favoriteManufacturer: string;
          newestCar: any;
          highestPerformanceCar: any;
        };
      }
    } catch (error) {
      console.warn('Failed to fetch garage stats, using demo data:', error);
    }

    // Demo garage statistics
    const totalCars = Math.floor(Math.random() * 8) + 1; // 1-8 cars
    const totalMods = totalCars * (Math.floor(Math.random() * 5) + 2); // 2-6 mods per car
    const manufacturers = ['Honda', 'Toyota', 'Ford', 'Chevrolet', 'BMW', 'Audi', 'Nissan', 'Subaru'];

    return {
      totalCars,
      totalMods,
      totalValue: Math.floor(Math.random() * 150000) + 25000, // $25k-$175k
      averagePerformance: Math.floor(Math.random() * 200) + 300, // 300-500 score
      favoriteManufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
      newestCar: {
        make: manufacturers[Math.floor(Math.random() * manufacturers.length)],
        model: 'Model X',
        year: 2023,
        addedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Within last 30 days
      },
      highestPerformanceCar: {
        make: manufacturers[Math.floor(Math.random() * manufacturers.length)],
        model: 'Performance Model',
        performanceScore: Math.floor(Math.random() * 100) + 450, // 450-550 score
      },
    };
  }

  /**
   * Get achievement statistics
   */
  static async getAchievements(userId: string, authToken: string): Promise<Achievement[]> {
    try {
      const response = await fetchWithAuth(`/users/${userId}/achievements`);

      if (response.ok) {
        return await response.json() as Achievement[];
      }
    } catch (error) {
      console.warn('Failed to fetch achievements, using demo data:', error);
    }

    // Demo achievements
    const allAchievements = [
      {
        id: 'first_race',
        title: 'First Victory',
        description: 'Win your first race',
        icon: '',
        category: 'racing' as const,
        rarity: 'common' as const,
      },
      {
        id: 'speed_demon',
        title: 'Speed Demon',
        description: 'Reach 150 MPH in a race',
        icon: '',
        category: 'racing' as const,
        rarity: 'rare' as const,
      },
      {
        id: 'car_collector',
        title: 'Car Collector',
        description: 'Own 5 different vehicles',
        icon: '',
        category: 'garage' as const,
        rarity: 'epic' as const,
      },
      {
        id: 'mod_master',
        title: 'Modification Master',
        description: 'Install 25 modifications',
        icon: '',
        category: 'garage' as const,
        rarity: 'rare' as const,
      },
      {
        id: 'social_butterfly',
        title: 'Social Butterfly',
        description: 'Join 10 meetups',
        icon: '👥',
        category: 'social' as const,
        rarity: 'common' as const,
      },
      {
        id: 'performance_king',
        title: 'Performance King',
        description: 'Achieve 500+ performance score',
        icon: '👑',
        category: 'performance' as const,
        rarity: 'legendary' as const,
      },
    ];

    // Return random subset of achievements as "unlocked"
    const numUnlocked = Math.floor(Math.random() * allAchievements.length) + 1;
    const unlockedAchievements = allAchievements
      .sort(() => Math.random() - 0.5)
      .slice(0, numUnlocked)
      .map(achievement => ({
        ...achievement,
        unlockedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Within last 90 days
      }));

    return unlockedAchievements;
  }

  /**
   * Get weekly progress data for charts
   */
  static async getWeeklyProgress(userId: string, authToken: string): Promise<WeeklyProgress[]> {
    try {
      const response = await fetchWithAuth(`/users/${userId}/weekly-progress`);

      if (response.ok) {
        return await response.json() as WeeklyProgress[];
      }
    } catch (error) {
      console.warn('Failed to fetch weekly progress, using demo data:', error);
    }

    // Generate demo weekly progress for last 8 weeks
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 7));
      
      weeks.push({
        week: `Week ${8 - i}`,
        races: Math.floor(Math.random() * 8) + 1, // 1-8 races per week
        distance: Math.round((Math.random() * 50 + 10) * 10) / 10, // 10-60 miles
        improvements: Math.floor(Math.random() * 5), // 0-4 improvements
      });
    }

    return weeks;
  }

  /**
   * Get recent activity feed
   */
  static async getRecentActivity(userId: string, authToken: string, limit: number = 10): Promise<RecentActivity[]> {
    try {
      const response = await fetchWithAuth(`/users/${userId}/recent-activity?limit=${limit}`);

      if (response.ok) {
        return await response.json() as RecentActivity[];
      }
    } catch (error) {
      console.warn('Failed to fetch recent activity, using demo data:', error);
    }

    // Demo recent activities
    const activities = [
      {
        id: '1',
        type: 'race' as const,
        title: 'Won Street Race',
        description: 'Victory on Sunset Strip',
        icon: '',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: '2',
        type: 'mod' as const,
        title: 'Installed Cold Air Intake',
        description: '+15 HP to Honda Civic',
        icon: '',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      },
      {
        id: '3',
        type: 'achievement' as const,
        title: 'Speed Demon Unlocked',
        description: 'Reached 150 MPH in race',
        icon: '',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        id: '4',
        type: 'meetup' as const,
        title: 'Joined Car Meet',
        description: 'Downtown parking garage meetup',
        icon: '👥',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        id: '5',
        type: 'race' as const,
        title: 'Participated in Drag Race',
        description: 'Quarter mile time: 12.8s',
        icon: '',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
    ];

    return activities.slice(0, limit);
  }

  /**
   * Cache stats locally for offline access
   */
  private static async cacheStats(userId: string, stats: UserStats): Promise<void> {
    try {
      // In a real app, this would use AsyncStorage or similar
      // For now, just store in memory
      this.statsCache.set(userId, {
        stats,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.warn('Failed to cache stats:', error);
    }
  }

  /**
   * Get cached stats if available and recent
   */
  private static async getCachedStats(userId: string): Promise<UserStats | null> {
    try {
      const cached = this.statsCache.get(userId);
      if (cached && (Date.now() - cached.timestamp) < 5 * 60 * 1000) { // 5 minutes
        return cached.stats;
      }
    } catch (error) {
      console.warn('Failed to get cached stats:', error);
    }
    return null;
  }

  /**
   * Generate realistic demo statistics
   */
  private static generateDemoStats(userId: string): UserStats {
    const totalRaces = Math.floor(Math.random() * 50) + 10;
    const wins = Math.floor(totalRaces * (0.3 + Math.random() * 0.4));
    const totalCars = Math.floor(Math.random() * 8) + 1;
    
    return {
      totalRaces,
      wins,
      winRate: Math.round((wins / totalRaces) * 100),
      bestLapTime: this.generateLapTime(85, 95),
      totalDistance: Math.round((Math.random() * 500 + 100) * 10) / 10,
      favoriteTrack: 'Sunset Strip',
      averageSpeed: Math.floor(Math.random() * 20) + 80, // 80-100 MPH
      totalCars,
      totalMods: totalCars * (Math.floor(Math.random() * 5) + 2),
      performanceScore: Math.floor(Math.random() * 200) + 300,
      achievements: [],
      weeklyProgress: [],
      recentActivity: [],
    };
  }

  /**
   * Generate realistic lap times
   */
  private static generateLapTime(minSeconds: number, maxSeconds: number): string {
    const totalSeconds = Math.random() * (maxSeconds - minSeconds) + minSeconds;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = (totalSeconds % 60).toFixed(2);
    return `${minutes}:${seconds.padStart(5, '0')}`;
  }

  /**
   * Generate recent race data
   */
  private static generateRecentRaces(count: number): any[] {
    const tracks = ['Sunset Strip', 'Downtown Circuit', 'Highway 1', 'Industrial District'];
    const races = [];
    
    for (let i = 0; i < count; i++) {
      races.push({
        id: `race_${i}`,
        track: tracks[Math.floor(Math.random() * tracks.length)],
        result: Math.random() > 0.5 ? 'win' : 'loss',
        lapTime: this.generateLapTime(90, 120),
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last week
      });
    }
    
    return races;
  }

  // In-memory cache for stats (in production, use proper storage)
  private static statsCache = new Map<string, {
    stats: UserStats;
    timestamp: number;
  }>();
}
