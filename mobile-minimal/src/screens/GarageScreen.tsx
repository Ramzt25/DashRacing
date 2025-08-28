import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '../utils/theme';
import { globalStyles } from '../styles/globalStyles';

export default function GarageScreen() {
  return (
    <View style={[globalStyles.garageContainer]}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={[globalStyles.garageCard, styles.headerCard]}>
          <Icon name="car-sport" size={48} color={colors.primary} style={styles.headerIcon} />
          <Text style={[globalStyles.garageTitle, styles.title]}>My Garage</Text>
          <Text style={[globalStyles.garageSecondaryText, styles.subtitle]}>
            Manage your vehicle collection
          </Text>
        </View>

        {/* Empty State */}
        <View style={[globalStyles.garageCard, styles.emptyCard]}>
          <Icon name="car-sport-outline" size={64} color={colors.textTertiary} />
          <Text style={[globalStyles.garageSubtitle, styles.emptyTitle]}>No Cars Yet</Text>
          <Text style={[globalStyles.garageSecondaryText, styles.emptyText]}>
            Your garage is empty. Add your first car to get started!
          </Text>
          
          <TouchableOpacity style={[globalStyles.garageButton, styles.addButton]}>
            <Icon name="add" size={24} color={colors.textPrimary} />
            <Text style={[globalStyles.garageButtonText, styles.buttonText]}>Add Your First Car</Text>
          </TouchableOpacity>
        </View>

        {/* Garage Features */}
        <View style={[globalStyles.garageCard, styles.featuresCard]}>
          <Text style={[globalStyles.garageSubtitle, styles.sectionTitle]}>Garage Features</Text>
          <View style={styles.featureGrid}>
            <View style={styles.featureItem}>
              <Icon name="add-circle" size={32} color={colors.primary} />
              <Text style={[globalStyles.garageCaptionText, styles.featureLabel]}>Add Cars</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="build" size={32} color={colors.primary} />
              <Text style={[globalStyles.garageCaptionText, styles.featureLabel]}>Customize</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="stats-chart" size={32} color={colors.primary} />
              <Text style={[globalStyles.garageCaptionText, styles.featureLabel]}>Track Stats</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="share" size={32} color={colors.primary} />
              <Text style={[globalStyles.garageCaptionText, styles.featureLabel]}>Share</Text>
            </View>
          </View>
        </View>

        {/* Coming Soon */}
        <View style={[globalStyles.garageCard, styles.comingSoonCard]}>
          <Icon name="construct" size={32} color={colors.warning} />
          <Text style={[globalStyles.garageSubtitle, styles.comingSoonTitle]}>Coming Soon</Text>
          <Text style={[globalStyles.garageSecondaryText, styles.comingSoonText]}>
            - Vehicle database integration{'\n'}
            - Performance modifications{'\n'}
            - Visual customization{'\n'}
            - Garage sharing{'\n'}
            - Car comparison tools
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
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: spacing.lg,
    maxWidth: 280,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  buttonText: {
    marginLeft: spacing.sm,
  },
  featuresCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: spacing.md,
  },
  featureItem: {
    alignItems: 'center',
    width: '40%',
    paddingVertical: spacing.sm,
  },
  featureLabel: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  comingSoonCard: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  comingSoonTitle: {
    marginVertical: spacing.sm,
    color: colors.warning,
  },
  comingSoonText: {
    textAlign: 'left',
    lineHeight: 24,
  },
});