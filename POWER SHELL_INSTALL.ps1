# PowerShell Installation Script
# Run this in PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installing Farm Visit App" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to project
$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectPath

Write-Host "Step 1: Cleaning old installation..." -ForegroundColor Yellow
Set-Location "apps\web"

if (Test-Path "node_modules") {
    Write-Host "Removing node_modules..." -ForegroundColor Gray
    Remove-Item -Recurse -Force node_modules
}

if (Test-Path "package-lock.json") {
    Write-Host "Removing package-lock.json..." -ForegroundColor Gray
    Remove-Item -Force package-lock.json
}

Write-Host ""
Write-Host "Step 2: Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Trying with --legacy-peer-deps..." -ForegroundColor Yellow
    npm install --legacy-peer-deps
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Step 3: Building shared package..." -ForegroundColor Yellow
    Set-Location "$projectPath\packages\shared"
    
    if (Test-Path "node_modules") {
        Remove-Item -Recurse -Force node_modules
    }
    
    npm install
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "Installation complete!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "To start development:" -ForegroundColor Cyan
        Write-Host "  cd apps\web" -ForegroundColor White
        Write-Host "  npm run dev" -ForegroundColor White
        Write-Host ""
        Write-Host "Then open http://localhost:5173" -ForegroundColor Cyan
    }
} else {
    Write-Host ""
    Write-Host "ERROR: Installation failed!" -ForegroundColor Red
    Write-Host "Check the error messages above." -ForegroundColor Red
}

Write-Host ""
pause


