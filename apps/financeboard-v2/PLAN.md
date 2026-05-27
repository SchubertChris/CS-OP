# FinanceBoard v2 — Master-Plan

> Vollständiger Neubau. Gleiche Features, moderner Stack, Desktop + Mobile.
> Stand: 2026-05-14

---

## Ziel

Eine Offline-first Finanzverwaltungs-App die auf Windows, macOS, Linux, iOS und Android
aus einer einzigen Codebase läuft. Kein Wartungschaos, keine riesigen Dateien,
vollständig typsicher und testbar.

---

## Status

| Phase | Beschreibung | Status |
|-------|-------------|--------|
| **Phase 0** | Projekt-Scaffold + Dev-Environment | ⬜ Offen |
| **Phase 1** | Datenbank + Core-Logik + Shell | ⬜ Offen |
| **Phase 2** | Dashboard + Transaktionen | ⬜ Offen |
| **Phase 3** | Planung (Jahresanalyse, Verträge, Ziele, Kreditoren) | ⬜ Offen |
| **Phase 4** | System-Seiten (Einstellungen, Pivot, Archiv) | ⬜ Offen |
| **Phase 5** | Extras (VisionBoard, Suche, Tutorial, Import/Export) | ⬜ Offen |
| **Phase 6** | Mobile (iOS + Android, BottomNav, Touch) | ⬜ Offen |

---

## Dokumentation

- [01 — Architektur](docs/01-architecture.md) — Stack, Ordnerstruktur, Modulregeln
- [02 — Datenmodell](docs/02-data-model.md) — TypeScript-Typen + SQLite-Schema
- [03 — Design-System](docs/03-design-system.md) — Tokens, Themes, CSS-Patterns
- [04 — Features](docs/04-features.md) — Alle 10 Seiten vollständig dokumentiert
- [05 — Phasenplan](docs/05-phases.md) — Konkrete Bauschritte pro Phase
- [06 — Mobile](docs/06-mobile.md) — Mobile-Strategie + Tauri Mobile
- [07 — Regeln](docs/07-rules.md) — Kritische Regeln + Anti-Patterns aus v1

---

## Aktueller Stand

**Nächster Schritt:** Phase 0 starten — Tauri v2 + React + TypeScript Scaffold aufsetzen.
Siehe `docs/05-phases.md` → Phase 0.
