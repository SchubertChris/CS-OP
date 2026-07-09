# VaultBox Frontend Audit — 2026-06-13

> 10 Seiten-Scouts · 26 Module · Vollständiger Bericht

---

## Nachtrag — Backend-/Sicherheits-Audit 2026-06-21

> Dieser Nachtrag betrifft die **Main-Prozess-/IPC-Ebene** (preload, main.js, Lizenz,
> Verschlüsselung at rest) — eine andere Schicht als das Frontend-Audit vom 13.06.
> Alle Punkte sind **umgesetzt und in echtem Electron gegen Kopien der echten Daten
> verifiziert** (argon2 nativ, SQLCipher, voller Roundtrip, Recovery-Key 8 Checks,
> crypto.db-Migration 6 tx/5 lots/1 match identisch — alles grün).

### KRITISCH

#### SEC-1: RCE über `archive:openPath` — beliebige Programmausführung — GESCHLOSSEN

**Datei:** `preload.js`, `main.js` (Archiv-IPC)

**Problem:** Der IPC-Handler `archive:openPath` reichte einen **rohen, vom Renderer
gelieferten Dateipfad** direkt an `shell.openPath` weiter. Bei einem XSS im Renderer
(und davon listet das Frontend-Audit vom 13.06. mehrere Vektoren) konnte ein Angreifer
damit **beliebige Programme auf dem Host ausführen** (Remote Code Execution). Höchste
denkbare Schwere in einer Electron-App.

**Fix (umgesetzt 2026-06-21):**
- `archive:openPath` **entfernt** → ersetzt durch `archive:openDoc` (nimmt nur noch eine
  `docId`, keinen Pfad).
- Neue Funktion `resolveOpenableArchiveFile()`: `realpath`-Recheck (löst Symlinks/`..`
  auf und prüft, dass das Ziel wirklich innerhalb des Archiv-Verzeichnisses liegt) +
  **Endungs-Allowlist** (nur erlaubte Dokumenttypen öffenbar).
- `addBuffer` gehärtet: Endung wird kanonisiert, Größe auf **20 MB gedeckelt**.
- **Path-Traversal-Fixes** zusätzlich in `openFolder` und im Safepoints-Pfad.

**Status:** GESCHLOSSEN — verifiziert in echtem Electron.

---

#### SEC-2: Lizenz-Geheimnis im öffentlichen Repo geleakt / fälschbar — BEHOBEN

**Dateien:** Lizenz-Modul, `main.js`

**Problem:** Das alte Lizenzsystem nutzte einen **hardcodierten `MASTER_KEY` und ein
`LICENSE_HMAC_SECRET`** (symmetrisch). Da das Repo `SchubertChris/CS-OP` öffentlich ist,
waren diese Geheimnisse **geleakt** — jeder konnte damit gültige Lizenzen selbst
signieren/fälschen.

**Fix (umgesetzt 2026-06-21):**
- Umstellung auf **Ed25519 (asymmetrisch)**. Im Binary liegt nur noch der **öffentliche
  Verify-Key** — kein Geheimnis mehr im Code.
- `MASTER_KEY` + `LICENSE_HMAC_SECRET` **vollständig entfernt**.
- **Hybrid-Modell:** Perpetual (kein Ablauf) + optionales Abo (`validUntil` +
  Geräte-Bindung + Grace-Period + Online-Erneuerung).

**Status:** BEHOBEN. Offen vor Release: eigener Public Key via
`tools/gen-license-keys.js` setzen, Renew-Endpoint konfigurieren (siehe NEXT_STEPS).

---

### HOCH — frühere Schwächen geschlossen

#### SEC-3: Keine Verschlüsselung at rest + „SHA-256 ohne Salt" — GESCHLOSSEN

> Schließt die in `CLAUDE.md` / Memory dokumentierten Alt-Schwächen
> **„SHA-256 ohne Salt"** und **„keine Verschlüsselung at rest"**.

**Neues Modul:** `crypto-vault.js`

**Umsetzung (Zero-Knowledge-Verschlüsselung at rest, opt-in über Einstellungen):**
- **Argon2id** leitet aus dem Master-Passwort einen KEK (Key-Encryption-Key) ab →
  ersetzt das alte ungesalzene SHA-256.
- KEK verschlüsselt einen **zufälligen DEK** (Data-Encryption-Key); Nutzdaten via
  **AES-256-GCM** mit **frischem IV pro Write**.
- **AAD-authentifizierter Header** als Anti-Rollback-Schutz.
- Krypto läuft **ausschließlich im Main-Prozess** — der DEK gelangt **nie in den
  Renderer**.
- **Transaktionale Migration** mit `verifyIntegrity` + automatischem **Rollback** bei
  Fehler.

**Status:** GESCHLOSSEN — voller Roundtrip in echtem Electron verifiziert.

---

#### SEC-4: Total-Datenverlust bei vergessenem Master-Passwort — ENTSCHÄRFT

**Fix:** **Recovery-Key** (Notfall-Schlüssel) implementiert — entschlüsselt den Vault
auch ohne Master-Passwort. Verifiziert über 8 Checks.

---

#### SEC-5: Seitentüren / Klartext-Lecks am Vault vorbei — alle 4 geschlossen

| Tür | Leck | Status |
|-----|------|--------|
| 1 | localStorage-Spiegel enthielt Klartext-State | **Im Vault-Modus deaktiviert** |
| 2 | Safepoints lagen unverschlüsselt vor | **Verschlüsselt** |
| 3 | `export:fullAuto` (Auto-Export nach Downloads) | **GESCHLOSSEN (2026-06-21) — DEK-verschlüsselt** |
| 4 | `crypto.db` (Krypto-Modul) unverschlüsselt | **SQLCipher + `temp_store=MEMORY` + selbstheilende Migration** |

