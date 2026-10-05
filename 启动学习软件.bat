@echo off
title Java to Android - Learning App
cd /d "%~dp0"

echo ==========================================
echo   Java to Android  -  Interactive Course
echo ==========================================
echo.

where node >nul 2>nul
if errorlevel 1 goto nonode

echo Starting the local server...
echo.
echo   * On this computer : the browser opens automatically in 2 seconds.
echo   * On your phone    : connect to the SAME WiFi as this computer,
echo                        then open the LAN address printed below
echo                        (or click the phone button in the app).
echo.
echo   Keep THIS window open while you use the app.
echo.

start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:8765/"
node "%~dp0server.js"

echo.
echo [INFO] The server has stopped (see the message above).
echo        Press any key to close this window.
pause >nul
goto end

:nonode
echo [INFO] Node.js not found, opening index.html directly.
echo        Direct file mode may not save your learning progress.
echo        Install Node.js from nodejs.org and run this file again for full features.
echo.
start "" "index.html"
echo Press any key to close this window.
pause >nul

:end
