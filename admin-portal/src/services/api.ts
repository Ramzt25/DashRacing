import axios, { AxiosInstance } from 'axios';
import type { 
  User, 
  Car, 
  Race, 
  Event, 
  UserStats, 
  LeaderboardEntry, 
  SystemHealth, 
  DashboardStats,
  ActivityItem
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: (import.meta as any).env?.VITE_API_URL || '',
      timeout: 10000,
    });

    // Add auth token to requests if available
    const token = localStorage.getItem('admin_token');
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const response = await this.api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    
    localStorage.setItem('admin_token', token);
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    return { token, user };
  }

  logout(): void {
    localStorage.removeItem('admin_token');
    delete this.api.defaults.headers.common['Authorization'];
    window.location.href = '/login';
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.api.get('/admin/dashboard/stats');
    return response.data;
  }

  async getRecentActivity(limit = 20): Promise<ActivityItem[]> {
    const response = await this.api.get(`/admin/activity?limit=${limit}`);
    return response.data;
  }

  async getSystemHealth(): Promise<SystemHealth> {
    const response = await this.api.get('/admin/health');
    return response.data;
  }

  // Users
  async getUsers(page = 1, limit = 50, search?: string): Promise<{ users: User[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }

    const response = await this.api.get(`/admin/users?${params}`);
    return response.data;
  }

  async getUser(id: string): Promise<User> {
    const response = await this.api.get(`/admin/users/${id}`);
    return response.data;
  }

  async getUserStats(id: string): Promise<UserStats> {
    const response = await this.api.get(`/users/${id}/stats`);
    return response.data;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await this.api.put(`/admin/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.api.delete(`/admin/users/${id}`);
  }

  // Cars
  async getCars(page = 1, limit = 50, userId?: string): Promise<{ cars: Car[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (userId) {
      params.append('userId', userId);
    }

    const response = await this.api.get(`/admin/cars?${params}`);
    return response.data;
  }

  async getCar(id: string): Promise<Car> {
    const response = await this.api.get(`/admin/cars/${id}`);
    return response.data;
  }

  async updateCar(id: string, data: Partial<Car>): Promise<Car> {
    const response = await this.api.put(`/admin/cars/${id}`, data);
    return response.data;
  }

  async deleteCar(id: string): Promise<void> {
    await this.api.delete(`/admin/cars/${id}`);
  }

  // Races
  async getRaces(page = 1, limit = 50, status?: string): Promise<{ races: Race[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (status) {
      params.append('status', status);
    }

    const response = await this.api.get(`/admin/races?${params}`);
    return response.data;
  }

  async getRace(id: string): Promise<Race> {
    const response = await this.api.get(`/races/${id}`);
    return response.data;
  }

  async updateRace(id: string, data: Partial<Race>): Promise<Race> {
    const response = await this.api.put(`/admin/races/${id}`, data);
    return response.data;
  }

  async deleteRace(id: string): Promise<void> {
    await this.api.delete(`/admin/races/${id}`);
  }

  // Events
  async getEvents(page = 1, limit = 50, status?: string): Promise<{ events: Event[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (status) {
      params.append('status', status);
    }

    const response = await this.api.get(`/admin/events?${params}`);
    return response.data;
  }

  async getEvent(id: string): Promise<Event> {
    const response = await this.api.get(`/admin/events/${id}`);
    return response.data;
  }

  async updateEvent(id: string, data: Partial<Event>): Promise<Event> {
    const response = await this.api.put(`/admin/events/${id}`, data);
    return response.data;
  }

  async deleteEvent(id: string): Promise<void> {
    await this.api.delete(`/admin/events/${id}`);
  }

  // Statistics
  async getLeaderboard(limit = 10, raceType?: string): Promise<{ leaderboard: LeaderboardEntry[]; filters: any }> {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });
    
    if (raceType) {
      params.append('raceType', raceType);
    }

    const response = await this.api.get(`/leaderboard?${params}`);
    return response.data;
  }

  async getAnalytics(timeRange = '7d'): Promise<any> {
    const response = await this.api.get(`/admin/analytics?range=${timeRange}`);
    return response.data;
  }

  // System Management
  async getServerLogs(level = 'error', limit = 100): Promise<any[]> {
    const response = await this.api.get(`/admin/logs?level=${level}&limit=${limit}`);
    return response.data;
  }

  async getSystemMetrics(): Promise<any> {
    const response = await this.api.get('/admin/metrics');
    return response.data;
  }

  async runHealthCheck(): Promise<SystemHealth> {
    const response = await this.api.post('/admin/health/check');
    return response.data;
  }

  async restartService(service: string): Promise<void> {
    await this.api.post(`/admin/services/${service}/restart`);
  }
}

export const apiService = new ApiService();
export default apiService;