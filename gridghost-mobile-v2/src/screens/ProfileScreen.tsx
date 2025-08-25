import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { useAuth } from '../context/AuthContext';
import { colors, typography, spacing, shadows } from '../utils/theme';

export function ProfileScreen({ navigation }: any) {
  const { user, refreshUser } = useAuth();

  // Refresh user data when screen opens
  useEffect(() => {
    refreshUser();
  }, []);

  const userStats = {
    level: 25,
    experience: 8750,
    nextLevelExp: 10000,
    totalRaces: 120,
    wins: 87,
    losses: 33,
    winRate: 72.5,
    totalEarnings: 125000,
    currentCash: 45000,
    favoriteClass: 'Hypercar',
    bestTime: '1:23.45',
  };

  const achievements = [
    { id: '1', name: 'Speed Demon', description: 'Win 50 races', unlocked: true },
    { id: '2', name: 'Drift King', description: 'Perfect drift combo x10', unlocked: true },
    { id: '3', name: 'High Roller', description: 'Earn $100,000', unlocked: true },
    { id: '4', name: 'Track Master', description: 'Win on every track', unlocked: false },
    { id: '5', name: 'Millionaire', description: 'Earn $1,000,000', unlocked: false },
  ];

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing coming soon!');
  };

  const handleSettings = () => {
    Alert.alert('Settings', 'Settings panel coming soon!');
  };

  const handleLeaderboard = () => {
    Alert.alert('Leaderboard', 'Global leaderboard coming soon!');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="Profile"
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity onPress={handleSettings}>
            <Ionicons name="settings" size={24} color={colors.primary} />
          </TouchableOpacity>
        }
      />
    <ScrollView style={styles.scrollView}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={48} color={colors.primary} />
        </View>
        <Text style={styles.username}>
          {user?.displayName || user?.handle || 'GridGhost Racer'}
        </Text>
        <Text style={styles.handle}>@{user?.handle || 'unknown'}</Text>
        
        {/* Pro Status Badge */}
        {user?.isPro && (
          <View style={styles.proBadge}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.proBadgeGradient}
            >
              <Ionicons name="diamond" size={16} color="#000" />
              <Text style={styles.proText}>
                PRO {user.subscriptionTier?.toUpperCase() || 'MEMBER'}
              </Text>
            </LinearGradient>
          </View>
        )}
        
        <Text style={styles.level}>Level {userStats.level}</Text>
        
        {/* Experience Bar */}
        <View style={styles.expContainer}>
          <View style={styles.expBar}>
            <View 
              style={[
                styles.expFill, 
                { width: `${(userStats.experience / userStats.nextLevelExp) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.expText}>
            {userStats.experience}/{userStats.nextLevelExp} XP
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Racing Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userStats.totalRaces}</Text>
            <Text style={styles.statLabel}>Total Races</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userStats.wins}</Text>
            <Text style={styles.statLabel}>Wins</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userStats.winRate}%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userStats.bestTime}</Text>
            <Text style={styles.statLabel}>Best Time</Text>
          </View>
        </View>
      </View>

      {/* Financial Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Finances</Text>
        <View style={styles.financeCard}>
          <View style={styles.financeRow}>
            <Text style={styles.financeLabel}>Current Cash</Text>
            <Text style={styles.cashValue}>${userStats.currentCash.toLocaleString()}</Text>
          </View>
          <View style={styles.financeRow}>
            <Text style={styles.financeLabel}>Total Earnings</Text>
            <Text style={styles.earningsValue}>${userStats.totalEarnings.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {/* Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        {achievements.map((achievement) => (
          <View key={achievement.id} style={[
            styles.achievementCard,
            !achievement.unlocked && styles.lockedAchievement
          ]}>
            <Ionicons 
              name={achievement.unlocked ? "trophy" : "lock-closed"} 
              size={24} 
              color={achievement.unlocked ? "#ffaa00" : "#666"} 
            />
            <View style={styles.achievementInfo}>
              <Text style={[
                styles.achievementName,
                !achievement.unlocked && styles.lockedText
              ]}>
                {achievement.name}
              </Text>
              <Text style={styles.achievementDescription}>
                {achievement.description}
              </Text>
            </View>
            {achievement.unlocked && (
              <Ionicons name="checkmark-circle" size={20} color="#00ff88" />
            )}
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
          <Ionicons name="create" size={20} color={colors.background} />
          <Text style={styles.actionText}>Edit Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={handleLeaderboard}>
          <Ionicons name="podium" size={20} color={colors.primary} />
          <Text style={[styles.actionText, styles.secondaryText]}>Leaderboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={handleSettings}>
          <Ionicons name="settings" size={20} color={colors.primary} />
          <Text style={[styles.actionText, styles.secondaryText]}>Settings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSecondary,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
    marginBottom: spacing.sm,
  },
  username: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  handle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  proBadge: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  proBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  proText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  level: {
    ...typography.body,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  expContainer: {
    width: '100%',
    alignItems: 'center',
  },
  expBar: {
    width: '80%',
    height: 8,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  expFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  expText: {
    ...typography.caption,
  },
  section: {
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceSecondary,
    ...shadows.sm,
  },
  statValue: {
    ...typography.h2,
    color: colors.primary,
  },
  statLabel: {
    ...typography.caption,
    marginTop: 4,
  },
  financeCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceSecondary,
    ...shadows.sm,
  },
  financeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  financeLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  cashValue: {
    ...typography.h3,
    color: colors.primary,
  },
  earningsValue: {
    ...typography.body,
    color: colors.warning,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.surfaceSecondary,
    ...shadows.sm,
  },
  lockedAchievement: {
    opacity: 0.6,
  },
  achievementInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  achievementName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  lockedText: {
    color: colors.textTertiary,
  },
  achievementDescription: {
    ...typography.bodySecondary,
    marginTop: 2,
  },
  actionContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  actionText: {
    ...typography.button,
    color: colors.background,
    marginLeft: spacing.sm,
  },
  secondaryText: {
    color: colors.primary,
  },
});