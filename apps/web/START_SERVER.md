# 🚀 START THE TEST SERVER (Fix Connection Refused)

## ❌ Current Error

```
[vite] http proxy error: /api/visits
AggregateError [ECONNREFUSED]
```

**This means:** The test server on port 3000 is **NOT running**!

---

## ✅ SOLUTION: Start the Test Server

### Option 1: Use the Script (Easiest)

**PowerShell:**
```powershell
cd apps/web
.\start-servers.ps1
```

**Or Batch:**
```batch
cd apps/web
.\start-servers.bat
```

This starts **BOTH** servers automatically.

---

### Option 2: Manual (Two Terminals)

#### Terminal 1 - Dev Server (Frontend)
```bash
cd apps/web
npm run dev
```

**Wait for:** `Local: http://localhost:5173/`

#### Terminal 2 - Test Server (API Backend) ⚠️ **START THIS!**
```bash
cd apps/web
node test-server.js
```

**You MUST see:**
```
✅ Test Server Running
   URL: http://localhost:3000
   Endpoint: http://localhost:3000/api/chat
📡 Ready to receive requests...
```

---

## ✅ Verify It's Working

### Test 1: Health Check
```bash
curl http://localhost:3000/health
```

**Should return:**
```json
{"ok":true,"message":"Test server running"}
```

### Test 2: Check Port
```powershell
Get-NetTCPConnection -LocalPort 3000
```

**Should show:** Port 3000 is LISTENING

### Test 3: Browser
- Open http://localhost:5173/
- Open DevTools (F12) → Console
- **No more connection refused errors!**

---

## 🐛 If Server Won't Start

### Issue: "Cannot find module"

**Fix:**
```bash
cd apps/web
node --version  # Should be v18+
node test-server.js  # Should work
```

### Issue: Port 3000 already in use

**Fix 1:** Kill the process
```powershell
Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess | Stop-Process
```

**Fix 2:** Use different port
```javascript
// Edit test-server.js, change:
const PORT = 3001;

// Edit vite.config.ts, change:
target: "http://localhost:3001",
```

---

## 📋 Quick Checklist

Before testing:
- [ ] Terminal 1: `npm run dev` (shows localhost:5173)
- [ ] Terminal 2: `node test-server.js` (shows "Ready to receive requests")
- [ ] Test: `curl http://localhost:3000/health` (returns JSON)
- [ ] Browser: No connection refused errors

---

## ✅ Once Both Are Running

1. **Error disappears** - No more `ECONNREFUSED`
2. **Chat works** - Enter API key, send message
3. **Visits save** - Form submissions work
4. **Server logs** - See requests in Terminal 2

---

## 🎯 Expected Flow

**When working:**
1. Browser → `http://localhost:5173/api/visits`
2. Vite Proxy → Forwards to `http://localhost:3000/api/visits`
3. Test Server → Receives request, responds
4. Browser → Gets response, no error!

**All requires the test server running on port 3000!**

---

## 💡 Tip: Keep Server Running

Leave Terminal 2 open and running. Don't close it while developing!

To stop: Press `Ctrl+C` in Terminal 2

