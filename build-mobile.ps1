#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Quick mobile app build and install script for GridGhost/DashRacing
.DESCRIPTION
    This script quickly builds and installs the mobile app by:
    - Setting up Android environment variables
    - Checking for connected devices
    - Building and installing the mobile app
.EXAMPLE
    .\build-mobile.ps1
#>

# Colors for output
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Cyan = "Cyan"

function Write-Step {
    param([string]$Message)
    Write-Host "🚀 $Message" -ForegroundColor $Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor $Red
}

Write-Host @"
📱 GridGhost Mobile App Build & Install
======================================
"@ -ForegroundColor $Cyan

# Verify we're in the correct directory or navigate to mobile
if (Test-Path ".\mobile") {
    Write-Success "Found mobile directory from root"
    Set-Location ".\mobile"
} elseif (Test-Path ".\package.json" -and (Get-Content ".\package.json" | Select-String "gridghost-mobile")) {
    Write-Success "Already in mobile directory"
} else {
    Write-Error "Please run this script from the project root or mobile directory"
    exit 1
}

# Set up Android environment variables
Write-Step "Setting up Android environment..."
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.15.6-hotspot"
$env:ANDROID_HOME = "C:\Users\tramsey\AppData\Local\Android\Sdk"
$env:PATH = "$env:PATH;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$env:ANDROID_HOME\tools;$env:ANDROID_HOME\tools\bin"

Write-Success "Environment variables set:"
Write-Host "  JAVA_HOME: $env:JAVA_HOME" -ForegroundColor $Yellow
Write-Host "  ANDROID_HOME: $env:ANDROID_HOME" -ForegroundColor $Yellow

# Verify Java installation
if (-not (Test-Path $env:JAVA_HOME)) {
    Write-Error "JAVA_HOME path does not exist: $env:JAVA_HOME"
    exit 1
}

# Verify Android SDK
if (-not (Test-Path $env:ANDROID_HOME)) {
    Write-Error "ANDROID_HOME path does not exist: $env:ANDROID_HOME"
    exit 1
}

# Check for connected devices
Write-Step "Checking for connected Android devices..."
try {
    $devices = & adb devices 2>$null
    $connectedDevices = $devices | Select-String "device$" | Where-Object { $_ -notmatch "List of devices" }
    
    if ($connectedDevices) {
        Write-Success "Found connected Android devices:"
        $connectedDevices | ForEach-Object { Write-Host "  📱 $($_.Line)" -ForegroundColor $Green }
    } else {
        Write-Warning "No Android devices connected. Please connect a device or start an emulator."
        Write-Host "Available emulators:" -ForegroundColor $Yellow
        & "$env:ANDROID_HOME\emulator\emulator.exe" -list-avds 2>$null | ForEach-Object {
            Write-Host "  📱 $_" -ForegroundColor $Yellow
        }
        exit 1
    }
} catch {
    Write-Error "ADB not found. Please ensure Android SDK is properly installed."
    exit 1
}

# Build and install the app
Write-Step "Building and installing Android app..."

try {
    Write-Host "Running: npx react-native run-android" -ForegroundColor $Yellow
    
    # Run the build command
    & npx react-native run-android
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "🎉 Android app successfully built and installed!"
        Write-Success "📱 App should now be running on your device"
        Write-Host @"

📱 App is now running on your device!
===================================
• Look for the GridGhost app icon on your device
• If the app doesn't start automatically, tap the icon to launch it
• Make sure Metro bundler is running for live reloading

🛠️  Troubleshooting:
===================
• If app crashes: Check Metro bundler console for errors
• If app won't start: Try 'adb logcat' to see device logs
• If build fails: Run 'npx react-native doctor' to check environment

"@ -ForegroundColor $Cyan
    } else {
        Write-Error "❌ Failed to build/install Android app"
        Write-Host "Try running 'npx react-native doctor' to diagnose environment issues" -ForegroundColor $Yellow
        exit 1
    }
    
} catch {
    Write-Error "Error during Android build: $($_.Exception.Message)"
    exit 1
}