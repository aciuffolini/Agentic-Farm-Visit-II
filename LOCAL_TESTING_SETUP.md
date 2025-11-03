# 🧪 Local Testing Setup

## Quick Test Before Committing

This guide helps you test the API key fixes and UI changes locally before committing.

---

## 📋 Prerequisites

1. Node.js installed (v18+)
2. npm or yarn
3. Browser (Chrome/Edge recommended for DevTools)

---

## 🚀 Step 1: Start Development Server

```bash
cd apps/web
npm install  # If needed
npm run dev
```

**Expected output:**
```
VITE v7.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.x.x:5173/
```

**Open in browser:** http://localhost:5173/

---

## 🔧 Step 2: Set Up Test API Server (Optional but Recommended)

Since the app calls `/api/chat`, you need a server. Quick setup:

### Option A: Minimal Test Server (Node.js)

**Create `apps/web/test-server.js`:**

```javascript
import http from 'http';
import { URL } from 'url';

const PORT = 3000;

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { messages } = JSON.parse(body);
        const apiKey = req.headers['x-api-key'];

        console.log('📨 Received chat request');
        console.log('   Messages:', messages.length);
        console.log('   API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT PROVIDED');

        if (!apiKey) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'API key required. Set X-API-Key header.' }));
          return;
        }

        // Set SSE headers
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        });

        // Call OpenAI (or simulate response for testing)
        try {
          const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages,
              stream: true,
            }),
          });

          if (!openaiRes.ok) {
            const errorText = await openaiRes.text();
            res.write(`data: ${JSON.stringify({ error: errorText, status: openaiRes.status })}\n\n`);
            res.end();
            return;
          }

          // Stream response
          const reader = openaiRes.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { value, done } = await reader.read();
            if (done) {
              res.write('data: [DONE]\n\n');
              res.end();
              break;
            }
            res.write(decoder.decode(value));
          }
        } catch (error) {
          res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
          res.end();
        }
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`✅ Test server running on http://localhost:${PORT}`);
  console.log(`📡 Endpoint: http://localhost:${PORT}/api/chat`);
});
```

**Run server:**
```bash
# In a separate terminal
cd apps/web
node test-server.js
```

### Option B: Use Vite Proxy (Simpler - No Separate Server)

**Update `apps/web/vite.config.ts`** to proxy `/api`:

```typescript
// Already configured, just ensure it's pointing to your server
server: {
  proxy: {
    "/api": {
      target: "http://localhost:3000",  // Your test server
      changeOrigin: true,
    },
  },
}
```

**Or use mock response (for UI testing only):**

```typescript
// In vite.config.ts, add a proxy with rewrite
server: {
  proxy: {
    "/api/chat": {
      target: "http://localhost:3000",
      changeOrigin: true,
      configure: (proxy, _options) => {
        proxy.on('proxyReq', (proxyReq, req, res) => {
          console.log('Proxying request:', req.url);
        });
      },
    },
  },
}
```

---

## 🧪 Step 3: Test API Key Functionality

### Test 1: Quote Stripping

1. Open browser DevTools (F12)
2. Go to Console tab
3. Test quote stripping:

```javascript
// Import or access the function
// The function is exposed as window.setAPIKey

// Test with quotes
window.setAPIKey('"sk-test123"');
console.log('With quotes:', localStorage.getItem('user_api_key'));
// Expected: "sk-test123" (no outer quotes)

// Test without quotes
window.setAPIKey('sk-test456');
console.log('Without quotes:', localStorage.getItem('user_api_key'));
// Expected: "sk-test456"

