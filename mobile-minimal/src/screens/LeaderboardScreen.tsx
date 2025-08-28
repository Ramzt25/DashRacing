import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '../utils/theme';
import { globalStyles } from '../styles/globalStyles';

export default function LeaderboardScreen() {
  return (
    <View style={[globalStyles.garageContainer]}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={[globalStyles.garageCard, styles.headerCard]}>
          <Icon name="trophy" size={48} color={colors.primary} style={styles.headerIcon} />
          <Text style={[globalStyles.garageTitle, styles.title]}>Leaderboards</Text>
          <Text style={[globalStyles.garageSecondaryText, styles.subtitle]}>
            Compete with the best racers
          </Text>
        </View>

        {/* Leaderboard Categories */}
        <View style={[globalStyles.garageCard, styles.categoriesCard]}>
          <Text style={[globalStyles.garageSubtitle, styles.sectionTitle]}>Categories</Text>
          
          <TouchableOpacity style={[styles.categoryItem, styles.comingSoon]}>
            <View style={styles.categoryIcon}>
              <Icon name="speedometer" size={28} color={colors.textTertiary} />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={[globalStyles.garageBodyText, styles.categoryTitle]}>Global Rankings</Text>
              <Text style={[globalStyles.garageSecondaryText, styles.categoryDesc]}>
                Top racers worldwide
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.categoryItem, styles.comingSoon]}>
            <View style={styles.categoryIcon}>
              <Icon name="location" size={28} color={colors.textTertiary} />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={[globalStyles.garageBodyText, styles.categoryTitle]}>Local Champions</Text>
              <Text style={[globalStyles.garageSecondaryText, styles.categoryDesc]}>
                Best in your area
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.categoryItem, styles.comingSoon]}>
            <View style={styles.categoryIcon}>
              <Icon name="people" size={28} color={colors.textTertiary} />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={[globalStyles.garageBodyText, styles.categoryTitle]}>Friends</Text>
              <Text style={[globalStyles.garageSecondaryText, styles.categoryDesc]}>
                Challenge your friends
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.categoryItem, styles.comingSoon]}>
            <View style={styles.categoryIcon}>
              <Icon name="time" size={28} color={colors.textTertiary} />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={[globalStyles.garageBodyText, styles.categoryTitle]}>Weekly</Text>
              <Text style={[globalStyles.garageSecondaryText, styles.categoryDesc]}>
                This week's top performers
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Sample Leaderboard */}
        <View style={[globalStyles.garageCard, styles.sampleCard]}>
          <Text style={[globalStyles.garageSubtitle, styles.sectionTitle]}>Global Top 10</Text>
          <Text style={[globalStyles.garageSecondaryText, styles.placeholderText]}>
            Leaderboard data will appear here once racing begins
          </Text>

          {/* Mock Leaderboard Entries */}
          <View style={styles.leaderboardList}>
            {[1, 2, 3, 4, 5].map((position) => (
              <View key={position} style={styles.leaderboardItem}>
                <View style={styles.positionBadge}>
                  <Text style={styles.positionText}>{position}</Text>
                </View>
                <View style={styles.playerInfo}>
                  <Text style={[globalStyles.garageBodyText, styles.playerName]}>---</Text>
                  <Text style={[globalStyles.garageSecondaryText, styles.playerScore]}>No data</Text>
                </View>
                <Icon name="car-sport-outline" size={20} color={colors.textTertiary} />
              </View>
            ))}
          </View>
        </View>

        {/* Your Stats */}
        <View style={[globalStyles.garageCard, styles.statsCard]}>
          <Text style={[globalStyles.garageSubtitle, styles.sectionTitle]}>Your Performance</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Icon name="trophy" size={32} color={colors.textTertiary} />
              <Text style={[globalStyles.garageCaptionText]}>Global Rank</Text>
              <Text style={[globalStyles.garageBodyText, styles.statValue]}>---</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="speedometer" size={32} color={colors.textTertiary} />
              <Text style={[globalStyles.garageCaptionText]}>Best Time</Text>
              <Text style={[globalStyles.garageBodyText, styles.statValue]}>---</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="medal" size={32} color={colors.textTertiary} />
              <Text style={[globalStyles.garageCaptionText]}>Achievements</Text>
              <Text style={[globalStyles.garageBodyText, styles.statValue]}>0</Text>
            </View>
          </View>
        </View>

        {/* Get Started */}
        <View style={[globalStyles.garageCard, styles.getStartedCard]}>
          <Icon name="flag" size={48} color={colors.textTertiary} />
          <Text style={[globalStyles.garageSubtitle, styles.getStartedTitle]}>Start Racing</Text>
          <Text style={[globalStyles.garageSecondaryText, styles.getStartedText]}>
            Add cars to your garage and start racing to appear on leaderboards!
          </Text>
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
  content: {
    padding: spacing.sm,
  },
  headerCard: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerIcon: {
    marginBottom: spacing.sm,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    textAlign: 'center',
  },
  categoriesCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  comingSoon: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  categoryIcon: {
    width: 40,
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  categoryTitle: {
    marginBottom: spacing.xs,
    color: colors.textTertiary,
  },
  categoryDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  sampleCard: {
    marginBottom: spacing.md,
  },
  placeholderText: {
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontStyle: 'italic',
  },
  leaderboardList: {
    gap: spacing.sm,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  positionBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  positionText: {
    color: colors.textTertiary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    marginBottom: spacing.xs,
    color: colors.textTertiary,
  },
  playerScore: {
    fontSize: 12,
  },
  statsCard: {
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: spacing.xs,
    color: colors.textTertiary,
  },
  getStartedCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.md,
  },
  getStartedTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    color: colors.textTertiary,
  },
  getStartedText: {
    textAlign: 'center',
    maxWidth: 280,
  },
});