# Install JDK 17 and Configure Environment
# Uses winget for automatic installation
# Prepares environment for Gemini Nano Android app development

Write-Host "Installing JDK 17 with winget..." -ForegroundColor Green

# Check if winget is available
$wingetCheck = Get-Command winget -ErrorAction SilentlyContinue
if (-not $wingetCheck) {
    Write-Host "ERROR: winget not found. Install Windows Package Manager first." -ForegroundColor Red
    Write-Host "Download from: https://aka.ms/getwinget" -ForegroundColor Yellow
    exit 1
}

# Install Temurin JDK 17 (system-wide, will check for existing install)
Write-Host "Installing Eclipse Temurin JDK 17..." -ForegroundColor Yellow
winget install EclipseAdoptium.Temurin.17.JDK --accept-package-agreements --accept-source-agreements

# Set JAVA_HOME and update PATH (per-user)
Write-Host "Finding installed JDK..." -ForegroundColor Yellow
$jdk = $null

# Check system location first (default for winget)
$sysPath = "C:\Program Files\Eclipse Adoptium"
if (Test-Path $sysPath) {
    $jdk = Get-ChildItem $sysPath -Directory -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -match 'jdk-17' } | 
        Sort-Object LastWriteTime -Descending | 
        Select-Object -First 1
}

# Check user location if not found
if (-not $jdk) {
    $userPath = "$Env:LOCALAPPDATA\Programs\Eclipse Adoptium"
    if (Test-Path $userPath) {
        $jdk = Get-ChildItem $userPath -Directory -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -match 'jdk-17' } | 
            Sort-Object LastWriteTime -Descending | 
            Select-Object -First 1
    }
}

if (-not $jdk) { 
    Write-Host "ERROR: JDK 17 not found after install." -ForegroundColor Red
    Write-Host "Please check installation manually." -ForegroundColor Yellow
    exit 1
}

Write-Host "Found JDK at: $($jdk.FullName)" -ForegroundColor Green

Write-Host "Configuring JAVA_HOME and PATH..." -ForegroundColor Yellow
[Environment]::SetEnvironmentVariable('JAVA_HOME', $jdk.FullName, 'User')
$oldUserPath = [Environment]::GetEnvironmentVariable('Path','User')
if ($oldUserPath -notlike "*$($jdk.FullName)\bin*") {
    [Environment]::SetEnvironmentVariable('Path', "$($jdk.FullName)\bin;$oldUserPath", 'User')
    Write-Host "Added JDK to PATH" -ForegroundColor Green
} else {
    Write-Host "JDK already in PATH" -ForegroundColor Green
}

# Use it in this shell immediately:
$env:JAVA_HOME = $jdk.FullName
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

# Verify
Write-Host ""
Write-Host "Verifying installation..." -ForegroundColor Yellow
Write-Host "Java version:"
java -version
Write-Host ""
Write-Host "Javac version:"
javac -version

Write-Host ""
Write-Host "JDK 17 installed and configured successfully!" -ForegroundColor Green
Write-Host "Note: Close and reopen terminal for changes to take effect globally." -ForegroundColor Yellow
