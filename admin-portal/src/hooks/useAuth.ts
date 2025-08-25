import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { User } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      // Validate token by making a request to a protected endpoint
      apiService.getDashboardStats()
        .then(() => {
          setAuthState({
            isAuthenticated: true,
            user: null, // You could fetch user data here
            isLoading: false,
          });
        })
        .catch(() => {
          localStorage.removeItem('admin_token');
          setAuthState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
          });
        });
    } else {
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { user } = await apiService.login(email, password);
      setAuthState({
        isAuthenticated: true,
        user,
        isLoading: false,
      });
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    apiService.logout();
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
  };

  return {
    ...authState,
    login,
    logout,
  };
}