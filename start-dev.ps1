#!/usr/bin/env pwsh

# DashRacing Development Environment Startup Script
# This script starts all necessary services for development

Write-Host "🚀 Starting DashRacing Development Environment..." -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan

# Color output function
function Write-Section {
    param([string]$Message)
    Write-Host "`n$Message" -ForegroundColor Yellow
    Write-Host "$(New-Object String('-', $Message.Length))" -ForegroundColor Yellow
}

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Check prerequisites
Write-Section "🔍 Checking Prerequisites"
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js found: $(node --version)" -ForegroundColor Green

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm not found. Please install npm first." -ForegroundColor Red
    exit 1
}
Write-Host "✅ npm found: $(npm --version)" -ForegroundColor Green

# Check if Docker is running (for database)
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
    $dockerAvailable = $true
}
catch {
    Write-Host "⚠️  Docker not available - database will need to be started manually" -ForegroundColor Yellow
    $dockerAvailable = $false
}

# Start Database (if Docker is available)
if ($dockerAvailable) {
    Write-Section "🗄️  Starting Database"
    if (Test-Port 5432) {
        Write-Host "✅ Database already running on port 5432" -ForegroundColor Green
    } else {
        Write-Host "🔄 Starting PostgreSQL database with Docker..." -ForegroundColor Blue
        try {
            Start-Process -FilePath "docker-compose" -ArgumentList "up", "-d", "db" -WorkingDirectory $PWD -NoNewWindow -Wait
            Start-Sleep -Seconds 3
            if (Test-Port 5432) {
                Write-Host "✅ Database started successfully" -ForegroundColor Green
            } else {
                Write-Host "❌ Failed to start database" -ForegroundColor Red
            }
        }
        catch {
            Write-Host "❌ Failed to start database with Docker: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Start Backend
Write-Section "🖥️  Starting Backend Server"
if (Test-Port 4000) {
    Write-Host "✅ Backend already running on port 4000" -ForegroundColor Green
} else {
    Write-Host "🔄 Starting backend server..." -ForegroundColor Blue
    Start-Process -FilePath "pwsh" -ArgumentList "-Command", "cd backend; npm run dev" -WindowStyle Normal
    Start-Sleep -Seconds 5
    if (Test-Port 4000) {
        Write-Host "✅ Backend started successfully on http://localhost:4000" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Backend may still be starting up..." -ForegroundColor Yellow
    }
}

# Start Metro Bundler
Write-Section "📱 Starting Metro Bundler"
if (Test-Port 8081) {
    Write-Host "✅ Metro bundler already running on port 8081" -ForegroundColor Green
} else {
    Write-Host "🔄 Starting Metro bundler..." -ForegroundColor Blue
    Start-Process -FilePath "pwsh" -ArgumentList "-Command", "cd mobile; npx react-native start" -WindowStyle Normal
    Start-Sleep -Seconds 5
    if (Test-Port 8081) {
        Write-Host "✅ Metro bundler started successfully on http://localhost:8081" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Metro bundler may still be starting up..." -ForegroundColor Yellow
    }
}

# Build and Install Mobile App
Write-Section "📲 Building Mobile App"
Write-Host "🔄 Building and installing mobile app on Android..." -ForegroundColor Blue
try {
    $env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.15.6-hotspot"
    $env:ANDROID_HOME = "C:\Users\tramsey\AppData\Local\Android\Sdk"
    $env:PATH += ";C:\Users\tramsey\AppData\Local\Android\Sdk\platform-tools"
    
    Start-Process -FilePath "pwsh" -ArgumentList "-Command", "cd mobile; npx react-native run-android" -WindowStyle Normal
    Write-Host "✅ Mobile app build started (check separate window for progress)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to start mobile app build: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Section "🎉 Development Environment Status"
Write-Host "Database:      $(if ($dockerAvailable -and (Test-Port 5432)) { '✅ Running on port 5432' } else { '❌ Not running' })" -ForegroundColor $(if ($dockerAvailable -and (Test-Port 5432)) { 'Green' } else { 'Red' })
Write-Host "Backend:       $(if (Test-Port 4000) { '✅ Running on http://localhost:4000' } else { '❌ Not running' })" -ForegroundColor $(if (Test-Port 4000) { 'Green' } else { 'Red' })
Write-Host "Metro:         $(if (Test-Port 8081) { '✅ Running on http://localhost:8081' } else { '❌ Not running' })" -ForegroundColor $(if (Test-Port 8081) { 'Green' } else { 'Red' })
Write-Host "Mobile App:    🔄 Building (check separate windows)" -ForegroundColor Blue

Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "🎯 Development environment is starting up!" -ForegroundColor Green
Write-Host "📚 Useful commands:" -ForegroundColor Cyan
Write-Host "   - stop-dev.ps1        : Stop all services" -ForegroundColor White
Write-Host "   - Backend API:        : http://localhost:4000" -ForegroundColor White
Write-Host "   - Metro Bundler:      : http://localhost:8081" -ForegroundColor White
Write-Host "   - Admin Portal:       : cd admin-portal && npm run dev" -ForegroundColor White
Write-Host "================================================================" -ForegroundColor Cyan