# 📱 Instalar PWA en Android - Guía Simple

## ✅ Lo que Tienes

- ✅ **PWA Compilada**: Lista y funcionando
- ✅ **Servidor Dev**: Corriendo en `http://localhost:5173`
- ✅ **Configurado para Red Local**: `host: true` en vite.config.ts
- ✅ **Service Worker**: Activado (offline-first)

---

## 🚀 Instalación en Android (2 Pasos)

### Paso 1: Encontrar tu IP Local

```powershell
ipconfig
# Busca "IPv4 Address" (ejemplo: 192.168.1.100)
```

### Paso 2: Instalar en Android

1. **En tu Android**, abre **Chrome**
2. **Ve a**: `http://TU_IP:5173` 
   - Ejemplo: `http://192.168.1.100:5173`
3. **Chrome mostrará banner**: "Instalar app" o "Agregar a pantalla de inicio"
4. **O manualmente**: Menú (⋮) → "Agregar a pantalla de inicio"
5. **Toca "Instalar"** o "Agregar"
6. **La PWA se instala** como app nativa

### Paso 3: Usar la App

- **Abre desde el icono** en la pantalla de inicio
- **Funciona como app nativa** (pantalla completa)
- **Contraseña**: `Fotheringham933@`
- **Offline**: Funciona sin internet (service worker)

---

## ✅ Ventajas de PWA

- ✅ **No requiere APK**: Instalación directa desde navegador
- ✅ **No requiere Android Studio**: Todo en navegador
- ✅ **Actualización automática**: Se actualiza cuando hay cambios
- ✅ **Offline-first**: Funciona sin internet
- ✅ **Sensores nativos**: Capacitor permite acceso a GPS, cámara, micrófono

---

## 🔧 Notas

- **Servidor debe estar corriendo** en `npm run dev` para acceso inicial
- **Misma red WiFi**: PC y Android deben estar en la misma red
- **Firewall**: Asegúrate que el puerto 5173 no esté bloqueado

---

## 🌐 Para Producción

Cuando quieras deployar:

1. **Build**: `npm run build` (ya hecho ✅)
2. **Servir `dist/`**:
   - Vercel/Netlify (gratis)
   - GitHub Pages
   - Tu propio servidor

3. **Usuarios acceden**: `https://tu-dominio.com`
4. **Instalan PWA**: Desde el navegador
5. **Funciona offline**: Service worker activo

---

**La PWA está lista! Solo necesitas exponer el servidor en la red local.** 📱✨


