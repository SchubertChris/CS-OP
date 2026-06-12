// ══════════════════════════════════════
//  NAV — Seitennavigation
// ══════════════════════════════════════

// ── MODAL Z-INDEX STACK ───────────────
// Verwaltet z-index wenn Modals übereinander geöffnet werden.
// Basis: overlay z=500, jedes weitere +100. appDialogOverlay=900 bleibt immer oben.
const _modalStack = [];
const _MODAL_Z_BASE = 500;
const _MODAL_Z_STEP = 100;

function _modalPush(overlayId) {
  const el = document.getElementById(overlayId);
  if (!el) return;
  const z = _MODAL_Z_BASE + (_modalStack.length + 1) * _MODAL_Z_STEP;
  el.style.zIndex = z;
  _modalStack.push({ id: overlayId, z });
}

function _modalPop(overlayId) {
  const idx = _modalStack.findLastIndex ? _modalStack.findLastIndex(x => x.id === overlayId)
    : [..._modalStack].reverse().findIndex(x => x.id === overlayId);
  if (idx >= 0) {
    const realIdx = _modalStack.findLastIndex ? idx : _modalStack.length - 1 - [..._modalStack].reverse().findIndex(x => x.id === overlayId);
    _modalStack.splice(realIdx, 1);
    const el = document.getElementById(overlayId);
    if (el) el.style.zIndex = "";
  }
}

// Programmatisch zu einer Seite navigieren (z.B. aus Dashboard-Widgets)
function _navTo(page) {
  const el = document.querySelector(`#pill .nav-item[data-page="${page}"]`)
          || document.querySelector(`.nav-item[onclick*="'${page}'"]`);
  nav(el, page);
}

const PAGE_TITLES = {
  dashboard:   "Dashboard",
  posten:      "Transaktionen",
  jahr:        "Jahresanalyse",
  vertraege:   "Verträge",
  kreditoren:  "Kreditoren",
  goals:       "Sparziele",
  vision:      "Vision Board",
  krypto:      "Krypto · FIFO-Steuer",
  archiv:      "Archiv",
  settings:    "Einstellungen",
  docs:        "Über die App",
};

function nav(el, page) {
  // Wenn Tutorial läuft und der Schritt eine bestimmte Seite vorgibt → Navigation sperren
  if (typeof _tutOpen !== "undefined" && _tutOpen) {
    const step = typeof TUT_STEPS !== "undefined" ? TUT_STEPS[_tutStep] : null;
    if (step && step.navTo && step.navTo !== page) {
      // Panel visuell schütteln als Feedback
      const panel = document.getElementById("tutPanel");
      if (panel) {
        panel.classList.remove("tut-panel-shake");
        void panel.offsetWidth;
        panel.classList.add("tut-panel-shake");
        setTimeout(() => panel.classList.remove("tut-panel-shake"), 500);
      }
      return;
    }
  }

  // Sidebar-Overlay schließen (bei schmalen Fenstern)
  if (typeof _closeSidebarOverlay === "function") _closeSidebarOverlay();

  // Dynamisch erzeugte Overlays schließen (verhindert blockierte Sidebar)
  ["umEditOverlay", "umFilterOverlay"].forEach(id => {
    document.getElementById(id)?.remove();
  });
  // VisionBoard: globale Listener bereinigen beim Verlassen der Seite
  if (page !== "vision" && typeof _vbOnMouseMove === "function") {
    document.removeEventListener("mousemove", _vbOnMouseMove);
    document.removeEventListener("mouseup",   _vbOnMouseUp);
    document.removeEventListener("keydown",   _vbOnKeyDown);
    document.removeEventListener("keydown",   _vbOnSpaceDown);
    document.removeEventListener("keyup",     _vbOnSpaceUp);
    document.body.classList.remove("has-visionboard");
  }
  // Pvt-Popover schließen
  document.getElementById("pvPopover")?.remove();

  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));
  // Outgoing page: kurzes fade-out
  document.querySelectorAll(".page.active").forEach((p) => {
    p.classList.remove("active");
  });

  if (el) el.classList.add("active");
  if (typeof _pillClose === "function") _pillClose();
  if (typeof _pillSyncClosedState === "function") _pillSyncClosedState();
  const target = document.getElementById("p-" + page);
  if (target) {
    // Scroll to top before showing new page
    const main = document.querySelector("main");
    if (main) main.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "instant" });

    // Re-trigger animation by removing/re-adding active
    target.classList.remove("active");
    void target.offsetWidth; // reflow trigger
    target.classList.add("active");
  }

  document.getElementById("pageTitle").textContent = PAGE_TITLES[page] || page;

  if (page === "dashboard") renderDashboard();
  if (page === "posten") renderPosten();
  if (page === "jahr") renderJahr();
  if (page === "vertraege") renderVertraege();
  if (page === "kreditoren") renderKreditoren();
  if (page === "goals") renderGoals();
  if (page === "settings") renderSettings();
  if (page === "docs") renderDocs();
  if (page === "vision") renderVisionBoard();
  if (page === "krypto") renderKrypto();
  if (page === "archiv") renderArchivePage();
}

