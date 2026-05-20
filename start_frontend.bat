@echo off
title Solar-as-a-Service - Frontend

echo.
echo ========================================
echo   Solar-as-a-Service Frontend
echo   Starte Entwicklungs-Server...
echo ========================================
echo.

cd /d "%~dp0frontend"

if not exist node_modules (
    echo [INFO] node_modules nicht gefunden. Installiere Abhaengigkeiten...
    call npm install
    if errorlevel 1 (
        echo [FEHLER] npm install fehlgeschlagen!
        goto :ende
    )
)

echo [OK] Starten von Vite...
echo Oeffne http://localhost:5173 in deinem Browser
echo.

call npm run dev

:ende
echo.
echo Druecke eine beliebige Taste zum Schliessen...
pause >nul
