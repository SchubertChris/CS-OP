// ══════════════════════════════════════
//  STATE — Globaler Zustand · Speichern
// ══════════════════════════════════════

/**
 * accounts: [{
 *   id, label, sub, accountType, iban, color, balance, include,
 *   isMain, monthlyIncome, bankGroup, billingType, billingDay, ccExp, ccCvv
 * }]
 * data:      [{ id, name, type, amount, interval, due, accountId, note,
 *               contractStart, contractEnd, overrides, goalId, categoryId }]
 * transfers: [{ id, date, fromId, toId, amount, note, interval, execDay }]
 * goals:     [{ id, name, icon, color, targetAmount, currentAmount, monthlyRate, deadline }]
 * bookings:  [{ id, postenId, transferId, date, monthKey, name, type, amount,
 *               baseAmount, accountId, status, note, interval }]
 * categories:[{ id, name, color, icon }]
 * monthlyIncome: number
 * zahltag:       number
 */

// ── STANDARD-KATEGORIEN ───────────────
const DEFAULT_CATEGORIES = [
  { id: "cat_wohnen",     name: "Wohnen",        color: "#4d9eff", icon: "home" },
  { id: "cat_mobil",      name: "Mobilität",      color: "#ffb547", icon: "car" },
  { id: "cat_lebens",     name: "Lebensmittel",   color: "#00e5a0", icon: "shopping-cart" },
  { id: "cat_health",     name: "Gesundheit",     color: "#ff4d6a", icon: "pill" },
  { id: "cat_versich",    name: "Versicherungen", color: "#7b5fff", icon: "shield" },
  { id: "cat_abo",        name: "Abos & Medien",  color: "#00d4cc", icon: "smartphone" },
  { id: "cat_invest",     name: "Investitionen",  color: "#22c55e", icon: "trending-up" },
  { id: "cat_freizeit",   name: "Freizeit",       color: "#f59e0b", icon: "target" },
  { id: "cat_bildung",    name: "Bildung",        color: "#c084fc", icon: "book" },
  { id: "cat_gehalt",     name: "Gehalt",         color: "#4ade80", icon: "briefcase" },
  { id: "cat_sonstiges",  name: "Sonstiges",      color: "#9ca1ae", icon: "package" },
];

// Migration Legacy-Emoji → Icon-Name (für bereits geseedete S.categories)
const CAT_EMOJI_TO_ICON = {
  "🏠":"home", "🚗":"car", "🛒":"shopping-cart", "💊":"pill", "🛡️":"shield",
  "🛡":"shield", "📱":"smartphone", "📈":"trending-up", "🎯":"target",
  "📚":"book", "💼":"briefcase", "📦":"package",
};

// Legacy-Emoji → Icon-Name für Sparziele
const GOAL_EMOJI_TO_ICON = {
  "🎯":"target", "🏖️":"umbrella", "🏖":"umbrella", "🚗":"car", "🏠":"home",
  "💻":"monitor", "✈️":"plane", "✈":"plane", "💰":"wallet", "📈":"trending-up",
  "🎓":"graduation-cap", "💍":"heart", "🛡️":"shield", "📦":"package",
};

const S = {
  accounts: [],
  data: [],
  transfers: [],
  goals: [],
  bookings: [], // ← Buchungshistorie (echte Einträge aus Serien)
  categories: [],
  creditors: [],  // ← Kreditoren / Zahlungsempfänger
  monthlyIncome: 0,
  zahltag: 15,
  groupOrder: [],
  groupAccOrder: {},
  yearNotes: {},
};

// ── PERSIST (debounced) ───────────────
// Schnelle, aufeinanderfolgende Mutationen werden zu einem Schreibvorgang
// zusammengefasst (Performance bei vielen Buchungen). Datenintegrität bleibt
// gewahrt: im Legacy-Modus ist localStorage die Quelle für hydrate(); im
// Vault-Modus kommt der State NUR aus dem entschlüsselten Unlock-Ergebnis.

// ── VAULT-MODUS (Verschlüsselung) ──
let _vaultMode = false;
function setVaultMode(on) { _vaultMode = !!on; }

// Boot/Re-Unlock: initialBoot → aus Platte hydrieren; sonst RAM nachspeichern
// (verhindert, dass ein Re-Unlock ungespeicherte Änderungen überschreibt).
async function unlockVaultFlow(pw, opts) {
  const r = await window.csf.vault.unlock(pw);
  if (!r || !r.ok) return r || { ok: false, error: "error" };
  if (opts && opts.initialBoot) hydrate(r.state);
  else if (_persistDirty || _unsavedChanges) persistNow();
  return r;
}

// Verschlüsselung aktivieren: create → verifyIntegrity → erst dann Klartext-Abriss.
async function enableEncryption(pw) {
  const snap = JSON.parse(JSON.stringify(S));
  const c = await window.csf.vault.create(pw, snap);
  if (!c || !c.ok) return c || { ok: false, error: "create-failed" };
  const ver = await window.csf.vault.verifyIntegrity(pw, snap);
  if (!ver || !ver.ok) return { ok: false, error: "Integritätsprüfung fehlgeschlagen (" + ((ver && ver.error) || "?") + ") — Klartext bleibt unangetastet." };
  try { await window.csf.vault.migrateCryptoDb(); } catch (_) {}   // crypto.db → SQLCipher (Self-Heal sonst beim nächsten Zugriff)
  setVaultMode(true);
  localStorage.removeItem("csf_v1");   // letzte Klartext-Brücke — erst jetzt
  return { ok: true, recoveryCode: c.recoveryCode };
}

let _persistTimer = null;
let _persistDirty = false;
const PERSIST_DEBOUNCE_MS = 200;

function persist() {
  _persistDirty = true;
  if (_persistTimer) return; // Schreibvorgang bereits geplant — coalescen
  _persistTimer = setTimeout(_persistFlush, PERSIST_DEBOUNCE_MS);
}

// Sofort schreiben — für kritische Momente (manuelles Speichern, Import,
// Restore, App-Schließen). Umgeht das Debounce-Fenster.
function persistNow() {
  if (_persistTimer) { clearTimeout(_persistTimer); _persistTimer = null; }
  _persistFlush();
}

function _persistFlush() {
  _persistTimer = null;
  if (!_persistDirty) return;
  _persistDirty = false;

  // Save-Indikator (gelber Flash am Speichern-Button)
  if (!_unsavedChanges) {
    const btn = document.getElementById("btnManualSave");
    if (btn && !btn.classList.contains("save-btn-unsaved")) {
      btn.classList.add("save-btn-autosave");
      setTimeout(() => btn.classList.remove("save-btn-autosave"), 800);
    }
  }
  _clearSaveVibrate();

  if (window.csf?.state?.save) {
    window.csf.state.save(S).then((r) => {
      if (r && r.ok === false) {                 // Speichern fehlgeschlagen (z.B. gesperrt)
        _persistDirty = true; _markUnsaved();    // Daten NICHT verlieren
        if (r.error === "locked" && typeof showToast === "function")
          showToast("Gesperrt — zum Speichern bitte entsperren", "warning", 4000);
      }
    }).catch(() => { _persistDirty = true; _markUnsaved(); });
  }
  // Klartext-Spiegel NUR im Legacy-Modus (im Vault-Modus verschlüsselt main())
  if (!_vaultMode) {
    try { localStorage.setItem("csf_v1", JSON.stringify(S)); } catch (e) { console.warn("persist failed", e); }
  }

  const dot = document.getElementById("saveDot");
  const lbl = document.getElementById("saveLabel");
  if (dot) {
    dot.classList.add("saved");
    if (lbl) lbl.textContent = "gespeichert";
    clearTimeout(dot._t);
    dot._t = setTimeout(() => {
      dot.classList.remove("saved");
      if (lbl) lbl.textContent = CFG?.autosave ? "autosave · on" : "autosave · off";
    }, 1500);
  }
}

// Sicherheits-Flush: nie ungespeicherte Daten beim Schließen/Reload verlieren.
window.addEventListener("beforeunload", () => { if (_persistDirty) persistNow(); });
window.addEventListener("pagehide", () => { if (_persistDirty) persistNow(); });
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden" && _persistDirty) persistNow();
});

