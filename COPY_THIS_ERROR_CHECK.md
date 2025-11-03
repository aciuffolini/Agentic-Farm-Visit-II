# 🔍 Copy This - Error Check

## Step 1: Open Browser Console

**1. Open:** http://localhost:5179/
**2. Press F12**
**3. Click "Console" tab**

---

## Step 2: Copy and Paste This (Check Everything)

```javascript
console.log('=== DIAGNOSTIC CHECK ===');
console.log('1. API Key:', localStorage.getItem('user_api_key') ? 'SET' : 'NOT SET');
console.log('2. Current URL:', window.location.href);
console.log('3. Testing server...');
fetch('/api/health')
  .then(r => {
    console.log('   Server status:', r.status);
    return r.json();
  })
  .then(d => console.log('   Server response:', d))
  .catch(e => console.error('   Server ERROR:', e.message));
console.log('4. Testing chat endpoint...');
fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': localStorage.getItem('user_api_key') || '',
  },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'test' }],
  }),
})
.then(r => {
  console.log('   Chat status:', r.status, r.statusText);
  if (!r.ok) {
    return r.text().then(t => console.error('   Chat ERROR:', t));
  }
  console.log('   Chat OK!');
})
.catch(e => console.error('   Chat ERROR:', e.message));
```

**Press Enter**

---

## Step 3: Share What You See

**Look for:**
- ✅ Green checkmarks = Working
- ❌ Red ERROR = Problem (copy the error message)

**Tell me:**
1. What errors appear? (copy the red text)
2. Or what status codes you see?

---

## Most Common Errors:

**"Failed to fetch"** → Test server not running
**"401 Unauthorized"** → API key problem  
**"404 Not Found"** → Wrong URL
**"ECONNREFUSED"** → Server not running

**Just paste the code above and share the results!**