Tür 3 (geschlossen 2026-06-21): Der Auto-Backup nach Downloads vor dem Löschen
(`export:fullAuto`) schreibt im Vault-Modus jetzt ein **DEK-verschlüsseltes** JSON
statt Klartext. `io.js importAll` erkennt den DEK-Container (Felder `enc`+`vaultbox`)
und entschlüsselt ihn über den entsperrten Vault (neuer IPC `vault:decryptExport`).
Die main.js-Handler `export:full`/`import:full` waren ungenutzter Code. In echtem
Electron getestet: Backup-Datei ohne Klartext-IBAN/-Saldo, Import stellt identisch
wieder her, ein fremder Vault/DEK kann nicht entschlüsseln. Damit sind **`state.json`,
Safepoints, `crypto.db` und Export** im Vault-Modus verschlüsselt.

---

### Ehrliche Grenze (dokumentiert)

Client-seitige Verschlüsselung ist eine **hohe Hürde, aber nicht unknackbar**: Das
`asar`-Archiv ist patchbar, d.h. ein lokaler Angreifer mit Schreibzugriff auf die
Installation kann theoretisch Code manipulieren. Schutzziel ist **Daten-Vertraulichkeit
at rest** (gestohlene Datei / fremder Zugriff), nicht Manipulationssicherheit gegen
einen Angreifer mit vollem lokalen Zugriff.

---

## Übersicht

| Severity | Anzahl Issues | Betroffene Dateien |
|----------|--------------|-------------------|
| KRITISCH | 13 | bookings.js, jahresuebersicht.js, intro.js, archive.js, modal.css, modal.js, settings.css, visionboard.js, state.js |
| HOCH     | 22 | umsaetze.js, vertraege.js, kreditoren.js, visionboard.js, intro.js, io.js, utils.js, bookings.js, accounts.js, modal.css, posten.css, contracts.css, archive.css, settings.js, nav.js |
| MITTEL   | 10 | visionboard.css, lockscreen.js, io.js, utils.js, state.js, modal.js, nav.js, intro.js |
| LOW      | 3  | bookings.js, nav.js, intro.js, settings.js |

**Betroffene Dateien gesamt:** 20 von 26 Modulen

**Kritischste Kategorie:** Sicherheit (XSS/Injection) + systemische UTC-Shift-Bugs in der Buchungs-Engine

---

## Querschnitts-Muster (systemische Probleme)

Diese Muster treten in vielen Dateien auf und müssen systematisch behoben werden — nicht file by file.

### QM-1: `toISOString()` UTC-Shift (Regel 3 Verletzung)

**Betroffene Stellen (mindestens 11):**
- `bookings.js:261` — `_makeBooking()`
- `bookings.js:282` — `_makeTransferBooking()`
- `dashboard.js:822`
- `umsaetze.js` — 8 Stellen
- `jahresuebersicht.js` (implizit)
- `accounts.js:854`
- `modal.js:130/352/534/567`
- `state.js:686` — `seedData()`

**Problem:** `new Date().toISOString()` gibt UTC-Zeit zurück. In CET (UTC+1) oder CEST (UTC+2) kann dies nach 22:00 bzw. 23:00 Uhr auf den Vortag springen. Datum-Bugs bei abendlicher Nutzung, falsche Buchungs-MonthKeys, Cockpit zeigt falschen Tag.

**Fix (überall gleich):**
```javascript
const n = new Date();
const todayStr = `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
```
Alternativ: zentrale `today()`-Funktion aus `utils.js` nutzen — sie ist bereits korrekt implementiert.

**Empfehlung:** Grep über gesamte Codebase nach `toISOString()` und ersetze alle Vorkommen die `heute` repräsentieren sollen. Vorkommen die echte ISO-Timestamps für Meta-Daten (Export-Datum etc.) erzeugen dürfen bleiben.

---

### QM-2: Unsicheres `innerHTML` mit Nutzerdaten

**Betroffene Stellen:**
- `dashboard.js` — Render-Funktionen
- `umsaetze.js` — `renderPosten()`
- `archive.js:76` — `cat.color` ohne `esc()`
- `archive.js:265/523` — `<img src="${url}">`
- `io.js:461-504` — `sp.meta.label` (direkte Nutzereingabe via `appPrompt`)
- `vertraege.js:411` — `_ctrCat.color`
- `kreditoren.js:416` — `_ctrCred.color`
- `kreditoren.js` — `c.logoDomain` in `img src`
- `accounts.js:1028` — `acc.billingType`/`acc.billingDay`
- `intro.js:717-719` — `segs.innerHTML` mit onclick-Template-Literals
- `settings.js:1029` — `promoCard.innerHTML`

**Problem:** Jede direkte Einbettung von Nutzerdaten oder state-Werten in `innerHTML` ohne `esc()` ist ein XSS-Vektor. Auch CSS-Injection über `color`-Felder ist möglich (z.B. `red; background:url(evil)`).

**Fix-Strategie:**
1. Alle String-Interpolationen in `innerHTML`-Templates müssen durch `esc()` laufen.
2. `esc()` in `utils.js` muss zusätzlich einfache Anführungszeichen escapen (siehe HOCH-1).
3. Für Bild-URLs: `encodeURIComponent()` auf `logoDomain` und andere URL-Parameter.
4. Wo möglich: DOM-Methoden (`createElement`, `textContent`) statt `innerHTML`.

---

### QM-3: z-index-Tabellen-Verletzungen

**Definierte Tabelle (CLAUDE.md):**

| Ebene | Soll-z-index |
|-------|-------------|
| Standard-Overlays | 600 |
| Kreditor-Modal | 700 |
| Archive Upload / Tutorial Blocker | 800 |
| Tutorial Reticle | 850 |
| Booking Edit / Tutorial Panel | 900 |
| Jahresübersicht Booking Edit | 1100 |
| Kreditor Popover | 1200 |
| System-Dialoge | 2000 |

**Gefundene Abweichungen:**
- `modal.css:33` — `.overlay { z-index: 500 }` statt 600 (alle Standard-Modals zu tief)
- `umsaetze.js` — undokumentierter z-index 910 (nicht in der Tabelle)
- `archive.css:1419` — `.arch-upload-overlay` z-index 660 statt 800
- `kreditoren.js:465+501` — `openCreditorDetails()` und `_krEnableEdit()` setzen `ov.style.zIndex = "1200"` — kollidiert mit `#krPopover` (ebenfalls 1200)
- `settings.css:697` — `.io-pw-ov` z-index 1200 statt 2000 (ist ein System-Dialog)
- `jahresuebersicht.js` — Monatsmodal z-index 700 — Kollision mit Kreditor-Modal

