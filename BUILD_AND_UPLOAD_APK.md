# 📱 Build and Upload APK to GitHub Release

## Quick Steps

### Step 1: Build the APK

```powershell
# Navigate to web app
cd apps/web

# Install dependencies (if not done)
npm install

# Build shared package
cd ../../packages/shared
npm run build
cd ../../apps/web

# Build web app
npm run build

# Sync with Capacitor
npx cap sync android

# Build APK using Gradle
cd android
.\gradlew.bat assembleDebug
```

**APK Location**: `apps/web/android/app/build/outputs/apk/debug/app-debug.apk`

### Step 2: Verify APK Size

```powershell
$apk = Get-Item "apps/web/android/app/build/outputs/apk/debug/app-debug.apk"
Write-Host "APK Size: $([math]::Round($apk.Length / 1MB, 2)) MB"
```

### Step 3: Upload to GitHub Release

1. **Go to GitHub**: https://github.com/aciuffolini/Agentic-Farm-Visit/releases
2. **Click "Edit" on v1.0.8-fix release** (or create new if doesn't exist)
3. **Scroll to "Attach binaries" section**
4. **Drag and drop** the `app-debug.apk` file
5. **Rename it** to: `farm-visit-v1.0.8-fix.apk` (optional but recommended)
6. **Click "Update release"**

### Step 4: Update Download Link (If Needed)

The download button should automatically work once the APK is attached. Users can:
- Click the green download button
- Go to the release page
- Download the APK file

### Alternative: Direct Download Link

If you want a direct download link, update the README button to:
```
[![Download APK](...)](https://github.com/aciuffolini/Agentic-Farm-Visit/releases/download/v1.0.8-fix/farm-visit-v1.0.8-fix.apk)
```

But the release page link is better because users can see release notes and other assets.

## Troubleshooting

**If Gradle fails:**
- Make sure Java JDK 17 is installed: `java -version`
- Try: `.\gradlew.bat clean` then `.\gradlew.bat assembleDebug`

**If APK is too large:**
- Check if node_modules are included (they shouldn't be)
- The APK should be around 10-50 MB typically

**If upload fails:**
- Make sure file is less than 100 MB
- Try renaming to remove spaces/special characters

