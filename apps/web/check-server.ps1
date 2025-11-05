# Check Test Server Status
Write-Host 'Checking Test Server Status...' -ForegroundColor Cyan
Write-Host ''

# Check if port 3000 is in use
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if ($port3000) {
    $processId = $port3000.OwningProcess
    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
    
    Write-Host 'Test Server IS Running' -ForegroundColor Green
    Write-Host '   Port: 3000' -ForegroundColor Gray
    Write-Host "   Process ID: $processId" -ForegroundColor Gray
    if ($process) {
        Write-Host "   Process: $($process.Name)" -ForegroundColor Gray
        Write-Host "   Started: $($process.StartTime)" -ForegroundColor Gray
    }
    Write-Host ''
    
    # Test health endpoint
    try {
        $response = Invoke-WebRequest -Uri 'http://localhost:3000/health' -TimeoutSec 2 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host 'Health Check: PASS' -ForegroundColor Green
            $health = $response.Content | ConvertFrom-Json
            Write-Host "   Message: $($health.message)" -ForegroundColor Gray
        }
    } catch {
        Write-Host 'Health Check: FAIL' -ForegroundColor Yellow
        Write-Host "   $($_.Exception.Message)" -ForegroundColor Gray
    }
    
    Write-Host ''
    Write-Host 'To stop the server:' -ForegroundColor Yellow
    Write-Host "   Stop-Process -Id $processId -Force" -ForegroundColor Gray
} else {
    Write-Host 'Test Server is NOT Running' -ForegroundColor Red
    Write-Host ''
    Write-Host 'To start the server:' -ForegroundColor Yellow
    Write-Host '   node test-server.js' -ForegroundColor Gray
}

Write-Host ''

