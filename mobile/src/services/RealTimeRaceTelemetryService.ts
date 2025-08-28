// Week 7 - Real-time Race Telemetry Service
// Live speed, position, and race data streaming during active races

interface RaceTelemetryData {
  raceId: string;
  participantId: string;
  timestamp: number;
  position: {
    latitude: number;
    longitude: number;
    altitude?: number;
    accuracy: number;
  };
  speed: number; // m/s
  heading: number; // degrees
  lapTime?: number; // milliseconds
  currentLap?: number;
  totalLaps?: number;
  raceProgress: number; // 0-100%
  distanceTraveled: number; // meters
  currentRank: number;
  splitTimes?: number[];
  sectorTimes?: number[];
}

interface RaceParticipant {
  id: string;
  username: string;
  vehicle: {
    make: string;
    model: string;
    year: number;
    color: string;
  };
  currentPosition: {
    latitude: number;
    longitude: number;
  };
  speed: number;
  heading: number;
  rank: number;
  lapTime: number;
  bestLapTime?: number;
  status: 'ready' | 'racing' | 'finished' | 'dnf';
  raceProgress: number;
}

interface LiveRace {
  id: string;
  title: string;
  type: 'drag_race' | 'circuit_race' | 'time_trial' | 'drift_competition';
  status: 'starting' | 'active' | 'finished' | 'cancelled';
  startTime: Date;
  duration: number;
  participants: RaceParticipant[];
  route?: Array<{ latitude: number; longitude: number }>;
  leaderboard: Array<{
    rank: number;
    participantId: string;
    username: string;
    time: number;
    speed: number;
    status: string;
  }>;
  raceDistance: number;
  currentLap?: number;
  totalLaps?: number;
}

class RealTimeRaceTelemetryService {
  private static wsConnection: WebSocket | null = null;
  private static currentRace: LiveRace | null = null;
  private static telemetryInterval: any = null;
  private static apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

  // Initialize WebSocket connection for real-time race data
  static async initializeRaceConnection(raceId: string): Promise<boolean> {
    try {
      const wsUrl = this.apiBaseUrl.replace('http', 'ws') + `/ws/race/${raceId}`;
      
      // Use React Native WebSocket implementation
      this.wsConnection = new (global as any).WebSocket(wsUrl);

      if (this.wsConnection) {
        this.wsConnection.onopen = () => {
          console.log(' Race telemetry WebSocket connected');
          this.startTelemetryStream();
        };

        this.wsConnection.onmessage = (event: any) => {
          this.handleTelemetryUpdate(JSON.parse(event.data));
        };

        this.wsConnection.onerror = (error: any) => {
          console.error('TELEMETRY_ERROR Race telemetry WebSocket error:', error);
        };

        this.wsConnection.onclose = () => {
          console.log(' Race telemetry WebSocket disconnected');
          this.stopTelemetryStream();
        };
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize race connection:', error);
      return false;
    }
  }

  // Start sending telemetry data every 100ms during active race
  private static startTelemetryStream(): void {
    this.telemetryInterval = setInterval(() => {
      this.sendTelemetryData();
    }, 100); // 10 FPS telemetry
  }

  // Stop telemetry stream
  private static stopTelemetryStream(): void {
    if (this.telemetryInterval) {
      clearInterval(this.telemetryInterval);
      this.telemetryInterval = null;
    }
  }

  // Send current telemetry data
  private static async sendTelemetryData(): Promise<void> {
    if (!this.wsConnection || !this.currentRace) return;

    try {
      // Get current GPS position and speed
      const location = await this.getCurrentLocation();
      if (!location) return;

      const telemetryData: RaceTelemetryData = {
        raceId: this.currentRace.id,
        participantId: 'current_user', // TODO: Get from auth context
        timestamp: Date.now(),
        position: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          altitude: location.coords.altitude || 0,
          accuracy: location.coords.accuracy,
        },
        speed: location.coords.speed || 0,
        heading: location.coords.heading || 0,
        raceProgress: this.calculateRaceProgress(location),
        distanceTraveled: this.calculateDistanceTraveled(),
        currentRank: this.getCurrentRank(),
      };

      // Send via WebSocket
      if (this.wsConnection.readyState === WebSocket.OPEN) {
        this.wsConnection.send(JSON.stringify({
          type: 'telemetry',
          data: telemetryData
        }));
      }
    } catch (error) {
      console.error('Failed to send telemetry data:', error);
    }
  }

