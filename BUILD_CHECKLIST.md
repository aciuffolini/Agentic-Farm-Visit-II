# ✅ Checklist Pre-Build Android APK

## Estado Actual Verificado

### ✅ Paso 0: Ya Completado
- [x] Código en GitHub: ✅
- [x] `node_modules` instalado: ✅ (root)
- [x] `packages/shared/dist` compilado: ✅
- [x] Capacitor configurado: ✅

### ⏳ Pasos Pendientes

#### Paso 1: Instalar dependencias (apps/web)
```bash
cd apps/web
npm install
```
**Estado**: ⏳ Pendiente verificación

#### Paso 2: Compilar shared (verificar)
```bash
cd packages/shared
npm run build
```
**Estado**: ✅ Ya existe `dist/` - probablemente OK

#### Paso 3: Build web app
```bash
cd apps/web
npm run build
```
**Estado**: ⏳ Pendiente - creará `apps/web/dist/`

#### Paso 4: Sincronizar Capacitor Android
```bash
cd apps/web
npx cap sync android
```
**Estado**: ⏳ Pendiente - creará/actualizará `apps/web/android/`

#### Paso 5: Abrir Android Studio
```bash
cd apps/web
npx cap open android
```
**Estado**: ⏳ Pendiente - abrirá Android Studio

#### Paso 6: Generar APK en Android Studio
- Build → Build Bundle(s) / APK(s) → Build APK(s)
- APK estará en: `apps/web/android/app/build/outputs/apk/debug/app-debug.apk`
**Estado**: ⏳ Pendiente

---

## ⚠️ Notas Importantes

1. **NO necesitamos `git clone`** - Ya tenemos el código local
2. **Directorio correcto**: `C:\Users\Atilio\projects\agents\7_farm_visit`
3. **Verificar antes de build**: Que todas las dependencias estén instaladas
4. **Android Studio**: Debe estar instalado y configurado

---

## 🚀 Secuencia Correcta

```powershell
# Ya estamos en el proyecto local (no necesitamos git clone)

# 1) Verificar/Instalar deps en apps/web
cd C:\Users\Atilio\projects\agents\7_farm_visit\apps\web
npm install

# 2) Verificar shared está compilado (probablemente ya está)
cd ..\..\packages\shared
npm run build

# 3) Build web app
cd ..\..\apps\web
npm run build

# 4) Capacitor sync
npx cap sync android

# 5) Abrir Android Studio
npx cap open android

# 6) En Android Studio: Build → Build APK(s)
```

---

## ✅ Todo Está Correcto

**Tu plan es correcto**, solo que:
- ✅ Ya tienes el código (no necesitas git clone)
- ✅ Probablemente ya tienes dependencias instaladas
- ✅ Solo falta: build web → sync capacitor → generar APK

**¿Procedemos con la compilación?**


