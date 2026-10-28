@echo off
title CivicConnect - Upload to KTT-HACKATHON
echo ========================================================
echo       CivicConnect - Upload to KTT-HACKATHON
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

echo [1/3] Verifying local repository...
cd /d "%~dp0"
if not exist ".git" (
    "%GIT_CMD%" init
    "%GIT_CMD%" branch -M main
)

echo.
echo [2/3] Staging and committing all files...
"%GIT_CMD%" add .
"%GIT_CMD%" commit -m "Upload CivicConnect to KTT-HACKATHON"

echo.
echo [3/3] Setting remote repository: https://github.com/Gravvx/KTT-HACKATHON.git
"%GIT_CMD%" remote remove origin 2>nul
"%GIT_CMD%" remote add origin https://github.com/Gravvx/KTT-HACKATHON.git

echo.
echo Pushing to GitHub (main branch)...
echo If a GitHub sign-in window opens, click "Sign in with your browser".
echo.
"%GIT_CMD%" push -u origin main --force

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo   SUCCESS! All code uploaded to:
    echo   https://github.com/Gravvx/KTT-HACKATHON
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo   Push failed or requires login.
    echo ========================================================
)

echo.
pause
