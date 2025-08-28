import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  RefreshControl, 
  Modal,
  Dimensions,
  Animated,
  ActivityIndicator,
  SafeAreaView,
  StatusBar
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import ScreenContainer from '../components/layout/ScreenContainer';
import { colors, spacing, typography, shadows } from '../utils/theme';
import { globalStyles } from '../styles/globalStyles';
import { DashIcon } from '../components/DashIcon';
import { CustomButton } from '../components/common/CustomButton';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useLocation } from '../hooks/useLocation';
import { Race } from '../types/racing';
// Week 4 Frontend Integration - Enhanced Services
import { RaceStatsService, UserRaceStats, LiveMapStats, UserInsights } from '../services/RaceStatsService';
import { API_CONFIG, INTEGRATION_STATUS } from '../config/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const { width: screenWidth } = Dimensions.get('window');

export function HomeScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const { settings, getSpeedUnitLabel, convertSpeed } = useSettings();
  const { location, isLoading: locationLoading } = useLocation();
  const [refreshing, setRefreshing] = useState(false);
  const [activeRaces, setActiveRaces] = useState<Race[]>([]);
  const [showMapPreview, setShowMapPreview] = useState(false);
  
  // Week 4 Enhanced State - Backend Integration
  const [liveMapData, setLiveMapData] = useState<LiveMapStats>({
    onlineFriends: 0,
    activeMeetups: 0,
    nearbyUsers: 0,
    gpsActive: false,
    userLocation: null,
    nearbyEvents: [],
  });
  
  const [userStats, setUserStats] = useState<UserRaceStats>({
    totalSessions: 0,
    totalRaces: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    totalDistance: 0,
    totalTime: 0,
    maxSpeed: 0,
    averageSpeed: 0,
    bestZeroToSixty: null,
    bestQuarterMile: null,
    sessionsThisWeek: 0,
    sessionsThisMonth: 0,
    lastRaceDate: null,
    recentPerformance: {
      averageSpeedLast10: 0,
      improvementTrend: 'stable',
      personalBests: 0,
    },
    globalRank: null,
    localRank: null,
    achievements: 0,
    experience: 0,
    level: 1,
  });
  
  const [userInsights, setUserInsights] = useState<UserInsights | null>(null);
  const [backendConnected, setBackendConnected] = useState<boolean>(INTEGRATION_STATUS.BACKEND_CONNECTED);

  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Week 4 Enhanced Initialization
  useEffect(() => {
    loadUserStats();
    loadLiveMapData();
    initializeAnimations();
    
    // Log integration status
    console.log('Week 4 Integration Status:', INTEGRATION_STATUS);
    console.log('Backend URL:', API_CONFIG.BASE_URL);
  }, []);

  const initializeAnimations = () => {
    // Pulse animation for live indicators
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const loadLiveMapData = async () => {
    try {
      console.log('[MAP] Loading live map data...');
      // Week 4 Backend Integration - Enhanced Live Map Data
      const userLocation = location ? { latitude: location.latitude, longitude: location.longitude } : undefined;
      const liveStats = await RaceStatsService.getLiveMapStats(userLocation);
      console.log('[SUCCESS] Live map data loaded:', liveStats);
      
      setLiveMapData(liveStats);
      
      // Update user presence if location is available
      if (userLocation && user) {
        console.log('[INFO] Updating user presence...');
        await RaceStatsService.updatePresence(userLocation, 'online');
        console.log('[SUCCESS] User presence updated');
      }
    } catch (error) {
      console.error('Failed to load live map data:', error);
      setBackendConnected(false);
      
      // Use minimal fallback data when backend is unavailable
      setLiveMapData({
        onlineFriends: 0,
        activeMeetups: 0,
        nearbyUsers: 0,
        gpsActive: location !== null,
        userLocation: location ? { latitude: location.latitude, longitude: location.longitude } : null,
        nearbyEvents: [],
      });
    }
  };

  const loadUserStats = async () => {
    try {
            console.log('[INFO] Loading user stats...');
      // Week 4 Backend Integration - Enhanced User Statistics
      const stats = await RaceStatsService.getUserRaceStats();
      console.log('[SUCCESS] User stats loaded:', stats);
      const convertedMaxSpeed = convertSpeed(stats.maxSpeed, 'mph');
      
      setUserStats({
        ...stats,
        maxSpeed: Math.round(convertedMaxSpeed),
      });
      
      setBackendConnected(true);
      console.log('[SUCCESS] Backend connected');
      
      // Load AI insights if user ID is available
      if (user?.id) {
        try {
          console.log('[INFO] Loading AI insights...');
          const insights = await RaceStatsService.getUserInsights(user.id);
          setUserInsights(insights);
          console.log('[SUCCESS] AI insights loaded');
        } catch (error) {
          console.warn('[WARN] AI insights unavailable:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load user stats:', error);
      setBackendConnected(false);
      
      // Use empty stats when backend is unavailable - user will need to race to populate
      setUserStats({
        totalSessions: 0,
        totalRaces: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        totalDistance: 0,
        totalTime: 0,
        maxSpeed: 0,
        averageSpeed: 0,
        bestZeroToSixty: null,
        bestQuarterMile: null,
        sessionsThisWeek: 0,
        sessionsThisMonth: 0,
        lastRaceDate: null,
        recentPerformance: {
          averageSpeedLast10: 0,
          improvementTrend: 'stable',
          personalBests: 0,
        },
        globalRank: null,
        localRank: null,
        achievements: 0,
        experience: 0,
        level: 1,
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserStats();
    await loadLiveMapData();
    setRefreshing(false);
  };

  // Enhanced navigation cards with all features
  const navigationCards = [
    {
      title: 'Live Map',
      subtitle: `${liveMapData.onlineFriends} friends online`,
      icon: 'map',
      color: colors.primary,
      gradient: [colors.primary + '20', colors.primary + '40'],
      onPress: () => navigation.navigate('Map'),
      showLiveIndicator: true,
      stats: `${liveMapData.activeMeetups} meetups active`,
    },
    {
      title: 'Friends',
      subtitle: 'Connect with racers',
      icon: 'nearby',
      color: colors.secondary,
      gradient: [colors.secondary + '20', colors.secondary + '40'],
      onPress: () => navigation.navigate('Friends'),
      showLiveIndicator: false,
      stats: 'Social racing',
    },
    {
      title: 'Car Meetups',
      subtitle: `${liveMapData.nearbyUsers} nearby`,
      icon: 'events',
      color: colors.warning,
      gradient: [colors.warning + '20', colors.warning + '40'],
      onPress: () => navigation.navigate('Meetups'),
      showLiveIndicator: true,
      stats: 'Community events',
    },
    {
      title: 'My Garage',
      subtitle: 'Manage vehicles',
      icon: 'garage',
      color: colors.accent,
      gradient: [colors.accent + '20', colors.accent + '40'],
      onPress: () => navigation.navigate('Garage'),
      showLiveIndicator: false,
      stats: 'Tune & customize',
    },
    {
      title: 'Practice Mode',
      subtitle: 'Improve your skills',
      icon: 'simulator',
      color: colors.accent,
      gradient: [colors.accent + '20', colors.accent + '40'],
      onPress: () => navigation.navigate('Simulator'),
      showLiveIndicator: false,
      stats: 'Solo training',
    },
    {
      title: 'Profile & Stats',
      subtitle: 'View achievements',
      icon: 'profile',
      color: colors.primary,
      gradient: [colors.surfaceSecondary, colors.surfaceElevated],
      onPress: () => navigation.navigate('Profile'),
      showLiveIndicator: false,
      stats: 'Racing history',
    },
    {
      title: 'Settings',
      subtitle: 'App preferences',
      icon: 'settings',
      color: colors.textSecondary,
      gradient: [colors.surfaceSecondary, colors.surfaceElevated],
      onPress: () => navigation.navigate('Settings'),
      showLiveIndicator: false,
      stats: 'Customize app',
    },
    ...(user?.isPro ? [] : [{
      title: 'Pro Upgrade',
      subtitle: 'Unlock premium',
      icon: 'pro',
      color: colors.warning,
      gradient: [colors.warning + '15', colors.warning + '30'],
      onPress: () => navigation.navigate('ProUpgrade'),
      showLiveIndicator: false,
      stats: 'Premium features',
    }]),
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ScreenContainer>
      <View style={[globalStyles.fullWidthContainer, styles.container]}>
        <ScrollView 
          style={[globalStyles.fullWidthScreen, styles.scrollView]}
          contentContainerStyle={[globalStyles.garageContainer, styles.scrollContent]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.usernameText}>
              {user?.displayName || user?.handle || 'Racer'}
            </Text>
            {/* Week 4 Backend Connection Status */}
            <View style={styles.connectionStatus}>
              <View style={[styles.connectionDot, { backgroundColor: backendConnected ? '#00ff00' : '#ff6b6b' }]} />
              <Text style={[styles.connectionText, { color: backendConnected ? '#00ff00' : '#ff6b6b' }]}>
                {backendConnected ? 'Backend Connected' : 'Offline Mode'}
              </Text>
            </View>
          </View>
        </View>

        {/* Pro Upgrade Banner - Only show if user is NOT Pro */}
        {!user?.isPro && (
          <View style={styles.proBanner}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('ProUpgrade')}
              style={[globalStyles.garageCard, styles.proBannerTouchable]}
            >
              <View style={styles.proBannerContent}>
                <View style={styles.proBannerIcon}>
                  <Ionicons name="diamond" size={24} color={colors.warning} />
                </View>
                <View style={styles.proBannerText}>
                  <Text style={styles.proBannerTitle}>Upgrade to GridGhost Pro</Text>
                  <Text style={styles.proBannerSubtitle}>Unlimited cars, advanced mods & AI insights</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.warning} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Live Map Preview Card */}
        <TouchableOpacity
          style={[globalStyles.garageCard, styles.liveMapPreviewCard]}
          onPress={() => setShowMapPreview(true)}
        >
          <View style={styles.liveMapPreviewHeader}>
            <View style={styles.liveMapPreviewTitle}>
              <DashIcon name="map" size={24} color={colors.primary} />
              <Text style={styles.liveMapPreviewTitleText}>Live Map</Text>
              {liveMapData.gpsActive && (
                <View style={styles.gpsIndicator}>
                  <View style={styles.gpsIndicatorDot} />
                </View>
              )}
              <Animated.View style={[styles.liveIndicator, { transform: [{ scale: pulseAnim }] }]}>
                <View style={styles.liveIndicatorDot} />
              </Animated.View>
            </View>
            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => setShowMapPreview(true)}
            >
              <Ionicons name="expand" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.liveMapStats}>
            <View style={styles.liveMapStat}>
              <Text style={styles.liveMapStatValue}>{liveMapData.onlineFriends}</Text>
              <Text style={styles.liveMapStatLabel}>Friends Online</Text>
            </View>
            <View style={styles.liveMapStat}>
              <Text style={styles.liveMapStatValue}>{liveMapData.activeMeetups}</Text>
              <Text style={styles.liveMapStatLabel}>Meetups</Text>
            </View>
            <View style={styles.liveMapStat}>
              <Text style={styles.liveMapStatValue}>{liveMapData.nearbyUsers}</Text>
              <Text style={styles.liveMapStatLabel}>Nearby</Text>
            </View>
          </View>
          
          <CustomButton
            title="Open Live Map"
            onPress={() => navigation.navigate('Map')}
            variant="primary"
            style={styles.liveMapButton}
          />
        </TouchableOpacity>

        {/* Racing Stats Dashboard */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Racing Stats</Text>
          <View style={styles.statsGrid}>
            <View style={[globalStyles.garageCard, styles.statCard]}>
              <Text style={styles.statValue}>{userStats.totalRaces}</Text>
              <Text style={styles.statLabel}>Total Races</Text>
            </View>
            
            <View style={[globalStyles.garageCard, styles.statCard]}>
              <Text style={styles.statValue}>{userStats.wins}</Text>
              <Text style={styles.statLabel}>Wins</Text>
            </View>
            
            <View style={[globalStyles.garageCard, styles.statCard]}>
              <Text style={styles.statValue}>{userStats.maxSpeed}</Text>
              <Text style={styles.statLabel}>Best Speed ({getSpeedUnitLabel()})</Text>
            </View>
            
            <View style={[globalStyles.garageCard, styles.statCard]}>
              <Text style={styles.statValue}>{userStats.winRate.toFixed(1)}%</Text>
              <Text style={styles.statLabel}>Win Rate</Text>
            </View>
          </View>
        </View>

        {/* Navigation Cards */}
        <View style={styles.navigationContainer}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.navigationGrid}>
            {navigationCards.map((card, index) => (
              <TouchableOpacity
                key={index}
                style={[globalStyles.garageCard, styles.navigationCard]}
                onPress={card.onPress}
              >
                <View style={styles.navigationCardHeader}>
                  <View style={styles.navigationCardIcon}>
                    <DashIcon name={card.icon} size={28} color={card.color} />
                  </View>
                  {card.showLiveIndicator && (
                    <Animated.View style={[styles.cardLiveIndicator, { transform: [{ scale: pulseAnim }] }]}>
                      <View style={styles.cardLiveIndicatorDot} />
                    </Animated.View>
                  )}
                </View>
                <Text style={styles.navigationCardTitle}>{card.title}</Text>
                <Text style={styles.navigationCardSubtitle}>{card.subtitle}</Text>
                <Text style={styles.navigationCardStats}>{card.stats}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Race Now Section */}
        <View style={[globalStyles.garageCard, styles.raceNowContainer]}>
          <View style={styles.raceNowContent}>
            <DashIcon name="live-race" size={48} color={colors.primary} />
            <Text style={styles.raceNowTitle}>Ready to Race?</Text>
            <Text style={styles.raceNowSubtitle}>
              Start a quick race or join an event near you
            </Text>
            
            <View style={styles.raceNowButtons}>
              <CustomButton
                title="Quick Race"
                onPress={() => navigation.navigate('LiveMap')}
                variant="primary"
                style={styles.raceButton}
              />
              <CustomButton
                title="Find Events"
                onPress={() => navigation.navigate('Nearby')}
                variant="outline"
                style={styles.raceButton}
              />
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activityContainer}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {userStats.lastRaceDate ? (
            <View style={[globalStyles.garageCard, styles.activityCard]}>
              <DashIcon name="events" size={24} color={colors.primary} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Last Race</Text>
                <Text style={styles.activityTime}>
                  {Math.floor((Date.now() - new Date(userStats.lastRaceDate).getTime()) / (1000 * 60 * 60 * 24))} days ago
                </Text>
              </View>
              <TouchableOpacity style={styles.activityButton}>
                <Text style={styles.activityButtonText}>View</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[globalStyles.garageCard, styles.noActivityCard]}>
              <DashIcon name="events" size={48} color={colors.textSecondary} />
              <Text style={styles.noActivityText}>No recent races</Text>
              <Text style={styles.noActivitySubtext}>
                Start your first race to see activity here
              </Text>
            </View>
          )}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={[globalStyles.garageButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Live Map Preview Modal */}
      <Modal
        visible={showMapPreview}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowMapPreview(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowMapPreview(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Live Map</Text>
            <TouchableOpacity onPress={() => {
              setShowMapPreview(false);
              navigation.navigate('Map');
            }}>
              <Text style={styles.openFullMapText}>Open Full Map</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {/* Live Stats Header */}
            <View style={styles.modalStatsContainer}>
              <View style={styles.modalStatItem}>
                <Animated.View style={[styles.modalStatIndicator, { transform: [{ scale: pulseAnim }] }]}>
                  <View style={styles.modalStatDot} />
                </Animated.View>
                <Text style={styles.modalStatValue}>{liveMapData.onlineFriends}</Text>
                <Text style={styles.modalStatLabel}>Friends Online</Text>
              </View>
              <View style={styles.modalStatItem}>
                <View style={styles.modalStatIndicator}>
                  <Ionicons name="flag" size={16} color={colors.warning} />
                </View>
                <Text style={styles.modalStatValue}>{liveMapData.activeMeetups}</Text>
                <Text style={styles.modalStatLabel}>Active Meetups</Text>
              </View>
              <View style={styles.modalStatItem}>
                <View style={styles.modalStatIndicator}>
                  <Ionicons name="location" size={16} color={colors.primary} />
                </View>
                <Text style={styles.modalStatValue}>{liveMapData.nearbyUsers}</Text>
                <Text style={styles.modalStatLabel}>Nearby</Text>
              </View>
            </View>

            {/* Map Preview */}
            <View style={styles.mapPreviewContainer}>
              {location ? (
                <MapView
                  provider={PROVIDER_GOOGLE}
                  style={styles.mapPreview}
                  initialRegion={{
                    latitude: location?.latitude || 37.7749,
                    longitude: location?.longitude || -122.4194,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                  }}
                  showsUserLocation={true}
                  showsMyLocationButton={false}
                  zoomEnabled={true}
                  scrollEnabled={true}
                >
                  {/* Sample markers for preview */}
                  <Marker
                    coordinate={{
                      latitude: (location?.latitude || 37.7749) + 0.01,
                      longitude: (location?.longitude || -122.4194) + 0.01,
                    }}
                    title="Street Race Event"
                    description="Starting in 5 minutes"
                  >
                    <View style={styles.eventMarkerPreview}>
                      <Text style={styles.eventMarkerIcon}></Text>
                    </View>
                  </Marker>
                  <Marker
                    coordinate={{
                      latitude: (location?.latitude || 37.7749) - 0.01,
                      longitude: (location?.longitude || -122.4194) + 0.01,
                    }}
                    title="Online Player"
                    description="NightRider - 85 MPH"
                  >
                    <View style={styles.playerMarkerPreview}>
                      <View style={styles.playerMarkerInnerPreview} />
                    </View>
                  </Marker>
                </MapView>
              ) : (
                <View style={styles.mapLoadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.mapLoadingText}>Loading GPS...</Text>
                </View>
              )}
            </View>

            {/* Quick Action Buttons */}
            <View style={styles.modalActions}>
              <CustomButton
                title="Join Nearby Race"
                onPress={() => {
                  setShowMapPreview(false);
                  navigation.navigate('Nearby');
                }}
                variant="primary"
                style={styles.modalActionButton}
              />
              <CustomButton
                title="Open Full Map"
                onPress={() => {
                  setShowMapPreview(false);
                  navigation.navigate('Map');
                }}
                variant="outline"
                style={styles.modalActionButton}
              />
            </View>
          </View>
        </View>
      </Modal>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: screenWidth,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    ...typography.bodySecondary,
    color: colors.textSecondary,
    fontSize: 16,
  },
  usernameText: {
    ...typography.h1,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    fontSize: 28,
    fontWeight: 'bold',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    gap: spacing.xs,
    ...shadows.sm,
  },
  locationText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: -0.3,
  },
  
  // Stats Section
  statsContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    maxWidth: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.md,
  },
  statCardGradient: {
    padding: spacing.lg,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
  },
  statValue: {
    ...typography.h1,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  
  // Actions Section
  actionsContainer: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    minWidth: '47%',
    maxWidth: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.md,
  },
  actionCardGradient: {
    padding: spacing.lg,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  actionIcon: {
    marginBottom: spacing.sm,
  },
  actionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  actionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  // Race Now Section
  raceNowContainer: {
    margin: spacing.lg,
    marginTop: spacing.md,
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.lg,
  },
  raceNowGradient: {
    padding: spacing.xl,
  },
  raceNowContent: {
    alignItems: 'center',
  },
  raceNowTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  raceNowSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  raceNowButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  raceButton: {
    flex: 1,
  },
  
  // Activity Section
  activityContainer: {
    padding: spacing.lg,
  },
  activityCard: {
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.sm,
  },
  activityCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  activityTime: {
    ...typography.bodySecondary,
    color: colors.textSecondary,
  },
  activityButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  activityButtonText: {
    ...typography.bodySecondary,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  noActivityCard: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
  },
  noActivityText: {
    ...typography.h3,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  noActivitySubtext: {
    ...typography.bodySecondary,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  // Live Map Preview Card Styles
  liveMapPreviewCard: {
    margin: spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.lg,
  },
  liveMapPreviewGradient: {
    padding: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
  },
  liveMapPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  liveMapPreviewTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  liveMapPreviewTitleText: {
    ...typography.h2,
    color: colors.textPrimary,
    fontSize: 20,
  },
  liveIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  gpsIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00ff0030',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  gpsIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00ff00',
  },
  expandButton: {
    padding: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
  },
  liveMapStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background + '40',
    borderRadius: 12,
  },
  liveMapStat: {
    alignItems: 'center',
  },
  liveMapStatValue: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  liveMapStatLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  liveMapButton: {
    marginTop: spacing.sm,
  },

  // Navigation Cards Styles
  navigationContainer: {
    padding: spacing.lg,
  },
  navigationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  navigationCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.md,
    marginBottom: spacing.sm,
  },
  navigationCardGradient: {
    padding: spacing.md,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'space-between',
    position: 'relative',
    backgroundColor: colors.surfaceSecondary,
  },
  navigationCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    position: 'relative',
    width: '100%',
  },
  navigationCardIcon: {
    marginBottom: spacing.xs,
  },
  cardLiveIndicator: {
    position: 'absolute',
    top: -5,
    right: -15,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLiveIndicatorDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primary,
  },
  navigationCardTitle: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  navigationCardSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  navigationCardStats: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 11,
    opacity: 0.8,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSecondary,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  openFullMapText: {
    ...typography.bodySecondary,
    color: colors.primary,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  modalStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
    padding: spacing.lg,
  },
  modalStatItem: {
    alignItems: 'center',
  },
  modalStatIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  modalStatDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  modalStatValue: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  modalStatLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  mapPreviewContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  mapPreview: {
    flex: 1,
    minHeight: 300,
  },
  mapLoadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSecondary,
    minHeight: 300,
  },
  mapLoadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  eventMarkerPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventMarkerIcon: {
    fontSize: 12,
  },
  playerMarkerPreview: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerMarkerInnerPreview: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.background,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalActionButton: {
    flex: 1,
  },

  // Pro Banner Styles - Dark Glass Theme
  proBanner: {
    margin: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.lg,
  },
  proBannerTouchable: {
    flex: 1,
  },
  proBannerGradient: {
    padding: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
  },
  proBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  proBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  proBannerText: {
    flex: 1,
  },
  proBannerTitle: {
    ...typography.h3,
    color: colors.warning,
    marginBottom: spacing.xs,
  },
  proBannerSubtitle: {
    ...typography.bodySecondary,
    color: colors.textSecondary,
  },

  // Logout Button Styles
  logoutContainer: {
    padding: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  logoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.surfaceSecondary,
  },
  logoutButtonGradient: {
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    ...typography.body,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },

  // Week 4 Backend Integration Styles
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
  },
});
