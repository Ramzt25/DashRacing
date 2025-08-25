import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

export function MapScreen() {
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [currentDrive, setCurrentDrive] = useState({
    startTime: null as Date | null,
    isActive: false,
    maxSpeed: 0,
    isVisible: true,
  });
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [showDriveModal, setShowDriveModal] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        startLocationTracking();
      } else {
        Alert.alert('Permission Denied', 'Location access is required for speed tracking.');
      }
    } catch (error) {
      console.error('Location permission error:', error);
    }
  };

  const startLocationTracking = async () => {
    try {
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (newLocation) => {
          setLocation(newLocation);
          if (newLocation.coords.speed) {
            const speedMph = Math.round((newLocation.coords.speed * 2.237) * 10) / 10;
            setCurrentSpeed(speedMph);
            
            if (currentDrive.isActive && speedMph > currentDrive.maxSpeed) {
              setCurrentDrive(prev => ({ ...prev, maxSpeed: speedMph }));
            }
          }
        }
      );
    } catch (error) {
      console.error('Location tracking error:', error);
    }
  };

  const handleStartDrivePress = () => {
    setShowDriveModal(true);
  };

  const startDriveWithVisibility = (isVisible: boolean) => {
    setCurrentDrive({
      startTime: new Date(),
      isActive: true,
      maxSpeed: 0,
      isVisible: isVisible,
    });
    setTotalDistance(0);
    setShowDriveModal(false);
    
    const visibilityText = isVisible ? 'visible to other racers' : 'driving privately';
    Alert.alert('Drive Started!', `Now tracking your performance (${visibilityText})`);
  };

  const stopDrive = () => {
    if (currentDrive.isActive) {
      const duration = currentDrive.startTime 
        ? Math.round((new Date().getTime() - currentDrive.startTime.getTime()) / 1000 / 60)
        : 0;
      
      Alert.alert(
        'Drive Complete!',
        `Max Speed: ${currentDrive.maxSpeed} mph\\nDrive saved to your history!`
      );
      
      setCurrentDrive({
        startTime: null,
        isActive: false,
        maxSpeed: 0,
        isVisible: true,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>GridGhost</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="people" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="settings" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Live Speed Display */}
        <View style={styles.speedContainer}>
          <View style={styles.speedometer}>
            <Text style={styles.speedValue}>{currentSpeed}</Text>
            <Text style={styles.speedUnit}>MPH</Text>
            {currentDrive.isActive && (
              <View style={styles.driveStatus}>
                <Text style={styles.driveStatusText}>
                  {currentDrive.isVisible ? '👁️ Visible' : '🔒 Private'}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.driveControls}>
            {!currentDrive.isActive ? (
              <TouchableOpacity style={styles.startButton} onPress={handleStartDrivePress}>
                <Ionicons name="play-circle" size={32} color="#000" />
                <Text style={styles.buttonText}>Start Drive</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.stopButton} onPress={stopDrive}>
                <Ionicons name="stop-circle" size={32} color="#fff" />
                <Text style={styles.stopButtonText}>Stop Drive</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Live Drive Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>
            {currentDrive.isActive ? 'Current Drive' : 'Last Drive'}
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{currentDrive.maxSpeed || '--'}</Text>
              <Text style={styles.statLabel}>Max Speed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalDistance.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Distance (mi)</Text>
            </View>
          </View>
        </View>

        {/* Map Placeholder */}
        <View style={styles.mapContainer}>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={64} color="#FF0000" />
            <Text style={styles.placeholderTitle}>Live GPS Map</Text>
            <Text style={styles.placeholderText}>
              Real-time location tracking active
            </Text>
            {location && (
              <Text style={styles.coordsText}>
                Live GPS: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
              </Text>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="search" size={24} color="#fff" />
            <Text style={styles.actionText}>Find Races</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
            <Ionicons name="trophy" size={24} color="#FF0000" />
            <Text style={[styles.actionText, styles.secondaryText]}>Leaderboard</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Start Drive Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDriveModal}
        onRequestClose={() => setShowDriveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Start Driving?</Text>
            <Text style={styles.modalSubtitle}>Choose your visibility preference</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.visibilityButton}
                onPress={() => startDriveWithVisibility(true)}
              >
                <Ionicons name="eye" size={24} color="#000" />
                <Text style={styles.visibilityButtonText}>Visible</Text>
                <Text style={styles.visibilitySubtext}>Others can see you racing</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.visibilityButton, styles.privateButton]}
                onPress={() => startDriveWithVisibility(false)}
              >
                <Ionicons name="eye-off" size={24} color="#fff" />
                <Text style={[styles.visibilityButtonText, styles.privateButtonText]}>Private</Text>
                <Text style={[styles.visibilitySubtext, styles.privateSubtext]}>Drive offline, not visible</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowDriveModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FF0000',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  headerIcon: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  speedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 20,
    padding: 24,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FF0000',
  },
  speedometer: {
    alignItems: 'center',
    flex: 1,
  },
  speedValue: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#FF0000',
  },
  speedUnit: {
    fontSize: 18,
    color: '#fff',
    marginTop: -8,
  },
  driveStatus: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderRadius: 12,
  },
  driveStatusText: {
    fontSize: 12,
    color: '#FF0000',
    fontWeight: 'bold',
  },
  driveControls: {
    marginLeft: 24,
  },
  startButton: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stopButton: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 18,
  },
  stopButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  statsContainer: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF0000',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF0000',
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  mapContainer: {
    height: 300,
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderWidth: 2,
    borderColor: '#FF0000',
    borderStyle: 'dashed',
    borderRadius: 20,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF0000',
    marginTop: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  coordsText: {
    fontSize: 12,
    color: '#FF0000',
    textAlign: 'center',
    marginTop: 12,
    fontFamily: 'monospace',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 16,
    margin: 20,
    marginBottom: 40,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FF0000',
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF0000',
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryText: {
    color: '#FF0000',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 32,
    margin: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF0000',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 32,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  visibilityButton: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 120,
  },
  privateButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF0000',
  },
  visibilityButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 8,
  },
  privateButtonText: {
    color: '#fff',
  },
  visibilitySubtext: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  privateSubtext: {
    color: '#888',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 16,
  },
});