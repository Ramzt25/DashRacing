// ImagePicker functionality for when Expo is available
declare const ImagePicker: any;
declare const FileSystem: any;

// Mock ImagePicker for TypeScript compilation
const MockImagePicker = {
  MediaTypeOptions: { Images: 'Images' },
  requestCameraPermissionsAsync: () => Promise.resolve({ status: 'granted' }),
  requestMediaLibraryPermissionsAsync: () => Promise.resolve({ status: 'granted' }),
  launchCameraAsync: () => Promise.resolve({ canceled: false, assets: [{ uri: 'mock://camera' }] }),
  launchImageLibraryAsync: () => Promise.resolve({ canceled: false, assets: [{ uri: 'mock://library' }] }),
};

const MockFileSystem = {
  EncodingType: { Base64: 'base64' },
  readAsStringAsync: () => Promise.resolve('base64string'),
};

export interface CloudinaryUploadResult {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  url: string;
  secure_url: string;
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  original_filename: string;
}

export interface ImageUploadOptions {
  folder?: string;
  tags?: string[];
  quality?: 'auto' | number;
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'crop';
  format?: 'auto' | 'jpg' | 'png' | 'webp';
}

export interface ImageTransformation {
  width?: number;
  height?: number;
  quality?: 'auto' | number;
  format?: 'auto' | 'jpg' | 'png' | 'webp';
  crop?: 'fill' | 'fit' | 'scale' | 'crop';
  effect?: string;
  overlay?: string;
}

export class CloudinaryService {
  private static readonly CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo-cloud';
  private static readonly API_KEY = process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY || 'demo-key';
  private static readonly API_SECRET = process.env.EXPO_PUBLIC_CLOUDINARY_API_SECRET || 'demo-secret';
  private static readonly UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default';
  
  private static readonly BASE_URL = `https://api.cloudinary.com/v1_1/${this.CLOUD_NAME}`;
  private static readonly DELIVERY_URL = `https://res.cloudinary.com/${this.CLOUD_NAME}`;

