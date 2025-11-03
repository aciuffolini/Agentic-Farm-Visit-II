# Farm Field Visit App - Software Engineering Architecture

## 🎯 Project Overview

**Farm Field Visit App** is an **offline-first Progressive Web App (PWA)** designed for field workers to capture, structure, and analyze agricultural field visits. The app is designed to work seamlessly in remote agricultural environments with intermittent connectivity, with **future compatibility for Ray-Ban Meta Gen 2 smart glasses** for hands-free sensor capture.

### Core Value Proposition
- **Offline-First**: All core features work without internet connectivity
- **Multi-Modal Capture**: GPS, voice notes, and photos (web APIs → future Ray-Ban sensors)
- **AI-Assisted Structuring**: LLM extracts structured fields from voice notes
- **Real-Time Chat**: Context-aware AI assistant for field queries
- **Flexible LLM Backend**: Supports both API calls and local inference
- **Future-Ready**: Architecture designed for Ray-Ban Meta Gen 2 integration

---

## 📐 System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Client Layer (PWA)                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Canvas     │  │ Chat Drawer  │  │  Map View   │        │
│  │  (Capture)   │  │  (Streaming) │  │  (OSM Tiles) │        │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │                 │
│  ┌──────┴─────────────────┴─────────────────┴───────────┐    │
│  │     Client State & Business Logic (Offline-First)     │    │
│  │  • GPS Manager  • Voice STT  • Photo Handler         │    │
│  │  • Outbox (offline queue)  • Local Cache (IndexedDB) │    │
│  │  • Sensor Abstraction (Web → Ray-Ban Gen 2 ready)   │    │
│  └─────────────────────────┬─────────────────────────────┘    │
│                            │                                   │
├────────────────────────────┼───────────────────────────────────┤
│                      API Boundary (HTTP/SSE)                  │
├────────────────────────────┼───────────────────────────────────┤
│                            │                                   │
│  ┌─────────────────────────▼───────────────────────────────┐  │
│  │         Server Layer (Node/TypeScript)                   │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  POST /api/chat    → LLM Router → Inference Engine      │  │
│  │  POST /api/visits  → Validate (Zod) + SQLite Insert     │  │
│  │  GET  /api/visits  → List Recent Records                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                   │
│  ┌─────────────────────────▼───────────────────────────────┐  │
│  │         LLM Inference Layer (Abstraction)               │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │  │
│  │  │ API Provider │  │Local Inference│  │   Hybrid    │  │  │
│  │  │ (OpenAI/etc) │  │ (Ollama/vLLM) │  │  Strategy   │  │  │
│  │  └──────────────┘  └──────────────┘  └────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                   │
│  ┌─────────────────────────▼───────────────────────────────┐  │
│  │              Data Layer (Prisma + SQLite)                │  │
│  │  • visits table  • Migration system                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

Future: Ray-Ban Meta Gen 2 Integration
  └─> Sensor Abstraction Layer
      └─> Unified API for camera/audio/GPS (works with web or Ray-Ban)
```

---

## 🔮 Ray-Ban Meta Gen 2 Compatibility

### Sensor Abstraction Design

The architecture uses a **sensor abstraction layer** that allows the same codebase to work with:
1. **Web APIs** (v1): `navigator.geolocation`, `MediaDevices`, Web Speech API
2. **Ray-Ban Meta Gen 2** (v2): Native smart glasses sensors

```typescript
// apps/web/src/lib/sensors/abstraction.ts

export interface SensorProvider {
  getGPS(): Promise<GPSLocation>;
  capturePhoto(): Promise<string>; // dataURL
  startRecording(): Promise<AudioStream>;
  stopRecording(): Promise<string>; // transcribed text
}

// Web implementation (v1)
export class WebSensorProvider implements SensorProvider {
  // Uses browser APIs
}

