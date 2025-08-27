import { createClient } from '@supabase/supabase-js';
import { Race, PerformanceMetrics, GPSCoordinate } from '../types/racing';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface RaceSessionData {
  raceId?: string;
  carId?: string;
  sessionType?: 'practice' | 'qualifying' | 'race';
  routeData: GPSCoordinate[];
  performanceMetrics?: PerformanceMetrics;
  startTime: string;
  endTime?: string;
}

interface RaceSession {
  id: string;
  raceId?: string;
  carId?: string;
  car?: any;
  race?: any;
  startTime: string;
  endTime?: string;
  isCompleted: boolean;
  sessionType: string;
  performanceMetrics: PerformanceMetrics;
  routeData: GPSCoordinate[];
  createdAt: string;
}

interface RaceStats {
  totalSessions: number;
  totalDistance: number;
  maxSpeed: number;
  averageSpeed: number;
  bestZeroToSixty: number | null;
  bestQuarterMile: number | null;
  sessionsThisMonth: number;
}

export class SupabaseRaceService {
  
  private static async getCurrentUserId(): Promise<string> {
    const userStr = await AsyncStorage.getItem('user');
    if (!userStr) {
      throw new Error('Authentication required');
    }
    
    const userData = JSON.parse(userStr);
    return userData.id || userData.user?.id;
  }

