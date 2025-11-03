# Fix "vite no se reconoce" Error

## Problema

`npm install` falló o no se completó, por lo que `vite` no está instalado en `node_modules`.

## Solución Paso a Paso

### Paso 1: Limpiar Instalación Anterior

En **Command Prompt** (CMD):

```cmd
cd C:\Users\Atilio\projects\agents\7_farm_visit\apps\web

REM Eliminar node_modules y package-lock
rmdir /s /q node_modules
del package-lock.json
```

### Paso 2: Verificar package.json

Asegúrate de que `package.json` tiene vite en devDependencies:

```json
"devDependencies": {
  ...
  "vite": "^7.1.7",
  ...
}
```

### Paso 3: Instalar Dependencias

```cmd
npm install
```

**Espera a que termine completamente**. Deberías ver:
```
added XXX packages in XXs
```

### Paso 4: Verificar que Vite se Instaló

```cmd
npx vite --version
```

O verifica que existe:
```cmd
dir node_modules\.bin\vite*
```

### Paso 5: Iniciar Dev Server

```cmd
npm run dev
```

---

## Si npm install Sigue Fallando

### Opción A: Instalar Vite Manualmente

```cmd
npm install vite @vitejs/plugin-react --save-dev
```

### Opción B: Usar npx Directamente

En lugar de `npm run dev`, usa:

```cmd
npx vite
```

Esto usa vite directamente sin depender del script.

---

## Verificación Rápida

Ejecuta estos comandos para verificar:

```cmd
cd C:\Users\Atilio\projects\agents\7_farm_visit\apps\web

REM Verificar Node.js
node --version

REM Verificar npm
npm --version

REM Verificar si node_modules existe
dir node_modules

REM Verificar si vite está instalado
dir node_modules\.bin\vite.cmd
```

---

## Solución Rápida Completa

```cmd
cd C:\Users\Atilio\projects\agents\7_farm_visit\apps\web
rmdir /s /q node_modules
del package-lock.json
npm install
npm run dev
```

Si después de `npm install` aún no funciona, prueba:

```cmd
npx vite
```

Esto debería funcionar incluso si el script falla.


