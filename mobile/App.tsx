import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
  return (
    <NavigationContainer>
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

  useEffect(() => {
    if (!isLoading && user && isFirstTime) {
      setShowFirstTimeModal(true);
    }
  }, [isLoading, user, isFirstTime]);

  if (showSplash || isLoading) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!user) {
    if (authScreen === 'login') {
      return (
        <LoginScreen 
          onNavigateToRegister={() => setAuthScreen('register')}
        />
      );
    } else {
      return (
        <RegisterScreen 
          onNavigateToLogin={() => setAuthScreen('login')}
        />
      );
    }
  }

  return (
    <>
      <AppNavigator />
      <FirstTimeUserModal 
        visible={showFirstTimeModal}
        onClose={() => setShowFirstTimeModal(false)}
      />
      <TermsGate 
        userId={user?.id || ''}
        onAgreed={() => console.log('Terms accepted')}
      />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style="light" backgroundColor="#000000" />
        <SettingsProvider>
          <AuthProvider>
            <AuthFlow />
          </AuthProvider>
        </SettingsProvider>
      </View>
    </SafeAreaProvider>
  );
}