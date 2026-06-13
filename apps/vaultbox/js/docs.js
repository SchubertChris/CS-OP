// ══════════════════════════════════════
//  DOCS — Über diese App · v1.0 VaultBox
// ══════════════════════════════════════

let _dbSpread       = 0;
let _dbLocked       = false;
let _dbBookSpreads  = [];
let _docsTLActive   = 5;
let _DOCS_TL        = [];
let _docsKeyHandler = null;

function renderDocs() {
  const el = document.getElementById("p-docs");
  if (!el) return;

  if (_docsKeyHandler) {
    document.removeEventListener("keydown", _docsKeyHandler);
    _docsKeyHandler = null;
  }
  _dbSpread = 0;
  _dbLocked = false;

  const _sparkPath = "M0,40 C8,38 14,28 22,25 C30,22 36,32 44,28 C52,24 56,10 64,8 C72,6 78,18 86,15 C94,12 98,20 106,16 C114,12 118,4 126,2 C134,0 138,10 146,8 C154,6 158,16 166,14 C174,12 178,8 186,6";

  _DOCS_TL = [
    { icon: "🌱", label: "2022 — Der Anfang",       date: "Herbst 2022",   desc: "Eine einfache Tabelle reichte nicht mehr. Die Idee: ein Offline-Tool das wirklich alle Finanzen an einem Ort verwaltet — ohne Cloud, ohne Login. Erste Prototypen in purem HTML." },
    { icon: "📊", label: "2023 — Konten & Buchungen",date: "Frühjahr 2023", desc: "Das Kernprinzip entsteht: Posten als Vorlagen, Buchungen als Instanzen. Multi-Konto-Verwaltung, Intervalle, Zahltag-System. Erste funktionierende Version für den Alltag." },
    { icon: "🕯️", label: "2023 — Candlestick Charts",date: "Sommer 2023",   desc: "Der Name 'Candlescope' entsteht: Persönliche Finanzen in der Sprache der Trader. OHLC-Kerzen für monatliche Ein- und Ausgaben — kein anderes PFM macht das. Das Killer-Feature." },
    { icon: "⚡", label: "2024 — Electron & Desktop", date: "Frühjahr 2024", desc: "Migration zu Electron. Echte Desktop-App mit Native Dialogs, sicherem Datenspeicher, IPC-Bridge. Safepoints, Import/Export, druckbare Berichte. Die App wird ernsthaft." },
    { icon: "🎨", label: "2025 — Design & Features",  date: "2025",          desc: "Komplettes UI-Redesign: 6 Themes, Space Grotesk, futuristische Sidebar. Vision Board, Kreditoren, Globale Schnellsuche Ctrl+K. 22 Features. v10.x." },
    { icon: "🚀", label: "2026 — VaultBox Launch",     date: "Juni 2026",     desc: "Desktop-Launch v1.0 als VaultBox — bereit für die Welt. Rebranding, Lizenz-System, FIFO Krypto-Steuer-Engine. Offline. Privat. 149€ einmalig, kein Abo." },
  ];
  _docsTLActive = _DOCS_TL.length - 1;

  const features = [
    { icon: "🏦", title: "Kontoverwaltung",              desc: "Giro · Kredit · Depot · Tagesgeld · VL · Festgeld · IBAN · Farbkodiert · Hauptkonto · Bank-Gruppen" },
    { icon: "📊", title: "Zahlungsübersicht",            desc: "Cockpit · Hauptkonto links · Kreditkarten rechts · Zahltag-Konfiguration · Live-Saldo bis Zahltag" },
    { icon: "📋", title: "Buchungshistorie",             desc: "Chronologische Umsätze · Zeitfilter · nur getätigte Buchungen · CSV-Export · Begleichen-Workflow" },
    { icon: "📄", title: "Verträge & Laufzeiten",        desc: "Automatisch aus Serien-Posten · Ablauf-Badge in Sidebar · Karten- & Listenansicht · Sortierung" },
    { icon: "🎯", title: "Sparziele",                    desc: "Fortschritt · Sparrate · Deadline · Konto-Bindung · Prognose · erscheinen als Monatsraten in Umsätze" },
    { icon: "📈", title: "Finanz-Chart",                 desc: "TradingView-Style · Kerzen · Balken · Linie · Bereich · 1T/1W/1M Intervall · 1M–MAX · Wachstumslinie" },
    { icon: "🗓️", title: "Pivot-Tabelle",                desc: "Monatsgitter mit Überschreibungen · Beglichen-Markierung · Jahresvergleich · Differenz-Analyse" },
    { icon: "✏️", title: "Buchungs-Modals",              desc: "Einzel- vs. Serienbuchung getrennt · Buchungsdatum bei Einmalig · Fällig-Tag nur bei Serien" },
    { icon: "↕",  title: "Umbuchungen",                  desc: "Transfers zwischen Konten · Dauerauftrag · monatl. / viertelj. / halbjährl. / jährl. · Depot-Chart" },
    { icon: "🔐", title: "Passwortschutz",               desc: "scrypt · Privacy Mode · Auto-Lock nach 5 Min · Passwort ändern & entfernen" },
    { icon: "🎨", title: "Themes & Schrift",             desc: "Gold · Dark · Crimson · Light · Ivory · Mono · Space Grotesk · DM Mono · Barlow · Schriftgröße XS–XL" },
    { icon: "💾", title: "Export · Import · Safepoints", desc: "FBS-Vollsicherung · Import · Auto-Safepoints stündlich · Wiederherstellen · max. 10" },
    { icon: "🗑️", title: "Datenverwaltung",             desc: "Alle Daten löschen mit Konfetti-Animation · App-Reset mit Backup · Demo-Daten mit 7 Jahren Geschichte" },
    { icon: "🧭", title: "Tutorial Panel",               desc: "Seitenpanel von rechts · 16 Schritte · Element-Highlight · Auto-Scroll · Phase-Anzeige · Konfetti" },
    { icon: "⚡", title: "Abgelaufene Serien",           desc: "Automatisch aus KPI-, Donut- & Pivot-Berechnungen ausgeschlossen wenn Laufzeitende erreicht" },
    { icon: "🍩", title: "Ausgabenverteilung",           desc: "Donut-Chart Top 10 · animierte Balken-Legende · Ø pro Monat · relativ & absolut" },
    { icon: "🏷️", title: "Bank-Gruppen",                desc: "Konten nach Bank gruppieren · Drag & Drop · Referenzkonto je Gruppe · 2-spaltig mit Scroll" },
    { icon: "🛡️", title: "100% Offline",                desc: "Keine Cloud · kein Login · kein Tracking · kein Abo · SHA-256 · alles in localStorage" },
    { icon: "📅", title: "Zahltag-System",               desc: "Individueller Gehaltseingangstag · Abrechnungstag pro Kreditkarte · Cockpit rechnet live" },
    { icon: "🔒", title: "Privacy Mode",                 desc: "Zahlenwerte ausblenden mit einem Klick · Auto-Lock nach Inaktivität · Passwort-geschützt" },
    { icon: "🎯", title: "Vision Board",                 desc: "Unendliche Pinnwand · Nodes · Verbindungen · Sticky Notes · Bilder · Zoom & Pan · Resize · Export" },
    { icon: "🏢", title: "Kreditoren",                   desc: "Gläubiger & Zahlungsempfänger · Konto-Verknüpfung · Bank-Gruppe · E-Mail · Adresse · Popover-Details" },
  ];

  const roadmap = [
    { v: "v1",  label: "Dashboard & Konten",        status: "done",    desc: "Grundstruktur, Konten, Saldo, Cockpit, Navigation" },
    { v: "v2",  label: "Tutorial & IBAN",            status: "done",    desc: "Interaktive Einführung, IBAN-Format, Passwortschutz" },
    { v: "v3",  label: "Ziele · Charts · Themes",    status: "done",    desc: "Sparziele, Jahresübersicht, Crimson Theme, Auto-Lock" },
    { v: "v4",  label: "Hauptkonto · Kreditkarten",  status: "done",    desc: "Akkordeon, Zahltag-Config, App-Reset, Custom Dialoge" },
    { v: "v5",  label: "VL · Daueraufträge · UX",    status: "done",    desc: "VL-Kontotyp, Intervall-Transfers, Vertragsfilter, Donut" },
    { v: "v6",  label: "Animationen · Gruppen",       status: "done",    desc: "Seitenübergänge, Bank-Gruppen, Balance-Toggle, Chart" },
    { v: "v7",  label: "Dashboard Redesign · Pivot", status: "done",    desc: "KPI-Kacheln, Pivot-Tabelle, Buchungshistorie, Donut v3" },
    { v: "v8",  label: "Bugfixes · UX · Navigation", status: "done",    desc: "Abgelaufene Serien, Bookings-Reset, Sidebar Icon-Rail, Tutorial Panel" },
    { v: "v9",  label: "Navigation & Sidebar Fixes", status: "done",    desc: "Overlay-Cleanup, Toolbar-Preservation, Pivot-Popover Redesign" },
    { v: "v10", label: "Finanz-Chart · Modals",       status: "done",    desc: "TradingView-Chart · Einzel/Serienbuchung getrennt · Sparziele in Umsätze · 7J Demo-Daten" },
    { v: "v10", label: "Sidebar v3 · Vision Board",  status: "done",    desc: "Futuristische Sidebar mit Puls-Ring, HR-Divider · Vision Board: Nodes, Verbindungen, Pan/Zoom" },
    { v: "v11", label: "CSV-Bankimport",             status: "planned", desc: "Direktimport aus Bankexports — Transaktionen automatisch einlesen und zuordnen" },
    { v: "v11", label: "Push-Benachrichtigungen",   status: "planned", desc: "Ablaufwarnungen & Fälligkeitserinnerungen per System-Notification" },
    { v: "v12", label: "Mehrere Profile",            status: "idea",    desc: "Familie, Partner, Business — getrennte Datensätze in einer App" },
    { v: "v12", label: "Mobile Companion App",       status: "idea",    desc: "iOS & Android — Salden abrufen, Buchungen erfassen, Push-Sync via QR" },
  ];

  const stack = [
    { label: "Runtime",      val: "Electron 40",           icon: "⚡" },
    { label: "Frontend",     val: "Vanilla JS · CSS",      icon: "🎨" },
    { label: "Profi-Chart",  val: "Lightweight Charts v4", icon: "📈" },
    { label: "Basis-Charts", val: "Chart.js 4",            icon: "📊" },
    { label: "Speicher",     val: "localStorage",          icon: "💾" },
    { label: "Crypto",       val: "Web Crypto API",        icon: "🔐" },
    { label: "KI-Modell",    val: "Claude Sonnet 4.6",     icon: "🤖" },
    { label: "Pakete",       val: "0 Abhängigkeiten",      icon: "📦" },
    { label: "Netzwerk",     val: "0 Server-Anfragen",     icon: "🔌" },
  ];

  const changelog = [
    {
      version: "v10.6 — Polish & Suche", date: "April 2026",
      items: [
        "Globale Suche (Ctrl+K): Seiten jetzt durchsuchbar — Dashboard, Transaktionen, Jahresanalyse etc.",
        "Transaktionen: Kategorie als eigene Spalte in der Liste sichtbar",
        "Transaktionen: Konto-Schnellfilter direkt in der Toolbar",
        "Transaktionen: Suche erst bei Enter — kein Fokusverlust beim Tippen",
        "Theme-Wechsel: sanfter CSS-Übergang statt Sofortflash",
        "Vision Board: Light- und Ivory-Theme zeigen helles Canvas",
        "Tooltip-System vereinheitlicht: alle title-Attribute durch _showTooltip() ersetzt",
      ],
    },
    {
      version: "v10.5 — Responsive & Sidebar", date: "April 2026",
      items: [
        "Sidebar bei ≤1100px als Overlay-Drawer (schiebt Content nicht weg)",
        "Sidebar Öffnungs-Animation: Labels und Begrüßung erscheinen verzögert",
        "Vision Board: Props-Panel standardmäßig eingeklappt, Toggle in Topbar",
        "Jahresanalyse: Ist-Daten und Prognose klar getrennt ab heute",
        "Dashboard: Zahlungsübersicht — Heute-Pill für fällige Buchungen",
      ],
    },
    {
      version: "v10.4 — Suche & Jahresanalyse", date: "April 2026",
      items: [
        "Globale Schnellsuche Ctrl+K: Posten, Konten, Buchungen, Ziele, Verträge, Kreditoren",
        "Jahresanalyse: Prognose-Linie (gestrichelt ab aktuellem Monat), Budget-Soll-Linie",
        "Jahresanalyse: Summary-Panel (6 KPI-Cards) + Drill-Down-Tabs + PDF-Export",
        "Dashboard: Kategorie-Auswertung mit Balken + Monatsnavigation",
        "VL-Konto: Auto-Posten VL-Beitrag beim Speichern anlegen/aktualisieren",
      ],
    },
    {
      version: "v10.3 — Feinschliff & Feedback", date: "April 2026",
      items: [
        "Sparziele: Feedback-Panel mit Live-Slider — Rate, Laufzeit, Erreichbarkeit auf einen Blick",
        "Dashboard: Zahltag-Logik — Buchungen am Zahltag selbst bleiben als offen sichtbar",
        "Kreditoren: Kontengruppe auf Cards + gruppiertes Dropdown im Modal",
        "Verträge: Sidebar-Badge als dezenter roter Punkt · auto-dismiss beim Seitenbesuch",
      ],
    },
  ];

  // ── Book page helpers (local to renderDocs) ──
  function _dbPage(tag, chapter, content, pageNum) {
    return '<div class="dbp-inner">'
      + (tag     ? '<div class="dbp-chap-tag">'   + tag     + '</div>' : '')
      + (chapter ? '<div class="dbp-chap-title">' + chapter + '</div>' : '')
      + '<div class="dbp-body">' + content + '</div>'
      + '<div class="dbp-footer"><div class="dbp-footer-line"></div>'
      + (pageNum ? '<span class="dbp-pnum">' + pageNum + '</span>' : '')
      + '</div></div>';
  }
  function _dbTip(txt) {
    return '<div class="dbp-tip"><span class="dbp-tip-lbl">Tipp</span><span>' + txt + '</span></div>';
  }
  function _dbList(items) {
    return '<ul class="dbp-list">' + items.map(function(i){ return '<li>' + i + '</li>'; }).join('') + '</ul>';
  }
  function _dbKbd(key, desc) {
    return '<div class="dbp-kbd-row"><kbd class="dbp-kbd">' + key + '</kbd><span>' + desc + '</span></div>';
  }

  _dbBookSpreads = [
    // 0 — Cover + TOC
    {
      left: _dbPage('', 'VaultBox',
        '<div class="dbp-cover">'
        + '<div class="dbp-cover-logo"><img src="images/CandleScope.webp" alt="CandleScope" /></div>'
        + '<div class="dbp-cover-title">VaultBox</div>'
        + '<div class="dbp-cover-sub">Benutzerhandbuch</div>'
        + '<div class="dbp-cover-version">Version 1.0 · 2026</div>'
        + '<div class="dbp-cover-tagline">Deine Finanzen. Offline. Sicher.</div>'
        + '</div>', ''),
      right: _dbPage('Inhalt', 'Was dich erwartet',
        _dbList([
          '<b>Erste Schritte</b> — Einrichtung, Zahltag <span class="dbp-pg">3</span>',
          '<b>Konten & Typen</b> — Giro, Kredit, Depot, VL <span class="dbp-pg">5</span>',
          '<b>Buchungen</b> — Posten, Serien, Status <span class="dbp-pg">7</span>',
          '<b>Dashboard & Cockpit</b> — KPIs, Donut <span class="dbp-pg">9</span>',
          '<b>Jahresübersicht</b> — Candlestick, Charts <span class="dbp-pg">11</span>',
          '<b>Sparziele & Verträge</b> — Ziele, Laufzeiten <span class="dbp-pg">13</span>',
          '<b>Sicherheit & Export</b> — SHA-256, FBS <span class="dbp-pg">15</span>',
          '<b>Shortcuts & Tipps</b> — Ctrl+K, Alt+1–9 <span class="dbp-pg">17</span>',
          '<b>Was kommt</b> — Roadmap & Vision <span class="dbp-pg">18</span>',
        ]), '2'),
    },
    // 1 — Erste Schritte + Kontoarten
    {
      left: _dbPage('Kapitel 1', 'Erste Schritte',
        '<p>Beim ersten Start ist die App leer. So richtest du sie in 5 Minuten ein:</p>'
        + _dbList([
          'Einstellungen → <b>Zahltag</b> setzen (dein Gehaltseingang)',
          'Einstellungen → Theme & Schrift nach Wunsch wählen',
          '<b>Konten</b> → Neues Konto → Hauptkonto markieren',
          'Monatliches Einkommen am Hauptkonto eintragen',
          'Erste Ausgaben-Posten anlegen (Miete, Strom, …)',
        ])
        + _dbTip('Demo-Daten laden? Einstellungen → Demo-Daten — 7 Jahre vorausgefüllte Beispieldaten zum Erkunden aller Features.'), '3'),
      right: _dbPage('Kapitel 1', 'Kontentypen',
        _dbList([
          '<b>Girokonto</b> — dein Hauptkonto für Gehalt & Lastschriften',
          '<b>Kreditkarte</b> — mit Stichtag & Ablaufdatum',
          '<b>Tagesgeld / Sparkonto</b> — für Rücklagen & Puffer',
          '<b>Depot</b> — Aktien, ETFs, Krypto mit Depotnummer',
          '<b>Festgeld</b> — Zinssparen mit fester Laufzeit',
          '<b>VL</b> — Vermögenswirksame Leistungen, auto-Posten',
          '<b>Sonstiges</b> — Bargeld, PayPal, Subkonten',
        ])
        + _dbTip('Bank-Gruppen: Fasse mehrere Konten einer Bank zusammen. Drag & Drop im Konten-Bereich.'), '4'),
    },
    // 2 — Buchungen + Status
    {
      left: _dbPage('Kapitel 2', 'Buchungen anlegen',
        '<p>Unterschied zwischen <b>Einmalig</b> und <b>Serie</b>:</p>'
        + _dbList([
          '<b>Einmalig</b> — hat ein Buchungsdatum (einmalige Ausgabe/Einnahme)',
          '<b>Serie</b> — hat Fälligkeitstag + Intervall (monatlich bis jährlich)',
          'Serien erzeugen automatisch Buchungen — 5 Jahre rückwärts, 3 Monate voraus',
          'Umbuchungen — interne Transfers zwischen deinen Konten',
        ])
        + _dbTip('Verträge erkennst du daran, dass sie einen Vertragsbeginn oder Laufzeitende haben. Sie erscheinen automatisch unter Verträge.'), '5'),
      right: _dbPage('Kapitel 2', 'Buchungs-Status',
        '<p>Jede Buchung hat einen Status:</p>'
        + _dbList([
          '<b>gebucht</b> — Vergangenheit, normal verbucht',
          '<b>vorgemerkt</b> — Zukunft, noch nicht abgebucht',
          '<b>beglichen</b> — manuell als bezahlt markiert',
          '<b>geändert</b> — Betrag manuell angepasst',
          '<b>ausgesetzt</b> — für diesen Monat pausiert',
        ])
        + '<p style="margin-top:8px;font-size:10.5px">In der Transaktionsliste sind nur gebucht/beglichen/geändert sichtbar. Vorgemerkte fließen in KPIs und Jahresauswertung ein.</p>', '6'),
    },
    // 3 — Dashboard + Cockpit
    {
      left: _dbPage('Kapitel 3', 'Dashboard & KPIs',
        '<p>Das Dashboard zeigt auf einen Blick:</p>'
        + _dbList([
          '<b>Gesamtvermögen</b> — Summe aller Konten',
          '<b>Einnahmen / Ausgaben</b> — aktueller Monat',
          '<b>Netto</b> — Differenz Einnahmen minus Ausgaben',
          '<b>Sparquote</b> — Prozent des Einkommens gespart',
          '<b>Nächste Buchungen</b> — bis zum Zahltag',
          '<b>Donut-Chart</b> — Top-10 Ausgaben nach Kategorie',
        ])
        + _dbTip('Klicke auf eine Kategorie im Donut-Chart — du springst direkt zu den gefilterten Transaktionen.'), '7'),
      right: _dbPage('Kapitel 3', 'Cockpit & Zahltag',
        '<p>Das Cockpit zeigt alle Zahlungen bis zum nächsten Zahltag:</p>'
        + _dbList([
          'Links: Hauptkonto mit aktuellem Saldo',
          'Rechts: alle angebundenen Kreditkarten',
          'Grün = bezahlt, orange = offen, rot = heute fällig',
          '"Heute"-Pill markiert Buchungen die heute fällig sind',
          'Zahltag-Konfig in Einstellungen (globaler Tag, pro Karte individuell)',
        ])
        + _dbTip('Zahltag in Einstellungen setzen — das Cockpit rechnet automatisch alle Fälligkeiten bis dahin.'), '8'),
    },
    // 4 — Jahresübersicht + Analyse
    {
      left: _dbPage('Kapitel 4', 'Jahresübersicht',
        '<p>Deine Finanzen im Trader-Style:</p>'
        + _dbList([
          '<b>Candlestick-Kerzen</b> — Hoch/Tief/Offen/Schließen pro Monat',
          '<b>Balken-Chart</b> — absolute Beträge pro Monat',
          '<b>Linienchart</b> — Verlauf über das Jahr',
          '<b>Prognose</b> — gestrichelte Linie ab aktuellem Monat',
          '<b>Budget vs. Ist</b> — Soll-Linie aus deinen Posten',
          '<b>Moving Average</b> — 3-Monats-Glättung (∿ Button)',
        ])
        + '<p style="margin-top:8px;font-size:10.5px">Klick auf einen Monat → Drill-Down mit Buchungen, Kategorien und Vergleich zum Vormonat.</p>', '9'),
      right: _dbPage('Kapitel 4', 'Analyse & Export',
        '<p>Summary-Panel am Jahresende zeigt:</p>'
        + _dbList([
          'Jahreseinnahmen & Jahresausgaben gesamt',
          'Netto-Jahresergebnis mit Trend-Pfeil',
          'Bestes und schlechtestes Monat',
          'Sparquote des Jahres in Prozent',
          'Größte Einzelkategorie',
        ])
        + '<p style="margin-top:8px;font-size:10.5px">Export → Jahresbericht als druckbares PDF (2 Seiten: KPIs + Monatstabelle).</p>'
        + _dbTip('Tab Kategorien im Monats-Drill-Down zeigt welche Kategorien besonders teuer waren.'), '10'),
    },
    // 5 — Sparziele + Verträge
    {
      left: _dbPage('Kapitel 5', 'Sparziele',
        '<p>Strukturiert auf größere Ziele sparen:</p>'
        + _dbList([
          'Ziel anlegen: Name, Betrag, Startdatum, Deadline',
          'Konto verknüpfen — Sparrate erscheint als monatlicher Posten',
          'Live-Feedback: optimale Rate, Laufzeit, Erreichbarkeit',
          'Slider: Sparrate anpassen → Deadline aktualisiert sich',
          'Fortschrittsbalken auf der Ziel-Card',
        ])
        + _dbTip('Sparziele erstellen automatisch einen Sparposten — du siehst die Sparrate direkt im Cockpit und in den Transaktionen.'), '11'),
      right: _dbPage('Kapitel 5', 'Verträge & Abos',
        '<p>Als Vertrag gilt jeder Posten mit Vertragsbeginn oder Laufzeitende:</p>'
        + _dbList([
          'Übersicht aller laufenden Verträge als Tabelle oder Karte',
          'Ablauf-Datum als Badge in der Sidebar sichtbar',
          'Kategorie & Kreditor je Vertrag zuweisbar',
          'Resizable Spalten per Drag-Handle',
          'Abgelaufene Verträge aus KPI-Berechnungen ausgeschlossen',
        ])
        + _dbTip('Sidebar-Punkt wird rot wenn ein Vertrag in 30 Tagen abläuft. Wird nach Besuch der Seite automatisch ausgeblendet.'), '12'),
    },
    // 6 — Sicherheit + Export
    {
      left: _dbPage('Kapitel 6', 'Passwort & Privacy',
        '<p>Deine Daten bleiben geheim — auch wenn jemand deinen PC nutzt:</p>'
        + _dbList([
          '<b>Passwort</b> — SHA-256 Hash, wird nie im Klartext gespeichert',
          '<b>Auto-Lock</b> — Bildschirm sperrt nach 5 Min Inaktivität',
          '<b>Privacy Mode</b> — alle Zahlen ausblenden (Klick aufs Auge)',
          'Passwort nachträglich ändern oder entfernen',
          'Kein Online-Konto — niemand kann dein Passwort zurücksetzen',
        ])
        + _dbTip('Privacy Mode per Klick auf das Auge-Icon in der Topbar. Ideal wenn du die App in der Öffentlichkeit offen hast.'), '13'),
      right: _dbPage('Kapitel 6', 'Backup & Export',
        '<p>Daten sichern und wiederherstellen:</p>'
        + _dbList([
          '<b>Safepoints</b> — automatisch stündlich, max. 10 gespeichert',
          '<b>FBS-Export</b> — vollständige Sicherung aller Daten in einer Datei',
          '<b>Import</b> — Sicherung oder Safepoint wiederherstellen',
          '<b>CSV-Export</b> — Buchungen als Tabelle für Excel/DATEV',
          '<b>Jahres-PDF</b> — Druckbarer Jahresbericht',
        ])
        + _dbTip('Regelmäßig exportieren! Safepoints sind temporär. FBS-Datei auf externen Datenträger kopieren für Langzeitsicherung.'), '14'),
    },
    // 7 — Shortcuts + Tipps
    {
      left: _dbPage('Kapitel 7', 'Tastenkürzel',
        '<p>Mit der Tastatur geht alles schneller:</p>'
        + _dbKbd('Alt+1', 'Dashboard')
        + _dbKbd('Alt+2', 'Transaktionen')
        + _dbKbd('Alt+3', 'Jahresanalyse')
        + _dbKbd('Alt+4', 'Verträge')
        + _dbKbd('Alt+5', 'Kreditoren')
        + _dbKbd('Alt+6', 'Sparziele')
        + _dbKbd('Alt+7', 'Vision Board')
        + _dbKbd('Alt+8', 'Archiv')
        + _dbKbd('Alt+9', 'Einstellungen')
        + _dbKbd('Ctrl+K', 'Schnellsuche')
        + _dbKbd('Ctrl+S', 'Speichern'), '15'),
      right: _dbPage('Kapitel 7', 'Profi-Tipps',
        _dbList([
          'Sidebar komprimieren: Klick auf den Pfeil links — mehr Platz',
          'Kategorien in Einstellungen anlegen und Farben wählen — macht Auswertungen übersichtlich',
          'Vision Board: Ideen, Ziele, Moodboards auf endloser Pinnwand',
          'Pivot-Tabelle: zeigt jeden Posten für alle 12 Monate auf einen Blick',
          'Kreditoren anlegen: Versicherungen, Vermieter, Abos direkt verknüpfen',
          'Demo-Daten: 7 Jahre Beispiele laden (Einstellungen → Gefahrenzone)',
        ]), '16'),
    },
    // 8 — Zukunft + Backcover
    {
      left: _dbPage('Ausblick', 'Was kommt als nächstes',
        '<p>Die Roadmap für kommende Versionen:</p>'
        + _dbList([
          '<b>v11</b> — CSV-Bankimport: Transaktionen direkt aus Bankexports einlesen',
          '<b>v11</b> — Push-Benachrichtigungen: Ablaufwarnungen & Fälligkeits-Erinnerungen',
          '<b>v12</b> — Mehrere Profile: Familie, Partner, Business getrennt verwalten',
          '<b>v12</b> — Mobile Companion App: Salden & Buchungen unterwegs',
          '<b>v13</b> — Auto-Kategorisierung: KI-gestützte Buchungszuordnung',
          '<b>v13</b> — Steuer-Export: aufbereitete Daten für den Steuerberater',
        ])
        + '<p style="margin-top:10px;font-size:10.5px;color:var(--db-page-text2)">Alle Features bleiben offline-first — deine Daten gehören weiterhin nur dir.</p>', '17'),
      right: _dbPage('', 'VaultBox',
        '<div class="dbp-backcover">'
        + '<div class="dbp-bc-logo">🔐</div>'
        + '<div class="dbp-bc-title">Danke, dass du dabei bist.</div>'
        + '<div class="dbp-bc-body">Dieses Projekt ist mit Herzblut gebaut — für Menschen die ihre Finanzen selbst in die Hand nehmen wollen. Ohne Abo. Ohne Tracking. Ohne Kompromisse.</div>'
        + '<div class="dbp-bc-quote">"Jeder verdient einen vollständigen Überblick über seine eigenen Zahlen."</div>'
        + '<div class="dbp-bc-author">— Chris Schubert, Entwickler</div>'
        + '<div class="dbp-bc-version">v1.0 · vaultbox.de</div>'
        + '</div>', ''),
    },
  ];

  const tlItems = _DOCS_TL.map(function(t, i) {
    return '<div class="docs-tl-item' + (i === _docsTLActive ? ' is-active' : '') + '" data-tl-idx="' + i + '"'
      + ' onclick="_docsTLActivate(' + i + ')"'
      + ' onmouseenter="_showTooltip(\'' + t.label.replace(/'/g, '&#39;') + '\', this)" onmouseleave="_hideTooltip()">'
      + '<div class="docs-tl-node"><span class="docs-tl-icon">' + t.icon + '</span></div>'
      + '<div class="docs-tl-date">' + t.date + '</div>'
      + '</div>';
  }).join('');

  const dotItems = _dbBookSpreads.map(function(_, i) {
    return '<span class="db-dot' + (i === 0 ? ' is-active' : '') + '" onclick="_dbGoTo(' + i + ')"></span>';
  }).join('');

  const statsHtml = [
    { num: "0",       lbl: "Server-Anfragen" },
    { num: "100",     lbl: "% Offline-fähig", suffix: "%" },
    { num: "22",      lbl: "Features v10.6" },
    { num: "12",      lbl: "Versionen" },
    { num: "SHA-256", lbl: "Passwort-Hash" },
    { num: "7",       lbl: "Jahre Demo-Daten" },
  ].map(function(s, i) {
    return '<div class="docs-stat-chip docs-reveal" data-reveal="up" style="--reveal-delay:' + (i * 55) + 'ms">'
      + '<div class="docs-stat-num" data-target="' + s.num + '">' + s.num + (s.suffix || '') + '</div>'
      + '<div class="docs-stat-lbl">' + s.lbl + '</div>'
      + '</div>';
  }).join('');

  const stackHtml = stack.map(function(s) {
    return '<div class="docs-stack-row">'
      + '<span class="docs-stack-key">' + s.icon + ' ' + s.label + '</span>'
      + '<span class="docs-stack-val">' + s.val + '</span>'
      + '</div>';
  }).join('');

  const featHtml = features.map(function(f, i) {
    return '<div class="docs-feature-item" data-title="' + f.title.toLowerCase() + '" data-desc="' + f.desc.toLowerCase() + '" style="--feat-delay:' + (i * 28) + 'ms">'
      + '<div class="docs-feature-icon">' + f.icon + '</div>'
      + '<div class="docs-feature-title">' + f.title + '</div>'
      + '<div class="docs-feature-desc">' + f.desc + '</div>'
      + '</div>';
  }).join('');

  const clHtml = changelog.map(function(c, ci) {
    return '<div class="docs-cl-entry' + (ci === 0 ? ' docs-cl-current' : '') + '">'
      + '<div class="docs-cl-header">'
      + '<div class="docs-cl-dot"></div>'
      + '<span class="docs-cl-version">' + c.version + '</span>'
      + '<span class="docs-cl-date">' + c.date + '</span>'
      + (ci === 0 ? '<span class="docs-cl-badge">Aktuell</span>' : '')
      + '</div>'
      + '<ul class="docs-cl-items">'
      + c.items.map(function(item) { return '<li class="docs-cl-item">' + item + '</li>'; }).join('')
      + '</ul>'
      + '</div>';
  }).join('');

  const rmHtml = roadmap.map(function(r, i) {
    return '<div class="docs-rm-card docs-rm-' + r.status + ' docs-reveal" data-reveal="up" style="--reveal-delay:' + (i * 38) + 'ms">'
      + '<div class="docs-rm-header">'
      + '<div class="docs-rm-dot"></div>'
      + '<span class="docs-rm-version">' + r.v + '</span>'
      + (r.status === 'planned' ? '<span class="docs-rm-plan-badge">Geplant</span>' : '')
      + (r.status === 'idea'    ? '<span class="docs-rm-idea-badge">Idee</span>'    : '')
      + '</div>'
      + '<div class="docs-rm-label">' + r.label + '</div>'
      + '<div class="docs-rm-desc">' + r.desc + '</div>'
      + '</div>';
  }).join('');

  el.innerHTML = '<div class="docs-wrap">'

    // HERO
    + '<div class="docs-hero">'
    + '<div class="docs-hero-grid"></div>'
    + '<div class="docs-hero-glow"></div>'
    + '<div class="docs-hero-orbit"></div>'
    + '<div class="docs-hero-orbit docs-hero-orbit--2"></div>'
    + '<div class="docs-hero-particles">'
    + '<span class="docs-particle" style="--px:12%;--py:22%;--ps:4px;--pd:3.2s;--pdel:0s"></span>'
    + '<span class="docs-particle" style="--px:80%;--py:30%;--ps:3px;--pd:4.5s;--pdel:1.1s"></span>'
    + '<span class="docs-particle" style="--px:58%;--py:72%;--ps:5px;--pd:3.8s;--pdel:0.7s"></span>'
    + '<span class="docs-particle" style="--px:33%;--py:58%;--ps:3px;--pd:5s;--pdel:1.9s"></span>'
    + '<span class="docs-particle" style="--px:88%;--py:18%;--ps:4px;--pd:3.5s;--pdel:2.3s"></span>'
    + '</div>'
    + '<div class="docs-hero-content">'
    + '<div class="docs-hero-badge"><span class="docs-badge-dot"></span>v1.0 · Juni 2026</div>'
    + '<h1 class="docs-hero-title">VaultBox</h1>'
    + '<p class="docs-hero-sub">Deine Finanzen. Offline. Sicher. Kompakt.<br>Entwickelt mit Claude AI von Anthropic.</p>'
    + '<div class="docs-hero-tags">'
    + '<span class="docs-tag">🔒 100% Lokal</span>'
    + '<span class="docs-tag">⚡ Offline First</span>'
    + '<span class="docs-tag">🧠 KI-entwickelt</span>'
    + '<span class="docs-tag">🖥️ Electron App</span>'
    + '<span class="docs-tag">📦 0 Dependencies</span>'
    + '</div></div>'
    + '<div class="docs-hero-visual"><div class="docs-hero-card">'
    + '<div class="docs-hc-label">Gesamtvermögen</div>'
    + '<div class="docs-hc-val">12.847,<small>33</small> €</div>'
    + '<svg class="docs-hc-spark" viewBox="0 0 186 48" preserveAspectRatio="none">'
    + '<defs><linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">'
    + '<stop offset="0%" stop-color="var(--blue)" stop-opacity="0.22"/>'
    + '<stop offset="100%" stop-color="var(--blue)" stop-opacity="0"/>'
    + '</linearGradient></defs>'
    + '<path class="docs-spark-fill" d="' + _sparkPath + ' L186,48 L0,48 Z" fill="url(#sparkGrad)"/>'
    + '<path class="docs-spark-line" d="' + _sparkPath + '" fill="none" stroke="var(--blue)" stroke-width="1.8" stroke-linecap="round"/>'
    + '<circle class="docs-spark-dot" cx="186" cy="6" r="3" fill="var(--blue)"/>'
    + '</svg>'
    + '<div class="docs-hc-bars">'
    + '<div class="docs-hc-bar-row"><span class="docs-hc-bar-lbl">Einnahmen</span><div class="docs-hc-bar" style="width:72%;background:var(--blue)" data-delay="0"></div></div>'
    + '<div class="docs-hc-bar-row"><span class="docs-hc-bar-lbl">Ausgaben</span><div class="docs-hc-bar" style="width:45%;background:var(--red)" data-delay="150"></div></div>'
    + '<div class="docs-hc-bar-row"><span class="docs-hc-bar-lbl">Sparquote</span><div class="docs-hc-bar" style="width:88%;background:var(--green)" data-delay="300"></div></div>'
    + '</div>'
    + '<div class="docs-hc-footer">5 Konten · 6 Themes · v1.0</div>'
    + '</div></div></div>'

    // STATS
    + '<div class="docs-stats-strip">' + statsHtml + '</div>'

    // MANIFEST
    + '<div class="docs-manifest docs-reveal" data-reveal="up">'
    + '<div class="docs-manifest-eyebrow">Warum dieses Projekt existiert</div>'
    + '<h2 class="docs-manifest-title">Finanzfreiheit beginnt mit Klarheit.</h2>'
    + '<p class="docs-manifest-body">Jeder sollte wissen wo sein Geld hingeht — ohne Abo, ohne Cloud, ohne dass eine App deine Daten verkauft. VaultBox ist kein Fintech-Produkt. Es ist ein Werkzeug: präzise, schnell, ohne Ablenkung.</p>'
    + '<p class="docs-manifest-body">Gebaut für alle die ihre Kreditkarten, Depots, Sparkonten und Sparziele an einem Ort sehen wollen — offline, privat, sicher. Kein Login. Kein Server. Keine Überraschungen.</p>'
    + '<div class="docs-manifest-quote">"Menschen finanziell selbstständig und strukturierter machen —<br>damit jeder eines Tages selbst vorsorgen kann."</div>'
    + '</div>'

    // THREE PILLARS
    + '<div class="docs-pillars docs-reveal" data-reveal="up">'
    + '<div class="docs-pillar"><div class="docs-pillar-icon">🔒</div><div class="docs-pillar-title">Privacy First</div><p class="docs-pillar-body">Alle Daten liegen ausschließlich auf deinem Gerät. Kein Server, keine Telemetrie, keine Werbung. SHA-256 Passwortschutz und Auto-Lock machen die App zum sichersten Finanz-Tresor den du besitzt.</p></div>'
    + '<div class="docs-pillar"><div class="docs-pillar-icon">📊</div><div class="docs-pillar-title">Trader-Ästhetik</div><p class="docs-pillar-body">Deine Finanzen in der Sprache der Profis: Candlestick-Charts für monatliche Ein- und Ausgaben. Kein anderes Personal-Finance-Tool zeigt dein Leben in OHLC-Kerzen.</p></div>'
    + '<div class="docs-pillar"><div class="docs-pillar-icon">🚀</div><div class="docs-pillar-title">Kein Abo. Je.</div><p class="docs-pillar-body">Einmal kaufen, für immer nutzen. Keine monatlichen Kosten, keine Premium-Tier-Gimmicks. Was du kaufst gehört dir — vollständig, dauerhaft.</p></div>'
    + '</div>'

    // TIMELINE
    + '<div class="docs-tl-section docs-reveal" data-reveal="up">'
    + '<div class="docs-tile-tag" style="text-align:center;margin-bottom:6px">Das Projekt in der Zeit</div>'
    + '<h2 class="docs-tl-heading">Von der Idee zum Produkt</h2>'
    + '<div class="docs-tl-track">'
    + '<div class="docs-tl-rail"><div class="docs-tl-rail-base"></div><div class="docs-tl-rail-fill" id="docsTlFill"></div></div>'
    + '<div class="docs-tl-items">' + tlItems + '</div>'
    + '</div>'
    + '<div class="docs-tl-panel" id="docsTlPanel">'
    + '<span class="docs-tl-p-icon" id="docsTlPIcon">' + _DOCS_TL[_docsTLActive].icon + '</span>'
    + '<div class="docs-tl-p-text">'
    + '<div class="docs-tl-p-label" id="docsTlPLabel">' + _DOCS_TL[_docsTLActive].label + '</div>'
    + '<div class="docs-tl-p-body" id="docsTlPBody">' + _DOCS_TL[_docsTLActive].desc + '</div>'
    + '</div></div>'
    + '</div>'

    // BOOK
    + '<div class="docs-book-section docs-reveal" data-reveal="up">'
    + '<div class="docs-tile-tag" style="text-align:center;margin-bottom:6px">Interaktives Handbuch</div>'
    + '<h2 class="docs-book-heading">Das Handbuch zum Blättern</h2>'
    + '<p class="docs-book-sub">9 Kapitel · Pfeile oder Tasten ← →</p>'
    + '<div class="docs-book-wrap">'
    + '<button class="db-btn db-btn--prev" id="dbBtnPrev" onclick="_dbPrev()" onmouseenter="_showTooltip(\'Vorherige Seite (←)\', this)" onmouseleave="_hideTooltip()">'
    + '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="13 5 7 10 13 15"/></svg>'
    + '</button>'
    + '<div class="db-book" id="dbBook">'
    + '<div class="db-spine"></div>'
    + '<div class="db-page-l" id="dbPageL"></div>'
    + '<div class="db-page-r" id="dbPageR"></div>'
    + '</div>'
    + '<button class="db-btn db-btn--next" id="dbBtnNext" onclick="_dbNext()" onmouseenter="_showTooltip(\'Nächste Seite (→)\', this)" onmouseleave="_hideTooltip()">'
    + '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="7 5 13 10 7 15"/></svg>'
    + '</button>'
    + '</div>'
    + '<div class="db-dots" id="dbDots">' + dotItems + '</div>'
    + '</div>'

    // PHILOSOPHY + STACK
    + '<div class="docs-2col docs-reveal" data-reveal="up">'
    + '<div class="docs-tile docs-tile--accent">'
    + '<div class="docs-tile-stripe"></div>'
    + '<div class="docs-tile-icon">🔒</div>'
    + '<div class="docs-tile-tag">Sicherheit & Philosophie</div>'
    + '<div class="docs-tile-title">Warum 100% offline?</div>'
    + '<p class="docs-tile-body">Deine Kontonummern, Sparziele und Monatseinkommen gehören nur dir. VaultBox sendet <strong>keine einzige Zahl</strong> an Server — keine Cloud, keine Accounts, kein Tracking.<br><br><strong>Kein Abo. Kein Login. Keine Datenschutzerklärung.</strong></p>'
    + '<div class="docs-chips">'
    + '<span class="docs-chip">localStorage</span><span class="docs-chip">SHA-256</span><span class="docs-chip">Kein Backend</span>'
    + '<span class="docs-chip">Privacy Mode</span><span class="docs-chip">Auto-Lock</span><span class="docs-chip">0 npm packages</span>'
    + '</div></div>'
    + '<div class="docs-tile docs-tile--stack">'
    + '<div class="docs-tile-icon">⚙️</div>'
    + '<div class="docs-tile-tag">Tech Stack</div>'
    + '<div class="docs-tile-title">Was unter der Haube steckt</div>'
    + '<div class="docs-stack-list">' + stackHtml + '</div>'
    + '<div class="docs-claude-badge">🤖 Powered by Claude Sonnet 4.6</div>'
    + '</div></div>'

    // FEATURES
    + '<div class="docs-tile docs-tile--features docs-reveal" data-reveal="up">'
    + '<div class="docs-features-head">'
    + '<div><div class="docs-tile-tag">Was die App kann — v1.0</div><div class="docs-tile-title" style="margin-bottom:0">22 Features</div></div>'
    + '<div class="docs-feat-search-wrap"><input class="docs-feat-search" type="text" id="docsFeatSearchInp" placeholder="Feature suchen…" oninput="_docsFilterFeatures(this.value)"></div>'
    + '</div>'
    + '<div class="docs-features-grid" id="docsFeatGrid">' + featHtml + '</div>'
    + '<div class="docs-feat-empty" id="docsFeatEmpty" style="display:none">Keine Features gefunden</div>'
    + '</div>'

    // CHANGELOG
    + '<div class="docs-tile docs-tile--changelog docs-reveal" data-reveal="left">'
    + '<div class="docs-tile-tag">Changelog · Was ist neu</div>'
    + '<div class="docs-tile-title" style="margin-bottom:18px">Letzte Updates</div>'
    + '<div class="docs-changelog-list">' + clHtml + '</div>'
    + '</div>'

    // ROADMAP
    + '<div class="docs-tile docs-tile--roadmap docs-reveal" data-reveal="up">'
    + '<div class="docs-tile-tag">Roadmap · Entwicklungsweg</div>'
    + '<div class="docs-tile-title" style="margin-bottom:20px">Von v1 bis heute — und weiter</div>'
    + '<div class="docs-roadmap-grid">' + rmHtml + '</div>'
    + '</div>'

    // FOOTER
    + '<div class="docs-footer docs-reveal" data-reveal="up">'
    + '<div class="docs-footer-logo">VaultBox</div>'
    + '<div class="docs-footer-sub">v1.0 · Juni 2026 · Entwickelt mit Claude Sonnet 4.6 von Anthropic · Alle Daten lokal · Kein Internet erforderlich</div>'
    + '</div>'

    + '</div>';

  _docsInit();
}

function _docsInit() {
  const sparkLine = document.querySelector(".docs-spark-line");
  if (sparkLine) {
    try {
      const len = sparkLine.getTotalLength ? sparkLine.getTotalLength() : 300;
      sparkLine.style.strokeDasharray  = len;
      sparkLine.style.strokeDashoffset = len;
      setTimeout(function() {
        sparkLine.style.transition = "stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1) 0.3s";
        sparkLine.style.strokeDashoffset = "0";
      }, 200);
    } catch (e) {}
  }

  document.querySelectorAll(".docs-hc-bar").forEach(function(b) {
    const delay = parseInt(b.dataset.delay) || 0;
    b.style.transform       = "scaleX(0)";
    b.style.transformOrigin = "left";
    setTimeout(function() {
      b.style.transition = "transform .9s cubic-bezier(.4,0,.2,1)";
      b.style.transform  = "scaleX(1)";
    }, 400 + delay);
  });

  const mainEl = document.querySelector(".main") || document.documentElement;
  const countersDone = new WeakSet();

  const io = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add("is-visible");
      io.unobserve(el);
      el.querySelectorAll(".docs-stat-num").forEach(function(numEl, idx) {
        if (countersDone.has(numEl)) return;
        countersDone.add(numEl);
        const raw = numEl.dataset.target || numEl.textContent.trim();
        const num = parseInt(raw);
        if (isNaN(num)) return;
        const hasPct = raw.includes("%");
        let cur = 0;
        const baseDelay = parseInt(getComputedStyle(el).getPropertyValue("--reveal-delay")) || 0;
        setTimeout(function() {
          const step = Math.max(1, Math.ceil(num / 20));
          const t = setInterval(function() {
            cur = Math.min(cur + step, num);
            numEl.textContent = cur + (hasPct ? "%" : "");
            if (cur >= num) clearInterval(t);
          }, 40);
        }, baseDelay + idx * 60);
      });
    });
  }, { root: mainEl, rootMargin: "0px 0px -40px 0px", threshold: 0.06 });

  document.querySelectorAll(".docs-reveal").forEach(function(el) { io.observe(el); });

  const featGrid = document.getElementById("docsFeatGrid");
  if (featGrid) {
    const featItems = featGrid.querySelectorAll(".docs-feature-item");
    featItems.forEach(function(item) {
      item.style.opacity   = "0";
      item.style.transform = "translateY(16px)";
    });
    const featIO = new IntersectionObserver(function(entries) {
      if (!entries[0].isIntersecting) return;
      featIO.disconnect();
      featItems.forEach(function(item, i) {
        const delay = parseInt(item.style.getPropertyValue("--feat-delay")) || i * 28;
        setTimeout(function() {
          item.style.transition = "opacity .4s ease, transform .5s cubic-bezier(.34,1.15,.64,1)";
          item.style.opacity    = "1";
          item.style.transform  = "translateY(0)";
        }, 40 + delay);
      });
    }, { root: mainEl, threshold: 0.04 });
    featIO.observe(featGrid);
  }

  _dbRender();
  _dbUpdateUI();
  _docsTLUpdateFill();

  _docsKeyHandler = function(e) {
    const pg = document.getElementById("p-docs");
    if (!pg || pg.style.display === "none") return;
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
    if (e.key === "ArrowRight") { e.preventDefault(); _dbNext(); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); _dbPrev(); }
  };
  document.addEventListener("keydown", _docsKeyHandler);
}

