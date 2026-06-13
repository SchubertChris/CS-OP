// ══════════════════════════════════════
//  SETTINGS — Einstellungen
// ══════════════════════════════════════

const SETTINGS_KEY = "csf_settings";

const DEFAULT_SETTINGS = {
  theme: "ivory",
  font: "default",
  fontSize: 17,
  autosave: true,
  privacyAutoLock: false,
  userName: "",
  bgImage: null,
  bgFit: "cover",
  bgStyle: "gradient",
  bgStrength: 55,
  pwEnabled: false,
  zahltag: 15,
  tooltips: true,
  contractAlerts: true,
  userAvatar: null,
  panelBlur: 20,
};

let CFG = { ...DEFAULT_SETTINGS };
// ── LOAD / SAVE ───────────────────────
function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) CFG = Object.assign({}, DEFAULT_SETTINGS, JSON.parse(raw));
  } catch (e) {}
  if (CFG.zahltag) S.zahltag = CFG.zahltag;
  if (CFG.fontSize < 17) CFG.fontSize = 17;
  const VALID_THEMES = ['candlescope', 'ivory', 'mono', 'light', 'dark', 'crimson'];
  if (!VALID_THEMES.includes(CFG.theme)) CFG.theme = 'candlescope';
  applySettings();
}

function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(CFG));
  } catch (e) {}
  applySettings();
}

