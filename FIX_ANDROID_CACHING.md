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

**⚠️ IMPORTANT: Follow the steps in [CLEAN_REBUILD_GUIDE.md](./CLEAN_REBUILD_GUIDE.md) for a complete, step-by-step guide.**

Quick summary:
1. **Clean everything** (dist, android assets, build folders)
2. **Build with `npm run build:android`** (disables service worker)
3. **Sync Capacitor** (`npx cap sync android`)
4. **Build APK** (`.\gradlew.bat assembleDebug`)
5. **Uninstall old app** (`adb uninstall com.farmvisit.app`)
6. **Install new APK** (`adb install app\build\outputs\apk\debug\app-debug.apk`)

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

