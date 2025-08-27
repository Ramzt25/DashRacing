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
  Image,
  SafeAreaView,
} from 'react-native';
import { SimpleIcon } from '../components/SimpleIcon';
import { useAuth } from '../context/AuthContext';
import { DashIcon } from '../components/DashIcon';

interface LoginScreenProps {
  onNavigateToRegister: () => void;
}

export function LoginScreen({ onNavigateToRegister }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    console.log('[LOGIN] Starting login process...', { email, passwordLength: password.length });
    
    if (!email || !password) {
      console.log('[ERROR] Login validation failed: missing fields');
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      console.log('[ERROR] Login validation failed: invalid email');
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 8) {
      console.log('[ERROR] Login validation failed: password too short');
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    console.log('[SUCCESS] Login validation passed, attempting login...');
    setIsLoading(true);
    try {
      const success = await login(email, password);
      console.log(' Login result:', success ? 'SUCCESS' : 'FAILED');
      if (!success) {
        Alert.alert('Login Failed', 'Invalid email or password. Please check your credentials and try again.');
      } else {
        console.log(' Login successful! User should be redirected to main app.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Connection Error', 'Unable to connect to the server. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <DashIcon 
              name="home" 
              size={60}
              color="#ff0000"
            />
            <Image 
              source={require('../../assets/Mustangside.png')} 
              style={styles.mustangImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.taglineSection}>
            <Text style={styles.tagline}>Where Car People Meet & Compete!</Text>
          </View>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <SimpleIcon name="mail" size={20} color="#888" />
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
            <SimpleIcon name="lock-closed" size={20} color="#888" />
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
              <SimpleIcon 
                name={showPassword ? "eye-off" : "eye"} 
                size={20} 
                color="#888" 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Text style={styles.loginButtonText}>Sign In</Text>
                <SimpleIcon name="arrow-forward" size={20} color="#000" />
              </>
            )}
          </TouchableOpacity>



          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.socialButton}>
            <SimpleIcon name="logo-google" size={20} color="#fff" />
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialButton, styles.appleButton]}>
            <SimpleIcon name="logo-apple" size={20} color="#000" />
            <Text style={[styles.socialButtonText, styles.appleButtonText]}>Continue with Apple</Text>
          </TouchableOpacity>
        </View>

        {/* Register Link */}
        <View style={styles.registerSection}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={onNavigateToRegister}>
            <Text style={styles.registerLink}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingBottom: 40, // Extra bottom padding for safe area
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  dashLogo: {
    width: 180,
    height: 180,
  },
  mustangImage: {
    width: 200,
    height: 60,
    marginTop: 10,
    opacity: 0.8,
  },
  speedLines: {
    position: 'absolute',
    right: -30,
    top: 15,
  },
  speedLine: {
    height: 2,
    backgroundColor: '#FF0000',
    marginVertical: 2,
    borderRadius: 1,
  },
  speedLine1: {
    width: 20,
    opacity: 0.8,
  },
  speedLine2: {
    width: 16,
    opacity: 0.6,
  },
  speedLine3: {
    width: 12,
    opacity: 0.4,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 3,
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 16,
    height: 56,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#FF0000',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#FF0000',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginButtonText: {
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
    backgroundColor: '#fff',
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  appleButtonText: {
    color: '#000',
  },
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#888',
    fontSize: 16,
  },
  registerLink: {
    color: '#FF0000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  taglineSection: {
    alignItems: 'center',
    marginTop: 16,
  },
  tagline: {
    color: '#888',
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },

});
