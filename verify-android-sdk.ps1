#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Android SDK Verification Script for GridGhost/DashRacing
.DESCRIPTION
    This script checks your Android SDK installation and identifies missing components.
    Run this if you're having Android build issues.
.EXAMPLE
    .\verify-android-sdk.ps1
#>

# Colors for output
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Cyan = "Cyan"

function Write-Status {
    param([string]$Message, [string]$Status)
    if ($Status -eq "OK") {
        Write-Host "✅ $Message" -ForegroundColor $Green
    } else {
        Write-Host "❌ $Message" -ForegroundColor $Red
    }
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor $Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor $Cyan
}

Write-Host @"
🔍 Android SDK Verification for GridGhost Development
===================================================
"@ -ForegroundColor $Cyan

# Check environment variables
Write-Host "`n📋 Environment Variables:" -ForegroundColor $Cyan
$androidHome = $env:ANDROID_HOME
$androidSdkRoot = $env:ANDROID_SDK_ROOT
$javaHome = $env:JAVA_HOME

if ($androidHome) {
    Write-Status "ANDROID_HOME is set: $androidHome" "OK"
} else {
    Write-Status "ANDROID_HOME is not set" "FAIL"
    $androidHome = "C:\Users\tramsey\AppData\Local\Android\Sdk"
    Write-Warning "Using default path: $androidHome"
}

if ($androidSdkRoot) {
    Write-Status "ANDROID_SDK_ROOT is set: $androidSdkRoot" "OK"
} else {
    Write-Status "ANDROID_SDK_ROOT is not set" "FAIL"
    Write-Warning "ANDROID_SDK_ROOT should be set to the same path as ANDROID_HOME"
    $missingComponents += "ANDROID_SDK_ROOT"
}

if ($javaHome) {
    Write-Status "JAVA_HOME is set: $javaHome" "OK"
} else {
    Write-Status "JAVA_HOME is not set" "FAIL"
    $missingComponents += "JAVA_HOME"
}

# Check Android SDK directory structure
Write-Host "`n📁 Android SDK Directory Structure:" -ForegroundColor $Cyan

$sdkComponents = @{
    "Android SDK Root" = $androidHome
    "Platform Tools" = "$androidHome\platform-tools"
    "Build Tools" = "$androidHome\build-tools" 
    "Platforms" = "$androidHome\platforms"
    "Emulator" = "$androidHome\emulator"
    "Command Line Tools" = "$androidHome\cmdline-tools"
}

$missingComponents = @()
foreach ($component in $sdkComponents.GetEnumerator()) {
    if (Test-Path $component.Value) {
        Write-Status $component.Key "OK"
    } else {
        Write-Status "$($component.Key) - Path: $($component.Value)" "FAIL"
        $missingComponents += $component.Key
    }
}

# Check specific executables
Write-Host "`n🔧 Essential Tools:" -ForegroundColor $Cyan

$tools = @{
    "ADB" = "$androidHome\platform-tools\adb.exe"
    "Emulator" = "$androidHome\emulator\emulator.exe"
}

foreach ($tool in $tools.GetEnumerator()) {
    if (Test-Path $tool.Value) {
        Write-Status $tool.Key "OK"
        
        # Test tool version
        try {
            if ($tool.Key -eq "ADB") {
                $version = & $tool.Value version 2>$null | Select-Object -First 1
                Write-Info "$($tool.Key) version: $version"
            }
        } catch {
            Write-Warning "Could not get $($tool.Key) version"
        }
    } else {
        Write-Status "$($tool.Key) - Path: $($tool.Value)" "FAIL"
        $missingComponents += $tool.Key
    }
}

# Check build-tools versions
Write-Host "`n🔨 Build Tools Versions:" -ForegroundColor $Cyan
$buildToolsPath = "$androidHome\build-tools"
if (Test-Path $buildToolsPath) {
    $buildToolsVersions = Get-ChildItem $buildToolsPath -Directory | Sort-Object Name -Descending
    if ($buildToolsVersions.Count -gt 0) {
        Write-Status "Build Tools found" "OK"
        $buildToolsVersions | ForEach-Object {
            Write-Info "Version: $($_.Name)"
        }
        
        # Check if latest version has required files
        $latestVersion = $buildToolsVersions[0]
        $requiredFiles = @("aapt.exe", "dx.bat", "zipalign.exe")
        foreach ($file in $requiredFiles) {
            $filePath = Join-Path $latestVersion.FullName $file
            if (Test-Path $filePath) {
                Write-Status "  $file" "OK"
            } else {
                Write-Status "  $file" "FAIL"
                $missingComponents += "$file in build-tools"
            }
        }
    } else {
        Write-Status "No build-tools versions found" "FAIL"
        $missingComponents += "Build Tools Versions"
    }
} else {
    Write-Status "Build Tools directory not found" "FAIL"
}

# Check platform versions
Write-Host "`n📱 Android Platform Versions:" -ForegroundColor $Cyan
$platformsPath = "$androidHome\platforms"
if (Test-Path $platformsPath) {
    $platforms = Get-ChildItem $platformsPath -Directory | Sort-Object Name -Descending
    if ($platforms.Count -gt 0) {
        Write-Status "Android Platforms found" "OK"
        $platforms | ForEach-Object {
            Write-Info "Platform: $($_.Name)"
        }
    } else {
        Write-Status "No Android platforms found" "FAIL"
        $missingComponents += "Android Platforms"
    }
} else {
    Write-Status "Platforms directory not found" "FAIL"
}

