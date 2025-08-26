import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, spacing, typography, shadows } from '../../utils/theme';
import { DashIcon } from '../DashIcon';
import { useRaceData } from '../../hooks/useRaceData';
import { Race } from '../../types/racing';

interface RaceTrackerProps {
  race: Race | null;
  onRaceEnd: () => void;
  onRacePause: () => void;
  onRaceResume: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function RaceTracker({ race, onRaceEnd, onRacePause, onRaceResume }: RaceTrackerProps) {
  const {
    isRacing,
    raceStartTime,
    currentLocation,
    performanceMetrics,
    routeData,
    startRace,
    endRace,
    pauseRace,
    resumeRace,
  } = useRaceData();

  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Update elapsed time every 100ms
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isRacing && raceStartTime && !isPaused) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - raceStartTime);
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRacing, raceStartTime, isPaused]);

  // Format time display
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  // Format speed display
  const formatSpeed = (speed: number): string => {
    return Math.round(speed).toString();
  };

  // Handle race start
  const handleStartRace = async () => {
    if (!race) return;
    
    Alert.alert(
      'Start Race',
      'Are you ready to start the race? Make sure you are in a safe, legal racing environment.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: async () => {
            try {
              await startRace(race);
            } catch (error) {
              Alert.alert('Error', 'Failed to start race. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Handle race end
  const handleEndRace = () => {
    Alert.alert(
      'End Race',
      'Are you sure you want to end the race?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Race',
          style: 'destructive',
          onPress: async () => {
            await endRace();
            onRaceEnd();
          },
        },
      ]
    );
  };

  // Handle pause/resume
  const handlePauseResume = async () => {
    if (isPaused) {
      await resumeRace();
      setIsPaused(false);
      onRaceResume();
    } else {
      await pauseRace();
      setIsPaused(true);
      onRacePause();
    }
  };

  if (!race) {
    return (
      <View style={styles.container}>
        <Text style={styles.noRaceText}>No active race</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[colors.background, colors.surface]}
      style={styles.container}
    >
      {/* Race Header */}
      <View style={styles.header}>
        <Text style={styles.raceTitle}>{race.location.name}</Text>
        <Text style={styles.raceType}>{race.raceType.toUpperCase()}</Text>
      </View>

      {/* Main Display */}
      <View style={styles.mainDisplay}>
        {/* Timer */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>TIME</Text>
          <Text style={styles.timerValue}>
            {isRacing ? formatTime(elapsedTime) : '00:00.00'}
          </Text>
        </View>

        {/* Speed */}
        <View style={styles.speedContainer}>
          <Text style={styles.speedValue}>
            {currentLocation?.speed ? formatSpeed(currentLocation.speed * 2.237) : '0'}
          </Text>
          <Text style={styles.speedLabel}>MPH</Text>
        </View>
      </View>

      {/* Performance Metrics */}
      {performanceMetrics && (
        <View style={styles.metricsContainer}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>0-60</Text>
            <Text style={styles.metricValue}>
              {performanceMetrics.zeroToSixty > 0 
                ? `${performanceMetrics.zeroToSixty.toFixed(2)}s` 
                : '--'}
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>1/4 MI</Text>
            <Text style={styles.metricValue}>
              {performanceMetrics.quarterMile > 0 
                ? `${performanceMetrics.quarterMile.toFixed(2)}s` 
                : '--'}
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>TOP</Text>
            <Text style={styles.metricValue}>
              {Math.round(performanceMetrics.topSpeed)} MPH
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>AVG</Text>
            <Text style={styles.metricValue}>
              {Math.round(performanceMetrics.averageSpeed)} MPH
            </Text>
          </View>
        </View>
      )}

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        {!isRacing ? (
          <TouchableOpacity style={styles.startButton} onPress={handleStartRace}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.buttonGradient}
            >
              <DashIcon name="live-race" size={24} color={colors.textPrimary} />
              <Text style={styles.buttonText}>START RACE</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.activeControls}>
            <TouchableOpacity 
              style={[styles.controlButton, isPaused && styles.resumeButton]} 
              onPress={handlePauseResume}
            >
              <LinearGradient
                colors={isPaused ? [colors.primary, colors.secondary] : [colors.warning, colors.secondary]}
                style={styles.buttonGradient}
              >
                <DashIcon 
                  name={isPaused ? "live-race" : "settings"} 
                  size={20} 
                  color={colors.textPrimary} 
                />
                <Text style={styles.controlButtonText}>
                  {isPaused ? 'RESUME' : 'PAUSE'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={handleEndRace}>
              <LinearGradient
                colors={['#FF3333', '#CC0000']}
                style={styles.buttonGradient}
              >
                <DashIcon name="settings" size={20} color={colors.textPrimary} />
                <Text style={styles.controlButtonText}>END</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Race Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {isPaused ? 'PAUSED' : isRacing ? 'RACING' : 'READY'}
        </Text>
        {routeData.length > 0 && (
          <Text style={styles.routeInfo}>
            {routeData.length} GPS points recorded
          </Text>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  noRaceText: {
    ...typography.h2,
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  raceTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  raceType: {
    ...typography.bodySecondary,
    color: colors.primary,
    fontWeight: '600',
    letterSpacing: 2,
  },
  mainDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  timerValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
    fontFamily: 'monospace',
  },
  speedContainer: {
    alignItems: 'center',
  },
  speedValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.textPrimary,
    fontFamily: 'monospace',
  },
  speedLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  metricValue: {
    ...typography.h3,
    color: colors.textPrimary,
    fontFamily: 'monospace',
  },
  controlsContainer: {
    marginBottom: spacing.lg,
  },
  startButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.md,
  },
  activeControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  controlButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.sm,
  },
  resumeButton: {
    flex: 2,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  buttonText: {
    ...typography.button,
    color: colors.textPrimary,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  controlButtonText: {
    ...typography.bodySecondary,
    color: colors.textPrimary,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  routeInfo: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});