# 🧪 TEST NOW - Quick Local Testing

## ⚡ Quick Start (3 Steps)

### Step 1: Start Dev Server
```bash
cd apps/web
npm run dev
```
**Open:** http://localhost:5173/

### Step 2: Start Test API Server (New Terminal)
```bash
cd apps/web
node test-server.js
```
**Should see:**
```
✅ Test Server Running
   URL: http://localhost:3000
   Endpoint: http://localhost:3000/api/chat
```

### Step 3: Test in Browser

1. **Open browser DevTools** (F12)
2. **Go to Application tab → Local Storage**
3. **Clear `user_api_key`** (if exists)
4. **Refresh page** (F5)
5. **Open chat drawer**
6. **Wait 1 second** - API key input should appear
7. **Test with quotes:** Enter `"sk-test123"` → Click Save
8. **Check console:** `localStorage.getItem('user_api_key')` → Should be `sk-test123` (no quotes)
9. **Enter real API key** (no quotes): `sk-your-actual-key`
10. **Send test message:** "Hello"

---

## ✅ What to Check

- [ ] API key input appears after 1 second (if no key)
- [ ] Quote stripping works (`"key"` → stores as `key`)
- [ ] Button turns green after saving
- [ ] Chat works with API key set
- [ ] Console shows `[LLMProvider] Using Cloud API`
- [ ] Network tab shows `X-API-Key` header (no quotes)

---

## 🐛 Quick Fixes

**API key input not showing?**
- Check: Are you online? (`navigator.onLine` in console)
- Clear: `localStorage.clear()` and refresh

**Chat not working?**
- Check: Is test server running? (http://localhost:3000/health)
- Check: Network tab for `/api/chat` request
- Check: Console for errors

**CORS error?**
- Server has CORS enabled, should work
- If not, check server logs

---

## 📝 Test Results

After testing, answer:

1. **Quote stripping works?** [ ] Yes [ ] No
2. **Auto-prompt works?** [ ] Yes [ ] No  
3. **Chat works with API key?** [ ] Yes [ ] No
4. **Ready to commit?** [ ] Yes [ ] No

---

## 🚀 If All Tests Pass

```bash
git add apps/web/src/lib/config/userKey.ts
git add apps/web/test-server.js
git add LOCAL_TESTING_SETUP.md
git add TEST_NOW.md
git add STEP_BY_STEP_FIX_GUIDE.md
git add VERIFICATION_CHECKLIST.md

git commit -m "fix: auto-strip quotes from API keys, add testing setup

- API keys auto-strip quotes (user can type with or without quotes)
- Auto-show API key input after 1 second if online and no key
- Improved button visibility (amber/green color coding)
- Added test server and comprehensive testing guides"

git push origin main
```

