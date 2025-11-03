# 🔧 Step-by-Step Fix Guide

## 🎯 Problems Identified

1. ✅ **API Key Quotes Issue** - FIXED (auto-strips quotes now)
2. ⚠️ **Changes Not Showing on Device** - Need to rebuild APK
3. ⚠️ **gpt-4o-mini Not Working** - Need server setup OR configure direct OpenAI
4. ⚠️ **Version Confusion** - Latest tag is v1.0.6, but README says v1.0.7

---

## 📋 Step 1: Fix Version Consistency

### Create v1.0.7 Tag

```bash
cd C:\Users\Atilio\projects\agents\7_farm_visit

# Create tag
git tag v1.0.7

# Push tag
git push origin v1.0.7
```

**Verify:**
```bash
git tag --list | findstr "1.0"
# Should show: v1.0.7 (latest)
```

---

## 📋 Step 2: Verify GitHub Pages Status

**Current Status:** ✅ **ACTIVE**
- Workflow: `.github/workflows/deploy-pages.yml`
- Auto-deploys on every push to `main`
- Live URL: https://aciuffolini.github.io/Agentic-Farm-Visit/

**Check if working:**
- Visit: https://aciuffolini.github.io/Agentic-Farm-Visit/
- Should show web app interface

**Note:** GitHub Pages is for web version, NOT for APK. APK must be built separately.

---

## 📋 Step 3: Fix API Key Format (Already Fixed)

✅ **Code Updated:** `apps/web/src/lib/config/userKey.ts`
- Now automatically strips quotes if user adds them
- User can type with or without quotes

**Test:**
```javascript
// In browser console
window.setAPIKey('"sk-abc123"')  // With quotes - will work
window.setAPIKey('sk-abc123')   // Without quotes - will work
localStorage.getItem('user_api_key')  // Both will store: "sk-abc123" (clean)
```

---

## 📋 Step 4: Fix Device Not Showing Changes

### Option A: Full Rebuild (Recommended)

```bash
cd C:\Users\Atilio\projects\agents\7_farm_visit\apps\web

# 1. Clean old build
rm -rf dist
rm -rf node_modules/.vite

# 2. Rebuild web app
npm run build

# 3. Sync Capacitor (updates Android project)
npx cap sync android

# 4. Rebuild Android APK
cd android
.\gradlew.bat clean
.\gradlew.bat assembleDebug

# 5. APK location
# apps/web/android/app/build/outputs/apk/debug/app-debug.apk
```

### Option B: Quick Sync (If no major changes)

```bash
cd C:\Users\Atilio\projects\agents\7_farm_visit\apps\web

# 1. Build
npm run build

# 2. Sync
npx cap sync android

# 3. Build APK
cd android
.\gradlew.bat assembleDebug
```

**Install on Device:**
1. Copy `app-debug.apk` to device
2. Uninstall old version (if exists)
3. Install new APK
4. Launch app

---

## 📋 Step 5: Fix gpt-4o-mini Not Working

### Problem: No Server Endpoint

The app tries to call `/api/chat`, but there's no server running.

### Solution A: Quick Test Server (Recommended for Testing)

**Create minimal server:**

```bash
# Create server directory if doesn't exist
mkdir -p apps/server/src

# Create package.json
cd apps/server
```

**Create `apps/server/package.json`:**
```json
{
  "name": "farm-visit-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "node --watch src/index.js",
    "start": "node src/index.js"
  },
  "dependencies": {
    "fastify": "^4.28.1",
    "@fastify/cors": "^10.0.1"
  }
}
```

