@echo off
echo ===== MERN E-commerce Process Cleaner =====
echo.
echo This will kill all Node.js processes and free up required ports
echo.

echo Step 1: Killing all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM nodemon.exe >nul 2>&1
echo Done!
echo.

echo Step 2: Freeing up specific ports...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5002') do (
    echo Killing process using port 5002: %%a
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    echo Killing process using port 5173: %%a
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5174') do (
    echo Killing process using port 5174: %%a
    taskkill /F /PID %%a >nul 2>&1
)
echo Done!
echo.

echo ===== All processes cleaned up! =====
echo.
echo You can now run start-app.bat to start the application fresh.
echo.
echo Press any key to exit...
pause >nul 