// ══════════════════════════════════════
//  GLOBALE SCHNELLSUCHE
// ══════════════════════════════════════
function openSearch() {
  if (document.getElementById("searchOverlay")) return;

  const ov = document.createElement("div");
  ov.id = "searchOverlay";
  ov.className = "search-overlay";

  const box = document.createElement("div");
  box.className = "search-box";

  const inputRow = document.createElement("div");
  inputRow.className = "search-input-row";

  // Logo-Button links → navigiert zu Dashboard
  const logoBtn = document.createElement("button");
  logoBtn.className = "search-logo-btn";
  logoBtn.addEventListener("mouseenter", () => _showTooltip("Zum Dashboard", logoBtn));
  logoBtn.addEventListener("mouseleave", _hideTooltip);
  const logoImg = document.createElement("img");
  logoImg.src = "img/icon.png";
  logoImg.alt = "CS";
  logoImg.onerror = function() {
    logoBtn.textContent = "CS";
    logoBtn.style.fontSize = "9px";
    logoBtn.style.fontWeight = "700";
    logoBtn.style.color = "var(--blue)";
  };
  logoBtn.appendChild(logoImg);
  logoBtn.addEventListener("click", () => { closeSearch(); _navTo("dashboard"); });

  const logoSep = document.createElement("span");
  logoSep.className = "search-logo-sep";

  const iconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  iconSvg.setAttribute("class", "search-icon");
  iconSvg.setAttribute("viewBox", "0 0 24 24");
  iconSvg.setAttribute("fill", "none");
  iconSvg.setAttribute("stroke", "currentColor");
  iconSvg.setAttribute("stroke-width", "2");
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", "11"); circle.setAttribute("cy", "11"); circle.setAttribute("r", "8");
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", "21"); line.setAttribute("y1", "21"); line.setAttribute("x2", "16.65"); line.setAttribute("y2", "16.65");
  iconSvg.appendChild(circle); iconSvg.appendChild(line);

  const inp = document.createElement("input");
  inp.id = "searchInput";
  inp.className = "search-inp";
  inp.type = "text";
  inp.placeholder = "Suchen …";
  inp.setAttribute("autocomplete", "off");

  const escBadge = document.createElement("span");
  escBadge.className = "search-esc";
  escBadge.textContent = "ESC";

  inputRow.appendChild(logoBtn);
  inputRow.appendChild(logoSep);
  inputRow.appendChild(iconSvg);
  inputRow.appendChild(inp);
  inputRow.appendChild(escBadge);

  const results = document.createElement("div");
  results.id = "searchResults";
  results.className = "search-results";

  const hint = document.createElement("div");
  hint.className = "search-hint";
  hint.textContent = "Posten, Buchungen, Konten, Ziele …";

  box.appendChild(inputRow);
  box.appendChild(results);
  box.appendChild(hint);
  ov.appendChild(box);
  document.body.appendChild(ov);

  requestAnimationFrame(() => inp.focus());
  _renderSearchResults("");

  inp.addEventListener("input", () => _renderSearchResults(inp.value.trim()));

  inp.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { e.preventDefault(); closeSearch(); return; }
    const items = document.querySelectorAll(".sr-item");
    const sel = document.querySelector(".sr-item.sr-selected");
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!sel && items.length) { items[0].classList.add("sr-selected"); items[0].scrollIntoView({ block: "nearest" }); }
      else if (sel) {
        const next = sel.nextElementSibling?.classList.contains("sr-item") ? sel.nextElementSibling : null;
        if (next) { sel.classList.remove("sr-selected"); next.classList.add("sr-selected"); next.scrollIntoView({ block: "nearest" }); }
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (sel) {
        const prev = sel.previousElementSibling?.classList.contains("sr-item") ? sel.previousElementSibling : null;
        if (prev) { sel.classList.remove("sr-selected"); prev.classList.add("sr-selected"); prev.scrollIntoView({ block: "nearest" }); }
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      const active = document.querySelector(".sr-item.sr-selected") || document.querySelector(".sr-item");
      if (active) active.click();
    }
  });

  ov.addEventListener("mousedown", (e) => { if (e.target === ov) closeSearch(); });
}

