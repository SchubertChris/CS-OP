# Admin Security + Analytics — Design Spec
**Datum:** 21. April 2026  
**Projekt:** candlescope (Vercel · Team dzents-projects)  
**Status:** Approved

---

## Ziel

Zwei unabhängige aber zusammenhängende Systeme bauen, die auf derselben API-Infrastruktur laufen:

1. **Admin Auth** — Maximale Sicherheit: Passwort + TOTP (Microsoft Authenticator, QR-Code) + httpOnly JWT
2. **Analytics Dashboard** — Custom, kostenlos, DSGVO-konform ohne Cookie-Banner, in CandleScope-Style

Alles läuft als **Vercel Serverless Functions** im bestehenden Repo — kein extra Server, kein extra Billing.

---

## Architektur-Übersicht

```
repo root/
  api/                              ← Vercel Serverless Functions
    auth/
      login.ts                      ← POST: Passwort → Temp-Token (5min)
      totp-verify.ts                ← POST: TOTP-Code → JWT httpOnly Cookie
      totp-setup.ts                 ← GET:  QR-Code generieren (einmalig)
      logout.ts                     ← POST: Cookie löschen
      me.ts                         ← GET:  JWT prüfen → Auth-Status
    track/
      pageview.ts                   ← POST: Page View tracken (anonym)
      heartbeat.ts                  ← POST: Live-User Heartbeat (30s TTL)
      event.ts                      ← POST: Custom Event (Download-Klick etc.)
    analytics/
      overview.ts                   ← GET:  Alle KPIs (geschützt)
      live.ts                       ← GET:  Live-User-Count (geschützt)
      pages.ts                      ← GET:  Top Pages (geschützt)
      geo.ts                        ← GET:  Länder-Breakdown (geschützt)
      devices.ts                    ← GET:  Gerät/Browser (geschützt)
      events.ts                     ← GET:  Custom Events (geschützt)
    sitemap.ts                      ← GET:  Dynamische sitemap.xml
  public/
    robots.txt                      ← SEO Crawling-Regeln
  apps/frontend/src/
    admin/
      AdminLogin.tsx                ← Neu: 3-stufig (PW → TOTP → rein)
      AdminGuard.tsx                ← Neu: prüft JWT via /api/auth/me
      AdminDashboard.tsx            ← Komplett neu: Analytics UI
      AdminSetup.tsx                ← Einmalig: TOTP QR-Code einrichten
    hooks/
      useAnalytics.ts               ← Tracking-Hook (Page Views + Events)
```

---

## Teil A — Admin Authentifizierung

### Sicherheitsprinzipien

| Problem heute | Lösung |
|--------------|--------|
| `VITE_ADMIN_*` im Browser-Bundle sichtbar | Credentials nur noch server-side in Vercel Env Vars |
| SHA-256 ohne Salt (rainbow-table-angreifbar) | bcrypt mit Salt-Rounds 12 |
| Kein zweiter Faktor | TOTP via `otplib` (Microsoft Authenticator) |
| Session in localStorage (JS-zugänglich) | httpOnly Cookie (kein JS-Zugriff, XSS-proof) |

### Login-Flow (3 Schritte)

```
[1] Passwort eingeben
    → POST /api/auth/login
    → Server: bcrypt.compare(pw, ADMIN_PASSWORD_HASH)
    → OK: Temp-Token (JWT, 5min Gültigkeit, nur für TOTP-Schritt)
    → Fail: "Falsches Passwort" (kein Hinweis welcher Schritt fehlschlug)

[2] 6-stelligen TOTP-Code aus Microsoft Authenticator eingeben
    → POST /api/auth/totp-verify { code, tempToken }
    → Server: otplib.authenticator.check(code, TOTP_SECRET)
    → OK: Vollständiges JWT als httpOnly SameSite=Strict Cookie (8h)
    → Fail: "Falscher Code" + Rate-Limit (5 Versuche, dann 15min Sperre)

[3] Jede geschützte Admin-Seite:
    → GET /api/auth/me (Cookie wird automatisch mitgeschickt)
    → Server prüft JWT-Signatur + Ablaufzeit
    → OK: Zugang gewährt
    → Fail: Redirect zu /admin/login
```

