# Candlescope FinanceBoard

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## ⚡ Kritische Regeln — Quick Reference (immer prüfen!)

1. **`fm()` enthält " €"** — niemals manuell `+ " €"` oder `<span>€</span>` nach `fm()` hängen. `fmShort()` enthält kein €.
2. **Keine Render-Schleifen** — `renderPosten()` darf NIEMALS `initBookings()` aufrufen. `initBookings()` nur nach Mutationen (save/import/restore).
3. **Zeitzonen-Sicherheit** — in `bookings.js` niemals `toISOString()` für heute. Stattdessen: `` `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}` ``
4. **Vertrags-Logik** — `contractEnd = ""` bedeutet unbefristet → Buchungsschleife läuft bis `upcomingEnd` (+3 Monate). Kein Fallback auf aktuellen Monat!
5. **Tooltips** — kein natives `title=""` auf interaktiven Elementen. Ausschließlich: `onmouseenter="_showTooltip('Text', this)" onmouseleave="_hideTooltip()"`
6. **Zahltag-Priorität** — 1. `CFG.zahltag` → 2. `S.zahltag` → 3. Fallback `15`

### z-index Ebenen (nie verwechseln)

| Ebene | z-index | Element |
|---|---|---|
| Standard-Overlays (Posten/Konten/Ziele) | 600 | `#modalOverlay`, `#accModalOverlay`, `#goalModalOverlay` |
| Kreditor-Modal | 700 | `#creditorModalOverlay` |
| Archive Upload | 800 | `.arch-upload-overlay` |
| Tutorial Blocker | 800 | `#tutBlocker` |
| Tutorial Reticle | 850 | `#tutReticle` |
| Booking Edit / Tutorial Panel | 900 | `#umEditOverlay`, `#tutPanel` |
| Jahresübersicht Booking Edit | 1100 | `#mmBookingEditOverlay` |
| Kreditor Popover | 1200 | `#krPopover` |
| **System-Dialoge** | **2000** | `#appDialogOverlay` — immer ganz oben |

### Autonomie-Grenzen

**Selbstständig erlaubt:** JS-Module lesen/bearbeiten, CSS anpassen, IPC-Handler in `main.js` erweitern.

**Vorher fragen:** Neue npm-Packages · `preload.js` ändern (sicherheitskritisch) · `S`-Objekt-Schema ändern (Datenverlust-Risiko) · Dateien löschen/umbenennen

---

## Session-Start (PFLICHT)

**Zu Beginn jeder Session `CLAUDE_SESSION.md` lesen** — dort steht der aktuelle Stand, die 4 offenen Tasks für den 8.6.-Launch und die Pre-Launch-Checkliste.

### `CLAUDE_SESSION.md` updaten — wann?

| Trigger | Aktion |
|---|---|
| Task aus offener Liste erledigt | Als erledigt markieren |
| Neuer Bug entdeckt | Unter "Offene Tasks" ergänzen |
| Architektur-Entscheidung getroffen | Unter "Wichtige Entscheidungen" ergänzen |
| Vor Commit | Kurzer Check: ist alles aktuell? |

Befehl: `/project:session`

---

## Agenten-System

### Rollen

| Rolle | subagent_type | Zuständigkeit |
|---|---|---|
| `frontend-agent` | `general-purpose` | JS-Module, CSS, HTML, Features |
| `debug-agent` | `general-purpose` | Bug-Analyse, Electron-IPC-Fehler, Reproduktion, Fix |
| `code-review-agent` | `feature-dev:code-reviewer` | Code-Qualität, CLAUDE.md-Konformität, S-Objekt-Nutzung |
| `explorer` | `Explore` | JS-Module durchsuchen, Muster finden, Scope verstehen |

### Workflow-Ketten

**Bug fixen:** `debug-agent → code-review-agent`

**Neues Feature:** `explorer (Scope verstehen) → frontend-agent → code-review-agent`

**Refactor:** `explorer → code-review-agent → frontend-agent → code-review-agent`

### Autonomie-Regeln

**Selbstständig:**
- JS-Module lesen, bearbeiten
- CSS-Klassen ergänzen / anpassen
- IPC-Handler in `main.js` erweitern (wenn kein neues Dependency nötig)

**Vorher fragen:**
- Neue npm-Packages installieren
- `preload.js` / contextBridge-API ändern (sicherheitskritisch)
- `state.js` S-Objekt-Schema ändern (bricht Persistierung)
- Dateien löschen oder umbenennen

---

## Custom Commands

| Command | Auslöser | Aktion |
|---|---|---|
| `/project:session` | Session-State sichern | CLAUDE_SESSION.md updaten |
| `/project:fix` | Bug oder Fehler | debug-agent → code-review-agent |
| `/project:feature` | Neues Feature / Modul | explorer → frontend-agent → code-review-agent |
| `/project:review` | Code-Qualitätsprüfung | code-review-agent über geänderte Dateien |
| `/project:launch` | Pre-Launch-Check | CLAUDE_SESSION.md Checkliste durchgehen |

---

Electron 40 desktop app for personal finance management. German-language UI. **Fully offline-first — no bundler, no framework, no runtime dependencies.** Plain HTML/JS/CSS loaded directly by Electron's renderer process.

**Version:** 10.6 · Stack: Electron 40, Vanilla JS, CSS, Chart.js 4, lightweight-charts 4.1, Web Crypto API

---

## Commands

```bash
npm run dev          # Start with electronmon (live-reload on file save)
npm start            # Start without live-reload
npm run build:win    # Windows NSIS installer → dist/
npm run build:mac    # macOS DMG + ZIP (must run on macOS; needs CSC_LINK for code-signing)
npm run build:linux  # AppImage + .deb → dist/
npm run build        # All platforms
npm run gen-assets   # Generate icons/BMPs from source images (requires Python3 + Pillow)
```

No tests, no linter configured. Before any build: run `npm run gen-assets` first (needs `assets/icon.png` 1024×1024 px + `assets/CSINSTALL.png`).

**Dev data reset** (wipes AppData completely):

```bash
rm -rf "$APPDATA/candlescope-financeboard"
```

---

## Architecture — The Big Picture

```text
main.js          ← Electron main: IPC handlers, file I/O, archive, safepoints, print, storage path, license-gate, vault-IPC
preload.js       ← contextBridge → exposes window.csf to renderer
crypto-vault.js  ← Zero-Knowledge-Verschlüsselung at Rest (NUR Main-Prozess, NIE im Renderer geladen)
index.html       ← App shell + ALL modal HTML + <script> load order (order = dependency chain)
js/              ← 26 feature modules, all global scope, share S and CFG objects
tools/           ← Lizenz-Signier-Tools (gen-license-keys.js, issue-license.js) — NICHT im Build
styles/          ← ~11,000 lines CSS; base.css defines all design tokens
styles/components/ ← modular component styles (dashboard, posten, pivot, etc.)
```

### Global scope — no imports/exports

Every JS file dumps into `window`. There are zero `import`/`export` statements. The `<script>` order in `index.html` **is** the dependency chain. Do not reorder without understanding what each module needs.

**Actual load order** (verified from `index.html`):

```text
toast.js → state.js → tooltips.js → dialog.js → utils.js → nav.js →
accounts.js → modal.js → dashboard.js → umsaetze.js →
jahresuebersicht.js → vertraege.js → io.js → print.js →
archive.js → notes.js → intro.js → lockscreen.js → settings.js →
goals.js → docs.js → kreditoren.js → pivot.js → visionboard.js → bookings.js
```

`toast.js` is first — `showToast()` is called by all other modules. `visionboard.js` is last — depends on nav and state. `pdf.js` exists in `js/` but is NOT in the load order — loaded dynamically by `print.js`.

---

## Module Reference (Complete)

