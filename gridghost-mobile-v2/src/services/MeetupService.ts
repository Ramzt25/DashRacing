import { API_BASE_URL } from '../utils/config';

// Type definitions for API responses
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  [key: string]: any;
}

interface MeetupsResponse {
  meetups: Meetup[];
}

interface MeetupResponse {
  meetup: Meetup;
}

interface ActionResponse {
  success: boolean;
  message: string;
}

export interface Meetup {
  id: string;
  title: string;
  description: string;
  organizer: string;
  organizerId: string;
  date: string;
  location: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  participants: number;
  maxParticipants: number;
  raceType: 'drag' | 'circuit' | 'time-attack' | 'meetup';
  entryFee?: number;
  prizes?: string[];
  requirements?: string[];
  isJoined: boolean;
  isOrganizer: boolean;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CreateMeetupRequest {
  title: string;
  description: string;
  date: string;
  locationAddress: string;
  locationLatitude: number;
  locationLongitude: number;
  maxParticipants: number;
  raceType: 'drag' | 'circuit' | 'time-attack' | 'meetup';
  entryFee?: number;
  prizes?: string[];
  requirements?: string[];
}

export interface JoinMeetupRequest {
  meetupId: string;
  message?: string;
}

/**
 * MeetupService - Handles all meetup-related API operations
 * Uses Azure-hosted backend with managed identity authentication
 * Implements retry logic and proper error handling
 */
export class MeetupService {
  private static instance: MeetupService;
  private baseUrl: string;
  private authToken: string | null = null;

  private constructor() {
    this.baseUrl = `${API_BASE_URL}/api/meetups`;
  }

  public static getInstance(): MeetupService {
    if (!MeetupService.instance) {
      MeetupService.instance = new MeetupService();
    }
    return MeetupService.instance;
  }

  /**
   * Set authentication token for API requests
   * @param token JWT token from authentication
   */
  public setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Get headers for API requests with authentication
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Retry logic with exponential backoff for transient failures
   */
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on authentication errors or bad requests
        if (error instanceof Response && (error.status === 401 || error.status === 400)) {
          throw error;
        }

        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  /**
   * Fetch all available meetups with optional filtering
   * @param filters Optional filters for meetups
   */
  public async getMeetups(filters?: {
    location?: { latitude: number; longitude: number; radiusKm?: number };
    raceType?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
  }): Promise<Meetup[]> {
    return this.retryRequest(async () => {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        if (filters.location) {
          queryParams.append('lat', filters.location.latitude.toString());
          queryParams.append('lng', filters.location.longitude.toString());
          if (filters.location.radiusKm) {
            queryParams.append('radius', filters.location.radiusKm.toString());
          }
        }
        if (filters.raceType) queryParams.append('type', filters.raceType);
        if (filters.dateFrom) queryParams.append('from', filters.dateFrom);
        if (filters.dateTo) queryParams.append('to', filters.dateTo);
        if (filters.status) queryParams.append('status', filters.status);
      }

      const url = queryParams.toString() 
        ? `${this.baseUrl}?${queryParams.toString()}`
        : this.baseUrl;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch meetups: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as any;
      return data.meetups || data || [];
    });
  }

  /**
   * Get a specific meetup by ID
   * @param meetupId Unique meetup identifier
   */
  public async getMeetup(meetupId: string): Promise<Meetup> {
    return this.retryRequest(async () => {
      const response = await fetch(`${this.baseUrl}/${meetupId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Meetup not found');
        }
        throw new Error(`Failed to fetch meetup: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as MeetupResponse;
      return data.meetup;
    });
  }

  /**
   * Create a new meetup
   * @param meetupData Data for creating the meetup
   */
  public async createMeetup(meetupData: CreateMeetupRequest): Promise<Meetup> {
    return this.retryRequest(async () => {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(meetupData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as { message?: string };
        throw new Error(errorData.message || `Failed to create meetup: ${response.status}`);
      }

      const data = await response.json() as MeetupResponse;
      return data.meetup;
    });
  }

  /**
   * Join a meetup
   * @param request Join meetup request data
   */
  public async joinMeetup(request: JoinMeetupRequest): Promise<{ success: boolean; message: string }> {
    return this.retryRequest<ActionResponse>(async () => {
      const response = await fetch(`${this.baseUrl}/${request.meetupId}/join`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ message: request.message }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as { message?: string };
        throw new Error(errorData.message || `Failed to join meetup: ${response.status}`);
      }

      return await response.json() as ActionResponse;
    });
  }

  /**
   * Leave a meetup
   * @param meetupId Meetup ID to leave
   */
  public async leaveMeetup(meetupId: string): Promise<{ success: boolean; message: string }> {
    return this.retryRequest<ActionResponse>(async () => {
      const response = await fetch(`${this.baseUrl}/${meetupId}/leave`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as { message?: string };
        throw new Error(errorData.message || `Failed to leave meetup: ${response.status}`);
      }

      return await response.json() as ActionResponse;
    });
  }

  /**
   * Update a meetup (organizer only)
   * @param meetupId Meetup ID to update
   * @param updateData Updated meetup data
   */
  public async updateMeetup(
    meetupId: string, 
    updateData: Partial<CreateMeetupRequest>
  ): Promise<Meetup> {
    return this.retryRequest(async () => {
      const response = await fetch(`${this.baseUrl}/${meetupId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as { message?: string };
        throw new Error(errorData.message || `Failed to update meetup: ${response.status}`);
      }

      const data = await response.json() as MeetupResponse;
      return data.meetup;
    });
  }

  /**
   * Cancel a meetup (organizer only)
   * @param meetupId Meetup ID to cancel
   */
  public async cancelMeetup(meetupId: string): Promise<{ success: boolean; message: string }> {
    return this.retryRequest<ActionResponse>(async () => {
      const response = await fetch(`${this.baseUrl}/${meetupId}/cancel`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as { message?: string };
        throw new Error(errorData.message || `Failed to cancel meetup: ${response.status}`);
      }

      return await response.json() as ActionResponse;
    });
  }

  /**
   * Get meetups organized by the current user
   */
  public async getMyMeetups(): Promise<Meetup[]> {
    return this.retryRequest(async () => {
      const response = await fetch(`${this.baseUrl}/my`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch my meetups: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as MeetupsResponse;
      return data.meetups || [];
    });
  }

  /**
   * Get meetups the current user has joined
   */
  public async getJoinedMeetups(): Promise<Meetup[]> {
    return this.retryRequest(async () => {
      const response = await fetch(`${this.baseUrl}/joined`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch joined meetups: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as MeetupsResponse;
      return data.meetups || [];
    });
  }
}

// Export singleton instance
export const meetupService = MeetupService.getInstance();