# 🧹 File Cleanup Plan

## Files to Keep (Essential)

### Core Documentation
- ✅ `README.md` - Main project documentation
- ✅ `FARM_VIT_ARCHITECTURE.md` - Architecture overview
- ✅ `CHATBOT_CAPABILITIES.md` - Chatbot features

### Current Working Guides
- ✅ `LOCAL_TESTING_SETUP.md` - Testing setup
- ✅ `STEP_BY_STEP_FIX_GUIDE.md` - Fix guide
- ✅ `VERIFICATION_CHECKLIST.md` - Verification steps

### Config Files
- ✅ All `.json`, `.ts`, `.js`, `.yaml` files
- ✅ `requirements.txt`, `package.json`, etc.

---

## Files to Archive/Remove (Redundant/Old)

### Old Build Guides (Merged into main docs)
- `BUILD_APK_SOLUTION.md`
- `BUILD_CHECKLIST.md`
- `BUILD_GEMINI_NANO.md`
- `DEPLOY_ANDROID.md`
- `QUICK_BUILD_GUIDE.md`
- `GETTING_STARTED.md`
- `INSTALL_*.md` (multiple install guides)

### Old Status/Progress Files
- `MVP_STATUS.md`
- `MVP_CHECKLIST.md`
- `FEATURE_COMPLETE.md`
- `STATUS.md`
- `COMMIT_READY.md`
- `COMMIT_TO_GITHUB.md`
- `NEXT_STEPS.md`
- `ITERATION_SUMMARY.md`

### Duplicate/Redundant Documentation
- `ANDROID_ARCHITECTURE.md` (if covered in main ARCHITECTURE)
- `ANDROID_IMPLEMENTATION_GUIDE.md`
- `GEMINI_NANO_SETUP.md` (if covered elsewhere)
- `GEMINI_NANO_ANDROID_CONFIG.md`
- `GEMINI_NANO_FIXES_ANALYSIS.md`
- `ML_KIT_IMPORTS_NOTES.md`

### Testing/Setup Files (Keep latest, remove old)
- `TEST_*.md` (keep only current testing guides)
- `DEBUG_*.md` (keep only current debug guides)
- `FIX_*.md` (keep only current fix guides)
- `QUICK_*.md` (remove if redundant)

### Old Guides
- `SWARM_*.md` (if not actively used)
- `UI_*.md` (if not actively used)
- `SECURITY_STRATEGY.md` (if not actively used)

---

## Recommended Cleanup

### Option 1: Archive Old Files
Create `docs/archive/` and move old files there

### Option 2: Delete Redundant Files
Remove files that are clearly outdated or duplicate

### Option 3: Consolidate
Merge similar guides into single comprehensive documents

---

## After Cleanup

**Keep only:**
- Current working documentation
- Active guides
- Essential architecture docs
- Current testing/debugging guides

**Result:** Cleaner repo, easier to navigate

