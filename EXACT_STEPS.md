# 📋 EXACT STEPS - Copy & Paste

## ✅ Step 1: Make Sure Test Server is Running

**Open a terminal and check:**
```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen
```

**If nothing shows, start server:**
```powershell
cd C:\Users\Atilio\projects\agents\7_farm_visit\apps\web
node test-server.js
```

**You should see:**
```
✅ Test Server Running
   URL: http://localhost:3000
```

**Keep this terminal open!**

---

## ✅ Step 2: Test Chat in Browser

### Method A: Simple Test Page

**1. Open browser:** http://localhost:5179/SIMPLE_TEST.html

**2. Click "Check API Key"** → Should show your key

**3. Click "Test Chat Endpoint"** → See results

---

### Method B: Browser Console (If page doesn't work)

**1. Open:** http://localhost:5179/

**2. Press F12** (opens DevTools)

**3. Click "Console" tab**

**4. Copy this ENTIRE block and paste:**

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
    console.error('ERROR:', await r.text());
    return;
  }
  console.log('✅ SUCCESS! Streaming...');
  const reader = r.body.getReader();
  const decoder = new TextDecoder();
  let count = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      console.log('✅ Complete!', count, 'chunks');
      break;
    }
    count++;
    console.log('Chunk', count + ':', decoder.decode(value).substring(0, 100));
  }
})
.catch(e => console.error('ERROR:', e));
```

**5. Press Enter**

---

## ✅ Step 3: Check Results

### ✅ If Working:
```
Status: 200
✅ SUCCESS! Streaming...
Chunk 1: data: {"id":"chatcmpl-...
Chunk 2: ...
✅ Complete! 15 chunks
```

### ❌ If Not Working:

**Error: "Failed to fetch"**
→ Test server not running. Start it!

**Error: "401 Unauthorized"**
→ API key problem. Check:
```javascript
localStorage.getItem('user_api_key')
```

**Error: "404 Not Found"**
→ Wrong URL. Make sure you're on http://localhost:5179/

---

## 📊 What to Tell Me

**After testing, say:**
1. **"It worked!"** → Great! Chat is working
2. **"Error: [paste error message]"** → I'll fix it
3. **"Nothing happened"** → Check test server is running

**That's it! Just 3 steps.**

