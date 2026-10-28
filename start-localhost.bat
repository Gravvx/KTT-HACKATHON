@echo off
title CivicConnect Launcher
echo ========================================================
echo          Starting CivicConnect on Localhost
echo ========================================================
echo.
echo [1/2] Launching Backend on http://localhost:5000 ...
start "CivicConnect Backend (Port 5000)" cmd /k "cd /d "%~dp0app\backend" && npm start"

timeout /t 2 /nobreak >nul

echo [2/2] Launching Frontend on http://localhost:5173 ...
start "CivicConnect Frontend (Port 5173)" cmd /k "cd /d "%~dp0app\frontend" && npm run dev"

echo.
echo ========================================================
echo   CivicConnect is starting!
echo   - Backend API:  http://localhost:5000
echo   - Frontend App: http://localhost:5173
echo ========================================================
echo.
pause
