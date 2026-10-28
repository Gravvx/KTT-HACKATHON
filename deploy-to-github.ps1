# CivicConnect GitHub & Vercel Deployer
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       CivicConnect - GitHub & Vercel Deployer          " -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$gitCmd = "git"
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    $minGitPath = "$env:USERPROFILE\mingit\cmd\git.exe"
    if (Test-Path $minGitPath) {
        $gitCmd = $minGitPath
    } else {
        Write-Host "[ERROR] Git was not found!" -ForegroundColor Red
        Read-Host "Press Enter to exit..."
        exit 1
    }
}

$rootDir = $PSScriptRoot
Set-Location $rootDir

Write-Host "[1/4] Checking Git repository..." -ForegroundColor Yellow
if (-not (Test-Path "$rootDir\.git")) {
    & $gitCmd init
    & $gitCmd branch -M main
}

Write-Host "[2/4] Staging files and creating commit..." -ForegroundColor Yellow
& $gitCmd add .
& $gitCmd commit -m "CivicConnect - AI Civic Grievance & Government Services Platform"

Write-Host ""
$repoUrl = Read-Host "Enter GitHub Repo URL [Default: https://github.com/Gravvx/CivicConnect.git]"
if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    $repoUrl = "https://github.com/Gravvx/CivicConnect.git"
}

Write-Host "[3/4] Configuring remote origin: $repoUrl" -ForegroundColor Yellow
& $gitCmd remote remove origin 2>$null
& $gitCmd remote add origin $repoUrl

Write-Host "[4/4] Pushing to GitHub main branch..." -ForegroundColor Yellow
Write-Host "If prompted, sign in via browser." -ForegroundColor Gray
& $gitCmd push -u origin main

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Code pushed to GitHub successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "  Deploying to Vercel:" -ForegroundColor Yellow
Write-Host "  1. Open https://vercel.com/new"
Write-Host "  2. Import your GitHub repository ($repoUrl)"
Write-Host "  3. Set GEMINI_API_KEY in Environment Variables"
Write-Host "  4. Click 'Deploy'"
Write-Host "========================================================" -ForegroundColor Cyan
