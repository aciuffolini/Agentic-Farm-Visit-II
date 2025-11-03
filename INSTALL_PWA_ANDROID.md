# 📱 Instalar PWA en Android - Sin Android Studio

## ✅ Situación Actual

- ✅ **PWA Compilada**: `apps/web/dist/` lista
- ✅ **Servidor Dev Corriendo**: http://localhost:5173
- ✅ **Capacitor Configurado**: Listo para sensores nativos
- ⏳ **PWA Instalable**: Necesita ser servida para instalación

---

## 🚀 Opción 1: Instalar PWA desde Servidor Local (Más Fácil)

### Paso 1: Hacer Servidor Accesible en Red Local

El servidor ya está corriendo en `http://localhost:5173`. Para acceder desde Android:

**Opción A: Exponer en red local**
```powershell
cd C:\Users\Atilio\projects\agents\7_farm_visit\apps\web
npm run dev -- --host
```

Esto expondrá en: `http://TU_IP_LOCAL:5173`

**Para encontrar tu IP:**
```powershell
ipconfig
# Busca "IPv4 Address" (ej: 192.168.1.100)
```

### Paso 2: Acceder desde Android

1. **En tu Android**, abre Chrome
2. **Ve a**: `http://TU_IP_LOCAL:5173` (ej: `http://192.168.1.100:5173`)
3. **Chrome mostrará**: "Agregar a pantalla de inicio" o "Install app"
4. **Toca "Instalar"** o "Add to Home Screen"
5. **La PWA se instalará** en tu dispositivo

### Paso 3: Usar la App

- Abre desde el icono en la pantalla de inicio
- Funcionará como app nativa
- Contraseña: `Fotheringham933@`

---

## 🌐 Opción 2: Desplegar a Servidor Público (Para Testing Remoto)

### Servicios Gratuitos:

**Vercel:**
```bash
npm install -g vercel
cd apps/web
vercel --prod
```

**Netlify:**
```bash
npm install -g netlify-cli
cd apps/web
netlify deploy --prod --dir=dist
```

**GitHub Pages:**
1. Subir `dist/` a GitHub
2. Habilitar Pages en Settings
3. Acceder desde Android: `https://TU_USUARIO.github.io/Agentic-Farm-Visit/`

---

## 📦 Opción 3: Compartir Build Local (Temporal)

Si tienes el build compilado:

1. **Servir `dist/` con servidor HTTP simple:**
```powershell
cd C:\Users\Atilio\projects\agents\7_farm_visit\apps\web\dist
python -m http.server 8080
# O usar: npx serve -s dist -l 8080
```

2. **Acceder desde Android**: `http://TU_IP:8080`

---

## ✅ Checklist de PWA

Verifica que la PWA esté correctamente configurada:

- [x] `vite.config.ts` tiene plugin PWA ✅
- [x] `manifest.webmanifest` generado ✅
- [x] Service Worker generado ✅
- [x] HTTPS o localhost (requisito PWA)

---

## 🔧 Configuración Actual

**Servidor Dev**: `http://localhost:5173`
- ✅ Funciona en navegador local
- ⚠️ Necesita `--host` para acceso desde red local
- ✅ PWA instalable cuando se accede

**Build de Producción**: `apps/web/dist/`
- ✅ Lista para servir
- ✅ Puede desplegarse a cualquier hosting
- ✅ Funciona como PWA completa

---

## 📱 Instrucciones para Usuario Android

### Método Rápido (Desde tu red local):

1. **Asegúrate que servidor esté corriendo con --host**
2. **En Android Chrome**: Ve a `http://TU_IP:5173`
3. **Menú Chrome** (3 puntos) → "Agregar a pantalla de inicio"
4. **Instalar** → La app aparecerá como icono
5. **Abrir app** → Ingresar contraseña: `Fotheringham933@`

### La App Funcionará:
- ✅ GPS (si permites ubicación)
- ✅ Cámara (si permites)
- ✅ Micrófono (si permites)
- ✅ Offline (service worker)
- ✅ Como app nativa

---

**¿Prefieres que exponga el servidor en la red local o desplegar a un servicio público?** 🌐


