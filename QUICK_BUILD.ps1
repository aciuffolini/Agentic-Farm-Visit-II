# Quick Build Script para Gemini Nano APK
# Ejecutar después de instalar JDK 17

Write-Host "🚀 Building Farm Visit App with Gemini Nano..." -ForegroundColor Green

# Verificar Java
Write-Host "`n1. Verificando Java..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1 | Select-String "version"
    Write-Host "   ✓ Java encontrado: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Java no encontrado. Instala JDK 17 primero." -ForegroundColor Red
    exit 1
}

# Ir al directorio del proyecto
$projectRoot = "C:\Users\Atilio\projects\agents\7_farm_visit"
Set-Location $projectRoot

# Instalar dependencias raíz
Write-Host "`n2. Instalando dependencias raíz..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✗ Error instalando dependencias" -ForegroundColor Red
    exit 1
}

# Build shared package
Write-Host "`n3. Building shared package..." -ForegroundColor Yellow
Set-Location "packages\shared"
npm install
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✗ Error building shared package" -ForegroundColor Red
    exit 1
}

# Build web app
Write-Host "`n4. Building web app..." -ForegroundColor Yellow
Set-Location "$projectRoot\apps\web"
npm install
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✗ Error building web app" -ForegroundColor Red
    exit 1
}

# Sync Capacitor
Write-Host "`n5. Syncing Capacitor..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✗ Error syncing Capacitor" -ForegroundColor Red
    exit 1
}

# Build APK
Write-Host "`n6. Building Android APK..." -ForegroundColor Yellow
Set-Location "android"
.\gradlew assembleDebug
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✗ Error building APK" -ForegroundColor Red
    Write-Host "   Revisa los errores arriba (posible problema con imports ML Kit)" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n✅ APK Build Exitoso!" -ForegroundColor Green
Write-Host "`n📱 APK ubicado en:" -ForegroundColor Cyan
Write-Host "   apps\web\android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor White
Write-Host "`n📋 Próximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Transferir APK al teléfono Android 14+" -ForegroundColor White
Write-Host "   2. Instalar APK" -ForegroundColor White
Write-Host "   3. Primera vez: App descargará modelo Gemini Nano (~2GB)" -ForegroundColor White
Write-Host "   4. Probar chat escribiendo 'help'" -ForegroundColor White


