# 🚀 GridGhost/DashRacing Development Environment Startup Instructions

## 📋 Quick Start

The project includes automated scripts to set up your complete development environment. All scripts are located in the root directory and can be run from there.

## 🎯 Main Scripts

### 🚀 **Full Development Environment: `start-full-dev.ps1`**

Starts the complete development environment including backend, Metro bundler, and mobile app.

```powershell
.\start-full-dev.ps1
```

**What it does:**
- ✅ Kills any processes on required ports (3000, 3001, 8081, 8082, 19000-19002)
- ✅ Sets up Android environment variables correctly
- ✅ Starts backend server on http://localhost:3000
- ✅ Starts Metro bundler on http://localhost:8081
- ✅ Builds and installs the mobile app on your connected device
- ✅ Comprehensive error handling and status reporting

**Available Options:**
```powershell
# Skip backend startup
.\start-full-dev.ps1 -SkipBackend

# Skip mobile app build (just start backend + Metro)
.\start-full-dev.ps1 -SkipMobile

# Start only Metro bundler
.\start-full-dev.ps1 -MetroOnly
```

### 📱 **Quick Mobile Build: `build-mobile.ps1`**

Quickly builds and installs just the mobile app (assumes Metro is already running).

```powershell
.\build-mobile.ps1
```

**What it does:**
- ✅ Sets up Android environment variables
- ✅ Checks for connected devices
- ✅ Builds and installs mobile app on your device
- ✅ Quick troubleshooting tips

## 🔧 Prerequisites

## 🏠 Setting Up on Your Home PC

### 📥 **Complete Installation Checklist**

When setting up on your home PC, install these in order:

#### **Step 1: Core Tools**
```powershell
# 1. Download and install Node.js (v18+)
# From: https://nodejs.org/
# Verify: 
node --version
npm --version

# 2. Download and install Git
# From: https://git-scm.com/download/windows
# Verify:
git --version
```

#### **Step 2: Java Development Kit**
```powershell
# 3. Download and install Eclipse Adoptium JDK 17.0.15.6+hotspot
# From: https://adoptium.net/temurin/releases/
# IMPORTANT: Install to exactly this path:
# C:\Program Files\Eclipse Adoptium\jdk-17.0.15.6-hotspot
# Verify:
java -version
```

#### **Step 3: Android Development**
```powershell
# 4. Download and install Android Studio
# From: https://developer.android.com/studio
# During installation, ensure these are selected:
# ✅ Android SDK
# ✅ Android SDK Platform
# ✅ Android Virtual Device
# ✅ Performance (Intel HAXM) - for Intel processors

# 5. Install React Native CLI globally
npm install -g @react-native-community/cli

# Verify React Native installation:
npx react-native --version
```

#### **Step 4: Clone and Setup Project**
```powershell
# 6. Clone the repository
git clone https://github.com/Ramzt25/DashRacing.git
cd DashRacing

# 7. Install all dependencies
cd backend
npm install

cd ../mobile
npm install

cd ../admin-portal
npm install

cd ..
```

#### **Step 5: Copy Configuration Files**
**⚠️ IMPORTANT:** You need to copy these configuration files from your current setup:

1. **Mobile Environment Variables:**
   ```powershell
   # Copy this file from your current PC to home PC:
   # From: C:\Users\tramsey\Projects\DashRacing\mobile\.env
   # To: [HOME_PC]\DashRacing\mobile\.env
   ```

2. **Verify these files exist after cloning:**
   - `mobile/babel.config.js` ✅ (should be in repo)
   - `mobile/src/types/env.d.ts` ✅ (should be in repo)
   - `mobile/.env` ⚠️ (needs to be copied - contains API keys)

#### **Step 6: Verify Installation**
```powershell
# Run the environment check
npx react-native doctor

# Test the setup scripts
.\start-full-dev.ps1 -MetroOnly
```

### 📱 **Critical Files to Transfer**

When moving to your home PC, make sure to copy these files:

1. **`mobile/.env`** - Contains Supabase credentials
2. **Any custom configuration files** you've modified
3. **SSH keys or Git credentials** (if using private repos)

### 🔍 **Verification Commands**

Run these commands on your home PC to verify everything is installed correctly:

