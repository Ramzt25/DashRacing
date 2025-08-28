# Install APK Script
# Installs the GridGhost debug APK to connected Android device

$ADB_PATH = "C:\Users\ramzt\AppData\Local\Android\Sdk\platform-tools\adb.exe"
$APK_PATH = ".\GridGhost-debug.apk"

Write-Host "========================================" -ForegroundColor Green
Write-Host "Installing GridGhost Mobile App" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Check if APK exists
if (-not (Test-Path $APK_PATH)) {
    Write-Host "ERROR: APK file not found at $APK_PATH" -ForegroundColor Red
    Write-Host "Please run build-apk.bat first to create the APK" -ForegroundColor Yellow
    pause
    exit 1
}

# Check if ADB exists
if (-not (Test-Path $ADB_PATH)) {
    Write-Host "ERROR: ADB not found at $ADB_PATH" -ForegroundColor Red
    Write-Host "Please check your Android SDK installation" -ForegroundColor Yellow
    pause
    exit 1
}

# Get APK info
$apkInfo = Get-Item $APK_PATH
Write-Host "APK File: $($apkInfo.Name)" -ForegroundColor Cyan
Write-Host "Size: $([math]::Round($apkInfo.Length / 1MB, 2)) MB" -ForegroundColor Cyan
Write-Host "Modified: $($apkInfo.LastWriteTime)" -ForegroundColor Cyan
Write-Host ""

# Check for connected devices
Write-Host "Checking for connected devices..." -ForegroundColor Yellow
& $ADB_PATH devices

Write-Host ""
Write-Host "Installing APK..." -ForegroundColor Yellow

# Install APK with replacement flag
$result = & $ADB_PATH install -r $APK_PATH

if ($LASTEXITCODE -eq 0) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "INSTALLATION SUCCESS!" -ForegroundColor Green
    Write-Host "GridGhost app has been installed" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
} else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "INSTALLATION FAILED!" -ForegroundColor Red
    Write-Host "Exit code: $LASTEXITCODE" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")