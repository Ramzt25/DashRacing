# RUN BITCH! - GridGhost Express Build & Install
# PowerShell version for ultimate convenience

param(
    [switch]$Force,
    [switch]$Help
)

if ($Help) {
    Write-Host 'RUN BITCH! - GridGhost Express Build & Install' -ForegroundColor Green
    Write-Host ''
    Write-Host 'Usage:'
    Write-Host '  .\run-bitch.ps1        (smart build + install)'
    Write-Host '  .\run-bitch.ps1 -Force (force rebuild + install)'
    Write-Host '  .\run-bitch.ps1 -Help  (show this help)'
    Write-Host ''
    Write-Host 'This script will:'
    Write-Host '  1. Check for existing APK'
    Write-Host '  2. Build if needed (or forced)'
    Write-Host '  3. Install to connected Android device'
    Write-Host ''
    exit 0
}

$ADB_PATH = 'C:\Users\ramzt\AppData\Local\Android\Sdk\platform-tools\adb.exe'
$APK_NAME = 'GridGhost-debug.apk'

Write-Host '========================================' -ForegroundColor Red
Write-Host '🏁 RUN BITCH! 🏁' -ForegroundColor Red -BackgroundColor Black
Write-Host 'GridGhost Express Build & Install' -ForegroundColor Red
Write-Host '========================================' -ForegroundColor Red

# Ensure we're in the right directory
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot
Write-Host "Working directory: $(Get-Location)" -ForegroundColor Cyan

# Check if we need to build
$needsBuild = $true
if ((Test-Path $APK_NAME) -and (-not $Force)) {
    $apkInfo = Get-Item $APK_NAME
    $ageMinutes = ((Get-Date) - $apkInfo.LastWriteTime).TotalMinutes
    
    Write-Host ''
    Write-Host 'Found existing APK:' -ForegroundColor Yellow
    Write-Host "  File: $($apkInfo.Name)" -ForegroundColor Cyan
    Write-Host "  Size: $([math]::Round($apkInfo.Length / 1MB, 2)) MB" -ForegroundColor Cyan
    Write-Host "  Age: $([math]::Round($ageMinutes, 1)) minutes old" -ForegroundColor Cyan
    
    if ($ageMinutes -lt 30) {
        $choice = Read-Host 'APK is recent. Use existing? (Y/n)'
        if ($choice -eq '' -or $choice -eq 'Y' -or $choice -eq 'y') {
            $needsBuild = $false
            Write-Host 'Using existing APK...' -ForegroundColor Green
        }
    }
}

# Build if needed
if ($needsBuild -or $Force) {
    Write-Host ''
    if ($Force) {
        Write-Host '🔨 FORCE REBUILD REQUESTED!' -ForegroundColor Yellow
    } else {
        Write-Host '🔨 Building fresh APK...' -ForegroundColor Yellow
    }
    
    & '.\build-apk.bat'
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ''
        Write-Host '❌ BUILD FAILED!' -ForegroundColor Red
        Write-Host 'Check the build output above for errors' -ForegroundColor Yellow
        Read-Host 'Press Enter to exit'
        exit 1
    }
    
    Write-Host '✅ BUILD SUCCESS!' -ForegroundColor Green
}

# Verify APK exists
if (-not (Test-Path $APK_NAME)) {
    Write-Host ''
    Write-Host '❌ ERROR: APK not found!' -ForegroundColor Red
    Write-Host "Expected: $APK_NAME" -ForegroundColor Yellow
    Read-Host 'Press Enter to exit'
    exit 1
}

# Show final APK info
$finalApk = Get-Item $APK_NAME
Write-Host ''
Write-Host '📱 APK Ready for Installation:' -ForegroundColor Green
Write-Host "  File: $($finalApk.Name)" -ForegroundColor Cyan
Write-Host "  Size: $([math]::Round($finalApk.Length / 1MB, 2)) MB" -ForegroundColor Cyan
Write-Host "  Modified: $($finalApk.LastWriteTime)" -ForegroundColor Cyan

# Check ADB
if (-not (Test-Path $ADB_PATH)) {
    Write-Host ''
    Write-Host '❌ ERROR: ADB not found!' -ForegroundColor Red
    Write-Host "Path: $ADB_PATH" -ForegroundColor Yellow
    Write-Host 'Please check your Android SDK installation' -ForegroundColor Yellow
    Read-Host 'Press Enter to exit'
    exit 1
}

# Check devices
Write-Host ''
Write-Host '🔍 Checking for connected devices...' -ForegroundColor Yellow
& $ADB_PATH devices

# Install
Write-Host ''
Write-Host '📲 Installing GridGhost to device...' -ForegroundColor Yellow
Write-Host "Command: adb install -r $APK_NAME" -ForegroundColor DarkGray

& $ADB_PATH install -r $APK_NAME

if ($LASTEXITCODE -eq 0) {
    Write-Host ''
    Write-Host '========================================' -ForegroundColor Green
    Write-Host '🎉 RUN BITCH SUCCESS! 🎉' -ForegroundColor Green -BackgroundColor Black
    Write-Host 'GridGhost is installed and ready to race!' -ForegroundColor Green
    Write-Host '🏁 Start your engines! 🏁' -ForegroundColor Green
    Write-Host '========================================' -ForegroundColor Green
} else {
    Write-Host ''
    Write-Host '========================================' -ForegroundColor Red
    Write-Host '💥 INSTALLATION FAILED! 💥' -ForegroundColor Red -BackgroundColor Black
    Write-Host "Exit code: $LASTEXITCODE" -ForegroundColor Red
    Write-Host 'Check your device connection and USB debugging' -ForegroundColor Yellow
    Write-Host '========================================' -ForegroundColor Red
}

Write-Host ''
Write-Host 'Press any key to exit...'
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')