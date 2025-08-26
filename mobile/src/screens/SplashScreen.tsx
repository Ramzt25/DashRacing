import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Image, SafeAreaView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const glowAnim = new Animated.Value(0);

  useEffect(() => {
    console.log('🎬 SplashScreen starting animations');
    
    // Start animations
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      // Add pulsing glow effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();

    // Call onFinish after animations have had time to show
    const finishTimer = setTimeout(() => {
      console.log(' SplashScreen calling onFinish');
      onFinish();
    }, 1200); // Let the initial animations complete
    
    return () => clearTimeout(finishTimer);
  }, [onFinish]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Background gradient */}
        <LinearGradient
          colors={['#000000', '#1a0000', '#000000']}
          style={styles.gradientOverlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
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
          {/* Logo container with glass effect */}
          <View style={styles.logoContainer}>
            <View style={styles.glassCard}>
              <Animated.View 
                style={[
                  styles.logoWrapper,
                  {
                    shadowOpacity: glowAnim,
                  }
                ]}
              >
                <Image 
                  source={require('../../assets/dash-icons/Dash.png')} 
                  style={styles.dashLogo}
                  resizeMode="contain"
                />
              </Animated.View>
              
              {/* Speed lines */}
              <Animated.View 
                style={[
                  styles.speedLines,
                  {
                    opacity: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.6, 1],
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
            <Text style={styles.subtitle}>Street Racing Revolution</Text>
            
            <View style={styles.taglineContainer}>
              <Text style={styles.tagline}>Track • Race • Dominate</Text>
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
          <Text style={styles.footerText}>Initializing...</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 40,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
    padding: 30,
    shadowColor: '#FF0000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoWrapper: {
    shadowColor: '#FF0000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 20,
    elevation: 8,
  },
  dashLogo: {
    width: 200,  // Much bigger as requested
    height: 200,
  },
  speedLines: {
    position: 'absolute',
    right: -50,
    top: 40,
  },
  speedLine: {
    height: 3,
    backgroundColor: '#FF0000',
    marginVertical: 4,
    borderRadius: 2,
    shadowColor: '#FF0000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  speedLine1: {
    width: 40,
    opacity: 1,
  },
  speedLine2: {
    width: 35,
    opacity: 0.8,
  },
  speedLine3: {
    width: 30,
    opacity: 0.6,
  },
  speedLine4: {
    width: 25,
    opacity: 0.4,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 22,
    color: '#FF0000',
    marginBottom: 40,
    fontWeight: '600',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(255, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  taglineContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.4)',
    shadowColor: '#FF0000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  tagline: {
    fontSize: 18,
    color: '#FF0000',
    fontWeight: '700',
    letterSpacing: 1,
    textShadowColor: 'rgba(255, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0000',
    marginHorizontal: 4,
    shadowColor: '#FF0000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  footerText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
