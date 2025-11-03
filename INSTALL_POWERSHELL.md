# Install in PowerShell

## Problema Resuelto

He actualizado todas las versiones de Capacitor a la serie **6.x** para compatibilidad.

## Instalación en PowerShell

### Opción 1: Usar el Script (Recomendado)

```powershell
cd C:\Users\Atilio\projects\agents\7_farm_visit
.\POWER SHELL_INSTALL.ps1
```

Si tienes error de execution policy:

```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\POWER SHELL_INSTALL.ps1
```

### Opción 2: Comandos Manuales (PowerShell)

```powershell
cd C:\Users\Atilio\projects\agents\7_farm_visit\apps\web

# Limpiar
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# Instalar (usa --legacy-peer-deps si hay conflictos)
npm install --legacy-peer-deps

# Construir shared package
cd ..\..\packages\shared
npm install
npm run build

# Volver a web y probar
cd ..\..\apps\web
npm run dev
```

## Si Sigue Fallando npm install

Usa `--legacy-peer-deps`:

```powershell
npm install --legacy-peer-deps
```

Esto ignora conflictos menores de versiones de peer dependencies.

## Iniciar la App

```powershell
cd apps\web
npm run dev
```

O directamente:

```powershell
npx vite
```

---

**Versiones actualizadas a Capacitor 6.x para compatibilidad total.** ✅


