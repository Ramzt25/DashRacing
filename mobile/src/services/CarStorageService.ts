import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from './ApiService';
import { Car, CarMod, CarSpecs } from '../types/car';
import { CarInfoService, COMMON_CAR_COLORS } from './CarInfoService';

export class CarStorageService {
  private static readonly CARS_STORAGE_KEY = 'user_cars';
  private static readonly LAST_SYNC_KEY = 'cars_last_sync';

  // Get all user cars (with offline fallback)
  static async getUserCars(userId: string): Promise<Car[]> {
    try {
      // Try to get from API first
      const response = await ApiService.getVehicles() as { vehicles?: any[] };
      const apiCars = this.transformApiCarsToLocalFormat(response.vehicles || []);
      
      // Save to local storage for offline access
      await this.saveToLocal(apiCars);
      await AsyncStorage.setItem(this.LAST_SYNC_KEY, new Date().toISOString());
      
      return apiCars;
    } catch (error) {
      console.error('Failed to fetch cars from API, using local storage:', error);
      // Fallback to local storage
      return await this.getFromLocal();
    }
  }

  // Save car to database and local storage
  static async saveCar(car: Car, userId: string): Promise<boolean> {
    try {
      // Always save to local storage first
      const localCars = await this.getFromLocal();
      const carIndex = localCars.findIndex(c => c.id === car.id);
      
      if (carIndex >= 0) {
        localCars[carIndex] = car;
      } else {
        localCars.push(car);
      }
      await this.saveToLocal(localCars);
      console.log('CAR_SAVE_SUCCESS Car saved to local storage successfully');
      
      try {
        // Transform to API format and try to sync
        const apiCarData = this.transformCarToApiFormat(car, userId);
        
        if (car.id.startsWith('temp_')) {
          // New car - create in API
          const response = await ApiService.createVehicle(apiCarData) as { vehicle: { id: string } };
          
          // Update the car with the real ID
          const updatedCar = { ...car, id: response.vehicle.id };
          const updatedLocalCars = localCars.map(c => c.id === car.id ? updatedCar : c);
          await this.saveToLocal(updatedLocalCars);
          
          console.log('CAR_SYNC_SUCCESS Car synced to API with ID:', response.vehicle.id);
        } else {
          // Existing car - update in API
          await ApiService.updateVehicle(car.id, apiCarData);
          console.log('CAR_UPDATE_SUCCESS Car updated in API');
        }
      } catch (apiError) {
        console.warn(' API sync failed, but car saved locally:', apiError);
        // Don't return false - local save was successful
      }
      
      return true;
    } catch (error) {
      console.error('CAR_SAVE_ERROR Failed to save car locally:', error);
      return false;
    }
  }

  // Delete car from database and local storage
  static async deleteCar(carId: string): Promise<boolean> {
    try {
      // Delete from API if not a temp ID
      if (!carId.startsWith('temp_')) {
        await ApiService.deleteVehicle(carId);
      }
      
      // Remove from local storage
      const localCars = await this.getFromLocal();
      const filteredCars = localCars.filter(c => c.id !== carId);
      await this.saveToLocal(filteredCars);
      
      return true;
    } catch (error) {
      console.error('Failed to delete car:', error);
      return false;
    }
  }

  // Add modification to car
  static async addModification(carId: string, mod: CarMod, userId: string): Promise<boolean> {
    try {
      // Get current car
      const cars = await this.getFromLocal();
      const car = cars.find(c => c.id === carId);
      if (!car) throw new Error('Car not found');

      // Add mod to car
      car.mods.push(mod);
      
      // Recalculate performance with AI estimation
      await this.recalculateCarPerformance(car);
      
      // Save car
      return await this.saveCar(car, userId);
    } catch (error) {
      console.error('Failed to add modification:', error);
      return false;
    }
  }

  // Generate car image (AI-powered)
  static async generateCarImage(car: Car): Promise<string> {
    try {
      const result = await CarInfoService.generateCarImage(
        car.make,
        car.model,
        car.year,
        car.color
      );
      return result.imageUrl;
    } catch (error) {
      console.error('Failed to generate car image:', error);
      return `https://via.placeholder.com/400x300/333333/FFFFFF?text=${car.make}+${car.model}`;
    }
  }

  // Check if user can add more cars (Free vs Pro limits)
  static async canAddCar(userId: string, isPro: boolean): Promise<{ canAdd: boolean; reason?: string }> {
    const cars = await this.getUserCars(userId);
    const ownedCars = cars.filter(c => c.owned);
    
    if (!isPro && ownedCars.length >= 1) {
      return {
        canAdd: false,
        reason: 'Free users can only have 1 car. Upgrade to Pro for unlimited cars!'
      };
    }
    
    return { canAdd: true };
  }

  // Check if user can add mods (Free vs Pro features)
  static canAddMods(isPro: boolean): { canAdd: boolean; reason?: string } {
    if (!isPro) {
      return {
        canAdd: false,
        reason: 'Modifications are a Pro feature. Upgrade to Pro to add mods and boost your car\'s performance!'
      };
    }
    
    return { canAdd: true };
  }

