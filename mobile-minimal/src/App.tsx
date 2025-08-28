import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {StatusBar} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// Import context and components
import { AppProvider, useAppContext } from './context/AppContext';
import LoadingScreen from './components/LoadingScreen';

// Import all screens
import HomeScreen from './screens/HomeScreen';
import GarageScreen from './screens/GarageScreen';
import RaceScreen from './screens/RaceScreen';
import MapScreen from './screens/MapScreen';
import MeetupScreen from './screens/MeetupScreen';
import FriendsScreen from './screens/FriendsScreen';
import SettingsScreen from './screens/SettingsScreen';

import { colors } from './utils/theme';

const Tab = createBottomTabNavigator();

function MainNavigation() {
  const { state } = useAppContext();

  // Show loading screen while initializing
  if (state.isLoading) {
    return <LoadingScreen message="Loading your racing data..." />;
  }

  // Show error if something went wrong
  if (state.error) {
    return <LoadingScreen message={`Error: ${state.error}`} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor={colors.background} barStyle="light-content" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: {
              backgroundColor: colors.surface,
              borderTopColor: colors.primary,
              borderTopWidth: 1,
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textTertiary,
            headerStyle: {
              backgroundColor: colors.background,
              borderBottomColor: colors.primary,
              borderBottomWidth: 1,
            },
            headerTintColor: colors.textPrimary,
            headerTitleStyle: {
              color: colors.primary,
              fontWeight: 'bold',
            },
          }}
        >
          <Tab.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{
              tabBarLabel: 'Home',
              tabBarIcon: ({ color, size }) => (
                <Icon name="home" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen 
            name="Map" 
            component={MapScreen}
            options={{
              tabBarLabel: 'Map',
              tabBarIcon: ({ color, size }) => (
                <Icon name="map" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen 
            name="Meetup" 
            component={MeetupScreen}
            options={{
              tabBarLabel: 'Meetup',
              tabBarIcon: ({ color, size }) => (
                <Icon name="calendar" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen 
            name="Friends" 
            component={FriendsScreen}
            options={{
              tabBarLabel: 'Friends',
              tabBarIcon: ({ color, size }) => (
                <Icon name="people" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{
              tabBarLabel: 'Settings',
              tabBarIcon: ({ color, size }) => (
                <Icon name="settings" color={color} size={size} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainNavigation />
    </AppProvider>
  );
}