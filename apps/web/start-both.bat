@echo off
echo ========================================
echo Starting Farm Visit App - Both Servers
echo ========================================
echo.

REM Change to web directory (script location)
cd /d "%~dp0"

echo Starting Dev Server (port 5173)...
start "Farm Visit - Dev Server" cmd /k "npm run dev"

echo Waiting 3 seconds...
timeout /t 3 /nobreak >nul

echo Starting Test Server (port 3000)...
start "Farm Visit - Test Server" cmd /k "node test-server.js"

echo.
echo ========================================
echo Both servers are starting in separate windows!
echo ========================================
echo.
echo Dev Server:  http://localhost:5173
echo Test Server: http://localhost:3000/health
echo.
echo Close this window - servers will keep running
echo.
timeout /t 2 /nobreak >nul