  // Create new car with AI-assisted specs and image
  static async createNewCar(carData: {
    name: string;
    make: string;
    model: string;
    year: number;
    trim?: string;
    color: string;
    class: Car['class'];
  }, userId: string): Promise<Car> {
    // Get AI-powered specs
    const specs = await CarInfoService.lookupCarSpecs({
      make: carData.make,
      model: carData.model,
      year: carData.year,
      trim: carData.trim
    });

    if (!specs) {
      throw new Error('Unable to lookup car specifications');
    }

    // Generate AI image
    const imageUrl = await this.generateCarImage({
      ...carData,
      make: carData.make,
      model: carData.model,
      year: carData.year,
      color: carData.color
    } as Car);

    const newCar: Car = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: carData.name,
      make: carData.make,
      model: carData.model,
      year: carData.year,
      trim: carData.trim,
      color: carData.color,
      class: carData.class,
      owned: true,
      baseSpecs: specs,
      currentSpecs: { ...specs }, // Start with base specs
      mods: [],
      images: [imageUrl],
      primaryImageIndex: 0,
      hasAIGeneratedImage: true,
      dateAdded: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    return newCar;
  }

  // Private helper methods
  private static async getFromLocal(): Promise<Car[]> {
    try {
      const data = await AsyncStorage.getItem(this.CARS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get cars from local storage:', error);
      return [];
    }
  }

  private static async saveToLocal(cars: Car[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.CARS_STORAGE_KEY, JSON.stringify(cars));
    } catch (error) {
      console.error('Failed to save cars to local storage:', error);
    }
  }

  private static transformApiCarsToLocalFormat(apiCars: any[]): Car[] {
    return apiCars.map(apiCar => ({
      id: apiCar.id,
      name: apiCar.name || `${apiCar.make} ${apiCar.model}`,
      make: apiCar.make || 'Unknown',
      model: apiCar.model || 'Unknown',
      year: apiCar.year || 2023,
      trim: apiCar.trim,
      color: apiCar.color || 'Black',
      class: apiCar.class || 'Sports',
      owned: true,
      baseSpecs: apiCar.baseSpecs || {
        hp: apiCar.whp || 200,
        torque: 180,
        topSpeed: 140,
        acceleration: 6.5,
        weight: apiCar.weightKg ? apiCar.weightKg * 2.205 : 3200,
        engineType: 'V6',
        transmission: 'Automatic',
        drivetrain: apiCar.drivetrain || 'RWD',
        fuelType: 'Gasoline'
      },
      currentSpecs: apiCar.currentSpecs || apiCar.baseSpecs || {
        hp: apiCar.whp || 200,
        torque: 180,
        topSpeed: 140,
        acceleration: 6.5,
        weight: apiCar.weightKg ? apiCar.weightKg * 2.205 : 3200,
        engineType: 'V6',
        transmission: 'Automatic',
        drivetrain: apiCar.drivetrain || 'RWD',
        fuelType: 'Gasoline'
      },
      mods: (apiCar.mods || []).map((mod: any) => ({
        id: mod.id,
        name: mod.name,
        category: mod.category || 'Other',
        description: mod.notes || '',
        hpGain: mod.hpGain || 0,
        torqueGain: mod.torqueGain || 0,
        weightChange: mod.weightChange || 0,
        brand: mod.brand,
        dateAdded: new Date().toISOString()
      })),
      images: apiCar.images || [],
      primaryImageIndex: 0,
      hasAIGeneratedImage: apiCar.hasAIGeneratedImage || false,
      dateAdded: apiCar.createdAt || new Date().toISOString(),
      lastModified: new Date().toISOString()
    }));
  }

  private static transformCarToApiFormat(car: Car, userId: string): any {
    return {
      userId,
      name: car.name,
      make: car.make,
      model: car.model,
      year: car.year,
      trim: car.trim,
      color: car.color,
      class: car.class,
      whp: car.currentSpecs.hp,
      weightKg: car.currentSpecs.weight / 2.205, // Convert lbs to kg
      drivetrain: car.currentSpecs.drivetrain,
      baseSpecs: car.baseSpecs,
      currentSpecs: car.currentSpecs,
      images: car.images,
      hasAIGeneratedImage: car.hasAIGeneratedImage,
      modifications: car.mods.map(mod => ({
        id: mod.id,
        category: mod.category,
        name: mod.name,
        brand: mod.brand,
        notes: mod.description,
        hpGain: mod.hpGain,
        torqueGain: mod.torqueGain,
        weightChange: mod.weightChange
      }))
    };
  }

  // Recalculate car performance based on mods
  private static async recalculateCarPerformance(car: Car): Promise<void> {
    let totalHpGain = 0;
    let totalTorqueGain = 0;
    let totalWeightChange = 0;

    // Sum up all mod effects
    for (const mod of car.mods) {
      totalHpGain += mod.hpGain;
      totalTorqueGain += mod.torqueGain;
      totalWeightChange += mod.weightChange;
    }

    // Apply changes to current specs
    car.currentSpecs = {
      ...car.baseSpecs,
      hp: Math.max(100, car.baseSpecs.hp + totalHpGain),
      torque: Math.max(80, car.baseSpecs.torque + totalTorqueGain),
      weight: Math.max(2000, car.baseSpecs.weight + totalWeightChange),
      // Recalculate acceleration based on power-to-weight ratio
      acceleration: Math.max(2.0, car.baseSpecs.acceleration * (car.baseSpecs.weight / (car.baseSpecs.weight + totalWeightChange)) * (car.baseSpecs.hp / (car.baseSpecs.hp + totalHpGain))),
      // Recalculate top speed based on power
      topSpeed: Math.round(car.baseSpecs.topSpeed * Math.pow((car.baseSpecs.hp + totalHpGain) / car.baseSpecs.hp, 0.33))
    };

    car.lastModified = new Date().toISOString();
  }
}
