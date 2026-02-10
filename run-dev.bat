@echo off
cd /d "%~dp0"
start "Nutrito Dev" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
start http://localhost:5173/
