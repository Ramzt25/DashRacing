#!/usr/bin/env pwsh

# DashRacing Development Environment Shutdown Script
# This script stops all development services

Write-Host "🛑 Stopping DashRacing Development Environment..." -ForegroundColor Red
Write-Host "================================================================" -ForegroundColor Cyan

# Color output function
function Write-Section {
    param([string]$Message)
    Write-Host "`n$Message" -ForegroundColor Yellow
    Write-Host "$(New-Object String('-', $Message.Length))" -ForegroundColor Yellow
}

# Function to kill processes by port
function Stop-ProcessByPort {
    param([int]$Port, [string]$ServiceName)
    try {
        $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | ForEach-Object { Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue }
        if ($processes) {
            foreach ($process in $processes) {
                Write-Host "🔄 Stopping $ServiceName (PID: $($process.Id))..." -ForegroundColor Blue
                Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            }
            Write-Host "✅ $ServiceName stopped" -ForegroundColor Green
        } else {
            Write-Host "ℹ️  $ServiceName not running on port $Port" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "⚠️  Could not stop $ServiceName : $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Stop Metro Bundler
Write-Section "📱 Stopping Metro Bundler"
Stop-ProcessByPort -Port 8081 -ServiceName "Metro Bundler"

# Stop Backend Server
Write-Section "🖥️  Stopping Backend Server"
Stop-ProcessByPort -Port 4000 -ServiceName "Backend Server"

# Stop WebSocket Server (if running separately)
Write-Section "🔌 Stopping WebSocket Server"
Stop-ProcessByPort -Port 3001 -ServiceName "WebSocket Server"

# Stop Database (Docker)
Write-Section "🗄️  Stopping Database"
try {
    docker info | Out-Null
    Write-Host "🔄 Stopping database containers..." -ForegroundColor Blue
    Start-Process -FilePath "docker-compose" -ArgumentList "down" -WorkingDirectory $PWD -NoNewWindow -Wait
    Write-Host "✅ Database containers stopped" -ForegroundColor Green
}
catch {
    Write-Host "ℹ️  Docker not available or containers not running" -ForegroundColor Gray
}

# Kill any remaining Node.js processes related to the project
Write-Section "🧹 Cleaning up remaining processes"
try {
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
        $_.Path -like "*DashRacing*" -or 
        $_.CommandLine -like "*react-native*" -or 
        $_.CommandLine -like "*metro*" -or
        $_.CommandLine -like "*backend*"
    }
    
    if ($nodeProcesses) {
        foreach ($process in $nodeProcesses) {
            Write-Host "🔄 Stopping Node.js process (PID: $($process.Id))..." -ForegroundColor Blue
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        }
        Write-Host "✅ Node.js processes cleaned up" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  No additional Node.js processes found" -ForegroundColor Gray
    }
}
catch {
    Write-Host "⚠️  Could not clean up Node.js processes: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Stop any React Native related processes
Write-Section "📱 Stopping React Native processes"
try {
    # Stop adb server
    if (Get-Command adb -ErrorAction SilentlyContinue) {
        Write-Host "🔄 Stopping ADB server..." -ForegroundColor Blue
        Start-Process -FilePath "adb" -ArgumentList "kill-server" -NoNewWindow -Wait
        Write-Host "✅ ADB server stopped" -ForegroundColor Green
    }
    
    # Stop any gradle daemons
    if (Get-Command gradle -ErrorAction SilentlyContinue) {
        Write-Host "🔄 Stopping Gradle daemons..." -ForegroundColor Blue
        Start-Process -FilePath "gradle" -ArgumentList "--stop" -NoNewWindow -Wait -ErrorAction SilentlyContinue
        Write-Host "✅ Gradle daemons stopped" -ForegroundColor Green
    }
}
catch {
    Write-Host "⚠️  Could not stop some Android tools: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Section "🎉 Shutdown Complete"
Write-Host "✅ All DashRacing development services have been stopped" -ForegroundColor Green
Write-Host "📚 To restart the development environment, run: ./start-dev.ps1" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan