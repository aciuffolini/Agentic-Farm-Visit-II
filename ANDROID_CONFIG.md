# Android Configuration Guide

## Environment Variables

### For Android Builds

Create `.env.production` or set in build process:

```bash
VITE_API_URL=https://your-production-api.com
VITE_APP_PASSWORD_HASH=<sha256-hash-of-Fotheringham933@>
```

### Default Password

**Android version requires:** `Fotheringham933@`

This is hardcoded in `apps/web/src/lib/config/password.ts` for Android compatibility.

---

## Build Configuration

### Android Build Steps

1. **Set Production API URL:**
   ```bash
   # Create .env.production
   echo "VITE_API_URL=https://your-api-server.com" > apps/web/.env.production
   ```

2. **Build for Android:**
   ```bash
   cd apps/web
   npm run build:android
   ```

3. **Sync Capacitor:**
   ```bash
   npx cap sync android
   ```

4. **Open in Android Studio:**
   ```bash
   npx cap open android
   ```

---

## API Server Requirements

### For Android App

The Android app needs a **production API server** because:
- No local server on device
- Must connect to internet API
- Uses `VITE_API_URL` environment variable

### Options:

1. **Deploy test-server.js to cloud:**
   - Vercel, Railway, Render, etc.
   - Set `VITE_API_URL` to deployed URL

2. **Use existing API:**
   - Set `VITE_API_URL` to your API endpoint
   - Must support `/chat` endpoint with SSE streaming

---

## Password Authentication

**Default Password:** `Fotheringham933@`

- Hardcoded for Android compatibility
- Can be overridden with `VITE_APP_PASSWORD_HASH`
- Stored in `apps/web/src/lib/config/password.ts`

---

## GPS Configuration

GPS is configured in `capacitor.config.ts`:
- Permissions: `coarseLocation` and `fineLocation`
- Uses Capacitor Geolocation plugin
- Works automatically on Android

---

## Troubleshooting

### "VITE_API_URL not configured" Error

**Solution:** Set `VITE_API_URL` before building:
```bash
export VITE_API_URL=https://your-api-server.com
npm run build:android
```

### Password Not Working

**Check:** Password is `Fotheringham933@` (case-sensitive)

### GPS Not Working

**Check:**
1. Permissions granted in Android settings
2. Location services enabled on device
3. Clear view of sky for GPS signal

---

## Quick Start for Android

```bash
# 1. Set API URL
cd apps/web
echo "VITE_API_URL=https://your-api-server.com" > .env.production

# 2. Build
npm run build:android

# 3. Sync
npx cap sync android

# 4. Open Android Studio
npx cap open android

# 5. Run on device/emulator
```

