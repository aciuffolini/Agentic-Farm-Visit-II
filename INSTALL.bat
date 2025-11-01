@echo off
REM Quick install script for Windows
echo Installing Farm Visit App dependencies...

cd /d "%~dp0"

echo.
echo Installing root dependencies...
call npm install

echo.
echo Building shared package...
cd packages\shared
call npm install
call npm run build

echo.
echo Installing web app dependencies...
cd ..\..\apps\web
call npm install

echo.
echo ========================================
echo Installation complete!
echo ========================================
echo.
echo To start development:
echo   cd apps\web
echo   npm run dev
echo.
pause

