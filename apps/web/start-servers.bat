@echo off
echo.
echo Starting Farm Visit Development Servers...
echo.

REM Start Dev Server (Terminal 1)
echo Starting Vite Dev Server...
start "Dev Server - Port 5173" cmd /k "cd /d %~dp0 && npm run dev"

REM Wait a bit
timeout /t 2 /nobreak >nul

REM Start Test Server (Terminal 2)
echo Starting Test API Server...
start "Test Server - Port 3000" cmd /k "cd /d %~dp0 && node test-server.js"

echo.
echo Both servers are starting in separate windows!
echo.
echo Next steps:
echo    1. Wait for both servers to show ready messages
echo    2. Open http://localhost:5173/ in browser
echo    3. Test the chat functionality
echo.
pause
