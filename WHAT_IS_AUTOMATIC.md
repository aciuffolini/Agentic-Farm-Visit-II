# ✅ What's Automatic vs Manual

## 🤖 Automatic (Script Handles Everything)

When you run `.\build-and-install.ps1`, the script automatically:

1. **Cleans build files on your computer:**
   - Removes `dist/` folder (old web build)
   - Removes `android/app/src/main/assets/` (old bundled files)
   - Removes `android/app/build/` (old APK build cache)

2. **Cleans Android build cache:**
   - Runs `gradlew clean` to clear Gradle cache

3. **Builds everything:**
   - Builds web app for Android
   - Syncs with Capacitor
   - Builds Android APK

4. **Clears app cache on your device:**
   - Runs `adb shell pm clear com.farmvisit.app`
   - This removes ALL cached data from the app on your phone

5. **Uninstalls old app:**
   - Runs `adb uninstall com.farmvisit.app`
   - Removes the app completely from your device

6. **Installs new APK:**
   - Installs the freshly built APK automatically

**You don't need to do any of this manually!**

---

## 📱 Manual Steps (Only if needed)

**You only need to do these if something goes wrong:**

### If the script fails:

1. **Check device connection:**
   ```powershell
   adb devices
   ```
   - Should show your device ID
   - If not, enable USB debugging on your phone

2. **Manually clear app data (if script didn't work):**
   - On your phone: Settings → Apps → Farm Visit → Clear Data
   - Then uninstall the app manually

3. **Manually uninstall (if script didn't work):**
   ```powershell
   adb uninstall com.farmvisit.app
   ```

---

## 🎯 Summary

**For normal use:**
- ✅ Just run the script: `.\build-and-install.ps1`
- ✅ Everything is automatic
- ✅ No manual cleaning needed

**Only if script fails:**
- ⚠️ Then manually check device connection
- ⚠️ Then manually clear app data on phone (as backup)

The script handles all cleaning automatically - both on your computer AND on your device!

