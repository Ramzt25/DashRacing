@echo off
echo Setting JAVA_HOME for build...
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.15.6-hotspot"
echo JAVA_HOME is now: %JAVA_HOME%

echo.
echo Building release APK...
cd /d "C:\Users\tramsey\Projects\DashRacing\mobile\android"
call gradlew assembleRelease

echo.
if %ERRORLEVEL% EQU 0 (
    echo ✅ BUILD SUCCESS! APK created successfully.
    echo 📱 APK Location: app\build\outputs\apk\release\app-release.apk
) else (
    echo ❌ BUILD FAILED with error code %ERRORLEVEL%
)

pause