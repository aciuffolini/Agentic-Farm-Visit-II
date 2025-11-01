# Gemini Nano Setup Guide

## 📱 Instrucciones para el Teléfono

### 1. Requisitos del Dispositivo

- **Android 14+ (API 34+)** - Requerido para AICore y Gemini Nano
- **Dispositivo compatible**: Pixel 8 Pro/9 y otros flagships con AICore
- **Espacio**: ~2-3 GB libres para descargar el modelo Nano

### 2. Verificar Compatibilidad

Antes de instalar la app:
1. Ve a: `Settings → About Phone`
2. Verifica que `Android Version` sea **14 o superior**
3. Si tienes Android 13 o inferior, Gemini Nano **NO funcionará**

### 3. Instalar la App

1. Descarga el APK desde GitHub Releases
2. Permite "Instalar apps desconocidas" en Chrome/File Manager
3. Instala el APK
4. **Primera vez**: La app descargará automáticamente el modelo Gemini Nano (~2GB)
   - Asegúrate de tener WiFi conectado
   - No cierres la app durante la descarga

### 4. Verificar que Funciona

1. Abre la app
2. Ingresa la contraseña
3. Abre el chat (botón "Chat")
4. Escribe algo como: "help"
5. Si funciona, verás respuesta del chatbot
6. Si no funciona, verás mensaje de error

## 🔧 Configuración Técnica

### Java Dependencies

Ya incluido en `build.gradle`:
```gradle
implementation 'com.google.mlkit:genai-prompt:1.0.0-alpha01'
```

### Import Statements Correctos

El plugin Java usa:
```java
import com.google.mlkit.genai.prompt.*;
```

## ❌ Troubleshooting

### "Model not available"
- **Causa**: Dispositivo no compatible o Android < 14
- **Solución**: Usar dispositivo con Android 14+ y AICore

### "Failed to download model"
- **Causa**: Sin conexión a internet o espacio insuficiente
- **Solución**: Conectar WiFi y liberar espacio

### App crashea al abrir chat
- **Causa**: Plugin no registrado correctamente
- **Solución**: Rebuild del APK y reinstalar

## 📝 Notas

- El modelo se descarga una sola vez y queda en el dispositivo
- Funciona **100% offline** después de la descarga inicial
- No requiere API key (usa AICore nativo de Android)
