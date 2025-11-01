# 📱 Deploy Android APK - Guía Completa

## 🎯 Objetivo

Facilitar la instalación de la app en Android desde GitHub sin necesidad de compilar código.

---

## ✅ Opción Recomendada: GitHub Releases

### Paso 1: Compilar APK (Una Vez)

```powershell
cd C:\Users\Atilio\projects\agents\7_farm_visit\apps\web

# 1. Instalar dependencias
npm install
cd ../../packages/shared && npm run build && cd ../../apps/web

# 2. Compilar web app
npm run build

# 3. Sincronizar con Capacitor
npx cap sync android

# 4. Abrir en Android Studio
npx cap open android
```

**En Android Studio:**
1. Build → Build Bundle(s) / APK(s) → Build APK(s)
2. Esperar a que compile
3. APK estará en: `apps/web/android/app/build/outputs/apk/debug/app-debug.apk`

### Paso 2: Crear GitHub Release

1. **Ve a tu repositorio**: https://github.com/aciuffolini/Agentic-Farm-Visit
2. **Click en "Releases"** (lado derecho)
3. **Click "Create a new release"**
4. **Configurar**:
   - **Tag**: `v1.0.0` (o `v1.0.0-mvp`)
   - **Release title**: `Farm Visit App v1.0.0 - MVP Release`
   - **Description**: 
     ```
     🎉 Primera versión MVP de Farm Visit App
     
     **Instalación Android:**
     1. Descargar APK desde abajo
     2. Habilitar "Fuentes desconocidas" en Settings → Security
     3. Instalar APK
     4. Contraseña: Fotheringham933@
     
     **Características:**
     - GPS, Cámara, Micrófono
     - Extracción de datos con IA (Gemini Nano)
     - Mapa KMZ/KML
     - Offline-first
     ```
   - **Upload files**: Arrastra el APK (`app-debug.apk`)
   - **Click**: "Publish release"

### Paso 3: Link de Descarga Directa

El APK estará disponible en:
```
https://github.com/aciuffolini/Agentic-Farm-Visit/releases/download/v1.0.0/app-debug.apk
```

**Compartir link**: Envía este link a usuarios Android para descarga directa.

---

## 📱 Badge de Descarga en README (Después de crear Release)

**Una vez que hayas creado el GitHub Release con el APK**, puedes agregar este badge al README:

```markdown
## 📥 Descarga Android

[![Download APK](https://img.shields.io/badge/Download-APK_v1.0-green?style=for-the-badge&logo=android)](https://github.com/aciuffolini/Agentic-Farm-Visit/releases/latest/download/app-debug.apk)

**Instrucciones:**
1. Toca el botón "Download APK" arriba
2. Descarga el archivo en tu Android
3. Abre el archivo descargado
4. Instala la app
5. Contraseña: `Fotheringham933@`
```

**⚠️ Nota:** El badge solo funcionará DESPUÉS de crear el Release con el APK subido.

---

## 🔄 Automatización: GitHub Actions (Futuro)

Puedes crear un workflow que compile el APK automáticamente:

```yaml
# .github/workflows/build-apk.yml
name: Build Android APK

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Build APK
        run: |
          npm install
          cd packages/shared && npm run build
          cd ../../apps/web
          npm run build
          npx cap sync android
          # Build APK usando gradle
      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: app-debug.apk
          path: apps/web/android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📋 Checklist de Deploy

- [ ] Compilar APK en Android Studio
- [ ] Probar APK en dispositivo Android
- [ ] Verificar que contraseña funciona
- [ ] Crear GitHub Release
- [ ] Subir APK al Release
- [ ] Actualizar README con link de descarga
- [ ] Probar descarga desde GitHub en dispositivo móvil

---

## 🚀 Para Usuarios Finales

### Método Más Fácil:

1. **Abrir GitHub en Android**: `https://github.com/aciuffolini/Agentic-Farm-Visit/releases`
2. **Tocar en el APK** del release más reciente
3. **Descargar** el archivo
4. **Instalar** desde descargas
5. **Contraseña**: `Fotheringham933@`

---

## 🔐 Seguridad

- ✅ APK firmado (en producción)
- ✅ Contraseña protegida localmente
- ✅ No requiere permisos especiales de Android
- ✅ Instalación desde fuentes desconocidas (estándar)

---

**Recomendación**: Usa **GitHub Releases** para distribución fácil y profesional. 📦

