# 🐛 Debugging API Request Issues

## Problem: API Key Included But Requests Not Working

If the API key is being sent but requests are failing, check these:

---

## ✅ Step-by-Step Debug Checklist

### 1. Check Server is Running

```bash
# Terminal 2 should show:
✅ Test Server Running
   URL: http://localhost:3000
```

**Test health endpoint:**
```bash
curl http://localhost:3000/health
# Should return: {"ok":true,"message":"Test server running"}
```

---

### 2. Check Browser Console

Open DevTools (F12) → Console tab, look for:

```
[API] Request URL: /api/chat
[API] Request headers: { ... }
[API] Using user-provided API key: sk-abc123...
[API] Response status: 200 OK
```

**If you see errors:**
- `Failed to fetch` → Server not running or CORS issue
- `401 Unauthorized` → API key not being sent correctly
- `404 Not Found` → URL mismatch

---

### 3. Check Network Tab

1. Open DevTools → Network tab
2. Send a chat message
3. Find `/api/chat` request
4. Check:
   - **Request URL**: Should be `http://localhost:5173/api/chat` (proxied through Vite)
   - **Request Headers**: Should include `X-API-Key: sk-...`
   - **Response**: Should be `200 OK` with `Content-Type: text/event-stream`

**Common Issues:**

❌ **No `X-API-Key` header:**
- Check: `localStorage.getItem('user_api_key')` in console
- Check: API key was saved correctly (button should be green)

❌ **Wrong URL:**
- If `VITE_API_URL` is set, it might override proxy
- Check: `import.meta.env.VITE_API_URL` in console
- Should be `undefined` (uses proxy) or `http://localhost:3000`

❌ **CORS error:**
- Server should have CORS headers (already configured)
- Check server logs for OPTIONS request

---

### 4. Check Server Logs

In Terminal 2 (test-server.js), you should see:

```
📨 Incoming Request:
   URL: /api/chat
   Method: POST
   Headers: { "x-api-key": "sk-...", ... }
📨 Chat Request Received
   Messages: 1
   API Key: sk-abc123...xyz
   ✅ Calling OpenAI API...
   ✅ Streaming response...
```

**If API key shows as `undefined` or `NOT PROVIDED`:**
- Header name mismatch: Server looks for `x-api-key` (lowercase)
- Check: Network tab → Request Headers → Look for `X-API-Key` or `x-api-key`

---

### 5. Common Fixes

#### Fix 1: Header Case Sensitivity

The server reads headers in lowercase. Check if the client is sending:
- ✅ `X-API-Key` (browser may auto-lowercase)
- ❌ `X-Api-Key` or other variants

**Server already handles both:**
```javascript
const apiKey = req.headers['x-api-key'] || req.headers['X-API-Key'];
```

#### Fix 2: Vite Proxy Not Working

If requests go to wrong URL:

**Check vite.config.ts:**
```typescript
proxy: {
  "/api": {
    target: "http://localhost:3000",
    changeOrigin: true,
  },
}
```

**Verify it's proxying:**
- Request should go to: `http://localhost:5173/api/chat`
- Vite should proxy to: `http://localhost:3000/api/chat`

**Test proxy directly:**
```bash
curl -X POST http://localhost:5173/api/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk-test" \
  -d '{"messages":[{"role":"user","content":"test"}]}'
```

#### Fix 3: SSE Response Parsing

If response streams but doesn't parse:

**Check response format:**
- Should be `text/event-stream`
- Each line should start with `data: `
- Format: `data: {"token": "..."}\n\n` or `data: [DONE]\n\n`

**Check api.ts parsing:**
- Looks for `data: ` prefix
- Parses JSON from each line
- Yields token content

---

### 6. Quick Test Script

Run this in browser console:

```javascript
// 1. Check API key
const key = localStorage.getItem('user_api_key');
console.log('API Key:', key ? `${key.substring(0, 10)}...` : 'NOT SET');

// 2. Check API base
console.log('API Base:', import.meta.env.VITE_API_URL || '/api');

// 3. Test fetch directly
fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': localStorage.getItem('user_api_key') || '',
  },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'test' }]
  })
})
.then(res => {
  console.log('Response status:', res.status);
  console.log('Response headers:', [...res.headers.entries()]);
  return res.text();
})
.then(text => console.log('Response:', text.substring(0, 200)));
```

---

## 🔍 Expected Flow

1. **User enters API key** → Stored in `localStorage` (without quotes)
2. **User sends message** → `ChatDrawer` calls `llmProvider.stream()`
3. **LLMProvider** → Tries Gemini Nano → Llama → **Cloud API**
4. **Cloud API** → `streamChat()` in `api.ts`
5. **api.ts** → Adds `X-API-Key` header → Fetches `/api/chat`
6. **Vite Proxy** → Proxies to `http://localhost:3000/api/chat`
7. **test-server.js** → Reads `X-API-Key` header → Calls OpenAI
8. **OpenAI** → Streams response → Client parses SSE → Updates UI

---

## 🐛 If Still Not Working

**Collect this info:**

1. **Browser Console errors** (screenshot)
2. **Network tab** → `/api/chat` request (screenshot)
3. **Server logs** from Terminal 2 (copy/paste)
4. **API key value** (first 10 chars): `localStorage.getItem('user_api_key').substring(0, 10)`
5. **URL being called**: Check `[API] Request URL:` in console

Then we can fix the exact issue!

