# ☁️ Cloud API Fallback - Testing Setup Guide

## 🎯 Quick Test Setup

To test the **tertiary Cloud API fallback** (Priority 3), you need a simple server endpoint.

### Option 1: Direct OpenAI API (Simplest for Testing)

**Update `apps/web/.env` or set environment variable:**
```env
VITE_API_URL=https://api.openai.com/v1
```

**Then modify `apps/web/src/lib/api.ts`** to call OpenAI directly:
- Use `/chat/completions` endpoint
- Include `Authorization: Bearer YOUR_API_KEY` header
- Parse SSE stream response

### Option 2: Create Simple Test Server (Recommended)

Create a minimal Node.js server to proxy requests with user API keys.

---

## 📋 Testing Steps

### Step 1: Force Cloud API Fallback

To test **only** the cloud API (skip Gemini Nano and Llama):
1. Disable Gemini Nano check
2. Make Llama return `false` for availability
3. Ensure device is online
4. Configure API endpoint

### Step 2: Check Console Logs

When you send a chat message, you should see:
```
[LLMProvider] Gemini Nano failed, trying fallback: ...
[LLMProvider] Llama Local failed, trying cloud fallback: ...
[LLMProvider] Using Cloud API (Priority 3 - Online Fallback)
[ChatDrawer] Using provider: cloud-api
```

### Step 3: Verify Stream Works

- Messages should appear character by character (streaming)
- Check browser DevTools Network tab for `/api/chat` request
- Verify SSE stream is working

---

## 🔧 Quick Server Setup (For Testing)

### Minimal Fastify Server

**File: `apps/server/src/index.ts`** (if it doesn't exist, create it)

```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';

const PORT = 8787;
const app = Fastify();

await app.register(cors, { origin: true });

app.post('/api/chat', async (req, reply) => {
  const { messages } = req.body as any;
  const apiKey = req.headers['x-api-key'] as string || process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    reply.status(401).send({ error: 'API key required' });
    return;
  }

  // Set SSE headers
  reply.raw.setHeader('Content-Type', 'text/event-stream');
  reply.raw.setHeader('Cache-Control', 'no-cache');
  
  // Call OpenAI
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

  // Stream response
  const reader = res.body?.getReader();
  if (!reader) {
    reply.status(500).send({ error: 'No response body' });
    return;
  }

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

app.listen({ port: PORT }, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

### Run Server

```bash
cd apps/server
npm install fastify @fastify/cors
npm run dev
```

---

## 🧪 Testing Checklist

- [ ] Server is running on port 8787
- [ ] `VITE_API_URL=http://localhost:8787` (or your server URL)
- [ ] API key configured (via header or env)
- [ ] Device is online
- [ ] Gemini Nano disabled/fails (for testing)
- [ ] Chat message sends successfully
- [ ] Response streams correctly
- [ ] Console shows "Using Cloud API"

---

## 📊 Expected Behavior

**Flow:**
1. User sends message
2. LLMProvider tries Gemini Nano → fails (or not available)
3. LLMProvider tries Llama Local → fails (not implemented)
4. LLMProvider tries Cloud API → **SUCCESS** ✅
5. Response streams from server → OpenAI → client

**Console Output:**
```
[ChatDrawer] Sending message: "Hello"
[LLMProvider] Gemini Nano failed, trying fallback: ...
[LLMProvider] Llama Local failed, trying cloud fallback: Model not installed
[LLMProvider] Using Cloud API (Priority 3 - Online Fallback)
[ChatDrawer] Using provider: cloud-api
[ChatDrawer] Received chunk: "Hello"
[ChatDrawer] Received chunk: "! "
[ChatDrawer] Received chunk: "How"
...
```

---

## 🐛 Troubleshooting

**Error: "No LLM provider available"**
- Check server is running
- Verify `VITE_API_URL` is set correctly
- Check API key is provided
- Ensure device is online

**Error: "Chat API error: 401"**
- API key is missing or invalid
- Check `X-API-Key` header or server env

**No streaming / response**
- Check server logs
- Verify OpenAI API key works
- Check network tab in DevTools
- Ensure SSE format is correct

---

## ✅ Success Criteria

After testing, you should be able to provide feedback on:
- ✅ Fallback logic works correctly
- ✅ Streaming performance is acceptable
- ✅ Error messages are clear
- ✅ User experience is good
- ✅ Ready for quantized Llama implementation

