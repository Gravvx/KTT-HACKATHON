@echo off
title CivicConnect GitHub & Vercel Uploader
echo ========================================================
echo       CivicConnect - GitHub & Vercel Deployer
echo ========================================================
echo.

set "GIT_CMD=git"
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    if exist "%USERPROFILE%\mingit\cmd\git.exe" (
        set "GIT_CMD=%USERPROFILE%\mingit\cmd\git.exe"
    ) else (
        echo [ERROR] Git is not found!
        pause
        exit /b 1
    )
)

echo [1/4] Verifying local repository...
cd /d "%~dp0"
if not exist ".git" (
    "%GIT_CMD%" init
    "%GIT_CMD%" branch -M main
)

echo.
echo [2/4] Staging and committing files...
"%GIT_CMD%" add .
"%GIT_CMD%" commit -m "CivicConnect - AI Civic Grievance & Government Services Platform"

echo.
echo [3/4] GitHub Repository Setup
echo Press Enter to use default or paste a custom URL:
echo Default: https://github.com/Gravvx/CivicConnect.git
set /p REPO_URL="Repository URL: "

if "%REPO_URL%"=="" (
    set "REPO_URL=https://github.com/Gravvx/CivicConnect.git"
)

"%GIT_CMD%" remote remove origin 2>nul
"%GIT_CMD%" remote add origin %REPO_URL%

echo.
echo [4/4] Pushing to GitHub (main branch)...
echo If a GitHub sign-in prompt appears, click 'Sign in with your browser'.
"%GIT_CMD%" push -u origin main

echo.
echo ========================================================
echo   Push Complete!
echo.
echo   To Deploy on Vercel:
echo   1. Visit https://vercel.com/new
echo   2. Import repository: %REPO_URL%
echo   3. Set Environment Variable in Vercel:
echo      GEMINI_API_KEY = your_gemini_api_key
echo   4. Click "Deploy"!
echo ========================================================
echo.
pause
