# 📦 How to Publish v1.0.8-fix as Latest Release

## Problem
The download button uses `/releases/latest` which points to the most recently **published** GitHub Release, not the latest tag. If v1.0.5 is the last published release, it will be "latest" even though v1.0.8-fix tag exists.

## Solution: Publish v1.0.8-fix as a Release

### Step 1: Go to GitHub Releases
Visit: https://github.com/aciuffolini/Agentic-Farm-Visit/releases

### Step 2: Create/Edit v1.0.8-fix Release

**Option A: If release doesn't exist**
1. Click "Draft a new release"
2. Click "Choose a tag" → Select `v1.0.8-fix`
3. **Release title**: `Farm Visit App v1.0.8-fix`
4. **Description**: Copy from V1.0.8_CHANGES.md or use:
   ```
   ## v1.0.8-fix - Model Selection & Enhanced Prompt Engineering
   
   ### Bug Fixes
   - Fixed GPT-4o mini integration with enhanced debug logging
   - Fixed hardcoded prompts in Gemini Nano and Llama Local to use enhanced prompts
   - All models now properly receive structured visit context
   
   ### New Features
   - Model selection UI (Auto, Nano, ChatGPT 4o mini, Llama Small)
   - Enhanced prompt engineering with structured visit context
   - Improved system prompts for all models
   ```
5. Check "Set as the latest release" ✅ (IMPORTANT!)
6. Click "Publish release"

**Option B: If release exists but isn't latest**
1. Click "Edit" on v1.0.8-fix release
2. Check "Set as the latest release" ✅
3. Upload APK file if not already uploaded
4. Click "Update release"

### Step 3: Upload APK File

1. In the release edit page, scroll to "Attach binaries"
2. Drag and drop your `app-debug.apk` file
3. **Important**: Name it exactly `app-debug.apk` (for the download link to work)
4. Click "Update release" or "Publish release"

### Step 4: Verify

After publishing:
1. Visit: https://github.com/aciuffolini/Agentic-Farm-Visit/releases/latest
2. Should show v1.0.8-fix as the latest release
3. The green download button will now download v1.0.8-fix

## Why This Works

- `/releases/latest` = Most recently **published** release (not latest tag)
- Publishing v1.0.8-fix as a release makes it "latest"
- The download button will automatically download from v1.0.8-fix
- Same behavior as v1.0.5, but now with the newest version

## Quick Checklist

- [ ] v1.0.8-fix tag exists (✅ already done)
- [ ] Create GitHub Release for v1.0.8-fix
- [ ] Check "Set as the latest release"
- [ ] Upload `app-debug.apk` file
- [ ] Publish release
- [ ] Verify `/releases/latest` shows v1.0.8-fix
- [ ] Test download button works

