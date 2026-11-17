@echo off
setlocal EnableExtensions
title Orbita Backend (API)

set "ROOT=%~dp0"
set "DB_PORT=3410"
set "PHP_BIN=C:\xampp\php\php.exe"
set "MYSQLD_BIN=C:\xampp\mysql\bin\mysqld.exe"
set "MYSQL_BIN=C:\xampp\mysql\bin\mysql.exe"
set "MYSQL_INI=C:\xampp\mysql\bin\my.ini"

if exist "%PHP_BIN%" goto php_ready

where php.exe >nul 2>&1
if errorlevel 1 (
    echo [ERROR] PHP was not found. Install XAMPP or add php.exe to PATH.
    echo         Expected: C:\xampp\php\php.exe
    pause
    exit /b 1
)
set "PHP_BIN=php"

:php_ready

echo ============================================
echo   Orbita - backend
echo ============================================
echo.

call :port_open %DB_PORT%
if not errorlevel 1 (
    echo [1/3] MariaDB is already running on port %DB_PORT%.
    goto db_ready
)

echo [1/3] Starting MariaDB on port %DB_PORT% ...

if not exist "%MYSQLD_BIN%" (
    echo [ERROR] mysqld.exe was not found at %MYSQLD_BIN%
    echo         Start MariaDB from the XAMPP Control Panel, then run this file again.
    pause
    exit /b 1
)

if not exist "%MYSQL_INI%" (
    echo [ERROR] MySQL config was not found at %MYSQL_INI%
    echo         Check your XAMPP installation.
    pause
    exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Start-Process -FilePath '%MYSQLD_BIN%' -WorkingDirectory 'C:\xampp\mysql\bin' -WindowStyle Hidden -ArgumentList '--defaults-file=%MYSQL_INI%','--port=%DB_PORT%','--bind-address=127.0.0.1','--standalone'"

set /a DB_WAIT=0
:wait_db
call :port_open %DB_PORT%
if not errorlevel 1 goto db_ready
set /a DB_WAIT+=1
if %DB_WAIT% geq 45 goto db_fail
ping -n 2 127.0.0.1 >nul
goto wait_db

:db_fail
echo [ERROR] MariaDB did not start within 45 seconds.
echo         Try starting MySQL from the XAMPP Control Panel and check its log.
pause
exit /b 1

:db_ready
echo [1/3] MariaDB is ready.

if exist "%MYSQL_BIN%" (
    "%MYSQL_BIN%" -h 127.0.0.1 -P %DB_PORT% -u root -e "CREATE DATABASE IF NOT EXISTS orbita CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" >nul 2>&1
)

cd /d "%ROOT%backend"
if errorlevel 1 (
    echo [ERROR] Backend folder was not found: %ROOT%backend
    pause
    exit /b 1
)

echo [2/3] Applying database migrations ...
"%PHP_BIN%" artisan migrate --force --no-interaction
if errorlevel 1 (
    echo [WARN] Migrations finished with an error. The API will still be started.
    echo        Check backend\storage\logs\laravel.log for details.
)

call :port_open 8000
if not errorlevel 1 (
    echo [3/3] API is already running on http://127.0.0.1:8000
    echo        Close the other backend window or run stop-project.bat first.
    ping -n 5 127.0.0.1 >nul
    exit /b 0
)

echo [3/3] Starting Laravel API on http://127.0.0.1:8000 ...
echo.
"%PHP_BIN%" artisan serve --host=127.0.0.1 --port=8000

echo.
echo Backend stopped.
pause
exit /b 0

:port_open
netstat -ano | findstr /C:":%~1 " | findstr /C:"LISTENING" >nul
exit /b %errorlevel%
