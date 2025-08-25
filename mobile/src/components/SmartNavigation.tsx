import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationSettings } from './NavigationSettings';
import { TopNavigation } from './TopNavigation';
import { WheelNavigation } from './WheelNavigation';
import { DashIcon } from './DashIcon';
import { colors, spacing } from '../utils/theme';

interface SmartNavigationProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  user: any;
  navigationStyle?: 'drawer' | 'top' | 'wheel';
  onNavigationStyleChange?: (style: 'drawer' | 'top' | 'wheel') => void;
}

type NavigationStyle = 'drawer' | 'top' | 'wheel';
type WheelPosition = 'left' | 'right';

export function SmartNavigation({ 
  currentRoute, 
  onNavigate, 
  user, 
  navigationStyle: externalNavStyle,
  onNavigationStyleChange: externalStyleChange 
}: SmartNavigationProps) {
  const [internalNavigationStyle, setInternalNavigationStyle] = useState<NavigationStyle>('top');
  const [wheelPosition, setWheelPosition] = useState<WheelPosition>('right');
  const [showSettings, setShowSettings] = useState(false);

  // Use external navigation style if provided, otherwise use internal state
  const navigationStyle = externalNavStyle && externalNavStyle !== 'drawer' 
    ? externalNavStyle as NavigationStyle 
    : internalNavigationStyle;

  const handleNavigationStyleChange = (style: 'top' | 'wheel') => {
    if (externalStyleChange) {
      externalStyleChange(style);
    } else {
      setInternalNavigationStyle(style);
    }
  };

  const handleWheelPositionChange = (position: WheelPosition) => {
    setWheelPosition(position);
  };

  return (
    <>
      {/* Render navigation based on selected style */}
      {navigationStyle === 'top' && (
        <TopNavigation
          currentRoute={currentRoute}
          onNavigate={onNavigate}
          onMenuToggle={() => setShowSettings(true)}
          user={user}
        />
      )}

      {navigationStyle === 'wheel' && (
        <WheelNavigation
          currentRoute={currentRoute}
          onNavigate={onNavigate}
          position={wheelPosition}
          onPositionChange={handleWheelPositionChange}
        />
      )}

      {/* Floating settings button (only show if using drawer navigation) */}
      {navigationStyle === 'drawer' && (
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setShowSettings(true)}
        >
          <LinearGradient
            colors={['#FF0000', '#CC0000']}
            style={styles.settingsGradient}
          >
            <DashIcon name="settings" size={20} color="#fff" />
            <Text style={styles.settingsText}>NAV</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Settings modal */}
      <NavigationSettings
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        navigationStyle={navigationStyle === 'drawer' ? 'top' : navigationStyle}
        wheelPosition={wheelPosition}
        onNavigationStyleChange={handleNavigationStyleChange}
        onWheelPositionChange={handleWheelPositionChange}
      />
    </>
  );
}

const styles = StyleSheet.create({
  settingsButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    elevation: 8,
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  settingsGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  settingsText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 2,
  },
});