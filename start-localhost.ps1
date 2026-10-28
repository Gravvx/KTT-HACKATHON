# CivicConnect Localhost Launcher
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "          Starting CivicConnect on Localhost            " -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot

Write-Host "[1/2] Starting Backend Server on http://localhost:5000..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k", "cd /d `"$rootDir\app\backend`" && npm start"

Start-Sleep -Seconds 2

Write-Host "[2/2] Starting Frontend Vite Server on http://localhost:5173..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k", "cd /d `"$rootDir\app\frontend`" && npm run dev"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Backend running at:  http://localhost:5000" -ForegroundColor Green
Write-Host "  Frontend running at: http://localhost:5173" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
