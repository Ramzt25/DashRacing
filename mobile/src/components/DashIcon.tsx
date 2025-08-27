import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface DashIconProps {
  name: string;
  size?: number;
  color?: string;
  focused?: boolean;
}

export function DashIcon({ name, size = 24, color = '#fff', focused = false }: DashIconProps) {
  // Map icon names to simple text labels
  const textMap: { [key: string]: string } = {
    'home': 'HOME',
    'live-race': 'RACE',
    'events': 'EVENTS',
    'garage': 'GARAGE',
    'map': 'MAP',
    'nearby': 'NEAR',
    'profile': 'USER',
    'timer': 'TIME',
    'car': 'CAR',
    'pro': 'PRO',
    'simulator': 'SIM',
    'settings': 'SET',
    'back': 'BACK',
  };

  const displayText = textMap[name] || name.toUpperCase().slice(0, 4);
  const finalColor = focused ? '#ff0000' : color;
  const fontSize = Math.max(8, size / 3); // Scale text size based on icon size

  return (
    <View style={[
      styles.container, 
      { width: size + 8, height: size + 8 },
      focused && styles.focusedContainer
    ]}>
      <Text style={[styles.text, { color: finalColor, fontSize }]}>
        {displayText}
      </Text>
      {focused && <View style={styles.redAccent} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    position: 'relative',
  },
  focusedContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 8,
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