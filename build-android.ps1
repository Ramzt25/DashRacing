# Android Build Script
Set-Location "C:\Programming Projects\DashRacing\mobile"
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-11.0.26.4-hotspot"
$env:ANDROID_HOME = "C:\Users\ramzt\AppData\Local\Android\Sdk"
$env:ANDROID_SDK_ROOT = "C:\Users\ramzt\AppData\Local\Android\Sdk"
$env:PATH = "$env:PATH;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$env:ANDROID_HOME\tools;$env:ANDROID_HOME\tools\bin"

Write-Host "Current Directory: $(Get-Location)"
Write-Host "JAVA_HOME: $env:JAVA_HOME"
Write-Host "ANDROID_HOME: $env:ANDROID_HOME"
Write-Host "ANDROID_SDK_ROOT: $env:ANDROID_SDK_ROOT"

npx expo run:android