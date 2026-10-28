# CivicConnect GitHub & Vercel Deployer
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       CivicConnect - GitHub & Vercel Deployer          " -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$gitCmd = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitCmd) {
    Write-Host "[ERROR] Git is not installed or not in your system PATH!" -ForegroundColor Red
    Write-Host "Please download Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "Or install via winget: winget install --id Git.Git -e" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit..."
    exit 1
}

$rootDir = $PSScriptRoot
Set-Location $rootDir

Write-Host "[1/4] Checking Git repository..." -ForegroundColor Yellow
if (-not (Test-Path "$rootDir\.git")) {
    git init
    git branch -M main
}

Write-Host "[2/4] Staging files and creating commit..." -ForegroundColor Yellow
git add .
git commit -m "CivicConnect - AI Civic Grievance & Government Services Platform"

Write-Host ""
$repoUrl = Read-Host "Enter GitHub Repo URL [Default: https://github.com/Gravvx/CivicConnect.git]"
if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    $repoUrl = "https://github.com/Gravvx/CivicConnect.git"
}

Write-Host "[3/4] Configuring remote origin: $repoUrl" -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin $repoUrl

Write-Host "[4/4] Pushing to GitHub main branch..." -ForegroundColor Yellow
git push -u origin main

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Code pushed to GitHub successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "  Deploying to Vercel:" -ForegroundColor Yellow
Write-Host "  1. Open https://vercel.com/new"
Write-Host "  2. Import your GitHub repository ($repoUrl)"
Write-Host "  3. Click 'Deploy'"
Write-Host "========================================================" -ForegroundColor Cyan
