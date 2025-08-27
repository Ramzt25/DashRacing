#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Complete development environment startup script for GridGhost/DashRacing
.DESCRIPTION
    This script sets up the complete development environment by:
    - Killing any processes on required ports
    - Setting up Android environment variables
    - Starting the backend server
    - Starting Metro bundler
    - Building and installing the mobile app on connected device
.EXAMPLE
    .\start-full-dev.ps1
#>

param(
    [switch]$SkipBackend = $false,
    [switch]$SkipMobile = $false,
    [switch]$MetroOnly = $false
)

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

function Stop-ProcessOnPort {
    param([int]$Port)
    
    Write-Step "Checking for processes on port $Port..."
    
    try {
        $processes = netstat -ano | Select-String ":$Port\s" | ForEach-Object {
            $line = $_.Line.Trim()
            $parts = $line -split '\s+'
            if ($parts.Length -ge 5) {
                $parts[4]
            }
        } | Where-Object { $_ -and $_ -ne "0" } | Sort-Object -Unique
        
        if ($processes) {
            foreach ($processId in $processes) {
                try {
                    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                    if ($process) {
                        Write-Warning "Killing process $($process.ProcessName) (PID: $processId) on port $Port"
                        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                        Start-Sleep -Seconds 1
                    }
                } catch {
                    Write-Warning "Could not kill process with PID $processId"
                }
            }
            Write-Success "Cleared processes on port $Port"
        } else {
            Write-Success "Port $Port is available"
        }
    } catch {
        Write-Warning "Could not check port $Port (this is usually fine)"
    }
}

function Test-AndroidDevice {
    Write-Step "Checking for connected Android devices..."
    
    try {
        $devices = & adb devices 2>$null
        $connectedDevices = $devices | Select-String "device$" | Where-Object { $_ -notmatch "List of devices" }
        
        if ($connectedDevices) {
            Write-Success "Found connected Android devices:"
            $connectedDevices | ForEach-Object { Write-Host "  📱 $($_.Line)" -ForegroundColor $Green }
            return $true
        } else {
            Write-Warning "No Android devices connected. Please connect a device or start an emulator."
            return $false
        }
    } catch {
        Write-Error "ADB not found. Please ensure Android SDK is properly installed."
        return $false
    }
}

function Start-Backend {
    Write-Step "Starting backend server..."
    
    if (-not (Test-Path ".\backend")) {
        Write-Error "Backend directory not found. Make sure you're running from the project root."
        return $false
    }
    
    # Kill any existing backend processes
    Stop-ProcessOnPort 3000
    Stop-ProcessOnPort 3001
    
    try {
        # Start backend in background
        Start-Process -FilePath "pwsh" -ArgumentList "-Command", "cd '$(Get-Location)\backend'; npm run dev" -WindowStyle Minimized
        Write-Success "Backend server starting on http://localhost:3000"
        Start-Sleep -Seconds 3
        return $true
    } catch {
        Write-Error "Failed to start backend server: $($_.Exception.Message)"
        return $false
    }
}

function Start-Metro {
    Write-Step "Starting Metro bundler..."
    
    if (-not (Test-Path ".\mobile")) {
        Write-Error "Mobile directory not found. Make sure you're running from the project root."
        return $false
    }
    
    # Kill any existing Metro processes
    Stop-ProcessOnPort 8081
    Stop-ProcessOnPort 8082
    
    try {
        # Start Metro in background
        Start-Process -FilePath "pwsh" -ArgumentList "-Command", "cd '$(Get-Location)\mobile'; npx react-native start --reset-cache" -WindowStyle Minimized
        Write-Success "Metro bundler starting on http://localhost:8081"
        Start-Sleep -Seconds 5
        return $true
    } catch {
        Write-Error "Failed to start Metro bundler: $($_.Exception.Message)"
        return $false
    }
}

