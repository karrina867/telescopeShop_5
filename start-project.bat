@echo off
setlocal EnableExtensions
title Orbita Launcher

cd /d "%~dp0"

echo ============================================
echo   Starting Orbita project
echo ============================================
echo.

call "%~dp0stop-project.bat" keepdb nopause

echo Starting backend window ...
start "Orbita Backend" "%~dp0start-backend.bat"

echo Waiting for the API on port 8000 ...
set /a API_WAIT=0
:wait_api
call :port_open 8000
if not errorlevel 1 goto api_ready
set /a API_WAIT+=1
if %API_WAIT% geq 90 goto api_timeout
ping -n 2 127.0.0.1 >nul
goto wait_api

:api_ready
echo API is ready.
ping -n 3 127.0.0.1 >nul

echo Starting frontend window ...
start "Orbita Frontend" "%~dp0start-frontend.bat"

echo Waiting for Vite on port 5173 ...
set /a WEB_WAIT=0
:wait_web
call :port_open 5173
if not errorlevel 1 goto web_ready
set /a WEB_WAIT+=1
if %WEB_WAIT% geq 120 goto web_timeout
ping -n 2 127.0.0.1 >nul
goto wait_web

:web_ready
echo Frontend is ready. Opening the browser ...
ping -n 2 127.0.0.1 >nul
start "" "http://127.0.0.1:5173"

echo.
echo ============================================
echo   Project is running
echo ============================================
echo   Site:   http://127.0.0.1:5173
echo   API:    http://127.0.0.1:8000/api/v1
echo   Admin:  http://127.0.0.1:8000/admin
echo   Login:  admin@orbita.by / admin12345
echo.
echo   To stop: run stop-project.bat
echo ============================================
echo.
ping -n 9 127.0.0.1 >nul
exit /b 0

:api_timeout
echo.
echo [ERROR] The backend did not open port 8000 within 90 seconds.
echo         Open the "Orbita Backend" window and read the error message there.
pause
exit /b 1

:web_timeout
echo.
echo [ERROR] Vite did not open port 5173 within 120 seconds.
echo         Open the "Orbita Frontend" window and read the error message there.
pause
exit /b 1

:port_open
netstat -ano | findstr /C:":%~1 " | findstr /C:"LISTENING" >nul
exit /b %errorlevel%
