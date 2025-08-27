# GridGhost Debug Monitor Launcher
# Comprehensive logging and error tracking for development

Write-Host "🏁 GridGhost Debug Monitor" -ForegroundColor Red
Write-Host "=======================================" -ForegroundColor Yellow

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Install dependencies if needed
$requiredPackages = @("ws", "axios")
foreach ($package in $requiredPackages) {
    try {
        npm list $package --depth=0 2>$null | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "📦 Installing $package..." -ForegroundColor Yellow
            npm install $package
        } else {
            Write-Host "✅ $package already installed" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️  Could not check $package, attempting install..." -ForegroundColor Yellow
        npm install $package
    }
}

# Create logs directory if it doesn't exist
if (!(Test-Path "logs")) {
    New-Item -ItemType Directory -Name "logs" | Out-Null
    Write-Host "📁 Created logs directory" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Starting Debug Monitor..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Features:" -ForegroundColor White
Write-Host "  • Real-time backend monitoring" -ForegroundColor Gray
Write-Host "  • API endpoint health checks" -ForegroundColor Gray
Write-Host "  • Mobile app error collection" -ForegroundColor Gray
Write-Host "  • Performance metrics tracking" -ForegroundColor Gray
Write-Host "  • Automated error analysis" -ForegroundColor Gray
Write-Host ""
Write-Host "Interactive Commands:" -ForegroundColor White
Write-Host "  • Press 'r' - Generate error report" -ForegroundColor Gray
Write-Host "  • Press 'c' - Clear stats" -ForegroundColor Gray
Write-Host "  • Press 's' - Show settings" -ForegroundColor Gray
Write-Host "  • Press 'q' - Quit monitor" -ForegroundColor Gray
Write-Host ""
Write-Host "=======================================" -ForegroundColor Yellow

# Start the debug monitor
try {
    node debug-monitor.js
} catch {
    Write-Host "❌ Failed to start debug monitor: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Make sure the backend server is running (npm run dev in ./backend)" -ForegroundColor Gray
    Write-Host "2. Check if debug-monitor.js exists in current directory" -ForegroundColor Gray
    Write-Host "3. Verify Node.js has required permissions" -ForegroundColor Gray
    exit 1
}