**Fix:** Alle z-index-Werte auf die CLAUDE.md-Tabelle normieren. Jede Ebene darf maximal einmal vorkommen.

---

## KRITISCH — Muss vor nächstem Release gefixt werden

---

### K-1: `toISOString()` in der Buchungs-Engine (Regel 3)

**Dateien:** `bookings.js:261`, `bookings.js:282`, `state.js:686`

**Problem:** Die Kernfunktionen `_makeBooking()` und `_makeTransferBooking()` sowie `seedData()` verwenden `toISOString()` für Buchungsdaten. Bei Nutzung nach 22:00 Uhr (CET) oder 23:00 Uhr (CEST) werden Buchungen auf den falschen Tag (Vortag) gebucht. MonthKey-Fehler führen dazu, dass Buchungen im falschen Monat erscheinen. Dies betrifft direkt die Kernfunktion der App — Finanztracking.

**Fix:**
```javascript
// bookings.js _makeBooking() und _makeTransferBooking():
// Ersetze: new Date().toISOString().slice(0,10)
// Durch:
const n = new Date();
const todayStr = `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
```

**Warum kritisch:** Datenverlust-äquivalent — Buchungen landen im falschen Monat, Jahresauswertung zeigt falsche Zahlen.

---

### K-2: `jahresuebersicht.js` — `css()` statt `_jcss()` → ReferenceError

**Datei:** `jahresuebersicht.js:1021`

**Problem:** `css("--purple")` ruft eine nicht definierte globale Funktion auf. Die korrekte modulinterne Funktion heißt `_jcss("--purple")`. Der MA-Toggle (Moving-Average-Button) wirft bei Aktivierung einen ReferenceError und ist komplett nicht funktionsfähig.

**Fix:**
```javascript
// Ersetze:
css("--purple")
// Durch:
_jcss("--purple")
```

**Warum kritisch:** Feature komplett kaputt. Wird beim ersten Klick auf "∿ MA" sichtbar — prominente Feature-Regression.

---

### K-3: `intro.js` — SHA-256 statt `_pwHash()` im Tutorial-Setup

**Datei:** `intro.js:1038`

**Problem:** Der Tutorial-Setup-Flow ruft direkt `sha256(pw)` auf statt `_pwHash(pw)`. `_pwHash()` ist der offizielle Einstiegspunkt der in Zukunft auf scrypt/Argon2 upgraden kann. Durch den Direkt-Aufruf wird beim Tutorial-Setup immer ein unsalted SHA-256 Hash gespeichert, auch wenn der rest der App bereits auf einen stärkeren Algorithmus migriert wurde. Passwörter die im Tutorial gesetzt werden, sind dauerhaft schwächer geschützt.

**Fix:**
```javascript
// Ersetze: sha256(pw)
// Durch:   _pwHash(pw)
```

**Warum kritisch:** Sicherheitsregression — Tutorial-Nutzer haben schwächeren Passwortschutz als direkte Einstellungs-Nutzer. Inkonsistenter Hash → `checkLock()` kann in Zukunft nicht mehr vergleichen.

---

### K-4: `archive.js` — `document.write()` in `_archivePrintPreview()`

**Datei:** `archive.js:900-906`

**Problem:** `document.write()` wird von Electron's Content Security Policy (CSP) blockiert. Die Print-Preview-Funktion im Archiv ist dadurch vollständig nicht funktionsfähig und wirft einen CSP-Fehler in der Konsole.

**Fix:** Umstieg auf das bestehende `window.csf.print.html()` IPC-Pattern, das in `print.js` bereits korrekt implementiert ist:
```javascript
// Ersetze document.write() mit:
window.csf.print.html(htmlContent);
```

**Warum kritisch:** Feature funktioniert nicht. Electron-CSP blockt `document.write()` ohne Fallback.

---

### K-5: `archive.js:76` — XSS/CSS-Injection via `cat.color`

**Datei:** `archive.js:76`

**Problem:** `page.innerHTML` enthält direkt interpoliertes `cat.color` ohne `esc()`. Kategoriefarben sind Nutzereingaben (Farbpicker oder manueller Input). Ein Wert wie `red" style="background:url(evil)` kann beliebiges HTML injizieren.

**Fix:**
```javascript
// Alle cat.color in innerHTML durch esc(cat.color) ersetzen
```

**Warum kritisch:** XSS in Electron bedeutet RCE-Potenzial (Node.js Kontext via preload falls nicht korrekt isoliert).

---

### K-6: `visionboard.js:1620-1622` — Globaler Delete/Escape-Handler löscht Nodes auf allen Seiten

**Datei:** `visionboard.js:1620-1622`

**Problem:** Der `keydown`-Event-Handler für Delete- und Escape-Tasten wird auf `document` registriert und nie entfernt. Er ist aktiv auf allen Seiten der App. Wenn der User auf einer anderen Seite (z.B. Transaktionen) die Entf-Taste drückt, kann er VisionBoard-Nodes löschen ohne es zu bemerken. Stummer Datenverlust.

**Fix:**
```javascript
// Handler nur registrieren wenn VisionBoard aktiv:
function _vbKeyHandler(e) { /* ... */ }

// In renderVisionBoard() / beim Navigieren zur Seite:
document.addEventListener('keydown', _vbKeyHandler);

