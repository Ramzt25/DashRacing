import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@dash/utils';
import { useAuthStore } from '../../stores/authStore';

export function SignInScreen() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  
  const { signIn, signInWithPhone, verifyOTP, isLoading } = useAuthStore();

  const handleSendOTP = async () => {
    try {
      if (mode === 'email') {
        if (!email.trim()) {
          Alert.alert('Error', 'Please enter your email address');
          return;
        }
        await signIn(email.trim().toLowerCase());
      } else {
        if (!phone.trim()) {
          Alert.alert('Error', 'Please enter your phone number');
          return;
        }
        await signInWithPhone(phone.trim());
      }
      setOtpSent(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send verification code');
    }
  };

  const handleVerifyOTP = async () => {
    try {
      if (!otp.trim()) {
        Alert.alert('Error', 'Please enter the verification code');
        return;
      }
      
      await verifyOTP(otp.trim(), mode === 'email' ? 'email' : 'sms');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Invalid verification code');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Dash</Text>
          <Text style={styles.subtitle}>
            Sign in to connect with the automotive community
          </Text>
        </View>

        <View style={styles.form}>
          {!otpSent ? (
            <>
              <View style={styles.modeToggle}>
                <TouchableOpacity
                  style={[styles.modeButton, mode === 'email' && styles.modeButtonActive]}
                  onPress={() => setMode('email')}
                >
                  <Text style={[styles.modeButtonText, mode === 'email' && styles.modeButtonTextActive]}>
                    Email
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeButton, mode === 'phone' && styles.modeButtonActive]}
                  onPress={() => setMode('phone')}
                >
                  <Text style={[styles.modeButtonText, mode === 'phone' && styles.modeButtonTextActive]}>
                    Phone
                  </Text>
                </TouchableOpacity>
              </View>

              {mode === 'email' ? (
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              ) : (
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  placeholderTextColor={theme.colors.textMuted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              )}

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSendOTP}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Sending...' : 'Send Verification Code'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.otpInstructions}>
                We sent a verification code to {mode === 'email' ? email : phone}
              </Text>
              
              <TextInput
                style={styles.input}
                placeholder="Enter verification code"
                placeholderTextColor={theme.colors.textMuted}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
              />

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleVerifyOTP}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  setOtpSent(false);
                  setOtp('');
                }}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <Text style={styles.disclaimer}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
    marginBottom: theme.spacing.xxl,
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
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: 4,
    marginBottom: theme.spacing.lg,
  },
  modeButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderRadius: theme.radius.sm,
  },
  modeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  modeButtonText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '500',
    color: theme.colors.textMuted,
  },
  modeButtonTextActive: {
    color: theme.colors.textPrimary,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  otpInstructions: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  backButtonText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.primary,
  },
  disclaimer: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
});