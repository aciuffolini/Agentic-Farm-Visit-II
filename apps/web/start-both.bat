@echo off
echo ========================================
echo Starting Farm Visit App Servers
echo ========================================
echo.

REM Change to web directory
cd /d "%~dp0"

REM Start dev server in new window
echo Starting Dev Server (port 5173)...
start "Farm Visit - Dev Server" cmd /k "npm run dev"

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start test server in new window
echo Starting Test Server (port 3000)...
start "Farm Visit - Test Server" cmd /k "node test-server.js"

echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo.
echo Dev Server:  http://localhost:5173
echo Test Server: http://localhost:3000
echo.
echo Press any key to close this window...
pause >nul

