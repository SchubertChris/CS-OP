# CandleScope FinanzHub — Release Plan

> **Produkt:** app.candlescope.de — Persönlicher FinanzHub mit Multibanking  
> **Desktop-App Launch:** 8. Juni 2026  
> **Online-Version Public Launch:** Ziel 1. Dezember 2026  
> **Stand:** 26. April 2026

---

## Zeitleiste auf einen Blick

```
Apr 26  ──────────────────────────────────────────────────── Dez 1
│                                                            │
│  Mai         Jun         Jul         Aug    Sep    Okt    Nov    Dez
│  ████████████░░░░░░░░████████████████░░░░░░░░░░░░░░████████░░░░░███
│  Phase 1     ↑        Phase 2         Phase 3   Phase 4  Phase 5 LAUNCH
│              Desktop-
│              App Launch
│              8.6.
│
```

| Phase | Name | Start | Ende | Ziel |
|-------|------|-------|------|------|
| 1 | Fundament + Shell + Auth | 26. Apr | 31. Mai | App läuft, Login funktioniert |
| 2 | Core Features | 1. Jun | 31. Jul | Dashboard, Konten, Transaktionen |
| 3 | Erweiterungen | 1. Aug | 31. Aug | Ziele, Verträge, Archiv, Postbox |
| 4 | Multibanking (finAPI) | 1. Sep | 30. Sep | Echte Bankdaten, Auto-Import |
| 5 | Legal & Polish | 1. Okt | 30. Nov | DSGVO, WCAG AA, Beta → Launch |
| **Launch** | **Public Launch** | **1. Dez 2026** | | |

---

## Phase 1 — Fundament + Shell + Auth (26. Apr – 31. Mai)

**Ziel:** Ein vollständig funktionierendes Login-System auf einem soliden technischen Fundament.

### Meilensteine

| # | Wann | Was | Prüfzeichen |
|---|------|-----|-------------|
| M1.1 | KW 18 (26.4–2.5) | SCSS-System fertig, App startet, TokenTestPage | ✅ **Erledigt** |
| M1.2 | KW 19 (3.5–9.5) | AppShell: Rail + ContextBar + FAB als Skeleton | |
| M1.3 | KW 19–20 | Command Palette (⌘K) voll funktionsfähig | |
| M1.4 | KW 20–21 | LoginPage + RegisterPage (Form + Validation) | |
| M1.5 | KW 21–22 | 2FA Setup + Verify-Flow (TOTP) | |
| M1.6 | KW 22 | Auth Backend: Register, Login, Logout, Refresh | |
| M1.7 | KW 22–23 | E-Mail-Verifikation (Resend) | |
| M1.8 | KW 23 | AuthGuard + Router vollständig verbunden | |
| M1.9 | KW 23 | **Integration-Test:** Register → Login → 2FA → Dashboard | |

### Technische Deliverables
- `AppShell.tsx` mit Icon Rail (56px collapsed / 220px expanded)
- `ContextBar.tsx` (Floating, Blur, Gold-Border)
- `CommandPalette.tsx` (⌘K / Ctrl+K, Overlay)
- `QuickAddFab.tsx` (+ Button, Action-Stack)
- `LoginPage.tsx` + `RegisterPage.tsx` + beide Forms (RHF + Zod)
- `TwoFASetupPage.tsx` + `TwoFAVerifyPage.tsx`
- Backend: `/api/financeboard/auth/*` (4 Endpunkte)
- Datenbank-Migration: `001_initial_schema.sql`

### Definition of Done — Phase 1
- [ ] Register → E-Mail kommt an → Verifikation klappt
- [ ] Login mit falschen Daten → korrekte Fehlermeldung
- [ ] 2FA: QR-Code scannen → TOTP eingeben → Zugang
- [ ] Nicht eingeloggt → `/app/dashboard` → redirect `/login`
- [ ] JWT-Refresh funktioniert ohne neuen Login
- [ ] Row Level Security: Nutzer A sieht keine Daten von Nutzer B

---

## Phase 2 — Core Features (1. Jun – 31. Jul)

**Ziel:** Die App ist nutzbar — Konten, Transaktionen und Dashboard mit echten Daten.

### Meilensteine

| # | Wann | Was |
|---|------|-----|
| M2.1 | 1.–14. Jun | DashboardPage: NetWorthHero + CashFlowPair |
| M2.2 | 15.–21. Jun | DashboardPage: UpcomingBills + SpendingDonut |
| M2.3 | 22.–28. Jun | DashboardPage: SmartInsights (Placeholder-Logik) |
| M2.4 | 1.–10. Jul | AccountsPage (CRUD) + Backend |
| M2.5 | 11.–20. Jul | TransactionsPage (Liste + Filter + Quick-Add) + Backend |
| M2.6 | 21.–31. Jul | AnalyticsPage: Candlestick-Chart (Jahresansicht) |

