import { Platform, Alert } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Note: For full push notification support, you would install:
// npm install @react-native-async-storage/async-storage react-native-push-notification
// import PushNotification from 'react-native-push-notification';

// For now, we'll provide a mock implementation to maintain app structure

export interface RaceNotification {
  type: 'race_invite' | 'race_start' | 'race_finish' | 'friend_request' | 'event_invite';
  title: string;
  body: string;
  data: {
    raceId?: string;
    eventId?: string;
    friendId?: string;
    action?: string;
  };
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private expoPushToken: string | null = null;

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  /**
   * Initialize push notifications and register for push tokens
   */
  async initialize(): Promise<string | null> {
    try {
      // Check if we're on a physical device
      if (!Device.isDevice) {
        console.log('Push notifications only work on physical devices');
        return null;
      }

      // Get existing notification permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      // Get the push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      this.expoPushToken = token.data;
      
      // Store token locally
      await AsyncStorage.setItem('expo_push_token', token.data);

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('racing', {
          name: 'Racing Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });
      }

      console.log('Push notification token:', token.data);
      return token.data;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return null;
    }
  }

  /**
   * Get the current push token
   */
  async getPushToken(): Promise<string | null> {
    if (this.expoPushToken) {
      return this.expoPushToken;
    }

    // Try to get from AsyncStorage
    const storedToken = await AsyncStorage.getItem('expo_push_token');
    if (storedToken) {
      this.expoPushToken = storedToken;
      return storedToken;
    }

    // Initialize if not found
    return await this.initialize();
  }

  /**
   * Send push token to backend for storage
   */
  async registerTokenWithBackend(token: string): Promise<void> {
    try {
      // Import ApiService here to avoid circular dependencies
      const { ApiService } = await import('./ApiService');
      
      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/push-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth header if user is logged in
        },
        body: JSON.stringify({ 
          pushToken: token,
          platform: Platform.OS,
          deviceId: Constants.deviceId,
        }),
      });
    } catch (error) {
      console.error('Failed to register push token with backend:', error);
    }
  }

  /**
   * Schedule a local notification (for testing)
   */
  async scheduleLocalNotification(notification: RaceNotification): Promise<string> {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        categoryIdentifier: notification.type,
      },
      trigger: {
        seconds: 1,
        channelId: 'racing',
      },
    });

    return notificationId;
  }

  /**
   * Handle notification responses (when user taps notification)
   */
  addNotificationResponseListener(callback: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  /**
   * Handle notifications received while app is foregrounded
   */
  addNotificationReceivedListener(callback: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
  }

  /**
   * Set notification badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Get notification categories for iOS
   */
  static getNotificationCategories() {
    return [
      {
        identifier: 'race_invite',
        actions: [
          {
            identifier: 'accept_race',
            buttonTitle: 'Accept Race',
            options: {
              isDestructive: false,
              isAuthenticationRequired: false,
            },
          },
          {
            identifier: 'decline_race',
            buttonTitle: 'Decline',
            options: {
              isDestructive: true,
              isAuthenticationRequired: false,
            },
          },
        ],
      },
      {
        identifier: 'friend_request',
        actions: [
          {
            identifier: 'accept_friend',
            buttonTitle: 'Accept',
            options: {
              isDestructive: false,
              isAuthenticationRequired: false,
            },
          },
          {
            identifier: 'decline_friend',
            buttonTitle: 'Decline',
            options: {
              isDestructive: true,
              isAuthenticationRequired: false,
            },
          },
        ],
      },
    ];
  }
}

// Notification templates for common racing scenarios
export const NotificationTemplates = {
  raceInvite: (friendName: string, raceType: string): RaceNotification => ({
    type: 'race_invite',
    title: ` Race Challenge!`,
    body: `${friendName} challenged you to a ${raceType} race!`,
    data: { action: 'open_race_invite' },
  }),

  raceStarting: (raceType: string, startTime: string): RaceNotification => ({
    type: 'race_start',
    title: `🚦 Race Starting Soon!`,
    body: `Your ${raceType} race starts in 5 minutes at ${startTime}`,
    data: { action: 'join_race' },
  }),

  raceResults: (position: number, totalRacers: number): RaceNotification => ({
    type: 'race_finish',
    title: ` Race Complete!`,
    body: `You finished ${position}${getOrdinalSuffix(position)} out of ${totalRacers} racers!`,
    data: { action: 'view_results' },
  }),

  friendRequest: (senderName: string): RaceNotification => ({
    type: 'friend_request',
    title: `👥 New Friend Request`,
    body: `${senderName} wants to be your racing buddy!`,
    data: { action: 'view_friend_requests' },
  }),

  eventInvite: (eventName: string, eventType: string): RaceNotification => ({
    type: 'event_invite',
    title: ` Event Invitation`,
    body: `You're invited to ${eventName} - ${eventType}`,
    data: { action: 'view_event' },
  }),
};

// Helper function for ordinal numbers
function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

export default PushNotificationService;
