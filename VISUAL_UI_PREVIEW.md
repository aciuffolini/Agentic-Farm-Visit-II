# Visual UI Preview - Farm Visit App

## 🎨 Cómo Ver el Diseño

### Opción 1: Navegador (Recomendado)

1. **Abre tu navegador**
2. **Ve a**: http://localhost:5173
3. **Abre DevTools**:
   - Presiona `F12` o `Ctrl+Shift+I`
   - Click en el ícono de móvil (Toggle device toolbar)
   - O presiona `Ctrl+Shift+M`
4. **Selecciona un dispositivo móvil**:
   - iPhone 12 Pro
   - Samsung Galaxy S20
   - O un tamaño personalizado: 375px x 812px

### Opción 2: Redimensionar Ventana

Simplemente hace la ventana del navegador más pequeña (como un celular).

---

## 📱 Pantalla Completa (Mobile View)

```
┌─────────────────────────────────────┐
│ ╔═════════════════════════════════╗ │
│ ║  FARM VISIT           [Chat]    ║ │ Header (Sticky)
│ ║  Field Capture                  ║ │
│ ╚═════════════════════════════════╝ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Capture                         │ │
│ │                                 │ │
│ │ [Get GPS]  [Record]  [Photo]   │ │ Botones
│ │                                 │ │
│ │ GPS: -34.603, -58.381 (±15m)   │ │ Status
│ │                                 │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ Voice note or type here...  │ │ │ Textarea
│ │ │                             │ │ │
│ │ └─────────────────────────────┘ │ │
│ │                                 │ │
│ │ [▶️ Audio Player]              │ │ Audio
│ │                                 │ │
│ │ [📷 Photo Preview] [Remove]    │ │ Photo
│ │                                 │ │
│ │ ────────────────────────────    │ │
│ │                                 │ │
│ │ [💾 Save Visit]                │ │ Button
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Recent Records (3)              │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ Time      Field Crop Issue  │ │ │ Header
│ │ ├─────────────────────────────┤ │ │
│ │ │ 10:30 AM  F12  Corn  Aphids │ │ │ Row 1
│ │ │ 09:15 AM  F08  Wheat  ✅    │ │ │ Row 2
│ │ │ 08:00 AM  F05  Soy   ⏳     │ │ │ Row 3
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 🎯 Elementos Visuales Clave

### Colores en Pantalla

- **Fondo general**: Gris muy claro (slate-50/100)
- **Tarjetas**: Blanco puro
- **Botones primarios**: Verde suave (emerald)
- **Botones secundarios**: Blanco con borde gris
- **Texto**: Gris oscuro (slate-800/900)

### Tipografía

- **Títulos**: Font semibold, tamaño medium
- **Textos**: Font normal, tamaño small
- **Botones**: Font medium, tamaño small
- **Tabla**: Font mono para IDs, tamaño extra small

### Espaciado

- **Márgenes entre secciones**: 16px
- **Padding interno**: 16px
- **Border radius**: 12-16px (redondeado)
- **Gap entre botones**: 8px

---

## 📸 Screenshots Mentales

### Estado Inicial
```
Header con título
↓
Section vacía: "Capture" con 3 botones
↓
Section vacía: "Recent Records (0)"
```

### Después de Capturar
```
Header
↓
Section con:
  - GPS: coordenadas visibles
  - Textarea con texto
  - Audio player visible
  - Photo preview pequeña
  - Botón "Save Visit" destacado
↓
Records con 1+ items
```

### Modal Abierto
```
Backdrop oscuro semi-transparente
↓
Modal blanco centrado con:
  - Título y descripción
  - Form grid (2 columnas)
  - Botones Cancel/Save abajo
```

### Chat Abierto
```
Panel lateral desde derecha:
  - Header con "AI Assistant"
  - Messages scrollable
  - Input fijado abajo
```

---

## 🎨 Detalles de Diseño

### Bordes y Sombras
- **Cards**: Borde sutil (`border-slate-200`)
- **Sombra**: Suave (`shadow-sm`)
- **Hover**: Sombra más pronunciada (`shadow`)

### Estados Interactivos
- **Hover**: Botones elevan sombra
- **Click**: Feedback visual inmediato
- **Loading**: Texto cambia, botón disabled
- **Active**: Estados visuales claros

### Iconografía
- **GPS**: Texto "GPS: ..."
- **Audio**: Player HTML5 nativo
- **Photo**: Preview de imagen
- **Synced**: ✅ (check) o ⏳ (clock)

---

## 📱 Optimizaciones Móviles

1. **Touch Targets**: Botones mínimo 44x44px
2. **Texto Legible**: Mínimo 14px
3. **Scroll**: Tabla horizontal si es necesario
4. **Inputs**: Tamaño adecuado para dedos
5. **Modal**: Adapta ancho al viewport
6. **Keyboard**: Inputs suben cuando keyboard aparece

---

**Para ver el diseño real: Abre http://localhost:5173 y activa el modo móvil en DevTools!** 📱