// In Cleanup / beim Verlassen der Seite:
document.removeEventListener('keydown', _vbKeyHandler);
```

**Warum kritisch:** Stummer Datenverlust durch unbeabsichtigte Tastatureingaben auf anderen Seiten.

---

### K-7: `modal.css:33` — Alle Standard-Modals z-index 500 statt 600

**Datei:** `modal.css:33`

**Problem:** `.overlay { z-index: 500 }` — CLAUDE.md schreibt 600 für Standard-Overlays vor. Alle Modals (Posten, Konto, Ziel) erscheinen unter Elementen die z-index 500+ haben. Betrifft alle drei Standard-Modal-Overlays (#modalOverlay, #accModalOverlay, #goalModalOverlay).

**Fix:**
```css
.overlay { z-index: 600; }
```

**Warum kritisch:** Alle Standard-Modals können durch andere Elemente verdeckt werden — kompletter UI-Defekt bei bestimmten Layout-Konstellationen.

---

### K-8: `modal.js:454-480` — `persist()` vor `appConfirm` → State-Mutation vor Bestätigung

**Datei:** `modal.js:454-480`

**Problem:** `persist()` und `closeModal()` werden aufgerufen bevor der User den `appConfirm`-Dialog bestätigt hat. Wenn der User "Abbrechen" klickt, ist der State bereits gespeichert. Daten-Inkonsistenz.

**Fix:** `persist()` und `closeModal()` müssen in den `.then(confirmed => { if(confirmed) { ... } })`-Block verschoben werden:
```javascript
appConfirm("...").then(confirmed => {
  if (!confirmed) return;
  // Erst hier: persist() + closeModal()
});
```

**Warum kritisch:** Unumkehrbarer State-Write bei abgebrochenem User-Flow — Datenverlust möglich.

---

### K-9: `settings.css:697` — `.io-pw-ov` z-index 1200 statt 2000

**Datei:** `settings.css:697`

**Problem:** Der IO-Passwort-Overlay (System-Dialog) hat z-index 1200, obwohl System-Dialoge laut CLAUDE.md z-index 2000 haben müssen. Er kollidiert mit `#krPopover` (ebenfalls 1200) und kann durch den Kreditor-Popover verdeckt werden.

**Fix:**
```css
.io-pw-ov { z-index: 2000; }
```

**Warum kritisch:** Passwort-Dialog für Import/Export kann durch andere Elemente verdeckt werden — blockierte Benutzeroberfläche.

---

### K-10: `visionboard.js:229-230` — Doppelter `_vbCreateBoard()`-Aufruf

**Datei:** `visionboard.js:229-230`

**Problem:** `_vbCreateBoard()` wird einmal synchron und einmal asynchron aufgerufen. Ergebnis: `boards.length === 2`, die Seed-Bedingung (`boards.length === 0`) schlägt fehl, der User sieht ein leeres Board statt des Demo-Boards beim ersten Start.

**Fix:** Einen der beiden Aufrufe entfernen. Nur der asynchrone Aufruf sollte bleiben (wartet auf I/O-Abschluss).

**Warum kritisch:** Schlechte First-Run-Experience — leeres Board statt Demo desorientiert Erstnutzer.

---

### K-11: `jahresuebersicht.js:2346` — Mutation ohne `persist()`

**Datei:** `jahresuebersicht.js:2346`

**Problem:** Nach `newBk.accountId = accId` wird kein `persist()` aufgerufen. Die Mutation geht beim nächsten App-Start verloren.

**Fix:**
```javascript
newBk.accountId = accId;
persist(); // Pflicht nach jeder S-Mutation
```

**Warum kritisch:** Stille Datenverlust-Bug — User ändert Konto, nach Neustart ist Änderung weg.

---

### K-12: `archive.js:265/523` — Unsicheres `<img src="${url}>` Pattern

**Datei:** `archive.js:265, 523`

**Problem:** `wrap.innerHTML = '<img src="' + url + '">'` — URL ist eine Nutzereingabe / externer Wert ohne Validierung oder Encoding. Attribut-Injection möglich (`" onerror="evil()`).

**Fix:** DOM-Methoden verwenden:
```javascript
const img = document.createElement('img');
img.src = url; // Browser handled safe assignment
wrap.appendChild(img);
```

**Warum kritisch:** Injection-Vektor in Electron-Kontext (potentiell RCE-Pfad).

---

### K-13: `settings.js:33` — Theme-Whitelist unvollständig

**Datei:** `settings.js:33`

**Problem:** `loadSettings()` kennt nur 4 Themes in der Whitelist: `candlescope/ivory/mono/light`. Die Themes `dark` und `crimson` fehlen. Bei gespeichertem `dark` oder `crimson` Theme fällt die App auf den Default zurück — Theme-Reset bei jedem App-Start für diese Nutzer.

**Fix:**
```javascript
const validThemes = ['candlescope', 'ivory', 'mono', 'light', 'dark', 'crimson'];
```

**Warum kritisch:** Dark- und Crimson-Theme-Nutzer verlieren ihre Theme-Einstellung bei jedem Neustart.

---

## HOCH — Sollte im nächsten Sprint behoben werden

---

### H-1: `utils.js:42-48` — `esc()` escapet keine einfachen Anführungszeichen

**Datei:** `utils.js:42-48`

**Problem:** Die `esc()`-Funktion behandelt `'` nicht als gefährliches Zeichen. In `onclick="func('${esc(val)}')"` Templates kann ein Wert wie `'); evil(` die Ausführung unterbrechen und beliebigen Code injizieren.

**Fix:**
```javascript
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;'); // neu hinzufügen
}
```

---

### H-2: `vertraege.js:411` + `kreditoren.js:416` — CSS-Injection via `color`-Felder

**Dateien:** `vertraege.js:411`, `kreditoren.js:416`

**Problem:** `_ctrCat.color` und `_ctrCred.color` werden unescaped in `innerHTML`-Templates eingebettet (z.B. als `style="background: ${color}"`). Nutzerdefinierte Farben können CSS-Injection ermöglichen.

**Fix:** `esc(_ctrCat.color)` und `esc(_ctrCred.color)` bei allen HTML-Einbettungen verwenden. Bei `style`-Attributen zusätzlich auf valides Hex-Format validieren: `/^#[0-9a-fA-F]{3,6}$/.test(color)`.

---

