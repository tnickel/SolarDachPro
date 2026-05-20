# SolarDach Pro – Solar-as-a-Service Dashboard

Ein internes SaaS-Dashboard zur Verwaltung gewerblicher Dachpachtverträge und Solarprojekte.

> **Portfolio-Demo** für ein Climate-Tech Startup im Bereich "Solar-as-a-Service"

![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=nodedotjs)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)

---

## Inhaltsverzeichnis

- [Features](#features)
- [Tech-Stack](#tech-stack)
- [Architektur](#architektur)
- [Schnellstart](#schnellstart)
- [Projektstruktur](#projektstruktur)
- [API-Dokumentation](#api-dokumentation)
- [Datenmodell](#datenmodell)
- [Frontend](#frontend)
- [Security](#security)
- [Entwicklung](#entwicklung)

---

## Features

### Backend
- **RESTful API** mit Express 5 und TypeScript
- **3 Domänen-Entitäten**: Gewerbekunden, Solarprojekte, Grundbucheinträge
- **Prisma ORM** mit PostgreSQL – type-safe Queries und automatische Migrationen
- **Zod-Validierung** auf allen Endpoints
- **Security**: Helmet, CORS, Non-root Docker User
- **Strukturierte Fehlerbehandlung** mit AppError-Hierarchie
- **Seed-Daten**: 5 realistische Gewerbekunden mit 12 Projekten

### Frontend
- **React 19** Dashboard mit Dark Mode Design
- **Kartenansicht** (Leaflet/OpenStreetMap) mit farbcodierten Projekt-Markern
- **KPI-Dashboard** mit Live-Statistiken
- **Interaktive Tabellen** mit Suche und Filterung
- **Status-Management** per Modal und Inline-Editing
- **Responsive Design** – optimiert für Desktop

---

## Tech-Stack

| Schicht | Technologie |
|---------|-------------|
| **Frontend** | React 19, TypeScript, Vite, React Router, Leaflet |
| **Backend** | Node.js 20, Express 5, TypeScript |
| **Datenbank** | PostgreSQL 16 |
| **ORM** | Prisma 6 |
| **Validierung** | Zod |
| **Security** | Helmet, CORS |
| **Container** | Docker, Docker Compose |

---

## Architektur

```
┌──────────────┐     ┌──────────────────────┐     ┌──────────────┐
│   Frontend   │────▶│    Backend API        │────▶│  PostgreSQL  │
│  React + TS  │     │  Express + Prisma     │     │    16        │
│  Port 5173   │     │  Port 3001            │     │  Port 5432   │
└──────────────┘     └──────────────────────┘     └──────────────┘
                     │                        │
                     │  Route → Controller    │
                     │  Controller → Service  │
                     │  Service → Prisma ORM  │
                     └────────────────────────┘
```

### Schichten-Architektur (Backend)

| Schicht | Verantwortung |
|---------|--------------|
| **Routes** | URL-Mapping, Zod-Validierung |
| **Controllers** | HTTP Request/Response, Error-Forwarding |
| **Services** | Business-Logik, Datenbankoperationen |
| **Prisma** | ORM, Migrations, Type-safe Queries |

---

## Schnellstart

### Voraussetzungen

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installiert und gestartet
- [Node.js 20+](https://nodejs.org/) für lokale Frontend-Entwicklung

### 1. Repository klonen

```bash
git clone https://github.com/tnickel/SolarDachPro.git
cd SolarDachPro
```

### 2. Backend starten (Docker)

**Option A – start.bat (Windows):**
```bash
start.bat
```

**Option B – Manuell:**
```bash
# Container bauen und starten
docker compose up --build -d

# Datenbank-Migrationen
docker compose exec -T -u root backend npx prisma migrate deploy

# Demo-Daten laden
docker compose exec -T -u root backend npx tsx prisma/seed.ts
```

### 3. Frontend starten

```bash
cd frontend
npm install
npm run dev
```

### 4. Öffnen

| Service | URL |
|---------|-----|
| **Frontend Dashboard** | http://localhost:5173 |
| **Backend API** | http://localhost:3001/api/v1 |
| **Health Check** | http://localhost:3001/health |
| **Prisma Studio** (optional) | `npx prisma studio` → http://localhost:5555 |

---

## Projektstruktur

```
SolarDachPro/
├── docker-compose.yml          # Service-Orchestrierung
├── .env.example                # Environment-Template
├── start.bat / stop.bat        # Windows-Startskripte
│
├── backend/
│   ├── Dockerfile              # Multi-Stage Build
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma       # Datenmodell
│   │   └── seed.ts             # Demo-Daten (5 Kunden, 12 Projekte)
│   └── src/
│       ├── index.ts            # Express App Bootstrap
│       ├── config/env.ts       # Zod-validierte Umgebungsvariablen
│       ├── lib/prisma.ts       # Prisma Client Singleton
│       ├── middleware/
│       │   ├── auth.ts         # JWT Auth-Stub (Phase 2)
│       │   ├── errorHandler.ts # Globaler Error Handler
│       │   └── validate.ts     # Zod Request-Validierung
│       ├── routes/             # Express Routes + Validierung
│       ├── controllers/        # HTTP Request Handler
│       └── services/           # Business Logic + DB Queries
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts          # Vite + API Proxy
│   ├── index.html
│   └── src/
│       ├── App.tsx             # Layout + Routing
│       ├── index.css           # Dark Mode Design System
│       ├── api/client.ts       # Typisierter API Client
│       ├── types/index.ts      # Domain Types
│       └── pages/
│           ├── Dashboard.tsx   # KPI-Übersicht
│           ├── Clients.tsx     # Kundenverwaltung
│           ├── Projects.tsx    # Projektverwaltung
│           ├── LandRegistry.tsx# Grundbuchprüfung
│           └── MapView.tsx     # Leaflet-Kartenansicht
│
└── doc/                        # Projektdokumentation
```

---

## API-Dokumentation

Basis-URL: `http://localhost:3001/api/v1`

### Health Check

```
GET /health → { status: "healthy", database: "connected" }
```

### Gewerbekunden (`/clients`)

| Method | Endpoint | Beschreibung |
|--------|----------|-------------|
| `GET` | `/clients` | Alle Kunden (optional `?search=...`) |
| `GET` | `/clients/:id` | Einzelner Kunde mit Projekten |
| `POST` | `/clients` | Neuer Kunde anlegen |
| `PUT` | `/clients/:id` | Kunde aktualisieren |
| `DELETE` | `/clients/:id` | Kunde löschen (Cascade) |

### Solarprojekte (`/projects`)

| Method | Endpoint | Beschreibung |
|--------|----------|-------------|
| `GET` | `/projects` | Alle Projekte (optional `?status=...&clientId=...`) |
| `GET` | `/projects/:id` | Einzelnes Projekt mit Grundbuch |
| `POST` | `/projects` | Neues Projekt anlegen |
| `PATCH` | `/projects/:id/status` | Status ändern |
| `PUT` | `/projects/:id` | Projekt aktualisieren |
| `DELETE` | `/projects/:id` | Projekt löschen (Cascade) |

### Grundbucheinträge (`/land-registry`)

| Method | Endpoint | Beschreibung |
|--------|----------|-------------|
| `GET` | `/land-registry` | Alle Einträge (optional `?legalStatus=...&projectId=...`) |
| `GET` | `/land-registry/:id` | Einzelner Eintrag |
| `POST` | `/land-registry` | Neuer Eintrag |
| `PATCH` | `/land-registry/:id/status` | **Rechtsstatus aktualisieren** |
| `PUT` | `/land-registry/:id` | Eintrag aktualisieren |
| `DELETE` | `/land-registry/:id` | Eintrag löschen |

#### Beispiel: Grundbuchstatus aktualisieren

```bash
curl -X PATCH http://localhost:3001/api/v1/land-registry/<ID>/status \
  -H "Content-Type: application/json" \
  -d '{
    "legalStatus": "APPROVED",
    "legalNotes": "Grundbuchauszug liegt vor, keine Belastungen"
  }'
```

---

## Datenmodell

### Entity-Relationship

```
CommercialClient 1──N SolarProject 1──N LandRegistry
(Gewerbekunde)        (Dachanlage)       (Grundbuch)
```

### Enums

**ProjectStatus:** `PLANNING` → `APPROVED` → `UNDER_CONSTRUCTION` → `COMMISSIONED` → `OPERATIONAL` → `DECOMMISSIONED`

**LegalReviewStatus:** `PENDING` → `IN_REVIEW` → `APPROVED` / `REJECTED` / `REQUIRES_CLARIFICATION`

**RoofType:** `FLAT` · `PITCHED` · `SAWTOOTH` · `METAL_SHEET` · `OTHER`

### Seed-Daten

| Kunde | Stadt | Projekte | Gesamt kWp |
|-------|-------|----------|-----------|
| Müller Logistik GmbH | Hamburg | 2 | 535 |
| AutoParts Weber AG | München | 3 | 1.050 |
| BioMarkt Schuster KG | Berlin | 2 | 325 |
| TechnoStahl GmbH & Co. KG | Stuttgart | 2 | 1.040 |
| Getränke Krause OHG | Frankfurt | 3 | 350 |
| **Gesamt** | | **12** | **3.300** |

---

## Frontend

### Dashboard
- KPI-Karten: Gesamt-kWp, kWp in Betrieb, Kundenanzahl, offene Prüfungen
- Projektstatus-Verteilung
- Kundenübersicht mit Direktlinks

### Kartenansicht
- OpenStreetMap via Leaflet
- Farbcodierte Marker nach Projektstatus
- Popups mit Projektdetails (kWp, Kunde, Ertrag)
- Legende

### Tabellen
- Echtzeit-Suche und Filter
- Inline-Status-Änderung für Projekte
- Modal für Grundbuchstatus-Updates mit Notizfeld

---

## Security

| Maßnahme | Umsetzung |
|----------|-----------|
| Keine Hardcoded Secrets | `.env` Datei (nicht im Repo) |
| Environment-Template | `.env.example` ohne echte Werte |
| Security Headers | Helmet (XSS, HSTS, etc.) |
| CORS | Konfigurierbar via `CORS_ORIGIN` |
| Input-Validierung | Zod-Schemas auf allen Endpoints |
| Docker Security | Non-root User im Container |
| Fail-fast Config | Zod-validierte Umgebungsvariablen |
| Error Handling | Keine Stack-Traces in Production |
| Auth-Vorbereitung | JWT Middleware-Stub (Phase 2) |

---

## Entwicklung

### Lokaler Dev-Server (ohne Docker)

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev

# Frontend (neues Terminal)
cd frontend
npm install
npm run dev
```

### Nützliche Befehle

```bash
# Prisma Studio (Datenbank-GUI)
cd backend && npx prisma studio

# Neue Migration erstellen
cd backend && npx prisma migrate dev --name <name>

# Seed-Daten neu laden
cd backend && npx prisma db seed

# TypeScript Check
cd backend && npx tsc --noEmit

# Container stoppen
docker compose down

# Container + Daten löschen
docker compose down -v
```

---

## Lizenz

Dieses Projekt ist ein Portfolio-Demo und nicht für den Produktionseinsatz bestimmt.

---

**Entwickelt als Showcase für ein Climate-Tech Startup im Bereich Solar-as-a-Service.**
