#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Test React Native Doctor and Android SDK Integration
.DESCRIPTION
    This script specifically tests React Native doctor functionality and provides
    detailed diagnostics for Android SDK detection issues.
.EXAMPLE
    .\test-react-native-doctor.ps1
#>

# Colors for output
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Cyan = "Cyan"

function Write-Status {
    param([string]$Message, [string]$Status)
    if ($Status -eq "OK") {
        Write-Host "✅ $Message" -ForegroundColor $Green
    } else {
        Write-Host "❌ $Message" -ForegroundColor $Red
    }
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor $Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor $Cyan
}

Write-Host @"
🔍 React Native Doctor Diagnostic Test
====================================
"@ -ForegroundColor $Cyan

# Navigate to mobile directory
if (Test-Path ".\mobile") {
    Write-Info "Navigating to mobile directory..."
    Set-Location ".\mobile"
} else {
    Write-Error "Mobile directory not found. Please run from project root."
    exit 1
}

# Set up environment variables
Write-Info "Setting up environment variables..."
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.15.6-hotspot"
$env:ANDROID_HOME = "C:\Users\tramsey\AppData\Local\Android\Sdk"
$env:ANDROID_SDK_ROOT = "C:\Users\tramsey\AppData\Local\Android\Sdk"
$env:PATH = "$env:PATH;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$env:ANDROID_HOME\tools;$env:ANDROID_HOME\tools\bin"

Write-Info "Environment variables:"
Write-Host "  JAVA_HOME: $env:JAVA_HOME"
Write-Host "  ANDROID_HOME: $env:ANDROID_HOME"
Write-Host "  ANDROID_SDK_ROOT: $env:ANDROID_SDK_ROOT"

# Test React Native version
Write-Host "`n📋 React Native Information:" -ForegroundColor $Cyan
try {
    $rnVersion = & npx react-native --version 2>&1
    Write-Info "React Native CLI version: $rnVersion"
} catch {
    Write-Warning "Could not get React Native CLI version: $($_.Exception.Message)"
}

# Test React Native info
Write-Host "`n📋 React Native Info:" -ForegroundColor $Cyan
try {
    Write-Info "Running 'npx react-native info'..."
    $infoOutput = & npx react-native info 2>&1
    Write-Host $infoOutput -ForegroundColor $Yellow
} catch {
    Write-Warning "Could not run 'npx react-native info': $($_.Exception.Message)"
}

# Test React Native doctor with detailed output
Write-Host "`n🏥 React Native Doctor (Detailed):" -ForegroundColor $Cyan
try {
    Write-Info "Running 'npx react-native doctor'..."
    $doctorOutput = & npx react-native doctor 2>&1
    
    # Show full output
    Write-Host "`nFull React Native Doctor Output:" -ForegroundColor $Cyan
    Write-Host "=" * 50 -ForegroundColor $Yellow
    Write-Host $doctorOutput -ForegroundColor $White
    Write-Host "=" * 50 -ForegroundColor $Yellow
    
    # Analyze output
    $outputString = $doctorOutput -join "`n"
    
    Write-Host "`n📊 Analysis:" -ForegroundColor $Cyan
    if ($outputString -match "✓") {
        Write-Status "Some checks passed" "OK"
    }
    if ($outputString -match "✖" -or $outputString -match "✗") {
        Write-Status "Some checks failed" "FAIL"
    }
    if ($outputString -match "Android SDK") {
        if ($outputString -match "✓.*Android SDK") {
            Write-Status "Android SDK check passed" "OK"
        } else {
            Write-Status "Android SDK check failed" "FAIL"
        }
    }
    
} catch {
    Write-Warning "Could not run React Native doctor: $($_.Exception.Message)"
}

# Test ADB connection
Write-Host "`n📱 ADB Device Connection:" -ForegroundColor $Cyan
try {
    $adbDevices = & adb devices 2>&1
    Write-Info "ADB devices output:"
    Write-Host $adbDevices -ForegroundColor $Yellow
} catch {
    Write-Warning "Could not run ADB: $($_.Exception.Message)"
}

# Test Java version
Write-Host "`n☕ Java Version Check:" -ForegroundColor $Cyan
try {
    $javaVersion = & java -version 2>&1
    Write-Info "Java version:"
    Write-Host $javaVersion -ForegroundColor $Yellow
} catch {
    Write-Warning "Could not check Java version: $($_.Exception.Message)"
}

Write-Host "`n🎯 Test Complete!" -ForegroundColor $Green
Write-Host "Review the output above to identify any Android SDK detection issues." -ForegroundColor $Cyan