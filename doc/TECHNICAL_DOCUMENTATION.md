# Technische Dokumentation – SolarDach Pro

## 1. Systemübersicht

SolarDach Pro ist ein internes SaaS-Dashboard für ein Climate-Tech Startup im Bereich "Solar-as-a-Service". Es dient der Verwaltung gewerblicher Dachpachtverträge und Solarprojekte.

### 1.1 Zielsetzung

- **Kundenverwaltung**: Zentrale Erfassung aller Gewerbekunden mit Kontaktdaten und Steuer-ID
- **Projektmanagement**: Tracking aller Solarprojekte von der Planung bis zum Betrieb
- **Grundbuchprüfung**: Workflow für die rechtliche Prüfung von Flurstücken
- **Geo-Visualisierung**: Kartenansicht aller Projektstandorte mit Status-Farbcodierung

### 1.2 Systemarchitektur

Das System ist als **API-first Architektur** aufgebaut:

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Compose                           │
│                                                             │
│  ┌──────────────┐     ┌──────────────┐    ┌──────────────┐ │
│  │   Frontend    │────▶│   Backend    │───▶│  PostgreSQL  │ │
│  │   React 19    │     │  Express 5   │    │     16       │ │
│  │   Vite        │     │  Prisma 6    │    │              │ │
│  │   Port 5173   │     │  Port 3001   │    │  Port 5432   │ │
│  └──────────────┘     └──────────────┘    └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Entscheidung Express vs. Next.js:**
Express wurde gewählt, weil:
- Saubere Trennung von Frontend und Backend
- Schlankeres Docker-Image (~150 MB vs. ~400 MB)
- Volle Middleware-Kontrolle
- Backend unabhängig skalierbar
- API-first Design als Kernprinzip

---

## 2. Backend-Architektur

### 2.1 Schichten-Modell

```
HTTP Request
    │
    ▼
┌──────────────────┐
│     Routes       │  URL-Mapping, Zod-Validierung
├──────────────────┤
│   Controllers    │  HTTP Request/Response Handling
├──────────────────┤
│    Services      │  Business-Logik, DB-Operationen
├──────────────────┤
│     Prisma       │  ORM, Type-safe Queries
├──────────────────┤
│   PostgreSQL     │  Persistenz
└──────────────────┘
```

### 2.2 Middleware-Pipeline

Jeder Request durchläuft folgende Middleware-Kette:

1. **Helmet** – Security-Headers (XSS, HSTS, Content-Type Sniffing)
2. **CORS** – Cross-Origin-Konfiguration
3. **JSON Body Parser** – Request-Body Parsing (max. 10 MB)
4. **Route-Matching** – Express Router
5. **Zod Validate** – Schema-Validierung (Body, Params, Query)
6. **Auth (Stub)** – JWT-Verifikation (Phase 2)
7. **Controller** – Request-Verarbeitung
8. **Error Handler** – Globale Fehlerbehandlung

### 2.3 Error Handling

Fehler werden über eine `AppError`-Hierarchie verwaltet:

```typescript
AppError (statusCode, message)
  └── NotFoundError (404)
```

Der globale Error Handler:
- Gibt strukturierte JSON-Responses zurück
- Loggt Fehler auf der Konsole
- Zeigt Stack-Traces nur im Development-Modus
- Gibt einen generischen 500 für unbekannte Fehler zurück

### 2.4 Environment-Validierung

Alle Umgebungsvariablen werden beim Start mit Zod validiert:

```typescript
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().int().positive(),
  DATABASE_URL: z.string().url(),
  CORS_ORIGIN: z.string(),
  JWT_SECRET: z.string().min(8).optional(),
});
```

Bei fehlenden oder ungültigen Variablen beendet sich die Anwendung sofort mit einer klaren Fehlermeldung (**Fail-fast Prinzip**).

---

## 3. Datenmodell

### 3.1 Entity-Relationship-Diagramm

