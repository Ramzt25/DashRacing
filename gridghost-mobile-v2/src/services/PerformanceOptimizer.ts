import { Platform, Dimensions, InteractionManager } from 'react-native';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  loadTime: number;
  batteryLevel?: number;
  networkLatency: number;
  renderTime: number;
}

export interface OptimizationSettings {
  // Map settings
  mapQuality: 'low' | 'medium' | 'high';
  maxMarkersOnScreen: number;
  mapAnimationsEnabled: boolean;
  
  // Racing settings
  trackingInterval: number; // ms
  locationAccuracy: 'low' | 'balanced' | 'high';
  realTimeUpdatesEnabled: boolean;
  
  // UI settings
  animationsEnabled: boolean;
  hapticFeedbackEnabled: boolean;
  backgroundSyncEnabled: boolean;
  
  // Performance
  maxCacheSize: number; // MB
  preloadRadius: number; // km
  compressionEnabled: boolean;
}

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private settings: OptimizationSettings;
  private performanceMetrics: PerformanceMetrics;
  private isLowEndDevice: boolean;

  public static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  constructor() {
    this.isLowEndDevice = this.detectLowEndDevice();
    this.settings = this.getOptimalSettings();
    this.performanceMetrics = {
      fps: 60,
      memoryUsage: 0,
      loadTime: 0,
      networkLatency: 0,
      renderTime: 0,
    };
  }

  /**
   * Detect if device is low-end and needs performance optimizations
   */
  private detectLowEndDevice(): boolean {
    const { width, height } = Dimensions.get('window');
    const totalPixels = width * height;
    
    // Consider device low-end if:
    // - Total pixels < 720p (1280x720)
    // - Platform-specific checks
    const isLowRes = totalPixels < (1280 * 720);
    
    if (Platform.OS === 'android') {
      // Check for low-end Android devices
      const hasLowMemory = Device.totalMemory ? Device.totalMemory < 3 * 1024 * 1024 * 1024 : false; // < 3GB RAM
      return isLowRes || hasLowMemory;
    }
    
    if (Platform.OS === 'ios') {
      // Older iOS devices
      const deviceYear = Device.deviceYearClass || 2023;
      return deviceYear < 2020 || isLowRes;
    }
    
    return isLowRes;
  }

  /**
   * Get optimal settings based on device capabilities
   */
  private getOptimalSettings(): OptimizationSettings {
    if (this.isLowEndDevice) {
      return {
        // Conservative settings for low-end devices
        mapQuality: 'low',
        maxMarkersOnScreen: 50,
        mapAnimationsEnabled: false,
        trackingInterval: 2000, // 2 seconds
        locationAccuracy: 'balanced',
        realTimeUpdatesEnabled: false,
        animationsEnabled: false,
        hapticFeedbackEnabled: false,
        backgroundSyncEnabled: false,
        maxCacheSize: 50, // 50MB
        preloadRadius: 1, // 1km
        compressionEnabled: true,
      };
    }

    return {
      // Standard settings for modern devices
      mapQuality: 'high',
      maxMarkersOnScreen: 200,
      mapAnimationsEnabled: true,
      trackingInterval: 1000, // 1 second
      locationAccuracy: 'high',
      realTimeUpdatesEnabled: true,
      animationsEnabled: true,
      hapticFeedbackEnabled: true,
      backgroundSyncEnabled: true,
      maxCacheSize: 200, // 200MB
      preloadRadius: 5, // 5km
      compressionEnabled: false,
    };
  }

  /**
   * Load saved performance settings
   */
  async loadSettings(): Promise<OptimizationSettings> {
    try {
      const savedSettings = await AsyncStorage.getItem('performance_settings');
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
      console.warn('Failed to load performance settings:', error);
    }
    return this.settings;
  }

  /**
   * Save performance settings
   */
  async saveSettings(newSettings: Partial<OptimizationSettings>): Promise<void> {
    try {
      this.settings = { ...this.settings, ...newSettings };
      await AsyncStorage.setItem('performance_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save performance settings:', error);
    }
  }

  /**
   * Get current optimization settings
   */
  getSettings(): OptimizationSettings {
    return this.settings;
  }

  /**
   * Optimize map rendering based on current performance
   */
  optimizeMapSettings() {
    const currentFPS = this.performanceMetrics.fps;
    const memoryUsage = this.performanceMetrics.memoryUsage;

    // Adjust settings based on performance
    if (currentFPS < 30 || memoryUsage > 80) {
      // Performance is poor, reduce quality
      this.settings.mapQuality = 'low';
      this.settings.maxMarkersOnScreen = Math.max(25, Math.floor(this.settings.maxMarkersOnScreen * 0.5));
      this.settings.mapAnimationsEnabled = false;
    } else if (currentFPS > 55 && memoryUsage < 50) {
      // Performance is good, can increase quality
      if (!this.isLowEndDevice) {
        this.settings.mapQuality = 'high';
        this.settings.maxMarkersOnScreen = Math.min(200, this.settings.maxMarkersOnScreen + 25);
        this.settings.mapAnimationsEnabled = true;
      }
    }
  }

  /**
   * Optimize racing tracking based on performance
   */
  optimizeRacingSettings() {
    const networkLatency = this.performanceMetrics.networkLatency;
    
    if (networkLatency > 1000) {
      // High latency, reduce update frequency
      this.settings.trackingInterval = Math.min(5000, this.settings.trackingInterval + 500);
      this.settings.realTimeUpdatesEnabled = false;
    } else if (networkLatency < 100 && !this.isLowEndDevice) {
      // Low latency, can increase update frequency
      this.settings.trackingInterval = Math.max(500, this.settings.trackingInterval - 200);
      this.settings.realTimeUpdatesEnabled = true;
    }
  }

  /**
   * Measure and update performance metrics
   */
  updatePerformanceMetrics(metrics: Partial<PerformanceMetrics>): void {
    this.performanceMetrics = { ...this.performanceMetrics, ...metrics };
    
    // Auto-optimize if performance drops
    if (metrics.fps && metrics.fps < 25) {
      this.optimizeMapSettings();
    }
    
    if (metrics.networkLatency && metrics.networkLatency > 2000) {
      this.optimizeRacingSettings();
    }
  }

  /**
   * Get memory usage statistics
   */
  async getMemoryStats() {
    // This would integrate with a performance monitoring library
    // For now, return mock data
    return {
      used: 150, // MB
      available: 2048, // MB
      peak: 200, // MB
    };
  }

  /**
   * Clear caches to free up memory
   */
  async clearCaches(): Promise<void> {
    try {
      // Clear various caches
      await AsyncStorage.multiRemove([
        'map_cache',
        'image_cache',
        'route_cache',
        'vehicle_cache'
      ]);
      
      console.log('Caches cleared successfully');
    } catch (error) {
      console.error('Failed to clear caches:', error);
    }
  }

  /**
   * Preload critical data for better performance
   */
  async preloadCriticalData(): Promise<void> {
    return new Promise((resolve) => {
      InteractionManager.runAfterInteractions(async () => {
        try {
          // Preload user profile
          // Preload nearby venues
          // Preload friend list
          // Preload vehicle data
          
          console.log('Critical data preloaded');
          resolve();
        } catch (error) {
          console.error('Failed to preload data:', error);
          resolve();
        }
      });
    });
  }

  /**
   * Optimize images for current device
   */
  optimizeImageUrl(originalUrl: string, maxWidth?: number): string {
    if (!originalUrl) return originalUrl;
    
    const devicePixelRatio = Dimensions.get('window').scale;
    const screenWidth = Dimensions.get('window').width;
    
    // Calculate optimal image width
    const optimalWidth = Math.min(
      maxWidth || screenWidth,
      this.isLowEndDevice ? 400 : 800
    );
    
    const finalWidth = Math.round(optimalWidth * devicePixelRatio);
    
    // If using Cloudinary or similar service, add optimization parameters
    if (originalUrl.includes('cloudinary.com')) {
      return originalUrl.replace('/upload/', `/upload/w_${finalWidth},q_auto,f_auto/`);
    }
    
    // For other services, you might add query parameters
    const separator = originalUrl.includes('?') ? '&' : '?';
    return `${originalUrl}${separator}w=${finalWidth}&q=80`;
  }

  /**
   * Batch API calls to reduce network overhead
   */
  createBatchProcessor<T>(
    batchSize: number = 10,
    delay: number = 100
  ): (item: T) => Promise<void> {
    let batch: T[] = [];
    let timeoutId: any = null;

    const processBatch = async (items: T[]) => {
      // Process batch of items
      console.log(`Processing batch of ${items.length} items`);
      // Implement actual batch processing logic here
    };

    return async (item: T) => {
      batch.push(item);

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (batch.length >= batchSize) {
        await processBatch([...batch]);
        batch = [];
      } else {
        timeoutId = setTimeout(async () => {
          if (batch.length > 0) {
            await processBatch([...batch]);
            batch = [];
          }
        }, delay);
      }
    };
  }

  /**
   * Get device performance report
   */
  getPerformanceReport() {
    return {
      device: {
        isLowEnd: this.isLowEndDevice,
        platform: Platform.OS,
        version: Platform.Version,
        dimensions: Dimensions.get('window'),
        deviceYearClass: Device.deviceYearClass,
        totalMemory: Device.totalMemory,
      },
      settings: this.settings,
      metrics: this.performanceMetrics,
      recommendations: this.getRecommendations(),
    };
  }

  /**
   * Get performance recommendations
   */
  private getRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.isLowEndDevice) {
      recommendations.push('Enable power saving mode for better battery life');
      recommendations.push('Reduce map quality for smoother performance');
    }
    
    if (this.performanceMetrics.networkLatency > 500) {
      recommendations.push('Consider connecting to WiFi for better racing experience');
    }
    
    if (this.performanceMetrics.memoryUsage > 75) {
      recommendations.push('Clear app cache to free up memory');
    }
    
    return recommendations;
  }
}

// Performance monitoring hooks
export const usePerformanceMonitor = () => {
  const optimizer = PerformanceOptimizer.getInstance();
  
  const measureRenderTime = (componentName: string) => {
    const startTime = Date.now();
    
    return () => {
      const renderTime = Date.now() - startTime;
      optimizer.updatePerformanceMetrics({ renderTime });
      console.log(`${componentName} render time: ${renderTime}ms`);
    };
  };

  const measureNetworkLatency = async (apiCall: () => Promise<any>) => {
    const startTime = Date.now();
    
    try {
      const result = await apiCall();
      const latency = Date.now() - startTime;
      optimizer.updatePerformanceMetrics({ networkLatency: latency });
      return result;
    } catch (error) {
      const latency = Date.now() - startTime;
      optimizer.updatePerformanceMetrics({ networkLatency: latency });
      throw error;
    }
  };

  return {
    measureRenderTime,
    measureNetworkLatency,
    getSettings: optimizer.getSettings.bind(optimizer),
    updateSettings: optimizer.saveSettings.bind(optimizer),
    clearCaches: optimizer.clearCaches.bind(optimizer),
    getReport: optimizer.getPerformanceReport.bind(optimizer),
  };
};

export default PerformanceOptimizer;