# Step-by-Step Installation Guide

## ✅ Fixed Issues

1. ✅ Capacitor Camera version corrected to `^6.0.2`
2. ✅ TypeScript needs to be installed in shared package

## 📋 Step-by-Step Instructions

### Step 1: Install Shared Package Dependencies

```powershell
cd C:\Users\Atilio\projects\agents\7_farm_visit\packages\shared
npm install
```

This installs TypeScript so `tsc` command works.

### Step 2: Build Shared Package

```powershell
npm run build
```

This compiles the TypeScript types.

### Step 3: Install Web App Dependencies

```powershell
cd ..\..\apps\web

# Clean if needed
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# Install with legacy peer deps
npm install --legacy-peer-deps
```

### Step 4: Start Development Server

```powershell
npm run dev
```

Or use:
```powershell
npx vite
```

---

## 🔧 Complete Copy-Paste Commands

Copy and paste these one by one:

```powershell
# Step 1: Go to shared package
cd C:\Users\Atilio\projects\agents\7_farm_visit\packages\shared
npm install
npm run build

# Step 2: Go to web app
cd ..\..\apps\web
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm install --legacy-peer-deps

# Step 3: Start app
npm run dev
```

---

## ✅ Verification

After Step 2, verify:
- `node_modules` folder exists in both `packages/shared` and `apps/web`
- `packages/shared/dist` folder exists with compiled files

Then proceed to Step 3!


