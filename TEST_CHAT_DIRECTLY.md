# 🧪 Test Chat Directly - Quick Debug

## ✅ What's Confirmed

1. **No hardcoded URLs** ✅
   - API_BASE uses `/api` (proxied)
   - Vite proxy: `/api` → `http://localhost:3000`

2. **Test server running** ✅
   - Port 3000, Process ID: 18128

3. **API key found** ✅
   - Diagnostic shows: `sk-proj-g4...`

---

## 🧪 Quick Test - Browser Console

**Open browser console (F12) and paste this:**

```javascript
// Test 1: Check API key
console.log('API Key:', localStorage.getItem('user_api_key'));

// Test 2: Test chat endpoint directly
fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': localStorage.getItem('user_api_key'),
  },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Hello, test message' }],
  }),
})
.then(async (r) => {
  console.log('Status:', r.status, r.statusText);
  console.log('Headers:', Object.fromEntries(r.headers.entries()));
  
  if (!r.ok) {
    const text = await r.text();
    console.error('❌ Error Response:', text);
    return;
  }
  
  if (!r.body) {
    console.error('❌ No response body');
    return;
  }
  
  console.log('✅ Response OK, streaming...');
  const reader = r.body.getReader();
  const decoder = new TextDecoder();
  let chunkCount = 0;
  
  function readChunk() {
    reader.read().then(({ value, done }) => {
      if (done) {
        console.log(`✅ Stream complete (${chunkCount} chunks)`);
        return;
      }
      chunkCount++;
      const text = decoder.decode(value);
      console.log(`Chunk ${chunkCount}:`, text.substring(0, 200));
      readChunk();
    }).catch(err => {
      console.error('❌ Read error:', err);
    });
  }
  readChunk();
})
.catch(e => {
  console.error('❌ Fetch error:', e);
});
```

**This will show:**
- ✅ If request reaches server
- ✅ What response you get
- ✅ If streaming works
- ❌ Any errors

---

## 🔍 What to Check

### 1. Browser Console Logs

**When you send a message in chat, look for:**
```
[ChatDrawer] Sending message: ...
[LLMProvider] Using Cloud API (Priority 3 - Online Fallback)
[API] Request URL: /api/chat
[API] Using user-provided API key: sk-proj-g4...
[API] Response status: 200 OK
```

**If you see:**
```
[LLMProvider] No API key found. Skipping Cloud API.
```
**→ API key not being read correctly**

### 2. Test Server Terminal

**When you send message, terminal should show:**
```
📨 Incoming Request:
   URL: /api/chat
   Method: POST
📨 Chat Request Received
   Messages: 1
   API Key: sk-proj-g4...xyz
   ✅ Calling OpenAI API...
```

**If you DON'T see this:**
- Request isn't reaching server
- Check Vite proxy

### 3. Network Tab

**DevTools → Network → Find `/api/chat`:**
- **Status:** Should be `200`
- **Request Headers:** Should have `X-API-Key`
- **Response:** Should show streaming data

---

## 🐛 Common Issues

### Issue: LLMProvider Not Trying Cloud API

**Check:** Console shows `[LLMProvider] No API key found`

**Fix:** API key might not be in localStorage when LLMProvider checks

**Test:**
```javascript
// In console
localStorage.getItem('user_api_key')
// Should return: "sk-proj-g4..."
```

**If empty:** Re-enter API key in chat drawer

---

### Issue: Request Not Reaching Server

**Check:** Test server terminal shows no logs

**Fix:**
1. Check Vite proxy is working:
   ```bash
   curl http://localhost:5179/api/health
   ```
2. Restart dev server
3. Check vite.config.ts proxy config

---

### Issue: OpenAI API Error

**Check:** Test server shows `❌ OpenAI Error: 401`

**Fix:**
- API key might be invalid
- Check key format: should start with `sk-`
- Verify key is correct in OpenAI dashboard

---

## 📋 Share Results

**After running browser console test, share:**
1. **Console output** (what you see)
2. **Test server terminal** (any logs?)
3. **Network tab** (status code)

Then I can fix the exact issue!