function _dbRender() {
  const spread = _dbBookSpreads[_dbSpread];
  if (!spread) return;
  const l = document.getElementById("dbPageL");
  const r = document.getElementById("dbPageR");
  if (l) l.innerHTML = spread.left;
  if (r) r.innerHTML = spread.right;
}

function _dbUpdateUI() {
  const prev = document.getElementById("dbBtnPrev");
  const next = document.getElementById("dbBtnNext");
  if (prev) prev.disabled = _dbSpread === 0;
  if (next) next.disabled = _dbSpread === _dbBookSpreads.length - 1;
  document.querySelectorAll(".db-dot").forEach(function(dot, i) {
    dot.classList.toggle("is-active", i === _dbSpread);
  });
}

function _dbFlip(dir) {
  if (_dbLocked) return;
  const target = _dbSpread + dir;
  if (target < 0 || target >= _dbBookSpreads.length) return;
  _dbLocked = true;

  const cur  = _dbBookSpreads[_dbSpread];
  const nxt  = _dbBookSpreads[target];
  const book = document.getElementById("dbBook");
  if (!book) { _dbSpread = target; _dbRender(); _dbUpdateUI(); _dbLocked = false; return; }

  const flip = document.createElement("div");
  flip.className = "db-flip" + (dir < 0 ? " db-flip--prev" : "");

  if (dir > 0) {
    flip.style.left          = "360px";
    flip.style.transformOrigin = "left center";
    flip.innerHTML = '<div class="db-flip-face db-flip-front">' + cur.right + '</div>'
                   + '<div class="db-flip-face db-flip-back">'  + nxt.left  + '</div>';
  } else {
    flip.style.left          = "0";
    flip.style.transformOrigin = "right center";
    flip.innerHTML = '<div class="db-flip-face db-flip-front">' + cur.left  + '</div>'
                   + '<div class="db-flip-face db-flip-back">'  + nxt.right + '</div>';
  }

  book.appendChild(flip);
  _dbSpread = target;
  _dbRender();
  _dbUpdateUI();

  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      flip.style.transition = "transform 0.58s cubic-bezier(.45,.05,.25,1)";
      flip.style.transform  = dir > 0 ? "rotateY(-180deg)" : "rotateY(180deg)";
      setTimeout(function() { flip.remove(); _dbLocked = false; }, 600);
    });
  });
}

