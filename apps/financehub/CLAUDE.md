# FinanzHub — Arbeitsregeln (apps/financehub)

## Session-Start (PFLICHT)

**Zu Beginn jeder Session `CLAUDE_SESSION.md` lesen** — dort steht der aktuelle Implementierungsstand, offene Aufgaben und der kritische Pfad bis 8. Juni 2026.

### `CLAUDE_SESSION.md` updaten — wann?

| Trigger | Aktion |
|---|---|
| Feature / Step abgeschlossen | Stand updaten, Step aus "Offen" streichen |
| Neue Architektur-Entscheidung | Unter "Wichtige Entscheidungen" ergänzen |
| Neue offene Aufgabe entdeckt | Unter "Offene Aufgaben" ergänzen |
| Vor Commit | Kurzer Check: ist alles aktuell? |
| Kontext wird voll | Sofort updaten bevor Details verloren gehen |

Befehl: `/project:session`

---

## Agenten-System

### Rollen

| Rolle | subagent_type | Zuständigkeit |
|---|---|---|
| `orchestrator` | `general-purpose` | Zerlegt große Tasks, koordiniert alle anderen |
| `architecture-agent` | `feature-dev:code-architect` | Systemdesign, Interfaces, Dateistruktur |
| `frontend-agent` | `general-purpose` | React-Komponenten, SCSS Modules, Pages |
| `backend-agent` | `general-purpose` | API-Routes, Auth, Middleware |
| `database-agent` | `general-purpose` | DB-Schema, Migrations, RLS-Policies |
| `code-review-agent` | `feature-dev:code-reviewer` | Code-Qualität, Bugs, CLAUDE.md-Konformität |
| `debug-agent` | `general-purpose` | Bug-Analyse, Fehler-Reproduktion, Fix |
| `explorer` | `Explore` | Codebase durchsuchen, Muster finden |

### Workflow-Ketten

**Neue Feature-Seite:**
```
architecture-agent → frontend-agent → code-review-agent
```

**Backend-Feature (API + DB):**
```
architecture-agent → [backend-agent ∥ database-agent] → code-review-agent
```

**Bug fixen:**
```
debug-agent → code-review-agent
```

**Full-Stack-Feature:**
```
orchestrator
  architecture-agent
  ├── frontend-agent ∥ backend-agent ∥ database-agent
  └── code-review-agent
```

### Parallel (∥) vs. Sequenziell
**Parallel** wenn Agenten unabhängige Dateien bearbeiten.  
**Sequenziell** wenn Agent B den Output von Agent A braucht.

---

## Custom Commands

| Command | Auslöser | Aktion |
|---|---|---|
| `/project:session` | Session-State sichern | CLAUDE_SESSION.md mit aktuellem Stand updaten |
| `/project:feature` | Neue Seite / Feature | architecture-agent → frontend-agent → backend-agent → review |
| `/project:fix` | Bug oder Fehler | debug-agent → code-review-agent |
| `/project:review` | Code-Qualitätsprüfung | code-review-agent über geänderte Dateien |
| `/project:sandbox` | Feature in Sandbox testen | Anleitung: DevSandboxPage → alle 7 Themes → dann verschieben |

---

> **Projekt:** `app.candlescope.de` | **Stack:** React 19 + TS + Vite + SCSS Modules + Router v7 + Zustand  
> **Stand:** 02.05.2026 | **Live:** Vercel `cs-financehub` (auto-deploy via GitHub `main`)

---

## Schriften — FEST, NICHT ÄNDERN

| Rolle | Variable | Font |
|-------|----------|------|
| Display + Body | `--font-display`, `--font-body` | **Geist** |
| Mono | `--font-mono` | **Geist Mono** |

❌ Niemals: Space Grotesk, DM Sans, JetBrains Mono — die sind falsch.

---

## Kritische Dateien

