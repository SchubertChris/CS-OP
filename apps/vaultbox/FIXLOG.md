# VaultBox FIXLOG — Audit-Fixes (Branch: audit-fixes)

> Jeder Fix: Status · Datei:Zeile (verifiziert) · Commit-Hash · Notiz
> **Ehrlichkeits-Prinzip:** Nur als `GEFIXT` markiert, was wirklich committet wurde.
> Befunde die sich bei Verifikation als unzutreffend erwiesen → `ABWEICHEND` /
> `NICHT-REPRODUZIERBAR` mit Begründung. Kein Step ohne grünen `node --check`.

---

## Legende

| Status | Bedeutung |
|--------|-----------|
| `GEFIXT` | Bug reproduziert, Fix angewendet + committet |
| `ABWEICHEND-GEFIXT` | Bug existiert in anderer Form als beschrieben, trotzdem sinnvoll behoben |
| `ABWEICHEND` | Audit-Befund unzutreffend — kein Fix nötig, Begründung unten |
| `NICHT-REPRODUZIERBAR` | Code bereits korrekt / Befund nicht auffindbar — kein Fix |

## Commit-Übersicht (Branch `audit-fixes`, Basis `main`)

| Hash | Inhalt |
|------|--------|
| `2287633` | Quick-Wins — L-3, K-13, K-7, K-9, K-2, K-3, H-1 |
| `72e0efe` | A1 Datenintegrität — QM-1 (UTC-Shift), K-6, H-14, H-20, M-6 |
| `22c0cf5` | A2 Security — K-4, K-12, H-2, H-13, M-2 |
| `20e57c6` | K-10 (_vbLoadAsync Doppel-Board-Guard) |
| `b67f845` | A3 Funktionsdefekte — H-7, M-4, H-17, M-10 |
| `91539e7` | A4 Stabilität — H-15, H-18, L-1, M-3, M-7, M-9 |
| `a36af62` | A5 z-index + QM-1-Nachzug umsaetze.js — QM-3-Teil |
| `c9b4faa` | Theme-Korrektheit + a11y — L-2, H-8, H-9, H-19, H-10, H-11, H-12 |
| `a2fec01` | M-1, M-5, M-8 |

## Bilanz

- **GEFIXT:** 35 · **ABWEICHEND-GEFIXT:** 4 · **ABWEICHEND:** 6 · **NICHT-REPRODUZIERBAR:** 3
- Alle reproduzierbaren Befunde behoben. 9 Befunde erwiesen sich bei Code-Verifikation
  als unzutreffend oder bereits korrekt (Details in den Notiz-Spalten).

---

## KRITISCH

| ID | Datei:Zeile | Status | Commit | Notiz |
|----|-------------|--------|--------|-------|
| K-1 | bookings.js:261,282 · state.js:686 | GEFIXT | 72e0efe | toISOString() → tz-sichere lokale Datums-Komponenten |
| K-2 | jahresuebersicht.js:1021 | ABWEICHEND-GEFIXT | 2287633 | css() ist via dashboard.js global → kein ReferenceError. Trotzdem → _jcss() für Modul-Konsistenz |
| K-3 | intro.js:1038 | GEFIXT | 2287633 | sha256(pw) → _pwHash(pw) |
| K-4 | archive.js | GEFIXT | 22c0cf5 | document.write() → window.csf.print.html() (mit Guard) |
| K-5 | archive.js (cat.color) | ABWEICHEND | — | cat.* stammt aus hardcodierter const ARCHIVE_CATEGORIES (archive.js:7) — kein User-Input, kein Injection-Risiko. esc() unnötig (und würde CSS-Injection ohnehin nicht verhindern) |
| K-6 | visionboard.js (_vbOnKeyDown) | GEFIXT | 72e0efe | Page-active-Guard für Delete/Backspace ergänzt |
| K-7 | modal.css:33 | GEFIXT | 2287633 | .overlay z-index 500 → 600 |
| K-8 | modal.js:454-480 | ABWEICHEND | — | persist()/closeModal() SOLL vor appConfirm laufen — appConfirm betrifft die sekundäre Aktion (Vorgemerkte-Daten updaten bei Zahltag-Änderung), nicht die Speicherung selbst |
| K-9 | settings.css:697 | GEFIXT | 2287633 | .io-pw-ov z-index 1200 → 2000 (System-Dialog) |
| K-10 | visionboard.js (_vbLoadAsync) | GEFIXT | 20e57c6 | Fallback-_vbLoad() nur noch wenn !_vbBoards.length — kein Überschreiben des Sync-Boards |
| K-11 | jahresuebersicht.js:2347 | ABWEICHEND | — | persist() nach accountId-Mutation ist BEREITS vorhanden (Zeile 2347). Kein Fix nötig |
| K-12 | archive.js:265,523 | GEFIXT | 22c0cf5 | img-innerHTML → createElement("img") + replaceChildren |
| K-13 | settings.js:33 | GEFIXT | 2287633 | VALID_THEMES + 'dark' + 'crimson' |