  // Handle incoming telemetry updates from other participants
  private static handleTelemetryUpdate(message: any): void {
    switch (message.type) {
      case 'race_update':
        this.updateRaceState(message.data);
        break;
      case 'participant_update':
        this.updateParticipant(message.data);
        break;
      case 'leaderboard_update':
        this.updateLeaderboard(message.data);
        break;
      case 'race_finished':
        this.handleRaceFinished(message.data);
        break;
    }
  }

  // Get live race data for active race
  static async getLiveRaceData(raceId: string): Promise<LiveRace | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/races/${raceId}/live`);
      if (!response.ok) return null;
      
      const raceData = await response.json() as LiveRace;
      this.currentRace = raceData;
      return raceData;
    } catch (error) {
      console.error('Failed to get live race data:', error);
      return null;
    }
  }

  // Join a live race
  static async joinLiveRace(raceId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/races/${raceId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add auth header
        },
      });

      if (response.ok) {
        await this.initializeRaceConnection(raceId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to join live race:', error);
      return false;
    }
  }

  // Leave live race
  static async leaveLiveRace(): Promise<void> {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    this.stopTelemetryStream();
    this.currentRace = null;
  }

  // Get current GPS location
  private static async getCurrentLocation(): Promise<any> {
    // TODO: Integrate with actual location service
    // This would use expo-location in real implementation
    return new Promise((resolve) => {
      // Mock location for development
      resolve({
        coords: {
          latitude: 30.2672 + (Math.random() - 0.5) * 0.01, // Austin area
          longitude: -97.7431 + (Math.random() - 0.5) * 0.01,
          speed: Math.random() * 30, // 0-30 m/s (0-67 mph)
          heading: Math.random() * 360,
          accuracy: 5,
          altitude: 200,
        }
      });
    });
  }

  // Calculate race progress percentage
  private static calculateRaceProgress(location: any): number {
    if (!this.currentRace || !this.currentRace.route) return 0;
    
    // TODO: Calculate actual progress based on route waypoints
    // For now, return a mock value
    return Math.min(100, (Date.now() - new Date(this.currentRace.startTime).getTime()) / (this.currentRace.duration * 1000) * 100);
  }

  // Calculate total distance traveled
  private static calculateDistanceTraveled(): number {
    // TODO: Track actual distance based on GPS points
    return Math.random() * 5000; // Mock 0-5km
  }

  // Get current rank in race
  private static getCurrentRank(): number {
    if (!this.currentRace) return 1;
    // TODO: Calculate based on actual race progress
    return Math.floor(Math.random() * this.currentRace.participants.length) + 1;
  }

  // Update race state from WebSocket
  private static updateRaceState(data: any): void {
    if (this.currentRace) {
      this.currentRace = { ...this.currentRace, ...data };
    }
  }

  // Update participant data
  private static updateParticipant(data: any): void {
    if (!this.currentRace) return;
    
    const participantIndex = this.currentRace.participants.findIndex(p => p.id === data.id);
    if (participantIndex >= 0) {
      this.currentRace.participants[participantIndex] = { ...this.currentRace.participants[participantIndex], ...data };
    }
  }

  // Update leaderboard
  private static updateLeaderboard(data: any): void {
    if (this.currentRace) {
      this.currentRace.leaderboard = data;
    }
  }

  // Handle race finished
  private static handleRaceFinished(data: any): void {
    console.log(' Race finished!', data);
    this.leaveLiveRace();
  }

  // Get current race state
  static getCurrentRace(): LiveRace | null {
    return this.currentRace;
  }

  // Get live leaderboard
  static getLiveLeaderboard(): Array<any> {
    return this.currentRace?.leaderboard || [];
  }

  // Get race statistics
  static getRaceStatistics(): any {
    if (!this.currentRace) return null;

    return {
      totalParticipants: this.currentRace.participants.length,
      activeRacers: this.currentRace.participants.filter(p => p.status === 'racing').length,
      averageSpeed: this.currentRace.participants.reduce((sum, p) => sum + p.speed, 0) / this.currentRace.participants.length,
      fastestLap: Math.min(...this.currentRace.participants.map(p => p.bestLapTime || Infinity)),
      raceProgress: this.currentRace.participants.reduce((sum, p) => sum + p.raceProgress, 0) / this.currentRace.participants.length,
    };
  }
}

export default RealTimeRaceTelemetryService;
