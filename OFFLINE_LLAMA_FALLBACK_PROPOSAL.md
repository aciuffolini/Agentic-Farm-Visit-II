# 🦙 Offline Llama Fallback Proposal

## 🎯 Problem Statement

**Current Situation:**
- Primary: Gemini Nano (Android 14+ with AICore) ✅
- Issue: Many devices don't have Android 14+ or AICore support ❌
- Need: **Second offline option** for incompatible devices

**Requirement:**
- ✅ Fully offline (no internet)
- ✅ Text-only (no vision needed for fallback)
- ✅ Works on Android 7+ (wider compatibility)
- ✅ Lightweight model (< 500MB)
- ✅ Reasonable performance on mid-range devices

---

## 💡 Proposed Solution: 3-Tier Offline Architecture

```
Priority Order:
1. Gemini Nano (if available) → Android 14+, AICore
2. Llama Local (fallback) → Any Android 7+
3. Cloud API (optional) → Only if online and user provides key
```

### Architecture Flow

```
┌─────────────────────────────────────────────────┐
│         ChatDrawer.tsx                           │
│  try {                                           │
│    geminiNano.stream() → Priority 1            │
│  } catch {                                       │
│    try {                                         │
│      llamaLocal.stream() → Priority 2           │
│    } catch {                                     │
│      cloudAPI.stream() → Priority 3 (optional)  │
│    }                                             │
│  }                                               │
└─────────────────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### Option 1: ONNX Runtime Mobile (Recommended)

**Why ONNX Runtime:**
- ✅ Cross-platform (works on Android, iOS, Web)
- ✅ Hardware acceleration (GPU, NPU if available)
- ✅ Optimized for mobile inference
- ✅ Supports quantized models (INT8, INT4)
- ✅ Active maintenance by Microsoft

**Model Choice:**
- **Llama 3.2 3B** (quantized INT8) → ~2.5GB → Compress to ~500MB
- Or **TinyLlama 1.1B** (quantized) → ~400MB (faster, less quality)

**Implementation:**
1. Convert Llama to ONNX format
2. Quantize to INT8 (4x size reduction)
3. Bundle in APK or download on first use
4. Use ONNX Runtime Mobile Java API

### Option 2: TensorFlow Lite (Alternative)

**Why TFLite:**
- ✅ Google's official mobile ML framework
- ✅ Already used by Gemini Nano (familiar)
- ✅ Excellent Android integration
- ✅ Supports quantization

**Model Choice:**
- TensorFlow Lite version of Llama 2/3
- Convert from Hugging Face format

---

## 📱 Android Implementation Plan

### 1. Create Capacitor Plugin: `LlamaLocalPlugin.java`

```java
package com.farmvisit.app;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

// ONNX Runtime imports
import ai.onnxruntime.*;

@CapacitorPlugin(name = "LlamaLocal")
public class LlamaLocalPlugin extends Plugin {
    
    private OrtEnvironment env;
    private OrtSession session;
    private boolean modelLoaded = false;
    
    @PluginMethod
    public void isAvailable(PluginCall call) {
        JSObject ret = new JSObject();
        
        // Check if model file exists
        boolean modelExists = checkModelFile();
        ret.put("available", modelExists);
        ret.put("modelSize", getModelSizeMB());
        
        call.resolve(ret);
    }
    
    @PluginMethod
    public void loadModel(PluginCall call) {
        // Load ONNX model from assets or downloaded file
        // Initialize ONNX Runtime
        // Model will be ~500MB - can download on first use
    }
    
    @PluginMethod
    public void generate(PluginCall call) {
        String prompt = call.getString("prompt", "");
        // Run inference using ONNX Runtime
        // Return generated text
    }
    
    @PluginMethod
    public void stream(PluginCall call) {
        // Similar to GeminiNanoPlugin.stream()
        // Use Handler.postDelayed for non-blocking chunks
    }
}
```

### 2. TypeScript Wrapper: `LlamaLocal.ts`

```typescript
// apps/web/src/lib/llm/LlamaLocal.ts

import { Capacitor } from '@capacitor/core';
import LlamaLocalNative from './LlamaLocalNative';

export class LlamaLocal {
  private initialized: boolean = false;
  private available: boolean = false;

  async checkAvailability(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      // Web: not available
      return false;
    }

    const result = await LlamaLocalNative.isAvailable();
    this.available = result.available;
    return this.available;
  }

  async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      throw new Error('Llama Local only available on Android');
    }

    await LlamaLocalNative.loadModel();
    this.initialized = true;
  }

  async *stream(input: { text: string }): AsyncGenerator<string> {
    if (!this.initialized) {
      await this.initialize();
    }

    // Similar streaming logic to GeminiNano
    const generator = LlamaLocalNative.stream({ prompt: input.text });
    for await (const chunk of generator) {
      yield chunk;
    }
  }
}

export const llamaLocal = new LlamaLocal();
```

### 3. Unified LLM Provider: `LLMProvider.ts`

```typescript
// apps/web/src/lib/llm/LLMProvider.ts

import { geminiNano } from './GeminiNano';
import { llamaLocal } from './LlamaLocal';
import { streamChat } from '../api'; // Cloud fallback