function closeSearch() {
  document.getElementById("searchOverlay")?.remove();
}

// ── TASTENKÜRZEL-OVERLAY ──────────────
function _showShortcutOverlay() {
  const shortcuts = [
    { keys: "Alt + 1–9",  desc: "Seiten navigieren" },
    { keys: "Strg + K",   desc: "Globale Schnellsuche öffnen" },
    { keys: "Strg + S",   desc: "Daten manuell speichern" },
    { keys: "?",          desc: "Diese Übersicht anzeigen" },
    { keys: "Esc",        desc: "Overlay / Modal schließen" },
    { keys: "↑ / ↓",     desc: "In der Suche navigieren" },
    { keys: "Enter",      desc: "Suchergebnis öffnen" },
  ];
  const pages = [
    "Alt+1 → Dashboard",
    "Alt+2 → Transaktionen",
    "Alt+3 → Jahresanalyse",
    "Alt+4 → Verträge",
    "Alt+5 → Kreditoren",
    "Alt+6 → Sparziele",
    "Alt+7 → Vision Board",
    "Alt+8 → Archiv",
    "Alt+9 → Einstellungen",
  ];
  const msg = [
    "Tastenkürzel\n",
    ...shortcuts.map(s => `  ${s.keys.padEnd(14)}  ${s.desc}`),
    "\nSeiten:",
    ...pages.map(p => `  ${p}`),
  ].join("\n");
  appAlert(msg, { icon: "⌨️", title: "Tastenkürzel" });
}