### H-3: `kreditoren.js` — `c.logoDomain` unencoded in `img src`

**Datei:** `kreditoren.js`

**Problem:** `c.logoDomain` wird direkt in einen `<img src="...">` Tag eingebettet ohne URL-Encoding. Ermöglicht Attribut-Injection (`" onerror="evil()`).

**Fix:**
```javascript
// Ersetze: <img src="${c.logoDomain}">
// Durch DOM-Methode oder:
`<img src="${encodeURI(esc(c.logoDomain))}">`
```

---

### H-4: `kreditoren.js:465+501` — Doppelter z-index 1200 (Popover-Kollision)

**Datei:** `kreditoren.js:465, 501`

**Problem:** `openCreditorDetails()` und `_krEnableEdit()` setzen `ov.style.zIndex = "1200"`. Der `#krPopover` hat ebenfalls z-index 1200. Beide Elemente sind auf derselben Ebene — welches oben liegt ist undefiniert.

**Fix:** Laut CLAUDE.md ist 1200 für `#krPopover` reserviert. Creditor-Details-Overlay muss eine andere Ebene bekommen (z.B. 700 für das Kreditor-Modal-Overlay).

---

### H-5: `kreditoren.js` — Popover-CSS-Regel trifft ID nicht

**Datei:** `kreditoren.js` / zugehöriges CSS

**Problem:** Das Popover-Element hat Klasse `"kr-popover"`, aber die CSS-Regel für den z-index targetet `#krPopover` (ID-Selektor). Das Popover hat dadurch effektiv keinen z-index aus dem CSS — es erbt den Stacking-Context und kann unter Modals verschwinden.

**Fix:** Sicherstellen dass entweder:
- Das Element die ID `krPopover` bekommt (bevorzugt), oder
- Die CSS-Regel auf `.kr-popover` geändert wird.

---

### H-6: `dashboard.js` — `fmShort() + " €"` an mehreren Stellen (Regel 1)

**Datei:** `dashboard.js`

**Problem:** An mehreren Stellen wird `fmShort(val) + " €"` verwendet. `fm()` enthält bereits " €" — und soll für Beträge genutzt werden. `fmShort()` ist explizit für Kontexte wo kein "€" gewünscht ist. Das manuelle Anhängen bricht die Formatierungs-Abstraktion und kann zu doppeltem "€ €" führen wenn Regel 1 zukünftig geändert wird.

**Fix:** Ersetze `fmShort(val) + " €"` durch `fm(val)` überall wo das €-Symbol erwünscht ist.

---

### H-7: `dashboard.js` — `activeInMonth()` ohne `yr`-Argument

**Datei:** `dashboard.js`

**Problem:** `activeInMonth(p, mIdx)` wird ohne das `yr`-Argument aufgerufen. Bei Jahreswechsel (z.B. im Januar) berechnet die Funktion falsche Aktivitätszeiträume, weil sie kein Jahr kennt und ggf. falsche Annahmen trifft.

**Fix:** `activeInMonth(p, mIdx, currentYear)` — das aktuelle Jahr als drittes Argument übergeben.

---

### H-8: `dashboard.js` + `jahresuebersicht.js` — Hardcoded rgba für Charts

**Dateien:** `dashboard.js`, `jahresuebersicht.js`

**Problem:** SVG-Farben und Chart-Farben sind als `rgba(255,255,255,...)` und `rgba(0,0,0,...)` hardcoded. In den hellen Themes (light/ivory) sind die Charts damit unsichtbar (weiß auf hellgrau).

**Fix:** CSS-Custom-Properties verwenden: `getComputedStyle(document.documentElement).getPropertyValue('--text')` für Text-Farben, `getComputedStyle(document.documentElement).getPropertyValue('--border')` für Linien. Charts nach Theme-Wechsel neu rendern.

---

### H-9: `jahresuebersicht.js` — Hardcoded Grid-Linien in Charts

**Datei:** `jahresuebersicht.js`

**Problem:** Grid-Linien in den Candlestick/Linien-Charts verwenden `rgba(255,255,255,...)` — unsichtbar in light/ivory Theme.

**Fix:** Identisch zu H-8: CSS-Variablen via `getComputedStyle` für Chart-Konfiguration verwenden.

---

### H-10: `umsaetze.js` — `<div>` statt `<button>` für Close-Button

**Datei:** `umsaetze.js`

**Problem:** Der Close-Button im Transaktionen-Overlay ist als `<div>` implementiert. Nicht per Tastatur erreichbar (kein `tabindex`, kein natürliches Keyboard-Handling), keine Accessibility (kein `role="button"`, kein `aria-label`).

**Fix:**
```html
<button class="um-close-btn" aria-label="Schließen" onclick="closeUmEdit()">×</button>
```

---

### H-11: `posten.css` — Hardcoded rgba für Rows

**Datei:** `posten.css`

**Problem:** Hardcoded `rgba`-Werte für Zebra-Striping und Row-Hover in Transaktionen. In light/ivory Theme unsichtbar oder mit falschen Kontrasten.

**Fix:** CSS-Custom-Properties aus `base.css` nutzen: `var(--panel2)`, `var(--border)`, `var(--blue-a08)`.

---

### H-12: `contracts.css:8` — KPI-Strip Layout-Bug

**Datei:** `contracts.css:8`

**Problem:** KPI-Strip verwendet `repeat(4, 1fr)` — die Top3-Card hat `span-2`, belegt also 2 von 4 Spalten. Das letzte Element hat keine volle Spalte. Das Layout sieht bei 4 KPI-Karten falsch aus.

**Fix:** Grid auf `repeat(5, 1fr)` ändern wenn Top3-Card span-2 bleiben soll, oder Top3-Card auf span-1 setzen.

---

### H-13: `io.js:461-504` — `renderIoPanel()` mit unescaptem `sp.meta.label`

**Datei:** `io.js:461-504`

**Problem:** `sp.meta.label` ist eine direkte Nutzereingabe via `appPrompt`. Sie wird ohne `esc()` in `innerHTML` eingebettet. XSS-Vektor im Safepoint-Label.

