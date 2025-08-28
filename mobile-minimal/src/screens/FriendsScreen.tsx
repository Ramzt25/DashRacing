import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '../utils/theme';
import { globalStyles } from '../styles/globalStyles';

export default function FriendsScreen() {
  return (
    <View style={[globalStyles.garageContainer]}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={[globalStyles.garageCard, styles.headerCard]}>
          <Icon name="people" size={48} color={colors.primary} style={styles.headerIcon} />
          <Text style={[globalStyles.garageTitle, styles.title]}>Friends</Text>
          <Text style={[globalStyles.garageSecondaryText, styles.subtitle]}>
            Connect with fellow racers
          </Text>
        </View>

        {/* Search */}
        <View style={[globalStyles.garageCard, styles.searchCard]}>
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color={colors.textTertiary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for friends..."
              placeholderTextColor={colors.textTertiary}
            />
          </View>
          
          <TouchableOpacity style={[globalStyles.garageButtonSecondary, styles.addButton]}>
            <Icon name="person-add" size={20} color={colors.primary} />
            <Text style={[globalStyles.garageButtonText, styles.addButtonText]}>Add Friends</Text>
          </TouchableOpacity>
        </View>

        {/* Friend Requests */}
        <View style={[globalStyles.garageCard, styles.requestsCard]}>
          <View style={styles.sectionHeader}>
            <Text style={[globalStyles.garageSubtitle, styles.sectionTitle]}>Friend Requests</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>0</Text>
            </View>
          </View>
          
          <Text style={[globalStyles.garageSecondaryText, styles.emptyText]}>
            No pending friend requests
          </Text>
        </View>

        {/* Online Friends */}
        <View style={[globalStyles.garageCard, styles.onlineCard]}>
          <View style={styles.sectionHeader}>
            <Text style={[globalStyles.garageSubtitle, styles.sectionTitle]}>Online Now</Text>
            <View style={[styles.badge, styles.onlineBadge]}>
              <Text style={styles.badgeText}>0</Text>
            </View>
          </View>
          
          <Text style={[globalStyles.garageSecondaryText, styles.emptyText]}>
            No friends are currently online
          </Text>
        </View>

        {/* All Friends */}
        <View style={[globalStyles.garageCard, styles.friendsCard]}>
          <Text style={[globalStyles.garageSubtitle, styles.sectionTitle]}>All Friends</Text>
          
          <View style={styles.friendsList}>
            <View style={styles.friendItem}>
              <View style={styles.friendAvatar}>
                <Icon name="person-circle" size={40} color={colors.textTertiary} />
              </View>
              <View style={styles.friendInfo}>
                <Text style={[globalStyles.garageBodyText, styles.friendName]}>No friends yet</Text>
                <Text style={[globalStyles.garageSecondaryText, styles.friendStatus]}>
                  Start adding friends to race together
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Social Features */}
        <View style={[globalStyles.garageCard, styles.socialCard]}>
          <Text style={[globalStyles.garageSubtitle, styles.sectionTitle]}>Social Features</Text>
          
          <View style={styles.featuresList}>
            <TouchableOpacity style={styles.featureItem}>
              <Icon name="chatbubble" size={24} color={colors.primary} />
              <View style={styles.featureInfo}>
                <Text style={[globalStyles.garageBodyText, styles.featureTitle]}>Group Chat</Text>
                <Text style={[globalStyles.garageSecondaryText, styles.featureDesc]}>
                  Chat with your racing crew
                </Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.featureItem}>
              <Icon name="trophy" size={24} color={colors.primary} />
              <View style={styles.featureInfo}>
                <Text style={[globalStyles.garageBodyText, styles.featureTitle]}>Leaderboards</Text>
                <Text style={[globalStyles.garageSecondaryText, styles.featureDesc]}>
                  Compare times with friends
                </Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.featureItem}>
              <Icon name="share" size={24} color={colors.primary} />
              <View style={styles.featureInfo}>
                <Text style={[globalStyles.garageBodyText, styles.featureTitle]}>Share Garage</Text>
                <Text style={[globalStyles.garageSecondaryText, styles.featureDesc]}>
                  Show off your car collection
                </Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.featureItem}>
              <Icon name="calendar" size={24} color={colors.primary} />
              <View style={styles.featureInfo}>
                <Text style={[globalStyles.garageBodyText, styles.featureTitle]}>Events</Text>
                <Text style={[globalStyles.garageSecondaryText, styles.featureDesc]}>
                  Create and join racing events
                </Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Find Friends */}
        <View style={[globalStyles.garageCard, styles.findCard]}>
          <Text style={[globalStyles.garageSubtitle, styles.sectionTitle]}>Find Friends</Text>
          
          <View style={styles.findOptions}>
            <TouchableOpacity style={styles.findOption}>
              <Icon name="qr-code" size={32} color={colors.primary} />
              <Text style={[globalStyles.garageCaptionText, styles.findLabel]}>QR Code</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.findOption}>
              <Icon name="location" size={32} color={colors.primary} />
              <Text style={[globalStyles.garageCaptionText, styles.findLabel]}>Nearby</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.findOption}>
              <Icon name="phone-portrait" size={32} color={colors.primary} />
              <Text style={[globalStyles.garageCaptionText, styles.findLabel]}>Contacts</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.findOption}>
              <Icon name="share-social" size={32} color={colors.primary} />
              <Text style={[globalStyles.garageCaptionText, styles.findLabel]}>Invite</Text>
            </TouchableOpacity>
          </View>
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
  content: {
    padding: spacing.sm,
  },
  headerCard: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerIcon: {
    marginBottom: spacing.sm,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    textAlign: 'center',
  },
  searchCard: {
    marginBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    paddingVertical: spacing.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    marginLeft: spacing.sm,
    color: colors.primary,
  },
  requestsCard: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: 0,
    textAlign: 'left',
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 24,
    alignItems: 'center',
  },
  onlineBadge: {
    backgroundColor: '#00CC00',
  },
  badgeText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  onlineCard: {
    marginBottom: spacing.md,
  },
  friendsCard: {
    marginBottom: spacing.md,
  },
  friendsList: {
    gap: spacing.sm,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  friendAvatar: {
    marginRight: spacing.md,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    marginBottom: spacing.xs,
    color: colors.textTertiary,
  },
  friendStatus: {
    fontSize: 12,
  },
  socialCard: {
    marginBottom: spacing.md,
  },
  featuresList: {
    gap: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  featureTitle: {
    marginBottom: spacing.xs,
  },
  featureDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  findCard: {
    marginBottom: spacing.md,
  },
  findOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: spacing.md,
  },
  findOption: {
    alignItems: 'center',
    width: '40%',
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  findLabel: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});