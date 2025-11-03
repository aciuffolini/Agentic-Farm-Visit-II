# 🚀 MANUAL START - Simple Instructions

The scripts had encoding issues. Here's the **simplest way** to start both servers:

---

## ✅ Method 1: Two Separate Terminals (Easiest)

### Terminal 1 - Dev Server
Open PowerShell or CMD and run:
```bash
cd C:\Users\Atilio\projects\agents\7_farm_visit\apps\web
npm run dev
```

**Wait for:** `Local: http://localhost:5173/`

---

### Terminal 2 - Test Server
Open **ANOTHER** PowerShell or CMD window and run:
```bash
cd C:\Users\Atilio\projects\agents\7_farm_visit\apps\web
node test-server.js
```

**Wait for:** `✅ Test Server Running` and `Ready to receive requests...`

---

## ✅ Method 2: Use Batch File (Windows)

The `.bat` file should work better. Run:
```bash
cd C:\Users\Atilio\projects\agents\7_farm_visit\apps\web
start-servers.bat
```

This opens two CMD windows automatically.

---

## ✅ Verify Both Are Running

### Check Terminal 1:
Should show:
```
VITE v7.x.x  ready in XXX ms
➜  Local:   http://localhost:5173/
```

### Check Terminal 2:
Should show:
```
✅ Test Server Running
   URL: http://localhost:3000
   Endpoint: http://localhost:3000/api/chat
📡 Ready to receive requests...
```

### Test in Browser:
1. Open: http://localhost:5173/
2. Check console (F12) - **NO connection errors!**

---

## 🐛 If Test Server Won't Start

### Error: "Cannot find module"
```bash
node --version
# Should be v18 or higher
```

If too old, update Node.js or use:
```bash
npx node test-server.js
```

### Error: Port 3000 in use
Kill the process:
```powershell
Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force
```

Then start again:
```bash
node test-server.js
```

---

## 📋 Quick Checklist

- [ ] Terminal 1: `npm run dev` (running, shows localhost:5173)
- [ ] Terminal 2: `node test-server.js` (running, shows "Ready")
- [ ] Browser: http://localhost:5173/ (opens, no errors)
- [ ] Test: `curl http://localhost:3000/health` (optional, returns JSON)

---

## 💡 Keep Both Running

**Important:** Leave BOTH terminals open while testing!

- Terminal 1 = Frontend (Vite)
- Terminal 2 = Backend (Test API server)

Close them when done testing.

---

## ✅ Once Both Are Running

The connection refused errors will **disappear** and:
- ✅ Chat will work (with API key)
- ✅ Form saves will work
- ✅ No more proxy errors

Start both manually - it's the most reliable way!

