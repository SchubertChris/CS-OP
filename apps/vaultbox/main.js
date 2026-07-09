// ══════════════════════════════════════
//  MAIN PROCESS — VaultBox
// ══════════════════════════════════════

const {
  app,
  BrowserWindow,
  Menu,
  shell,
  ipcMain,
  dialog,
} = require("electron");
const path = require("path");
const fs = require("fs");
const { autoUpdater } = require("electron-updater");

// ── PFADE ─────────────────────────────
// DEFAULT_DIR: fester Pointer-Speicherort (AppData)
// CONFIG_FILE: zeigt auf den eigentlichen Datenpfad
// Alle anderen Pfade werden dynamisch über path-Funktionen aufgelöst.

// Legacy-Pfad (alter App-Name) für Migration
const LEGACY_DIR  = path.join(path.dirname(app.getPath("userData")), "candlescope-financeboard");
const DEFAULT_DIR = app.getPath("userData"); // → %APPDATA%/vaultbox
const CONFIG_FILE = path.join(DEFAULT_DIR, "config.json");

let _dataDirCache = null;

function dataDir() {
  if (_dataDirCache) return _dataDirCache;
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const cfg = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
      if (cfg.dataPath && fs.existsSync(cfg.dataPath)) {
        _dataDirCache = cfg.dataPath;
        return _dataDirCache;
      }
    }
  } catch (_) {}
  _dataDirCache = DEFAULT_DIR;
  return _dataDirCache;
}

function archiveDir()      { return path.join(dataDir(), "archive"); }
function stateFile()       { return path.join(dataDir(), "state.json"); }
function settingsFile()    { return path.join(dataDir(), "settings.json"); }
function safepointsDir()   { return path.join(dataDir(), "safepoints"); }
function visionboardFile() { return path.join(dataDir(), "visionboards.json"); }
function indexFile()       { return path.join(archiveDir(), "main.json"); }

/** Sicherer Pfad-Join: verhindert Path-Traversal aus dem Archive-Verzeichnis */
function safeArchivePath(relPath) {
  const ad = archiveDir();
  const resolved = path.resolve(ad, relPath);
  if (!resolved.startsWith(ad + path.sep) && resolved !== ad) return null;
  return resolved;
}

// Nur diese Endungen dürfen extern geöffnet werden. shell.openPath() FÜHRT
// ausführbare/aktive Typen aus (.exe/.bat/.lnk/.html/.svg/.scr …) — auch wenn
// sie im Archiv liegen (per Drag&Drop einschleusbar). Daher harte Allowlist.
const ARCHIVE_OPEN_ALLOWED_EXT = new Set([
  "pdf",
  "png", "jpg", "jpeg", "webp", "gif", "bmp", "tiff", "tif",
  "txt", "md", "rtf",
  "doc", "docx", "xls", "xlsx", "ppt", "pptx", "odt", "ods", "odp",
]);

// Löst einen Archiv-relPath zu einer realen, im Archiv eingeschlossenen,
// gefahrlos extern zu öffnenden Datei auf — oder gibt einen Fehler zurück.
// Vertraut KEINEM Renderer-Pfad: Containment vor UND nach Symlink-Auflösung
// (ein Symlink im Archiv könnte sonst aus dem Archiv herauszeigen).
function resolveOpenableArchiveFile(relPath) {
  if (typeof relPath !== "string" || !relPath) return { error: "Ungültig" };

  const candidate = safeArchivePath(relPath);
  if (!candidate || !fs.existsSync(candidate)) return { error: "Nicht gefunden" };

  let realFile, realRoot;
  try {
    realFile = fs.realpathSync(candidate);
    realRoot = fs.realpathSync(archiveDir());
  } catch (_) {
    return { error: "Nicht gefunden" };
  }
  if (realFile !== realRoot && !realFile.startsWith(realRoot + path.sep))
    return { error: "Außerhalb des Archivs" };

  let st;
  try {
    st = fs.lstatSync(realFile);
  } catch (_) {
    return { error: "Nicht gefunden" };
  }
  if (!st.isFile()) return { error: "Keine Datei" };

  // Endungs-Check auf der ECHTEN Datei (nicht doc.ext — Renderer-gesteuert).
  const ext = path.extname(realFile).replace(".", "").toLowerCase();
  if (!ARCHIVE_OPEN_ALLOWED_EXT.has(ext))
    return { error: "Dateityp nicht erlaubt: ." + (ext || "?") };

  return { path: realFile };
}

// ── ORDNER-TEMPLATE ───────────────────
//  archive/
//  ├── main.json               ← Index aller Dokumente
//  ├── verträge/
//  │   └── Fitnessstudio McFit/
//  │       └── vertrag_2025.pdf
//  ├── versicherungen/
//  ├── legi/
//  ├── karten/
//  ├── rechnungen/
//  ├── konten/
//  ├── eingänge/
//  ├── fotos/
//  └── sonstiges/

const ARCHIVE_FOLDERS = [
  "verträge",
  "versicherungen",
  "legi",
  "karten",
  "rechnungen",
  "konten",
  "eingänge",
  "fotos",
  "sonstiges",
];

