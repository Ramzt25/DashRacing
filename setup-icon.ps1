#!/usr/bin/env pwsh

# DashRacing App Icon Setup Script
# This script sets up the new app icon for Android

Write-Host "🎨 Setting up DashRacing App Icon..." -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan

$sourceIcon = "C:\Users\tramsey\Projects\DashRacing\AppIcon.png"
$androidResPath = "C:\Users\tramsey\Projects\DashRacing\mobile\android\app\src\main\res"

# Check if source icon exists
if (-not (Test-Path $sourceIcon)) {
    Write-Host "❌ AppIcon.png not found at $sourceIcon" -ForegroundColor Red
    Write-Host "Please ensure AppIcon.png is in the project root directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found AppIcon.png" -ForegroundColor Green

# Android icon sizes and directories
$androidSizes = @{
    "mipmap-mdpi" = "48x48"
    "mipmap-hdpi" = "72x72" 
    "mipmap-xhdpi" = "96x96"
    "mipmap-xxhdpi" = "144x144"
    "mipmap-xxxhdpi" = "192x192"
}

Write-Host "🔄 Setting up Android icons..." -ForegroundColor Blue

# For now, we'll copy the original icon to each directory
# In a production setup, you'd want to resize the icon for each density
foreach ($density in $androidSizes.Keys) {
    $targetDir = Join-Path $androidResPath $density
    $targetFile = Join-Path $targetDir "ic_launcher.png"
    
    if (Test-Path $targetDir) {
        Write-Host "📁 Copying icon to $density..." -ForegroundColor Gray
        try {
            # Convert PNG from source (basic copy for now)
            Copy-Item $sourceIcon $targetFile -Force
            Write-Host "✅ Icon copied to $density" -ForegroundColor Green
        }
        catch {
            Write-Host "⚠️  Failed to copy to $density : $($_.Exception.Message)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  Directory $targetDir not found" -ForegroundColor Yellow
    }
}

# Also copy to drawable directories for compatibility
$drawableDirs = @("drawable", "drawable-hdpi", "drawable-mdpi", "drawable-xhdpi", "drawable-xxhdpi", "drawable-xxxhdpi")

Write-Host "🔄 Setting up drawable icons..." -ForegroundColor Blue

foreach ($drawableDir in $drawableDirs) {
    $targetDir = Join-Path $androidResPath $drawableDir
    $targetFile = Join-Path $targetDir "ic_launcher.png"
    
    if (Test-Path $targetDir) {
        try {
            Copy-Item $sourceIcon $targetFile -Force
            Write-Host "✅ Icon copied to $drawableDir" -ForegroundColor Green
        }
        catch {
            Write-Host "⚠️  Failed to copy to $drawableDir : $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n🎉 App Icon Setup Complete!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "📱 The new app icon has been installed for Android" -ForegroundColor White
Write-Host "🔄 Rebuild the app to see the new icon:" -ForegroundColor Yellow
Write-Host "   cd mobile && npx react-native run-android" -ForegroundColor White
Write-Host "================================================================" -ForegroundColor Cyan

Write-Host "`n📝 Note: For production apps, you should:" -ForegroundColor Yellow
Write-Host "   1. Create properly sized icons for each density" -ForegroundColor White  
Write-Host "   2. Use vector drawable or adaptive icons" -ForegroundColor White
Write-Host "   3. Test on different Android versions" -ForegroundColor White