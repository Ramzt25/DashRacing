# Build Android APK with correct environment setup
Write-Host "Setting up build environment..." -ForegroundColor Cyan

# Set correct JAVA_HOME
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.15.6-hotspot"
Write-Host "JAVA_HOME set to: $env:JAVA_HOME" -ForegroundColor Green

# Change to mobile directory
Set-Location "C:\Users\tramsey\Projects\DashRacing\mobile"
Write-Host "Working directory: $(Get-Location)" -ForegroundColor Yellow

# Run the build
Write-Host "Starting Android release build..." -ForegroundColor Cyan
Set-Location "android"

try {
    & ".\gradlew.bat" assembleRelease
    if ($LASTEXITCODE -eq 0) {
        Write-Host "BUILD SUCCESS!" -ForegroundColor Green
        Write-Host "APK Location: app\build\outputs\apk\release\app-release.apk" -ForegroundColor Yellow
        
        # Check if APK was created
        $apkPath = "app\build\outputs\apk\release\app-release.apk"
        if (Test-Path $apkPath) {
            $apkSize = (Get-Item $apkPath).Length / 1MB
            Write-Host "APK Size: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Green
        }
    } else {
        Write-Host "BUILD FAILED with exit code $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host "BUILD ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Environment Info:" -ForegroundColor Cyan
Write-Host "Java Version:" -ForegroundColor Yellow
& java -version
Write-Host "JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Yellow