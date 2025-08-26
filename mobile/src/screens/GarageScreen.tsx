import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput, ActivityIndicator, Image, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ScreenHeader } from '../components/common/ScreenHeader';
import ScreenContainer from '../components/layout/ScreenContainer';
import { CarStorageService } from '../services/CarStorageService';
import { CarInfoService, CarTrim, COMMON_CAR_COLORS, MOD_CATEGORIES } from '../services/CarInfoService';
import { EnhancedEdmundsService, EnhancedVehicleData, VehicleSearchParams, VehicleCategory } from '../services/EnhancedEdmundsService';
import { EdmundsApiService, VehicleSearchResult } from '../services/EdmundsApiService';
import { Car, CarMod, CarColor } from '../types/car';
import { useAuth } from '../context/AuthContext';
import { colors, typography, spacing, shadows } from '../utils/theme';

export function GarageScreen({ navigation }: any) {
  const { user } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isModModalVisible, setIsModModalVisible] = useState(false);
  const [isVehicleSearchVisible, setIsVehicleSearchVisible] = useState(false);
  const [isVehicleDetailsVisible, setIsVehicleDetailsVisible] = useState(false);
  const [selectedCarForMods, setSelectedCarForMods] = useState<Car | null>(null);
  const [selectedVehicleDetails, setSelectedVehicleDetails] = useState<EnhancedVehicleData | null>(null);
  
  // Vehicle search state
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState('');
  const [vehicleSearchResults, setVehicleSearchResults] = useState<VehicleSearchResult[]>([]);
  const [isSearchingVehicles, setIsSearchingVehicles] = useState(false);
  const [searchFilters, setSearchFilters] = useState<VehicleSearchParams>({});
  
  // Enhanced features
  const [marketInsights, setMarketInsights] = useState<any>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [vehicleComparison, setVehicleComparison] = useState<any>(null);
  
  const [isLookingUpSpecs, setIsLookingUpSpecs] = useState(false);
  const [isLookingUpTrims, setIsLookingUpTrims] = useState(false);
  const [availableTrims, setAvailableTrims] = useState<CarTrim[]>([]);
  const [selectedTrim, setSelectedTrim] = useState<CarTrim | null>(null);
  const [selectedColor, setSelectedColor] = useState<CarColor>(COMMON_CAR_COLORS[0]);
  const [newCar, setNewCar] = useState({
    name: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    class: 'Sports' as Car['class'],
  });
  const [newMod, setNewMod] = useState({
    name: '',
    category: 'Engine' as CarMod['category'],
    description: '',
    brand: '',
    cost: ''
  });

  // Load cars on component mount
  useEffect(() => {
    loadCars();
    loadMarketInsights();
  }, []);

  const loadCars = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const userCars = await CarStorageService.getUserCars(user.id);
      setCars(userCars);
    } catch (error) {
      console.error('Failed to load cars:', error);
      Alert.alert('Error', 'Failed to load your cars. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMarketInsights = async () => {
    setIsLoadingInsights(true);
    try {
      const insights = await EnhancedEdmundsService.getMarketInsights({
        categories: ['Sports', 'Luxury'],
        priceRange: { min: 20000, max: 100000 },
      });
      setMarketInsights(insights);
    } catch (error) {
      console.warn('Failed to load market insights:', error);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  // Week 5 Enhanced Vehicle Search Functions
  const searchVehicles = async (query: string) => {
    if (!query.trim()) {
      setVehicleSearchResults([]);
      return;
    }

    setIsSearchingVehicles(true);
    try {
      const searchParams: VehicleSearchParams = {
        query: query.trim(),
        ...searchFilters,
      };

      const results = await EnhancedEdmundsService.searchVehiclesAdvanced(searchParams);
      setVehicleSearchResults(results);
    } catch (error) {
      console.error('Vehicle search failed:', error);
      Alert.alert('Search Error', 'Failed to search vehicles. Please try again.');
    } finally {
      setIsSearchingVehicles(false);
    }
  };

  const selectVehicleFromSearch = async (vehicle: VehicleSearchResult) => {
    setIsLookingUpSpecs(true);
    try {
      const enhancedData = await EnhancedEdmundsService.getEnhancedVehicleDetails(
        vehicle.make,
        vehicle.model,
        vehicle.years[0] || new Date().getFullYear()
      );
      
      setSelectedVehicleDetails(enhancedData);
      setIsVehicleDetailsVisible(true);
      setIsVehicleSearchVisible(false);
    } catch (error) {
      console.error('Failed to get vehicle details:', error);
      Alert.alert('Error', 'Failed to load vehicle details. Please try again.');
    } finally {
      setIsLookingUpSpecs(false);
    }
  };

  const addVehicleFromEdmunds = () => {
    if (!selectedVehicleDetails) return;

    setNewCar({
      name: `${selectedVehicleDetails.year} ${selectedVehicleDetails.make} ${selectedVehicleDetails.model}`,
      make: selectedVehicleDetails.make,
      model: selectedVehicleDetails.model,
      year: selectedVehicleDetails.year,
      class: 'Sports', // Would be determined from vehicle data
    });

    setIsVehicleDetailsVisible(false);
    setIsAddModalVisible(true);
  };

  const compareVehicles = async () => {
    if (cars.length < 2) {
      Alert.alert('Comparison', 'You need at least 2 cars to compare.');
      return;
    }

    const vehiclesToCompare = cars.slice(0, 3).map(car => ({
      make: car.make,
      model: car.model,
      year: car.year,
    }));

    try {
      const comparison = await EnhancedEdmundsService.compareVehicles(vehiclesToCompare);
      setVehicleComparison(comparison);
      
      Alert.alert(
        'Vehicle Comparison',
        `Recommendation: ${comparison.recommendation.overall.year} ${comparison.recommendation.overall.make} ${comparison.recommendation.overall.model}\n\n${comparison.recommendation.reasoning}`,
        [
          { text: 'OK', style: 'default' },
          { 
            text: 'View Details', 
            onPress: () => navigation.navigate('VehicleComparison', { comparison }) 
          }
        ]
      );
    } catch (error) {
      console.error('Vehicle comparison failed:', error);
      Alert.alert('Error', 'Failed to compare vehicles. Please try again.');
    }
  };

  const ownedCars = cars.filter(car => car.owned);

  const handleAddCar = async () => {
    if (!user?.id) return;

    // Check if user can add more cars (Free vs Pro)
    const canAddResult = await CarStorageService.canAddCar(user.id, user.isPro || false);
    if (!canAddResult.canAdd) {
      Alert.alert('Upgrade Required', canAddResult.reason, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Upgrade to Pro', onPress: () => navigation.navigate('ProUpgrade') }
      ]);
      return;
    }

    if (!newCar.name || !newCar.make || !newCar.model) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    setIsLookingUpSpecs(true);
    try {
      const car = await CarStorageService.createNewCar({
        ...newCar,
        color: selectedColor.name,
        trim: selectedTrim?.name
      }, user.id);

      const success = await CarStorageService.saveCar(car, user.id);
      if (success) {
        setCars([...cars, car]);
        setIsAddModalVisible(false);
        resetNewCarForm();
        Alert.alert('Success', `${car.name} added to your garage!`);
      } else {
        Alert.alert('Warning', 'Car saved locally but may not sync until you\'re online.');
      }
    } catch (error) {
      console.error('Failed to add car:', error);
      Alert.alert('Error', 'Failed to add car. Please try again.');
    } finally {
      setIsLookingUpSpecs(false);
    }
  };

  const handleDeleteCar = (carId: string) => {
    Alert.alert(
      'Delete Car',
      'Are you sure you want to remove this car from your garage?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            const success = await CarStorageService.deleteCar(carId);
            if (success) {
              setCars(cars.filter(car => car.id !== carId));
            } else {
              Alert.alert('Error', 'Failed to delete car. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleAddMod = (car: Car) => {
    const canAddResult = CarStorageService.canAddMods(user?.isPro || false);
    if (!canAddResult.canAdd) {
      Alert.alert('Pro Feature', canAddResult.reason, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Upgrade to Pro', onPress: () => navigation.navigate('ProUpgrade') }
      ]);
      return;
    }

    setSelectedCarForMods(car);
    setIsModModalVisible(true);
  };

  const handleSaveMod = async () => {
    if (!selectedCarForMods || !user?.id) return;

    if (!newMod.name || !newMod.description) {
      Alert.alert('Missing Information', 'Please fill in the mod name and description.');
      return;
    }

    try {
      // Get AI estimation for mod performance
      const estimation = await CarInfoService.estimateModPerformance(
        selectedCarForMods.currentSpecs,
        { ...newMod, cost: newMod.cost ? parseFloat(newMod.cost) : undefined }
      );

      const mod: CarMod = {
        id: `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: newMod.name,
        category: newMod.category,
        description: newMod.description,
        hpGain: estimation.hpGain,
        torqueGain: estimation.torqueGain,
        weightChange: estimation.weightChange,
        brand: newMod.brand || undefined,
        cost: newMod.cost ? parseFloat(newMod.cost) : undefined,
        dateAdded: new Date().toISOString()
      };

      const success = await CarStorageService.addModification(selectedCarForMods.id, mod, user.id);
      if (success) {
        await loadCars(); // Reload to get updated specs
        setIsModModalVisible(false);
        resetModForm();
        
        Alert.alert(
          'Mod Added!',
          `${mod.name} installed successfully!\\n\\n` +
          `Performance gains:\\n` +
          `+${Math.round(estimation.hpGain)} HP\\n` +
          `+${Math.round(estimation.torqueGain)} lb-ft torque\\n` +
          `${estimation.weightChange > 0 ? '+' : ''}${Math.round(estimation.weightChange)} lbs\\n\\n` +
          `Confidence: ${Math.round(estimation.confidence * 100)}%\\n` +
          `${estimation.reasoning}`
        );
      } else {
        Alert.alert('Error', 'Failed to add modification. Please try again.');
      }
    } catch (error) {
      console.error('Failed to add mod:', error);
      Alert.alert('Error', 'Failed to add modification. Please try again.');
    }
  };

  const resetNewCarForm = () => {
    setNewCar({
      name: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      class: 'Sports',
    });
    setSelectedColor(COMMON_CAR_COLORS[0]);
    setAvailableTrims([]);
    setSelectedTrim(null);
  };

  const resetModForm = () => {
    setNewMod({
      name: '',
      category: 'Engine',
      description: '',
      brand: '',
      cost: ''
    });
    setSelectedCarForMods(null);
  };

  const renderCarCard = (car: Car) => (
    <View key={car.id} style={styles.carCard}>
      <LinearGradient
        colors={[colors.surface, colors.surfaceSecondary]}
        style={styles.carCardGradient}
      >
        {/* Car Image */}
        {car.images.length > 0 && (
          <Image source={{ uri: car.images[car.primaryImageIndex] }} style={styles.carImage} />
        )}
        
        {/* Car Info */}
        <View style={styles.carInfo}>
          <Text style={styles.carName}>{car.name}</Text>
          <Text style={styles.carDetails}>{car.year} {car.make} {car.model}</Text>
          <Text style={styles.carClass}>{car.class}</Text>
        </View>

        {/* Car Stats */}
        <View style={styles.carStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{car.currentSpecs.hp}</Text>
            <Text style={styles.statLabel}>HP</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{car.currentSpecs.torque}</Text>
            <Text style={styles.statLabel}>TQ</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{car.currentSpecs.acceleration}</Text>
            <Text style={styles.statLabel}>0-60</Text>
          </View>
        </View>

        {/* Mods Count */}
        {car.mods.length > 0 && (
          <View style={styles.modsIndicator}>
            <Ionicons name="construct" size={16} color={colors.primary} />
            <Text style={styles.modsCount}>{car.mods.length} mods</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.carActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleAddMod(car)}
          >
            <Ionicons name="construct" size={20} color={colors.primary} />
            <Text style={styles.actionButtonText}>Add Mod</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteCar(car.id)}
          >
            <Ionicons name="trash" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <>
      <ScreenHeader 
        title="My Garage" 
        onBackPress={() => navigation.goBack()} 
        rightComponent={
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={() => setIsVehicleSearchVisible(true)} 
              style={[styles.headerButton, { marginRight: 8 }]}
            >
              <Ionicons name="search" size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsAddModalVisible(true)} style={styles.headerButton}>
              <Ionicons name="add" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        }
      />
      
      <ScreenContainer hideTopInset={true}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading your garage...</Text>
          </View>
        ) : (
          <>
            {/* User Info with Week 5 Enhancements */}
            <View style={styles.userInfo}>
              <Text style={styles.welcomeText}>Welcome to your garage!</Text>
              <Text style={styles.userType}>
                {user?.isPro ? '🏆 Pro Racer' : '🚗 Free User'} • {ownedCars.length} car{ownedCars.length !== 1 ? 's' : ''}
              </Text>
              {!user?.isPro && (
                <TouchableOpacity 
                  style={styles.upgradePrompt}
                  onPress={() => navigation.navigate('ProUpgrade')}
                >
                  <Ionicons name="diamond" size={16} color="#FFD700" />
                  <Text style={styles.upgradeText}>Upgrade to Pro for unlimited cars & mods!</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Week 5 Enhanced Features */}
            <View style={styles.enhancedFeatures}>
              <Text style={styles.sectionTitle}>Enhanced Features</Text>
              <View style={styles.featureGrid}>
                <TouchableOpacity 
                  style={styles.featureCard}
                  onPress={() => setIsVehicleSearchVisible(true)}
                >
                  <Ionicons name="search" size={24} color={colors.primary} />
                  <Text style={styles.featureTitle}>Vehicle Search</Text>
                  <Text style={styles.featureSubtitle}>Find & compare vehicles</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.featureCard}
                  onPress={compareVehicles}
                  disabled={ownedCars.length < 2}
                >
                  <Ionicons name="analytics" size={24} color={ownedCars.length >= 2 ? colors.primary : colors.textTertiary} />
                  <Text style={[styles.featureTitle, ownedCars.length < 2 && { color: colors.textTertiary }]}>
                    Compare Cars
                  </Text>
                  <Text style={[styles.featureSubtitle, ownedCars.length < 2 && { color: colors.textTertiary }]}>
                    AI-powered analysis
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.featureCard}
                  onPress={loadMarketInsights}
                >
                  <Ionicons name="trending-up" size={24} color={colors.primary} />
                  <Text style={styles.featureTitle}>Market Insights</Text>
                  <Text style={styles.featureSubtitle}>Price trends & alerts</Text>
                  {isLoadingInsights && <ActivityIndicator size="small" color={colors.primary} />}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.featureCard}
                  onPress={() => navigation.navigate('VehicleRecommendations')}
                >
                  <Ionicons name="bulb" size={24} color={colors.primary} />
                  <Text style={styles.featureTitle}>AI Recommendations</Text>
                  <Text style={styles.featureSubtitle}>Personalized suggestions</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Owned Cars */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Cars ({ownedCars.length})</Text>
              {ownedCars.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="car-sport" size={64} color={colors.textTertiary} />
                  <Text style={styles.emptyStateText}>No cars in your garage yet</Text>
                  <Text style={styles.emptyStateSubtext}>Add your first car to get started!</Text>
                </View>
              ) : (
                ownedCars.map(renderCarCard)
              )}
            </View>
          </>
        )}
      </ScreenContainer>

        {/* Add Car Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isAddModalVisible}
          onRequestClose={() => setIsAddModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Car</Text>
                <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScrollView}>
                {/* Car Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Car Name *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newCar.name}
                    onChangeText={(text) => setNewCar({...newCar, name: text})}
                    placeholder="e.g., My Daily Driver"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>

                {/* Make */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Make *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newCar.make}
                    onChangeText={(text) => setNewCar({...newCar, make: text})}
                    placeholder="e.g., BMW, Toyota, Ferrari"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>

                {/* Model */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Model *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newCar.model}
                    onChangeText={(text) => setNewCar({...newCar, model: text})}
                    placeholder="e.g., M3, Supra, 488"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>

                {/* Year */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Year *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newCar.year.toString()}
                    onChangeText={(text) => setNewCar({...newCar, year: parseInt(text) || new Date().getFullYear()})}
                    placeholder="2023"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>

                {/* Color Selection */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Color</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorPicker}>
                    {COMMON_CAR_COLORS.map((color) => (
                      <TouchableOpacity
                        key={color.name}
                        style={[
                          styles.colorOption,
                          { backgroundColor: color.hex },
                          selectedColor.name === color.name && styles.selectedColor
                        ]}
                        onPress={() => setSelectedColor(color)}
                      />
                    ))}
                  </ScrollView>
                  <Text style={styles.selectedColorText}>Selected: {selectedColor.name}</Text>
                </View>

                {/* AI Lookup Status */}
                {isLookingUpTrims && (
                  <View style={styles.aiStatus}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.aiStatusText}>Looking up car specifications...</Text>
                  </View>
                )}
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setIsAddModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleAddCar}
                  disabled={isLookingUpSpecs}
                >
                  {isLookingUpSpecs ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Text style={styles.saveButtonText}>Add Car</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Add Mod Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isModModalVisible}
          onRequestClose={() => setIsModModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Modification</Text>
                <TouchableOpacity onPress={() => setIsModModalVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScrollView}>
                <Text style={styles.modalSubtitle}>
                  Adding mod to: {selectedCarForMods?.name}
                </Text>

                {/* Mod Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Modification Name *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newMod.name}
                    onChangeText={(text) => setNewMod({...newMod, name: text})}
                    placeholder="e.g., Cold Air Intake, Turbo Kit"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>

                {/* Category */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Category *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.categoryPicker}>
                      {MOD_CATEGORIES.map((category) => (
                        <TouchableOpacity
                          key={category}
                          style={[
                            styles.categoryOption,
                            newMod.category === category && styles.selectedCategory
                          ]}
                          onPress={() => setNewMod({...newMod, category})}
                        >
                          <Text style={[
                            styles.categoryText,
                            newMod.category === category && styles.selectedCategoryText
                          ]}>
                            {category}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                {/* Description */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Description *</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={newMod.description}
                    onChangeText={(text) => setNewMod({...newMod, description: text})}
                    placeholder="Describe the modification and expected benefits..."
                    placeholderTextColor={colors.textTertiary}
                    multiline={true}
                    numberOfLines={3}
                  />
                </View>

                {/* Brand */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Brand (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newMod.brand}
                    onChangeText={(text) => setNewMod({...newMod, brand: text})}
                    placeholder="e.g., Borla, HKS, APR"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>

                {/* Cost */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Cost (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newMod.cost}
                    onChangeText={(text) => setNewMod({...newMod, cost: text})}
                    placeholder="e.g., 1500"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>

                <View style={styles.aiInfo}>
                  <Ionicons name="sparkles" size={16} color={colors.accent} />
                  <Text style={styles.aiInfoText}>
                    AI will estimate performance gains based on your car and modification type
                  </Text>
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setIsModModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleSaveMod}
                >
                  <Text style={styles.saveButtonText}>Add Mod</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Week 5 Vehicle Search Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isVehicleSearchVisible}
          onRequestClose={() => setIsVehicleSearchVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Vehicle Search</Text>
                <TouchableOpacity onPress={() => setIsVehicleSearchVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalScrollView}>
                {/* Search Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Search Vehicles</Text>
                  <View style={styles.searchInputContainer}>
                    <TextInput
                      style={styles.searchInput}
                      value={vehicleSearchQuery}
                      onChangeText={(text) => {
                        setVehicleSearchQuery(text);
                        searchVehicles(text);
                      }}
                      placeholder="Search by make, model, or year..."
                      placeholderTextColor={colors.textTertiary}
                    />
                    {isSearchingVehicles && (
                      <ActivityIndicator size="small" color={colors.primary} style={styles.searchSpinner} />
                    )}
                  </View>
                </View>

                {/* Search Results */}
                {vehicleSearchResults.length > 0 && (
                  <FlatList
                    data={vehicleSearchResults}
                    keyExtractor={(item, index) => `${item.make}-${item.model}-${index}`}
                    style={styles.searchResults}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.searchResultItem}
                        onPress={() => selectVehicleFromSearch(item)}
                      >
                        <View style={styles.searchResultInfo}>
                          <Text style={styles.searchResultTitle}>
                            {item.make} {item.model}
                          </Text>
                          <Text style={styles.searchResultSubtitle}>
                            {item.category} • {item.years.length} years available
                          </Text>
                          <View style={styles.searchResultMeta}>
                            <View style={styles.popularityBar}>
                              <View 
                                style={[
                                  styles.popularityFill, 
                                  { width: `${item.popularity}%` }
                                ]} 
                              />
                            </View>
                            <Text style={styles.popularityText}>{item.popularity}% popular</Text>
                          </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                      </TouchableOpacity>
                    )}
                  />
                )}

                {vehicleSearchQuery.length > 0 && !isSearchingVehicles && vehicleSearchResults.length === 0 && (
                  <View style={styles.noResults}>
                    <Ionicons name="search" size={48} color={colors.textTertiary} />
                    <Text style={styles.noResultsText}>No vehicles found</Text>
                    <Text style={styles.noResultsSubtext}>Try a different search term</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </Modal>

        {/* Week 5 Vehicle Details Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isVehicleDetailsVisible}
          onRequestClose={() => setIsVehicleDetailsVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Vehicle Details</Text>
                <TouchableOpacity onPress={() => setIsVehicleDetailsVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              {selectedVehicleDetails && (
                <ScrollView style={styles.modalScrollView}>
                  {/* Vehicle Header */}
                  <View style={styles.vehicleHeader}>
                    <Text style={styles.vehicleTitle}>
                      {selectedVehicleDetails.year} {selectedVehicleDetails.make} {selectedVehicleDetails.model}
                    </Text>
                    <Text style={styles.vehicleTrim}>{selectedVehicleDetails.trim}</Text>
                  </View>

                  {/* Performance Stats */}
                  <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                      <Text style={styles.statValue}>{selectedVehicleDetails.engine.horsepower}</Text>
                      <Text style={styles.statLabel}>HP</Text>
                    </View>
                    <View style={styles.statCard}>
                      <Text style={styles.statValue}>{selectedVehicleDetails.engine.torque}</Text>
                      <Text style={styles.statLabel}>LB-FT</Text>
                    </View>
                    <View style={styles.statCard}>
                      <Text style={styles.statValue}>{selectedVehicleDetails.specifications.acceleration0to60.toFixed(1)}s</Text>
                      <Text style={styles.statLabel}>0-60</Text>
                    </View>
                    <View style={styles.statCard}>
                      <Text style={styles.statValue}>{selectedVehicleDetails.fuelEconomy.combined}</Text>
                      <Text style={styles.statLabel}>MPG</Text>
                    </View>
                  </View>

                  {/* Pricing */}
                  <View style={styles.pricingSection}>
                    <Text style={styles.sectionTitle}>Pricing</Text>
                    <View style={styles.pricingGrid}>
                      <View style={styles.priceItem}>
                        <Text style={styles.priceLabel}>MSRP</Text>
                        <Text style={styles.priceValue}>${selectedVehicleDetails.pricing.msrp.toLocaleString()}</Text>
                      </View>
                      <View style={styles.priceItem}>
                        <Text style={styles.priceLabel}>Invoice</Text>
                        <Text style={styles.priceValue}>${selectedVehicleDetails.pricing.invoice.toLocaleString()}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Enhanced Features */}
                  {selectedVehicleDetails.performanceData && (
                    <View style={styles.enhancedSection}>
                      <Text style={styles.sectionTitle}>Performance Analysis</Text>
                      <View style={styles.analysisGrid}>
                        <View style={styles.analysisItem}>
                          <Text style={styles.analysisLabel}>Track Rating</Text>
                          <View style={styles.ratingBar}>
                            <View 
                              style={[
                                styles.ratingFill, 
                                { width: `${(selectedVehicleDetails.performanceData.trackRating / 5) * 100}%` }
                              ]} 
                            />
                          </View>
                          <Text style={styles.ratingText}>{selectedVehicleDetails.performanceData.trackRating.toFixed(1)}/5</Text>
                        </View>
                        <View style={styles.analysisItem}>
                          <Text style={styles.analysisLabel}>Modification Potential</Text>
                          <View style={styles.ratingBar}>
                            <View 
                              style={[
                                styles.ratingFill, 
                                { width: `${selectedVehicleDetails.performanceData.modificationPotential}%` }
                              ]} 
                            />
                          </View>
                          <Text style={styles.ratingText}>{selectedVehicleDetails.performanceData.modificationPotential}%</Text>
                        </View>
                      </View>
                    </View>
                  )}
                </ScrollView>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setIsVehicleDetailsVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Close</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={addVehicleFromEdmunds}
                >
                  <Text style={styles.saveButtonText}>Add to Garage</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textPrimary,
    fontSize: 16,
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.lg, // Only bottom padding, ScreenContainer handles the rest
  },
  // Week 5 Enhanced Header Styles
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
  },
  addButton: {
    padding: 8,
  },
  userInfo: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  userType: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  upgradePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  upgradeText: {
    color: '#FFD700',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  // Week 5 Enhanced Features Styles
  enhancedFeatures: {
    marginBottom: 24,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceSecondary,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 8,
    textAlign: 'center',
  },
  featureSubtitle: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 8,
    textAlign: 'center',
  },
  carCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  carCardGradient: {
    padding: 16,
  },
  carImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
  },
  carInfo: {
    marginBottom: 12,
  },
  carName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  carDetails: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  carClass: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '600',
  },
  carStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },
  modsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modsCount: {
    color: colors.primary,
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  carActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  deleteButton: {
    flex: 0,
    marginRight: 0,
    marginLeft: 8,
    paddingHorizontal: 16,
  },
  actionButtonText: {
    color: colors.primary,
    marginLeft: 8,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 0,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSecondary,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  modalScrollView: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.surfaceSecondary,
    borderRadius: 8,
    padding: 12,
    color: colors.textPrimary,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  colorPicker: {
    marginBottom: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: colors.primary,
    borderWidth: 3,
  },
  selectedColorText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  categoryPicker: {
    flexDirection: 'row',
  },
  categoryOption: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.surfaceSecondary,
  },
  selectedCategory: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  selectedCategoryText: {
    color: colors.background,
  },
  aiStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    marginBottom: 16,
  },
  aiStatusText: {
    color: colors.textSecondary,
    marginLeft: 8,
    fontSize: 14,
  },
  aiInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    marginTop: 8,
  },
  aiInfoText: {
    color: colors.textSecondary,
    marginLeft: 8,
    fontSize: 12,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSecondary,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    marginLeft: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  // Week 5 Vehicle Search Styles
  searchInputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.surfaceSecondary,
    borderRadius: 8,
    padding: 12,
    color: colors.textPrimary,
    fontSize: 16,
    paddingRight: 40,
  },
  searchSpinner: {
    position: 'absolute',
    right: 12,
  },
  searchResults: {
    maxHeight: 300,
    marginTop: 8,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.surfaceSecondary,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  searchResultSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  searchResultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  popularityBar: {
    width: 80,
    height: 4,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 2,
    marginRight: 8,
    overflow: 'hidden',
  },
  popularityFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  popularityText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  noResults: {
    alignItems: 'center',
    padding: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 8,
  },
  // Week 5 Vehicle Details Styles
  vehicleHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  vehicleTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  vehicleTrim: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  pricingSection: {
    marginBottom: 20,
  },
  pricingGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  priceLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  enhancedSection: {
    marginBottom: 20,
  },
  analysisGrid: {
    gap: 12,
  },
  analysisItem: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 8,
  },
  analysisLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  ratingBar: {
    width: '100%',
    height: 6,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  ratingFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  ratingText: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'right',
  },
});