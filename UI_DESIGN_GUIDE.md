# Farm Visit App - UI Design Guide (Mobile)

## 📱 Vista General del Diseño

### Layout Principal

```
┌─────────────────────────────┐
│  Header (Sticky Top)        │
│  ┌─────────────────────┐   │
│  │ Farm Visit          │   │
│  │ Field Capture    [Chat]│ │
│  └─────────────────────┘   │
├─────────────────────────────┤
│                             │
│  Capture Section            │
│  ┌─────────────────────┐   │
│  │ Capture             │   │
│  │ [Get GPS] [Record]  │   │
│  │ [Take Photo]        │   │
│  │                     │   │
│  │ GPS Status: ...     │   │
│  │ [Textarea for note] │   │
│  │ [Audio player]      │   │
│  │ [Photo preview]     │   │
│  │                     │   │
│  │ [Save Visit]        │   │
│  └─────────────────────┘   │
│                             │
│  Recent Records             │
│  ┌─────────────────────┐   │
│  │ Recent Records (N)  │   │
│  │ ┌─────────────────┐ │   │
│  │ │ Time | Field... │ │   │
│  │ │ ... | ...       │ │   │
│  │ └─────────────────┘ │   │
│  └─────────────────────┘   │
│                             │
└─────────────────────────────┘
     ↑                      ↑
  Slide in              Chat Drawer
  Modal                 (from right)
```

---

## 🎨 Componentes de UI

### 1. Header (Top Bar)

**Ubicación**: Fijo en la parte superior (sticky)

**Contenido**:
- **Left**: 
  - Texto pequeño: "Farm Visit"
  - Título: "Field Capture"
- **Right**: 
  - Botón "Chat" (abre drawer lateral)

**Estilo**:
- Fondo: Blanco con blur (`backdrop-blur bg-white/70`)
- Borde inferior sutil
- Altura: ~60px

---

### 2. Capture Section (Principal)

**Contenido**:

#### Botones de Captura (Grid horizontal)
```
[Get GPS] [Record Voice] [Take Photo]
```
- Botones redondeados (`rounded-xl`)
- Fondo blanco con borde gris
- Hover: Sombra más pronunciada
- Estados: Loading, Disabled

#### GPS Status
- Texto pequeño (`text-xs`)
- Muestra: `GPS: lat, lon (±accuracy m)`
- Color: Gris (`text-slate-600`)

#### Textarea (Voice Note)
- Placeholder: "Voice note or type here..."
- Tamaño: 3 filas
- Estilo: Borde redondeado, padding

#### Audio Player (si hay grabación)
- Controles HTML5 nativos
- Aparece debajo del textarea cuando hay audio

#### Photo Preview
- Imagen pequeña: 80x80px
- Bordes redondeados
- Botón "Remove photo" debajo

#### Save Button
- Botón verde/emerald (`border-emerald-300 bg-emerald-50`)
- Texto: "Save Visit"
- Abre modal de confirmación

---

### 3. Recent Records Section

**Contenido**:
- Título: "Recent Records (N)" donde N es el contador
- Tabla con scroll vertical (max-height: 256px)
- Columnas:
  - Time
  - Field
  - Crop
  - Issue
  - Severity
  - Synced (✅ o ⏳)

**Estilo**:
- Fondo blanco
- Filas alternadas (odd: white, even: slate-50)
- Texto pequeño (`text-xs`)

---

### 4. Confirm Fields Modal

**Trigger**: Al hacer click en "Save Visit"

**Contenido**:
- **Header**:
  - Título: "Confirm Field Visit Details"
  - Subtítulo: "Edit any value before saving"
  - Botón "Close" (X)

- **Form Fields** (Grid 2 columnas en desktop, 1 en mobile):
  - Field ID
  - Crop
  - Issue
  - Severity (1-5, number input)
  - Note (textarea, full width)
  - Latitude (number)
  - Longitude (number)
  - Photo Present (checkbox)

- **Actions**:
  - Botón "Cancel"
  - Botón "Save Visit" (verde, disabled cuando saving)