// Ray-Ban implementation (v2 - future)
export class RayBanSensorProvider implements SensorProvider {
  // Uses Meta SDK / WebRTC for smart glasses
  // Connects via Bluetooth/WebSocket to glasses
}
```

### Ray-Ban Meta Gen 2 Features (Future)

- **12MP Camera**: High-quality field photos
- **Audio Capture**: Multi-microphone array for voice notes
- **GPS**: Built-in location tracking
- **Hands-Free**: Voice commands for capture
- **Live Streaming**: Real-time sensor data over WebRTC

**Integration Strategy:**
1. Phase 1 (v1): Web APIs only
2. Phase 2 (v2): Add sensor abstraction layer
3. Phase 3 (v2.1): Ray-Ban provider implementation
4. Phase 4 (v2.2): Hybrid mode (fallback to web if glasses disconnected)

---

## 🤖 LLM Backend Architecture

### Design Philosophy

The LLM backend must support **multiple inference strategies** with a unified abstraction:

1. **API-Based** (Production): OpenAI, Anthropic, Google Gemini
2. **Local Inference** (Offline/Privacy): Ollama, vLLM, llama.cpp
3. **Hybrid** (Flexible): Fallback from API to local, or vice versa

### LLM Router Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    LLM Request Router                        │
├─────────────────────────────────────────────────────────────┤
│  Input: { messages, meta, preferences }                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Strategy Selection Logic                      │  │
│  │  • Check online/offline status                        │  │
│  │  • Check user preferences                             │  │
│  │  • Check model availability                          │  │
│  └────────────────────┬───────────────────────────────────┘  │
│                       │                                       │
│       ┌───────────────┼───────────────┐                      │
│       │               │               │                      │
│  ┌────▼────┐    ┌─────▼─────┐   ┌────▼────┐                 │
│  │  API    │    │  Local    │   │ Hybrid  │                 │
│  │Provider │    │Inference  │   │Strategy │                 │
│  └────┬────┘    └─────┬─────┘   └────┬────┘                 │
│       │               │               │                      │
│       └───────────────┼───────────────┘                      │
│                       │                                       │
│  ┌────────────────────▼───────────────────────────────────┐  │
│  │         Unified Response Format                        │  │
│  │  { tokens: stream, model: string, latency: number }    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Implementation: LLM Providers

#### 1. API Provider (apps/server/src/lib/llm/providers/api.ts)

```typescript
import OpenAI from 'openai';

export class APIProvider {
  private clients: {
    openai?: OpenAI;
    anthropic?: any;
    // ... other providers
  };

  async stream(messages: ChatMessage[], options: LLMOptions): Promise<AsyncIterable<string>> {
    const provider = options.provider || 'openai';
    
    switch (provider) {
      case 'openai':
        return this.streamOpenAI(messages, options);
      case 'anthropic':
        return this.streamAnthropic(messages, options);
      // ...
    }
  }

  private async *streamOpenAI(messages, options): AsyncGenerator<string> {
    const stream = await this.clients.openai.chat.completions.create({
      model: options.model || 'gpt-4o-mini',
      messages,
      stream: true,
    });

    for await (const chunk of stream) {
      yield chunk.choices[0]?.delta?.content || '';
    }
  }
}
```

#### 2. Local Inference Provider (apps/server/src/lib/llm/providers/local.ts)

```typescript
import { Ollama } from 'ollama';

export class LocalProvider {
  private ollama: Ollama;

  constructor() {
    this.ollama = new Ollama({ host: process.env.OLLAMA_HOST || 'http://localhost:11434' });
  }

  async stream(messages: ChatMessage[], options: LLMOptions): Promise<AsyncIterable<string>> {
    // Check if model is available locally
    const models = await this.ollama.list();
    const modelName = options.model || 'llama3.2';
    
    if (!models.models.find(m => m.name.includes(modelName))) {
      throw new Error(`Model ${modelName} not available locally`);
    }

    const stream = await this.ollama.chat({
      model: modelName,
      messages,
      stream: true,
    });

    for await (const chunk of stream) {
      yield chunk.message.content || '';
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.ollama.list();
      return true;
    } catch {
      return false;
    }
  }
}
```

#### 3. Hybrid Strategy (apps/server/src/lib/llm/providers/hybrid.ts)

```typescript
export class HybridProvider {
  private api: APIProvider;
  private local: LocalProvider;

