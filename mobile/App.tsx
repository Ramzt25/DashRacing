import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Debug import to test environment variables
import './src/debug-test';

// Logger import - initialize early
import { mobileLogger } from './src/utils/logger';

// Auth Context and Screens
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { SplashScreen } from './src/screens/SplashScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { ProUpgradeScreen } from './src/screens/ProUpgradeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { FirstTimeUserModal } from './src/screens/FirstTimeUserModal';

// Main App Screens
import { HomeScreen } from './src/screens/HomeScreen';
import { LiveMapScreen } from './src/screens/LiveMapScreen';
import { LiveRaceScreen } from './src/screens/LiveRaceScreen';
import { NearbyScreen } from './src/screens/NearbyScreen';
import { SimulatorScreen } from './src/screens/SimulatorScreen';
import { GarageScreen } from './src/screens/GarageScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { MeetupsScreen } from './src/screens/MeetupsScreen';
import { TermsGate } from './src/components/legal/TermsGate';
import { colors } from './src/utils/theme';

// Define the stack parameter list
type RootStackParamList = {
  Home: undefined;
  LiveRace: undefined;
  Events: undefined;
  Meetups: undefined;
  Garage: undefined;
  LiveMap: undefined;
  Map: undefined;
  Nearby: undefined;
  Profile: undefined;
  ProUpgrade: undefined;
  Simulator: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

function AppNavigator() {
  const navigationRef = React.useRef<any>(null);

  const onNavigationStateChange = (state: any) => {
    if (state) {
      const routeName = state.routes[state.index]?.name;
      mobileLogger.setCurrentScreen(routeName);
      mobileLogger.logNavigation(
        state.routes[state.index - 1]?.name || 'Unknown',
        routeName,
        state.routes[state.index]?.params
      );
    }
  };

  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={onNavigationStateChange}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false, // Hide default headers since we use ScreenHeader component
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Map" component={LiveMapScreen} />
        <Stack.Screen name="LiveRace" component={LiveRaceScreen} />
        <Stack.Screen name="Meetups" component={MeetupsScreen} />
        <Stack.Screen name="Nearby" component={NearbyScreen} />
        <Stack.Screen name="Simulator" component={SimulatorScreen} />
        <Stack.Screen name="Garage" component={GarageScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen 
          name="ProUpgrade" 
          component={ProUpgradeScreen} 
          options={{ presentation: 'modal' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function AuthFlow() {
  const { user, isLoading, isFirstTime } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);
  const [showTermsGate, setShowTermsGate] = useState(false);

  // Log state changes with mobile logger
  useEffect(() => {
    mobileLogger.debug('AUTH_FLOW', 'AuthFlow state changed', {
      user: user ? `Logged in as ${user.email}` : 'No user',
      isLoading,
      isFirstTime,
      showSplash,
      authScreen
    });
  }, [user, isLoading, isFirstTime, showSplash, authScreen]);

  useEffect(() => {
    mobileLogger.debug('FIRST_TIME_CHECK', 'FirstTimeModal check', { 
      isLoading, 
      hasUser: !!user, 
      isFirstTime 
    });
    if (!isLoading && user && isFirstTime) {
      console.log('✅ Showing FirstTimeModal');
      setShowFirstTimeModal(true);
    }
  }, [isLoading, user, isFirstTime]);

  // Auto-hide splash when auth loading is complete
  useEffect(() => {
    if (!isLoading) {
      console.log('⏰ Auth loading complete, hiding splash screen');
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 1500); // Give splash screen time to complete its animation
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  console.log('🎬 Render decision:', { showSplash, isLoading, hasUser: !!user });
  
  if (showSplash) {
    console.log('📱 Showing splash screen');
    return <SplashScreen onFinish={() => {
      console.log('✅ Splash onFinish called - but controlled by timer');
      // Don't immediately hide - let the timer handle it for consistent timing
    }} />;
  }

  if (!user) {
    console.log('🔐 Showing auth screens - no user found');
    if (authScreen === 'login') {
      console.log('📝 Rendering LoginScreen');
      return (
        <LoginScreen 
          onNavigateToRegister={() => {
            console.log('➡️ Navigating to register screen');
            setAuthScreen('register');
          }}
        />
      );
    } else {
      console.log('📝 Rendering RegisterScreen');
      return (
        <RegisterScreen 
          onNavigateToLogin={() => {
            console.log('⬅️ Navigating to login screen');
            setAuthScreen('login');
          }}
        />
      );
    }
  }

  console.log('🏠 Rendering main app for user:', user?.email);
  return (
    <>
      <AppNavigator />
      <FirstTimeUserModal 
        visible={showFirstTimeModal}
        onClose={() => {
          console.log('❌ FirstTimeModal closed');
          setShowFirstTimeModal(false);
        }}
      />
      <TermsGate 
        userId={user?.id || ''}
        onAgreed={() => console.log('✅ Terms accepted')}
      />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <SettingsProvider>
          <AuthProvider>
            <AuthFlow />
          </AuthProvider>
        </SettingsProvider>
      </View>
    </SafeAreaProvider>
  );
}