// ── APPLY ─────────────────────────────
function applySettings() {
  if (typeof _renderSidebarGreeting === "function") _renderSidebarGreeting();
  const root = document.documentElement;
  root.setAttribute("data-theme", CFG.theme);
  requestAnimationFrame(() => {
    const blue = getComputedStyle(root).getPropertyValue("--blue").trim();
    if (blue) root.style.setProperty("--tut-accent", blue);
    const tutBox = document.getElementById("tutorialBox");
    if (tutBox) tutBox.style.setProperty("--tut-accent", blue);
  });
  root.setAttribute("data-font", CFG.font);
  const _gfontMap = {
    barlow: {
      id: "barlowFont",
      href: "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&display=swap",
    },
    inter: {
      id: "interFont",
      href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
    },
    outfit: {
      id: "outfitFont",
      href: "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap",
    },
    syne: {
      id: "syneFont",
      href: "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap",
    },
  };
  if (_gfontMap[CFG.font] && !document.getElementById(_gfontMap[CFG.font].id)) {
    const lnk = document.createElement("link");
    lnk.id = _gfontMap[CFG.font].id;
    lnk.rel = "stylesheet";
    lnk.href = _gfontMap[CFG.font].href;
    document.head.appendChild(lnk);
  }
  root.style.fontSize = CFG.fontSize + "px";
  document.body.style.fontSize = CFG.fontSize + "px";
  const bgEl = document.querySelector(".bg");
  if (bgEl) {
    if (CFG.bgImage) {
      bgEl.classList.add("has-custom-bg");
      bgEl.style.backgroundImage = `url(${CFG.bgImage})`;
      bgEl.style.filter = "none";
      const fit = CFG.bgFit || "cover";
      if (fit === "cover") {
        bgEl.style.backgroundSize = "cover";
        bgEl.style.backgroundRepeat = "no-repeat";
        bgEl.style.backgroundPosition = "center";
      } else if (fit === "contain") {
        bgEl.style.backgroundSize = "contain";
        bgEl.style.backgroundRepeat = "no-repeat";
        bgEl.style.backgroundPosition = "center";
      } else if (fit === "center") {
        bgEl.style.backgroundSize = "auto";
        bgEl.style.backgroundRepeat = "no-repeat";
        bgEl.style.backgroundPosition = "center";
      } else if (fit === "tile") {
        bgEl.style.backgroundSize = "auto";
        bgEl.style.backgroundRepeat = "repeat";
        bgEl.style.backgroundPosition = "top left";
      } else if (fit === "stretch") {
        bgEl.style.backgroundSize = "100% 100%";
        bgEl.style.backgroundRepeat = "no-repeat";
        bgEl.style.backgroundPosition = "center";
      }
    } else {
      // Default: theme-adaptives Hintergrundbild (dark/light), wechselt mit Theme
      bgEl.classList.remove("has-custom-bg");
      _applyDefaultBgPattern(bgEl);
    }
  }
  const lbl = document.getElementById("saveLabel");
  if (lbl) lbl.textContent = CFG.autosave ? "autosave · on" : "autosave · off";
  _ucApplyBlur();
  _ucRefresh();
}
// ── ACTIONS ───────────────────────────
function setTheme(t) {
  CFG.theme = t;
  const _applyTheme = () => {
    saveSettings();
    renderSettings();
    if (!CFG.bgImage) _applyDefaultBgPattern(document.querySelector(".bg"));
  };
  if (document.startViewTransition) {
    document.startViewTransition(_applyTheme);
  } else {
    _applyTheme();
  }
  if (typeof refreshDash === "function") setTimeout(refreshDash, 120);
}
function setFont(f) {
  CFG.font = f;
  saveSettings();
  renderSettings();
}
function setZahltag(val) {
  const z = Math.min(31, Math.max(1, parseInt(val) || 15));
  CFG.zahltag = z;
  S.zahltag = z;
  persist();
  saveSettings();
  refreshDash();
}
function setFontSize(val) {
  CFG.fontSize = parseInt(val);
  const root = document.documentElement;
  root.style.fontSize = CFG.fontSize + "px";
  document.body.style.fontSize = CFG.fontSize + "px";
  const lbl = document.getElementById("fontSizeLabel");
  if (lbl) lbl.textContent = CFG.fontSize + "px";
  saveSettings();
}
function toggleTooltips() {
  CFG.tooltips = CFG.tooltips === false ? true : false;
  saveSettings();
  renderSettings();
}
function toggleAutosave() {
  CFG.autosave = !CFG.autosave;
  saveSettings();
  renderSettings();
}
function togglePrivacyAutoLock() {
  CFG.privacyAutoLock = !CFG.privacyAutoLock;
  saveSettings();
  renderSettings();
  if (CFG.privacyAutoLock) _resetInactivityTimer?.();
  else clearTimeout(window._inactivityTimer);
}
function toggleContractAlerts() {
  CFG.contractAlerts = CFG.contractAlerts === false ? true : false;
  saveSettings();
  renderSettings();
  if (typeof updateContractBadge === "function") updateContractBadge();
}
function uploadBg(input) {
  const file = input.files[0];
  if (!file) return;
  const r = new FileReader();
  r.onload = (e) => {
    CFG.bgImage = e.target.result;
    saveSettings();
    renderSettings();
  };
  r.readAsDataURL(file);
}
// ── CSS-HINTERGRUND GENERATOR ─────────
// Muster-Farbe = Theme-Akzent (--blue); Intensität = CFG.bgStrength (0–100).
function _bgHexToRgb(hex) {
  hex = String(hex || "").trim().replace(/^#/, "");
  if (hex.length === 3) hex = hex.split("").map((ch) => ch + ch).join("");
  const n = parseInt(hex, 16);
  if (hex.length !== 6 || isNaN(n)) return { r: 212, g: 168, b: 67 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function _bgAccentRgb() {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--blue").trim();
  return _bgHexToRgb(v || "#d4a843");
}
function _bgBaseColor(theme) {
  return ({ candlescope: "#070705", mono: "#080808", light: "#f0efe8", ivory: "#f9f5eb" })[theme] || "#070705";
}
function _bgStrengthFactor() {
  const s = CFG.bgStrength == null ? 55 : CFG.bgStrength;
  return Math.max(0, Math.min(1, s / 100));
}

function _buildBgCss(style) {
  const theme = document.documentElement.dataset.theme || "candlescope";
  const bg = _bgBaseColor(theme);
  const { r, g, b } = _bgAccentRgb();
  const isLight = theme === "light" || theme === "ivory";
  const s = _bgStrengthFactor();
  const k = isLight ? 1.25 : 1; // helle Themes brauchen mehr Deckkraft
  const rgba = (a) => `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a * s * k)).toFixed(3)})`;

  if (style === "solid") {
    const glow = `radial-gradient(ellipse 90% 75% at 50% -10%, ${rgba(0.14)} 0%, transparent 60%)`;
    return { backgroundColor: bg, backgroundImage: glow, backgroundRepeat: "no-repeat", backgroundSize: "auto", backgroundPosition: "center top" };
  }
  if (style === "grid") {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><path d='M32 0L0 0 0 32' fill='none' stroke='${rgba(0.30)}' stroke-width='0.6'/></svg>`;
    return { backgroundColor: bg, backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`, backgroundRepeat: "repeat", backgroundSize: "32px 32px", backgroundPosition: "0 0" };
  }
  if (style === "noise") {
    const R = (r / 255).toFixed(3), G = (g / 255).toFixed(3), B = (b / 255).toFixed(3);
    const A = Math.max(0, Math.min(1, 0.6 * s * k)).toFixed(3);
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 ${R} 0 0 0 0 ${G} 0 0 0 0 ${B} 0 0 0 ${A} 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`;
    return { backgroundColor: bg, backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`, backgroundRepeat: "repeat", backgroundSize: "256px 256px", backgroundPosition: "0 0" };
  }
  // gradient (default)
  const g1 = `radial-gradient(ellipse 70% 65% at 10% 20%, ${rgba(0.34)} 0%, transparent 65%)`;
  const g2 = `radial-gradient(ellipse 65% 70% at 90% 80%, ${rgba(0.20)} 0%, transparent 65%)`;
  const g3 = `radial-gradient(ellipse 50% 45% at 52% 48%, ${rgba(0.13)} 0%, transparent 55%)`;
  const dot = `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28'><circle cx='14' cy='14' r='1' fill='${rgba(0.20)}'/></svg>`;
  const dotUrl = `url("data:image/svg+xml,${encodeURIComponent(dot)}")`;
  return {
    backgroundColor: bg,
    backgroundImage: `${g1}, ${g2}, ${g3}, ${dotUrl}`,
    backgroundRepeat: "no-repeat, no-repeat, no-repeat, repeat",
    backgroundSize: "auto, auto, auto, 28px 28px",
    backgroundPosition: "0 0, 100% 100%, center, 0 0",
  };
}

function _buildBgCssPreview(style) {
  const theme = document.documentElement.dataset.theme || "candlescope";
  const bg = _bgBaseColor(theme);
  const { r, g, b } = _bgAccentRgb();
  const isLight = theme === "light" || theme === "ivory";
  const s = _bgStrengthFactor();
  const k = isLight ? 1.3 : 1;
  // Vorschau etwas kräftiger (kleine Kachel) — Boost-Faktor
  const rgba = (a) => `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a * (0.35 + s * 0.9) * k)).toFixed(3)})`;

  if (style === "solid") {
    const glow = `radial-gradient(ellipse 100% 90% at 50% -20%, ${rgba(0.32)} 0%, transparent 65%)`;
    return { backgroundColor: bg, backgroundImage: glow, backgroundRepeat: "no-repeat", backgroundSize: "auto", backgroundPosition: "center top" };
  }
  if (style === "grid") {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14'><path d='M14 0L0 0 0 14' fill='none' stroke='${rgba(0.55)}' stroke-width='0.8'/></svg>`;
    return { backgroundColor: bg, backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`, backgroundRepeat: "repeat", backgroundSize: "14px 14px", backgroundPosition: "0 0" };
  }
  if (style === "noise") {
    const R = (r / 255).toFixed(3), G = (g / 255).toFixed(3), B = (b / 255).toFixed(3);
    const A = Math.max(0, Math.min(1, (0.35 + s * 0.9) * k * 0.85)).toFixed(3);
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><filter id='np'><feTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 ${R} 0 0 0 0 ${G} 0 0 0 0 ${B} 0 0 0 ${A} 0'/></filter><rect width='100%' height='100%' filter='url(#np)'/></svg>`;
    return { backgroundColor: bg, backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`, backgroundRepeat: "repeat", backgroundSize: "128px 128px", backgroundPosition: "0 0" };
  }
  const g1 = `radial-gradient(ellipse 90% 90% at 15% 25%, ${rgba(0.6)} 0%, transparent 70%)`;
  const g2 = `radial-gradient(ellipse 80% 80% at 88% 80%, ${rgba(0.4)} 0%, transparent 65%)`;
  const dot = `<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14'><circle cx='7' cy='7' r='1' fill='${rgba(0.5)}'/></svg>`;
  const dotUrl = `url("data:image/svg+xml,${encodeURIComponent(dot)}")`;
  return {
    backgroundColor: bg,
    backgroundImage: `${g1}, ${g2}, ${dotUrl}`,
    backgroundRepeat: "no-repeat, no-repeat, repeat",
    backgroundSize: "auto, auto, 14px 14px",
    backgroundPosition: "center, center, 0 0",
  };
}

function _applyDefaultBgPattern(bgEl) {
  if (!bgEl) return;
  const css = _buildBgCss(CFG.bgStyle || "gradient");
  bgEl.classList.add("has-custom-bg");
  Object.assign(bgEl.style, css);
  bgEl.style.filter = "none";
}

function clearBg() {
  CFG.bgImage = null;
  saveSettings();
  renderSettings();
}
function setBgStyle(style) {
  CFG.bgStyle = style;
  CFG.bgImage = null;
  saveSettings();
  renderSettings();
}
function setBgFit(fit) {
  CFG.bgFit = fit;
  saveSettings();
  applySettings();
  document
    .querySelectorAll(".bg-fit-btn")
    .forEach((b) =>
      b.classList.toggle(
        "active",
        b.getAttribute("onclick").includes(`'${fit}'`),
      ),
    );
}

async function enablePassword() {
  const pw = document.getElementById("pwNew")?.value || "",
    pw2 = document.getElementById("pwNew2")?.value || "",
    err = document.getElementById("pwErr");
  const ve = validatePassword(pw);
  if (ve) {
    err.textContent = ve;
    return;
  }
  if (pw !== pw2) {
    err.textContent = "Passwörter stimmen nicht überein";
    return;
  }
  localStorage.setItem(LOCK_KEY, await _pwHash(pw));
  CFG.pwEnabled = true;
  saveSettings();
  renderSettings();
}
async function changePassword() {
  const old = document.getElementById("pwOld")?.value || "",
    pw = document.getElementById("pwNew")?.value || "",
    pw2 = document.getElementById("pwNew2")?.value || "",
    err = document.getElementById("pwErr");
  const stored = localStorage.getItem(LOCK_KEY);
  if (!(await _pwVerify(old, stored))) {
    err.textContent = "Aktuelles Passwort falsch";
    return;
  }
  const ve = validatePassword(pw);
  if (ve) {
    err.textContent = ve;
    return;
  }
  if (pw !== pw2) {
    err.textContent = "Neue Passwörter stimmen nicht überein";
    return;
  }
  localStorage.setItem(LOCK_KEY, await _pwHash(pw));
  err.style.color = "var(--green)";
  err.textContent = "✓ Passwort geändert";
  setTimeout(() => renderSettings(), 1200);
}
function removePassword() {
  appConfirm("Passwortschutz wirklich deaktivieren?", {
    icon: "🔓",
    title: "Passwort entfernen",
    confirmLabel: "Deaktivieren",
    confirmClass: "danger",
  }).then((ok) => {
    if (ok) _doRemovePassword();
  });
}
function _doRemovePassword() {
  localStorage.removeItem(LOCK_KEY);
  sessionStorage.removeItem(LOCK_DONE);
  CFG.pwEnabled = false;
  saveSettings();
  renderSettings();
}
// ── RESET ALL ─────────────────────────
function confirmResetAll() {
  appConfirm(
    "Folgendes wird unwiderruflich gelöscht:\n• Alle Konten, Posten, Umbuchungen, Ziele\n• Passwortschutz\n• Einstellungen\n• Tutorial-Status\n\nVorher wird automatisch ein Backup als .fbs-Datei gespeichert.\nDie App startet danach wie beim ersten Mal.",
    {
      icon: "⚠️",
      title: "App komplett zurücksetzen",
      confirmLabel: "Backup & Alles löschen",
      confirmClass: "danger",
    },
  ).then((ok) => {
    if (ok) _doResetAll();
  });
}

async function _doResetAll() {
  await _createBackupBeforeClear("reset");
  await new Promise((r) => setTimeout(r, 400));
  if (window.csf?.archive?.clearAll) await window.csf.archive.clearAll();
  localStorage.clear();
  sessionStorage.clear();
  S.accounts = [];
  S.data = [];
  S.transfers = [];
  S.goals = [];
  S.bookings = [];
  S.creditors = [];
  S.groupOrder = [];
  S.groupAccOrder = {};
  S.monthlyIncome = 0;
  S.zahltag = 15;
  Object.assign(CFG, DEFAULT_SETTINGS);
  await appAlert(
    "Backup gespeichert & App zurückgesetzt.\nDie Seite wird jetzt neu geladen.",
    { icon: "✅", title: "Zurückgesetzt" },
  );
  window.location.reload();
}

// ── BACKUP HELPER ─────────────────────
function _downloadBackup(reason) {
  try {
    const snapshot = {
      _meta: {
        version: "6.0",
        exported: new Date().toISOString(),
        reason: reason || "manual",
        appName: "VaultBox",
      },
      state: {
        accounts: S.accounts,
        data: S.data,
        transfers: S.transfers,
        goals: S.goals,
        bookings: S.bookings || [],
        monthlyIncome: S.monthlyIncome,
        zahltag: S.zahltag,
        groupOrder: S.groupOrder,
        groupAccOrder: S.groupAccOrder,
      },
      settings: { ...CFG },
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    const ts = new Date()
      .toISOString()
      .slice(0, 16)
      .replace("T", "_")
      .replace(/:/g, "-");
    a.href = url;
    a.download = `csf_backup_${reason}_${ts}.fbs`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  } catch (e) {
    console.warn("Backup fehlgeschlagen:", e);
  }
}

// ── ALLE DATEN LÖSCHEN ───────────────
async function confirmClearAllData() {
  const ok = await appConfirm(
    "Alle Konten, Posten, Transfers, Ziele und Buchungen werden gelöscht.\n\nEinstellungen und Passwort bleiben erhalten.\nEin vollständiges Backup wird automatisch angelegt.",
    {
      icon: "🗑️",
      title: "Alle Daten löschen",
      confirmLabel: "Backup erstellen & löschen",
      confirmClass: "danger",
    },
  );
  if (!ok) return;
  await _createBackupBeforeClear("clear");
  _doClearAllData();
}

async function _createBackupBeforeClear(reason) {
  const date = new Date().toISOString().slice(0, 10);
  const time = new Date().toTimeString().slice(0, 5).replace(":", "-");
  const filename = `csf_backup_${reason}_${date}_${time}.fbs`;

  // Über IPC exportieren falls verfügbar (mit Archiv)
  if (window.csf?.export?.fullAuto) {
    try {
      await window.csf.export.fullAuto(S, CFG, filename);
      return;
    } catch (e) {}
  }

  // Fallback: plain JSON Download
  const snapshot = {
    _meta: {
      version: "10.6",
      exported: new Date().toISOString(),
      reason,
      appName: "VaultBox",
    },
    state: {
      accounts: S.accounts,
      data: S.data,
      transfers: S.transfers,
      goals: S.goals,
      bookings: S.bookings || [],
      monthlyIncome: S.monthlyIncome,
      zahltag: S.zahltag,
      groupOrder: S.groupOrder,
      groupAccOrder: S.groupAccOrder,
    },
    settings: { ...CFG },
  };
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function _doClearAllData() {
  // ── Daten leeren ──
  S.accounts = [];
  S.data = [];
  S.transfers = [];
  S.goals = [];
  S.bookings = [];
  S.creditors = [];
  S.groupOrder = [];
  S.groupAccOrder = {};
  S.monthlyIncome = 0;
  S.zahltag = CFG.zahltag || 15;
  persist();
  if (window.csf?.archive?.clearAll) window.csf.archive.clearAll();

  // ── Alle Seiten still neu rendern ──
  renderDashboard();
  if (typeof renderPosten === "function") renderPosten();
  if (typeof renderVertraege === "function") renderVertraege();
  if (typeof renderGoals === "function") renderGoals();
  if (typeof renderJahr === "function") renderJahr();
  if (typeof renderKreditoren === "function") renderKreditoren();
  if (typeof updateContractBadge === "function") updateContractBadge();

  // ── Sanfte Animation: Overlay einblenden → Dashboard navigieren → ausblenden ──
  const overlay = document.createElement("div");
  overlay.id = "clearDataOverlay";
  overlay.style.cssText = [
    "position:fixed",
    "inset:0",
    "z-index:999",
    "background:var(--bg,#080a0f)",
    "display:flex",
    "flex-direction:column",
    "align-items:center",
    "justify-content:center",
    "gap:20px",
    "opacity:0",
    "transition:opacity .35s ease",
    "pointer-events:all",
  ].join(";");

  overlay.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:16px;">
      <div style="
        width:56px;height:56px;border-radius:16px;
        background:linear-gradient(135deg,var(--panel2),var(--panel));
        border:1px solid var(--border2);
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 0 32px var(--blue-a20);
        animation:clear-pulse 1.2s ease-in-out infinite;
      ">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
          width="24" height="24" style="color:var(--blue);opacity:.8">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14H6L5 6"/>
          <path d="M10 11v6M14 11v6"/>
        </svg>
      </div>
      <div style="font-family:var(--sans);font-size:.85em;font-weight:600;color:var(--text2);letter-spacing:.2px;">
        Wird geleert…
      </div>
      <div style="width:120px;height:2px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden;">
        <div style="height:100%;width:0%;background:var(--blue);border-radius:2px;
          animation:clear-bar .7s .15s cubic-bezier(.4,0,.2,1) forwards;"></div>
      </div>
    </div>`;

  // Keyframes einmalig injizieren
  if (!document.getElementById("clearDataStyles")) {
    const st = document.createElement("style");
    st.id = "clearDataStyles";
    st.textContent = `
      @keyframes clear-pulse {
        0%,100% { box-shadow:0 0 20px var(--blue-a12); }
        50%      { box-shadow:0 0 36px var(--blue-a25); }
      }
      @keyframes clear-bar {
        from { width:0% }
        to   { width:100% }
      }
    `;
    document.head.appendChild(st);
  }

  document.body.appendChild(overlay);

  // Einblenden
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.style.opacity = "1";
    });
  });

  // Nach kurzer Pause: zur Übersicht navigieren, dann ausblenden
  setTimeout(() => {
    // Zur Übersicht navigieren
    document
      .querySelectorAll(".nav-item")
      .forEach((n) => n.classList.remove("active"));
    document
      .querySelectorAll(".page")
      .forEach((p) => p.classList.remove("active"));
    const dash = document.getElementById("p-dashboard");
    if (dash) dash.classList.add("active");
    document.querySelectorAll(".nav-item").forEach((n) => {
      if ((n.getAttribute("onclick") || "").includes("'dashboard'"))
        n.classList.add("active");
    });
    const title = document.getElementById("pageTitle");
    if (title) title.textContent = "Dashboard";

    // Nach oben scrollen
    const main = document.querySelector(".main");
    if (main) main.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Ausblenden
    setTimeout(() => {
      overlay.style.opacity = "0";
      setTimeout(() => overlay.remove(), 380);
    }, 300);
  }, 850);
}

// ── BG FIT BUTTONS HELPER ────────────
function _bgFitButtons(activeFit) {
  const fit = activeFit || "cover";
  const opts = [
    {
      id: "cover",
      svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="20" height="20" rx="2"/><rect x="5" y="5" width="14" height="14" rx="1" fill="currentColor" opacity=".25"/><polyline points="10 8 16 8 16 14" stroke-width="2"/><line x1="8" y1="16" x2="16" y2="8" stroke-width="2"/></svg>',
      label: "Ausfüllen",
    },
    {
      id: "contain",
      svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="20" height="20" rx="2"/><rect x="6" y="8" width="12" height="8" rx="1" fill="currentColor" opacity=".3"/></svg>',
      label: "Anpassen",
    },
    {
      id: "stretch",
      svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="20" height="20" rx="2"/><rect x="3" y="3" width="18" height="18" rx="1" fill="currentColor" opacity=".25"/></svg>',
      label: "Strecken",
    },
    {
      id: "tile",
      svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="20" height="20" rx="2"/><rect x="3" y="3" width="8" height="8" rx="1" fill="currentColor" opacity=".3"/><rect x="13" y="3" width="8" height="8" rx="1" fill="currentColor" opacity=".3"/><rect x="3" y="13" width="8" height="8" rx="1" fill="currentColor" opacity=".3"/><rect x="13" y="13" width="8" height="8" rx="1" fill="currentColor" opacity=".3"/></svg>',
      label: "Kacheln",
    },
    {
      id: "center",
      svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="20" height="20" rx="2"/><rect x="8" y="8" width="8" height="8" rx="1" fill="currentColor" opacity=".35"/></svg>',
      label: "Zentriert",
    },
  ];
  return opts
    .map(
      (o) =>
        '<button class="bg-fit-btn ' +
        (fit === o.id ? "active" : "") +
        '" onclick="setBgFit(\'' +
        o.id +
        '\')" onmouseenter="_showTooltip(\'' +
        o.label +
        '\',this)" onmouseleave="_hideTooltip()">' +
        o.svg +
        "<span>" +
        o.label +
        "</span></button>",
    )
    .join("");
}
// ── RENDER SETTINGS PAGE ─────────────
function renderSettings() {
  const el = document.getElementById("p-settings");
  if (!el) return;
  while (el.firstChild) el.removeChild(el.firstChild);
  const hasPw = !!localStorage.getItem(LOCK_KEY);
  // ── DOM helpers (local) ──────────────
  const NS = "http://www.w3.org/2000/svg";
  function _e(tag, cls) {
    const d = document.createElement(tag);
    if (cls) d.className = cls;
    return d;
  }
  function _t(text) {
    return document.createTextNode(text);
  }
  function _svgEl(tag) {
    return document.createElementNS(NS, tag);
  }
  function _stIcon(elDefs) {
    // elDefs: [{tag, attrs}]
    const svg = _svgEl("svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    elDefs.forEach(({ tag, attrs }) => {
      const el = _svgEl(tag);
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      svg.appendChild(el);
    });
    return svg;
  }
  function _cardTitle(iconDefs, text) {
    const d = _e("div", "settings-card-title");
    d.appendChild(_stIcon(iconDefs));
    d.appendChild(_t(text));
    return d;
  }
  function _toggle(isOn, fn) {
    const sw = _e("div", "toggle-switch" + (isOn ? " on" : ""));
    sw.addEventListener("click", fn);
    sw.appendChild(_e("div", "toggle-knob"));
    return sw;
  }
  function _row(lbl, desc, right) {
    const row = _e("div", "settings-row");
    const left = _e("div");
    const l = _e("div", "settings-row-label");
    l.textContent = lbl;
    left.appendChild(l);
    if (desc) {
      const d = _e("div", "settings-row-desc");
      d.textContent = desc;
      left.appendChild(d);
    }
    row.appendChild(left);
    if (right) row.appendChild(right);
    return row;
  }
  function _card(extra) {
    return _e("div", "settings-card" + (extra ? " " + extra : ""));
  }
  function _pwInput(id, placeholder) {
    const wrap = _e("div", "pw-input-wrap");
    const inp = _e("input", "settings-input");
    inp.type = "password";
    inp.id = id;
    inp.placeholder = placeholder;
    const eye = _e("button", "pw-eye-btn");
    eye.type = "button";
    eye.tabIndex = -1;
    eye.textContent = "👁";
    eye.addEventListener("click", function () {
      if (typeof toggleLockPwVis === "function") toggleLockPwVis(id, this);
    });
    wrap.appendChild(inp);
    wrap.appendChild(eye);
    return wrap;
  }

  const themeCards = [
    {
      id: "candlescope",
      label: "Gold",
      desc: "Dark · Amber · Brand",
      bg: "#0a0900",
      bars: ["#d4a843", "#e8c46a", "#22c55e"],
      dots: ["#d4a843", "#ef4444", "#f59e0b"],
    },
    {
      id: "mono",
      label: "Mono",
      desc: "Black · White · Minimal",
      bg: "#080808",
      bars: ["#d4d4d4", "#e8e8e8", "#4ade80"],
      dots: ["#d4d4d4", "#f87171", "#fbbf24"],
    },
    {
      id: "light",
      label: "Light",
      desc: "Hell · Clean · Teal",
      bg: "#f0efe8",
      bars: ["#0e7c75", "#1a9990", "#16a34a"],
      dots: ["#0e7c75", "#dc2626", "#d97706"],
    },
    {
      id: "ivory",
      label: "Ivory",
      desc: "Hell · Warm · Gold",
      bg: "#f9f5eb",
      bars: ["#946914", "#b8821c", "#15803d"],
      dots: ["#946914", "#c81e1e", "#b45309"],
    },
  ];
  const fontCards = [
    {
      id: "default",
      label: "Standard",
      desc: "Space Grotesk · Modern",
      sample: "Aa",
    },
    {
      id: "inter",
      label: "Inter",
      desc: "Inter · Klar & Lesbar",
      sample: "Aa",
    },
    {
      id: "outfit",
      label: "Outfit",
      desc: "Outfit · Geometrisch",
      sample: "Aa",
    },
    { id: "syne", label: "Syne", desc: "Syne · Futuristisch", sample: "Aa" },
    {
      id: "barlow",
      label: "Barlow",
      desc: "Barlow Condensed · Kräftig",
      sample: "AA",
    },
    { id: "mono", label: "Mono", desc: "DM Mono · Terminal", sample: "Aa" },
  ];

  const wrap = _e("div", "settings-wrap");

  // ── HEADER ──
  const hdr = _e("div", "settings-header");
  const hdrT = _e("div", "ph-title");
  hdrT.textContent = "Einstellungen";
  hdr.appendChild(hdrT);
  const hdrS = _e("div", "ph-sub");
  hdrS.textContent = "Personalisierung · Sicherheit · Datenverwaltung";
  hdr.appendChild(hdrS);
  wrap.appendChild(hdr);

  // ── THEME CARD ──
  const themeCard = _card("settings-card--full");
  themeCard.appendChild(
    _cardTitle(
      [
        { tag: "circle", attrs: { cx: "12", cy: "12", r: "5" } },
        {
          tag: "path",
          attrs: {
            d: "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42",
          },
        },
      ],
      "Farbschema",
    ),
  );
  const themeGrid = _e("div", "theme-options");
  themeCards.forEach((t) => {
    const opt = _e(
      "div",
      "theme-option" + (CFG.theme === t.id ? " active" : ""),
    );
    opt.addEventListener("click", () => setTheme(t.id));
    opt.style.setProperty("--t-accent", t.bars[0]);

    // Mini-UI preview swatch
    const swatch = _e("div", "theme-swatch");
    swatch.style.background = t.bg;

    // Sidebar strip with nav dots
    const sideStrip = _e("div", "theme-swatch-sidebar");
    t.dots.forEach((c, i) => {
      const d = _e("div", "theme-swatch-dot");
      d.style.background = c;
      d.style.opacity = i === 0 ? "1" : "0.28";
      sideStrip.appendChild(d);
    });
    swatch.appendChild(sideStrip);

    // Chart bars with staggered heights
    const contentArea = _e("div", "theme-swatch-content");
    const barPx = [38, 64, 46, 78, 32, 56];
    t.bars.forEach((c, i) => {
      const b = _e("div", "theme-swatch-bar");
      b.style.background = c;
      b.style.height = barPx[i] + "px";
      contentArea.appendChild(b);
    });
    // Extra bars for chart depth (repeat with reduced opacity)
    [t.bars[0], t.bars[1], t.bars[0]].forEach((c, i) => {
      const b = _e("div", "theme-swatch-bar");
      b.style.background = c;
      b.style.height = barPx[i + 3] + "px";
      b.style.opacity = "0.55";
      contentArea.appendChild(b);
    });
    swatch.appendChild(contentArea);

    const meta = _e("div", "theme-option-meta");
    const lbl = _e("div", "theme-option-label");
    lbl.textContent = t.label;
    const dsc = _e("div", "theme-option-desc");
    dsc.textContent = t.desc;
    meta.appendChild(lbl);
    meta.appendChild(dsc);
    opt.appendChild(swatch);
    opt.appendChild(meta);
    themeGrid.appendChild(opt);
  });
  themeCard.appendChild(themeGrid);

  wrap.appendChild(themeCard);

  // ── FONT CARD ── (full-width: alle 6 Schriften in einer Reihe)
  const fontCard = _card("settings-card--full");
  fontCard.appendChild(
    _cardTitle(
      [
        { tag: "polyline", attrs: { points: "4 7 4 4 20 4 20 7" } },
        { tag: "line", attrs: { x1: "9", y1: "20", x2: "15", y2: "20" } },
        { tag: "line", attrs: { x1: "12", y1: "4", x2: "12", y2: "20" } },
      ],
      "Schrift & Größe",
    ),
  );
  // Font size row
  const fsSection = _e("div", "font-size-section");
  const fsHeader = _e("div", "font-size-header");
  const fsLeft = _e("div");
  const fsLbl = _e("div", "settings-row-label");
  fsLbl.textContent = "Schriftgröße";
  fsLeft.appendChild(fsLbl);
  const fsDsc = _e("div", "settings-row-desc");
  fsDsc.textContent = "Globale Textgröße der App";
  fsLeft.appendChild(fsDsc);
  const fsVal = _e("span", "");
  fsVal.id = "fontSizeLabel";
  fsVal.style.cssText =
    "font-family:var(--mono);font-size:.8em;color:var(--blue);font-weight:700;";
  fsVal.textContent = CFG.fontSize + "px";
  fsHeader.appendChild(fsLeft);
  fsHeader.appendChild(fsVal);
  const fsSliderRow = _e("div", "font-size-slider-row");
  const fsA1 = _e("span", "font-size-lbl-sm");
  fsA1.textContent = "A";
  const fsRange = _e("input");
  fsRange.type = "range";
  fsRange.min = "17";
  fsRange.max = "22";
  fsRange.step = "1";
  fsRange.value = CFG.fontSize;
  fsRange.style.cssText = "flex:1;accent-color:var(--blue);cursor:pointer;";
  fsRange.addEventListener("input", function () {
    if (typeof setFontSize === "function") setFontSize(this.value);
  });
  const fsA2 = _e("span", "font-size-lbl-lg");
  fsA2.textContent = "A";
  fsSliderRow.appendChild(fsA1);
  fsSliderRow.appendChild(fsRange);
  fsSliderRow.appendChild(fsA2);
  fsSection.appendChild(fsHeader);
  fsSection.appendChild(fsSliderRow);
  fontCard.appendChild(fsSection);
  // Font options
  const fontGrid = _e("div", "font-options");
  fontCards.forEach((f) => {
    const opt = _e("div", "font-option" + (CFG.font === f.id ? " active" : ""));
    opt.addEventListener("click", () => setFont(f.id));
    const smp = _e("div", "font-sample font-sample-" + f.id);
    smp.textContent = f.sample;
    const info = _e("div");
    const fl = _e("div", "font-option-label");
    fl.textContent = f.label;
    const fd = _e("div", "font-option-desc");
    fd.textContent = f.desc;
    info.appendChild(fl);
    info.appendChild(fd);
    opt.appendChild(smp);
    opt.appendChild(info);
    fontGrid.appendChild(opt);
  });
  fontCard.appendChild(fontGrid);

  // ── VERHALTEN CARD ──
  const behavCard = _card();
  behavCard.appendChild(
    _cardTitle(
      [
        { tag: "line", attrs: { x1: "4", y1: "21", x2: "4", y2: "14" } },
        { tag: "line", attrs: { x1: "4", y1: "10", x2: "4", y2: "3" } },
        { tag: "line", attrs: { x1: "12", y1: "21", x2: "12", y2: "12" } },
        { tag: "line", attrs: { x1: "12", y1: "8", x2: "12", y2: "3" } },
        { tag: "line", attrs: { x1: "20", y1: "21", x2: "20", y2: "16" } },
        { tag: "line", attrs: { x1: "20", y1: "12", x2: "20", y2: "3" } },
        { tag: "line", attrs: { x1: "1", y1: "14", x2: "7", y2: "14" } },
        { tag: "line", attrs: { x1: "9", y1: "8", x2: "15", y2: "8" } },
        { tag: "line", attrs: { x1: "17", y1: "16", x2: "23", y2: "16" } },
      ],
      "Verhalten & Zahltag",
    ),
  );
  behavCard.appendChild(
    _row(
      "Automatisch speichern",
      "Alle Änderungen sofort in localStorage",
      _toggle(CFG.autosave, toggleAutosave),
    ),
  );
  behavCard.appendChild(
    _row(
      "Privacy Auto-Lock",
      "Sperrt die App nach 5 Min. Inaktivität",
      _toggle(CFG.privacyAutoLock, togglePrivacyAutoLock),
    ),
  );
  behavCard.appendChild(
    _row(
      "Kontext-Tooltips",
      "Hilfe-Icons neben Feldern und KPIs",
      _toggle(CFG.tooltips !== false, toggleTooltips),
    ),
  );
  behavCard.appendChild(
    _row(
      "Vertrags-Warnungen",
      "Zähler in der Navigation für Verträge, die in ≤ 60 Tagen enden",
      _toggle(CFG.contractAlerts !== false, toggleContractAlerts),
    ),
  );
  // Zahltag als Row direkt in Verhalten (thematisch passend, vermeidet kurze Einzelcard)
  const ztRight = _e("div");
  ztRight.style.cssText = "display:flex;align-items:center;gap:8px;";
  const ztInp = _e("input", "zahltag-input");
  ztInp.type = "number";
  ztInp.min = "1";
  ztInp.max = "31";
  ztInp.value = CFG.zahltag || S.zahltag || 15;
  ztInp.id = "zahltaggerField";
  ztInp.addEventListener("change", function () {
    if (typeof setZahltag === "function") setZahltag(this.value);
  });
  const ztLbl = _e("span");
  ztLbl.style.cssText = "font-size:.75em;color:var(--text3);";
  ztLbl.textContent = ". des Monats";
  ztRight.appendChild(ztInp);
  ztRight.appendChild(ztLbl);
  behavCard.appendChild(_row("Gehaltseingangstag", "Tag des Monats (1–31)", ztRight));
  // ── VAULTBOX INFO CARD ──
  const promoCard = _e("div", "settings-card settings-promo-card");
  promoCard.innerHTML = `
    <div class="settings-promo-inner">
      <div class="settings-promo-logo">
        <img src="images/CandleScope.webp" alt="CandleScope" style="width:34px;height:34px;object-fit:contain" />
        <div>
          <div class="settings-promo-brand">Vault<span style="color:var(--blue)">Box</span></div>
          <div class="settings-promo-badge">v1.0 · 2026</div>
        </div>
      </div>
      <div class="settings-promo-title">Offline. Privat. Dein Vermögen.</div>
      <div class="settings-promo-body">
        Alle Daten bleiben auf deinem Gerät. Kein Server, keine Cloud, kein Tracking.
        149€ einmalig — kein Abo, keine Überraschungen.
      </div>
      <div class="settings-promo-tags">
        <span>100% Offline</span><span>Kein Abo</span><span>FIFO Engine</span><span>Lizenziert</span>
      </div>
    </div>`;
  // ── DATENSPEICHER CARD ──
  const storCard = _card();
  storCard.appendChild(
    _cardTitle(
      [
        {
          tag: "path",
          attrs: {
            d: "M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z",
          },
        },
      ],
      "Datenspeicher",
    ),
  );

  storCard.appendChild(
    _row(
      "Aktueller Speicherort",
      "Alle App-Daten: Status, Archiv, Safepoints",
      null,
    ),
  );

  const storBody = _e("div");
  storBody.style.cssText =
    "display:flex;flex-direction:column;gap:10px;padding:16px 20px 20px;";

  // Pfad-Anzeige
  const storPathRow = _e("div");
  storPathRow.style.cssText =
    "display:flex;align-items:center;gap:8px;flex-wrap:wrap;";
  const storPathVal = _e("div", "settings-row-desc");
  storPathVal.id = "storagePathDisplay";
  storPathVal.style.cssText =
    "font-family:var(--mono);font-size:.72em;color:var(--text2);word-break:break-all;flex:1;padding:6px 10px;background:var(--panel2);border-radius:6px;border:1px solid var(--border);";
  storPathVal.textContent = "Wird geladen…";
  storPathRow.appendChild(storPathVal);
  storBody.appendChild(storPathRow);

  // Buttons
  const storBtnRow = _e("div");
  storBtnRow.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;";
  const storChooseBtn = _e("button", "btn primary sm");
  storChooseBtn.textContent = "Ordner wählen";
  storChooseBtn.addEventListener("click", async () => {
    if (!window.csf?.storage)
      return showToast("Nur in der Desktop-App verfügbar", "warning");
    storChooseBtn.disabled = true;
    storChooseBtn.textContent = "Wähle…";
    const res = await window.csf.storage.choosePath();
    storChooseBtn.disabled = false;
    storChooseBtn.textContent = "Ordner wählen";
    if (res.canceled) return;
    if (!res.ok)
      return showToast("Fehler: " + (res.error || "Unbekannt"), "error");
    const display = document.getElementById("storagePathDisplay");
    if (display) display.textContent = res.path;
    showToast("Datenpfad gesetzt — Daten wurden kopiert", "success");
  });
  const storOpenBtn = _e("button", "btn sm");
  storOpenBtn.textContent = "Im Explorer öffnen";
  storOpenBtn.addEventListener("click", () => {
    if (window.csf?.storage) window.csf.storage.openFolder();
    else showToast("Nur in der Desktop-App verfügbar", "warning");
  });
  const storResetBtn = _e("button", "btn sm");
  storResetBtn.style.cssText = "color:var(--text3);border-color:var(--border);";
  storResetBtn.textContent = "Auf Standard zurücksetzen";
  storResetBtn.addEventListener("click", async () => {
    if (!window.csf?.storage)
      return showToast("Nur in der Desktop-App verfügbar", "warning");
    const ok = await appConfirm(
      "Datenpfad auf AppData-Standard zurücksetzen?\n\nDeine Daten am bisherigen Ort bleiben erhalten.",
      { title: "Pfad zurücksetzen", confirmLabel: "Zurücksetzen" },
    );
    if (!ok) return;
    const res = await window.csf.storage.resetPath();
    if (!res.ok)
      return showToast("Fehler: " + (res.error || "Unbekannt"), "error");
    const display = document.getElementById("storagePathDisplay");
    if (display) display.textContent = res.path;
    showToast("Datenpfad zurückgesetzt", "success");
  });
  storBtnRow.appendChild(storChooseBtn);
  storBtnRow.appendChild(storOpenBtn);
  storBtnRow.appendChild(storResetBtn);
  storBody.appendChild(storBtnRow);

  const storHint = _e("div", "settings-row-desc");
  storHint.style.cssText = "font-size:.7em;color:var(--text3);line-height:1.5;";
  storHint.textContent =
    "Lege den Ordner z.\u200bB. in OneDrive oder einem Backup-Pfad ab. Beim Neuinstallieren der App wird der Zeiger (\u200bAppData\u200b) beibehalten — deine Daten bleiben am gew\u00e4hlten Ort erhalten.";
  storBody.appendChild(storHint);

  storCard.appendChild(storBody);

  // Pfad asynchron laden
  if (window.csf?.storage) {
    window.csf.storage
      .getPath()
      .then((res) => {
        const display = document.getElementById("storagePathDisplay");
        if (display && res?.path) display.textContent = res.path;
      })
      .catch(() => {});
  } else {
    const display = document.getElementById("storagePathDisplay");
    if (display) display.textContent = "Nicht verfügbar (Browser-Modus)";
  }

  // ── HINTERGRUND CARD ──
  const bgCard = _card();
  bgCard.appendChild(
    _cardTitle(
      [
        {
          tag: "rect",
          attrs: { x: "3", y: "3", width: "18", height: "18", rx: "2" },
        },
        { tag: "circle", attrs: { cx: "8.5", cy: "8.5", r: "1.5" } },
        { tag: "polyline", attrs: { points: "21 15 16 10 5 21" } },
      ],
      "Hintergrund",
    ),
  );

  // ── STIL-PRESETS ──
  const bgStyleSec = _e("div", "bg-style-section");
  const bgStyleLbl = _e("div", "bg-style-section-lbl");
  bgStyleLbl.textContent = "Stil";
  bgStyleSec.appendChild(bgStyleLbl);
  const bgStyleGrid = _e("div", "bg-style-grid");
  const bgPresets = [
    { id: "gradient", label: "Gradient" },
    { id: "grid",     label: "Raster" },
    { id: "noise",    label: "Rauschen" },
    { id: "solid",    label: "Einfarbig" },
  ];
  const activeStyle = CFG.bgImage ? null : (CFG.bgStyle || "gradient");
  bgPresets.forEach((p) => {
    const btn = _e("div", "bg-style-btn" + (activeStyle === p.id ? " active" : ""));
    const prev = _e("div", "bg-style-prev");
    const css = _buildBgCssPreview(p.id);
    Object.assign(prev.style, css);
    const lbl = _e("span", "bg-style-lbl");
    lbl.textContent = p.label;
    btn.appendChild(prev);
    btn.appendChild(lbl);
    btn.addEventListener("click", () => setBgStyle(p.id));
    bgStyleGrid.appendChild(btn);
  });
  bgStyleSec.appendChild(bgStyleGrid);
  bgCard.appendChild(bgStyleSec);

  // ── STÄRKE (Akzent-Intensität) ──
  if (!CFG.bgImage) {
    const strSec = _e("div", "bg-strength-section");
    const strHead = _e("div", "bg-strength-head");
    const strLbl = _e("span", "bg-style-section-lbl");
    strLbl.textContent = "Stärke";
    const strVal = _e("span", "bg-strength-val");
    const _curStr = CFG.bgStrength == null ? 55 : CFG.bgStrength;
    strVal.textContent = _curStr + "%";
    strHead.appendChild(strLbl);
    strHead.appendChild(strVal);

    const strInp = _e("input", "bg-strength-slider");
    strInp.type = "range";
    strInp.min = "0";
    strInp.max = "100";
    strInp.step = "5";
    strInp.value = String(_curStr);
    strInp.addEventListener("input", () => {
      CFG.bgStrength = parseInt(strInp.value, 10);
      strVal.textContent = CFG.bgStrength + "%";
      if (!CFG.bgImage) _applyDefaultBgPattern(document.querySelector(".bg"));
      document.querySelectorAll(".bg-style-grid .bg-style-btn").forEach((btn, i) => {
        const prev = btn.querySelector(".bg-style-prev");
        if (prev && bgPresets[i]) Object.assign(prev.style, _buildBgCssPreview(bgPresets[i].id));
      });
    });
    strInp.addEventListener("change", () => saveSettings());

    strSec.appendChild(strHead);
    strSec.appendChild(strInp);
    bgCard.appendChild(strSec);
  }

  // ── EIGENES BILD ──
  const bgDivider = _e("div", "settings-section-divider");
  bgCard.appendChild(bgDivider);
  const bgRow = _e("div", "bg-preview-row");
  const bgPrev = _e("div", "bg-preview");
  bgPrev.id = "bgPreview";
  if (CFG.bgImage) {
    const img = _e("img");
    img.src = CFG.bgImage;
    img.style.cssText = "width:100%;height:100%;object-fit:cover;border-radius:8px;";
    bgPrev.appendChild(img);
  } else {
    const sp = _e("span");
    sp.textContent = "Kein Bild";
    bgPrev.appendChild(sp);
  }
  const bgActs = _e("div", "bg-actions");
  const bgUpBtn = _e("button", "btn");
  bgUpBtn.textContent = "Eigenes Bild";
  bgUpBtn.addEventListener("click", () =>
    document.getElementById("bgUpload").click(),
  );
  bgActs.appendChild(bgUpBtn);
  if (CFG.bgImage) {
    const bgClrBtn = _e("button", "btn danger sm");
    bgClrBtn.textContent = "Entfernen";
    bgClrBtn.addEventListener("click", clearBg);
    bgActs.appendChild(bgClrBtn);
  }
  const bgFileInp = _e("input");
  bgFileInp.type = "file";
  bgFileInp.id = "bgUpload";
  bgFileInp.accept = "image/*";
  bgFileInp.style.display = "none";
  bgFileInp.addEventListener("change", function () {
    if (typeof uploadBg === "function") uploadBg(this);
  });
  const bgHint = _e("div");
  bgHint.style.cssText = "font-size:.72em;color:var(--text3);";
  bgHint.textContent = "JPG, PNG, WEBP · Überschreibt den Stil";
  bgActs.appendChild(bgFileInp);
  bgActs.appendChild(bgHint);
  bgRow.appendChild(bgPrev);
  bgRow.appendChild(bgActs);
  bgCard.appendChild(bgRow);

  // Fit-Buttons nur bei eigenem Bild sichtbar
  if (CFG.bgImage) {
    const bgFitSec = _e("div", "bg-fit-section");
    const bgFitLbl = _e("div", "bg-fit-section-lbl");
    bgFitLbl.textContent = "Anpassung";
    const bgFitOpts = _e("div", "bg-fit-options");
    const fitOpts = [
      { id: "cover", label: "Ausfüllen" },
      { id: "contain", label: "Anpassen" },
      { id: "stretch", label: "Strecken" },
      { id: "tile", label: "Kacheln" },
      { id: "center", label: "Zentriert" },
    ];
    const activeFit = CFG.bgFit || "cover";
    fitOpts.forEach((o) => {
      const btn = _e("button", "bg-fit-btn" + (activeFit === o.id ? " active" : ""));
      const lbl = _e("span");
      lbl.textContent = o.label;
      btn.appendChild(lbl);
      btn.addEventListener("click", () => {
        if (typeof setBgFit === "function") setBgFit(o.id);
      });
      bgFitOpts.appendChild(btn);
    });
    bgFitSec.appendChild(bgFitLbl);
    bgFitSec.appendChild(bgFitOpts);
    bgCard.appendChild(bgFitSec);
  }

  // ── PASSWORT CARD ──
  const pwCard = _card("settings-card--full");
  pwCard.appendChild(
    _cardTitle(
      [
        {
          tag: "rect",
          attrs: { x: "3", y: "11", width: "18", height: "11", rx: "2" },
        },
        { tag: "path", attrs: { d: "M7 11V7a5 5 0 0110 0v4" } },
      ],
      "Passwortschutz",
    ),
  );
  const pwBody = _e("div", "pw-section-body");
  if (hasPw) {
    const activeRow = _row("", "App wird beim Start gesperrt", null);
    const lbl2 = activeRow.querySelector(".settings-row-label");
    if (lbl2) {
      lbl2.style.color = "var(--green)";
      lbl2.textContent = "\u2713 Passwort aktiv";
    }
    const rmBtn = _e("button", "btn danger sm");
    rmBtn.textContent = "Passwort entfernen";
    rmBtn.addEventListener("click", removePassword);
    activeRow.appendChild(rmBtn);
    pwBody.appendChild(activeRow);
    const chgLbl = _e("div", "settings-row-label");
    chgLbl.style.cssText = "margin:14px 0 8px;";
    chgLbl.textContent = "Passwort ändern";
    const form = _e("div", "pw-change-form");
    form.appendChild(_pwInput("pwOld", "Aktuelles Passwort"));
    form.appendChild(_pwInput("pwNew", "Neues Passwort"));
    form.appendChild(_pwInput("pwNew2", "Wiederholen"));
    const chgBtn = _e("button", "btn primary");
    chgBtn.textContent = "Ändern";
    chgBtn.addEventListener("click", changePassword);
    form.appendChild(chgBtn);
    pwBody.appendChild(chgLbl);
    pwBody.appendChild(form);
  } else {
    const desc = _e("div", "settings-row-desc");
    desc.style.marginBottom = "12px";
    desc.textContent = "Schütze deine Finanzdaten mit einem Passwort.";
    const form = _e("div", "pw-change-form");
    form.appendChild(_pwInput("pwNew", "Neues Passwort"));
    form.appendChild(_pwInput("pwNew2", "Wiederholen"));
    const enBtn = _e("button", "btn primary");
    enBtn.textContent = "Passwort aktivieren";
    enBtn.addEventListener("click", enablePassword);
    form.appendChild(enBtn);
    const hint = _e("div");
    hint.style.cssText = "font-size:.7em;color:var(--text3);margin-top:8px;";
    hint.textContent =
      "Mind. 8 Zeichen \u00b7 Gro\u00df/Klein \u00b7 Zahl \u00b7 Sonderzeichen";
    pwBody.appendChild(desc);
    pwBody.appendChild(form);
    pwBody.appendChild(hint);
  }
  const pwErr = _e("div", "settings-err");
  pwErr.id = "pwErr";
  pwBody.appendChild(pwErr);
  pwCard.appendChild(pwBody);

  // ── KATEGORIEN CARD ──
  const catCard = _card("settings-card--full");
  catCard.appendChild(
    _cardTitle(
      [
        {
          tag: "path",
          attrs: {
            d: "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z",
          },
        },
        { tag: "line", attrs: { x1: "7", y1: "7", x2: "7.01", y2: "7" } },
      ],
      "Kategorien",
    ),
  );

  const catDesc = _e("div", "settings-row-desc");
  catDesc.style.padding = "0 20px 12px";
  catDesc.textContent =
    "Kategorien helfen dir, Ausgaben und Einnahmen zu gruppieren. Weist du einem Posten eine Kategorie zu, erscheint sie in Transaktionen, Verträgen und im Dashboard.";
  catCard.appendChild(catDesc);

  // "+ Neue Kategorie" Button + Formular (beide oben, vor der Liste)
  const newCatBtn = _e("button", "btn sm cat-new-btn");
  newCatBtn.textContent = "+ Neue Kategorie";
  newCatBtn.addEventListener("click", () => _openCatEdit(null));
  const newCatWrap = _e("div", "cat-add-btn-wrap");
  newCatWrap.appendChild(newCatBtn);
  catCard.appendChild(newCatWrap);

  const catAddRow = _e("div", "cat-add-row");
  catAddRow.id = "catAddRow";
  catCard.appendChild(catAddRow);

  const catListWrap = _e("div", "cat-settings-list");
  catListWrap.id = "catSettingsList";
  catCard.appendChild(catListWrap);

  // Kategorienliste aufbauen
  function _rebuildCatList() {
    const list = document.getElementById("catSettingsList");
    if (!list) return;
    while (list.firstChild) list.removeChild(list.firstChild);

    const cats =
      Array.isArray(S.categories) && S.categories.length
        ? S.categories
        : typeof DEFAULT_CATEGORIES !== "undefined"
          ? DEFAULT_CATEGORIES
          : [];

    cats.forEach((cat, idx) => {
      const row = _e("div", "cat-settings-row");

      const swatch = _e("span", "cat-swatch");
      swatch.style.background = cat.color;
      row.appendChild(swatch);

      const icon = _e("span", "cat-settings-icon");
      icon.style.color = cat.color || "";
      icon.innerHTML = uiIcon(cat.icon, 18);
      row.appendChild(icon);

      const name = _e("span", "cat-settings-name");
      name.textContent = cat.name;
      row.appendChild(name);

      const actions = _e("div", "cat-settings-actions");

      const editBtn = _e("button", "btn sm");
      editBtn.textContent = "✎";
      editBtn.addEventListener("mouseenter", () => _showTooltip("Bearbeiten", editBtn));
      editBtn.addEventListener("mouseleave", _hideTooltip);
      editBtn.addEventListener("click", () => _openCatEdit(idx));
      actions.appendChild(editBtn);

      const delBtn = _e("button", "btn sm");
      delBtn.textContent = "✕";
      delBtn.addEventListener("mouseenter", () => _showTooltip("Löschen", delBtn));
      delBtn.addEventListener("mouseleave", _hideTooltip);
      delBtn.style.color = "var(--red)";
      delBtn.style.borderColor = "var(--red-a35,rgba(255,77,106,.35))";
      delBtn.addEventListener("click", () => {
        appConfirm(`Kategorie "${cat.name}" löschen?`, {
          icon: "🗑️",
          title: "Löschen",
          confirmLabel: "Löschen",
          confirmClass: "danger",
        }).then((ok) => {
          if (!ok) return;
          S.categories.splice(idx, 1);
          persist();
          _rebuildCatList();
          if (typeof showToast === "function")
            showToast("Kategorie gelöscht", "info", 2000);
        });
      });
      actions.appendChild(delBtn);

      row.appendChild(actions);
      list.appendChild(row);
    });

    // Kein-Kategorien Hinweis
    if (cats.length === 0) {
      const empty = _e("div", "cat-empty");
      empty.textContent = "Keine Kategorien vorhanden";
      list.appendChild(empty);
    }

    // Reset-auf-Standard Button
    const resetRow = _e("div", "cat-reset-row");
    const resetBtn2 = _e("button", "btn sm");
    resetBtn2.textContent = "Standard-Kategorien wiederherstellen";
    resetBtn2.addEventListener("click", () => {
      appConfirm(
        "Alle Kategorien auf Standard zurücksetzen? Deine eigenen Kategorien gehen verloren.",
        { icon: "🔄", title: "Zurücksetzen", confirmLabel: "Zurücksetzen" },
      ).then((ok) => {
        if (!ok) return;
        S.categories =
          typeof DEFAULT_CATEGORIES !== "undefined"
            ? [...DEFAULT_CATEGORIES.map((c) => ({ ...c }))]
            : [];
        persist();
        _rebuildCatList();
        if (typeof showToast === "function")
          showToast("Kategorien zurückgesetzt", "info", 2000);
      });
    });
    resetRow.appendChild(resetBtn2);
    list.appendChild(resetRow);
  }

  function _openCatEdit(idx) {
    const addRow = document.getElementById("catAddRow");
    if (!addRow) return;
    while (addRow.firstChild) addRow.removeChild(addRow.firstChild);
    addRow.style.display = "";

    const cat =
      idx !== null
        ? S.categories[idx]
        : { id: genId("cat"), name: "", color: "#4d9eff", icon: "tag" };
    const isNew = idx === null;

    const form = _e("div", "cat-edit-form");

    // Icon-Picker
    const _ICON_GROUPS = [
      { label: "Finanzen", icons: ["wallet","coins","credit-card","landmark","trending-up","bar-chart-2","receipt","briefcase"] },
      { label: "Wohnen", icons: ["home","lightbulb","droplet","flame","zap","key"] },
      { label: "Transport", icons: ["car","bus","train","plane","fuel"] },
      { label: "Essen", icons: ["shopping-cart","coffee","utensils"] },
      { label: "Gesundheit", icons: ["pill","heart","dumbbell"] },
      { label: "Tech & Abos", icons: ["smartphone","monitor","tv","music","gamepad","cloud","wifi"] },
      { label: "Freizeit", icons: ["target","book","graduation-cap","star","gift","globe","leaf"] },
      { label: "Sonstiges", icons: ["shield","umbrella","bell","settings","folder","package","tag","file-text","mail","id-card","image","scissors","baby"] },
    ];

    let _pickerCurrentIcon = cat.icon || "tag";

    const iconWrap = _e("div", "cat-edit-field");
    const iconLbl = _e("label");
    iconLbl.textContent = "Icon";

    const pickerWrap = _e("div", "emoji-picker-wrap");

    const triggerBtn = _e("button", "emoji-trigger-btn");
    triggerBtn.type = "button";
    triggerBtn.style.color = cat.color || "";
    triggerBtn.innerHTML = uiIcon(_pickerCurrentIcon, 20);
    triggerBtn.addEventListener("mouseenter", () => _showTooltip("Icon auswählen", triggerBtn));
    triggerBtn.addEventListener("mouseleave", _hideTooltip);

    const pickerDropdown = _e("div", "emoji-picker-dropdown");
    pickerDropdown.style.display = "none";

    // Suchfeld
    const searchInp = _e("input", "emoji-search");
    searchInp.type = "text";
    searchInp.placeholder = "Suchen…";
    pickerDropdown.appendChild(searchInp);

    // Emoji-Grid Container
    const gridWrap = _e("div", "emoji-grid-wrap");

    // Keyword-Map für Suche (Deutsch), je Icon-Name
    const _ICON_KEYWORDS = {
      wallet:"geld geldbörse wallet", coins:"münzen geld coins", "credit-card":"karte kreditkarte zahlen",
      landmark:"bank sparkasse", "trending-up":"aktie depot gewinn invest", "bar-chart-2":"statistik chart",
      receipt:"rechnung beleg kassenbon", briefcase:"gehalt arbeit job business",
      home:"haus wohnen miete zuhause", lightbulb:"strom licht idee", droplet:"wasser",
      flame:"heizung gas feuer wärme", zap:"strom energie blitz", key:"schlüssel miete zugang",
      car:"auto kfz fahren", bus:"bus nahverkehr öpnv", train:"zug bahn", plane:"flug reise urlaub flugzeug", fuel:"tanken sprit benzin",
      "shopping-cart":"einkaufen lebensmittel supermarkt", coffee:"kaffee café", utensils:"essen restaurant besteck",
      pill:"medizin apotheke gesundheit", heart:"gesundheit herz", dumbbell:"fitness sport gym hantel",
      smartphone:"handy smartphone abo telefon", monitor:"pc computer bildschirm", tv:"tv fernsehen",
      music:"musik spotify streaming", gamepad:"gaming spiele konsole", cloud:"cloud internet speicher", wifi:"internet wlan netz",
      target:"ziel hobby freizeit", book:"buch bildung lesen", "graduation-cap":"schule studium bildung abschluss",
      star:"favorit stern wichtig", gift:"geschenk", globe:"welt reise internet", leaf:"natur pflanze öko",
      shield:"versicherung schutz sicherheit", umbrella:"versicherung schutz regen", bell:"benachrichtigung erinnerung",
      settings:"einstellung technik zahnrad", folder:"ordner ablage", package:"paket sonstiges box",
      tag:"label etikett sonstiges", "file-text":"dokument vertrag datei", mail:"post brief email eingang",
      "id-card":"ausweis legitimation karte", image:"foto bild scan", scissors:"friseur schere", baby:"kind familie baby",
    };

    const _ALL_ICONS = _ICON_GROUPS.flatMap(g => g.icons);

    function _iconPickBtn(name) {
      const btn = _e("button", "emoji-btn" + (name === _pickerCurrentIcon ? " selected" : ""));
      btn.type = "button";
      btn.innerHTML = uiIcon(name, 20);
      btn.addEventListener("click", () => {
        _pickerCurrentIcon = name;
        triggerBtn.innerHTML = uiIcon(name, 20);
        gridWrap.querySelectorAll(".emoji-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        _closePicker();
      });
      return btn;
    }

    function _renderIconGrid(query) {
      while (gridWrap.firstChild) gridWrap.removeChild(gridWrap.firstChild);
      const q = (query || "").toLowerCase().trim();

      if (q) {
        const filtered = _ALL_ICONS.filter(name => {
          const kw = _ICON_KEYWORDS[name] || "";
          return kw.includes(q) || name.includes(q);
        });
        const pool = filtered.length > 0 ? filtered : _ALL_ICONS;
        const section = _e("div", "emoji-group");
        pool.forEach(name => section.appendChild(_iconPickBtn(name)));
        gridWrap.appendChild(section);
        return;
      }

      _ICON_GROUPS.forEach(group => {
        const groupLabel = _e("div", "emoji-group-label");
        groupLabel.textContent = group.label;
        gridWrap.appendChild(groupLabel);
        const section = _e("div", "emoji-group");
        group.icons.forEach(name => section.appendChild(_iconPickBtn(name)));
        gridWrap.appendChild(section);
      });
    }

    searchInp.addEventListener("input", () => _renderIconGrid(searchInp.value));
    pickerDropdown.appendChild(gridWrap);
    _renderIconGrid("");

    function _closePicker() {
      pickerDropdown.style.display = "none";
      document.removeEventListener("click", _outsideClick, true);
    }
    function _outsideClick(e) {
      if (!pickerWrap.contains(e.target)) _closePicker();
    }

    triggerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = pickerDropdown.style.display !== "none";
      if (isOpen) { _closePicker(); return; }
      pickerDropdown.style.display = "flex";
      searchInp.value = "";
      _renderIconGrid("");
      setTimeout(() => searchInp.focus(), 50);
      setTimeout(() => document.addEventListener("click", _outsideClick, true), 10);
    });

    // iconInp als verstecktes Feld für den save-Handler (Wert kommt aus _pickerCurrentIcon)
    const iconInp = { get value() { return _pickerCurrentIcon; }, trim() { return _pickerCurrentIcon; } };

    pickerWrap.appendChild(triggerBtn);
    pickerWrap.appendChild(pickerDropdown);
    iconWrap.appendChild(iconLbl);
    iconWrap.appendChild(pickerWrap);
    form.appendChild(iconWrap);

    // Name input
    const nameWrap = _e("div", "cat-edit-field");
    const nameLbl = _e("label");
    nameLbl.textContent = "Name";
    const nameInp = _e("input", "settings-input");
    nameInp.type = "text";
    nameInp.value = cat.name;
    nameInp.placeholder = "z.B. Wohnen…";
    nameInp.style.flex = "1";
    nameWrap.appendChild(nameLbl);
    nameWrap.appendChild(nameInp);
    form.appendChild(nameWrap);

    // Color input
    const colorWrap = _e("div", "cat-edit-field");
    const colorLbl = _e("label");
    colorLbl.textContent = "Farbe";
    const colorInp = _e("input", "cat-edit-color-inp");
    colorInp.type = "color";
    colorInp.value = cat.color || "#4d9eff";
    colorWrap.appendChild(colorLbl);
    colorWrap.appendChild(colorInp);
    form.appendChild(colorWrap);

    // Buttons
    const btnRow = _e("div", "cat-edit-btns");
    const saveBtn = _e("button", "btn primary sm");
    saveBtn.textContent = isNew ? "Hinzufügen" : "Speichern";
    saveBtn.addEventListener("click", () => {
      const n = nameInp.value.trim();
      if (!n) {
        nameInp.focus();
        return;
      }
      const updated = {
        id: cat.id,
        name: n,
        color: colorInp.value,
        icon: iconInp.value.trim() || "tag",
      };
      if (!Array.isArray(S.categories)) S.categories = [];
      if (isNew) S.categories.push(updated);
      else S.categories[idx] = updated;
      persist();
      _rebuildCatList();
      while (addRow.firstChild) addRow.removeChild(addRow.firstChild);
      addRow.style.display = "none";
      if (typeof showToast === "function")
        showToast(
          isNew ? "Kategorie erstellt" : "Kategorie gespeichert",
          "success",
          2000,
        );
    });
    const cancelBtn = _e("button", "btn sm");
    cancelBtn.textContent = "Abbrechen";
    cancelBtn.addEventListener("click", () => {
      while (addRow.firstChild) addRow.removeChild(addRow.firstChild);
      addRow.style.display = "none";
    });
    btnRow.appendChild(saveBtn);
    btnRow.appendChild(cancelBtn);
    form.appendChild(btnRow);
    addRow.appendChild(form);
  }

  // ── DATEN CARD ──
  const dataCard = _card("settings-card--full");
  dataCard.appendChild(
    _cardTitle(
      [
        { tag: "ellipse", attrs: { cx: "12", cy: "5", rx: "9", ry: "3" } },
        { tag: "path", attrs: { d: "M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" } },
        { tag: "path", attrs: { d: "M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" } },
      ],
      "Datenverwaltung & Backups",
    ),
  );
  const ioWrap = _e("div");
  ioWrap.id = "ioPanel";
  dataCard.appendChild(ioWrap);
  const dangerSec = _e("div", "danger-zone-section");
  const dangerLbl = _e("div", "danger-zone-label");
  dangerLbl.textContent = "Gefahrenzone";
  const dangerActs = _e("div", "danger-actions");
  const clearBtn = _e("button", "btn");
  clearBtn.style.cssText = "border-color:var(--red);color:var(--red);";
  clearBtn.textContent = "Alle Daten l\u00f6schen";
  clearBtn.addEventListener("click", confirmClearAllData);
  const resetBtn = _e("button", "btn danger");
  resetBtn.textContent = "App komplett zur\u00fccksetzen";
  resetBtn.addEventListener("click", confirmResetAll);
  const dangerNote = _e("div", "danger-note");
  dangerNote.textContent =
    "Komplett-Reset l\u00f6scht alle Daten, Einstellungen und Passwortschutz. Die App startet wie beim ersten Mal.";
  dangerActs.appendChild(clearBtn);
  dangerActs.appendChild(resetBtn);
  dangerActs.appendChild(dangerNote);
  dangerSec.appendChild(dangerLbl);
  dangerSec.appendChild(dangerActs);
  dataCard.appendChild(dangerSec);
  // ── KARTEN-REIHENFOLGE (Grid-Layout) ──
  // Zeile 1: Farbschema (full)
  // Zeile 2: Schrift & Größe (full — alle 6 Fonts nebeneinander)
  // Zeile 3: Hintergrund (links) | Verhalten+Zahltag (rechts) — ähnl. Höhe ~250px
  // Zeile 4: Datenspeicher (links) | Promo (rechts) — ähnl. Höhe ~280px
  // Zeile 5–: Passwort, Kategorien, Gefahrenzone (jeweils full)
  wrap.appendChild(fontCard);
  wrap.appendChild(bgCard);
  wrap.appendChild(behavCard);
  wrap.appendChild(storCard);
  wrap.appendChild(promoCard);
  wrap.appendChild(pwCard);
  wrap.appendChild(catCard);
  wrap.appendChild(dataCard);

  // ── LIZENZ-INFO ──
  if (window.csf?.license) {
    window.csf.license.info().then((info) => {
      if (!info) return;
      const licCard = _e("div", "settings-card");
      licCard.style.cssText = "border-color:var(--blue-a25);";
      const licTitle = _e("div", "settings-card-title");
      licTitle.textContent = "🔐 Lizenz";
      const licKey = _e("div");
      licKey.style.cssText = "font-family:var(--mono);font-size:.75em;color:var(--text2);margin-top:6px;";
      licKey.textContent = info.licenseKey.slice(0, 8) + "-••••-••••-••••-••••••••••••";
      const licDate = _e("div");
      licDate.style.cssText = "font-size:.72em;color:var(--text3);margin-top:4px;";
      licDate.textContent = "Aktiviert: " + new Date(info.activatedAt).toLocaleDateString("de-DE");
      licCard.appendChild(licTitle);
      licCard.appendChild(licKey);
      licCard.appendChild(licDate);
      if (footer) wrap.insertBefore(licCard, footer);
    });
  }

  // ── FOOTER ──
  const footer = _e("div", "settings-footer");
  footer.textContent =
    "VaultBox v1.0 \u00b7 Alle Daten lokal \u00b7 Kein Internet \u00b7 Safepoints aktiv";
  wrap.appendChild(footer);

  el.appendChild(wrap);

  document.getElementById("catAddRow").style.display = "none";
  _rebuildCatList();
  if (typeof renderIoPanel === "function") renderIoPanel();
}

// ══════════════════════════════════════
//  USER CHIP — Quick Settings Panel
// ══════════════════════════════════════

const _UC_THEMES = [
  { id: "candlescope", label: "Gold",  bg: "#0a0900", accent: "#d4a843" },
  { id: "mono",        label: "Mono",  bg: "#080808", accent: "#d4d4d4" },
  { id: "light",       label: "Light", bg: "#f0efe8", accent: "#0e7c75" },
  { id: "ivory",       label: "Ivory", bg: "#f9f5eb", accent: "#946914" },
];

let _ucOpen = false;

function _ucToggle() {
  _ucOpen ? _ucClose() : _ucPanelOpen();
}

function _ucPanelOpen() {
  const panel = document.getElementById("ucPanel");
  if (!panel) return;
  if (typeof _ringClose === "function") _ringClose();
  _ucRefresh();
  _ucBuildThemeGrid();
  _ucSyncSlider();
  panel.style.display = "block";
  panel.setAttribute("data-visible", "true");
  _ucOpen = true;
  const chip = document.getElementById("ucChip");
  if (chip) chip.classList.add("uc-open");
  setTimeout(() => document.addEventListener("click", _ucOutsideClick), 0);
}

function _ucClose() {
  const panel = document.getElementById("ucPanel");
  if (panel) panel.style.display = "none";
  _ucOpen = false;
  const chip = document.getElementById("ucChip");
  if (chip) chip.classList.remove("uc-open");
  document.removeEventListener("click", _ucOutsideClick);
}

function _ucOutsideClick(e) {
  const panel = document.getElementById("ucPanel");
  const chip = document.getElementById("ucChip");
  if (panel && !panel.contains(e.target) && chip && !chip.contains(e.target)) {
    _ucClose();
  }
}

function _ucRefresh() {
  const name    = (CFG.userName || "").trim();
  const display = name || "Benutzer";
  const first   = display.split(" ")[0];
  const initials = display.split(" ").map(w => w[0] || "").join("").toUpperCase().slice(0, 2) || "CS";

  const chipName = document.getElementById("ucChipName");
  if (chipName) chipName.textContent = first;

  const nameInput = document.getElementById("ucNameInput");
  if (nameInput && document.activeElement !== nameInput) nameInput.value = CFG.userName || "";

  [document.getElementById("ucAvatarSm"), document.getElementById("ucAvatarLg")].forEach(el => {
    if (!el) return;
    el.replaceChildren();
    if (CFG.userAvatar) {
      const img = document.createElement("img");
      img.src = CFG.userAvatar;
      img.alt = "";
      el.appendChild(img);
    } else {
      el.textContent = initials;
    }
  });
}

function _ucSaveName(val) {
  CFG.userName = val;
  saveSettings();
  const chipName = document.getElementById("ucChipName");
  const trimmed = val.trim();
  if (chipName) chipName.textContent = trimmed.split(" ")[0] || "Benutzer";
  const initials = trimmed.split(" ").map(w => w[0] || "").join("").toUpperCase().slice(0, 2) || "CS";
  [document.getElementById("ucAvatarSm"), document.getElementById("ucAvatarLg")].forEach(el => {
    if (!el || CFG.userAvatar) return;
    el.textContent = initials;
  });
}

function _ucPickAvatar(input) {
  const file = input.files[0];
  if (!file) return;
  const r = new FileReader();
  r.onload = e => {
    CFG.userAvatar = e.target.result;
    saveSettings();
    _ucRefresh();
  };
  r.readAsDataURL(file);
}

function _ucBuildThemeGrid() {
  const grid = document.getElementById("ucThemeGrid");
  if (!grid) return;
  grid.replaceChildren();
  _UC_THEMES.forEach(t => {
    const dot = document.createElement("div");
    dot.className = "uc-theme-dot" + (CFG.theme === t.id ? " active" : "");
    dot.onclick = () => {
      setTheme(t.id);
      _ucBuildThemeGrid();
      _ucSyncSlider();
    };

    const swatch = document.createElement("div");
    swatch.className = "uc-theme-swatch";
    swatch.style.background = t.bg;

    const bar = document.createElement("div");
    bar.className = "uc-theme-accent-bar";
    bar.style.background = t.accent;
    swatch.appendChild(bar);

    const name = document.createElement("div");
    name.className = "uc-theme-name";
    name.textContent = t.label;

    dot.appendChild(swatch);
    dot.appendChild(name);
    grid.appendChild(dot);
  });
}

function _ucSyncSlider() {
  const slider = document.getElementById("ucBlurSlider");
  const label  = document.getElementById("ucBlurPx");
  const px     = CFG.panelBlur ?? 20;
  const fill   = Math.round((px / 200) * 100);
  if (slider) {
    slider.value = px;
    slider.style.setProperty("--uc-fill", fill + "%");
  }
  if (label) label.textContent = px + "px";
}

function _ucSetBlur(val) {
  const px = parseInt(val);
  CFG.panelBlur = px;
  _ucApplyBlur();
  const label = document.getElementById("ucBlurPx");
  if (label) label.textContent = px + "px";
  const slider = document.getElementById("ucBlurSlider");
  if (slider) slider.style.setProperty("--uc-fill", Math.round((px / 200) * 100) + "%");
}

function _ucSaveBlur() {
  saveSettings();
}

function _ucApplyBlur() {
  const px   = CFG.panelBlur ?? 20;
  const root = document.documentElement;

  root.style.setProperty("--user-blur-px", px + "px");

  // Blur und Deckkraft gekoppelt: mehr Blur → transparenteres --glass-tint → Panels durchsichtiger
  const t        = px / 200;
  const isLight  = ["light", "ivory"].includes(CFG.theme);
  const bg       = CFG.theme === "ivory" ? "242, 237, 222"
                 : CFG.theme === "light"  ? "235, 234, 226"
                 : CFG.theme === "mono"   ? "20, 20, 20"
                 : CFG.theme === "dark"   ? "10, 14, 22"
                 : CFG.theme === "crimson"? "20, 10, 10"
                 : "18, 16, 12";
  const maxA = isLight ? 0.88 : 0.82;
  const minA = isLight ? 0.28 : 0.18;
  const a    = (maxA - t * (maxA - minA)).toFixed(2);
  const aStr = `rgba(${bg}, ${a})`;
  const aStrong = `rgba(${bg}, ${Math.min(+a + 0.12, 0.97).toFixed(2)})`;

  root.style.setProperty("--glass-tint",        aStr);
  root.style.setProperty("--glass-tint-strong",  aStrong);
}
