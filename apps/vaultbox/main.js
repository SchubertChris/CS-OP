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
//  LIZENZ — HMAC-Offline-Verifikation
// ══════════════════════════════════════
const crypto = require("crypto");
const os = require("os");
const Database = require("better-sqlite3");

// ══════════════════════════════════════
//  KRYPTO — SQLite FIFO-Engine
// ══════════════════════════════════════
const CRYPTO_DB_FILE = () => path.join(dataDir(), "crypto.db");
let _cryptoDb = null;

function _getCryptoDb() {
  if (_cryptoDb) return _cryptoDb;
  fs.mkdirSync(dataDir(), { recursive: true });
  const db = new Database(CRYPTO_DB_FILE());
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
const LICENSE_HMAC_SECRET = "vb-1c8f2a9e4b7d3f6a0e5c1d8b2f7a3e9c";
const LEMON_SQUEEZY_STORE_ID = "YOUR_STORE_ID";
const MASTER_KEY = "VAULTBOX-OWNER-CS26-PRIV-MASTER";

function _licenseHmac(licenseKey, instanceId) {
  return crypto
    .createHmac("sha256", LICENSE_HMAC_SECRET)
    .update(licenseKey + "|" + instanceId)
    .digest("hex");
}

function _getInstanceId() {
  try {
    const ifaces = os.networkInterfaces();
    for (const name of Object.keys(ifaces)) {
      for (const iface of ifaces[name]) {
        if (!iface.internal && iface.mac && iface.mac !== "00:00:00:00:00:00") {
          return iface.mac;
        }
      }
    }
  } catch (_) {}
  return os.hostname();
}

ipcMain.handle("license:check", () => {
  if (!app.isPackaged) return { valid: true, owner: true };
  try {
    const f = LICENSE_FILE();
    if (!fs.existsSync(f)) return { valid: false };
    const data = JSON.parse(fs.readFileSync(f, "utf8"));
    if (!data.licenseKey || !data.instanceId || !data.hmac) return { valid: false };
    if (data.licenseKey === MASTER_KEY) return { valid: true, owner: true };
    const expected = _licenseHmac(data.licenseKey, data.instanceId);
    return { valid: expected === data.hmac, activatedAt: data.activatedAt };
  } catch (_) {
    return { valid: false };
  }
});

ipcMain.handle("license:activate", async (_e, licenseKey) => {
  try {
    const instanceId = _getInstanceId();
    const instanceName = "VaultBox-" + os.hostname();

    if (licenseKey === MASTER_KEY) {
      const hmac = _licenseHmac(licenseKey, instanceId);
      const licenseData = {
        licenseKey,
        instanceId,
        instanceName,
        hmac,
        activatedAt: new Date().toISOString(),
        lsInstanceId: "owner",
      };
      fs.mkdirSync(DEFAULT_DIR, { recursive: true });
      fs.writeFileSync(LICENSE_FILE(), JSON.stringify(licenseData, null, 2), "utf8");
      return { ok: true };
    }

    const resp = await fetch("https://api.lemonsqueezy.com/v1/licenses/activate", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ license_key: licenseKey, instance_name: instanceName }),
    });
    const json = await resp.json();

    if (!resp.ok || json.error || !json.activated) {
      const msg = json.error || "Lizenz konnte nicht verifiziert werden.";
      return { ok: false, error: msg };
    }

    const hmac = _licenseHmac(licenseKey, instanceId);
    const licenseData = {
      licenseKey,
      instanceId,
      instanceName,
      hmac,
      activatedAt: new Date().toISOString(),
      lsInstanceId: json.instance?.id || "",
    };
    fs.mkdirSync(DEFAULT_DIR, { recursive: true });
    fs.writeFileSync(LICENSE_FILE(), JSON.stringify(licenseData, null, 2), "utf8");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: "Netzwerkfehler — Internetverbindung prüfen." };
  }
});

ipcMain.handle("license:info", () => {
  try {
    const f = LICENSE_FILE();
    if (!fs.existsSync(f)) return null;
    const d = JSON.parse(fs.readFileSync(f, "utf8"));
    return { licenseKey: d.licenseKey, activatedAt: d.activatedAt };
  } catch (_) { return null; }
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
//  IPC — STATE & SETTINGS
// ══════════════════════════════════════
ipcMain.handle("state:load", () => {
  try {
    const f = stateFile();
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : null;
  } catch (e) {
    return null;
  }
});
ipcMain.handle("state:save", (_, data) => {
  try {
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
      const docId =
        "doc_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
      const ext = "." + (file.ext || "bin");
      const docDir = getDocDir(catId, refName);
      const fname = docId + ext;
      fs.writeFileSync(path.join(docDir, fname), Buffer.from(file.buffer));

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
        ext: file.ext,
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

// Datei extern öffnen
ipcMain.handle("archive:open", (_, relPath) => {
  const filePath = safeArchivePath(relPath);
  if (!filePath || !fs.existsSync(filePath)) return { ok: false, error: "Nicht gefunden" };
  shell.openPath(filePath);
  return { ok: true };
});
ipcMain.handle("archive:openPath", (_, filePath) => {
  shell.openPath(filePath);
  return { ok: true };
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

// Ordner öffnen (root oder Kategorie)
ipcMain.handle("archive:openFolder", (_, opts) => {
  const ad = archiveDir();
  const target = opts?.category ? path.join(ad, opts.category) : ad;
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
    const name = `${new Date(ts).toISOString().slice(0, 19).replace(/:/g, "-")}_${label || "auto"}.json`;
    fs.writeFileSync(
      path.join(sd, name),
      JSON.stringify(snapshot, null, 2),
      "utf8",
    );
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
    return {
      ok: true,
      data: JSON.parse(
        fs.readFileSync(path.join(safepointsDir(), filename), "utf8"),
      ),
    };
  } catch (e) {
    return { ok: false };
  }
});
ipcMain.handle("safepoints:delete", (_, filename) => {
  try {
    fs.unlinkSync(path.join(safepointsDir(), filename));
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

function setupAutoUpdater() {
  autoUpdater.autoDownload    = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("update-available", (info) => {
    if (win) win.webContents.send("update:available", { version: info.version });
  });

  autoUpdater.on("update-downloaded", (info) => {
    if (win) win.webContents.send("update:downloaded", { version: info.version });
  });

  autoUpdater.on("error", () => {});

  setTimeout(() => {
    try { autoUpdater.checkForUpdates(); } catch (_) {}
  }, 3000);
}

ipcMain.on("update:install", () => {
  autoUpdater.quitAndInstall(false, true);
});

app.whenReady().then(() => {
  ensureDirs();
  createWindow();
  if (app.isPackaged) setupAutoUpdater();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