```powershell
# Check Node.js
node --version          # Should be v18+
npm --version

# Check Git
git --version

# Check Java
java -version          # Should be 17.0.15.6

# Check Android SDK (after running our script)
adb version

# Check React Native
npx react-native --version

# Check project dependencies
cd DashRacing
cd backend && npm list --depth=0
cd ../mobile && npm list --depth=0
```

### 🚨 **Common Home PC Setup Issues**

#### **Windows Defender / Antivirus**
- May block Node.js/npm installations
- Add exclusions for:
  - Node.js installation folder
  - Project directory
  - npm cache directory

#### **Corporate Networks**
- May block npm package downloads
- Configure npm proxy if needed:
  ```powershell
  npm config set proxy http://proxy.company.com:8080
  npm config set https-proxy http://proxy.company.com:8080
  ```

#### **User Permissions**
- Install software with administrator privileges
- Ensure your user has write access to project directories

#### **Path Length Limitations**
- Keep project path short (e.g., `C:\Dev\DashRacing`)
- Windows has 260 character path limit by default

### Required Software & Dependencies

#### **Core Development Tools**
1. **Node.js (v18 or higher)**
   - Download: https://nodejs.org/
   - Required for: Backend server, Metro bundler, package management
   - Verify installation: `node --version` and `npm --version`

2. **Git**
   - Download: https://git-scm.com/download/windows
   - Required for: Version control and cloning the repository
   - Verify installation: `git --version`

#### **Java Development Kit**
3. **Eclipse Adoptium JDK 17**
   - Download: https://adoptium.net/temurin/releases/
   - **Specific Version Required:** JDK 17.0.15.6+hotspot
   - **Installation Path:** `C:\Program Files\Eclipse Adoptium\jdk-17.0.15.6-hotspot`
   - Required for: Android app compilation
   - Verify installation: `java -version`

#### **Android Development Environment**
4. **Android Studio**
   - Download: https://developer.android.com/studio
   - Required for: Android SDK, emulators, device debugging
   - **Install Location:** Default installation is fine
   - **During Installation:** Make sure to install:
     - Android SDK
     - Android SDK Platform
     - Android Virtual Device
     - Performance (Intel ® HAXM) (for Intel processors)

5. **Android SDK**
   - **Installation Path:** `C:\Users\tramsey\AppData\Local\Android\Sdk`
   - Installed automatically with Android Studio
   - **Required SDK Components:**
     - ✅ Android SDK Platform-Tools (required for adb)
     - ✅ Android SDK Build-Tools (version 34.0.0 or higher)
     - ✅ Android SDK Platform (API level 34 or target API)
     - ✅ Android Emulator
     - ✅ Android SDK Command-line Tools (latest)
   
   **⚠️ Important SDK Setup:**
   ```powershell
   # After installing Android Studio, open it and:
   # 1. Go to Tools > SDK Manager
   # 2. In "SDK Platforms" tab: Install Android 14 (API 34) or your target API
   # 3. In "SDK Tools" tab: Ensure these are installed:
   #    - Android SDK Build-Tools (34.0.0+)
   #    - Android SDK Platform-Tools
   #    - Android SDK Command-line Tools (latest)
   #    - Android Emulator
   ```

#### **React Native CLI**
6. **React Native CLI**
   ```powershell
   npm install -g @react-native-community/cli
   ```
   - Required for: Building and running React Native apps
   - Verify installation: `npx react-native --version`

#### **PowerShell (Already Available)**
7. **PowerShell 5.1+**
   - Pre-installed on Windows 10/11
   - Required for: Running our automation scripts
   - Verify version: `$PSVersionTable.PSVersion`

### Database & Backend Services

#### **Supabase (Cloud Database)**
8. **Supabase Account & Project**
   - Website: https://supabase.com
   - **Already Configured:** Project URL and keys are in `mobile/.env`
   - **Project URL:** https://srhqcanyeatasprlvzvh.supabase.co
   - No local installation required (cloud-based)

#### **Backend Dependencies**
9. **Node.js Packages** (Auto-installed by scripts)
   ```powershell
   # Backend dependencies (run from ./backend/)
   npm install
   ```
   - Includes: Fastify, Prisma, Supabase client, etc.

