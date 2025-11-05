# 🔧 Fix: Android Device Showing Old Chat Interface

## Problem
The chat interface on Android device shows only the Nano interface (old version), while the terminal/dev server shows the correct multi-model interface with model selection dropdown.

## Root Cause
**Service Worker Caching**: The PWA service worker is caching old JavaScript bundles in the Android app. When the app loads, it uses cached files from previous builds instead of the latest code.

## Solution
Disable service worker for Android builds since Capacitor bundles everything into the APK. Service workers are not needed (and cause issues) in native apps.

### Changes Made

1. **Updated `vite.config.ts`**:
   - Modified to disable PWA plugin when building for Android (`--mode android`)
   - Service worker is only enabled for web builds

2. **Updated `package.json`**:
   - Added `build:android` script that builds with `--mode android`
   - Updated `android:build` and `android:dev` to use `build:android`

## How to Build Fresh APK

### Step 1: Clean Previous Builds
```powershell
cd apps/web
# Remove old build artifacts
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force android/app/src/main/assets/public -ErrorAction SilentlyContinue
```

### Step 2: Build for Android (No Service Worker)
```powershell
# Build web app without service worker
npm run build:android

# Sync with Capacitor
npx cap sync android

# Build APK
cd android
.\gradlew.bat clean
.\gradlew.bat assembleDebug
```

### Step 3: Install on Device
```powershell
# Uninstall old version first (important!)
adb uninstall com.farmvisit.app

# Install new APK
adb install app\build\outputs\apk\debug\app-debug.apk
```

## Verification

After installing the new APK, check:
1. ✅ Chat drawer shows model selection dropdown (🤖 Auto, 📱 Nano, ☁️ ChatGPT 4o mini, 🦙 Llama Small)
2. ✅ No service worker files in `android/app/src/main/assets/public/` (no `sw.js`, `registerSW.js`)
3. ✅ `index.html` doesn't have `<script id="vite-plugin-pwa:register-sw">` tag

## Why This Works

- **Capacitor bundles everything**: All JS/CSS files are bundled into the APK
- **No network requests**: Native app doesn't need service worker for caching
- **Service worker causes issues**: It caches old files and prevents updates
- **Android mode**: Building with `--mode android` disables PWA plugin entirely

## Notes

- Service worker is still enabled for web builds (browser)
- Android builds now use direct file serving (no caching layer)
- This ensures the latest code is always used in the APK

