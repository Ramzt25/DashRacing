import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, shadows } from '../../utils/theme';
import { DashIcon } from '../DashIcon';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: 'home' | 'live-race' | 'events' | 'garage' | 'map' | 'profile' | 'settings' | 'timer' | 'car' | 'nearby';
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function CustomButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = true,
  style,
  textStyle,
}: CustomButtonProps) {
  // Get button colors based on variant
  const getButtonColors = () => {
    switch (variant) {
      case 'primary':
        return [colors.primary, colors.secondary];
      case 'secondary':
        return [colors.surfaceSecondary, colors.surfaceElevated];
      case 'danger':
        return ['#FF3333', '#CC0000'];
      case 'success':
        return [colors.primary, '#00CC66'];
      case 'outline':
        return ['transparent', 'transparent'];
      default:
        return [colors.primary, colors.secondary];
    }
  };

  // Get button size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
        };
      case 'medium':
        return {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
        };
      case 'large':
        return {
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.xl,
        };
      default:
        return {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
        };
    }
  };

  // Get text size styles
  const getTextSize = () => {
    switch (size) {
      case 'small':
        return typography.bodySecondary;
      case 'medium':
        return typography.button;
      case 'large':
        return typography.h3;
      default:
        return typography.button;
    }
  };

  // Get text color
  const getTextColor = () => {
    if (disabled) return colors.textSecondary;
    if (variant === 'outline') return colors.primary;
    return colors.textPrimary;
  };

  // Get icon size
  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'medium':
        return 20;
      case 'large':
        return 24;
      default:
        return 20;
    }
  };

  const buttonColors = getButtonColors();
  const sizeStyles = getSizeStyles();
  const textSize = getTextSize();
  const textColor = getTextColor();
  const iconSize = getIconSize();

  const buttonContent = (
    <>
      {icon && iconPosition === 'left' && (
        <DashIcon 
          name={icon} 
          size={iconSize} 
          color={textColor} 
        />
      )}
      
      <Text style={[
        textSize,
        { color: textColor },
        styles.buttonText,
        textStyle,
      ]}>
        {loading ? 'Loading...' : title}
      </Text>
      
      {icon && iconPosition === 'right' && (
        <DashIcon 
          name={icon} 
          size={iconSize} 
          color={textColor} 
        />
      )}
    </>
  );

  return (
    <TouchableOpacity
      style={[
        styles.button,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        variant === 'outline' && styles.outline,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {variant === 'outline' ? (
        <View style={[
          styles.buttonContent,
          sizeStyles,
          { flexDirection: iconPosition === 'right' ? 'row-reverse' : 'row' },
        ]}>
          {buttonContent}
        </View>
      ) : (
        <LinearGradient
          colors={buttonColors as [string, string]}
          style={[
            styles.buttonContent,
            sizeStyles,
            { flexDirection: iconPosition === 'right' ? 'row-reverse' : 'row' },
          ]}
        >
          {buttonContent}
        </LinearGradient>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.sm,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  outline: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
});