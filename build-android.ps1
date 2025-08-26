# Android Build Script
Set-Location "C:\DashRacing\gridghost-mobile-v2"
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.15.6-hotspot"
$env:ANDROID_HOME = "C:\Users\tramsey\AppData\Local\Android\Sdk"
$env:ANDROID_SDK_ROOT = "C:\Users\tramsey\AppData\Local\Android\Sdk"

Write-Host "Current Directory: $(Get-Location)"
Write-Host "JAVA_HOME: $env:JAVA_HOME"
Write-Host "ANDROID_HOME: $env:ANDROID_HOME"
Write-Host "ANDROID_SDK_ROOT: $env:ANDROID_SDK_ROOT"

npx expo run:android