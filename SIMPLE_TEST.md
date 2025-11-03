# ✅ YOUR TEST SERVER IS ALREADY RUNNING!

Good news: Port 3000 is in use, which means your test server **is already running**!

---

## ✅ Verify It's Working

### Test 1: Check Server Health
Open browser and go to:
```
http://localhost:3000/health
```

**Should show:**
```json
{"ok":true,"message":"Test server running"}
```

### Test 2: Check Dev Server
Make sure Terminal 1 has:
```bash
npm run dev
```

**Should show:**
```
Local: http://localhost:5173/
```

---

## 🧪 Test the App Now

1. **Open browser:** http://localhost:5173/
2. **Open DevTools** (F12) → Console tab
3. **Check for errors:**
   - Should **NOT** see `ECONNREFUSED` anymore
   - Should see normal app loading

4. **Test Chat:**
   - Open chat drawer
   - Enter API key (no quotes): `sk-your-key`
   - Send test message: "Hello"
   - Should work!

---

## 🐛 If You Still See Connection Errors

### Option 1: Restart Test Server

**Find and kill the existing process:**
```powershell
Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force
```

**Then start fresh:**
```bash
cd apps/web
node test-server.js
```

### Option 2: Check What's Using Port 3000

```powershell
Get-NetTCPConnection -LocalPort 3000 | Format-Table LocalAddress, LocalPort, State, OwningProcess
```

This shows what process is using port 3000.

---

## ✅ Quick Checklist

- [ ] Test server running (port 3000 in use)
- [ ] Health check works: http://localhost:3000/health
- [ ] Dev server running: http://localhost:5173/
- [ ] Browser: No connection errors
- [ ] Chat: Works with API key

---

## 🎯 Next Steps

1. **Open app:** http://localhost:5173/
2. **Test chat:** Enter API key, send message
3. **Check Terminal** (where test-server.js is running):
   - Should see incoming requests
   - Should see logs for `/api/chat` and `/api/visits`

**Everything should work now!** 🎉

