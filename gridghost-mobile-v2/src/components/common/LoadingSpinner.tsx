import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography } from '../../utils/theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function LoadingSpinner({
  size = 'medium',
  color = colors.primary,
  message,
  fullScreen = false,
  overlay = false,
}: LoadingSpinnerProps) {
  const spinValue = useRef(new Animated.Value(0)).current;

  // Get spinner size
  const getSpinnerSize = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'medium':
        return 40;
      case 'large':
        return 60;
      default:
        return 40;
    }
  };

  // Start spinning animation
  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    spinAnimation.start();

    return () => {
      spinAnimation.stop();
    };
  }, [spinValue]);

  // Interpolate rotation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spinnerSize = getSpinnerSize();

  // Spinner component
  const SpinnerContent = () => (
    <View style={[
      styles.container,
      fullScreen && styles.fullScreen,
    ]}>
      <View style={styles.spinnerContainer}>
        {/* Outer Ring */}
        <Animated.View
          style={[
            styles.spinnerRing,
            {
              width: spinnerSize,
              height: spinnerSize,
              borderWidth: spinnerSize / 10,
              borderTopColor: color,
              transform: [{ rotate: spin }],
            },
          ]}
        />
        
        {/* Inner Dot */}
        <View style={[
          styles.innerDot,
          {
            width: spinnerSize / 4,
            height: spinnerSize / 4,
            backgroundColor: color,
          },
        ]} />
      </View>

      {/* Message */}
      {message && (
        <Text style={[
          styles.message,
          size === 'small' && styles.messageSmall,
          size === 'large' && styles.messageLarge,
        ]}>
          {message}
        </Text>
      )}
    </View>
  );

  // Full screen overlay
  if (fullScreen && overlay) {
    return (
      <View style={styles.overlay}>
        <LinearGradient
          colors={[colors.background + 'CC', colors.surface + 'CC']}
          style={styles.overlayGradient}
        >
          <SpinnerContent />
        </LinearGradient>
      </View>
    );
  }

  return <SpinnerContent />;
}

// Racing-themed loading component
export function RaceLoadingSpinner({
  message = 'Getting ready to race...',
  stage = 'preparing',
}: {
  message?: string;
  stage?: 'preparing' | 'connecting' | 'starting' | 'loading';
}) {
  const pulseValue = useRef(new Animated.Value(1)).current;
  const slideValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    // Slide animation
    const slideAnimation = Animated.loop(
      Animated.timing(slideValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    pulseAnimation.start();
    slideAnimation.start();

    return () => {
      pulseAnimation.stop();
      slideAnimation.stop();
    };
  }, [pulseValue, slideValue]);

  const slideX = slideValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, SCREEN_WIDTH + 100],
  });

  return (
    <View style={styles.raceLoader}>
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={styles.raceLoaderGradient}
      >
        {/* Racing Animation */}
        <View style={styles.raceAnimation}>
          <Animated.View
            style={[
              styles.raceCar,
              {
                transform: [
                  { translateX: slideX },
                  { scale: pulseValue },
                ],
              },
            ]}
          >
            <Text style={styles.raceCarIcon}>🏎️</Text>
          </Animated.View>
          
          {/* Track */}
          <View style={styles.track} />
        </View>

        {/* Stage Indicator */}
        <View style={styles.stageContainer}>
          <Text style={styles.stageTitle}>{message}</Text>
          <View style={styles.dotsContainer}>
            {[0, 1, 2].map((index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    opacity: slideValue.interpolate({
                      inputRange: [0, 0.33, 0.66, 1],
                      outputRange: index === 0 ? [1, 0.3, 0.3, 1] :
                                   index === 1 ? [0.3, 1, 0.3, 0.3] :
                                   [0.3, 0.3, 1, 0.3],
                    }),
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  fullScreen: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlayGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerRing: {
    borderRadius: 999,
    borderColor: 'transparent',
  },
  innerDot: {
    position: 'absolute',
    borderRadius: 999,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  messageSmall: {
    ...typography.bodySecondary,
    marginTop: spacing.sm,
  },
  messageLarge: {
    ...typography.h3,
    marginTop: spacing.lg,
  },
  
  // Racing loader styles
  raceLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  raceLoaderGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  raceAnimation: {
    width: '100%',
    height: 100,
    marginBottom: spacing.xl,
    position: 'relative',
  },
  raceCar: {
    position: 'absolute',
    top: 30,
    zIndex: 2,
  },
  raceCarIcon: {
    fontSize: 40,
  },
  track: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 2,
  },
  stageContainer: {
    alignItems: 'center',
  },
  stageTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});