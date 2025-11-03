# 🔍 Complete Implementation Verification

## Current Architecture Review

### 1. API Request Flow

**Client Side (apps/web/src/lib/api.ts):**
```typescript
const API_BASE = import.meta.env.VITE_API_URL || '/api';
// Uses: '/api' (default) or VITE_API_URL if set
```

**Request URLs:**
- Chat: `${API_BASE}/chat` → `/api/chat`
- Visits GET: `${API_BASE}/visits` → `/api/visits`
- Visits POST: `${API_BASE}/visits` → `/api/visits`

**Vite Proxy (vite.config.ts):**
```typescript
proxy: {
  "/api": {
    target: "http://localhost:3000",
    changeOrigin: true,
  },
}
```

**Expected Flow:**
1. Browser → `http://localhost:5173/api/chat`
2. Vite Proxy → Forwards to `http://localhost:3000/api/chat`
3. Test Server → Handles request

---

## ✅ Verification Checklist

### Step 1: Check API Base URL

**In Browser Console (F12):**
```javascript
console.log('API Base:', import.meta.env.VITE_API_URL || '/api');
// Should show: undefined (uses '/api') or a URL
```

**If VITE_API_URL is set:**
- It overrides the proxy
- Requests go directly to that URL
- Proxy won't be used

**Fix:** Make sure `.env` files don't set `VITE_API_URL` unless needed.

---

### Step 2: Verify Vite Proxy is Active

**Check vite.config.ts:**
- ✅ Proxy configured for `/api`
- ✅ Target: `http://localhost:3000`
- ✅ `changeOrigin: true`

**Test proxy manually:**
```bash
# Should proxy to test server
curl http://localhost:5173/api/health
```

**Expected:** Returns JSON from test server.

---

### Step 3: Verify Test Server Routes

**Test server should handle:**
- ✅ `GET /health` → Health check
- ✅ `GET /api/visits` → Mock visits list
- ✅ `POST /api/visits` → Mock save
- ✅ `POST /api/chat` → OpenAI proxy

**Check test-server.js:**
```javascript
// Should have these routes:
if (req.url === '/health' || req.url === '/api/health') { ... }
if (req.url === '/api/visits' && req.method === 'GET') { ... }
if (req.url === '/api/visits' && req.method === 'POST') { ... }
if (req.url === '/api/chat' && req.method === 'POST') { ... }
```

---

### Step 4: Check Request Headers

**API Key Header:**
- Client sends: `X-API-Key: sk-...`
- Server reads: `req.headers['x-api-key'] || req.headers['X-API-Key']`

**Verify in browser console:**
```javascript
// Check if API key is stored
localStorage.getItem('user_api_key')
// Should return: "sk-..." (no quotes)
```

**Check Network tab:**
- Request Headers should show: `X-API-Key: sk-...`

---

## 🐛 Common Issues & Solutions

### Issue 1: VITE_API_URL Overrides Proxy

**Problem:** If `.env` has `VITE_API_URL=http://some-url`, proxy is ignored.

**Check:**
```bash
cd apps/web
# Check for .env files
ls .env*
# Read them
cat .env 2>$null
cat .env.local 2>$null
```

**Fix:** Remove `VITE_API_URL` from `.env` files, or set to empty:
```env
# .env.local
VITE_API_URL=
```

**Or:** Don't use `.env` files at all (uses proxy by default).

---

### Issue 2: Proxy Not Working

**Problem:** Vite proxy not forwarding requests.

**Test:**
```bash
# Direct test server (should work)
curl http://localhost:3000/health

# Through Vite proxy (should also work)
curl http://localhost:5173/api/health
```

**If proxy fails:**
- Restart dev server: `npm run dev`
- Check vite.config.ts syntax
- Check for port conflicts

---

### Issue 3: Test Server Not Handling Routes

**Problem:** Server running but routes not matching.

**Check test-server.js:**
- URL matching: `req.url === '/api/chat'`
- Method matching: `req.method === 'POST'`
- Case sensitive: Should match exactly

**Debug:** Add logging:
```javascript
console.log('Request:', req.method, req.url);
```

---

### Issue 4: CORS Issues

**Problem:** Browser blocks requests.

**Check:** Test server should have:
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
```

**If using proxy:** CORS shouldn't be an issue (same origin).

---

## 🔧 Complete Diagnostic Script

Run this in browser console:

```javascript
// 1. Check API base
console.log('=== API CONFIGURATION ===');
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('API_BASE will be:', import.meta.env.VITE_API_URL || '/api');

// 2. Check API key
console.log('\n=== API KEY ===');
const key = localStorage.getItem('user_api_key');
console.log('Stored API key:', key ? `${key.substring(0, 10)}...` : 'NOT SET');

// 3. Test health endpoint
console.log('\n=== TESTING ENDPOINTS ===');
fetch('/api/health')
  .then(r => r.json())
  .then(data => console.log('Health check:', data))
  .catch(err => console.error('Health check failed:', err));

// 4. Test visits endpoint
fetch('/api/visits')
  .then(r => r.json())
  .then(data => console.log('Visits GET:', data))
  .catch(err => console.error('Visits GET failed:', err));
```

---

## ✅ Final Verification Steps

1. **No .env files with VITE_API_URL** (unless intentionally set)
2. **Vite proxy configured** in vite.config.ts
3. **Test server running** on port 3000
4. **All routes handled** in test-server.js
5. **API key stored** in localStorage (if needed)
6. **Dev server restarted** after config changes

---

## 🎯 Expected Behavior

**When working correctly:**
1. Browser → `http://localhost:5173/api/chat`
2. Vite Proxy → `http://localhost:3000/api/chat`
3. Test Server → Logs request, processes it
4. Response → Streams back to browser
5. No errors in console

**Check these in order:**
- ✅ Browser console: No `ECONNREFUSED`
- ✅ Network tab: Request shows `200 OK`
- ✅ Test server terminal: Shows incoming request
- ✅ Chat: Response streams correctly

---

## 📝 Quick Fix Commands

**If VITE_API_URL is set:**
```bash
cd apps/web
# Remove or comment out VITE_API_URL
# Edit .env files or delete them
```

**Restart everything:**
```bash
# Terminal 1: Stop and restart
npm run dev

# Terminal 2: Stop and restart
node test-server.js
```

**Clear browser cache:**
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

---

## 🔍 Debug Checklist

Run through these in order:

- [ ] Check: `import.meta.env.VITE_API_URL` is undefined (uses proxy)
- [ ] Check: Vite proxy config is correct
- [ ] Check: Test server is running and responding
- [ ] Check: Test server handles all routes
- [ ] Check: Browser console shows correct API base
- [ ] Check: Network tab shows requests going to `/api/...`
- [ ] Check: Test server terminal shows incoming requests
- [ ] Check: No CORS errors in console
- [ ] Check: API key is stored (if needed for chat)

**If all checked, it should work!**

