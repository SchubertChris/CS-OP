# CandleScope — Monorepo Arbeitsregeln

## Projekte
- `apps/frontend` — Website (candlescope.de)
- `apps/financehub` — Online-App (app.candlescope.de) ← aktiver Fokus
- `apps/vaultbox` — Offline Desktop-App VaultBox (**aktiv**: 06/2026 Zero-Knowledge-Verschlüsselung + Ed25519-Lizenz umgesetzt; Design-Pass der neuen UI folgt)
- `api/financehub/` — Vercel Functions für die App
- `packages/shared` (`@candlescope/shared`) — plattformunabhängige Business-Logik: Types, API-Client, Utils (Web + Desktop + Mobile teilen dieses Package)

## Docs-Struktur
- `/docs/` — produktübergreifende Dokumente (Roadmap, Kosten, Rechts, Wettbewerb, Cross-Platform-Architektur)
- `apps/financehub/docs/` — App-spezifische Dokumente (Feature-Specs, Design-System, WORKPLAN)

## Sprache
Immer Deutsch mit dem User kommunizieren.

## Erklär-Modus — IMMER (Chris lernt mit)
Chris will Coden besser verstehen, Fachbegriffe lernen und Fehler früher selbst sehen.
- Nach **jeder abgeschlossenen Aufgabe** einen kurzen, einfachen Eintrag an `claude_explain.md` (Repo-Root) anhängen: WAS gemacht, WARUM, welche Begriffe.
- In **normalem Deutsch** erklären — kein Fachbegriff ohne kurze Erklärung.
- Neue Begriffe ins „Begriffe-Lexikon" in `claude_explain.md` aufnehmen.

## Memory-Update-Pflicht — IMMER nach jeder Tätigkeit

Nach **jeder abgeschlossenen Aufgabe** MUSS ich folgendes aktualisieren:

### 1. WORKPLAN.md — sofort nach jedem Step
Datei: `apps/financehub/docs/WORKPLAN.md`
- Abgeschlossener Step → `⬜ Offen` auf `✅ Fertig` setzen
- "Aktueller Stand" + "Nächster Schritt" am Ende aktualisieren
- Niemals einen Step als fertig markieren ohne dass er wirklich funktioniert (Build muss clean sein)

### 2. Memory-Projektdatei — nach jeder Session mit Substanz
Datei: `C:\Users\Dezent\.claude\projects\c--Users-Dezent-Desktop-CANDLESCOPE-Candlescope-Webseite-26-04-2026\memory\project_financehub_plan.md`
Aktualisieren wenn:
- Neues System hinzugefügt (Grid, Animations, Auth, ...)
- Neue Komponenten oder Tokens implementiert
- Architektur-Entscheidung getroffen
- Phase abgeschlossen

### 3. Design-System-Doc — nach jeder Token/Komponenten-Änderung
Datei: `apps/financehub/docs/02-design-system.md`
**Sync-Regel:** Jede Änderung an `_tokens.scss`, `_mixins.scss`, `_animations.scss` oder Shared Components MUSS sofort in der Doku gespiegelt werden. Kein "später dokumentieren".

## Build-Regel
Nach jeder Implementierungsrunde: `npx tsc --noEmit` + `npx vite build` im `apps/financehub` Verzeichnis.
Kein Step gilt als abgeschlossen bis der Build clean ist.

## Dev-Workflow für neue Features (FinanzHub)
Jedes Feature wird zuerst in der Dev-Sandbox (`/dev`) gebaut und getestet — nie direkt in der App.
Erst wenn es fertig und über alle Themes getestet ist, wird es in den richtigen Feature-Ordner verschoben.
Details: `apps/financehub/CLAUDE.md` → Abschnitt "Dev-Workflow"

## Theme-Switching
Alle Theme-Änderungen NUR über `applyTheme()` / `applyThemeFull()` aus `src/utils/theme.ts`.
Kein direktes classList manipulieren — der View-Transition-Wipe funktioniert sonst nicht.

## Keine Kommentare im Code
Nur wenn das WHY nicht-offensichtlich ist (versteckte Constraints, Workarounds). Nie das WHAT erklären.