**Estilo**:
- Fondo oscuro semi-transparente (`bg-black/30`)
- Modal blanco centrado
- Animación: Slide up desde abajo (Framer Motion)
- Ancho máximo: 720px en desktop, 92vw en mobile

---

### 5. Chat Drawer (Lateral)

**Ubicación**: Panel deslizable desde la derecha

**Trigger**: Botón "Chat" en header

**Contenido**:
- **Header**:
  - Título: "AI Assistant"
  - Botón "Close"

- **Messages Area**:
  - Scroll vertical
  - Burbujas de chat:
    - **User**: Alineado a la derecha, fondo indigo
    - **AI**: Alineado a la izquierda, fondo gris
  - Cada mensaje muestra:
    - Badge pequeño: "YOU" o "AI"
    - Contenido del mensaje
  - Streaming: El último mensaje se actualiza mientras llega

- **Input Area** (fijado abajo):
  - Input de texto (flex-1)
  - Botón "Send"
  - Placeholder: "Ask AI..."
  - Disabled cuando está procesando

**Estilo**:
- Ancho: 420px en desktop, 90vw en mobile
- Animación: Slide desde la derecha (Framer Motion)
- Sombra pronunciada
- Fondo blanco

---

## 🎨 Paleta de Colores

### Principales
- **Fondo**: `slate-50` a `slate-100` (gradiente)
- **Cards**: Blanco (`bg-white`)
- **Bordes**: `slate-200`, `slate-300`
- **Texto**: `slate-800`, `slate-900`

### Acentos
- **Verde/Éxito**: `emerald-50`, `emerald-300` (botones de guardar)
- **Indigo**: `indigo-50`, `indigo-100` (mensajes de usuario)
- **Rojo**: Para errores o warnings

### Estados
- **Hover**: Sombra más pronunciada (`shadow-sm` → `shadow`)
- **Disabled**: `opacity-50`
- **Loading**: Texto cambia ("Getting GPS..." → "Get GPS")

---

## 📱 Responsive Design

### Mobile (< 768px)
- Form modal: Full width (92vw)
- Botones: Stack vertical si es necesario
- Tabla: Scroll horizontal si es necesario
- Chat drawer: 90vw width

### Desktop (≥ 768px)
- Max width: 920px centrado
- Form modal: 720px máximo
- Grids: 2 columnas donde aplica
- Chat drawer: 420px fijo

---

## 🔄 Animaciones (Framer Motion)

1. **Page Load**: 
   - Fade in + slide up (`opacity: 0 → 1`, `y: 8 → 0`)

2. **Modal**:
   - Backdrop: Fade in
   - Modal: Slide up + fade (`y: 12 → 0`)

3. **Chat Drawer**:
   - Slide desde derecha (`x: 420 → 0`)

4. **Botones**:
   - Hover: Sombra crece
   - Click: Feedback visual

---

## 📐 Espaciado

- **Gap entre secciones**: `gap-4` (16px)
- **Padding interno**: `p-4` (16px)
- **Padding cards**: `p-3` a `p-4`
- **Border radius**: `rounded-xl` (12px) o `rounded-2xl` (16px)

---

## 🎯 Flujo de Usuario Típico

1. **Abrir App** → Ver header + sección de capture vacía
2. **Capturar GPS** → Click "Get GPS" → Ver coordenadas
3. **Tomar Foto** → Click "Take Photo" → Ver preview
4. **Grabar Voz** → Click "Record Voice" → Ver audio player
5. **Guardar** → Click "Save Visit" → Modal se abre
6. **Editar Campos** → Llenar Field ID, Crop, Issue, etc.
7. **Confirmar** → Click "Save Visit" → Modal cierra, registro aparece en tabla

---

## 🖼️ Preview del Diseño

Para ver el diseño en acción:

1. **Abre el navegador**: http://localhost:5173
2. **Abre DevTools** (F12)
3. **Activa modo móvil** (Ctrl+Shift+M)
4. **Selecciona dispositivo**: iPhone 12 Pro o similar

O simplemente redimensiona la ventana del navegador a un tamaño móvil.

---

**El diseño es limpio, moderno y optimizado para uso móvil en el campo!** 📱✨


