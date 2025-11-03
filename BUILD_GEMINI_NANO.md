# 🚀 Build APK con Gemini Nano - Checklist Completo

## ✅ Pre-requisitos (Verificar antes de compilar)

### 1. JDK 17 Instalado
```powershell
java -version
# Debe mostrar: java version "17.0.x"
```

### 2. Node.js y npm funcionando
```powershell
node -v
npm -v
```

### 3. Android SDK (vía Capacitor)
- Se descargará automáticamente en el primer build

## 📋 Pasos de Compilación

### Paso 1: Instalar Dependencias
```powershell
cd C:\Users\Atilio\projects\agents\7_farm_visit
npm install

cd apps\web
npm install

cd ..\..\packages\shared
npm install
npm run build
```

### Paso 2: Build Web App
```powershell
cd C:\Users\Atilio\projects\agents\7_farm_visit\apps\web
npm run build
```

### Paso 3: Sync Capacitor (importa código nativo)
```powershell
npx cap sync android
```

### Paso 4: Build APK
```powershell
# Opción A: Build directo con Gradle
cd android
.\gradlew assembleDebug

# Opción B: Build con Capacitor (recomendado)
cd ..
npx cap build android
```

### Paso 5: APK Listo
El APK estará en:
```
apps\web\android\app\build\outputs\apk\debug\app-debug.apk
```

## 🔍 Verificar Imports de ML Kit

Si hay errores de compilación con ML Kit, los imports pueden necesitar ajuste.

**Estructura actual (en `GeminiNanoPlugin.java`):**
```java
import com.google.mlkit.genai.prompt.Generation;
import com.google.mlkit.genai.prompt.FeatureStatus;
```

**Si falla, probar alternativas:**
- `com.google.mlkit.genai.GenerativeModel`
- `com.google.mlkit.genai.FeatureStatus`

## 📱 Instrucciones para el Teléfono

1. **Requisito**: Android 14+ (verificar en Settings → About Phone)
2. **Instalar APK**: Transferir `app-debug.apk` al teléfono e instalar
3. **Primera vez**: La app descargará modelo Gemini Nano (~2GB) - necesita WiFi
4. **Probar Chat**: Abrir chat y escribir "help" para verificar funcionamiento

## ❌ Troubleshooting

### Error: "Cannot resolve symbol 'Generation'"
**Solución**: Los imports de ML Kit pueden estar mal. Revisar documentación oficial o probar estructura alternativa.

### Error: "Gradle sync failed"
**Solución**: 
```powershell
cd android
.\gradlew clean
.\gradlew build --refresh-dependencies
```

### Error: "SDK location not found"
**Solución**: Configurar `local.properties` en `android/` con:
```
sdk.dir=C:\\Users\\Atilio\\AppData\\Local\\Android\\Sdk
```

### APK compila pero app crashea
**Solución**: Verificar que el plugin esté registrado en `MainActivity.java`

---

## 🎯 Próximos Pasos

Una vez que tengas JDK 17 instalado:
1. Ejecuta los pasos de compilación arriba
2. Si hay errores de imports ML Kit → los ajustamos
3. Si compila bien → transferir APK al teléfono
4. Probar en dispositivo Android 14+


