# 🌾 Farm Field Visit App

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.1-blue.svg)
![Platform](https://img.shields.io/badge/platform-Android-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

**Offline-First Field Visit Capture App** — Android Native Sensors + AI Assistance

[📱 Download APK](#-download-for-android) • [🚀 Quick Start](#-quick-start) • [📖 Documentation](#-documentation)

</div>

---

## 📥 Download for Android

<div align="center">

### 🎯 **One-Click Download**

[![Download APK](https://img.shields.io/badge/Download-APK_v1.0.1-success?style=for-the-badge&logo=android&logoColor=white)](https://github.com/aciuffolini/Agentic-Farm-Visit/releases/latest/download/app-debug.apk)

**Or visit**: [Latest Release](https://github.com/aciuffolini/Agentic-Farm-Visit/releases/latest)

</div>

### 📋 Installation Steps

1. **Download APK** using the button above or visit [Releases](https://github.com/aciuffolini/Agentic-Farm-Visit/releases)
2. **Enable Unknown Sources**:
   - Go to: `Settings → Security → Install unknown apps`
   - Enable for your browser (Chrome/Edge)
3. **Install APK** from your Downloads folder
4. **Launch app** and confirm identity when prompted

> **Note**: The APK will be available after the first release is created. If you don't see the download button, check [How to Build APK](#-building-from-source).

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎯 Core Features

- ✅ **Android Native Sensors**: Camera, Microphone, GPS, Speaker
- ✅ **Offline-First**: Works without internet connectivity
- ✅ **GPS Capture**: High-accuracy location tracking
- ✅ **Voice Notes**: Native audio recording with transcription
- ✅ **Photo Capture**: Native camera access
- ✅ **AI Assistance**: Gemini Nano extracts structured fields from voice notes
- ✅ **Real-Time Chat**: Context-aware AI assistant
- ✅ **Offline Sync**: Outbox pattern for network failures
- ✅ **Farm Mapping**: KMZ/KML support from Google Earth

</td>
<td width="50%">

### 🚀 Advanced Features

- 🤖 **Multi-Agent System**: Swarm architecture for task routing
- 🗺️ **Interactive Maps**: GPS visualization with farm boundaries
- 📊 **Data Export**: CSV export for analysis
- 🔄 **Auto-Sync**: Background sync when online
- 🔐 **Secure**: Local identity verification
- 🌐 **Future-Ready**: Architecture designed for Ray-Ban Meta Gen 2

</td>
</tr>
</table>

---

## 🚀 Quick Start

### For Users (Install Pre-built APK)

👉 **See [Download for Android](#-download-for-android) above**

### For Developers

<details>
<summary><b>📋 Prerequisites</b></summary>

- **Node.js** 18+
- **Android Studio** (for Android builds)
- **Java JDK 17** (for Android development)

</details>

```bash
# Clone repository
git clone https://github.com/aciuffolini/Agentic-Farm-Visit.git
cd Agentic-Farm-Visit

# Install dependencies
npm install

# Build shared package
cd packages/shared
npm run build
cd ../..

# Development server
cd apps/web
npm run dev
# Open http://localhost:5173
```

**Full setup guide**: [INSTALL_ANDROID.md](./INSTALL_ANDROID.md)

---

## 📸 Screenshots

<div align="center">

| Capture Interface | Map View | Chat Assistant |
|-------------------|----------|----------------|
| Coming Soon | Coming Soon | Coming Soon |

</div>

---

## 🏗️ Architecture

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
│   │   │   ├── components/    # UI components
│   │   │   └── lib/agents/    # Multi-agent system
│   │   └── android/            # Capacitor Android project
│   └── server/            # Backend API
└── packages/
    └── shared/            # Shared types & schemas
```

---

## 🔧 Building from Source

### Build Android APK

<details>
<summary><b>📦 Step-by-Step</b></summary>

```bash
# 1. Install dependencies
npm install
cd packages/shared && npm run build && cd ../../apps/web

# 2. Build web app
npm run build

# 3. Sync Capacitor Android
npx cap sync android

# 4. Build APK (choose one):
# Option A: Using Gradle (requires Java JDK 17)
cd android
.\gradlew.bat assembleDebug

# Option B: Using Android Studio
npx cap open android
# Then: Build → Build Bundle(s) / APK(s) → Build APK(s)
```

**Full guide**: [DEPLOY_ANDROID.md](./DEPLOY_ANDROID.md) | [QUICK_BUILD_GUIDE.md](./QUICK_BUILD_GUIDE.md)

</details>

### Automated Build (GitHub Actions)

The repository includes a GitHub Actions workflow that automatically builds the APK:

- **Manual trigger**: Go to Actions → "Build Android APK" → Run workflow
- **Auto on tag**: Creates release automatically when you push a tag like `v1.0.0`

See [`.github/workflows/build-apk.yml`](.github/workflows/build-apk.yml)

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [INSTALL_ANDROID.md](./INSTALL_ANDROID.md) | Complete Android installation guide |
| [DEPLOY_ANDROID.md](./DEPLOY_ANDROID.md) | Build and deploy APK guide |
| [QUICK_BUILD_GUIDE.md](./QUICK_BUILD_GUIDE.md) | Quick build instructions |
| [ANDROID_ARCHITECTURE.md](./ANDROID_ARCHITECTURE.md) | Android integration details |
| [FARM_VISIT_ARCHITECTURE.md](./FARM_VISIT_ARCHITECTURE.md) | System architecture |
| [SECURITY_STRATEGY.md](./SECURITY_STRATEGY.md) | Security approach |

---

## 🛠️ Tech Stack

<table>
<tr>
<td>

**Frontend**
- React 19 + TypeScript
- Vite (build tool)
- Tailwind CSS
- Capacitor (Android)

</td>
<td>

**Backend**
- Node.js + Fastify
- Prisma + SQLite
- LLM Router (API + Local)

</td>
<td>

**Sensors**
- Capacitor Camera
- Capacitor Geolocation
- Capacitor Filesystem

</td>
</tr>
</table>

---

## 🔐 Security & Authentication

This repository is **public** for device testing, but **API endpoints are protected**.

### App Authentication

**Identity Verification**: The app requires identity confirmation for access.

The app will prompt "¿Eres Atilio Ciuffolini?" on launch. Only confirmed identity grants access.

### Permissions & Access

For API keys, server features, or access requests, please contact:

**Atilio Ciuffolini**  
📧 **Email**: [aciuffolini@teknal.com.ar](mailto:aciuffolini@teknal.com.ar)

**Note**: The app works **offline-first** with Gemini Nano. API keys are only needed for server sync features.

📚 See [SECURITY_STRATEGY.md](./SECURITY_STRATEGY.md) for full security details.

---

## 🐛 Troubleshooting

<details>
<summary><b>Common Issues</b></summary>

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

**APK download not working:**
- Make sure a release has been created with the APK
- Check [Releases page](https://github.com/aciuffolini/Agentic-Farm-Visit/releases)
- Try downloading manually from Releases

</details>

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Capacitor](https://capacitorjs.com/) for native Android integration
- AI powered by [Gemini Nano](https://ai.google.dev/) for on-device processing
- Maps powered by [OpenStreetMap](https://www.openstreetmap.org/)

---

<div align="center">

**Made with ❤️ for farmers**

[⭐ Star this repo](https://github.com/aciuffolini/Agentic-Farm-Visit) • [📱 Download APK](#-download-for-android) • [🐛 Report Bug](https://github.com/aciuffolini/Agentic-Farm-Visit/issues)

**Contact**: [aciuffolini@teknal.com.ar](mailto:aciuffolini@teknal.com.ar) for permissions and access

</div>
