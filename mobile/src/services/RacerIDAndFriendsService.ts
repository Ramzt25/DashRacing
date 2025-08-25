// Week 7 - Racer ID and Friends Management System
// Connect racers through unique IDs and enhance social racing experience

interface RacerProfile {
  racerId: string; // Unique 6-8 character alphanumeric ID (e.g., "GH47K2X")
  userId: string; // Internal user ID
  displayName: string;
  username: string;
  
  // Profile information
  profileImage?: string;
  bio?: string;
  location?: {
    city: string;
    state: string;
    country: string;
  };
  
  // Racing stats for profile display
  stats: {
    totalRaces: number;
    wins: number;
    winRate: number;
    skillRating: number;
    favoriteCategory: 'circuit' | 'drag' | 'drift' | 'street';
    bestLapTime?: number;
    totalDistance: number; // miles
  };
  
  // Preferences
  preferences: {
    isOnline: boolean;
    allowDirectInvites: boolean;
    showLocation: boolean;
    allowSpectators: boolean;
    preferredRaceTypes: string[];
  };
  
  // Account info
  subscriptionStatus: 'trial' | 'pro' | 'free';
  trialEndsAt?: Date;
  joinedAt: Date;
  lastActiveAt: Date;
}

interface FriendRequest {
  id: string;
  fromRacerId: string;
  toRacerId: string;
  fromProfile: RacerProfile;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  sentAt: Date;
  respondedAt?: Date;
  message?: string; // Optional message when sending request
}

interface Friendship {
  id: string;
  racer1Id: string;
  racer2Id: string;
  racer1Profile: RacerProfile;
  racer2Profile: RacerProfile;
  establishedAt: Date;
  
  // Friendship stats
  racesTogetherCount: number;
  lastRacedTogether?: Date;
  favoriteTrack?: string;
  winLossRecord: {
    racer1Wins: number;
    racer2Wins: number;
    ties: number;
  };
}

interface FriendMapMarker {
  racerId: string;
  profile: RacerProfile;
  position: {
    lat: number;
    lng: number;
  };
  
  // Real-time status
  status: 'idle' | 'racing' | 'in_race' | 'spectating' | 'offline';
  currentActivity?: {
    type: 'racing' | 'practice' | 'event';
    raceId?: string;
    eventName?: string;
    canJoin: boolean;
  };
  
  // Visual representation
  markerColor: string; // Friend-specific green color
  isVisible: boolean; // Based on their privacy settings
  lastLocationUpdate: Date;
}

class RacerIDAndFriendsService {
  private static apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';
  private static friendsCache: Map<string, Friendship[]> = new Map();

