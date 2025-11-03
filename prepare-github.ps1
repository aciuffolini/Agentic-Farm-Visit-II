# GitHub Preparation Script (PowerShell)
# This script prepares the repository for GitHub commit

Write-Host "🔍 Checking repository status..." -ForegroundColor Cyan

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "⚠️  Git not initialized. Initializing now..." -ForegroundColor Yellow
    git init
}

# Check if .env exists
if (Test-Path ".env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
    
    # Check if .env is in .gitignore
    $gitignoreContent = Get-Content .gitignore -ErrorAction SilentlyContinue
    if ($gitignoreContent -match "^\.env$") {
        Write-Host "✅ .env is properly ignored" -ForegroundColor Green
    } else {
        Write-Host "⚠️  WARNING: .env is NOT in .gitignore!" -ForegroundColor Yellow
        Write-Host "   Adding .env to .gitignore..." -ForegroundColor Yellow
        Add-Content .gitignore "`n# Environment - NEVER COMMIT`n.env"
    }
} else {
    Write-Host "ℹ️  .env file not found (ok if using .env.example)" -ForegroundColor Blue
}

# Check if .env.example exists
if (-not (Test-Path ".env.example")) {
    Write-Host "⚠️  .env.example not found. Creating from template..." -ForegroundColor Yellow
    @"
# Environment Variables Example
# Copy this file to .env and fill in your actual values
# DO NOT COMMIT .env FILE TO GIT

VITE_API_URL=http://localhost:3000/api
VITE_API_KEY=your-api-key-here
"@ | Out-File -FilePath ".env.example" -Encoding utf8
    Write-Host "✅ Created .env.example" -ForegroundColor Green
}

# Check for secrets in code
Write-Host "🔍 Scanning for potential secrets in code..." -ForegroundColor Cyan
$secretsFound = Get-ChildItem -Path src,apps -Recurse -Include *.ts,*.tsx,*.js,*.jsx -ErrorAction SilentlyContinue | 
    Select-String -Pattern "password|secret|api_key|apikey" | 
    Where-Object { $_.Line -notmatch "example|Example|EXAMPLE|process\.env|import\.meta\.env" } |
    Select-Object -First 5

if ($secretsFound) {
    Write-Host "⚠️  WARNING: Potential secrets found in code!" -ForegroundColor Yellow
    Write-Host "   Please review before committing" -ForegroundColor Yellow
    $secretsFound | ForEach-Object { Write-Host "   $($_.Filename):$($_.LineNumber)" -ForegroundColor Yellow }
} else {
    Write-Host "✅ No obvious secrets found in code" -ForegroundColor Green
}

# Show what will be committed
Write-Host "`n📦 Files to be committed:" -ForegroundColor Cyan
git status --short | Select-Object -First 20

# Show ignored files count
Write-Host "`n🚫 Ignored files (node_modules, .env, etc.):" -ForegroundColor Cyan
$nodeModulesCount = (Get-ChildItem -Path . -Recurse -Directory -Filter "node_modules" -ErrorAction SilentlyContinue).Count
$envFilesCount = (Get-ChildItem -Path . -Recurse -File -Filter ".env*" -Exclude ".env.example" -ErrorAction SilentlyContinue).Count
Write-Host "   $nodeModulesCount node_modules directories" -ForegroundColor Gray
Write-Host "   $envFilesCount .env files" -ForegroundColor Gray

Write-Host "`n✅ Repository is ready for GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Review the files above"
Write-Host "2. git add ."
Write-Host "3. git commit -m 'Initial commit: Farm Visit App MVP'"
Write-Host "4. Create GitHub repository (public)"
Write-Host "5. git remote add origin https://github.com/YOUR_USERNAME/farm-visit-app.git"
Write-Host "6. git push -u origin main"
Write-Host ""
Write-Host "📚 See GITHUB_SETUP.md for detailed instructions" -ForegroundColor Blue