### Technische Deliverables
- 5 Dashboard-Cards als eigenständige Komponenten
- `AccountsPage` mit Konto-Cards, Bank-Groups, Saldo
- `TransactionsPage` mit Filter-Bar, Quick-Add, Edit-Modal
- `AnalyticsPage` mit OHLC-Jahreschart (lightweight-charts)
- Backend: `/api/financeboard/accounts`, `/api/financeboard/transactions`, `/api/financeboard/dashboard/summary`
- Datenbank-Migration: `002_accounts_and_transactions.sql`

### Definition of Done — Phase 2
- [ ] Dashboard lädt mit echten Daten (aus der DB)
- [ ] Neue Transaktion hinzufügen → sofort im Dashboard sichtbar
- [ ] Candlestick-Chart rendert korrekt für ein volles Jahr
- [ ] Mobile (375px): alle Seiten bedienbar

---

## Phase 3 — Erweiterungen (1. Aug – 31. Aug)

**Ziel:** Alle geplanten Seiten fertig — auch wenn manche noch mit Mock-Daten laufen.

| # | Feature | Backend nötig |
|---|---------|--------------|
| GoalsPage | Sparziele mit Fortschrittsbalken | ✅ |
| ContractsPage | Verträge + Fälligkeiten | ✅ |
| ArchivePage | Dokumenten-Upload (R2) | ✅ |
| PostboxPage | Benachrichtigungen | ✅ |
| SettingsPage | Profil + Sicherheit + DSGVO-Export | ✅ |
| DevicesPage | Geräteverwaltung + Trust | ✅ |

### Definition of Done — Phase 3
- [ ] DSGVO-Export: JSON-Download aller Nutzerdaten
- [ ] Account-Löschung: alle Daten weg (cascading deletes)
- [ ] File-Upload Archiv: funktioniert mit Cloudflare R2
- [ ] Alle Seiten: Mobile + Light + Dark vollständig

---

## Phase 4 — Multibanking / finAPI (1. Sep – 30. Sep)

**Ziel:** Echte Bankdaten automatisch importieren und kategorisieren.

### Voraussetzung (vor Phase 4)
- [ ] finAPI Developer-Account anlegt → developer.finapi.io
- [ ] finAPI OAuth2-Client-ID und Secret in ENV-Vars hinterlegt
- [ ] Cloudflare R2 Bucket für Archiv angelegt

### Meilensteine

| # | Was |
|---|-----|
| M4.1 | finAPI SDK Setup + ENV-Vars + TypeScript-Typen |
| M4.2 | BankingPage: Bank-Suche + Consent-Flow UI |
| M4.3 | Backend: finAPI-Proxy-Endpunkte (`/api/financeboard/banking/*`) |
| M4.4 | Auto-Import: Transaktionen aus verbundenen Konten |
| M4.5 | Auto-Kategorisierung (regelbasiert + finAPI-Kategorien) |
| M4.6 | Subscription-Detector (erkennt Abos aus Transaktionsmustern) |
| M4.7 | Sync-Status UI + manueller Sync-Button |

### Definition of Done — Phase 4
- [ ] Consent-Flow: Demo-Bank verbunden → Transaktionen importiert
- [ ] Automatische Kategorisierung für >70% der Transaktionen
- [ ] Subscription-Detector: mindestens 5 Abo-Typen erkannt
- [ ] Sync-Fehler (Bank offline): saubere Fehlermeldung im UI
- [ ] finAPI-Daten isoliert (Nutzer A sieht nie Daten von Nutzer B)

---

## Phase 5 — Legal & Polish (1. Okt – 30. Nov)

**Ziel:** Launch-ready. Rechtlich sauber, zugänglich, stabil.

### Rechtliches (Oktober)

| Aufgabe | Wer | Deadline |
|---------|-----|----------|
| Datenschutzerklärung (DSGVO + finAPI-spezifisch) | Anwalt | 1. Okt |
| AGB | Anwalt | 1. Okt |
| Cookie-Banner (DSGVO-konform) | Dev | 15. Okt |
| Impressum erweitern (finAPI-TPP-Hinweis) | Dev | 15. Okt |
| Finanz-Disclaimer auf allen Seiten | Dev | 15. Okt |

### Technisches (Oktober–November)

| Aufgabe | Priorität |
|---------|-----------|
| WCAG AA Accessibility-Audit | Hoch |
| Keyboard-Navigation vollständig | Hoch |
| ARIA-Labels + Screen-Reader-Test | Hoch |
| Performance-Audit (Lighthouse > 90) | Mittel |
| Error-Boundary-Strategie (Sentry) | Mittel |
| Rate-Limiting verschärfen (Brute-Force-Schutz) | Hoch |
| Push-Benachrichtigungen (Web Push API) | Niedrig |

### Beta-Phase (November)

