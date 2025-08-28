Write-Host "🔧 Setting up permanent Android development environment..." -ForegroundColor Yellow

# Define correct paths
$javaHome = "C:\Program Files\Java\jdk-17"
$androidHome = "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk"

# Verify paths exist
Write-Host "Verifying paths..." -ForegroundColor Cyan
if (Test-Path $javaHome) {
    Write-Host "✅ Java found at: $javaHome" -ForegroundColor Green
} else {
    Write-Host "❌ Java path does not exist: $javaHome" -ForegroundColor Red
    exit 1
}

if (Test-Path $androidHome) {
    Write-Host "✅ Android SDK found at: $androidHome" -ForegroundColor Green
} else {
    Write-Host "❌ Android SDK path does not exist: $androidHome" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Setting system environment variables..." -ForegroundColor Yellow

try {
    # Set JAVA_HOME
    [Environment]::SetEnvironmentVariable("JAVA_HOME", $javaHome, [EnvironmentVariableTarget]::Machine)
    Write-Host "✅ JAVA_HOME set" -ForegroundColor Green
    
    # Set ANDROID_HOME  
    [Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidHome, [EnvironmentVariableTarget]::Machine)
    Write-Host "✅ ANDROID_HOME set" -ForegroundColor Green
    
    # Get current PATH
    $currentPath = [Environment]::GetEnvironmentVariable("PATH", [EnvironmentVariableTarget]::Machine)
    
    # Add Android tools to PATH
    $platformTools = "$androidHome\platform-tools"
    $emulatorTools = "$androidHome\emulator"
    
    if ($currentPath -notlike "*$platformTools*") {
        $newPath = "$platformTools;$currentPath"
        [Environment]::SetEnvironmentVariable("PATH", $newPath, [EnvironmentVariableTarget]::Machine)
        Write-Host "✅ Added platform-tools to PATH" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "🎉 SUCCESS! Environment variables set permanently!" -ForegroundColor Green
    Write-Host "⚠️  RESTART your terminal/VS Code for changes to take effect" -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ Failed to set system variables (need admin rights)" -ForegroundColor Red
    Write-Host ""
    Write-Host "MANUAL SETUP:" -ForegroundColor Yellow
    Write-Host "1. Right-click 'This PC' -> Properties -> Advanced -> Environment Variables" -ForegroundColor White
    Write-Host "2. Under System Variables, add:" -ForegroundColor White
    Write-Host "   JAVA_HOME = $javaHome" -ForegroundColor White
    Write-Host "   ANDROID_HOME = $androidHome" -ForegroundColor White
    Write-Host "3. Add to PATH: $androidHome\platform-tools" -ForegroundColor White
}