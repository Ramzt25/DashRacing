const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
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

  console.log(`API Request: ${url} with token: ${token ? 'present' : 'missing'}`);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' })) as { error?: string };
    console.error(`API Error: ${response.status} - ${errorData.error || 'Unknown error'}`);
    throw new ApiError(errorData.error || 'API request failed', response.status);
  }

  return response.json();
}

export const ApiService = {
  // Car endpoints (matching backend /cars routes)
  async getVehicles() {
    return fetchWithAuth('/cars');
  },

  async createVehicle(vehicleData: any) {
    return fetchWithAuth('/cars', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    });
  },

  async updateVehicle(vehicleId: string, updates: any) {
    return fetchWithAuth(`/cars/${vehicleId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteVehicle(vehicleId: string) {
    return fetchWithAuth(`/cars/${vehicleId}`, {
      method: 'DELETE',
    });
  },

  async addModification(vehicleId: string, modification: any) {
    return fetchWithAuth(`/cars/${vehicleId}/mods`, {
      method: 'POST',
      body: JSON.stringify(modification),
    });
  },

  async updatePerformance(vehicleId: string, raceStats: any) {
    return fetchWithAuth(`/cars/${vehicleId}/performance`, {
      method: 'POST',
      body: JSON.stringify({ raceStats }),
    });
  },

  // Auth endpoints
  async login(email: string, password: string) {
    return fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(email: string, password: string, username: string) {
    return fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    });
  },

  // AI Services
  async generateCarImage(make: string, model: string, year: number, color: string) {
    // This would call an AI image generation service
    // For now, return a placeholder
    return {
      imageUrl: `https://via.placeholder.com/400x300/000000/FFFFFF?text=${make}+${model}+${year}`,
      isAIGenerated: true
    };
  },

  async estimateModPerformance(carSpecs: any, modification: any) {
    // This would call an AI service to estimate performance gains
    // For now, return mock estimation
    const baseHpGain = modification.category === 'Engine' ? 25 :
                      modification.category === 'Turbo' ? 50 :
                      modification.category === 'Exhaust' ? 15 :
                      modification.category === 'Intake' ? 10 : 5;
    
    const baseTorqueGain = Math.round(baseHpGain * 0.8);
    const weightChange = modification.category === 'Aero' ? 15 :
                        modification.category === 'Brakes' ? -5 :
                        modification.category === 'Suspension' ? -3 : 0;

    return {
      estimatedHpGain: baseHpGain + Math.random() * 10 - 5, // ±5 variation
      estimatedTorqueGain: baseTorqueGain + Math.random() * 8 - 4, // ±4 variation
      estimatedWeightChange: weightChange,
      confidence: 0.85 + Math.random() * 0.1, // 85-95% confidence
      reasoning: `Based on similar ${modification.category.toLowerCase()} modifications for ${carSpecs.make} ${carSpecs.model} vehicles, this mod typically provides moderate performance gains.`
    };
  },

  // Race endpoints - Fixed to match backend routes
  async saveRaceSession(raceId: string, sessionData: any) {
    return fetchWithAuth(`/races/${raceId}/sessions`, {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  },

  async endRaceSession(sessionId: string, sessionData: any) {
    return fetchWithAuth(`/races/sessions/${sessionId}/end`, {
      method: 'PATCH',
      body: JSON.stringify(sessionData),
    });
  },

  async getUserRaceStats() {
    return fetchWithAuth('/userstats/overview');
  },

  // Race management
  async getRaces() {
    return fetchWithAuth('/races');
  },

  async getRace(raceId: string) {
    return fetchWithAuth(`/races/${raceId}`);
  },

  async createRace(raceData: any) {
    return fetchWithAuth('/races', {
      method: 'POST',
      body: JSON.stringify(raceData),
    });
  },

  async joinRace(raceId: string, carId?: string) {
    return fetchWithAuth(`/races/${raceId}/join`, {
      method: 'POST',
      body: JSON.stringify({ carId }),
    });
  },

  async leaveRace(raceId: string) {
    return fetchWithAuth(`/races/${raceId}/leave`, {
      method: 'DELETE',
    });
  },

  // Live Map endpoints - Fixed to match backend response structure
  async updatePresence(presence: any) {
    return fetchWithAuth('/livemap/location', {
      method: 'POST',
      body: JSON.stringify(presence),
    });
  },

  async getNearbyPlayers(lat: number, lng: number, radius?: number) {
    const params = new URLSearchParams({ lat: lat.toString(), lng: lng.toString() });
    if (radius) params.append('radius', radius.toString());
    const response = await fetchWithAuth(`/live/players?${params}`) as any;
    // Backend returns { users, count, location } but mobile expects players
    return {
      players: response.users || [],
      count: response.count || 0,
      location: response.location
    };
  },

  async getNearbyEvents(lat: number, lng: number, radius?: number) {
    const params = new URLSearchParams({ lat: lat.toString(), lng: lng.toString() });
    if (radius) params.append('radius', radius.toString());
    return fetchWithAuth(`/live/events?${params}`);
  },

  async joinLiveEvent(eventId: string) {
    return fetchWithAuth(`/live/events/${eventId}/join`, {
      method: 'POST',
    });
  },

  async leaveLiveEvent(eventId: string) {
    return fetchWithAuth(`/live/events/${eventId}/leave`, {
      method: 'DELETE',
    });
  },

  async getLiveStatus() {
    return fetchWithAuth('/livemap/nearby');
  }
};

export { ApiError };