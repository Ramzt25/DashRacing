import { HubConnectionBuilder, HubConnection, LogLevel } from '@microsoft/signalr';

export interface SignalRMessage {
  type: string;
  data: any;
  timestamp: Date;
}

export interface RaceUpdate {
  raceId: string;
  participants: Array<{
    userId: string;
    position: number;
    speed: number;
    location: {
      latitude: number;
      longitude: number;
    };
    distance: number;
  }>;
  leaderboard: Array<{
    userId: string;
    username: string;
    position: number;
    lapTime?: number;
    bestLap?: number;
  }>;
  raceStatus: 'waiting' | 'countdown' | 'active' | 'finished';
  elapsed: number;
}

export class SignalRService {
  private connection: HubConnection | null = null;
  private connectionString: string;
  private isConnected = false;

  constructor(connectionString: string) {
    this.connectionString = connectionString;
  }

  async connect(): Promise<void> {
    try {
      this.connection = new HubConnectionBuilder()
        .withUrl(this.connectionString)
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      // Set up event handlers
      this.setupEventHandlers();

      await this.connection.start();
      this.isConnected = true;
      console.log('SignalR connection established');

    } catch (error) {
      console.error('SignalR connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      this.isConnected = false;
      console.log('SignalR connection closed');
    }
  }

  private setupEventHandlers(): void {
    if (!this.connection) return;

    this.connection.onreconnecting((error) => {
      console.log('SignalR reconnecting:', error);
      this.isConnected = false;
    });

    this.connection.onreconnected((connectionId) => {
      console.log('SignalR reconnected:', connectionId);
      this.isConnected = true;
    });

    this.connection.onclose((error) => {
      console.log('SignalR connection closed:', error);
      this.isConnected = false;
    });
  }

  // Race real-time updates
  async sendRaceUpdate(raceId: string, update: RaceUpdate): Promise<void> {
    if (!this.isConnected || !this.connection) {
      throw new Error('SignalR not connected');
    }

    await this.connection.invoke('SendRaceUpdate', raceId, update);
  }

  async joinRaceGroup(raceId: string, userId: string): Promise<void> {
    if (!this.isConnected || !this.connection) {
      throw new Error('SignalR not connected');
    }

    await this.connection.invoke('JoinRaceGroup', raceId, userId);
  }

  async leaveRaceGroup(raceId: string, userId: string): Promise<void> {
    if (!this.isConnected || !this.connection) {
      throw new Error('SignalR not connected');
    }

    await this.connection.invoke('LeaveRaceGroup', raceId, userId);
  }

  // Group messaging
  async sendGroupMessage(groupId: string, message: SignalRMessage): Promise<void> {
    if (!this.isConnected || !this.connection) {
      throw new Error('SignalR not connected');
    }

    await this.connection.invoke('SendGroupMessage', groupId, message);
  }

  async joinGroup(groupId: string, userId: string): Promise<void> {
    if (!this.isConnected || !this.connection) {
      throw new Error('SignalR not connected');
    }

    await this.connection.invoke('JoinGroup', groupId, userId);
  }

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    if (!this.isConnected || !this.connection) {
      throw new Error('SignalR not connected');
    }

    await this.connection.invoke('LeaveGroup', groupId, userId);
  }

  // User notifications
  async sendNotification(userId: string, notification: any): Promise<void> {
    if (!this.isConnected || !this.connection) {
      throw new Error('SignalR not connected');
    }

    await this.connection.invoke('SendNotification', userId, notification);
  }

  async sendBulkNotification(userIds: string[], notification: any): Promise<void> {
    if (!this.isConnected || !this.connection) {
      throw new Error('SignalR not connected');
    }

    await this.connection.invoke('SendBulkNotification', userIds, notification);
  }

  // Position tracking
  async updateUserPosition(raceId: string, userId: string, position: {
    latitude: number;
    longitude: number;
    speed: number;
    heading: number;
    timestamp: Date;
  }): Promise<void> {
    if (!this.isConnected || !this.connection) {
      throw new Error('SignalR not connected');
    }

    await this.connection.invoke('UpdatePosition', raceId, userId, position);
  }

  // Event listeners for client-side
  onRaceUpdate(callback: (raceId: string, update: RaceUpdate) => void): void {
    if (!this.connection) return;
    this.connection.on('RaceUpdate', callback);
  }

  onGroupMessage(callback: (groupId: string, message: SignalRMessage) => void): void {
    if (!this.connection) return;
    this.connection.on('GroupMessage', callback);
  }

  onNotification(callback: (notification: any) => void): void {
    if (!this.connection) return;
    this.connection.on('Notification', callback);
  }

  onPositionUpdate(callback: (raceId: string, userId: string, position: any) => void): void {
    if (!this.connection) return;
    this.connection.on('PositionUpdate', callback);
  }

  onUserJoined(callback: (raceId: string, userId: string) => void): void {
    if (!this.connection) return;
    this.connection.on('UserJoined', callback);
  }

  onUserLeft(callback: (raceId: string, userId: string) => void): void {
    if (!this.connection) return;
    this.connection.on('UserLeft', callback);
  }

  // Utility methods
  isConnectionActive(): boolean {
    return this.isConnected && this.connection?.state === 'Connected';
  }

  getConnectionState(): string {
    return this.connection?.state || 'Disconnected';
  }

  async ensureConnection(): Promise<void> {
    if (!this.isConnectionActive()) {
      await this.connect();
    }
  }
}