# CandleScope FinanceBoard v2 — Claude-Arbeitsregeln

## Session-Start (PFLICHT)

**Zu Beginn jeder Session `CLAUDE_SESSION.md` lesen** — dort steht welche Phasen erledigt sind, was offen ist und der nächste konkrete Schritt.

### `CLAUDE_SESSION.md` updaten — wann?

| Trigger | Aktion |
|---|---|
| Phase / Schritt abgeschlossen | Stand updaten + in PLAN.md als ✅ markieren |
| Neue Architektur-Entscheidung | Unter "Wichtige Entscheidungen" ergänzen |
| Neue offene Aufgabe entdeckt | Ergänzen |
| Kontext wird voll | Sofort updaten |

Befehl: `/project:session`

---

## Agenten-System

### Rollen

| Rolle | subagent_type | Zuständigkeit |
|---|---|---|
| `orchestrator` | `general-purpose` | Zerlegt Phasen, koordiniert alle anderen |
| `architecture-agent` | `feature-dev:code-architect` | Systemdesign, Tauri-Commands, DB-Schema |
| `frontend-agent` | `general-purpose` | React-Komponenten, CSS Modules, Pages |
| `rust-agent` | `general-purpose` | Tauri-Commands in src-tauri/, Rust-Code |
| `db-agent` | `general-purpose` | SQLite-Schema, Migrations, Queries in lib/ |
| `code-review-agent` | `feature-dev:code-reviewer` | Code-Qualität, CLAUDE.md-Konformität |
| `debug-agent` | `general-purpose` | Bug-Analyse, Fix |
| `explorer` | `Explore` | Codebase durchsuchen, Muster finden |

### Workflow-Ketten

**Neue Feature-Seite:**
```
architecture-agent → frontend-agent → code-review-agent
```

**DB + Store + Logic:**
```
architecture-agent → [db-agent ∥ frontend-agent] → code-review-agent
```

**Tauri-Feature (Rust + Frontend):**
```
architecture-agent → [rust-agent ∥ frontend-agent] → code-review-agent
```

**Phase starten:**
```
orchestrator
  architecture-agent (Phase lesen aus docs/05-phases.md)
  ├── [db-agent ∥ rust-agent ∥ frontend-agent] parallel
  └── code-review-agent → typecheck + test + lint
```

---

## Custom Commands

| Command | Auslöser | Aktion |
|---|---|---|
| `/project:session` | Session-State sichern | CLAUDE_SESSION.md + PLAN.md updaten |
| `/project:phase` | Nächste Phase starten | docs/05-phases.md lesen → orchestrator → Agents |
| `/project:feature` | Neue Komponente / Feature | architecture-agent → frontend-agent → review |
| `/project:fix` | Bug oder Fehler | debug-agent → code-review-agent |
| `/project:review` | Code-Qualitätsprüfung | code-review-agent + typecheck + test + lint |

---

Offline-first Desktop + Mobile Finanzverwaltung.
Keine Cloud, keine Telemetrie, keine externen Server.

**Stack:** Tauri v2 · React 19 · TypeScript 5 · Vite 6 · Zustand 5 · SQLite · CSS Modules

---

## Sprache

Immer Deutsch mit dem User kommunizieren.

---

## Projektdokumentation

Alle Planungsdokumente liegen im `docs/` Ordner:

| Datei | Inhalt |
|-------|--------|
| `docs/01-architecture.md` | Tech-Stack, Ordnerstruktur, Modulregeln |
| `docs/02-data-model.md` | TypeScript-Typen, SQLite-Schema, Migrations |
| `docs/03-design-system.md` | Tokens, Themes, CSS-Module-Pattern |
| `docs/04-features.md` | Alle 10 Seiten mit vollständigem Feature-Umfang |
| `docs/05-phases.md` | Bauphasen 0–6 mit konkreten Schritten |
| `docs/06-mobile.md` | Mobile-Strategie, Breakpoints, Touch-Regeln |
| `docs/07-rules.md` | Kritische Regeln, Anti-Patterns aus v1 |

---

## Befehle

```bash
# Development
npm run dev              # Tauri Dev-Mode mit HMR
npm run dev:web          # Web-Preview ohne Tauri (Browser)

# Qualitätssicherung — PFLICHT nach jeder Implementierungsrunde
npm run typecheck        # tsc --noEmit
npm run test             # Vitest Unit + Integration
npm run lint             # ESLint

# Build
npm run build:win        # Windows NSIS Installer → dist/
npm run build:mac        # macOS DMG + ZIP (nur auf macOS)
npm run build:ios        # iOS (Xcode, nur macOS)
npm run build:android    # Android (Android Studio)

# Icons & Assets
npm run gen-icons        # Icon-Set aus assets/icon.png (1024×1024)
```

**Kein Step gilt als fertig bis `typecheck` + `test` + `lint` alle grün sind.**

---

## Dateigrössen-Regel

| Dateityp | Maximum | Bei Überschreitung |
|----------|---------|-------------------|
| Page-Komponente | 300 Zeilen | In Sub-Komponenten aufteilen |
| UI-Komponente | 150 Zeilen | Zu groß → aufteilen |
| Store | 200 Zeilen | Zweiten Store erstellen |
| `lib/`-Modul | 250 Zeilen | Separates Modul |
| CSS Module | 150 Zeilen | Aufteilen |

---

## Architektur auf einen Blick

```
src/
├── pages/          # 1 Datei = 1 Seite, max 300 Zeilen
├── components/
│   ├── layout/     # Shell, Sidebar, Topbar, Nav
│   ├── ui/         # Primitive: Button, Input, Modal, Toast
│   ├── charts/     # Chart-Wrapper
│   └── finance/    # Domain-Komponenten
├── modals/         # Feature-Modals
├── stores/         # Zustand — 1 Store pro Domäne
├── lib/            # Pure TypeScript — kein React, kein DOM
├── hooks/          # Custom Hooks
├── types/          # TypeScript-Typen
└── styles/
    ├── tokens.css  # Design-Tokens (einzige globale Datei)
    ├── themes/     # 1 Datei pro Theme
    └── global.css
```

---

## Kritische Regeln (kurz)

1. `lib/` hat kein React — testbar ohne DOM
2. Stores haben kein JSX — nur State + Actions
3. CSS Module pro Komponente — keine globalen Klassen außer `tokens.css`
4. SQLite = einzige Quelle der Wahrheit — kein localStorage als Datenhaltung
5. Bookings nie direkt mutieren — immer über `generateBookings()` regenerieren
6. Kein `any` ohne Kommentar — TypeScript strict
7. Kein `window.*` direkt — alles über `invoke()` oder Stores
8. `fm()` inkludiert " €" — nie danach `+ " €"` schreiben
9. Mobile-First — jede Komponente muss auf 480px funktionieren
10. `typecheck + test` = Pflicht — kein Merge ohne grüne Checks

**Vollständige Regeln:** `docs/07-rules.md`

---

## Memory-Update-Pflicht

Nach jeder abgeschlossenen Phase:
1. `PLAN.md` — Phase als `✅ Fertig` markieren
2. Memory-Projektdatei aktualisieren
3. `docs/03-design-system.md` — nach jeder Token/Komponenten-Änderung syncen
