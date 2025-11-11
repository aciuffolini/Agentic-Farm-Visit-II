# 🔧 Automatic Server Startup Solution

## Problem
- App needs TWO servers running:
  1. **Dev Server** (Vite) - Port 5173 - Serves the app
  2. **API Server** (test-server.js) - Port 3000 - Connects to OpenAI

- Currently: Manual startup required
- Needed: Automatic startup, especially for Android

---

## Solution: Auto-Start Both Servers

### For Development (Web)

**Option 1: Use start-both.bat (Windows)**
```bash
# Double-click or run:
apps/web/start-both.bat
```

**Option 2: npm script (Cross-platform)**
```bash
cd apps/web
npm run dev:all
```

**Option 3: PowerShell script**
```powershell
cd apps/web
.\start-both.ps1
```

---

### For Android App

**Problem:** Android app runs on device, needs API server running somewhere

**Solutions:**

#### Solution A: Production API Server (Recommended)
- Deploy API server to cloud (Vercel, Railway, etc.)
- Android app connects to production API
- No local server needed

#### Solution B: Local Network Server
- Run API server on same WiFi network
- Android app connects to `http://YOUR_IP:3000`
- Requires server running on computer

#### Solution C: Embedded Server (Future)
- Bundle API server with Android app
- Runs locally on device
- More complex but fully offline-capable

---

## Current Setup Analysis

### What We Have:
- ✅ `start-both.bat` - Starts both servers (Windows)
- ✅ `test-server.js` - API server
- ✅ `vite.config.ts` - Dev server config
- ✅ Proxy setup in Vite

### What's Missing:
- ❌ Automatic server detection
- ❌ Fallback to production API
- ❌ Android-specific API endpoint config

---

## Recommended Changes

### 1. Add Production API URL Support

**File:** `apps/web/src/lib/api-simple.ts`

```typescript
// Check if we're in production or Android
const API_BASE = import.meta.env.VITE_API_URL || 
                 (Capacitor.isNativePlatform() 
                   ? 'https://your-api-server.com'  // Production API
                   : '/api');  // Local dev server
```

### 2. Create Android Build Config

**File:** `apps/web/capacitor.config.ts`

```typescript
server: {
  url: process.env.VITE_API_URL || 'https://your-api-server.com',
  cleartext: true  // For local dev only
}
```

### 3. Auto-Detect Server Status

**File:** `apps/web/src/lib/api-simple.ts`

```typescript
// Try local server first, fallback to production
async function getApiBase() {
  if (Capacitor.isNativePlatform()) {
    // Android - use production API
    return import.meta.env.VITE_API_URL || 'https://your-api-server.com';
  }
  
  // Web - try local server, fallback to production
  try {
    const response = await fetch('http://localhost:3000/health');
    if (response.ok) {
      return '/api';  // Use local proxy
    }
  } catch {
    // Local server not running, use production
    return import.meta.env.VITE_API_URL || 'https://your-api-server.com';
  }
}
```

---

## Quick Fix: Update API Client

**For Android:** Use production API URL
**For Web Dev:** Use local server (if running) or production API

This way:
- ✅ Web dev: Works with local server
- ✅ Android: Works with production API (no local server needed)
- ✅ Automatic fallback if local server not running

---

## Next Steps

1. **Set production API URL** in environment variable
2. **Update API client** to auto-detect server
3. **Deploy API server** to cloud (Vercel/Railway/etc.)
4. **Test Android app** with production API

**This solves the "two servers" problem automatically!**

