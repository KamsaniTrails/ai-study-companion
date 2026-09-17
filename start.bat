@echo off
title AI Study Companion - Launcher
echo ========================================================
echo  AI Study Companion - Launching Full Stack Application
echo  - Model: Gemini 3.1
echo  - Frontend: React + JavaScript
echo  - Location: %~dp0
echo ========================================================
echo.

echo Checking Python or Node execution...
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Launching via Python 3.1x runner...
    python "%~dp0run_companion.py"
    goto end
)

echo Python not found in path, launching via Node directly...
start "AI Backend Server (Port 4000)" cmd /k "cd /d "%~dp0server" && node index.js"
start "AI Frontend Client (Port 3000)" cmd /k "cd /d "%~dp0client" && npm run dev"

echo.
echo Servers started in background windows!
timeout /t 3 >nul
start http://localhost:3000

:end
