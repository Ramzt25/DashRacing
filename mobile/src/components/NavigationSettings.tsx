import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { DashIcon } from './DashIcon';
import { colors, spacing, typography } from '../utils/theme';

interface NavigationSettingsProps {
  visible: boolean;
  onClose: () => void;
  navigationStyle: 'top' | 'wheel';
  wheelPosition: 'left' | 'right';
  onNavigationStyleChange: (style: 'top' | 'wheel') => void;
  onWheelPositionChange: (position: 'left' | 'right') => void;
}

export function NavigationSettings({
  visible,
  onClose,
  navigationStyle,
  wheelPosition,
  onNavigationStyleChange,
  onWheelPositionChange,
}: NavigationSettingsProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={['#1A1A1A', '#000000']}
            style={styles.modalContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Navigation Settings</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <DashIcon name="back" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Navigation Style Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Navigation Style</Text>
              
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  navigationStyle === 'top' && styles.activeOption
                ]}
                onPress={() => onNavigationStyleChange('top')}
              >
                <LinearGradient
                  colors={navigationStyle === 'top' ? 
                    ['rgba(255, 0, 0, 0.2)', 'rgba(255, 0, 0, 0.1)'] : 
                    ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']
                  }
                  style={styles.optionGradient}
                >
                  <View style={styles.optionContent}>
                    <View style={styles.optionIcon}>
                      <View style={styles.topNavPreview}>
                        <View style={styles.topNavBar} />
                        <View style={styles.topNavItems}>
                          <View style={styles.topNavItem} />
                          <View style={styles.topNavItem} />
                          <View style={styles.topNavItem} />
                        </View>
                      </View>
                    </View>
                    <View style={styles.optionText}>
                      <Text style={styles.optionTitle}>Top Navigation</Text>
                      <Text style={styles.optionDescription}>
                        Clean horizontal navigation bar at the top
                      </Text>
                    </View>
                  </View>
                  {navigationStyle === 'top' && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionCard,
                  navigationStyle === 'wheel' && styles.activeOption
                ]}
                onPress={() => onNavigationStyleChange('wheel')}
              >
                <LinearGradient
                  colors={navigationStyle === 'wheel' ? 
                    ['rgba(255, 0, 0, 0.2)', 'rgba(255, 0, 0, 0.1)'] : 
                    ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']
                  }
                  style={styles.optionGradient}
                >
                  <View style={styles.optionContent}>
                    <View style={styles.optionIcon}>
                      <View style={styles.wheelPreview}>
                        <View style={styles.wheelCenter} />
                        <View style={[styles.wheelItem, { top: 0, left: 15 }]} />
                        <View style={[styles.wheelItem, { top: 10, right: 0 }]} />
                        <View style={[styles.wheelItem, { bottom: 10, right: 0 }]} />
                        <View style={[styles.wheelItem, { bottom: 0, left: 15 }]} />
                        <View style={[styles.wheelItem, { top: 10, left: 0 }]} />
                      </View>
                    </View>
                    <View style={styles.optionText}>
                      <Text style={styles.optionTitle}>Floating Wheel</Text>
                      <Text style={styles.optionDescription}>
                        Spinning circular menu you can move around
                      </Text>
                    </View>
                  </View>
                  {navigationStyle === 'wheel' && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Wheel Position Settings (only show if wheel is selected) */}
            {navigationStyle === 'wheel' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Wheel Position</Text>
                
                <View style={styles.positionRow}>
                  <TouchableOpacity
                    style={[
                      styles.positionButton,
                      wheelPosition === 'left' && styles.activePosition
                    ]}
                    onPress={() => onWheelPositionChange('left')}
                  >
                    <Text style={[
                      styles.positionText,
                      wheelPosition === 'left' && styles.activePositionText
                    ]}>
                      Left Side
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.positionButton,
                      wheelPosition === 'right' && styles.activePosition
                    ]}
                    onPress={() => onWheelPositionChange('right')}
                  >
                    <Text style={[
                      styles.positionText,
                      wheelPosition === 'right' && styles.activePositionText
                    ]}>
                      Right Side
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Apply Button */}
            <TouchableOpacity style={styles.applyButton} onPress={onClose}>
              <LinearGradient
                colors={['#FF0000', '#CC0000']}
                style={styles.applyGradient}
              >
                <Text style={styles.applyText}>Apply Settings</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    elevation: 10,
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalContent: {
    borderRadius: 16,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.md,
    fontWeight: 'bold',
  },
  optionCard: {
    marginBottom: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeOption: {
    borderColor: colors.primary,
  },
  optionGradient: {
    borderRadius: 12,
    padding: spacing.md,
    position: 'relative',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    marginRight: spacing.md,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  optionDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  checkmark: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  topNavPreview: {
    width: 60,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    position: 'relative',
  },
  topNavBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  topNavItems: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topNavItem: {
    width: 8,
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  wheelPreview: {
    width: 40,
    height: 40,
    position: 'relative',
  },
  wheelCenter: {
    position: 'absolute',
    top: 15,
    left: 15,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  wheelItem: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  positionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  positionButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  activePosition: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  positionText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activePositionText: {
    color: colors.primary,
  },
  applyButton: {
    borderRadius: 12,
    marginTop: spacing.md,
  },
  applyGradient: {
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  applyText: {
    ...typography.body,
    color: '#fff',
    fontWeight: 'bold',
  },
});