function Build-AndroidApp {
    Write-Step "Building and installing Android app..."
    
    # Set up Android environment variables
    $env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.15.6-hotspot"
    $env:ANDROID_HOME = "C:\Users\tramsey\AppData\Local\Android\Sdk"
    $env:ANDROID_SDK_ROOT = "C:\Users\tramsey\AppData\Local\Android\Sdk"
    $env:PATH = "$env:PATH;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$env:ANDROID_HOME\tools;$env:ANDROID_HOME\tools\bin"
    
    Write-Step "Environment variables set:"
    Write-Host "  JAVA_HOME: $env:JAVA_HOME" -ForegroundColor $Yellow
    Write-Host "  ANDROID_HOME: $env:ANDROID_HOME" -ForegroundColor $Yellow
    Write-Host "  ANDROID_SDK_ROOT: $env:ANDROID_SDK_ROOT" -ForegroundColor $Yellow
    
    # Verify Java installation
    if (-not (Test-Path $env:JAVA_HOME)) {
        Write-Error "JAVA_HOME path does not exist: $env:JAVA_HOME"
        return $false
    }
    
    # Verify Android SDK and required components
    if (-not (Test-Path $env:ANDROID_HOME)) {
        Write-Error "ANDROID_HOME path does not exist: $env:ANDROID_HOME"
        return $false
    }
    
    # Check for essential Android SDK components
    $requiredPaths = @(
        "$env:ANDROID_HOME\platform-tools",
        "$env:ANDROID_HOME\build-tools",
        "$env:ANDROID_HOME\platforms"
    )
    
    $missingPaths = @()
    foreach ($path in $requiredPaths) {
        if (-not (Test-Path $path)) {
            $missingPaths += $path
        }
    }
    
    if ($missingPaths.Count -gt 0) {
        Write-Warning "Some Android SDK components are missing:"
        $missingPaths | ForEach-Object { Write-Host "  ❌ $_" -ForegroundColor $Red }
        Write-Warning "Please install missing components via Android Studio SDK Manager"
        Write-Host "  1. Open Android Studio" -ForegroundColor $Yellow
        Write-Host "  2. Go to Tools > SDK Manager" -ForegroundColor $Yellow
        Write-Host "  3. Install: Android SDK Platform-Tools, Android SDK Build-Tools" -ForegroundColor $Yellow
    } else {
        Write-Success "Android SDK components verified"
    }
    
    # Try to fix Android SDK detection
    Write-Step "Attempting to fix Android SDK detection..."
    try {
        $sdkManagerPath = "$env:ANDROID_HOME\cmdline-tools\latest\bin\sdkmanager.bat"
        if (Test-Path $sdkManagerPath) {
            Write-Step "Found SDK Manager, checking installed packages..."
            & $sdkManagerPath --list_installed 2>$null | Select-Object -First 10 | ForEach-Object {
                Write-Host "  📦 $_" -ForegroundColor $Green
            }
        } else {
            Write-Warning "SDK Manager not found at expected location"
        }
    } catch {
        Write-Warning "Could not run SDK Manager check: $($_.Exception.Message)"
    }
    
    # Check for connected devices
    if (-not (Test-AndroidDevice)) {
        return $false
    }
    
    try {
        # Change to mobile directory
        Push-Location ".\mobile"
        
        Write-Step "Running React Native build and install..."
        
        # Run the build command
        $buildResult = & npx react-native run-android 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Android app successfully built and installed!"
            Write-Success "App should now be running on your device"
        } else {
            Write-Error "Failed to build/install Android app"
            Write-Host $buildResult -ForegroundColor $Red
            return $false
        }
        
    } catch {
        Write-Error "Error during Android build: $($_.Exception.Message)"
        return $false
    } finally {
        Pop-Location
    }
    
    return $true
}

# Main execution
Write-Host @"
🏁 GridGhost/DashRacing Development Environment Startup
======================================================
"@ -ForegroundColor $Cyan

# Verify we're in the correct directory
if (-not (Test-Path ".\mobile") -or -not (Test-Path ".\backend")) {
    Write-Error "Please run this script from the project root directory"
    Write-Error "Expected structure: ./mobile and ./backend directories"
    exit 1
}

