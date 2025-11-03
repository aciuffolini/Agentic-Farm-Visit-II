# 🐛 Debugging Chat Not Working

## ✅ What We Know

1. **Test server IS running** (port 3000, Process ID: 18128)
2. **All other endpoints work** (health, visits)
3. **API key is set** (`sk-proj-g4...`)
4. **API_BASE uses `/api`** (not hardcoded, uses proxy)

---

## 🔍 Debug Steps

### Step 1: Check Browser Console

**When you try to send a chat message, check console (F12) for:**

```
[LLMProvider] Using Cloud API (Priority 3 - Online Fallback)
[API] Request URL: /api/chat
[API] Using user-provided API key: sk-proj-g4...
[API] Response status: 200 OK
```

**If you see errors, share them!**

---

### Step 2: Check Test Server Terminal

**In the terminal where `node test-server.js` is running, you should see:**

```
📨 Chat Request Received
   Messages: 1
   API Key: sk-proj-g4...xyz
   ✅ Calling OpenAI API...
```

**If you DON'T see this, the request isn't reaching the server!**

---

### Step 3: Check Network Tab

1. **Open DevTools** → **Network tab**
2. **Send a chat message**
3. **Find `/api/chat` request**
4. **Check:**
   - **Status:** Should be `200` or show error
   - **Request Headers:** Should have `X-API-Key: sk-...`
   - **Response:** Should show streaming data

---

## 🔧 Common Issues

### Issue 1: LLMProvider Skipping Cloud API

**Check console for:**
```
[LLMProvider] No API key found. Skipping Cloud API.
```

**Fix:** Even though diagnostic shows key, verify in console:
```javascript
localStorage.getItem('user_api_key')
```

---

### Issue 2: Test Server Not Receiving Request

**Check:**
- Is test server terminal showing any logs?
- Try: `curl http://localhost:3000/api/health` (should work)

**If no logs appear:**
- Vite proxy might not be forwarding
- Check vite.config.ts proxy config

---

### Issue 3: OpenAI API Error

**Check test server terminal for:**
```
❌ OpenAI Error: 401 Unauthorized
```

**This means:**
- API key is invalid
- Or API key format is wrong

**Fix:** Verify API key is correct

---

## 🧪 Quick Test in Browser Console

**Paste this in browser console (F12):**

```javascript
// Test chat endpoint directly
fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': localStorage.getItem('user_api_key'),
  },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Hello test' }],
  }),
})
.then(r => {
  console.log('Status:', r.status);
  if (!r.ok) {
    return r.text().then(t => console.error('Error:', t));
  }
  console.log('✅ Response OK, streaming...');
  const reader = r.body.getReader();
  const decoder = new TextDecoder();
  
  function read() {
    reader.read().then(({ value, done }) => {
      if (done) {
        console.log('✅ Stream complete');
        return;
      }
      const text = decoder.decode(value);
      console.log('Chunk:', text.substring(0, 200));
      read();
    });
  }
  read();
})
.catch(e => console.error('❌ Fetch error:', e));
```

**This will show exactly what's happening!**

---

## 📋 What to Share

**Please share:**
1. **Browser console errors** (when sending message)
2. **Network tab** - `/api/chat` request status
3. **Test server terminal** - Any logs when sending message?
4. **Result of browser console test** above

Then I can fix the exact issue!