function _dbNext() { _dbFlip(1); }
function _dbPrev() { _dbFlip(-1); }
function _dbGoTo(idx) {
  if (idx === _dbSpread || _dbLocked) return;
  const steps = idx - _dbSpread;
  _dbFlip(steps > 0 ? 1 : -1);
}

function _docsTLActivate(idx) {
  _docsTLActive = idx;
  document.querySelectorAll(".docs-tl-item").forEach(function(item, i) {
    item.classList.toggle("is-active", i === idx);
  });
  const panel = document.getElementById("docsTlPanel");
  if (panel) panel.classList.add("is-updating");
  setTimeout(function() {
    var iconEl  = document.getElementById("docsTlPIcon");
    var labelEl = document.getElementById("docsTlPLabel");
    var bodyEl  = document.getElementById("docsTlPBody");
    if (iconEl)  iconEl.textContent  = _DOCS_TL[idx].icon;
    if (labelEl) labelEl.textContent = _DOCS_TL[idx].label;
    if (bodyEl)  bodyEl.textContent  = _DOCS_TL[idx].desc;
    if (panel)   panel.classList.remove("is-updating");
  }, 140);
  _docsTLUpdateFill();
}

function _docsTLUpdateFill() {
  const fill = document.getElementById("docsTlFill");
  if (!fill || _DOCS_TL.length < 2) return;
  const itemW = 100 / _DOCS_TL.length;
  fill.style.left  = (itemW * 0.5) + "%";
  fill.style.width = Math.max(0, itemW * (_docsTLActive + 0.5) - itemW * 0.5) + "%";
}

function _docsFilterFeatures(q) {
  const s = q.toLowerCase().trim();
  const items = document.querySelectorAll(".docs-feature-item");
  let visible = 0;
  items.forEach(function(item) {
    const match = !s || item.dataset.title.includes(s) || item.dataset.desc.includes(s);
    item.style.display = match ? "" : "none";
    if (match) { item.style.opacity = "1"; item.style.transform = "translateY(0)"; visible++; }
  });
  const empty = document.getElementById("docsFeatEmpty");
  if (empty) empty.style.display = visible === 0 ? "block" : "none";
}