  // Generate unique Racer ID for new users
  static async generateRacerID(preferredId?: string): Promise<string> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/racer/generate-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add auth header
        },
        body: JSON.stringify({ preferredId }),
      });

      if (!response.ok) throw new Error('Failed to generate Racer ID');
      const result = await response.json() as { racerId: string };
      return result.racerId;
    } catch (error) {
      console.error('Failed to generate Racer ID:', error);
      // Fallback: generate client-side ID
      return this.generateClientSideRacerID();
    }
  }

  // Search for racer by ID
  static async findRacerByID(racerId: string): Promise<RacerProfile | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/racer/find/${racerId.toUpperCase()}`);
      if (!response.ok) return null;
      
      return await response.json() as RacerProfile;
    } catch (error) {
      console.error('Failed to find racer:', error);
      return null;
    }
  }

  // Send friend request
  static async sendFriendRequest(toRacerId: string, message?: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/friends/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add auth header
        },
        body: JSON.stringify({ 
          toRacerId: toRacerId.toUpperCase(),
          message 
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send friend request:', error);
      return false;
    }
  }

  // Get pending friend requests
  static async getPendingFriendRequests(): Promise<FriendRequest[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/friends/requests/pending`);
      if (!response.ok) return [];
      
      return await response.json() as FriendRequest[];
    } catch (error) {
      console.error('Failed to get friend requests:', error);
      return [];
    }
  }

  // Respond to friend request
  static async respondToFriendRequest(requestId: string, action: 'accept' | 'decline' | 'block'): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/friends/requests/${requestId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add auth header
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok && action === 'accept') {
        // Clear friends cache to refresh list
        this.friendsCache.clear();
      }

      return response.ok;
    } catch (error) {
      console.error('Failed to respond to friend request:', error);
      return false;
    }
  }

  // Get friends list
  static async getFriends(): Promise<Friendship[]> {
    const userId = 'current_user'; // TODO: Get from auth context
    
    // Check cache first
    if (this.friendsCache.has(userId)) {
      return this.friendsCache.get(userId)!;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/friends/list`);
      if (!response.ok) return [];
      
      const friends = await response.json() as Friendship[];
      this.friendsCache.set(userId, friends);
      return friends;
    } catch (error) {
      console.error('Failed to get friends list:', error);
      return [];
    }
  }

  // Get friends for map display with real-time positions
  static async getFriendsForMap(): Promise<FriendMapMarker[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/friends/map-markers`);
      if (!response.ok) return [];
      
      const markers = await response.json() as FriendMapMarker[];
      
      // Filter out offline friends and respect privacy settings
      return markers.filter(marker => 
        marker.isVisible && 
        marker.status !== 'offline' &&
        marker.profile.preferences.showLocation
      );
    } catch (error) {
      console.error('Failed to get friends for map:', error);
      return this.getMockFriendsForMap();
    }
  }

  // Update own location for friends to see
  static async updateLocationForFriends(position: { lat: number; lng: number }, status: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/friends/update-location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add auth header
        },
        body: JSON.stringify({ position, status }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to update location for friends:', error);
      return false;
    }
  }

  // Invite friend to race
  static async inviteFriendToRace(friendRacerId: string, raceDetails: {
    raceType: string;
    location: { lat: number; lng: number };
    startTime?: Date;
    message?: string;
  }): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/friends/invite-to-race`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add auth header
        },
        body: JSON.stringify({
          friendRacerId,
          ...raceDetails,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to invite friend to race:', error);
      return false;
    }
  }

  // Get friend racing history
  static async getFriendRacingHistory(friendRacerId: string): Promise<Array<{
    raceId: string;
    date: Date;
    raceType: string;
    track: string;
    myPosition: number;
    friendPosition: number;
    winner: string;
  }>> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/friends/${friendRacerId}/racing-history`);
      if (!response.ok) return [];
      
      return await response.json() as Array<{
        raceId: string;
        date: Date;
        raceType: string;
        track: string;
        myPosition: number;
        friendPosition: number;
        winner: string;
      }>;
    } catch (error) {
      console.error('Failed to get friend racing history:', error);
      return [];
    }
  }

  // Remove friend
  static async removeFriend(friendRacerId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/friends/${friendRacerId}/remove`, {
        method: 'DELETE',
        headers: {
          // TODO: Add auth header
        },
      });

      if (response.ok) {
        // Clear friends cache
        this.friendsCache.clear();
      }

      return response.ok;
    } catch (error) {
      console.error('Failed to remove friend:', error);
      return false;
    }
  }

  // Block user
  static async blockUser(racerId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/users/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add auth header
        },
        body: JSON.stringify({ racerId }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to block user:', error);
      return false;
    }
  }

  // Get suggested friends (based on location, mutual friends, similar skill level)
  static async getSuggestedFriends(): Promise<RacerProfile[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/friends/suggestions`);
      if (!response.ok) return [];
      
      return await response.json() as RacerProfile[];
    } catch (error) {
      console.error('Failed to get friend suggestions:', error);
      return [];
    }
  }

  // Private helper methods
  private static generateClientSideRacerID(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'GH'; // GridGhost prefix
    
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  private static getMockFriendsForMap(): FriendMapMarker[] {
    return [
      {
        racerId: 'GH42K7X',
        profile: {
          racerId: 'GH42K7X',
          userId: 'mock_friend_1',
          displayName: 'SpeedDemon',
          username: 'speeddemon_42',
          stats: {
            totalRaces: 156,
            wins: 47,
            winRate: 30.1,
            skillRating: 8.2,
            favoriteCategory: 'circuit',
            totalDistance: 2847,
          },
          preferences: {
            isOnline: true,
            allowDirectInvites: true,
            showLocation: true,
            allowSpectators: true,
            preferredRaceTypes: ['circuit', 'drag'],
          },
          subscriptionStatus: 'pro',
          joinedAt: new Date('2024-06-15'),
          lastActiveAt: new Date(),
        },
        position: {
          lat: 34.0522,
          lng: -118.2437,
        },
        status: 'racing',
        currentActivity: {
          type: 'racing',
          raceId: 'race_123',
          eventName: 'Downtown Circuit Challenge',
          canJoin: false,
        },
        markerColor: '#00FF88', // Friend green color
        isVisible: true,
        lastLocationUpdate: new Date(),
      },
    ];
  }
}

export default RacerIDAndFriendsService;
export type { RacerProfile, FriendRequest, Friendship, FriendMapMarker };