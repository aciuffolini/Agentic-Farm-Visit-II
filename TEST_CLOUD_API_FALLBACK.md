# ☁️ Testing Cloud API Fallback (Tertiary Solution)

## 🎯 Goal

Test the **tertiary Cloud API fallback** before implementing quantized Llama. This will help gather feedback on:
- Fallback logic flow
- Streaming performance
- Error handling
- User experience

---

## ✅ What's Ready

**Implemented:**
- ✅ Unified LLMProvider with 3-tier fallback
- ✅ User API key management (`userKey.ts`)
- ✅ API client sends `X-API-Key` header
- ✅ Automatic fallback: Gemini Nano → Llama → Cloud API
- ✅ Console logging for debugging

**Current Flow:**
1. Gemini Nano tries first (may not be available)
2. Llama Local tries second (will fail - not implemented)
3. **Cloud API tries third** → **This is what we're testing** ✅

---

## 📋 Quick Test Setup

### Option 1: Direct OpenAI (For Quick Testing)

**Set API key in browser console:**
```javascript
window.setAPIKey('sk-your-openai-api-key-here')
```

**Note:** You'll still need a server to proxy requests (CORS). See Option 2.

### Option 2: Simple Test Server (Recommended)

**Create minimal server** (see `CLOUD_API_TESTING_SETUP.md` for full example):

```typescript
// apps/server/src/index.ts
import Fastify from 'fastify';
import cors from '@fastify/cors';

const app = Fastify();
await app.register(cors, { origin: true });

app.post('/api/chat', async (req, reply) => {
  const { messages } = req.body as any;
  const apiKey = req.headers['x-api-key'] || process.env.OPENAI_API_KEY;
  
  reply.raw.setHeader('Content-Type', 'text/event-stream');
  
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
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

  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      reply.raw.write('data: [DONE]\n\n');
      reply.raw.end();
      break;
    }
    reply.raw.write(decoder.decode(value));
  }
});

app.listen({ port: 8787 }, () => {
  console.log('Server: http://localhost:8787');
});
```

**Run:**
```bash
cd apps/server
npm install fastify @fastify/cors
npm run dev
```

**Set environment variable in web app:**
```bash
# Create apps/web/.env
VITE_API_URL=http://localhost:8787
```

---

## 🧪 Testing Steps

### 1. Start Server
- Run the server on port 8787
- Verify it's accessible

### 2. Configure API Key (Optional)

**Option A: Set in browser console:**
```javascript
window.setAPIKey('sk-...')
```

**Option B: Server uses default from env:**
```bash
export OPENAI_API_KEY=sk-...
```

### 3. Open App & Test

1. Open app in browser (or on device)
2. **Disable Gemini Nano** (or use device without Android 14+)
3. Ensure device is **online**
4. Open Chat drawer
5. Send a test message: "Hello, can you help me?"

### 4. Check Console Logs

**Expected console output:**
```
[ChatDrawer] Sending message: "Hello, can you help me?"
[LLMProvider] Gemini Nano failed, trying fallback: Android 14+ required
[LLMProvider] Llama Local failed, trying cloud fallback: Model not installed
[LLMProvider] Using Cloud API (Priority 3 - Online Fallback)
[LLMProvider] No API key found. Server may use default or require key.
[API] Using user-provided API key  // If you set key via window.setAPIKey()
[ChatDrawer] Using provider: cloud-api
[ChatDrawer] Received chunk: "Hello"
[ChatDrawer] Received chunk: "! "
[ChatDrawer] Received chunk: "I"
...
```

### 5. Verify Streaming

- ✅ Response appears character-by-character (streaming)
- ✅ No errors in console
- ✅ Response is relevant to the query
- ✅ Works consistently for multiple messages

---

## 📊 What to Test & Provide Feedback On

### 1. Fallback Flow
- ✅ Does it automatically fall back to cloud when Gemini Nano/Llama fail?
- ✅ Are error messages clear?
- ✅ Does it show which provider is being used?

### 2. Performance
- ✅ Streaming speed (characters per second)
- ✅ Latency (time to first token)
- ✅ Overall response time

### 3. User Experience
- ✅ Is the streaming smooth?
- ✅ Are error messages helpful?
- ✅ Does it feel responsive?

### 4. Edge Cases
- ✅ What happens when offline?
- ✅ What happens with invalid API key?
- ✅ What happens when server is down?

---

## 🔍 Debugging

**Check browser DevTools:**
- **Console tab:** Look for `[LLMProvider]` and `[ChatDrawer]` logs
- **Network tab:** Check `/api/chat` request
  - Status should be 200
  - Response type: `text/event-stream`
  - Preview shows streaming data

**Common Issues:**

| Issue | Solution |
|-------|----------|
| CORS error | Server needs `@fastify/cors` enabled |
| 401 Unauthorized | API key missing or invalid |
| No response | Check server logs, verify OpenAI API works |
| Not streaming | Check SSE format in server response |

---

## ✅ Success Criteria

**Before moving to quantized Llama implementation, verify:**

- [x] Fallback logic works (Gemini → Llama → Cloud)
- [x] Cloud API streaming works correctly
- [x] Performance is acceptable (2-5s response time)
- [x] Error messages are clear
- [x] User experience is smooth
- [x] API key management works (optional)

---

## 📝 Feedback Template

When testing, provide feedback on:

1. **Did fallback work?** Yes/No - Any issues?
2. **Streaming performance:** Fast/Medium/Slow - Acceptable?
3. **Error messages:** Clear/Unclear - Suggestions?
4. **Overall experience:** Good/Fair/Poor - Why?
5. **Ready for Llama?** Yes/No - Any concerns?

---

## 🚀 Next Steps After Testing

Once you provide feedback:
1. Fix any issues with fallback logic
2. Optimize performance if needed
3. Improve error messages if unclear
4. **Then proceed with quantized Llama implementation**

---

**Ready to test!** 🧪