### TOTP Einrichtung (Einmalig, vor Go-Live)

```
1. /api/auth/totp-setup aufrufen (geschützt durch SETUP_TOKEN in Env)
2. Server generiert base32 TOTP-Secret
3. Gibt QR-Code zurück (otpauth://totp/CandleScope:Chris?secret=XXX&issuer=CandleScope)
4. Microsoft Authenticator → + → QR-Code scannen → "CandleScope" erscheint in der App
5. TOTP_SECRET in Vercel Environment Variables speichern
6. SETUP_TOKEN aus Env entfernen (Endpoint damit dauerhaft deaktiviert)
```

### Vercel Environment Variables (Production)

```bash
ADMIN_PASSWORD_HASH=<bcrypt hash, rounds 12>   # Niemals Plaintext
TOTP_SECRET=<base32, 20 bytes>                  # Generiert bei Setup
JWT_SECRET=<random 64 chars>                    # crypto.randomBytes(32).toString('hex')
SETUP_TOKEN=<einmalig, dann löschen>            # Nur für Einrichtung
```

### Sicherheits-Details

- **httpOnly Cookie** — JavaScript kann den Token nicht lesen → XSS-proof
- **SameSite=Strict** — Cookie wird bei Cross-Site-Requests nicht mitgeschickt → CSRF-proof
- **Rate-Limiting** — IP-basiert über Vercel KV: max 5 Login-Versuche / 15min
- **Kein Username-Enumeration** — Identische Fehlermeldung egal welcher Schritt fehlschlägt
- **Auto-Logout** — JWT läuft nach 8h ab; Aktivitäts-Refresh optional
- **Alte VITE_ADMIN_* Vars** — werden nach Migration aus Vercel gelöscht

### Abhängigkeiten (npm)

```json
{
  "otplib": "^12.0.1",         // TOTP-Generierung und -Validierung
  "jose": "^5.2.0",            // JWT (Edge-Runtime-kompatibel)
  "bcryptjs": "^2.4.3",        // Passwort-Hashing
  "qrcode": "^1.5.3"           // QR-Code als Data-URL generieren
}
```

---

## Teil B — Analytics Dashboard

### Datenschutz-Prinzipien (kein Cookie-Banner nötig)

| Maßnahme | Details |
|---------|---------|
| IP-Anonymisierung | Letztes Oktett auf 0 gesetzt (192.168.1.123 → 192.168.1.0) |
| Keine Cookies | Nur sessionStorage für Session-ID (Tab-lokal, nicht persistent) |
| Kein Fingerprinting | Nur User-Agent-Parsing, keine Canvas/Font-Erkennung |
| Rechtsgrundlage | Art. 6 Abs. 1 lit. f DSGVO — berechtigtes Interesse (Serverbetrieb) |
| Kein Cross-Site-Tracking | Nur eigene Domain, keine externen Skripte |

### Datenbank-Architektur (100% kostenlos)

**Neon Postgres** (Free: 0.5GB, 1GB Transfer/Monat)
```sql
-- Page Views
CREATE TABLE page_views (
  id          SERIAL PRIMARY KEY,
  path        TEXT NOT NULL,
  referrer    TEXT,
  country     VARCHAR(2),           -- aus X-Vercel-IP-Country Header
  device      VARCHAR(20),          -- mobile | desktop | tablet
  browser     VARCHAR(50),
  os          VARCHAR(50),
  session_id  VARCHAR(36),          -- UUID aus sessionStorage
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Custom Events
CREATE TABLE events (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,        -- z.B. "download_click"
  path        TEXT,
  meta        JSONB,                -- zusätzliche Daten
  session_id  VARCHAR(36),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Tägliche Aggregate (für schnelle KPI-Abfragen)
CREATE TABLE daily_stats (
  date        DATE PRIMARY KEY,
  views       INTEGER DEFAULT 0,
  visitors    INTEGER DEFAULT 0,    -- unique session_ids
  downloads   INTEGER DEFAULT 0
);
```

