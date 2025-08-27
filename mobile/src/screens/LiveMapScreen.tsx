import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Modal,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
  TextInput,
  PermissionsAndroid,
  Platform 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ScreenHeader } from '../components/common/ScreenHeader';
import Geolocation from 'react-native-geolocation-service';
import { StatusBar } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import LinearGradient from 'react-native-linear-gradient';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography, shadows } from '../utils/theme';
import { GPSCoordinate } from '../types/racing';
import { LiveMapService } from '../services/LiveMapService';
import { EnhancedLiveMapService } from '../services/EnhancedLiveMapService';
import { GoogleMapsIntegrationService } from '../services/GoogleMapsIntegrationService';
import RacerIDAndFriendsService, { FriendMapMarker } from '../services/RacerIDAndFriendsService';
import ScreenContainer from '../components/layout/ScreenContainer';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Custom location types for react-native-geolocation-service
interface LocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number;
    speed: number | null;
    heading: number | null;
  };
  timestamp: number;
}

// Live Player Interface
interface LivePlayer {
  id: string;
  username: string;
  location: GPSCoordinate;
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

// Live Event Interface
interface LiveEvent {
  id: string;
  title: string;
  type: 'drag_race' | 'street_race' | 'time_trial' | 'drift_competition' | 'car_meet' | 'custom_race';
  location: GPSCoordinate;
  startTime: Date;
  duration: number; // minutes
  participants: number;
  maxParticipants: number;
  entryFee?: number;
  prizePool?: number;
  status: 'starting_soon' | 'active' | 'finished';
  difficulty: 'beginner' | 'intermediate' | 'expert';
  requirements?: string[];
  route?: Array<{ latitude: number; longitude: number }>;
  isCustomLocation?: boolean; // Can race anywhere!
  surfaceType?: 'street' | 'highway' | 'parking_lot' | 'track' | 'dirt' | 'other';
  description?: string;
}

// Map Filter Interface
interface MapFilters {
  showPlayers: boolean;
  showRaces: boolean;
  showEvents: boolean;
  showFriendsOnly: boolean;
  eventTypes: string[];
  maxDistance: number; // km
}

export function LiveMapScreen({ navigation }: any) {
  const { settings, getSpeedUnitLabel } = useSettings();
  const { user } = useAuth();
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<LocationPosition | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Live Map Features
  const [livePlayers, setLivePlayers] = useState<LivePlayer[]>([]);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<LiveEvent | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<LivePlayer | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateRaceModal, setShowCreateRaceModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [selectedMapLocation, setSelectedMapLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedCreationType, setSelectedCreationType] = useState<'race' | 'event' | null>(null);
  
  // New features
  const [destination, setDestination] = useState<{ latitude: number; longitude: number; address?: string } | null>(null);
  const [policeMarkers, setPoliceMarkers] = useState<Array<{ id: string; latitude: number; longitude: number; timestamp: Date }>>([]);
  const [showDestinationSearch, setShowDestinationSearch] = useState(false);
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [destinationInput, setDestinationInput] = useState('');
  const [isMarkingPolice, setIsMarkingPolice] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  
  const [mapFilters, setMapFilters] = useState<MapFilters>({
    showPlayers: true,
    showRaces: true,
    showEvents: true,
    showFriendsOnly: false,
    eventTypes: ['drag_race', 'street_race', 'time_trial', 'drift_competition', 'car_meet'],
    maxDistance: 50, // km
  });
  const [mapMode, setMapMode] = useState<'standard' | 'racing' | 'satellite'>('racing');

  // Friends on Map
  const [friendsOnMap, setFriendsOnMap] = useState<FriendMapMarker[]>([]);
  const [showFriendsPanel, setShowFriendsPanel] = useState(false);

  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const locationSubscription = useRef<number | null>(null);
  const lastLocation = useRef<LocationPosition | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const liveUpdateInterval = useRef<any>(null);

  useEffect(() => {
    initializeLocation();
    initializeAnimations();
    
    return () => {
      if (locationSubscription.current) {
        Geolocation.clearWatch(locationSubscription.current);
      }
      if (liveUpdateInterval.current) {
        clearInterval(liveUpdateInterval.current);
      }
    };
  }, []);

  // Start live updates once we have location and user
  useEffect(() => {
    if (currentLocation && user) {
      startLiveUpdates();
    }
  }, [currentLocation, user]);

  const initializeAnimations = () => {
    // Pulse animation for live indicators
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotation animation for radar effect
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  };

  const startLiveUpdates = () => {
    // Simulate live data updates every 5 seconds
    liveUpdateInterval.current = setInterval(() => {
      updateLivePlayers();
      updateLiveEvents();
      updateFriendsOnMap(); // Add friends updates
    }, 5000);

    // Initial load
    loadInitialData();
  };

  const loadInitialData = async () => {
    if (!currentLocation || !user) {
      console.log('No location or user available for loading live data');
      return;
    }

    try {
      setIsLoading(true);
      
      const { latitude, longitude } = currentLocation.coords;
      
      // Load nearby players, events, and friends in parallel
      const [playersResult, eventsResult, friendsResult] = await Promise.all([
        EnhancedLiveMapService.getNearbyPlayers(latitude, longitude, mapFilters.maxDistance),
        EnhancedLiveMapService.getNearbyEvents(latitude, longitude, mapFilters.maxDistance),
        RacerIDAndFriendsService.getFriendsForMap(),
      ]);

      setLivePlayers(playersResult.players);
      setLiveEvents(eventsResult.events);
      setFriendsOnMap(friendsResult);

      console.log(`Loaded ${playersResult.players.length} players, ${eventsResult.events.length} events, and ${friendsResult.length} friends`);
    } catch (error) {
      console.error('Failed to load live map data:', error);
      // Fallback to empty data on error
      setLivePlayers([]);
      setLiveEvents([]);
      setFriendsOnMap([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateLivePlayers = async () => {
    // For real-time updates, we'd typically use WebSocket connections
    // For now, we'll refresh the data periodically via API
    if (currentLocation && user) {
      try {
        const { latitude, longitude } = currentLocation.coords;
        const playersResult = await EnhancedLiveMapService.getNearbyPlayers(latitude, longitude, mapFilters.maxDistance);
        setLivePlayers(playersResult.players);
      } catch (error) {
        console.error('Failed to update live players:', error);
        // Keep existing data on error
      }
    }
  };
  const updateLiveEvents = async () => {
    // For real-time updates, we'd typically use WebSocket connections
    // For now, we'll refresh the data periodically via API
    if (currentLocation && user) {
      try {
        const { latitude, longitude } = currentLocation.coords;
        const eventsResult = await EnhancedLiveMapService.getNearbyEvents(latitude, longitude, mapFilters.maxDistance);
        setLiveEvents(eventsResult.events);
      } catch (error) {
        console.error('Failed to update live events:', error);
        // Keep existing data on error
      }
    }
  };

  const updateFriendsOnMap = async () => {
    // Update friends locations and status
    try {
      const friends = await RacerIDAndFriendsService.getFriendsForMap();
      setFriendsOnMap(friends);
    } catch (error) {
      console.error('Failed to update friends on map:', error);
      // Keep existing friends data on error
    }
  };

  const initializeLocation = async () => {
    try {
      // Request permission for Android
      let hasPermission = true;
      if (Platform.OS === 'android') {
        const permission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to location for live tracking.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        hasPermission = permission === PermissionsAndroid.RESULTS.GRANTED;
      }

      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Location permission is required for live tracking. Please enable it in settings.',
          [{ text: 'OK' }]
        );
        setIsLoading(false);
        return;
      }

      // Get initial location - default to San Francisco for demo
      let location: LocationPosition = {
        coords: {
          latitude: 37.7749,
          longitude: -122.4194,
          altitude: 0,
          accuracy: 10,
          speed: 0,
          heading: 0,
        },
        timestamp: Date.now(),
      };
      
      try {
        await new Promise<void>((resolve, reject) => {
          Geolocation.getCurrentPosition(
            (position) => {
              location = {
                coords: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  altitude: position.coords.altitude,
                  accuracy: position.coords.accuracy,
                  speed: position.coords.speed,
                  heading: position.coords.heading,
                },
                timestamp: position.timestamp,
              };
              resolve();
            },
            (error) => {
              console.warn('GPS error:', error);
              reject(error);
            },
            { 
              enableHighAccuracy: true, 
              timeout: 15000, 
              maximumAge: 10000 
            }
          );
        });
      } catch (error) {
        console.warn('Using default location due to GPS error:', error);
        // location is already set to default above
      }
      
      setCurrentLocation(location);
      lastLocation.current = location;
      setIsLoading(false);

      // Start watching location
      startLocationTracking();
    } catch (error) {
      console.error('Error initializing location:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to initialize GPS. Using default location.');
      
      // Fallback to San Francisco
      const defaultLocation: LocationPosition = {
        coords: {
          latitude: 37.7749,
          longitude: -122.4194,
          altitude: 0,
          accuracy: 10,
          speed: 0,
          heading: 0,
        },
        timestamp: Date.now(),
      };
      
      setCurrentLocation(defaultLocation);
      lastLocation.current = defaultLocation;
    }
  };

  const startLocationTracking = async () => {
    try {
      locationSubscription.current = Geolocation.watchPosition(
        (position) => {
          const location: LocationPosition = {
            coords: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              altitude: position.coords.altitude,
              accuracy: position.coords.accuracy,
              speed: position.coords.speed,
              heading: position.coords.heading,
            },
            timestamp: position.timestamp,
          };
          
          setCurrentLocation(location);
          
          // Add to route if tracking
          if (isTracking) {
            setRouteCoordinates(prev => [...prev, {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }]);
          }
          
          // Calculate speed and convert to user's preferred unit
          const speedMps = location.coords.speed || 0; // meters per second
          const speedKmh = speedMps * 3.6; // km/h
          const speedMph = speedKmh * 0.621371; // mph
          
          const currentSpeedInUserUnit = settings.speedUnit === 'mph' ? speedMph : speedKmh;
          setCurrentSpeed(Math.max(0, currentSpeedInUserUnit));
          
          lastLocation.current = location;
        },
        (error) => {
          console.warn('Location tracking error:', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 1000,
          distanceFilter: 1, // Update every meter
        }
      );
      setIsTracking(true);
    } catch (error) {
      console.error('Error starting location tracking:', error);
      Alert.alert('Error', 'Failed to start GPS tracking.');
    }
  };

  const calculateDistance = (coord1: any, coord2: any) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
    const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in meters
  };

  const joinEvent = async (event: LiveEvent) => {
    if (event.participants >= event.maxParticipants) {
      Alert.alert('Event Full', 'This event has reached maximum capacity.');
      return;
    }

    Alert.alert(
      'Join Event',
      `Join "${event.title}"?${event.entryFee ? `\n\nEntry Fee: $${event.entryFee}` : ''}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Join', 
          onPress: async () => {
            try {
              const result = await EnhancedLiveMapService.joinEvent(event.id);
              if (result.success) {
                // Optimistically update local state
                setLiveEvents(prev => prev.map(e => 
                  e.id === event.id 
                    ? { ...e, participants: e.participants + 1 }
                    : e
                ));
                Alert.alert('Joined!', `You've joined "${event.title}". Check your notifications for updates.`);
                setShowEventModal(false);
              } else {
                Alert.alert('Failed to Join', result.error || 'Could not join the event. Please try again.');
              }
            } catch (error) {
              console.error('Failed to join event:', error);
              Alert.alert('Error', 'Failed to join event. Please check your connection and try again.');
            }
          }
        },
      ]
    );
  };

  const viewPlayerProfile = (player: LivePlayer) => {
    setSelectedPlayer(player);
    setShowPlayerModal(true);
  };

  const challengePlayer = (player: LivePlayer) => {
    Alert.alert(
      'Challenge Player',
      `Challenge ${player.username} to a race?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Challenge', 
          onPress: () => {
            Alert.alert('Challenge Sent!', `Race challenge sent to ${player.username}.`);
            setShowPlayerModal(false);
          }
        },
      ]
    );
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'drag_race': return '';
      case 'street_race': return '';
      case 'time_trial': return '';
      case 'drift_competition': return '';
      case 'car_meet': return '';
      case 'custom_race': return '';
      default: return '📍';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'drag_race': return '#FF4444';
      case 'street_race': return '#FF8800';
      case 'time_trial': return '#00AA00';
      case 'drift_competition': return '#8800FF';
      case 'car_meet': return '#0088FF';
      case 'custom_race': return '#FF0080';
      default: return colors.primary;
    }
  };

  const getPlayerStatusColor = (status: string) => {
    switch (status) {
      case 'racing': return '#FF4444';
      case 'online': return '#00AA00';
      case 'away': return '#FFAA00';
      default: return '#888888';
    }
  };

  // Handle map press - CREATE ANYTHING ANYWHERE! 
  const handleMapPress = (event: any) => {
    const coordinate = event.nativeEvent.coordinate;
    setSelectedMapLocation({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude
    });
    
    if (isMarkingPolice) {
      handleMarkPolice(coordinate);
      return;
    }
    
    // Show options: Create race, event, set destination, or mark police
    Alert.alert(
      'Map Actions',
      'What would you like to do at this location?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: ' Create Race', 
          onPress: () => {
            setSelectedCreationType('race');
            setShowCreateRaceModal(true);
          }
        },
        { 
          text: ' Create Event', 
          onPress: () => {
            setSelectedCreationType('event');
            setShowCreateEventModal(true);
          }
        },
        {
          text: '📍 Set Destination',
          onPress: () => handleSetDestination(coordinate)
        },
        {
          text: '🚔 Mark Police',
          onPress: () => handleMarkPolice(coordinate)
        }
      ]
    );
  };

  // New handler functions for destination and police marking
  const handleSetDestination = async (coordinate: { latitude: number; longitude: number }, address?: string) => {
    try {
      setDestination({ ...coordinate, address: address || 'Selected Location' });
      Alert.alert('Destination Set', address ? `Destination set to: ${address}` : 'Destination has been set on the map.');
    } catch (error) {
      console.error('Set destination error:', error);
      Alert.alert('Error', 'Failed to set destination.');
    }
  };

  const handleSetDestinationFromEvent = (event: LiveEvent) => {
    handleSetDestination(event.location, event.title);
  };

  const handleAddressSearch = async () => {
    if (!destinationInput.trim()) {
      Alert.alert('Error', 'Please enter an address to search for.');
      return;
    }

    setIsSearchingAddress(true);
    try {
      // Simple geocoding simulation - in a real app, you'd use Google Geocoding API
      // For now, we'll just simulate a search result
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Mock coordinates for demo - replace with actual geocoding
      const mockResults = [
        { lat: 34.0522, lng: -118.2437, address: "Los Angeles, CA" },
        { lat: 40.7128, lng: -74.0060, address: "New York, NY" },
        { lat: 41.8781, lng: -87.6298, address: "Chicago, IL" }
      ];
      
      const searchTerm = destinationInput.toLowerCase();
      const result = mockResults.find(r => r.address.toLowerCase().includes(searchTerm)) || mockResults[0];
      
      const coordinate = { latitude: result.lat, longitude: result.lng };
      await handleSetDestination(coordinate, result.address);
      setDestinationInput('');
      setShowDestinationModal(false);
      
      // Center map on destination
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: result.lat,
          longitude: result.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }
    } catch (error) {
      console.error('Address search error:', error);
      Alert.alert('Search Failed', 'Could not find the specified address. Please try again.');
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const handleMarkPolice = (coordinate: { latitude: number; longitude: number }) => {
    const newPoliceMarker = {
      id: Date.now().toString(),
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      timestamp: new Date(),
    };
    
    setPoliceMarkers(prev => [...prev, newPoliceMarker]);
    setIsMarkingPolice(false);
    Alert.alert('Police Marked', 'Police location has been marked for other users.');
    
    // Remove police marker after 30 minutes
    setTimeout(() => {
      setPoliceMarkers(prev => prev.filter(marker => marker.id !== newPoliceMarker.id));
    }, 30 * 60 * 1000);
  };

  const clearDestination = () => {
    setDestination(null);
    Alert.alert('Destination Cleared', 'Destination has been removed.');
  };

  // Create custom race at selected location
  const createCustomRace = async (raceData: {
    title: string;
    type: LiveEvent['type'];
    maxParticipants: number;
    duration: number;
    difficulty: 'beginner' | 'intermediate' | 'expert';
    description?: string;
  }) => {
    if (!selectedMapLocation) return;

    try {
      const startTime = new Date(Date.now() + 5 * 60 * 1000); // Start in 5 minutes
      
      const result = await EnhancedLiveMapService.createCustomRace({
        ...raceData,
        location: selectedMapLocation,
        startTime,
      });

      if (result.success) {
        Alert.alert('Race Created!', 'Your custom race has been created. Other racers can now join!');
        setShowCreateRaceModal(false);
        setSelectedMapLocation(null);
        setSelectedCreationType(null);
        
        // Refresh events to show the new race
        loadInitialData();
      } else {
        Alert.alert('Failed to Create Race', result.error || 'Please try again.');
      }
    } catch (error) {
      console.error('Create race error:', error);
      Alert.alert('Error', 'Failed to create race. Please check your connection and try again.');
    }
  };

  // Create custom event/meetup at selected location
  const createCustomEvent = async (eventData: {
    title: string;
    description: string;
    eventType: 'car_meet' | 'cruise' | 'show_and_tell' | 'photo_session';
    isPrivate: boolean;
    maxParticipants: number;
    duration: number;
    requirements?: string[];
    entryFee?: number;
  }) => {
    if (!selectedMapLocation) return;

    try {
      const startTime = new Date(Date.now() + 10 * 60 * 1000); // Start in 10 minutes
      
      const result = await EnhancedLiveMapService.createCustomEvent({
        ...eventData,
        location: selectedMapLocation,
        startTime,
        type: 'car_meet', // All events are car_meet type in the interface
      });

      if (result.success) {
        const privacy = eventData.isPrivate ? 'Private' : 'Public';
        Alert.alert('Event Created!', `Your ${privacy.toLowerCase()} event has been created. Car enthusiasts can now join!`);
        setShowCreateEventModal(false);
        setSelectedMapLocation(null);
        setSelectedCreationType(null);
        
        // Refresh events to show the new event
        loadInitialData();
      } else {
        Alert.alert('Failed to Create Event', result.error || 'Please try again.');
      }
    } catch (error) {
      console.error('Create event error:', error);
      Alert.alert('Error', 'Failed to create event. Please check your connection and try again.');
    }
  };

  const formatTimeUntilStart = (startTime: Date) => {
    const now = new Date();
    const diff = startTime.getTime() - now.getTime();
    
    if (diff < 0) return 'Started';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const filteredEvents = liveEvents.filter(event => {
    if (!mapFilters.showEvents) return false;
    if (!mapFilters.eventTypes.includes(event.type)) return false;
    
    if (currentLocation) {
      const distance = calculateDistance(
        currentLocation.coords,
        event.location
      ) / 1000; // Convert to km
      
      if (distance > mapFilters.maxDistance) return false;
    }
    
    return true;
  });

  const filteredPlayers = livePlayers.filter(player => {
    if (!mapFilters.showPlayers) return false;
    if (mapFilters.showFriendsOnly && !player.isFriend) return false;
    
    if (currentLocation) {
      const distance = calculateDistance(
        currentLocation.coords,
        player.location
      ) / 1000; // Convert to km
      
      if (distance > mapFilters.maxDistance) return false;
    }
    
    return true;
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <ActivityIndicator size="large" color="#FF0000" />
        <Text style={styles.loadingText}>Initializing Live Map...</Text>
      </View>
    );
  }

  return (
    <ScreenContainer hideTopInset={true}>
      <ScreenHeader 
        title="Live Map" 
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Ionicons name="options" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        }
      />
      
      {/* Map View */}
      {currentLocation && (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          onPress={handleMapPress} //  TAP ANYWHERE TO CREATE A RACE!
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          mapType={mapMode === 'satellite' ? 'satellite' : 'standard'}
          customMapStyle={mapMode === 'racing' ? racingMapStyle : undefined}
        >
          {/* Current User Location */}
          <Marker
            coordinate={{
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
            }}
            title="Your Location"
            description={`Speed: ${currentSpeed.toFixed(1)} ${getSpeedUnitLabel()}`}
          >
            <View style={styles.userMarker}>
              <Animated.View style={[
                styles.userMarkerPulse,
                { transform: [{ scale: pulseAnim }] }
              ]} />
              <View style={styles.userMarkerInner} />
            </View>
          </Marker>

          {/* Live Players */}
          {filteredPlayers.map((player) => (
            <Marker
              key={player.id}
              coordinate={player.location}
              title={player.username}
              description={`${player.vehicle.make} ${player.vehicle.model} • ${Math.round(player.speed * 2.237)} MPH`}
              onPress={() => viewPlayerProfile(player)}
            >
              <View style={[
                styles.playerMarker,
                { borderColor: player.isFriend ? '#00FF88' : getPlayerStatusColor(player.status) }
              ]}>
                <View style={[
                  styles.playerMarkerInner,
                  { backgroundColor: player.isFriend ? '#00FF88' : getPlayerStatusColor(player.status) }
                ]} />
                <View style={[
                  styles.playerMarkerDirection,
                  { 
                    transform: [{ rotate: `${player.heading}deg` }],
                    backgroundColor: player.isFriend ? '#00FF88' : getPlayerStatusColor(player.status)
                  }
                ]} />
                {player.isFriend && (
                  <View style={styles.friendIndicator}>
                    <Ionicons name="heart" size={10} color="#00FF88" />
                  </View>
                )}
              </View>
            </Marker>
          ))}

          {/* Friends on Map */}
          {friendsOnMap.map((friend) => (
            <Marker
              key={`friend-${friend.racerId}`}
              coordinate={{ latitude: friend.position.lat, longitude: friend.position.lng }}
              title={friend.profile.displayName}
              description={`Friend • ${friend.status} • ${friend.profile.stats.skillRating}/10 skill`}
              onPress={() => {
                Alert.alert(
                  friend.profile.displayName,
                  `${friend.profile.racerId}\n\n ${friend.profile.stats.totalRaces} races • ${friend.profile.stats.winRate.toFixed(1)}% win rate\n⭐ ${friend.profile.stats.skillRating}/10 skill\n\nStatus: ${friend.status}${friend.currentActivity ? `\nActivity: ${friend.currentActivity.eventName}` : ''}`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    ...(friend.currentActivity?.canJoin ? [{
                      text: 'Join Activity',
                      onPress: () => {
                        // Navigate to join their race/event
                        console.log('Join friend activity:', friend.currentActivity);
                      }
                    }] : []),
                    {
                      text: 'Invite to Race',
                      onPress: () => {
                        setSelectedMapLocation({ latitude: friend.position.lat, longitude: friend.position.lng });
                        setSelectedCreationType('race');
                        setShowCreateRaceModal(true);
                      }
                    }
                  ]
                );
              }}
            >
              <View style={[
                styles.playerMarker,
                { borderColor: '#00FF88', borderWidth: 3 } // Special styling for friends
              ]}>
                <View style={[
                  styles.playerMarkerInner,
                  { backgroundColor: '#00FF88' }
                ]} />
                {/* Friend heart indicator */}
                <View style={styles.friendIndicator}>
                  <Ionicons name="heart" size={8} color="#fff" />
                </View>
                {/* Status indicator based on activity */}
                {friend.status === 'racing' && (
                  <View style={[styles.friendIndicator, { top: -2, right: -2 }]}>
                    <Ionicons name="flash" size={6} color="#FFD700" />
                  </View>
                )}
              </View>
            </Marker>
          ))}

          {/* Live Events */}
          {filteredEvents.map((event) => (
            <Marker
              key={event.id}
              coordinate={event.location}
              title={event.title}
              description={`${event.participants}/${event.maxParticipants} players • ${formatTimeUntilStart(event.startTime)}`}
              onPress={() => {
                Alert.alert(
                  event.title,
                  'What would you like to do?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'View Details',
                      onPress: () => {
                        setSelectedEvent(event);
                        setShowEventModal(true);
                      }
                    },
                    {
                      text: 'Set as Destination',
                      onPress: () => handleSetDestinationFromEvent(event)
                    }
                  ]
                );
              }}
            >
              <View style={[
                styles.eventMarker,
                { backgroundColor: getEventColor(event.type) }
              ]}>
                <Text style={styles.eventMarkerIcon}>
                  {getEventIcon(event.type)}
                </Text>
                {event.status === 'active' && (
                  <Animated.View style={[
                    styles.eventMarkerPulse,
                    { transform: [{ scale: pulseAnim }] }
                  ]} />
                )}
              </View>
            </Marker>
          ))}

          {/* Route Polyline */}
          {routeCoordinates.length > 1 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor={colors.primary}
              strokeWidth={4}
              lineJoin="round"
              lineCap="round"
            />
          )}

          {/* Event Route Previews */}
          {filteredEvents.filter(e => e.route).map((event) => (
            <Polyline
              key={`route-${event.id}`}
              coordinates={event.route!}
              strokeColor={getEventColor(event.type) + '80'}
              strokeWidth={3}
              lineDashPattern={[5, 5]}
            />
          ))}

          {/* Destination Marker */}
          {destination && (
            <Marker
              coordinate={destination}
              title="Destination"
              description={destination.address || 'Selected destination'}
              pinColor={colors.accent}
            >
              <View style={styles.destinationMarker}>
                <Ionicons name="flag" size={20} color={colors.accent} />
              </View>
            </Marker>
          )}

          {/* Police Markers */}
          {policeMarkers.map((police) => (
            <Marker
              key={`police-${police.id}`}
              coordinate={{ latitude: police.latitude, longitude: police.longitude }}
              title="Police Spotted"
              description={`Reported ${Math.floor((new Date().getTime() - police.timestamp.getTime()) / 60000)} min ago`}
            >
              <View style={styles.policeMarker}>
                <Ionicons name="shield" size={16} color="#ff4444" />
              </View>
            </Marker>
          ))}

          {/* Destination Route Polyline */}
          {destination && currentLocation && (
            <Polyline
              coordinates={[
                {
                  latitude: currentLocation.coords.latitude,
                  longitude: currentLocation.coords.longitude,
                },
                destination
              ]}
              strokeColor={colors.accent}
              strokeWidth={3}
              lineDashPattern={[10, 5]}
            />
          )}
        </MapView>
      )}

      {/* Compact Speed Display */}
      <View style={styles.compactSpeedContainer}>
        <LinearGradient
          colors={[colors.background + 'EE', colors.surface + 'EE']}
          style={styles.compactSpeedGradient}
        >
          <Text style={styles.compactSpeedValue}>{currentSpeed.toFixed(0)}</Text>
          <Text style={styles.compactSpeedUnit}>{getSpeedUnitLabel()}</Text>
        </LinearGradient>
      </View>

      {/* Compact Activity Counter - Moved to side */}
      <View style={styles.compactActivityContainer}>
        <LinearGradient
          colors={[colors.primary + '30', colors.secondary + '30']}
          style={styles.compactActivityGradient}
        >
          <View style={styles.compactActivityItem}>
            <Ionicons name="people" size={12} color={colors.primary} />
            <Text style={styles.compactActivityCount}>{filteredPlayers.length}</Text>
          </View>
          <View style={styles.compactActivityItem}>
            <Ionicons name="flag" size={12} color={colors.warning} />
            <Text style={styles.compactActivityCount}>{filteredEvents.filter(e => e.status === 'active').length}</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.mapModeButton}
          onPress={() => {
            const modes: Array<'standard' | 'racing' | 'satellite'> = ['standard', 'racing', 'satellite'];
            const currentIndex = modes.indexOf(mapMode);
            const nextIndex = (currentIndex + 1) % modes.length;
            setMapMode(modes[nextIndex]);
          }}
        >
          <LinearGradient
            colors={[colors.surfaceSecondary, colors.surfaceElevated]}
            style={styles.buttonGradient}
          >
            <Ionicons name="map" size={20} color="#fff" />
            <Text style={styles.buttonText}>{mapMode.toUpperCase()}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.filtersButton}
          onPress={() => setShowDestinationModal(true)}
        >
          <LinearGradient
            colors={[colors.accent + '80', colors.accent]}
            style={styles.buttonGradient}
          >
            <Ionicons name="navigate" size={20} color="#fff" />
            <Text style={styles.buttonText}>DESTINATION</Text>
          </LinearGradient>
        </TouchableOpacity>

        {destination && (
          <TouchableOpacity 
            style={styles.filtersButton}
            onPress={clearDestination}
          >
            <LinearGradient
              colors={[colors.warning + '80', colors.warning]}
              style={styles.buttonGradient}
            >
              <Ionicons name="close" size={20} color="#fff" />
              <Text style={styles.buttonText}>CLEAR</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.filtersButton}
          onPress={() => setShowFilters(true)}
        >
          <LinearGradient
            colors={[colors.surfaceSecondary, colors.surfaceElevated]}
            style={styles.buttonGradient}
          >
            <Ionicons name="options" size={20} color="#fff" />
            <Text style={styles.buttonText}>FILTERS</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.refreshButton} onPress={initializeLocation}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.buttonGradient}
          >
            <Animated.View style={{ transform: [{ rotate: rotateAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg']
            })}] }}>
              <Ionicons name="refresh" size={20} color="#fff" />
            </Animated.View>
            <Text style={styles.buttonText}>REFRESH</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Event Details Modal */}
      <Modal
        visible={showEventModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEventModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEventModal(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Event Details</Text>
            <View style={{ width: 24 }} />
          </View>

          {selectedEvent && (
            <ScrollView style={styles.modalContent}>
              <View style={[styles.eventHeaderContainer, { backgroundColor: getEventColor(selectedEvent.type) + '20' }]}>
                <Text style={styles.eventHeaderIcon}>{getEventIcon(selectedEvent.type)}</Text>
                <View style={styles.eventHeaderInfo}>
                  <Text style={styles.eventHeaderTitle}>{selectedEvent.title}</Text>
                  <Text style={styles.eventHeaderType}>
                    {selectedEvent.type.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.eventStatsContainer}>
                <View style={styles.eventStatRow}>
                  <Ionicons name="people" size={20} color={colors.primary} />
                  <Text style={styles.eventStatLabel}>Participants:</Text>
                  <Text style={styles.eventStatValue}>
                    {selectedEvent.participants}/{selectedEvent.maxParticipants}
                  </Text>
                </View>

                <View style={styles.eventStatRow}>
                  <Ionicons name="time" size={20} color={colors.primary} />
                  <Text style={styles.eventStatLabel}>Starts:</Text>
                  <Text style={styles.eventStatValue}>
                    {formatTimeUntilStart(selectedEvent.startTime)}
                  </Text>
                </View>

                {selectedEvent.prizePool && (
                  <View style={styles.eventStatRow}>
                    <Ionicons name="trophy" size={20} color={colors.primary} />
                    <Text style={styles.eventStatLabel}>Prize Pool:</Text>
                    <Text style={styles.eventStatValue}>
                      ${selectedEvent.prizePool}
                    </Text>
                  </View>
                )}

                {selectedEvent.entryFee && (
                  <View style={styles.eventStatRow}>
                    <Ionicons name="card" size={20} color={colors.warning} />
                    <Text style={styles.eventStatLabel}>Entry Fee:</Text>
                    <Text style={styles.eventStatValue}>
                      ${selectedEvent.entryFee}
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.joinButton,
                  selectedEvent.participants >= selectedEvent.maxParticipants && styles.joinButtonDisabled
                ]}
                onPress={() => joinEvent(selectedEvent)}
                disabled={selectedEvent.participants >= selectedEvent.maxParticipants}
              >
                <LinearGradient
                  colors={selectedEvent.participants >= selectedEvent.maxParticipants 
                    ? ['#666', '#444'] 
                    : [colors.primary, colors.secondary]
                  }
                  style={styles.joinButtonGradient}
                >
                  <Ionicons 
                    name={selectedEvent.participants >= selectedEvent.maxParticipants ? "lock-closed" : "flag"} 
                    size={20} 
                    color="#fff" 
                  />
                  <Text style={styles.joinButtonText}>
                    {selectedEvent.participants >= selectedEvent.maxParticipants ? 'Event Full' : 'Join Event'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Player Profile Modal */}
      <Modal
        visible={showPlayerModal}
        animationType="slide" 
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPlayerModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPlayerModal(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Player Profile</Text>
            <View style={{ width: 24 }} />
          </View>

          {selectedPlayer && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.playerProfileContainer}>
                <View style={[
                  styles.playerAvatarContainer,
                  { borderColor: getPlayerStatusColor(selectedPlayer.status) }
                ]}>
                  <Text style={styles.playerAvatarText}>
                    {selectedPlayer.username.charAt(0).toUpperCase()}
                  </Text>
                  <View style={[
                    styles.playerStatusIndicator,
                    { backgroundColor: getPlayerStatusColor(selectedPlayer.status) }
                  ]} />
                </View>
                
                <Text style={styles.playerProfileName}>{selectedPlayer.username}</Text>
                <Text style={styles.playerProfileStatus}>
                  {selectedPlayer.status.toUpperCase()}
                </Text>
                
                {selectedPlayer.isFriend && (
                  <View style={styles.friendBadge}>
                    <Ionicons name="heart" size={16} color={colors.primary} />
                    <Text style={styles.friendBadgeText}>Friend</Text>
                  </View>
                )}
              </View>

              <View style={styles.playerStatsContainer}>
                <Text style={styles.playerStatsTitle}>Current Stats</Text>
                
                <View style={styles.playerStatRow}>
                  <Ionicons name="speedometer" size={20} color={colors.primary} />
                  <Text style={styles.playerStatLabel}>Speed:</Text>
                  <Text style={styles.playerStatValue}>
                    {Math.round(selectedPlayer.speed * 2.237)} MPH
                  </Text>
                </View>

                <View style={styles.playerStatRow}>
                  <Ionicons name="car" size={20} color={colors.primary} />
                  <Text style={styles.playerStatLabel}>Vehicle:</Text>
                  <Text style={styles.playerStatValue}>
                    {selectedPlayer.vehicle.make} {selectedPlayer.vehicle.model}
                  </Text>
                </View>

                <View style={styles.playerStatRow}>
                  <Ionicons name="color-palette" size={20} color={colors.primary} />
                  <Text style={styles.playerStatLabel}>Color:</Text>
                  <Text style={styles.playerStatValue}>
                    {selectedPlayer.vehicle.color}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.playerActionButton}
                onPress={() => challengePlayer(selectedPlayer)}
              >
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  style={styles.playerActionGradient}
                >
                  <Ionicons name="flag" size={20} color="#fff" />
                  <Text style={styles.playerActionText}>Challenge to Race</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Create Race Modal - Race Anywhere! */}
      <Modal
        visible={showCreateRaceModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateRaceModal(false)}
      >
        <View style={styles.modalContent}>
          <ScreenHeader
            title="Create Custom Race"
            showBackButton={true}
            onBackPress={() => setShowCreateRaceModal(false)}
          />
          
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}> Race Anywhere!</Text>
            <Text style={styles.modalSubtitle}>
              Create a custom race at your selected location. No venue restrictions!
            </Text>
            
            <View style={styles.raceFormContainer}>
              <TouchableOpacity
                style={styles.raceTypeButton}
                onPress={() => createCustomRace({
                  title: 'Quick Drag Race',
                  type: 'custom_race',
                  maxParticipants: 8,
                  duration: 300, // 5 minutes
                  difficulty: 'intermediate',
                  description: 'Fast quarter-mile drag race'
                })}
              >
                <LinearGradient
                  colors={['#FF4444', '#FF6666']}
                  style={styles.raceTypeGradient}
                >
                  <Ionicons name="speedometer" size={24} color="#fff" />
                  <Text style={styles.raceTypeText}>Quick Drag Race</Text>
                  <Text style={styles.raceTypeSubtext}>5 min • Up to 8 racers</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.raceTypeButton}
                onPress={() => createCustomRace({
                  title: 'Street Circuit',
                  type: 'custom_race',
                  maxParticipants: 12,
                  duration: 600, // 10 minutes
                  difficulty: 'expert',
                  description: 'Multi-lap street circuit racing'
                })}
              >
                <LinearGradient
                  colors={['#00AA44', '#00CC55']}
                  style={styles.raceTypeGradient}
                >
                  <Ionicons name="car-sport" size={24} color="#fff" />
                  <Text style={styles.raceTypeText}>Street Circuit</Text>
                  <Text style={styles.raceTypeSubtext}>10 min • Up to 12 racers</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.raceTypeButton}
                onPress={() => createCustomRace({
                  title: 'Drift Battle',
                  type: 'custom_race',
                  maxParticipants: 6,
                  duration: 480, // 8 minutes
                  difficulty: 'expert',
                  description: 'Score-based drifting competition'
                })}
              >
                <LinearGradient
                  colors={['#AA00FF', '#CC44FF']}
                  style={styles.raceTypeGradient}
                >
                  <Ionicons name="swap-horizontal" size={24} color="#fff" />
                  <Text style={styles.raceTypeText}>Drift Battle</Text>
                  <Text style={styles.raceTypeSubtext}>8 min • Up to 6 racers</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.raceTypeButton}
                onPress={() => createCustomRace({
                  title: 'Time Trial',
                  type: 'custom_race',
                  maxParticipants: 20,
                  duration: 900, // 15 minutes
                  difficulty: 'beginner',
                  description: 'Individual time attack mode'
                })}
              >
                <LinearGradient
                  colors={['#FF8800', '#FFAA44']}
                  style={styles.raceTypeGradient}
                >
                  <Ionicons name="stopwatch" size={24} color="#fff" />
                  <Text style={styles.raceTypeText}>Time Trial</Text>
                  <Text style={styles.raceTypeSubtext}>15 min • Up to 20 racers</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.locationInfo}>
              📍 Race will be created at your selected map location
            </Text>
          </ScrollView>
        </View>
      </Modal>

      {/* Create Event Modal - Events/Meetups Anywhere! */}
      <Modal
        visible={showCreateEventModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateEventModal(false)}
      >
        <View style={styles.modalContent}>
          <ScreenHeader
            title="Create Custom Event"
            showBackButton={true}
            onBackPress={() => setShowCreateEventModal(false)}
          />
          
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}> Create Event Anywhere!</Text>
            <Text style={styles.modalSubtitle}>
              Create a car meetup or event at your selected location. Connect with fellow car enthusiasts!
            </Text>
            
            <View style={styles.raceFormContainer}>
              <TouchableOpacity
                style={styles.raceTypeButton}
                onPress={() => createCustomEvent({
                  title: 'Car Meet & Greet',
                  description: 'Casual car meetup to show off rides and chat',
                  eventType: 'car_meet',
                  isPrivate: false,
                  maxParticipants: 25,
                  duration: 120, // 2 hours
                })}
              >
                <LinearGradient
                  colors={['#4CAF50', '#66BB6A']}
                  style={styles.raceTypeGradient}
                >
                  <Ionicons name="car-sport" size={24} color="#fff" />
                  <Text style={styles.raceTypeText}>Car Meet & Greet</Text>
                  <Text style={styles.raceTypeSubtext}>Public • 2hrs • 25 people</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.raceTypeButton}
                onPress={() => createCustomEvent({
                  title: 'Private Car Cruise',
                  description: 'Private group cruise for friends only',
                  eventType: 'cruise',
                  isPrivate: true,
                  maxParticipants: 10,
                  duration: 180, // 3 hours
                })}
              >
                <LinearGradient
                  colors={['#2196F3', '#42A5F5']}
                  style={styles.raceTypeGradient}
                >
                  <Ionicons name="lock-closed" size={24} color="#fff" />
                  <Text style={styles.raceTypeText}>Private Cruise</Text>
                  <Text style={styles.raceTypeSubtext}>Private • 3hrs • 10 people</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.raceTypeButton}
                onPress={() => createCustomEvent({
                  title: 'Show & Tell Session',
                  description: 'Share your build stories and modifications',
                  eventType: 'show_and_tell',
                  isPrivate: false,
                  maxParticipants: 30,
                  duration: 90, // 1.5 hours
                })}
              >
                <LinearGradient
                  colors={['#FF9800', '#FFB74D']}
                  style={styles.raceTypeGradient}
                >
                  <Ionicons name="megaphone" size={24} color="#fff" />
                  <Text style={styles.raceTypeText}>Show & Tell</Text>
                  <Text style={styles.raceTypeSubtext}>Public • 1.5hrs • 30 people</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.raceTypeButton}
                onPress={() => createCustomEvent({
                  title: 'Photo Session',
                  description: 'Professional car photography meetup',
                  eventType: 'photo_session',
                  isPrivate: false,
                  maxParticipants: 15,
                  duration: 150, // 2.5 hours
                  entryFee: 10, // Small fee for photographer
                })}
              >
                <LinearGradient
                  colors={['#9C27B0', '#BA68C8']}
                  style={styles.raceTypeGradient}
                >
                  <Ionicons name="camera" size={24} color="#fff" />
                  <Text style={styles.raceTypeText}>Photo Session</Text>
                  <Text style={styles.raceTypeSubtext}>Public • 2.5hrs • $10 • 15 people</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.locationInfo}>
              📍 Event will be created at your selected map location
            </Text>
          </ScrollView>
        </View>
      </Modal>

      {/* Destination Search Modal */}
      <Modal
        visible={showDestinationModal}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setShowDestinationModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDestinationModal(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Set Destination</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.destinationInstructions}>
              Enter an address or search for a location to set as your destination.
            </Text>

            <View style={styles.destinationInputContainer}>
              <TextInput
                style={styles.destinationInput}
                placeholder="Enter address (e.g., Los Angeles, CA)"
                placeholderTextColor={colors.textSecondary}
                value={destinationInput}
                onChangeText={setDestinationInput}
                autoCapitalize="words"
                autoCorrect={false}
              />
              <TouchableOpacity 
                style={styles.searchButton}
                onPress={handleAddressSearch}
                disabled={isSearchingAddress || !destinationInput.trim()}
              >
                {isSearchingAddress ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="search" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>

            {destination && (
              <View style={styles.currentDestinationContainer}>
                <Text style={styles.currentDestinationTitle}>Current Destination:</Text>
                <View style={styles.currentDestinationCard}>
                  <Ionicons name="location" size={20} color={colors.accent} />
                  <Text style={styles.currentDestinationText}>
                    {destination.address || `${destination.latitude.toFixed(4)}, ${destination.longitude.toFixed(4)}`}
                  </Text>
                  <TouchableOpacity onPress={clearDestination}>
                    <Ionicons name="close-circle" size={20} color={colors.warning} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.destinationTipsContainer}>
              <Text style={styles.destinationTipsTitle}>💡 Pro Tips:</Text>
              <Text style={styles.destinationTip}>• Tap on any event marker to set it as destination</Text>
              <Text style={styles.destinationTip}>• Long press anywhere on the map for quick destination</Text>
              <Text style={styles.destinationTip}>• Use the map actions to mark police locations</Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

// Enhanced Racing Map Style - Dark Mode with Outlined Streets
const racingMapStyle = [
  {
    "featureType": "all",
    "elementType": "geometry",
    "stylers": [{ "color": "#000000" }] // Black background
  },
  {
    "featureType": "all",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#ffffff" }] // White text
  },
  {
    "featureType": "all",
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#000000" }] // Black text outline
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#1a1a1a" }] // Dark gray roads
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#333333" }, { "weight": 1 }] // Gray road outlines
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#2a2a2a" }] // Slightly lighter highways
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#FF4444" }, { "weight": 2 }] // Red highway outlines
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#666666" }, { "weight": 1 }] // Gray arterial outlines
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#0d1b2e" }] // Dark blue water
  },
  {
    "featureType": "landscape",
    "elementType": "geometry",
    "stylers": [{ "color": "#0a0a0a" }] // Very dark landscape
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [{ "color": "#1a1a1a" }] // Dark POIs
  },
  {
    "featureType": "poi",
    "elementType": "labels",
    "stylers": [{ "visibility": "off" }] // Hide POI labels for cleaner look
  },
  {
    "featureType": "transit",
    "elementType": "all",
    "stylers": [{ "visibility": "off" }] // Hide transit for racing focus
  }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textPrimary,
    fontSize: 16,
    marginTop: 16,
  },
  
  // Map Styles
  map: {
    flex: 1,
  },
  
  // User Marker Styles
  userMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  userMarkerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.background,
  },
  userMarkerPulse: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary + '40',
    top: -3,
    left: -3,
  },

  // Player Marker Styles
  playerMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    position: 'relative',
  },
  playerMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  playerMarkerDirection: {
    position: 'absolute',
    width: 3,
    height: 8,
    top: -6,
    borderRadius: 1,
  },
  friendIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Event Marker Styles
  eventMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
    position: 'relative',
  },
  eventMarkerIcon: {
    fontSize: 16,
  },
  eventMarkerPulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '30',
    top: -4,
    left: -4,
  },
  
  // Speed Display
  speedContainer: {
    position: 'absolute',
    top: 120,
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.lg,
  },
  speedGradient: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  speedMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  speedValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
  },
  speedUnit: {
    fontSize: 18,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  speedLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Activity Counter
  activityContainer: {
    position: 'absolute',
    top: 240,
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.md,
  },
  activityGradient: {
    padding: spacing.md,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  activityItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  activityCount: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  activityLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  
  // Action Buttons
  actionsContainer: {
    position: 'absolute',
    bottom: 40,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  mapModeButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.sm,
  },
  filtersButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.sm,
  },
  refreshButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.sm,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    gap: spacing.xs,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
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
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSecondary,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },

  // Event Modal Styles
  eventHeaderContainer: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderRadius: 16,
    marginBottom: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  eventHeaderIcon: {
    fontSize: 32,
  },
  eventHeaderInfo: {
    flex: 1,
  },
  eventHeaderTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  eventHeaderType: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  eventStatsContainer: {
    marginBottom: spacing.xl,
  },
  eventStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  eventStatLabel: {
    ...typography.bodySecondary,
    color: colors.textSecondary,
    flex: 1,
  },
  eventStatValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  joinButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.lg,
  },
  joinButtonDisabled: {
    opacity: 0.6,
  },
  joinButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  joinButtonText: {
    ...typography.h3,
    color: colors.background,
    fontWeight: 'bold',
  },

  // Player Modal Styles
  playerProfileContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  playerAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSecondary,
    marginBottom: spacing.md,
    position: 'relative',
  },
  playerAvatarText: {
    ...typography.h1,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  playerStatusIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.background,
  },
  playerProfileName: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  playerProfileStatus: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  friendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    gap: spacing.xs,
  },
  friendBadgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: 'bold',
  },
  playerStatsContainer: {
    marginBottom: spacing.xl,
  },
  playerStatsTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  playerStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  playerStatLabel: {
    ...typography.bodySecondary,
    color: colors.textSecondary,
    flex: 1,
  },
  playerStatValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  playerActionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.md,
  },
  playerActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  playerActionText: {
    ...typography.body,
    color: colors.background,
    fontWeight: 'bold',
  },
  
  // Create Race Modal Styles
  modalBody: {
    flex: 1,
    padding: spacing.lg,
  },
  modalSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  raceFormContainer: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  raceTypeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.md,
  },
  raceTypeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  raceTypeText: {
    ...typography.h3,
    color: '#fff',
    fontWeight: 'bold',
    flex: 1,
  },
  raceTypeSubtext: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  locationInfo: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginTop: spacing.lg,
  },

  // New styles for destination and police markers
  destinationMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  policeMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ff4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.background,
  },

  // Compact UI styles
  compactSpeedContainer: {
    position: 'absolute',
    top: 80,
    right: spacing.lg,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.sm,
  },
  compactSpeedGradient: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  compactSpeedValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  compactSpeedUnit: {
    fontSize: 12,
    color: colors.textPrimary,
  },

  compactActivityContainer: {
    position: 'absolute',
    top: 120,
    right: spacing.lg,
    borderRadius: 8,
    overflow: 'hidden',
    ...shadows.sm,
  },
  compactActivityGradient: {
    padding: spacing.xs,
    gap: spacing.xs,
  },
  compactActivityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactActivityCount: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.textPrimary,
    minWidth: 12,
    textAlign: 'center',
  },

  // Destination modal styles
  destinationInstructions: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  destinationInputContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  destinationInput: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  searchButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
  },

  currentDestinationContainer: {
    marginBottom: spacing.lg,
  },
  currentDestinationTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  currentDestinationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  currentDestinationText: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },

  destinationTipsContainer: {
    backgroundColor: colors.surfaceSecondary + '50',
    padding: spacing.md,
    borderRadius: 12,
    marginTop: spacing.lg,
  },
  destinationTipsTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  destinationTip: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
});
