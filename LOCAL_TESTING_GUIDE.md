# 🧪 Local Testing Guide - Gemini Nano Mock Mode

## ✅ Yes, You Can Test Locally Before Committing!

The app now includes **mock mode** for local development testing. You can test the entire chat flow and UI without needing an Android device or building an APK.

## 🚀 How to Test Locally

### 1. **Start Development Server**

```powershell
cd C:\Users\Atilio\projects\agents\7_farm_visit\apps\web
npm run dev
```

Or if using a different setup:
```powershell
npm start
# or
npm run vite
```

### 2. **Open in Browser**

Navigate to:
- `http://localhost:5173` (Vite default)
- `http://localhost:3000` (if using different port)
- `http://127.0.0.1:5173`

### 3. **Mock Mode is Automatically Enabled**

When running on `localhost` or `127.0.0.1`, the app automatically enables **mock mode** for Gemini Nano. You'll see:

- ✅ Chat button works
- ✅ Streams responses word-by-word (simulated)
- ✅ Responds to common agricultural queries
- ✅ UI behaves exactly like Android version

## 🎭 What Mock Mode Does

### **Mock Responses Include:**

1. **Help/General Queries:**
   - "help", "what can you do", "qué puedes hacer"
   - Returns capabilities overview

2. **Pest-Related:**
   - "aphids", "áfido", "pest"
   - Returns pest management recommendations

3. **Crop-Related:**
   - "corn", "maíz", "wheat", "trigo"
   - Returns crop-specific guidance

4. **Disease-Related:**
   - "disease", "enfermedad", "rust"
   - Returns disease management advice

5. **Default:**
   - Any other query returns a helpful response explaining it's mock mode

### **Mock Features:**

- ✅ **Streaming simulation** - Words appear gradually (30ms delay)
- ✅ **Realistic delays** - 500ms response delay
- ✅ **Proper error handling** - Same as Android version
- ✅ **UI consistency** - Identical chat experience

## 📋 Testing Checklist

Before committing, test locally:

- [ ] ✅ Chat drawer opens/closes smoothly
- [ ] ✅ Messages send and receive
- [ ] ✅ Streaming animation works (words appear gradually)
- [ ] ✅ Error messages display correctly
- [ ] ✅ Multiple messages in conversation
- [ ] ✅ Different query types (help, pests, crops, diseases)
- [ ] ✅ UI responsiveness (no freezes)

## 🔍 What You CAN'T Test Locally

Mock mode simulates functionality but cannot test:

- ❌ **Real AI responses** - Uses predefined mock responses
- ❌ **Model download** - No actual Gemini Nano model
- ❌ **AICore integration** - Android system feature
- ❌ **Device-specific performance** - Memory, battery, etc.
- ❌ **Offline functionality** - Real offline AI processing

## 🚀 Testing Real Gemini Nano

To test the **actual AI** with Gemini Nano:

1. **Build Android APK:**
   ```powershell
   cd C:\Users\Atilio\projects\agents\7_farm_visit\apps\web
   npm run build
   npx cap sync android
   cd android
   .\gradlew assembleDebug
   ```

2. **Install on Android 14+ Device:**
   - Transfer `app-debug.apk` to device
   - Install and open app
   - First use: Model downloads (~2GB)
   - Test chat with real AI

## 💡 Development Workflow

### Recommended Flow:

```
1. Local Testing (Mock Mode)
   ↓
   ✓ Test UI/UX
   ✓ Test error handling
   ✓ Test conversation flow
   ↓
2. Commit to Git
   ↓
3. Build Android APK
   ↓
4. Test on Real Device (Gemini Nano)
   ↓
   ✓ Verify AI responses
   ✓ Test performance
   ✓ Verify offline functionality
```

## 🔧 Mock Mode Detection

The app automatically detects mock mode when:
- Running on `localhost`
- Running on `127.0.0.1`
- `NODE_ENV === 'development'`

You'll see console logs:
```
[GeminiNano] Using mock mode for development testing
[GeminiNanoNativeWeb] Mock Gemini Nano initialized (development mode)
```

## ⚠️ Important Notes

1. **Mock mode is for development only** - Production builds should use real Android
2. **Mock responses are predefined** - They don't reflect real AI capabilities
3. **UI/UX testing is valid** - The interface behaves the same
4. **Error handling is tested** - Same error paths as Android

## 📝 Example Test Queries

Try these in mock mode:

- "help"
- "What can you help with?"
- "I see aphids in my corn field"
- "How to manage diseases?"
- "Corn field with severity 3"
- "Áfidos en maíz"
- "Enfermedad en trigo"

All will return appropriate mock responses with streaming animation.

## 🎯 Summary

**You can fully test the chat UI and flow locally before committing!** Mock mode gives you:
- ✅ Complete UI testing
- ✅ Stream behavior verification
- ✅ Error handling validation
- ✅ Rapid iteration

**For real AI testing**, you'll need to build the Android APK and test on an Android 14+ device.

---

**Happy Testing! 🚀**


