import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography } from '../utils/theme';
import { useNavigation } from '@react-navigation/native';
import { TermsGate } from '../components/legal/TermsGate';

interface ProUpgradeScreenProps {
  onClose?: () => void;
}

export function ProUpgradeScreen({ onClose }: ProUpgradeScreenProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isLoading, setIsLoading] = useState(false);
  const [showTermsGate, setShowTermsGate] = useState(false);
  const { upgradeToPro, user } = useAuth();
  const navigation = useNavigation();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigation.goBack();
    }
  };

  const plans = {
    monthly: {
      price: '$9.99',
      period: 'month',
      savings: null,
    },
    yearly: {
      price: '$79.99',
      period: 'year',
      savings: 'Save 33%',
    },
  };

  const proFeatures = [
    {
      icon: 'analytics',
      title: 'Advanced Analytics',
      description: 'Detailed speed analysis, lap times, and performance metrics',
    },
    {
      icon: 'people',
      title: 'Unlimited Racing',
      description: 'Join unlimited races with friends and nearby drivers',
    },
    {
      icon: 'map',
      title: 'Route Planning',
      description: 'Create and save custom racing routes with waypoints',
    },
    {
      icon: 'trophy',
      title: 'Leaderboards',
      description: 'Compete on global and local leaderboards',
    },
    {
      icon: 'car-sport',
      title: 'Car Collection',
      description: 'Unlock premium vehicles and customization options',
    },
    {
      icon: 'cloud',
      title: 'Cloud Sync',
      description: 'Sync your data across all devices',
    },
    {
      icon: 'notifications',
      title: 'Priority Support',
      description: '24/7 premium customer support',
    },
    {
      icon: 'shield-checkmark',
      title: 'Ad-Free Experience',
      description: 'Race without interruptions or advertisements',
    },
  ];

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      // Real API integration for subscription upgrade with selected plan
      const success = await upgradeToPro(selectedPlan);
      if (success) {
        // Show Terms Gate for Pro users
        setShowTermsGate(true);
      } else {
        Alert.alert('Upgrade Failed', 'Please try again or contact support.');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upgrade to Pro</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="car-sport" size={60} color="#FF0000" />
            <View style={styles.crownContainer}>
              <Ionicons name="diamond" size={24} color="#FFD700" />
            </View>
          </View>
          <Text style={styles.heroTitle}>DASH Pro</Text>
          <Text style={styles.heroSubtitle}>Unlock the full racing experience</Text>
        </View>

        {/* Pricing Plans */}
        <View style={styles.pricingSection}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'yearly' && styles.selectedPlan,
            ]}
            onPress={() => setSelectedPlan('yearly')}
          >
            {plans.yearly.savings && (
              <View style={styles.savingsLabel}>
                <Text style={styles.savingsText}>{plans.yearly.savings}</Text>
              </View>
            )}
            <View style={styles.planHeader}>
              <View style={styles.radioButton}>
                {selectedPlan === 'yearly' && <View style={styles.radioSelected} />}
              </View>
              <View style={styles.planInfo}>
                <Text style={styles.planTitle}>Yearly Plan</Text>
                <Text style={styles.planPrice}>
                  {plans.yearly.price}/{plans.yearly.period}
                </Text>
              </View>
            </View>
            <Text style={styles.planDescription}>
              Best value - Save 33% compared to monthly
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'monthly' && styles.selectedPlan,
            ]}
            onPress={() => setSelectedPlan('monthly')}
          >
            <View style={styles.planHeader}>
              <View style={styles.radioButton}>
                {selectedPlan === 'monthly' && <View style={styles.radioSelected} />}
              </View>
              <View style={styles.planInfo}>
                <Text style={styles.planTitle}>Monthly Plan</Text>
                <Text style={styles.planPrice}>
                  {plans.monthly.price}/{plans.monthly.period}
                </Text>
              </View>
            </View>
            <Text style={styles.planDescription}>
              Perfect for trying out Pro features
            </Text>
          </TouchableOpacity>
        </View>

        {/* Features List */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>What's Included</Text>
          {proFeatures.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name={feature.icon as any} size={20} color="#FF0000" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Upgrade Button */}
        <TouchableOpacity
          style={[styles.upgradeButton, isLoading && styles.disabledButton]}
          onPress={handleUpgrade}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <Text style={styles.upgradeButtonText}>
                Start {selectedPlan === 'yearly' ? 'Yearly' : 'Monthly'} Pro
              </Text>
              <Ionicons name="rocket" size={20} color={colors.textPrimary} />
            </>
          )}
        </TouchableOpacity>

        {/* Terms */}
        <Text style={styles.termsText}>
          Auto-renewable subscription. Cancel anytime in your account settings.
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </ScrollView>
      
      <TermsGate 
        userId={user?.id || ''}
        isUpgradingToPro={true}
        onAgreed={() => {
          setShowTermsGate(false);
          Alert.alert(
            'Welcome to Pro!', 
            'You now have access to all premium features. Enjoy your enhanced racing experience!',
            [{ text: 'Get Started', onPress: handleClose }]
          );
        }}
      />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContainer: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    marginTop: 16,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  crownContainer: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 4,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    maxWidth: 250,
    lineHeight: 24,
  },
  pricingSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  planCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#333',
    position: 'relative',
  },
  selectedPlan: {
    borderColor: '#FF0000',
    backgroundColor: '#2a1a1a',
  },
  savingsLabel: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: '#FF0000',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FF0000',
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF0000',
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF0000',
  },
  planDescription: {
    fontSize: 14,
    color: '#888',
    marginLeft: 36,
  },
  featuresSection: {
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  featureIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: '#FF0000',
    borderRadius: 16,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  disabledButton: {
    opacity: 0.7,
  },
  upgradeButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});