# 📱 Opciones Rápidas de Instalación Android

## Situación Actual

El repositorio está en GitHub, pero **el APK aún no está compilado ni subido**.

---

## ✅ Opciones Disponibles (AHORA)

### Opción 1: Compilar desde Código (Técnica)

**Requisitos**: Android Studio, Node.js

Ver instrucciones completas: [INSTALL_ANDROID.md](./INSTALL_ANDROID.md)

```bash
# Clonar repo
git clone https://github.com/aciuffolini/Agentic-Farm-Visit.git
cd Agentic-Farm-Visit/apps/web

# Compilar
npm install
npm run build
npx cap sync android
npx cap open android
# En Android Studio: Build → Build APK(s)
```

**Tiempo estimado**: 30-60 minutos (primera vez)

---

### Opción 2: Compartir APK Directamente (Temporal)

Si ya compilaste el APK:

1. **Compartir por:**
   - Google Drive
   - Email
   - WhatsApp / Telegram
   - USB directo

2. **En Android:**
   - Descargar/recibir el APK
   - Settings → Security → "Fuentes desconocidas" (ON)
   - Abrir e instalar
   - Contraseña: `Fotheringham933@`

---

### Opción 3: GitHub Releases (Recomendada - Próximo Paso)

**Una vez que compiles el APK:**

1. Sube el APK a GitHub Releases
2. Los usuarios descargarán directamente
3. Link permanente y profesional

**Ver guía:** [DEPLOY_ANDROID.md](./DEPLOY_ANDROID.md)

---

## 🚀 Próximos Pasos Recomendados

### Paso 1: Compilar APK (Ahora)

```powershell
cd C:\Users\Atilio\projects\agents\7_farm_visit\apps\web
npm run build
npx cap sync android
npx cap open android
```

**En Android Studio**: Build → Build APK(s)

### Paso 2: Crear GitHub Release (Después)

1. Ve a: https://github.com/aciuffolini/Agentic-Farm-Visit/releases/new
2. Tag: `v1.0.0`
3. Title: `Farm Visit App v1.0.0 - MVP`
4. Arrastra el APK
5. Publicar

### Paso 3: Actualizar README con Badge (Opcional)

Después del Release, el badge funcionará automáticamente.

---

## 📋 Resumen

- ✅ **Código en GitHub**: Listo
- ⏳ **APK compilado**: Pendiente
- ⏳ **Release creado**: Pendiente
- ✅ **Documentación**: Completa

**El badge de descarga funcionará DESPUÉS de crear el Release con el APK.**

---

## 💡 Recomendación Inmediata

Para probar rápido en Android **ahora mismo**:

1. Comparte el APK por el método que prefieras (Drive, Email, etc.)
2. Los usuarios lo instalan directamente
3. Más adelante, subes a GitHub Releases para distribución profesional


