import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity, 
  RefreshControl,
  Alert,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { colors, spacing, typography, shadows } from '../utils/theme';
import { DashIcon } from '../components/DashIcon';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { meetupService, Meetup } from '../services/MeetupService';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../hooks/useLocation';

const MEETUP_TYPES = [
  { id: 'drag', label: 'Drag Race', icon: 'speedometer' },
  { id: 'circuit', label: 'Circuit', icon: 'car-sport' },
  { id: 'time-attack', label: 'Time Attack', icon: 'timer' },
  { id: 'meetup', label: 'Meetup', icon: 'people' },
];

export function MeetupsScreen({ navigation }: any) {
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { location } = useLocation();

  useEffect(() => {
    if (user && user.token) {
      // Initialize service with real auth token
      meetupService.setAuthToken(user.token);
      loadMeetups();
    }
  }, [location, user]);

  const loadMeetups = async () => {
    if (!user || !user.token) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const filters: any = {};
      
      if (location) {
        filters.location = {
          latitude: location.latitude,
          longitude: location.longitude,
          radiusKm: 50
        };
      }
      
      const data = await meetupService.getMeetups(filters);
      setMeetups(data);
    } catch (error) {
      console.error('Error loading meetups:', error);
      Alert.alert('Error', 'Failed to load meetups. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMeetups();
    setRefreshing(false);
  };

  const filteredMeetups = meetups.filter(meetup => {
    if (selectedType === 'all') return true;
    return meetup.raceType === selectedType || (selectedType === 'general' && meetup.raceType === 'meetup');
  });

  const handleJoinMeetup = (meetupId: string) => {
    if (!user) {
      Alert.alert('Error', 'Please log in to join meetups.');
      return;
    }
    
    Alert.alert(
      'Join Meetup',
      'Would you like to join this meetup?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Join', 
          onPress: async () => {
            try {
              const result = await meetupService.joinMeetup({ meetupId });
              Alert.alert('Success', result.message || 'You\'ve joined the meetup!');
              await loadMeetups(); // Refresh the list
            } catch (error) {
              console.error('Failed to join meetup:', error);
              const errorMessage = error instanceof Error ? error.message : 'Failed to join meetup. Please try again.';
              Alert.alert('Error', errorMessage);
            }
          }
        },
      ]
    );
  };

  const handleCreateMeetup = () => {
    Alert.alert(
      'Create Meetup',
      'Meetup creation feature coming soon! All meetups require admin approval before being publicly visible.',
      [{ text: 'OK' }]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTypeIcon = (raceType: 'drag' | 'circuit' | 'time-attack' | 'meetup') => {
    const typeMap: Record<string, string> = {
      'drag': 'speedometer',
      'circuit': 'car-sport',
      'time-attack': 'timer',
      'meetup': 'people'
    };
    return typeMap[raceType] || 'people';
  };

  const getTypeLabel = (raceType: 'drag' | 'circuit' | 'time-attack' | 'meetup') => {
    const labelMap: Record<string, string> = {
      'drag': 'Drag Race',
      'circuit': 'Circuit',
      'time-attack': 'Time Attack',
      'meetup': 'Meetup'
    };
    return labelMap[raceType] || 'Meetup';
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <ScreenHeader title="Meetups" onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading meetups...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <ScreenHeader title="Meetups" onBackPress={() => navigation.goBack()} />
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionTitle}>Car Enthusiast Meetups</Text>
          <Text style={styles.descriptionText}>
            Connect with fellow car enthusiasts in your area. All meetups are approved by admins to ensure quality and safety.
          </Text>
        </View>

        {/* Create Meetup Button */}
        <TouchableOpacity style={styles.createButton} onPress={handleCreateMeetup}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.createGradient}
          >
            <Ionicons name="add-circle" size={24} color={colors.surface} />
            <Text style={styles.createButtonText}>Create New Meetup</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterTab, selectedType === 'all' && styles.filterTabActive]}
            onPress={() => setSelectedType('all')}
          >
            <Text style={[styles.filterText, selectedType === 'all' && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {MEETUP_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[styles.filterTab, selectedType === type.id && styles.filterTabActive]}
              onPress={() => setSelectedType(type.id)}
            >
              <Ionicons 
                name={type.icon as any} 
                size={16} 
                color={selectedType === type.id ? colors.surface : colors.textSecondary} 
              />
              <Text style={[styles.filterText, selectedType === type.id && styles.filterTextActive]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Meetups List */}
        <View style={styles.meetupsContainer}>
          {!user ? (
            <View style={styles.emptyState}>
              <Ionicons name="log-in-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>Please Log In</Text>
              <Text style={styles.emptyText}>
                Log in to view and join racing meetups in your area.
              </Text>
            </View>
          ) : filteredMeetups.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No Meetups Found</Text>
              <Text style={styles.emptyText}>
                {selectedType === 'all' 
                  ? 'No meetups available right now.'
                  : `No ${selectedType} meetups available.`
                }
              </Text>
            </View>
          ) : (
            filteredMeetups.map((meetup) => (
              <View key={meetup.id} style={styles.meetupCard}>
                <LinearGradient
                  colors={[colors.surfaceSecondary, colors.surfaceElevated]}
                  style={styles.meetupGradient}
                >
                  <View style={styles.meetupHeader}>
                    <View style={styles.meetupType}>
                      <Ionicons 
                        name={getTypeIcon(meetup.raceType) as any} 
                        size={20} 
                        color={colors.primary} 
                      />
                      <Text style={styles.meetupTypeText}>{getTypeLabel(meetup.raceType)}</Text>
                    </View>
                    <View style={styles.privacyBadge}>
                      <Ionicons 
                        name="globe" 
                        size={12} 
                        color={colors.racingYellow} 
                      />
                      <Text style={[styles.privacyText, { color: colors.racingYellow }]}>
                        Public
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.meetupTitle}>{meetup.title}</Text>
                  <Text style={styles.meetupDescription}>{meetup.description}</Text>

                  <View style={styles.meetupDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="calendar" size={16} color={colors.textSecondary} />
                      <Text style={styles.detailText}>{formatDate(meetup.date)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="location" size={16} color={colors.textSecondary} />
                      <Text style={styles.detailText}>{meetup.location.address}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="person" size={16} color={colors.textSecondary} />
                      <Text style={styles.detailText}>By {meetup.organizer}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="people" size={16} color={colors.textSecondary} />
                      <Text style={styles.detailText}>
                        {meetup.participants}/{meetup.maxParticipants} attending
                      </Text>
                    </View>
                    {meetup.entryFee && (
                      <View style={styles.detailRow}>
                        <Ionicons name="card" size={16} color={colors.textSecondary} />
                        <Text style={styles.detailText}>
                          Entry Fee: ${meetup.entryFee}
                        </Text>
                      </View>
                    )}
                  </View>

                  {meetup.requirements && meetup.requirements.length > 0 && (
                    <View style={styles.meetupTags}>
                      {meetup.requirements.map((requirement, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{requirement}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity 
                    style={styles.joinButton}
                    onPress={() => handleJoinMeetup(meetup.id)}
                  >
                    <Text style={styles.joinButtonText}>Join Meetup</Text>
                    <Ionicons name="arrow-forward" size={16} color={colors.surface} />
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  descriptionCard: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
  },
  descriptionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  descriptionText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  createButton: {
    margin: spacing.lg,
    marginTop: 0,
  },
  createGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: 12,
    gap: spacing.sm,
  },
  createButtonText: {
    ...typography.h3,
    color: colors.surface,
  },
  filterContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 20,
    gap: spacing.xs,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.surface,
    fontWeight: '600',
  },
  meetupsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  meetupCard: {
    marginBottom: spacing.lg,
  },
  meetupGradient: {
    padding: spacing.lg,
    borderRadius: 12,
  },
  meetupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  meetupType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  meetupTypeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface + '20',
    borderRadius: 12,
  },
  privacyText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
  },
  meetupTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  meetupDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  meetupDetails: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  meetupTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary + '20',
    borderRadius: 12,
  },
  tagText: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 10,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    gap: spacing.sm,
  },
  joinButtonText: {
    ...typography.button,
    color: colors.surface,
  },
});