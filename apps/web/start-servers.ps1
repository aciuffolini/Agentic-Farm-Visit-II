# Start both dev server and test server
# Run: .\start-servers.ps1

Write-Host ""
Write-Host "Starting Farm Visit Development Servers..." -ForegroundColor Cyan
Write-Host ""

# Get the directory where this script is located
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Start Dev Server (Terminal 1)
Write-Host "Starting Vite Dev Server (Terminal 1)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath'; npm run dev"

# Wait a bit for dev server to start
Start-Sleep -Seconds 2

# Start Test Server (Terminal 2)
Write-Host "Starting Test API Server (Terminal 2)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath'; node test-server.js"

Write-Host ""
Write-Host "Both servers are starting in separate windows!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Wait for both servers to show 'ready' messages" -ForegroundColor White
Write-Host "  2. Open http://localhost:5173/ in browser" -ForegroundColor White
Write-Host "  3. Test the chat functionality" -ForegroundColor White
Write-Host ""
