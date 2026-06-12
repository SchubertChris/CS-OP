// ══════════════════════════════════════
//  INTRO v4 — Splash · Tutorial Panel
//  Kein Overlay · Kein Spotlight
//  Panel von rechts · Element-Highlight
// ══════════════════════════════════════

const TUT_PHASES = [
  { label: "Einrichten", color: "#4d9eff", steps: [0, 1, 2, 3, 4, 5] },
  { label: "App-Tour", color: "#00c87a", steps: [6, 7, 8, 9, 10, 11, 12, 13] },
  { label: "Loslegen", color: "#c9a84c", steps: [14, 15] },
];

const TUT_STEPS = [
  {
    phase: 1,
    icon: "✦",
    tag: "Willkommen",
    title: "Dein Finanz-Dashboard",
    body: "Vollständig <strong>offline</strong> — keine Cloud, kein Login, kein Tracking. Alle Daten lokal auf deinem Gerät.<br><br>Lass uns in 2 Minuten einrichten.",
    navTo: "dashboard",
    target: null,
    special: null,
  },
  {
    phase: 1,
    icon: "🏷️",
    tag: "Schritt 1 · Name",
    title: "Wie heißt du?",
    body: "",
    navTo: null,
    target: null,
    special: "username",
    tip: "Erscheint als Begrüßung in der Sidebar",
  },
  {
    phase: 1,
    icon: "🎨",
    tag: "Schritt 2 · Theme",
    title: "Wähle dein Design",
    body: "",
    navTo: null,
    target: null,
    special: "theme",
  },
  {
    phase: 1,
    icon: "🔤",
    tag: "Schritt 3 · Schrift",
    title: "Schrift & Größe",
    body: "",
    navTo: null,
    target: null,
    special: "fontpicker",
  },
  {
    phase: 1,
    icon: "🔐",
    tag: "Schritt 4 · Passwort",
    title: "App schützen",
    body: "",
    navTo: null,
    target: null,
    special: "password",
    tip: "Felder leer lassen zum Überspringen",
  },
  {
    phase: 1,
    icon: "📅",
    tag: "Schritt 5 · Zahltag",
    title: "Wann kommt dein Gehalt?",
    body: "",
    navTo: null,
    target: null,
    special: "zahltag",
    tip: "Cockpit rechnet damit was bis Zahltag fällig ist",
  },
  {
    phase: 2,
    icon: "📊",
    tag: "Tour · Dashboard",
    title: "Deine Übersicht",
    body: "<strong>4 KPI-Karten</strong> — Gesamtvermögen, Einkommen, Fixausgaben, Verfügbar bis Zahltag. Hover für Details.",
    navTo: "dashboard",
    target: "#kpiRow",
    hint: "Die 4 KPI-Karten →",
    tip: "Hover über eine Karte für Details",
  },
  {
    phase: 2,
    icon: "🏦",
    tag: "Tour · Konten",
    title: "Konten & Gruppen",
    body: "Giro, Kredit, Depot, Tagesgeld — alle Konten in <strong>Bank-Gruppen</strong>. Betrag direkt in der Karte editierbar.",
    navTo: "dashboard",
    target: "#kontenPanel .acc-card-wrap, #kontenPanel .acc-group",
    targetFallback: "#kontenPanel",
    hint: "Deine Kontokarten →",
    tip: "Klick auf eine Karte → Bearbeiten",
  },
  {
    phase: 2,
    icon: "🎯",
    tag: "Tour · Cockpit",
    title: "Bis zum Zahltag",
    body: "Was wird noch abgebucht? Was bleibt übrig? <strong>Live-Berechnung</strong> für Hauptkonto und alle Kreditkarten.",
    navTo: "dashboard",
    target: "#cockpitCols",
    hint: "Zahlungsübersicht →",
    tip: "Gesamt / Haupt umschalten",
  },
  {
    phase: 2,
    icon: "📋",
    tag: "Tour · Transaktionen",
    title: "Fixkosten & Einnahmen",
    body: "Alle festen Posten mit Betrag, Intervall und Fälligkeitstag. <strong>Automatisch</strong> auf Monatsbasis hochgerechnet.",
    navTo: "posten",
    target: "#postenThead",
    targetFallback: "#p-posten .panel",
    hint: "Die Buchungstabelle →",
    tip: "Klick auf eine Zeile → Bearbeiten",
  },
  {
    phase: 2,
    icon: "📈",
    tag: "Tour · Jahresübersicht",
    title: "Jahresvergleich",
    body: "Alle Posten <strong>monatsweise</strong>. Filtere nach Konto oder Typ. Klick auf Monat → Detailansicht.",
    navTo: "jahr",
    target: "#p-jahr .panel-head, #p-jahr .ph",
    targetFallback: "#p-jahr",
    hint: "Die Jahresübersicht →",
    tip: "Werte direkt editierbar",
  },
  {
    phase: 2,
    icon: "🎯",
    tag: "Tour · Sparziele",
    title: "Ziele verfolgen",
    body: "Zielbetrag, Sparrate, Deadline. <strong>Prognose ob du auf Kurs bist.</strong> Automatischer Fixkosten-Posten je Ziel.",
    navTo: "goals",
    target: ".goals-main",
    targetFallback: "#p-goals",
    hint: "Deine Sparziele →",
    tip: "Ziel erstellt einen Fixposten automatisch",
  },
  {
    phase: 2,
    icon: "⚙️",
    tag: "Tour · Einstellungen",
    title: "Einstellungen",
    body: "Theme, Schrift, Passwort, Zahltag. <strong>Export/Import</strong> als .fbs-Datei. <strong>Safepoints</strong> stündlich automatisch.",
    navTo: "settings",
    target: ".settings-card",
    targetFallback: "#p-settings",
    hint: "Einstellungen →",
    tip: "Max. 10 Safepoints lokal",
  },
  {
    phase: 2,
    icon: "📖",
    tag: "Tour · Über die App",
    title: "Features & Roadmap",
    body: "Alle Features, Tech-Stack und Roadmap. Features <strong>direkt durchsuchbar</strong>. Entwickelt mit Claude Sonnet 4.6.",
    navTo: "docs",
    target: "#p-docs .docs-hero",
    targetFallback: "#p-docs",
    hint: "Über diese App →",
  },
  {
    phase: 3,
    icon: "🗂️",
    tag: "Demo-Daten",
    title: "Was tun mit Demo-Daten?",
    body: "",
    navTo: "dashboard",
    target: null,
    special: "demodata",
  },
  {
    phase: 3,
    icon: "🚀",
    tag: "Los geht's!",
    title: "Du bist startklar.",
    body: "Tutorial jederzeit über <strong>Hilfe & Tutorial</strong> in der Sidebar neu starten.",
    navTo: "dashboard",
    target: null,
    special: "finish",
  },
];

