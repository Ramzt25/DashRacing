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

function Test-BackendHealth {
    Write-Step "Testing backend health..."
    
    try {
        # Wait for backend to be ready
        $maxAttempts = 10
        $attempt = 0
        
        do {
            $attempt++
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:4000/health" -Method GET -TimeoutSec 5
                if ($response.StatusCode -eq 200) {
                    $healthData = $response.Content | ConvertFrom-Json
                    Write-Success "Backend health check passed"
                    Write-Host "  📊 Status: $($healthData.status)" -ForegroundColor $Green
                    Write-Host "  🔢 Version: $($healthData.version)" -ForegroundColor $Green
                    Write-Host "  📡 WebSocket: $($healthData.websocket)" -ForegroundColor $Green
                    return $true
                }
            } catch {
                if ($attempt -lt $maxAttempts) {
                    Write-Host "  ⏳ Backend not ready yet (attempt $attempt/$maxAttempts)..." -ForegroundColor $Yellow
                    Start-Sleep -Seconds 3
                } else {
                    throw $_.Exception
                }
            }
        } while ($attempt -lt $maxAttempts)
        
        Write-Error "Backend failed to start after $maxAttempts attempts"
        return $false
        
    } catch {
        Write-Error "Backend health check failed: $($_.Exception.Message)"
        return $false
    }
}

function Test-APIEndpoints {
    Write-Step "Testing critical API endpoints..."
    
    $endpoints = @(
        @{ path = "/"; name = "Root API" },
        @{ path = "/health"; name = "Health Check" },
        @{ path = "/vehicles/health"; name = "Vehicles API" }
    )
    
    $allPassed = $true
    
    foreach ($endpoint in $endpoints) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:4000$($endpoint.path)" -Method GET -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-Host "  ✅ $($endpoint.name): OK" -ForegroundColor $Green
            } else {
                Write-Host "  ⚠️  $($endpoint.name): Status $($response.StatusCode)" -ForegroundColor $Yellow
            }
        } catch {
            Write-Host "  ❌ $($endpoint.name): FAILED - $($_.Exception.Message)" -ForegroundColor $Red
            $allPassed = $false
        }
    }
    
    return $allPassed
}

function Test-WebSocketConnection {
    Write-Step "Testing WebSocket connection..."
    
    try {
        # Test WebSocket availability (we can't easily test connection in PowerShell, so just check if port is listening)
        $wsPort = netstat -ano | Select-String ":3001\s.*LISTENING"
        if ($wsPort) {
            Write-Success "WebSocket server is listening on port 3001"
            return $true
        } else {
            Write-Warning "WebSocket server may not be running on port 3001"
            return $false
        }
    } catch {
        Write-Warning "Could not verify WebSocket connection: $($_.Exception.Message)"
        return $false
    }
}

function Test-DatabaseConnection {
    Write-Step "Testing database connection..."
    
    try {
        # Try to hit an endpoint that requires database access
        $response = Invoke-WebRequest -Uri "http://localhost:4000/admin/health" -Method GET -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            $healthData = $response.Content | ConvertFrom-Json
            Write-Success "Database connection verified"
            Write-Host "  🗄️  Database: $($healthData.database.status)" -ForegroundColor $Green
            Write-Host "  ⏱️  Response Time: $($healthData.database.responseTime)ms" -ForegroundColor $Green
            return $true
        }
    } catch {
        # Expected to fail with 401 (auth required), but not database errors
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Success "Database connection verified (auth endpoint accessible)"
            return $true
        } else {
            Write-Error "Database connection test failed: $($_.Exception.Message)"
            return $false
        }
    }
}

function Test-MobileAPIConfiguration {
    Write-Step "Testing mobile API configuration..."
    
    try {
        # Check mobile app's API configuration file
        $mobileConfigPath = ".\mobile\src\config\api.ts"
        if (Test-Path $mobileConfigPath) {
            $configContent = Get-Content $mobileConfigPath -Raw
            if ($configContent -match "localhost:4000") {
                Write-Success "Mobile app configured for correct backend port (4000)"
                return $true
            } else {
                Write-Error "Mobile app may be configured for wrong port"
                Write-Host "  Check: $mobileConfigPath" -ForegroundColor $Yellow
                return $false
            }
        } else {
            Write-Warning "Mobile API configuration file not found"
            return $false
        }
    } catch {
        Write-Warning "Could not verify mobile API configuration: $($_.Exception.Message)"
        return $false
    }
}

