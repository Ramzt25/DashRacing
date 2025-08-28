import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '../utils/theme';
import { globalStyles } from '../styles/globalStyles';

export default function MeetupScreen() {
  return (
    <View style={[globalStyles.garageContainer]}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={[globalStyles.garageCard, styles.headerCard]}>
          <Icon name="calendar" size={48} color={colors.primary} style={styles.headerIcon} />
          <Text style={[globalStyles.garageTitle, styles.title]}>Create Meetup</Text>
          <Text style={[globalStyles.garageSecondaryText, styles.subtitle]}>
            Organize racing events and gatherings
          </Text>
        </View>

        {/* Quick Create */}
        <View style={[globalStyles.garageCard, styles.quickCreateCard]}>
          <Text style={[globalStyles.garageSubtitle, styles.sectionTitle]}>Quick Create</Text>
          
          <TouchableOpacity style={styles.createOption}>
            <View style={styles.optionIcon}>
              <Icon name="flash" size={32} color={colors.primary} />
            </View>
            <View style={styles.optionInfo}>
              <Text style={[globalStyles.garageBodyText, styles.optionTitle]}>Instant Race</Text>
              <Text style={[globalStyles.garageSecondaryText, styles.optionDesc]}>
                Start a race right now
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.createOption}>
            <View style={styles.optionIcon}>
              <Icon name="time" size={32} color={colors.primary} />
            </View>
            <View style={styles.optionInfo}>
              <Text style={[globalStyles.garageBodyText, styles.optionTitle]}>Scheduled Event</Text>
              <Text style={[globalStyles.garageSecondaryText, styles.optionDesc]}>
                Plan for later
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.createOption}>
            <View style={styles.optionIcon}>
              <Icon name="people" size={32} color={colors.primary} />
            </View>
            <View style={styles.optionInfo}>
              <Text style={[globalStyles.garageBodyText, styles.optionTitle]}>Group Meetup</Text>
              <Text style={[globalStyles.garageSecondaryText, styles.optionDesc]}>
                Invite friends and groups
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Event Templates */}
        <View style={[globalStyles.garageCard, styles.templatesCard]}>
          <Text style={[globalStyles.garageSubtitle, styles.sectionTitle]}>Event Templates</Text>
          
          <View style={styles.templateGrid}>
            <TouchableOpacity style={styles.templateItem}>
              <Icon name="speedometer" size={28} color={colors.primary} />
              <Text style={[globalStyles.garageCaptionText, styles.templateLabel]}>Time Trial</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.templateItem}>
              <Icon name="trophy" size={28} color={colors.primary} />
              <Text style={[globalStyles.garageCaptionText, styles.templateLabel]}>Tournament</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.templateItem}>
              <Icon name="car-sport" size={28} color={colors.primary} />
              <Text style={[globalStyles.garageCaptionText, styles.templateLabel]}>Car Show</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.templateItem}>
              <Icon name="location" size={28} color={colors.primary} />
              <Text style={[globalStyles.garageCaptionText, styles.templateLabel]}>Road Trip</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* My Events */}
        <View style={[globalStyles.garageCard, styles.eventsCard]}>
          <Text style={[globalStyles.garageSubtitle, styles.sectionTitle]}>My Events</Text>
          
          <View style={styles.eventsList}>
            <View style={styles.eventItem}>
              <View style={styles.eventIcon}>
                <Icon name="calendar-outline" size={24} color={colors.textTertiary} />
              </View>
              <View style={styles.eventInfo}>
                <Text style={[globalStyles.garageBodyText, styles.eventTitle]}>No events created</Text>
                <Text style={[globalStyles.garageSecondaryText, styles.eventDesc]}>
                  Create your first event to get started
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Event Settings */}
        <View style={[globalStyles.garageCard, styles.settingsCard]}>
          <Text style={[globalStyles.garageSubtitle, styles.sectionTitle]}>Event Settings</Text>
          
          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <Icon name="location" size={20} color={colors.textSecondary} />
              <Text style={[globalStyles.garageSecondaryText, styles.settingText]}>Default Location</Text>
              <Text style={[globalStyles.garageCaptionText, styles.settingValue]}>Not set</Text>
            </View>
            
            <View style={styles.settingItem}>
              <Icon name="time" size={20} color={colors.textSecondary} />
              <Text style={[globalStyles.garageSecondaryText, styles.settingText]}>Default Duration</Text>
              <Text style={[globalStyles.garageCaptionText, styles.settingValue]}>30 min</Text>
            </View>
            
            <View style={styles.settingItem}>
              <Icon name="people" size={20} color={colors.textSecondary} />
              <Text style={[globalStyles.garageSecondaryText, styles.settingText]}>Max Participants</Text>
              <Text style={[globalStyles.garageCaptionText, styles.settingValue]}>10</Text>
            </View>
            
            <View style={styles.settingItem}>
              <Icon name="shield" size={20} color={colors.textSecondary} />
              <Text style={[globalStyles.garageSecondaryText, styles.settingText]}>Privacy</Text>
              <Text style={[globalStyles.garageCaptionText, styles.settingValue]}>Public</Text>
            </View>
          </View>
        </View>

        {/* Create Button */}
        <TouchableOpacity style={[globalStyles.garageButton, styles.createButton]}>
          <Icon name="add" size={24} color={colors.textPrimary} />
          <Text style={[globalStyles.garageButtonText, styles.createButtonText]}>Create New Event</Text>
        </TouchableOpacity>
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
  quickCreateCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  createOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionIcon: {
    width: 48,
    alignItems: 'center',
  },
  optionInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  optionTitle: {
    marginBottom: spacing.xs,
  },
  optionDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  templatesCard: {
    marginBottom: spacing.md,
  },
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: spacing.md,
  },
  templateItem: {
    alignItems: 'center',
    width: '40%',
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  templateLabel: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  eventsCard: {
    marginBottom: spacing.md,
  },
  eventsList: {
    gap: spacing.sm,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  eventIcon: {
    width: 40,
    alignItems: 'center',
  },
  eventInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  eventTitle: {
    marginBottom: spacing.xs,
    color: colors.textTertiary,
  },
  eventDesc: {
    fontSize: 12,
  },
  settingsCard: {
    marginBottom: spacing.md,
  },
  settingsList: {
    gap: spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  settingText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  settingValue: {
    minWidth: 60,
    textAlign: 'right',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  createButtonText: {
    marginLeft: spacing.sm,
  },
});