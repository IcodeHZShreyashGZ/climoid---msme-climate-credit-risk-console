@echo off
title Climoid - Localhost Launcher
cd /d "%~dp0"

echo ==========================================================
echo   CLIMOID - MSME Climate Credit Risk Console (localhost)
echo ==========================================================
echo.

where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Install it from https://nodejs.org then re-run this file.
    pause
    exit /b 1
)

if exist "node_modules\" goto deps-ok
echo [1/4] First run: installing dependencies - this can take a few minutes...
call npm install
if errorlevel 1 goto install-failed
call npm approve-scripts esbuild >nul 2>&1
call npm rebuild esbuild >nul 2>&1
goto deps-done

:install-failed
echo.
echo [ERROR] npm install failed. Check your internet connection and re-run this file.
pause
exit /b 1

:deps-ok
echo [1/4] Dependencies already installed.

:deps-done
echo.

echo [2/4] Freeing ports 3000 and 3001 (stopping any old Climoid instances)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /C:":3000" ^| findstr /C:"LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /C:":3001" ^| findstr /C:"LISTENING"') do taskkill /F /PID %%a >nul 2>&1
ping -n 3 127.0.0.1 >nul

echo [3/4] Starting voice + AI advisor backend (port 3001)...
start "Climoid Voice + AI Backend :3001" cmd /k npm run server

echo [4/4] Starting Climoid console (port 3000)...
start "Climoid Console :3000" cmd /k npm run dev

echo.
echo Waiting for servers to start...
ping -n 10 127.0.0.1 >nul

start "" http://localhost:3000

echo Verifying the AI + voice backend...
powershell -NoProfile -Command "try { $null = Invoke-WebRequest -Uri 'http://localhost:3001/api/health' -UseBasicParsing -TimeoutSec 5; Write-Host '  Backend OK - AI advisor and Whisper voice are live.' } catch { Write-Host '  [WARN] Backend not responding yet - wait a few seconds and check the backend window for errors.' }"

echo.
echo ==========================================================
echo   Climoid is running!
echo.
echo   Console  : http://localhost:3000
echo   AI+Voice : http://localhost:3001/api/health
echo.
echo   Keep the two console windows open. To stop Climoid,
echo   simply close both of them.
echo ==========================================================
echo.
echo This launcher window can now be closed.
pause
