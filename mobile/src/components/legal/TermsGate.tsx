import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing } from '../../utils/theme';

interface TermsAgreement {
  version: string;
  timestamp: number;
  nextReminderDue: number;
}

interface TermsGateProps {
  userId: string;
  isUpgradingToPro?: boolean;
  onAgreed: () => void;
  saveAgreement?: (payload: TermsAgreement) => Promise<void>;
}

const TERMS_VERSION = '1.0.0'; // Increment when you update the legal text
const REMINDER_INTERVAL_DAYS = 90; // 3 months
const STORAGE_KEY = 'dash_terms_agreement';

export function TermsGate({ userId, isUpgradingToPro = false, onAgreed, saveAgreement }: TermsGateProps) {
  const [visible, setVisible] = useState(false);
  const [agreeChecked, setAgreeChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkTermsStatus();
  }, [userId, isUpgradingToPro]);

  const checkTermsStatus = async () => {
    try {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEY}_${userId}`);
      const now = Date.now();

      if (!stored) {
        // First time user - show terms
        setVisible(true);
        return;
      }

      const agreement: TermsAgreement = JSON.parse(stored);

      // Check if we need to show terms
      const shouldShow = 
        agreement.version !== TERMS_VERSION || // Version changed
        now >= agreement.nextReminderDue || // Reminder due
        isUpgradingToPro; // Pro upgrade

      if (shouldShow) {
        setVisible(true);
      }
    } catch (error) {
      console.error('Error checking terms status:', error);
      // Show terms on error to be safe
      setVisible(true);
    }
  };

  const handleAgree = async () => {
    if (!agreeChecked) return;

    setIsLoading(true);
    try {
      const now = Date.now();
      const nextReminder = now + (REMINDER_INTERVAL_DAYS * 24 * 60 * 60 * 1000);

      const agreement: TermsAgreement = {
        version: TERMS_VERSION,
        timestamp: now,
        nextReminderDue: nextReminder,
      };

      // Save locally
      await AsyncStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(agreement));

      // Optionally save to backend
      if (saveAgreement) {
        await saveAgreement(agreement);
      }

      setVisible(false);
      onAgreed();
    } catch (error) {
      console.error('Error saving agreement:', error);
      Alert.alert('Error', 'Failed to save agreement. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = () => {
    Alert.alert(
      'Terms Required',
      'You must accept the Terms of Use to continue using Dash.',
      [
        { text: 'Review Again', style: 'default' },
        { 
          text: 'Exit App', 
          style: 'destructive',
          onPress: () => {
            // In a real app, you might want to close the app or redirect
            console.log('User declined terms');
          }
        },
      ]
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Dash Terms of Use</Text>
          <Text style={styles.subtitle}>
            {isUpgradingToPro ? 'Pro Upgrade Terms' : 'Please review and accept our terms'}
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
          <Text style={styles.sectionTitle}>1. Authorized Use Only</Text>
          <Text style={styles.sectionText}>
            Dash is intended solely for use in legal, authorized racing environments, including but not limited to:{'\n\n'}
            • Sanctioned racetracks{'\n'}
            • Drag strips{'\n'}
            • Approved closed-course racing events{'\n\n'}
            Dash is not designed, intended, or authorized for use during illegal street racing or reckless driving on public roads.
          </Text>

          <Text style={styles.sectionTitle}>2. User Responsibility</Text>
          <Text style={styles.sectionText}>
            You are fully responsible for:{'\n\n'}
            • Ensuring your activities comply with all applicable local, state, and federal laws{'\n'}
            • Operating your vehicle in a safe and responsible manner{'\n'}
            • Using Dash only in authorized racing venues{'\n\n'}
            Any use of Dash outside of legal environments is at your own discretion and risk.
          </Text>

          <Text style={styles.sectionTitle}>3. No Encouragement of Illegal Activity</Text>
          <Text style={styles.sectionText}>
            Dash does not condone, encourage, or promote illegal street racing, reckless driving, or any unsafe behavior. The app exists to:{'\n\n'}
            • Build community among motorsport enthusiasts{'\n'}
            • Support safe, legal racing{'\n'}
            • Help drivers track performance and progress responsibly
          </Text>

          <Text style={styles.sectionTitle}>4. Assumption of Risk</Text>
          <Text style={styles.sectionText}>
            Motorsport involves inherent risks, including accidents, injuries, damage to vehicles, and death. By using Dash, you acknowledge these risks and agree that you participate in motorsport activities at your own risk.
          </Text>

          <Text style={styles.sectionTitle}>5. Limitation of Liability</Text>
          <Text style={styles.sectionText}>
            Dash, its developers, owners, and affiliates are not liable for:{'\n\n'}
            • Any accidents, injuries, damages, or fatalities resulting from motorsport activities{'\n'}
            • Any legal consequences or penalties arising from illegal or unauthorized racing{'\n'}
            • Any misuse of the app outside of its intended purpose{'\n\n'}
            To the maximum extent permitted by law, you waive any claim against Dash arising from your use of the app.
          </Text>

          <Text style={styles.sectionTitle}>6. Data & Community Guidelines</Text>
          <Text style={styles.sectionText}>
            By using Dash, you agree to:{'\n\n'}
            • Use respectful conduct within the community features{'\n'}
            • Avoid sharing illegal content, race location info for unsanctioned events, or promoting unsafe driving{'\n'}
            • Provide accurate data when tracking performance{'\n\n'}
            Violation of these rules may result in suspension or termination of your account.
          </Text>

          <Text style={styles.sectionTitle}>7. Updates and Changes</Text>
          <Text style={styles.sectionText}>
            Dash reserves the right to update these Terms of Use at any time. Continued use of the app after changes means you accept the updated terms.
          </Text>

          <Text style={styles.effectiveDate}>
            Effective Date: August 24, 2025{'\n'}
            Version: {TERMS_VERSION}
          </Text>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setAgreeChecked(!agreeChecked)}
          >
            <View style={[styles.checkbox, agreeChecked && styles.checkboxChecked]}>
              {agreeChecked && <Ionicons name="checkmark" size={16} color={colors.surface} />}
            </View>
            <Text style={styles.checkboxLabel}>
              I understand and agree to the Dash Terms of Use.
            </Text>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.declineButton}
              onPress={handleDecline}
            >
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.agreeButton, !agreeChecked && styles.agreeButtonDisabled]}
              disabled={!agreeChecked || isLoading}
              onPress={handleAgree}
            >
              {isLoading ? (
                <Text style={styles.agreeButtonText}>Saving...</Text>
              ) : (
                <Text style={styles.agreeButtonText}>Agree & Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSecondary,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  effectiveDate: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.xl,
    fontStyle: 'italic',
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSecondary,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    borderRadius: 4,
    marginRight: spacing.sm,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  declineButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.textSecondary,
    borderRadius: 8,
    alignItems: 'center',
  },
  declineButtonText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  agreeButton: {
    flex: 2,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  agreeButtonDisabled: {
    backgroundColor: colors.textTertiary,
  },
  agreeButtonText: {
    ...typography.button,
    color: colors.surface,
  },
});