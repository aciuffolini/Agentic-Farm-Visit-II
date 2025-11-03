# 🚀 Start Test Servers (Fix Connection Refused Error)

## ❌ Error You're Seeing

```
[vite] http proxy error: /api/visits
AggregateError [ECONNREFUSED]
```

**This means:** The test server on port 3000 is NOT running!

---

## ✅ Quick Fix

### You Need TWO Terminals Running:

### Terminal 1: Dev Server (Frontend)
```bash
cd apps/web
npm run dev
```

**Should show:**
```
VITE v7.x.x  ready in XXX ms
➜  Local:   http://localhost:5173/
```

### Terminal 2: Test Server (Backend API) ⚠️ **YOU NEED THIS RUNNING**
```bash
cd apps/web
node test-server.js
```

**Should show:**
```
✅ Test Server Running
   URL: http://localhost:3000
   Endpoint: http://localhost:3000/api/chat
   Health: http://localhost:3000/health
📡 Ready to receive requests...
```

---

## 🔍 Verify Both Are Running

### Check Dev Server (Terminal 1):
- ✅ Should show: `http://localhost:5173/`
- ✅ No errors about proxy

### Check Test Server (Terminal 2):
- ✅ Should show: `✅ Test Server Running`
- ✅ Should show: `Ready to receive requests...`

### Test Server is Working:
```bash
# In a new terminal or browser
curl http://localhost:3000/health
```

**Should return:**
```json
{"ok":true,"message":"Test server running"}
```

---

## 🐛 If Test Server Won't Start

### Issue 1: Port 3000 Already in Use

**Check:**
```bash
# Windows PowerShell
Get-NetTCPConnection -LocalPort 3000
```

**Fix:** Kill the process or use different port:
```javascript
// In test-server.js, change:
const PORT = 3001;  // Use different port
```

**Then update vite.config.ts:**
```typescript
proxy: {
  "/api": {
    target: "http://localhost:3001",  // Match new port
    changeOrigin: true,
  },
}
```

### Issue 2: Node.js Module Error

**If you see:** `Cannot find module 'http'` or similar

**Fix:** Node.js version too old, need v18+
```bash
node --version  # Should be v18 or higher
```

### Issue 3: Syntax Error in test-server.js

**Fix:** Make sure file is saved correctly, check for syntax errors:
```bash
node test-server.js
```

Should start without errors.

---

## ✅ After Both Servers Are Running

1. **Open browser:** http://localhost:5173/
2. **Open DevTools** (F12) → Console
3. **Clear API key:** `localStorage.removeItem('user_api_key')`
4. **Refresh page**
5. **Open chat drawer**
6. **Enter API key** and send message
7. **Check Terminal 2** - Should see incoming request!

---

## 📋 Quick Checklist

Before testing chat:
- [ ] Terminal 1: `npm run dev` (running, showing localhost:5173)
- [ ] Terminal 2: `node test-server.js` (running, showing "Ready to receive requests")
- [ ] Browser: http://localhost:5173/ (opens without errors)
- [ ] Test: `curl http://localhost:3000/health` (returns JSON)

---

## 🎯 Expected Flow When Working

1. **Browser** → Sends request to `http://localhost:5173/api/chat`
2. **Vite Proxy** → Forwards to `http://localhost:3000/api/chat`
3. **Test Server** → Receives request, logs headers
4. **Test Server** → Calls OpenAI API with your key
5. **Test Server** → Streams response back
6. **Browser** → Parses SSE and displays message

**All of this requires BOTH servers running!**

---

## 💡 Pro Tip: Start Both at Once

Create a batch file `start-dev.bat`:

```batch
@echo off
echo Starting Dev Server...
start "Dev Server" cmd /k "cd apps\web && npm run dev"
timeout /t 3
echo Starting Test Server...
start "Test Server" cmd /k "cd apps\web && node test-server.js"
echo Both servers starting in separate windows...
pause
```

Or use PowerShell:

```powershell
# start-servers.ps1
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps\web; npm run dev"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps\web; node test-server.js"
```

Run: `.\start-servers.ps1`

---

## ✅ Once Both Are Running

The connection refused error will disappear, and chat should work!

Check Terminal 2 for incoming requests when you send messages.

