import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import { SplashScreen } from '../screens/onboarding/SplashScreen';
import { SignInScreen } from '../screens/onboarding/SignInScreen';
import { ProfileCompletionScreen } from '../screens/onboarding/ProfileCompletionScreen';
import { TermsScreen } from '../screens/onboarding/TermsScreen';
import { PermissionPrimerScreen } from '../screens/onboarding/PermissionPrimerScreen';

import { MapScreen } from '../screens/map/MapScreen';
import { MeetsScreen } from '../screens/meets/MeetsScreen';
import { GarageScreen } from '../screens/garage/GarageScreen';
import { ActivityScreen } from '../screens/activity/ActivityScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

// Import icons
import { MapPin, Calendar, Car, Activity, User } from 'lucide-react-native';

export type RootStackParamList = {
  // Onboarding
  Splash: undefined;
  SignIn: undefined;
  ProfileCompletion: undefined;
  Terms: undefined;
  PermissionPrimer: { permission: 'location' | 'notifications' | 'camera' };
  
  // Main App
  MainTabs: undefined;
  
  // Modals
  CreatePin: { latitude: number; longitude: number };
  CreateMeet: { latitude?: number; longitude?: number };
  VehicleDetails: { vehicleId: string };
  UpgradesPlanner: { vehicleId: string };
  Settings: undefined;
};

export type MainTabParamList = {
  Map: undefined;
  Meets: undefined;
  Garage: undefined;
  Activity: undefined;
  Profile: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabParamList>();

function MainTabNavigator() {
  return (
    <MainTabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#111214', // theme.colors.surface
          borderTopColor: '#1f2937',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 88,
        },
        tabBarActiveTintColor: '#d3132a', // theme.colors.primary
        tabBarInactiveTintColor: '#b4b8bf', // theme.colors.textMuted
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 8,
        },
        tabBarIconStyle: {
          marginTop: 8,
        },
      }}
    >
      <MainTabs.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MapPin color={color} size={size} />
          ),
        }}
      />
      <MainTabs.Screen
        name="Meets"
        component={MeetsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Calendar color={color} size={size} />
          ),
        }}
      />
      <MainTabs.Screen
        name="Garage"
        component={GarageScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Car color={color} size={size} />
          ),
        }}
      />
      <MainTabs.Screen
        name="Activity"
        component={ActivityScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Activity color={color} size={size} />
          ),
        }}
      />
      <MainTabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size} />
          ),
        }}
      />
    </MainTabs.Navigator>
  );
}

export function AppNavigator() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootStack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: '#0b0b0c' }, // theme.colors.background
          }}
        >
          <RootStack.Screen name="Splash" component={SplashScreen} />
          <RootStack.Screen name="SignIn" component={SignInScreen} />
          <RootStack.Screen name="ProfileCompletion" component={ProfileCompletionScreen} />
          <RootStack.Screen name="Terms" component={TermsScreen} />
          <RootStack.Screen name="PermissionPrimer" component={PermissionPrimerScreen} />
          <RootStack.Screen name="MainTabs" component={MainTabNavigator} />
          
          {/* Modal screens */}
          <RootStack.Group screenOptions={{ presentation: 'modal' }}>
            <RootStack.Screen name="CreatePin" component={MapScreen} />
            <RootStack.Screen name="CreateMeet" component={MeetsScreen} />
            <RootStack.Screen name="VehicleDetails" component={GarageScreen} />
            <RootStack.Screen name="UpgradesPlanner" component={GarageScreen} />
            <RootStack.Screen name="Settings" component={ProfileScreen} />
          </RootStack.Group>
        </RootStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}