| File | Purpose | Key globals |
| ---- | ------- | ----------- |
| `toast.js` | Notification toasts | `showToast(msg, type, duration)` — types: success/error/info/warning. Background always dark (hardcoded rgba), text always light — theme-independent. |
| `state.js` | State container + persistence | `S` (global state), `persist()`, `hydrate()`, `manualSave()`, `seedData()`, `clearUserData()`, `genId(prefix)`, `formatIban()`, `ibanLast4()`, `_accNumberDisplay(acc)`, `getMainAccount()`, `getCreditCards()`, `_markUnsaved()` — `_accNumberDisplay()` returns `"Depot •XXXX"` for depot/vl, `"Ablauf MM/YY"` for Kreditkarte, else `ibanLast4()` |
| `utils.js` | Formatting + finance helpers | `fm(v, sign?)` — **always appends " €"**, never add € after calling fm(). `fmShort(v)` — does NOT append €. `pp(v)`, `esc(v)`, `today()`, `fmDate(d)`, `_hasDate(d)`, `avgMonthly(p)`, `activeInMonth(p, mIdx, yr)`, `isCurrentlyActive(p)`, `getZahltag()`, `getAccount(id)`, `accLabel(id)`, `sortArr(arr, key, asc)` |
| `nav.js` | Page navigation + Schnellsuche | `nav(el, page)`, `_navTo(page)`, `PAGE_TITLES`, `openSearch()`, `closeSearch()` — keyboard shortcuts Alt+1–9, Ctrl+S, **Ctrl+K (Schnellsuche)**. Topbar has `.topbar-search-pill` button (click or Ctrl+K). Search overlay built via DOM methods only (no innerHTML). `_renderSearchResults(q)` searches Posten, Konten, Buchungen (last 200), Sparziele, Verträge, Kreditoren. Arrow+Enter navigation. `_highlightText()` uses `createElement("mark")` for safe highlighting. |
| `dialog.js` | Custom alert/confirm/prompt | `appAlert(msg, opts)`, `appConfirm(msg, opts)` → Promise, `appPrompt(msg, opts)` → Promise |
| `tooltips.js` | Hover tooltips | `_showTooltip(text, el)`, `_hideTooltip()`, `TOOLTIPS{}` — respects `CFG.tooltips` |
| `accounts.js` | Account cards + management | `renderAccounts()`, `openAccountModal(accId?)`, `saveAccountModal()` (async), `setBalance(accId, v)` — drag & drop reorder. On isMain save: auto-creates income Posten + calls initBookings() + syncs zahltag with global CFG. VL accounts (`accountType === "vl"`) show "Depotnummer" label + `accFDepot` input (same as `depot`) — `updateAccNumberFields()` and `_readAccNumber()` both handle `type === "depot" || type === "vl"`. **VL rate**: `accFVlRateRow` shown for vl type; `saveAccountModal()` reads `vlMonthlyRate` + `vlContractStart` → creates/updates/removes "VL-Beitrag – {label}" Posten (type: einnahme, interval: monatl., due: 1). Stored as `acc.vlMonthlyRate`. |
| `modal.js` | Posten/Transfer create+edit | `openModal(idx?, tab?, trfId?)`, `closeModal()`, `switchModalTab(tab)`, `savePosten()`, `saveTransfer()`, `_updateVorgemerkteDay(postenId, newDay)`. `savePosten()` captures `oldDue` before overwriting; if due changed + interval ≠ einmalig → `appConfirm()` → rewrites vorgemerkte booking dates with day-clamping. `_fillPostenForm()` hides single-booking button + transfer tab when editing a Vertrag. |
| `dashboard.js` | Main dashboard | `renderDashboard()`, `renderKPIs()`, `renderMonthInsights()`, `renderCockpit()`, `renderDonut()`, `renderKatAuswertung()`, `_checkBudgetWarning()`. Cockpit uses `dObj <= nextZahltag` (not `<`). `renderKatAuswertung()` renders `#katAuswertung` — category spending bars for selected month with nav arrows, clickable rows → Transaktionen. `_checkBudgetWarning()` fires sessionStorage-guarded toasts at ≥80% (warning) and ≥100% (error) of monthly income — once per month per session (`csf_budget_warn_${mk}_80` / `_100` keys). `refreshDash()` calls both. **Cockpit Zahlungsübersicht:** `alreadyProcessed` = bookings with status `beglichen` or `gebucht`. `urgent` only when `dd > day` (excludes today). `dueToday` when `dd === day` → `.due-today` CSS class + "Heute" red pill instead of day number. |
| `umsaetze.js` | Transactions list | `renderPosten()`, `savePosten()`, `exportBookingsCSV()` — reads `S.bookings`. **List** shows only `gebucht`/`geändert`/`beglichen` — never `vorgemerkt`. **KPI** includes `vorgemerkt` (monthly projection) and excludes only `ausgesetzt`. Inline booking edit via 2-page Apple-style modal (`umEditOverlay`, z-index 900): Page 1 — Betrag/Status/Konto; Page 2 — Bezeichnung/Datum/Notiz/Kategorie/Kreditor. Kategorie+Kreditor always visible; if `bk.postenId` exists → writes back to Posten in `S.data`; otherwise writes directly onto the booking object (`bk.categoryId`, `bk.creditorId`). Sort tiebreaker: newest id first on same date. **Kreditor-Filter**: `_umFilter.creditorId` — checks `b.creditorId` directly OR via linked Posten `p.creditorId`; shown as chips in filter overlay (pattern `umFKred_${c.id}`). |
| `bookings.js` | Booking generation engine | `initBookings()` — safe to call after S.data mutation (deduplicates). Generates 5yr back + 3 months forward. Posten without contractEnd use null endDate → loop runs to upcomingEnd. |
| `jahresuebersicht.js` | Year chart + overview | `renderJahr()`, `_renderJahresChart()`, `_renderJahresSummary()`, `_exportJahresBericht()` — candlestick + line charts via lightweight-charts CDN. Includes `vorgemerkt` bookings in calculations. **Prognose**: gestrichelte Linie ab aktuellem Monat basierend auf 3-Monats-Durchschnitt (`borderDash: [6,4]`). **Budget vs. Ist**: Soll-Linie (Summe aktiver Ausgaben-Posten) als gestrichelter Dataset mit `yAxisID: "ySaldo"`. **Summary Panel**: `_renderJahresSummary()` — 6-Card Grid (Einnahmen/Ausgaben/Netto/Sparquote/Bestes Monat/Schlechtestes Monat), vollständig via DOM-Methoden. **Drill-Down**: `openMonthModal()` hat 4 Tabs (Buchungen/Einnahmen/Ausgaben/Kategorien) + 5. KPI-Card (Δ Vormonat) + "Transaktionen →" Button. **MA Toggle**: `_jahrMA` bool — "∿ MA" Button in panel-tag schaltet 3-Monats-Moving-Average-Linie um. **Export**: `_exportJahresBericht()` → `window.csf.print.html()` erzeugt 2-seitigen PDF-Report. |
| `pivot.js` | Monthly pivot table | `renderPivot(yr)`, `_pvApplyOverride()`, `_pvRefreshIfVisible()`, `_pvSetGroup(g)` — reads `S.data` NOT `S.bookings`. `_pvSetGroup(g)` updates active class in-place without DOM rebuild. `_pvResetOrder()` and `_pvRefreshIfVisible()` both call `renderPivot(_pvYear)`. Transfer cell values check `S.bookings` for a matching `"ausgesetzt"` booking (same `transferId` + `monthKey`) — returns 0 if found. **Konto-Filter**: `_pvFilterAccount` string — account dropdown in toolbar filters rows by `r.accountId`; reset on `_pvResetOrder()`. |
| `vertraege.js` | Contracts view | `renderVertraege()`, `updateContractBadge()`. A Posten appears here only if it has contractStart OR contractEnd (`_isVertrag` filter). Start date displays with day+month+year. Column widths user-resizable via drag handles (`.col-resizer`), saved to `_ctrColWidths[]`, restored on re-render. Min column width: 80px. Table has Kategorie column (colored icon badge with tooltip) and Kreditor column (initials button with tooltip) — both read from Posten fields. Separator row colspan is 9. Badge is now a 6px dot (`.nav-badge`, position:absolute, pulsing red) — no text. `renderVertraege()` auto-dismisses badge via `sessionStorage.setItem("csf_ctr_badge_seen","1")` — stays hidden for the rest of the session after first visit. `updateContractBadge()` checks `sessionStorage` before showing. |
| `goals.js` | Savings goals | `renderGoals()`, `saveGoal()`, `_goalAutoRate()`, `_goalUpdateFeedback()`, `_goalOnRateInput()`, `_goalOnSliderInput()` — DOM: `.goals-layout` → `.goals-main` (grid) + `.goals-sidebar` (promo/FAQ). `_goalMonthsLeft(g)` uses month-based calc: `(dl.getFullYear()-now.getFullYear())*12+(dl.getMonth()-now.getMonth())`. `_goalUpdateFeedback()` calculates optimal rate, updates slider range (max = optimalRate × 2.5), shows `#gfFeedbackPanel` with Ziel/Bereits/Noch nötig/Zeitraum rows + status (`.gf-fb-ok` / `.gf-fb-warn`). `_goalAutoRate()` is now an alias for `_goalUpdateFeedback()`. Slider syncs with text input bidirectionally. `saveGoal()` stores `startDate` on goal object and uses it as `contractStart` for the auto-created savings Posten. |
| `settings.js` | User config + storage card | `CFG` (global), `loadSettings()`, `saveSettings()`, `applySettings()`, `setTheme()`, `setFont()`. Card classes: `.settings-card`, `.settings-card--full`, `.settings-wrap`, `.settings-row`. Grid layout (2-col): Erscheinungsbild(full) → Schriftart(left)+Zahltag(right) → Hintergrund(left)+Promo(right) → Verhalten(left)+Datenspeicher(right) → Passwort/Kategorien/Gefahrenzone(full). `fontCard` and `bgCard` are plain (not `--full`) so they sit in left column. |
| `io.js` | Import/export/safepoints | `migrateState()`, `exportAll()`, `importAll()`, `saveSafepoint(label)`, `restoreSafepoint(idx)`, `initSafepoints()` |
| `intro.js` | Onboarding tutorial (floating card) | `openTutorial(step?)`, `runSplash()`, `checkFirstVisit()` — 16-step guided tour. Floating `#tutPanel` (position:fixed, z-index 900). `#tutBlocker` (z-index 800) blocks all app interaction. `#tutReticle` targeting frame tracks highlighted elements via rAF loop. |
| `lockscreen.js` | Password lock | `checkLock()`, `sha256(str)` — Web Crypto API, SHA-256 |
| `archive.js` | Document archive | `renderArchivePage()` (async, renders into `#p-archiv`), `_archShowCatDocs(catId)` (populates right panel), `_archSetSort(by)` (toggles sort), `_archRefreshAfterEdit(catId)` (reload-safe refresh without full page reload). Module vars: `_archActiveCat`, `_archSortBy` ("date"/"name"/"size"), `_archSortDir` (-1/1), `_archAllDocs`. Explorer layout: KPI strip + `.arch-explorer` grid (200px sidebar + 1fr main). Sidebar: category list with `.arch-exp-cat.active`. Main panel: header with sort buttons (`.arch-sort-btn`) + document list (`.arch-cat-list`). Sort buttons toggle dir when same field clicked. Upload uses `await renderArchivePage()` for reload-fix. Only works with `window.csf.archive` (Electron only). **Sicherheit**: Öffnen läuft über `archive:openDoc(docId)` (nur ID, kein Pfad) — `archive:openPath` (RCE) wurde entfernt. |
| `crypto-vault.js` | **Verschlüsselung at Rest (NUR Main-Prozess)** | Zero-Knowledge-Krypto-Modul, das ausschließlich im Electron-Main-Prozess läuft — wird NIE in den Renderer geladen (taucht daher nicht in der `index.html` `<script>`-Ladereihenfolge auf). Argon2id (KDF) → KEK → zufälliger 32-Byte DEK → AES-256-GCM mit frischem 12-Byte-IV pro Schreibvorgang + AAD-authentifiziertem Header (Anti-Rollback). Schreibt `vault.enc` in `dataDir()`. Der DEK lebt NUR im Main-RAM → XSS im Renderer kann den Schlüssel nicht stehlen. Liefert die `vault:`-IPC-Handler. Funktionen u.a. `unlockWithRecovery()`, `lockVaultNow()`. |
| `notes.js` | Sticky notes panel | `openNotesPanel()`, `closeNotesPanel()` — stored in `csf_notes` localStorage key |
| `print.js` | Print/PDF export | `openPrintPreview()` — sends HTML via `window.csf.print.html()` IPC → new BrowserWindow. Always light mode. System fonts only (Segoe UI/Arial). All CSS inline hex (no `var()` — MS Print to PDF doesn't resolve custom properties). |
| `docs.js` | About page | `renderDocs()` — aktueller Changelog-Stand **v11.0** (Verschlüsselung & Sicherheit), Produkt-Version v1.0. Update hero badge, footer, stats strip, changelog array, and feature count here on release. Changelog keeps last 4 entries. |
| `visionboard.js` | Visual idea board | `renderVisionBoard()`, `_vbLoad()`, `_vbSave()`, `_vbCreateBoard()`, `_vbCenterOnNodes()` — nodes + connections, pan/zoom, drag/resize, rubber-band selection. Saved via `window.csf.visionboard.save()` → `visionboards.json`. `_vbCenterOnNodes()` calculates bounding-box of all nodes and sets `_vbPanX`/`_vbPanY` to center them in the visible viewport — called via `requestAnimationFrame` after async load. Props panel (`vb-props`, always visible 200px) shows in idle state: Aktionen section (2×2 grid of quick-add buttons for text/node/image/sticky) + Canvas section (Zentrieren + Alles auswählen buttons) + minimap. When a node is selected it shows node properties as before. |
| `kreditoren.js` | Creditors/payees page | `renderKreditoren()`, `openCreditorModal(id?)`, `closeCreditorModal()`, `saveCreditor()`, `deleteCreditor()`. Stored in `S.creditors[]`. Each creditor can optionally link to one of `S.accounts[]` (stored as `accountId`). Card popover shows `bankGroup + " · " + acc.label` when account is linked. Modal account dropdown uses `<optgroup>` per bankGroup; hint div (`#krAccountHint`) shows `group · accountType` on selection. No linked-Posten preview — creditor filtering belongs in Transaktionen filter. |

---

## Data / Persistence

### Dual persistence on every `persist()` call

1. `localStorage["csf_v1"]` — always, immediate **(ABER: im Vault-Modus abgeschaltet — kein Klartext-Spiegel, siehe „Verschlüsselung at Rest")**
2. `window.csf.state.save(S)` — IPC → Electron writes to `stateFile()` (custom path or AppData default). **Im Vault-Modus** wird `S` stattdessen verschlüsselt nach `vault.enc` geschrieben (DEK nur im Main-RAM).

Guard: `window.csf?.state?.save` — silently no-ops in browser/non-Electron context.

### Storage path system (new in v10)

A `config.json` at the **fixed** location `%APPDATA%/candlescope-financeboard/config.json` stores an optional custom data path. All other files resolve relative to `dataDir()`.

```javascript
// main.js dynamic path functions:
dataDir()         // reads config.json → custom path or DEFAULT_DIR
archiveDir()      // dataDir() + "/archive"
stateFile()       // dataDir() + "/state.json"
settingsFile()    // dataDir() + "/settings.json"
safepointsDir()   // dataDir() + "/safepoints"
visionboardFile() // dataDir() + "/visionboards.json"
```

On path change via `storage:choosePath`: existing data copied via `copyDirSync()`, old data preserved, config.json pointer updated.

### localStorage keys

| Key | Contents |
| --- | -------- |
| `csf_v1` | Full `S` object |
| `csf_settings` | `CFG` object |
| `csf_notes` | Notes array (independent of S) |
| `csf_safepoints` | Legacy safepoints array (max 10) |
| `csf_intro_version` | Tutorial completion flag |
| `csf_tut_done` | Tutorial finished flag |

### AppData / custom path files

| Path | Contents |
| ---- | -------- |
| `state.json` | Mirror of `csf_v1` (Klartext — nur ohne Vault-Modus) |
| `vault.enc` | **Vault-Modus:** AES-256-GCM-verschlüsselter `S`-Container (DEK nur im Main-RAM). Ersetzt `state.json` als Quelle der Wahrheit, wenn Verschlüsselung aktiv ist. |
| `crypto.db` | SQLCipher-DB (SQLCipher via `better-sqlite3-multiple-ciphers`, `PRAGMA temp_store=MEMORY`); selbstheilende Migration in `_getCryptoDb()` |
| `settings.json` | Mirror of CFG |
| `visionboards.json` | Vision board nodes + connections |
| `safepoints/*.json` | Safepoint snapshots (max 10, auto hourly). **Im Vault-Modus verschlüsselt** (DEK-Container statt Klartext-JSON). |
| `archive/main.json` | Document index |
| `archive/<category>/` | Uploaded files (9 preset categories on first run) |

---

## State Model (`S` object)

```javascript
S = {
  accounts: [{
    id, label, sub,             // sub = subtitle e.g. "Girokonto · Hauptkonto"
    accountType,                // "girokonto"|"kreditkarte"|"tagesgeld"|"sparkonto"|"depot"|"festgeld"|"vl"|"sonstiges"
    iban, color, balance,
    include,                    // bool — false = excluded from totals
    isMain,                     // bool — primary account (salary target, cockpit center)
    monthlyIncome,              // only relevant if isMain — auto-creates matching Posten on save
    bankGroup,                  // "ING" — group name, "" = ungrouped
    isGroupRef,                 // bool — shown first in group
    billingType,                // kreditkarte: "stichtag"|"direkt"|"prepaid"
    billingDay,                 // kreditkarte: billing cutoff day
    ccExp, ccCvv, note
  }],

  data: [{                      // "Posten" = fixed recurring line items
    id, name,
    type,                       // "ausgabe"|"einnahme"
    amount, interval,           // "monatl."|"viertelj."|"halbjährl."|"jährl."|"einmalig"
    due,                        // day of month (1–31), stored as string
    accountId, note,
    contractStart, contractEnd, // ISO date "YYYY-MM-DD" or "" — contractEnd="" means unbefristet
    overrides,                  // { "2025-3": 900 } — per-month amount overrides
    categoryId,                 // linked category id or null — written by umsaetze.js booking edit
    goalId,                     // linked goal or null
    creditorId                  // linked creditor id or null — written by umsaetze.js booking edit
  }],

  transfers: [{                 // Umbuchungen between accounts
    id, date,                   // ISO date
    fromId, toId,               // ← NOT fromAccountId/toAccountId
    amount, note,
    interval,                   // null | "monatl." | ...
    execDay
  }],

  goals: [{
    id, name, icon, color,
    targetAmount, currentAmount,
    monthlyRate,               // auto-calculated or manual; drives linked Posten amount
    startDate,                 // ISO date — calculation start; stored from gfStart input in goal modal; used as contractStart for auto-created Posten
    deadline,                  // ISO date — target date
    note, accountId            // linked account for the savings Posten
  }],

  categories: [{               // Managed in settings.js; global list from DEFAULT_CATEGORIES seed
    id, name, color, icon      // id = "cat_wohnen" etc. — referenced via categoryId on Posten/Bookings
  }],

  creditors: [{                 // Payees / creditors (optional)
    id, name, email, phone,
    accountId,                  // optional link to one of S.accounts[] (replaces old iban field)
    address, website, note,
    color, icon, logoDomain     // display / avatar customisation
  }],

  bookings: [{                  // DERIVED — rebuilt via initBookings()
    id, postenId, transferId,
    date,                       // "2025-01-15"
    monthKey,                   // "2025-01"
    name, type,                 // "ausgabe"|"einnahme"|"umbuchung"
    amount, baseAmount,
    accountId,
    status,                     // "gebucht"|"vorgemerkt"|"ausgesetzt"|"geändert"|"beglichen"
    note, interval,
    categoryId,                 // written directly when booking has no postenId (standalone bookings)
    creditorId                  // written directly when booking has no postenId (standalone bookings)
  }],

  monthlyIncome, zahltag,       // fallback income + salary day (1–31)
  groupOrder,                   // ["ING","DKB"] — bank group display order
  groupAccOrder                 // { "ING": ["acc_a","acc_b"] } — within-group order
}

// DEFAULT_CATEGORIES (global const in state.js):
// [{ id:"cat_wohnen", name:"Wohnen", color:"#4d9eff", icon:"🏠" }, ...]
// Initialised in migrateState() if S.categories empty.
// Accessible everywhere as DEFAULT_CATEGORIES.
```

---

## Tooltip System

**One system only — no native `title=""` on interactive elements.**

- Custom tooltip: `onmouseenter="_showTooltip('Text', this)" onmouseleave="_hideTooltip()"` — styled dark card, respects `CFG.tooltips`, defined in `tooltips.js`
- Native `title=""` is **only acceptable** on pure overflow-text spans (e.g. `acc-name`, `pv-name-txt`, `ut-card-name`, `donut-bar-name`) where the tooltip shows truncated content — not for interactive buttons or UI controls
- The hybrid pattern `title="…" onmouseenter="…_showTooltip(this.title,this)"` has been eliminated — always pass text inline
- Unification completed in v10.6 across: `index.html`, `accounts.js`, `io.js`, `dashboard.js`, `modal.js`, `pivot.js`, `archive.js`, `jahresuebersicht.js`, `umsaetze.js`, `vertraege.js`, `intro.js`, `settings.js`
- Unification complete in v10.6 — all modules and `index.html` done

---

## Critical Rules

- **`renderPosten()` must NEVER call `initBookings()`** — caused bookings to reappear after reset (fixed in umsaetze.js)
- **`initBookings()` is safe to call after S.data mutation** — deduplicates by postenId+monthKey. Call from save actions, never from render functions.
- **`S.bookings = []` before `initBookings()`** on import or restore only
- **`migrateState()` lives in `io.js`** — `state.js` has a guard stub only
- **`persist()` after every S mutation** — no reactivity, no auto-save watcher
- **`fromId`/`toId` in transfers** — NOT `fromAccountId`/`toAccountId`
- **Pivot reads `S.data`, Umsätze reads `S.bookings`** — two different data sources, totals can differ
- **`fm()` already includes " €"** — never append `+ " €"` or `<span>€</span>` after fm(). `fmShort()` does NOT include €.
- **`saveAccountModal()` is async** — uses `await appConfirm()`. HTML onclick is fine without await.
- **contractEnd = "" means unbefristet** — bookings loop runs to upcomingEnd (+3 months). Do NOT use current-month fallback as endDate.
- **Zahltag priority**: `CFG.zahltag` first, then `S.zahltag`, then 15 as fallback
- **Timezone-safe dates** — NEVER use `toISOString()` for today's date in bookings.js. Use `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}` to avoid UTC shift in CET/CEST.
- **Tutorial blocks app** — `#tutBlocker` (z-index 800, transparent, position:fixed) covers entire viewport while `_tutOpen === true`. Remove only after TV-off animation completes.

---

## Modal System

| Layer | Element | z-index | Opened by |
| ----- | ------- | ------- | --------- |
| Main modal (Posten/Transfer) | `#modalOverlay` | 600 | `openModal()` |
| Account modal | `#accModalOverlay` | 600 | `openAccountModal()` |
| Goals modal | `#goalModalOverlay` | 600 | `openGoalModal()` |
| Archive overlay | `#archiveOverlay` | 600 | `openArchiveOverview()` — now a no-op redirect to `_navTo('archiv')`; archive is a full page |
| Creditor modal | `#creditorModalOverlay` | 700 | `openCreditorModal()` |
| Archive upload modal | `.arch-upload-overlay` | 800 | `_archiveNameAndLink()` in archive.js — Promise-based, name+link |
| Booking inline edit | `#umEditOverlay` | 900 | `_umOpenEdit()` in umsaetze.js — 2-page Apple-style |
| Jahresübersicht booking edit | `#mmBookingEditOverlay` | 1100 | `_mmOpenBookingEdit()` in jahresuebersicht.js |
| Creditor detail popover | `#krPopover` | 1200 | `_krOpenPopover()` in kreditoren.js |
| Custom dialogs | `#appDialogOverlay` | **2000** | `appAlert/Confirm/Prompt()` — always on top |
| Tutorial blocker | `#tutBlocker` | 800 | `openTutorial()` |
| Tutorial reticle | `#tutReticle` | 850 | `_setReticle()` — pointer-events: none |
| Tutorial panel | `#tutPanel` | 900 | `openTutorial()` — position: fixed |

**Click-outside guard pattern:**

```javascript
let _xxxOverlayMousedownOnBg = false;
ov.addEventListener("mousedown", (e) => { _xxxOverlayMousedownOnBg = e.target === ov; });
// onclick: if (_xxxOverlayMousedownOnBg && event.target === this) closeXxxModal();
```

---

## Tutorial System (intro.js)

Floating draggable card (`position: fixed`, default `top: 68px; left: 234px` — overlaps sidebar/content corner).

**3 phases, 16 steps:**

| Phase | Steps | Label |
| ----- | ----- | ----- |
| 1 | 0–5 | Einrichten (username, theme, font, password, zahltag) |
| 2 | 6–13 | App-Tour (KPIs, Konten, Cockpit, Posten, Jahr, Sparziele, Einstellungen, Docs) |
| 3 | 14–15 | Loslegen (demodata, finish) |

**Reticle system:** `_setReticle(el, accent)` creates `#tutReticle` with 4 corner brackets (`.trc-tl/tr/bl/br`), scan line (`.trc-scan`), pulsing glow (`.trc-glow`), label tag (`.trc-label`). Tracks element live via rAF loop. `_clearReticle()` cancels rAF and removes div.

**Panel auto-positioning:** `_positionPanelNearTarget(el)` tries right → left → below → above. Runs at step change + again after scroll settle (340–480ms). CSS `transition: top/left .38s` for smooth movement. `.tut-dragging` class disables transition during drag.

**Navigation timing:**

- Page change (`needsNav = true`): 320ms delay before highlight
- Same page: 40ms delay (render cycle settle)

**Close animation:** Fade content (130ms) → TV-off scanline collapse (`tut-tv-off` keyframe, 550ms) → `_removeBlocker()`.

**Step targets:**

| Step | target | targetFallback |
| ---- | ------ | -------------- |
| 6 | `#kpiRow` | — |
| 7 | `#kontenPanel .acc-card-wrap, #kontenPanel .acc-group` | `#kontenPanel` |
| 8 | `#cockpitCols` | — |
| 9 | `#postenThead` | `#p-posten .panel` |
| 10 | `#p-jahr .panel-head, #p-jahr .ph` | `#p-jahr` |
| 11 | `.goals-main` | `#p-goals` |
| 12 | `.settings-card` | `#p-settings` |
| 13 | `#p-docs .docs-hero` | `#p-docs` |

---

## Booking Lifecycle

```text
New Posten saved (savePosten() in modal.js)
  → S.data gets new entry → persist()
  → initBookings() NOT called — bookings stale until reload!

Account saved with income (saveAccountModal() in accounts.js)
  → S.data gets "Gehalt – [label]" Posten → initBookings() called
  → First-month booking: if contractStart ≤ today → status = "gebucht"

App start / import:
  → hydrate() → migrateState() → S.bookings = [] → initBookings()
    → 5 years back + 3 months forward
    → contractEnd = "" → null endDate → loop to upcomingEnd
    → past/today = "gebucht", future = "vorgemerkt"
    → dedup by postenId + monthKey

Booking visibility:
  "gebucht"    → Umsätze, Dashboard, Jahresübersicht
  "vorgemerkt" → hidden in Umsätze, visible in Dashboard + Jahresübersicht
  "ausgesetzt" → hidden everywhere
  "geändert"   → visible (user edited amount)
  "beglichen"  → visible (user marked paid)
```

---

## Sidebar Navigation

```text
── Übersicht ──
  Dashboard        (Alt+1)
  Transaktionen    (Alt+2)
  Jahresanalyse    (Alt+3)

── Planung ──
  Verträge         (Alt+4)
  Kreditoren       (Alt+5)
  Sparziele        (Alt+6)
  Vision Board     (Alt+7)

── System ──
  Archiv           (Alt+8)   ← now its own page (renderArchivePage → #p-archiv)
  Einstellungen    (Alt+9)
  Über die App     (no shortcut)
```

Nav icons: all `stroke="currentColor"` SVGs. Hover: `color: var(--blue)` + `filter: drop-shadow(0 0 6px var(--blue-a35))`. Topbar icon buttons: same SVG pattern except 💾 (emoji, `font-size: 0.85em`).

---

## IPC Bridge (`window.csf`)

Defined in `preload.js` via `contextBridge`. Always guard with `window.csf?.method`.

```javascript
window.csf = {
  state:       { load(), save(data) },
  settings:    { load(), save(data) },
  visionboard: { load(), save(data) },
  archive:     { list(filter), add(), addBuffer(), getPath(), open(), openDoc(),
                 openFolder(opts), updateNote(), delete(), relinkDocs(),
                 linkDoc(), renameDoc(), size() },
  export:      { full(), fullAuto() },
  import:      { full() },
  safepoints:  { list(), save(label, snapshot), load(filename), delete(filename) },
  print:       { page(options), html(htmlString) },
  storage:     { getPath(), choosePath(), openFolder(), resetPath() },
  license:     { check(), activate(licenseString), info(), machineId(), renew() },
  vault:       { status(), create(password), verifyIntegrity(), unlock(password),
                 recover(recoveryKey), migrateCryptoDb(), lock(), changePw(oldPw, newPw),
                 decryptExport(container) },
}
```

**Archiv: `openDoc(docId)` statt `openPath(path)`** — der frühere `archive:openPath` reichte einen rohen Renderer-Pfad an `shell.openPath` durch (RCE-Risiko). Entfernt. `archive:openDoc` akzeptiert nur eine `docId`; main.js löst sie über `resolveOpenableArchiveFile()` auf (realpath-Recheck, dass die Datei innerhalb `archiveDir()` liegt + Endungs-Allowlist `ARCHIVE_OPEN_ALLOWED_EXT`). Niemals wieder einen Renderer-Pfad direkt öffnen.

**`license:` (Ed25519, asymmetrisch)** — siehe Abschnitt „Lizenz-System".
**`vault:` (Verschlüsselung at Rest, Zero-Knowledge)** — siehe Abschnitt „Verschlüsselung at Rest".

---

## Lizenz-System (Ed25519, asymmetrisch)

**Neu 2026-06-21 — Umstellung von symmetrisch auf asymmetrisch.** Früher: HMAC-Signatur mit hardcoded `MASTER_KEY` + `LICENSE_HMAC_SECRET` in main.js — wer den Build entpackte, konnte beliebige Lizenzen selbst signieren. **Jetzt: Ed25519.** Im Build liegt NUR der öffentliche Schlüssel `LICENSE_PUBLIC_KEY_PEM` in main.js — er kann Signaturen prüfen, aber keine erzeugen. `MASTER_KEY` und `LICENSE_HMAC_SECRET` wurden ENTFERNT.

- **Signier-Tools (NICHT im Build, nur lokal beim Owner):** `tools/gen-license-keys.js` (erzeugt das Ed25519-Schlüsselpaar einmalig), `tools/issue-license.js` (signiert eine Lizenz mit dem privaten Schlüssel). Der private Schlüssel verlässt nie den Owner-Rechner.
- **Hybrid-Modell (zwei Tier-Klassen):**
  - `perpetual` / `owner` → **kein Ablauf**, keine Online-Prüfung, keine Geräte-Bindung.
  - `sub` / `subscription` → **`validUntil`-Gate** + Geräte-Bindung (`node-machine-id`) + **14 Tage Offline-Grace** + Online-Erneuerung + Sperrbildschirm bei Ablauf.
- **Start-Gate:** `gateStartup()` in main.js prüft beim App-Start die Lizenz, bevor das Fenster freigegeben wird.
- **IPC** (`csf.license`): `check()`, `activate(licenseString)`, `info()`, `machineId()`, `renew()`.
- **Owner** = signierte Lizenz mit `tier:owner` (kein Sonderpfad im Code mehr, kein hardcoded Geheimnis).

---

## Verschlüsselung at Rest (Zero-Knowledge)

**Neu 2026-06-21 — opt-in / staged.** Aktivierung über Einstellungen → „Verschlüsselung aktivieren". Implementiert in `crypto-vault.js` (NUR Main-Prozess).

**Krypto-Kette:**

```text
Master-Passwort → Argon2id (KDF) → KEK (Key Encryption Key)
KEK verschlüsselt → DEK (zufälliger 32-Byte Data Encryption Key)
DEK → AES-256-GCM, frischer 12-Byte-IV pro Schreibvorgang
Header AAD-authentifiziert (Anti-Rollback)
→ Datei: vault.enc in dataDir()
```

- **DEK lebt NUR im Main-RAM** — der Renderer bekommt ihn nie. XSS im Renderer kann den Schlüssel daher nicht stehlen.
- **Migration transaktional:** beim Aktivieren wird die bestehende Klartext-DB in den Vault überführt — `vault:verifyIntegrity` + Rollback bei Fehler, kein Teilzustand.
- **Auto-Lock:** der Inaktivitäts-Timer wirft im Vault-Modus den DEK aus dem RAM (`lockVaultNow()`). Danach ist erneutes Entsperren mit Master-Passwort nötig.

**IPC** (`csf.vault`): `status()`, `create(password)`, `verifyIntegrity()`, `unlock(password)`, `recover(recoveryKey)`, `migrateCryptoDb()`, `lock()`, `changePw(oldPw, newPw)`, `decryptExport(container)` — `decryptExport` (IPC `vault:decryptExport`) entschlüsselt einen DEK-Container (`enc`+`vaultbox`) über den entsperrten Vault; von `io.js importAll` beim Re-Import eines verschlüsselten Auto-Backups genutzt.

**Neue Dependencies:** `argon2`, `better-sqlite3-multiple-ciphers` (ersetzt `better-sqlite3` als Require in main.js → SQLCipher-fähig), `node-machine-id`.

### Recovery-Key (Notfall-Schlüssel)

- Beim Aktivieren der Verschlüsselung **EINMALIG** angezeigt — danach nicht wiederherstellbar.
- Format: 25 Zeichen, `XXXXX-XXXXX-XXXXX-XXXXX-XXXXX`.
- Öffnet den Vault bei **vergessenem Master-Passwort** und **überlebt Passwort-Resets** (entschlüsselt den DEK unabhängig vom Master-Passwort).
- Funktion: `unlockWithRecovery()`.

### Seitentüren (Klartext-Lecks im Vault-Modus)

Im Vault-Modus dürfen keine Klartext-Spiegel der Daten zurückbleiben. **Alle 4 Seitentüren sind geschlossen** (Stand 2026-06-21):

- **Seitentür 1 — localStorage-Spiegel (`csf_v1`) abgeschaltet** — im Vault-Modus wird `S` NICHT mehr nach localStorage geschrieben (nur noch in `vault.enc`).
- **Seitentür 2 — Safepoints verschlüsselt** — als DEK-Container statt Klartext-JSON.
- **Seitentür 3 — Export (`export:fullAuto`, Auto-Backup nach Downloads) verschlüsselt** — im Vault-Modus schreibt `export:fullAuto` jetzt ein DEK-verschlüsseltes JSON (kein Klartext). `io.js importAll` erkennt den DEK-Container (`enc`+`vaultbox`) und entschlüsselt ihn über den entsperrten Vault (neuer IPC `vault:decryptExport`, in der `csf.vault`-Bridge ergänzt). `export:full`/`import:full` (main.js) waren ungenutzt. In Electron getestet: kein Klartext in der Datei, identische Wiederherstellung, fremder DEK scheitert.
- **Seitentür 4 — `crypto.db` → SQLCipher** — `PRAGMA temp_store=MEMORY` (keine Klartext-Temp-Dateien) + selbstheilende Migration in `_getCryptoDb()` / `_migrateCryptoDbToEncrypted()`.

### Ehrliche Sicherheitsgrenze (bewusst dokumentiert)

- Client-seitige Verschlüsselung ist eine **hohe Hürde, NICHT unknackbar** — das `asar`-Archiv ist patchbar (lokaler Angreifer mit Root/Admin kann den Renderer-/Main-Code manipulieren).
- Das **Master-Passwort hat keine Wiederherstellung** außer dem Recovery-Code. Verloren = Vault-Daten verloren.

---

## CSS Design System

All tokens in `styles/base.css`. **`--blue` IS the theme accent** — changes per theme, not always blue.

```css
candlescope → --blue: #d4a843  (gold, default)
mono        → --blue: #d4d4d4  (grey/white)
dark        → --blue: #4d8fef  (blue)
crimson     → --blue: #ef4444  (red)
light       → --blue: #0e7c75  (teal, heller Modus)
ivory       → --blue: #946914  (bernstein, warmer heller Modus)

/* Alpha variants (all themes): --blue-a08/a12/a15/a20/a25/a35 */
/* Surfaces: --panel, --panel2, --panel3 */
/* Text: --text, --text2, --text3 */
/* Borders: --border, --border2 */
/* Type: --sans: Space Grotesk  --mono: DM Mono */
/* Radius: --r1: 8px  --r2: 12px */
```

**Shell grid:**

```css
.shell                         → grid-template-columns: 260px 1fr
.shell[data-sidebar="compact"] → grid-template-columns: 52px 1fr
/* .shell.tut-open no longer exists — tutorial is position:fixed */
```

**Sidebar:**

- Border: `box-shadow: inset -1px 0 0 var(--blue-a15), inset -3px 0 16px var(--blue-a06)` — never `border-right`
- Active indicator: `::after` pseudo, left:0, 3px wide, `var(--blue)` + glow
- Section dividers: `.nav-divider` + `<hr class="ndhr"/>` — never old `.nav-section`
- All colors via `var(--blue)` / `var(--blue-aXX)` — never hardcoded

Component styles split: `styles/components/` for new features, individual files in `styles/` for legacy. New in v10.4: `search.css` (Topbar-Pill + Schnellsuche-Overlay).

---

## German Naming Reference

| Code term | Meaning |
| --------- | ------- |
| Posten / `data` | Fixed recurring line items (income/expense) |
| Umsätze / `bookings` | Actual transaction instances (generated from Posten) |
| Umbuchungen / `transfers` | Internal account transfers |
| Jahresübersicht | Annual overview (candlestick charts) |
| Pivot | Monthly grid view with per-cell overrides |
| Zahltag | Salary day — CFG.zahltag (primary), S.zahltag (fallback), 15 (default) |
| Verträge | Contracts / subscriptions — Posten with contractStart or contractEnd |
| Sparziele / Goals | Savings goals |
| Safepoints | App snapshots for rollback (max 10, auto hourly) |
| VL | Vermögenswirksame Leistungen (employer savings subsidy) |
| Unbefristet | Open-ended (contractEnd = "") |

---

## Known Bugs & Weaknesses

**Critical:**

1. **Archive temp ID** — orphaned `new_[timestamp]` docs if save fails mid-way
2. **No transaction rollback** — partial state mutation possible if `persist()` throws
3. ~~**Bookings not regenerated on savePosten()**~~ — Fixed: `_afterSave()` calls `_syncBookingsAfterSerieEdit()` → `_generatePastBookings()` which regenerates all bookings including new Posten.
4. ~~**Archiv-RCE via `archive:openPath`**~~ — **Fixed 2026-06-21:** roher Renderer-Pfad an `shell.openPath` (RCE) entfernt → ersetzt durch `archive:openDoc(docId)` + `resolveOpenableArchiveFile()` (realpath-Recheck innerhalb `archiveDir()` + Endungs-Allowlist `ARCHIVE_OPEN_ALLOWED_EXT`). `archive:addBuffer` gehärtet (Endung auf `[a-z0-9]` kanonisiert, 20 MB Cap). Pfad-Traversal in `archive:openFolder` + `safepoints:load/delete` mit `path.basename` geschlossen.
5. ~~**Seitentür 3 — `export:fullAuto` (Auto-Backup nach Downloads) noch Klartext**~~ — **Geschlossen 2026-06-21:** im Vault-Modus schreibt `export:fullAuto` jetzt ein DEK-verschlüsseltes JSON (kein Klartext). `io.js importAll` erkennt den DEK-Container (`enc`+`vaultbox`) und entschlüsselt ihn über den entsperrten Vault (neuer IPC `vault:decryptExport`, in der `csf.vault`-Bridge ergänzt). `export:full`/`import:full` (main.js) waren ungenutzt. In Electron getestet (kein Klartext in der Datei, identische Wiederherstellung, fremder DEK scheitert). **Damit sind alle 4 Seitentüren geschlossen** (state.json, Safepoints, crypto.db/SQLCipher, Export).

**High:**

1. **SHA-256 without salt** — betrifft nur den alten **Lockscreen-Passwortschutz** (`lockscreen.js`, `sha256()`), nicht den Vault. Der **Vault-Modus** leitet das Master-Passwort über **Argon2id** ab (siehe „Verschlüsselung at Rest"). Lockscreen-Hash selbst sollte noch auf scrypt/Argon2 migriert werden.
2. **XSS via user input** — `esc()` exists but not consistently used in all render paths. **Mitigation im Vault-Modus:** der DEK lebt nur im Main-RAM, ein XSS im Renderer kann den Verschlüsselungs-Schlüssel daher nicht stehlen.
3. **Pivot vs Umsätze totals differ** — by design: Pivot reads `S.data`, Umsätze reads `S.bookings`; known and acceptable
4. **Booking overrides lost on import** — overrides are on booking objects which are regenerated
5. **`activeInMonth()` modulo fragile** — missing contractStart month defaults to 0

**Medium:**

1. Due day 31 in 28/30-day months — falls on last day without warning
2. Filter overlay not cleaned up on destroy — memory leak risk
3. Inline balance editor accepts any string — no validation
4. Safepoint auto-interval 1 hour — up to 1h data loss on crash
5. ~~`donutInst` Chart.js global not destroyed before re-render~~ — **Fixed in v10.6**: `donutInst.destroy()` + `_miChartInst.destroy()` both implemented before re-render

**Fixed in v10.5:**

- Sidebar Overlay-Drawer: bei ≤1100px öffnet Sidebar als `position:fixed` Overlay (schiebt sich über Content, kein Push). `.shell.sidebar-open` Klasse. Transparentes Backdrop nur für Click-outside. Close-Button (`.sbar-overlay-close`) erscheint nur in Overlay-Modus. `_closeSidebarOverlay()` / `_isSidebarOverlayMode()` in index.html. Topbar + Main erhalten `grid-column: 2` wenn Sidebar overlay ist (Fix: halb leere Seite).
- Vision Board Panel Toggle: `_vbPropsCollapsed = true` (default eingeklappt). Toggle-Button in Topbar (`vbPanelToggle`). `.vb-shell.vb-props-hidden` blendet Panel aus (width→0, opacity→0, transition). Icons `panel-right-close` / `panel-right-open` im `_vbSvgIcon`-PathMap.
- Einstellungen Layout: `fontCard` full-width (`settings-card--full`); Zahltag-Row direkt in `behavCard` integriert (kein separates ztCard mehr). `behavCard` Titel: "Verhalten & Zahltag". `font-options` Grid: `repeat(6, 1fr)` da full-width. Reihenfolge: fontCard → bgCard/behavCard → storCard/promoCard → pwCard/catCard/dataCard.
- Jahresanalyse Ist/Prognose-Split: `_buildCandleData()` gibt `todayKey` zurück. In `_refreshCandleChart()` werden Daten am heutigen Bucket gesplittet: Ist-Daten (solid/volle Farbe) + Prognose-Daten (gestrichelt/transparent). Gilt für alle Chart-Typen (candle/bar/line/area) und alle Serien (investLine, netLine, incLine, expLine). Verbindungspunkt (letzter Ist-Candle) wird als erster Prognose-Punkt wiederholt.
- Jahresanalyse VL-Depot-Fix: `_buildCandleData()` — Buchungen von `investIds`-Konten (depot/vl/festgeld) mit `include:false` wurden bisher als `{inc:0,exp:0,invest:0}` verworfen. Fix: `forInvest = !forMain && investIds.has(bk.accountId)` → VL-Einnahmen landen in `investLine`.
- Dashboard Hero Responsive: kein Wrap mehr bei engem Viewport. Stattdessen stufenweise Komprimierung: 1101–1380px (leicht), 1101–1200px (stark, Font 1.15em). Alle Regeln per `.shell:not([data-sidebar="compact"])` gescoped — greift nur wenn Nav offen ist.
- Dashboard Zahlungsübersicht Trigger: `alreadyProcessed` prüft `status === "beglichen" || status === "gebucht"` (nicht mehr nur `beglichen`). `urgent`-Flag nur noch für `dd > day` (exklusive heute). Neues `dueToday`-Flag wenn `dd === day` → `.due-today`-Klasse + roter "Heute"-Pill statt Tagesnummer. Styles in `dashboard.css`: `.due-row.due-today` mit rotem Border/Glow, `.due-day-pill` rot.
- VL Depot Kontenanzeige: `_accNumberDisplay(acc)` Helper in `state.js` — gibt `"Depot •XXXX"` für `accountType === "depot"|"vl"` zurück, `"Ablauf MM/YY"` für Kreditkarte, sonst `ibanLast4()`. In `modal.js` verwendet für Transfer-Tab Konto-Auswahl (ersetzt inline Logik).
- Transaktionen Kat/Kred bei gebucht ohne Posten: `_umSaveEdit()` in `umsaetze.js` schreibt `categoryId`/`creditorId` direkt auf das Booking-Objekt wenn `!bk.postenId` (kein verlinkter Posten). Bei vorhandenem `postenId` werden Posten-Felder aktualisiert wie bisher.
- Pivot Transfer-Buchungen: `ausgesetzt`-Check bereits in `_pvCellAmt()` (returns 0 wenn `S.bookings` eine passende `ausgesetzt`-Buchung für `transferId + monthKey` enthält). Gelöschte Transfers erzeugen keine Pivot-Zeile da `_pvBuildRows()` `S.transfers` direkt iteriert.
- Responsive Phase 1–3: CSS-Fixes für `styles/layout.css`, `styles/components/jahresuebersicht.css`, `styles/components/dashboard.css`. Grid-Breakpoints für Jahresübersicht Month-Grid (1-spaltig @500px), Donut-Größen @500px. Explicit `grid-column`/`grid-row` auf `.sidebar`, `.topbar`, `.main` um CSS-Grid Auto-Placement-Bug zu verhindern.
- Sidebar Overlay Labels Fix: Bei ≤1100px zeigte Overlay-Sidebar nur Icons (kein Text), weil `data-sidebar="compact"` aus localStorage auch bei ≤1100px gesetzt war. Fix in `index.html`: Restore-Script setzt compact-Attribut nur bei `window.innerWidth > 1100`; Resize-Handler entfernt compact-Attribut bei ≤1100px. CSS: Große `.shell.sidebar-open`-Override-Sektion in `@media (max-width: 1100px)` stellt alle Label-/Layout-Styles explizit zurück.
- Sidebar Öffnungs-Animation Desktop: Labels und `#sidebarGreeting` "ploppten" sofort beim Öffnen ein. Fix in `styles/layout.css`: BASE-Transitions für `.sbar-brand-name` / `.nav-item > span` auf `delay: 0.22s` (max-width/margin) und `0.36s` (opacity) gesetzt → Labels erscheinen erst wenn Sidebar ~fertig offen ist. `#sidebarGreeting` wechselt von `display: none !important` auf `opacity: 0 !important; max-height: 0 !important` im compact-State + BASE-Transition `opacity 0.15s ease 0.4s` → Benutzername blendet erst nach vollständigem Öffnen ein. Schließ-Richtung unverändert schnell.
- Topbar Overflow <700px: `@media (max-width: 700px)` in `styles/layout.css` — `.topbar-divider { display: none }`, `.topbar-search-pill { display: none }` (Ctrl+K bleibt funktional), `.topbar-right { gap: 4px }`, `.topbar-group { gap: 2px }`, `.topbar-title` mit `text-overflow: ellipsis` + `max-width: 120px`. Bestehende `@media (max-width: 1024px)`-Regel versteckt Gruppe 1 (Print/Export/Import) bereits.
- **Technisches Debt (bewusst offen):** Breakpoint-Inkonsistenz (#16 aus Responsive-Plan) — 23 verschiedene `max-width`-Werte quer durch alle CSS-Dateien (420px–1400px). Unification auf 500/700/900/1100/1200px erfordert visuelles Regression-Testing pro Komponente.

**Fixed in v10.6:**

- Globale Schnellsuche: Seiten (alle Nav-Items) als Gruppe „Seiten" durchsuchbar — `_NAV_PAGES` Array in `_renderSearchResults()` mit keywords pro Seite. Seiten-Icons als `.sr-page-icon` Emoji-Badge in Suchergebnissen (`search.css`).
- Transaktionen Kategorie-Spalte: `.um-row-cat` + `.um-cat-icon` in `_renderUmList()` — eigene Spalte neben dem Bezeichnungs-Bereich. Zebra-Striping (`:nth-child(even)`) + linker Typ-Border via `[data-type="einnahme/ausgabe/umbuchung"]` in `posten.css`.
- Transaktionen Konto-Schnellfilter: `<select class="um-acc-quick">` direkt in der Toolbar — setzt `_umFilter.accountId` ohne Overlay.
- Transaktionen Suche: `onkeydown Enter`-only statt `oninput` — verhindert Fokusverlust. Suche ignoriert `_umFocusMonth` wenn `_umFilter.search` aktiv — durchsucht alle Monate.
- Buchung-Bearbeiten Modal Konto-Dropdown: `.acc-select-menu` auf `position: fixed` in `modal.css` + `getBoundingClientRect()` in `_toggleAccDropdown()` — kein Overflow-Clipping durch Modal-Container mehr.
- Theme-Wechsel smooth: `applySettings()` entfernte `removeAttribute("data-theme") + void offsetHeight` Reflow-Trick der CSS-Transitions blockierte — jetzt direkt `setAttribute` → 200ms Transitions auf Body/Panel/Sidebar/Topbar greifen.
- Vision Board Canvas Light/Ivory: `--vb-canvas-bg` für `[data-theme="ivory"]` ergänzt (`#f0e9d4`). `.vb-canvas-wrap` nutzt `background-color` (nicht Shorthand) + `transition: background-color 0.28s`. `.vb-dash-preview` hardcode `#0e0e0e` → `var(--vb-canvas-bg)`.
- Light/Ivory Hintergrund-Raster: `[data-theme="light/ivory"] .bg::after` Overlay von 72–92% auf 30–44% Deckkraft reduziert — Raster-Pattern war vollständig verdeckt. Raster-Opazität in `_applyDefaultBgPattern()` erhöht (gridColor 0.16, dotColor 0.38 für Light).
- Tooltip-Vereinheitlichung vollständig abgeschlossen in v10.6 — kein `title=""` mehr auf interaktiven Elementen.

**Fixed in v10.4:**

- Globale Schnellsuche (Ctrl+K): `openSearch()` / `closeSearch()` / `_renderSearchResults()` in nav.js — vollständig DOM-basiert (kein innerHTML). Topbar-Pill `.topbar-search-pill` als sichtbarer Einstiegspunkt. Sucht über Posten, Konten, Buchungen (letzte 200), Sparziele, Verträge, Kreditoren. Arrow+Enter-Navigation. `_highlightText()` via `createElement("mark")`.
- VL-Konto monatlicher Beitrag: `accFVlRateRow` in Account-Modal für `accountType === "vl"`; `saveAccountModal()` erstellt/aktualisiert/löscht "VL-Beitrag – {label}" Posten automatisch. Gespeichert als `acc.vlMonthlyRate`.
- Kreditor-Filter in Transaktionen: `_umFilter.creditorId` — prüft `b.creditorId` direkt oder via verlinktem Posten. Chips in Filter-Overlay (Muster `umFKred_${c.id}`).
- Jahresübersicht Prognose: gestrichelte Verlängerungslinie ab aktuellem Monat (3-Monats-Durchschnitt, `borderDash: [6,4]`).
- Jahresübersicht Budget vs. Ist: Soll-Linie aus aktiven Ausgaben-Posten als gestrichelter Chart.js-Dataset.
- Jahresübersicht Summary Panel: `_renderJahresSummary()` — 6 KPI-Cards (Einnahmen/Ausgaben/Netto/Sparquote/Bestes/Schlechtestes Monat), DOM-only.
- Jahresübersicht Drill-Down: 4. Tab "Kategorien" im Monats-Modal + 5. KPI-Card (Δ Vormonat) + "Transaktionen →" Button.
- Jahresübersicht MA Toggle: `_jahrMA` bool — "∿ MA" Button schaltet 3-Monats-Moving-Average-Linie um.
- Jahres-Export: `_exportJahresBericht()` → `window.csf.print.html()` — 2-seitiger PDF-Report mit KPIs + Monatstabelle.
- Pivot Konto-Filter: `_pvFilterAccount` Dropdown in Toolbar — filtert Zeilen nach Konto, reset in `_pvResetOrder()`.
- Kategorien-Auswertung im Dashboard: `renderKatAuswertung()` → `#katAuswertung` — Ausgaben-Balken nach Kategorie mit Monatsnavigation + Klick → Transaktionen.
- Budgetwarnung: `_checkBudgetWarning()` — Toast bei ≥80% und ≥100% monatlicher Ausgaben vs. Einkommen, einmal pro Monat per sessionStorage.

**Fixed in v10.3:**

- Dashboard Zahltag: `daysToZ === 0` now shows "Zahltag ist heute" text; `dObj <= nextZahltag` keeps same-day payments visible
- VL Depot: `updateAccNumberFields()` treats `accountType === "vl"` same as `"depot"` — shows Depotnummer field
- Verträge Badge: redesigned as 6px pulsing dot; auto-dismissed via `sessionStorage` on first page visit
- Kreditoren: account dropdown uses `<optgroup>` per bankGroup; card popover shows group prefix
- Sparziele: live Feedback-Panel with slider — shows rate/months/remaining/status; slider range auto-scales to 2.5× optimal rate
- Transaktionen: Kategorie + Kreditor selects now always visible in booking edit; writes to `bk.categoryId`/`bk.creditorId` when `!bk.postenId`; category filter also checks `bk.categoryId` directly
- Pivot: Transfer cells check `S.bookings` for `status === "ausgesetzt"` on matching `transferId + monthKey` → returns 0
- Einstellungen: `fontCard` + `bgCard` changed to plain (not `--full`); append order restructured for balanced 2-col layout
- Archiv: Explorer layout (sidebar + main panel), sort controls (date/name/size), `_archRefreshAfterEdit()` for live reload without full page re-render, `await renderArchivePage()` after upload
- Vision Board: `_vbCenterOnNodes()` auto-centers on existing nodes after load; props panel always 200px visible with Aktionen + Canvas sections in idle state
- Über die App: version bumped to v10.3, two new changelog entries (v10.2 + v10.3), feature count 22, Kreditoren feature added

**Fixed in v10.2:**

- Pivot Konto/Typ/Alle group buttons now correctly update active class (`_pvSetGroup` + `renderPivot`)
- Dashboard Cockpit: same-day salary+payment now included (`<=` not `<`)
- Goals `startDate` fully implemented — stored on goal, used as `contractStart` for linked Posten
- Umsätze booking edit now writes Kategorie + Kreditor back to linked Posten
- Verträge Zahltag change triggers `appConfirm` → rewrites `vorgemerkte` booking dates with day-clamping
- Verträge table now shows Kategorie + Kreditor columns
- Archive is now a full page (Alt+8) with category grid, KPI cards, and redesigned upload modal

---

## Export Format (.fbs)

```json
{
  "meta": { "type": "manual|safepoint|auto", "version": "10.0", "date": "...", "timestamp": 0 },
  "data": { "accounts": [], "data": [], "transfers": [], "goals": [], "bookings": [],
            "monthlyIncome": 0, "zahltag": 15, "groupOrder": [], "groupAccOrder": {} }
}
```

`importAll()` handles: `raw.data`, `raw.state`, or `raw` directly.

---

## Settings Object (CFG)

```javascript
CFG = {
  theme: "candlescope",    // candlescope|electric|aurora|red|mono|dark
  font: "default",         // default|barlow|inter|outfit|syne
  fontSize: 15,
  autosave: true,
  privacyAutoLock: false,
  userName: "",
  bgImage: null,           // data URL or null
  bgFit: "cover",
  pwEnabled: false,
  zahltag: 15,
  tooltips: true
}
```

---

## Docs Reference

- `docs/Entwicklerplan.md` — architecture, state schema, data flow, CSS system
  - **Note:** Transfer fields listed as `fromAccountId`/`toAccountId` — actual code uses `fromId`/`toId`
- `docs/Entwicklungsplan-Endphase.md` — **active task list** for v10.x final phase; v10.3 tasks all complete, v10.2 section marked done
- `docs/Buildanleitung.md` — build steps, asset generation, release checklist
- `docs/Bedienungsanleitung.md` — user manual

---

## Responsive-Plan (v10.5 Ziel)

Audit-Stand: April 2026. Die App ist Desktop-optimiert (1200px+). Folgende Probleme wurden identifiziert und priorisiert.

### Globale Breakpoint-Stufen (zu etablieren)

```css
/* Ziel-System — noch nicht implementiert */
/* --bp-sm:  500px  → 1-spaltig, kompakt */
/* --bp-md:  700px  → 2-spaltig, Sidebar compact */
/* --bp-lg:  900px  → 3-spaltig, Vollansicht */
/* --bp-xl:  960px  → Desktop-Standard */
```

### Phase 1 — Kritische Fixes (Quick Wins)

| # | Problem | Datei | Fix |
|---|---------|-------|-----|
| 1 | Sidebar kein Auto-Collapse | `styles/layout.css` | `@media (max-width: 700px)` → `grid-template-columns: 80px 1fr` — `.shell[data-sidebar="compact"]`-Klasse bereits vorhanden |
| 2 | Jahresübersicht Month-Grid immer 4-spaltig | `styles/components/jahresuebersicht.css` | Breakpoints: `@960px` → 3-spaltig, `@700px` → 2-spaltig, `@500px` → 1-spaltig |
| 3 | Verträge KPI-Strip immer 4-spaltig | `styles/components/contracts.css` | `@media (max-width: 700px)` → `repeat(2, 1fr)` |
| 4 | Search-Box ignoriert Sidebar-Breite | `styles/components/search.css` | `max-width: calc(100vw - 292px)` statt `calc(100vw - 32px)` |
| 5 | Topbar Overflow bei <700px | `styles/layout.css` | Search-Pill verstecken bei <700px; Icon-Groups komprimieren |
| 6 | Transaktionen Card-Grid zu eng | `styles/components/posten.css` | `minmax(230px)` → `minmax(180px)`; 1-spaltig @500px |

### Phase 2 — Komponenten

| # | Problem | Datei | Fix |
|---|---------|-------|-----|
| 7 | Monats-Modal KPI-Row 5-spaltig | `styles/components/jahresuebersicht.css` | `@media (max-width: 500px)` → `repeat(2, 1fr)` |
| 8 | Cockpit-Cols kein Wrap | `styles/components/dashboard.css` | `@media (max-width: 700px)` → 1-spaltig |
| 9 | Donut Charts feste 140/156px | `styles/components/dashboard.css` | `@media (max-width: 500px)` → 100/120px |
| 10 | Dashboard Hero-Strip Wrap-Timing | `styles/components/dashboard.css` | Breakpoint von 860px → 700px |
| 11 | Verträge Tabelle min-width: 640px | `styles/components/contracts.css` | Spalten bei <700px verstecken oder Font/Padding komprimieren |
| 12 | Modal-Side bei kleinen Fenstern | `styles/modal.css` | `@media (max-width: 900px)` → `display: none` |

### Phase 3 — Polish

| # | Problem | Datei | Fix |
|---|---------|-------|-----|
| 13 | Toast max-width: 360px | `styles/components/toast.css` | `@media (max-width: 400px)` → `calc(100vw - 24px)` |
| 14 | Modal-Header kein text-overflow | `styles/modal.css` | `h3 { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }` |
| 15 | Modal-Tabs Overflow | `styles/modal.css` | `overflow-x: auto` auf Tab-Row |
| 16 | Inkonsistente Breakpoints | Alle Dateien | Vereinheitlichen auf 500/700/900/960px |

### Testing-Fenstergrößen

- **500px** — Minimum (Sidebar collapsed, 1-spaltig überall)
- **700px** — Tablet-klein (Sidebar auto-compact, 2-spaltige Grids)
- **900px** — Desktop-klein (Standard-View minimal)
- **1200px+** — Vollansicht (kein Scroll nötig)

---

---

## Verbesserungsvorschläge

### Perspektive: User · Admin/Entwickler · Online-Verkauf · Rebranding · Jahresübersicht — Stand April 2026

---

## Als User (tägliche Nutzung)

### UX & Workflow

- **Globale Schnellsuche (Cmd+K)** — keine übergreifende Suche vorhanden. Wer nach "Spotify" sucht muss wissen auf welcher Seite es steht. Spotlight-Suche über alle Posten, Buchungen, Ziele und Konten würde massiv Zeit sparen.
- **Inline-Quick-Add** — jeder neue Posten erfordert das volle Modal. Direkteingabe in der Umsätze-Tabelle (wie Notion) würde den täglichen Flow stark beschleunigen.
- **Budgetwarnung** — kein aktiver Alert wenn z.B. 80% des Monatsbudgets erreicht sind. Dashboard zeigt es, aber nichts alertet proaktiv.
- **Undo/Redo (Ctrl+Z)** — kein Undo. Versehentlich gelöschter Posten ist bis zum nächsten Safepoint verloren.
- **Wiederkehrende Buchungen aktiv bestätigen** — Status wechselt automatisch auf "gebucht" sobald `today >= date`. Ein optionaler "Bestätige heutige Buchungen"-Flow wäre näher an echtem Banking.
- **Dark/Light Systemfolge** — App folgt nicht dem OS-Theme automatisch. Wer nachts Dark und tagsüber Light will, muss manuell umschalten.
- **Mehrere Profile** — single-user only. Paare mit getrennten + gemeinsamen Finanzen sind eine große Zielgruppe.
- **Direktanhang in Umsätze** — Archiv-Verknüpfung geht nur über Verträge, nicht direkt aus der Buchungszeile.
- **Kategorien-Auswertung** — Kategorien sind implementiert, aber es gibt noch keine Seite/Chart die Ausgaben nach Kategorie summiert. Ein Donut nach Kategorie auf dem Dashboard oder als eigener Reiter wäre die logische Fortsetzung.

---

## Als Admin / Entwickler

### Code-Qualität & Stabilität

- **Kein Test-Framework** — zero Tests. Jede Änderung an `bookings.js` oder `state.js` kann unbemerkt Berechnungsfehler einführen. Jest + Unit-Tests für `initBookings()`, `fm()`, `activeInMonth()` sind Pflicht vor Public Release.
- **Global-Scope-Problem** — alle 26 Module dumpen in `window`. Namenskollisionen möglich und schwer debuggbar. Migration zu ES Modules würde die Codebase robust machen.
- **Kein Error Boundary** — wenn ein Render-Aufruf wirft, sieht der User eine leere Seite. `window.onerror` Handler mit Toast wäre das Minimum.
- **`persist()` ohne Batching** — jede Mutation schreibt sofort komplett in localStorage + IPC. Bei 1000+ Buchungen merkbar. Debounced persist (300ms) würde helfen.
- ~~**CSV-Export unsicher**~~ — **Fixed in v10.6**: RFC 4180 Escaping korrekt implementiert (`replace(/"/g, '""')` auf allen Textfeldern).
- **Archiv Temp-ID Leak** — verwaiste `new_[timestamp]` Einträge bei fehlgeschlagenem Save bleiben. Cleanup-Job beim App-Start nötig.
- ~~**Print-Fenster ohne Cleanup**~~ — Fixed: `pw.on("closed", ...)` Handler bereits in main.js implementiert.
- **SHA-256 ohne Salt** — Passwort per Rainbow-Table knackbar. `bcrypt` oder `scrypt` via Node-Crypto in main.js wäre die richtige Lösung.
- ~~**`donutInst` nicht destroyed**~~ — **Fixed in v10.6**: `donutInst.destroy()` + `_miChartInst.destroy()` implementiert (dashboard.js:873–875, 1187).

### Build & Deployment

- **Auto-Updater fehlt** — kein `electron-updater`. User muss neue Version manuell laden und installieren. Bei Paid-Product ist das ein Churn-Faktor.
- **Windows Code-Signing fehlt** — Installer nicht signiert, SmartScreen blockiert Installation bei Neukunden. `certificateFile` in electron-builder.json nötig.
- **Kein Crash-Reporting** — bei App-Crash erfährt der Entwickler es nicht. Sentry oder anonymisiertes selbst-gehostetes Logging würde helfen.
- **Kein Changelog** — kein `CHANGELOG.md`. User weiß nach Update nicht was neu ist.

---

## Für Online-Verkauf / SaaS-Transition

### Produkt & Monetarisierung

- **Pricing-Modell definieren** — Einmalkauf (€29–49, schafft Vertrauen), Abo (€3–5/Monat, für Sync/Features), oder Freemium (Basis kostenlos, Premium für Multi-Device). Einmalkauf empfohlen für den Start — niedrigere Einstiegshürde, kein Abo-Frust.
- **Landing Page** — keine Marketing-Website vorhanden. Eine One-Pager mit 60-Sekunden-Demo-Video, 3 Key-Features ("Vollständig offline. Keine Cloud. Deine Daten gehören dir.") und CTA (Gumroad/Lemon Squeezy) ist das Minimum.
- **Web-Demo** — statische Browser-Version ohne Electron (nur localStorage, kein `window.csf`) als "Try before you buy". Die Blocking-Points: `window.csf` durch Browser-APIs ersetzen (IndexedDB, File System Access API). Realistisch in 2–3 Wochen machbar.
- **Offline als USP vermarkten** — "Keine Cloud, keine Telemetry, keine Weitergabe" ist in der aktuellen Privacy-Debatte ein starkes Alleinstellungsmerkmal. Explizit auf Landing Page und in App kommunizieren.
- **DSGVO** — technisch compliant (alles lokal), aber nirgends dokumentiert. Privacy-Policy die das erklärt + "Wir wissen nicht wer du bist" als Feature framen.
- **Review-System** — dezenter "Gefällt dir die App?" Dialog nach 30 Tagen Nutzung. Social Proof ist für Indie-Apps der wichtigste Conversion-Faktor.
- **Mehrsprachigkeit (i18n)** — gesamte UI hardcoded Deutsch. Für internationalen Markt wäre i18n nötig. Frühzeitig angehen bevor die Codebase noch größer wird.

### Technische Voraussetzungen für Online / Multi-Device

- **Auth-System** — für Cloud-Sync oder Multi-Device braucht es Auth. Empfehlung: Clerk oder Supabase Auth (OAuth), kein eigenes Password-System bauen.
- **Sync-Backend** — Supabase (PostgreSQL + Realtime) oder PocketBase (self-hosted). Das `.fbs`-Format ist bereits gut für API-Transport geeignet.
- **Web-Version** — Electron-Code ist größtenteils Web-Standard. `window.csf` durch Browser-APIs ersetzen (IndexedDB statt IPC, File System Access API statt Native Dialogs). Realistisch in 2–3 Wochen für eine funktionsfähige Browser-Version.
- **Subscription-Infrastructure** — Lemon Squeezy oder Paddle für Zahlungen (beide mit EU-VAT-Handling). Keine eigene Payment-Infrastruktur bauen.
- **Audit Log** — für eine online angebotene Finance-App sollte jede Datenmutation geloggt werden. Fehlt komplett.

### Feature-Prioritäten vor Public Launch

1. **Auto-Updater** (electron-updater) — ohne das ist jede neue Version ein manueller Akt für den User
2. **Windows Code-Signing** — SmartScreen-Warning tötet Conversion bei Windows-Nutzern
3. **Kategorien-Auswertung** — Kategorien sind da, Auswertung fehlt noch
4. **Globale Suche** — ohne Suche ist die App ab 20+ Posten unübersichtlich
5. **Onboarding-Video** — Tutorial ist gut, aber 60s-Video auf Landing Page konvertiert deutlich besser
6. **Export zu DATEV/CSV (korrekt escaped)** — für Selbstständige die Daten an Steuerberater weitergeben müssen
7. **Mobile-Eingabe** — Companion PWA oder responsives Web-Interface zum schnellen Eintragen unterwegs

---

## Rebranding — Ideen & Strategie

### Warum überhaupt rebranden?

"Candlescope" ist technisch korrekt (Candlestick-Charts + Scope/Überblick), aber erklärungsbedürftig. Für Finance-Apps entscheiden Nutzer in Sekunden — der Name muss sofort Vertrauen und Klarheit kommunizieren. Ein Rebrand vor dem ersten Public Release kostet fast nichts; nach 10.000 Nutzern ist er schmerzhaft.

### Namensrichtungen

#### Richtung 1 — Klarheit & Vertrauen (direkt)

- **Finio** — kurz, modern, klingt nach "Finance" + "Finish". Domainfreundlich.
- **Ledgr** — Anglizismus für Hauptbuch (Ledger). Tech-affin, minimalistisch.
- **Haushalt Pro** — ehrlich, SEO-stark für DACH-Markt, kein Erklärbedarf.
- **Kontowerk** — deutsch, handwerklich, solide. "Werk" impliziert Offline-Arbeit.

#### Richtung 2 — Premiumgefühl & Emotion

- **Aurum** — Latein für Gold; passt zum Gold-Candlescope-Theme. Klingt hochwertig.
- **Vaultly** — Safe/Tresor-Metapher. Offline + sicher. Leicht merkbar.
- **Solido** — solide, stabil, lateinisch. Vertrauensanker für Finanzen.
- **Moneta** — römische Göttin des Geldes, Mutter der Münzen. Klassisch + einprägsam.

#### Richtung 3 — Technisch & Modern (Indie-Dev-Vibe)

- **Pocketlog** — lokal, tagebuchähnlich, klar. Aber "Pocket" ist verbrannt (Pocket App).
- **Stackr** — für die Stack/Stapel-Metapher von Finanzen. Trendig aber kurzlebig.
- **Clearbook** — klarer Buchhaltungs-Begriff. International verständlich.

### Empfehlung

**Aurum** oder **Finio** für den deutschen Markt. Beide sind domain-freundlich, funktionieren auf einer Landing Page, und kommunizieren ohne Erklärung "Geld, hochwertig, Desktop-Software". Candlescope kann als Produktlinie-Name erhalten bleiben (z.B. "Finio FinanceBoard").

### Visuelle Identität

- **Wordmark statt Icon** — für eine Desktop-App mit kleinem Window-Icon funktioniert ein sauberer Schriftzug besser als ein komplexes Logo. Space Grotesk Bold passt bereits gut.
- **Gold-Akzent beibehalten** — der `candlescope`-Theme-Gold (`#d4a843`) ist ein starkes Markenzeichen. Kein Blau-Standard-SaaS.
- **Splash-Screen** — aktuell kein Splash. Kurzer Fade-in mit Wordmark + Version beim Start wäre Markenmoment #1.
- **Icon-Set konsolidieren** — App nutzt Lucide-ähnliche Stroke-SVGs sehr konsistent. Weiter so; kein Wechsel zu Filled Icons.
- **Titelleiste** — Custom Electron titlebar (frameless + eigene Controls) würde die App von "Electron-Grau" abheben und zum Premium-Gefühl beitragen.
- **Farb-Naming** — Themes intern umbenennen: `candlescope → gold`, `electric → mint`, `aurora → violet`, `red → crimson`, `mono → slate`, `dark → ocean`. Kommuniziert Emotion statt Technik.

### Branding in der App

- **Über die App-Seite** (`docs.js`) zeigt Versionsnummer und App-Name. Hauptort für Rebrand-Rollout.
- **Settings-Promo-Card** (bereits vorhanden) — idealer Platz für Brand-Messaging; derzeit "Candlescope Services". Nach Rebrand entsprechend anpassen.
- **Titelleisten-Text** — in `main.js` gesetzt via `new BrowserWindow({ title: "Candlescope FinanceBoard" })`. Einzige Stelle zum Ändern.
- **Installer-Name** — in `electron-builder.json` unter `productName`. Ändert auch Startmenü-Eintrag.
- **AppData-Pfad** — `%APPDATA%/candlescope-financeboard/` — bei Rebrand unbedingt Migration-Code schreiben der alten Pfad liest, bevor auf neuen Pfad gewechselt wird. Datenverlust-Risiko!

---

## Jahresübersicht — Verbesserungsvorschläge (ausführlich)

Die aktuelle Jahresübersicht zeigt Candlestick-Charts pro Monat und eine Übersichtslinie. Das ist ein guter Start, aber es fehlen die Analyse-Schichten die aus "ich sehe meine Daten" ein "ich verstehe meine Finanzen" machen.

### 1. Monatlicher Drill-Down

**Problem:** Klick auf einen Candlestick-Monat passiert nichts. Der User sieht nur die aggregierten OHLC-Werte.

**Lösung:** Klick auf Monat öffnet ein Side-Panel (rechts, 320px, `position:sticky`) oder scrollt zu einer Detailzeile unter dem Chart. Inhalt:

- Top-5 Ausgaben des Monats (Kategorie + Betrag)
- Alle Einnahmen des Monats
- Vergleich zum Vormonat (+/- Betrag + Prozent)
- Buchungen mit Status "geändert" (User hat manuell eingegriffen)
- Direktlink zu Transaktionen gefiltert auf diesen Monat

### 2. Kategorie-Stacked-Bars

**Problem:** Candlestick zeigt Gesamt-Cashflow, aber nicht wohin das Geld fließt.

**Lösung:** Zweite Chart-Reihe unter dem Candlestick: horizontale oder vertikale Stacked-Bar pro Monat, aufgeteilt nach Kategorie. Farben aus `S.categories[].color`. Hover zeigt Kategorie-Name + Betrag + % vom Monat.

Technisch: Chart.js Bar-Chart mit `stacked: true`. Daten aus `S.bookings` gefiltert + gruppiert nach `postenId → Posten.categoryId`.

### 3. Jahresvergleich (Overlay)

**Problem:** Man kann nicht sehen ob dieses Jahr besser oder schlechter als das letzte war.

**Lösung:** Dropdown "Vergleichsjahr" (leer = kein Vergleich). Wenn gesetzt: zweite halbtransparente Linie im Chart (gestrichelt, `opacity: 0.4`). Tooltip zeigt beide Jahre nebeneinander: `2025: -320 € | 2024: -190 €`.

### 4. Budget vs. Ist — Linienchart

**Problem:** Es ist unklar ob der User im Plan liegt oder schon überzogen hat.

**Lösung:** Monatliches Soll (Summe aller aktiven Ausgaben-Posten für den Monat aus `S.data`) als horizontale Referenzlinie. Ist-Ausgaben als zweite Linie. Fläche zwischen den Linien grün (unter Budget) oder rot (überzogen) füllen. Einzige Datenquellen nötig: `S.data` (Soll) + `S.bookings` (Ist).

### 5. Nettovermögens-Tracker (Sparkline)

**Problem:** Die App kennt alle Kontostände (`S.accounts[].balance`) aber visualisiert deren Entwicklung nicht.

**Lösung:** Schmale Sparkline-Zeile oben im Chart-Bereich: Nettovermögen = Summe aller `include=true` Konten. Da die App historische Buchungen kennt, kann sie die Kontostände rückwärts errechnen (aktueller Stand minus/plus historische Buchungen). Zeigt ob das Nettovermögen wächst oder schrumpft.

### 6. Kalender-Heatmap (Ausgaben-Intensität)

**Problem:** In welchen Wochen/Tagen eines Jahres wird am meisten ausgegeben? Nicht erkennbar.

**Lösung:** GitHub-style Heatmap unter den Charts: 52×7 Zellen, Farbe = Intensität der Ausgaben an diesem Tag. Grau = kein Booking, helle bis satte Akzentfarbe = niedrig bis hoch. Hover: Datum + Betrag + Bezeichnung. Technisch: reines CSS-Grid, keine Chart-Lib nötig.

### 7. Sparziel-Fortschritt-Overlay

**Problem:** Sparziele sind auf einer separaten Seite; kein Bezug zur zeitlichen Entwicklung.

**Lösung:** Optional einblendbare Markierungen im Jahres-Chart: vertikale Linien wo Ziel-Meilensteine liegen (z.B. "50% von Notgroschen erreicht"). Kleine Flagge/Badge an der Linie mit Ziel-Name. Daten aus `S.goals[]`.

### 8. Restjahr-Prognose

**Problem:** Ab Oktober weiß man nicht mehr wie das Jahr enden wird.

**Lösung:** Ab aktuellem Monat: gestrichelte Verlängerung der Ist-Linie basierend auf dem Durchschnitt der letzten 3 Monate (`avgMonthly()` existiert bereits in `utils.js`). Anderer Stil (z.B. `border: dashed`, niedrige Opacity) signalisiert "Prognose, kein Ist". Am Jahresende: Prognosewert als KPI-Card "Erwartetes Jahresergebnis".

### 9. Buchungs-Annotationen

**Problem:** Ungewöhnliche Monate (Urlaub, Autoreparatur, Bonus) sind nicht erklärbar.

**Lösung:** User kann Monate mit einer kurzen Notiz annotieren (max. 80 Zeichen). Gespeichert in einem neuen `S.yearNotes: { "2025-07": "Sommerurlaub", "2025-12": "Weihnachtsbonus" }`. Im Chart: kleines Notiz-Icon am Candlestick, Tooltip zeigt Text. Keine neuen Modals nötig — inline `contenteditable` Klick auf Monat-Label.

### 10. Saisonalitäts-Marker

**Problem:** Manche Ausgaben sind saisonal (Heizkosten Winter, Urlaub Sommer), aber die App zeigt keine Saisontrends.

**Lösung:** Automatische Erkennung: wenn ein Monat in den letzten 3 Jahren jeweils > 20% über dem Jahresdurchschnitt lag → dezentes Warn-Icon. Kein Alert, nur visueller Hinweis "Dieser Monat war historisch teuer". Berechnung nur wenn ≥2 Jahre Daten vorhanden.

### 11. Multi-Konto-Linien

**Problem:** Alle Konten werden aggregiert. Bei 3+ Konten ist unklar welches die Performance treibt.

**Lösung:** Toggle-Checkboxen pro Konto (`S.accounts[]`) über dem Chart. Jedes aktivierte Konto bekommt eine eigene farbige Linie (Kontobfarbe aus `acc.color`). Default: alle aktiv. Nützlich vor allem bei Depot + Girokonto + Tagesgeld nebeneinander.

### 12. Zusammenfassungs-Panel (Jahresbilanz-Card)

**Problem:** Die Seite hat keine Summary — man muss die Charts selbst interpretieren.

**Lösung:** Fixierte Summary-Card am Ende der Seite (oder rechte Spalte bei breitem Viewport):

- Jahreseinnahmen gesamt
- Jahresausgaben gesamt
- Netto-Jahresergebnis (+ Trend-Pfeil vs. Vorjahr)
- Bestes Monat (höchster Nettoüberschuss) mit Monatsnamen
- Schlechtestes Monat
- Sparquote des Jahres (Einnahmen - Ausgaben / Einnahmen)
- Größte Einzelkategorie

### 13. Gleitender Durchschnitt (Trend-Linie)

**Problem:** Monatliche Schwankungen überdecken den echten Trend.

**Lösung:** Optionale 3-Monats-Moving-Average-Linie über dem Candlestick-Chart. Berechnung: `(m[-1] + m[0] + m[1]) / 3` für jeden Monat. Zeigt ob die finanzielle Entwicklung langfristig besser oder schlechter wird. Ein-/ausblendbar via Toggle.

### 14. Cashflow-Wasserfall-Chart

**Problem:** Man sieht Einnahmen und Ausgaben separat, aber nicht wie sie den Kontostand aufbauen oder abbauen.

**Lösung:** Optionaler Wasserfall-Chart-Modus: Startbalken = Kontostand 1. Januar, dann pro Monat positive Einnahmen-Balken (grün) und negative Ausgaben-Balken (rot), Endsaldo = Jahresendstand. Zeigt sofort in welchem Monat "das Loch" war. Technisch als Chart.js Bar mit manuellen Baselines umsetzbar.

### 15. Jahres-Export / Report

**Problem:** Es gibt keinen Weg das Jahres-Ergebnis zu dokumentieren oder zu teilen.

**Lösung:** "Jahresbericht exportieren"-Button auf der Jahresübersicht. Nutzt das bestehende `print.js`-System (`window.csf.print.html()`). Generiert einen druckbaren 2-seitigen Report: Seite 1 — Summary-KPIs + Donut nach Kategorie. Seite 2 — Monatstabelle (Einnahmen/Ausgaben/Netto pro Monat). Kein neues IPC nötig — schon vorhanden.

### Implementierungs-Priorität Jahresübersicht

| Prio | Feature | Aufwand | Wert |
| ---- | ------- | ------- | ---- |
| 1 | Monatlicher Drill-Down (Side-Panel) | mittel | sehr hoch |
| 2 | Zusammenfassungs-Panel (Jahresbilanz-Card) | niedrig | sehr hoch |
| 3 | Restjahr-Prognose (gestrichelte Linie) | niedrig | hoch |
| 4 | Budget vs. Ist Linienchart | mittel | hoch |
| 5 | Gleitender Durchschnitt Toggle | niedrig | mittel |
| 6 | Kategorie-Stacked-Bars | hoch | hoch |
| 7 | Kalender-Heatmap | mittel | mittel |
| 8 | Multi-Konto-Linien | mittel | mittel |
| 9 | Buchungs-Annotationen | niedrig | mittel |
| 10 | Jahresvergleich Overlay | hoch | mittel |
| 11 | Cashflow-Wasserfall | hoch | mittel |
| 12 | Sparziel-Fortschritt Overlay | niedrig | niedrig |
| 13 | Saisonalitäts-Marker | hoch | niedrig |
| 14 | Nettovermögens-Tracker Sparkline | hoch | mittel |
| 15 | Jahres-Export / Report | niedrig | mittel |
