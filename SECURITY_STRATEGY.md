# 🔐 Security Strategy for Public GitHub Repository

## Overview
This document outlines the security approach for a **public GitHub repository** that needs to be secure but accessible for device testing.

---

## 🎯 Strategy: Public Repo + Protected Endpoints

### **Core Principle:**
- ✅ **Public Repository**: Code is public for easy device testing
- 🔒 **Protected API**: Server endpoints require authentication
- 🔑 **Environment Variables**: All secrets in `.env` (gitignored)
- 🛡️ **API Key Authentication**: Simple token-based access control

---

## 📁 File Structure

### **What Goes in Git:**
```
✅ All source code
✅ .env.example (template, NO secrets)
✅ README.md
✅ Documentation
✅ .gitignore (properly configured)
```

### **What NEVER Goes in Git:**
```
❌ .env (contains secrets)
❌ node_modules/
❌ *.db (database files)
❌ API keys
❌ Passwords
❌ Private keys
❌ Build artifacts with secrets
```

---

## 🔑 Authentication Strategy

### **1. API Key Authentication (Recommended for MVP)**

**Client-side** (`apps/web/src/lib/api.ts`):
```typescript
// Read API key from environment variable
const API_KEY = import.meta.env.VITE_API_KEY || '';

// Include in headers
headers: {
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY  // API key from env
}
```

**Server-side** (middleware):
```typescript
// Verify API key on every request
if (req.headers['x-api-key'] !== process.env.API_KEY) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

### **2. Environment Variables**

**`.env` file** (local development):
```env
API_KEY=dev-key-12345-change-me
VITE_API_KEY=dev-key-12345-change-me
```

**GitHub Actions Secrets** (for CI/CD):
- Store API keys as secrets
- Use in workflows only

**Device Testing**:
- Generate unique API key per device/user
- Store in `.env` file on device (not in git)
- Rotate keys periodically

---

## 🚀 Deployment Strategy

### **Option A: Public Repo + Private Server**
1. **Public GitHub Repo**: Code accessible
2. **Private Server**: Behind authentication
3. **Device**: Uses API key from `.env`

### **Option B: Public Repo + Public Server + Rate Limiting**
1. **Public GitHub Repo**: Code accessible
2. **Public Server**: But requires API key
3. **Rate Limiting**: Prevent abuse
4. **CORS**: Restrict origins

---

## 📝 Implementation Steps

### **Step 1: Update .gitignore**
✅ Already done - `.env` is ignored

### **Step 2: Create .env.example**
✅ Template file with placeholders

### **Step 3: Add API Key to Client**
Update `apps/web/src/lib/api.ts` to include API key:

```typescript
const API_KEY = import.meta.env.VITE_API_KEY || 'demo-key';

// Add to all fetch requests
headers: {
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY
}
```

### **Step 4: Server Authentication Middleware**
When server is implemented, add:

```typescript
function requireApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const validKey = process.env.API_KEY;
  
  if (!apiKey || apiKey !== validKey) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Valid API key required'
    });
  }
  
  next();
}

// Apply to all /api routes
app.use('/api', requireApiKey);
```

### **Step 5: Generate API Keys**
```bash
# Generate strong API key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🔒 Security Best Practices

### **1. API Key Management**
- ✅ Use strong, random keys (32+ bytes)
- ✅ Different keys for dev/staging/prod
- ✅ Rotate keys periodically
- ✅ Revoke compromised keys immediately

### **2. Environment Variables**
- ✅ Never commit `.env` to git
- ✅ Use `.env.example` as template
- ✅ Use different `.env` per environment
- ✅ Store production secrets securely (Vercel, Railway, etc.)

### **3. Rate Limiting**
```typescript
// Limit requests per API key
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // max 100 requests per window
});

app.use('/api', limiter);
```

### **4. CORS Configuration**
```typescript
// Only allow specific origins
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
  credentials: true
}));
```

### **5. HTTPS in Production**
- ✅ Always use HTTPS for API endpoints
- ✅ Use secure cookies for sessions
- ✅ Validate all input data

---

## 📱 Device Testing Workflow

### **1. Clone Repository** (Public)
```bash
git clone https://github.com/yourusername/farm-visit-app.git
cd farm-visit-app
```

### **2. Create .env File**
```bash
cp .env.example .env
# Edit .env and add your API key
```

### **3. Request API Key**
- Contact repository owner
- Receive unique API key
- Add to `.env` file

### **4. Build & Test**
```bash
npm install
npm run build
npm run android:build
```

---

## 🔐 Advanced Security (Future)

### **1. OAuth 2.0**
- User authentication via GitHub/Google
- Token-based access

### **2. JWT Tokens**
- Secure, stateless authentication
- Refresh token mechanism

### **3. API Key Rotation**
- Automatic key expiration
- Key renewal process

### **4. IP Whitelisting**
- Restrict access to specific IPs
- Device fingerprinting

---

## ✅ Security Checklist

Before committing to GitHub:

- [ ] `.env` is in `.gitignore`
- [ ] `.env.example` exists with placeholders
- [ ] No API keys in code
- [ ] No passwords in code
- [ ] No database credentials in code
- [ ] No private keys in code
- [ ] README explains security setup
- [ ] API authentication implemented
- [ ] Rate limiting configured
- [ ] CORS properly configured

---

## 📚 Resources

- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [Environment Variables Best Practices](https://12factor.net/config)

---

**Remember**: Public repo doesn't mean public access. Protect your API with authentication! 🔒


