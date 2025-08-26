import { WebSocketServer, WebSocket } from 'ws';
import { prisma } from '../prisma.js';
import jwt from 'jsonwebtoken';
import { AuthenticatedUser } from '../middleware/auth.js';

export interface RaceParticipant {
  id: string;
  userId: string;
  username: string;
  vehicleId: string;
  currentPosition: {
    latitude: number;
    longitude: number;
    speed: number;
    heading: number;
    timestamp: number;
  };
  lapTimes: number[];
  currentLap: number;
  racePosition: number;
  isFinished: boolean;
  joinedAt: number;
  connection?: WebSocket;
}

export interface ActiveRace {
  id: string;
  name: string;
  hostId: string;
  startTime: number;
  endTime?: number;
  status: 'WAITING' | 'STARTING' | 'ACTIVE' | 'FINISHED' | 'CANCELLED';
  participants: Map<string, RaceParticipant>;
  route: {
    checkpoints: Array<{
      latitude: number;
      longitude: number;
      radius: number;
    }>;
    totalDistance: number;
    laps: number;
  };
  settings: {
    maxParticipants: number;
    vehicleRestrictions: string[];
    publicRace: boolean;
    entryFee?: number;
    prizePool?: number;
  };
}

export class RealTimeRaceManager {
  private static instance: RealTimeRaceManager;
  private wss: WebSocketServer;
  private activeRaces: Map<string, ActiveRace>;
  private userConnections: Map<string, WebSocket>;
  private raceUpdateInterval: NodeJS.Timeout | null = null;

  public static getInstance(): RealTimeRaceManager {
    if (!RealTimeRaceManager.instance) {
      RealTimeRaceManager.instance = new RealTimeRaceManager();
    }
    return RealTimeRaceManager.instance;
  }

  constructor() {
    this.activeRaces = new Map();
    this.userConnections = new Map();
    this.setupWebSocketServer();
  }

  private setupWebSocketServer() {
    this.wss = new WebSocketServer({
      port: parseInt(process.env.WS_PORT || '3001')
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    this.startRaceUpdateLoop();

    console.log(`WebSocket server started on port ${process.env.WS_PORT || '3001'}`);
  }

  private async verifyClient(info: any): Promise<boolean> {
    try {
      const token = new URL(info.req.url, 'http://localhost').searchParams.get('token');
      if (!token) return false;

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) return false;

      const decoded = jwt.verify(token, jwtSecret) as any;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, role: true }
      });

