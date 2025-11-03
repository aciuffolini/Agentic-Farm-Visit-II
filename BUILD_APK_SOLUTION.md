# 🔧 Solución para Compilar APK - Java/JDK

## ❌ Problema Actual

```
ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
```

## ✅ Soluciones

### Opción 1: Instalar Java JDK (Recomendado)

**Para Windows:**

1. **Descargar Adoptium OpenJDK 17 (LTS)**:
   - https://adoptium.net/temurin/releases/?version=17
   - Elegir: Windows x64 → `.msi` installer

2. **Instalar**:
   - Ejecutar el `.msi`
   - Marcar "Set JAVA_HOME variable"
   - Finalizar instalación

3. **Verificar**:
   ```powershell
   java -version
   # Debe mostrar: openjdk version "17.0.x"
   ```

4. **Compilar APK**:
   ```powershell
   cd C:\Users\Atilio\projects\agents\7_farm_visit\apps\web\android
   .\gradlew.bat assembleDebug
   ```

5. **APK estará en**:
   ```
   apps/web/android/app/build/outputs/apk/debug/app-debug.apk
   ```

---

### Opción 2: Configurar JAVA_HOME Manualmente (Si Java ya existe)

Si Java está instalado pero no en PATH:

1. **Encontrar ubicación de Java**:
   ```powershell
   # Buscar en ubicaciones comunes:
   Get-ChildItem "C:\Program Files\Java" -ErrorAction SilentlyContinue
   Get-ChildItem "C:\Program Files (x86)\Java" -ErrorAction SilentlyContinue
   ```

2. **Configurar JAVA_HOME**:
   ```powershell
   # Temporal (solo esta sesión):
   $env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
   $env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
   
   # Verificar:
   java -version
   ```

3. **Permanente (Recomendado)**:
   - Windows → Buscar "Variables de entorno"
   - Agregar variable de sistema:
     - **Nombre**: `JAVA_HOME`
     - **Valor**: `C:\Program Files\Java\jdk-17`
   - Editar `PATH` → Agregar: `%JAVA_HOME%\bin`

4. **Reiniciar PowerShell** y compilar

---

### Opción 3: GitHub Actions (Compilar en la Nube)

**Sin necesidad de instalar Java localmente:**

1. **Crear workflow**:
   ```yaml
   # .github/workflows/build-apk.yml
   name: Build Android APK
   
   on:
     workflow_dispatch:  # Manual trigger
     push:
       tags:
         - 'v*'           # Auto en releases
   
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         
         - name: Setup Node.js
           uses: actions/setup-node@v4
           with:
             node-version: '20'
         
         - name: Setup Java
           uses: actions/setup-java@v4
           with:
             java-version: '17'
             distribution: 'temurin'
         
         - name: Install dependencies
           run: |
             npm install
             cd packages/shared && npm run build
         
         - name: Build web app
           run: |
             cd apps/web
             npm run build
             npx cap sync android
         
         - name: Build APK
           run: |
             cd apps/web/android
             chmod +x gradlew
             ./gradlew assembleDebug
         
         - name: Upload APK artifact
           uses: actions/upload-artifact@v4
           with:
             name: app-debug.apk
             path: apps/web/android/app/build/outputs/apk/debug/app-debug.apk
   ```

2. **Trigger manual**:
   - GitHub → Actions → "Build Android APK" → "Run workflow"

3. **Descargar APK**:
   - Actions → Descargar artifact

---

### Opción 4: Docker (Avanzado)

Si tienes Docker:

```dockerfile
# Dockerfile.android
FROM node:20
RUN apt-get update && apt-get install -y openjdk-17-jdk
WORKDIR /app
COPY . .
RUN npm install && cd packages/shared && npm run build
RUN cd apps/web && npm run build && npx cap sync android
RUN cd apps/web/android && ./gradlew assembleDebug
```

---

## 🚀 Recomendación: Opción 1 o 3

**Para ahora (rápido)**: Opción 1 - Instalar JDK local
**Para futuro (automático)**: Opción 3 - GitHub Actions

---

## ✅ Checklist Post-Instalación

Una vez que Java esté configurado:

```powershell
# 1. Verificar Java
java -version

# 2. Ir a directorio Android
cd C:\Users\Atilio\projects\agents\7_farm_visit\apps\web\android

# 3. Compilar APK
.\gradlew.bat assembleDebug

# 4. Verificar APK generado
if (Test-Path "app\build\outputs\apk\debug\app-debug.apk") {
    Write-Host "✅ APK generado exitosamente!"
} else {
    Write-Host "❌ APK no encontrado"
}
```

---

## 📦 Siguiente Paso: GitHub Release

Una vez que tengas el APK:

1. Renombrar APK (opcional):
   ```powershell
   Rename-Item "app-debug.apk" "farm-visit-v1.0.0-debug.apk"
   ```

2. Crear Release en GitHub:
   - https://github.com/aciuffolini/Agentic-Farm-Visit/releases/new
   - Tag: `v1.0.0`
   - Subir APK

3. Link de descarga:
   ```
   https://github.com/aciuffolini/Agentic-Farm-Visit/releases/download/v1.0.0/farm-visit-v1.0.0-debug.apk
   ```

---

**¿Quieres que configure GitHub Actions para compilar automáticamente?** 🤖


