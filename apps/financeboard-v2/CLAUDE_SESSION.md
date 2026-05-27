# FinanceBoard v2 — Session-State

> **Letztes Update:** 2026-05-22  
> **Ziel:** Offline-first Desktop + Mobile App (Tauri v2 + React 19 + SQLite)

---

## Implementierungsstand

### ✅ Scaffold vorhanden
- Tauri v2 Projektstruktur aufgesetzt
- Ordnerstruktur vollständig angelegt (`pages/`, `components/`, `stores/`, `lib/`, `types/`, `styles/`)
- 8 Zustand-Stores angelegt (accounts, categories, creditors, goals, settings, transactions, transfers, ui) — alle noch leer
- Design-Token-Datei (`styles/tokens.css`) angelegt
- Basis-Routing via TanStack React Router konfiguriert

### ⬜ Phase 0 — Projekt-Scaffold + Dev-Environment (OFFEN)
- [ ] Tauri-Capabilities konfigurieren (SQLite-Plugin, Datei-Zugriff, Window-Handling)
- [ ] SQLite-Plugin initialisieren + DB-Verbindung testen
- [ ] Design-Tokens vollständig definieren (alle `tokens.css` Werte)
- [ ] Themes implementieren (`styles/themes/`)
- [ ] Shell-Komponenten: AppShell, Sidebar, Topbar (`components/layout/`)
- [ ] Basis-UI-Komponenten: Button, Input, Modal, Toast (`components/ui/`)
- [ ] typecheck + test + lint alle grün

### ⬜ Phase 1 — Datenbank + Core-Logik + Shell (OFFEN)
- Siehe `docs/05-phases.md` → Phase 1

### ⬜ Phase 2 — Dashboard + Transaktionen (OFFEN)
### ⬜ Phase 3 — Planung (Jahresanalyse, Verträge, Ziele, Kreditoren) (OFFEN)
### ⬜ Phase 4 — System-Seiten (Einstellungen, Pivot, Archiv) (OFFEN)
### ⬜ Phase 5 — Extras (VisionBoard, Suche, Tutorial, Import/Export) (OFFEN)
### ⬜ Phase 6 — Mobile (iOS + Android, BottomNav, Touch) (OFFEN)

---

## Wichtige Architektur-Entscheidungen

| Entscheidung | Details |
|---|---|
| **Offline-first** | Kein externer Server, keine Telemetrie, kein Network-Code |
| **SQLite = Quelle der Wahrheit** | Kein localStorage als Datenhaltung |
| **lib/ hat kein React** | Reine TypeScript-Module, testbar ohne DOM |
| **Stores haben kein JSX** | Nur State + Actions — kein React in Stores |
| **CSS Modules** | Kein globales CSS außer `tokens.css` + `global.css` |
| **Mobile-First** | Jede Komponente muss auf 480px funktionieren |
| **Dateigrössen-Limit** | Page max 300 Zeilen, UI-Komponente max 150, Store max 200 |

---

## Nächster Schritt

**Phase 0 starten** — `docs/05-phases.md` → Phase 0 lesen, dann:
1. Tauri-Capabilities setzen
2. SQLite initialisieren
3. Design-Tokens + Themes definieren
4. Shell + Basis-UI bauen
