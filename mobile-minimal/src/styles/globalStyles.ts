import { StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, typography } from '../utils/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const globalStyles = StyleSheet.create({
  // Full-width containers
  fullWidthContainer: {
    flex: 1,
    width: screenWidth,
    backgroundColor: colors.background,
  },
  
  fullWidthScreen: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
    paddingHorizontal: 0,
    marginHorizontal: 0,
  },
  
  // Dark garage theme containers
  garageContainer: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
  },
  
  garageSurface: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.2)',
  },
  
  garageCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    margin: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  
  // Header styles
  garageHeader: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 0, 0, 0.3)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    width: '100%',
  },
  
  garageHeaderTitle: {
    ...typography.h2,
    color: colors.primary,
    textAlign: 'center',
  },
  
  // Content areas
  garageContent: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    paddingHorizontal: spacing.sm,
  },
  
  garageScrollContent: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    width: '100%',
  },
  
  // Button styles
  garageButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginVertical: spacing.xs,
    alignItems: 'center',
    width: '100%',
  },
  
  garageButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginVertical: spacing.xs,
    alignItems: 'center',
    width: '100%',
  },
  
  garageButtonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
  
  // Text styles
  garageTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  
  garageSubtitle: {
    ...typography.h3,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  
  garageBodyText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  
  garageSecondaryText: {
    ...typography.bodySecondary,
    color: colors.textSecondary,
  },
  
  garageCaptionText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  
  // Layout utilities
  fullWidth: {
    width: '100%',
  },
  
  fullHeight: {
    height: '100%',
  },
  
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  spaceBetween: {
    justifyContent: 'space-between',
  },
  
  flexRow: {
    flexDirection: 'row',
  },
  
  flexColumn: {
    flexDirection: 'column',
  },
  
  // Safe area and status bar
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
  },
  
  statusBarSpacer: {
    backgroundColor: colors.background,
    width: '100%',
  },
});

export { screenWidth, screenHeight };