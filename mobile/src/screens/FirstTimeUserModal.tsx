import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

interface FirstTimeUserModalProps {
  visible: boolean;
  onClose: () => void;
}

export function FirstTimeUserModal({ visible, onClose }: FirstTimeUserModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { markFirstTimeComplete } = useAuth();

  const steps = [
    {
      icon: 'speedometer',
      title: 'Live Speed Tracking',
      subtitle: 'Real-time racing experience',
      description: 'Monitor your speed in real-time with GPS tracking. See your current speed, max speed, and distance traveled during racing sessions.',
      color: '#FF0000',
    },
    {
      icon: 'people',
      title: 'Find Nearby Racers',
      subtitle: 'Connect with local drivers',
      description: 'Discover other racing enthusiasts near you. Join impromptu races, challenge friends, and build your racing community.',
      color: '#00FF7F',
    },
    {
      icon: 'analytics',
      title: 'Performance Analytics',
      subtitle: 'Track your progress',
      description: 'Analyze your racing data with detailed statistics. See lap times, average speeds, and improvement over time.',
      color: '#1E90FF',
    },
    {
      icon: 'car-sport',
      title: 'Virtual Garage',
      subtitle: 'Customize your experience',
      description: 'Collect and customize virtual vehicles. Unlock new cars as you improve your racing skills and complete challenges.',
      color: '#FFD700',
    },
    {
      icon: 'trophy',
      title: 'Compete & Win',
      subtitle: 'Climb the leaderboards',
      description: 'Participate in races, earn points, and climb global leaderboards. Unlock achievements and show off your racing prowess.',
      color: '#FF6B35',
    },
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    await markFirstTimeComplete();
    onClose();
  };

  const handleSkip = async () => {
    await markFirstTimeComplete();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentStep && styles.progressDotActive,
                  index < currentStep && styles.progressDotCompleted,
                ]}
              />
            ))}
          </View>
          <View style={{ width: 60 }} />
        </View>

        {/* Content */}
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.iconContainer}>
            <View style={[styles.iconBackground, { backgroundColor: currentStepData.color + '20' }]}>
              <Ionicons
                name={currentStepData.icon as any}
                size={80}
                color={currentStepData.color}
              />
            </View>
          </View>

          <Text style={styles.title}>{currentStepData.title}</Text>
          <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
          <Text style={styles.description}>{currentStepData.description}</Text>

          {/* Features List for Free Users */}
          {currentStep === 0 && (
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>What you can do for free:</Text>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#00FF7F" />
                <Text style={styles.featureText}>Basic speed tracking</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#00FF7F" />
                <Text style={styles.featureText}>Find nearby racers</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#00FF7F" />
                <Text style={styles.featureText}>Join up to 3 races per day</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#00FF7F" />
                <Text style={styles.featureText}>Basic vehicle garage</Text>
              </View>
              
              <View style={styles.proTeaser}>
                <Ionicons name="diamond" size={16} color="#FFD700" />
                <Text style={styles.proTeaserText}>
                  Upgrade to Pro for unlimited racing, advanced analytics, and more!
                </Text>
              </View>
            </View>
          )}

          {/* Safety Notice */}
          {currentStep === steps.length - 1 && (
            <View style={styles.safetyNotice}>
              <View style={styles.safetyHeader}>
                <Ionicons name="warning" size={24} color="#FF6B35" />
                <Text style={styles.safetyTitle}>Drive Safely</Text>
              </View>
              <Text style={styles.safetyText}>
                Always follow traffic laws and drive responsibly. DASH is for entertainment purposes only. 
                Never use your phone while driving - use hands-free mode or have a passenger operate the app.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.footerButton, styles.previousButton]}
            onPress={handlePrevious}
            disabled={currentStep === 0}
          >
            {currentStep > 0 && (
              <>
                <Ionicons name="chevron-back" size={20} color="#fff" />
                <Text style={styles.previousButtonText}>Previous</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.footerButton, styles.nextButton]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons
              name={currentStep === steps.length - 1 ? 'rocket' : 'chevron-forward'}
              size={20}
              color="#000"
            />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
  },
  progressDotActive: {
    backgroundColor: '#FF0000',
    width: 24,
  },
  progressDotCompleted: {
    backgroundColor: '#00FF7F',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconBackground: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#333',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
    marginBottom: 32,
  },
  featuresContainer: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#ccc',
    flex: 1,
  },
  proTeaser: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a1a',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    gap: 8,
  },
  proTeaserText: {
    fontSize: 14,
    color: '#FFD700',
    flex: 1,
    fontWeight: '600',
  },
  safetyNotice: {
    width: '100%',
    backgroundColor: '#2a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  safetyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  safetyText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 120,
    justifyContent: 'center',
  },
  previousButton: {
    backgroundColor: 'transparent',
  },
  previousButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#FF0000',
  },
  nextButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});