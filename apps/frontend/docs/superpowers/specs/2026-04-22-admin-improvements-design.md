# Admin Improvements — Design Spec
Date: 2026-04-22

## Scope

Vier eigenständige Verbesserungen am Candlescope-Frontend und Admin-Bereich:

1. Coming-Soon-Modal für den "Gratis laden"-Button
2. Echtes Logo im Admin-Header
3. Login-Event-Tracking im Backend
4. Security-Karte im Admin-Dashboard

---

## 1. "Gratis laden"-Button — Coming Soon Modal

**Problem:** Der Button in `Header.tsx` ist ein `<a href="/downloads/FinanceBoard-Setup.exe" download>` — die Datei existiert nicht, der Browser zeigt eine HTML-404-Seite.

**Lösung:**
- `ComingSoonModal` aus `FinancePage.tsx` in eine eigene Datei auslagern: `src/components/ui/ComingSoonModal.tsx`
- `FinancePage.tsx` importiert von dort (Verhalten unverändert)
- `Header.tsx`: `<a download>` → `<button>` mit lokalem `useState` (`dlOpen`) → rendert `<ComingSoonModal>`
- Das Modal verwendet Framer Motion, ist bereits fertig implementiert, muss nur extrahiert werden
- Imports in `ComingSoonModal.tsx`: `motion` (framer-motion), `X`, `Clock` (lucide-react)

**Betroffene Dateien:**
- `src/components/ui/ComingSoonModal.tsx` — neu (Extraktion)
- `src/pages/FinancePage.tsx` — `ComingSoonModal` entfernen, Import ergänzen
- `src/components/layout/Header.tsx` — `<a download>` ersetzen, State + Modal ergänzen

---

## 2. Logo im Admin-Header

**Problem:** `AdminLayout.tsx` rendert ein handgemachtes Diamant-Icon (zwei `<div>` mit `rotate-45`), kein echtes Branding.

**Lösung:**
- `csLogo` aus `../../assets/images/CandleScopeLogo.png` importieren
- Das Diamant-Icon-Markup ersetzen durch `<img src={csLogo} className="w-6 h-6 object-contain" />`
- Schriftzug bleibt: `CandleScope / Admin` in bestehenden Monospace-Styles

**Betroffene Dateien:**
- `src/admin/AdminLayout.tsx` — Import + JSX-Austausch (3 Zeilen)

---

## 3. Login-Event-Tracking

**Problem:** Es gibt keine Aufzeichnung von Login-Versuchen, Fehlschlägen oder Rate-Limit-Blocks.

**Lösung:** `auth/[action].ts` schreibt bei jedem relevanten Ereignis einen Eintrag in die bestehende `events`-Tabelle (kein neues Schema nötig).

| Aktion | Event-Name | Meta |
|--------|-----------|------|
| Login erfolgreich (vor TOTP) | `login_success` | `{ ip }` |
| Login fehlgeschlagen | `login_fail` | `{ ip }` |
| TOTP-Verifikation erfolgreich | `totp_success` | `{ ip }` |
| TOTP fehlgeschlagen | `totp_fail` | `{ ip }` |
| Rate-Limit ausgelöst | `rate_limited` | `{ ip, action }` |

Die IP wird aus `x-forwarded-for` gelesen (bereits vorhanden). Kein `session_id` nötig — `NULL` ist erlaubt laut Schema.

Helper-Funktion `logEvent(sql, name, meta)` — direkt in `auth/[action].ts` inline, kein separates Modul (Vercel-Bundle-Sicherheit).

**Betroffene Dateien:**
- `api/auth/[action].ts` — 5 Event-Schreibstellen + `logEvent` Helper

---

## 4. Security-Endpoint

**Neuer Endpoint:** `api/analytics/security.ts` (eigene Datei, kein `[type]`-Dynamic-Route)

Gibt zurück:
```json
{
  "last24h": {
    "login_fail": 3,
    "totp_fail": 1,
    "rate_limited": 2,
    "login_success": 5
  },
  "topIps": [{ "ip": "1.2.3.4", "count": 3 }],
  "recentEvents": [{ "name": "login_fail", "meta": {...}, "created_at": "..." }]
}
```

Queries gegen `events`-Tabelle (bereits vorhanden):
- Count der letzten 24h nach `name`
- Top-5 IPs aus `meta->>'ip'` (JSONB-Abfrage)
- Letzte 20 Security-Events (`name IN ('login_fail','totp_fail','rate_limited','login_success')`)

Endpoint ist durch `requireAdmin` geschützt (analog zu `analytics/[type].ts`).

**Betroffene Dateien:**
- `api/analytics/security.ts` — neu
- `api/_lib/auth.ts` — prüfen ob `requireAdmin` dort bereits extrahiert ist (sonst inline)

---

## 5. Security-Karte im Admin-Dashboard

**Neue Sektion** in `AdminDashboard.tsx` unter dem Events-Log:

```
┌─────────────────────────────────────┐
│ SECURITY — letzte 24h               │
│                                     │
│  ✓ Logins       5   • Fehlschläge  3│
│  ⚠ TOTP-Fails   1   • Blocks       2│
│                                     │
│  Top IPs                            │
│  1.2.3.x  ████████░░  3             │
│                                     │
│  Letzte Ereignisse                  │
│  login_fail  /admin  22.04 14:32    │
└─────────────────────────────────────┘
```

Farbkodierung: `login_success` → grün (`#00C896`), alles andere → gold/rot je nach Schwere.

**Betroffene Dateien:**
- `src/admin/AdminDashboard.tsx` — neuer State (`security`), Fetch, Karten-JSX

---

## Nicht in Scope

- Pagebuilder / PageEditor
- Neue Datenbank-Tabellen
- Referrer-Tracking, OS-Aufschlüsselung, Datumsfilter (spätere Iteration)
- Admin-Design-Komplettüberholung

---

## Technische Constraints

- Vercel Serverless: alle `_lib/`-Imports müssen statisch sein (kein `await import()`)
- `requireAdmin` ist in `api/auth/[action].ts` inline — für `security.ts` muss eine eigene Kopie rein oder `_lib/auth.ts` prüfen
- `ComingSoonModal` nutzt Framer Motion → bereits in `package.json`
