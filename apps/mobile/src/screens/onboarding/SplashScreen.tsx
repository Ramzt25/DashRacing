import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '@dash/utils';
import { useAuthStore } from '../../stores/authStore';

export function SplashScreen() {
  const navigation = useNavigation();
  const { isLoading, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoading) {
        if (isAuthenticated && user) {
          // Check if user needs to complete onboarding
          if (!user.termsAcceptedAt || user.termsVersion < 1) {
            navigation.navigate('Terms');
          } else {
            navigation.navigate('MainTabs');
          }
        } else {
          navigation.navigate('SignIn');
        }
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, user, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>Dash</Text>
        <Text style={styles.tagline}>Connect. Share. Discover.</Text>
      </View>
      
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  tagline: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 100,
  },
});