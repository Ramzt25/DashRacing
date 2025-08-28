import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SimpleIconProps {
  name: string;
  size?: number;
  color?: string;
}

export function SimpleIcon({ name, size = 24, color = '#fff' }: SimpleIconProps) {
  // Map common Ionicon names to simple text symbols
  const iconMap: { [key: string]: string } = {
    // Basic navigation
    'chevron-back': '<',
    'chevron-forward': '>',
    'arrow-back': '<',
    'arrow-forward': '>',
    'close': 'X',
    'add': '+',
    'remove': '-',
    'checkmark': 'OK',
    
    // Common UI
    'search': 'FIND',
    'settings': 'SET',
    'menu': 'MENU',
    'home': 'HOME',
    'person': 'USER',
    'car': 'CAR',
    'map': 'MAP',
    'location': 'LOC',
    'timer': 'TIME',
    'calendar': 'CAL',
    'flag': 'FLAG',
    'flash': 'BOLT',
    'eye': 'VIEW',
    'eye-off': 'HIDE',
    
    // Actions
    'play': 'PLAY',
    'pause': 'PAUS',
    'stop': 'STOP',
    'refresh': 'REFR',
    'share': 'SHAR',
    'download': 'DOWN',
    'upload': 'UP',
    
    // Status
    'checkmark-circle': 'OK',
    'close-circle': 'ERR',
    'alert-circle': 'WARN',
    'information-circle': 'INFO',
    
    // Default fallbacks
    'home-outline': 'HOME',
    'person-outline': 'USER',
    'car-outline': 'CAR',
    'map-outline': 'MAP',
    'location-outline': 'LOC',
    'timer-outline': 'TIME',
    'calendar-outline': 'CAL',
    'flash-outline': 'RACE',
    'flag-outline': 'EVENT',
    'settings-outline': 'SET',
  };

  const displayText = iconMap[name] || name.charAt(0).toUpperCase();
  const fontSize = Math.max(10, size * 0.6); // Scale text size based on icon size

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Text style={[styles.text, { color, fontSize }]}>
        {displayText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});