# Automated Build and Install Script for Android
# This script handles everything: clean, build, uninstall old app, install new APK

Write-Host "`n🔄 Starting Clean Build and Install Process...`n" -ForegroundColor Cyan

# Step 1: Navigate to web app directory
Write-Host "📍 Step 1: Navigating to web app directory..." -ForegroundColor Yellow
Set-Location $PSScriptRoot
Write-Host "   ✓ Current directory: $(Get-Location)`n" -ForegroundColor Green

# Step 2: Clean old build files
Write-Host "🧹 Step 2: Cleaning old build files..." -ForegroundColor Yellow
Write-Host "   Removing dist folder (old web build)..." -ForegroundColor Gray
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
Write-Host "   Removing Android assets (old bundled files)..." -ForegroundColor Gray
Remove-Item -Recurse -Force android/app/src/main/assets -ErrorAction SilentlyContinue
Write-Host "   Removing Android build cache..." -ForegroundColor Gray
Remove-Item -Recurse -Force android/app/build -ErrorAction SilentlyContinue
Write-Host "   ✓ Cleanup complete`n" -ForegroundColor Green

# Step 3: Clean Android Gradle build
Write-Host "🔧 Step 3: Cleaning Android Gradle build..." -ForegroundColor Yellow
Write-Host "   This removes compiled APK files and build cache..." -ForegroundColor Gray
Set-Location android
& .\gradlew.bat clean 2>&1 | Out-Null
Set-Location ..
Write-Host "   ✓ Gradle clean complete`n" -ForegroundColor Green

# Step 4: Build web app for Android (without service worker)
Write-Host "📦 Step 4: Building web app for Android..." -ForegroundColor Yellow
Write-Host "   This creates a fresh build without service worker (prevents caching issues)..." -ForegroundColor Gray
npm run build:android
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Build failed! Check the error above." -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ Web build complete`n" -ForegroundColor Green

# Step 5: Sync with Capacitor
Write-Host "🔄 Step 5: Syncing with Capacitor..." -ForegroundColor Yellow
Write-Host "   This copies the web build into Android project..." -ForegroundColor Gray
npx cap sync android 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Capacitor sync failed! Check the error above." -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ Capacitor sync complete`n" -ForegroundColor Green

# Step 6: Build Android APK
Write-Host "🔨 Step 6: Building Android APK..." -ForegroundColor Yellow
Write-Host "   This compiles the Android app into an APK file..." -ForegroundColor Gray
Set-Location android
& .\gradlew.bat assembleDebug
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ APK build failed! Check the error above." -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..
Write-Host "   ✓ APK build complete`n" -ForegroundColor Green

# Step 7: Check if device is connected
Write-Host "📱 Step 7: Checking device connection..." -ForegroundColor Yellow
$devices = adb devices
if ($devices -match "device$") {
    Write-Host "   ✓ Device connected`n" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  No device connected or USB debugging not enabled" -ForegroundColor Yellow
    Write-Host "   Please connect your device and enable USB debugging, then run:" -ForegroundColor Yellow
    Write-Host "   adb install android\app\build\outputs\apk\debug\app-debug.apk`n" -ForegroundColor Cyan
    exit 0
}

# Step 8: Clear app data and uninstall old app (automatic)
Write-Host "🗑️  Step 8: Clearing app data and uninstalling old app..." -ForegroundColor Yellow
Write-Host "   This clears cached data and removes the old app to prevent conflicts..." -ForegroundColor Gray

# Try to clear app data first (if app exists)
Write-Host "   Clearing app cache and data..." -ForegroundColor Gray
adb shell pm clear com.farmvisit.app 2>&1 | Out-Null

# Uninstall old app
Write-Host "   Uninstalling old app version..." -ForegroundColor Gray
adb uninstall com.farmvisit.app 2>&1 | Out-Null
Write-Host "   ✓ App data cleared and old app uninstalled`n" -ForegroundColor Green

# Step 9: Install new APK
Write-Host "📲 Step 9: Installing new APK on device..." -ForegroundColor Yellow
Write-Host "   This installs the freshly built APK..." -ForegroundColor Gray
adb install android\app\build\outputs\apk\debug\app-debug.apk
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Installation failed! Check the error above." -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ APK installed successfully`n" -ForegroundColor Green

# Success!
Write-Host "✅ All done! The app should now be installed on your device." -ForegroundColor Green
Write-Host "   Open the app and check the Chat interface - you should see the model selector dropdown.`n" -ForegroundColor Cyan

