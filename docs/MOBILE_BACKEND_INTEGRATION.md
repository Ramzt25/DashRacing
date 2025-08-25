# 🎮 GridGhost Mobile App Integration Guide

## Overview

This guide explains how to integrate the mobile app with the new backend features:
1. **Authentication & API Integration**
2. **Real-time Race Participation**
3. **Push Notifications**
4. **Performance Optimization**

---

## 🔐 1. Authentication Integration

### API Service Setup

```typescript
// src/services/ApiService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export class ApiService {
  private baseURL = __DEV__ ? 'http://localhost:3000' : 'https://your-production-api.com';
  private wsURL = __DEV__ ? 'ws://localhost:3001' : 'wss://your-production-ws.com';
  
  async request(endpoint: string, options: RequestInit = {}) {
    const token = await AsyncStorage.getItem('auth_token');
    
    return fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });
  }

  async login(email: string, password: string) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.ok) {
      const { token, user } = await response.json();
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      return { token, user };
    }
    
    throw new Error('Login failed');
  }

  getWebSocketURL(token: string) {
    return `${this.wsURL}?token=${token}`;
  }
}
```

### Authentication Hook

```typescript
// src/hooks/useAuth.ts
import { useState, useEffect, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from '../services/ApiService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const apiService = new ApiService();

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem('auth_token'),
        AsyncStorage.getItem('user_data'),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { token: newToken, user: newUser } = await apiService.login(email, password);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['auth_token', 'user_data']);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

---

## 🏁 2. Real-time Race Integration

### WebSocket Race Service

```typescript
// src/services/RealTimeRaceService.ts
import { useAuth } from '../hooks/useAuth';
import { ApiService } from './ApiService';

export interface RacePosition {
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  timestamp: number;
}

export class RealTimeRaceService {
  private ws: WebSocket | null = null;
  private apiService = new ApiService();
  private listeners: Map<string, Function[]> = new Map();

  async connectToRace(raceId: string, token: string) {
    const wsUrl = this.apiService.getWebSocketURL(token);
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('Connected to race WebSocket');
      this.emit('connected');
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.emit(message.type, message);
    };

