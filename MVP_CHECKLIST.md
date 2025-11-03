# MVP Implementation Checklist

## ✅ Completed

- [x] Architecture documentation
- [x] Sensor abstraction layer (AndroidProvider, WebProvider, SensorManager)
- [x] React hooks (useGPS, useCamera, useMicrophone)
- [x] Project configuration (package.json, tsconfig, vite.config)
- [x] Local database (IndexedDB via Dexie)
- [x] API client (HTTP + SSE streaming)
- [x] Outbox pattern (offline sync)
- [x] Shared package (types & schemas)
- [x] Main App component
- [x] FieldVisit component (capture UI)
- [x] ConfirmFieldsModal component
- [x] ChatDrawer component

## 🔨 Still Missing for Full MVP

### Client (Frontend)

- [ ] **PostCSS/Tailwind setup** - Add `postcss.config.cjs` and `tailwind.config.js`
- [ ] **PWA icons** - Add `public/pwa-192.png` and `public/pwa-512.png`
- [ ] **Root package.json** - Workspace configuration for monorepo
- [ ] **Basic map view** - Simple OSM tile renderer (optional for v1)

### Server (Backend)

- [ ] **Server package.json** - Node.js dependencies
- [ ] **Fastify server** - Main server file
- [ ] **API routes**:
  - [ ] `POST /api/visits` - Save visit (validate + insert to DB)
  - [ ] `GET /api/visits` - List visits with pagination
  - [ ] `POST /api/chat` - SSE streaming (mock or OpenAI)
- [ ] **Prisma setup** - Database schema and migrations
- [ ] **SQLite database** - Initial migration

### Setup Files

- [ ] **.env.example** - Environment variables template
- [ ] **.gitignore** - Ignore node_modules, dist, etc.
- [ ] **README.md updates** - Installation instructions

---

## 🚀 Quick Start to Test MVP

### 1. Install Dependencies

```bash
cd 7_farm_visit

# Root workspace (if using monorepo)
npm install

# Or install individually:
cd packages/shared && npm install && npm run build
cd ../../apps/web && npm install
```

### 2. Add Missing Tailwind Config

Create `apps/web/postcss.config.cjs`:
```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

Create `apps/web/tailwind.config.js`:
```js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
```

### 3. Create Placeholder PWA Icons

```bash
cd apps/web/public
# Create simple 192x192 and 512x512 PNG files, or use placeholders
```

### 4. Start Development

```bash
cd apps/web
npm run dev
# Open http://localhost:5173
```

---

## 🧪 Testing the MVP

### Manual Test Checklist

1. **GPS Capture**
   - [ ] Click "Get GPS" button
   - [ ] Verify coordinates display
   - [ ] Check accuracy is shown

2. **Photo Capture**
   - [ ] Click "Take Photo"
   - [ ] Capture or select image
   - [ ] Verify preview shows
   - [ ] Click "Remove photo" works

3. **Voice Recording**
   - [ ] Click "Record Voice"
   - [ ] Verify recording indicator
   - [ ] Click "Stop Recording"
   - [ ] Verify audio playback appears

4. **Save Visit**
   - [ ] Fill in some fields
   - [ ] Click "Save Visit"
   - [ ] Verify modal opens
   - [ ] Edit fields
   - [ ] Click "Save Visit" in modal
   - [ ] Verify appears in Recent Records

5. **Offline Sync** (requires server)
   - [ ] Save visit while offline
   - [ ] Verify shows "⏳" (unsynced)
   - [ ] Go online
   - [ ] Verify auto-sync works (shows "✅")

6. **Chat** (requires server)
   - [ ] Open chat drawer
   - [ ] Type message
   - [ ] Verify streaming response appears

---

## 📦 Next Steps After MVP Works

1. **Server Implementation** - Add backend API
2. **LLM Integration** - Wire up chat to OpenAI or Ollama
3. **Android Build** - Test on real device
4. **Polish UI** - Improve styling and UX
5. **Error Handling** - Better error messages
6. **Validation** - Form validation and user feedback

---

**Status**: Client MVP is ~90% complete! Just need Tailwind config and test it. 🚀