export class LLMProvider {
  async *stream(input: { text: string; location?: { lat: number; lon: number } }): AsyncGenerator<string> {
    // Priority 1: Try Gemini Nano
    try {
      const available = await geminiNano.isAvailable();
      if (available) {
        console.log('[LLMProvider] Using Gemini Nano');
        yield* geminiNano.stream(input);
        return;
      }
    } catch (err) {
      console.warn('[LLMProvider] Gemini Nano failed:', err);
    }

    // Priority 2: Try Llama Local
    try {
      const available = await llamaLocal.checkAvailability();
      if (available) {
        console.log('[LLMProvider] Using Llama Local');
        yield* llamaLocal.stream(input);
        return;
      }
    } catch (err) {
      console.warn('[LLMProvider] Llama Local failed:', err);
    }

    // Priority 3: Cloud API (if online and configured)
    if (navigator.onLine) {
      try {
        console.log('[LLMProvider] Using Cloud API');
        const messages = [{ role: 'user', content: input.text }];
        yield* streamChat(messages, { visit: { gps: input.location } });
        return;
      } catch (err) {
        console.warn('[LLMProvider] Cloud API failed:', err);
      }
    }

    throw new Error('No LLM provider available');
  }
}

export const llmProvider = new LLMProvider();
```

### 4. Update ChatDrawer

```typescript
// In ChatDrawer.tsx - replace geminiNano.stream() with:

import { llmProvider } from '../lib/llm/LLMProvider';

// In send() method:
const generator = llmProvider.stream({
  text: userInput,
  location: visitContext?.gps 
    ? { lat: visitContext.gps.lat, lon: visitContext.gps.lon }
    : undefined,
});
```

---

## 📦 Model Management

### Option A: Bundle in APK (Larger APK, but works immediately)
- APK size: ~50MB (base) + ~500MB (model) = **~550MB total**
- ✅ Works offline immediately
- ❌ Large download

### Option B: Download on First Use (Recommended)
- APK size: ~50MB (base)
- Model download: ~500MB (one-time, cached)
- ✅ Smaller initial download
- ✅ User can choose to download model
- ❌ Requires internet for first download

**Implementation:**
```typescript
// Show dialog on first chat attempt:
"Llama model needed (~500MB). Download now? [Download] [Skip]"
// If Skip → show message: "Cloud API required, or download model later"
```

---

## 🎯 Model Recommendations

| Model | Size | Quality | Speed | RAM Needed |
|-------|------|---------|-------|------------|
| **TinyLlama 1.1B** | 400MB | Good | Fast | 2GB |
| **Llama 3.2 3B** (INT8) | 500MB | Better | Medium | 3GB |
| **Llama 2 7B** (INT8) | 2GB | Best | Slow | 4GB |

**Recommendation: Llama 3.2 3B INT8**
- Best balance of quality/size/speed
- Good for agricultural Q&A
- Works on most mid-range devices (3GB+ RAM)

---

## 📋 Implementation Checklist

### Phase 1: Setup (Week 1)
- [ ] Add ONNX Runtime Mobile dependency to `build.gradle`
- [ ] Create `LlamaLocalPlugin.java` structure
- [ ] Set up model conversion pipeline (Llama → ONNX → INT8)

### Phase 2: Core Integration (Week 2)
- [ ] Implement `LlamaLocalNative.ts` Capacitor bridge
- [ ] Create `LlamaLocal.ts` TypeScript wrapper
- [ ] Build `LLMProvider.ts` unified interface
- [ ] Test model loading and inference

### Phase 3: Integration (Week 3)
- [ ] Update `ChatDrawer.tsx` to use `LLMProvider`
- [ ] Add model download UI/flow
- [ ] Implement automatic fallback logic
- [ ] Test on multiple devices

### Phase 4: Optimization (Week 4)
- [ ] Optimize model quantization (smaller size)
- [ ] Add caching for faster startup
- [ ] Profile and optimize inference speed
- [ ] Test battery impact

---

## 🔄 Migration Path

**Step 1:** Keep Gemini Nano as primary
**Step 2:** Add Llama Local as fallback (same interface)
**Step 3:** Update ChatDrawer to use unified provider
**Step 4:** Test on devices without Gemini Nano support

**No Breaking Changes:**
- Existing Gemini Nano code stays
- New Llama code is additive
- ChatDrawer just calls different provider

---

## ⚠️ Considerations

### Device Compatibility
- **Minimum RAM:** 3GB for Llama 3.2 3B
- **Android Version:** 7+ (API 24+)
- **Storage:** 500MB+ free space for model

### Performance
- **Inference Time:** 2-5 seconds per response (vs 1-2s for Gemini Nano)
- **Battery Impact:** Medium (CPU-intensive, no GPU acceleration)
- **Quality:** Good for text Q&A, not as good as Gemini Nano

### Alternatives if ONNX Too Complex

**Simpler Option:** Use **ML Kit Text Generator** (if Google adds it)
- Or wait for **Gemini API** with local-first mode
- Or use **TensorFlow Lite** (more Android-native)

---

## 📚 Resources

1. **ONNX Runtime Mobile:** https://onnxruntime.ai/docs/tutorials/mobile/
2. **Model Conversion:** https://huggingface.co/docs/optimum/onnxruntime/usage_guides/export
3. **Llama Models:** https://huggingface.co/models?search=llama
4. **Quantization Guide:** https://onnxruntime.ai/docs/performance/model-optimizations/quantization.html

---

## ✅ Decision

**Recommended Approach:**
1. ✅ Use **ONNX Runtime Mobile** with **Llama 3.2 3B INT8**
2. ✅ **Download model on first use** (not bundled)
3. ✅ **3-tier fallback:** Gemini Nano → Llama → Cloud (optional)
4. ✅ Keep existing Gemini Nano code (no breaking changes)

**Estimated Timeline:** 3-4 weeks for full implementation

**Next Step:** Start with ONNX Runtime Mobile setup and model conversion pipeline.
