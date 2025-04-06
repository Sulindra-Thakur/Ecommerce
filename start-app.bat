@echo off
echo ===== MERN E-commerce Application Starter =====
echo.

REM Kill any existing Node.js processes that might be using ports
echo Killing any existing Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM nodemon.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo Done!
echo.

REM Kill any processes using specific ports
echo Killing any processes using ports 5002 and 5173/5174...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5002') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5174') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul
echo Done!
echo.

REM Start the server
echo Starting the server (MongoDB + Express)...
echo Please wait while the server initializes...
start cmd /k "cd server && npm run dev"

REM Wait for server to start
echo Waiting for server to initialize...
timeout /t 8 /nobreak >nul

REM Start the client
echo Starting the client (React)...
start cmd /k "cd client && npm run dev"

echo.
echo ===== Application Started =====
echo.
echo Server running on: http://localhost:5002
echo Client running on: http://localhost:5173 or http://localhost:5174
echo.
echo IMPORTANT NOTES:
echo 1. Make sure you sign in to see personalized recommendations
echo 2. Browse multiple products to generate your preferences
echo 3. All weather-based discounts will appear automatically
echo 4. The "Shop Now" button will take you to the product listing
echo.
echo To stop the application completely, run this batch file again
echo or manually kill Node.js processes in Task Manager.
echo.
echo Press any key to exit this window...
pause >nul 