function _highlightText(container, text, query) {
  if (!query) { container.textContent = text; return; }
  const re = new RegExp("(" + query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
  const parts = text.split(re);
  parts.forEach((part) => {
    if (re.test(part)) {
      const mark = document.createElement("mark");
      mark.className = "sr-mark";
      mark.textContent = part;
      container.appendChild(mark);
    } else if (part) {
      container.appendChild(document.createTextNode(part));
    }
  });
}

const _SR_ICONS = {
  dashboard:  [{ tag: "path", attrs: { d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" } }, { tag: "path", attrs: { d: "M9 22V12h6v10" } }],
  posten:     [{ tag: "path", attrs: { d: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" } }],
  jahr:       [{ tag: "path", attrs: { d: "M18 20V10M12 20V4M6 20v-6" } }],
  vertraege:  [{ tag: "path", attrs: { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" } }, { tag: "path", attrs: { d: "M14 2v6h6M16 13H8M16 17H8M10 9H8" } }],
  goals:      [{ tag: "circle", attrs: { cx: "12", cy: "12", r: "10" } }, { tag: "circle", attrs: { cx: "12", cy: "12", r: "6" } }, { tag: "circle", attrs: { cx: "12", cy: "12", r: "2" } }],
  vision:     [{ tag: "path", attrs: { d: "M9 18h6M10 22h4" } }, { tag: "path", attrs: { d: "M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" } }],
  kreditoren: [{ tag: "path", attrs: { d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" } }, { tag: "circle", attrs: { cx: "9", cy: "7", r: "4" } }, { tag: "path", attrs: { d: "M23 21v-2a4 4 0 0 0-3-3.87" } }, { tag: "path", attrs: { d: "M16 3.13a4 4 0 0 1 0 7.75" } }],
  archiv:     [{ tag: "path", attrs: { d: "M21 8v13H3V8M1 3h22v5H1zM10 12h4" } }],
  settings:   [{ tag: "circle", attrs: { cx: "12", cy: "12", r: "3" } }, { tag: "path", attrs: { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" } }],
  docs:       [{ tag: "circle", attrs: { cx: "12", cy: "12", r: "10" } }, { tag: "path", attrs: { d: "M12 8v4M12 16h.01" } }],
};

function _srMakePageIcon(pageKey) {
  var NS = "http://www.w3.org/2000/svg";
  var shapes = _SR_ICONS[pageKey];
  var svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  if (shapes) {
    shapes.forEach(function(s) {
      var el = document.createElementNS(NS, s.tag);
      Object.keys(s.attrs).forEach(function(k) { el.setAttribute(k, s.attrs[k]); });
      svg.appendChild(el);
    });
  }
  return svg;
}

function _renderSearchResults(q) {
  const container = document.getElementById("searchResults");
  const hint = document.querySelector(".search-hint");
  if (!container) return;
  while (container.firstChild) container.removeChild(container.firstChild);

  const _NAV_PAGES = [
    { page: "dashboard",  label: "Dashboard",       sub: "Übersicht · KPIs · Cockpit · Zahlungen",    keywords: ["übersicht","kpi","cockpit","zahlung","saldo","konten","start"] },
    { page: "posten",     label: "Transaktionen",   sub: "Buchungshistorie · Umsätze · Buchungen",     keywords: ["transaktion","buchung","umsatz","umsätze","historie","liste","posten"] },
    { page: "jahr",       label: "Jahresanalyse",   sub: "Jahresübersicht · Charts · Candlestick",     keywords: ["jahr","chart","candlestick","analyse","verlauf","monat","prognose"] },
    { page: "vertraege",  label: "Verträge",        sub: "Abos · Subscriptions · Fixkosten",           keywords: ["vertrag","abo","subscription","fixkosten","wiederkehrend","laufzeit"] },
    { page: "goals",      label: "Sparziele",       sub: "Ziele · Sparpläne · Sparrate",               keywords: ["sparziel","ziel","sparen","sparplan","sparrate","rücklage"] },
    { page: "vision",     label: "Vision Board",    sub: "Ideen · Notizen · Nodes · Board",            keywords: ["vision","board","idee","node","canvas","pinwand"] },
    { page: "kreditoren", label: "Kreditoren",      sub: "Gläubiger · Empfänger · Payees",             keywords: ["kreditor","gläubiger","empfänger","payee","lieferant"] },
    { page: "archiv",     label: "Archiv",          sub: "Dokumente · Dateien · Upload",               keywords: ["archiv","dokument","datei","upload","anhang"] },
    { page: "settings",   label: "Einstellungen",   sub: "Theme · Schrift · Passwort · Kategorien",    keywords: ["einstellung","setting","theme","schrift","passwort","farbe","kategorie","zahltag","speicher"] },
    { page: "docs",       label: "Über die App",    sub: "Changelog · Version · Info",                 keywords: ["über","info","changelog","version","docs","hilfe"] },
  ];

  if (!q || q.length < 1) {
    if (hint) hint.style.display = "none";
    const _defLabel = document.createElement("div");
    _defLabel.className = "sr-group-label";
    _defLabel.textContent = "Seiten";
    container.appendChild(_defLabel);
    _NAV_PAGES.forEach(function(pg, i) {
      const item = document.createElement("div");
      item.className = "sr-item" + (i === 0 ? " sr-selected" : "");
      const iconWrap = document.createElement("span");
      iconWrap.className = "sr-page-icon";
      iconWrap.appendChild(_srMakePageIcon(pg.page));
      item.appendChild(iconWrap);
      const info = document.createElement("div");
      info.className = "sr-info";
      const lbl = document.createElement("div");
      lbl.className = "sr-label";
      lbl.textContent = pg.label;
      const sub = document.createElement("div");
      sub.className = "sr-sub";
      sub.textContent = pg.sub;
      info.appendChild(lbl);
      info.appendChild(sub);
      const enterBadge = document.createElement("span");
      enterBadge.className = "sr-enter";
      enterBadge.textContent = "↵";
      item.appendChild(info);
      item.appendChild(enterBadge);
      item.addEventListener("click", function() { closeSearch(); _navTo(pg.page); });
      container.appendChild(item);
    });
    return;
  }
  if (hint) hint.style.display = "none";

  const ql = q.toLowerCase();
  const hits = [];

  // ── Seiten / Navigation ──────────────────────────────────────────────
  _NAV_PAGES.forEach(pg => {
    const haystack = [pg.label, pg.sub, ...pg.keywords].join(" ").toLowerCase();
    if (haystack.includes(ql)) {
      hits.push({
        group: "Seiten",
        label: pg.label,
        sub:   pg.sub,
        iconKey: pg.page,
        action() { closeSearch(); _navTo(pg.page); },
      });
    }
  });

  // Posten (S.data)
  (S.data || []).forEach((p) => {
    if ((p.name || "").toLowerCase().includes(ql)) {
      hits.push({ group: "Posten", label: p.name, sub: (p.type === "einnahme" ? "+" : "-") + " " + (typeof fm === "function" ? fm(p.amount) : p.amount + " €"), action() { closeSearch(); _navTo("posten"); } });
    }
  });

  // Konten
  (S.accounts || []).forEach((a) => {
    if ((a.label || "").toLowerCase().includes(ql) || (a.sub || "").toLowerCase().includes(ql)) {
      hits.push({ group: "Konten", label: a.label, sub: a.sub || "", action() { closeSearch(); _navTo("dashboard"); } });
    }
  });

  // Buchungen (letzte 200)
  const recentBk = (S.bookings || []).slice(-200).reverse();
  recentBk.forEach((b) => {
    if ((b.name || "").toLowerCase().includes(ql)) {
      hits.push({ group: "Buchungen", label: b.name, sub: b.date + " · " + (typeof fm === "function" ? fm(b.amount) : b.amount + " €"), action() { closeSearch(); if (typeof _umFocusMonth !== "undefined") { _umFocusMonth = b.monthKey; } _navTo("posten"); } });
    }
  });

  // Sparziele
  (S.goals || []).forEach((g) => {
    if ((g.name || "").toLowerCase().includes(ql)) {
      hits.push({ group: "Sparziele", label: g.name, sub: typeof fm === "function" ? fm(g.targetAmount) : g.targetAmount + " €", action() { closeSearch(); _navTo("goals"); } });
    }
  });

  // Verträge
  (S.data || []).filter((p) => p.contractStart || p.contractEnd).forEach((p) => {
    if ((p.name || "").toLowerCase().includes(ql)) {
      hits.push({ group: "Verträge", label: p.name, sub: p.contractStart || "", action() { closeSearch(); _navTo("vertraege"); } });
    }
  });

  // Kreditoren
  (S.creditors || []).forEach((c) => {
    if ((c.name || "").toLowerCase().includes(ql)) {
      hits.push({ group: "Kreditoren", label: c.name, sub: c.email || c.website || "", action() { closeSearch(); _navTo("kreditoren"); } });
    }
  });

  if (!hits.length) {
    const empty = document.createElement("div");
    empty.className = "search-hint";
    empty.textContent = 'Keine Ergebnisse f\u00fcr "' + q + '"';
    container.appendChild(empty);
    return;
  }

  const groups = {};
  hits.forEach((h) => { if (!groups[h.group]) groups[h.group] = []; groups[h.group].push(h); });

  let first = true;
  Object.keys(groups).forEach((grp) => {
    const glabel = document.createElement("div");
    glabel.className = "sr-group-label";
    glabel.textContent = grp;
    container.appendChild(glabel);

    groups[grp].slice(0, 5).forEach((h, i) => {
      const item = document.createElement("div");
      item.className = "sr-item" + (first && i === 0 ? " sr-selected" : "");
      if (first && i === 0) first = false;

      if (h.iconKey) {
        const iconWrap = document.createElement("span");
        iconWrap.className = "sr-page-icon";
        iconWrap.appendChild(_srMakePageIcon(h.iconKey));
        item.appendChild(iconWrap);
      }

      const info = document.createElement("div");
      info.className = "sr-info";

      const lbl = document.createElement("div");
      lbl.className = "sr-label";
      _highlightText(lbl, h.label, q);

      const sub = document.createElement("div");
      sub.className = "sr-sub";
      sub.textContent = h.sub;

      info.appendChild(lbl);
      info.appendChild(sub);

      const enterBadge = document.createElement("span");
      enterBadge.className = "sr-enter";
      enterBadge.textContent = "↵";

      item.appendChild(info);
      item.appendChild(enterBadge);
      item.addEventListener("click", h.action);
      container.appendChild(item);
    });
  });
}

// ══════════════════════════════════════
//  KEYBOARD SHORTCUTS
// ══════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  const _navPages = [
    { key: "1", page: "dashboard" },
    { key: "2", page: "posten" },
    { key: "3", page: "jahr" },
    { key: "4", page: "vertraege" },
    { key: "5", page: "kreditoren" },
    { key: "6", page: "goals" },
    { key: "7", page: "vision" },
    { key: "8", page: "archiv" },
    { key: "9", page: "settings" },
  ];

  document.addEventListener("keydown", (e) => {
    // Keine Shortcuts in Inputs/Textareas
    const tag = e.target?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    // Keine Shortcuts bei offenem Modal
    const _mo = document.querySelector(".modal-overlay");
    if (_mo && _mo.style.display === "flex") return;

    // Alt+1…7 → Seitennavigation (während Tutorial gesperrt wenn Schritt eine Seite vorgibt)
    if (e.altKey && !e.ctrlKey && !e.metaKey) {
      const match = _navPages.find((p) => p.key === e.key);
      if (match) {
        e.preventDefault();
        const navEl = document.querySelector(`.nav-item[onclick*="'${match.page}'"]`);
        if (navEl) nav(navEl, match.page);
        return;
      }
    }

    // Ctrl+S → Manuell speichern
    if ((e.ctrlKey || e.metaKey) && e.key === "s" && !e.shiftKey) {
      e.preventDefault();
      if (typeof manualSave === "function") manualSave();
      return;
    }

    // Escape → Schnellsuche schließen
    if (e.key === "Escape" && document.getElementById("searchOverlay")) {
      closeSearch();
      return;
    }

    // Alt+K → Krypto-Seite
    if (e.altKey && !e.ctrlKey && !e.metaKey && e.key === "k") {
      e.preventDefault();
      const navEl = document.querySelector(".nav-item[data-page='krypto']");
      if (navEl) nav(navEl, "krypto");
      return;
    }

    // Ctrl+K / Cmd+K → Schnellsuche
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      if (document.getElementById("searchOverlay")) {
        closeSearch();
      } else {
        openSearch();
      }
      return;
    }

    // ? → Tastenkürzel-Overlay
    if (e.key === "?" && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      _showShortcutOverlay();
      return;
    }
  });

  if (window.csf?.update) {
    window.csf.update.onAvailable((d) => {
      showToast(`Update v${d.version} wird im Hintergrund geladen…`, "info", 4000);
    });
    window.csf.update.onDownloaded((d) => {
      appConfirm(`VaultBox v${d.version} ist bereit. Jetzt neu starten und installieren?`, {
        confirmLabel: "Jetzt installieren",
        cancelLabel: "Später",
      }).then((ok) => { if (ok) window.csf.update.install(); });
    });
  }
});