// ── MANUAL SAVE + UNSAVED INDICATOR ──
let _unsavedChanges = false;
let _saveVibrateTimer = null;
let _saveShakeTimer = null;

function manualSave() {
  persistNow();
  if (typeof saveSafepoint === "function") saveSafepoint("manuell");
  _clearSaveVibrate();
  const btn = document.getElementById("btnManualSave");
  if (btn) {
    btn.classList.add("save-btn-success");
    setTimeout(() => btn.classList.remove("save-btn-success"), 1400);
  }
  if (typeof showToast === "function") showToast("Gespeichert", "success", 2000);
}

function _markUnsaved() {
  if (_unsavedChanges) return; // schon markiert
  _unsavedChanges = true;
  const btn = document.getElementById("btnManualSave");
  if (!btn) return;
  btn.classList.add("save-btn-unsaved");
  // Sofort einmal schütteln
  _triggerShake(btn);
  // Alle 6 Sekunden wiederholen solange ungespeichert
  clearInterval(_saveVibrateTimer);
  _saveVibrateTimer = setInterval(() => _triggerShake(btn), 6000);
}

function _triggerShake(btn) {
  if (!btn) btn = document.getElementById("btnManualSave");
  if (!btn) return;
  btn.classList.remove("save-btn-pulse");
  void btn.offsetWidth; // reflow
  btn.classList.add("save-btn-pulse");
  setTimeout(() => btn.classList.remove("save-btn-pulse"), 700);
}

function _clearSaveVibrate() {
  _unsavedChanges = false;
  clearInterval(_saveVibrateTimer);
  clearTimeout(_saveShakeTimer);
  const btn = document.getElementById("btnManualSave");
  if (btn) btn.classList.remove("save-btn-unsaved", "save-btn-pulse");
}

// Globaler Input-Listener — reagiert auf Tippen in der App
document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("input", (e) => {
    // Nur bei echten Eingaben in Formularfeldern
    const tag = e.target?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
      _markUnsaved();
    }
  });
});

// ── HYDRATE ───────────────────────────
function hydrate(seed) {
  try {
    let p = seed;                                  // Vault-Modus: entschlüsselter State
    if (!p) {                                       // Legacy: aus localStorage
      const raw = localStorage.getItem("csf_v1");
      if (!raw) return false;
      p = JSON.parse(raw);
    }

    if (Array.isArray(p.accounts)) {
      S.accounts = p.accounts.map((a) => ({
        ...a,
        bankGroup: a.bankGroup
          ? a.bankGroup.trim().charAt(0).toUpperCase() +
            a.bankGroup.trim().slice(1)
          : a.bankGroup || "",
      }));
    }
    if (Array.isArray(p.data)) S.data = p.data;
    if (Array.isArray(p.transfers)) S.transfers = p.transfers;
    if (Array.isArray(p.goals)) S.goals = p.goals;
    if (Array.isArray(p.bookings)) S.bookings = p.bookings;
    if (Array.isArray(p.categories) && p.categories.length) S.categories = p.categories;
    if (Array.isArray(p.creditors)) S.creditors = p.creditors;

    if (typeof p.monthlyIncome === "number") S.monthlyIncome = p.monthlyIncome;
    if (typeof p.zahltag === "number") S.zahltag = p.zahltag;
    if (Array.isArray(p.groupOrder)) S.groupOrder = p.groupOrder;
    if (p.groupAccOrder && typeof p.groupAccOrder === "object")
      S.groupAccOrder = p.groupAccOrder;
    if (Array.isArray(p.closedMonths)) S.closedMonths = p.closedMonths;
    if (p.yearNotes && typeof p.yearNotes === "object" && !Array.isArray(p.yearNotes))
      S.yearNotes = p.yearNotes;

    // Wenn bookings fehlen (alte .fbs ohne bookings-Feld) aber Posten vorhanden:
    // initBookings() wird nach hydrate() in index.html aufgerufen und generiert sie neu.
    // Kein expliziter Aufruf hier nötig — aber Flag setzen damit io.js es weiß.
    if (!Array.isArray(p.bookings) || p.bookings.length === 0) {
      S.bookings = []; // sauberer Zustand — initBookings() füllt ihn auf
    }

    return true;
  } catch (e) {
    console.warn("hydrate failed", e);
    return false;
  }
}

// ── HELPERS ───────────────────────────
function getMainAccount() {
  return (
    S.accounts.find((a) => a.isMain) ||
    S.accounts.find((a) => a.accountType === "girokonto") ||
    S.accounts[0] ||
    null
  );
}

function getCreditCards() {
  return S.accounts.filter((a) => a.accountType === "kreditkarte");
}