| Datei | Zweck |
|-------|-------|
| `src/styles/_tokens.scss` | Single Source of Truth — alle Design-Tokens |
| `src/styles/_mixins.scss` | Grid-Mixins (`@include grid-*`), Glass, Card |
| `src/styles/_animations.scss` | Keyframes + Stagger-Klassen |
| `src/styles/_interactions.scss` | Tooltip, Focus, Touch |
| `src/layout/AppShell/AppShell.tsx` | Shell-Root — Pill-Nav, Ring, CmdPalette, StatusBar, Modals |
| `src/layout/AppShell/AppShell.module.scss` | Shell-CSS — `.modalBackdrop`, `.cmdBackdrop` hier definiert |
| `src/store/shellStore.ts` | Globaler Shell-State — `openModal`, `ringOpen`, `cmdOpen`, etc. |
| `src/router/index.tsx` | Alle Routen + Guards |
| `docs/WORKPLAN.md` | Phase-Tracking — nach jedem Step updaten |
| `docs/17-routing.md` | Route-Dokumentation — nach jeder Route-Änderung updaten |
| `docs/02-design-system.md` | Design-System-Doku — sync mit `_tokens.scss` halten |

---

## Shell-Architektur — Regeln

### Modal-Pattern (PFLICHT)

Modals öffnen sich via `useShellStore` → `setOpenModal(key)`. Der Backdrop ist **zentral in AppShell.module.scss** definiert — nicht in jedem Modal einzeln.

```tsx
// AppShell.tsx — so ist es gebaut, so bleibt es
{openModal && (
  <div className={styles.modalBackdrop} onClick={() => setOpenModal(null)}>
    <div onClick={e => e.stopPropagation()}>
      {openModal === 'buchung' && <BuchungsModal onClose={() => setOpenModal(null)} />}
      {/* ... weitere Modals */}
    </div>
  </div>
)}
```

```scss
// AppShell.module.scss — Backdrop hier, nirgendwo sonst
.modalBackdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 300; backdrop-filter: blur(6px);
}
```

**Modal-Komponenten** rendern NUR ihren Card-Content (`<div className={styles.modal}>`) — **kein** eigenes `.backdrop`.

### Neue Modals hinzufügen

1. `ModalKey` in `shellStore.ts` erweitern
2. Komponente als Card-only bauen (kein Backdrop)
3. In AppShell.tsx einhängen
4. Ring-Action in `RADIAL_ACTIONS` ergänzen (wenn nötig)

---

## Nach JEDER abgeschlossenen Aufgabe — PFLICHT

```
1. WORKPLAN.md   → Step auf ✅, "Nächster Schritt" aktualisieren
2. 17-routing.md → bei jeder Route-Änderung (Status-Kommentar in der Tabelle)
3. 02-design-system.md → bei Token/Mixin/Komponenten-Änderungen
4. Memory        → C:\Users\Dezent\.claude\projects\...\memory\project_financehub_plan.md
                   (nur bei größeren System-Änderungen, nicht nach jedem Bugfix)
5. Build prüfen  → npx tsc --noEmit && npx vite build (im apps/financehub Verzeichnis)
6. Push          → git add [files] && git commit -m "..." && git push origin main
```

---

## Dev-Workflow — PFLICHT für jedes neue Feature

**Jedes Feature wird zuerst in der Dev-Sandbox gebaut, nie direkt in der App.**

```
1. localhost:5173/dev öffnen
2. Feature in DevSandboxPage.tsx → <div className={styles.canvasInner}> einfügen
3. Alle 7 Themes testen: Light, Dark, Ocean, Forest, Rose, Midnight + System
4. Feature fertig → in src/features/[name]/ oder src/shared/components/[Name]/ verschieben
5. Route in router/index.tsx freischalten (+ Status-Kommentar)
6. WORKPLAN.md Step auf ✅
```

**Sandbox:** `src/features/dev/DevSandboxPage.tsx` → Route `/dev`

---

## Code-Regeln

