@echo off
echo ========================================
echo Quick Fix: Installing dependencies
echo ========================================
echo.

cd /d "%~dp0apps\web"

echo Step 1: Cleaning...
if exist node_modules (
    echo Removing old node_modules...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    echo Removing package-lock.json...
    del package-lock.json
)

echo.
echo Step 2: Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: npm install failed!
    echo.
    echo Trying to install vite manually...
    call npm install vite @vitejs/plugin-react --save-dev
)

echo.
echo Step 3: Verifying installation...
if exist node_modules\.bin\vite.cmd (
    echo Vite installed successfully!
) else (
    echo WARNING: Vite might not be installed correctly.
    echo Try running: npx vite
)

echo.
echo ========================================
echo Installation complete!
echo ========================================
echo.
echo To start the app:
echo   cd apps\web
echo   npm run dev
echo.
echo Or use directly:
echo   npx vite
echo.
pause

