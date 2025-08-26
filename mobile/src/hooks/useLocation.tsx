import { useState, useEffect, useRef } from 'react';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';
import { GPSCoordinate } from '../types/racing';

interface LocationHookOptions {
  enableHighAccuracy?: boolean;
  watchPosition?: boolean;
  distanceInterval?: number;
  timeInterval?: number;
}

interface LocationState {
  location: GPSCoordinate | null;
  isLoading: boolean;
  error: string | null;
  permissionStatus: 'granted' | 'denied' | 'restricted' | 'undetermined' | null;
}

export function useLocation(options: LocationHookOptions = {}) {
  const {
    enableHighAccuracy = true,
    watchPosition = false,
    distanceInterval = 1, // meters
    timeInterval = 1000, // milliseconds
  } = options;

  const [state, setState] = useState<LocationState>({
    location: null,
    isLoading: true,
    error: null,
    permissionStatus: null,
  });

  const watcherRef = useRef<number | null>(null);

  // Request location permissions
  const requestPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Allow Dash to access your location to show nearby races and events.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        const status = granted === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied';
        setState(prev => ({ ...prev, permissionStatus: status }));
        
        if (status !== 'granted') {
          setState(prev => ({
            ...prev,
            error: 'Location permission denied',
            isLoading: false,
          }));
          return false;
        }
      } else {
        // iOS permissions are handled automatically by Geolocation
        setState(prev => ({ ...prev, permissionStatus: 'granted' }));
      }

      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: `Permission error: ${error}`,
        isLoading: false,
      }));
      return false;
    }
  };

  // Get current location once
  const getCurrentLocation = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      Geolocation.getCurrentPosition(
        (position) => {
          const gpsCoordinate: GPSCoordinate = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude || undefined,
            timestamp: position.timestamp,
            accuracy: position.coords.accuracy || undefined,
            speed: position.coords.speed || undefined,
            heading: position.coords.heading || undefined,
          };

          setState(prev => ({
            ...prev,
            location: gpsCoordinate,
            isLoading: false,
            error: null,
          }));
        },
        (error) => {
          setState(prev => ({
            ...prev,
            error: `Location error: ${error.message}`,
            isLoading: false,
          }));
        },
        {
          enableHighAccuracy,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: `Location error: ${error}`,
        isLoading: false,
      }));
    }
  };

  // Start watching location changes
  const startWatching = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      if (watcherRef.current) {
        Geolocation.clearWatch(watcherRef.current);
      }

      watcherRef.current = Geolocation.watchPosition(
        (position) => {
          const gpsCoordinate: GPSCoordinate = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude || undefined,
            timestamp: position.timestamp,
            accuracy: position.coords.accuracy || undefined,
            speed: position.coords.speed || undefined,
            heading: position.coords.heading || undefined,
          };

          setState(prev => ({
            ...prev,
            location: gpsCoordinate,
            isLoading: false,
            error: null,
          }));
        },
        (error) => {
          setState(prev => ({
            ...prev,
            error: `Watch error: ${error.message}`,
            isLoading: false,
          }));
        },
        {
          enableHighAccuracy,
          distanceFilter: distanceInterval,
        }
      );
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: `Watch error: ${error}`,
        isLoading: false,
      }));
    }
  };

  // Stop watching location
  const stopWatching = async () => {
    if (watcherRef.current) {
      Geolocation.clearWatch(watcherRef.current);
      watcherRef.current = null;
    }
  };

  // Calculate distance between two coordinates
  const calculateDistance = (coord1: GPSCoordinate, coord2: GPSCoordinate): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
    const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Calculate speed in MPH from consecutive coordinates
  const calculateSpeed = (coord1: GPSCoordinate, coord2: GPSCoordinate): number => {
    const distance = calculateDistance(coord1, coord2);
    const timeDiff = (coord2.timestamp - coord1.timestamp) / 1000 / 3600; // in hours
    return timeDiff > 0 ? distance / timeDiff : 0;
  };

  // Initialize location tracking
  useEffect(() => {
    if (watchPosition) {
      startWatching();
    } else {
      getCurrentLocation();
    }

    return () => {
      stopWatching();
    };
  }, [enableHighAccuracy, watchPosition, distanceInterval, timeInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWatching();
    };
  }, []);

  return {
    ...state,
    getCurrentLocation,
    startWatching,
    stopWatching,
    calculateDistance,
    calculateSpeed,
  };
}