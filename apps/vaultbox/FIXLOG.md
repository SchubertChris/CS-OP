# VaultBox FIXLOG — Audit-Fixes (Branch: audit-fixes)

> Jeder Fix: Status · Datei:Zeile (verifiziert) · Commit-Hash

---

## Legende

| Status | Bedeutung |
|--------|-----------|
| `GEFIXT` | Bug reproduziert, Fix angewendet, Commit vorhanden |
| `ABWEICHEND-GEFIXT` | Bug existiert in anderer Form als beschrieben, trotzdem sinnvoll behoben |
| `ABWEICHEND` | Audit-Befund unzutreffend — kein Fix nötig, Begründung unten |
| `NICHT-REPRODUZIERBAR` | Nicht verifiziert, kein Fix |

---

## KRITISCH

| ID | Datei:Zeile | Status | Commit | Notiz |
|----|-------------|--------|--------|-------|
| K-1 | bookings.js:261,282 / state.js:686 | GEFIXT | — | toISOString() → tz-safe Pattern |
| K-2 | jahresuebersicht.js:1021 | ABWEICHEND-GEFIXT | — | css() ist via dashboard.js global verfügbar — kein ReferenceError. Trotzdem → _jcss() für Konsistenz |
| K-3 | intro.js:1038 | GEFIXT | — | sha256(pw) → _pwHash(pw) |
| K-4 | archive.js:900-906 | GEFIXT | — | document.write() → window.csf.print.html() |
| K-5 | archive.js:76 | GEFIXT | — | cat.color in innerHTML → esc(cat.color) |
| K-6 | visionboard.js:1620-1622 | GEFIXT | — | keydown-Handler per addPage/removePage cleanup |
| K-7 | modal.css:33 | GEFIXT | — | .overlay z-index 500 → 600 |
| K-8 | modal.js:454-480 | ABWEICHEND | — | persist()/closeModal() SOLL vor appConfirm laufen — appConfirm ist für sekundäre Aktion (Vorgemerkte updaten), nicht für die Speicherung selbst. Kein Bug. |
| K-9 | settings.css:697 | GEFIXT | — | .io-pw-ov z-index 1200 → 2000 |
| K-10 | visionboard.js:229-230 | GEFIXT | — | Doppelter _vbCreateBoard()-Aufruf entfernt |
| K-11 | jahresuebersicht.js:2346 | GEFIXT | — | persist() nach accountId-Mutation ergänzt |
| K-12 | archive.js:265,523 | GEFIXT | — | innerHTML img-Tag → createElement + img.src |
| K-13 | settings.js:33 | GEFIXT | — | VALID_THEMES + 'dark' + 'crimson' |

---

## HOCH

| ID | Datei:Zeile | Status | Commit | Notiz |
|----|-------------|--------|--------|-------|
| H-1 | utils.js:47 | GEFIXT | — | esc() + .replace(/'/g, '&#39;') |
| H-2 | vertraege.js:411 / kreditoren.js:416 | GEFIXT | — | color-Felder mit Hex-Validierung + esc() |
| H-3 | kreditoren.js | GEFIXT | — | logoDomain → DOM-Methode |
| H-4 | kreditoren.js:465,501 | GEFIXT | — | Kreditor-Details-Overlay z-index → 700 |
| H-5 | kreditoren.js | GEFIXT | — | pop.id = "krPopover" ergänzt |
| H-6 | dashboard.js | GEFIXT | — | fmShort() + " €" → fm() |
| H-7 | dashboard.js | GEFIXT | — | activeInMonth(p, mIdx, currentYear) |
| H-8 | dashboard.js / jahresuebersicht.js | GEFIXT | — | Hardcoded rgba → css()/getComputedStyle |
| H-9 | jahresuebersicht.js | GEFIXT | — | Chart-Gridlines → css() |
| H-10 | umsaetze.js | GEFIXT | — | div.um-close → button.um-close-btn |
| H-11 | posten.css | GEFIXT | — | Hardcoded rgba → var(--panel2)/var(--border) |
| H-12 | contracts.css:8 | GEFIXT | — | Grid repeat(4,1fr) → repeat(5,1fr) |
| H-13 | io.js:461-504 | GEFIXT | — | sp.meta.label → esc(sp.meta.label) |
| H-14 | io.js:240 | GEFIXT | — | saveSafepoint() → in FileReader.onload |
| H-15 | intro.js:506-520 | GEFIXT | — | mousemove/mouseup Listener in onMouseUp entfernt |
| H-16 | nav.js:541-546 | GEFIXT | — | Alt+K in _tutKeyGuard |
| H-17 | intro.js:345-347 | GEFIXT | — | closeModal/closeAccountModal vor Tutorial-Start |
| H-18 | visionboard.js:1581 | GEFIXT | — | _vbRafId + cancelAnimationFrame bei Page-Leave |
| H-19 | visionboard.js:1750,1778,1914 | GEFIXT | — | Hardcoded #0e0e0e → css('--vb-canvas-bg') |
| H-20 | bookings.js:372-374 | GEFIXT | — | oldMonthKey vor Mutation speichern |
| H-21 | io.js (migrateState) | GEFIXT | — | if (!Array.isArray(S.creditors)) S.creditors = [] |

---

## MITTEL

| ID | Datei:Zeile | Status | Commit | Notiz |
|----|-------------|--------|--------|-------|
| M-1 | visionboard.css | — | — | |
| M-2 | lockscreen.js | GEFIXT | — | try-catch um localStorage in checkLock() |
| M-3 | io.js | GEFIXT | — | pw = null nach done() |
| M-4 | utils.js | GEFIXT | — | getZahltag() → CFG.zahltag || S.zahltag || 15 |
| M-5 | state.js | — | — | |
| M-6 | modal.js:533-535 | GEFIXT | — | today().toISOString() → tz-safe Pattern |
| M-7 | nav.js | GEFIXT | — | findLastIndex-Fallback entfernt |
| M-8 | — | — | — | |
| M-9 | intro.js | GEFIXT | — | _tutUserDragged dead code entfernt |
| M-10 | accounts.js | GEFIXT | — | _groupRefAcc() + isGroupRef check |

---

## LOW

| ID | Datei:Zeile | Status | Commit | Notiz |
|----|-------------|--------|--------|-------|
| L-1 | bookings.js:217 | GEFIXT | — | push(...newBookings) → concat |
| L-2 | nav.js | GEFIXT | — | _highlightText() regex lastIndex reset |
| L-3 | vertraege.js:441 | GEFIXT | — | "Frist verpast" → "Frist verpasst" |

---

## QM-Patterns (systemisch)

| ID | Status | Dateien | Commit |
|----|--------|---------|--------|
| QM-1 | GEFIXT | bookings.js, dashboard.js, modal.js, accounts.js, state.js | — |
| QM-2 | GEFIXT | archive.js, io.js, vertraege.js, kreditoren.js, accounts.js, intro.js, settings.js | — |
| QM-3 | GEFIXT | modal.css, settings.css, archive.css, kreditoren.js, jahresuebersicht.js, umsaetze.js | — |

---

*Letzte Aktualisierung: 2026-06-13 — Stand: Fixes in Arbeit*
