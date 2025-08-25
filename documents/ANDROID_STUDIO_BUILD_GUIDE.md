# 🤖 GridGhost Android Studio Build Guide

## 🎯 **Multiple Build Options Available**

### **Option 1: EAS Cloud Build (Easiest) ✅ STARTED**
Your build is currently in progress at: https://expo.dev/accounts/ramzt25/projects/gridghost/builds/

**Status**: Building APK in the cloud (ETA: ~100 minutes)
**Output**: Downloadable APK file
**Pros**: No local setup required, handles signing automatically

### **Option 2: Android Studio Local Development**

#### **1. Prerequisites Setup**
```bash
# Install Android Studio from:
# https://developer.android.com/studio

# Install Java 17 (required for React Native 0.79+)
# Download from: https://adoptium.net/

# Set JAVA_HOME environment variable
# Add to your system PATH
```

#### **2. Open Project in Android Studio**
```bash
# Navigate to the generated android folder
cd c:\DashRacing\gridghost-mobile-v2

# Open Android Studio -> Open -> Select: 
# C:\DashRacing\gridghost-mobile-v2\android
```

#### **3. Configure Android Studio**
1. **Wait for Gradle Sync** to complete (first time takes 10-15 minutes)
2. **Install Android SDK 34** if prompted
3. **Accept all licenses** when prompted
4. **Set up emulator** or connect physical device

#### **4. Build and Run**
```bash
# Option A: Use Android Studio UI
# Click the green "Run" button (or press Shift+F10)

# Option B: Use Expo CLI
npx expo run:android

# Option C: Use React Native CLI
npx react-native run-android
```

### **Option 3: Manual APK Build**

#### **Generate Debug APK**
```bash
cd c:\DashRacing\gridghost-mobile-v2\android

# Build debug APK
.\gradlew assembleDebug

# APK location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

#### **Generate Release APK**
```bash
# Build release APK (requires signing)
.\gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

## 📱 **Device Setup**

### **Physical Device (Recommended)**
1. **Enable Developer Options**:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings > Developer Options

2. **Enable USB Debugging**:
   - In Developer Options, enable "USB Debugging"
   - Connect device via USB
   - Accept debugging prompt on device

3. **Verify Device Connection**:
   ```bash
   adb devices
   # Should show your device
   ```

### **Android Emulator**
1. **Create Virtual Device** in Android Studio:
   - Tools > AVD Manager
   - Create Virtual Device
   - Choose Pixel 7 Pro (recommended)
   - Download Android 14 (API 34) system image
   - Start emulator

## 🔧 **Configuration Files**

### **Android Manifest Permissions** (Already Configured)
```xml
<!-- Location permissions for GPS racing -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<!-- Camera for photo features -->
<uses-permission android:name="android.permission.CAMERA" />

<!-- Storage for vehicle photos -->
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

### **Google Maps Configuration** (Already Set)
```xml
<!-- Google Maps API Key -->
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="AIzaSyCKBUC9ZTb7Dp-LHSgNh212EBBj6rmFauI" />
```

## 🚀 **Development Workflow**

### **Start Development Server**
```bash
# Terminal 1: Start Metro bundler
npm start

# Terminal 2: Start backend API
cd ../
npm run dev

# Terminal 3: Run on Android
npx expo run:android
```

### **Hot Reload Development**
- Code changes automatically reload
- Shake device or press `R` twice to reload
- Press `D` to open development menu

## 📦 **Production Build Steps**

### **1. Update Version**
```bash
# Update version in app.json
{
  "expo": {
    "version": "1.0.1",
    "android": {
      "versionCode": 2
    }
  }
}
```

### **2. Generate Signed APK**
```bash
# Using EAS (recommended)
eas build --platform android --profile production

# Using local Gradle
cd android
./gradlew bundleRelease
```

### **3. Test Production Build**
```bash
# Install release APK on device
adb install app-release.apk

# Test all features work correctly
```

## 🐛 **Common Issues & Solutions**

### **Gradle Build Fails**
```bash
# Clean Gradle cache
cd android
./gradlew clean

# Clear React Native cache
npx react-native start --reset-cache
```

### **Metro Bundler Issues**
```bash
# Clear Metro cache
npx expo start --clear

# Reset Node modules
rm -rf node_modules
npm install
```

### **Device Not Detected**
```bash
# Check ADB connection
adb devices

# Restart ADB server
adb kill-server
adb start-server
```

### **Google Maps Not Loading**
1. Check API key is correct in app.json
2. Enable required APIs in Google Cloud Console:
   - Maps SDK for Android
   - Places API
   - Geocoding API

## 📊 **Build Status Monitoring**

### **EAS Build Progress**
- **Current Build**: https://expo.dev/accounts/ramzt25/projects/gridghost/builds/
- **Expected Time**: ~100 minutes (free tier queue)
- **Output**: APK file ready for download

### **Local Build Testing**
```bash
# Check if Android project builds
cd android
./gradlew assembleDebug

# Should complete without errors
```

## 🎯 **Next Steps After Build**

1. **Download APK** from EAS build page
2. **Install on test device** and verify functionality
3. **Test key features**:
   - User registration/login
   - GPS location access
   - Map display and interaction
   - Race creation
   - Friend system

4. **Performance testing**:
   - App startup time
   - Map rendering performance
   - Battery usage monitoring

## 🏁 **Production Deployment**

Once testing is complete:
1. **Upload to Google Play Console**
2. **Submit for review**
3. **Configure store listing**
4. **Set up staged rollout**

---

**Current Status**: 
- ✅ Native Android code generated
- ✅ EAS build in progress
- ✅ Android Studio ready for local development
- 🔄 APK will be ready in ~100 minutes

Your GridGhost app is ready for Android development! 🏎️📱