10. **Mobile App Dependencies** (Auto-installed by scripts)
    ```powershell
    # Mobile dependencies (run from ./mobile/)
    npm install
    ```
    - Includes: React Native, Supabase client, navigation, etc.

### Environment Variables & Paths

#### **System Environment Variables** (Set by scripts automatically)
- `JAVA_HOME` → `C:\Program Files\Eclipse Adoptium\jdk-17.0.15.6-hotspot`
- `ANDROID_HOME` → `C:\Users\tramsey\AppData\Local\Android\Sdk`
- `ANDROID_SDK_ROOT` → `C:\Users\tramsey\AppData\Local\Android\Sdk`
- `PATH` additions:
  - `%ANDROID_HOME%\platform-tools`
  - `%ANDROID_HOME%\emulator`
  - `%ANDROID_HOME%\tools`
  - `%ANDROID_HOME%\tools\bin`

### Required File Configurations

#### **Environment Files**
11. **Mobile App Environment Variables**
    - File: `mobile/.env` (already created)
    - Contains: Supabase URL, API keys, development configuration
    - **⚠️ Important:** Copy this file to your home PC

12. **TypeScript Declarations**
    - File: `mobile/src/types/env.d.ts` (already created)
    - Required for: TypeScript environment variable support

13. **Babel Configuration**
    - File: `mobile/babel.config.js` (already configured)
    - Required for: Environment variable loading in React Native

### PowerShell Execution Policy
Your system should have `RemoteSigned` execution policy (already configured):
```powershell
Get-ExecutionPolicy
# Should return: RemoteSigned
```

## 📱 Device Setup

### Android Device Requirements
1. **Enable Developer Options:**
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
   - Developer Options will appear in Settings

2. **Enable USB Debugging:**
   - Go to Settings > Developer Options
   - Turn on "USB Debugging"

3. **Connect Device:**
   - Connect via USB cable
   - Accept the debugging authorization prompt on your device

4. **Verify Connection:**
   ```powershell
   adb devices
   # Should show your device listed
   ```

## 🛠️ Manual Environment Setup (if needed)

If the scripts don't work automatically, you can manually set environment variables:

```powershell
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-17.0.15.6-hotspot"
$env:ANDROID_HOME="C:\Users\tramsey\AppData\Local\Android\Sdk"
$env:ANDROID_SDK_ROOT="C:\Users\tramsey\AppData\Local\Android\Sdk"
$env:PATH = "$env:PATH;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$env:ANDROID_HOME\tools;$env:ANDROID_HOME\tools\bin"
```

## 📂 Project Structure

```
DashRacing/
├── start-full-dev.ps1      # Main development environment script
├── build-mobile.ps1        # Quick mobile build script
├── backend/                # Backend API server
├── mobile/                 # React Native mobile app
├── admin-portal/          # Web admin interface
├── infrastructure/        # Azure deployment files
└── docs/                  # Documentation
```

## 🎮 Development Workflow

### 1. **First Time Setup**
```powershell
# Install dependencies
cd backend
npm install

cd ../mobile
npm install

cd ../admin-portal
npm install

cd ..
```

### 2. **Daily Development**
```powershell
# Start everything
.\start-full-dev.ps1

# Or start components individually
.\start-full-dev.ps1 -SkipMobile    # Backend + Metro only
.\build-mobile.ps1                  # Just rebuild mobile app
```

### 3. **Development URLs**
- **Backend API:** http://localhost:3000
- **Metro Bundler:** http://localhost:8081
- **Admin Portal:** http://localhost:5173 (when started separately)

## 🚨 Troubleshooting

### Common Issues

#### **"Script cannot be loaded" Error**
```powershell
# If execution policy blocks the script:
PowerShell -ExecutionPolicy Bypass -File .\start-full-dev.ps1
```

#### **"adb not recognized" Error**
- Ensure Android SDK is installed
- Check that PATH includes Android SDK platform-tools
- Run the script again (it sets up PATH automatically)

#### **"No devices found" Error**
```powershell
# Check connected devices
adb devices

# If empty, check:
# 1. USB cable is connected
# 2. USB debugging is enabled on device
# 3. You've accepted the debugging authorization on device
```

