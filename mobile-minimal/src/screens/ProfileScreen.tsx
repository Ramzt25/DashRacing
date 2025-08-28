import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '../utils/theme';
import { globalStyles } from '../styles/globalStyles';

export default function ProfileScreen() {
  return (
    <View style={[globalStyles.garageContainer]}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Profile Header */}
        <View style={[globalStyles.garageCard, styles.profileCard]}>
          <View style={styles.avatarContainer}>
            <Icon name="person-circle" size={80} color={colors.primary} />
          </View>
          <Text style={[globalStyles.garageTitle, styles.username]}>Guest User</Text>
          <Text style={[globalStyles.garageSecondaryText, styles.userStatus]}>
            Ready to race
          </Text>
          
          <TouchableOpacity style={[globalStyles.garageButtonSecondary, styles.editButton]}>
            <Icon name="create" size={20} color={colors.primary} />
            <Text style={[globalStyles.garageButtonText, styles.editButtonText]}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Racing Stats */}
        <View style={[globalStyles.garageCard, styles.statsCard]}>
          <Text style={[globalStyles.garageSubtitle, styles.sectionTitle]}>Racing Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Icon name="car-sport" size={28} color={colors.primary} />
              <Text style={[globalStyles.garageCaptionText]}>Cars Owned</Text>
              <Text style={[globalStyles.garageBodyText, styles.statValue]}>0</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="flash" size={28} color={colors.primary} />
              <Text style={[globalStyles.garageCaptionText]}>Races</Text>
              <Text style={[globalStyles.garageBodyText, styles.statValue]}>0</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="trophy" size={28} color={colors.primary} />
              <Text style={[globalStyles.garageCaptionText]}>Wins</Text>
              <Text style={[globalStyles.garageBodyText, styles.statValue]}>0</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="medal" size={28} color={colors.primary} />
              <Text style={[globalStyles.garageCaptionText]}>Achievements</Text>
              <Text style={[globalStyles.garageBodyText, styles.statValue]}>0</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={[globalStyles.garageCard, styles.actionsCard]}>
          <Text style={[globalStyles.garageSubtitle, styles.sectionTitle]}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIcon}>
              <Icon name="car-sport" size={24} color={colors.primary} />
            </View>
            <View style={styles.actionInfo}>
              <Text style={[globalStyles.garageBodyText, styles.actionTitle]}>My Garage</Text>
              <Text style={[globalStyles.garageSecondaryText, styles.actionDesc]}>
                Manage your vehicle collection
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIcon}>
              <Icon name="trophy" size={24} color={colors.primary} />
            </View>
            <View style={styles.actionInfo}>
              <Text style={[globalStyles.garageBodyText, styles.actionTitle]}>Achievements</Text>
              <Text style={[globalStyles.garageSecondaryText, styles.actionDesc]}>
                View your racing accomplishments
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIcon}>
              <Icon name="analytics" size={24} color={colors.primary} />
            </View>
            <View style={styles.actionInfo}>
              <Text style={[globalStyles.garageBodyText, styles.actionTitle]}>Race History</Text>
              <Text style={[globalStyles.garageSecondaryText, styles.actionDesc]}>
                Review your racing performance
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <View style={[globalStyles.garageCard, styles.settingsCard]}>
          <Text style={[globalStyles.garageSubtitle, styles.sectionTitle]}>Settings</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <Icon name="notifications" size={24} color={colors.textSecondary} />
            <Text style={[globalStyles.garageBodyText, styles.settingText]}>Notifications</Text>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Icon name="shield-checkmark" size={24} color={colors.textSecondary} />
            <Text style={[globalStyles.garageBodyText, styles.settingText]}>Privacy</Text>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Icon name="help-circle" size={24} color={colors.textSecondary} />
            <Text style={[globalStyles.garageBodyText, styles.settingText]}>Help & Support</Text>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Icon name="information-circle" size={24} color={colors.textSecondary} />
            <Text style={[globalStyles.garageBodyText, styles.settingText]}>About</Text>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Version Info */}
        <View style={[globalStyles.garageCard, styles.versionCard]}>
          <Text style={[globalStyles.garageCaptionText, styles.versionText]}>
            Dash Racing v1.0.0
          </Text>
          <Text style={[globalStyles.garageCaptionText, styles.versionText]}>
            Minimal Build
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
  profileCard: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  username: {
    marginBottom: spacing.xs,
  },
  userStatus: {
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  editButtonText: {
    marginLeft: spacing.sm,
    color: colors.primary,
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
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: spacing.md,
  },
  statItem: {
    alignItems: 'center',
    width: '40%',
    paddingVertical: spacing.sm,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: spacing.xs,
  },
  actionsCard: {
    marginBottom: spacing.md,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionIcon: {
    width: 40,
    alignItems: 'center',
  },
  actionInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  actionTitle: {
    marginBottom: spacing.xs,
  },
  actionDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  settingsCard: {
    marginBottom: spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  settingText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  versionCard: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  versionText: {
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
});