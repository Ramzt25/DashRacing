import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '../utils/theme';
import { globalStyles } from '../styles/globalStyles';
import { useAppContext } from '../context/AppContext';

export default function HomeScreen() {
  const { state } = useAppContext();
  const { raceStats, carData } = state;

  return (
    <View style={[globalStyles.garageContainer]}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Header Section */}
        <View style={[globalStyles.garageCard, styles.headerCard]}>
          <Icon name="flash" size={48} color={colors.primary} style={styles.headerIcon} />
          <Text style={[globalStyles.garageTitle, styles.title]}>Dash Racing</Text>
          <Text style={[globalStyles.garageSecondaryText, styles.subtitle]}>
            Welcome to the minimal racing experience
          </Text>
        </View>

        {/* Status Card */}
        <View style={[globalStyles.garageCard, styles.statusCard]}>
          <View style={styles.statusRow}>
            <Icon name="checkmark-circle" size={24} color={colors.primary} />
            <Text style={[globalStyles.garageBodyText, styles.statusText]}>
              Phase 1.1 - Basic app structure working!
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Icon name="construct" size={24} color={colors.warning} />
            <Text style={[globalStyles.garageBodyText, styles.statusText]}>
              Minimal build with local storage enabled
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={[globalStyles.garageCard, styles.statsCard]}>
          <Text style={[globalStyles.garageSubtitle, styles.sectionTitle]}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Icon name="car-sport" size={32} color={colors.primary} />
              <Text style={[globalStyles.garageCaptionText]}>Cars</Text>
              <Text style={[globalStyles.garageBodyText, styles.statValue]}>
                {carData.ownedCars.length}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="flash" size={32} color={colors.primary} />
              <Text style={[globalStyles.garageCaptionText]}>Races</Text>
              <Text style={[globalStyles.garageBodyText, styles.statValue]}>
                {raceStats.totalRaces}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="trophy" size={32} color={colors.primary} />
              <Text style={[globalStyles.garageCaptionText]}>Wins</Text>
              <Text style={[globalStyles.garageBodyText, styles.statValue]}>
                {raceStats.wins}
              </Text>
            </View>
          </View>
        </View>

        {/* Features Preview */}
        <View style={[globalStyles.garageCard, styles.featuresCard]}>
          <Text style={[globalStyles.garageSubtitle, styles.sectionTitle]}>Features</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Icon name="home" size={20} color={colors.textSecondary} />
              <Text style={[globalStyles.garageSecondaryText, styles.featureText]}>Dashboard & Overview</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="car-sport" size={20} color={colors.textSecondary} />
              <Text style={[globalStyles.garageSecondaryText, styles.featureText]}>Garage Management</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="flash" size={20} color={colors.textSecondary} />
              <Text style={[globalStyles.garageSecondaryText, styles.featureText]}>Racing Modes</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="trophy" size={20} color={colors.textSecondary} />
              <Text style={[globalStyles.garageSecondaryText, styles.featureText]}>Leaderboards</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="person" size={20} color={colors.textSecondary} />
              <Text style={[globalStyles.garageSecondaryText, styles.featureText]}>Profile & Progress</Text>
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
  statusCard: {
    marginBottom: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  statsCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    textAlign: 'center',
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
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: spacing.xs,
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