  static async saveRaceSession(sessionData: RaceSessionData): Promise<{ success: boolean; sessionId: string }> {
    try {
      const userId = await this.getCurrentUserId();
      
      // Create race session record
      const { data: sessionRecord, error: sessionError } = await supabase
        .from('race_sessions')
        .insert({
          user_id: userId,
          car_id: sessionData.carId,
          race_id: sessionData.raceId,
          start_time: sessionData.startTime,
          end_time: sessionData.endTime,
          session_type: sessionData.sessionType || 'practice',
          is_completed: !!sessionData.endTime,
          total_distance: sessionData.performanceMetrics?.totalDistance,
          max_speed: sessionData.performanceMetrics?.topSpeed,
          average_speed: sessionData.performanceMetrics?.averageSpeed,
          zero_to_sixty: sessionData.performanceMetrics?.zeroToSixty,
          quarter_mile: sessionData.performanceMetrics?.quarterMile,
          half_mile: sessionData.performanceMetrics?.halfMile,
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Session save error:', sessionError);
        throw new Error(sessionError.message);
      }

      // Save GPS points if we have route data
      if (sessionData.routeData && sessionData.routeData.length > 0) {
        const gpsPoints = sessionData.routeData.map((point, index) => ({
          session_id: sessionRecord.id,
          latitude: point.latitude,
          longitude: point.longitude,
          altitude: point.altitude || null,
          timestamp: point.timestamp || new Date().toISOString(),
          accuracy: point.accuracy || null,
          speed: point.speed || null,
          heading: point.heading || null,
          sequence_index: index,
        }));

        const { error: gpsError } = await supabase
          .from('gps_points')
          .insert(gpsPoints);

        if (gpsError) {
          console.error('GPS points save error:', gpsError);
          // Don't fail the session save if GPS points fail
        }
      }

      return { success: true, sessionId: sessionRecord.id };
    } catch (error) {
      console.error('Save race session error:', error);
      throw error;
    }
  }

  static async loadRaceSession(sessionId: string): Promise<RaceSession> {
    try {
      const userId = await this.getCurrentUserId();
      
      // Get session with related data
      const { data: session, error: sessionError } = await supabase
        .from('race_sessions')
        .select(`
          *,
          cars(*),
          races(*),
          gps_points(*)
        `)
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single();

      if (sessionError) {
        throw new Error(sessionError.message);
      }

      // Transform to expected format
      const routeData: GPSCoordinate[] = (session.gps_points || [])
        .sort((a: any, b: any) => a.sequence_index - b.sequence_index)
        .map((point: any) => ({
          latitude: point.latitude,
          longitude: point.longitude,
          altitude: point.altitude,
          timestamp: point.timestamp,
          accuracy: point.accuracy,
          speed: point.speed,
          heading: point.heading,
        }));

      const performanceMetrics: PerformanceMetrics = {
        totalDistance: session.total_distance || 0,
        topSpeed: session.max_speed || 0,
        averageSpeed: session.average_speed || 0,
        zeroToSixty: session.zero_to_sixty || 0,
        quarterMile: session.quarter_mile || 0,
        halfMile: session.half_mile || 0,
        lapTimes: [],
        gForces: {
          max: 0,
          average: 0,
          lateral: 0,
        },
      };

      return {
        id: session.id,
        raceId: session.race_id,
        carId: session.car_id,
        car: session.cars,
        race: session.races,
        startTime: session.start_time,
        endTime: session.end_time,
        isCompleted: session.is_completed,
        sessionType: session.session_type,
        performanceMetrics,
        routeData,
        createdAt: session.created_at,
      };
    } catch (error) {
      console.error('Load race session error:', error);
      throw error;
    }
  }

  static async getUserRaceSessions(): Promise<RaceSession[]> {
    try {
      const userId = await this.getCurrentUserId();
      
      const { data: sessions, error } = await supabase
        .from('race_sessions')
        .select(`
          *,
          cars(*),
          races(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return sessions.map((session: any) => ({
        id: session.id,
        raceId: session.race_id,
        carId: session.car_id,
        car: session.cars,
        race: session.races,
        startTime: session.start_time,
        endTime: session.end_time,
        isCompleted: session.is_completed,
        sessionType: session.session_type,
        performanceMetrics: {
          totalDistance: session.total_distance || 0,
          maxSpeed: session.max_speed || 0,
          averageSpeed: session.average_speed || 0,
          zeroToSixty: session.zero_to_sixty,
          quarterMile: session.quarter_mile,
          halfMile: session.half_mile,
          performanceScore: session.performance_score || 0,
        },
        routeData: [], // Load separately if needed
        createdAt: session.created_at,
      }));
    } catch (error) {
      console.error('Get user race sessions error:', error);
      throw error;
    }
  }

  static async updateRaceSession(sessionId: string, data: Partial<RaceSessionData>): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      
      const updateData: any = {};
      if (data.endTime) updateData.end_time = data.endTime;
      if (data.performanceMetrics) {
        updateData.total_distance = data.performanceMetrics.totalDistance;
        updateData.max_speed = data.performanceMetrics.maxSpeed;
        updateData.average_speed = data.performanceMetrics.averageSpeed;
        updateData.zero_to_sixty = data.performanceMetrics.zeroToSixty;
        updateData.quarter_mile = data.performanceMetrics.quarterMile;
        updateData.half_mile = data.performanceMetrics.halfMile;
        updateData.performance_score = data.performanceMetrics.performanceScore;
      }
      if (data.endTime) updateData.is_completed = true;

      const { error } = await supabase
        .from('race_sessions')
        .update(updateData)
        .eq('id', sessionId)
        .eq('user_id', userId);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Update race session error:', error);
      throw error;
    }
  }

  static async deleteRaceSession(sessionId: string): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      
      // Delete GPS points first
      await supabase
        .from('gps_points')
        .delete()
        .eq('session_id', sessionId);
      
      // Delete session
      const { error } = await supabase
        .from('race_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', userId);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Delete race session error:', error);
      throw error;
    }
  }

  static async getUserRaceStats(): Promise<RaceStats> {
    try {
      const userId = await this.getCurrentUserId();
      
      const { data: sessions, error } = await supabase
        .from('race_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_completed', true);

      if (error) {
        throw new Error(error.message);
      }

      const stats: RaceStats = {
        totalSessions: sessions.length,
        totalDistance: sessions.reduce((sum, s) => sum + (s.total_distance || 0), 0),
        maxSpeed: Math.max(...sessions.map(s => s.max_speed || 0), 0),
        averageSpeed: sessions.length > 0 
          ? sessions.reduce((sum, s) => sum + (s.average_speed || 0), 0) / sessions.length 
          : 0,
        bestZeroToSixty: sessions
          .filter(s => s.zero_to_sixty)
          .reduce((best, s) => best === null || s.zero_to_sixty < best ? s.zero_to_sixty : best, null as number | null),
        bestQuarterMile: sessions
          .filter(s => s.quarter_mile)
          .reduce((best, s) => best === null || s.quarter_mile < best ? s.quarter_mile : best, null as number | null),
        sessionsThisMonth: sessions.filter(s => {
          const sessionDate = new Date(s.created_at);
          const now = new Date();
          return sessionDate.getMonth() === now.getMonth() && sessionDate.getFullYear() === now.getFullYear();
        }).length,
      };

      return stats;
    } catch (error) {
      console.error('Get user race stats error:', error);
      throw error;
    }
  }

  // Race management functions
  static async createRace(raceData: Partial<Race>): Promise<Race> {
    try {
      const userId = await this.getCurrentUserId();
      
      const { data, error } = await supabase
        .from('races')
        .insert({
          created_by_id: userId,
          name: raceData.name,
          race_type: raceData.type,
          start_time: raceData.startTime,
          end_time: raceData.endTime,
          location_name: raceData.location?.name,
          location_address: raceData.location?.address,
          location_lat: raceData.location?.coordinates?.latitude,
          location_lon: raceData.location?.coordinates?.longitude,
          max_participants: raceData.maxParticipants || 8,
          entry_fee: raceData.entryFee || 0,
          prize_payout: raceData.prizePayout || 0,
          distance: raceData.distance,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        id: data.id,
        name: data.name,
        type: data.race_type,
        status: data.status,
        startTime: data.start_time,
        endTime: data.end_time,
        location: {
          name: data.location_name,
          address: data.location_address,
          coordinates: {
            latitude: data.location_lat,
            longitude: data.location_lon,
          },
        },
        maxParticipants: data.max_participants,
        entryFee: data.entry_fee,
        prizePayout: data.prize_payout,
        distance: data.distance,
        createdBy: data.created_by_id,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Create race error:', error);
      throw error;
    }
  }

  static async getAvailableRaces(): Promise<Race[]> {
    try {
      const { data: races, error } = await supabase
        .from('races')
        .select('*')
        .in('status', ['pending', 'active'])
        .order('start_time');

      if (error) {
        throw new Error(error.message);
      }

      return races.map((race: any) => ({
        id: race.id,
        name: race.name,
        type: race.race_type,
        status: race.status,
        startTime: race.start_time,
        endTime: race.end_time,
        location: {
          name: race.location_name,
          address: race.location_address,
          coordinates: {
            latitude: race.location_lat,
            longitude: race.location_lon,
          },
        },
        maxParticipants: race.max_participants,
        entryFee: race.entry_fee,
        prizePayout: race.prize_payout,
        distance: race.distance,
        createdBy: race.created_by_id,
        createdAt: race.created_at,
      }));
    } catch (error) {
      console.error('Get available races error:', error);
      throw error;
    }
  }

  static async joinRace(raceId: string, carId: string): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      
      const { error } = await supabase
        .from('race_participants')
        .insert({
          race_id: raceId,
          racer_id: userId,
          car_id: carId,
        });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Join race error:', error);
      throw error;
    }
  }
}