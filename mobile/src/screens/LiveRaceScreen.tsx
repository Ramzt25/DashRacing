import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StatusBar } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { RaceService } from '../services/RaceService';
import ScreenContainer from '../components/layout/ScreenContainer';

interface RaceConfig {
  type: '1/4-mile' | 'rolling';
  startSpeed: number;
  countdown: number;
}

export function LiveRaceScreen({ navigation }: any) {
  const { user } = useAuth();
  const [raceConfig, setRaceConfig] = useState<RaceConfig>({
    type: '1/4-mile',
    startSpeed: 40,
    countdown: 3,
  });
  const [challengedRacer, setChallengedRacer] = useState<string | null>(null);
  const [isSettingUpRace, setIsSettingUpRace] = useState(false);
  const [availableRacers, setAvailableRacers] = useState<any[]>([]);
  const [isLoadingRacers, setIsLoadingRacers] = useState(false);

  // Speed options for rolling races
  const speedOptions = [20, 30, 40, 50, 60, 70, 80];
  const countdownOptions = [3, 5, 10];

  const updateRaceConfig = (updates: Partial<RaceConfig>) => {
    setRaceConfig(prev => ({ ...prev, ...updates }));
  };

  const sendRaceChallenge = async () => {
    if (!user || !user.token) {
      Alert.alert('Login Required', 'Please log in to challenge other racers.');
      return;
    }

    if (!location) {
      Alert.alert('Location Required', 'Location access is required to start a race.');
      return;
    }

    setIsSettingUpRace(true);
    
    try {
      // Create race challenge with real API
      const raceData = {
        name: `${raceConfig.type === '1/4-mile' ? 'Quarter-Mile' : 'Rolling'} Race`,
        raceType: raceConfig.type === '1/4-mile' ? 'drag' : 'rolling',
        maxParticipants: 2,
        startTime: new Date(Date.now() + 60000).toISOString(), // Start in 1 minute
        distance: raceConfig.type === '1/4-mile' ? 0.25 : null,
        settings: {
          countdownDuration: raceConfig.countdown,
          startSpeed: raceConfig.type === 'rolling' ? raceConfig.startSpeed : 0,
          raceType: raceConfig.type,
        },
        location: {
          latitude: 40.7128, // Default to NYC, should be replaced with actual location
          longitude: -74.0060,
        },
      };

      const result = await RaceService.createRace(raceData);
      
      setIsSettingUpRace(false);
      Alert.alert(
        'Race Created!',
        `${raceConfig.type === '1/4-mile' ? 'Quarter-Mile' : 'Rolling'} race created successfully!\n\nRace ID: ${result.raceId}\n${raceConfig.type === 'rolling' ? `Start Speed: ${raceConfig.startSpeed} mph\n` : ''}Countdown: ${raceConfig.countdown} seconds\n\nOther racers can now join your race.`,
        [
          { text: 'View Race', onPress: () => navigation.navigate('LiveMap') },
          { text: 'OK' }
        ]
      );
    } catch (error) {
      setIsSettingUpRace(false);
      console.error('Failed to create race:', error);
      Alert.alert(
        'Race Creation Failed',
        'Unable to create race. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const getRaceDescription = () => {
    if (raceConfig.type === '1/4-mile') {
      return 'Classic quarter-mile drag race from standstill';
    } else {
      return `Rolling race starting at ${raceConfig.startSpeed} mph`;
    }
  };

  return (
    <ScreenContainer hideTopInset={true}>
      <ScreenHeader 
        title="Live Race"
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Live Race Setup</Text>
          <Text style={styles.subtitle}>
            Configure race parameters to challenge other racers
          </Text>
        </View>

      {/* Race Type Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Race Type</Text>
        
        <TouchableOpacity 
          style={[
            styles.raceTypeCard,
            raceConfig.type === '1/4-mile' && styles.selectedCard
          ]}
          onPress={() => updateRaceConfig({ type: '1/4-mile' })}
        >
          <View style={styles.raceTypeHeader}>
            <Ionicons 
              name="speedometer" 
              size={24} 
              color={raceConfig.type === '1/4-mile' ? '#FF0000' : '#888'} 
            />
            <Text style={[
              styles.raceTypeName,
              raceConfig.type === '1/4-mile' && styles.selectedText
            ]}>
              1/4 Mile Drag
            </Text>
            {raceConfig.type === '1/4-mile' && (
              <Ionicons name="checkmark-circle" size={20} color="#FF0000" />
            )}
          </View>
          <Text style={styles.raceTypeDescription}>
            Traditional quarter-mile drag race from 0 mph to finish line
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.raceTypeCard,
            raceConfig.type === 'rolling' && styles.selectedCard
          ]}
          onPress={() => updateRaceConfig({ type: 'rolling' })}
        >
          <View style={styles.raceTypeHeader}>
            <Ionicons 
              name="car-sport" 
              size={24} 
              color={raceConfig.type === 'rolling' ? '#FF0000' : '#888'} 
            />
            <Text style={[
              styles.raceTypeName,
              raceConfig.type === 'rolling' && styles.selectedText
            ]}>
              Rolling Race
            </Text>
            {raceConfig.type === 'rolling' && (
              <Ionicons name="checkmark-circle" size={20} color="#FF0000" />
            )}
          </View>
          <Text style={styles.raceTypeDescription}>
            High-speed rolling start from predetermined speed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Speed Selection (for rolling races) */}
      {raceConfig.type === 'rolling' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Start Speed (mph)</Text>
          <View style={styles.speedGrid}>
            {speedOptions.map((speed) => (
              <TouchableOpacity
                key={speed}
                style={[
                  styles.speedOption,
                  raceConfig.startSpeed === speed && styles.selectedSpeedOption
                ]}
                onPress={() => updateRaceConfig({ startSpeed: speed })}
              >
                <Text style={[
                  styles.speedText,
                  raceConfig.startSpeed === speed && styles.selectedSpeedText
                ]}>
                  {speed}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.speedInfo}>
            Both racers must reach {raceConfig.startSpeed} mph before the countdown begins
          </Text>
        </View>
      )}

      {/* Countdown Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Countdown Timer</Text>
        <View style={styles.countdownGrid}>
          {countdownOptions.map((countdown) => (
            <TouchableOpacity
              key={countdown}
              style={[
                styles.countdownOption,
                raceConfig.countdown === countdown && styles.selectedCountdownOption
              ]}
              onPress={() => updateRaceConfig({ countdown })}
            >
              <Text style={[
                styles.countdownText,
                raceConfig.countdown === countdown && styles.selectedCountdownText
              ]}>
                {countdown}s
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Race Preview */}
      <View style={styles.previewSection}>
        <Text style={styles.sectionTitle}>Race Preview</Text>
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Ionicons name="flag" size={20} color="#FF0000" />
            <Text style={styles.previewTitle}>
              {raceConfig.type === '1/4-mile' ? 'Quarter-Mile Drag' : 'Rolling Race'}
            </Text>
          </View>
          <Text style={styles.previewDescription}>
            {getRaceDescription()}
          </Text>
          <View style={styles.previewDetails}>
            {raceConfig.type === 'rolling' && (
              <View style={styles.previewDetail}>
                <Ionicons name="speedometer" size={16} color="#888" />
                <Text style={styles.previewDetailText}>
                  Start at: {raceConfig.startSpeed} mph
                </Text>
              </View>
            )}
            <View style={styles.previewDetail}>
              <Ionicons name="timer" size={16} color="#888" />
              <Text style={styles.previewDetailText}>
                Countdown: {raceConfig.countdown} seconds
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Challenge Button */}
      <View style={styles.challengeSection}>
        <TouchableOpacity 
          style={[styles.challengeButton, isSettingUpRace && styles.challengingButton]}
          onPress={sendRaceChallenge}
          disabled={isSettingUpRace}
        >
          {isSettingUpRace ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.challengeButtonText}>Sending Challenge...</Text>
            </>
          ) : (
            <>
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={styles.challengeButtonText}>Send Race Challenge</Text>
            </>
          )}
        </TouchableOpacity>
        
        <Text style={styles.challengeInfo}>
          This will send a race invitation to the selected racer with your configured settings.
        </Text>
      </View>

      {/* Safety Notice */}
      <View style={styles.safetySection}>
        <View style={styles.safetyHeader}>
          <Ionicons name="warning" size={20} color="#FFA500" />
          <Text style={styles.safetyTitle}>Safety Notice</Text>
        </View>
        <Text style={styles.safetyText}>
          Always follow local traffic laws and race in designated areas only. 
          DASH promotes safe and responsible racing practices.
        </Text>
      </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#aaa',
    fontSize: 16,
  },
  section: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  raceTypeCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#FF0000',
    backgroundColor: '#1a0000',
  },
  raceTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  raceTypeName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 12,
  },
  selectedText: {
    color: '#FF0000',
  },
  raceTypeDescription: {
    color: '#aaa',
    fontSize: 14,
    lineHeight: 20,
  },
  speedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  speedOption: {
    backgroundColor: '#111',
    width: '13%',
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedSpeedOption: {
    backgroundColor: '#FF0000',
    borderColor: '#FF0000',
  },
  speedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedSpeedText: {
    color: '#000',
  },
  speedInfo: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  countdownGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  countdownOption: {
    backgroundColor: '#111',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCountdownOption: {
    backgroundColor: '#FF0000',
    borderColor: '#FF0000',
  },
  countdownText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedCountdownText: {
    color: '#000',
  },
  previewSection: {
    margin: 20,
    marginTop: 0,
  },
  previewCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF0000',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  previewDescription: {
    color: '#aaa',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  previewDetails: {
    gap: 8,
  },
  previewDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewDetailText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
  },
  challengeSection: {
    margin: 20,
    marginTop: 0,
  },
  challengeButton: {
    backgroundColor: '#FF0000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  challengingButton: {
    backgroundColor: '#cc0000',
  },
  challengeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  challengeInfo: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  safetySection: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  safetyTitle: {
    color: '#FFA500',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  safetyText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
});