// ── STATE ──
let _tutStep = 0;
let _tutOpen = false;
let _highlightEl = null;

// ── GUARDS: blockiert Klicks + Tastaturkürzel während Tutorial läuft ──

// Click-Guard: Blocker-Div fängt Klicks per CSS ab.
// Zusätzlich Capture-Guard für Fälle wo Blocker nicht greift (z.B. höher gestackter Content)
document.addEventListener("click", function _tutNavGuard(e) {
  if (!_tutOpen) return;
  if (e.target.closest("#tutPanel, #tutBlocker")) return;
  // Wenn irgendwie ein Klick durch den Blocker kommt → abfangen
  e.stopImmediatePropagation();
  e.preventDefault();
}, true);

// Keyboard-Guard (Alt+1–7, Ctrl+S blockieren)
document.addEventListener("keydown", function _tutKeyGuard(e) {
  if (!_tutOpen) return;
  const isNavKey = e.altKey && e.key >= "1" && e.key <= "7";
  const isSave   = (e.ctrlKey || e.metaKey) && e.key === "s";
  if (!isNavKey && !isSave) return;
  e.stopImmediatePropagation();
  e.preventDefault();
  _tutShakeAndHint();
}, true);

let _tutShakeThrottle = 0;
function _tutShakeAndHint() {
  const now = Date.now();
  if (now - _tutShakeThrottle < 800) return; // nicht spammen
  _tutShakeThrottle = now;
  const panel = document.getElementById("tutPanel");
  if (panel) {
    panel.style.animation = "tut-shake .35s ease";
    setTimeout(() => { panel.style.animation = ""; }, 360);
  }
  showToast('Tutorial läuft — navigiere mit "Weiter →"', "info", 2200);
}

// ══════════════════════════════════════
//  RETICLE — Targeting-Rahmen
// ══════════════════════════════════════
let _reticleScrollEl = null;
let _reticleScrollCb = null;
let _reticleTarget   = null;
let _reticleRaf      = null;

function _setReticle(el, accent) {
  _clearReticle();
  if (!el) return;
  _reticleTarget = el;

  const r = document.createElement("div");
  r.id = "tutReticle";
  r.style.setProperty("--tut-accent", accent || "#4d9eff");

  // 4 Ecken
  ["tl", "tr", "bl", "br"].forEach(pos => {
    const c = document.createElement("div");
    c.className = "trc trc-" + pos;
    r.appendChild(c);
  });

  // Scan-Line
  const scan = document.createElement("div");
  scan.className = "trc-scan";
  r.appendChild(scan);

  // Inner Glow
  const glow = document.createElement("div");
  glow.className = "trc-glow";
  r.appendChild(glow);

  // Label (wird in _renderStep befüllt)
  const lbl = document.createElement("div");
  lbl.className = "trc-label";
  lbl.id = "tutReticleLabel";
  r.appendChild(lbl);

  document.body.appendChild(r);
  _reticleUpdatePos(r, el);

  // Beim Scrollen mitbewegen (live, per rAF-Loop)
  let lastTop = -1;
  function track() {
    if (!document.getElementById("tutReticle")) return;
    const rect = el.getBoundingClientRect();
    if (Math.abs(rect.top - lastTop) > 0.5) {
      lastTop = rect.top;
      _reticleUpdatePos(r, el);
    }
    _reticleRaf = requestAnimationFrame(track);
  }
  _reticleRaf = requestAnimationFrame(track);
}

function _reticleUpdatePos(r, el) {
  const pad  = 8;
  const rect = el.getBoundingClientRect();
  r.style.left   = (rect.left   - pad) + "px";
  r.style.top    = (rect.top    - pad) + "px";
  r.style.width  = (rect.width  + pad * 2) + "px";
  r.style.height = (rect.height + pad * 2) + "px";
}

function _clearReticle() {
  if (_reticleRaf) { cancelAnimationFrame(_reticleRaf); _reticleRaf = null; }
  const r = document.getElementById("tutReticle");
  if (r) r.remove();
  _reticleTarget = null;
}

