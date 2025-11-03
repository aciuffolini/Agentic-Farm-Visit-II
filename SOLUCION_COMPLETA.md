# Solución Completa - Paso a Paso

## ✅ Problemas Corregidos

1. ✅ Capacitor Camera: `6.2.3` → `6.0.2` (versión correcta)
2. ✅ Todas las versiones de Capacitor ahora son `6.0.2` (compatibles)

## 🚀 Instalación Paso a Paso

### Opción 1: Script Automático (Más Fácil)

```powershell
cd C:\Users\Atilio\projects\agents\7_farm_visit
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\INSTALL_COMPLETE.ps1
```

### Opción 2: Manual (Paso a Paso)

**Paso 1: Instalar Shared Package**

```powershell
cd C:\Users\Atilio\projects\agents\7_farm_visit\packages\shared
npm install
npm run build
```

Espera a que termine. Deberías ver:
```
added XX packages
```

**Paso 2: Instalar Web App**

```powershell
cd ..\..\apps\web

# Limpiar si es necesario
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# Instalar
npm install --legacy-peer-deps
```

**Paso 3: Iniciar App**

```powershell
npm run dev
```

O si falla:

```powershell
npx vite
```

---

## 📋 Comandos Completos (Copia y Pega)

Ejecuta estos comandos **uno por uno** en PowerShell:

```powershell
# === PASO 1: Shared Package ===
cd C:\Users\Atilio\projects\agents\7_farm_visit\packages\shared
npm install
npm run build

# === PASO 2: Web App ===
cd ..\..\apps\web
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm install --legacy-peer-deps

# === PASO 3: Iniciar ===
npm run dev
```

---

## ✅ Verificación

Después de cada paso, verifica:

**Paso 1**: Deberías ver una carpeta `dist` en `packages/shared/`

**Paso 2**: Deberías ver una carpeta `node_modules` en `apps/web/`

**Paso 3**: Deberías ver:
```
VITE v7.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

---

## 🐛 Si Algo Falló

### Error: "tsc no se reconoce"
**Solución**: Asegúrate de que `npm install` en shared package se completó:
```powershell
cd packages\shared
npm install
```

### Error: "vite no se reconoce"
**Solución**: Reinstala web app:
```powershell
cd apps\web
Remove-Item -Recurse -Force node_modules
npm install --legacy-peer-deps
```

### Error: "No matching version found"
**Solución**: Las versiones ya están corregidas. Asegúrate de tener el `package.json` actualizado.

---

**¡Todo está listo! Sigue los pasos y debería funcionar.** ✅


