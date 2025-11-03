# ⚡ Guía Rápida: Compilar APK para GitHub Releases

## 📍 Situación Actual

✅ Código en GitHub  
✅ Web build compilado  
✅ Android project configurado  
⏳ **Falta**: Java JDK para compilar APK

---

## 🚀 Solución Rápida (5 minutos)

### Paso 1: Instalar Java JDK 17

**Opción A: Descargar e Instalar**
1. Ir a: https://adoptium.net/temurin/releases/?version=17
2. Elegir: **Windows x64** → **JDK** → **.msi**
3. Descargar e instalar
4. ✅ Marcar "Set JAVA_HOME variable" durante instalación

**Opción B: Verificar si ya existe**
```powershell
# Buscar Java instalado
Get-ChildItem "C:\Program Files\Java" -ErrorAction SilentlyContinue
Get-ChildItem "C:\Program Files (x86)\Java" -ErrorAction SilentlyContinue
Get-ChildItem "$env:LOCALAPPDATA\Programs" -Filter "*java*" -Recurse -ErrorAction SilentlyContinue | Select-Object FullName
```

### Paso 2: Verificar Java

```powershell
# Abrir NUEVO PowerShell (para cargar variables)
java -version
# Debe mostrar: openjdk version "17.0.x"
```

### Paso 3: Compilar APK

```powershell
cd C:\Users\Atilio\projects\agents\7_farm_visit\apps\web\android
.\gradlew.bat assembleDebug
```

**Tiempo estimado**: 2-5 minutos (primera vez puede tomar más)

### Paso 4: Verificar APK

```powershell
if (Test-Path "app\build\outputs\apk\debug\app-debug.apk") {
    Write-Host "✅ APK generado exitosamente!"
    $size = (Get-Item "app\build\outputs\apk\debug\app-debug.apk").Length / 1MB
    Write-Host "📦 Tamaño: $([math]::Round($size, 2)) MB"
} else {
    Write-Host "❌ APK no encontrado"
}
```

---

## 📦 Siguiente: Crear GitHub Release

### Paso 1: Preparar APK

```powershell
cd C:\Users\Atilio\projects\agents\7_farm_visit\apps\web\android\app\build\outputs\apk\debug
Copy-Item "app-debug.apk" "farm-visit-v1.0.0-debug.apk"
```

### Paso 2: Subir a GitHub Release

1. Ir a: https://github.com/aciuffolini/Agentic-Farm-Visit/releases/new
2. **Tag**: `v1.0.0` (o `v1.0.0-mvp`)
3. **Title**: `Farm Visit App v1.0.0 - MVP`
4. **Description**:
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
   - Offline-first PWA
   ```
5. **Arrastra el APK** a "Attach files"
6. **Publish release**

### Paso 3: Link de Descarga

El APK estará disponible en:
```
https://github.com/aciuffolini/Agentic-Farm-Visit/releases/download/v1.0.0/app-debug.apk
```

---

## 🔄 Alternativa: GitHub Actions (Sin Java Local)

**Si no quieres instalar Java**, puedes usar GitHub Actions:

1. **Ya está configurado**: `.github/workflows/build-apk.yml`
2. **Ir a**: https://github.com/aciuffolini/Agentic-Farm-Visit/actions
3. **Workflows** → "Build Android APK" → "Run workflow"
4. **Esperar** ~5-10 minutos
5. **Descargar APK** desde Artifacts

**O crear un tag** (compilación automática):
```powershell
git tag v1.0.0
git push origin v1.0.0
# GitHub Actions compilará automáticamente y creará Release
```

---

## ✅ Checklist Final

- [ ] Java JDK 17 instalado
- [ ] APK compilado (`app-debug.apk`)
- [ ] APK probado en dispositivo (opcional pero recomendado)
- [ ] GitHub Release creado
- [ ] APK subido al Release
- [ ] README actualizado con link de descarga (opcional)

---

**Recomendación**: Instala Java localmente (5 min) para compilar ahora. GitHub Actions es útil para el futuro. 🚀


