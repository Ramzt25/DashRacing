@echo off
echo 🚀 GridGhost Android Build with Environment Fix
echo ================================================

REM Set correct environment for this session
set JAVA_HOME=C:\Program Files\Java\jdk-17
set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
set PATH=%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\emulator;%PATH%

echo ✅ Environment configured:
echo    JAVA_HOME: %JAVA_HOME%
echo    ANDROID_HOME: %ANDROID_HOME%

echo.
echo 🧪 Testing tools...
java -version
echo.
adb version
echo.

echo 🔨 Building Android app...
cd /d "C:\Programming Projects\DashRacing\mobile-minimal"
npm run android

echo.
echo 🎉 Build completed!
pause