```
CommercialClient (1) ──────── (N) SolarProject (1) ──────── (N) LandRegistry
     │                               │                              │
     │ Firmendaten                   │ Projektdaten                 │ Grundbuchdaten
     │ - companyName                 │ - projectName                │ - gemarkung
     │ - contactPerson               │ - status (Enum)              │ - flurstueck
     │ - email (unique)              │ - plannedKwp                 │ - ownerName
     │ - phone                       │ - estimatedYieldKwh          │ - legalStatus (Enum)
     │ - address, city, postalCode   │ - roofType (Enum)            │ - legalNotes
     │ - taxId                       │ - roofAreaSqm                │ - lastCheckedAt
     │                               │ - latitude, longitude        │ - latitude, longitude
     │                               │ - plannedStartDate           │
     │                               │ - commissioningDate          │
```

### 3.2 Status-Workflows

**Projektstatus (ProjectStatus):**
```
PLANNING → APPROVED → UNDER_CONSTRUCTION → COMMISSIONED → OPERATIONAL
                                                              ↓
                                                        DECOMMISSIONED
```

**Grundbuch-Rechtsstatus (LegalReviewStatus):**
```
PENDING → IN_REVIEW → APPROVED
                   ↘ REJECTED
                   ↘ REQUIRES_CLARIFICATION → IN_REVIEW (erneute Prüfung)
```

### 3.3 Datenbank-Konventionen

- **Primärschlüssel**: UUID v4 (generiert)
- **Tabellennamen**: snake_case (z.B. `commercial_clients`)
- **Spaltennamen**: snake_case im DB, camelCase in TypeScript
- **Timestamps**: `created_at`, `updated_at` (automatisch)
- **Cascade Delete**: Client → Projects → LandRegistry
- **Indizes**: Foreign Keys + Status-Felder

### 3.4 Geo-Daten

Alle Standortdaten werden als `latitude`/`longitude` (Float) gespeichert:
- **SolarProject**: Standort der Dachanlage
- **LandRegistry**: Position des Flurstücks

Die Koordinaten beziehen sich auf das WGS-84 Koordinatensystem (GPS-Standard).

---

## 4. API-Spezifikation

### 4.1 Allgemeine Konventionen

- **Base URL**: `/api/v1`
- **Format**: JSON
- **Erfolgsantwort**: `{ success: true, data: {...}, count?: number }`
- **Fehlerantwort**: `{ success: false, error: { message: "...", details?: [...] } }`
- **IDs**: UUID v4 Format
- **Validierung**: Zod-Schemas auf allen schreibenden Endpoints

### 4.2 Validierungsregeln

**CommercialClient:**
- `companyName`: 1-255 Zeichen (Pflicht)
- `contactPerson`: 1-255 Zeichen (Pflicht)
- `email`: Gültige E-Mail-Adresse (Pflicht, unique)
- `phone`: max. 50 Zeichen (optional)
- `address`, `city`: Pflicht
- `postalCode`: 1-10 Zeichen (Pflicht)
- `taxId`: max. 50 Zeichen (optional)

**SolarProject:**
- `projectName`: 1-255 Zeichen (Pflicht)
- `plannedKwp`: Positive Zahl (Pflicht)
- `clientId`: Gültige UUID (Pflicht)
- `latitude`: -90 bis 90 (optional)
- `longitude`: -180 bis 180 (optional)

**LandRegistry:**
- `gemarkung`: 1-255 Zeichen (Pflicht)
- `flurstueck`: 1-100 Zeichen (Pflicht)
- `ownerName`: 1-255 Zeichen (Pflicht)
- `projectId`: Gültige UUID (Pflicht)
- `legalNotes`: max. 2000 Zeichen (optional)

---

## 5. Frontend-Architektur

### 5.1 Technologie

- **React 19** mit TypeScript
- **Vite** als Build-Tool (HMR, schnelle Builds)
- **React Router 7** für Client-Side-Routing
- **Leaflet** + **react-leaflet** für Kartenansicht
- **Vanilla CSS** mit Custom Properties (Design Tokens)

