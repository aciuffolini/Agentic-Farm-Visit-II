# ✅ Step-by-Step Verification Checklist

## 🎯 Current Status Check

### Step 1: Verify Version Consistency
```bash
# Check latest tag
git describe --tags --abbrev=0

# Should show: v1.0.7 (or latest)
# If shows v1.0.5 or v1.0.6, update README
```

### Step 2: Check GitHub Pages Status
- **Yes, GitHub Pages is active** (see `.github/workflows/deploy-pages.yml`)
- Auto-deploys on every push to `main`
- Live URL: https://aciuffolini.github.io/Agentic-Farm-Visit/

### Step 3: Verify API Key Format (CRITICAL)

**❌ WRONG:**
```
"sk-abc123..."  (with quotes)
'sk-abc123...'  (with quotes)
```

**✅ CORRECT:**
```
sk-abc123...    (NO quotes)
```

**In ChatDrawer UI:**
- User should type: `sk-abc123...` (no quotes)
- Code will handle it correctly (already strips quotes if added)

---

## 🔧 Fixing Issues

### Issue 1: Changes Not Showing on Device

**Problem:** Code running from command line but device shows old version

**Solution:**

```bash
# 1. Rebuild the web app
cd apps/web
npm run build

# 2. Sync Capacitor Android (updates Android project)
npx cap sync android

# 3. Rebuild Android APK
cd android
.\gradlew.bat assembleDebug

# 4. Install new APK on device
# APK location: android/app/build/outputs/apk/debug/app-debug.apk
```

**Alternative (if using Android Studio):**
```bash
# 1. Build web app
cd apps/web
npm run build

# 2. Sync
npx cap sync android

# 3. Open in Android Studio
npx cap open android

# 4. In Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)
```

---

### Issue 2: gpt-4o-mini Not Working After API Key Set

**Checklist:**
- [ ] API key has NO quotes (just `sk-...`)
- [ ] Server is running (if using test server)
- [ ] `VITE_API_URL` is set correctly
- [ ] Check browser console for errors
- [ ] Verify API key format in localStorage

**Debug Steps:**

1. **Check stored API key:**
   ```javascript
   // In browser console (Chrome DevTools)
   localStorage.getItem('user_api_key')
   // Should return: "sk-abc123..." (string, no extra quotes)
   ```

2. **Check network request:**
   - Open DevTools → Network tab
   - Send a chat message
   - Find `/api/chat` request
   - Check Request Headers: Should show `X-API-Key: sk-...` (no quotes)

3. **Check server logs:**
   - If using test server, check server console
   - Should see API key in headers
   - Should see OpenAI API call

---

### Issue 3: Version Confusion (1.0.5 vs 1.0.7)

**Current Status:**
- **README.md**: v1.0.7 ✅
- **Latest Git Tag**: Check with `git describe --tags`
- **GitHub Releases**: May show older versions

**Fix:**
```bash
# Create/update tag to v1.0.7
git tag -f v1.0.7
git push origin v1.0.7 --force

# Or create new release on GitHub manually
```

---

### Issue 4: GitHub Pages Status

**Current Setup:**
- ✅ GitHub Pages workflow is active (`.github/workflows/deploy-pages.yml`)
- ✅ Auto-deploys on every push to `main` branch
- ✅ Live at: https://aciuffolini.github.io/Agentic-Farm-Visit/

**Check if working:**
```bash
# Visit in browser:
https://aciuffolini.github.io/Agentic-Farm-Visit/

# Should show the web app
# If not, check GitHub → Settings → Pages
```

---

## 📋 Complete Verification Process

### Part A: Code Verification

1. **Check current commit:**
   ```bash
   git log -1 --oneline
   # Should show latest changes
   ```

2. **Verify files changed:**
   ```bash
   git status
   # Should show committed files
   ```

3. **Check for uncommitted changes:**
   ```bash
   git diff
   # Should be empty (all committed)
   ```

### Part B: Build Verification

1. **Rebuild web app:**
   ```bash
   cd apps/web
   npm run build
   # Should complete without errors
   ```

2. **Verify dist folder:**
   ```bash
   ls apps/web/dist/
   # Should contain: index.html, assets/, etc.
   ```

3. **Sync Capacitor:**
   ```bash
   npx cap sync android
   # Should sync successfully
   ```

### Part C: Android APK Build

1. **Build APK:**
   ```bash
   cd apps/web/android
   .\gradlew.bat assembleDebug
   # Should create: app/build/outputs/apk/debug/app-debug.apk
   ```

2. **Verify APK:**
   ```bash
   # Check APK exists and has recent timestamp
   ls -lh app/build/outputs/apk/debug/app-debug.apk
   ```

### Part D: Device Testing

1. **Install APK on device:**
   - Transfer `app-debug.apk` to device
   - Install (enable Unknown Sources)
   - Launch app

2. **Test Chat:**
   - Open chat drawer
   - Should see API key button (🔑)
   - If no API key: input should appear after 1 second
   - Enter API key (NO quotes): `sk-abc123...`
   - Send test message

3. **Check console logs:**
   - Connect device via USB
   - Run: `adb logcat | grep -E "ChatDrawer|LLMProvider|GeminiNano"`
   - Should see provider selection logs

---

## 🐛 Common Issues & Fixes

### Issue: "Changes not showing on device"

**Root Cause:** APK not rebuilt after code changes

**Fix:**
1. Rebuild web app: `npm run build`
2. Sync Capacitor: `npx cap sync android`
3. Rebuild APK: `.\gradlew.bat assembleDebug`
4. Reinstall on device

### Issue: "gpt-4o-mini not working"

**Possible Causes:**
1. API key has quotes (should NOT)
2. Server not running (if using test server)
3. Wrong API endpoint
4. Invalid API key

**Fix:**
1. Check API key in localStorage (no quotes)
2. Verify server is running (if using test server)
3. Check `VITE_API_URL` environment variable
4. Test API key directly with OpenAI API

### Issue: "API key input not showing"

**Fix:**
1. Clear browser cache / app data
2. Rebuild and reinstall APK
3. Open chat drawer
4. Wait 1 second (auto-show trigger)

---

## ✅ Pre-Commit Checklist

Before committing, verify:
- [ ] All version numbers match (v1.0.7)
- [ ] README download button shows correct version
- [ ] API key format is correct (no quotes in code)
- [ ] Code builds without errors
- [ ] Capacitor sync works
- [ ] GitHub Pages is configured

---

## 📝 Next Steps After Verification

1. **Fix any issues found**
2. **Commit fixes**
3. **Rebuild APK**
4. **Test on device**
5. **Provide feedback for next iteration**

