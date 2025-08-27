import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
  Switch,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RacerIDAndFriendsService, { 
  RacerProfile, 
  FriendRequest, 
  Friendship 
} from '../services/RacerIDAndFriendsService';

interface FriendsScreenProps {
  navigation: any;
  currentUserProfile: RacerProfile;
}

const FriendsScreen: React.FC<FriendsScreenProps> = ({ 
  navigation, 
  currentUserProfile 
}) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<RacerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Privacy settings
  const [showLocation, setShowLocation] = useState(currentUserProfile.preferences.showLocation);
  const [allowDirectInvites, setAllowDirectInvites] = useState(currentUserProfile.preferences.allowDirectInvites);

  useEffect(() => {
    loadFriendsData();
  }, []);

  const loadFriendsData = async () => {
    setIsLoading(true);
    try {
      const [friendsData, requestsData] = await Promise.all([
        RacerIDAndFriendsService.getFriends(),
        RacerIDAndFriendsService.getPendingFriendRequests(),
      ]);
      
      setFriends(friendsData);
      setFriendRequests(requestsData);
    } catch (error) {
      console.error('Failed to load friends data:', error);
    }
    setIsLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFriendsData();
    setRefreshing(false);
  };

  const handleSearchRacer = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a Racer ID');
      return;
    }

    setIsLoading(true);
    const result = await RacerIDAndFriendsService.findRacerByID(searchQuery.trim());
    setSearchResult(result);
    
    if (!result) {
      Alert.alert('Not Found', `No racer found with ID: ${searchQuery.toUpperCase()}`);
    }
    setIsLoading(false);
  };

  const handleSendFriendRequest = async (racerId: string) => {
    const success = await RacerIDAndFriendsService.sendFriendRequest(racerId);
    
    if (success) {
      Alert.alert('Success', 'Friend request sent!');
      setSearchResult(null);
      setSearchQuery('');
    } else {
      Alert.alert('Error', 'Failed to send friend request. They may have already received one or blocked you.');
    }
  };

  const handleRespondToRequest = async (requestId: string, action: 'accept' | 'decline') => {
    const success = await RacerIDAndFriendsService.respondToFriendRequest(requestId, action);
    
    if (success) {
      Alert.alert('Success', action === 'accept' ? 'Friend request accepted!' : 'Friend request declined.');
      await loadFriendsData(); // Refresh data
    } else {
      Alert.alert('Error', 'Failed to respond to friend request.');
    }
  };

  const handleRemoveFriend = (friendship: Friendship) => {
    const friendProfile = friendship.racer1Id === currentUserProfile.racerId 
      ? friendship.racer2Profile 
      : friendship.racer1Profile;

    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${friendProfile.displayName} from your friends list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const success = await RacerIDAndFriendsService.removeFriend(friendProfile.racerId);
            if (success) {
              await loadFriendsData();
            } else {
              Alert.alert('Error', 'Failed to remove friend.');
            }
          },
        },
      ]
    );
  };

  const handleInviteToRace = (racerId: string) => {
    // Navigate to race creation with pre-selected friend
    navigation.navigate('CreateRace', { invitedFriend: racerId });
  };

  const renderFriend = ({ item }: { item: Friendship }) => {
    const friendProfile = item.racer1Id === currentUserProfile.racerId 
      ? item.racer2Profile 
      : item.racer1Profile;

    return (
      <View style={styles.friendItem}>
        <View style={styles.friendInfo}>
          <View style={styles.friendHeader}>
            <Text style={styles.friendName}>{friendProfile.displayName}</Text>
            <Text style={styles.racerId}>#{friendProfile.racerId}</Text>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: friendProfile.preferences.isOnline ? '#00FF88' : '#666' }
            ]} />
          </View>
          
          <Text style={styles.friendStats}>
             {friendProfile.stats.totalRaces} races • {friendProfile.stats.winRate.toFixed(1)}% win rate
          </Text>
          
          <View style={styles.raceHistory}>
            <Text style={styles.raceHistoryText}>
              Together: {item.racesTogetherCount} races • 
              You: {item.winLossRecord.racer1Wins} - {item.winLossRecord.racer2Wins} :Them
            </Text>
          </View>
        </View>

        <View style={styles.friendActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.inviteButton]}
            onPress={() => handleInviteToRace(friendProfile.racerId)}
          >
            <Ionicons name="car-sport" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Race</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.removeButton]}
            onPress={() => handleRemoveFriend(item)}
          >
            <Ionicons name="person-remove" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFriendRequest = ({ item }: { item: FriendRequest }) => (
    <View style={styles.requestItem}>
      <View style={styles.requestInfo}>
        <Text style={styles.friendName}>{item.fromProfile.displayName}</Text>
        <Text style={styles.racerId}>#{item.fromProfile.racerId}</Text>
        {item.message && (
          <Text style={styles.requestMessage}>"{item.message}"</Text>
        )}
        <Text style={styles.requestStats}>
           {item.fromProfile.stats.totalRaces} races • 
          {item.fromProfile.stats.winRate.toFixed(1)}% win rate • 
          STAR {item.fromProfile.stats.skillRating}/10
        </Text>
      </View>

      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleRespondToRequest(item.id, 'accept')}
        >
          <Ionicons name="checkmark" size={18} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.declineButton]}
          onPress={() => handleRespondToRequest(item.id, 'decline')}
        >
          <Ionicons name="close" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearchResult = () => {
    if (!searchResult) return null;

    return (
      <View style={styles.searchResultItem}>
        <View style={styles.searchResultInfo}>
          <Text style={styles.friendName}>{searchResult.displayName}</Text>
          <Text style={styles.racerId}>#{searchResult.racerId}</Text>
          <Text style={styles.searchResultStats}>
             {searchResult.stats.totalRaces} races • 
            {searchResult.stats.winRate.toFixed(1)}% win rate • 
            STAR {searchResult.stats.skillRating}/10
          </Text>
          {searchResult.location && (
            <Text style={styles.locationText}>
              📍 {searchResult.location.city}, {searchResult.location.state}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.actionButton, styles.addButton]}
          onPress={() => handleSendFriendRequest(searchResult.racerId)}
        >
          <Ionicons name="person-add" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Add Friend</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'friends':
        return (
          <FlatList
            data={friends}
            renderItem={renderFriend}
            keyExtractor={(item) => item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="people" size={64} color="#666" />
                <Text style={styles.emptyText}>No friends yet</Text>
                <Text style={styles.emptySubtext}>
                  Search for racers by their Racer ID to add friends
                </Text>
              </View>
            }
          />
        );

      case 'requests':
        return (
          <FlatList
            data={friendRequests}
            renderItem={renderFriendRequest}
            keyExtractor={(item) => item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="mail" size={64} color="#666" />
                <Text style={styles.emptyText}>No pending requests</Text>
              </View>
            }
          />
        );

      case 'search':
        return (
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Enter Racer ID (e.g., GH42K7X)"
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="characters"
                maxLength={8}
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearchRacer}
                disabled={isLoading}
              >
                <Ionicons 
                  name={isLoading ? "hourglass" : "search"} 
                  size={20} 
                  color="#fff" 
                />
              </TouchableOpacity>
            </View>

            {renderSearchResult()}

            <View style={styles.privacySettings}>
              <Text style={styles.privacyTitle}>Privacy Settings</Text>
              
              <View style={styles.privacySetting}>
                <Text style={styles.privacyLabel}>Show my location to friends</Text>
                <Switch
                  value={showLocation}
                  onValueChange={setShowLocation}
                  trackColor={{ false: '#666', true: '#00FF88' }}
                />
              </View>

              <View style={styles.privacySetting}>
                <Text style={styles.privacyLabel}>Allow direct race invites</Text>
                <Switch
                  value={allowDirectInvites}
                  onValueChange={setAllowDirectInvites}
                  trackColor={{ false: '#666', true: '#00FF88' }}
                />
              </View>
            </View>

            <View style={styles.myRacerIdContainer}>
              <Text style={styles.myRacerIdLabel}>Your Racer ID</Text>
              <Text style={styles.myRacerId}>#{currentUserProfile.racerId}</Text>
              <Text style={styles.myRacerIdSubtext}>
                Share this ID with other racers so they can add you as a friend
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Friends</Text>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
            onPress={() => setActiveTab('friends')}
          >
            <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
              Friends ({friends.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
            onPress={() => setActiveTab('requests')}
          >
            <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
              Requests ({friendRequests.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'search' && styles.activeTab]}
            onPress={() => setActiveTab('search')}
          >
            <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
              Add Friends
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {renderTabContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#00FF88',
  },
  tabText: {
    color: '#999',
    fontSize: 12,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '600',
  },
  friendItem: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    margin: 8,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  friendInfo: {
    flex: 1,
  },
  friendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
  racerId: {
    fontSize: 12,
    color: '#00FF88',
    marginRight: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  friendStats: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  raceHistory: {
    marginTop: 4,
  },
  raceHistoryText: {
    fontSize: 11,
    color: '#666',
  },
  friendActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  inviteButton: {
    backgroundColor: '#4CAF50',
  },
  removeButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 8,
  },
  requestItem: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    margin: 8,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  requestInfo: {
    flex: 1,
  },
  requestMessage: {
    fontSize: 14,
    color: '#fff',
    fontStyle: 'italic',
    marginVertical: 4,
  },
  requestStats: {
    fontSize: 12,
    color: '#999',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
  },
  declineButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 12,
  },
  searchContainer: {
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#00FF88',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResultItem: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultStats: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  locationText: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#2196F3',
  },
  privacySettings: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  privacySetting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  privacyLabel: {
    fontSize: 14,
    color: '#fff',
  },
  myRacerIdContainer: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  myRacerIdLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  myRacerId: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00FF88',
    marginBottom: 8,
  },
  myRacerIdSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default FriendsScreen;
