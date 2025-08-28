# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ This script needs to run as Administrator!" -ForegroundColor Red
    Write-Host "Please right-click PowerShell and 'Run as administrator'" -ForegroundColor Yellow
    exit 1
}

Write-Host "🔧 Setting permanent Android environment variables..." -ForegroundColor Yellow
Write-Host ""

# Set JAVA_HOME
$javaHome = "C:\Program Files\Java\jdk-17"
[Environment]::SetEnvironmentVariable("JAVA_HOME", $javaHome, [EnvironmentVariableTarget]::Machine)
Write-Host "✅ JAVA_HOME set to: $javaHome" -ForegroundColor Green

# Set ANDROID_HOME
$androidHome = "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk"
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidHome, [EnvironmentVariableTarget]::Machine)
Write-Host "✅ ANDROID_HOME set to: $androidHome" -ForegroundColor Green

# Add platform-tools to PATH
$currentPath = [Environment]::GetEnvironmentVariable("PATH", [EnvironmentVariableTarget]::Machine)
$platformTools = "$androidHome\platform-tools"

if ($currentPath -notlike "*$platformTools*") {
    $newPath = "$platformTools;$currentPath"
    [Environment]::SetEnvironmentVariable("PATH", $newPath, [EnvironmentVariableTarget]::Machine)
    Write-Host "✅ Added platform-tools to PATH: $platformTools" -ForegroundColor Green
} else {
    Write-Host "✅ platform-tools already in PATH" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 SUCCESS! Environment variables set permanently!" -ForegroundColor Green
Write-Host "⚠️  IMPORTANT: Restart VS Code completely for changes to take effect" -ForegroundColor Yellow
Write-Host ""
Write-Host "After restart, test with:" -ForegroundColor Cyan
Write-Host "  java -version" -ForegroundColor White
Write-Host "  adb version" -ForegroundColor White
Write-Host "  npm run android" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to close..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")