# Check Node.js installation
Write-Host "`n🟢 Node.js Installation:" -ForegroundColor $Cyan
try {
    $nodeVersion = & node --version 2>&1
    if ($nodeVersion -match "v(\d+)\.") {
        $majorVersion = [int]$matches[1]
        if ($majorVersion -ge 16) {
            Write-Status "Node.js $nodeVersion (compatible with React Native 0.79.5)" "OK"
        } else {
            Write-Status "Node.js $nodeVersion (requires v16+ for React Native 0.79.5)" "FAIL"
            $missingComponents += "Node.js 16+"
        }
    } else {
        Write-Status "Node.js version: $nodeVersion" "OK"
    }
} catch {
    Write-Status "Node.js not found in PATH" "FAIL"
    $missingComponents += "Node.js"
}

# Check NPM installation
try {
    $npmVersion = & npm --version 2>&1
    Write-Status "npm $npmVersion" "OK"
} catch {
    Write-Status "npm not found in PATH" "FAIL"
    $missingComponents += "npm"
}

# Check Java installation
Write-Host "`n☕ Java Installation:" -ForegroundColor $Cyan
try {
    $javaVersion = & java -version 2>&1 | Select-Object -First 1
    if ($javaVersion -match "17\.") {
        Write-Status "Java 17 detected: $javaVersion" "OK"
    } else {
        Write-Status "Java version: $javaVersion (should be Java 17)" "FAIL"
        $missingComponents += "Java 17"
    }
} catch {
    Write-Status "Java not found in PATH" "FAIL"
    $missingComponents += "Java"
}

# Run React Native doctor
Write-Host "`n🏥 React Native Doctor:" -ForegroundColor $Cyan
try {
    Write-Info "Running 'npx react-native doctor'..."
    $doctorOutput = & npx react-native doctor 2>&1
    
    # Convert to string for pattern matching
    $outputString = $doctorOutput -join "`n"
    
    if ($outputString -match "Android SDK.*Not Found" -or $outputString -match "ANDROID_HOME.*not found" -or $outputString -match "ANDROID_SDK_ROOT.*not found") {
        Write-Status "React Native Doctor: Android SDK issue detected" "FAIL"
        $missingComponents += "React Native Android SDK Detection"
    } elseif ($outputString -match "Errors:\s*0" -or $outputString -match "✓.*Android SDK") {
        Write-Status "React Native Doctor: All checks passed" "OK"
    } else {
        Write-Warning "React Native Doctor found some issues"
        Write-Host $outputString -ForegroundColor $Yellow
        if ($outputString -match "✖" -or $outputString -match "✗") {
            $missingComponents += "React Native Doctor Issues"
        }
    }
} catch {
    Write-Warning "Could not run React Native doctor: $($_.Exception.Message)"
    $missingComponents += "React Native CLI"
}

# Summary and recommendations
Write-Host "`n📋 Summary:" -ForegroundColor $Cyan

if ($missingComponents.Count -eq 0) {
    Write-Host "🎉 All Android SDK components are properly installed!" -ForegroundColor $Green
    Write-Host "Your development environment should work correctly." -ForegroundColor $Green
} else {
    Write-Host "⚠️  Missing or problematic components found:" -ForegroundColor $Yellow
    $missingComponents | ForEach-Object {
        Write-Host "  • $_" -ForegroundColor $Red
    }
    
    Write-Host "`n🔧 Recommended Actions:" -ForegroundColor $Cyan
    
    # Check if environment variables are the issue
    if ($missingComponents -contains "ANDROID_SDK_ROOT" -or $missingComponents -contains "JAVA_HOME") {
        Write-Host "📋 Environment Variable Issues Detected:" -ForegroundColor $Yellow
        Write-Host "Run these commands in PowerShell to fix environment variables:" -ForegroundColor $Yellow
        Write-Host "`$env:JAVA_HOME = `"C:\Program Files\Eclipse Adoptium\jdk-17.0.15.6-hotspot`"" -ForegroundColor $Green
        Write-Host "`$env:ANDROID_HOME = `"C:\Users\tramsey\AppData\Local\Android\Sdk`"" -ForegroundColor $Green
        Write-Host "`$env:ANDROID_SDK_ROOT = `"C:\Users\tramsey\AppData\Local\Android\Sdk`"" -ForegroundColor $Green
        Write-Host "`$env:PATH = `"`$env:PATH;`$env:ANDROID_HOME\platform-tools;`$env:ANDROID_HOME\emulator`"" -ForegroundColor $Green
        Write-Host ""
    }
    
    Write-Host "📦 For missing SDK components:" -ForegroundColor $Yellow
    Write-Host "1. Open Android Studio" -ForegroundColor $Yellow
    Write-Host "2. Go to Tools > SDK Manager" -ForegroundColor $Yellow
    Write-Host "3. In 'SDK Platforms' tab: Install Android 14 (API 34)" -ForegroundColor $Yellow
    Write-Host "4. In 'SDK Tools' tab: Install/Update:" -ForegroundColor $Yellow
    Write-Host "   • Android SDK Build-Tools" -ForegroundColor $Yellow
    Write-Host "   • Android SDK Platform-Tools" -ForegroundColor $Yellow
    Write-Host "   • Android SDK Command-line Tools (latest)" -ForegroundColor $Yellow
    Write-Host "   • Android Emulator" -ForegroundColor $Yellow
    Write-Host "5. Restart your terminal and run this script again" -ForegroundColor $Yellow
}

Write-Host "`n🚀 Ready to continue development!" -ForegroundColor $Cyan