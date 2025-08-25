import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Image, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.3);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto finish after 2.5 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/dash-icons/Dash.png')} 
            style={styles.dashLogo}
            resizeMode="contain"
          />
          <View style={styles.speedLines}>
            <View style={[styles.speedLine, styles.speedLine1]} />
            <View style={[styles.speedLine, styles.speedLine2]} />
            <View style={[styles.speedLine, styles.speedLine3]} />
          </View>
        </View>
        
        <Text style={styles.title}>DASH</Text>
        <Text style={styles.subtitle}>Street Racing Revolution</Text>
        
        <View style={styles.taglineContainer}>
          <Text style={styles.tagline}>Track • Race • Dominate</Text>
        </View>
      </Animated.View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by GPS Technology</Text>
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
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 40,
  },
  dashLogo: {
    width: 120,
    height: 120,
  },
  speedLines: {
    position: 'absolute',
    right: -40,
    top: 20,
  },
  speedLine: {
    height: 2,
    backgroundColor: '#FF0000',
    marginVertical: 3,
    borderRadius: 1,
  },
  speedLine1: {
    width: 30,
    opacity: 0.8,
  },
  speedLine2: {
    width: 25,
    opacity: 0.6,
  },
  speedLine3: {
    width: 20,
    opacity: 0.4,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    color: '#FF0000',
    marginBottom: 60,
    fontWeight: '500',
    letterSpacing: 1,
  },
  taglineContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF0000',
  },
  tagline: {
    fontSize: 16,
    color: '#FF0000',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
});