// ══════════════════════════════════════
//  SPLASH
// ══════════════════════════════════════
function runSplash() {
  const splash = document.getElementById("splash");
  const shell  = document.querySelector(".shell");
  if (!splash) return;

  // Shell starts invisible + zoomed out
  if (shell) shell.classList.add("shell-loading");

  // 1800ms: all animations settled — cross-dissolve both at once
  setTimeout(() => {
    splash.classList.add("fade-out");          // 800ms CSS fade
    if (shell) shell.classList.remove("shell-loading"); // 750ms CSS reveal

    setTimeout(() => splash.classList.add("gone"), 820);
  }, 1800);
}

// ══════════════════════════════════════
//  OPEN / CLOSE
// ══════════════════════════════════════
function openTutorial(startStep) {
  _tutStep = startStep || 0;
  _tutOpen = true;
  _ensurePanel();
  _ensureBlocker();
  const panel = document.getElementById("tutPanel");
  panel.classList.remove("tut-minimized");
  panel.classList.add("open");
  _renderStep("next");
}

function _ensureBlocker() {
  if (document.getElementById("tutBlocker")) return;
  const b = document.createElement("div");
  b.id = "tutBlocker";
  // vor tutPanel (z-index 899) einfügen — Panel selbst liegt drüber
  document.body.appendChild(b);
}

function _removeBlocker() {
  const b = document.getElementById("tutBlocker");
  if (b) b.remove();
}

function closeTutorial() {
  _tutOpen = false;
  _clearHighlight();

  const panel = document.getElementById("tutPanel");
  if (panel) {
    // 1. Inhalt sofort ausblenden
    const inner = panel.querySelectorAll(
      ".tut-panel-meta, .tut-panel-prog-bar, .tut-segs, .tut-panel-body, .tut-panel-footer, .tut-drag-dots"
    );
    inner.forEach(el => { el.style.transition = "opacity .12s"; el.style.opacity = "0"; });

    // 2. Nach kurzer Pause: TV-Ausschalt-Animation
    setTimeout(() => {
      panel.style.transition = "none";
      panel.style.overflow   = "hidden";
      panel.style.animation  = "tut-tv-off .55s cubic-bezier(0.4,0,0.2,1) forwards";
      setTimeout(() => {
        panel.classList.remove("open");
        panel.style.animation  = "";
        panel.style.transition = "";
        inner.forEach(el => { el.style.transition = ""; el.style.opacity = ""; });
        _removeBlocker();
      }, 560);
    }, 130);
  }
  try {
    localStorage.setItem("csf_tut_done", "1");
  } catch (e) {}
}

// ══════════════════════════════════════
//  FLOATING PANEL — DOM
// ══════════════════════════════════════
function _ensurePanel() {
  if (document.getElementById('tutPanel')) return;

  const panel = document.createElement('div');
  panel.id = 'tutPanel';

  // Drag-Handle / Titelleiste
  const handle = document.createElement('div');
  handle.className = 'tut-drag-handle';
  handle.id = 'tutDragHandle';
  const dotsEl = document.createElement('div');
  dotsEl.className = 'tut-drag-dots';
  const ctrls = document.createElement('div');
  ctrls.className = 'tut-panel-controls';
  const minBtn = document.createElement('div');
  minBtn.className = 'tut-panel-minimize';
  minBtn.id = 'tutMinimizeBtn';
  minBtn.textContent = '−';
  minBtn.addEventListener('mouseenter', () => _showTooltip('Minimieren', minBtn));
  minBtn.addEventListener('mouseleave', _hideTooltip);
  const closeBtn = document.createElement('div');
  closeBtn.className = 'tut-panel-close';
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('mouseenter', () => _showTooltip('Tutorial schließen', closeBtn));
  closeBtn.addEventListener('mouseleave', _hideTooltip);
  closeBtn.addEventListener('click', closeTutorial);
  ctrls.appendChild(minBtn);
  ctrls.appendChild(closeBtn);
  handle.appendChild(dotsEl);
  handle.appendChild(ctrls);
  panel.appendChild(handle);

  // Phase + Schritt
  const meta = document.createElement('div');
  meta.className = 'tut-panel-meta';
  const phaseBadge = document.createElement('span');
  phaseBadge.id = 'tutPhaseBadge';
  phaseBadge.className = 'tut-phase-badge';
  const phaseDot = document.createElement('span');
  phaseDot.className = 'tut-phase-dot';
  const phaseLabel = document.createElement('span');
  phaseLabel.id = 'tutPhaseLabel';
  phaseLabel.textContent = 'Einrichten';
  phaseBadge.appendChild(phaseDot);
  phaseBadge.appendChild(phaseLabel);
  const stepBadge = document.createElement('span');
  stepBadge.id = 'tutStepBadge';
  stepBadge.className = 'tut-step-badge';
  stepBadge.textContent = '1 / 16';
  meta.appendChild(phaseBadge);
  meta.appendChild(stepBadge);
  panel.appendChild(meta);

  // Fortschrittsbalken
  const progBar = document.createElement('div');
  progBar.className = 'tut-panel-prog-bar';
  const progFill = document.createElement('div');
  progFill.className = 'tut-panel-prog-fill';
  progFill.id = 'tutProgFill';
  progBar.appendChild(progFill);
  panel.appendChild(progBar);

  // Schritt-Dots
  const segs = document.createElement('div');
  segs.className = 'tut-segs';
  segs.id = 'tutSegs';
  panel.appendChild(segs);

  // Inhalt
  const body = document.createElement('div');
  body.className = 'tut-panel-body';
  body.id = 'tutPanelBody';
  panel.appendChild(body);

  // Footer / Navigation
  const footer = document.createElement('div');
  footer.className = 'tut-panel-footer';
  const nav = document.createElement('div');
  nav.className = 'tut-nav';
  const backBtn = document.createElement('button');
  backBtn.className = 'tut-btn back';
  backBtn.id = 'tutBackBtn';
  backBtn.textContent = '← Zurück';
  backBtn.addEventListener('click', tutBack);
  const nextBtn = document.createElement('button');
  nextBtn.className = 'tut-btn next';
  nextBtn.id = 'tutNextBtn';
  nextBtn.textContent = 'Weiter →';
  nextBtn.addEventListener('click', tutNext);
  nav.appendChild(backBtn);
  nav.appendChild(nextBtn);
  footer.appendChild(nav);
  panel.appendChild(footer);

  document.body.appendChild(panel);
  _makeDraggable(panel, handle);
  minBtn.addEventListener('click', () => panel.classList.toggle('tut-minimized'));
}

