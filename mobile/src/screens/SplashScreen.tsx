import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, SafeAreaView, Image } from 'react-native';
import { DashIcon } from '../components/DashIcon';
import { colors, spacing } from '../utils/theme';
import { globalStyles, screenWidth } from '../styles/globalStyles';

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const hasFinished = useRef(false);

  useEffect(() => {
    console.log('[SPLASH] SplashScreen starting animations');
    
    // Prevent multiple executions
    if (hasFinished.current) return;
    
    // Start animations
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      // Add pulsing glow effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 2 } // Limit the loop iterations
      ),
    ]).start();

    // Call onFinish only once after a set time
    const finishTimer = setTimeout(() => {
      if (!hasFinished.current) {
        console.log('[SPLASH] SplashScreen calling onFinish');
        hasFinished.current = true;
        onFinish();
      }
    }, 1000); // Reduced time for faster loading
    
    return () => {
      clearTimeout(finishTimer);
    };
  }, []); // Remove onFinish from dependencies to prevent re-execution

  return (
    <SafeAreaView style={[globalStyles.safeContainer, styles.safeArea]}>
      <View style={[globalStyles.fullWidthContainer, styles.container]}>
        {/* Main content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Logo container with garage-style glass effect */}
          <View style={styles.logoContainer}>
            <View style={styles.garageGlassCard}>
              <Animated.View 
                style={[
                  styles.logoWrapper,
                  {
                    shadowOpacity: glowAnim,
                  }
                ]}
              >
                {/* Dash Logo - Replace with actual logo if available */}
                <View style={styles.dashLogoContainer}>
                  <Text style={styles.dashLogoText}>DASH</Text>
                  <Text style={styles.dashLogoSubtext}>RACING</Text>
                </View>
              </Animated.View>
              
              {/* Racing speed lines */}
              <Animated.View 
                style={[
                  styles.speedLines,
                  {
                    opacity: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.4, 1],
                    }),
                  }
                ]}
              >
                <View style={[styles.speedLine, styles.speedLine1]} />
                <View style={[styles.speedLine, styles.speedLine2]} />
                <View style={[styles.speedLine, styles.speedLine3]} />
                <View style={[styles.speedLine, styles.speedLine4]} />
              </Animated.View>
            </View>
          </View>
          
          {/* Text content */}
          <View style={styles.textContainer}>
            <Text style={styles.subtitle}>STREET RACING REVOLUTION</Text>
            
            <View style={styles.taglineContainer}>
              <Text style={styles.tagline}>TRACK | RACE | DOMINATE</Text>
            </View>
          </View>
        </Animated.View>
        
        {/* Loading indicator */}
        <View style={styles.footer}>
          <Animated.View 
            style={[
              styles.loadingContainer,
              {
                opacity: glowAnim,
              }
            ]}
          >
            <View style={styles.loadingDot} />
            <View style={[styles.loadingDot, { marginLeft: 8 }]} />
            <View style={[styles.loadingDot, { marginLeft: 8 }]} />
          </Animated.View>
          <Text style={styles.footerText}>LOADING GARAGE...</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    width: screenWidth,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    width: screenWidth,
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: screenWidth,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 40,
    alignItems: 'center',
  },
  garageGlassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.4)',
    padding: 40,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
    alignItems: 'center',
  },
  logoWrapper: {
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 25,
    elevation: 10,
    alignItems: 'center',
  },
  dashLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashLogoText: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 8,
    textShadowColor: 'rgba(255, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  dashLogoSubtext: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 6,
    marginTop: 4,
    textShadowColor: 'rgba(255, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  speedLines: {
    position: 'absolute',
    right: -50,
    top: 50,
  },
  speedLine: {
    height: 3,
    backgroundColor: colors.primary,
    marginVertical: 6,
    borderRadius: 2,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 6,
  },
  speedLine1: {
    width: 45,
    opacity: 1,
  },
  speedLine2: {
    width: 38,
    opacity: 0.8,
  },
  speedLine3: {
    width: 32,
    opacity: 0.6,
  },
  speedLine4: {
    width: 26,
    opacity: 0.4,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 30,
    width: '100%',
  },
  subtitle: {
    fontSize: 18,
    color: colors.primary,
    marginBottom: 30,
    fontWeight: '700',
    letterSpacing: 2,
    textShadowColor: 'rgba(255, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    textAlign: 'center',
  },
  taglineContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.08)',
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.5)',
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  tagline: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '800',
    letterSpacing: 2,
    textShadowColor: 'rgba(255, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
    width: '100%',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginHorizontal: 4,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 6,
  },
  footerText: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
});
