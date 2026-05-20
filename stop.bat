@echo off
title Solar-as-a-Service - Stoppen

echo.
echo ========================================
echo   Stoppe Solar-as-a-Service Container...
echo ========================================
echo.

docker compose down

echo.
echo [OK] Alle Container gestoppt.
echo.
echo Tipp: Um auch die Datenbank-Daten zu loeschen:
echo       docker compose down -v
echo.
echo Druecke eine beliebige Taste zum Schliessen...
pause >nul
