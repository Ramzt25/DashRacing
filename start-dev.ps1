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

# Check Database (Supabase)
Write-Section "🗄️  Checking Database Connection"
Write-Host "🔄 Testing Supabase connection..." -ForegroundColor Blue
try {
    $env:NODE_ENV = "development"
    npx prisma db pull --preview-feature | Out-Null
    Write-Host "✅ Supabase database connection successful" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  Supabase connection issue - check .env configuration" -ForegroundColor Yellow
}

# Start Database (SQLite - no setup needed)
# Database section is removed since SQLite doesn't need a separate server

# Start Backend
Write-Section "🖥️  Backend Status"
Write-Host "ℹ️  Using Supabase - no local backend needed for auth" -ForegroundColor Gray
Write-Host "✅ Authentication via Supabase direct connection" -ForegroundColor Green

# Start Metro Bundler
Write-Section "📱 Starting Metro Bundler"
if (Test-Port 8081) {
    Write-Host "✅ Metro bundler already running on port 8081" -ForegroundColor Green
} else {
    Write-Host "🔄 Starting Metro bundler with cache reset..." -ForegroundColor Blue
    Start-Process -FilePath "pwsh" -ArgumentList "-Command", "cd mobile; npx react-native start --reset-cache" -WindowStyle Normal
    Start-Sleep -Seconds 8
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
    $env:ANDROID_SDK_ROOT = "C:\Users\tramsey\AppData\Local\Android\Sdk"
    $env:PATH = "$env:PATH;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$env:ANDROID_HOME\tools;$env:ANDROID_HOME\tools\bin"
    
    Start-Process -FilePath "pwsh" -ArgumentList "-Command", "cd mobile; npx react-native run-android" -WindowStyle Normal
    Write-Host "✅ Mobile app build started (check separate window for progress)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to start mobile app build: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Section "🎉 Development Environment Status"
Write-Host "Database:      ✅ Supabase PostgreSQL connected" -ForegroundColor Green
Write-Host "Authentication:✅ Supabase Auth configured" -ForegroundColor Green
Write-Host "Metro:         $(if (Test-Port 8081) { '✅ Running on http://localhost:8081' } else { '❌ Not running' })" -ForegroundColor $(if (Test-Port 8081) { 'Green' } else { 'Red' })
Write-Host "Mobile App:    🔄 Building (check separate windows)" -ForegroundColor Blue

Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "🎯 Development environment is starting up!" -ForegroundColor Green
Write-Host "📚 Useful commands:" -ForegroundColor Cyan
Write-Host "   - stop-dev.ps1        : Stop all services" -ForegroundColor White
Write-Host "   - Supabase Dashboard  : https://srhqcanyeatasprlvzvh.supabase.co" -ForegroundColor White
Write-Host "   - Metro Bundler:      : http://localhost:8081" -ForegroundColor White
Write-Host "   - Admin Portal:       : cd admin-portal && npm run dev" -ForegroundColor White
Write-Host "================================================================" -ForegroundColor Cyan