  async stream(messages: ChatMessage[], options: LLMOptions): Promise<AsyncIterable<string>> {
    const strategy = options.strategy || 'auto';

    if (strategy === 'api-first') {
      try {
        return await this.api.stream(messages, options);
      } catch (err) {
        // Fallback to local
        if (await this.local.isAvailable()) {
          return await this.local.stream(messages, options);
        }
        throw err;
      }
    }

    if (strategy === 'local-first') {
      if (await this.local.isAvailable()) {
        return await this.local.stream(messages, options);
      }
      // Fallback to API
      return await this.api.stream(messages, options);
    }

    // 'auto': Choose based on context
    if (navigator.onLine && options.allowAPI !== false) {
      try {
        return await this.api.stream(messages, options);
      } catch {
        // Fallback silently
      }
    }
    
    // Try local
    if (await this.local.isAvailable()) {
      return await this.local.stream(messages, options);
    }

    throw new Error('No LLM provider available');
  }
}
```

#### 4. LLM Router (apps/server/src/lib/llm/router.ts)

```typescript
export class LLMRouter {
  private api: APIProvider;
  private local: LocalProvider;
  private hybrid: HybridProvider;

  async stream(
    messages: ChatMessage[],
    meta: ChatMeta,
    preferences?: LLMPreferences
  ): Promise<{
    stream: AsyncIterable<string>;
    provider: string;
    model: string;
  }> {
    const strategy = preferences?.strategy || this.detectStrategy(meta);

    let provider: APIProvider | LocalProvider | HybridProvider;
    let providerName: string;

    switch (strategy) {
      case 'api':
        provider = this.api;
        providerName = 'api';
        break;
      case 'local':
        provider = this.local;
        providerName = 'local';
        break;
      case 'hybrid':
        provider = this.hybrid;
        providerName = 'hybrid';
        break;
    }

    const stream = await provider.stream(messages, {
      model: preferences?.model,
      provider: preferences?.apiProvider,
      strategy,
    });

    return {
      stream,
      provider: providerName,
      model: preferences?.model || 'default',
    };
  }

  private detectStrategy(meta: ChatMeta): 'api' | 'local' | 'hybrid' {
    // Auto-detect based on context
    if (process.env.FORCE_LOCAL === 'true') return 'local';
    if (process.env.FORCE_API === 'true') return 'api';
    
    // Default to hybrid for flexibility
    return 'hybrid';
  }
}
```

### Chat Route Implementation (apps/server/src/routes/chat.ts)

```typescript
import { FastifyRequest, FastifyReply } from 'fastify';
import { LLMRouter } from '../lib/llm/router';
import { ChatRequestSchema } from '@farm-app/shared';

