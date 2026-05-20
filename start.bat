@echo off
chcp 65001 >nul 2>nul
title Solar-as-a-Service – Dashboard

echo.
echo  ========================================
echo    Solar-as-a-Service Dashboard
echo    Starte Docker Container...
echo  ========================================
echo.

:: Pruefe ob Docker laeuft
docker info >nul 2>&1
if errorlevel 1 (
    echo  [FEHLER] Docker ist nicht gestartet!
    echo  Bitte starte Docker Desktop und versuche es erneut.
    echo.
    goto :ende
)

echo  [1/4] Container bauen und starten...
docker compose up --build -d
if errorlevel 1 (
    echo  [FEHLER] Docker Compose fehlgeschlagen!
    goto :ende
)

echo.
echo  [2/4] Warte auf PostgreSQL Health-Check...
set /a counter=0
:wait_db
set /a counter+=1
if %counter% gtr 30 (
    echo  [FEHLER] PostgreSQL startet nicht - Timeout nach 60 Sekunden.
    goto :ende
)
docker compose exec -T postgres pg_isready -U solar_admin -d solar_saas >nul 2>&1
if errorlevel 1 (
    timeout /t 2 /nobreak >nul
    goto wait_db
)
echo  [OK] PostgreSQL ist bereit.

echo.
echo  [3/4] Datenbank-Migrationen ausfuehren...
docker compose exec -T -u root backend npx prisma migrate deploy 2>nul
echo  [OK] Migrationen abgeschlossen.

echo.
echo  [4/4] Seed-Daten laden...
docker compose exec -T -u root backend npx tsx prisma/seed.ts 2>nul
echo  [OK] Demo-Daten geladen.

echo.
echo  ========================================
echo    System laeuft!
echo.
echo    API:     http://localhost:3001/api/v1
echo    Health:  http://localhost:3001/health
echo    DB:      localhost:5432
echo.
echo    Stoppen: stop.bat oder
echo             docker compose down
echo  ========================================
echo.

:ende
echo.
echo  Druecke eine beliebige Taste zum Schliessen...
pause >nul