**Fix:**
```javascript
`<span>${esc(sp.meta.label)}</span>`
```

---

### H-14: `io.js:240` — `saveSafepoint()` vor `FileReader.onload`

**Datei:** `io.js:240`

**Problem:** `saveSafepoint()` wird aufgerufen bevor `FileReader.onload` abgeschlossen ist. Wenn der User den Import-Dialog abbricht oder ein Fehler auftritt, wird trotzdem ein Safepoint angelegt — zu einem Zeitpunkt wo noch kein Import stattgefunden hat.

**Fix:** `saveSafepoint()` in den `FileReader.onload`-Callback verschieben, nach erfolgreichem Parse.

---

### H-15: `intro.js:506-520` — Memory Leak in `_makeDraggable()`

**Datei:** `intro.js:506-520`

**Problem:** `window.addEventListener('mousemove')` und `window.addEventListener('mouseup')` werden in `_makeDraggable()` registriert aber nie entfernt. Bei jedem Tutorial-Open akkumulieren sich Event-Listener — Memory Leak.

**Fix:**
```javascript
function onMouseMove(e) { /* ... */ }
function onMouseUp(e) {
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
}
window.addEventListener('mousemove', onMouseMove);
window.addEventListener('mouseup', onMouseUp);
```

---

### H-16: `nav.js:541-546` — Alt+K nicht in `_tutKeyGuard`

**Datei:** `nav.js:541-546`

**Problem:** Alt+K (Navigation zur Krypto-Seite) ist nicht in der `_tutKeyGuard`-Sperrliste. Während das Tutorial läuft, kann der User per Alt+K zu einer anderen Seite navigieren, das Tutorial-Overlay bleibt aber aktiv — `#tutBlocker` ist weiterhin sichtbar, der User ist gefangen.

**Fix:** Alt+K zu `_tutKeyGuard` hinzufügen (analog zu den anderen Alt+N-Shortcuts).

---

### H-17: `intro.js:345-347` — Offene Overlays werden nicht geschlossen

**Datei:** `intro.js:345-347`

**Problem:** Vor Tutorial-Start werden offene Overlays nicht geschlossen. Wenn ein Modal-Overlay geöffnet ist (z-index 600) und das Tutorial startet (`#tutBlocker` z-index 800), liegt das Modal unter dem Blocker und ist nicht mehr erreichbar — aber es wurde auch nicht geschlossen. State-Inkonsistenz.

**Fix:** Vor Tutorial-Start alle bekannten Overlays schließen:
```javascript
if (typeof closeModal === 'function') closeModal();
if (typeof closeAccountModal === 'function') closeAccountModal();
// etc.
```

---

### H-18: `visionboard.js:1581` — rAF-Drag-Loop ohne Cleanup

**Datei:** `visionboard.js:1581`

**Problem:** Der `requestAnimationFrame`-Loop für Drag-Operationen wird nach Page-Wechsel nicht gecancelt. Er läuft weiter und verursacht unnötige CPU-Last und potentielle Fehler wenn auf VisionBoard-DOM-Elemente zugegriffen wird die nicht mehr im Dokument sind.

**Fix:**
```javascript
let _vbRafId = null;
// Im rAF-Loop: _vbRafId = requestAnimationFrame(loop);
// Bei Page-Wechsel / Cleanup: if (_vbRafId) cancelAnimationFrame(_vbRafId);
```

---

### H-19: `visionboard.js:1750+1778` + `visionboard.js:1914` — Hardcoded Schwarz in Exports

**Datei:** `visionboard.js:1750, 1778, 1914`

**Problem:**
- Export/SVG-Export verwenden hardcoded `#0e0e0e` als Hintergrundfarbe → in light/ivory Theme exportiert der User ein schwarzes Bild.
- Dashboard-Canvas-Preview verwendet hardcoded `#111` → kaputt in light/ivory.

**Fix:** Die Canvas-Hintergrundfarbe aus dem CSS-Token lesen:
```javascript
const canvasBg = getComputedStyle(document.documentElement).getPropertyValue('--vb-canvas-bg').trim() || '#0e0e0e';
```

---

### H-20: `bookings.js:372-374` — Alter Override bleibt nach Mutation

**Datei:** `bookings.js:372-374`

**Problem:** `saveBooking()` löscht den Override mit `bk.monthKey` nach einer Mutation. Wenn sich `bk.monthKey` durch die Mutation geändert hat, bleibt der alte Override-Eintrag im `S.data`-Objekt — Memory-Leak und potentiell falsches Recalculation-Verhalten.

**Fix:** Den alten monthKey vor der Mutation speichern und diesen zum Löschen verwenden:
```javascript
const oldMonthKey = bk.monthKey;
// ... Mutation ...
delete p.overrides[oldMonthKey];
```

---

### H-21: `state.js:1043-1064` — `migrateState()` fehlt `S.creditors` Guard

**Datei:** `state.js:1043-1064`

**Problem:** `migrateState()` in `io.js` hat keinen Guard für `S.creditors = []` bei alten Datenständen (vor Einführung der Kreditoren-Funktion). Beim Import eines alten `.fbs`-Files ist `S.creditors` undefined — alle Kreditoren-Zugriffe crashen.

**Fix:**
```javascript
if (!Array.isArray(S.creditors)) S.creditors = [];
```

---

### H-22: `accounts.js:854` — `toISOString()` für `todayStr`

**Datei:** `accounts.js:854`

**Problem:** `todayStr` wird via `toISOString()` erzeugt — gleicher UTC-Shift wie QM-1. Betrifft Kontostand-Berechnungen die auf dem heutigen Datum basieren.

**Fix:** Identisch zu K-1 — timezone-sichere Datumsformatierung verwenden.

---

## MITTEL — Technische Schuld

---

### M-1: `visionboard.css:968-974` — `.vb-props-hidden` kollabiert nicht

**Datei:** `visionboard.css:968-974`

