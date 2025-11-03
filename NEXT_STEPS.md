# Next Steps After npm install

## ✅ Step 1: Build Shared Package

The shared package must be built before the web app can use it:

```cmd
cd packages\shared
npm install
npm run build
```

This compiles the TypeScript types and schemas that the web app needs.

---

## ✅ Step 2: Install Web App Dependencies

```cmd
cd ..\..\apps\web
npm install
```

---

## ✅ Step 3: Start Development Server

```cmd
npm run dev
```

You should see:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## ✅ Step 4: Open in Browser

Open http://localhost:5173 in your browser.

---

## 🧪 Step 5: Test the MVP

### Test Offline Features (Works Without Server)

1. **GPS Capture**
   - Click "Get GPS" button
   - Grant location permission if prompted
   - Should show coordinates and accuracy

2. **Photo Capture**
   - Click "Take Photo"
   - Grant camera permission if prompted
   - Take or select a photo
   - Photo preview should appear

3. **Voice Recording**
   - Click "Record Voice"
   - Grant microphone permission
   - Click "Stop Recording" when done
   - Audio player should appear

4. **Save Visit**
   - Fill in some data (GPS, photo, or voice)
   - Click "Save Visit" button
   - Modal opens - edit fields if needed
   - Click "Save Visit" in modal
   - Visit appears in "Recent Records" table

5. **View Records**
   - Scroll to "Recent Records" section
   - See your saved visits in the table

### What Won't Work (Needs Server)

- **Chat**: Will show error (server not running)
- **Server Sync**: Saves stay local until server is running

---

## 🔧 Quick Command Reference

```cmd
# From project root
cd packages\shared
npm install
npm run build

cd ..\..\apps\web
npm install
npm run dev
```

---

## 🐛 Troubleshooting

### "Cannot find module '@farm-visit/shared'"
**Solution**: Build shared package first:
```cmd
cd packages\shared
npm run build
```

### "Module not found" errors
**Solution**: Make sure you ran `npm install` in both:
- `packages/shared/`
- `apps/web/`

### Port 5173 already in use
**Solution**: Kill the process or use a different port:
```cmd
npm run dev -- --port 5174
```

### GPS/Camera/Mic not working
- **Browser**: Check browser permissions (click lock icon in address bar)
- **HTTPS**: Some features require HTTPS (use localhost, it's secure)

---

## 📱 Next: Test Android (Optional)

If you want to test on Android:

```cmd
cd apps\web

# Install Capacitor plugins
npm install @capacitor/camera @capacitor/geolocation @capacitor/filesystem

# Add Android platform
npx cap add android

# Build
npm run build

# Sync to Android
npx cap sync android

# Open in Android Studio
npx cap open android
```

---

## 🚀 You're Ready!

Your MVP client is now running! Test all the offline features - they work without a server.

The only thing missing is the backend server (for chat and sync), but you can use the app fully offline! 🎉


