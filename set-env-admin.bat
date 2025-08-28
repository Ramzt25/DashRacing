@echo off
echo 🔧 Setting permanent Android environment variables...
echo.

REM Set JAVA_HOME
setx JAVA_HOME "C:\Program Files\Java\jdk-17" /M
if %errorlevel% equ 0 (
    echo ✅ JAVA_HOME set successfully
) else (
    echo ❌ Failed to set JAVA_HOME
)

REM Set ANDROID_HOME  
setx ANDROID_HOME "C:\Users\%USERNAME%\AppData\Local\Android\Sdk" /M
if %errorlevel% equ 0 (
    echo ✅ ANDROID_HOME set successfully
) else (
    echo ❌ Failed to set ANDROID_HOME
)

REM Add platform-tools to PATH
setx PATH "%PATH%;C:\Users\%USERNAME%\AppData\Local\Android\Sdk\platform-tools" /M
if %errorlevel% equ 0 (
    echo ✅ Added platform-tools to PATH
) else (
    echo ❌ Failed to add to PATH
)

echo.
echo 🎉 Environment variables set permanently!
echo ⚠️  IMPORTANT: Close VS Code and all terminals, then restart them
echo.
echo After restart, you can just run: npm run android
echo.
pause