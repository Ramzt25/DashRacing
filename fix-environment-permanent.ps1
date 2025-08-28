# Permanent Android Environment Fix Script
# This will set system-wide environment variables

Write-Host "🔧 Setting up permanent Android development environment..." -ForegroundColor Yellow
Write-Host ""

# Define the correct paths
$javaHome = "C:\Program Files\Java\jdk-17"
$androidHome = "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk"

# Verify paths exist
Write-Host "🔍 Verifying paths..." -ForegroundColor Cyan
if (-not (Test-Path $javaHome)) {
    Write-Host "❌ ERROR: Java path does not exist: $javaHome" -ForegroundColor Red
    Write-Host "🔍 Looking for Java installations..." -ForegroundColor Yellow
    Get-ChildItem "C:\Program Files\Java" -ErrorAction SilentlyContinue
    exit 1
}

if (-not (Test-Path $androidHome)) {
    Write-Host "❌ ERROR: Android SDK path does not exist: $androidHome" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Java found at: $javaHome" -ForegroundColor Green
Write-Host "✅ Android SDK found at: $androidHome" -ForegroundColor Green
Write-Host ""

# Set system environment variables (requires admin rights)
try {
    Write-Host "🔐 Setting system environment variables..." -ForegroundColor Yellow
    Write-Host "   This requires administrator privileges" -ForegroundColor Gray
    
    # Set JAVA_HOME
    [Environment]::SetEnvironmentVariable("JAVA_HOME", $javaHome, [EnvironmentVariableTarget]::Machine)
    Write-Host "✅ JAVA_HOME set to: $javaHome" -ForegroundColor Green
    
    # Set ANDROID_HOME  
    [Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidHome, [EnvironmentVariableTarget]::Machine)
    Write-Host "✅ ANDROID_HOME set to: $androidHome" -ForegroundColor Green
    
    # Get current system PATH
    $currentPath = [Environment]::GetEnvironmentVariable("PATH", [EnvironmentVariableTarget]::Machine)
    
    # Define Android tools paths
    $androidPaths = @(
        "$androidHome\platform-tools",
        "$androidHome\emulator", 
        "$androidHome\tools",
        "$androidHome\tools\bin"
    )
    
    # Add Android paths to system PATH if not already present
    $pathUpdated = $false
    foreach ($androidPath in $androidPaths) {
        if ($currentPath -notlike "*$androidPath*") {
            $currentPath = "$androidPath;$currentPath"
            $pathUpdated = $true
            Write-Host "✅ Added to PATH: $androidPath" -ForegroundColor Green
        } else {
            Write-Host "ℹ️  Already in PATH: $androidPath" -ForegroundColor Gray
        }
    }
    
    if ($pathUpdated) {
        [Environment]::SetEnvironmentVariable("PATH", $currentPath, [EnvironmentVariableTarget]::Machine)
        Write-Host "✅ System PATH updated" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "🎉 SUCCESS! Environment variables set permanently!" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANT: You need to restart your terminal/IDE for changes to take effect" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🔄 After restart, you can just run:" -ForegroundColor Cyan
    Write-Host "   npm run android" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ ERROR: Failed to set system environment variables" -ForegroundColor Red
    Write-Host "This usually happens when not running as administrator" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🔧 SOLUTION 1: Run PowerShell as Administrator and try again" -ForegroundColor Cyan
    Write-Host "🔧 SOLUTION 2: Set manually via Windows System Properties" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Manual setup instructions:" -ForegroundColor Yellow
    Write-Host "1. Open System Properties (Win + R, type sysdm.cpl)" -ForegroundColor White
    Write-Host "2. Click 'Environment Variables'" -ForegroundColor White
    Write-Host "3. Under System Variables, add/edit:" -ForegroundColor White
    Write-Host "   - JAVA_HOME = $javaHome" -ForegroundColor White
    Write-Host "   - ANDROID_HOME = $androidHome" -ForegroundColor White
    Write-Host "4. Add to PATH:" -ForegroundColor White
    foreach ($androidPath in $androidPaths) {
        Write-Host "   - $androidPath" -ForegroundColor White
    }
    Write-Host ""
}

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")