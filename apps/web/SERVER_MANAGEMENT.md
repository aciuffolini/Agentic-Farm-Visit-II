# 🚀 Server Management Guide

## Current Status

**Port 3000 is already in use** - This means the server is likely already running!

---

## ✅ Check Server Status

**PowerShell:**
```powershell
.\check-server.ps1
```

**Or manually:**
```powershell
Get-NetTCPConnection -LocalPort 3000
```

**Test health:**
```powershell
curl http://localhost:3000/health
```

---

## 🛑 Stop Server (if needed)

**PowerShell:**
```powershell
.\stop-server.ps1
```

**Or manually:**
```powershell
# Find process
$port = Get-NetTCPConnection -LocalPort 3000
$processId = $port.OwningProcess

# Stop it
Stop-Process -Id $processId -Force
```

---

## ▶️ Start Server

**If server is NOT running:**
```powershell
node test-server.js
```

**Expected output:**
```
✅ Test Server Running
   URL: http://localhost:3000
   Endpoint: http://localhost:3000/api/chat
   Health: http://localhost:3000/health
📡 Ready to receive requests...
```

---

## 🔄 Restart Server

**Quick restart:**
```powershell
.\stop-server.ps1
node test-server.js
```

---

## ⚠️ Common Issues

### "Port 3000 is already in use"
**Meaning:** Server is already running
**Solution:** 
- Check status: `.\check-server.ps1`
- If you want to restart: `.\stop-server.ps1` then `node test-server.js`

### "cd apps/web" error
**You're already in:** `C:\Users\Atilio\projects\agents\7_farm_visit\apps\web`
**Solution:** Just run `node test-server.js` (no need to cd)

---

## 📊 Quick Status Check

```powershell
# Check if running
$port = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port) { 
    Write-Host "✅ Server is running" -ForegroundColor Green 
} else { 
    Write-Host "❌ Server is not running" -ForegroundColor Red 
}
```

---

## 💡 Tips

1. **Don't run `cd apps/web` if you're already there**
2. **Check status first** before starting (to avoid "port in use" error)
3. **Use the scripts** - they handle everything automatically

