# Stop Test Server on Port 3000
Write-Host "🛑 Stopping Test Server..." -ForegroundColor Yellow
Write-Host ""

# Check if port 3000 is in use
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if ($port3000) {
    $processId = $port3000.OwningProcess
    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
    
    if ($process) {
        Write-Host "Found process: $($process.Name) (PID: $processId)" -ForegroundColor Gray
        Stop-Process -Id $processId -Force
        Write-Host "✅ Server stopped successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Process not found, but port is in use" -ForegroundColor Yellow
    }
} else {
    Write-Host "ℹ️  No server running on port 3000" -ForegroundColor Cyan
}

Write-Host ""

