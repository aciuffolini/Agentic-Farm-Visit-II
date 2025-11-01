# 🚀 Getting Started - Farm Field Visit App

## 📱 For End Users (Download & Install)

### Quick Install from GitHub

1. **Download APK**:
   - Visit: [Latest Release](https://github.com/aciuffolini/Agentic-Farm-Visit/releases/latest)
   - Click "Download APK" button or download `app-debug.apk`
   
2. **Install on Android**:
   - Enable "Unknown Sources": `Settings → Security → Install unknown apps`
   - Open the downloaded APK file
   - Tap "Install"
   
3. **Launch & Login**:
   - Open the app
   - Enter password: `Fotheringham933@`
   - Start capturing field visits!

### First Use Guide

1. **Get GPS Location**: Tap "Get GPS" button
2. **Record Voice Note**: Tap "Record Voice" and speak your observations
3. **Take Photo**: Tap "Take Photo" to capture field images
4. **Save Visit**: Tap "Save Visit" to store the data
5. **View Records**: Check "Recent Records" section

---

## 👨‍💻 For Developers

### Prerequisites

- **Node.js** 18+ installed
- **Git** installed
- **(Optional) Java JDK 17** - only needed for local APK building

### Setup Project

```bash
# 1. Clone repository
git clone https://github.com/aciuffolini/Agentic-Farm-Visit.git
cd Agentic-Farm-Visit

# 2. Install dependencies
npm install

# 3. Build shared package
cd packages/shared
npm run build
cd ../..

# 4. Start development server
cd apps/web
npm run dev
```

**Open**: http://localhost:5173

### Build for Production

```bash
cd apps/web

# Build web app
npm run build

# Sync Capacitor Android
npx cap sync android
```

### Build APK (Choose One Method)

#### Method 1: GitHub Actions (Recommended - No Java Needed)

1. **Push code to GitHub**
2. **Create a tag**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. **GitHub Actions will automatically**:
   - Build the APK
   - Create a Release
   - Upload the APK

**Or manually trigger**:
- Go to: Actions → "Build Android APK" → Run workflow

#### Method 2: Local Build (Requires Java JDK 17)

```bash
# Install Java JDK 17 first (see BUILD_APK_SOLUTION.md)

# Build APK
cd apps/web/android
.\gradlew.bat assembleDebug

# APK location:
# apps/web/android/app/build/outputs/apk/debug/app-debug.apk
```

**Full guide**: [BUILD_APK_SOLUTION.md](./BUILD_APK_SOLUTION.md)

---

## 🔧 Troubleshooting

### App won't install on Android

- **Enable Unknown Sources**: Settings → Security → Install unknown apps
- **Check APK**: Make sure you downloaded the correct file
- **Storage**: Ensure you have enough storage space

### Development Issues

**npm install fails**:
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Build fails**:
```bash
# Clean build
cd apps/web
rm -rf dist android/app/build
npm run build
npx cap sync android
```

**GPS not working**:
- Test on real device (emulator GPS is simulated)
- Grant location permissions
- Enable high-accuracy mode in device settings

---

## 📚 Next Steps

- **Read**: [README.md](./README.md) for full documentation
- **Android Setup**: [INSTALL_ANDROID.md](./INSTALL_ANDROID.md)
- **Build APK**: [DEPLOY_ANDROID.md](./DEPLOY_ANDROID.md)
- **Architecture**: [FARM_VISIT_ARCHITECTURE.md](./FARM_VISIT_ARCHITECTURE.md)

---

**Need Help?** Open an issue on GitHub!
