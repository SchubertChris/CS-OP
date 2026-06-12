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
  return (S && S.zahltag) || 15;
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
