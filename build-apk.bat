@echo off
echo ========================================
echo Building GridGhost Mobile App
echo ========================================

:: Set correct JAVA_HOME
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.15.6-hotspot"
echo JAVA_HOME: %JAVA_HOME%

:: Determine build type (default to debug)
set BUILD_TYPE=debug
if "%1"=="release" set BUILD_TYPE=release
echo Build Type: %BUILD_TYPE%

:: Navigate to mobile directory first for bundle
cd /d "%~dp0mobile"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Could not navigate to mobile directory
    pause
    exit /b 1
)

:: Generate bundle first
echo.
echo Generating React Native bundle...
call npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Bundle generation failed
    pause
    exit /b 1
)

:: Navigate to mobile/android directory
cd android
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Could not navigate to mobile\android directory
    pause
    exit /b 1
)

echo Current directory: %CD%

:: Verify gradlew.bat exists
if not exist "gradlew.bat" (
    echo ERROR: gradlew.bat not found in current directory
    pause
    exit /b 1
)

:: Run the build
echo.
echo Building APK with bundle...
if "%BUILD_TYPE%"=="release" (
    echo Building release bundle...
    call gradlew.bat bundleRelease
    echo Building release APK...
    call gradlew.bat assembleRelease
) else (
    echo Building debug bundle...
    call gradlew.bat bundleDebug
    echo Building debug APK...
    call gradlew.bat assembleDebug
)

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo BUILD SUCCESS!
    echo ========================================
    
    :: Find and copy APK to root
    if "%BUILD_TYPE%"=="release" (
        set APK_PATH=app\build\outputs\apk\release\app-release.apk
        set ROOT_APK=GridGhost-release.apk
    ) else (
        set APK_PATH=app\build\outputs\apk\debug\app-debug.apk
        set ROOT_APK=GridGhost-debug.apk
    )
    
    if exist "%APK_PATH%" (
        echo APK Location: %APK_PATH%
        copy "%APK_PATH%" "%~dp0%ROOT_APK%" >nul 2>&1
        if %ERRORLEVEL% EQU 0 (
            echo Copied to root: %ROOT_APK%
        )
    ) else (
        echo WARNING: APK not found at expected location: %APK_PATH%
    )
) else (
    echo.
    echo ========================================
    echo BUILD FAILED!
    echo ========================================
)

echo.
echo Usage from project root:
echo   build-apk.bat          (builds debug APK)
echo   build-apk.bat release  (builds release APK)
pause