// ── SEED — Demo-Daten ─────────────────
function seedData() {
  const yr = new Date().getFullYear();
  S.zahltag = 25;
  S.yearNotes = {};

  // Demo: 2 vergangene Monate abgeschlossen (wird nach initBookings() mit Abschluss-Buchung ergänzt)
  const _now = new Date();
  const _p1 = new Date(_now.getFullYear(), _now.getMonth() - 2, 1);
  const _p2 = new Date(_now.getFullYear(), _now.getMonth() - 1, 1);
  const _mkFmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  S.closedMonths = [_mkFmt(_p1), _mkFmt(_p2)];

  S.accounts = [
    {
      id: "acc_giro",
      label: "Volksbank Giro",
      sub: "Girokonto · Hauptkonto",
      accountType: "girokonto",
      iban: "DE89370400440532013000",
      color: "#4d9eff",
      balance: 2147.8,
      include: true,
      isMain: true,
      monthlyIncome: 2850.0,
      bankGroup: "Volksbank",
      isGroupRef: true,
      note: "Primärkonto",
    },
    {
      id: "acc_visa",
      label: "Volksbank Visa",
      sub: "Kreditkarte · Abr. 25.",
      accountType: "kreditkarte",
      iban: "DE89370400440532013001",
      color: "#ff4d6a",
      balance: -318.45,
      include: true,
      isMain: false,
      monthlyIncome: 0,
      bankGroup: "Volksbank",
      isGroupRef: false,
      note: "Visa Infinite",
    },
    {
      id: "acc_dkb",
      label: "DKB Tagesgeld",
      sub: "Tagesgeld 3,50% p.a.",
      accountType: "tagesgeld",
      iban: "DE12500105170648489890",
      color: "#ffb547",
      balance: 6850.0,
      include: true,
      isMain: false,
      monthlyIncome: 0,
      bankGroup: "DKB",
      isGroupRef: true,
      note: "Notgroschen + Urlaub",
    },
    {
      id: "acc_dkb2",
      label: "DKB Festgeld",
      sub: "Festgeld 12 Mon. 4,1%",
      accountType: "festgeld",
      iban: "DE12500105170648489891",
      color: "#00d4cc",
      balance: 5000.0,
      include: true,
      isMain: false,
      monthlyIncome: 0,
      bankGroup: "DKB",
      isGroupRef: false,
      note: "Läuft bis Okt. 2026",
    },
    {
      id: "acc_depot",
      label: "Trade Republic Depot",
      sub: "ETF · Aktien",
      accountType: "depot",
      iban: "",
      color: "#7b5fff",
      balance: 12840.0,
      include: false,
      isMain: false,
      monthlyIncome: 0,
      bankGroup: "",
      isGroupRef: false,
      note: "MSCI World + Einzeltitel",
    },
    {
      id: "acc_vl",
      label: "Bausparkasse VL",
      sub: "Vermögenswirksame Leistungen",
      accountType: "vl",
      iban: "",
      color: "#00e5a0",
      balance: 3080.0,
      include: false,
      isMain: false,
      monthlyIncome: 0,
      bankGroup: "",
      isGroupRef: false,
      note: "40€/Mon AG-Anteil",
    },
    {
      id: "acc_bar",
      label: "Bargeld / Portemonnaie",
      sub: "Bar",
      accountType: "sonstiges",
      iban: "",
      color: "#9ca1ae",
      balance: 120.0,
      include: true,
      isMain: false,
      monthlyIncome: 0,
      bankGroup: "",
      isGroupRef: false,
      note: "",
    },
  ];

  const d2 = yr - 9 + "-01-01";
  const d3 = yr - 5 + "-03-01";

  S.data = [
    {
      id: "p_geh",
      name: "Gehalt Netto",
      type: "einnahme",
      amount: 2850.0,
      interval: "monatl.",
      due: "25",
      accountId: "acc_giro",
      note: "Arbeitgeber GmbH",
      contractStart: d2,
      contractEnd: "",
    },
    {
      id: "p_vlag",
      name: "VL AG-Anteil",
      type: "einnahme",
      amount: 40.0,
      interval: "monatl.",
      due: "25",
      accountId: "acc_vl",
      note: "Arbeitgeber zahlt auf VL",
      contractStart: d2,
      contractEnd: "",
    },
    {
      id: "p_kash",
      name: "Kindergeld",
      type: "einnahme",
      amount: 255.0,
      interval: "monatl.",
      due: "15",
      accountId: "acc_giro",
      note: "Familienkasse",
      contractStart: d2,
      contractEnd: "",
    },
    {
      id: "p_zins",
      name: "Tagesgeld-Zinsen",
      type: "einnahme",
      amount: 19.9,
      interval: "monatl.",
      due: "1",
      accountId: "acc_dkb",
      note: "3,5% p.a. auf 6850€",
      contractStart: d2,
      contractEnd: "",
    },
    {
      id: "p_miet",
      name: "Warmmiete",
      type: "ausgabe",
      amount: 860.0,
      interval: "monatl.",
      due: "1",
      accountId: "acc_giro",
      note: "inkl. NK-Vorauszahlung",
      contractStart: d2,
      contractEnd: "",
      categoryId: "cat_wohnen",
      creditorId: "cred_vermieter",
    },
    {
      id: "p_stro",
      name: "Strom (Abschlag)",
      type: "ausgabe",
      amount: 94.0,
      interval: "monatl.",
      due: "15",
      accountId: "acc_giro",
      note: "Stadtwerke",
      contractStart: d3,
      contractEnd: "",
      categoryId: "cat_wohnen",
      creditorId: "cred_stadtwerke",
    },
    {
      id: "p_gez",
      name: "GEZ Rundfunkbeitrag",
      type: "ausgabe",
      amount: 18.36,
      interval: "viertelj.",
      due: "15",
      accountId: "acc_giro",
      note: "",
      contractStart: d2,
      contractEnd: "",
      categoryId: "cat_abo",
      creditorId: "cred_ard",
    },
    {
      id: "p_kv",
      name: "Krankenversicherung",
      type: "ausgabe",
      amount: 218.5,
      interval: "monatl.",
      due: "1",
      accountId: "acc_giro",
      note: "TK freiwillig versichert",
      contractStart: d2,
      contractEnd: "",
      categoryId: "cat_versich",
      creditorId: "cred_tk",
    },
    {
      id: "p_haft",
      name: "Haftpflicht",
      type: "ausgabe",
      amount: 8.2,
      interval: "monatl.",
      due: "1",
      accountId: "acc_giro",
      note: "Allianz",
      contractStart: d2,
      contractEnd: "",
      categoryId: "cat_versich",
      creditorId: "cred_allianz",
    },
    {
      id: "p_kfz",
      name: "KFZ-Versicherung",
      type: "ausgabe",
      amount: 94.5,
      interval: "viertelj.",
      due: "1",
      accountId: "acc_giro",
      note: "",
      contractStart: yr - 1 + "-01-01",
      contractEnd: yr + "-12-31",
      categoryId: "cat_versich",
      creditorId: "cred_allianz",
    },
    {
      id: "p_rkv",
      name: "Reisekrankenversicherung",
      type: "ausgabe",
      amount: 12.0,
      interval: "jährl.",
      due: "1",
      accountId: "acc_giro",
      note: "ADAC",
      contractStart: d2,
      contractEnd: "",
      categoryId: "cat_versich",
      creditorId: "cred_adac",
    },
    {
      id: "p_kred",
      name: "Autokredit VW Financial",
      type: "ausgabe",
      amount: 249.0,
      interval: "monatl.",
      due: "20",
      accountId: "acc_giro",
      note: "VW Golf · 48 Raten",
      contractStart: yr - 2 + "-03-01",
      contractEnd: yr + 2 + "-02-28",
      categoryId: "cat_mobil",
      creditorId: "cred_vwfs",
    },
    {
      id: "p_tank",
      name: "ADAC Mitgliedschaft",
      type: "ausgabe",
      amount: 7.08,
      interval: "monatl.",
      due: "1",
      accountId: "acc_giro",
      note: "Classic",
      contractStart: d2,
      contractEnd: "",
      categoryId: "cat_mobil",
      creditorId: "cred_adac",
    },
    {
      id: "p_dtkt",
      name: "Deutschland-Ticket",
      type: "ausgabe",
      amount: 58.0,
      interval: "monatl.",
      due: "1",
      accountId: "acc_visa",
      note: "",
      contractStart: yr - 1 + "-05-01",
      contractEnd: "",
      categoryId: "cat_mobil",
      creditorId: "cred_bvg",
    },
    {
      id: "p_inet",
      name: "Internetvertrag",
      type: "ausgabe",
      amount: 39.99,
      interval: "monatl.",
      due: "3",
      accountId: "acc_giro",
      note: "Telekom MagentaZuhause",
      contractStart: yr - 1 + "-01-01",
      contractEnd: yr + 1 + "-12-31",
      categoryId: "cat_abo",
      creditorId: "cred_telekom",
    },
    {
      id: "p_mob",
      name: "Handyvertrag",
      type: "ausgabe",
      amount: 22.99,
      interval: "monatl.",
      due: "15",
      accountId: "acc_visa",
      note: "O2 Free M · kündbar 1M vorher",
      contractStart: yr - 1 + "-02-15",
      contractEnd: yr + 1 + "-02-14",
      categoryId: "cat_abo",
      creditorId: "cred_o2",
    },
    {
      id: "p_nflx",
      name: "Netflix Standard",
      type: "ausgabe",
      amount: 13.99,
      interval: "monatl.",
      due: "8",
      accountId: "acc_visa",
      note: "Teilen mit Familie",
      contractStart: d2,
      contractEnd: "",
      categoryId: "cat_abo",
      creditorId: "cred_netflix",
    },
    {
      id: "p_spot",
      name: "Spotify Family",
      type: "ausgabe",
      amount: 17.99,
      interval: "monatl.",
      due: "12",
      accountId: "acc_visa",
      note: "5 Nutzer",
      contractStart: d2,
      contractEnd: "",
      categoryId: "cat_abo",
      creditorId: "cred_spotify",
    },
    {
      id: "p_amaz",
      name: "Amazon Prime",
      type: "ausgabe",
      amount: 8.99,
      interval: "monatl.",
      due: "18",
      accountId: "acc_visa",
      note: "",
      contractStart: d2,
      contractEnd: "",
      categoryId: "cat_abo",
      creditorId: "cred_amazon",
    },
    {
      id: "p_clou",
      name: "iCloud 200GB",
      type: "ausgabe",
      amount: 3.99,
      interval: "monatl.",
      due: "22",
      accountId: "acc_visa",
      note: "",
      contractStart: d3,
      contractEnd: "",
      categoryId: "cat_abo",
      creditorId: "cred_apple",
    },
    {
      id: "p_fit",
      name: "Fitnessstudio McFit",
      type: "ausgabe",
      amount: 29.9,
      interval: "monatl.",
      due: "5",
      accountId: "acc_visa",
      note: "Berlin Mitte",
      contractStart: yr - 1 + "-09-01",
      contractEnd: yr + "-08-31",
      categoryId: "cat_freizeit",
      creditorId: "cred_mcfit",
    },
    {
      id: "p_arzt",
      name: "Physiotherapie",
      type: "ausgabe",
      amount: 45.0,
      interval: "viertelj.",
      due: "10",
      accountId: "acc_visa",
      note: "10er-Karte",
      contractStart: d3,
      contractEnd: "",
      categoryId: "cat_health",
      creditorId: "cred_physio",
    },
    {
      id: "p_etf",
      name: "ETF Sparplan MSCI World",
      type: "ausgabe",
      amount: 200.0,
      interval: "monatl.",
      due: "2",
      accountId: "acc_giro",
      note: "→ Trade Republic Depot",
      contractStart: yr - 2 + "-01-01",
      contractEnd: "",
      categoryId: "cat_invest",
      creditorId: "cred_tr",
    },
    {
      id: "p_tgsp",
      name: "Tagesgeld Sparrate",
      type: "ausgabe",
      amount: 200.0,
      interval: "monatl.",
      due: "2",
      accountId: "acc_giro",
      note: "→ DKB Tagesgeld",
      contractStart: d2,
      contractEnd: "",
      categoryId: "cat_invest",
      creditorId: "cred_dkb",
    },
    {
      id: "p_kita",
      name: "KiTa-Beitrag Regenbogen",
      type: "ausgabe",
      amount: 310.0,
      interval: "monatl.",
      due: "5",
      accountId: "acc_giro",
      note: "Krippe & KiTa-Gruppe · einkommensabhängig",
      contractStart: yr - 5 + "-09-01",
      contractEnd: yr + 1 + "-07-31",
      categoryId: "cat_bildung",
      creditorId: "cred_kita",
    },
    {
      id: "p_riester",
      name: "Riester-Rente UniProfiRente",
      type: "ausgabe",
      amount: 175.0,
      interval: "monatl.",
      due: "1",
      accountId: "acc_giro",
      note: "4% Eigenanteil · Zulageberechtigt",
      contractStart: yr - 14 + "-01-01",
      contractEnd: "",
      categoryId: "cat_invest",
      creditorId: "cred_riester",
    },
  ];

  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  const now = new Date();

  S.transfers = [];
  for (let i = 3; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 2);
    S.transfers.push({ id: "tr_etf_" + i, date: iso(d), fromId: "acc_giro", toId: "acc_depot", amount: 200, note: "ETF Sparplan",       interval: "monatl.", execDay: 2 });
    S.transfers.push({ id: "tr_tg_"  + i, date: iso(d), fromId: "acc_giro", toId: "acc_dkb",   amount: 200, note: "Tagesgeld Sparrate", interval: "monatl.", execDay: 2 });
  }

  // ── EINMALIGE BUCHUNGEN — Lebensgeschichte von Studium bis Rente ─────────
  const _mk = (d) => d.slice(0, 7);
  const oneOffs = [
    // ── yr-20 (Studiumsbeginn ~age 18) ────────────────
    { date: yr - 20 + "-09-15", type: "ausgabe",  amount: 760,  name: "WG-Kaution Erstes Zimmer Berlin",              accountId: "acc_giro" },
    { date: yr - 20 + "-10-01", type: "ausgabe",  amount: 218,  name: "Semesterbeitrag WS Erstimmatrikulation",       accountId: "acc_giro" },
    { date: yr - 20 + "-10-10", type: "ausgabe",  amount: 290,  name: "Erstausstattung WG-Zimmer",                    accountId: "acc_giro" },
    { date: yr - 20 + "-10-20", type: "einnahme", amount: 450,  name: "Nebenjob Supermarkt Oktober",                  accountId: "acc_giro" },
    { date: yr - 20 + "-12-18", type: "einnahme", amount: 400,  name: "Weihnachtsgeschenke Geld von Eltern",          accountId: "acc_giro" },

    // ── yr-19 ─────────────────────────────────────────
    { date: yr - 19 + "-01-10", type: "einnahme", amount: 480,  name: "Nebenjob Bürokraft Januar",                    accountId: "acc_giro" },
    { date: yr - 19 + "-02-08", type: "ausgabe",  amount: 880,  name: "Laptop Lenovo ThinkPad Student",               accountId: "acc_giro" },
    { date: yr - 19 + "-04-01", type: "ausgabe",  amount: 218,  name: "Semesterbeitrag SS",                           accountId: "acc_giro" },
    { date: yr - 19 + "-07-20", type: "ausgabe",  amount: 1650, name: "Führerschein Klasse B Fahrschule",             accountId: "acc_giro" },
    { date: yr - 19 + "-08-10", type: "ausgabe",  amount: 780,  name: "Urlaub Spanien Interrail",                     accountId: "acc_giro" },
    { date: yr - 19 + "-10-01", type: "ausgabe",  amount: 218,  name: "Semesterbeitrag WS",                           accountId: "acc_giro" },
    { date: yr - 19 + "-12-20", type: "einnahme", amount: 520,  name: "Weihnachtsgeld Nebenjob + Eltern",             accountId: "acc_giro" },

    // ── yr-18 ─────────────────────────────────────────
    { date: yr - 18 + "-04-01", type: "ausgabe",  amount: 218,  name: "Semesterbeitrag SS",                           accountId: "acc_giro" },
    { date: yr - 18 + "-05-15", type: "einnahme", amount: 1500, name: "Werkstudentenjob IT-Agentur Q2",               accountId: "acc_giro" },
    { date: yr - 18 + "-07-25", type: "ausgabe",  amount: 990,  name: "Backpacking Interrail Europa 3 Wochen",        accountId: "acc_giro" },
    { date: yr - 18 + "-10-01", type: "ausgabe",  amount: 218,  name: "Semesterbeitrag WS",                           accountId: "acc_giro" },
    { date: yr - 18 + "-11-10", type: "einnahme", amount: 1600, name: "Werkstudentenjob IT Q3+Q4",                    accountId: "acc_giro" },

    // ── yr-17 (Studiumsendphase / Bachelor) ───────────
    { date: yr - 17 + "-01-15", type: "ausgabe",  amount: 340,  name: "Fachbücher + Skripte Bachelor",                accountId: "acc_giro" },
    { date: yr - 17 + "-04-01", type: "ausgabe",  amount: 218,  name: "Semesterbeitrag SS",                           accountId: "acc_giro" },
    { date: yr - 17 + "-05-20", type: "einnahme", amount: 2200, name: "Werkstudent-Jahresbonus IT-Firma",             accountId: "acc_giro" },
    { date: yr - 17 + "-07-28", type: "ausgabe",  amount: 1100, name: "Urlaub Lanzarote mit Freunden",                accountId: "acc_giro" },
    { date: yr - 17 + "-09-15", type: "ausgabe",  amount: 85,   name: "Bachelor-Thesis Druck + Bindung",              accountId: "acc_giro" },
    { date: yr - 17 + "-12-05", type: "einnahme", amount: 600,  name: "Weihnachten Eltern + Oma",                     accountId: "acc_giro" },

    // ── yr-16 (Masterstudium + erstes Praktikum) ──────
    { date: yr - 16 + "-01-20", type: "ausgabe",  amount: 950,  name: "Umzug 1-Zimmer-Wohnung Kaution",               accountId: "acc_giro" },
    { date: yr - 16 + "-04-01", type: "ausgabe",  amount: 240,  name: "Masterstudium Semesterbeitrag",                 accountId: "acc_giro" },
    { date: yr - 16 + "-05-01", type: "einnahme", amount: 3600, name: "Praktikum Vollzeit IT 3 Monate",               accountId: "acc_giro" },
    { date: yr - 16 + "-10-01", type: "ausgabe",  amount: 240,  name: "Semesterbeitrag WS Master 2. Jahr",            accountId: "acc_giro" },
    { date: yr - 16 + "-12-10", type: "einnahme", amount: 850,  name: "Weihnachtsbonus Praktikum",                    accountId: "acc_giro" },

    // ── yr-15 (Berufsstart, Master abgeschlossen) ─────
    { date: yr - 15 + "-01-10", type: "ausgabe",  amount: 120,  name: "Masterarbeit Druck + Einreichung",             accountId: "acc_giro" },
    { date: yr - 15 + "-02-01", type: "einnahme", amount: 450,  name: "Umzugskostenpauschale neuer AG",               accountId: "acc_giro" },
    { date: yr - 15 + "-02-15", type: "ausgabe",  amount: 1800, name: "Umzug + Spedition Berufsstart Stuttgart",      accountId: "acc_giro" },
    { date: yr - 15 + "-03-01", type: "ausgabe",  amount: 1200, name: "Kaution 1-Zimmer-Apartment Stuttgart",         accountId: "acc_giro" },
    { date: yr - 15 + "-04-10", type: "ausgabe",  amount: 620,  name: "IKEA Basisausstattung erste eigene Wohnung",   accountId: "acc_giro" },
    { date: yr - 15 + "-07-05", type: "ausgabe",  amount: 1450, name: "Erster Urlaub als Berufstätiger – Marokko",    accountId: "acc_giro" },
    { date: yr - 15 + "-12-05", type: "einnahme", amount: 1100, name: "Weihnachtsgeld (erstes Berufsjahr)",           accountId: "acc_giro" },

    // ── yr-14 ─────────────────────────────────────────
    { date: yr - 14 + "-02-20", type: "ausgabe",  amount: 3800, name: "Gebrauchtwagen VW Polo (bar bezahlt)",         accountId: "acc_giro" },
    { date: yr - 14 + "-04-10", type: "einnahme", amount: 1850, name: "Erste Steuerrückerstattung Berufseinsteiger",  accountId: "acc_giro" },
    { date: yr - 14 + "-06-12", type: "ausgabe",  amount: 1100, name: "Sommerurlaub Lissabon",                        accountId: "acc_giro" },
    { date: yr - 14 + "-09-01", type: "ausgabe",  amount: 320,  name: "Berufsbegleitende IT-Weiterbildung Kurs",      accountId: "acc_giro" },
    { date: yr - 14 + "-12-05", type: "einnahme", amount: 1250, name: "Weihnachtsgeld",                               accountId: "acc_giro" },

    // ── yr-13 (Jobwechsel + Gehaltssprung) ────────────
    { date: yr - 13 + "-01-15", type: "einnahme", amount: 4000, name: "Jobwechsel Sign-On Bonus neue Stelle",         accountId: "acc_giro" },
    { date: yr - 13 + "-01-22", type: "ausgabe",  amount: 480,  name: "Abschlussessen alte Kollegen Restaurant",      accountId: "acc_giro" },
    { date: yr - 13 + "-03-10", type: "einnahme", amount: 940,  name: "Steuerrückerstattung",                         accountId: "acc_giro" },
    { date: yr - 13 + "-08-15", type: "ausgabe",  amount: 1680, name: "Sommerurlaub Kreta mit Freundin",              accountId: "acc_giro" },
    { date: yr - 13 + "-10-15", type: "ausgabe",  amount: 1200, name: "Neues MacBook Pro Arbeit + Freizeit",          accountId: "acc_giro" },
    { date: yr - 13 + "-12-05", type: "einnahme", amount: 1400, name: "Weihnachtsgeld neue Stelle",                   accountId: "acc_giro" },

    // ── yr-12 (Umzug nach Berlin, zusammenziehen) ─────
    { date: yr - 12 + "-01-10", type: "einnahme", amount: 650,  name: "Umzugskostenpauschale AG Berlin",              accountId: "acc_giro" },
    { date: yr - 12 + "-02-01", type: "ausgabe",  amount: 2200, name: "Kaution 2-Zimmer-Wohnung Berlin Mitte",        accountId: "acc_giro" },
    { date: yr - 12 + "-02-15", type: "ausgabe",  amount: 1600, name: "Spedition + Umzug nach Berlin",                accountId: "acc_giro" },
    { date: yr - 12 + "-03-08", type: "ausgabe",  amount: 2100, name: "IKEA Komplettausstattung neue Wohnung",        accountId: "acc_giro" },
    { date: yr - 12 + "-04-18", type: "einnahme", amount: 1100, name: "Steuerrückerstattung Umzugsjahr",              accountId: "acc_giro" },
    { date: yr - 12 + "-09-10", type: "ausgabe",  amount: 890,  name: "Kurzurlaub Amsterdam zu zweit",                accountId: "acc_giro" },
    { date: yr - 12 + "-12-05", type: "einnahme", amount: 1500, name: "Weihnachtsgeld",                               accountId: "acc_giro" },

    // ── yr-11 ─────────────────────────────────────────
    { date: yr - 11 + "-03-20", type: "einnahme", amount: 820,  name: "Steuerrückerstattung",                         accountId: "acc_giro" },
    { date: yr - 11 + "-05-18", type: "ausgabe",  amount: 7800, name: "Gebrauchtwagen Golf 7 Anzahlung bar",          accountId: "acc_giro" },
    { date: yr - 11 + "-07-20", type: "ausgabe",  amount: 1490, name: "Sommerurlaub Griechenland",                    accountId: "acc_giro" },
    { date: yr - 11 + "-10-08", type: "ausgabe",  amount: 699,  name: "Samsung TV 55 Zoll",                           accountId: "acc_giro" },
    { date: yr - 11 + "-12-05", type: "einnahme", amount: 1650, name: "Weihnachtsgeld",                               accountId: "acc_giro" },

    // ── yr-10 (Verlobung + Hochzeit) ──────────────────
    { date: yr - 10 + "-02-14", type: "ausgabe",  amount: 3200, name: "Verlobungsring Goldschmied",                   accountId: "acc_giro" },
    { date: yr - 10 + "-03-15", type: "einnahme", amount: 1050, name: "Steuerrückerstattung",                         accountId: "acc_giro" },
    { date: yr - 10 + "-06-08", type: "ausgabe",  amount: 4800, name: "Hochzeitsfeier Location + Catering Berlin",    accountId: "acc_giro" },
    { date: yr - 10 + "-06-10", type: "ausgabe",  amount: 1100, name: "Hochzeitsfotograf + Videograf",                accountId: "acc_giro" },
    { date: yr - 10 + "-06-12", type: "ausgabe",  amount: 980,  name: "Trauringe 585er Gold Paar",                    accountId: "acc_giro" },
    { date: yr - 10 + "-06-14", type: "ausgabe",  amount: 520,  name: "Hochzeitskleid + Anzug Änderungsschneiderei",  accountId: "acc_giro" },
    { date: yr - 10 + "-06-15", type: "einnahme", amount: 4200, name: "Hochzeitsgeschenke Geldumschläge Gäste",       accountId: "acc_giro" },
    { date: yr - 10 + "-07-10", type: "ausgabe",  amount: 3400, name: "Hochzeitsreise Toskana Hotel + Ausflüge",      accountId: "acc_giro" },
    { date: yr - 10 + "-12-05", type: "einnahme", amount: 1700, name: "Weihnachtsgeld",                               accountId: "acc_giro" },
    { date: yr - 10 + "-12-20", type: "ausgabe",  amount: 420,  name: "Weihnachtsgeschenke",                          accountId: "acc_giro" },

    // ── yr-9 ─────────────────────────────────────────
    { date: yr - 9 + "-03-15", type: "einnahme", amount: 850,  name: "Steuerrückerstattung " + (yr - 10), accountId: "acc_giro" },
    { date: yr - 9 + "-07-14", type: "ausgabe",  amount: 1320, name: "Sommerurlaub Türkei",                accountId: "acc_visa" },
    { date: yr - 9 + "-08-02", type: "ausgabe",  amount: 480,  name: "Mietwagen Türkei",                   accountId: "acc_visa" },
    { date: yr - 9 + "-12-05", type: "einnahme", amount: 1600, name: "Weihnachtsgeld",                     accountId: "acc_giro" },
    { date: yr - 9 + "-12-20", type: "ausgabe",  amount: 390,  name: "Weihnachtsgeschenke",                accountId: "acc_visa" },

    // ── yr-8 ─────────────────────────────────────────
    { date: yr - 8 + "-04-10", type: "einnahme", amount: 970,  name: "Steuerrückerstattung " + (yr - 9),  accountId: "acc_giro" },
    { date: yr - 8 + "-05-18", type: "ausgabe",  amount: 820,  name: "Sofa + Couchtisch IKEA",             accountId: "acc_giro" },
    { date: yr - 8 + "-08-05", type: "ausgabe",  amount: 1540, name: "Sommerurlaub Barcelona",             accountId: "acc_visa" },
    { date: yr - 8 + "-12-05", type: "einnahme", amount: 1750, name: "Weihnachtsgeld",                     accountId: "acc_giro" },
    { date: yr - 8 + "-12-22", type: "ausgabe",  amount: 460,  name: "Weihnachtsgeschenke",                accountId: "acc_visa" },

    // ── yr-7 (Schwangerschaft) ────────────────────────
    { date: yr - 7 + "-02-10", type: "ausgabe",  amount: 380,  name: "Brille + Sehtest",                   accountId: "acc_visa" },
    { date: yr - 7 + "-06-15", type: "einnahme", amount: 1050, name: "Steuerrückerstattung " + (yr - 8),  accountId: "acc_giro" },
    { date: yr - 7 + "-07-08", type: "ausgabe",  amount: 1780, name: "Sommerurlaub Italien",               accountId: "acc_visa" },
    { date: yr - 7 + "-09-22", type: "ausgabe",  amount: 340,  name: "Winterreifen + Montage",             accountId: "acc_giro" },
    { date: yr - 7 + "-10-05", type: "ausgabe",  amount: 380,  name: "Schwangerschaft Erstausstattung Baby", accountId: "acc_giro" },
    { date: yr - 7 + "-11-20", type: "ausgabe",  amount: 280,  name: "Geburtsvorbereitungskurs + Hebamme", accountId: "acc_giro" },
    { date: yr - 7 + "-12-05", type: "einnahme", amount: 1900, name: "Weihnachtsgeld",                     accountId: "acc_giro" },
    { date: yr - 7 + "-12-20", type: "ausgabe",  amount: 430,  name: "Weihnachtsgeschenke",                accountId: "acc_visa" },

    // ── yr-6 — COVID-Jahr + Kind geboren ─────────────
    { date: yr - 6 + "-01-15", type: "ausgabe",  amount: 1280, name: "Kinderwagen Bugaboo Fox",            accountId: "acc_giro" },
    { date: yr - 6 + "-01-20", type: "ausgabe",  amount: 840,  name: "Babymöbel Bett + Wickelkommode",     accountId: "acc_giro" },
    { date: yr - 6 + "-02-01", type: "ausgabe",  amount: 520,  name: "Babyerstausstattung Erstlingsset",   accountId: "acc_giro" },
    { date: yr - 6 + "-02-15", type: "einnahme", amount: 1800, name: "Elterngeld Basis Monat 1",           accountId: "acc_giro" },
    { date: yr - 6 + "-03-15", type: "einnahme", amount: 1800, name: "Elterngeld Basis Monat 2",           accountId: "acc_giro" },
    { date: yr - 6 + "-03-20", type: "ausgabe",  amount: 620,  name: "Homeoffice Monitor Dell",            accountId: "acc_giro" },
    { date: yr - 6 + "-04-12", type: "ausgabe",  amount: 480,  name: "Bürostuhl ergonomisch",              accountId: "acc_giro" },
    { date: yr - 6 + "-06-08", type: "einnahme", amount: 760,  name: "Steuerrückerstattung " + (yr - 7),  accountId: "acc_giro" },
    { date: yr - 6 + "-08-14", type: "einnahme", amount: 500,  name: "Homeoffice-Pauschale AG",            accountId: "acc_giro" },
    { date: yr - 6 + "-12-05", type: "einnahme", amount: 2100, name: "Weihnachtsgeld",                     accountId: "acc_giro" },
    { date: yr - 6 + "-12-21", type: "ausgabe",  amount: 380,  name: "Weihnachtsgeschenke",                accountId: "acc_visa" },

    // ── yr-5 (KiTa-Start) ────────────────────────────
    { date: yr - 5 + "-04-15", type: "einnahme", amount: 1200, name: "Elterngeld Plus letzte Tranche",     accountId: "acc_giro" },
    { date: yr - 5 + "-07-12", type: "einnahme", amount: 1240, name: "Steuerrückerstattung " + (yr - 6),  accountId: "acc_giro" },
    { date: yr - 5 + "-08-03", type: "ausgabe",  amount: 1850, name: "Sommerurlaub Mallorca",              accountId: "acc_visa" },
    { date: yr - 5 + "-08-15", type: "ausgabe",  amount: 620,  name: "Mietwagen + Aktivitäten Mallorca",   accountId: "acc_visa" },
    { date: yr - 5 + "-09-05", type: "ausgabe",  amount: 680,  name: "KiTa Erstausstattung + Kita-Tasche", accountId: "acc_giro" },
    { date: yr - 5 + "-12-05", type: "einnahme", amount: 2050, name: "Weihnachtsgeld",                     accountId: "acc_giro" },
    { date: yr - 5 + "-12-18", type: "ausgabe",  amount: 510,  name: "Weihnachtsgeschenke",                accountId: "acc_visa" },

    // ── yr-4 ─────────────────────────────────────────
    { date: yr - 4 + "-03-08", type: "ausgabe",  amount: 1480, name: "Autoreparatur Getriebe VW",          accountId: "acc_giro" },
    { date: yr - 4 + "-05-20", type: "ausgabe",  amount: 380,  name: "Kinderfahrrad + Helm + Zubehör",     accountId: "acc_giro" },
    { date: yr - 4 + "-06-22", type: "einnahme", amount: 890,  name: "Steuerrückerstattung " + (yr - 5),  accountId: "acc_giro" },
    { date: yr - 4 + "-07-20", type: "ausgabe",  amount: 1420, name: "Sommerurlaub Portugal",              accountId: "acc_visa" },
    { date: yr - 4 + "-12-05", type: "einnahme", amount: 2200, name: "Weihnachtsgeld",                     accountId: "acc_giro" },
    { date: yr - 4 + "-12-19", type: "ausgabe",  amount: 580,  name: "Weihnachtsgeschenke",                accountId: "acc_visa" },

    // ── yr-3 ─────────────────────────────────────────
    { date: yr - 3 + "-03-10", type: "ausgabe",  amount: 390,  name: "Strom-Nachzahlung Jahresabrechnung", accountId: "acc_giro" },
    { date: yr - 3 + "-06-22", type: "einnahme", amount: 1060, name: "Steuerrückerstattung " + (yr - 4),  accountId: "acc_giro" },
    { date: yr - 3 + "-08-10", type: "ausgabe",  amount: 2100, name: "Sommerurlaub Griechenland",          accountId: "acc_visa" },
    { date: yr - 3 + "-08-20", type: "ausgabe",  amount: 340,  name: "Reiseapotheke & Gepäck",             accountId: "acc_visa" },
    { date: yr - 3 + "-10-15", type: "ausgabe",  amount: 1199, name: "iPhone 15",                          accountId: "acc_visa" },
    { date: yr - 3 + "-12-05", type: "einnahme", amount: 2300, name: "Weihnachtsgeld",                     accountId: "acc_giro" },
    { date: yr - 3 + "-12-20", type: "ausgabe",  amount: 640,  name: "Weihnachtsgeschenke",                accountId: "acc_visa" },

    // ── yr-2 ─────────────────────────────────────────
    { date: yr - 2 + "-01-14", type: "ausgabe",  amount: 749,  name: "Waschmaschine Bosch",                accountId: "acc_giro" },
    { date: yr - 2 + "-03-20", type: "ausgabe",  amount: 430,  name: "Strom-Nachzahlung Jahresabrechnung", accountId: "acc_giro" },
    { date: yr - 2 + "-07-05", type: "einnahme", amount: 1120, name: "Steuerrückerstattung " + (yr - 3),  accountId: "acc_giro" },
    { date: yr - 2 + "-09-03", type: "ausgabe",  amount: 1299, name: "MacBook Air M2",                     accountId: "acc_visa" },
    { date: yr - 2 + "-11-15", type: "ausgabe",  amount: 980,  name: "Zahnarzt Krone",                     accountId: "acc_visa" },
    { date: yr - 2 + "-11-28", type: "ausgabe",  amount: 210,  name: "Zahnarzt Nachsorge",                 accountId: "acc_visa" },
    { date: yr - 2 + "-12-05", type: "einnahme", amount: 2400, name: "Weihnachtsgeld",                     accountId: "acc_giro" },
    { date: yr - 2 + "-12-18", type: "ausgabe",  amount: 680,  name: "Weihnachtsgeschenke",                accountId: "acc_visa" },

    // ── yr-1 ─────────────────────────────────────────
    { date: yr - 1 + "-02-14", type: "ausgabe",  amount: 180,  name: "Valentinstag Restaurant",            accountId: "acc_visa" },
    { date: yr - 1 + "-03-20", type: "ausgabe",  amount: 390,  name: "Strom-Nachzahlung Jahresabrechnung", accountId: "acc_giro" },
    { date: yr - 1 + "-07-05", type: "einnahme", amount: 1120, name: "Steuerrückerstattung " + (yr - 2),  accountId: "acc_giro" },
    { date: yr - 1 + "-07-20", type: "ausgabe",  amount: 1650, name: "Sommerurlaub Kroatien",              accountId: "acc_visa" },
    { date: yr - 1 + "-08-10", type: "ausgabe",  amount: 320,  name: "Ausflüge + Gepäck Kroatien",         accountId: "acc_visa" },
    { date: yr - 1 + "-10-20", type: "ausgabe",  amount: 560,  name: "Winterreifen Wechsel",               accountId: "acc_giro" },
    { date: yr - 1 + "-12-05", type: "einnahme", amount: 2500, name: "Weihnachtsgeld",                     accountId: "acc_giro" },
    { date: yr - 1 + "-12-19", type: "ausgabe",  amount: 720,  name: "Weihnachtsgeschenke",                accountId: "acc_visa" },

    // ── yr (laufendes Jahr) ───────────────────────────
    { date: yr + "-01-18", type: "ausgabe",  amount: 520,  name: "Winterreifen Wechsel",                   accountId: "acc_giro" },
    { date: yr + "-02-14", type: "ausgabe",  amount: 190,  name: "Valentinstag Restaurant",                accountId: "acc_visa" },
    { date: yr + "-03-01", type: "einnahme", amount: 350,  name: "Nebenjob Freelance März",                accountId: "acc_giro" },
    { date: yr + "-03-20", type: "ausgabe",  amount: 410,  name: "Strom-Nachzahlung Jahresabrechnung",     accountId: "acc_giro" },
    { date: yr + "-04-15", type: "einnahme", amount: 1080, name: "Steuerrückerstattung " + (yr - 1),       accountId: "acc_giro" },
    { date: yr + "-04-22", type: "ausgabe",  amount: 240,  name: "Zahnarzt Kontrolluntersuchung",          accountId: "acc_visa" },
    { date: yr + "-05-03", type: "einnahme", amount: 420,  name: "Nebenjob Freelance April",               accountId: "acc_giro" },
  ].filter(e => e.date <= iso(now));

  S.bookings = oneOffs.map((e, idx) => ({
    id: "bk_seed_" + idx,
    postenId: null,
    transferId: null,
    date: e.date,
    monthKey: _mk(e.date),
    name: e.name,
    type: e.type,
    amount: e.amount,
    baseAmount: e.amount,
    accountId: e.accountId,
    status: "gebucht",
    note: "",
    interval: "einmalig",
  }));

  S.goals = [
    {
      id: "g1",
      name: "Notgroschen (3×Gehalt)",
      icon: "🛡️",
      color: "#4d9eff",
      targetAmount: 8550.0,
      currentAmount: 6850.0,
      monthlyRate: 200.0,
      deadline: yr + "-12-31",
      note: "3 Nettogehälter als eiserne Reserve",
    },
    {
      id: "g2",
      name: "Sommerurlaub " + yr,
      icon: "✈️",
      color: "#00e5a0",
      targetAmount: 2400.0,
      currentAmount: 1560.0,
      monthlyRate: 300.0,
      deadline: yr + "-07-01",
      note: "Griechenland · 2 Wochen",
    },
    {
      id: "g3",
      name: "Neues Auto",
      icon: "🚗",
      color: "#ffb547",
      targetAmount: 18000.0,
      currentAmount: 5200.0,
      monthlyRate: 400.0,
      deadline: yr + 3 + "-01-01",
      note: "Nach Ablauf Kredit (2028)",
    },
    {
      id: "g4",
      name: "Eigenheim Eigenkapital",
      icon: "🏡",
      color: "#7b5fff",
      targetAmount: 50000.0,
      currentAmount: 14300.0,
      monthlyRate: 500.0,
      deadline: yr + 5 + "-01-01",
      note: "20% EK für Kredit ansparen",
    },
    {
      id: "g5",
      name: "Depot Meilenstein 20k",
      icon: "📈",
      color: "#c084fc",
      targetAmount: 20000.0,
      currentAmount: 12840.0,
      monthlyRate: 200.0,
      deadline: yr + 2 + "-01-01",
      note: "ETF MSCI World Langfristziel",
    },
    {
      id: "g6",
      name: "Altersvorsorge Rentendepot",
      icon: "🏦",
      color: "#ff8c42",
      targetAmount: 400000.0,
      currentAmount: 42800.0,
      monthlyRate: 375.0,
      startDate: yr - 14 + "-01-01",
      deadline: yr + 27 + "-01-01",
      note: "Riester + ETF Depot · Ziel 400k bis Renteneintritt mit 65",
    },
  ];

  S.creditors = [
    { id: "cred_vermieter", name: "Hausverwaltung Müller GmbH", email: "verwaltung@mueller-hv.de", phone: "030 12345678", address: "Hauptstr. 12, 10115 Berlin", website: "mueller-hv.de", note: "Warmmiete inkl. NK", color: "#4d9eff", icon: "🏠", logoDomain: "mueller-hv.de" },
    { id: "cred_stadtwerke", name: "Stadtwerke Berlin", email: "service@stadtwerke-berlin.de", phone: "030 800 100 200", address: "Vattenfall-Allee 1, 10243 Berlin", website: "stadtwerke-berlin.de", note: "Strom & Wasser", color: "#ffb547", icon: "⚡", logoDomain: "vattenfall.de" },
    { id: "cred_telekom", name: "Telekom Deutschland", email: "kundencenter@telekom.de", phone: "0800 3301000", address: "Landgrabenweg 151, 53227 Bonn", website: "telekom.de", note: "MagentaZuhause M", color: "#e2001a", icon: "📡", logoDomain: "telekom.de" },
    { id: "cred_o2", name: "O2 Telefónica", email: "service@o2online.de", phone: "0800 1002", address: "Georg-Brauchle-Ring 23-25, 80992 München", website: "o2online.de", note: "Free M Tarif", color: "#0019a5", icon: "📱", logoDomain: "o2online.de" },
    { id: "cred_netflix", name: "Netflix International", email: "", phone: "", address: "", website: "netflix.com", note: "Standard-Abo", color: "#e50914", icon: "🎬", logoDomain: "netflix.com" },
    { id: "cred_spotify", name: "Spotify AB", email: "", phone: "", address: "", website: "spotify.com", note: "Family Plan", color: "#1db954", icon: "🎵", logoDomain: "spotify.com" },
    { id: "cred_amazon", name: "Amazon Europe", email: "", phone: "0800 363 5091", address: "", website: "amazon.de", note: "Prime Mitgliedschaft", color: "#ff9900", icon: "📦", logoDomain: "amazon.de" },
    { id: "cred_apple", name: "Apple Distribution Intl.", email: "", phone: "0800 6645 451", address: "", website: "apple.com", note: "iCloud+ 200 GB", color: "#555555", icon: "🍎", logoDomain: "apple.com" },
    { id: "cred_tk", name: "Techniker Krankenkasse", email: "service@tk.de", phone: "0800 285 85 85", address: "Bramfelder Str. 140, 22305 Hamburg", website: "tk.de", note: "Freiwillig versichert", color: "#006ab3", icon: "💊", logoDomain: "tk.de" },
    { id: "cred_allianz", name: "Allianz Versicherungs-AG", email: "info@allianz.de", phone: "0800 4400101", address: "Königinstr. 28, 80802 München", website: "allianz.de", note: "Haftpflicht + KFZ", color: "#003781", icon: "🛡️", logoDomain: "allianz.de" },
    { id: "cred_adac", name: "ADAC e.V.", email: "", phone: "0800 5101112", address: "Hansastr. 19, 80686 München", website: "adac.de", note: "Classic-Mitglied + Reiseversicherung", color: "#f5c400", icon: "🚗", logoDomain: "adac.de" },
    { id: "cred_vwfs", name: "VW Financial Services AG", email: "kundenservice@vwfs.com", phone: "0531 212 0", address: "Gifhorner Str. 57, 38112 Braunschweig", website: "vwfs.de", note: "Autokredit Golf 8", color: "#1b3d6e", icon: "🚙", logoDomain: "vwfs.de" },
    { id: "cred_bvg", name: "BVG Berliner Verkehrsbetriebe", email: "kundenservice@bvg.de", phone: "030 19449", address: "Holzmarktstr. 15-17, 10179 Berlin", website: "bvg.de", note: "Deutschland-Ticket", color: "#f0b400", icon: "🚌", logoDomain: "bvg.de" },
    { id: "cred_ard", name: "ARD ZDF Deutschlandradio", email: "", phone: "0800 996 8877", address: "Freiheitstr. 14, 53177 Bonn", website: "rundfunkbeitrag.de", note: "GEZ Beitrag vierteljährl.", color: "#cc0000", icon: "📺", logoDomain: "ard.de" },
    { id: "cred_mcfit", name: "McFit GmbH", email: "service@mcfit.com", phone: "0800 400 2020", address: "Harrlachweg 1, 68163 Mannheim", website: "mcfit.com", note: "Filiale Berlin Mitte", color: "#c00000", icon: "💪", logoDomain: "mcfit.com" },
    { id: "cred_physio", name: "PhysioTherapie am Gendarmenmarkt", email: "info@physio-gendarmenmarkt.de", phone: "030 20634512", address: "Markgrafenstr. 34, 10117 Berlin", website: "physio-gendarmenmarkt.de", note: "10er-Karte Massage/KG", color: "#00d4cc", icon: "🏃", logoDomain: "physio-gendarmenmarkt.de" },
    { id: "cred_tr", name: "Trade Republic Bank GmbH", email: "support@traderepublic.com", phone: "", address: "Frankfurter Allee 1, 10247 Berlin", website: "traderepublic.com", note: "Depot MSCI World ETF", color: "#c9f542", icon: "📈", logoDomain: "traderepublic.com" },
    { id: "cred_dkb",     name: "DKB Deutsche Kreditbank AG",   email: "service@dkb.de",              phone: "030 120 300 00",  address: "Taubenstr. 7-9, 10117 Berlin",           website: "dkb.de",              note: "Tagesgeld + Festgeld",              color: "#005a9c", icon: "🏦", logoDomain: "dkb.de",              accountId: "acc_dkb" },
    { id: "cred_kita",    name: "Kita \"Regenbogen\" Berlin e.V.", email: "kita-regenbogen@berlin.de", phone: "030 8820 1234",    address: "Rosenthaler Str. 41, 10178 Berlin",      website: "",                    note: "U3 Krippe + KiTa-Gruppe",           color: "#ff6b6b", icon: "🌈", logoDomain: "" },
    { id: "cred_riester", name: "Union Investment GmbH",         email: "service@union-investment.de", phone: "0800 555 0 777",  address: "Wiesenhüttenstr. 10, 60329 Frankfurt",   website: "union-investment.de", note: "UniProfiRente Riester-Vertrag",      color: "#00529f", icon: "🔒", logoDomain: "union-investment.de" },
  ];

  // S.bookings wurde oben bereits mit Einmal-Buchungen vorbelegt.
  // initBookings() ergänzt darauf die Fixposten-Serien (Dedup-sicher).
  S.groupOrder = ["Volksbank", "DKB"];
  S.groupAccOrder = {
    Volksbank: ["acc_giro", "acc_visa"],
    DKB: ["acc_dkb", "acc_dkb2"],
  };

  const _seedNow = new Date();
  const _seedMk = `${_seedNow.getFullYear()}-${String(_seedNow.getMonth() + 1).padStart(2, "0")}`;
  sessionStorage.setItem(`csf_budget_warn_${_seedMk}_80`, "1");
  sessionStorage.setItem(`csf_budget_warn_${_seedMk}_100`, "1");

  persist();
}

