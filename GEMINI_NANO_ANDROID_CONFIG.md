# 🔧 Gemini Nano Android Configuration Guide

## ⚠️ Critical Configuration Requirements

For Gemini Nano to work in Android, several configurations must be correct:

### 1. **Android Version Requirement**
- **Minimum**: Android 14 (API 34)
- **Check**: Device Settings → About Phone → Android Version
- The app will automatically check and report if the device doesn't meet requirements

### 2. **ML Kit GenAI Dependency**

**build.gradle** must include:
```gradle
implementation 'com.google.mlkit:genai-prompt:1.0.0-alpha01'
```

**Important**: If the exact package structure differs, the Java imports may need adjustment:
- Current: `com.google.mlkit.genai.prompt.Generation`
- Alternative: `com.google.mlkit.genai.GenerativeModel`

### 3. **Plugin Registration**

**MainActivity.java** must register the plugin:
```java
ArrayList<Class<? extends Plugin>> plugins = new ArrayList<>();
plugins.add(GeminiNanoPlugin.class);
this.init(savedInstanceState, plugins);
```

✅ **Already configured** in the codebase

### 4. **Automatic Initialization**

**App.tsx** now automatically initializes Gemini Nano on app startup:
```typescript
useEffect(() => {
  if (Capacitor.isNativePlatform()) {
    geminiNano.checkAvailability()
      .then((available) => {
        if (available) {
          return geminiNano.initialize();
        }
      });
  }
}, []);
```

✅ **Just added** - will initialize automatically when app starts

### 5. **AndroidManifest Permissions**

**AndroidManifest.xml** includes:
- ✅ AICore feature (optional, not required)
- ✅ All necessary permissions

### 6. **First-Time Model Download**

**Important**: On first use:
1. Device must have **WiFi connection** (model is ~2GB)
2. User must have **sufficient storage space** (~3GB free)
3. The app will automatically download when `initialize()` is called
4. Download happens in background - user can continue using app

## 🔍 Troubleshooting

### "Model not available" Error

**Possible causes:**
1. **Android version < 14**: Check device Android version
2. **Device not compatible**: Not all Android 14 devices have AICore support
   - Compatible: Pixel 8+, Pixel 9, Samsung S24+, etc.
   - Check: Settings → About Phone → Device Model
3. **Model download failed**: 
   - Check WiFi connection
   - Check available storage space
   - Check device logs: `adb logcat | grep GeminiNano`

### "ML Kit GenAI classes not found" Error

**Causes:**
1. **Dependency not included**: Check `build.gradle` has ML Kit dependency
2. **Gradle sync failed**: Rebuild project
3. **Wrong package structure**: ML Kit API may have changed

**Solution:**
```bash
cd apps/web/android
./gradlew clean
./gradlew build --refresh-dependencies
```

### "Model not initialized" Error

**Causes:**
1. `initialize()` was not called
2. Initialization failed silently
3. Device doesn't support Gemini Nano

**Solution:**
- Check browser/device console logs for initialization errors
- Ensure app calls `geminiNano.initialize()` on startup (now automatic)
- Verify device compatibility

### Model Download Issues

**Symptoms:**
- Download starts but fails
- Download hangs indefinitely
- "Failed to download model" error

**Solutions:**
1. **Check WiFi**: Model download requires internet
2. **Check storage**: Ensure 3GB+ free space
3. **Wait longer**: First download can take 10-30 minutes
4. **Retry**: Close and reopen app, initialization will retry

## 📱 Device Compatibility Check

To verify if your device supports Gemini Nano:

1. **Check Android version** (must be 14+)
2. **Check if AICore is available**:
   ```bash
   adb shell pm list features | grep aicore
   ```
   (Should show `android.hardware.aicore`)

3. **Check device model**: Only certain devices have AICore:
   - Google Pixel 8 Pro, Pixel 9 series
   - Samsung Galaxy S24 series
   - Other flagship devices with AICore support

## 🔧 Debugging

### Enable Detailed Logs

The Java plugin now includes detailed logging:
- Check Logcat: `adb logcat | grep GeminiNano`
- Look for:
  - `"Attempting to get Generation client..."`
  - `"Status: ..."`
  - `"Model download successful"` or errors

### Check Initialization Status

In the app console (Chrome DevTools via `adb` or remote debugging):
```
[App] Initializing Gemini Nano...
[GeminiNano] Available on device. Status: ...
[App] Gemini Nano available, initializing...
```

### Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| "Android 14+ required" | Device is Android 13 or below | Use Android 14+ device |
| "ML Kit GenAI classes not found" | Dependency issue | Check build.gradle, rebuild |
| "Model not available. Status: UNAVAILABLE" | Device doesn't support AICore | Use compatible device |
| "Failed to download model" | Network or storage issue | Check WiFi and storage |

## ✅ Verification Checklist

Before reporting Gemini Nano not working:

- [ ] Device is Android 14+
- [ ] Device has AICore support (compatible model)
- [ ] WiFi connected (for first-time download)
- [ ] 3GB+ free storage available
- [ ] App shows initialization logs in console
- [ ] No errors in Logcat (`adb logcat | grep GeminiNano`)
- [ ] Chat drawer opens without crashing
- [ ] Error messages are clear (not generic)

## 🚀 Next Steps

1. **Build new APK** with the initialization fix
2. **Test on Android 14+ device**
3. **Check console logs** for initialization messages
4. **Wait for model download** on first use (can take 10-30 min)
5. **Test chat functionality** after initialization

The app will now automatically initialize Gemini Nano on startup, so users don't need to do anything manually!


