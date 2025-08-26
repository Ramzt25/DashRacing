#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Test Complete Android Build Process
.DESCRIPTION
    This script tests the complete Android build process step by step
    to identify exactly where issues occur in the build pipeline.
.EXAMPLE
    .\test-android-build.ps1
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
🔨 Android Build Process Test
============================
This script will test each step of the Android build process
to identify where issues occur.
"@ -ForegroundColor $Cyan

# Step 1: Verify project structure
Write-Step "Step 1: Verifying project structure..."
if (Test-Path ".\mobile") {
    Write-Success "Mobile directory found"
    Set-Location ".\mobile"
    
    if (Test-Path ".\android") {
        Write-Success "Android directory found"
    } else {
        Write-Error "Android directory not found in mobile/"
        exit 1
    }
    
    if (Test-Path ".\package.json") {
        Write-Success "package.json found"
        $packageInfo = Get-Content ".\package.json" | ConvertFrom-Json
        Write-Host "  Project: $($packageInfo.name)" -ForegroundColor $Yellow
        Write-Host "  Version: $($packageInfo.version)" -ForegroundColor $Yellow
    } else {
        Write-Error "package.json not found"
        exit 1
    }
} else {
    Write-Error "Please run this script from the project root directory"
    exit 1
}

# Step 2: Set up environment
Write-Step "Step 2: Setting up environment variables..."
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.15.6-hotspot"
$env:ANDROID_HOME = "C:\Users\tramsey\AppData\Local\Android\Sdk"
$env:ANDROID_SDK_ROOT = "C:\Users\tramsey\AppData\Local\Android\Sdk"
$env:PATH = "$env:PATH;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$env:ANDROID_HOME\tools;$env:ANDROID_HOME\tools\bin"

Write-Success "Environment variables set"
Write-Host "  JAVA_HOME: $env:JAVA_HOME" -ForegroundColor $Yellow
Write-Host "  ANDROID_HOME: $env:ANDROID_HOME" -ForegroundColor $Yellow
Write-Host "  ANDROID_SDK_ROOT: $env:ANDROID_SDK_ROOT" -ForegroundColor $Yellow

# Step 3: Verify dependencies
Write-Step "Step 3: Checking dependencies..."
try {
    $nodeVersion = & node --version 2>&1
    Write-Success "Node.js: $nodeVersion"
} catch {
    Write-Error "Node.js not found: $($_.Exception.Message)"
    exit 1
}

try {
    $npmVersion = & npm --version 2>&1
    Write-Success "npm: $npmVersion"
} catch {
    Write-Error "npm not found: $($_.Exception.Message)"
    exit 1
}

# Step 4: Install/check npm dependencies
Write-Step "Step 4: Checking npm dependencies..."
if (Test-Path ".\node_modules") {
    Write-Success "node_modules directory exists"
} else {
    Write-Warning "node_modules not found, installing dependencies..."
    try {
        & npm install
        Write-Success "Dependencies installed"
    } catch {
        Write-Error "Failed to install dependencies: $($_.Exception.Message)"
        exit 1
    }
}

# Step 5: Test React Native CLI
Write-Step "Step 5: Testing React Native CLI..."
try {
    $rnVersion = & npx react-native --version 2>&1
    Write-Success "React Native CLI: $rnVersion"
} catch {
    Write-Error "React Native CLI not working: $($_.Exception.Message)"
    exit 1
}

# Step 6: Test Android SDK detection
Write-Step "Step 6: Testing Android SDK detection..."
try {
    Write-Host "Running React Native doctor..." -ForegroundColor $Yellow
    $doctorOutput = & npx react-native doctor 2>&1
    $outputString = $doctorOutput -join "`n"
    
    if ($outputString -match "✓.*Android SDK" -or $outputString -match "✓.*Android") {
        Write-Success "Android SDK detected by React Native"
    } else {
        Write-Warning "Android SDK detection issues found"
        Write-Host $outputString -ForegroundColor $Yellow
    }
} catch {
    Write-Error "Could not run React Native doctor: $($_.Exception.Message)"
}

# Step 7: Check for connected devices/emulators
Write-Step "Step 7: Checking for Android devices/emulators..."
try {
    $adbDevices = & adb devices 2>&1
    $connectedDevices = $adbDevices | Select-String "device$" | Where-Object { $_ -notmatch "List of devices" }
    
    if ($connectedDevices) {
        Write-Success "Connected devices found:"
        $connectedDevices | ForEach-Object { Write-Host "  📱 $($_.Line)" -ForegroundColor $Green }
    } else {
        Write-Warning "No connected devices found"
        Write-Host "Available emulators:" -ForegroundColor $Yellow
        try {
            & "$env:ANDROID_HOME\emulator\emulator.exe" -list-avds 2>&1 | ForEach-Object {
                Write-Host "  📱 $_" -ForegroundColor $Yellow
            }
        } catch {
            Write-Warning "Could not list emulators"
        }
    }
} catch {
    Write-Error "ADB not accessible: $($_.Exception.Message)"
}

# Step 8: Test Gradle build (dry run)
Write-Step "Step 8: Testing Android Gradle configuration..."
try {
    Set-Location ".\android"
    Write-Host "Testing Gradle wrapper..." -ForegroundColor $Yellow
    $gradleOutput = & .\gradlew.bat tasks --dry-run 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Gradle configuration is valid"
    } else {
        Write-Warning "Gradle configuration issues detected"
        Write-Host $gradleOutput -ForegroundColor $Yellow
    }
    
    Set-Location ".."
} catch {
    Write-Error "Gradle test failed: $($_.Exception.Message)"
    Set-Location ".."
}

# Step 9: Attempt build
Write-Step "Step 9: Attempting React Native Android build..."
Write-Warning "This will attempt an actual build - make sure you have a device connected!"

$buildChoice = Read-Host "Continue with build attempt? (y/N)"
if ($buildChoice -eq "y" -or $buildChoice -eq "Y") {
    try {
        Write-Host "Running: npx react-native run-android" -ForegroundColor $Yellow
        & npx react-native run-android
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "🎉 Build successful!"
        } else {
            Write-Error "Build failed with exit code: $LASTEXITCODE"
        }
    } catch {
        Write-Error "Build error: $($_.Exception.Message)"
    }
} else {
    Write-Host "Build test skipped" -ForegroundColor $Yellow
}

Write-Host "`n🎯 Build Process Test Complete!" -ForegroundColor $Green
Write-Host "Review the output above to identify any issues in the build pipeline." -ForegroundColor $Cyan