# Windows Setup Guide

## PowerShell Execution Policy Error

Si encuentras este error:
```
No se puede cargar el archivo ... porque la ejecución de scripts está deshabilitada
```

## Soluciones Rápidas

### Opción 1: Usar CMD en lugar de PowerShell (Más Fácil)

1. Abre **Command Prompt** (cmd) en lugar de PowerShell
2. Navega a la carpeta:
   ```cmd
   cd C:\Users\Atilio\projects\agents\7_farm_visit
   ```
3. Ejecuta:
   ```cmd
   npm install
   ```

### Opción 2: Cambiar Execution Policy (PowerShell)

Abre PowerShell como **Administrador** y ejecuta:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Luego intenta de nuevo:
```powershell
npm install
```

### Opción 3: Ejecutar Comando Específico

Puedes cambiar la policy solo para esta sesión:

```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
npm install
```

### Opción 4: Usar Yarn o PNPM

Si tienes yarn o pnpm instalado:

```powershell
# Con yarn
yarn install

# Con pnpm
pnpm install
```

## Instalación Paso a Paso (Recomendado: CMD)

### 1. Abrir Command Prompt

Presiona `Win + R`, escribe `cmd` y presiona Enter.

### 2. Navegar al Proyecto

```cmd
cd C:\Users\Atilio\projects\agents\7_farm_visit
```

### 3. Instalar Dependencias

```cmd
npm install
```

Si hay problemas con workspaces, instala cada paquete:

```cmd
cd packages\shared
npm install
npm run build

cd ..\..\apps\web
npm install
```

### 4. Iniciar Desarrollo

```cmd
cd apps\web
npm run dev
```

## Troubleshooting

### Error: "npm no se reconoce como comando"

Asegúrate de tener Node.js instalado:
- Descarga desde: https://nodejs.org/
- Versión recomendada: 18.x o superior
- Reinstala si es necesario

### Error: "Cannot find module"

Asegúrate de construir el paquete shared primero:
```cmd
cd packages\shared
npm install
npm run build
```

### Error de permisos en Windows

Ejecuta el terminal como Administrador:
1. Click derecho en Command Prompt
2. "Ejecutar como administrador"

## Verificación

Para verificar que todo funciona:

```cmd
# Verificar Node.js
node --version

# Verificar npm
npm --version

# Verificar instalación
cd apps\web
npm list --depth=0
```

---

**Recomendación**: Usa **Command Prompt (CMD)** en lugar de PowerShell para evitar problemas de execution policy.


