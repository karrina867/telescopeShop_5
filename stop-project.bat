@echo off
setlocal EnableExtensions
title Orbita Stop

set "KEEP_DB="
set "NO_PAUSE="
if "%~1"=="" goto args_ready
for %%A in (%*) do (
    if /i "%%~A"=="keepdb" set "KEEP_DB=1"
    if /i "%%~A"=="nopause" set "NO_PAUSE=1"
)
:args_ready

echo Stopping Orbita services...

call :kill_port 8000
call :kill_port 5173

if not defined KEEP_DB (
    call :kill_port 3410
    echo Done. Ports 3410, 8000 and 5173 are free now.
) else (
    echo Done. Ports 8000 and 5173 are free now. MariaDB was left untouched.
)

if defined NO_PAUSE exit /b 0
ping -n 5 127.0.0.1 >nul
exit /b 0

:kill_port
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /C:":%~1 " ^| findstr /C:"LISTENING"') do (
    if not "%%p"=="0" taskkill /PID %%p /F >nul 2>&1
)
exit /b 0