export async function chatRoute(request: FastifyRequest, reply: FastifyReply) {
  // Validate request
  const body = ChatRequestSchema.parse(request.body);
  const { messages, meta } = body;

  // Set up SSE response
  reply.type('text/event-stream');
  reply.header('Cache-Control', 'no-cache');
  reply.header('Connection', 'keep-alive');

  const router = new LLMRouter();
  
  try {
    const { stream, provider, model } = await router.stream(
      messages,
      meta,
      {
        strategy: request.query?.strategy as any,
        model: request.query?.model as string,
      }
    );

    // Stream tokens as SSE
    for await (const token of stream) {
      reply.raw.write(`data: ${JSON.stringify({ token, provider, model })}\n\n`);
    }

    reply.raw.write('data: [DONE]\n\n');
    reply.raw.end();

  } catch (error) {
    reply.raw.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    reply.raw.end();
  }
}
```

---

## 📁 Project Structure (Updated)

```
7_farm_visit/
├── apps/
│   ├── web/                    # React PWA Frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── FieldVisit.tsx
│   │   │   │   ├── ChatDrawer.tsx
│   │   │   │   ├── PrototypeMap.tsx
│   │   │   │   └── ConfirmFieldsModal.tsx
│   │   │   ├── lib/
│   │   │   │   ├── sensors/
│   │   │   │   │   ├── abstraction.ts      # Sensor provider interface
│   │   │   │   │   ├── web.ts               # Web API implementation
│   │   │   │   │   └── rayban.ts            # Ray-Ban Gen 2 (future)
│   │   │   │   ├── db.ts                    # IndexedDB cache
│   │   │   │   ├── api.ts                   # HTTP client + SSE
│   │   │   │   └── outbox.ts                # Sync manager
│   │   │   └── App.tsx
│   │   └── package.json
│   │
│   └── server/                 # Node/TypeScript Backend
│       ├── src/
│       │   ├── routes/
│       │   │   ├── chat.ts                  # POST /api/chat (SSE)
│       │   │   └── visits.ts                # POST/GET /api/visits
│       │   ├── lib/
│       │   │   ├── llm/
│       │   │   │   ├── router.ts            # LLM strategy router
│       │   │   │   └── providers/
│       │   │   │       ├── api.ts           # OpenAI/Anthropic/etc
│       │   │   │       ├── local.ts         # Ollama/vLLM
│       │   │   │       └── hybrid.ts        # Fallback strategy
│       │   │   ├── db.ts                    # Prisma client
│       │   │   └── validation.ts
│       │   └── index.ts
│       ├── prisma/
│       │   └── schema.prisma
│       └── package.json
│
├── packages/
│   └── shared/                 # Shared Types & Schemas
│       ├── src/
│       │   ├── schemas.ts
│       │   └── types.ts
│       └── package.json
│
└── README.md
```

---

## 🔧 LLM Implementation Recommendations

### Phase 1: API-Only (v1.0)
- Start with OpenAI API (simple, reliable)
- Easy to add Anthropic/Gemini later
- Fast time-to-market

### Phase 2: Add Local Support (v1.1)
- Integrate Ollama for offline capability
- Useful for privacy-sensitive farms
- Fallback when API is unavailable

### Phase 3: Hybrid Strategy (v1.2)
- Smart routing based on context
- Cost optimization (local for simple queries)
- Performance optimization (API for complex queries)

### Recommended Models

**API Providers:**
- **OpenAI**: `gpt-4o-mini` (cost-effective), `gpt-4o` (best quality)
- **Anthropic**: `claude-3-haiku` (fast), `claude-3-sonnet` (balanced)

**Local Inference:**
- **Ollama**: `llama3.2:3b` (lightweight, fast)
- **Ollama**: `llama3.2` (balanced quality/speed)
- **vLLM**: For production deployments (higher throughput)

### Configuration

```typescript
// apps/server/.env

# API Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...

# Local Inference
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.2

# Strategy
LLM_STRATEGY=hybrid  # api | local | hybrid
FORCE_LOCAL=false
FORCE_API=false

# Model Selection
DEFAULT_MODEL=gpt-4o-mini
FALLBACK_MODEL=llama3.2
```

---

## 🚀 Implementation Priority

### Immediate (v1.0 - Offline-First)
1. ✅ Offline capture (GPS, voice, photo) → Save locally
2. ✅ Outbox pattern for sync
3. ✅ LLM API provider (OpenAI) for field extraction
4. ✅ Basic chat with streaming

### Next (v1.1 - Local LLM)
5. ✅ Add Ollama/local inference provider
6. ✅ Hybrid strategy with fallback
7. ✅ Model selection UI

### Future (v2.0 - Ray-Ban Integration)
8. ✅ Sensor abstraction layer
9. ✅ Ray-Ban Meta Gen 2 provider
10. ✅ Hands-free voice commands
11. ✅ Live streaming from glasses

---

## 📊 LLM Cost & Performance Considerations

### API-Based (Production)
- **Cost**: ~$0.01-0.05 per field extraction
- **Latency**: 1-3 seconds
- **Quality**: Highest (GPT-4o, Claude)
- **Reliability**: High (99.9% uptime)

### Local Inference (Offline)
- **Cost**: Free (hardware only)
- **Latency**: 2-5 seconds (depends on hardware)
- **Quality**: Good (Llama 3.2, depends on model size)
- **Reliability**: 100% offline, no external deps

### Hybrid (Recommended)
- **Cost**: Optimized (use local when possible)
- **Latency**: Best of both worlds
- **Quality**: Best available
- **Reliability**: Fallback ensures availability

---

**Last Updated**: 2024-01-01  
**Version**: 0.2.0 (Offline-First + LLM Architecture)