// Drag-Logik
let _tutUserDragged = false; // merkt ob User das Panel manuell verschoben hat

function _makeDraggable(panel, handle) {
  let dragging = false, ox = 0, oy = 0;
  handle.addEventListener('mousedown', (e) => {
    if (e.target.closest('.tut-panel-close, .tut-panel-minimize')) return;
    dragging = true;
    _tutUserDragged = true;
    panel.classList.add('tut-dragging');
    const rect = panel.getBoundingClientRect();
    panel.style.right  = 'auto';
    panel.style.bottom = 'auto';
    panel.style.left   = rect.left + 'px';
    panel.style.top    = rect.top  + 'px';
    ox = e.clientX - rect.left;
    oy = e.clientY - rect.top;
    handle.style.cursor = 'grabbing';
    e.preventDefault();
  });
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const x = Math.max(0, Math.min(window.innerWidth  - panel.offsetWidth,  e.clientX - ox));
    const y = Math.max(0, Math.min(window.innerHeight - panel.offsetHeight, e.clientY - oy));
    panel.style.left = x + 'px';
    panel.style.top  = y + 'px';
  });
  window.addEventListener('mouseup', () => {
    if (dragging) {
      dragging = false;
      handle.style.cursor = '';
      // Transition nach Drag wieder aktivieren (kurz verzögert)
      setTimeout(() => panel.classList.remove('tut-dragging'), 50);
    }
  });
}

// Panel neben das markierte Element bewegen
function _positionPanelNearTarget(el) {
  const panel = document.getElementById('tutPanel');
  if (!panel || !el) return;

  // Kurz warten bis el im Viewport gescrollt ist
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const MARGIN = 16;
      const pW = panel.offsetWidth  || 354;
      const pH = panel.offsetHeight || 400;
      const vW = window.innerWidth;
      const vH = window.innerHeight;
      const rect = el.getBoundingClientRect();

      let x, y;

      // 1. Rechts vom Element
      if (rect.right + MARGIN + pW <= vW) {
        x = rect.right + MARGIN;
        y = Math.max(MARGIN, Math.min(vH - pH - MARGIN, rect.top + rect.height / 2 - pH / 2));
      }
      // 2. Links vom Element
      else if (rect.left - MARGIN - pW >= 0) {
        x = rect.left - MARGIN - pW;
        y = Math.max(MARGIN, Math.min(vH - pH - MARGIN, rect.top + rect.height / 2 - pH / 2));
      }
      // 3. Unterhalb
      else if (rect.bottom + MARGIN + pH <= vH) {
        x = Math.max(MARGIN, Math.min(vW - pW - MARGIN, rect.left + rect.width / 2 - pW / 2));
        y = rect.bottom + MARGIN;
      }
      // 4. Oberhalb
      else {
        x = Math.max(MARGIN, Math.min(vW - pW - MARGIN, rect.left + rect.width / 2 - pW / 2));
        y = Math.max(MARGIN, rect.top - pH - MARGIN);
      }

      panel.style.right  = 'auto';
      panel.style.bottom = 'auto';
      panel.style.left   = x + 'px';
      panel.style.top    = y + 'px';
    });
  });
}

