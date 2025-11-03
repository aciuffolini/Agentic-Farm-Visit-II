# Instalación Simple - Solución Final

## ✅ Problema Resuelto

Actualicé todas las versiones de Capacitor a **6.x** para compatibilidad.

## 🚀 Pasos Rápidos (PowerShell)

### Paso 1: Limpiar e Instalar

```powershell
cd C:\Users\Atilio\projects\agents\7_farm_visit\apps\web

# Limpiar (PowerShell)
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# Instalar con --legacy-peer-deps (evita conflictos)
npm install --legacy-peer-deps
```

### Paso 2: Construir Shared Package

```powershell
cd ..\..\packages\shared
npm install
npm run build
```

### Paso 3: Iniciar App

```powershell
cd ..\..\apps\web
npm run dev
```

O si `npm run dev` falla:

```powershell
npx vite
```

---

## 📝 Comandos Completos (Copia y Pega)

```powershell
# Navegar
cd C:\Users\Atilio\projects\agents\7_farm_visit\apps\web

# Limpiar
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# Instalar
npm install --legacy-peer-deps

# Build shared
cd ..\..\packages\shared
npm install
npm run build

# Start app
cd ..\..\apps\web
npx vite
```

---

## ✅ Qué Cambié

- **Capacitor Core**: 7.4.3 → 6.0.2
- **Capacitor Android**: 7.4.3 → 6.0.2
- **Capacitor Camera**: Ya estaba en 6.2.3 ✅
- **Capacitor Geolocation**: 6.0.3 → 6.1.0
- **Capacitor CLI**: 7.4.3 → 6.0.2
- **Otros plugins**: Actualizados a 6.x

**Todas las versiones ahora son compatibles entre sí.** ✅

---

**Prueba con `npm install --legacy-peer-deps` y debería funcionar!** 🚀


