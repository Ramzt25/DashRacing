import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, spacing, typography, shadows } from '../../utils/theme';
import { DashIcon } from '../DashIcon';
import { LiveRaceData } from '../../types/racing';

interface LiveLeaderboardProps {
  liveData: LiveRaceData;
  currentUserId?: string;
  onParticipantPress?: (participantId: string) => void;
}

interface AnimatedPosition {
  participantId: string;
  position: number;
  animatedValue: Animated.Value;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function LiveLeaderboard({ 
  liveData, 
  currentUserId, 
  onParticipantPress 
}: LiveLeaderboardProps) {
  const [animatedPositions, setAnimatedPositions] = useState<AnimatedPosition[]>([]);
  const [sortBy, setSortBy] = useState<'position' | 'time' | 'speed'>('position');

  // Initialize animated values for position changes
  useEffect(() => {
    const newAnimatedPositions = liveData.leaderboard.map((entry, index) => ({
      participantId: entry.participantId,
      position: entry.position,
      animatedValue: new Animated.Value(index),
    }));
    setAnimatedPositions(newAnimatedPositions);
  }, []);

  // Animate position changes
  useEffect(() => {
    const animations: Animated.CompositeAnimation[] = [];
    
    liveData.leaderboard.forEach((entry, newIndex) => {
      const animatedPos = animatedPositions.find(
        (ap) => ap.participantId === entry.participantId
      );
      
      if (animatedPos) {
        animations.push(
          Animated.timing(animatedPos.animatedValue, {
            toValue: newIndex,
            duration: 500,
            useNativeDriver: false,
          })
        );
      }
    });

    if (animations.length > 0) {
      Animated.parallel(animations).start();
    }
  }, [liveData.leaderboard, animatedPositions]);

  // Format time gap
  const formatGap = (gap: number): string => {
    if (gap === 0) return 'LEADER';
    if (gap < 60) return `+${gap.toFixed(1)}s`;
    const minutes = Math.floor(gap / 60);
    const seconds = gap % 60;
    return `+${minutes}:${seconds.toFixed(1)}`;
  };

  // Get position color
  const getPositionColor = (position: number): string => {
    switch (position) {
      case 1: return '#FFD700'; // Gold
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#CD7F32'; // Bronze
      default: return colors.textSecondary;
    }
  };

  // Get position icon
  const getPositionIcon = (position: number): string => {
    switch (position) {
      case 1: return '';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  // Sort leaderboard
  const getSortedLeaderboard = () => {
    const sorted = [...liveData.leaderboard];
    
    switch (sortBy) {
      case 'position':
        return sorted.sort((a, b) => a.position - b.position);
      case 'time':
        return sorted.sort((a, b) => a.gap - b.gap);
      case 'speed':
        const positionData = liveData.currentPositions;
        return sorted.sort((a, b) => {
          const aSpeed = positionData.find(p => p.participantId === a.participantId)?.currentSpeed || 0;
          const bSpeed = positionData.find(p => p.participantId === b.participantId)?.currentSpeed || 0;
          return bSpeed - aSpeed;
        });
      default:
        return sorted;
    }
  };

  const sortedLeaderboard = getSortedLeaderboard();

  return (
    <LinearGradient
      colors={[colors.background, colors.surface]}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <DashIcon name="live-race" size={24} color={colors.primary} />
          <Text style={styles.title}>Live Leaderboard</Text>
        </View>
        
        {/* Race Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={[styles.progressFill, { width: `${liveData.raceProgress}%` }]}
            />
          </View>
          <Text style={styles.progressText}>{Math.round(liveData.raceProgress)}%</Text>
        </View>
      </View>

      {/* Sort Controls */}
      <View style={styles.sortContainer}>
        {(['position', 'time', 'speed'] as const).map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.sortButton,
              sortBy === option && styles.sortButtonActive,
            ]}
            onPress={() => setSortBy(option)}
          >
            <Text style={[
              styles.sortButtonText,
              sortBy === option && styles.sortButtonTextActive,
            ]}>
              {option.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Leaderboard */}
      <ScrollView style={styles.leaderboard} showsVerticalScrollIndicator={false}>
        {sortedLeaderboard.map((entry, index) => {
          const positionData = liveData.currentPositions.find(
            (p) => p.participantId === entry.participantId
          );
          const isCurrentUser = entry.participantId === currentUserId;

          return (
            <TouchableOpacity
              key={entry.participantId}
              style={[
                styles.leaderboardItem,
                isCurrentUser && styles.currentUserItem,
              ]}
              onPress={() => onParticipantPress?.(entry.participantId)}
            >
              <LinearGradient
                colors={isCurrentUser 
                  ? [colors.primary + '20', colors.secondary + '20']
                  : [colors.surfaceSecondary, colors.surfaceElevated]
                }
                style={styles.itemGradient}
              >
                {/* Position */}
                <View style={styles.positionContainer}>
                  <Text style={[
                    styles.positionNumber,
                    { color: getPositionColor(entry.position) }
                  ]}>
                    {entry.position}
                  </Text>
                  <Text style={styles.positionIcon}>
                    {getPositionIcon(entry.position)}
                  </Text>
                </View>

                {/* User Info */}
                <View style={styles.userInfo}>
                  <Text style={[
                    styles.username,
                    isCurrentUser && styles.currentUserText,
                  ]}>
                    {entry.username}
                    {isCurrentUser && ' (You)'}
                  </Text>
                  
                  {/* Stats */}
                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Gap</Text>
                      <Text style={styles.statValue}>{formatGap(entry.gap)}</Text>
                    </View>
                    
                    {positionData && (
                      <>
                        <View style={styles.statItem}>
                          <Text style={styles.statLabel}>Speed</Text>
                          <Text style={styles.statValue}>
                            {Math.round(positionData.currentSpeed * 2.237)} MPH
                          </Text>
                        </View>
                        
                        {positionData.lastLapTime && (
                          <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Last Lap</Text>
                            <Text style={styles.statValue}>
                              {positionData.lastLapTime.toFixed(2)}s
                            </Text>
                          </View>
                        )}
                      </>
                    )}
                  </View>
                </View>

                {/* Best Lap */}
                {entry.fastestLap && (
                  <View style={styles.bestLapContainer}>
                    <Text style={styles.bestLapLabel}>Best</Text>
                    <Text style={styles.bestLapTime}>
                      {entry.fastestLap.toFixed(2)}s
                    </Text>
                  </View>
                )}

                {/* Live Indicator */}
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Race Info Footer */}
      <View style={styles.footer}>
        {liveData.timeRemaining && (
          <Text style={styles.timeRemaining}>
            Time Remaining: {Math.floor(liveData.timeRemaining / 60)}:
            {(liveData.timeRemaining % 60).toString().padStart(2, '0')}
          </Text>
        )}
        
        {liveData.currentLap && liveData.totalLaps && (
          <Text style={styles.lapInfo}>
            Lap {liveData.currentLap} of {liveData.totalLaps}
          </Text>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  sortContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    padding: 4,
  },
  sortButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 6,
  },
  sortButtonActive: {
    backgroundColor: colors.primary,
  },
  sortButtonText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  sortButtonTextActive: {
    color: colors.textPrimary,
  },
  leaderboard: {
    flex: 1,
  },
  leaderboardItem: {
    marginBottom: spacing.sm,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.sm,
  },
  currentUserItem: {
    ...shadows.md,
  },
  itemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  positionContainer: {
    alignItems: 'center',
    minWidth: 40,
  },
  positionNumber: {
    ...typography.h2,
    fontWeight: 'bold',
  },
  positionIcon: {
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  currentUserText: {
    color: colors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statValue: {
    ...typography.bodySecondary,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  bestLapContainer: {
    alignItems: 'center',
  },
  bestLapLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  bestLapTime: {
    ...typography.bodySecondary,
    color: colors.primary,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  liveIndicator: {
    alignItems: 'center',
    gap: 2,
  },
  liveDot: {
    width: 8,
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  liveText: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSecondary,
    alignItems: 'center',
    gap: spacing.xs,
  },
  timeRemaining: {
    ...typography.bodySecondary,
    color: colors.textSecondary,
  },
  lapInfo: {
    ...typography.bodySecondary,
    color: colors.primary,
    fontWeight: '600',
  },
});