function ensureDirs() {
  // Einmalige Migration: candlescope-financeboard → vaultbox
  // Läuft nur wenn neuer Pfad leer ist und alter Pfad existiert
  if (fs.existsSync(LEGACY_DIR) && !fs.existsSync(path.join(DEFAULT_DIR, "state.json"))) {
    try {
      fs.mkdirSync(DEFAULT_DIR, { recursive: true });
      const migrate = ["state.json", "settings.json", "visionboards.json", "config.json"];
      migrate.forEach((f) => {
        const src = path.join(LEGACY_DIR, f);
        if (fs.existsSync(src)) fs.copyFileSync(src, path.join(DEFAULT_DIR, f));
      });
      copyDirSync(path.join(LEGACY_DIR, "archive"),    path.join(DEFAULT_DIR, "archive"));
      copyDirSync(path.join(LEGACY_DIR, "safepoints"), path.join(DEFAULT_DIR, "safepoints"));
    } catch (_) {}
  }

  const dd = dataDir();
  const ad = archiveDir();
  const sd = safepointsDir();
  [DEFAULT_DIR, dd, ad, sd].forEach((d) => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  ARCHIVE_FOLDERS.forEach((f) => {
    const p = path.join(ad, f);
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
  });
}

// Ordner für Dokument anlegen: archive/{kategorie}/{refName}/
function getDocDir(category, refName) {
  // Sicherer Ordnername — Sonderzeichen entfernen
  const safeName = (refName || "Allgemein")
    .replace(/[<>:"/\\|?*]/g, "")
    .trim()
    .substring(0, 60);
  const safeCat = (category || "sonstiges")
    .replace(/[<>:"/\\|?*]/g, "")
    .trim()
    .toLowerCase();
  const dir = path.join(archiveDir(), safeCat, safeName);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// Rekursives Verzeichnis-Kopieren (für Datenmigration)
function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ── INDEX ─────────────────────────────
function loadIndex() {
  try {
    const f = indexFile();
    if (!fs.existsSync(f)) return { version: "1.0", docs: [] };
    return JSON.parse(fs.readFileSync(f, "utf8"));
  } catch (e) {
    return { version: "1.0", docs: [] };
  }
}
function saveIndex(index) {
  fs.writeFileSync(indexFile(), JSON.stringify(index, null, 2), "utf8");
}
function addDoc(doc) {
  const idx = loadIndex();
  idx.docs.push(doc);
  saveIndex(idx);
}
function getDocs(filter) {
  const { docs } = loadIndex();
  if (!filter) return docs;
  return docs.filter(
    (d) =>
      (!filter.refId || d.refId === filter.refId) &&
      (!filter.refType || d.refType === filter.refType) &&
      (!filter.category || d.category === filter.category),
  );
}

// ── WINDOW ────────────────────────────
let win;
function createWindow() {
  win = new BrowserWindow({
    width: 1920,
    height: 1080,
    minWidth: 1024,
    minHeight: 640,
    icon: path.join(__dirname, "assets", "favicon.ico"),
    title: "VaultBox",
    backgroundColor: "#080806",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    show: false,
  });
  win.loadFile("index.html");
  win.once("ready-to-show", () => win.show());
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

// ══════════════════════════════════════
//  NODE-KERNMODULE
// ══════════════════════════════════════
const crypto = require("crypto");
const os = require("os");
const Database = require("better-sqlite3-multiple-ciphers"); // liest Klartext-DBs UND SQLCipher

// ══════════════════════════════════════
//  KRYPTO — SQLite FIFO-Engine
// ══════════════════════════════════════
const CRYPTO_DB_FILE = () => path.join(dataDir(), "crypto.db");
let _cryptoDb = null;

function _getCryptoDb() {
  if (_cryptoDb) return _cryptoDb;
  fs.mkdirSync(dataDir(), { recursive: true });
  // Vault aktiv + crypto.db noch Klartext? → jetzt verschlüsseln (Self-Heal,
  // falls die Migration beim Aktivieren fehlschlug).
  if (_dek && fs.existsSync(CRYPTO_DB_FILE())) {
    try {
      const head = fs.readFileSync(CRYPTO_DB_FILE()).slice(0, 16).toString("latin1");
      if (head.startsWith("SQLite format 3")) _migrateCryptoDbToEncrypted();
    } catch (_) {}
  }
  const db = new Database(CRYPTO_DB_FILE());
  if (_dek) {                                        // Vault → verschlüsselt öffnen (SQLCipher)
    db.pragma(`key="x'${vault.dbKeyFromDek(_dek, "crypto.db")}'"`);
    db.pragma("temp_store = MEMORY");                // Temp-Tabellen nie im Klartext auf SSD
  }
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS crypto_tx (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      asset         TEXT    NOT NULL,
      type          TEXT    NOT NULL,
      date          TEXT    NOT NULL,
      amount        REAL    NOT NULL,
      price_eur     REAL    NOT NULL,
      fee_eur       REAL    NOT NULL DEFAULT 0,
      exchange      TEXT,
      note          TEXT,
      created_at    TEXT    DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS fifo_lots (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      tx_id           INTEGER NOT NULL,
      asset           TEXT    NOT NULL,
      date            TEXT    NOT NULL,
      amount_original REAL    NOT NULL,
      amount_remaining REAL   NOT NULL,
      price_eur       REAL    NOT NULL,
      fee_eur         REAL    NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS fifo_matches (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      sell_tx_id      INTEGER NOT NULL,
      buy_tx_id       INTEGER NOT NULL,
      asset           TEXT    NOT NULL,
      amount          REAL    NOT NULL,
      buy_date        TEXT    NOT NULL,
      sell_date       TEXT    NOT NULL,
      buy_price_eur   REAL    NOT NULL,
      sell_price_eur  REAL    NOT NULL,
      buy_fee_eur     REAL    NOT NULL DEFAULT 0,
      sell_fee_eur    REAL    NOT NULL DEFAULT 0,
      gain_eur        REAL    NOT NULL,
      tax_free        INTEGER NOT NULL DEFAULT 0,
      holding_days    INTEGER NOT NULL
    );
  `);
  _cryptoDb = db;
  return db;
}

function _runFifo(db, asset) {
  db.prepare("DELETE FROM fifo_matches WHERE asset = ?").run(asset);
  db.prepare("DELETE FROM fifo_lots WHERE asset = ?").run(asset);

  const buys = db.prepare(
    "SELECT * FROM crypto_tx WHERE asset = ? AND type IN ('buy','transfer_in') ORDER BY date ASC, id ASC"
  ).all(asset);
  for (const b of buys) {
    db.prepare(
      "INSERT INTO fifo_lots (tx_id, asset, date, amount_original, amount_remaining, price_eur, fee_eur) VALUES (?,?,?,?,?,?,?)"
    ).run(b.id, asset, b.date, b.amount, b.amount, b.price_eur, b.fee_eur);
  }

  const sells = db.prepare(
    "SELECT * FROM crypto_tx WHERE asset = ? AND type = 'sell' ORDER BY date ASC, id ASC"
  ).all(asset);

  const updateLot = db.prepare("UPDATE fifo_lots SET amount_remaining = amount_remaining - ? WHERE id = ?");
  const insertMatch = db.prepare(`
    INSERT INTO fifo_matches
      (sell_tx_id, buy_tx_id, asset, amount, buy_date, sell_date,
       buy_price_eur, sell_price_eur, buy_fee_eur, sell_fee_eur, gain_eur, tax_free, holding_days)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
  `);

  for (const sell of sells) {
    let toSell = sell.amount;
    const lots = db.prepare(
      "SELECT * FROM fifo_lots WHERE asset = ? AND amount_remaining > 0.000000001 ORDER BY date ASC, id ASC"
    ).all(asset);

    for (const lot of lots) {
      if (toSell <= 0) break;
      const matched = Math.min(lot.amount_remaining, toSell);
      const buyDate   = new Date(lot.date);
      const sellDate  = new Date(sell.date);
      const holdDays  = Math.round((sellDate - buyDate) / 86400000);
      const taxFree   = holdDays > 365 ? 1 : 0;
      const buyFeeShare  = (matched / lot.amount_original) * lot.fee_eur;
      const sellFeeShare = (matched / sell.amount) * sell.fee_eur;
      const costBasis    = matched * lot.price_eur + buyFeeShare;
      const saleValue    = matched * sell.price_eur - sellFeeShare;
      const gain         = saleValue - costBasis;

      insertMatch.run(
        sell.id, lot.tx_id, asset, matched,
        lot.date, sell.date,
        lot.price_eur, sell.price_eur,
        buyFeeShare, sellFeeShare,
        gain, taxFree, holdDays
      );
      updateLot.run(matched, lot.id);
      toSell -= matched;
    }
  }
}

ipcMain.handle("crypto:addTx", (_e, tx) => {
  const db = _getCryptoDb();
  const stmt = db.prepare(
    "INSERT INTO crypto_tx (asset, type, date, amount, price_eur, fee_eur, exchange, note) VALUES (?,?,?,?,?,?,?,?)"
  );
  const r = stmt.run(
    tx.asset.toUpperCase().trim(), tx.type, tx.date,
    Number(tx.amount), Number(tx.price_eur), Number(tx.fee_eur) || 0,
    tx.exchange || "", tx.note || ""
  );
  _runFifo(db, tx.asset.toUpperCase().trim());
  return { ok: true, id: r.lastInsertRowid };
});

ipcMain.handle("crypto:deleteTx", (_e, id) => {
  const db = _getCryptoDb();
  const row = db.prepare("SELECT asset FROM crypto_tx WHERE id = ?").get(id);
  if (!row) return { ok: false };
  db.prepare("DELETE FROM crypto_tx WHERE id = ?").run(id);
  _runFifo(db, row.asset);
  return { ok: true };
});

ipcMain.handle("crypto:getTxs", (_e, asset) => {
  const db = _getCryptoDb();
  if (asset) return db.prepare("SELECT * FROM crypto_tx WHERE asset = ? ORDER BY date DESC, id DESC").all(asset);
  return db.prepare("SELECT * FROM crypto_tx ORDER BY date DESC, id DESC").all();
});

ipcMain.handle("crypto:getAssets", () => {
  const db = _getCryptoDb();
  const rows = db.prepare(
    "SELECT asset, SUM(CASE WHEN type IN ('buy','transfer_in') THEN amount ELSE 0 END) - SUM(CASE WHEN type IN ('sell','transfer_out') THEN amount ELSE 0 END) AS holding FROM crypto_tx GROUP BY asset ORDER BY asset"
  ).all();
  return rows;
});

ipcMain.handle("crypto:getReport", (_e, asset, year) => {
  const db = _getCryptoDb();
  let q = "SELECT * FROM fifo_matches WHERE 1=1";
  const params = [];
  if (asset) { q += " AND asset = ?"; params.push(asset); }
  if (year)  { q += " AND substr(sell_date,1,4) = ?"; params.push(String(year)); }
  q += " ORDER BY sell_date ASC";
  const matches = db.prepare(q).all(...params);
  const taxable = matches.filter(m => !m.tax_free);
  const taxFree = matches.filter(m =>  m.tax_free);
  return {
    matches,
    summary: {
      taxableGain:    taxable.filter(m => m.gain_eur >= 0).reduce((s,m) => s + m.gain_eur, 0),
      taxableLoss:    taxable.filter(m => m.gain_eur <  0).reduce((s,m) => s + m.gain_eur, 0),
      taxFreeGain:    taxFree.filter(m =>  m.gain_eur >= 0).reduce((s,m) => s + m.gain_eur, 0),
      taxFreeLoss:    taxFree.filter(m =>  m.gain_eur <  0).reduce((s,m) => s + m.gain_eur, 0),
      totalTaxable:   taxable.reduce((s,m) => s + m.gain_eur, 0),
    }
  };
});

ipcMain.handle("crypto:importCsv", (_e, csvText, mappings) => {
  const db = _getCryptoDb();
  const lines = csvText.trim().split(/\r?\n/);
  const header = lines[0].split(mappings.delimiter || ",").map(h => h.trim().replace(/^"|"$/g, ""));
  const col = (name) => header.indexOf(name);
  let imported = 0, errors = 0;
  const stmt = db.prepare(
    "INSERT INTO crypto_tx (asset, type, date, amount, price_eur, fee_eur, exchange, note) VALUES (?,?,?,?,?,?,?,?)"
  );
  const affectedAssets = new Set();
  for (let i = 1; i < lines.length; i++) {
    try {
      const fields = lines[i].split(mappings.delimiter || ",").map(f => f.trim().replace(/^"|"$/g, ""));
      const asset     = (fields[col(mappings.asset)] || "").toUpperCase().trim();
      const type      = (fields[col(mappings.type)] || "buy").toLowerCase();
      const date      = fields[col(mappings.date)] || "";
      const amount    = parseFloat(fields[col(mappings.amount)]) || 0;
      const price_eur = parseFloat(fields[col(mappings.price_eur)]) || 0;
      const fee_eur   = parseFloat(fields[col(mappings.fee_eur)] || 0) || 0;
      if (!asset || !date || amount <= 0) { errors++; continue; }
      stmt.run(asset, type, date, amount, price_eur, fee_eur, mappings.exchange || "", "CSV-Import");
      affectedAssets.add(asset);
      imported++;
    } catch { errors++; }
  }
  for (const a of affectedAssets) _runFifo(db, a);
  return { ok: true, imported, errors };
});

const LICENSE_FILE = () => path.join(DEFAULT_DIR, "license.json");
const LICENSE_STATE_FILE = () => path.join(DEFAULT_DIR, "license.state.json");

// ══════════════════════════════════════
//  LIZENZ — Abo: Ed25519 + Geräte-Bindung + Ablauf
// ══════════════════════════════════════
// Öffentlicher Schlüssel: kann Lizenzen nur PRÜFEN, niemals signieren/fälschen.
// Gefahrlos im (öffentlichen) Quellcode. Der PRIVATE Schlüssel signiert die
// Lizenzen auf DEINEM Server und verlässt ihn nie.
// → Einmalig erzeugen:  node tools/gen-license-keys.js  → PUBLIC KEY hier einsetzen.
const LICENSE_PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
HIER_PUBLIC_KEY_EINSETZEN
-----END PUBLIC KEY-----`;

// Dein Erneuerungs-Endpoint: bekommt { machineId, licenseId, email }, prüft den
// Zahlungsstatus (Stripe/LemonSqueezy) und gibt bei aktivem Abo eine frische,
// signierte Lizenz { payload, signature } mit neuem validUntil zurück.
// Leer lassen = keine Auto-Erneuerung (App nutzt nur die lokale Lizenz).
const LICENSE_RENEW_URL = "";
const RENEW_LINK = "https://vaultbox.app/abo"; // Kunden-Link auf dem Sperrbildschirm

const DAY_MS = 24 * 60 * 60 * 1000;
const GRACE_DAYS = 14;        // Offline-Toleranz NACH Ablauf (kein Lockout bei kurzem Netz-Aus)
const RENEW_WINDOW_DAYS = 7;  // so viele Tage VOR Ablauf wird im Hintergrund erneuert
const CLOCK_SKEW_MS = DAY_MS; // 1 Tag Toleranz für Rollback-Erkennung

let _licensePubKeyCache;
function _licensePublicKey() {
  if (_licensePubKeyCache !== undefined) return _licensePubKeyCache;
  try {
    _licensePubKeyCache = LICENSE_PUBLIC_KEY_PEM.includes("HIER_PUBLIC_KEY_EINSETZEN")
      ? null
      : crypto.createPublicKey(LICENSE_PUBLIC_KEY_PEM);
  } catch (_) {
    _licensePubKeyCache = null;
  }
  return _licensePubKeyCache;
}

// Hardware-/Geräte-ID. Bevorzugt node-machine-id (stabile OS-Maschinen-GUID),
// sonst dependency-freier os-Komposit-Hash als Fallback.
// EHRLICH: jede client-seitige ID ist fälschbar — das erschwert Sharing, macht
// es nicht unmöglich. Der echte Gate ist das server-signierte validUntil.
let _machineIdLib = null;
try { _machineIdLib = require("node-machine-id"); } catch (_) {}
let _machineIdCache;
function _getMachineId() {
  if (_machineIdCache) return _machineIdCache;
  try {
    if (_machineIdLib && _machineIdLib.machineIdSync) {
      const raw = _machineIdLib.machineIdSync({ original: true });
      _machineIdCache = crypto.createHash("sha256").update(String(raw)).digest("hex").slice(0, 32);
      return _machineIdCache;
    }
  } catch (_) {}
  try {
    const macs = [];
    const ifaces = os.networkInterfaces();
    for (const name of Object.keys(ifaces)) {
      for (const iface of ifaces[name] || []) {
        if (!iface.internal && iface.mac && iface.mac !== "00:00:00:00:00:00") macs.push(iface.mac);
      }
    }
    macs.sort();
    const cpu = (os.cpus()[0] || {}).model || "";
    const raw = [os.hostname(), os.platform(), os.arch(), cpu, macs.join(",")].join("|");
    _machineIdCache = crypto.createHash("sha256").update(raw).digest("hex").slice(0, 32);
  } catch (_) {
    _machineIdCache = crypto.createHash("sha256").update(String(os.hostname() || "vaultbox")).digest("hex").slice(0, 32);
  }
  return _machineIdCache;
}

// Prüft eine signierte Lizenz gegen Gerät + Ablaufdatum.
// license.json = { payload: "<exakter signierter JSON-String>", signature: "<base64>" }
// payload (geparst) = { machineId, validUntil, email, tier, licenseId, issuedAt }
// Signatur wird über die EXAKTEN payload-Bytes geprüft (keine Reihenfolge-Fragilität).
function verifyLicense(licenseObj, machineId, nowMs) {
  try {
    const pub = _licensePublicKey();
    if (!pub) return { valid: false, reason: "no-public-key" };
    if (!licenseObj || typeof licenseObj.payload !== "string" || !licenseObj.signature)
      return { valid: false, reason: "malformed" };

    const ok = crypto.verify(
      null,
      Buffer.from(licenseObj.payload, "utf8"),
      pub,
      Buffer.from(licenseObj.signature, "base64"),
    );
    if (!ok) return { valid: false, reason: "signature" };

    const p = JSON.parse(licenseObj.payload);
    if (p.machineId && p.machineId !== machineId) return { valid: false, reason: "wrong-device" };

    const now = nowMs || Date.now();

    // Hybrid-Modell: Perpetual (Einmalkauf) + Owner überspringen den Ablauf-Check;
    // nur Abo-Tiers ("sub"/"subscription") werden gegen validUntil geprüft.
    if (p.tier === "owner" || p.tier === "perpetual")
      return { valid: true, state: "active", owner: p.tier === "owner", tier: p.tier, email: p.email || "", validUntil: null, daysLeft: null };

    const until = p.validUntil ? new Date(p.validUntil).getTime() : 0;
    if (!until || isNaN(until)) return { valid: false, reason: "no-expiry" };

    if (now <= until)
      return { valid: true, state: "active", owner: false, tier: p.tier || "subscription", email: p.email || "", validUntil: p.validUntil, daysLeft: Math.ceil((until - now) / DAY_MS) };

    if (now <= until + GRACE_DAYS * DAY_MS)
      return { valid: true, state: "grace", owner: false, tier: p.tier || "subscription", email: p.email || "", validUntil: p.validUntil, graceLeft: Math.ceil((until + GRACE_DAYS * DAY_MS - now) / DAY_MS) };

    return { valid: false, reason: "expired", validUntil: p.validUntil };
  } catch (_) {
    return { valid: false, reason: "error" };
  }
}

function _readLicenseFile() {
  try { return JSON.parse(fs.readFileSync(LICENSE_FILE(), "utf8")); } catch (_) { return null; }
}
function _readLicenseState() {
  try { return JSON.parse(fs.readFileSync(LICENSE_STATE_FILE(), "utf8")); } catch (_) { return {}; }
}
function _writeLicenseState(s) {
  try { fs.mkdirSync(DEFAULT_DIR, { recursive: true }); fs.writeFileSync(LICENSE_STATE_FILE(), JSON.stringify(s), "utf8"); } catch (_) {}
}

// Online-Erneuerung: holt eine frische signierte Lizenz vom Server — mit Timeout,
// damit ein hängender Server den Start nicht blockiert. Schreibt + gibt die neue
// Lizenz zurück, oder null bei Offline/Fehlschlag/inaktivem Abo.
async function _tryRenewLicense(machineId, currentLic) {
  if (!LICENSE_RENEW_URL) return null;
  let email = "", licenseId = "";
  if (currentLic) {
    try { const p = JSON.parse(currentLic.payload); email = p.email || ""; licenseId = p.licenseId || ""; } catch (_) {}
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);
  try {
    const resp = await fetch(LICENSE_RENEW_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ machineId, licenseId, email }),
      signal: ctrl.signal,
    });
    if (!resp.ok) return null;
    const fresh = await resp.json();
    if (!fresh || typeof fresh.payload !== "string" || !fresh.signature) return null;
    if (!verifyLicense(fresh, machineId, Date.now()).valid) return null;
    fs.mkdirSync(DEFAULT_DIR, { recursive: true });
    fs.writeFileSync(LICENSE_FILE(), JSON.stringify(fresh, null, 2), "utf8");
    return fresh;
  } catch (_) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Unumgehbarer Sperrbildschirm: lädt statisches HTML (eigene strenge CSP, kein
// Script) in ein eigenes Fenster — die App selbst wird nie geladen.
function showLockScreen(message, link) {
  const w = new BrowserWindow({
    width: 760, height: 540, resizable: false, fullscreenable: false,
    title: "VaultBox", backgroundColor: "#080806", autoHideMenuBar: true,
    webPreferences: { nodeIntegration: false, contextIsolation: true },
  });
  const msg = String(message || "").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));
  const href = String(link || RENEW_LINK).replace(/"/g, "%22");
  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';">
<title>VaultBox</title></head>
<body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;font-family:Segoe UI,Arial,sans-serif;background:#080806;color:#e8e4da">
<div style="max-width:460px;text-align:center;padding:32px">
<div style="font-size:42px;margin-bottom:18px">🔒</div>
<h1 style="font-size:21px;margin:0 0 12px;color:#d4a843">VaultBox ist gesperrt</h1>
<p style="font-size:14px;line-height:1.6;color:#b8b2a6;margin:0 0 24px">${msg}</p>
<a href="${href}" target="_blank" style="display:inline-block;background:#d4a843;color:#080806;text-decoration:none;font-weight:600;padding:11px 22px;border-radius:8px;font-size:14px">Abo erneuern</a>
</div></body></html>`;
  w.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(html));
  w.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: "deny" }; });
  return w;
}

// Start-Gate: entscheidet App-Fenster vs. Sperrbildschirm.
// Fail-open bei unerwartetem Fehler: ein Lizenz-Bug darf eine Finanz-App NIE
// bricken (das wäre schlimmer als eine umgangene Prüfung).
async function gateStartup() {
  try {
    // Dev (npm run dev) immer offen — erreicht ausgelieferte Builds nie.
    if (!app.isPackaged) return createWindow();
    // Lizenzsystem nicht konfiguriert (kein Public Key) → starten + warnen,
    // statt jede Installation zu bricken. Vor dem Release Key setzen!
    if (!_licensePublicKey()) {
      console.warn("[Lizenz] LICENSE_PUBLIC_KEY nicht gesetzt — Prüfung übersprungen.");
      return createWindow();
    }

    const machineId = _getMachineId();
    const now = Date.now();
    const st = _readLicenseState();
    const clockSuspect = st.lastSeen && now + CLOCK_SKEW_MS < st.lastSeen;

    let lic = _readLicenseFile();
    let res = lic ? verifyLicense(lic, machineId, now) : { valid: false, reason: "none" };

    const needRenew =
      clockSuspect ||
      !res.valid ||
      res.state === "grace" ||
      (res.valid && typeof res.daysLeft === "number" && res.daysLeft <= RENEW_WINDOW_DAYS);
    if (needRenew) {
      const renewed = await _tryRenewLicense(machineId, lic);
      if (renewed) { lic = renewed; res = verifyLicense(lic, machineId, Date.now()); }
    }

    _writeLicenseState({ ...st, lastSeen: Math.max(st.lastSeen || 0, now) });

    // Uhr zurückgedreht UND kein frisch online-bestätigtes aktives Abo → sperren
    // mit Zwang zur Online-Revalidierung. KEIN dauerhaftes Bricken: false-positives
    // (Zeitzone, leere CMOS-Batterie, Dual-Boot) würden sonst zahlende Kunden aussperren.
    if (clockSuspect && !(res.valid && res.state === "active")) {
      return showLockScreen("Mögliche Systemzeit-Manipulation erkannt. Bitte mit aktiver Internetverbindung neu validieren.", RENEW_LINK);
    }

    if (!res.valid) {
      const msg =
        res.reason === "expired" ? "Dein Abo ist abgelaufen. Bitte erneuere deine Zahlung, um VaultBox weiter zu nutzen."
        : res.reason === "wrong-device" ? "Diese Lizenz ist an ein anderes Gerät gebunden. Pro Lizenz ist ein Gerät erlaubt."
        : "Keine gültige Lizenz gefunden. Bitte aktiviere dein VaultBox-Abo.";
      return showLockScreen(msg, RENEW_LINK);
    }

    createWindow();
  } catch (e) {
    console.error("[Lizenz] Gate-Fehler — starte App (fail-open):", e);
    createWindow();
  }
}

ipcMain.handle("license:check", () => {
  if (!app.isPackaged) return { valid: true, owner: true, tier: "owner", state: "active" };
  const lic = _readLicenseFile();
  if (!lic) return { valid: false, reason: "none" };
  return verifyLicense(lic, _getMachineId(), Date.now());
});

// Geräte-ID für die Aktivierung: Käufer schickt sie dir → du signierst eine an
// genau dieses Gerät gebundene Abo-Lizenz (node tools/issue-license.js).
ipcMain.handle("license:machineId", () => _getMachineId());

// Signierte Lizenz aktivieren (vom Käufer eingefügt oder per Renew abgerufen).
ipcMain.handle("license:activate", async (_e, rawLicense) => {
  try {
    const licenseObj = typeof rawLicense === "string" ? JSON.parse(rawLicense) : rawLicense;
    const res = verifyLicense(licenseObj, _getMachineId(), Date.now());
    if (!res.valid) {
      const map = {
        signature: "Lizenz ungültig oder manipuliert.",
        expired: "Lizenz ist bereits abgelaufen.",
        "wrong-device": "Diese Lizenz ist an ein anderes Gerät gebunden.",
        "no-public-key": "Lizenzsystem nicht konfiguriert.",
        "no-expiry": "Lizenz ohne gültiges Ablaufdatum.",
        malformed: "Lizenzdatei fehlerhaft.",
      };
      return { ok: false, error: map[res.reason] || "Lizenz konnte nicht verifiziert werden." };
    }
    fs.mkdirSync(DEFAULT_DIR, { recursive: true });
    fs.writeFileSync(LICENSE_FILE(), JSON.stringify(licenseObj, null, 2), "utf8");
    return { ok: true, tier: res.tier, validUntil: res.validUntil || null };
  } catch (_) {
    return { ok: false, error: "Lizenz konnte nicht gelesen werden." };
  }
});

// Manuelle Erneuerung (Button in den Einstellungen).
ipcMain.handle("license:renew", async () => {
  const machineId = _getMachineId();
  const renewed = await _tryRenewLicense(machineId, _readLicenseFile());
  if (!renewed) return { ok: false, error: "Erneuerung fehlgeschlagen (offline oder Abo inaktiv)." };
  const res = verifyLicense(renewed, machineId, Date.now());
  return { ok: true, validUntil: res.validUntil || null };
});

ipcMain.handle("license:info", () => {
  const lic = _readLicenseFile();
  if (!lic) return null;
  try {
    const p = JSON.parse(lic.payload);
    return { email: p.email || "", tier: p.tier || "subscription", validUntil: p.validUntil || null, issuedAt: p.issuedAt || null };
  } catch (_) {
    return null;
  }
});

// ══════════════════════════════════════
//  PASSWORT — scrypt statt SHA-256
// ══════════════════════════════════════
ipcMain.handle("pw:hash", (_e, password) => {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.scrypt(password, salt, 64, (err, derived) => {
      if (err) reject(err);
      else resolve("scrypt$" + salt + "$" + derived.toString("hex"));
    });
  });
});

ipcMain.handle("pw:verify", (_e, password, stored) => {
  if (!stored || !stored.startsWith("scrypt$")) {
    const hash = crypto.createHash("sha256").update(password).digest("hex");
    return Promise.resolve(hash === stored);
  }
  const parts = stored.split("$");
  const salt  = parts[1];
  const key   = parts[2];
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derived) => {
      if (err) reject(err);
      else resolve(derived.toString("hex") === key);
    });
  });
});

// ══════════════════════════════════════
//  VAULT — Zero-Knowledge Verschlüsselung
// ══════════════════════════════════════
const vault = require("./crypto-vault");
const VAULT_FILE = () => path.join(dataDir(), "vault.enc");

let _dek = null;       // Datenschlüssel — NUR Main-RAM, gesetzt bei vault:unlock
let _vaultEnv = null;  // aktueller Header (Envelope) im RAM

function _vaultExists() { return fs.existsSync(VAULT_FILE()); }
function _readVault()  { return JSON.parse(fs.readFileSync(VAULT_FILE(), "utf8")); }
function _writeVault(env) {
  const target = VAULT_FILE(), tmp = target + ".tmp";
  fs.mkdirSync(dataDir(), { recursive: true });
  fs.writeFileSync(tmp, JSON.stringify(env), "utf8");
  fs.renameSync(tmp, target);
}

ipcMain.handle("vault:status", () => ({ exists: _vaultExists(), unlocked: !!_dek }));

ipcMain.handle("vault:create", async (_e, password, stateObj) => {
  try {
    if (_vaultExists()) return { ok: false, error: "Vault existiert bereits." };
    if (!password || String(password).length < 8) return { ok: false, error: "Passwort zu kurz (min. 8 Zeichen)." };
    const { envelope, dek, recoveryCode } = await vault.createVault(password, JSON.stringify(stateObj || {}));
    _writeVault(envelope); _vaultEnv = envelope; _dek = dek;
    return { ok: true, recoveryCode };   // Recovery-Code EINMALIG an UI; nie gespeichert. KEIN unlink — erst nach verifyIntegrity
  } catch (e) { return { ok: false, error: e.message }; }
});

ipcMain.handle("vault:verifyIntegrity", async (_e, password, expectedStateObj) => {
  const rollback = () => {
    try { fs.unlinkSync(VAULT_FILE()); } catch (_) {}
    if (_dek) _dek.fill(0); _dek = null; _vaultEnv = null;
  };
  try {
    if (!_vaultExists()) return { ok: false, error: "no-vault" };
    const fromDisk = JSON.parse(fs.readFileSync(VAULT_FILE(), "utf8"));
    const res = await vault.unlockVault(fromDisk, password);
    if (!res) { rollback(); return { ok: false, error: "decrypt-failed" }; }
    if (res.plaintext !== JSON.stringify(expectedStateObj || {})) { rollback(); return { ok: false, error: "mismatch" }; }
    _secureDeleteFile(stateFile());                    // Klartext-Hauptdatei sicher entfernen
    try { fs.unlinkSync(stateFile() + ".tmp"); } catch (_) {}
    return { ok: true };
  } catch (e) { rollback(); return { ok: false, error: e.message }; }
});

ipcMain.handle("vault:unlock", async (_e, password) => {
  try {
    if (!_vaultExists()) return { ok: false, error: "no-vault" };
    const env = _readVault();
    const res = await vault.unlockVault(env, password);
    if (!res) return { ok: false, error: "bad-password" };
    _vaultEnv = env; _dek = res.dek;
    return { ok: true, state: JSON.parse(res.plaintext) };
  } catch (e) { return { ok: false, error: e.message }; }
});

ipcMain.handle("vault:lock", () => {
  if (_cryptoDb) { try { _cryptoDb.close(); } catch (_) {} _cryptoDb = null; }
  if (_dek) _dek.fill(0);
  _dek = null; _vaultEnv = null;
  return { ok: true };
});

ipcMain.handle("vault:changePw", async (_e, oldPw, newPw) => {
  try {
    if (!_vaultExists()) return { ok: false, error: "no-vault" };
    if (!newPw || String(newPw).length < 8) return { ok: false, error: "Neues Passwort zu kurz." };
    const env = _readVault();
    const res = await vault.unlockVault(env, oldPw);
    if (!res) return { ok: false, error: "bad-password" };
    const next = await vault.rewrapDEK(env, res.dek, newPw, res.plaintext);
    _writeVault(next); _vaultEnv = next; _dek = res.dek;
    return { ok: true };
  } catch (e) { return { ok: false, error: e.message }; }
});

// Passwort vergessen → mit Recovery-Code entsperren + NEUES Passwort setzen.
ipcMain.handle("vault:recover", async (_e, recoveryCode, newPassword) => {
  try {
    if (!_vaultExists()) return { ok: false, error: "no-vault" };
    if (!newPassword || String(newPassword).length < 8) return { ok: false, error: "Neues Passwort zu kurz." };
    const env = _readVault();
    const res = await vault.unlockWithRecovery(env, recoveryCode);
    if (!res) return { ok: false, error: "bad-recovery" };
    const next = await vault.rewrapDEK(env, res.dek, newPassword, res.plaintext);
    _writeVault(next); _vaultEnv = next; _dek = res.dek;
    return { ok: true, state: JSON.parse(res.plaintext) };
  } catch (e) { return { ok: false, error: e.message }; }
});

// Best-effort sicheres Löschen: Datei mit Zufallsbytes überschreiben, dann entfernen.
// (Auf SSDs durch Wear-Leveling nicht garantiert, aber verhindert triviale Recovery
// einer gerade entschlüsselt-auf-Platte gelegenen Datei.)
function _secureDeleteFile(p) {
  try {
    if (!fs.existsSync(p)) return;
    const sz = fs.statSync(p).size;
    if (sz > 0) { try { fs.writeFileSync(p, crypto.randomBytes(sz)); } catch (_) {} }
    fs.unlinkSync(p);
  } catch (_) { try { fs.unlinkSync(p); } catch (_) {} }
}

// crypto.db → SQLCipher migrieren (Tabellen-Kopie, mit Verify + sicherem Löschen
// der Klartext-DB — KEINE Klartext-Kopie bleibt zurück).
// Idempotent: bereits verschlüsselte DB wird übersprungen.
function _migrateCryptoDbToEncrypted() {
  if (!_dek) return { ok: false, error: "locked" };
  const plain = CRYPTO_DB_FILE();
  if (!fs.existsSync(plain)) return { ok: true, skipped: "no-db" };
  try {
    const head = fs.readFileSync(plain).slice(0, 16).toString("latin1");
    if (!head.startsWith("SQLite format 3")) return { ok: true, skipped: "already-enc" };
  } catch (_) {}
  if (_cryptoDb) { try { _cryptoDb.close(); } catch (_) {} _cryptoDb = null; }
  const enc = plain + ".enc";
  const key = vault.dbKeyFromDek(_dek, "crypto.db");
  try {
    ["", "-wal", "-shm"].forEach((s) => { try { fs.unlinkSync(enc + s); } catch (_) {} });
    const src = new Database(plain);
    const tables = src.prepare("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
    const srcCounts = {};
    for (const t of tables) srcCounts[t.name] = src.prepare(`SELECT COUNT(*) c FROM "${t.name}"`).get().c;
    const dst = new Database(enc);
    dst.pragma(`key="x'${key}'"`);
    dst.pragma("temp_store = MEMORY");
    dst.pragma("journal_mode = WAL");
    const run = dst.transaction(() => {
      for (const t of tables) {
        if (t.sql) dst.exec(t.sql);
        const rows = src.prepare(`SELECT * FROM "${t.name}"`).all();
        if (rows.length) {
          const cols = Object.keys(rows[0]);
          const stmt = dst.prepare(`INSERT INTO "${t.name}" (${cols.map((c) => `"${c}"`).join(",")}) VALUES (${cols.map(() => "?").join(",")})`);
          for (const r of rows) stmt.run(cols.map((c) => r[c]));
        }
      }
    });
    run();
    dst.close(); src.close();
    // Verify: Zeilenzahlen müssen exakt passen, sonst Abbruch ohne Datenverlust.
    const verify = new Database(enc);
    verify.pragma(`key="x'${key}'"`);
    let okCounts = true;
    for (const t of tables) {
      if (verify.prepare(`SELECT COUNT(*) c FROM "${t.name}"`).get().c !== srcCounts[t.name]) okCounts = false;
    }
    verify.close();
    if (!okCounts) { try { fs.unlinkSync(enc); } catch (_) {} return { ok: false, error: "verify-mismatch" }; }
    // Swap: verschlüsselte DB an die Stelle der Klartext-DB. KEINE Klartext-Kopie
    // zurücklassen — Klartext best-effort überschreiben + löschen (Verify lief schon;
    // Rollback-Netz ist das separate _backup_vor_vault_*-Backup).
    ["-wal", "-shm"].forEach((s) => { try { fs.unlinkSync(enc + s); } catch (_) {} });
    _secureDeleteFile(plain + ".plainbak");          // Reste aus früheren Läufen bereinigen
    ["-wal", "-shm"].forEach((s) => { _secureDeleteFile(plain + s); });
    _secureDeleteFile(plain);                          // Klartext-DB sicher entfernen
    fs.renameSync(enc, plain);
    return { ok: true };
  } catch (e) {
    try { fs.unlinkSync(enc); } catch (_) {}
    return { ok: false, error: e.message };
  }
}

ipcMain.handle("vault:migrateCryptoDb", () => _migrateCryptoDbToEncrypted());

// Entschlüsselt einen DEK-Container (verschlüsseltes Vault-Backup) beim Import —
// nur wenn der Vault entsperrt ist.
ipcMain.handle("vault:decryptExport", (_e, container) => {
  try {
    if (!_dek) return { ok: false, error: "locked" };
    return { ok: true, plaintext: vault.decryptWithDek(_dek, container) };
  } catch (e) { return { ok: false, error: e.message }; }
});

// ══════════════════════════════════════
//  IPC — STATE & SETTINGS
// ══════════════════════════════════════
ipcMain.handle("state:load", () => {
  try {
    if (_dek && _vaultEnv) return JSON.parse(vault.openData(_vaultEnv, _dek));
    if (_vaultExists()) return null;          // gesperrt — Renderer muss erst vault:unlock
    const f = stateFile();
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : null;
  } catch (e) {
    return null;
  }
});
ipcMain.handle("state:save", (_, data) => {
  try {
    if (_dek && _vaultEnv) {                  // Vault-Modus → verschlüsselt (atomar, kein await)
      _vaultEnv = vault.sealData(_vaultEnv, _dek, JSON.stringify(data));
      _writeVault(_vaultEnv);
      return { ok: true };
    }
    if (_vaultExists()) return { ok: false, error: "locked", retryable: true };
    const target = stateFile();
    const tmp    = target + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(data), "utf8");
    fs.renameSync(tmp, target);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});
ipcMain.handle("settings:load", () => {
  try {
    const f = settingsFile();
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : null;
  } catch (e) {
    return null;
  }
});
ipcMain.handle("settings:save", (_, data) => {
  try {
    fs.writeFileSync(settingsFile(), JSON.stringify(data), "utf8");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});
ipcMain.handle("visionboard:load", () => {
  try {
    const f = visionboardFile();
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : null;
  } catch (e) {
    return null;
  }
});
ipcMain.handle("visionboard:save", (_, data) => {
  try {
    fs.writeFileSync(visionboardFile(), JSON.stringify(data), "utf8");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

// ══════════════════════════════════════
//  IPC — ARCHIV
// ══════════════════════════════════════

// Dokumente laden (optional gefiltert)
ipcMain.handle("archive:list", (_, filter) => {
  try {
    return getDocs(filter);
  } catch (e) {
    return [];
  }
});

// Datei hinzufügen — nativer Dialog
ipcMain.handle("archive:add", async (_, { refId, refType, refName, catId }) => {
  const result = await dialog.showOpenDialog(win, {
    title: "Dokument hinzufügen",
    buttonLabel: "Hinzufügen",
    filters: [
      {
        name: "Dokumente",
        extensions: [
          "pdf",
          "png",
          "jpg",
          "jpeg",
          "webp",
          "gif",
          "doc",
          "docx",
          "xls",
          "xlsx",
          "txt",
        ],
      },
      { name: "Alle Dateien", extensions: ["*"] },
    ],
    properties: ["openFile", "multiSelections"],
  });
  if (result.canceled || !result.filePaths.length)
    return { ok: false, canceled: true };

  const added = [];
  for (const srcPath of result.filePaths) {
    const stat = fs.statSync(srcPath);
    if (stat.size > 20 * 1024 * 1024) continue;

    const ext = path.extname(srcPath).toLowerCase();
    const docId =
      "doc_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
    const docDir = getDocDir(catId, refName);
    const fname = docId + ext;
    const dest = path.join(docDir, fname);

    fs.copyFileSync(srcPath, dest);

    // Relativer Pfad: kategorie/refName/docId.ext
    const safeCat = (catId || "sonstiges")
      .replace(/[<>:"/\\|?*]/g, "")
      .trim()
      .toLowerCase();
    const safeName = (refName || "Allgemein")
      .replace(/[<>:"/\\|?*]/g, "")
      .trim()
      .substring(0, 60);
    const relPath = safeCat + "/" + safeName + "/" + fname;

    const doc = {
      id: docId,
      refId,
      refType,
      refName: refName || "",
      category: catId || "sonstiges",
      name: path.basename(srcPath),
      ext: ext.replace(".", "").toLowerCase(),
      size: stat.size,
      relPath,
      addedAt: new Date().toISOString(),
      note: "",
    };
    addDoc(doc);
    added.push(doc);
  }
  return { ok: true, added };
});

// Buffer aus Drag & Drop speichern
ipcMain.handle(
  "archive:addBuffer",
  (_, { refId, refType, refName, catId, file }) => {
    try {
      const buf = Buffer.from(file.buffer);
      if (buf.byteLength > 20 * 1024 * 1024)
        return { ok: false, error: "Datei zu groß (max. 20 MB)" };
      // Endung kanonisieren (nur [a-z0-9]) — verhindert Trailing-Dot/Space-
      // Tricks, mit denen der auf der Platte landende Name vom später
      // geprüften String abweicht.
      const safeExt =
        String(file.ext || "")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
          .slice(0, 8) || "bin";
      const docId =
        "doc_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
      const docDir = getDocDir(catId, refName);
      const fname = docId + "." + safeExt;
      fs.writeFileSync(path.join(docDir, fname), buf);

      const safeCat = (catId || "sonstiges")
        .replace(/[<>:"/\\|?*]/g, "")
        .trim()
        .toLowerCase();
      const safeName = (refName || "Allgemein")
        .replace(/[<>:"/\\|?*]/g, "")
        .trim()
        .substring(0, 60);
      const relPath = safeCat + "/" + safeName + "/" + fname;

      const doc = {
        id: docId,
        refId,
        refType,
        refName: refName || "",
        category: catId || "sonstiges",
        name: file.name,
        ext: safeExt,
        size: file.size,
        relPath,
        addedAt: new Date().toISOString(),
        note: "",
      };
      addDoc(doc);
      return { ok: true, doc };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  },
);

// Absoluten Pfad für Vorschau
ipcMain.handle("archive:getPath", (_, relPath) => {
  const filePath = safeArchivePath(relPath);
  if (!filePath || !fs.existsSync(filePath)) return { ok: false };
  return { ok: true, path: filePath };
});

// Datei extern öffnen — per relPath aus dem Archiv, voll abgesichert
// (Symlink-Auflösung + Endungs-Allowlist gegen RCE via shell.openPath).
ipcMain.handle("archive:open", async (_, relPath) => {
  const r = resolveOpenableArchiveFile(relPath);
  if (r.error) return { ok: false, error: r.error };
  const err = await shell.openPath(r.path);
  return err ? { ok: false, error: err } : { ok: true };
});

// Dokument extern öffnen — NUR per docId. Main löst den Pfad serverseitig
// aus main.json auf; der Renderer liefert niemals einen Dateipfad.
ipcMain.handle("archive:openDoc", async (_, docId) => {
  if (typeof docId !== "string" || !docId) return { ok: false, error: "Ungültig" };
  const doc = loadIndex().docs.find((d) => d.id === docId);
  if (!doc || !doc.relPath) return { ok: false, error: "Nicht gefunden" };
  const r = resolveOpenableArchiveFile(doc.relPath);
  if (r.error) return { ok: false, error: r.error };
  const err = await shell.openPath(r.path);
  return err ? { ok: false, error: err } : { ok: true };
});

// Dokument umbenennen (nach eigenem Namen durch User)
ipcMain.handle("archive:renameDoc", (_, { docId, newName }) => {
  try {
    const idx = loadIndex();
    const doc = idx.docs.find((d) => d.id === docId);
    if (!doc) return { ok: false };

    const ad = archiveDir();
    const oldFile = path.join(ad, doc.relPath);
    const dir = path.dirname(oldFile);
    const newFile = path.join(dir, newName);

    if (fs.existsSync(oldFile)) fs.renameSync(oldFile, newFile);

    // Index aktualisieren
    doc.name = newName;
    doc.relPath = path.relative(ad, newFile).replace(/\\/g, "/");
    saveIndex(idx);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

// Dokument verknüpfen / Verknüpfung lösen
ipcMain.handle("archive:linkDoc", (_, { docId, refId, refType, refName }) => {
  try {
    const idx = loadIndex();
    const doc = idx.docs.find((d) => d.id === docId);
    if (!doc) return { ok: false };
    doc.refId = refId || null;
    doc.refType = refType || null;
    doc.refName = refName || null;
    saveIndex(idx);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

// Ordner öffnen (root oder Kategorie) — Kategorie auf das Archiv eingrenzen,
// sonst Path-Traversal zu beliebigen Ordnern (inkl. UNC-Auth) via Explorer.
ipcMain.handle("archive:openFolder", (_, opts) => {
  const ad = archiveDir();
  let target = ad;
  if (opts?.category) {
    const resolved = path.resolve(ad, String(opts.category));
    if (resolved === ad || resolved.startsWith(ad + path.sep)) target = resolved;
  }
  shell.openPath(fs.existsSync(target) ? target : ad);
  return { ok: true };
});

// Notiz aktualisieren
ipcMain.handle("archive:updateNote", (_, { docId, note }) => {
  try {
    const idx = loadIndex();
    const doc = idx.docs.find((d) => d.id === docId);
    if (doc) {
      doc.note = note;
      saveIndex(idx);
    }
    return { ok: true };
  } catch (e) {
    return { ok: false };
  }
});

// Ablaufdatum setzen
ipcMain.handle("archive:updateExpires", (_, { docId, expires }) => {
  try {
    const idx = loadIndex();
    const doc = idx.docs.find((d) => d.id === docId);
    if (doc) {
      doc.expires = expires || null;
      saveIndex(idx);
    }
    return { ok: true };
  } catch (e) {
    return { ok: false };
  }
});

// Dokument löschen
ipcMain.handle("archive:delete", (_, { docId, relPath }) => {
  try {
    const filePath = safeArchivePath(relPath);
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    const idx = loadIndex();
    idx.docs = idx.docs.filter((d) => d.id !== docId);
    saveIndex(idx);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

ipcMain.handle("archive:clearAll", () => {
  try {
    const ad = archiveDir();
    const idx = loadIndex();
    idx.docs.forEach((doc) => {
      try {
        const fp = safeArchivePath(doc.relPath);
        if (fp && fs.existsSync(fp)) fs.unlinkSync(fp);
      } catch (_) {}
    });
    saveIndex({ version: "1.0", docs: [] });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

// Temp-Docs auf echte ID umhängen + Ordner verschieben
ipcMain.handle(
  "archive:relinkDocs",
  (_, { oldRefId, newRefId, refType, refName }) => {
    try {
      const idx = loadIndex();
      const ad = archiveDir();
      let changed = 0;
      idx.docs.forEach((doc) => {
        if (doc.refId !== oldRefId) return;
        // Alten Pfad
        const oldFile = path.join(ad, doc.relPath);
        // Neuen Ordner mit echtem refName
        const newDir = getDocDir(doc.category, refName || doc.refName);
        const fname = path.basename(doc.relPath);
        const newFile = path.join(newDir, fname);
        if (fs.existsSync(oldFile) && oldFile !== newFile) {
          fs.renameSync(oldFile, newFile);
        }
        const safeCat = (doc.category || "sonstiges")
          .replace(/[<>:"/\\|?*]/g, "")
          .trim()
          .toLowerCase();
        const safeName = (refName || doc.refName || "Allgemein")
          .replace(/[<>:"/\\|?*]/g, "")
          .trim()
          .substring(0, 60);
        doc.refId = newRefId;
        doc.refName = refName || doc.refName;
        doc.relPath = safeCat + "/" + safeName + "/" + fname;
        changed++;
      });
      if (changed) saveIndex(idx);
      return { ok: true, changed };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  },
);

// Archiv-Größe
ipcMain.handle("archive:size", () => {
  try {
    const { docs } = loadIndex();
    return {
      bytes: docs.reduce((s, d) => s + (d.size || 0), 0),
      count: docs.length,
    };
  } catch (e) {
    return { bytes: 0, count: 0 };
  }
});

// ══════════════════════════════════════
//  IPC — AUTO-BACKUP (vor Löschen)
//  Speichert ohne Dialog in Downloads
// ══════════════════════════════════════
ipcMain.handle(
  "export:fullAuto",
  async (_, { stateData, settingsData, filename }) => {
    try {
      const downloadsDir = app.getPath("downloads");
      const outPath = path.join(downloadsDir, filename);

      // Vault-Modus: DEK-verschlüsselt nach Downloads (kein Klartext-Leck, Seitentür 3).
      // Wiederherstellung über importAll() bei entsperrtem Vault (vault:decryptExport).
      if (_dek) {
        const bundle = {
          _meta: { version: "11.0", exported: new Date().toISOString(), hasArchive: false },
          data: stateData,
          settings: settingsData,
        };
        fs.writeFileSync(outPath, JSON.stringify(vault.encryptWithDek(_dek, JSON.stringify(bundle))), "utf8");
        return { ok: true, path: outPath, encrypted: true };
      }

      let JSZip;
      try {
        JSZip = require("jszip");
      } catch (e) {
        // Kein jszip — plain JSON
        fs.writeFileSync(
          outPath,
          JSON.stringify(
            {
              _meta: {
                version: "10.6",
                exported: new Date().toISOString(),
                hasArchive: false,
              },
              data: stateData,
              settings: settingsData,
            },
            null,
            2,
          ),
          "utf8",
        );
        return { ok: true, path: outPath };
      }

      const zip = new JSZip();
      zip.file("state.json", JSON.stringify(stateData, null, 2));
      zip.file("settings.json", JSON.stringify(settingsData, null, 2));

      // Archiv einpacken
      const { docs } = loadIndex();
      if (docs.length > 0) {
        zip.file(
          "archive/main.json",
          JSON.stringify({ version: "1.0", docs }, null, 2),
        );
        const ad = archiveDir();
        for (const doc of docs) {
          const fp = path.join(ad, doc.relPath);
          if (fs.existsSync(fp))
            zip.file("archive/" + doc.relPath, fs.readFileSync(fp));
        }
      }

      const buf = await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
      });
      fs.writeFileSync(outPath, buf);

      // Kurz im Explorer anzeigen
      shell.showItemInFolder(outPath);
      return { ok: true, path: outPath };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  },
);

// ══════════════════════════════════════
//  IPC — EXPORT / IMPORT
// ══════════════════════════════════════
ipcMain.handle(
  "export:full",
  async (_, { stateData, settingsData, includeArchive }) => {
    const result = await dialog.showSaveDialog(win, {
      title: "Daten exportieren",
      defaultPath: `vaultbox_${new Date().toISOString().slice(0, 10)}.fbs`,
      filters: [{ name: "VaultBox Snapshot", extensions: ["fbs"] }],
    });
    if (result.canceled) return { ok: false, canceled: true };

    try {
      if (!includeArchive) {
        fs.writeFileSync(
          result.filePath,
          JSON.stringify(
            {
              _meta: {
                version: "10.6",
                exported: new Date().toISOString(),
                hasArchive: false,
              },
              data: stateData,
              settings: settingsData,
            },
            null,
            2,
          ),
          "utf8",
        );
        return { ok: true, path: result.filePath };
      }

      let JSZip;
      try {
        JSZip = require("jszip");
      } catch (e) {
        fs.writeFileSync(
          result.filePath,
          JSON.stringify({ data: stateData, settings: settingsData }),
          "utf8",
        );
        return { ok: true, warning: "jszip fehlt — ohne Dokumente exportiert" };
      }

      const zip = new JSZip();
      zip.file("state.json", JSON.stringify(stateData, null, 2));
      zip.file("settings.json", JSON.stringify(settingsData, null, 2));

      const { docs } = loadIndex();
      zip.file(
        "archive/main.json",
        JSON.stringify({ version: "1.0", docs }, null, 2),
      );
      const ad = archiveDir();
      for (const doc of docs) {
        const fp = path.join(ad, doc.relPath);
        if (fs.existsSync(fp))
          zip.file("archive/" + doc.relPath, fs.readFileSync(fp));
      }

      const buf = await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
      });
      fs.writeFileSync(result.filePath, buf);
      return { ok: true, path: result.filePath };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  },
);

ipcMain.handle("import:full", async () => {
  const result = await dialog.showOpenDialog(win, {
    title: "Daten importieren",
    filters: [{ name: "VaultBox Snapshot", extensions: ["fbs", "json"] }],
    properties: ["openFile"],
  });
  if (result.canceled) return { ok: false, canceled: true };

  try {
    const raw = fs.readFileSync(result.filePaths[0]);
    const isZip = raw[0] === 0x50 && raw[1] === 0x4b;

    if (!isZip)
      return {
        ok: true,
        format: "json",
        data: JSON.parse(raw.toString("utf8")),
      };

    const JSZip = require("jszip");
    const zip = await JSZip.loadAsync(raw);
    const state = JSON.parse(await zip.file("state.json").async("string"));
    const sett = zip.file("settings.json")
      ? JSON.parse(await zip.file("settings.json").async("string"))
      : null;

    // Archiv wiederherstellen
    const archIdx = zip.file("archive/main.json")
      ? JSON.parse(await zip.file("archive/main.json").async("string"))
      : { docs: [] };

    const ad = archiveDir();
    for (const doc of archIdx.docs) {
      const entry = zip.file("archive/" + doc.relPath);
      if (entry) {
        const dest = path.join(ad, doc.relPath);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, await entry.async("nodebuffer"));
      }
    }

    // Index mergen
    const existing = loadIndex();
    const existingIds = new Set(existing.docs.map((d) => d.id));
    existing.docs.push(...archIdx.docs.filter((d) => !existingIds.has(d.id)));
    saveIndex(existing);

    return {
      ok: true,
      format: "zip",
      data: { data: state, settings: sett },
      archiveDocs: archIdx.docs.length,
    };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

// ══════════════════════════════════════
//  IPC — SAFEPOINTS
// ══════════════════════════════════════
ipcMain.handle("safepoints:list", () => {
  try {
    const sd = safepointsDir();
    if (!fs.existsSync(sd)) return [];
    return fs
      .readdirSync(sd)
      .filter((f) => f.endsWith(".json"))
      .map((f) => {
        try {
          const c = JSON.parse(fs.readFileSync(path.join(sd, f), "utf8"));
          return { filename: f, ...c.meta };
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, 10);
  } catch (e) {
    return [];
  }
});
ipcMain.handle("safepoints:save", (_, { label, snapshot }) => {
  try {
    const sd = safepointsDir();
    const ts = Date.now();
    const safeLabel = String(label || "auto").replace(/[^a-zA-Z0-9_-]/g, ""); // Traversal-Fix
    const name = `${new Date(ts).toISOString().slice(0, 19).replace(/:/g, "-")}_${safeLabel}.json`;
    const body = _dek
      ? JSON.stringify(vault.encryptWithDek(_dek, JSON.stringify(snapshot)))   // Vault → verschlüsselt
      : JSON.stringify(snapshot, null, 2);                                     // Legacy → Klartext
    fs.writeFileSync(path.join(sd, name), body, "utf8");
    const files = fs
      .readdirSync(sd)
      .filter((f) => f.endsWith(".json"))
      .sort()
      .reverse();
    files.slice(10).forEach((f) => fs.unlinkSync(path.join(sd, f)));
    return { ok: true, filename: name };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});
ipcMain.handle("safepoints:load", (_, filename) => {
  try {
    const safe = path.basename(String(filename || "")); // Traversal-Fix
    const parsed = JSON.parse(fs.readFileSync(path.join(safepointsDir(), safe), "utf8"));
    if (parsed && parsed.enc === true) {                 // verschlüsselter Container
      if (!_dek) return { ok: false, error: "locked" };
      return { ok: true, data: JSON.parse(vault.decryptWithDek(_dek, parsed)) };
    }
    return { ok: true, data: parsed };
  } catch (e) {
    return { ok: false };
  }
});
ipcMain.handle("safepoints:delete", (_, filename) => {
  try {
    fs.unlinkSync(path.join(safepointsDir(), path.basename(String(filename || "")))); // Traversal-Fix
    return { ok: true };
  } catch (e) {
    return { ok: false };
  }
});

// ══════════════════════════════════════
//  IPC — DATENSPEICHER-PFAD
// ══════════════════════════════════════

/** Gibt den aktuellen Datenpfad zurück */
ipcMain.handle("storage:getPath", () => {
  return { path: dataDir(), isCustom: dataDir() !== DEFAULT_DIR };
});

/** Ordner-Dialog → Daten migrieren → Pointer schreiben */
ipcMain.handle("storage:choosePath", async () => {
  const result = await dialog.showOpenDialog(win, {
    title: "Datenspeicher-Ordner wählen",
    buttonLabel: "Hier speichern",
    properties: ["openDirectory", "createDirectory"],
  });
  if (result.canceled || !result.filePaths.length) return { ok: false, canceled: true };

  const newPath = result.filePaths[0];
  const oldPath = dataDir();

  // Vorhandene Daten in neuen Ordner kopieren
  try {
    const files = ["state.json", "settings.json", "visionboards.json"];
    for (const f of files) {
      const src = path.join(oldPath, f);
      if (fs.existsSync(src)) fs.copyFileSync(src, path.join(newPath, f));
    }
    copyDirSync(path.join(oldPath, "archive"), path.join(newPath, "archive"));
    copyDirSync(path.join(oldPath, "safepoints"), path.join(newPath, "safepoints"));
  } catch (e) {
    return { ok: false, error: "Datenmigration fehlgeschlagen: " + e.message };
  }

  // Pointer in CONFIG_FILE speichern
  try {
    fs.mkdirSync(DEFAULT_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ dataPath: newPath }, null, 2), "utf8");
  } catch (e) {
    return { ok: false, error: "Konfiguration konnte nicht gespeichert werden: " + e.message };
  }

  // Cache leeren → nächste IPC-Calls nutzen neuen Pfad
  _dataDirCache = null;
  ensureDirs();

  return { ok: true, path: newPath };
});

/** Datenspeicher-Ordner im Explorer öffnen */
ipcMain.handle("storage:openFolder", () => {
  shell.openPath(dataDir());
  return { ok: true };
});

/** Zurück zum Standard-Pfad (AppData) */
ipcMain.handle("storage:resetPath", () => {
  try {
    if (fs.existsSync(CONFIG_FILE)) fs.unlinkSync(CONFIG_FILE);
    _dataDirCache = null;
    ensureDirs();
    return { ok: true, path: DEFAULT_DIR };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

// ══════════════════════════════════════
//  IPC — DRUCKEN
// ══════════════════════════════════════
ipcMain.handle("print:page", (_, options) => {
  return new Promise((resolve) => {
    win.webContents.print(
      { silent: false, printBackground: true, color: true, ...(options || {}) },
      (success, errorType) => resolve({ ok: success, error: errorType }),
    );
  });
});

// Öffnet eine eigene BrowserWindow mit dem übergebenen HTML und druckt daraus
ipcMain.handle("print:html", (_, html) => {
  return new Promise((resolve) => {
    const pw = new BrowserWindow({
      width: 900, height: 750,
      show: true,
      title: "VaultBox — Druckvorschau",
      webPreferences: { nodeIntegration: false, contextIsolation: true },
    });
    // Temp-Datei statt data: URL (verhindert URL-Längenlimit)
    const tmpFile = path.join(app.getPath("temp"), "csf_print.html");
    fs.writeFileSync(tmpFile, html, "utf8");
    pw.loadFile(tmpFile);
    pw.webContents.once("did-finish-load", () => {
      setTimeout(() => {
        try { fs.unlinkSync(tmpFile); } catch (_) {}
        resolve({ ok: true });
      }, 400);
    });
    pw.on("closed", () => resolve({ ok: true }));
  });
});

// ══════════════════════════════════════
//  MENÜ
// ══════════════════════════════════════
const menuTemplate = [
  {
    label: "VaultBox",
    submenu: [
      { label: "Über VaultBox", role: "about" },
      { type: "separator" },
      { label: "Beenden", role: "quit", accelerator: "CmdOrCtrl+Q" },
    ],
  },
  {
    label: "Bearbeiten",
    submenu: [
      { label: "Rückgängig", role: "undo" },
      { label: "Wiederholen", role: "redo" },
      { type: "separator" },
      { label: "Ausschneiden", role: "cut" },
      { label: "Kopieren", role: "copy" },
      { label: "Einfügen", role: "paste" },
      { label: "Alles auswählen", role: "selectAll" },
    ],
  },
  {
    label: "Ansicht",
    submenu: [
      { label: "Neu laden", accelerator: "F5", click: () => win?.reload() },
      {
        label: "Vollbild",
        accelerator: "F11",
        click: () => win?.setFullScreen(!win.isFullScreen()),
      },
      { type: "separator" },
      { label: "Vergrößern", role: "zoomIn", accelerator: "CmdOrCtrl+=" },
      { label: "Verkleinern", role: "zoomOut", accelerator: "CmdOrCtrl+-" },
      { label: "Zurücksetzen", role: "resetZoom", accelerator: "CmdOrCtrl+0" },
      { type: "separator" },
      {
        label: "DevTools",
        accelerator: "F12",
        click: () => win?.webContents.toggleDevTools(),
      },
    ],
  },
];
Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

function _sendUpdate(channel, payload) {
  if (win && !win.isDestroyed()) win.webContents.send(channel, payload || {});
}

function setupAutoUpdater() {
  autoUpdater.autoDownload    = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("checking-for-update", () => _sendUpdate("update:checking"));
  autoUpdater.on("update-available", (info) =>
    _sendUpdate("update:available", { version: info.version }));
  autoUpdater.on("update-not-available", (info) =>
    _sendUpdate("update:none", { version: info && info.version }));
  autoUpdater.on("download-progress", (p) =>
    _sendUpdate("update:progress", { percent: Math.round(p.percent || 0) }));
  autoUpdater.on("update-downloaded", (info) =>
    _sendUpdate("update:downloaded", { version: info.version }));
  autoUpdater.on("error", (err) =>
    _sendUpdate("update:error", { message: (err && err.message) || String(err) }));

  setTimeout(() => {
    try { autoUpdater.checkForUpdates(); } catch (_) {}
  }, 3000);
}

// Manuelle Prüfung aus den Einstellungen
ipcMain.on("update:check", () => {
  if (!app.isPackaged) {
    _sendUpdate("update:error", { message: "Updates nur in der installierten App verfügbar (nicht im Dev-Modus)." });
    return;
  }
  try { autoUpdater.checkForUpdates(); }
  catch (e) { _sendUpdate("update:error", { message: (e && e.message) || String(e) }); }
});

ipcMain.on("update:install", () => {
  autoUpdater.quitAndInstall(false, true);
});

app.whenReady().then(() => {
  ensureDirs();
  gateStartup();
  if (app.isPackaged) setupAutoUpdater();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