### Design-Tokens
- Niemals hardcodierte Farben — immer `var(--cs-*)`
- Neue Tokens in `_tokens.scss`, nie inline
- Tooltip: `var(--tooltip-*)` — nicht direkt auf `var(--cs-anthracite)`
- Button-Border primary: `var(--cs-gold-muted)`

### Grid & Layout
- Grid-Layouts via `@include grid-*` Mixins — nie `grid-template-columns` inline im TSX
- Atemraum ist Default — dichte Layouts nur wenn explizit gewünscht

### Animationen
- Hierarchie: `--anim-hero` (700ms) → `--anim-section` (450ms) → `--anim-card` (320ms) → `--anim-micro` (180ms)
- Stagger via `.stagger-N` oder `[data-stagger="N"]`
- Nie animieren: sichtbare Texte, Error-Messages, Navigation-Hover

### Theme-Switching
- **NUR** via `applyTheme()` / `applyThemeFull()` aus `src/utils/theme.ts`
- Kein direktes `classList.add/remove` → View-Transition-Wipe bricht sonst

### Z-Index-Skala (nie hardcoded)
```
base(1) → raised(10) → dropdown(100) → rail(200) → contextbar(210) → modal(300) → command(350) → toast(400) → tooltip(500)
```
Immer `var(--z-modal)`, `var(--z-dropdown)` etc. — nie `9999`.

### Interaction States — Pflicht-Checkliste
Jede interaktive Komponente braucht:
- `:hover` — leichte Aufhellung (surface-2 oder fill-animation)
- `:focus-visible` — 2px gold outline, offset 3px (global in `_interactions.scss`)
- `:active` — surface-active BG oder `scale(0.97)`
- `:disabled` — opacity 0.4–0.45, cursor: not-allowed

### Definition of Done — ein Feature gilt als fertig wenn:
- Alle States funktionieren: Loading, Empty, Filled, Error
- Responsive: 375px (Mobile) + 1280px (Desktop)
- Alle 7 Themes: Light, Dark, Ocean, Forest, Rose, Midnight, System
- Kein TypeScript-Fehler, kein `console.error`
- Keine hardcodierten px-Farben — nur `var(--cs-*)`
- IBAN/Beträge mit `font-mono + tabular-nums`

### Shared Types — aus `@candlescope/shared` importieren
```typescript
import type { Account, Transaction } from '@candlescope/shared'
import { formatCurrency } from '@candlescope/shared'
```
Niemals Domain-Typen lokal in `src/` definieren — sie gehören in `packages/shared/src/types/`.

---

## Komponenten-Pfade

| Typ | Pfad |
|-----|------|
| Shared | `src/shared/components/[Name]/[Name].tsx` + `[Name].module.scss` |
| Feature | `src/features/[feature]/components/` + `pages/` |
| Layout | `src/layout/[Name]/[Name].tsx` |
| Store | `src/store/[name]Store.ts` |

---

## Logo
`src/shared/components/Logo/CandlescopeLogo.tsx`
- Default: `var(--cs-gold)` — theme-adaptiv
- Auf Gold-BG: `color="#1A1410"`

---

## Build & Deploy

```bash
# Build prüfen (im apps/financehub Verzeichnis)
npx tsc --noEmit && npx vite build

# Deploy → auto via git push
git push origin main
# → Vercel baut apps/financehub automatisch → app.candlescope.de
```

**Vercel-Projekt:** `cs-financehub` | **Branch:** `main` | **Build-Command:** `pnpm --filter @candlescope/financehub build`

---

## Aktueller Stand (03.05.2026)

**Fertig:** Design System · Auth (Admin) · IntroAnimation · AppShell · 5 Ring-Modals · DashboardPage (Mock) · `packages/shared` (alle Domain-Types)  
**Nächster Step:** Step 14 — AccountsPage (`/app/accounts`)  
**Backend deferred:** Steps 5–8 (User-Auth, DB-Schema) — starten wenn Core-Features stehen
