Write-Host "🚀 Testing GridGhost Minimal App Build..." -ForegroundColor Green
Write-Host "📍 Current Phase: Phase 1.1 - Basic app structure" -ForegroundColor Yellow
Write-Host "🧹 All Android conflicts removed, Expo dependencies cleaned" -ForegroundColor Green
Write-Host ""

# Verify we're in the right place
if (-not (Test-Path "c:\Programming Projects\DashRacing\mobile-minimal")) {
    Write-Host "❌ FAILED: mobile-minimal directory not found!" -ForegroundColor Red
    exit 1
}

# Change to minimal app directory
Set-Location "c:\Programming Projects\DashRacing\mobile-minimal"

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ FAILED: npm install failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green

# Clean any previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Blue
if (Get-Command "npm" -ErrorAction SilentlyContinue) {
    npm run clean
}

if (Test-Path "android") {
    cd android
    if (Test-Path "./gradlew") {
        ./gradlew clean
    }
    cd ..
}

# Try to build
Write-Host "🔨 Building Android app..." -ForegroundColor Blue
npm run android

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 SUCCESS: Phase 1.1 Complete!" -ForegroundColor Green
    Write-Host "✅ Basic app structure is working" -ForegroundColor Green
    Write-Host "📝 Update status file and proceed to Phase 1.2" -ForegroundColor Yellow
} else {
    Write-Host "❌ FAILED: Build failed" -ForegroundColor Red
    Write-Host "🔍 Check the error output above" -ForegroundColor Yellow
    Write-Host "📝 Document issues in status file" -ForegroundColor Yellow
}