import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography } from '../utils/theme';
import { globalStyles } from '../styles/globalStyles';
import { Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
}

export function RegisterScreen({ onNavigateToLogin }: RegisterScreenProps) {
  const [email, setEmail] = useState('');
  const [handle, setHandle] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const validateForm = () => {
    if (!email || !handle || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (handle.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters');
      return false;
    }

    // Check for valid handle format (alphanumeric and underscore only)
    if (!/^[a-zA-Z0-9_]+$/.test(handle)) {
      Alert.alert('Error', 'Username can only contain letters, numbers, and underscores');
      return false;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (!acceptTerms) {
      Alert.alert('Error', 'Please accept the Terms and Conditions');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const success = await register(email, password, handle);
      if (!success) {
        Alert.alert('Registration Failed', 'Email or username may already be in use. Please try different credentials.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Connection Error', 'Unable to connect to the server. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[globalStyles.fullWidthContainer, styles.safeArea]}>
      <KeyboardAvoidingView 
        style={[globalStyles.fullWidthContainer, styles.container]} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <ScrollView contentContainerStyle={[globalStyles.garageContainer, styles.scrollContainer]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onNavigateToLogin}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="car-sport" size={50} color="#FF0000" />
            <View style={styles.speedLines}>
              <View style={[styles.speedLine, styles.speedLine1]} />
              <View style={[styles.speedLine, styles.speedLine2]} />
              <View style={[styles.speedLine, styles.speedLine3]} />
            </View>
          </View>
          <Text style={styles.appTitle}>Join DASH</Text>
          <Text style={styles.appSubtitle}>Start your racing journey</Text>
        </View>

        {/* Registration Form */}
        <View style={[globalStyles.garageCard, styles.formContainer]}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="person" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#888"
              value={handle}
              onChangeText={setHandle}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? "eye-off" : "eye"} 
                size={20} 
                color="#888" 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#888"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons 
                name={showConfirmPassword ? "eye-off" : "eye"} 
                size={20} 
                color="#888" 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.termsContainer}
            onPress={() => setAcceptTerms(!acceptTerms)}
          >
            <View style={[styles.checkbox, acceptTerms && styles.checkedBox]}>
              {acceptTerms && <Ionicons name="checkmark" size={16} color={colors.textPrimary} />}
            </View>
            <View style={styles.termsTextContainer}>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink}>Terms and Conditions</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[globalStyles.garageButton, styles.registerButton, isLoading && styles.disabledButton]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Text style={styles.registerButtonText}>Create Account</Text>
                <Ionicons name="arrow-forward" size={20} color={colors.textPrimary} />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-google" size={20} color="#fff" />
            <Text style={styles.socialButtonText}>Sign up with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialButton, styles.appleButton]}>
            <Ionicons name="logo-apple" size={20} color={colors.textPrimary} />
            <Text style={[styles.socialButtonText, styles.appleButtonText]}>Sign up with Apple</Text>
          </TouchableOpacity>
        </View>

        {/* Login Link */}
        <View style={styles.loginSection}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={onNavigateToLogin}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    width: screenWidth,
  },
  container: {
    backgroundColor: colors.background,
    width: screenWidth,
  },
  scrollContainer: {
    padding: spacing.lg,
    paddingBottom: 60,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    marginTop: spacing.md,
    width: '100%',
  },
  backButton: {
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textShadowColor: 'rgba(255, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    width: '100%',
  },
  logoContainer: {
    position: 'relative',
    marginBottom: spacing.md,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  speedLines: {
    position: 'absolute',
    right: -25,
    top: 12,
  },
  speedLine: {
    height: 2,
    backgroundColor: '#FF0000',
    marginVertical: 2,
    borderRadius: 1,
  },
  speedLine1: {
    width: 16,
    opacity: 0.8,
  },
  speedLine2: {
    width: 12,
    opacity: 0.6,
  },
  speedLine3: {
    width: 8,
    opacity: 0.4,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 3,
    marginBottom: spacing.sm,
    textShadowColor: 'rgba(255, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  appSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 1,
  },
  formContainer: {
    width: '100%',
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.md,
    width: '100%',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    height: '100%',
  },
  eyeIcon: {
    padding: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#FF0000',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkedBox: {
    backgroundColor: '#FF0000',
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    color: '#888',
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    color: '#FF0000',
    fontWeight: '600',
  },
  registerButton: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
    width: '100%',
  },
  disabledButton: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    color: '#888',
    marginHorizontal: 16,
    fontSize: 14,
  },
  socialButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  appleButton: {
    backgroundColor: colors.surfaceSecondary,
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  appleButtonText: {
    color: '#000',
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    color: '#888',
    fontSize: 16,
  },
  loginLink: {
    color: '#FF0000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});