Write-Success "Running from correct directory: $(Get-Location)"

# Kill any existing processes on common ports
Write-Step "Cleaning up existing processes..."
Stop-ProcessOnPort 3000  # Backend
Stop-ProcessOnPort 3001  # Backend alternative
Stop-ProcessOnPort 8081  # Metro default
Stop-ProcessOnPort 8082  # Metro alternative
Stop-ProcessOnPort 19000 # Expo
Stop-ProcessOnPort 19001 # Expo
Stop-ProcessOnPort 19002 # Expo

Start-Sleep -Seconds 2

# Start services based on parameters
$backendSuccess = $true
$metroSuccess = $true
$mobileSuccess = $true

if (-not $SkipBackend -and -not $MetroOnly) {
    $backendSuccess = Start-Backend
}

if (-not $MetroOnly) {
    $metroSuccess = Start-Metro
}

if (-not $SkipMobile -and -not $MetroOnly) {
    if ($metroSuccess) {
        Write-Step "Waiting for Metro to fully start..."
        Start-Sleep -Seconds 5
        $mobileSuccess = Build-AndroidApp
    } else {
        Write-Error "Skipping mobile app build because Metro failed to start"
        $mobileSuccess = $false
    }
}

if ($MetroOnly) {
    $metroSuccess = Start-Metro
    if ($metroSuccess) {
        Write-Success "Metro-only mode: Metro bundler is running"
        Write-Host "You can now manually run: npx react-native run-android" -ForegroundColor $Yellow
    }
}

# Summary
Write-Host @"

🏁 Development Environment Status
==================================
"@ -ForegroundColor $Cyan

if (-not $SkipBackend -and -not $MetroOnly) {
    $status = if ($backendSuccess) { "✅ RUNNING" } else { "❌ FAILED" }
    Write-Host "Backend Server: $status" -ForegroundColor $(if ($backendSuccess) { $Green } else { $Red })
}

if (-not $MetroOnly) {
    $status = if ($metroSuccess) { "✅ RUNNING" } else { "❌ FAILED" }
    Write-Host "Metro Bundler: $status" -ForegroundColor $(if ($metroSuccess) { $Green } else { $Red })
}

if (-not $SkipMobile -and -not $MetroOnly) {
    $status = if ($mobileSuccess) { "✅ INSTALLED" } else { "❌ FAILED" }
    Write-Host "Mobile App: $status" -ForegroundColor $(if ($mobileSuccess) { $Green } else { $Red })
}

if ($MetroOnly) {
    $status = if ($metroSuccess) { "✅ RUNNING" } else { "❌ FAILED" }
    Write-Host "Metro Bundler (Only): $status" -ForegroundColor $(if ($metroSuccess) { $Green } else { $Red })
}

Write-Host @"

📱 Next Steps:
==============
"@ -ForegroundColor $Cyan

if ($backendSuccess) {
    Write-Host "• Backend API: http://localhost:3000" -ForegroundColor $Green
}

if ($metroSuccess) {
    Write-Host "• Metro Bundler: http://localhost:8081" -ForegroundColor $Green
    Write-Host "• Press 'r' in Metro terminal to reload the app" -ForegroundColor $Yellow
    Write-Host "• Press 'j' in Metro terminal to open debugger" -ForegroundColor $Yellow
}

if ($mobileSuccess) {
    Write-Host "• Mobile app should be running on your device" -ForegroundColor $Green
    Write-Host "• Check your device for the GridGhost app" -ForegroundColor $Yellow
}

if (-not $mobileSuccess -and $metroSuccess) {
    Write-Host "• To retry mobile installation: npx react-native run-android" -ForegroundColor $Yellow
}

Write-Host @"

🛠️  Troubleshooting:
===================
• If app doesn't appear: Check device connection with 'adb devices'
• If Metro fails: Try 'npx react-native start --reset-cache'
• If build fails: Run 'npx react-native doctor' to check environment
• If backend fails: Check if Node.js dependencies are installed in ./backend

🎮 Happy Development!
"@ -ForegroundColor $Cyan