# Fix Installation Issues

## Problem 1: Capacitor Camera Version Not Found

**Error**: `No matching version found for @capacitor/camera@^7.1.0`

**Solution**: Updated package.json to use compatible versions:
- `@capacitor/camera`: `^6.2.3` (compatible with Capacitor 7)
- `@capacitor/filesystem`: `^6.2.3`
- `@capacitor/geolocation`: `^6.0.3`

## Problem 2: Vite Not Found

**Error**: `"vite" no se reconoce como un comando`

**Cause**: npm install failed due to the version error, so vite wasn't installed.

**Solution**: After fixing package.json, reinstall:

```cmd
cd C:\Users\Atilio\projects\agents\7_farm_visit\apps\web

# Delete node_modules and package-lock if they exist
rmdir /s /q node_modules
del package-lock.json

# Reinstall with fixed versions
npm install
```

---

## Complete Fix Steps

### Step 1: Clean Install

```cmd
cd C:\Users\Atilio\projects\agents\7_farm_visit\apps\web

# Remove old install
rmdir /s /q node_modules
del package-lock.json

# Fresh install
npm install
```

### Step 2: Verify Vite Installed

```cmd
npx vite --version
```

Should show: `vite/7.x.x`

### Step 3: Start Dev Server

```cmd
npm run dev
```

---

## Alternative: Install Without Capacitor First

If you just want to test the web version without Android:

1. **Temporarily remove Capacitor dependencies**:
   - Comment out `@capacitor/*` packages in package.json
   - They're only needed for Android build

2. **Install and run**:
   ```cmd
   npm install
   npm run dev
   ```

3. **Add Capacitor later** when ready for Android testing

---

## Quick Test (Minimal Setup)

If you just want to see the app running:

1. **Install core dependencies only**:
   ```cmd
   cd apps\web
   npm install react react-dom vite @vitejs/plugin-react
   npm install dexie framer-motion
   npm install tailwindcss postcss autoprefixer
   ```

2. **Run**:
   ```cmd
   npx vite
   ```

This will get the basic app running without Capacitor plugins.

---

**Fixed versions are in package.json now. Just run `npm install` again!** ✅