| # | Was | Wann |
|---|-----|------|
| Beta 1 | 10–20 eingeladene Tester | 1. Nov |
| Feedback-Runde 1 | Bugs + UX-Probleme | 7.–14. Nov |
| Beta 2 | 50 Tester | 15. Nov |
| Feedback-Runde 2 | Stabilisierung | 21.–28. Nov |
| Release Candidate | Freeze → nur noch Bugfixes | 29. Nov |
| **Go / No-Go Entscheidung** | | **30. Nov** |

### Definition of Done — Phase 5 / Launch-Ready
- [ ] Datenschutzerklärung + AGB live (rechtlich geprüft)
- [ ] DSGVO-Export + Lösch-Funktion getestet
- [ ] Lighthouse Score: Performance >90, Accessibility >90
- [ ] Kein offenes P1/P2-Bug im Issue-Tracker
- [ ] Rate-Limiting: alle Auth-Endpunkte geschützt
- [ ] SSL: A+ Rating (SSLLabs)
- [ ] finAPI Produktions-Zugang beantragt + erhalten
- [ ] E-Mail-Templates (Verifikation, Passwort-Reset, 2FA) getestet

---

## Launch-Tag (1. Dezember 2026)

### Checkliste Launch-Tag

**Morning (9:00 Uhr)**
- [ ] Vercel Production Deploy aus `main` Branch
- [ ] `app.candlescope.de` DNS propagiert + HTTPS ok
- [ ] Smoke-Test: Register → Login → Dashboard (Produktions-URL)
- [ ] Monitoring aktiv: Sentry, Vercel Analytics

**Kommunikation (12:00 Uhr)**
- [ ] Website `candlescope.de` → Banner "Jetzt kostenlos testen"
- [ ] E-Mail an Warteliste (falls aufgebaut)
- [ ] Social Media (falls geplant)

**Bereitschaft (den ganzen Tag)**
- [ ] Chris (Entwickler) erreichbar für Hotfixes
- [ ] Rollback-Plan bereit: vorheriges Vercel-Deployment pinnen

---

## Nicht-Development-Tasks (parallel zur Entwicklung)

| Aufgabe | Deadline | Status |
|---------|----------|--------|
| finAPI Developer-Account anlegen | Vor Phase 4 (Sep) | ⬜ |
| Anwalt kontaktieren (AGB + DSGVO) | August 2026 | ⬜ |
| Cloudflare R2 Bucket für Archiv | Vor Phase 3 (Aug) | ⬜ |
| Vercel Projekt `app.candlescope.de` konfigurieren | Vor Phase 2 (Jun) | ⬜ |
| E-Mail-Templates designen | Vor Phase 1 Ende (Mai) | ⬜ |
| Preismodell festlegen (Freemium-Limit) | Juli 2026 | ⬜ |
| Warteliste aufbauen (opt.) | Jetzt | ⬜ |
| Beta-Tester rekrutieren | September 2026 | ⬜ |

---

## Risiken & Mitigationen

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| finAPI Onboarding dauert länger als geplant | Mittel | Hoch | Früh anfangen (Sep), Demo-Modus für Tests |
| Anwalt für AGB/DSGVO verzögert sich | Mittel | Hoch | Kontakt im August, nicht Oktober |
| Scope Creep — Feature-Inflation | Hoch | Mittel | Hartes Feature-Freeze ab Oktober |
| Neon DB Performance bei vielen Nutzern | Niedrig | Hoch | Load-Test vor Launch |
| Desktop-Launch 8.6. bringt viel Support-Aufwand | Mittel | Mittel | Klare Trennung Desktop ≠ Web in Support-FAQ |
| Sicherheitslücke in JWT/Auth-Flow | Niedrig | Sehr hoch | Externes Auth-Audit Oktober |

---

## Erfolgsmessung nach Launch

| Metrik | Ziel nach 30 Tagen | Ziel nach 90 Tagen |
|--------|-------------------|-------------------|
| Registrierte Nutzer | 200 | 1.000 |
| DAU (Daily Active Users) | 30 | 200 |
| Verbundene Bankkonten (finAPI) | 50 | 300 |
| Retention Day-7 | >40% | >40% |
| NPS Score | >30 | >40 |
| Lighthouse Performance | >90 | >90 |
| Uptime | >99.5% | >99.5% |

---

## Budget-Zusammenfassung (Launch-Jahr)

| Position | Kosten |
|----------|--------|
| Anwalt: AGB + Datenschutz | 500–2.000 € |
| Vercel Pro (7 Monate) | ~140 € |
| Neon PostgreSQL Launch (7 Monate) | ~125 $ |
| Resend E-Mail (7 Monate) | ~70 $ |
| finAPI Developer (kostenlos bis Produktionslizenz) | 0 € |
| Domain-Kosten | ~7 € |
| **Gesamt bis Launch** | **ca. 800–2.400 €** |

---

*Erstellt: 26. April 2026 — Wird nach jedem Phasen-Abschluss aktualisiert*
