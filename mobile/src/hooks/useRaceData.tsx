import { useState, useEffect, useRef, useCallback } from 'react';
import { Race, LiveRaceData, GPSCoordinate, PerformanceMetrics } from '../types/racing';
import { useLocation } from './useLocation';
import { RaceService } from '../services/RaceService';

interface RaceDataHookOptions {
  raceId?: string;
  autoSave?: boolean;
  saveInterval?: number; // in milliseconds
}

interface RaceDataState {
  currentRace: Race | null;
  liveData: LiveRaceData | null;
  isRacing: boolean;
  raceStartTime: number | null;
  raceEndTime: number | null;
  routeData: GPSCoordinate[];
  performanceMetrics: PerformanceMetrics | null;
  isLoading: boolean;
  error: string | null;
}

export function useRaceData(options: RaceDataHookOptions = {}) {
  const { raceId, autoSave = true, saveInterval = 1000 } = options;
  
  const [state, setState] = useState<RaceDataState>({
    currentRace: null,
    liveData: null,
    isRacing: false,
    raceStartTime: null,
    raceEndTime: null,
    routeData: [],
    performanceMetrics: null,
    isLoading: false,
    error: null,
  });

  const { location, startWatching, stopWatching, calculateSpeed, calculateDistance } = useLocation({
    enableHighAccuracy: true,
    watchPosition: state.isRacing,
    distanceInterval: 1,
    timeInterval: 100, // High frequency for racing
  });

  const saveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastLocationRef = useRef<GPSCoordinate | null>(null);
  const lapStartTimeRef = useRef<number | null>(null);

  // Start a new race
  const startRace = useCallback(async (race: Race) => {
    try {
      setState(prev => ({
        ...prev,
        currentRace: race,
        isRacing: true,
        raceStartTime: Date.now(),
        raceEndTime: null,
        routeData: [],
        performanceMetrics: null,
        error: null,
      }));

      lapStartTimeRef.current = Date.now();
      await startWatching();

      if (autoSave && saveInterval > 0) {
        saveIntervalRef.current = setInterval(() => {
          saveRaceData();
        }, saveInterval);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: `Failed to start race: ${error}`,
        isRacing: false,
      }));
    }
  }, [startWatching, autoSave, saveInterval]);

  // End the current race
  const endRace = useCallback(async () => {
    try {
      const endTime = Date.now();
      setState(prev => ({
        ...prev,
        isRacing: false,
        raceEndTime: endTime,
      }));

      await stopWatching();

      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
        saveIntervalRef.current = null;
      }

      // Calculate final performance metrics
      calculateFinalMetrics();
      
      // Save final race data
      if (autoSave) {
        await saveRaceData();
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: `Failed to end race: ${error}`,
      }));
    }
  }, [stopWatching, autoSave]);

  // Pause/resume race
  const pauseRace = useCallback(() => {
    setState(prev => ({ ...prev, isRacing: false }));
    stopWatching();
  }, [stopWatching]);

  const resumeRace = useCallback(() => {
    setState(prev => ({ ...prev, isRacing: true }));
    startWatching();
  }, [startWatching]);

  // Calculate performance metrics
  const calculatePerformanceMetrics = useCallback((routeData: GPSCoordinate[]): PerformanceMetrics | null => {
    if (routeData.length < 2) return null;

    const speeds: number[] = [];
    const distances: number[] = [];
    let totalDistance = 0;
    let maxSpeed = 0;
    let zeroToSixtyTime = 0;
    let hasReachedSixty = false;

    for (let i = 1; i < routeData.length; i++) {
      const current = routeData[i];
      const previous = routeData[i - 1];
      
      const speed = calculateSpeed(previous, current);
      const distance = calculateDistance(previous, current);
      
      speeds.push(speed);
      distances.push(distance);
      totalDistance += distance;
      
      if (speed > maxSpeed) {
        maxSpeed = speed;
      }

      // Calculate 0-60 time (assuming starting from 0)
      if (!hasReachedSixty && speed >= 60 && i > 0) {
        zeroToSixtyTime = (current.timestamp - routeData[0].timestamp) / 1000;
        hasReachedSixty = true;
      }
    }

    const averageSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0;
    const totalTime = (routeData[routeData.length - 1].timestamp - routeData[0].timestamp) / 1000;

    // Calculate quarter mile time (estimate based on distance and speed)
    const quarterMileDistance = 0.25; // miles
    let quarterMileTime = 0;
    let accumulatedDistance = 0;
    
    for (let i = 1; i < routeData.length && accumulatedDistance < quarterMileDistance; i++) {
      accumulatedDistance += distances[i - 1] || 0;
      if (accumulatedDistance >= quarterMileDistance) {
        quarterMileTime = (routeData[i].timestamp - routeData[0].timestamp) / 1000;
        break;
      }
    }

    return {
      zeroToSixty: zeroToSixtyTime,
      quarterMile: quarterMileTime,
      halfMile: quarterMileTime * 2, // Rough estimate
      topSpeed: maxSpeed,
      averageSpeed,
      totalDistance,
      lapTimes: [], // Will be calculated separately for circuit races
      gForces: {
        max: 0, // Would need accelerometer data
        average: 0,
        lateral: 0,
      },
    };
  }, [calculateSpeed, calculateDistance]);

  // Calculate final metrics when race ends
  const calculateFinalMetrics = useCallback(() => {
    setState(prev => {
      if (prev.routeData.length > 0) {
        const metrics = calculatePerformanceMetrics(prev.routeData);
        return {
          ...prev,
          performanceMetrics: metrics,
        };
      }
      return prev;
    });
  }, [calculatePerformanceMetrics]);

  // Save race data to backend
  const saveRaceData = useCallback(async () => {
    try {
      if (!state.routeData.length || !state.raceStartTime) {
        console.warn('No race data to save');
        return;
      }

      const sessionData = {
        raceId: state.currentRace?.id,
        routeData: state.routeData,
        performanceMetrics: state.performanceMetrics || undefined,
        startTime: new Date(state.raceStartTime).toISOString(),
        endTime: state.raceEndTime ? new Date(state.raceEndTime).toISOString() : undefined,
        sessionType: 'practice' as const, // Default to practice session
      };

      const result = await RaceService.saveRaceSession(sessionData);
      console.log('Race data saved successfully:', result.sessionId);
      
    } catch (error) {
      console.error('Failed to save race data:', error);
      setState(prev => ({
        ...prev,
        error: `Failed to save race data: ${error}`,
      }));
    }
  }, [state.routeData, state.performanceMetrics, state.raceStartTime, state.raceEndTime, state.currentRace]);

  // Load race data by session ID
  const loadRaceData = useCallback(async (sessionId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const sessionData = await RaceService.loadRaceSession(sessionId);
      
      // Convert the session data back to the hook's state format
      setState(prev => ({
        ...prev,
        routeData: sessionData.routeData,
        performanceMetrics: sessionData.performanceMetrics,
        raceStartTime: new Date(sessionData.startTime).getTime(),
        raceEndTime: sessionData.endTime ? new Date(sessionData.endTime).getTime() : null,
        isLoading: false,
      }));
      
    } catch (error) {
      console.error('Failed to load race data:', error);
      setState(prev => ({
        ...prev,
        error: `Failed to load race data: ${error}`,
        isLoading: false,
      }));
    }
  }, []);

  // Update route data when location changes during race
  useEffect(() => {
    if (state.isRacing && location) {
      setState(prev => {
        const newRouteData = [...prev.routeData, location];
        
        // Calculate real-time performance metrics
        const metrics = calculatePerformanceMetrics(newRouteData);
        
        return {
          ...prev,
          routeData: newRouteData,
          performanceMetrics: metrics,
        };
      });

      lastLocationRef.current = location;
    }
  }, [location, state.isRacing, calculatePerformanceMetrics]);

  // Load race data on mount if raceId provided
  useEffect(() => {
    if (raceId) {
      loadRaceData(raceId);
    }
  }, [raceId, loadRaceData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
      stopWatching();
    };
  }, [stopWatching]);

  return {
    ...state,
    currentLocation: location,
    startRace,
    endRace,
    pauseRace,
    resumeRace,
    saveRaceData,
    loadRaceData,
    calculatePerformanceMetrics,
  };
}