**Vercel KV / Upstash Redis** (Free: 256MB, 30k req/day)
```
live:sessions → Hash { session_id: timestamp }   TTL 60s pro Heartbeat
rate:login:{ip} → Counter                         TTL 15min
```

### Was das Dashboard zeigt

**Live-Strip (oben, immer sichtbar)**
- "X Besucher gerade online" — Polling alle 30s via `/api/analytics/live`

**KPI-Cards (Reihe 1)**
- Besucher heute | Besucher diese Woche | Besucher diesen Monat | Gesamt

**Sparkline-Chart**
- Besucher pro Tag, letzte 30 Tage (Line Chart, Chart.js oder Recharts)

**Top Pages-Tabelle**
- Pfad | Views | Unique Visitors | Ø Verweildauer

**Traffic-Quellen**
- Direct | Google | Social | Andere (Referrer-Breakdown)

**Geo-Tabelle**
- Flagge + Ländername + Besucher-Count (aus Vercel IP-Country Header, gratis)

**Gerät & Browser**
- Horizontale Balken: Mobile / Desktop / Tablet + Chrome / Safari / Firefox etc.

**Events-Log**
- Download-Klicks (FinanceBoard) | Kontaktformular-Absenden | Andere Custom Events
- Letzte 50 Events als Live-Feed

### Tracking-Integration (Frontend)

```typescript
// hooks/useAnalytics.ts
// Wird einmal in RootLayout eingehängt — tracked alle Seitenaufrufe automatisch
useEffect(() => {
  fetch('/api/track/pageview', {
    method: 'POST',
    body: JSON.stringify({ path, referrer, sessionId })
  })
}, [pathname])

// Heartbeat alle 30s (Live-User-Zählung)
// Download-Button: onClick → fetch('/api/track/event', { name: 'download_click' })
```

---

## Teil C — SEO (Quick Wins, parallel umsetzbar)

| Maßnahme | Datei | Auswirkung |
|---------|-------|-----------|
| Dynamische Sitemap | `/api/sitemap.ts` → XML | Google indexiert alle Seiten |
| robots.txt | `/public/robots.txt` | Crawling-Regeln klar |
| og:image | Jede Seite (in PageHero) | Social-Media-Vorschau |
| JSON-LD | Homepage + About | Rich Snippets in Google |
| Canonical URLs | index.html | Kein Duplicate Content |

---

## Implementierungs-Reihenfolge

```
Phase 1 — Backend-Basis (api/ Ordner, Neon + KV verbinden)     ~2h
Phase 2 — Admin Auth (Login-Flow, TOTP-Setup)                   ~3h
Phase 3 — Tracking-Endpoints + Frontend-Hook                    ~2h
Phase 4 — Analytics Dashboard UI                                ~3h
Phase 5 — SEO Quick-Wins                                        ~1h
Phase 6 — ENV Setup + Deploy + TOTP einrichten                  ~30min
```

---

## ENV-Checkliste für go-live

```bash
# In Vercel Project Settings → Environment Variables

# Auth
ADMIN_PASSWORD_HASH=         # bcrypt(deinPasswort, 12) — lokal generieren
TOTP_SECRET=                 # nach Phase 2 Setup-Endpoint ausfüllen
JWT_SECRET=                  # node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SETUP_TOKEN=                 # einmalig, danach löschen

# Database
DATABASE_URL=                # Neon Postgres Connection String
KV_REST_API_URL=             # Vercel KV Dashboard
KV_REST_API_TOKEN=           # Vercel KV Dashboard

# Alte Variablen LÖSCHEN nach Migration
# VITE_ADMIN_PIN → löschen
# VITE_ADMIN_PASSWORD → löschen
```

---

## Was NICHT gebaut wird (YAGNI)

- Kein Multi-User-Admin (nur Chris)
- Kein Self-Hosted Umami/Plausible (custom reicht)
- Kein Email-Benachrichtigungen bei Login-Versuchen (nice-to-have, Phase 2)
- Kein Mobile-App-Dashboard
- Keine A/B-Testing-Integration
