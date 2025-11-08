# 🚀 Quick Start: Get Chat Working

## ⚠️ Problem
You're seeing: "Cannot connect to API server. Please ensure the test server is running on port 3000."

## ✅ Solution: Start the Test Server

### Option 1: Use the Batch File (Easiest) ⭐

**Double-click this file:**
```
apps/web/start-both.bat
```

This will:
- ✅ Start the Vite dev server (port 5173)
- ✅ Start the test API server (port 3000)
- ✅ Open both in separate windows

**Then:**
1. Wait for both servers to start
2. Open your browser: http://localhost:5173
3. Try chatting - it should work now!

---

### Option 2: Manual Start (2 Terminals)

**Terminal 1 - Dev Server:**
```powershell
cd apps/web
npm run dev
```
Wait for: `Local: http://localhost:5173/`

**Terminal 2 - Test Server (API):**
```powershell
cd apps/web
node test-server.js
```
Wait for: `✅ Test Server Running`

**Then:**
- Open browser: http://localhost:5173
- Try chatting!

---

### Option 3: PowerShell Script

```powershell
cd apps/web
.\START_SERVER.ps1
```

---

## ✅ Verify Server is Running

**Check health endpoint:**
```powershell
# PowerShell
Invoke-WebRequest http://localhost:3000/health

# Or open in browser:
http://localhost:3000/health
```

**Expected response:**
```json
{"ok":true,"message":"Test server running"}
```

---

## 🎯 What Each Server Does

| Server | Port | Purpose |
|--------|------|---------|
| **Vite Dev Server** | 5173 | Frontend app (React) |
| **Test API Server** | 3000 | Chat API endpoint (`/api/chat`) |

**Both must be running for chat to work!**

---

## 🐛 Troubleshooting

### "Port 3000 already in use"
✅ **This is GOOD!** It means the server is already running.
- Check: http://localhost:3000/health
- If it responds, you're all set!

### "Cannot connect to API server"
❌ Server is not running
- Start it: `node apps/web/test-server.js`
- Or use: `apps/web/start-both.bat`

### "ECONNREFUSED" errors
❌ Server not running or wrong port
- Verify: `netstat -ano | findstr :3000`
- Should show a process listening on port 3000

---

## 📝 Quick Reference

**Start both servers:**
```batch
apps/web/start-both.bat
```

**Check if server is running:**
```powershell
apps/web/check-server.ps1
```

**Stop server:**
```powershell
apps/web/stop-server.ps1
```

**Test server health:**
```
http://localhost:3000/health
```

---

## ✅ Success!

Once both servers are running:
1. ✅ Dev server: http://localhost:5173
2. ✅ API server: http://localhost:3000/health
3. ✅ Chat should work!

**Try sending "hi" in the chat - it should respond!**
