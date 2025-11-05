# 🔍 Review Issues Analysis & Fixes

## Critical Issues Identified

### 1. ❌ GitHub Pages Base Path
**Problem:** `base: "/"` in vite.config.ts will cause 404s on GitHub Pages
**Impact:** App won't load on GitHub Pages (wrong asset paths)
**Fix:** Make base path configurable via env variable

### 2. ❌ Password Stored in Plain Text
**Problem:** Password `Fotheringham933@` is hardcoded and compared directly
**Impact:** Security risk - password visible in code
**Fix:** Hash password with SHA-256, compare hashes

### 3. ❌ README Wording Misleading
**Problem:** Says "works offline-first with Gemini Nano" but should clarify cloud LLM default
**Impact:** Users expect offline LLM but get cloud API requirement
**Fix:** Update README to clarify current state vs future

### 4. ⚠️ Android Build Versions
**Problem:** AGP 8.2.1 (should be 8.5.x per review), but upgrading might break
**Impact:** Potential build issues, but current setup works
**Fix:** Document current vs recommended, test before upgrading

### 5. ✅ API Key UX - Already Good
**Status:** Already implemented with `userKey.ts` helper
**Action:** No changes needed

### 6. ⚠️ PWA Manifest
**Problem:** Need to check if manifest exists and has correct base path
**Impact:** PWA install might not work on GitHub Pages
**Fix:** Ensure manifest paths match base path

---

## Implementation Priority

1. **P0 (Critical):** GitHub Pages base path, Password hashing
2. **P1 (Important):** README wording update
3. **P2 (Nice to have):** Android build versions, PWA manifest

---

## Files to Modify

1. `apps/web/vite.config.ts` - Add base path configuration
2. `apps/web/src/components/PasswordPrompt.tsx` - Implement password hashing
3. `README.md` - Update LLM wording
4. `apps/web/android/build.gradle` - Document version notes (optional upgrade)

