# 🧪 Quick Chat Test - Find the Issue

## ✅ What We Know

1. **No hardcoded URLs** ✅
   - Uses `/api` (proxied by Vite)
   - Vite proxy: `/api` → `http://localhost:3000`

2. **Test server running** ✅
   - Port 3000, PID: 18128

3. **API key found** ✅
   - Diagnostic shows: `sk-proj-g4...`

---

## 🧪 Test 1: Direct Server Test (Node.js)

**This bypasses the browser and tests server directly:**

```bash
cd apps/web
node test-chat.js
```

**Or with your API key:**
```bash
cd apps/web
OPENAI_API_KEY="sk-proj-g4..." node test-chat.js
```

**This will show:**
- ✅ If server receives request
- ✅ If OpenAI API call works
- ✅ If streaming works

---

## 🧪 Test 2: Browser Console Test

**Open browser console (F12) and paste:**

```javascript
// Test chat endpoint
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
.then(async (r) => {
  console.log('Status:', r.status);
  if (!r.ok) {
    console.error('Error:', await r.text());
    return;
  }
  console.log('✅ Streaming...');
  const reader = r.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    console.log('Chunk:', decoder.decode(value).substring(0, 100));
  }
})
.catch(e => console.error('Error:', e));
```

---

## 🔍 What to Check

### 1. When You Send Message in Chat

**Check browser console for:**
```
[ChatDrawer] Sending message: ...
[LLMProvider] Using Cloud API (Priority 3 - Online Fallback)
[API] Request URL: /api/chat
[API] Using user-provided API key: sk-proj-g4...
```

**If you see:**
```
[LLMProvider] No API key found. Skipping Cloud API.
```
**→ API key not being read when LLMProvider checks**

**Fix:** Check if API key is actually in localStorage:
```javascript
localStorage.getItem('user_api_key')
```

### 2. Test Server Terminal

**When you send message, terminal should show:**
```
📨 Incoming Request:
   URL: /api/chat
   Method: POST
📨 Chat Request Received
   Messages: 1
   API Key: sk-proj-g4...xyz
```

**If you DON'T see this:**
- Request not reaching server
- Check Vite proxy

### 3. Network Tab

**DevTools → Network → `/api/chat`:**
- **Status:** `200` or error code
- **Request Headers:** `X-API-Key: sk-...`
- **Response:** Streaming data or error

---

## 🐛 Common Issues

### Issue: LLMProvider Not Trying Cloud API

**Symptom:** Console shows `[LLMProvider] No API key found`

**Check:**
```javascript
// In browser console
localStorage.getItem('user_api_key')
// Should return: "sk-proj-g4..."
```

**If empty or wrong:** Re-enter API key in chat drawer

---

### Issue: Request Not Reaching Server

**Symptom:** Test server terminal shows no logs

**Test:**
```bash
# Should work
curl http://localhost:3000/api/health

# Should also work (through proxy)
curl http://localhost:5179/api/health
```

**If second fails:** Vite proxy issue, restart dev server

---

### Issue: OpenAI API Error

**Symptom:** Test server shows `❌ OpenAI Error: 401`

**Fix:**
- API key might be invalid
- Check key format: should start with `sk-`
- Verify key is correct

---

## 📋 Share Results

**After running tests, share:**
1. **Node.js test result** (if you ran it)
2. **Browser console output** (when sending message)
3. **Test server terminal** (any logs?)
4. **Network tab** (status code)

Then I can fix the exact issue!

