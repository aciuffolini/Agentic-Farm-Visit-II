@echo off
REM Fixed installation script
echo Installing Farm Visit App with corrected versions...

cd /d "%~dp0"

echo.
echo Step 1: Cleaning old installs...
cd apps\web
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo.
echo Step 2: Installing web app dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: npm install failed!
    echo Check the error message above.
    pause
    exit /b 1
)

echo.
echo Step 3: Building shared package...
cd ..\..\packages\shared
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
call npm install
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Shared package build failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Installation complete!
echo ========================================
echo.
echo To start development:
echo   cd apps\web
echo   npm run dev
echo.
echo Then open http://localhost:5173
echo.
pause