#### **"Android SDK not found" Error**
```powershell
# Check if Android SDK components are installed
ls "C:\Users\tramsey\AppData\Local\Android\Sdk"

# Should show folders like:
# - platform-tools/
# - build-tools/
# - platforms/
# - emulator/

# If missing, install via Android Studio:
# 1. Open Android Studio
# 2. Tools > SDK Manager
# 3. SDK Platforms tab: Install Android 14 (API 34)
# 4. SDK Tools tab: Install/Update:
#    - Android SDK Build-Tools
#    - Android SDK Platform-Tools  
#    - Android SDK Command-line Tools (latest)

# Run React Native doctor to verify
npx react-native doctor

# If still failing, try manual environment setup:
$env:ANDROID_SDK_ROOT="C:\Users\tramsey\AppData\Local\Android\Sdk"
$env:ANDROID_HOME="C:\Users\tramsey\AppData\Local\Android\Sdk"
```

#### **"Build-tools not found" Error**
```powershell
# Check build-tools directory
ls "C:\Users\tramsey\AppData\Local\Android\Sdk\build-tools"

# Should show version folders like: 34.0.0, 33.0.1, etc.
# If empty, install via Android Studio SDK Manager

# Verify specific build-tools version
ls "C:\Users\tramsey\AppData\Local\Android\Sdk\build-tools\34.0.0"
```

#### **"JAVA_HOME invalid" Error**
```powershell
# Verify Java 17 is installed at the expected location
Test-Path "C:\Program Files\Eclipse Adoptium\jdk-17.0.15.6-hotspot"

# Check Java version
java -version

# Should show: openjdk version "17.0.15.6"
```

#### **Quick Android SDK Verification Script**
```powershell
# Run this to check your Android SDK setup
$androidHome = "C:\Users\tramsey\AppData\Local\Android\Sdk"

Write-Host "🔍 Android SDK Verification" -ForegroundColor Cyan
Write-Host "SDK Path: $androidHome"

if (Test-Path $androidHome) {
    Write-Host "✅ ANDROID_HOME exists" -ForegroundColor Green
    
    $components = @{
        "Platform Tools" = "$androidHome\platform-tools"
        "Build Tools" = "$androidHome\build-tools" 
        "Platforms" = "$androidHome\platforms"
        "Emulator" = "$androidHome\emulator"
    }
    
    foreach ($component in $components.GetEnumerator()) {
        if (Test-Path $component.Value) {
            Write-Host "✅ $($component.Key)" -ForegroundColor Green
        } else {
            Write-Host "❌ $($component.Key) - MISSING" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ ANDROID_HOME does not exist" -ForegroundColor Red
}
```

#### **Metro Port Conflicts**
```powershell
# Kill processes on Metro ports
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# Or use the script which does this automatically
.\start-full-dev.ps1
```

#### **Build Failures**
```powershell
# Check React Native environment
cd mobile
npx react-native doctor

# Clean and rebuild
npx react-native start --reset-cache
```

### **App Not Appearing on Device**
1. Check if Metro bundler is running (http://localhost:8081)
2. Ensure device is connected: `adb devices`
3. Look for the GridGhost app icon on your device
4. Check device logs: `adb logcat`

### **Backend Connection Issues**
1. Verify backend is running: http://localhost:3000
2. Check if Supabase environment variables are set in `mobile/.env`
3. Ensure network connectivity between device and development machine

## 📱 Metro Bundler Commands

When Metro is running, you can use these keyboard shortcuts:
- **`r`** - Reload the app
- **`d`** - Open developer menu
- **`j`** - Open JavaScript debugger

## 🔄 Updating Dependencies

```powershell
# Update backend dependencies
cd backend
npm update

# Update mobile dependencies
cd ../mobile
npm update

# Update admin portal dependencies
cd ../admin-portal
npm update
```

## 🎯 Production Deployment

For production deployment, see:
- `docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md`
- `docs/STEP_2_DEPLOYMENT_GUIDE.md`
- Azure infrastructure files in `infrastructure/`

## 📞 Support

If you encounter issues not covered here:
1. Check the `docs/` folder for specific guides
2. Run `npx react-native doctor` for environment diagnostics
3. Check Metro bundler console for error messages
4. Review device logs with `adb logcat`

---

**Happy Development! 🎮🏁**