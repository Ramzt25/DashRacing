# Copilot Agent: Android SDK Resolution Task

## 🎯 MISSION CRITICAL TASK
Fix the Android SDK detection issue preventing mobile app builds and ensure the complete development environment is functional.

## 📋 CURRENT SITUATION
- **Project**: GridGhost React Native mobile racing app
- **Issue**: React Native cannot detect Android SDK despite proper installation
- **Status**: All files committed to GitHub, environment variables partially working
- **Error**: `Android SDK - Required for building and installing your app on Android - Versions found: N/A - Version supported: Not Found`

## 🔧 SPECIFIC PROBLEMS TO SOLVE

### 1. JAVA_HOME Path Correction
**Current Issue**: JAVA_HOME points to wrong directory
- **Current**: `C:\Program Files\Eclipse Adoptium\jdk-17.0.10.7-hotspot`
- **Should Be**: `C:\Program Files\Eclipse Adoptium\jdk-17.0.15.6-hotspot`
- **Action**: Update environment variables and startup scripts

### 2. Android SDK Detection
**Current Issue**: React Native doctor shows "Android SDK: Not Found"
- **Environment Vars**: ANDROID_HOME and ANDROID_SDK_ROOT need permanent setting
- **Path**: `C:\Users\tramsey\AppData\Local\Android\Sdk`
- **Action**: Ensure persistent environment variables across PowerShell sessions

### 3. Build Tools Version Mismatch
**Current Issue**: React Native expects exact build-tools version
- **Available**: 35.0.1, 35.0.0, 34.0.0
- **Required**: Verify what version React Native 0.79.5 actually needs
- **Action**: Install correct version or update configuration

## 🚀 REQUIRED ACTIONS (IN ORDER)

### Step 1: Fix Environment Variables
```powershell
# Update start-full-dev.ps1 to set correct JAVA_HOME
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.15.6-hotspot"
$env:ANDROID_HOME = "C:\Users\tramsey\AppData\Local\Android\Sdk"
$env:ANDROID_SDK_ROOT = "C:\Users\tramsey\AppData\Local\Android\Sdk"

# Also update system environment variables permanently
```

### Step 2: Run Comprehensive Verification
```powershell
# Test environment setup
.\verify-android-sdk.ps1

# Test React Native detection
cd mobile
npx react-native doctor
```

### Step 3: Install Missing SDK Components (if needed)
```powershell
# Use Android Studio SDK Manager or command line
# Install exact build-tools version React Native expects
```

### Step 4: Test Complete Build Process
```powershell
# Run full development environment
.\start-full-dev.ps1

# Attempt mobile build
cd mobile
npx react-native run-android
```

## 🧪 TESTING REQUIREMENTS

### ✅ Required Test Validations
1. **Environment Variables Test**:
   ```powershell
   echo $env:JAVA_HOME
   echo $env:ANDROID_HOME
   echo $env:ANDROID_SDK_ROOT
   ```

2. **SDK Components Test**:
   ```powershell
   .\verify-android-sdk.ps1
   # Must show ALL components as ✅ (no ❌ or ⚠️)
   ```

3. **React Native Doctor Test**:
   ```powershell
   cd mobile
   npx react-native doctor
   # Must show ALL Android components as ✓ (no ✖)
   ```

4. **Build Test**:
   ```powershell
   cd mobile
   npx react-native run-android
   # Must successfully build APK and install on device/emulator
   ```

5. **Supabase Connection Test**:
   ```powershell
   # Ensure mobile app can connect to Supabase after build
   # Test authentication and database connectivity
   ```

## 🔍 DEBUGGING COMMANDS

### If Issues Persist:
```powershell
# Check exact React Native requirements
cd mobile
npx react-native info

# Check Android SDK structure
Get-ChildItem "$env:ANDROID_HOME" -Recurse -Name "build-tools"

# Check available Java versions
Get-ChildItem "C:\Program Files\Eclipse Adoptium\" -Name "jdk*"

# Force refresh environment
refreshenv
```

## 📁 KEY FILES TO MODIFY

1. **start-full-dev.ps1** - Fix JAVA_HOME path
2. **verify-android-sdk.ps1** - Update verification logic if needed
3. **mobile/android/app/build.gradle** - Ensure correct buildToolsVersion
4. **STARTUP_INSTRUCTIONS.md** - Update with final working configuration

## 🎯 SUCCESS CRITERIA

**MISSION COMPLETE WHEN**:
- [ ] `npx react-native doctor` shows ALL ✓ (no ✖ symbols)
- [ ] `npx react-native run-android` successfully builds and installs APK
- [ ] Mobile app launches and connects to Supabase
- [ ] `.\start-full-dev.ps1` runs without errors
- [ ] All changes committed and pushed to GitHub

## 🚨 CRITICAL NOTES

- **DO NOT** modify core React Native or Android SDK installations
- **TEST THOROUGHLY** - each step must pass before proceeding
- **DOCUMENT CHANGES** - update STARTUP_INSTRUCTIONS.md with final working config
- **COMMIT OFTEN** - push working states to GitHub as you progress
- **USER EXPECTATION**: Complete working mobile build environment upon return

## 📞 FALLBACK PLAN

If SDK issues persist:
1. Document exact error messages
2. Create alternative build script using Android Studio direct build
3. Provide manual steps for SDK component installation
4. Ensure web development environment (backend + admin portal) works perfectly

---

**🎯 PRIMARY GOAL**: Working `npx react-native run-android` with successful APK installation and Supabase connectivity test.