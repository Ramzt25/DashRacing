import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DashIcon } from './DashIcon';
import { colors, spacing } from '../utils/theme';

interface WheelNavigationProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  position: 'left' | 'right';
  onPositionChange: (position: 'left' | 'right') => void;
}

const menuItems = [
  { name: 'Home', iconName: 'home' as const, angle: 0 },
  { name: 'LiveRace', iconName: 'live-race' as const, angle: 60 },
  { name: 'Events', iconName: 'events' as const, angle: 120 },
  { name: 'Garage', iconName: 'garage' as const, angle: 180 },
  { name: 'LiveMap', iconName: 'map' as const, angle: 240 },
  { name: 'Profile', iconName: 'profile' as const, angle: 300 },
];

const WHEEL_SIZE = 280;
const ITEM_SIZE = 50;
const RADIUS = WHEEL_SIZE / 2 - ITEM_SIZE / 2;

export function WheelNavigation({ currentRoute, onNavigate, position, onPositionChange }: WheelNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rotation] = useState(new Animated.Value(0));
  const [scale] = useState(new Animated.Value(0));
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
    onPanResponderRelease: (_, gestureState) => {
      const { moveX } = gestureState;
      const screenWidth = Dimensions.get('window').width;
      const newPosition = moveX < screenWidth / 2 ? 'left' : 'right';
      onPositionChange(newPosition);
      
      // Reset position
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
      }).start();
    },
  });

  const toggleWheel = () => {
    const toValue = isOpen ? 0 : 1;
    setIsOpen(!isOpen);

    Animated.parallel([
      Animated.spring(scale, {
        toValue,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(rotation, {
        toValue: toValue * 360,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getItemPosition = (angle: number) => {
    const radian = (angle * Math.PI) / 180;
    return {
      x: RADIUS * Math.cos(radian),
      y: RADIUS * Math.sin(radian),
    };
  };

  const containerStyle = {
    ...styles.container,
    [position]: 20,
  };

  return (
    <View style={containerStyle}>
      {/* Main floating button */}
      <Animated.View
        style={[
          styles.mainButton,
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
              { rotate: rotation.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg'],
                })
              },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity onPress={toggleWheel} style={styles.buttonTouchable}>
          <LinearGradient
            colors={['#FF0000', '#CC0000', '#FF0000']}
            style={styles.buttonGradient}
          >
            <DashIcon name="home" size={24} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Navigation wheel items */}
      {isOpen && (
        <View style={styles.wheelContainer}>
          {menuItems.map((item, index) => {
            const itemPosition = getItemPosition(item.angle);
            return (
              <Animated.View
                key={item.name}
                style={[
                  styles.wheelItem,
                  {
                    transform: [
                      { translateX: itemPosition.x },
                      { translateY: itemPosition.y },
                      { scale },
                    ],
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={() => {
                    onNavigate(item.name);
                    toggleWheel();
                  }}
                  style={[
                    styles.wheelItemButton,
                    currentRoute === item.name && styles.activeWheelItem,
                  ]}
                >
                  <LinearGradient
                    colors={currentRoute === item.name ? 
                      ['#FF0000', '#CC0000'] : 
                      ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
                    }
                    style={styles.wheelItemGradient}
                  >
                    <DashIcon 
                      name={item.iconName} 
                      size={20} 
                      focused={currentRoute === item.name}
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      )}

      {/* Position indicator */}
      <View style={[styles.positionIndicator, { [position]: 80 }]}>
        <View style={[styles.indicator, position === 'left' && styles.leftIndicator]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50%',
    zIndex: 1000,
  },
  mainButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonTouchable: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  wheelContainer: {
    position: 'absolute',
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    left: -WHEEL_SIZE / 2 + 30,
    top: -WHEEL_SIZE / 2 + 30,
  },
  wheelItem: {
    position: 'absolute',
    left: WHEEL_SIZE / 2 - ITEM_SIZE / 2,
    top: WHEEL_SIZE / 2 - ITEM_SIZE / 2,
  },
  wheelItemButton: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: ITEM_SIZE / 2,
  },
  wheelItemGradient: {
    width: '100%',
    height: '100%',
    borderRadius: ITEM_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeWheelItem: {
    elevation: 6,
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  positionIndicator: {
    position: 'absolute',
    top: -10,
    width: 6,
    height: 20,
  },
  indicator: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  leftIndicator: {
    backgroundColor: '#00FF00',
  },
});