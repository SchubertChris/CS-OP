// ══════════════════════════════════════
//  UTILS — Formatierung · Hilfsfunktionen
// ══════════════════════════════════════

/** Zahl → "1.234,56 €" */
function fm(v, sign = false) {
  if (v === null || v === undefined || isNaN(v)) return "—";
  const s =
    v.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " €";
  return sign && v > 0 ? "+" + s : s;
}

/** Kurze Zahl → "1,2 K" */
function fmShort(v) {
  if (!v && v !== 0) return "—";
  if (Math.abs(v) >= 1000)
    return (
      (v / 1000).toLocaleString("de-DE", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }) + " K"
    );
  return v.toLocaleString("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/** String mit Komma/Punkt → float */
function pp(v) {
  if (!v && v !== 0) return 0;
  const s = String(v).trim();
  if (s.includes(","))
    return parseFloat(s.replace(/\./g, "").replace(",", ".")) || 0;
  return parseFloat(s.replace(/[^\d.-]/g, "")) || 0;
}

/** HTML escapen */
function esc(v) {
  return String(v || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── GLOBALES ICON-SYSTEM (Stroke-SVG, Lucide-Stil) ──
// Werte = innere SVG-Markup (paths/circles/rects), viewBox 0 0 24 24, stroke=currentColor.
const CS_ICON_PATHS = {
  // Finanz-Kategorien
  home:           '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/>',
  car:            '<path d="M5 13l1.4-4.2A2 2 0 0 1 8.3 7.5h7.4a2 2 0 0 1 1.9 1.3L19 13"/><path d="M4 13h16v4H4z"/><circle cx="7.5" cy="17" r="1.4"/><circle cx="16.5" cy="17" r="1.4"/>',
  "shopping-cart":'<circle cx="9" cy="20" r="1.3"/><circle cx="17" cy="20" r="1.3"/><path d="M2 3h2.2l2.3 12.5h11l2-8.5H6.2"/>',
  pill:           '<path d="M3 12h3.5l2-5 3.5 10 2-5H21"/>',
  shield:         '<path d="M12 3 4 6v6c0 4 3.4 7 8 9 4.6-2 8-5 8-9V6z"/>',
  smartphone:     '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>',
  "trending-up":  '<path d="M3 17l6-6 4 4 7-7"/><path d="M17 8h4v4"/>',
  target:         '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  book:           '<path d="M6 4h11a1 1 0 0 1 1 1v15H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M8 4v16"/>',
  briefcase:      '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 12h18"/>',
  package:        '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8"/>',
  // Archiv-Kategorien
  "file-text":    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h6"/>',
  "credit-card":  '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  receipt:        '<path d="M5 3v18l2-1 2 1 2-1 2 1 2-1 2 1V3l-2 1-2-1-2 1-2-1-2 1z"/><path d="M8 8h8M8 12h6"/>',
  mail:           '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  image:          '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.6"/><path d="m21 16-5-5L5 21"/>',
  folder:         '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  "id-card":      '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M5.5 16c.6-1.5 1.9-2.2 3.5-2.2s2.9.7 3.5 2.2"/><path d="M15 10h4M15 13.5h4"/>',
  // Erweiterte Auswahl (Picker)
  wallet:         '<path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2"/><path d="M3 7v10a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-3"/><path d="M21 11h-5a2 2 0 0 0 0 4h5z"/>',
  coins:          '<circle cx="9" cy="9" r="6"/><path d="M16.5 7.5a6 6 0 1 1-5 10.5"/>',
  landmark:       '<path d="M3 21h18M5 21V10M9.5 21V10M14.5 21V10M19 21V10"/><path d="M12 3 3 8h18z"/>',
  "bar-chart-2":  '<path d="M7 20V10M12 20V4M17 20v-6"/>',
  lightbulb:      '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>',
  droplet:        '<path d="M12 3s6 6 6 10a6 6 0 0 1-12 0c0-4 6-10 6-10z"/>',
  flame:          '<path d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-1.6.6-2.7 1.6-3.6C9 10 9 12 10 12c0-2 2-4 2-9z"/>',
  zap:            '<path d="M13 2 4 14h7l-2 8 9-12h-7z"/>',
  key:            '<circle cx="8" cy="14" r="4"/><path d="m11 11 8-8M16 6l2 2M18.5 3.5l2 2"/>',
  bus:            '<rect x="4" y="5" width="16" height="12" rx="2"/><path d="M4 11h16"/><circle cx="8" cy="19" r="1.4"/><circle cx="16" cy="19" r="1.4"/><path d="M8 5V3h8v2"/>',
  train:          '<rect x="6" y="3" width="12" height="13" rx="2"/><path d="M6 10h12"/><circle cx="9.5" cy="13" r="1"/><circle cx="14.5" cy="13" r="1"/><path d="m7 20 2-2M17 20l-2-2"/>',
  plane:          '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/>',
  fuel:           '<path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16"/><path d="M3 21h12M6 9h6"/><path d="M14 8h2a2 2 0 0 1 2 2v6a1.5 1.5 0 0 0 3 0V9l-3-3"/>',
  coffee:         '<path d="M4 8h13v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M17 9h2a2 2 0 0 1 0 4h-2"/><path d="M7 4v1.5M10 4v1.5M13 4v1.5"/>',
  utensils:       '<path d="M5 3v7a2 2 0 0 0 4 0V3M7 10v11"/><path d="M16 3c-1.5 0-3 1.5-3 4s1 4 3 4v10"/>',
  heart:          '<path d="M12 20s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z"/>',
  dumbbell:       '<path d="M6 7v10M4 9v6M18 7v10M20 9v6M6 12h12"/>',
  monitor:        '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  tv:             '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="m8 3 4 3 4-3"/>',
  music:          '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  gamepad:        '<rect x="2" y="7" width="20" height="10" rx="4"/><path d="M6 12h3M7.5 10.5v3M15 11h.01M18 13h.01"/>',
  cloud:          '<path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1.5A3.5 3.5 0 0 1 18 18z"/>',
  wifi:           '<path d="M5 12a10 10 0 0 1 14 0M8 15.5a5 5 0 0 1 8 0"/><circle cx="12" cy="19" r="1"/>',
  "graduation-cap":'<path d="m12 4 10 5-10 5L2 9z"/><path d="M6 11v5c0 1.3 2.7 3 6 3s6-1.7 6-3v-5"/>',
  star:           '<path d="m12 3 2.6 5.8 6.4.6-4.8 4.3 1.4 6.3-5.6-3.3-5.6 3.3 1.4-6.3-4.8-4.3 6.4-.6z"/>',
  gift:           '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8M12 8v13"/><path d="M12 8S10 3 7.5 4.5 9 8 12 8zM12 8s2-5 4.5-3.5S15 8 12 8z"/>',
  globe:          '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/>',
  leaf:           '<path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 14z"/><path d="M5 19c3-4 6-6 10-7"/>',
  umbrella:       '<path d="M12 3a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9z"/><path d="M12 12v7a2 2 0 0 0 4 0"/>',
  bell:           '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  settings:       '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  scissors:       '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8 8l12 8M8 16 20 8"/>',
  baby:           '<circle cx="12" cy="6" r="2.5"/><path d="M9 11h6M7 14l3-2M17 14l-3-2M9 20l3-3 3 3"/>',
  // UI / Feedback (Toasts, Dialoge)
  check:          '<path d="M5 12l5 5L20 6"/>',
  "check-circle": '<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>',
  "x-circle":     '<circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/>',
  x:              '<path d="M18 6 6 18M6 6l12 12"/>',
  "alert-triangle":'<path d="M12 3 2.5 20h19z"/><path d="M12 10v4M12 17.5h.01"/>',
  info:           '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  "help-circle":  '<circle cx="12" cy="12" r="9"/><path d="M9.2 9.5a2.8 2.8 0 0 1 5.3 1c0 2-2.6 2.4-2.6 2.4M12 17h.01"/>',
  pencil:         '<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  "trash-2":      '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>',
  lock:           '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  unlock:         '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/>',
  save:           '<path d="M5 3h11l3 3v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M7 3v5h8M8 13h8v8H8z"/>',
  "rotate-ccw":   '<path d="M3 12a9 9 0 1 0 2.6-6.3M3 4v4h4"/>',
  // Fallback
  tag:            '<path d="M3 11V5a2 2 0 0 1 2-2h6l9 9-8 8z"/><circle cx="7.5" cy="7.5" r="1.2"/>',
};

/** Icon → SVG-String. size in px. opts: {cls, color, strokeWidth} */
function iconHtml(name, size = 16, opts = {}) {
  const inner = CS_ICON_PATHS[name] || CS_ICON_PATHS.tag;
  const sw = opts.strokeWidth || 2;
  const cls = ` class="cs-ico${opts.cls ? " " + opts.cls : ""}"`;
  const style = opts.color ? ` style="color:${opts.color}"` : "";
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" width="${size}" height="${size}"${cls}${style} aria-hidden="true">${inner}</svg>`;
}

/** Entity-Icon (Kategorie/Ziel/Kreditor): kennt Icon-Namen ODER Legacy-Emoji. */
function uiIcon(iconVal, size = 16, fallback = "tag") {
  if (iconVal && CS_ICON_PATHS[iconVal]) return iconHtml(iconVal, size);
  if (iconVal) return `<span class="ui-emoji" style="font-size:${Math.round(size * 0.92)}px;line-height:1;display:inline-flex;align-items:center;justify-content:center">${esc(iconVal)}</span>`;
  return iconHtml(fallback, size);
}

/** today als Date */
function today() {
  return new Date();
}

/** Heutiges Datum als "YYYY-MM-DD" — timezone-safe (kein UTC-Shift in CET/CEST) */
function todayIso() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

/** Datum als DE-String */
function fmDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("de-DE");
}

/**
 * Ist ein contractEnd/Start-Datum gesetzt und gültig?
 * Schützt gegen "", null, undefined, "Invalid Date"
 */
function _hasDate(d) {
  if (!d || typeof d !== "string" || d.trim() === "") return false;
  const t = new Date(d).getTime();
  return !isNaN(t);
}

/**
 * Ist Posten zum aktuellen Zeitpunkt noch aktiv?
 * Wird von avgMonthly genutzt — prüft ob contractEnd bereits vergangen ist.
 */
function isCurrentlyActive(p) {
  if (_hasDate(p.contractEnd)) {
    const e = new Date(p.contractEnd);
    const now = today();
    // Ende liegt in der Vergangenheit (nach Ende des letzten gültigen Monats)
    const endOfEndMonth = new Date(e.getFullYear(), e.getMonth() + 1, 0); // letzter Tag des End-Monats
    if (now > endOfEndMonth) return false;
  }
  if (_hasDate(p.contractStart)) {
    const s = new Date(p.contractStart);
    const startOfStartMonth = new Date(s.getFullYear(), s.getMonth(), 1);
    if (today() < startOfStartMonth) return false;
  }
  return true;
}

/**
 * Posten: Ø monatlicher Betrag — NUR wenn aktuell aktiv.
 * Abgelaufene Posten (contractEnd in der Vergangenheit) geben 0 zurück.
 */
function avgMonthly(p) {
  // Abgelaufene oder noch nicht gestartete Posten zählen nicht
  if (!isCurrentlyActive(p)) return 0;

  const a = parseFloat(p.amount) || 0;
  switch (p.interval) {
    case "monatl.":
      return a;
    case "viertelj.":
      return a / 3;
    case "halbjährl.":
      return a / 6;
    case "jährl.":
      return a / 12;
    case "einmalig":
      return 0;
    default:
      return a;
  }
}

/**
 * Ist Posten in Monat mIdx (und Jahr yr) aktiv?
 * yr ist optional — Standard: aktuelles Jahr.
 * Schützt gegen leere Strings bei contractEnd/Start.
 */
function activeInMonth(p, mIdx, yr) {
  if (yr === undefined || yr === null) yr = today().getFullYear();

  // contractEnd: "" oder null → ignorieren, sonst mit Jahr vergleichen
  if (_hasDate(p.contractEnd)) {
    const e = new Date(p.contractEnd);
    const checkStart = new Date(yr, mIdx, 1);
    const endMonthStart = new Date(e.getFullYear(), e.getMonth(), 1);
    if (checkStart > endMonthStart) return false;
  }

  // contractStart: "" oder null → ignorieren, sonst mit Jahr vergleichen
  if (_hasDate(p.contractStart)) {
    const s = new Date(p.contractStart);
    const checkStart = new Date(yr, mIdx, 1);
    const startMonthStart = new Date(s.getFullYear(), s.getMonth(), 1);
    if (checkStart < startMonthStart) return false;
  }

  // Einmalig: kein Monat ist aktiv (Datum wird separat geprüft)
  if (p.interval === "einmalig") return false;

  // Intervall-Berechnung: relativ zum contractStart-Monat.
  // Fallback 0 (Januar) wenn kein contractStart gesetzt — Posten ohne Startdatum
  // feuert damit in Jan/Apr/Jul/Okt (viertelj.), Jan/Jul (halbjährl.) bzw. Januar (jährl.).
  if (p.interval === "viertelj.") {
    const ref = _hasDate(p.contractStart)
      ? new Date(p.contractStart).getMonth()
      : 0;
    return (((mIdx - ref) % 3) + 3) % 3 === 0;
  }
  if (p.interval === "halbjährl.") {
    const ref = _hasDate(p.contractStart)
      ? new Date(p.contractStart).getMonth()
      : 0;
    return (((mIdx - ref) % 6) + 6) % 6 === 0;
  }
  if (p.interval === "jährl.") {
    const ref = _hasDate(p.contractStart)
      ? new Date(p.contractStart).getMonth()
      : 0;
    return mIdx === ref;
  }

  // monatl. und alles andere
  return true;
}

/** Betrag des Postens in Monat mIdx, Jahr yr */
function monthActualForYear(p, mIdx, yr) {
  if (!activeInMonth(p, mIdx, yr)) return 0;
  return parseFloat(p.amount) || 0;
}

/** Betrag des Postens in Monat mIdx (aktuelles Jahr) */
function monthActual(p, mIdx) {
  if (!activeInMonth(p, mIdx)) return 0;
  return parseFloat(p.amount) || 0;
}

/** Array nach key sortieren */
function sortArr(arr, k, asc) {
  return [...arr].sort((a, b) => {
    let va = a[k] ?? "",
      vb = b[k] ?? "";
    if (k === "amount" || k === "due") {
      va = parseFloat(va) || 0;
      vb = parseFloat(vb) || 0;
      return asc ? va - vb : vb - va;
    }
    if (k === "contractEnd" || k === "contractStart") {
      va = va ? new Date(va).getTime() : Infinity;
      vb = vb ? new Date(vb).getTime() : Infinity;
      return asc ? va - vb : vb - va;
    }
    return asc
      ? String(va).localeCompare(String(vb), "de")
      : String(vb).localeCompare(String(va), "de");
  });
}

/** Konto anhand ID */
function getAccount(id) {
  return S.accounts.find((a) => a.id === id) || null;
}

/** Label für Konto-ID */
function accLabel(id) {
  const a = getAccount(id);
  return a ? a.label : "—";
}

const MONTHS = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];
const MONTHS_S = [
  "Jan",
  "Feb",
  "Mär",
  "Apr",
  "Mai",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Okt",
  "Nov",
  "Dez",
];

/** Zahltag aus State */
function getZahltag() {
  return CFG?.zahltag || (S && S.zahltag) || 15;
}

/** Dynamische Donut-Farben — passen sich dem aktiven Theme an */
function getDonutColors() {
  const accent =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--blue")
      .trim() || "#4d9eff";
  const h2r = (hex) => {
    const r = hex.replace("#", "");
    const n = parseInt(
      r.length === 3
        ? r
            .split("")
            .map((x) => x + x)
            .join("")
        : r,
      16,
    );
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  try {
    const [r, g, b] = h2r(accent.replace(/\s/g, ""));
    return [
      `rgba(${r},${g},${b},1)`,
      `rgba(${r},${g},${b},.72)`,
      `rgba(${r},${g},${b},.52)`,
      `rgba(${r},${g},${b},.38)`,
      `rgba(${r},${g},${b},.28)`,
      `rgba(${r},${g},${b},.62)`,
      `rgba(${r},${g},${b},.44)`,
      `rgba(${r},${g},${b},.32)`,
    ];
  } catch (e) {
    return [
      "#4d9eff",
      "#4d9eff99",
      "#4d9eff77",
      "#4d9eff55",
      "#4d9eff44",
      "#4d9eff66",
      "#4d9eff55",
      "#4d9eff33",
    ];
  }
}

// ── INLINE-VALIDATION ─────────────────
function validateField(inputEl, condition, message) {
  if (!inputEl) return true;
  const isValid = condition(inputEl.value);
  inputEl.classList.toggle("input-error", !isValid);
  let errEl = inputEl.nextElementSibling;
  if (!errEl || !errEl.classList.contains("input-err-msg")) {
    errEl = document.createElement("div");
    errEl.className = "input-err-msg";
    inputEl.after(errEl);
  }
  errEl.textContent = isValid ? "" : message;
  return isValid;
}

function clearValidation(inputEl) {
  if (!inputEl) return;
  inputEl.classList.remove("input-error");
  const next = inputEl.nextElementSibling;
  if (next && next.classList.contains("input-err-msg")) next.textContent = "";
}

// Rückwärtskompatibilität
const DONUT_COLORS = [
  "#4d9eff",
  "#4d9effb8",
  "#4d9eff85",
  "#4d9eff60",
  "#4d9eff45",
  "#4d9eff9e",
  "#4d9eff70",
  "#4d9eff50",
];