---

## HOCH

| ID | Datei:Zeile | Status | Commit | Notiz |
|----|-------------|--------|--------|-------|
| H-1 | utils.js:47 | GEFIXT | 2287633 | esc() + .replace(/'/g, '&#39;') |
| H-2 | vertraege.js | GEFIXT | 22c0cf5 | color-Felder + Logo-URL via esc(). Kreditoren-Teil NICHT-REPRODUZIERBAR (DOM-Property el.style.borderColor statt innerHTML) |
| H-3 | kreditoren.js | NICHT-REPRODUZIERBAR | — | _krFillAvatar() nutzt createElement("img") + img.src (DOM-Property) — keine HTML-Injection |
| H-4 | kreditoren.js:464,502 | ABWEICHEND | — | z-index 1200 ist NÖTIG: openCreditorDetails() wird aus jahresuebersicht-Booking-Edit (1100) geöffnet und muss darüber liegen. Audit-Vorschlag 700 würde es darunter schieben. Kollision mit .kr-popover (1200) materialisiert nie — Popover nur auf Kreditoren-Seite, Details-Modal-@1200 nur von Jahr-Seite |
| H-5 | kreditoren.css:523 | NICHT-REPRODUZIERBAR | — | CSS targetet `.kr-popover` (Klasse, z-index 1200) — matcht das Element. Befund-Annahme (#krPopover ID-Selektor) trifft nicht zu |
| H-6 | dashboard.js | ABWEICHEND | — | fmShort(x)+" €" ist KORREKT (fmShort enthält kein €). Regel 1 verbietet nur fm()+" €" (Doppel-€); davon existiert keine Instanz. Ersetzen durch fm() würde Chip/Donut/Achsen-Ticks überlaufen lassen |
| H-7 | dashboard.js:345,447,511 | GEFIXT | b67f845 | activeInMonth(p, cm, cy) — jahres-korrigiertes cy an alle 3 Call-Sites |
| H-8 | dashboard.js | GEFIXT | c9b4faa | Chart-Grid + Sparquote-Ring + Point-Halo → css('--border'/'--panel'). Semantische Daten-Farben (grün/rot) bleiben |
| H-9 | jahresuebersicht.js | GEFIXT | c9b4faa | Candlestick-Grid/Crosshair + 8 Chart.js-Grids → _jcss('--border'/'--border2'/'--text3') |
| H-10 | umsaetze.js | ABWEICHEND-GEFIXT | c9b4faa | Close-Button ist bereits <button class="modal-close">, kein <div>. aria-label="Schließen" ergänzt (a11y-Intent) |
| H-11 | posten.css | ABWEICHEND-GEFIXT | c9b4faa | Row-Hover nutzt bereits var(--blue-a08), Separatoren var(--border), kein Zebra-rgba. ausgabe-Typ-Akzent harmonisiert → var(--red-a30, …) |
| H-12 | contracts.css:8 | GEFIXT | c9b4faa | grid repeat(4,1fr) → repeat(5,1fr) — top3-Card (span 2) brach sonst um |
| H-13 | io.js | GEFIXT | 22c0cf5 | esc(sp.meta.label) in renderIoPanel |
| H-14 | io.js | GEFIXT | 72e0efe | saveSafepoint() in FileReader.onload nach Parse+Validierung verschoben |
| H-15 | intro.js (_makeDraggable) | GEFIXT | 91539e7 | window-mousemove/mouseup nur während aktivem Drag registriert (auf mousedown) + auf mouseup entfernt. Multi-Drag intakt |
| H-16 | nav.js:540-546 | ABWEICHEND | — | Alt+K ruft nav("krypto") auf → durchläuft denselben Tutorial-Guard wie Alt+1-7 (nav.js:54). Kein separates _tutKeyGuard existiert. Tutorial-Panel-Buttons (z-900) bleiben über Blocker (800) erreichbar — kein Trap |
| H-17 | intro.js:329 | GEFIXT | b67f845 | openTutorial() schließt offene Overlays (Modal/Account/Goal/Creditor/Month/Notes/Search) vor #tutBlocker |
| H-18 | visionboard.js:1464 / nav.js | GEFIXT | 91539e7 | nav() cancelt schwebenden _vbRaf bei Verlassen der VisionBoard-Seite |
| H-19 | visionboard.js:1752,1780,1915 | GEFIXT | c9b4faa | PNG/SVG-Export + Minimap → css('--vb-canvas-bg') statt #0e0e0e/#111 |
| H-20 | bookings.js (saveBooking) | GEFIXT | 72e0efe | oldMonthKey vor Mutation gespeichert, für Override-Cleanup verwendet |
| H-21 | io.js:32 | NICHT-REPRODUZIERBAR | — | if (!Array.isArray(S.creditors)) S.creditors = [] ist BEREITS in migrateState() vorhanden |

---

## MITTEL

| ID | Datei:Zeile | Status | Commit | Notiz |
|----|-------------|--------|--------|-------|
| M-1 | visionboard.css:968 | ABWEICHEND-GEFIXT | a2fec01 | .vb-props ist position:absolute (floating) → kein Content-Shift wie im Befund behauptet. width 220px → 0 trotzdem gesetzt (kollabiert Panel vollständig, v10.5-Spec) |
| M-2 | lockscreen.js:115 | GEFIXT | 22c0cf5 | try-catch um localStorage in checkLock(), fail-closed |
| M-3 | io.js | GEFIXT | 91539e7 | Passwort-Eingabefelder in done() geleert; exportAll/importAll nullen pw-Referenz nach Gebrauch |
| M-4 | utils.js:250 | GEFIXT | b67f845 | getZahltag() → CFG?.zahltag \|\| S.zahltag \|\| 15 |
| M-5 | settings.css:749 | GEFIXT | a2fec01 | var(--red, #e74c3c) → var(--red) (Token in base.css:207 definiert) |
| M-6 | modal.js:130,352,534,567 | GEFIXT | 72e0efe | today().toISOString() → todayIso() (Teil von QM-1) |
| M-7 | nav.js:20 | GEFIXT | 91539e7 | _modalPop() findLastIndex-Fallback entfernt (nativ in Electron 40) |
| M-8 | visionboard.css:475,809 | GEFIXT | a2fec01 | Sticky/Goal-Node-Farben → var(--node-color, default). JS setzt --node-color bereits (visionboard.js:1054) — Farbpicker wirkt jetzt |
| M-9 | intro.js:494 | GEFIXT | 91539e7 | totes _tutUserDragged-Flag entfernt |
| M-10 | accounts.js:44 | GEFIXT | b67f845 | _groupRefAcc() prüft isGroupRef (höchste Prio, dann isMain → girokonto → erstes) |

---

## LOW

| ID | Datei:Zeile | Status | Commit | Notiz |
|----|-------------|--------|--------|-------|
| L-1 | bookings.js:217 | GEFIXT | 91539e7 | push(...newBookings) → concat() |
| L-2 | nav.js:277 | GEFIXT | c9b4faa | _highlightText() — separates, verankertes Test-Regex (zustandslos) statt globales re.test() |
| L-3 | vertraege.js:441 | GEFIXT | 2287633 | "Frist verpast" → "Frist verpasst" |

---

## QM-Patterns (systemisch)

| ID | Status | Commit | Dateien / Notiz |
|----|--------|--------|------|
| QM-1 | GEFIXT | 72e0efe + a36af62 | UTC-Shift toISOString → todayIso/lokale Komponenten: bookings, dashboard, modal, accounts, state — **+ umsaetze.js (a36af62, ursprünglich übersehener Nachzug: Monatsschlüssel, Begleichen/QuickDate-Default, Filter-Vergleiche)** |
| QM-2 | GEFIXT | 22c0cf5 | innerHTML-User-Daten escaped — reproduzierbare Fälle H-2 (vertraege), H-13 (io label), K-12 (archive img). K-5 ABWEICHEND (Konstante), H-3 N-R (DOM-Property) |
| QM-3 | GEFIXT | 2287633 + a36af62 + c9b4faa | z-index auf CLAUDE.md-Tabelle normiert: modal.css 600, settings.css 2000, archive.css 800, umsaetze 910→900, jahresuebersicht Monatsmodal 700→600. H-4 ABWEICHEND (1200 nötig), H-5 N-R |

---

*Letzte Aktualisierung: 2026-06-13 — Stand: Track A (Korrektheit) vollständig abgeschlossen, Build/Syntax grün.*
