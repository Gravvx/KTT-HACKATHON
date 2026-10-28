@echo off
title CivicConnect GitHub & Vercel Uploader
echo ========================================================
echo       CivicConnect - GitHub & Vercel Deployer
echo ========================================================
echo.

where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git is not installed on this system or not in PATH!
    echo Please download and install Git from: https://git-scm.com/download/win
    echo After installing, reopen this script to upload.
    echo.
    pause
    exit /b 1
)

echo [1/4] Initializing Git repository...
cd /d "%~dp0"
if not exist ".git" (
    git init
    git branch -M main
)

echo.
echo [2/4] Adding all files to commit...
git add .
git commit -m "CivicConnect - AI Civic Grievance & Government Services Platform"

echo.
echo [3/4] Setting remote GitHub repository...
set /p REPO_URL="Enter your GitHub repository URL (e.g. https://github.com/Gravvx/CivicConnect.git): "

if "%REPO_URL%"=="" (
    set REPO_URL=https://github.com/Gravvx/CivicConnect.git
)

git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo.
echo [4/4] Pushing to GitHub (main branch)...
git push -u origin main

echo.
echo ========================================================
echo   Uploaded to GitHub successfully!
echo.
echo   To Deploy on Vercel:
echo   1. Visit https://vercel.com/new
echo   2. Import repository: %REPO_URL%
echo   3. Click "Deploy" (vercel.json handles routing automatically!)
echo ========================================================
echo.
pause