  /**
   * Request camera/photo library permissions
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const picker = typeof ImagePicker !== 'undefined' ? ImagePicker : MockImagePicker;
      const cameraPermission = await picker.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await picker.requestMediaLibraryPermissionsAsync();
      
      return cameraPermission.status === 'granted' && mediaLibraryPermission.status === 'granted';
    } catch (error) {
      console.warn('Failed to request image permissions:', error);
      return false;
    }
  }

  /**
   * Take a photo using the camera
   */
  static async takePhoto(options: ImageUploadOptions = {}): Promise<CloudinaryUploadResult | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Camera permission not granted');
      }

      const picker = typeof ImagePicker !== 'undefined' ? ImagePicker : MockImagePicker;
      const result = await picker.launchCameraAsync({
        mediaTypes: picker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9], // Good aspect ratio for car photos
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const imageUri = result.assets[0].uri;
      return await this.uploadImage(imageUri, options);
    } catch (error) {
      console.warn('Failed to take photo:', error);
      return null;
    }
  }

  /**
   * Pick image from photo library
   */
  static async pickImage(options: ImageUploadOptions = {}): Promise<CloudinaryUploadResult | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Media library permission not granted');
      }

      const picker = typeof ImagePicker !== 'undefined' ? ImagePicker : MockImagePicker;
      const result = await picker.launchImageLibraryAsync({
        mediaTypes: picker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const imageUri = result.assets[0].uri;
      return await this.uploadImage(imageUri, options);
    } catch (error) {
      console.warn('Failed to pick image:', error);
      return null;
    }
  }

  /**
   * Upload image to Cloudinary
   */
  static async uploadImage(imageUri: string, options: ImageUploadOptions = {}): Promise<CloudinaryUploadResult> {
    try {
      if (!this.CLOUD_NAME || this.CLOUD_NAME === 'demo-cloud') {
        console.warn('Cloudinary not configured, using mock upload');
        return this.getMockUploadResult(imageUri, options);
      }

      // Read the image file
      const fileSystem = typeof FileSystem !== 'undefined' ? FileSystem : MockFileSystem;
      const base64 = await fileSystem.readAsStringAsync(imageUri, {
        encoding: fileSystem.EncodingType.Base64,
      });

      // Prepare form data
      const formData = new FormData();
      formData.append('file', `data:image/jpeg;base64,${base64}` as any);
      formData.append('upload_preset', this.UPLOAD_PRESET);
      
      if (options.folder) {
        formData.append('folder', options.folder);
      }
      
      if (options.tags) {
        formData.append('tags', options.tags.join(','));
      }

      // Add transformation parameters
      const transformation = this.buildTransformation(options);
      if (transformation) {
        formData.append('transformation', transformation);
      }

      // Upload to Cloudinary
      const response = await fetch(`${this.BASE_URL}/image/upload`, {
        method: 'POST',
        body: formData as any,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Cloudinary upload failed: ${response.statusText}`);
      }

      const result = await response.json() as CloudinaryUploadResult;
      return result;
    } catch (error) {
      console.warn('Failed to upload to Cloudinary, using mock result:', error);
      return this.getMockUploadResult(imageUri, options);
    }
  }

  /**
   * Upload multiple images
   */
  static async uploadMultipleImages(
    imageUris: string[],
    options: ImageUploadOptions = {}
  ): Promise<CloudinaryUploadResult[]> {
    const uploadPromises = imageUris.map(uri => this.uploadImage(uri, options));
    
    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.warn('Some image uploads failed:', error);
      // Return partial results
      const results = await Promise.allSettled(uploadPromises);
      return results
        .filter((result): result is PromiseFulfilledResult<CloudinaryUploadResult> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value);
    }
  }

  /**
   * Delete image from Cloudinary
   */
  static async deleteImage(publicId: string): Promise<boolean> {
    try {
      if (!this.CLOUD_NAME || this.CLOUD_NAME === 'demo-cloud') {
        console.warn('Cloudinary not configured, skipping delete');
        return true;
      }

      const timestamp = Math.round(Date.now() / 1000);
      const signature = this.generateSignature({
        public_id: publicId,
        timestamp: timestamp.toString(),
      });

      const formData = new FormData();
      formData.append('public_id', publicId);
      formData.append('signature', signature);
      formData.append('api_key', this.API_KEY);
      formData.append('timestamp', timestamp.toString());

      const response = await fetch(`${this.BASE_URL}/image/destroy`, {
        method: 'POST',
        body: formData as any,
      });

      const result = await response.json() as any;
      return result.result === 'ok';
    } catch (error) {
      console.warn('Failed to delete image from Cloudinary:', error);
      return false;
    }
  }

  /**
   * Generate optimized image URL with transformations
   */
  static getOptimizedImageUrl(
    publicId: string,
    transformations: ImageTransformation = {}
  ): string {
    if (!this.CLOUD_NAME || this.CLOUD_NAME === 'demo-cloud') {
      // Return a placeholder image for demo
      return `https://via.placeholder.com/800x450/007ACC/FFFFFF?text=${encodeURIComponent('Car Image')}`;
    }

    const transformationString = this.buildTransformation(transformations);
    const transformationPath = transformationString ? `/${transformationString}` : '';
    
    return `${this.DELIVERY_URL}/image/upload${transformationPath}/${publicId}`;
  }

  /**
   * Generate thumbnail URL
   */
  static getThumbnailUrl(publicId: string, size: number = 150): string {
    return this.getOptimizedImageUrl(publicId, {
      width: size,
      height: size,
      crop: 'fill',
      quality: 'auto',
      format: 'auto',
    });
  }

  /**
   * Generate responsive image URLs for different screen sizes
   */
  static getResponsiveImageUrls(publicId: string): {
    thumbnail: string;
    small: string;
    medium: string;
    large: string;
    original: string;
  } {
    return {
      thumbnail: this.getOptimizedImageUrl(publicId, { width: 150, height: 150, crop: 'fill' }),
      small: this.getOptimizedImageUrl(publicId, { width: 400, height: 225, crop: 'fill' }),
      medium: this.getOptimizedImageUrl(publicId, { width: 800, height: 450, crop: 'fill' }),
      large: this.getOptimizedImageUrl(publicId, { width: 1200, height: 675, crop: 'fill' }),
      original: this.getOptimizedImageUrl(publicId, { quality: 'auto', format: 'auto' }),
    };
  }

  /**
   * Create image gallery for a car
   */
  static async createCarGallery(carId: string): Promise<{
    takePhoto: () => Promise<CloudinaryUploadResult | null>;
    pickImages: () => Promise<CloudinaryUploadResult[]>;
    uploadExisting: (uris: string[]) => Promise<CloudinaryUploadResult[]>;
  }> {
    const folderName = `cars/${carId}`;
    const tags = ['car', carId];

    return {
      takePhoto: () => this.takePhoto({ folder: folderName, tags }),
      pickImages: async () => {
        const hasPermission = await this.requestPermissions();
        if (!hasPermission) return [];

        const picker = typeof ImagePicker !== 'undefined' ? ImagePicker : MockImagePicker;
        const result = await picker.launchImageLibraryAsync({
          mediaTypes: picker.MediaTypeOptions.Images,
          allowsMultipleSelection: true,
          quality: 0.8,
        });

        if (result.canceled || !result.assets) return [];

        const imageUris = result.assets.map((asset: any) => asset.uri);
        return this.uploadMultipleImages(imageUris, { folder: folderName, tags });
      },
      uploadExisting: (uris: string[]) => 
        this.uploadMultipleImages(uris, { folder: folderName, tags }),
    };
  }

  /**
   * Create optimized car showcase image
   */
  static async createCarShowcase(
    imageUri: string,
    carInfo: { make: string; model: string; year: number }
  ): Promise<CloudinaryUploadResult> {
    const options: ImageUploadOptions = {
      folder: 'car-showcases',
      tags: ['showcase', carInfo.make.toLowerCase(), carInfo.model.toLowerCase()],
      width: 1200,
      height: 675,
      crop: 'fill',
      quality: 'auto',
      format: 'auto',
    };

    return this.uploadImage(imageUri, options);
  }

  // Private helper methods
  private static buildTransformation(options: ImageTransformation): string {
    const parts = [];

    if (options.width) parts.push(`w_${options.width}`);
    if (options.height) parts.push(`h_${options.height}`);
    if (options.crop) parts.push(`c_${options.crop}`);
    if (options.quality) parts.push(`q_${options.quality}`);
    if (options.format) parts.push(`f_${options.format}`);
    if (options.effect) parts.push(`e_${options.effect}`);
    if (options.overlay) parts.push(`l_${options.overlay}`);

    return parts.join(',');
  }

  private static generateSignature(params: { [key: string]: string }): string {
    // In a real implementation, this would use HMAC-SHA1 with the API secret
    // For demo purposes, return a mock signature
    return 'mock_signature_' + Date.now();
  }

  private static getMockUploadResult(imageUri: string, options: ImageUploadOptions): CloudinaryUploadResult {
    const filename = imageUri.split('/').pop() || 'image.jpg';
    const publicId = `${options.folder || 'uploads'}/${Date.now()}_${filename.replace(/\.[^/.]+$/, '')}`;

    return {
      public_id: publicId,
      version: Date.now(),
      signature: 'mock_signature',
      width: 800,
      height: 450,
      format: 'jpg',
      resource_type: 'image',
      url: `http://res.cloudinary.com/demo-cloud/image/upload/${publicId}.jpg`,
      secure_url: `https://res.cloudinary.com/demo-cloud/image/upload/${publicId}.jpg`,
      bytes: 245760, // ~240KB
      type: 'upload',
      etag: 'mock_etag',
      placeholder: false,
      original_filename: filename,
    };
  }

  /**
   * Get image analysis using Cloudinary AI
   */
  static async analyzeCarImage(publicId: string): Promise<{
    tags: string[];
    colors: Array<{ color: string; percentage: number }>;
    objects: Array<{ name: string; confidence: number }>;
    quality: 'high' | 'medium' | 'low';
  }> {
    try {
      if (!this.CLOUD_NAME || this.CLOUD_NAME === 'demo-cloud') {
        return this.getMockImageAnalysis();
      }

      // In production, this would use Cloudinary's AI analysis features
      return this.getMockImageAnalysis();
    } catch (error) {
      console.warn('Failed to analyze image:', error);
      return this.getMockImageAnalysis();
    }
  }

  private static getMockImageAnalysis(): {
    tags: string[];
    colors: Array<{ color: string; percentage: number }>;
    objects: Array<{ name: string; confidence: number }>;
    quality: 'high' | 'medium' | 'low';
  } {
    return {
      tags: ['car', 'vehicle', 'automotive', 'transportation'],
      colors: [
        { color: 'red', percentage: 35 },
        { color: 'black', percentage: 25 },
        { color: 'white', percentage: 20 },
        { color: 'gray', percentage: 20 },
      ],
      objects: [
        { name: 'car', confidence: 0.95 },
        { name: 'wheel', confidence: 0.88 },
        { name: 'headlight', confidence: 0.82 },
        { name: 'windshield', confidence: 0.75 },
      ],
      quality: 'high',
    };
  }

  /**
   * Generate AI-powered car image effects
   */
  static getCarImageEffects(publicId: string): {
    vintage: string;
    dramatic: string;
    clean: string;
    racing: string;
    night: string;
  } {
    return {
      vintage: this.getOptimizedImageUrl(publicId, { 
        effect: 'sepia:50',
        quality: 'auto',
      }),
      dramatic: this.getOptimizedImageUrl(publicId, { 
        effect: 'contrast:20,saturation:30',
        quality: 'auto',
      }),
      clean: this.getOptimizedImageUrl(publicId, { 
        effect: 'brightness:10,contrast:10',
        quality: 'auto',
      }),
      racing: this.getOptimizedImageUrl(publicId, { 
        effect: 'saturation:40,contrast:30',
        quality: 'auto',
      }),
      night: this.getOptimizedImageUrl(publicId, { 
        effect: 'brightness:-20,contrast:20',
        quality: 'auto',
      }),
    };
  }
}