**Create `apps/server/src/index.js`:**
```javascript
import Fastify from 'fastify';
import cors from '@fastify/cors';

const PORT = 8787;
const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

app.post('/api/chat', async (req, reply) => {
  const { messages } = req.body;
  const apiKey = req.headers['x-api-key'] || process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    reply.status(401).send({ error: 'API key required. Set X-API-Key header or OPENAI_API_KEY env.' });
    return;
  }

  // Set SSE headers
  reply.raw.setHeader('Content-Type', 'text/event-stream');
  reply.raw.setHeader('Cache-Control', 'no-cache');
  reply.raw.setHeader('Connection', 'keep-alive');

  try {
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

    if (!res.ok) {
      const text = await res.text();
      reply.raw.write(`data: ${JSON.stringify({ error: text, status: res.status })}\n\n`);
      reply.raw.end();
      return;
    }

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
  } catch (error) {
    reply.raw.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    reply.raw.end();
  }
});

app.get('/health', async () => ({ ok: true }));

app.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📡 Endpoint: http://localhost:${PORT}/api/chat`);
});
```

**Run server:**
```bash
cd apps/server
npm install
npm run dev
```

**Update `apps/web/.env` or `apps/web/.env.local`:**
```env
VITE_API_URL=http://localhost:8787
```

**Rebuild web app:**
```bash
cd apps/web
npm run build
npx cap sync android
```

---

### Solution B: Direct OpenAI (Skip Server - For Quick Test)

**Modify `apps/web/src/lib/api.ts`** to call OpenAI directly:

```typescript
// Replace streamChat function to call OpenAI directly
export async function* streamChat(
  messages: ChatMessage[],
  meta?: ChatRequest['meta']
): AsyncGenerator<string> {
  const userKey = getUserApiKey();
  if (!userKey) {
    throw new Error('API key required. Please set your API key in the chat drawer.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      stream: true,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${text}`);
  }

  if (!response.body) {
    throw new Error('No response body');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;
        
        try {
          const json = JSON.parse(data);
          const content = json.choices?.[0]?.delta?.content || '';
          if (content) yield content;
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }
}
```

**Note:** This may have CORS issues. Use Solution A (server) for production.

---

## 📋 Step 6: Complete Verification Checklist

### Before Testing:

- [ ] Version tag v1.0.7 created and pushed
- [ ] README shows v1.0.7
- [ ] API key auto-strip quotes code deployed
- [ ] Web app rebuilt (`npm run build`)
- [ ] Capacitor synced (`npx cap sync android`)
- [ ] APK rebuilt (`.\gradlew.bat assembleDebug`)
- [ ] Server running (if using Solution A)
- [ ] `VITE_API_URL` configured correctly
- [ ] Old APK uninstalled from device

### Testing on Device:

1. **Install New APK:**
   - Transfer `app-debug.apk` to device
   - Install (allow Unknown Sources)
   - Launch app

2. **Test API Key:**
   - Open chat drawer
   - Wait 1 second - API key input should appear
   - Enter API key: `sk-abc123...` (NO quotes needed)
   - Click Save
   - Button should turn green: "🔑 API Key Set"

3. **Test Chat:**
   - Send test message: "Hello"
   - Should see:
     - Console: `[LLMProvider] Using Cloud API (Priority 3 - Online Fallback)`
     - Response streaming character by character

4. **Check Logs:**
   ```bash
   # Connect device via USB
   adb logcat | findstr /i "ChatDrawer LLMProvider API"
   ```

---

## 🐛 Troubleshooting

### Issue: "Changes not showing"

**Check:**
1. Did you rebuild APK after code changes? (Step 4)
2. Did you uninstall old version?
3. Check APK timestamp: Should be recent

**Fix:**
```bash
# Full rebuild
cd apps/web
npm run build
npx cap sync android
cd android
.\gradlew.bat clean assembleDebug
```

### Issue: "gpt-4o-mini not working"

**Check:**
1. Is server running? (If using Solution A)
2. Is API key set? Check: `localStorage.getItem('user_api_key')`
3. Check network request in DevTools → Network tab
4. Check server logs for errors

**Debug:**
```javascript
// In browser console
console.log('API Key:', localStorage.getItem('user_api_key'));
console.log('API URL:', import.meta.env.VITE_API_URL);
```

### Issue: "API key has quotes"

**Already Fixed:** Code now auto-strips quotes.

**Verify:**
```javascript
// Set with quotes
window.setAPIKey('"sk-abc123"');
// Check stored value (should have no quotes)
localStorage.getItem('user_api_key');  // "sk-abc123" (no outer quotes)
```

---

## ✅ Success Criteria

You'll know it's working when:
1. ✅ API key button is green after saving
2. ✅ Chat messages stream character by character
3. ✅ Console shows: `[LLMProvider] Using Cloud API`
4. ✅ No errors in browser console or server logs

---

## 📝 Next Steps After Fix

1. Test all three providers:
   - Gemini Nano (if Android 14+ with AICore)
   - Llama Local (will fail - not implemented yet)
   - Cloud API (should work with API key)

2. Create GitHub Release for v1.0.7:
   - Upload new APK
   - Update release notes

3. Document the process for future updates