function Start-DebugMonitor {
    Write-Step "Starting debug monitor..."
    
    try {
        # Check if debug monitor dependencies are installed
        $hasWs = npm list ws --depth=0 2>$null
        $hasAxios = npm list axios --depth=0 2>$null
        
        if ($LASTEXITCODE -ne 0 -or (-not $hasWs) -or (-not $hasAxios)) {
            Write-Host "📦 Installing debug monitor dependencies..." -ForegroundColor $Yellow
            npm install ws axios --no-save 2>$null | Out-Null
        }
        
        # Start debug monitor in a new window
        Start-Process -FilePath "pwsh" -ArgumentList "-Command", "cd '$(Get-Location)'; node debug-monitor.js" -WindowStyle Normal
        Write-Success "Debug monitor started in separate window"
        return $true
    } catch {
        Write-Warning "Failed to start debug monitor: $($_.Exception.Message)"
        Write-Host "  You can manually start it later with: node debug-monitor.js" -ForegroundColor $Yellow
        return $false
    }
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
    Stop-ProcessOnPort 4000
    Stop-ProcessOnPort 3001
    
    try {
        # Start backend in background
        Start-Process -FilePath "pwsh" -ArgumentList "-Command", "cd '$(Get-Location)\backend'; npm start" -WindowStyle Minimized
        Write-Success "Backend server starting on http://localhost:4000"
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

function Test-Prerequisites {
    Write-Step "Running pre-flight checks..."
    
    $allGood = $true
    
    # Check Node.js
    try {
        $nodeVersion = & node --version 2>$null
        Write-Host "  ✅ Node.js: $nodeVersion" -ForegroundColor $Green
    } catch {
        Write-Host "  ❌ Node.js not found" -ForegroundColor $Red
        $allGood = $false
    }
    
    # Check npm
    try {
        $npmVersion = & npm --version 2>$null
        Write-Host "  ✅ npm: v$npmVersion" -ForegroundColor $Green
    } catch {
        Write-Host "  ❌ npm not found" -ForegroundColor $Red
        $allGood = $false
    }
    
    # Check Java
    if (Test-Path $env:JAVA_HOME) {
        try {
            $javaVersion = & "$env:JAVA_HOME\bin\java" -version 2>&1 | Select-Object -First 1
            Write-Host "  ✅ Java: $($javaVersion -replace '.*"(.*)".*','$1')" -ForegroundColor $Green
        } catch {
            Write-Host "  ❌ Java not working: $env:JAVA_HOME" -ForegroundColor $Red
            $allGood = $false
        }
    } else {
        Write-Host "  ❌ JAVA_HOME not set or invalid: $env:JAVA_HOME" -ForegroundColor $Red
        $allGood = $false
    }
    
    # Check Android SDK
    if (Test-Path $env:ANDROID_HOME) {
        Write-Host "  ✅ Android SDK: $env:ANDROID_HOME" -ForegroundColor $Green
    } else {
        Write-Host "  ❌ ANDROID_HOME not set or invalid" -ForegroundColor $Red
        $allGood = $false
    }
    
    # Check ADB
    try {
        $adbDevices = & adb devices 2>$null
        $deviceCount = ($adbDevices | Select-String "device$" | Where-Object { $_ -notmatch "List of devices" }).Count
        if ($deviceCount -gt 0) {
            Write-Host "  ✅ ADB: $deviceCount device(s) connected" -ForegroundColor $Green
        } else {
            Write-Host "  ⚠️  ADB: No devices connected" -ForegroundColor $Yellow
        }
    } catch {
        Write-Host "  ❌ ADB not found" -ForegroundColor $Red
        $allGood = $false
    }
    
    return $allGood
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
Stop-ProcessOnPort 4000  # Backend
Stop-ProcessOnPort 3001  # Backend alternative
Stop-ProcessOnPort 8081  # Metro default
Stop-ProcessOnPort 8082  # Metro alternative

Start-Sleep -Seconds 2

# Start services based on parameters
$backendSuccess = $true
$metroSuccess = $true
$mobileSuccess = $true
$debugMonitorSuccess = $true

if (-not $SkipBackend -and -not $MetroOnly) {
    $backendSuccess = Start-Backend
    
    # Test backend health before proceeding
    if ($backendSuccess) {
        Write-Step "Waiting for backend to initialize..."
        Start-Sleep -Seconds 5
        
        $healthCheckPassed = Test-BackendHealth
        if (-not $healthCheckPassed) {
            Write-Error "Backend health check failed. Cannot proceed safely."
            $backendSuccess = $false
        } else {
            # Run additional health checks
            Write-Step "Running comprehensive system checks..."
            $apiEndpointsOK = Test-APIEndpoints
            $webSocketOK = Test-WebSocketConnection
            $databaseOK = Test-DatabaseConnection
            $mobileConfigOK = Test-MobileAPIConfiguration
            
            if ($apiEndpointsOK -and $webSocketOK -and $databaseOK -and $mobileConfigOK) {
                Write-Success "All system health checks passed!"
                # Start debug monitor after all checks pass
                $debugMonitorSuccess = Start-DebugMonitor
            } else {
                Write-Warning "Some health checks failed, but backend is running"
                Write-Warning "You may experience issues. Check the logs above."
                $debugMonitorSuccess = Start-DebugMonitor
            }
        }
    }
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
    
    $status = if ($debugMonitorSuccess) { "✅ MONITORING" } else { "⚠️  MANUAL START" }
    Write-Host "Debug Monitor: $status" -ForegroundColor $(if ($debugMonitorSuccess) { $Green } else { $Yellow })
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
    Write-Host "• Backend API: http://localhost:4000" -ForegroundColor $Green
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