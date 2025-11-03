# Quick Start Guide

## 🚀 Installation (Windows)

### Method 1: Use Command Prompt (CMD) - Recommended

1. Open **Command Prompt** (not PowerShell):
   - Press `Win + R`
   - Type `cmd` and press Enter

2. Navigate to project:
   ```cmd
   cd C:\Users\Atilio\projects\agents\7_farm_visit
   ```

3. Install dependencies:
   ```cmd
   npm install
   ```

4. Build shared package:
   ```cmd
   cd packages\shared
   npm install
   npm run build
   ```

5. Install web app:
   ```cmd
   cd ..\..\apps\web
   npm install
   ```

### Method 2: Use Install Script

Double-click `INSTALL.bat` or run:
```cmd
INSTALL.bat
```

### Method 3: Fix PowerShell Execution Policy

If you prefer PowerShell:

1. Open PowerShell as Administrator:
   - Right-click PowerShell
   - "Run as administrator"

2. Change policy:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. Then run:
   ```powershell
   npm install
   ```

---

## ▶️ Start Development

```cmd
cd apps\web
npm run dev
```

Open http://localhost:5173 in your browser.

---

## ✅ What Works Now

- ✅ GPS capture
- ✅ Photo capture
- ✅ Voice recording
- ✅ Save visits locally
- ✅ View recent records
- ✅ Offline sync queue

**Note**: Chat requires server (will show error without server, but everything else works!)

---

## 🐛 Troubleshooting

### "npm not recognized"
Install Node.js from https://nodejs.org/ (v18+)

### "Cannot find module '@farm-visit/shared'"
Build shared package first:
```cmd
cd packages\shared
npm install
npm run build
```

### PowerShell errors
Just use Command Prompt (CMD) instead!

---

**Ready to go?** Run `INSTALL.bat` or follow Method 1 above! 🚀


