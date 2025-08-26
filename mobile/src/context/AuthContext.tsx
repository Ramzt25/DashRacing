import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '../services/AuthService';

interface User {
  id: string;
  email: string;
  handle: string;
  displayName: string | null;
  token: string;
  firstName?: string | null;
  lastName?: string | null;
  isPro?: boolean;
  subscriptionTier?: string | null;
  subscriptionEnd?: Date | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isFirstTime: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, handle: string, displayName?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  upgradeToPro: (subscriptionTier?: 'monthly' | 'yearly') => Promise<boolean>;
  markFirstTimeComplete: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      console.log('Starting auth state check...');
      setIsLoading(true);
      
      console.log('Getting saved data from AsyncStorage...');
      const [savedUser, firstTimeFlag] = await Promise.all([
        AsyncStorage.getItem('user'),
        AsyncStorage.getItem('isFirstTime')
      ]);

      console.log('💾 Saved user data:', savedUser ? 'Found' : 'None');
      console.log(' First time flag:', firstTimeFlag);

      if (savedUser) {
        const userData = JSON.parse(savedUser) as User;
        console.log('👤 Parsed user data:', { 
          id: userData.id, 
          email: userData.email, 
          hasToken: !!userData.token 
        });
        
        // Validate token if it exists
        if (userData.token) {
          console.log('🔐 Validating token...');
          try {
            const isValidToken = await AuthService.validateToken(userData.token);
            console.log('✅ Token validation result:', isValidToken);
            if (isValidToken) {
              setUser(userData);
              console.log(' User authenticated successfully');
            } else {
              // Token is invalid, clear stored user
              console.log('❌ Token invalid, clearing stored user');
              await AsyncStorage.removeItem('user');
            }
          } catch (tokenError) {
            console.error('🚨 Token validation error:', tokenError);
            // Clear invalid stored data
            await AsyncStorage.removeItem('user');
          }
        } else {
          setUser(userData); // For backward compatibility with old stored users
          console.log(' User set without token (backward compatibility)');
        }
      }

      setIsFirstTime(firstTimeFlag === null);
      console.log('✅ Auth state check completed');
    } catch (error) {
      console.error('🚨 Auth state check error:', error);
    } finally {
      setIsLoading(false);
      console.log(' Auth loading finished');
    }
  };

  const refreshUser = async () => {
    try {
      if (user?.token) {
        const updatedUser = await AuthService.getCurrentUser(user.token);
        const refreshedUser: User = {
          ...user,
          email: updatedUser.email,
          handle: updatedUser.handle,
          displayName: updatedUser.displayName,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          isPro: updatedUser.isPro,
          subscriptionTier: updatedUser.subscriptionTier,
          subscriptionEnd: updatedUser.subscriptionEnd,
        };
        
        await AsyncStorage.setItem('user', JSON.stringify(refreshedUser));
        setUser(refreshedUser);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      // If refresh fails, user might need to re-login
      await logout();
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log(' AuthContext.login starting:', { email, passwordLength: password.length });
      
      console.log('📡 Calling AuthService.login...');
      const authResponse = await AuthService.login({ email, password });
      console.log('✅ AuthService.login success:', { 
        userId: authResponse.user.id, 
        userEmail: authResponse.user.email,
        hasToken: !!authResponse.token 
      });
      
      const user: User = {
        id: authResponse.user.id,
        email: authResponse.user.email,
        handle: authResponse.user.handle,
        displayName: authResponse.user.displayName,
        token: authResponse.token,
        firstName: authResponse.user.firstName,
        lastName: authResponse.user.lastName,
        isPro: authResponse.user.isPro || false,
        subscriptionTier: authResponse.user.subscriptionTier,
        subscriptionEnd: authResponse.user.subscriptionEnd,
      };
      
      console.log('💾 Saving user to AsyncStorage...');
      await AsyncStorage.setItem('user', JSON.stringify(user));
      console.log('✅ User saved to AsyncStorage');
      
      console.log('👤 Setting user in context...');
      setUser(user);
      console.log(' Login completed successfully!');
      return true;
    } catch (error) {
      console.error('🚨 Login error:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, handle: string, displayName?: string): Promise<boolean> => {
    try {
      const authResponse = await AuthService.signup({ 
        email, 
        password, 
        handle, 
        displayName 
      });
      
      const user: User = {
        id: authResponse.user.id,
        email: authResponse.user.email,
        handle: authResponse.user.handle,
        displayName: authResponse.user.displayName,
        token: authResponse.token,
        firstName: authResponse.user.firstName,
        lastName: authResponse.user.lastName,
        isPro: authResponse.user.isPro || false,
        subscriptionTier: authResponse.user.subscriptionTier,
        subscriptionEnd: authResponse.user.subscriptionEnd,
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const upgradeToPro = async (subscriptionTier: 'monthly' | 'yearly' = 'monthly'): Promise<boolean> => {
    try {
      if (user?.token) {
        // Use real API to upgrade subscription
        const upgradeResponse = await AuthService.upgradeToPro(
          { subscriptionTier },
          user.token
        );
        
        if (upgradeResponse.success) {
          // Update local user state with new subscription info
          const updatedUser: User = {
            ...user,
            isPro: upgradeResponse.user.isPro,
            subscriptionTier: upgradeResponse.user.subscriptionTier,
            subscriptionEnd: upgradeResponse.user.subscriptionEnd,
          };
          
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Upgrade error:', error);
      return false;
    }
  };

  const markFirstTimeComplete = async () => {
    try {
      await AsyncStorage.setItem('isFirstTime', 'false');
      setIsFirstTime(false);
    } catch (error) {
      console.error('First time mark error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isFirstTime,
      login,
      register,
      logout,
      upgradeToPro,
      markFirstTimeComplete,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
