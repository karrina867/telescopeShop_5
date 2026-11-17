@echo off
setlocal EnableExtensions
title Orbita Frontend (Vue + Tailwind)

cd /d "%~dp0frontend"

where node.exe >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js was not found. Install Node.js 20+ and run this file again.
    pause
    exit /b 1
)

if not exist "node_modules\tailwindcss" goto install_deps
if not exist "node_modules\@tailwindcss\vite" goto install_deps
goto deps_ready

:install_deps
echo ============================================
echo   Installing frontend dependencies...
echo ============================================
call npm.cmd install --no-audit --no-fund
if errorlevel 1 (
    echo [ERROR] npm install failed. Check your internet connection and try again.
    pause
    exit /b 1
)

:deps_ready
call :port_open 5173
if not errorlevel 1 (
    echo Frontend is already running on http://127.0.0.1:5173
    echo Close the other frontend window or run stop-project.bat first.
    ping -n 5 127.0.0.1 >nul
    exit /b 0
)

echo ============================================
echo   Orbita - frontend
echo ============================================
echo.
echo Starting Vite dev server: http://127.0.0.1:5173
echo.
call npm.cmd run dev
if errorlevel 1 (
    echo.
    echo [ERROR] Vite stopped with an error. Read the messages above.
    pause
)

exit /b 0

:port_open
netstat -ano | findstr /C:":%~1 " | findstr /C:"LISTENING" >nul
exit /b %errorlevel%
