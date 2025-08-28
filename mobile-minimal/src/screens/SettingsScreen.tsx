import React from 'react';
import {View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '../utils/theme';
import { globalStyles } from '../styles/globalStyles';
import { useAppContext } from '../context/AppContext';

export default function SettingsScreen() {
  const { state, updateUserPreferences, updateAppSettings } = useAppContext();
  const { userPreferences, appSettings } = state;

  const toggleNotifications = () => {
    updateUserPreferences({
      ...userPreferences,
      notifications: !userPreferences.notifications,
    });
  };

  const toggleLocation = () => {
    updateUserPreferences({
      ...userPreferences,
      location: !userPreferences.location,
    });
  };

  const toggleSound = () => {
    updateAppSettings({
      ...appSettings,
      soundEnabled: !appSettings.soundEnabled,
    });
  };

  const toggleVibration = () => {
    updateAppSettings({
      ...appSettings,
      vibrationEnabled: !appSettings.vibrationEnabled,
    });
  };

  return (
    <View style={[globalStyles.garageContainer]}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={[globalStyles.garageCard, styles.headerCard]}>
          <Icon name="settings" size={48} color={colors.primary} style={styles.headerIcon} />
          <Text style={[globalStyles.garageTitle, styles.title]}>Settings</Text>
          <Text style={[globalStyles.garageSecondaryText, styles.subtitle]}>
            Customize your Dash Racing experience
          </Text>
        </View>

        {/* App Settings */}
        <View style={[globalStyles.garageCard, styles.sectionCard]}>
          <Text style={[globalStyles.garageSubtitle, styles.sectionTitle]}>App Settings</Text>
          
          <View style={styles.settingItem}>
            <Icon name="notifications" size={24} color={colors.primary} />
            <View style={styles.settingInfo}>
              <Text style={[globalStyles.garageBodyText, styles.settingLabel]}>Notifications</Text>
              <Text style={[globalStyles.garageSecondaryText, styles.settingDesc]}>
                Race alerts and updates
              </Text>
            </View>
            <Switch
              value={userPreferences.notifications}
              onValueChange={toggleNotifications}
              trackColor={{ false: colors.surfaceSecondary, true: colors.primary }}
              thumbColor={colors.textPrimary}
            />
          </View>

          <View style={styles.settingItem}>
            <Icon name="location" size={24} color={colors.primary} />
            <View style={styles.settingInfo}>
              <Text style={[globalStyles.garageBodyText, styles.settingLabel]}>Location Services</Text>
              <Text style={[globalStyles.garageSecondaryText, styles.settingDesc]}>
                Find nearby races and events
              </Text>
            </View>
            <Switch
              value={userPreferences.location}
              onValueChange={toggleLocation}
              trackColor={{ false: colors.surfaceSecondary, true: colors.primary }}
              thumbColor={colors.textPrimary}
            />
          </View>

          <View style={styles.settingItem}>
            <Icon name="volume-high" size={24} color={colors.primary} />
            <View style={styles.settingInfo}>
              <Text style={[globalStyles.garageBodyText, styles.settingLabel]}>Sound Effects</Text>
              <Text style={[globalStyles.garageSecondaryText, styles.settingDesc]}>
                Engine sounds and alerts
              </Text>
            </View>
            <Switch
              value={appSettings.soundEnabled}
              onValueChange={toggleSound}
              trackColor={{ false: colors.surfaceSecondary, true: colors.primary }}
              thumbColor={colors.textPrimary}
            />
          </View>

          <View style={styles.settingItem}>
            <Icon name="phone-portrait" size={24} color={colors.primary} />
            <View style={styles.settingInfo}>
              <Text style={[globalStyles.garageBodyText, styles.settingLabel]}>Vibration</Text>
              <Text style={[globalStyles.garageSecondaryText, styles.settingDesc]}>
                Haptic feedback
              </Text>
            </View>
            <Switch
              value={appSettings.vibrationEnabled}
              onValueChange={toggleVibration}
              trackColor={{ false: colors.surfaceSecondary, true: colors.primary }}
              thumbColor={colors.textPrimary}
            />
          </View>
        </View>

        {/* About */}
        <View style={[globalStyles.garageCard, styles.aboutCard]}>
          <Text style={[globalStyles.garageSubtitle, styles.sectionTitle]}>About</Text>
          
          <View style={styles.aboutInfo}>
            <Icon name="information-circle" size={32} color={colors.primary} />
            <View style={styles.aboutText}>
              <Text style={[globalStyles.garageBodyText, styles.appName]}>Dash Racing</Text>
              <Text style={[globalStyles.garageSecondaryText, styles.version]}>Version 1.0.0</Text>
              <Text style={[globalStyles.garageCaptionText, styles.buildInfo]}>Minimal Build with Storage</Text>
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
  sectionCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    textAlign: 'left',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  settingLabel: {
    marginBottom: spacing.xs,
  },
  settingDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  aboutCard: {
    marginBottom: spacing.md,
  },
  aboutInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  aboutText: {
    marginLeft: spacing.md,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  version: {
    marginBottom: spacing.xs,
  },
  buildInfo: {
    fontSize: 10,
  },
});