### 5.2 Seiten

| Route | Komponente | Beschreibung |
|-------|------------|-------------|
| `/` | Dashboard | KPI-Karten, Status-Verteilung, Kundenübersicht |
| `/clients` | Clients | Kundentabelle mit Suche |
| `/projects` | Projects | Projekttabelle mit Status-Filter und Inline-Edit |
| `/land-registry` | LandRegistry | Grundbuchtabelle mit Modal-Editor |
| `/map` | MapView | Leaflet-Karte mit farbcodierten Markern |

### 5.3 Design-System

Das Frontend verwendet ein Dark-Mode Design-System mit CSS Custom Properties:

- **Farbschema**: Dunkles Theme mit Amber/Orange-Akzenten (Solar-Thematik)
- **Typografie**: Inter (Google Fonts)
- **Komponenten**: KPI-Cards mit Glow-Effekt, Status-Badges, glassmorphe Panels
- **Animationen**: Fade-In, Slide-Up, Hover-Transitions
- **Responsive**: Grid-basiertes Layout, mobile Anpassungen

---

## 6. Docker-Konfiguration

### 6.1 Services

| Service | Image | Port | Funktion |
|---------|-------|------|----------|
| `postgres` | postgres:16-alpine | 5432 | Datenbank |
| `backend` | sassprojektsolarbranche-backend | 3001 | API-Server |

### 6.2 Multi-Stage Dockerfile

```
Stage 1 (builder):
  - node:20-alpine
  - npm ci (alle Deps)
  - prisma generate
  - tsc (TypeScript Build)

Stage 2 (production):
  - node:20-alpine
  - npm ci --omit=dev
  - Non-root User (appuser:1001)
  - prisma migrate deploy + node dist/index.js
  - Health-Check Endpoint
```

### 6.3 Health-Checks

- **PostgreSQL**: `pg_isready` alle 10s
- **Backend**: HTTP GET `/health` alle 30s
- **Dependency**: Backend startet erst nach erfolgreicher DB-Prüfung

---

## 7. Security

### 7.1 Implementierte Maßnahmen

| Kategorie | Maßnahme | Details |
|-----------|----------|---------|
| Secrets | `.env` Datei | Nicht im Repository, `.env.example` als Template |
| HTTP Headers | Helmet | XSS Protection, HSTS, Content-Type Sniffing, Frameguard |
| CORS | Konfigurierbar | `CORS_ORIGIN` Environment-Variable |
| Validierung | Zod | Schema-Validierung auf allen Endpoints |
| Container | Non-root User | `appuser:1001` im Docker Container |
| Konfiguration | Fail-fast | Zod-Validierung aller Env-Variablen beim Start |
| Fehler | Strukturiert | Keine Stack-Traces in Production |
| Authentifizierung | JWT & bcrypt | Signierte Tokens, Password-Hashing |
| Autorisierung | Rollen (RBAC) | Schreibrechte nur für `ADMIN`, Read-Only für `VIEWER` |

---

## 8. Seed-Daten

Die Demo-Daten bilden ein realistisches Szenario ab:

- **5 Gewerbekunden** in verschiedenen deutschen Städten
- **12 Solarprojekte** mit unterschiedlichen Status
- **14 Grundbucheinträge** mit verschiedenen Rechtsstatus
- **Reale Geo-Koordinaten** für die Kartenansicht
- **Gesamt**: 3.300 kWp geplante Solarleistung

---

## 9. Weiterentwicklung (Roadmap)

### Phase 3 – Erweiterte Features
- Dashboard-Charts (Recharts/D3)
- PDF-Export für Grundbuchberichte
- E-Mail-Benachrichtigungen bei Status-Änderungen
- Audit-Log für alle Änderungen

### Phase 4 – Production
- CI/CD Pipeline (GitHub Actions)
- Kubernetes-Deployment
- Monitoring (Prometheus/Grafana)
- Automatisierte Tests (Jest, Cypress)
