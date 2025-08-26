import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashIcon } from './DashIcon';
import { colors, spacing, typography } from '../utils/theme';

interface TopNavigationProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onMenuToggle: () => void;
  user: any;
}

const menuItems = [
  { name: 'Home', title: 'Home', iconName: 'home' as const },
  { name: 'LiveRace', title: 'Live Race', iconName: 'live-race' as const },
  { name: 'Events', title: 'Events', iconName: 'events' as const },
  { name: 'Garage', title: 'Garage', iconName: 'garage' as const },
  { name: 'LiveMap', title: 'Map', iconName: 'map' as const },
];

export function TopNavigation({ currentRoute, onNavigate, onMenuToggle, user }: TopNavigationProps) {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient
          colors={[colors.background, colors.surface]}
          style={styles.navBar}
        >
          {/* Left side - DASH logo/title */}
          <View style={styles.leftSection}>
            <Image 
              source={require('../../assets/dash-icons/Dash.png')} 
              style={styles.dashLogo}
              resizeMode="contain"
            />
            <Text style={styles.dashTitle}>DASH</Text>
            {user?.isPro && (
              <View style={styles.proIndicator}>
                <Text style={styles.proText}>PRO</Text>
              </View>
            )}
          </View>

          {/* Center - Navigation items */}
          <View style={styles.centerSection}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.name}
                style={[
                  styles.navItem,
                  currentRoute === item.name && styles.activeNavItem
                ]}
                onPress={() => onNavigate(item.name)}
              >
                <DashIcon 
                  name={item.iconName} 
                  size={20} 
                  focused={currentRoute === item.name}
                />
                <Text style={[
                  styles.navText,
                  currentRoute === item.name && styles.activeNavText
                ]}>
                  {item.title}
                </Text>
                {currentRoute === item.name && (
                  <View style={styles.activeIndicator} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Right side - Profile/Settings */}
          <TouchableOpacity 
            style={styles.rightSection}
            onPress={() => onNavigate('Profile')}
          >
            <DashIcon name="profile" size={24} focused={currentRoute === 'Profile'} />
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>
    </>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 0, 0, 0.2)',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.2,
  },
  dashLogo: {
    width: 32,
    height: 32,
    marginRight: spacing.xs,
  },
  dashTitle: {
    ...typography.h3,
    color: colors.primary,
    marginLeft: spacing.xs,
    fontWeight: 'bold',
  },
  proIndicator: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: spacing.xs,
  },
  proText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  centerSection: {
    flexDirection: 'row',
    flex: 0.6,
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: 8,
    position: 'relative',
  },
  activeNavItem: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  navText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    fontSize: 10,
  },
  activeNavText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    width: 20,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
  rightSection: {
    flex: 0.2,
    alignItems: 'flex-end',
  },
});