Write-Host "🧪 Testing Android Development Environment..." -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Gray
Write-Host ""

# Test 1: Check environment variables
Write-Host "1. Environment Variables:" -ForegroundColor Yellow
Write-Host "   JAVA_HOME: $env:JAVA_HOME" -ForegroundColor White
Write-Host "   ANDROID_HOME: $env:ANDROID_HOME" -ForegroundColor White

# Test 2: Check if Java works
Write-Host ""
Write-Host "2. Java Installation:" -ForegroundColor Yellow
try {
    java -version
    Write-Host "   ✅ Java is working" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Java not found in PATH" -ForegroundColor Red
}

# Test 3: Check if ADB works  
Write-Host ""
Write-Host "3. Android Debug Bridge:" -ForegroundColor Yellow
try {
    adb version | Select-Object -First 1
    Write-Host "   ✅ ADB is working" -ForegroundColor Green
} catch {
    Write-Host "   ❌ ADB not found in PATH" -ForegroundColor Red
}

# Test 4: Check devices
Write-Host ""
Write-Host "4. Connected Devices:" -ForegroundColor Yellow
try {
    $devices = adb devices
    Write-Host "   $devices" -ForegroundColor White
} catch {
    Write-Host "   ❌ Cannot check devices (ADB not working)" -ForegroundColor Red
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Gray

# Overall assessment
if ($env:JAVA_HOME -and $env:ANDROID_HOME) {
    Write-Host "🎉 Environment variables are set!" -ForegroundColor Green
    Write-Host "🚀 You should now be able to run: npm run android" -ForegroundColor Green
} else {
    Write-Host "❌ Environment variables not set properly" -ForegroundColor Red
    Write-Host "💡 You may need to restart VS Code/Terminal" -ForegroundColor Yellow
}