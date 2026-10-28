@echo off
title Push CivicConnect to KTT-HACKATHON
echo ========================================================
echo       Upload CivicConnect to Gravvx/KTT-HACKATHON
echo ========================================================
echo.
echo Your repository is ready: https://github.com/Gravvx/KTT-HACKATHON
echo.
echo To authenticate, enter your GitHub Personal Access Token.
echo (If you need to generate one with 'repo' scope: https://github.com/settings/tokens/new)
echo.
set /p GH_TOKEN="Paste GitHub Token: "

if "%GH_TOKEN%"=="" (
    echo [ERROR] Token cannot be empty.
    pause
    exit /b 1
)

set "GIT_CMD=git"
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    if exist "%USERPROFILE%\mingit\cmd\git.exe" (
        set "GIT_CMD=%USERPROFILE%\mingit\cmd\git.exe"
    )
)

cd /d "%~dp0"
echo.
echo Pushing all files to https://github.com/Gravvx/KTT-HACKATHON.git ...
"%GIT_CMD%" push https://%GH_TOKEN%@github.com/Gravvx/KTT-HACKATHON.git main --force

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo   SUCCESS! All files uploaded to:
    echo   https://github.com/Gravvx/KTT-HACKATHON
    echo ========================================================
) else (
    echo.
    echo [ERROR] Push failed. Please check that your token has 'repo' permissions.
)

echo.
pause
