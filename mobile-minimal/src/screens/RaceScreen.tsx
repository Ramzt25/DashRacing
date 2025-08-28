import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '../utils/theme';
import { globalStyles } from '../styles/globalStyles';

export default function RaceScreen() {
  return (
    <View style={[globalStyles.garageContainer]}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={[globalStyles.garageCard, styles.headerCard]}>
          <Icon name="flash" size={48} color={colors.primary} style={styles.headerIcon} />
          <Text style={[globalStyles.garageTitle, styles.title]}>Race Modes</Text>
          <Text style={[globalStyles.garageSecondaryText, styles.subtitle]}>
            Choose your racing experience
          </Text>
        </View>

        {/* Race Modes */}
        <View style={[globalStyles.garageCard, styles.modesCard]}>
          <Text style={[globalStyles.garageSubtitle, styles.sectionTitle]}>Available Modes</Text>
          
          <TouchableOpacity style={[styles.modeItem, styles.comingSoon]}>
            <View style={styles.modeIcon}>
              <Icon name="speedometer" size={32} color={colors.textTertiary} />
            </View>
            <View style={styles.modeInfo}>
              <Text style={[globalStyles.garageBodyText, styles.modeTitle]}>Time Trial</Text>
              <Text style={[globalStyles.garageSecondaryText, styles.modeDesc]}>
                Race against the clock on your favorite tracks
              </Text>
            </View>
            <Icon name="lock-closed" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.modeItem, styles.comingSoon]}>
            <View style={styles.modeIcon}>
              <Icon name="people" size={32} color={colors.textTertiary} />
            </View>
            <View style={styles.modeInfo}>
              <Text style={[globalStyles.garageBodyText, styles.modeTitle]}>Multiplayer</Text>
              <Text style={[globalStyles.garageSecondaryText, styles.modeDesc]}>
                Challenge friends and players worldwide
              </Text>
            </View>
            <Icon name="lock-closed" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.modeItem, styles.comingSoon]}>
            <View style={styles.modeIcon}>
              <Icon name="trophy" size={32} color={colors.textTertiary} />
            </View>
            <View style={styles.modeInfo}>
              <Text style={[globalStyles.garageBodyText, styles.modeTitle]}>Championship</Text>
              <Text style={[globalStyles.garageSecondaryText, styles.modeDesc]}>
                Compete in seasonal tournaments
              </Text>
            </View>
            <Icon name="lock-closed" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.modeItem, styles.comingSoon]}>
            <View style={styles.modeIcon}>
              <Icon name="location" size={32} color={colors.textTertiary} />
            </View>
            <View style={styles.modeInfo}>
              <Text style={[globalStyles.garageBodyText, styles.modeTitle]}>Street Racing</Text>
              <Text style={[globalStyles.garageSecondaryText, styles.modeDesc]}>
                Location-based racing in your area
              </Text>
            </View>
            <Icon name="lock-closed" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Quick Race */}
        <View style={[globalStyles.garageCard, styles.quickRaceCard]}>
          <Icon name="play-circle" size={64} color={colors.textTertiary} />
          <Text style={[globalStyles.garageSubtitle, styles.quickRaceTitle]}>Quick Race</Text>
          <Text style={[globalStyles.garageSecondaryText, styles.quickRaceText]}>
            Need a car in your garage to start racing
          </Text>
          
          <TouchableOpacity style={[globalStyles.garageButtonSecondary, styles.quickRaceButton]} disabled>
            <Icon name="car-sport" size={20} color={colors.textTertiary} />
            <Text style={[globalStyles.garageButtonText, styles.disabledButtonText]}>Add Car First</Text>
          </TouchableOpacity>
        </View>

        {/* Features Preview */}
        <View style={[globalStyles.garageCard, styles.featuresCard]}>
          <Text style={[globalStyles.garageSubtitle, styles.sectionTitle]}>Racing Features</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Icon name="map" size={20} color={colors.textSecondary} />
              <Text style={[globalStyles.garageSecondaryText, styles.featureText]}>Multiple Track Types</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="settings" size={20} color={colors.textSecondary} />
              <Text style={[globalStyles.garageSecondaryText, styles.featureText]}>Difficulty Settings</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="analytics" size={20} color={colors.textSecondary} />
              <Text style={[globalStyles.garageSecondaryText, styles.featureText]}>Performance Analytics</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="medal" size={20} color={colors.textSecondary} />
              <Text style={[globalStyles.garageSecondaryText, styles.featureText]}>Achievements System</Text>
            </View>
          </View>
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
  modesCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modeItem: {
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
  modeIcon: {
    width: 48,
    alignItems: 'center',
  },
  modeInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  modeTitle: {
    marginBottom: spacing.xs,
    color: colors.textTertiary,
  },
  modeDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  quickRaceCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.md,
  },
  quickRaceTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    color: colors.textTertiary,
  },
  quickRaceText: {
    textAlign: 'center',
    marginBottom: spacing.lg,
    maxWidth: 280,
  },
  quickRaceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    borderColor: colors.textTertiary,
  },
  disabledButtonText: {
    marginLeft: spacing.sm,
    color: colors.textTertiary,
  },
  featuresCard: {
    marginBottom: spacing.md,
  },
  featureList: {
    gap: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  featureText: {
    marginLeft: spacing.md,
    flex: 1,
  },
});