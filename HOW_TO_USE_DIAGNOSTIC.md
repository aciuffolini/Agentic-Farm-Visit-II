# 🚀 How to Use the Diagnostic Tool

## ✅ Step-by-Step Guide

### Step 1: Make Sure Dev Server is Running

**Open Terminal/PowerShell and run:**
```bash
cd C:\Users\Atilio\projects\agents\7_farm_visit\apps\web
npm run dev
```

**Wait for this message:**
```
VITE v7.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
```

**✅ Keep this terminal open!**

---

### Step 2: Open Browser

**Open your web browser** (Chrome, Edge, Firefox, etc.)

**Do NOT open in terminal!** Open in a **browser window**.

---

### Step 3: Go to Diagnostic URL

**In your browser address bar, type:**
```
http://localhost:5173/DIAGNOSTIC.html
```

**Or click this link if you're reading this in a browser:**
[Open Diagnostic Tool](http://localhost:5173/DIAGNOSTIC.html)

---

### Step 4: Run Tests

**You should see a page with buttons:**
- "Check Config"
- "Test /health"
- "Test GET /api/visits"
- "Test POST /api/visits"
- "Test POST /api/chat"
- "Run All Tests" ← **Click this one!**

**Click "Run All Tests"** and wait for results.

---

## 📋 Visual Guide

```
┌─────────────────────────────────────────┐
│  TERMINAL (PowerShell/CMD)              │
│  ─────────────────────────────────────  │
│  $ npm run dev                          │
│  VITE ready at http://localhost:5173/   │
│  ⬆️ Keep this running                    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  BROWSER (Chrome/Edge/Firefox)          │
│  ─────────────────────────────────────  │
│  Address bar:                           │
│  http://localhost:5173/DIAGNOSTIC.html  │
│                                         │
│  You'll see diagnostic page with buttons│
│  Click "Run All Tests"                  │
│  ⬆️ This is where you test!              │
└─────────────────────────────────────────┘
```

---

## 🎯 Quick Summary

1. **Terminal:** Run `npm run dev` (keep it running)
2. **Browser:** Open `http://localhost:5173/DIAGNOSTIC.html`
3. **Click:** "Run All Tests" button
4. **Review:** Results shown on the page

---

## ❓ If Diagnostic Page Doesn't Load

### Check 1: Is Dev Server Running?
```bash
# In terminal, you should see:
Local: http://localhost:5173/
```

### Check 2: Try Main App First
```
http://localhost:5173/
```

**If this loads, the server is running!**

### Check 3: Check File Location
The diagnostic file should be at:
```
apps/web/public/DIAGNOSTIC.html
```

**If missing, I'll copy it for you!**

---

## 🔧 Alternative: Browser Console Test

**If diagnostic page doesn't work, use browser console:**

1. **Open main app:** http://localhost:5173/
2. **Press F12** (opens DevTools)
3. **Click "Console" tab**
4. **Paste and run:**

```javascript
// Quick test
fetch('/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ Health:', d))
  .catch(e => console.error('❌ Error:', e));
```

**This will show if the API is working!**

---

## ✅ Success Looks Like

**When you open the diagnostic page, you should see:**
- Green checkmarks (✅) for working endpoints
- Red X marks (❌) for errors
- Detailed error messages if something fails

**Share the results and I'll help fix any issues!**

