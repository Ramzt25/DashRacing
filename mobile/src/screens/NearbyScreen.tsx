import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../hooks/useLocation';
import { LiveMapService } from '../services/LiveMapService';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { colors, typography, spacing, shadows } from '../utils/theme';
import ScreenContainer from '../components/layout/ScreenContainer';

interface LivePlayer {
  id: string;
  username: string;
  displayName?: string;
  location: {
    latitude: number;
    longitude: number;
    timestamp: number;
  };
  speed: number;
  heading: number;
  isFriend: boolean;
  status: 'online' | 'racing' | 'away';
  vehicle: {
    make: string;
    model: string;
    color: string;
  };
  lastSeen: Date;
}

export function NearbyScreen({ navigation }: any) {
  const { user } = useAuth();
  const { location, isLoading: locationLoading, getCurrentLocation } = useLocation();
  const [isSearching, setIsSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [nearbyPlayers, setNearbyPlayers] = useState<LivePlayer[]>([]);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [searchRadius] = useState(5); // miles

  useEffect(() => {
    if (location && !locationLoading) {
      // Auto-search when location is available
      searchNearbyRacers();
    }
  }, [location, locationLoading]);

  const searchNearbyRacers = async () => {
    if (!location || !user) {
      Alert.alert('Location Required', 'Please enable location access first.');
      return;
    }

    setIsSearching(true);
    try {
      const { players } = await LiveMapService.getNearbyPlayers(
        location.latitude, 
        location.longitude, 
        searchRadius
      );
      
      setNearbyPlayers(players);
      
      if (players.length === 0) {
        Alert.alert(
          'Search Complete',
          `No nearby racers found within ${searchRadius} miles. Try expanding your search or move to a different location.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Failed', 'Unable to search for nearby racers. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const startBroadcasting = async () => {
    if (!location || !user) {
      Alert.alert('Location Required', 'Please enable location access first.');
      return;
    }

    try {
      setIsBroadcasting(true);
      await LiveMapService.updatePresence({
        status: 'online',
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          speed: location.speed || 0,
          heading: location.heading || 0,
          timestamp: Date.now(),
        }
      });
      
      Alert.alert(
        'Broadcasting Started',
        'You are now visible to nearby racers within their search radius.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Broadcasting error:', error);
      Alert.alert('Broadcasting Failed', 'Unable to start broadcasting. Please try again.');
      setIsBroadcasting(false);
    }
  };

  const stopBroadcasting = async () => {
    try {
      await LiveMapService.updatePresence({
        status: 'away'
      });
      setIsBroadcasting(false);
      Alert.alert('Broadcasting Stopped', 'You are no longer visible to other racers.');
    } catch (error) {
      console.error('Stop broadcasting error:', error);
      Alert.alert('Error', 'Failed to stop broadcasting.');
    }
  };

  const challengePlayer = (player: LivePlayer) => {
    Alert.alert(
      'Challenge Player',
      `Send a race challenge to ${player.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send Challenge', 
          onPress: () => {
            // TODO: Implement challenge system via LiveRaceScreen integration
            Alert.alert('Challenge Sent!', `Race challenge sent to ${player.username}`);
          }
        }
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getCurrentLocation();
    if (location) {
      await searchNearbyRacers();
    }
    setRefreshing(false);
  };

  const formatCoordinate = (coord: number, type: 'lat' | 'lng') => {
    const abs = Math.abs(coord);
    const degrees = Math.floor(abs);
    const minutes = ((abs - degrees) * 60).toFixed(3);
    const direction = type === 'lat' ? (coord >= 0 ? 'N' : 'S') : (coord >= 0 ? 'E' : 'W');
    return `${degrees}°${minutes}'${direction}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return colors.primary;
      case 'racing': return colors.secondary;
      case 'away': return colors.textTertiary;
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'racing': return 'In Race';
      case 'away': return 'Away';
      default: return 'Unknown';
    }
  };

  if (locationLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <ScreenContainer hideTopInset={true}>
      <ScreenHeader 
        title="Nearby Racers" 
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={searchNearbyRacers}
            disabled={isSearching}
          >
            {isSearching ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="search" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>
        }
      />
      
      <View style={styles.container}>
        <ScrollView 
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >

      {/* Location Section */}
      {location && (
        <View style={styles.locationSection}>
          <View style={styles.locationHeader}>
            <Ionicons name="location" size={20} color={colors.primary} />
            <Text style={styles.locationTitle}>Your Location</Text>
          </View>
          <View style={styles.coordinatesContainer}>
            <Text style={styles.coordinate}>
              Lat: {formatCoordinate(location.latitude, 'lat')}
            </Text>
            <Text style={styles.coordinate}>
              Lng: {formatCoordinate(location.longitude, 'lng')}
            </Text>
          </View>
          <Text style={styles.accuracy}>
            Accuracy: ±{location.accuracy?.toFixed(0) || 'N/A'}m
          </Text>
        </View>
      )}

      {/* Search Section */}
      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>Find Racers</Text>
        <TouchableOpacity 
          style={[styles.searchButton, isSearching && styles.searchingButton]}
          onPress={searchNearbyRacers}
          disabled={isSearching || !location}
        >
          {isSearching ? (
            <>
              <ActivityIndicator size="small" color="#000" />
              <Text style={styles.searchButtonText}>Searching...</Text>
            </>
          ) : (
            <>
              <Ionicons name="search" size={20} color="#000" />
              <Text style={styles.searchButtonText}>Search for Nearby Racers</Text>
            </>
          )}
        </TouchableOpacity>
        
        <Text style={styles.searchInfo}>
          This will scan within {searchRadius} miles for other DASH users who are actively racing or looking for races.
        </Text>
      </View>

      {/* Nearby Players Results */}
      {nearbyPlayers.length > 0 && (
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>Nearby Racers ({nearbyPlayers.length})</Text>
          {nearbyPlayers.map((player) => (
            <View key={player.id} style={styles.playerCard}>
              <View style={styles.playerHeader}>
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>
                    {player.displayName || player.username}
                  </Text>
                  <Text style={styles.playerVehicle}>
                    {player.vehicle.color} {player.vehicle.make} {player.vehicle.model}
                  </Text>
                </View>
                <View style={styles.playerStatus}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(player.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(player.status) }]}>
                    {getStatusText(player.status)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.playerStats}>
                <View style={styles.playerStat}>
                  <Ionicons name="speedometer" size={16} color={colors.textSecondary} />
                  <Text style={styles.statText}>
                    {player.speed ? `${Math.round(player.speed)} mph` : 'Stationary'}
                  </Text>
                </View>
                <View style={styles.playerStat}>
                  <Ionicons name="time" size={16} color={colors.textSecondary} />
                  <Text style={styles.statText}>
                    {Math.round((Date.now() - player.lastSeen.getTime()) / 60000)}m ago
                  </Text>
                </View>
                {player.isFriend && (
                  <View style={styles.playerStat}>
                    <Ionicons name="people" size={16} color={colors.warning} />
                    <Text style={[styles.statText, { color: colors.warning }]}>Friend</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity 
                style={styles.challengeButton}
                onPress={() => challengePlayer(player)}
                disabled={player.status === 'racing'}
              >
                <Ionicons name="flash" size={16} color="#000" />
                <Text style={styles.challengeButtonText}>
                  {player.status === 'racing' ? 'In Race' : 'Challenge'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* How It Works */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepText}>1</Text>
            </View>
            <Text style={styles.stepDescription}>
              Enable location sharing and start broadcasting your presence
            </Text>
          </View>
          
          <View style={styles.infoStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepText}>2</Text>
            </View>
            <Text style={styles.stepDescription}>
              Search for nearby racers within a {searchRadius}-mile radius
            </Text>
          </View>
          
          <View style={styles.infoStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepText}>3</Text>
            </View>
            <Text style={styles.stepDescription}>
              Send challenges and join racing sessions
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={isBroadcasting ? stopBroadcasting : startBroadcasting}
        >
          <Ionicons 
            name={isBroadcasting ? "radio" : "radio-outline"} 
            size={24} 
            color={isBroadcasting ? colors.primary : colors.primary} 
          />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>
              {isBroadcasting ? 'Stop Broadcasting' : 'Start Broadcasting'}
            </Text>
            <Text style={styles.actionSubtitle}>
              {isBroadcasting 
                ? 'You are visible to nearby racers' 
                : 'Make yourself visible to nearby racers'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="people" size={24} color={colors.primary} />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Join Public Lobby</Text>
            <Text style={styles.actionSubtitle}>Connect with racers in public sessions</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={getCurrentLocation}>
          <Ionicons name="refresh" size={24} color={colors.primary} />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Refresh Location</Text>
            <Text style={styles.actionSubtitle}>Update your current position</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>
      </View>

      {/* Pro Features */}
      {!user?.isPro && (
        <View style={styles.proSection}>
          <View style={styles.proHeader}>
            <Ionicons name="diamond" size={24} color="#FFD700" />
            <Text style={styles.proTitle}>Pro Features</Text>
          </View>
          <Text style={styles.proText}>
            Upgrade to Pro for extended search radius, priority matching, and advanced racer filters.
          </Text>
          <TouchableOpacity style={styles.proButton}>
            <Text style={styles.proButtonText}>Learn More</Text>
            <Ionicons name="arrow-forward" size={16} color="#000" />
          </TouchableOpacity>
        </View>
      )}
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#aaa',
    fontSize: 16,
  },
  locationSection: {
    backgroundColor: '#111',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  coordinatesContainer: {
    marginBottom: 8,
  },
  coordinate: {
    color: colors.primary,
    fontSize: 14,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  accuracy: {
    color: '#888',
    fontSize: 12,
  },
  searchSection: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  searchingButton: {
    backgroundColor: '#cc0000',
  },
  searchButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  searchInfo: {
    color: '#aaa',
    fontSize: 14,
    lineHeight: 20,
  },
  resultsSection: {
    margin: 20,
    marginTop: 0,
  },
  playerCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.surfaceSecondary,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  playerVehicle: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  playerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  playerStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  playerStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  challengeButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  challengeButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoSection: {
    margin: 20,
    marginTop: 0,
  },
  infoCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 20,
  },
  infoStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepDescription: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  actionsSection: {
    margin: 20,
    marginTop: 0,
  },
  actionButton: {
    backgroundColor: '#111',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionContent: {
    flex: 1,
    marginLeft: 16,
  },
  actionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  actionSubtitle: {
    color: '#aaa',
    fontSize: 14,
  },
  proSection: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  proHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  proTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  proText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  proButton: {
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  proButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
  },
});