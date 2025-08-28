@echo off
echo ========================================
echo RUN BITCH! - GridGhost Express Build & Install
echo ========================================

:: Navigate to project root if not already there
cd /d "%~dp0"

:: Check if we're in the right directory
if not exist "GridGhost-debug.apk" (
    if not exist "build-apk.bat" (
        echo ERROR: Not in the correct directory!
        echo Please run this from the DashRacing project root
        pause
        exit /b 1
    )
)

:: Set environment variables
set "JAVA_HOME=C:\Program Files\Java\jdk-17"
set "ANDROID_HOME=C:\Users\ramzt\AppData\Local\Android\Sdk"
set "ADB_PATH=%ANDROID_HOME%\platform-tools\adb.exe"

echo Current directory: %CD%
echo JAVA_HOME: %JAVA_HOME%
echo ANDROID_HOME: %ANDROID_HOME%

:: Check if APK already exists and is recent (less than 30 minutes old)
set SKIP_BUILD=0
if exist "GridGhost-debug.apk" (
    forfiles /m GridGhost-debug.apk /c "cmd /c echo APK found" 2>nul && (
        echo Found existing APK: GridGhost-debug.apk
        choice /C YN /M "Use existing APK or rebuild? (Y=Use existing, N=Rebuild)"
        if errorlevel 2 (
            echo Rebuilding APK...
        ) else (
            echo Using existing APK...
            set SKIP_BUILD=1
        )
    )
)

:: Build APK if needed
if %SKIP_BUILD%==0 (
    echo.
    echo Building fresh APK...
    call build-apk.bat
    if %ERRORLEVEL% NEQ 0 (
        echo BUILD FAILED!
        pause
        exit /b 1
    )
)

:: Check if APK exists after build
if not exist "GridGhost-debug.apk" (
    echo ERROR: APK not found after build!
    pause
    exit /b 1
)

:: Show APK info
echo.
echo APK Details:
for %%f in (GridGhost-debug.apk) do (
    echo File: %%~nxf
    echo Size: %%~zf bytes
    echo Modified: %%~tf
)

:: Check if ADB exists
if not exist "%ADB_PATH%" (
    echo ERROR: ADB not found at %ADB_PATH%
    echo Please check your Android SDK installation
    pause
    exit /b 1
)

:: Check for connected devices
echo.
echo Checking for connected devices...
"%ADB_PATH%" devices

:: Install APK
echo.
echo Installing GridGhost to device...
"%ADB_PATH%" install -r "GridGhost-debug.apk"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo RUN BITCH SUCCESS! 🏁
    echo GridGhost is installed and ready to race!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo INSTALLATION FAILED! 💥
    echo Check your device connection
    echo ========================================
)

echo.
echo Press any key to exit...
pause >nul