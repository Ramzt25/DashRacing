# Fix Android Development Environment Variables

Write-Host "🔧 Fixing Android Development Environment..." -ForegroundColor Yellow

# Set correct JAVA_HOME
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
Write-Host "✅ JAVA_HOME set to: $env:JAVA_HOME" -ForegroundColor Green

# Set ANDROID_HOME
$env:ANDROID_HOME = "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk"
Write-Host "✅ ANDROID_HOME set to: $env:ANDROID_HOME" -ForegroundColor Green

# Add Android tools to PATH
$env:PATH = "$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools;$env:ANDROID_HOME\tools\bin;$env:PATH"
Write-Host "✅ Added Android tools to PATH" -ForegroundColor Green

# Verify fixes
Write-Host "`n🧪 Verifying environment..." -ForegroundColor Cyan

Write-Host "JAVA_HOME: $env:JAVA_HOME" -ForegroundColor White
Write-Host "Java exists: $(Test-Path "$env:JAVA_HOME\bin\java.exe")" -ForegroundColor White

Write-Host "ANDROID_HOME: $env:ANDROID_HOME" -ForegroundColor White  
Write-Host "ADB exists: $(Test-Path "$env:ANDROID_HOME\platform-tools\adb.exe")" -ForegroundColor White

# Test ADB
Write-Host "`n🔍 Testing ADB..." -ForegroundColor Cyan
& "$env:ANDROID_HOME\platform-tools\adb.exe" version

Write-Host "`n🎯 Environment fixed! You can now run Android builds." -ForegroundColor Green
Write-Host "📝 To make this permanent, add these to your system environment variables." -ForegroundColor Yellow