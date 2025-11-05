# 🔄 Clean Rebuild & Install Guide

**Simple guide to fix the old interface on your device. Follow these steps in order.**

---

## 🚀 Quick Start (Automated)

**Easiest way - run this script and it does EVERYTHING automatically:**

```powershell
cd apps/web
.\build-and-install.ps1
```

**The script automatically:**
- ✅ Cleans old build files on your computer
- ✅ Cleans Android build cache
- ✅ Builds fresh web app (without service worker)
- ✅ Syncs with Capacitor
- ✅ Builds Android APK
- ✅ **Clears app data cache on your device** (automatic)
- ✅ **Uninstalls old app** (automatic)
- ✅ **Installs new APK** (automatic)

**You don't need to clean anything manually!** Just make sure your phone is connected via USB with USB debugging enabled.

---

## 📋 Manual Steps (If you prefer to do it yourself)

### Step 1: Clean Old Build Files

**What this does:** Removes all old compiled files so we start fresh. Old files can cause the device to show outdated code.

```powershell
cd apps/web
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force android/app/src/main/assets -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force android/app/build -ErrorAction SilentlyContinue
```

**Why:** The device might be using cached files from previous builds. We need to delete everything to ensure a clean build.

---

### Step 2: Clean Android Build Cache

**What this does:** Clears Android's build cache so Gradle rebuilds everything from scratch.

```powershell
cd android
.\gradlew.bat clean
cd ..
```

**Why:** Android Gradle keeps cached compiled files. We want to force a complete rebuild to ensure the latest code is included.

---

### Step 3: Build Web App for Android

**What this does:** Compiles your React app into static files, but configured specifically for Android (no service worker).

```powershell
npm run build:android
```

**Why:** The `build:android` command builds without service worker. Service workers cache old files and cause the device to show outdated interfaces. This build mode disables that.

**Check for success:** You should see `dist/index.html` created. If you see `sw.js` or `registerSW.js` files, the build failed - those shouldn't be there for Android builds.

---

### Step 4: Sync with Capacitor

**What this does:** Copies your web build files into the Android project so Android can bundle them into the APK.

```powershell
npx cap sync android
```

**Why:** Capacitor needs to copy your web files into the Android project structure. Without this step, Android won't have your latest code.

---

### Step 5: Build Android APK

**What this does:** Compiles the Android app into an APK file that you can install on your device.

```powershell
cd android
.\gradlew.bat assembleDebug
cd ..
```

**Why:** This creates the actual APK file. The APK contains your web code bundled inside a native Android app.

**APK location:** `android/app/build/outputs/apk/debug/app-debug.apk`

---

### Step 6: Connect Your Device

**What this does:** Makes sure your phone is connected and ready for installation.

```powershell
adb devices
```

**Why:** You need to verify your device is connected via USB and USB debugging is enabled.

**Expected output:** Should show your device ID and "device" status.

**If no device shown:**
- Enable USB debugging in Developer Options on your phone
- Allow USB debugging when prompted
- Try `adb kill-server && adb start-server`

---

### Step 7: Clear App Data & Uninstall Old App (Automatic in Script)

**What this does:** Clears all cached data from the old app, then removes the app completely from your device.

```powershell
# Clear app data cache (removes all cached files)
adb shell pm clear com.farmvisit.app

# Uninstall old app
adb uninstall com.farmvisit.app
```

**Why:** 
- Android caches app data aggressively (including old JavaScript files)
- Clearing data removes all cached files
- Uninstalling ensures a completely fresh install

**Note:** The automated script does both steps automatically. If installing manually, don't skip either step!

---

### Step 8: Install New APK

**What this does:** Installs the freshly built APK on your device.

```powershell
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

**Why:** This puts the new app on your device. After installation, the app should have the latest code with the model selector dropdown.

---

## ✅ Verification

After installation, open the app on your device and:

1. **Tap the "Chat" button** in the top right
2. **Look at the top of the chat drawer** - you should see:
   - A dropdown menu with options:
     - 🤖 Auto (Best Available)
     - 📱 Nano (Offline)
     - ☁️ ChatGPT 4o mini
     - 🦙 Llama Small (Offline)
3. **The dropdown should be visible** - if you only see a simple chat interface, the build didn't work correctly

---

## ❌ Troubleshooting

### Still seeing old interface?

**Check these things:**

1. **Did you use `npm run build:android`?** 
   - NOT `npm run build` - that builds with service worker
   - Must use `build:android` to disable service worker

2. **Did you clean everything in Step 1?**
   - Old files in `dist/` or `android/app/src/main/assets/` can cause issues
   - Make sure you deleted those folders

3. **Did you uninstall the old app?**
   - Android caches app data aggressively
   - Must uninstall before installing new version

4. **Check build output:**
   - Look in `dist/` folder after build
   - Should NOT see `sw.js` or `registerSW.js` files
   - If you see those, the build failed and used the wrong build command

5. **The script should clear app data automatically, but if issues persist:**
   - Settings → Apps → Farm Visit → Clear Data (manual backup)
   - Then uninstall and reinstall

### Build fails?

**"build:android" command not found:**
- Make sure you're in `apps/web` directory
- Run `npm install` first to install dependencies

**ADB not found:**
- Install Android SDK Platform Tools
- Or use Android Studio which includes ADB

**Device not detected:**
- Enable USB debugging in Developer Options
- Allow USB debugging when phone prompts
- Try: `adb kill-server && adb start-server`

---

## 📝 Summary

**The key points:**
- ✅ Always use `npm run build:android` (not `npm run build`)
- ✅ Always clean old files first
- ✅ Always uninstall old app before installing new one
- ✅ Service worker is disabled for Android builds (this prevents caching issues)

**Or just use the automated script:**
```powershell
cd apps/web
.\build-and-install.ps1
```