    this.ws.onclose = () => {
      console.log('Disconnected from race WebSocket');
      this.emit('disconnected');
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };
  }

  joinRace(raceId: string, vehicleId: string) {
    this.send({
      type: 'join_race',
      raceId,
      vehicleId,
    });
  }

  updatePosition(raceId: string, position: RacePosition) {
    this.send({
      type: 'position_update',
      raceId,
      position,
    });
  }

  readyToStart(raceId: string) {
    this.send({
      type: 'ready_to_start',
      raceId,
    });
  }

  finishRace(raceId: string) {
    this.send({
      type: 'finish_race',
      raceId,
    });
  }

  private send(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
```

### Race Screen Component

```typescript
// src/screens/RaceScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { RealTimeRaceService } from '../services/RealTimeRaceService';
import { useAuth } from '../hooks/useAuth';
import { PerformanceOptimizer } from '../services/PerformanceOptimizer';

export function RaceScreen({ route }: { route: any }) {
  const { raceId } = route.params;
  const { token } = useAuth();
  const [raceService] = useState(() => new RealTimeRaceService());
  const [participants, setParticipants] = useState([]);
  const [raceStatus, setRaceStatus] = useState('waiting');
  const [myPosition, setMyPosition] = useState(null);

  useEffect(() => {
    initializeRace();
    return () => raceService.disconnect();
  }, []);

  const initializeRace = async () => {
    // Connect to race WebSocket
    await raceService.connectToRace(raceId, token!);

    // Set up event listeners
    raceService.on('race_started', handleRaceStarted);
    raceService.on('participant_joined', handleParticipantJoined);
    raceService.on('position_update', handlePositionUpdate);
    raceService.on('race_finished', handleRaceFinished);

    // Start location tracking
    startLocationTracking();
  };

  const startLocationTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    // Get performance settings
    const optimizer = PerformanceOptimizer.getInstance();
    const settings = optimizer.getSettings();

    Location.watchPositionAsync(
      {
        accuracy: settings.locationAccuracy === 'high' 
          ? Location.Accuracy.BestForNavigation 
          : Location.Accuracy.Balanced,
        timeInterval: settings.trackingInterval,
        distanceInterval: 5, // meters
      },
      (location) => {
        const position = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          speed: location.coords.speed || 0,
          heading: location.coords.heading || 0,
          timestamp: location.timestamp,
        };

        setMyPosition(position);
        
        if (raceStatus === 'active') {
          raceService.updatePosition(raceId, position);
        }
      }
    );
  };

  const handleRaceStarted = () => {
    setRaceStatus('active');
  };

  const handleParticipantJoined = (data: any) => {
    setParticipants(prev => [...prev, data.participant]);
  };

  const handlePositionUpdate = (data: any) => {
    // Update participant positions on map
    setParticipants(prev => 
      prev.map(p => 
        p.userId === data.userId 
          ? { ...p, position: data.position, lap: data.lap }
          : p
      )
    );
  };

  const handleRaceFinished = (data: any) => {
    setRaceStatus('finished');
    // Show results screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.status}>Race Status: {raceStatus}</Text>
      <Text style={styles.participants}>
        Participants: {participants.length}
      </Text>
      {/* Add MapView component here */}
      {/* Add race controls here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  status: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  participants: {
    fontSize: 16,
    marginBottom: 20,
  },
});
```

---

## 📱 3. Push Notifications Integration

### Update App.tsx

```typescript
// App.tsx
import React, { useEffect } from 'react';
import { AuthProvider } from './src/hooks/useAuth';
import { PushNotificationService } from './src/services/PushNotificationService';
import { PerformanceOptimizer } from './src/services/PerformanceOptimizer';
import MainNavigator from './src/navigation/MainNavigator';

export default function App() {
  useEffect(() => {
    initializeServices();
  }, []);

  const initializeServices = async () => {
    // Initialize performance optimizer
    const optimizer = PerformanceOptimizer.getInstance();
    await optimizer.loadSettings();
    await optimizer.preloadCriticalData();

    // Initialize push notifications
    const pushService = PushNotificationService.getInstance();
    await pushService.initialize();
    
    // Set up notification handlers
    pushService.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    pushService.addNotificationResponseListener((response) => {
      const { type, data } = response.notification.request.content.data;
      
      switch (type) {
        case 'race_invite':
          // Navigate to race invitation screen
          break;
        case 'friend_request':
          // Navigate to friends screen
          break;
        case 'event_reminder':
          // Navigate to event screen
          break;
      }
    });
  };

  return (
    <AuthProvider>
      <MainNavigator />
    </AuthProvider>
  );
}
```

---

## ⚡ 4. Performance Optimization Integration

### Performance Hook

```typescript
// src/hooks/usePerformance.ts
import { useEffect } from 'react';
import { usePerformanceMonitor } from '../services/PerformanceOptimizer';

export function usePerformance(componentName: string) {
  const { measureRenderTime, getSettings, clearCaches } = usePerformanceMonitor();

  useEffect(() => {
    const endMeasurement = measureRenderTime(componentName);
    return endMeasurement;
  }, [componentName]);

  return {
    settings: getSettings(),
    clearCaches,
  };
}
```

### Optimized Map Component

```typescript
// src/components/OptimizedMapView.tsx
import React, { memo, useMemo } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { usePerformance } from '../hooks/usePerformance';

interface OptimizedMapViewProps {
  markers: any[];
  region: any;
}

export const OptimizedMapView = memo<OptimizedMapViewProps>(({ markers, region }) => {
  const { settings } = usePerformance('OptimizedMapView');

  // Limit markers based on performance settings
  const visibleMarkers = useMemo(() => {
    return markers.slice(0, settings.maxMarkersOnScreen);
  }, [markers, settings.maxMarkersOnScreen]);

  return (
    <MapView
      style={{ flex: 1 }}
      region={region}
      mapType={settings.mapQuality === 'low' ? 'standard' : 'hybrid'}
      showsUserLocation
      followsUserLocation
      pitchEnabled={settings.mapAnimationsEnabled}
      rotateEnabled={settings.mapAnimationsEnabled}
      zoomEnabled
      scrollEnabled
    >
      {visibleMarkers.map((marker, index) => (
        <Marker
          key={marker.id}
          coordinate={marker.coordinate}
          title={marker.title}
        />
      ))}
    </MapView>
  );
});
```

---

## 🚀 Integration Checklist

### Backend Setup
- [ ] Install new dependencies (`npm install ws @types/ws`)
- [ ] Update environment variables
- [ ] Test authentication endpoints
- [ ] Test WebSocket connection
- [ ] Verify push notification setup

### Mobile App Setup
- [ ] Update API service with authentication
- [ ] Integrate WebSocket race service
- [ ] Set up push notification handling
- [ ] Add performance optimization hooks
- [ ] Test real-time race features
- [ ] Test push notifications

### Testing
- [ ] Test authentication flow
- [ ] Test real-time race creation and joining
- [ ] Test WebSocket connection stability
- [ ] Test push notifications on device
- [ ] Performance testing on low-end devices
- [ ] Test offline capabilities

### Production Deployment
- [ ] Update production environment variables
- [ ] Deploy backend with WebSocket support
- [ ] Configure push notification certificates
- [ ] Set up monitoring and analytics
- [ ] Performance monitoring setup

---

## 📊 Performance Monitoring

```typescript
// src/utils/analytics.ts
import { PerformanceOptimizer } from '../services/PerformanceOptimizer';

export function trackPerformanceMetrics() {
  const optimizer = PerformanceOptimizer.getInstance();
  const report = optimizer.getPerformanceReport();
  
  // Send to analytics service
  console.log('Performance Report:', report);
  
  // You can integrate with services like:
  // - Firebase Analytics
  // - Flipper
  // - Custom analytics endpoint
}
```

This integration guide provides everything needed to connect your mobile app with the enhanced backend featuring real-time racing, push notifications, and performance optimizations. Each service is designed to work independently and can be integrated gradually.