      return user !== null;
    } catch (error) {
      console.error('WebSocket auth error:', error);
      return false;
    }
  }

  private async handleConnection(ws: WebSocket, request: any) {
    try {
      const url = new URL(request.url, 'http://localhost');
      const token = url.searchParams.get('token');
      
      // If no token provided, allow basic ping/pong functionality
      if (!token) {
        console.log('Anonymous WebSocket connection established');
        
        ws.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            if (message.type === 'ping') {
              ws.send(JSON.stringify({
                type: 'pong',
                data: message.data,
                timestamp: Date.now()
              }));
            }
          } catch (error) {
            console.error('Anonymous message handling error:', error);
          }
        });
        
        ws.on('close', () => console.log('Anonymous WebSocket disconnected'));
        ws.on('error', (error) => console.error('Anonymous WebSocket error:', error));
        
        // Send welcome message
        ws.send(JSON.stringify({
          type: 'connected',
          message: 'Anonymous connection established',
          timestamp: Date.now()
        }));
        
        return;
      }

      // Authenticated connection handling
      const jwtSecret = process.env.JWT_SECRET!;
      const decoded = jwt.verify(token, jwtSecret) as any;
      const userId = decoded.sub; // Use 'sub' to match JWT structure

      // Store user connection
      this.userConnections.set(userId, ws);

      ws.on('message', (data) => this.handleMessage(userId, data));
      ws.on('close', () => this.handleDisconnection(userId));
      ws.on('error', (error) => console.error('WebSocket error:', error));

      // Send initial data
      this.sendToUser(userId, {
        type: 'connected',
        timestamp: Date.now()
      });

      console.log(`User ${userId} connected via WebSocket`);
    } catch (error) {
      console.error('Connection handling error:', error);
      ws.close(1011, 'Server error');
    }
  }

  private handleMessage(userId: string, data: any) {
    try {
      const message = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'join_race':
          this.handleJoinRace(userId, message.raceId, message.vehicleId);
          break;
        case 'leave_race':
          this.handleLeaveRace(userId, message.raceId);
          break;
        case 'position_update':
          this.handlePositionUpdate(userId, message);
          break;
        case 'ready_to_start':
          this.handleReadyToStart(userId, message.raceId);
          break;
        case 'finish_race':
          this.handleFinishRace(userId, message.raceId);
          break;
        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Message handling error:', error);
    }
  }

  private handleDisconnection(userId: string) {
    this.userConnections.delete(userId);
    
    // Remove user from active races
    for (const race of this.activeRaces.values()) {
      if (race.participants.has(userId)) {
        race.participants.delete(userId);
        this.broadcastToRace(race.id, {
          type: 'participant_left',
          userId,
          timestamp: Date.now()
        });
      }
    }

    console.log(`User ${userId} disconnected`);
  }

  // Race Management Methods
  public async createRace(hostId: string, raceData: any): Promise<string> {
    const raceId = `race_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const race: ActiveRace = {
      id: raceId,
      name: raceData.name,
      hostId,
      startTime: Date.now() + (raceData.startDelay || 30000), // 30 second default delay
      status: 'WAITING',
      participants: new Map(),
      route: raceData.route,
      settings: raceData.settings
    };

    this.activeRaces.set(raceId, race);

    // Save to database
    await prisma.race.create({
      data: {
        id: raceId,
        name: race.name,
        createdById: hostId,
        status: 'WAITING',
        startTime: new Date(race.startTime),
        raceType: 'circuit',
        maxParticipants: race.settings.maxParticipants || 8
      }
    });

    console.log(`Race created: ${raceId} by ${hostId}`);
    return raceId;
  }

  private async handleJoinRace(userId: string, raceId: string, vehicleId: string) {
    const race = this.activeRaces.get(raceId);
    if (!race) {
      this.sendToUser(userId, {
        type: 'error',
        message: 'Race not found'
      });
      return;
    }

    if (race.status !== 'WAITING') {
      this.sendToUser(userId, {
        type: 'error',
        message: 'Race already started'
      });
      return;
    }

    if (race.participants.size >= race.settings.maxParticipants) {
      this.sendToUser(userId, {
        type: 'error',
        message: 'Race is full'
      });
      return;
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { handle: true }
    });

    if (!user) {
      this.sendToUser(userId, {
        type: 'error',
        message: 'User not found'
      });
      return;
    }

    // Add participant
    const participant: RaceParticipant = {
      id: `${raceId}_${userId}`,
      userId,
      username: user.handle,
      vehicleId,
      currentPosition: {
        latitude: 0,
        longitude: 0,
        speed: 0,
        heading: 0,
        timestamp: Date.now()
      },
      lapTimes: [],
      currentLap: 0,
      racePosition: race.participants.size + 1,
      isFinished: false,
      joinedAt: Date.now(),
      connection: this.userConnections.get(userId)
    };

    race.participants.set(userId, participant);

    // Notify all participants
    this.broadcastToRace(raceId, {
      type: 'participant_joined',
      participant: {
        userId: participant.userId,
        username: participant.username,
        vehicleId: participant.vehicleId
      },
      totalParticipants: race.participants.size,
      timestamp: Date.now()
    });

    // Send race info to new participant
    this.sendToUser(userId, {
      type: 'race_joined',
      race: this.getRaceInfo(race),
      timestamp: Date.now()
    });

    console.log(`User ${userId} joined race ${raceId}`);
  }

  private handleLeaveRace(userId: string, raceId: string) {
    const race = this.activeRaces.get(raceId);
    if (!race) return;

    race.participants.delete(userId);

    this.broadcastToRace(raceId, {
      type: 'participant_left',
      userId,
      totalParticipants: race.participants.size,
      timestamp: Date.now()
    });

    // If host leaves, cancel race
    if (userId === race.hostId && race.status === 'WAITING') {
      this.cancelRace(raceId);
    }

    console.log(`User ${userId} left race ${raceId}`);
  }

  private handleReadyToStart(userId: string, raceId: string) {
    const race = this.activeRaces.get(raceId);
    if (!race || race.status !== 'WAITING') return;

    const participant = race.participants.get(userId);
    if (!participant) return;

    // Mark participant as ready
    this.broadcastToRace(raceId, {
      type: 'participant_ready',
      userId,
      timestamp: Date.now()
    });

    console.log(`User ${userId} is ready for race ${raceId}`);
  }

  private handlePositionUpdate(userId: string, message: any) {
    const { raceId, position } = message;
    const race = this.activeRaces.get(raceId);
    if (!race || race.status !== 'ACTIVE') return;

    const participant = race.participants.get(userId);
    if (!participant) return;

    // Update position
    participant.currentPosition = {
      latitude: position.latitude,
      longitude: position.longitude,
      speed: position.speed || 0,
      heading: position.heading || 0,
      timestamp: Date.now()
    };

    // Check for checkpoint/lap completion
    this.checkCheckpoints(race, participant);

    // Broadcast position to other participants
    this.broadcastToRace(raceId, {
      type: 'position_update',
      userId,
      position: participant.currentPosition,
      lap: participant.currentLap,
      racePosition: participant.racePosition
    }, [userId]); // Exclude sender
  }

  private checkCheckpoints(race: ActiveRace, participant: RaceParticipant) {
    const { checkpoints } = race.route;
    const { latitude, longitude } = participant.currentPosition;

    // Simple distance calculation (you'd want more sophisticated logic)
    for (let i = 0; i < checkpoints.length; i++) {
      const checkpoint = checkpoints[i];
      const distance = this.calculateDistance(
        latitude, longitude,
        checkpoint.latitude, checkpoint.longitude
      );

      if (distance <= checkpoint.radius) {
        // Checkpoint reached
        if (i === checkpoints.length - 1) {
          // Lap completed
          const lapTime = Date.now() - (participant.lapTimes.length === 0 
            ? race.startTime 
            : participant.lapTimes[participant.lapTimes.length - 1]);
          
          participant.lapTimes.push(lapTime);
          participant.currentLap++;

          this.broadcastToRace(race.id, {
            type: 'lap_completed',
            userId: participant.userId,
            lap: participant.currentLap,
            lapTime,
            totalTime: participant.lapTimes.reduce((sum, time) => sum + time, 0)
          });

          // Check if race is finished
          if (participant.currentLap >= race.route.laps) {
            this.handleFinishRace(participant.userId, race.id);
          }
        }
        break;
      }
    }
  }

  private handleFinishRace(userId: string, raceId: string) {
    const race = this.activeRaces.get(raceId);
    if (!race) return;

    const participant = race.participants.get(userId);
    if (!participant || participant.isFinished) return;

    participant.isFinished = true;
    const finishTime = Date.now();
    const totalTime = finishTime - race.startTime;

    // Calculate final position
    const finishedCount = Array.from(race.participants.values())
      .filter(p => p.isFinished).length;
    
    participant.racePosition = finishedCount;

    this.broadcastToRace(raceId, {
      type: 'participant_finished',
      userId,
      position: participant.racePosition,
      totalTime,
      timestamp: finishTime
    });

    // Check if all participants finished
    const allFinished = Array.from(race.participants.values())
      .every(p => p.isFinished);

    if (allFinished || finishedCount === 1) {
      this.endRace(raceId);
    }

    console.log(`User ${userId} finished race ${raceId} in position ${participant.racePosition}`);
  }

  private async endRace(raceId: string) {
    const race = this.activeRaces.get(raceId);
    if (!race) return;

    race.status = 'FINISHED';
    race.endTime = Date.now();

    // Calculate final results
    const results = Array.from(race.participants.values())
      .sort((a, b) => {
        if (a.isFinished && !b.isFinished) return -1;
        if (!a.isFinished && b.isFinished) return 1;
        if (a.isFinished && b.isFinished) return a.racePosition - b.racePosition;
        return a.currentLap - b.currentLap;
      })
      .map((p, index) => ({
        userId: p.userId,
        username: p.username,
        position: index + 1,
        lapTimes: p.lapTimes,
        totalTime: p.lapTimes.reduce((sum, time) => sum + time, 0),
        isFinished: p.isFinished
      }));

    // Save results to database
    await prisma.race.update({
      where: { id: raceId },
      data: {
        status: 'completed',
        endTime: new Date(race.endTime!)
      }
    });

    // Broadcast final results
    this.broadcastToRace(raceId, {
      type: 'race_finished',
      results,
      totalDuration: race.endTime! - race.startTime,
      timestamp: race.endTime
    });

    // Clean up after delay
    setTimeout(() => {
      this.activeRaces.delete(raceId);
    }, 60000); // Keep for 1 minute for final data

    console.log(`Race ${raceId} ended`);
  }

  private cancelRace(raceId: string) {
    const race = this.activeRaces.get(raceId);
    if (!race) return;

    race.status = 'CANCELLED';

    this.broadcastToRace(raceId, {
      type: 'race_cancelled',
      timestamp: Date.now()
    });

    this.activeRaces.delete(raceId);
    console.log(`Race ${raceId} cancelled`);
  }

  // Utility Methods
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  private sendToUser(userId: string, message: any) {
    const connection = this.userConnections.get(userId);
    if (connection && connection.readyState === WebSocket.OPEN) {
      connection.send(JSON.stringify(message));
    }
  }

  private broadcastToRace(raceId: string, message: any, excludeUsers: string[] = []) {
    const race = this.activeRaces.get(raceId);
    if (!race) return;

    for (const [userId] of race.participants) {
      if (!excludeUsers.includes(userId)) {
        this.sendToUser(userId, message);
      }
    }
  }

  private getRaceInfo(race: ActiveRace) {
    return {
      id: race.id,
      name: race.name,
      hostId: race.hostId,
      status: race.status,
      startTime: race.startTime,
      endTime: race.endTime,
      participants: Array.from(race.participants.values()).map(p => ({
        userId: p.userId,
        username: p.username,
        vehicleId: p.vehicleId,
        currentLap: p.currentLap,
        racePosition: p.racePosition,
        isFinished: p.isFinished
      })),
      route: race.route,
      settings: race.settings
    };
  }

  private startRaceUpdateLoop() {
    this.raceUpdateInterval = setInterval(() => {
      for (const race of this.activeRaces.values()) {
        if (race.status === 'WAITING' && Date.now() >= race.startTime) {
          this.startRace(race.id);
        }
      }
    }, 1000);
  }

  private startRace(raceId: string) {
    const race = this.activeRaces.get(raceId);
    if (!race || race.participants.size === 0) {
      this.cancelRace(raceId);
      return;
    }

    race.status = 'ACTIVE';
    race.startTime = Date.now(); // Update actual start time

    this.broadcastToRace(raceId, {
      type: 'race_started',
      startTime: race.startTime,
      timestamp: Date.now()
    });

    console.log(`Race ${raceId} started with ${race.participants.size} participants`);
  }

  // Public API methods
  public getActiveRaces(): ActiveRace[] {
    return Array.from(this.activeRaces.values());
  }

  public getRace(raceId: string): ActiveRace | undefined {
    return this.activeRaces.get(raceId);
  }

  public getParticipantCount(raceId: string): number {
    const race = this.activeRaces.get(raceId);
    return race ? race.participants.size : 0;
  }

  public async shutdown() {
    if (this.raceUpdateInterval) {
      clearInterval(this.raceUpdateInterval);
    }
    
    this.wss.close();
    console.log('RealTimeRaceManager shutdown complete');
  }
}

export default RealTimeRaceManager;