// ── ID GENERATOR ──────────────────────
function genId(prefix = "id") {
  return (
    prefix +
    "_" +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 6)
  );
}

// ── IBAN FORMATTER ────────────────────
function formatIban(raw) {
  return raw
    .replace(/\s/g, "")
    .toUpperCase()
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function ibanLast4(iban) {
  if (!iban) return "—";
  const clean = iban.replace(/\s/g, "");
  if (clean.length === 0) return "—";
  if (/^\d{12,19}$/.test(clean)) return "•••• •••• •••• " + clean.slice(-4);
  return clean.length >= 4 ? "•••• " + clean.slice(-4) : clean;
}

/** Zeigt Kontonummer/IBAN kontotyp-gerecht an.
 *  depot/vl → "Depot ••XXXX"; kreditkarte → "•••• XXXX"; sonst IBAN-Format */
function _accNumberDisplay(acc) {
  if (!acc) return "";
  const raw = (acc.iban || "").replace(/\s/g, "");
  if (!raw) {
    if (acc.accountType === "kreditkarte" && acc.ccExp) return "Ablauf " + acc.ccExp;
    return "";
  }
  if (acc.accountType === "depot" || acc.accountType === "vl") {
    const last4 = raw.slice(-4);
    return "Depot •" + last4;
  }
  return ibanLast4(raw);
}

// ── MIGRATE STATE ─────────────────────
// Vollständige migrateState() ist in io.js definiert.
// Diese Stub-Funktion ist nur ein Fallback falls io.js noch nicht geladen ist.
if (typeof migrateState === "undefined") {
  window.migrateState = function () {
    if (!Array.isArray(S.bookings)) S.bookings = [];
    if (!Array.isArray(S.groupOrder)) S.groupOrder = [];
    if (!S.groupAccOrder) S.groupAccOrder = {};
    if (!Array.isArray(S.transfers)) S.transfers = [];
    if (!Array.isArray(S.goals)) S.goals = [];
    if (!S.zahltag) S.zahltag = 15;
    if (!Array.isArray(S.closedMonths)) S.closedMonths = [];
    if (!S.yearNotes || typeof S.yearNotes !== "object") S.yearNotes = {};
  };
}

// ── CLEAR USER DATA ───────────────────
// Löscht ALLE Nutzerdaten inklusive Bookings und Transfers.
// Wird von settings.js beim "Alles zurücksetzen" aufgerufen.
// Stellt sicher dass S.bookings immer mitgelöscht wird.
function clearUserData() {
  // Alle Nutzerdaten leeren
  S.data = [];
  S.accounts = [];
  S.transfers = [];
  S.goals = [];
  S.bookings = []; // explizit leeren — renderPosten zeigt sonst alte Einträge
  S.categories = [...DEFAULT_CATEGORIES];
  S.creditors = [];
  S.groupOrder = [];
  S.groupAccOrder = {};
  S.zahltag = 15;
  S.monthlyIncome = 0;
  S.closedMonths = [];
  S.yearNotes = {};

  // Sofort persistieren bevor irgendein Render initBookings() triggert
  persist();

  // UI neu rendern — renderPosten() ruft initBookings() NICHT mehr auf (Fix in umsaetze.js)
  // dadurch bleiben die Bookings nach dem Reset leer
  if (typeof renderDashboard === "function") renderDashboard();
  if (typeof renderPosten === "function") renderPosten();
  if (typeof renderVertraege === "function") renderVertraege();
  if (typeof renderGoals === "function") renderGoals();
  if (typeof renderJahr === "function") renderJahr();
  if (typeof updateContractBadge === "function") updateContractBadge();
}
