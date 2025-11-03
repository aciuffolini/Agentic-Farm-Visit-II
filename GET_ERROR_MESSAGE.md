# 🔍 Get the Error Message

## What to Do Right Now

**1. Open browser:** http://localhost:5179/

**2. Press F12** → Console tab

**3. Look for RED error messages**

**4. Copy the ENTIRE error message** (right-click → Copy)

**5. Paste it here or tell me what it says**

---

## Common Errors & Fixes

### Error: "Failed to fetch"
**Fix:** Test server not running
```powershell
cd C:\Users\Atilio\projects\agents\7_farm_visit\apps\web
node test-server.js
```

### Error: "401 Unauthorized"
**Fix:** API key problem
```javascript
// In console, check:
localStorage.getItem('user_api_key')
// If empty, set it:
localStorage.setItem('user_api_key', 'sk-proj-g4-YOUR-KEY');
```

### Error: "404 Not Found"
**Fix:** Wrong URL or proxy not working

### Error: "ECONNREFUSED"
**Fix:** Test server not running on port 3000

---

## Quick Check Commands

**Paste these in browser console to check:**

```javascript
// Check 1: API key
console.log('API Key:', localStorage.getItem('user_api_key'));

// Check 2: Test server
fetch('/api/health').then(r => r.json()).then(console.log).catch(e => console.error('Server error:', e));

// Check 3: Network
console.log('Current URL:', window.location.href);
```

---

## What I Need

**Please share:**
1. **The exact error message** (copy from console)
2. **Or describe what you see** (red text, what does it say?)

Then I can fix it immediately!