// Test with single quotes
window.setAPIKey("'sk-test789'");
console.log('Single quotes:', localStorage.getItem('user_api_key'));
// Expected: "sk-test789" (no quotes)
```

**Expected Results:**
- ✅ All three should store the key WITHOUT outer quotes
- ✅ Stored value should be: `sk-test123`, `sk-test456`, `sk-test789`

### Test 2: UI Auto-Prompt

1. **Clear localStorage:**
   ```javascript
   localStorage.removeItem('user_api_key');
   ```

2. **Refresh page** (F5)

3. **Open chat drawer** (click chat icon)

4. **Expected:**
   - ✅ Initial message mentions API key
   - ✅ After 1 second, API key input section appears automatically (amber background)
   - ✅ "🔑 Set API Key" button is amber (no key set)

### Test 3: API Key Input

1. **With quotes test:**
   - Enter: `"sk-test123"`
   - Click Save
   - Check console: `localStorage.getItem('user_api_key')`
   - ✅ Should be stored WITHOUT quotes: `sk-test123`

2. **Button color:**
   - ✅ After saving, button should turn green
   - ✅ Text should change to: "🔑 API Key Set"

3. **Test without quotes:**
   - Clear key: `localStorage.removeItem('user_api_key')`
   - Refresh page
   - Enter: `sk-test456` (no quotes)
   - Click Save
   - ✅ Should work the same

---

## 🧪 Step 4: Test Chat Functionality (If Server Running)

### With Test Server Running:

1. **Set API key in UI:**
   - Open chat drawer
   - Enter a valid OpenAI API key: `sk-...` (no quotes)
   - Click Save

2. **Send test message:**
   - Type: "Hello, test message"
   - Press Enter or click Send

3. **Check console logs:**
   ```
   [ChatDrawer] Sending message: Hello, test message
   [LLMProvider] Gemini Nano failed, trying fallback: ...
   [LLMProvider] Llama Local failed, trying cloud fallback: ...
   [LLMProvider] Using Cloud API (Priority 3 - Online Fallback)
   [API] Using user-provided API key
   ```

4. **Check Network tab:**
   - DevTools → Network tab
   - Find `/api/chat` request
   - Check Request Headers:
     - ✅ `X-API-Key: sk-...` (no quotes)

5. **Expected:**
   - ✅ Response streams character by character
   - ✅ No errors in console
   - ✅ Message appears in chat

---

## 🐛 Troubleshooting

### Issue: "API key input not showing"

**Check:**
- Are you online? (`navigator.onLine`)
- Is an API key already set? (`localStorage.getItem('user_api_key')`)
- Clear localStorage and refresh

### Issue: "Chat not working"

**Check:**
- Is test server running? (http://localhost:3000)
- Check console for errors
- Check Network tab for `/api/chat` request
- Verify API key is set

### Issue: "CORS error"

**Fix:**
- Ensure test server has CORS headers
- Or use Vite proxy (configured in `vite.config.ts`)

---

## ✅ Testing Checklist

Before committing, verify:

- [ ] API key strips quotes correctly (test with `"key"`, `'key'`, `key`)
- [ ] UI auto-shows API key input after 1 second (if no key)
- [ ] Button color changes (amber → green)
- [ ] API key is sent in `X-API-Key` header (check Network tab)
- [ ] Chat works with API key set
- [ ] Error messages are clear and helpful
- [ ] Console logs show correct provider selection

---

## 📝 Test Results Template

After testing, document results:

```
Date: ___________
Tester: ___________

API Key Quote Stripping:
- [ ] Works with double quotes
- [ ] Works with single quotes  
- [ ] Works without quotes

UI/UX:
- [ ] Auto-prompt appears after 1 second
- [ ] Button color changes correctly
- [ ] Error messages are clear

Chat Functionality:
- [ ] API key sent correctly in headers
- [ ] Chat responses stream properly
- [ ] Console logs are helpful

Issues Found:
- 

Ready to Commit: [ ] Yes [ ] No
```

---

## 🚀 After Testing

If all tests pass:

```bash
# Stage changes
git add apps/web/src/lib/config/userKey.ts
git add STEP_BY_STEP_FIX_GUIDE.md
git add VERIFICATION_CHECKLIST.md
git add LOCAL_TESTING_SETUP.md

# Commit
git commit -m "fix: auto-strip quotes from API keys, improve UX with auto-prompt

- API keys now auto-strip quotes if user adds them
- Auto-show API key input after 1 second (if online and no key)
- Improved button visibility with color coding
- Added comprehensive testing and verification guides"

# Test build
npm run build  # Should complete without errors

# Then push
git push origin main
```

