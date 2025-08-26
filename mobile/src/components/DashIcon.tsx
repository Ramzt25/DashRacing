import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface DashIconProps {
  name: 'home' | 'live-race' | 'events' | 'garage' | 'map' | 'profile' | 'settings' | 'back' | 'timer' | 'car' | 'nearby';
  size?: number;
  color?: string;
  focused?: boolean;
}

export function DashIcon({ name, size = 24, color = '#fff', focused = false }: DashIconProps) {
  const getIconComponent = () => {
    // Use your custom DASH icons
    const iconMap = {
      'home': require('../../assets/dash-icons/Home.png'),
      'live-race': require('../../assets/dash-icons/Live race.png'),
      'events': require('../../assets/dash-icons/Events.png'),
      'garage': require('../../assets/dash-icons/Mygarage.png'),
      'map': require('../../assets/dash-icons/Location.png'),
      'profile': require('../../assets/dash-icons/profile.png'),
      'settings': require('../../assets/dash-icons/settings.png'),
      'back': null, // Use Ionicon for back button
      'timer': null, // Use Ionicon for timer
      'car': null, // Use Ionicon for car
      'nearby': null, // Use Ionicon for nearby
    };

    // Use custom DASH image if available, otherwise fallback to Ionicons
    if (iconMap[name]) {
      return (
        <View style={[
          styles.iconContainer,
          focused && styles.focusedContainer,
          { width: size + 8, height: size + 8 }
        ]}>
          <Image 
            source={iconMap[name]} 
            style={[
              styles.customIcon,
              { 
                width: size, 
                height: size,
                tintColor: focused ? '#FF0000' : color
              }
            ]}
            resizeMode="contain"
          />
          {focused && <View style={styles.redAccent} />}
        </View>
      );
    } else {
      // Fallback to Ionicons for icons without custom images
      const ionIconMap: Record<string, any> = {
        'back': 'arrow-back',
        'timer': 'timer-outline',
        'car': 'car-outline',
        'nearby': 'people-outline',
      };
      
      return (
        <View style={[
          styles.iconContainer,
          focused && styles.focusedContainer,
          { width: size + 8, height: size + 8 }
        ]}>
          <Ionicons 
            name={ionIconMap[name] || 'help-outline'} 
            size={size} 
            color={focused ? '#FF0000' : color} 
          />
          {focused && <View style={styles.redAccent} />}
        </View>
      );
    }
  };

  return getIconComponent();
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  focusedContainer: {
    // Add any focused state styling here
  },
  customIcon: {
    // Custom icon styling
  },
  redAccent: {
    position: 'absolute',
    bottom: -2,
    width: 16,
    height: 2,
    backgroundColor: '#FF0000',
    borderRadius: 1,
  },
});