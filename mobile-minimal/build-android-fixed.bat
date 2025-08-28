@echo off
echo 🔧 Setting up Android Environment for this session...

REM Set correct paths
set JAVA_HOME=C:\Program Files\Java\jdk-17
set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
set PATH=%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\emulator;%ANDROID_HOME%\tools;%ANDROID_HOME%\tools\bin;%PATH%

echo ✅ JAVA_HOME: %JAVA_HOME%
echo ✅ ANDROID_HOME: %ANDROID_HOME%

echo 🧪 Testing environment...
echo Java version:
java -version

echo ADB version:
adb version

echo Connected devices:
adb devices

echo 🚀 Environment ready! Running Android build...
npm run android