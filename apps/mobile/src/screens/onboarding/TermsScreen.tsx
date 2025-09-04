import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '@dash/utils';
import { useAuthStore } from '../../stores/authStore';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type TermsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Terms'>;

export function TermsScreen() {
  const navigation = useNavigation<TermsScreenNavigationProp>();
  const { acceptTerms } = useAuthStore();

  const handleAccept = async () => {
    try {
      await acceptTerms(1);
      navigation.navigate('MainTabs');
    } catch (error) {
      console.error('Failed to accept terms:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Terms & Safety</Text>
          <Text style={styles.subtitle}>
            Welcome to Dash! Please review and accept our terms.
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Community Guidelines</Text>
            <Text style={styles.text}>
              • Dash is for community, navigation, and safety{'\n'}
              • Do not use to break laws or evade law enforcement{'\n'}
              • Community pins may be inaccurate - always follow posted signs{'\n'}
              • Report inappropriate content to keep the community safe
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy & Location</Text>
            <Text style={styles.text}>
              • Location sharing is completely opt-in{'\n'}
              • You can stop sharing at any time{'\n'}
              • Home geofencing protects your private locations{'\n'}
              • We never share your exact location without permission
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Safety First</Text>
            <Text style={styles.text}>
              • No racing features or speed tracking{'\n'}
              • Focus on community and responsible automotive culture{'\n'}
              • Report any safety concerns immediately{'\n'}
              • Use hands-free when driving
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
          <Text style={styles.acceptButtonText}>Accept & Continue</Text>
        </TouchableOpacity>
        
        <Text style={styles.disclaimer}>
          By accepting, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.sizes.xxxl,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textMuted,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  text: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textMuted,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  acceptButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  acceptButtonText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  disclaimer: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});