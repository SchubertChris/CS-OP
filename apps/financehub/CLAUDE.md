# FinanzHub — Arbeitsregeln (apps/financehub)

## Stack
React 19 + TypeScript + Vite + SCSS Modules + React Router v7 + Zustand + TanStack Query

## Schriften
`--font-display` + `--font-body` = **Geist** | `--font-mono` = **Geist Mono**
NICHT Space Grotesk, NICHT DM Sans — die sind falsch.

## Wichtigste Dateien
- `src/styles/_tokens.scss` — Single Source of Truth für alle Design-Tokens
- `src/styles/_animations.scss` — Keyframes + Utility-Klassen + Stagger
- `src/styles/_mixins.scss` — Grid-Mixins, Glass, Card, Flex-Shortcuts
- `src/styles/_interactions.scss` — Tooltip CSS-only, Focus, Touch, Scroll
- `docs/02-design-system.md` — vollständige Design-System-Doku (muss sync mit Code bleiben)
- `docs/WORKPLAN.md` — Phase-Tracking (nach jedem Step aktualisieren)

## Nach JEDER abgeschlossenen Aufgabe

1. **WORKPLAN.md updaten** — Step auf ✅, "Nächster Schritt" aktualisieren
2. **17-routing.md updaten** — bei JEDER Route-Änderung (neue Route, auskommentiert, freigeschaltet)
3. **02-design-system.md updaten** — wenn Tokens, Mixins oder Komponenten geändert
4. **Memory updaten** — `C:\Users\Dezent\.claude\projects\...\memory\project_financehub_plan.md` wenn größeres System hinzugefügt
5. **Build prüfen** — `npx tsc --noEmit && npx vite build`

## Token-Regeln
- Niemals hardcodierte Farben in Komponenten — immer `var(--cs-*)`
- Neue Tokens immer in `_tokens.scss` definieren, niemals inline
- Tooltip: immer `var(--tooltip-*)` — nicht `var(--cs-anthracite)` direkt
- Button-Border primary: `var(--cs-gold-muted)` — nicht hardcodiert rgba

## Grid-Regeln
- Grid-Layouts immer via `@include grid-*` Mixins — nie inline `grid-template-columns` im TSX
- Atemraum ist Default — dichte Layouts nur wenn User es explizit will

## Animations-Regeln
- Hierarchie: `--anim-hero` (700ms) → `--anim-section` (450ms) → `--anim-card` (320ms) → `--anim-micro` (180ms)
- Stagger immer via `.stagger-N` Klassen oder `[data-stagger="N"]` Attribut
- Nie animieren: bereits sichtbare Texte, Error-Messages, Navigation-Hover

## Komponenten-Pfade
- Shared: `src/shared/components/[Name]/[Name].tsx` + `[Name].module.scss`
- Features: `src/features/[feature]/components/` + `pages/`
- Layout: `src/layout/[Name]/[Name].tsx`

## Logo
`src/shared/components/Logo/CandlescopeLogo.tsx`
- Default color: `var(--cs-gold)` — theme-adaptiv
- Auf Gold-BG (Rail logoMark, Modal brandMark): `color="#1A1410"`

## Dev-Workflow — PFLICHT für jedes neue Feature

**Jedes Feature wird zuerst in der Dev-Sandbox gebaut, nie direkt in der App.**

```
1. /dev öffnen (localhost:5173/dev)
2. Feature-Code direkt in DevSandboxPage.tsx → in <div className={styles.canvasInner}> einfügen
3. Alle 6 Themes testen: Light, Dark, Ocean, Forest, Rose, Midnight
4. Design-System-Komponenten dokumentieren die das Feature nutzt
5. Feature abgesegnet → verschieben nach src/features/[name]/
6. Route in router/index.tsx freischalten
7. WORKPLAN.md Step auf ✅ setzen
```

**Sandbox-Datei:** `src/features/dev/DevSandboxPage.tsx`  
**Theme-Utility:** `src/utils/theme.ts` → `applyThemeFull(base, accent)` — immer für Theme-Switches nutzen, nie direktes classList manipulieren (sonst kein Wipe-Effekt)

## Theme-Switching Regel
Alle Theme-Änderungen NUR über `applyTheme()` oder `applyThemeFull()` aus `src/utils/theme.ts`.
Kein direktes `document.documentElement.classList.add/remove` — der View-Transition-Wipe funktioniert sonst nicht.
