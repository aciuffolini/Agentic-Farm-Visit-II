# 📱 Instalación en Android desde GitHub

## Requisitos Previos

- **Dispositivo Android** (físico recomendado)
- **Conexión a Internet** (para clonar y descargar)
- **Android Studio** (opcional, para desarrollo avanzado)
- **Node.js 18+** (si vas a compilar desde código)

---

## Método 1: Instalar desde Código Fuente (Recomendado para Testing)

### Paso 1: Clonar el Repositorio

En tu computadora (Windows/Mac/Linux):

```bash
git clone https://github.com/TU_USUARIO/farm-visit-app.git
cd farm-visit-app
```

### Paso 2: Configurar Variables de Entorno

```bash
# Copiar template
cp .env.example .env

# Editar .env y agregar:
# APP_PASSWORD=Fotheringham933@
```

### Paso 3: Instalar Dependencias

```bash
# Instalar todas las dependencias
npm install

# Compilar package compartido
cd packages/shared
npm run build
cd ../..
```

### Paso 4: Compilar para Android

```bash
cd apps/web

# Construir la aplicación web
npm run build

# Sincronizar con Capacitor Android
npx cap sync android
```

### Paso 5: Generar APK

**Opción A: Desde Android Studio (Recomendado)**
```bash
# Abrir en Android Studio
npx cap open android

# En Android Studio:
# 1. Build → Build Bundle(s) / APK(s) → Build APK(s)
# 2. El APK se genera en: apps/web/android/app/build/outputs/apk/debug/
```

**Opción B: Desde Línea de Comandos**
```bash
cd apps/web/android
./gradlew assembleDebug

# El APK estará en:
# apps/web/android/app/build/outputs/apk/debug/app-debug.apk
```

### Paso 6: Instalar en Dispositivo Android

**Opción 1: USB (Debugging)**
```bash
# Conectar dispositivo por USB
# Habilitar "USB Debugging" en opciones de desarrollador
adb devices  # Verificar conexión
adb install apps/web/android/app/build/outputs/apk/debug/app-debug.apk
```

**Opción 2: Transferir APK Manualmente**
1. Copiar `app-debug.apk` al dispositivo Android
2. En el dispositivo: Settings → Security → Habilitar "Instalar desde fuentes desconocidas"
3. Abrir el archivo APK en el dispositivo
4. Tocar "Instalar"

**Opción 3: Compartir por Email/Drive**
1. Subir APK a Google Drive / Email
2. Descargar en dispositivo Android
3. Instalar desde descarga

---

## Método 2: Instalar APK Pre-compilado (Más Rápido)

Si ya tienes un APK compartido:

1. **Descargar APK** al dispositivo Android
2. **Habilitar instalación desde fuentes desconocidas:**
   - Settings → Security → "Fuentes desconocidas" (activar)
3. **Abrir el archivo APK** desde descargas
4. **Tocar "Instalar"**
5. **Ingresar contraseña:** `Fotheringham933@` cuando se solicite

---

## Configuración Inicial en el Dispositivo

### Primera Vez que Abres la App:

1. **Permisos Requeridos:**
   - ✅ **Cámara**: Para capturar fotos del campo
   - ✅ **Micrófono**: Para grabar notas de voz
   - ✅ **Ubicación**: Para GPS de alta precisión
   - ✅ **Almacenamiento**: Para guardar datos offline

2. **Autenticación:**
   - Ingresa la contraseña: `Fotheringham933@`
   - Esta contraseña se valida localmente (offline)

3. **Configuración:**
   - La app funciona **offline-first**
   - No requiere conexión para capturar visitas
   - Sincroniza cuando hay internet disponible

---

## Verificar Instalación

1. **Abrir la app** en tu dispositivo
2. **Verificar permisos:**
   - Settings → Apps → Farm Visit → Permissions
   - Todos los permisos deben estar concedidos

3. **Probar funcionalidades:**
   - ✅ GPS: Tocar "Get GPS"
   - ✅ Cámara: Tocar "Take Photo"
   - ✅ Micrófono: Tocar "Record Voice"
   - ✅ Chat: Tocar "Chat" en header

---

## Solución de Problemas

### "App no se instala"
- ✅ Verificar "Fuentes desconocidas" habilitado
- ✅ Verificar que el APK no está corrupto
- ✅ Verificar espacio suficiente en dispositivo

### "Permisos no funcionan"
- ✅ Ir a Settings → Apps → Farm Visit → Permissions
- ✅ Habilitar manualmente: Cámara, Micrófono, Ubicación

### "GPS no funciona"
- ✅ Habilitar GPS en Settings del dispositivo
- ✅ Seleccionar "Alta precisión" en modo de ubicación
- ✅ Probar en exteriores (mejor señal)

### "Cámara no abre"
- ✅ Verificar permiso de cámara concedido
- ✅ Cerrar otras apps que usen cámara
- ✅ Reiniciar dispositivo si persiste

---

## Actualizar la App

### Si tienes el código fuente:
```bash
cd farm-visit-app
git pull
npm install
cd apps/web
npm run build
npx cap sync android
npx cap open android
# Re-compilar APK desde Android Studio
```

### Si solo tienes APK:
1. Descargar nueva versión del repositorio
2. Instalar APK nuevo (reemplaza la versión anterior)

---

## Desinstalar

1. Settings → Apps → Farm Visit
2. Tocar "Desinstalar"
3. Confirmar desinstalación

**Nota**: Se perderán todos los datos locales no sincronizados.

---

## Seguridad

- 🔒 La contraseña se valida **localmente** (offline)
- 🔒 No se transmite por internet
- 🔒 Los datos se almacenan **localmente** en el dispositivo
- 🔒 Sincronización opcional al servidor (requiere API key separada)

---

## Soporte

Si encuentras problemas:
1. Revisar logs: `adb logcat | grep "FarmVisit"`
2. Verificar versión de Android (mínimo Android 8.0)
3. Contactar al desarrollador con detalles del error

---

**¡Listo para usar en el campo!** 🌾📱


