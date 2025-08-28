import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '../utils/theme';
import { globalStyles } from '../styles/globalStyles';

export default function MapScreen() {
  return (
    <View style={[globalStyles.garageContainer]}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={[globalStyles.garageCard, styles.headerCard]}>
          <Icon name="map" size={48} color={colors.primary} style={styles.headerIcon} />
          <Text style={[globalStyles.garageTitle, styles.title]}>Live Race Map</Text>
          <Text style={[globalStyles.garageSecondaryText, styles.subtitle]}>
            Find races and events near you
          </Text>
        </View>

        {/* Map Placeholder */}
        <View style={[globalStyles.garageCard, styles.mapCard]}>
          <View style={styles.mapPlaceholder}>
            <Icon name="location" size={64} color={colors.textTertiary} />
            <Text style={[globalStyles.garageSubtitle, styles.mapTitle]}>Interactive Map</Text>
            <Text style={[globalStyles.garageSecondaryText, styles.mapText]}>
              Real-time race locations and events will appear here
            </Text>
          </View>
        </View>

        {/* Nearby Races */}
        <View style={[globalStyles.garageCard, styles.racesCard]}>
          <Text style={[globalStyles.garageSubtitle, styles.sectionTitle]}>Nearby Races</Text>
          
          <View style={styles.racesList}>
            <View style={styles.raceItem}>
              <View style={styles.raceIcon}>
                <Icon name="flash" size={24} color={colors.textTertiary} />
              </View>
              <View style={styles.raceInfo}>
                <Text style={[globalStyles.garageBodyText, styles.raceTitle]}>No active races</Text>
                <Text style={[globalStyles.garageSecondaryText, styles.raceDesc]}>
                  Check back later for events
                </Text>
              </View>
              <Text style={[globalStyles.garageCaptionText, styles.raceDistance]}>---</Text>
            </View>
          </View>
        </View>

        {/* Map Controls */}
        <View style={[globalStyles.garageCard, styles.controlsCard]}>
          <Text style={[globalStyles.garageSubtitle, styles.sectionTitle]}>Map Controls</Text>
          
          <View style={styles.controlsGrid}>
            <TouchableOpacity style={styles.controlItem}>
              <Icon name="location" size={28} color={colors.primary} />
              <Text style={[globalStyles.garageCaptionText, styles.controlLabel]}>My Location</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlItem}>
              <Icon name="search" size={28} color={colors.primary} />
              <Text style={[globalStyles.garageCaptionText, styles.controlLabel]}>Search</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlItem}>
              <Icon name="filter" size={28} color={colors.primary} />
              <Text style={[globalStyles.garageCaptionText, styles.controlLabel]}>Filter</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlItem}>
              <Icon name="refresh" size={28} color={colors.primary} />
              <Text style={[globalStyles.garageCaptionText, styles.controlLabel]}>Refresh</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Event Types */}
        <View style={[globalStyles.garageCard, styles.typesCard]}>
          <Text style={[globalStyles.garageSubtitle, styles.sectionTitle]}>Event Types</Text>
          
          <View style={styles.typesList}>
            <View style={styles.typeItem}>
              <Icon name="speedometer" size={20} color={colors.textSecondary} />
              <Text style={[globalStyles.garageSecondaryText, styles.typeText]}>Time Trials</Text>
            </View>
            <View style={styles.typeItem}>
              <Icon name="people" size={20} color={colors.textSecondary} />
              <Text style={[globalStyles.garageSecondaryText, styles.typeText]}>Group Races</Text>
            </View>
            <View style={styles.typeItem}>
              <Icon name="trophy" size={20} color={colors.textSecondary} />
              <Text style={[globalStyles.garageSecondaryText, styles.typeText]}>Tournaments</Text>
            </View>
            <View style={styles.typeItem}>
              <Icon name="calendar" size={20} color={colors.textSecondary} />
              <Text style={[globalStyles.garageSecondaryText, styles.typeText]}>Scheduled Events</Text>
            </View>
          </View>
        </View>

        {/* Create Event */}
        <View style={[globalStyles.garageCard, styles.createCard]}>
          <Icon name="add-circle" size={48} color={colors.textTertiary} />
          <Text style={[globalStyles.garageSubtitle, styles.createTitle]}>Create Event</Text>
          <Text style={[globalStyles.garageSecondaryText, styles.createText]}>
            Organize your own racing events and meetups
          </Text>
          
          <TouchableOpacity style={[globalStyles.garageButtonSecondary, styles.createButton]} disabled>
            <Icon name="calendar" size={20} color={colors.textTertiary} />
            <Text style={[globalStyles.garageButtonText, styles.disabledButtonText]}>Coming Soon</Text>
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
  mapCard: {
    marginBottom: spacing.md,
    minHeight: 200,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  mapTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    color: colors.textTertiary,
  },
  mapText: {
    textAlign: 'center',
    maxWidth: 280,
  },
  racesCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  racesList: {
    gap: spacing.sm,
  },
  raceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  raceIcon: {
    width: 40,
    alignItems: 'center',
  },
  raceInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  raceTitle: {
    marginBottom: spacing.xs,
    color: colors.textTertiary,
  },
  raceDesc: {
    fontSize: 12,
  },
  raceDistance: {
    minWidth: 40,
    textAlign: 'right',
  },
  controlsCard: {
    marginBottom: spacing.md,
  },
  controlsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: spacing.md,
  },
  controlItem: {
    alignItems: 'center',
    width: '40%',
    paddingVertical: spacing.sm,
  },
  controlLabel: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  typesCard: {
    marginBottom: spacing.md,
  },
  typesList: {
    gap: spacing.sm,
  },
  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  typeText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  createCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.md,
  },
  createTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    color: colors.textTertiary,
  },
  createText: {
    textAlign: 'center',
    marginBottom: spacing.lg,
    maxWidth: 280,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    borderColor: colors.textTertiary,
  },
  disabledButtonText: {
    marginLeft: spacing.sm,
    color: colors.textTertiary,
  },
});