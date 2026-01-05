@echo off
title Anaya App Server
echo ========================================
echo   Restarting Anaya Baby Care Servers
echo ========================================
echo.

REM 1. Kill any existing Node.js processes (Releases file locks)
echo [1/4] Stopping existing servers...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo       - Processes stopped.
) else (
    echo       - No active processes found.
)
echo.

REM 2. Check dependencies
if not exist "node_modules\" (
    echo [2/4] Installing dependencies...
    call npm install
    echo.
) else (
    echo [2/4] Dependencies found.
)

REM 3. Updates Database Client (Fixes the "Unknown Argument" error)
echo [3/4] Updating Database Client (Prisma)...
call npx prisma generate
echo.

REM 4. Start Server
echo [4/4] Starting Server on Port 3005...
echo.
echo    - Admin: http://localhost:3005/shopry-hq/admin
echo    - Store: http://localhost:3005/
echo.
echo ========================================
echo.

call npm run dev
