# Build and Install Script - Complete APK Build and Installation
# This script builds the APK and immediately installs it to connected device

param(
    [string]$BuildType = "debug"
)

$ADB_PATH = "C:\Users\ramzt\AppData\Local\Android\Sdk\platform-tools\adb.exe"

Write-Host "========================================" -ForegroundColor Green
Write-Host "GridGhost Build & Install Pipeline" -ForegroundColor Green
Write-Host "Build Type: $BuildType" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Step 1: Build APK
Write-Host "`nStep 1: Building APK..." -ForegroundColor Yellow
if ($BuildType -eq "release") {
    & ".\build-apk.bat" release
} else {
    & ".\build-apk.bat"
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed! Exiting..." -ForegroundColor Red
    pause
    exit 1
}

# Step 2: Check if APK was created
$APK_NAME = if ($BuildType -eq "release") { "GridGhost-release.apk" } else { "GridGhost-debug.apk" }
$APK_PATH = ".\$APK_NAME"

if (-not (Test-Path $APK_PATH)) {
    Write-Host "ERROR: APK file not found at $APK_PATH" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "`nStep 2: APK Build Complete!" -ForegroundColor Green
$apkInfo = Get-Item $APK_PATH
Write-Host "APK File: $($apkInfo.Name)" -ForegroundColor Cyan
Write-Host "Size: $([math]::Round($apkInfo.Length / 1MB, 2)) MB" -ForegroundColor Cyan
Write-Host "Modified: $($apkInfo.LastWriteTime)" -ForegroundColor Cyan

# Step 3: Install APK
Write-Host "`nStep 3: Installing to device..." -ForegroundColor Yellow

# Check if ADB exists
if (-not (Test-Path $ADB_PATH)) {
    Write-Host "ERROR: ADB not found at $ADB_PATH" -ForegroundColor Red
    Write-Host "Please check your Android SDK installation" -ForegroundColor Yellow
    pause
    exit 1
}

# Check for connected devices
Write-Host "Checking for connected devices..." -ForegroundColor Yellow
& $ADB_PATH devices

Write-Host "`nInstalling $APK_NAME..." -ForegroundColor Yellow
& $ADB_PATH install -r $APK_PATH

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "BUILD & INSTALL SUCCESS!" -ForegroundColor Green
    Write-Host "GridGhost app has been built and installed" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
} else {
    Write-Host "`n========================================" -ForegroundColor Red
    Write-Host "INSTALLATION FAILED!" -ForegroundColor Red
    Write-Host "Build succeeded but install failed" -ForegroundColor Red
    Write-Host "Exit code: $LASTEXITCODE" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
}

Write-Host "`nUsage:"
Write-Host "  .\build-and-install.ps1           (builds and installs debug APK)"
Write-Host "  .\build-and-install.ps1 release   (builds and installs release APK)"
Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")