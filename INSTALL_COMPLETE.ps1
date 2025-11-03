# Complete Installation Script for Farm Visit App
# Run this in PowerShell

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Farm Visit App - Complete Installation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

# Step 1: Install Shared Package
Write-Host "Step 1: Installing shared package..." -ForegroundColor Yellow
Set-Location "packages\shared"

if (Test-Path "node_modules") {
    Write-Host "  Cleaning old node_modules..." -ForegroundColor Gray
    Remove-Item -Recurse -Force node_modules
}

Write-Host "  Running npm install..." -ForegroundColor Gray
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: npm install failed!" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "  Building TypeScript..." -ForegroundColor Gray
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: Build failed!" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "  ✓ Shared package ready!" -ForegroundColor Green
Write-Host ""

# Step 2: Install Web App
Write-Host "Step 2: Installing web app..." -ForegroundColor Yellow
Set-Location "$projectRoot\apps\web"

if (Test-Path "node_modules") {
    Write-Host "  Cleaning old node_modules..." -ForegroundColor Gray
    Remove-Item -Recurse -Force node_modules
}

if (Test-Path "package-lock.json") {
    Write-Host "  Removing package-lock.json..." -ForegroundColor Gray
    Remove-Item -Force package-lock.json
}

Write-Host "  Running npm install (with --legacy-peer-deps)..." -ForegroundColor Gray
npm install --legacy-peer-deps

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: npm install failed!" -ForegroundColor Red
    Write-Host "  Try running manually: npm install --legacy-peer-deps" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "  ✓ Web app ready!" -ForegroundColor Green
Write-Host ""

# Success!
Write-Host "========================================" -ForegroundColor Green
Write-Host "Installation Complete! ✓" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "To start the development server:" -ForegroundColor Cyan
Write-Host "  cd apps\web" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Or use:" -ForegroundColor Cyan
Write-Host "  npx vite" -ForegroundColor White
Write-Host ""
Write-Host "Then open http://localhost:5173 in your browser" -ForegroundColor Cyan
Write-Host ""
pause


