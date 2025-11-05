# 📋 Changelog v1.0.8

## 🎯 Release Summary

Major improvements focusing on **security**, **diagnostics**, **error handling**, and **user experience**.

---

## 🔒 Security Improvements

- ✅ **Password Hashing**: Implemented SHA-256 password hashing
  - No more plain text password storage
  - Secure password validation
  - Better authentication flow

---

## 🔍 Diagnostic Tools & Error Handling

- ✅ **Comprehensive Diagnostics**: Created tools to test 10 conditions
  - `test-proxy-conditions.js` - Tests first 4 conditions
  - `test-proxy-conditions-extended.js` - Tests next 6 conditions
  - Automatic root cause identification

- ✅ **Server Management Scripts**:
  - `check-server.ps1` - Check server status
  - `stop-server.ps1` - Stop server gracefully
  - `start-both.bat` - One-click start for both servers

- ✅ **Improved Error Messages**:
  - Context-aware error detection (503, 500, timeout, connection errors)
  - Clear verification steps
  - Actionable troubleshooting guidance
  - Better server connection error handling

---

## 🐛 Bug Fixes

- ✅ **Fixed TypeScript Syntax Error**: Removed `: any` annotations from test-server.js
- ✅ **Improved Server Binding**: Explicit `localhost` interface binding
- ✅ **Removed Dead Code**: Cleaned up Gemini Nano mock (150+ lines)
- ✅ **Fixed Proxy Error Suppression**: Better error detection and logging
- ✅ **Improved Error Detection**: Handles 503, 500, timeout, ECONNREFUSED

---

## 📱 UI/UX Improvements

- ✅ **Enhanced API Key Input**:
  - Added helpful links to OpenAI/Groq API key pages
  - Better placeholder text with examples
  - Keyboard shortcuts (Enter to save, Esc to cancel)
  - Disabled state for Save button when empty
  - Clear tooltips on all buttons

- ✅ **Better Chat Interface**:
  - Improved placeholder text with instructions
  - Better focus states and transitions
  - Context-aware button tooltips
  - Clearer error message formatting

- ✅ **Improved User Guidance**:
  - Better initial messages
  - Clearer instructions for troubleshooting
  - More helpful error messages

---

## ⚙️ Configuration & Developer Experience

- ✅ **GitHub Pages Support**: Configurable base path via `VITE_BASE_PATH`
- ✅ **Improved Proxy Configuration**: Better error suppression
- ✅ **Developer Tools**: Comprehensive diagnostic scripts
- ✅ **Documentation**: Extensive troubleshooting guides

---

## 📊 Technical Changes

### Files Modified
- `apps/web/vite.config.ts` - Base path, proxy error suppression
- `apps/web/test-server.js` - Fixed syntax, improved binding
- `apps/web/src/components/ChatDrawer.tsx` - UI/UX improvements
- `apps/web/src/components/PasswordPrompt.tsx` - Password hashing
- `apps/web/src/lib/config/password.ts` - NEW - Password hashing utility
- `apps/web/src/lib/llm/GeminiNanoNative.web.ts` - Simplified (removed mock)
- `apps/web/src/lib/llm/GeminiNano.ts` - Cleaned up
- `apps/web/android/app/build.gradle` - Version updated to 1.0.8
- `README.md` - Version, links, changelog updated

### Files Created
- `apps/web/test-proxy-conditions.js` - Diagnostic tool
- `apps/web/test-proxy-conditions-extended.js` - Extended diagnostics
- `apps/web/check-server.ps1` - Server status checker
- `apps/web/stop-server.ps1` - Server stopper
- `apps/web/start-both.bat` - One-click server starter
- `apps/web/src/lib/config/password.ts` - Password hashing
- Various documentation files

---

## 🚀 Migration Notes

**No breaking changes** - All improvements are backward compatible.

**For developers:**
- Server scripts are new helpers (optional)
- Password hashing is automatic (backward compatible)
- API key handling unchanged (just improved UI)

---

## 📱 Android Build

- **Version Code**: 108 (was 1)
- **Version Name**: 1.0.8 (was 1.0)
- **SDK**: No changes (compileSdk 34, targetSdk 34, minSdk 24)

---

## 🎯 Next Steps

1. **Build APK** with new version
2. **Create GitHub Release** with v1.0.8 tag
3. **Upload APK** to release
4. **Test** on Android device

---

## ✨ Summary

**v1.0.8** focuses on:
- 🔒 Security (password hashing)
- 🔍 Diagnostics (comprehensive tools)
- 🐛 Stability (bug fixes)
- 📱 UX (better guidance and tooltips)
- ⚙️ DX (developer experience improvements)

**Result**: More secure, more stable, easier to use and debug!

