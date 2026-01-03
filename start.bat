@echo off
REM THE SYSTEM - Unified Startup Script for Windows
REM This script starts both backend and frontend servers

echo ============================================================
echo  THE SYSTEM - AI-Driven Adaptive Leveling Platform
echo ============================================================
echo.

REM Check if MongoDB is running
echo [1/4] Checking MongoDB connection...
timeout /t 1 /nobreak >nul

REM Start Backend Server
echo [2/4] Starting Backend Server...
cd backend
start "THE SYSTEM - Backend" cmd /k "python app.py"
cd ..

REM Wait for backend to initialize
echo [3/4] Waiting for backend to initialize...
timeout /t 3 /nobreak >nul

REM Start Frontend Server
echo [4/4] Starting Frontend Server...
cd frontend
start "THE SYSTEM - Frontend" cmd /k "python -m http.server 8000"
cd ..

echo.
echo ============================================================
echo  SERVERS STARTED SUCCESSFULLY!
echo ============================================================
echo  Backend:  http://127.0.0.1:5000
echo  Frontend: http://localhost:8000
echo ============================================================
echo.
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul

REM Open browser
start http://localhost:8000

echo.
echo Press any key to stop all servers...
pause >nul

REM Kill servers on exit
taskkill /FI "WindowTitle eq THE SYSTEM - Backend*" /T /F >nul 2>&1
taskkill /FI "WindowTitle eq THE SYSTEM - Frontend*" /T /F >nul 2>&1

echo.
echo All servers stopped. Goodbye!
timeout /t 2 /nobreak >nul
