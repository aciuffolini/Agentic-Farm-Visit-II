# 📋 Copy-Paste Test - Simple Steps

## ✅ Step 1: Check Test Server is Running

**Open PowerShell/CMD and run:**
```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen
```

**If shows nothing, start test server:**
```powershell
cd C:\Users\Atilio\projects\agents\7_farm_visit\apps\web
node test-server.js
```

**Keep this terminal open!**

---

## ✅ Step 2: Test Chat in Browser

**1. Open browser:** http://localhost:5179/

**2. Press F12** (opens DevTools)

**3. Click "Console" tab**

**4. Copy and paste this EXACT code:**

```javascript
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
    const text = await r.text();
    console.error('ERROR:', text);
    return;
  }
  console.log('✅ SUCCESS! Streaming...');
  const reader = r.body.getReader();
  const decoder = new TextDecoder();
  let chunkCount = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      console.log('✅ Complete! Received', chunkCount, 'chunks');
      break;
    }
    chunkCount++;
    const text = decoder.decode(value);
    console.log('Chunk', chunkCount + ':', text.substring(0, 100));
  }
})
.catch(e => console.error('ERROR:', e.message));
```

**5. Press Enter**

---

## 📊 What You Should See

### ✅ If Working:
```
Status: 200
✅ SUCCESS! Streaming...
Chunk 1: data: {"id":"chatcmpl-...
Chunk 2: ...
✅ Complete! Received 15 chunks
```

### ❌ If Not Working:

**Error 1: "Failed to fetch"**
→ Test server not running. Start it with `node test-server.js`

**Error 2: "401 Unauthorized"**
→ API key problem. Check:
```javascript
localStorage.getItem('user_api_key')
```

**Error 3: "404 Not Found"**
→ Wrong URL. Make sure you're on http://localhost:5179/

---

## ✅ Step 3: Check API Key

**In browser console, paste:**
```javascript
localStorage.getItem('user_api_key')
```

**Should return:** `"sk-proj-g4..."` (your key)

**If empty:** Set it:
```javascript
localStorage.setItem('user_api_key', 'sk-proj-g4-YOUR-ACTUAL-KEY');
```

---

## ✅ Step 4: Check Test Server Logs

**In the terminal where `node test-server.js` is running, you should see:**
```
📨 Chat Request Received
   Messages: 1
   API Key: sk-proj-g4...xyz
   ✅ Calling OpenAI API...
   ✅ Streaming response...
```

**If you DON'T see this:** Request not reaching server.

---

## 🎯 Quick Summary

1. **Test server running?** → Check with `Get-NetTCPConnection -LocalPort 3000`
2. **Browser console test?** → Copy/paste the fetch code above
3. **See results?** → Share what you see (success or error)

**That's it! Just 3 steps.**