**Problem:** `.vb-props-hidden` setzt das Props-Panel nicht auf `width: 0`. Laut Spec (CLAUDE.md "Fixed in v10.5") soll das Panel bei Toggle auf width:0/opacity:0 kollabieren. Die Animation passiert zwar optisch, aber das Element belegt weiterhin Platz → Content-Bereich verschiebt sich nicht korrekt.

**Fix:**
```css
.vb-shell.vb-props-hidden .vb-props {
  width: 0;
  opacity: 0;
  overflow: hidden;
  pointer-events: none;
}
```

---

### M-2: `lockscreen.js:115-123` — Kein try-catch um `localStorage.getItem()`

**Datei:** `lockscreen.js:115-123`

**Problem:** `checkLock()` greift ohne try-catch auf `localStorage` zu. In Electron-Kontexten wo localStorage durch Sandbox-Restriktionen oder Private-Browsing-Mode nicht verfügbar ist, wirft dies einen Exception → Passwortschutz ist still deaktiviert.

**Fix:**
```javascript
try {
  const hash = localStorage.getItem('csf_pw_hash');
  // ...
} catch(e) {
  // Fail-closed: lock screen zeigen wenn localStorage nicht verfügbar
  showLockscreen();
}
```

---

### M-3: `io.js:170-178` — Passwort-String nicht gecleant

**Datei:** `io.js:170-178`

**Problem:** Der Passwort-String bleibt nach `done()` als JavaScript-Wert im Speicher. In einem Crash-Dump oder Heap-Snapshot könnte er ausgelesen werden.

**Fix:** Nach Verarbeitung überschreiben: `pw = null;` (JS Strings sind immutable, aber das eliminiert zumindest die Referenz und erlaubt GC).

---

### M-4: `utils.js:243-245` — `getZahltag()` ignoriert `CFG.zahltag`-Priorität

**Datei:** `utils.js:243-245`

**Problem:** `getZahltag()` prüft nicht zuerst `CFG.zahltag`. Laut Regel 6 ist die Priorität: `CFG.zahltag → S.zahltag → 15`. Wenn `CFG.zahltag` gesetzt ist aber `getZahltag()` zuerst `S.zahltag` liest, kommt es zu falschen Zahltag-Berechnungen.

**Fix:**
```javascript
function getZahltag() {
  return CFG.zahltag || S.zahltag || 15;
}
```

---

### M-5: `settings.css:749` — Hardcoded Fallback-Farbe

**Datei:** `settings.css:749`

**Problem:** `var(--red, #e74c3c)` — der Fallback-Wert `#e74c3c` ist hardcoded. Wenn `--red` im Theme redefiniert wird (z.B. im crimson Theme), greift der Fallback trotzdem auf die alte Farbe zurück wenn das Token nicht geladen wurde.

**Fix:** `--red` in `base.css` als Token definieren und den Hardcode-Fallback entfernen: `var(--red)`.

---

### M-6: `modal.js:130/352/534/567` — `toISOString()` für UI-Datumfelder

**Datei:** `modal.js:130, 352, 534, 567`

**Problem:** Datumfelder in Modals werden mit `toISOString()` vorbelegt. Nach 22:00 Uhr (CET) zeigt das Modal den falschen Vortag als Default-Datum.

**Fix:** `today()` aus `utils.js` verwenden (bereits timezone-korrekt implementiert).

---

### M-7: `nav.js:21-28` — Falsche `_modalPop()` Fallback-Logik

**Datei:** `nav.js:21-28`

**Problem:** Die Fallback-Implementierung für `findLastIndex()` in `_modalPop()` ist fehlerhaft. Da Electron 40 `findLastIndex()` nativ unterstützt, wird der Fallback nie ausgeführt — aber er ist trotzdem toter, falscher Code der bei Debugging verwirren kann.

**Fix:** Fallback-Code entfernen, direkt `array.findLastIndex()` nutzen.

---

### M-8: `visionboard.css:475/808` — Sticky/Goal Node-Farben hardcoded

**Datei:** `visionboard.css:475, 808`

**Problem:** Sticky-Notes und Goal-Nodes haben hardcoded Farben in CSS. Das Props-Panel erlaubt Farbänderungen, die aber wirkungslos sind da CSS-Klassen die inline Styles überschreiben.

**Fix:** Farben via CSS-Custom-Properties setzen die per JS gesetzt werden:
```javascript
node.style.setProperty('--node-color', newColor);
```

---

### M-9: `intro.js:487` — Toter Code `_tutUserDragged`

**Datei:** `intro.js:487`

**Problem:** Das Flag `_tutUserDragged` wird gesetzt aber nie ausgelesen. Toter Code der die Lesbarkeit beeinträchtigt.

**Fix:** Flag und alle Schreibstellen entfernen.

---

### M-10: `accounts.js:44-49` — `_groupRefAcc()` wertet `isGroupRef` nie aus

**Datei:** `accounts.js:44-49`

**Problem:** `_groupRefAcc()` liest `isGroupRef` aus dem Konto-Objekt nie aus. Der gespeicherte Wert ist damit wirkungslos — die Funktion zeigt immer das erste Konto der Gruppe als Referenz-Konto, nicht das als `isGroupRef: true` markierte.

**Fix:** `_groupRefAcc()` auf `isGroupRef` prüfen:
```javascript
function _groupRefAcc(groupName) {
  const groupAccs = S.accounts.filter(a => a.bankGroup === groupName);
  return groupAccs.find(a => a.isGroupRef) || groupAccs[0];
}
```

---

## LOW — Nice-to-have

---

### L-1: `bookings.js:217` — Array-Spread bei großem Array

**Datei:** `bookings.js:217`

**Problem:** `S.bookings.push(...newBookings)` kann bei sehr vielen Buchungen (1000+) zu einem Stack-Overflow führen (JavaScript-Maximum-Call-Stack-Size für Spread-Argumente).

**Fix:**
```javascript
S.bookings = S.bookings.concat(newBookings);
```

---

### L-2: `nav.js:273-287` — `_highlightText()` lastIndex-Bug

**Datei:** `nav.js:273-287`

