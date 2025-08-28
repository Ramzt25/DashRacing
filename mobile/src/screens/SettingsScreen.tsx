import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Switch 
} from 'react-native';
import { useSettings, SpeedUnit } from '../context/SettingsContext';
import { colors, spacing, typography, shadows } from '../utils/theme';
import { DashIcon } from '../components/DashIcon';
import { ScreenHeader } from '../components/common/ScreenHeader';
import ScreenContainer from '../components/layout/ScreenContainer';
import { globalStyles } from '../styles/globalStyles';

export function SettingsScreen({ navigation }: any) {
  const { 
    settings, 
    updateSpeedUnit, 
    updateNotifications, 
    updateSounds, 
    updateAutoStartGPS,
    getSpeedUnitLabel 
  } = useSettings();

  const speedUnitOptions: { value: SpeedUnit; label: string; description: string }[] = [
    { value: 'mph', label: 'MPH', description: 'Miles per Hour (Imperial)' },
    { value: 'kmh', label: 'KM/H', description: 'Kilometers per Hour (Metric)' },
  ];

  const renderSpeedUnitSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Speed Units</Text>
      <Text style={styles.sectionDescription}>
        Choose your preferred speed measurement unit
      </Text>
      
      {speedUnitOptions.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            globalStyles.garageCard,
            styles.optionCard,
            settings.speedUnit === option.value && styles.optionCardActive
          ]}
          onPress={() => updateSpeedUnit(option.value)}
        >
          <View style={styles.optionContent}>
            <View style={styles.optionInfo}>
              <Text style={[
                styles.optionTitle,
                settings.speedUnit === option.value && styles.optionTitleActive
              ]}>
                {option.label}
              </Text>
              <Text style={styles.optionDescription}>
                {option.description}
              </Text>
            </View>
            
            {settings.speedUnit === option.value && (
              <View style={styles.selectedIndicator}>
                <DashIcon name="events" size={20} color={colors.primary} />
              </View>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderToggleSettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>App Preferences</Text>
      
      <View style={styles.toggleOption}>
        <View style={styles.toggleInfo}>
          <Text style={styles.toggleTitle}>Notifications</Text>
          <Text style={styles.toggleDescription}>
            Receive race alerts and updates
          </Text>
        </View>
        <Switch
          value={settings.enableNotifications}
          onValueChange={updateNotifications}
          trackColor={{ false: colors.surfaceSecondary, true: colors.primary + '40' }}
          thumbColor={settings.enableNotifications ? colors.primary : colors.textSecondary}
        />
      </View>
      
      <View style={styles.toggleOption}>
        <View style={styles.toggleInfo}>
          <Text style={styles.toggleTitle}>Sound Effects</Text>
          <Text style={styles.toggleDescription}>
            Play sounds for race events
          </Text>
        </View>
        <Switch
          value={settings.enableSounds}
          onValueChange={updateSounds}
          trackColor={{ false: colors.surfaceSecondary, true: colors.primary + '40' }}
          thumbColor={settings.enableSounds ? colors.primary : colors.textSecondary}
        />
      </View>
      
      <View style={styles.toggleOption}>
        <View style={styles.toggleInfo}>
          <Text style={styles.toggleTitle}>Auto-Start GPS</Text>
          <Text style={styles.toggleDescription}>
            Automatically enable GPS when opening map
          </Text>
        </View>
        <Switch
          value={settings.autoStartGPS}
          onValueChange={updateAutoStartGPS}
          trackColor={{ false: colors.surfaceSecondary, true: colors.primary + '40' }}
          thumbColor={settings.autoStartGPS ? colors.primary : colors.textSecondary}
        />
      </View>
    </View>
  );

  return (
    <ScreenContainer hideTopInset={true}>
      <ScreenHeader 
        title="Settings"
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView 
        style={[globalStyles.fullWidthScreen, styles.scrollView]}
        contentContainerStyle={[globalStyles.garageContainer, styles.scrollContent]}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Settings Summary */}
        <View style={[globalStyles.garageCard, styles.summaryCard]}>
          <View style={styles.summaryRow}>
            <DashIcon name="timer" size={24} color={colors.primary} />
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>Speed Unit</Text>
              <Text style={styles.summaryValue}>{getSpeedUnitLabel()}</Text>
            </View>
          </View>
        </View>        {/* Speed Units Section */}
        {renderSpeedUnitSelector()}

        {/* Toggle Settings */}
        {renderToggleSettings()}

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={[globalStyles.garageCard, styles.aboutCard]}>
            <Text style={styles.aboutTitle}>DASH Racing Platform</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            <Text style={styles.aboutDescription}>
              Professional mobile racing platform with real-time GPS tracking,
              live leaderboards, and community features.
            </Text>
          </View>
        </View>
        </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    ...typography.bodySecondary,
    color: colors.textSecondary,
  },
  
  // Summary Card
  summaryCard: {
    margin: spacing.lg,
    marginTop: 0,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.md,
  },
  summaryGradient: {
    padding: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  summaryLabel: {
    ...typography.bodySecondary,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.h3,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  
  // Sections
  section: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  sectionDescription: {
    ...typography.bodySecondary,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  
  // Speed Unit Options
  optionCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  optionCardActive: {
    ...shadows.md,
  },
  optionGradient: {
    padding: spacing.md,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  optionTitleActive: {
    color: colors.primary,
  },
  optionDescription: {
    ...typography.bodySecondary,
    color: colors.textSecondary,
  },
  selectedIndicator: {
    padding: spacing.sm,
  },
  
  // Toggle Settings
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleTitle: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  toggleDescription: {
    ...typography.bodySecondary,
    color: colors.textSecondary,
  },
  
  // About Section
  aboutCard: {
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.sm,
  },
  aboutGradient: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  aboutTitle: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  aboutVersion: {
    ...typography.bodySecondary,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  aboutDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});