@echo off
title FairSeat Runner - Prasunex Innovathon 2026
cd /d "%~dp0"
echo ========================================================
echo   Starting FairSeat (Backend + Frontend)
echo ========================================================
echo.
echo 1. Launching Backend & Frontend services...
start "FairSeat Server" cmd /c "node server\src\server.js"
start "FairSeat Client" cmd /c "cd client && npm.cmd run dev"

echo.
echo 2. Waiting for server to initialize...
timeout /t 3 >nul

echo 3. Opening FairSeat in your default browser...
start http://localhost:5173/

echo.
echo ========================================================
echo FairSeat is now RUNNING!
echo - Frontend: http://localhost:5173/
echo - Backend API: http://localhost:4000
echo.
echo (Do not close the opened black command windows while testing)
echo ========================================================
pause