**Problem:** Ein globaler Regex (`/pattern/g`) mit `test()` inkrementiert `lastIndex`. Beim nächsten `test()`-Aufruf startet die Suche nicht von vorne — Ergebnisse alternieren true/false. Suchergebnisse werden nur teilweise hervorgehoben.

**Fix:** Regex bei jedem Aufruf neu erstellen oder `lastIndex = 0` zurücksetzen:
```javascript
const rx = new RegExp(escapeRegex(query), 'gi'); // neu erstellen statt global cachen
```

---

### L-3: `vertraege.js:441` — Tippfehler im User-sichtbaren Text

**Datei:** `vertraege.js:441`

**Problem:** "Frist verpast" → sollte "Frist verpasst" sein (doppeltes 's').

**Fix:**
```javascript
"Frist verpasst"
```

---

## Fix-Reihenfolge (empfohlen)

Sortiert nach Impact/Aufwand-Verhältnis — höchster Impact, geringster Aufwand zuerst.

| Prio | Issue | Aufwand | Impact |
|------|-------|---------|--------|
| 1 | **L-3** — Tippfehler "verpast" | 2 min | sofort sichtbar |
| 2 | **K-13** — Theme-Whitelist (`dark`/`crimson` fehlen) | 5 min | betrifft 2 Themes komplett |
| 3 | **K-7** — `modal.css` z-index 500→600 | 5 min | alle Standard-Modals |
| 4 | **K-9** — `settings.css` `.io-pw-ov` z-index 1200→2000 | 5 min | IO-Passwort blockierbar |
| 5 | **K-2** — `css()` → `_jcss()` in jahresuebersicht.js | 5 min | MA-Toggle komplett kaputt |
| 6 | **K-11** — `persist()` nach `newBk.accountId` Mutation | 5 min | stiller Datenverlust |
| 7 | **M-6** — `toISOString()` in Modal UI-Feldern → `today()` | 10 min | falsche Datumsvorauswahl |
| 8 | **QM-1** — Alle `toISOString()` in Buchungs-Engine | 30 min | Buchungen im falschen Monat |
| 9 | **K-1** — `bookings.js` `_makeBooking()` / `_makeTransferBooking()` | 15 min | Kern-Datenbug |
| 10 | **H-1** — `esc()` einfache Anführungszeichen | 10 min | XSS-Grundlage |
| 11 | **QM-2** — Alle `innerHTML` + `esc()` ergänzen | 60 min | XSS/CSS-Injection system-weit |
| 12 | **K-5** — `archive.js:76` cat.color ohne esc() | 10 min | XSS im Archiv |
| 13 | **H-13** — `io.js` sp.meta.label ohne esc() | 10 min | XSS im Safepoint-Label |
| 14 | **H-2/H-3** — color/logoDomain Injection | 15 min | CSS/Attribut-Injection |
| 15 | **K-3** — `intro.js` sha256 → `_pwHash()` | 5 min | Sicherheits-Regression |
| 16 | **K-8** — `modal.js` persist() vor appConfirm | 20 min | State-Write bei Abbruch |
| 17 | **K-6** — VisionBoard globaler Delete-Handler | 20 min | stiller Datenverlust |
| 18 | **K-10** — Doppelter `_vbCreateBoard()`-Aufruf | 10 min | leeres Demo-Board |
| 19 | **H-19** — VisionBoard Hardcoded #0e0e0e in Exports | 15 min | schwarze Exports in hell |
| 20 | **H-8/H-9** — Chart-Farben via CSS-Tokens | 30 min | Charts unsichtbar in hell |
| 21 | **K-4** — `document.write()` → `csf.print.html()` | 20 min | Print komplett kaputt |
| 22 | **K-12** — `archive.js` img src DOM-Methoden | 15 min | Injection-Vektor |
| 23 | **H-15** — Memory Leak in `_makeDraggable()` | 15 min | Speicher-Wachstum |
| 24 | **H-18** — rAF-Loop Cleanup VisionBoard | 15 min | CPU-Last nach Page-Wechsel |
| 25 | **QM-3** — z-index System normieren | 45 min | Stacking-Konflikte |
| 26 | **H-16** — Alt+K in tutKeyGuard | 5 min | Tutorial-Escape |
| 27 | **H-17** — Overlays vor Tutorial schließen | 10 min | State-Inkonsistenz |
| 28 | **M-2** — try-catch in `checkLock()` | 10 min | stille Sicherheits-Deaktivierung |
| 29 | **H-4/H-5** — Kreditor z-index Kollision | 20 min | Popover unsichtbar |
| 30 | **H-20** — Override-Delete mit altem monthKey | 15 min | Memory-Leak |
| 31 | **H-21** — `S.creditors` Guard in migrateState() | 5 min | Crash bei alten Daten |
| 32 | **H-14** — `saveSafepoint()` nach FileReader | 15 min | Safepoint bei Abbruch |
| 33 | **M-4** — `getZahltag()` CFG-Priorität | 10 min | falsche Zahltag-Berechnung |
| 34 | **M-10** — `_groupRefAcc()` isGroupRef auswerten | 10 min | wirkungslose Einstellung |
| 35 | **M-1** — `.vb-props-hidden` width:0 | 10 min | Animation-Spec |
| 36 | **M-8** — VisionBoard Node-Farben via CSS-Props | 20 min | Props-Panel wirkungslos |
| 37 | **L-1** — Array concat statt push-spread | 5 min | hypothetischer Edge-Case |
| 38 | **L-2** — Regex lastIndex Bug | 10 min | Suche teilweise falsch |
| 39 | **M-9** — `_tutUserDragged` toter Code | 5 min | Lesbarkeit |
| 40 | **M-7** — `_modalPop()` Fallback entfernen | 5 min | Lesbarkeit |

---

*Audit durchgeführt durch 10 Seiten-Scouts, synthetisiert am 2026-06-13.*
*Basis: CLAUDE.md Regelwerk (Kritische Regeln 1–6, z-index-Tabelle, Modal-System-Tabelle)*
