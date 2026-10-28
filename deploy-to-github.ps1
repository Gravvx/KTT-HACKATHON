# CivicConnect Upload to KTT-HACKATHON
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       CivicConnect - Upload to KTT-HACKATHON           " -ForegroundColor Green
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

Write-Host "[1/3] Checking Git repository..." -ForegroundColor Yellow
if (-not (Test-Path "$rootDir\.git")) {
    & $gitCmd init
    & $gitCmd branch -M main
}

Write-Host "[2/3] Staging files and creating commit..." -ForegroundColor Yellow
& $gitCmd add .
& $gitCmd commit -m "Upload CivicConnect to KTT-HACKATHON"

$repoUrl = "https://github.com/Gravvx/KTT-HACKATHON.git"
Write-Host "[3/3] Configuring remote origin: $repoUrl" -ForegroundColor Yellow
& $gitCmd remote remove origin 2>$null
& $gitCmd remote add origin $repoUrl

Write-Host ""
Write-Host "Pushing to GitHub main branch..." -ForegroundColor Yellow
Write-Host "If prompted, click 'Sign in with your browser'." -ForegroundColor Gray
& $gitCmd push -u origin main --force

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Code pushed to https://github.com/Gravvx/KTT-HACKATHON !" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
