# Farm Field Visit App - Android-First Offline PWA

🌾 **Offline-First Field Visit Capture App** — Android Native Sensors + AI Assistance

## 🎯 Features

- ✅ **Android Native Sensors**: Camera, Microphone, GPS, Speaker
- ✅ **Offline-First**: Works without internet connectivity
- ✅ **GPS Capture**: High-accuracy location tracking
- ✅ **Voice Notes**: Native audio recording
- ✅ **Photo Capture**: Native camera access
- ✅ **AI Assistance**: LLM extracts structured fields from voice notes
- ✅ **Real-Time Chat**: Context-aware AI assistant
- ✅ **Offline Sync**: Outbox pattern for network failures
- ✅ **Future-Ready**: Architecture designed for Ray-Ban Meta Gen 2

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **Android Studio** (for Android builds)
- **Java JDK 17** (for Android development)

### Setup

```bash
# Install dependencies
npm install

# Build shared package
cd packages/shared
npm run build

# Set up server database
cd ../../apps/server
cp env.template .env
npx prisma generate
npx prisma migrate dev --name init

# Install Capacitor Android platform
cd ../web
npm install @capacitor/camera @capacitor/geolocation @capacitor/filesystem
npx cap add android
```

### Development

```bash
# Terminal 1: Web app (with hot reload)
cd apps/web
npm run dev

# Terminal 2: Backend server
cd apps/server
npm run dev

# Terminal 3: Build and run on Android
cd apps/web
npm run build
npx cap sync android
npx cap run android
```

## 📱 Instalación en Android

### Opción 1: Instalar desde Código Fuente

Ver instrucciones completas en [INSTALL_ANDROID.md](./INSTALL_ANDROID.md)

**Resumen rápido:**
```bash
# Clonar repositorio
git clone https://github.com/TU_USUARIO/farm-visit-app.git
cd farm-visit-app

# Instalar dependencias
npm install
cd packages/shared && npm run build && cd ../..

# Compilar para Android
cd apps/web
npm run build
npx cap sync android
npx cap open android

# En Android Studio: Build → Build APK(s)
# Instalar APK en dispositivo
```

### Opción 2: Instalar APK Pre-compilado

1. **Descargar APK** desde el repositorio
2. **Habilitar "Fuentes desconocidas"** en Settings → Security
3. **Instalar APK** desde descargas
4. **Contraseña de acceso:** `Fotheringham933@`

📚 **Ver guía completa:** [INSTALL_ANDROID.md](./INSTALL_ANDROID.md)

## 🔧 Architecture

### Sensor Abstraction Layer

The app uses a **sensor abstraction layer** that works with:
- **Android (Native)**: Capacitor plugins for camera, GPS, microphone
- **Web (Fallback)**: Web APIs for browser testing
- **Future: Ray-Ban Gen 2**: Smart glasses sensors

### Project Structure

```
7_farm_visit/
├── apps/
│   ├── web/              # React PWA + Capacitor
│   │   ├── src/
│   │   │   ├── lib/sensors/    # Sensor abstraction
│   │   │   ├── hooks/          # React hooks (useGPS, useCamera, etc.)
│   │   │   └── components/    # UI components
│   │   └── android/            # Capacitor Android project
│   └── server/            # Backend API
└── packages/
    └── shared/            # Shared types & schemas
```

## 📚 Documentation

- [Android Architecture](./ANDROID_ARCHITECTURE.md) - Detailed Android integration
- [System Architecture](./FARM_VISIT_ARCHITECTURE.md) - Full system design
- [LLM Backend](./FARM_VISIT_ARCHITECTURE.md#-llm-backend-architecture) - AI inference strategies

## 🔌 Android Permissions

The app requires these Android permissions:
- **Camera**: For field photo capture
- **Microphone**: For voice note recording
- **Fine Location**: For GPS tracking
- **Internet**: For data synchronization

See `ANDROID_ARCHITECTURE.md` for full permission details.

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind
- **Mobile**: Capacitor (Android native wrapper)
- **Backend**: Node.js + Fastify + Prisma + SQLite
- **AI**: LLM Router (API + Local inference support)
- **Sensors**: Capacitor plugins (Camera, Geolocation)

## 📦 Key Dependencies

```json
{
  "@capacitor/android": "^7.4.3",
  "@capacitor/camera": "^7.1.0",
  "@capacitor/geolocation": "^7.0.0",
  "@capacitor/filesystem": "^7.1.0"
}
```

## 🔄 Development Workflow

1. **Web Development**: Use `npm run dev` for browser testing
2. **Android Testing**: Build → Sync → Run on device
3. **Sensor Testing**: Test on real Android device (emulator may have limitations)

## 🐛 Troubleshooting

**Camera not working:**
- Ensure Android permissions are granted
- Check `AndroidManifest.xml` has camera permission
- Test on real device (emulator camera may not work)

**GPS not accurate:**
- Use real device (emulator GPS is simulated)
- Check location permissions are granted
- Enable high-accuracy mode in device settings

**Microphone not working:**
- Grant microphone permission
- Check device has working microphone
- Test audio recording separately

## 🚀 Production Build

```bash
# Build web app
cd apps/web
npm run build

# Sync to Android
npx cap sync android

# Build Android APK
npx cap build android
```

## 🔐 Security & Authentication

This repository is **public** for device testing, but **API endpoints are protected**.

### Setup for Device Testing:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/farm-visit-app.git
   ```

2. **Create `.env` file:**
   ```bash
   cp .env.example .env
   # Add your API key (contact repository owner)
   ```

3. **Request API Key:**
   - Contact the repository owner for API key
   - Add to `.env`: `VITE_API_KEY=your-api-key-here`

4. **Build and test:**
   ```bash
   npm install
   npm run build
   npm run android:build
   ```

**Note**: The app works **offline-first** with Gemini Nano. API keys are only needed for server sync features.

📚 See [SECURITY_STRATEGY.md](./SECURITY_STRATEGY.md) for full security details.

## 📄 License

MIT

---

**Ready to build?** Start with `npm install` and follow the setup instructions! 🚀