// ══════════════════════════════════════
//  NAVIGATION
// ══════════════════════════════════════
function tutNext() {
  const step = TUT_STEPS[_tutStep];
  if (step.special === "password") {
    _saveTutPassword(() => _advanceStep());
    return;
  }
  if (step.special === "username") _saveTutUsername();
  if (step.special === "zahltag") {
    const inp = document.getElementById("tutZahltag");
    if (inp) _tutSetZahltag(inp.value);
  }
  _advanceStep();
}
function _advanceStep() {
  if (_tutStep < TUT_STEPS.length - 1) {
    _tutStep++;
    _renderStep("next");
  } else {
    // 1. Konfetti sofort
    _celebrate();
    // 2. Kurz warten damit man es sieht
    setTimeout(() => {
      // 3. Panel schließen
      closeTutorial();
      // 4. Nach oben scrollen — smooth
      const main = document.querySelector(".main");
      if (main) main.scrollTo({ top: 0, behavior: "smooth" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1400);
  }
}
function tutBack() {
  if (_tutStep > 0) {
    _tutStep--;
    _renderStep("back");
  }
}
function tutGoTo(i) {
  const dir = i > _tutStep ? "next" : "back";
  _tutStep = i;
  _renderStep(dir);
}

// ══════════════════════════════════════
//  RENDER
// ══════════════════════════════════════
function _renderStep(dir) {
  const step = TUT_STEPS[_tutStep];
  const total = TUT_STEPS.length;
  const isLast = _tutStep === total - 1;
  const accent = _themeAccentColor();

  // App navigieren — merke ob Seitenwechsel nötig
  const currentPage = document.querySelector(".page.active")?.id?.replace("p-", "") || "";
  const needsNav = step.navTo && step.navTo !== currentPage;
  if (needsNav) _navTo(step.navTo);

  // Element highlighten + scroll + Panel-Positionierung
  // Seitenwechsel: 320ms warten bis CSS-Transition durch
  // Gleiche Seite: 40ms damit Render-Cycle nach Step-Wechsel abgeschlossen ist
  _clearHighlight();
  const highlightDelay = needsNav ? 320 : 40;

  if (step.target) {
    setTimeout(() => {
      requestAnimationFrame(() => {
        const el = document.querySelector(step.target)
                || (step.targetFallback && document.querySelector(step.targetFallback));
        if (!el) return;

        // Reticle setzen
        _highlightEl = el;
        _setReticle(el, accent);
        const lbl = document.getElementById("tutReticleLabel");
        if (lbl) lbl.textContent = step.hint || step.tag || "";

        // Scroll: Element mittig im sichtbaren main-Bereich zentrieren
        const pos = window.getComputedStyle(el).position;
        if (pos !== "fixed" && pos !== "sticky") {
          const main = document.querySelector(".main");
          if (main) {
            const mainRect   = main.getBoundingClientRect();
            const elRect     = el.getBoundingClientRect();
            const elCenter   = elRect.top - mainRect.top + elRect.height / 2;
            const viewCenter = mainRect.height / 2;
            const offset     = main.scrollTop + elCenter - viewCenter;
            main.scrollTo({ top: Math.max(0, offset), behavior: "smooth" });
          } else {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }

        // Panel positionieren: sofort (grob) + nach Scroll-Settle (präzise)
        // Scroll-Settle bei same-page länger warten da smooth-scroll ~400ms braucht
        _positionPanelNearTarget(el);
        setTimeout(() => _positionPanelNearTarget(el), needsNav ? 380 : 480);
      });
    }, highlightDelay);
  } else {
    // Kein Target → zurück zur Startposition (Ecke Sidebar/Content)
    const panel = document.getElementById('tutPanel');
    if (panel) {
      panel.style.right  = 'auto';
      panel.style.bottom = 'auto';
      panel.style.left   = '234px';
      panel.style.top    = '68px';
    }
  }

  // Panel-Body animieren
  const body = document.getElementById("tutPanelBody");
  if (body && dir) {
    body.classList.remove("slide-next", "slide-back");
    void body.offsetWidth;
    body.classList.add(dir === "next" ? "slide-next" : "slide-back");
  }

  // Progress
  const pct = ((_tutStep + 1) / total) * 100;
  const fill = document.getElementById("tutProgFill");
  if (fill) {
    fill.style.width = pct + "%";
    fill.style.background = accent;
  }

  // Phase
  const ph = TUT_PHASES.find((p) => p.steps.includes(_tutStep));
  const phBadge = document.getElementById("tutPhaseBadge");
  const phLabel = document.getElementById("tutPhaseLabel");
  if (ph && phBadge && phLabel) {
    phLabel.textContent = ph.label;
    phBadge.style.background = ph.color + "18";
    phBadge.style.borderColor = ph.color + "44";
    phBadge.style.color = ph.color;
    const dot = phBadge.querySelector(".tut-phase-dot");
    if (dot) dot.style.background = ph.color;
  }

  // Step badge
  const sb = document.getElementById("tutStepBadge");
  if (sb) sb.textContent = _tutStep + 1 + " / " + total;

  // Segment dots
  const segs = document.getElementById("tutSegs");
  if (segs) {
    segs.innerHTML = TUT_STEPS.map((_, i) => {
      const cls = i < _tutStep ? "done" : i === _tutStep ? "active" : "";
      return `<div class="tut-seg-dot ${cls}" onclick="tutGoTo(${i})" onmouseenter="_showTooltip('Schritt ${i + 1}',this)" onmouseleave="_hideTooltip()" style="--tut-accent:${accent}"></div>`;
    }).join("");
  }

  // Body füllen
  _renderPanelBody(step, accent);

  // Buttons
  const backBtn = document.getElementById("tutBackBtn");
  const nextBtn = document.getElementById("tutNextBtn");
  if (backBtn) backBtn.style.display = _tutStep === 0 ? "none" : "";
  if (nextBtn) {
    nextBtn.textContent =
      step.special === "demodata"
        ? "Überspringen →"
        : step.special === "password" && !localStorage.getItem(LOCK_KEY)
          ? "Speichern →"
          : isLast
            ? "Fertig 🚀"
            : "Weiter →";
    nextBtn.className = isLast ? "tut-btn finish" : "tut-btn next";
  }

  // accent auf Panel setzen
  const panel = document.getElementById("tutPanel");
  if (panel) panel.style.setProperty("--tut-accent", accent);
}

// ══════════════════════════════════════
//  PANEL BODY
// ══════════════════════════════════════
function _renderPanelBody(step, accent) {
  const body = document.getElementById("tutPanelBody");
  if (!body) return;

  const tipHtml = step.tip ? `<div class="tut-tip">💡 ${step.tip}</div>` : "";

  // Ziel-Hint: zeigt wohin der User schauen soll
  const hintHtml =
    step.target && step.hint
      ? `<div class="tut-target-hint">
        <span class="tut-target-hint-arrow">👉</span>
        <span style="flex:1">${step.hint}</span>
       </div>`
      : "";

  let innerHtml = "";

  if (step.special === "username") {
    const existing = CFG?.userName || "";
    innerHtml = `<p style="font-size:.8em;color:var(--text3);margin-bottom:10px">Wie heißt du? Dein Name erscheint als Begrüßung.</p>
      <div class="tut-input-wrap">
        <input id="tutNameInput" type="text" placeholder="Dein Vorname…" maxlength="30"
          value="${esc(existing)}" class="tut-input"
          oninput="CFG.userName=this.value.trim();saveSettings();_renderSidebarGreeting()">
      </div>${tipHtml}`;
    setTimeout(() => document.getElementById("tutNameInput")?.focus(), 80);
  } else if (step.special === "theme") {
    const themes = [
      { id: "candlescope", label: "Gold",   sub: "Dark · Amber",  a: "#d4a843" },
      { id: "mono",        label: "Mono",   sub: "Dark · Minimal", a: "#d4d4d4" },
      { id: "light",       label: "Light",  sub: "Hell · Teal",   a: "#0e7c75" },
      { id: "ivory",       label: "Ivory",  sub: "Hell · Gold",   a: "#946914" },
    ];
    const cur = CFG?.theme || "candlescope";
    innerHtml = `<p style="font-size:.78em;color:var(--text3);margin-bottom:10px">Wähle dein Design — App aktualisiert sofort.</p>
      <div class="tut-theme-grid tut-theme-grid--4">${themes
        .map((t) => {
          const active = t.id === cur;
          return `<div class="tut-theme-card${active ? " active" : ""}" data-theme="${t.id}"
          onclick="_tutSelectTheme('${t.id}')"
          style="background:${t.a}14;border-color:${active ? t.a : "var(--border)"}">
          <div class="tut-theme-orb" style="background:${t.a};box-shadow:0 0 12px ${t.a}88"></div>
          <div style="font-size:.66em;font-weight:700;color:${t.a};margin-top:5px;letter-spacing:0.3px">${t.label}</div>
          <div style="font-size:.52em;color:var(--text3);margin-top:1px">${t.sub}</div>
          ${active ? `<div class="tut-theme-check" style="color:${t.a}">✓</div>` : ""}
        </div>`;
        })
        .join("")}</div>`;
  } else if (step.special === "fontpicker") {
    const curFont = CFG?.font || "default";
    const curSize = CFG?.fontSize || 15;
    const fonts = [
      {
        id: "default",
        label: "Grotesk",
        sample: "Aa",
        family: "'Space Grotesk',sans-serif",
        weight: "600",
      },
      {
        id: "mono",
        label: "Mono",
        sample: "Aa",
        family: "'DM Mono',monospace",
        weight: "500",
      },
      {
        id: "barlow",
        label: "Barlow",
        sample: "AA",
        family: "'Barlow Condensed',sans-serif",
        weight: "700",
      },
    ];
    const sizes = [
      { l: "XS", v: 12 },
      { l: "S", v: 13 },
      { l: "M", v: 15 },
      { l: "L", v: 17 },
      { l: "XL", v: 19 },
    ];
    innerHtml = `
      <div class="tut-font-row">${fonts
        .map((f) => {
          const a = f.id === curFont;
          return `<button class="tut-font-card${a ? " active" : ""}" data-font="${f.id}"
          onclick="_tutSetFont('${f.id}')"
          style="font-family:${f.family};border-color:${a ? accent : "var(--border2)"}">
          <span style="font-size:1.2em;font-weight:${f.weight}">${f.sample}</span>
          <span style="font-size:.58em;font-family:var(--sans);opacity:.5">${f.label}</span>
        </button>`;
        })
        .join("")}</div>
      <p style="font-size:.72em;color:var(--text2);font-weight:600;margin:10px 0 6px">Schriftgröße</p>
      <div class="tut-size-row">${sizes
        .map((s) => {
          const a = s.v === curSize;
          return `<button class="tut-size-btn${a ? " active" : ""}" data-val="${s.v}"
          onclick="_tutSetFontSize(${s.v})"
          style="border-color:${a ? accent : "var(--border2)"};color:${a ? accent : "var(--text3)"}">
          <span style="font-size:${Math.max(9, s.v - 4)}px;font-weight:700">${s.l}</span>
        </button>`;
        })
        .join("")}</div>`;
  } else if (step.special === "password") {
    const hasPw = !!localStorage.getItem(LOCK_KEY);
    innerHtml = hasPw
      ? `<div class="tut-success-badge">✓ Passwort bereits eingerichtet</div>`
      : `<p style="font-size:.78em;color:var(--text3);margin-bottom:10px">Mind. 8 Zeichen · Groß/Klein · Zahl · Sonderzeichen</p>
         <div class="tut-input-wrap"><input id="tutPwInput" type="password" placeholder="Passwort" class="tut-input">
           <span onclick="toggleLockPwVis('tutPwInput',this)" class="tut-pw-eye">👁</span></div>
         <div class="tut-input-wrap" style="margin-top:6px"><input id="tutPwInput2" type="password" placeholder="Wiederholen" class="tut-input">
           <span onclick="toggleLockPwVis('tutPwInput2',this)" class="tut-pw-eye">👁</span></div>
         <div id="tutPwErr" style="font-size:.7em;min-height:16px;margin-top:4px"></div>
         ${tipHtml}`;
  } else if (step.special === "zahltag") {
    const curZ = S?.zahltag || CFG?.zahltag || 15;
    innerHtml = `
      <p style="font-size:.78em;color:var(--text3);margin-bottom:10px">Tag des Monats an dem dein Gehalt eingeht.</p>
      <div class="tut-zahltag-wrap">
        <button class="tut-zahltag-adj" onclick="_tutAdjZahltag(-1)">−</button>
        <div style="flex:1;position:relative">
          <input type="number" min="1" max="31" value="${curZ}" id="tutZahltag"
            oninput="_tutSetZahltag(this.value)" class="tut-zahltag-inp">
          <span style="position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:.7em;color:var(--text3);pointer-events:none">. des Monats</span>
        </div>
        <button class="tut-zahltag-adj" onclick="_tutAdjZahltag(1)">+</button>
      </div>
      <div id="tutZahltageMsg" class="tut-info-box">Das Cockpit rechnet was bis zum <strong>${curZ}.</strong> noch abgeht</div>
      ${tipHtml}`;
  } else if (step.special === "demodata") {
    const has =
      (S.accounts || []).some((a) => DEMO_ACC_IDS.includes(a.id)) ||
      (S.data || []).some((p) => DEMO_P_IDS.includes(p.id));
    innerHtml = !has
      ? `<div class="tut-success-badge">✓ Keine Demo-Daten — frischer Start.</div>`
      : `<p style="font-size:.8em;color:var(--text3);margin-bottom:10px">Demo-Daten von Max Mustermann sind vorhanden.</p>
         <div>
           <button class="tut-choice-btn tut-choice-danger" onclick="_tutDeleteDemoNow()">
             <span class="tut-choice-icon">🗑️</span>
             <span><strong>Jetzt löschen</strong><br><span class="tut-choice-sub">Alle Demo-Daten entfernen</span></span>
           </button>
           <button class="tut-choice-btn tut-choice-neutral" onclick="_tutKeepDemo()">
             <span class="tut-choice-icon">📖</span>
             <span><strong>Behalten</strong><br><span class="tut-choice-sub">Jederzeit in Einstellungen löschbar</span></span>
           </button>
         </div>
         <div id="tutDemoMsg" style="min-height:16px;margin-top:8px;font-size:.7em"></div>`;
  } else if (step.special === "finish") {
    const chips = [
      { i: "⌨️", l: "Esc", d: "Alles schließen" },
      { i: "💾", l: "Autosave", d: "Immer aktiv" },
      { i: "❓", l: "Tutorial", d: "Jederzeit neu" },
      { i: "📤", l: "Export", d: ".fbs Sicherung" },
      { i: "⚙️", l: "Settings", d: "Alles anpassbar" },
      { i: "💾", l: "Safepoints", d: "Stündlich auto" },
    ];
    innerHtml = `<div class="tut-finish-grid">${chips
      .map(
        (c) =>
          `<div class="tut-finish-chip"><span style="font-size:1.1em">${c.i}</span>
       <div><div style="font-size:.7em;font-weight:700;color:var(--text)">${c.l}</div>
       <div style="font-size:.62em;color:var(--text3)">${c.d}</div></div></div>`,
      )
      .join("")}</div>
      <p style="font-size:.78em;color:var(--text3);margin-top:12px;line-height:1.6">${step.body}</p>`;
  } else {
    innerHtml = `${step.body ? `<p class="tut-panel-text">${step.body}</p>` : ""}${hintHtml}${tipHtml}`;
  }

  body.innerHTML = `
    <div style="margin-bottom:12px">
      <div class="tut-panel-icon">${step.icon}</div>
      <div class="tut-panel-tag">${step.tag}</div>
      <div class="tut-panel-title">${step.title}</div>
    </div>
    <!-- hint already in innerHtml -->
    ${innerHtml}`;
}

// ══════════════════════════════════════
//  HIGHLIGHT HELPERS
// ══════════════════════════════════════
function _clearHighlight() {
  _clearReticle();
  if (_highlightEl) {
    _highlightEl.classList.remove("tut-highlight");
    _highlightEl = null;
  }
  document.querySelectorAll(".tut-highlight")
    .forEach(el => el.classList.remove("tut-highlight"));
}

// ══════════════════════════════════════
//  KONFETTI
// ══════════════════════════════════════
function _celebrate() {
  const colors = ["#4d9eff", "#00c87a", "#c9a84c", "#ff4d6a", "#7b5fff"];
  for (let i = 0; i < 40; i++) {
    const el = document.createElement("div");
    el.style.cssText = `position:fixed;top:${20 + Math.random() * 50}%;left:${5 + Math.random() * 90}%;width:${4 + Math.random() * 6}px;height:${4 + Math.random() * 6}px;background:${colors[i % colors.length]};border-radius:${Math.random() > 0.5 ? "50%" : "2px"};pointer-events:none;z-index:9999;animation:tut-confetti ${0.8 + Math.random() * 1.2}s ${Math.random() * 0.4}s cubic-bezier(.25,.46,.45,.94) both`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  }
}

// ══════════════════════════════════════
//  HELFER
// ══════════════════════════════════════
function _themeAccentColor() {
  const live = getComputedStyle(document.documentElement)
    .getPropertyValue("--blue")
    .trim();
  if (live) return live;
  const map = { candlescope: "#d4a843", mono: "#d4d4d4", light: "#0e7c75", ivory: "#946914" };
  return map[CFG?.theme] || "#d4a843";
}
function _navTo(page) {
  const titles = {
    dashboard: "Dashboard",
    posten: "Umsätze",
    jahr: "Jahresübersicht",
    vertraege: "Verträge",
    goals: "Sparziele",
    settings: "Einstellungen",
    docs: "Über diese App",
  };
  if (!titles[page]) return;
  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  const pg = document.getElementById("p-" + page);
  if (pg) pg.classList.add("active");
  document.querySelectorAll(".nav-item").forEach((n) => {
    if ((n.getAttribute("onclick") || "").includes("'" + page + "'"))
      n.classList.add("active");
  });
  const t = document.getElementById("pageTitle");
  if (t) t.textContent = titles[page];
  if (page === "dashboard") renderDashboard();
  if (page === "posten") renderPosten();
  if (page === "jahr") renderJahr();
  if (page === "vertraege") renderVertraege();
  if (page === "goals") renderGoals();
  if (page === "settings") renderSettings();
  if (page === "docs") renderDocs();
}
function _saveTutUsername() {
  const val = document.getElementById("tutNameInput")?.value.trim();
  if (val) {
    CFG.userName = val;
    saveSettings();
    _renderSidebarGreeting();
  }
}
function _renderSidebarGreeting() {
  const el = document.getElementById("sidebarGreeting");
  if (!el) return;
  const name = CFG?.userName;
  el.style.display = name ? "block" : "none";
  if (name) el.textContent = "Hallo, " + name + " 👋";
}
async function _saveTutPassword(onSuccess) {
  const pw = document.getElementById("tutPwInput")?.value || "";
  const pw2 = document.getElementById("tutPwInput2")?.value || "";
  const err = document.getElementById("tutPwErr");
  if (localStorage.getItem(LOCK_KEY) || (!pw && !pw2)) {
    onSuccess();
    return;
  }
  const ve = validatePassword(pw);
  if (ve) {
    if (err) {
      err.style.color = "var(--red)";
      err.textContent = ve;
    }
    return;
  }
  if (pw !== pw2) {
    if (err) {
      err.style.color = "var(--red)";
      err.textContent = "Passwörter stimmen nicht überein";
    }
    return;
  }
  localStorage.setItem(LOCK_KEY, await _pwHash(pw));
  sessionStorage.setItem(LOCK_DONE, "1");
  if (err) {
    err.style.color = "var(--green)";
    err.textContent = "✓ Gespeichert";
  }
  setTimeout(onSuccess, 700);
}
function _tutSelectTheme(id) {
  const a = { candlescope: "#d4a843", mono: "#d4d4d4", light: "#0e7c75", ivory: "#946914" };
  document.querySelectorAll(".tut-theme-card").forEach((c) => {
    const active = c.dataset.theme === id;
    c.classList.toggle("active", active);
    c.style.borderColor = active
      ? a[c.dataset.theme] || "var(--blue)"
      : "var(--border)";
    const ch = c.querySelector(".tut-theme-check");
    if (ch) ch.style.display = active ? "" : "none";
  });
  setTheme(id);
  const newA = _themeAccentColor();
  document.getElementById("tutPanel")?.style.setProperty("--tut-accent", newA);
}
function _tutSetFont(id) {
  if (typeof setFont === "function") setFont(id);
  const a = _themeAccentColor();
  document.querySelectorAll(".tut-font-card").forEach((b) => {
    const active = b.dataset.font === id;
    b.classList.toggle("active", active);
    b.style.borderColor = active ? a : "var(--border2)";
  });
}
function _tutSetFontSize(val) {
  if (typeof setFontSize === "function") setFontSize(val);
  const a = _themeAccentColor();
  document.querySelectorAll(".tut-size-btn").forEach((b) => {
    const active = parseInt(b.dataset.val) === val;
    b.classList.toggle("active", active);
    b.style.borderColor = active ? a : "var(--border2)";
    b.style.color = active ? a : "var(--text3)";
  });
}
function _tutSetZahltag(val) {
  const z = Math.min(31, Math.max(1, parseInt(val) || 15));
  if (typeof setZahltag === "function") setZahltag(z);
  const msg = document.getElementById("tutZahltageMsg");
  if (msg) msg.innerHTML = `✓ Zahltag: <strong>${z}. des Monats</strong>`;
}
function _tutAdjZahltag(delta) {
  const inp = document.getElementById("tutZahltag");
  if (!inp) return;
  const nxt = Math.min(31, Math.max(1, (parseInt(inp.value) || 15) + delta));
  inp.value = nxt;
  _tutSetZahltag(nxt);
}

const DEMO_ACC_IDS = [
  "acc_giro",
  "acc_visa",
  "acc_dkb",
  "acc_dkb2",
  "acc_depot",
  "acc_vl",
  "acc_bar",
];
const DEMO_P_IDS = [
  "p_geh",
  "p_vlag",
  "p_kash",
  "p_zins",
  "p_miet",
  "p_stro",
  "p_gez",
  "p_kv",
  "p_haft",
  "p_kfz",
  "p_rkv",
  "p_kred",
  "p_tank",
  "p_dtkt",
  "p_inet",
  "p_mob",
  "p_nflx",
  "p_spot",
  "p_amaz",
  "p_clou",
  "p_fit",
  "p_arzt",
  "p_etf",
  "p_tgsp",
];
const DEMO_G_IDS = ["g1", "g2", "g3", "g4", "g5"];

function _tutDeleteDemoNow() {
  if (typeof _doClearAllData === "function") _doClearAllData();
  const msg = document.getElementById("tutDemoMsg");
  if (msg) {
    msg.style.color = "var(--green)";
    msg.textContent = "✓ Gelöscht — sauberer Neustart!";
  }
  setTimeout(() => _advanceStep(), 900);
}
function _tutKeepDemo() {
  const msg = document.getElementById("tutDemoMsg");
  if (msg) {
    msg.style.color = "var(--text3)";
    msg.textContent = "Behalten — jederzeit in Einstellungen löschbar.";
  }
  setTimeout(() => _advanceStep(), 700);
}
function checkFirstVisit() {
  try {
    if (!localStorage.getItem("csf_tut_done"))
      setTimeout(() => openTutorial(0), 900);
    _renderSidebarGreeting();
  } catch (e) {}
}
