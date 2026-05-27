# FinanzHub — Session-State

> **Letztes Update:** 2026-05-22 | **Deadline:** Desktop-App Launch 8. Juni 2026 (17 Tage)  
> **Live:** app.candlescope.de | **Vercel-Projekt:** cs-financehub

---

## Implementierungsstand

### ✅ Phase 0 — Design System (komplett)
- SCSS Token-System (120+ Tokens, 7 Themes, fluid clamp)
- 21 Shared Components (Button, Card, Badge, Avatar, …)
- Theme-System + View-Transition-Wipe (`applyThemeFull`)
- Grid-Mixins, Animation-System (17 Keyframes), Tooltip-System
- Dev-Sandbox (`/dev`), Token-Test-Seite (`/test/tokens`)
- Alle Layout-Prototypen in DevSandboxPage

### ✅ Phase 1 Frontend (komplett)
- AppShell: Pill-Nav + Radial-Ring + CmdPalette + StatusBar + NotifPanel + UserMenu
- ShellStore mit `openModal: ModalKey` + zentralem Backdrop in AppShell.module.scss
- 5 Ring-Modals vollständig extrahiert: BuchungsModal, DruckVorschau, NotizModal, ExportModal, TeilenModal
- LoginPage + RoleSelectorPage + DevGate + IntroAnimation (3D-Tunnel, 7 Themes)
- AuthGuard (4 Guards), Admin-TOTP komplett verdrahtet
- DashboardPage Steps 9–13: NetWorthCard, CashFlow, UpcomingPayments, SpendingDonut, SmartInsights ✅

### ✅ packages/shared (komplett)
- 27 Domain-Type-Dateien: Account, Transaction, Goal, Contract, Budget, …
- `formatCurrency`, `formatDate`, alle Utility-Funktionen
- `@candlescope/shared` in financehub eingebunden (`workspace:*`)

### ⬜ Phase 1 Backend (OFFEN — KRITISCH für 8.6.)
- [ ] Step 5: 2FA Setup + Verify Pages (TOTP-Flow UI)
- [ ] Step 6: Auth-Backend (Register/Login/Logout/Refresh) → `api/financehub/auth/`
- [ ] Step 7: 2FA-Backend (TOTP Setup/Verify)
- [ ] Step 8: DB-Schema (Neon PostgreSQL) + Row-Level-Security

### ⬜ Phase 2 Core Features (OFFEN)
- [ ] Step 14: AccountsPage (`/app/accounts`) — Konto-Cards, CRUD
- [ ] Step 15: TransactionsPage (`/app/transactions`) — Liste + Filter + Quick-Add
- [ ] Step 16: AnalyticsPage (`/app/analytics`) — Candlestick-Chart (lightweight-charts)
- [ ] Step 17: Kategorien-System (DB + API)
- [ ] Step 18: SettingsPage (Profil + Sicherheit + DSGVO)

---

## Kritischer Pfad bis 8. Juni 2026

**Priorität 1 — Muss fertig sein:**
1. DB-Schema (Step 8) → blockiert alles andere
2. Auth-Backend (Step 6) + 2FA-Backend (Step 7)
3. AccountsPage mit echten Daten (Step 14)

**Priorität 2 — Soll fertig sein:**
4. TransactionsPage (Step 15)
5. SettingsPage Basis (Step 18)

**Priorität 3 — Nice to have:**
6. AnalyticsPage (Step 16)

---

## Wichtige Architektur-Entscheidungen

| Entscheidung | Details |
|---|---|
| **Modal-Pattern** | Zentral in AppShell.tsx via `useShellStore` — kein eigenständiger Backdrop in Modal-Komponenten |
| **Backend deferred** | Steps 5–8 bewusst zurückgestellt bis Core-Features stehen — jetzt dran |
| **Registrierung gesperrt** | Kein Public-Register — nur `info@candlescope.de` Einladung |
| **Auth via Admin-API** | Proxy-Endpunkte in `api/admin/` für CORS-Fix |
| **Shared Types** | NUR aus `@candlescope/shared` — nie lokal in src/ definieren |
| **Themes** | 7 Stück — jedes neue Feature muss alle 7 durchlaufen (Dev-Sandbox!) |
| **Build-Cmd Vercel** | `pnpm --filter @candlescope/financehub build` |

---

## Offene Aufgaben (nicht-Dev)

- [ ] Vercel Projekt `app.candlescope.de` mit Neon-DB-ENV-Vars konfigurieren (vor Phase 2, Jun)
- [ ] E-Mail-Templates designen (Verifikation, Passwort-Reset, 2FA) — vor Phase 1 Ende Mai
- [ ] Preismodell festlegen (Freemium-Limit) — Juli 2026
