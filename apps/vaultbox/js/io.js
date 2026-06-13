// ══════════════════════════════════════
//  I/O — Export · Import · Safepoints
// ══════════════════════════════════════

const SAFEPOINT_KEY = "csf_safepoints";
const SAFEPOINT_MAX = 10;
const SAFEPOINT_AUTO_INTERVAL = 60 * 60 * 1000;

let _safepointTimer = null;

// ══════════════════════════════════════
//  MIGRATION
// ══════════════════════════════════════
function migrateState() {
  // Konten
  (S.accounts || []).forEach((a) => {
    if (a.bankGroup === undefined) a.bankGroup = "";
    if (a.isGroupRef === undefined) a.isGroupRef = false;
    if (a.monthlyIncome === undefined) a.monthlyIncome = 0;
    if (a.note === undefined) a.note = "";
    if (a.include === undefined) a.include = true;
  });
  // Posten
  (S.data || []).forEach((p) => {
    if (p.goalId === undefined) p.goalId = null;
    if (p.activeFrom === undefined) p.activeFrom = p.contractStart || null;
    if (p.empfaenger === undefined) p.empfaenger = "";
    if (p.categoryId === undefined) p.categoryId = null;
    if (p.creditorId === undefined) p.creditorId = null;
  });
  // Kreditoren
  if (!Array.isArray(S.creditors)) S.creditors = [];
  // Kategorien initialisieren wenn leer oder fehlend
  if (!Array.isArray(S.categories) || S.categories.length === 0) {
    S.categories = typeof DEFAULT_CATEGORIES !== "undefined"
      ? [...DEFAULT_CATEGORIES]
      : [];
  }
  // Legacy-Emoji-Icons → Icon-Namen migrieren (Standard-Kategorien)
  if (typeof CAT_EMOJI_TO_ICON !== "undefined") {
    (S.categories || []).forEach((c) => {
      if (c && c.icon && CAT_EMOJI_TO_ICON[c.icon]) c.icon = CAT_EMOJI_TO_ICON[c.icon];
    });
  }
  // Transfers
  (S.transfers || []).forEach((t) => {
    if (t.interval === undefined) t.interval = null;
    if (t.execDay === undefined) t.execDay = null;
  });
  // Ziele
  (S.goals || []).forEach((g) => {
    if (g.icon === undefined) g.icon = "target";
    else if (typeof GOAL_EMOJI_TO_ICON !== "undefined" && GOAL_EMOJI_TO_ICON[g.icon]) g.icon = GOAL_EMOJI_TO_ICON[g.icon];
    if (g.color === undefined) g.color = "#4d9eff";
    if (g.currentAmount === undefined) g.currentAmount = 0;
    if (g.monthlyRate === undefined) g.monthlyRate = 0;
  });
  // State-Felder sicherstellen
  if (!Array.isArray(S.bookings)) S.bookings = [];
  if (!S.groupOrder || !Array.isArray(S.groupOrder)) S.groupOrder = [];
  if (!S.groupAccOrder || typeof S.groupAccOrder !== "object")
    S.groupAccOrder = {};
  if (!Array.isArray(S.transfers)) S.transfers = [];
  if (!Array.isArray(S.goals)) S.goals = [];
  if (!S.zahltag) S.zahltag = 15;
  if (!S.yearNotes || typeof S.yearNotes !== "object" || Array.isArray(S.yearNotes)) S.yearNotes = {};
  if (!Array.isArray(S.closedMonths)) S.closedMonths = [];
}

// ══════════════════════════════════════
//  CRYPTO — AES-256-GCM · PBKDF2-SHA-256
// ══════════════════════════════════════

function _ioB64enc(buf) {
  const b = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s);
}

function _ioB64dec(s) {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function _ioDeriveKey(password, salt) {
  const raw = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
    raw,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function _ioEncryptSnapshot(plaintext, password) {
  const salt   = crypto.getRandomValues(new Uint8Array(16));
  const iv     = crypto.getRandomValues(new Uint8Array(12));
  const key    = await _ioDeriveKey(password, salt);
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv }, key, new TextEncoder().encode(plaintext)
  );
  return {
    vaultbox: true, encrypted: true, v: 1,
    alg: "AES-256-GCM", kdf: "PBKDF2-SHA256-100k",
    salt: _ioB64enc(salt), iv: _ioB64enc(iv), payload: _ioB64enc(cipher),
  };
}

async function _ioDecryptSnapshot(obj, password) {
  const key   = await _ioDeriveKey(password, _ioB64dec(obj.salt));
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: _ioB64dec(obj.iv) }, key, _ioB64dec(obj.payload)
  );
  return new TextDecoder().decode(plain);
}

function _ioEl(tag, cls) { const el = document.createElement(tag); if (cls) el.className = cls; return el; }

function _ioAskPassword(cfg) {
  return new Promise((resolve) => {
    const ov  = _ioEl("div", "io-pw-ov");
    const box = _ioEl("div", "io-pw-box");

    const icon = _ioEl("div", "io-pw-icon");
    icon.textContent = "🔒";

    const ttl = _ioEl("div", "io-pw-title");
    ttl.textContent = cfg.title;

    const sub = _ioEl("div", "io-pw-sub");
    sub.textContent = cfg.sub;

    const inA = _ioEl("input", "io-pw-inp");
    inA.type = "password"; inA.placeholder = "Passwort"; inA.autocomplete = "new-password";

    let inB = null;
    if (cfg.confirm) {
      inB = _ioEl("input", "io-pw-inp");
      inB.type = "password"; inB.placeholder = "Passwort bestätigen"; inB.autocomplete = "new-password";
    }

    const err = _ioEl("div", "io-pw-err");

    const btns    = _ioEl("div", "io-pw-btns");
    const btnCancel = _ioEl("button", "btn");
    btnCancel.textContent = "Abbrechen";
    btns.appendChild(btnCancel);

    let btnSkip = null;
    if (cfg.confirm) {
      btnSkip = _ioEl("button", "btn");
      btnSkip.textContent = "Ohne Schutz";
      btns.appendChild(btnSkip);
    }

    const btnOk = _ioEl("button", "btn primary");
    btnOk.textContent = cfg.okLabel || "Fortfahren";
    btns.appendChild(btnOk);

    box.appendChild(icon); box.appendChild(ttl); box.appendChild(sub);
    box.appendChild(inA); if (inB) box.appendChild(inB);
    box.appendChild(err); box.appendChild(btns);
    ov.appendChild(box);
    document.body.appendChild(ov);

    const done = (val) => { inA.value = ""; if (inB) inB.value = ""; ov.remove(); resolve(val); };

    btnCancel.onclick = () => done(undefined);
    if (btnSkip) btnSkip.onclick = () => done(null);

    btnOk.onclick = () => {
      const pw = inA.value;
      if (!pw) {
        if (!cfg.confirm) { err.textContent = "Bitte Passwort eingeben."; return; }
        done(null); return;
      }
      if (cfg.confirm && pw.length < 6) { err.textContent = "Mindestens 6 Zeichen erforderlich."; return; }
      if (cfg.confirm && inB && pw !== inB.value) { err.textContent = "Passwörter stimmen nicht überein."; return; }
      done(pw);
    };

    inA.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { if (inB) inB.focus(); else btnOk.click(); }
    });
    if (inB) inB.addEventListener("keydown", (e) => { if (e.key === "Enter") btnOk.click(); });
    ov.addEventListener("click", (e) => { if (e.target === ov) done(undefined); });
    requestAnimationFrame(() => inA.focus());
  });
}

// ══════════════════════════════════════
//  EXPORT
// ══════════════════════════════════════
async function exportAll() {
  let pw = await _ioAskPassword({
    title: "Backup exportieren",
    sub: "Passwort für AES-256-Verschlüsselung setzen — oder ohne Passwort als Klartext exportieren.",
    confirm: true,
    okLabel: "Verschlüsselt exportieren",
  });
  if (pw === undefined) return;

  const snapshot = _buildSnapshot("manual");
  const encrypted = !!pw;
  let content;
  if (pw) {
    if (typeof showToast === "function") showToast("Verschlüssele…", "info", 1800);
    const enc = await _ioEncryptSnapshot(JSON.stringify(snapshot), pw);
    content = JSON.stringify(enc);
  } else {
    content = JSON.stringify(snapshot, null, 2);
  }
  pw = null;

  const blob = new Blob([content], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `finanzboard_${todayIso()}${encrypted ? ".enc" : ""}.fbs`;
  a.click();
  URL.revokeObjectURL(a.href);
  if (typeof showToast === "function") showToast(encrypted ? "Verschlüsselt exportiert 🔒" : "Exportiert", "success");
}

// ══════════════════════════════════════
//  IMPORT
// ══════════════════════════════════════

function _validateImportPayload(p, fileSize) {
  if (fileSize > 25 * 1024 * 1024)
    return "Die Datei \xfcberschreitet das Gr\xf6\xdfen-Limit von 25\xa0MB.";
  if (!Array.isArray(p.accounts) || !Array.isArray(p.data))
    return "Ung\xfcltiges VaultBox-Backup: Keine Kontodaten gefunden.";
  return null;
}

function importAll() {
  const inp = document.createElement("input");
  inp.type = "file";
  inp.accept = ".fbs,.json";
  inp.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = async (ev) => {
      try {
        let raw = JSON.parse(ev.target.result);

        if (raw.encrypted === true) {
          let pw = await _ioAskPassword({
            title: "Backup entschlüsseln",
            sub: "Dieses Backup ist AES-256-verschlüsselt. Gib das Passwort ein, das du beim Export verwendet hast.",
            confirm: false,
            okLabel: "Entschlüsseln & importieren",
          });
          if (pw === undefined) return;
          if (!pw) { appAlert("Kein Passwort eingegeben.", { icon: "⚠️", title: "Abgebrochen" }); return; }
          try {
            raw = JSON.parse(await _ioDecryptSnapshot(raw, pw));
          } catch (_) {
            appAlert("Falsches Passwort oder beschädigte Datei.", { icon: "❌", title: "Entschlüsselung fehlgeschlagen" });
            return;
          } finally {
            pw = null;
          }
        }

        const p = raw.data || raw.state || raw;
        const validErr = _validateImportPayload(p, file.size);
        if (validErr) throw new Error(validErr);

        saveSafepoint("Vor Import — " + new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }));

        if (Array.isArray(p.accounts)) S.accounts = p.accounts;
        if (Array.isArray(p.data)) S.data = p.data;
        if (Array.isArray(p.transfers)) S.transfers = p.transfers;
        if (Array.isArray(p.goals)) S.goals = p.goals;
        if (typeof p.monthlyIncome === "number")
          S.monthlyIncome = p.monthlyIncome;
        if (typeof p.zahltag === "number") S.zahltag = p.zahltag;
        if (Array.isArray(p.groupOrder)) S.groupOrder = p.groupOrder;
        if (typeof p.groupAccOrder === "object" && p.groupAccOrder !== null && !Array.isArray(p.groupAccOrder))
          S.groupAccOrder = p.groupAccOrder;
        if (Array.isArray(p.categories) && p.categories.length) S.categories = p.categories;
        if (Array.isArray(p.creditors)) S.creditors = p.creditors;
        if (Array.isArray(p.closedMonths)) S.closedMonths = p.closedMonths;
        if (p.yearNotes && typeof p.yearNotes === "object" && !Array.isArray(p.yearNotes)) S.yearNotes = p.yearNotes;
        if (Array.isArray(p.visionboards) && p.visionboards.length) {
          try {
            localStorage.setItem("visionboards", JSON.stringify(p.visionboards));
            window.csf?.visionboard?.save(p.visionboards);
          } catch(_) {}
        }
        if (p.notes !== undefined) {
          try { localStorage.setItem("csf_notes", JSON.stringify(Array.isArray(p.notes) ? p.notes : [])); } catch(_) {}
        }

        migrateState();
        S.bookings = [];
        if (typeof initBookings === "function") initBookings();
        if (typeof _upsertMonthCloseEntry === "function") {
          (S.closedMonths || []).forEach(mk => _upsertMonthCloseEntry(mk));
        }
        persist();

        renderDashboard();
        if (typeof renderGoals === "function") renderGoals();
        if (typeof renderVertraege === "function") renderVertraege();
        if (typeof renderPosten === "function") renderPosten();

        appAlert(
          `Import erfolgreich.\n${S.accounts.length} Konten · ${S.data.length} Posten · ${S.goals.length} Ziele`,
          { icon: "\u2705", title: "Import abgeschlossen" },
        );
      } catch (err) {
        appAlert(
          "Import fehlgeschlagen: " + err.message + "\n\nDein Datenstand vor dem Import wurde als Safepoint gesichert.",
          { icon: "\u274C", title: "Import fehlgeschlagen" },
        );
      }
    };
    r.readAsText(file);
  };
  inp.click();
}

// ══════════════════════════════════════
//  SAFEPOINTS
// ══════════════════════════════════════
function _buildSnapshot(type = "auto") {
  return {
    meta: {
      type,
      version: "10.6",
      date: new Date().toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      timestamp: Date.now(),
      accounts: S.accounts.length,
      posten: S.data.length,
      goals: (S.goals || []).length,
    },
    data: {
      accounts: S.accounts,
      data: S.data,
      transfers: S.transfers,
      goals: S.goals,
      bookings: S.bookings || [],
      categories: S.categories || [],
      creditors: S.creditors || [],
      closedMonths: S.closedMonths || [],
      yearNotes: S.yearNotes || {},
      monthlyIncome: S.monthlyIncome,
      zahltag: S.zahltag,
      groupOrder: S.groupOrder,
      groupAccOrder: S.groupAccOrder,
      visionboards: (() => { try { return JSON.parse(localStorage.getItem("visionboards") || "[]"); } catch(e) { return []; } })(),
      notes: (() => { try { return JSON.parse(localStorage.getItem("csf_notes") || "[]"); } catch(e) { return []; } })(),
    },
  };
}

function saveSafepoint(label = null) {
  const raw = localStorage.getItem(SAFEPOINT_KEY);
  const points = raw ? JSON.parse(raw) : [];
  const snap = _buildSnapshot("safepoint");
  if (label) snap.meta.label = label;
  points.unshift(snap);
  if (points.length > SAFEPOINT_MAX) points.length = SAFEPOINT_MAX;
  localStorage.setItem(SAFEPOINT_KEY, JSON.stringify(points));
  return snap;
}

function loadSafepoints() {
  const raw = localStorage.getItem(SAFEPOINT_KEY);
  return raw ? JSON.parse(raw) : [];
}

function restoreSafepoint(idx) {
  const points = loadSafepoints();
  const snap = points[idx];
  if (!snap) return;

  appConfirm(
    `Datenstand vom ${snap.meta.date} wiederherstellen?\n\nDer aktuelle Stand wird dabei \xfcberschrieben.`,
    {
      icon: "\u23EA",
      title: "Safepoint wiederherstellen",
      confirmLabel: "Wiederherstellen",
      confirmClass: "danger",
    },
  ).then((ok) => {
    if (!ok) return;
    const p = snap.data;
    if (Array.isArray(p.accounts)) S.accounts = p.accounts;
    if (Array.isArray(p.data)) S.data = p.data;
    if (Array.isArray(p.transfers)) S.transfers = p.transfers;
    if (Array.isArray(p.goals)) S.goals = p.goals;
    if (Array.isArray(p.categories) && p.categories.length) S.categories = p.categories;
    if (Array.isArray(p.creditors)) S.creditors = p.creditors;
    if (typeof p.monthlyIncome === "number") S.monthlyIncome = p.monthlyIncome;
    if (typeof p.zahltag === "number") S.zahltag = p.zahltag;
    if (Array.isArray(p.groupOrder)) S.groupOrder = p.groupOrder;
    if (p.groupAccOrder) S.groupAccOrder = p.groupAccOrder;
    if (Array.isArray(p.closedMonths)) S.closedMonths = p.closedMonths;
    if (p.yearNotes && typeof p.yearNotes === "object" && !Array.isArray(p.yearNotes)) S.yearNotes = p.yearNotes;
    migrateState();
    // Bookings immer neu aufbauen — stellt sicher dass sie zu den Posten passen
    S.bookings = [];
    if (typeof initBookings === "function") initBookings();
    // Abschluss-Buchungen für finalisierte Monate neu erstellen
    if (typeof _upsertMonthCloseEntry === "function") {
      (S.closedMonths || []).forEach(mk => _upsertMonthCloseEntry(mk));
    }
    persist();
    renderDashboard();
    if (typeof renderPosten === "function") renderPosten();
    closeIoPanel();
    appAlert("Datenstand wiederhergestellt.", {
      icon: "\u2705",
      title: "Fertig",
    });
  });
}

function deleteSafepoint(idx) {
  const points = loadSafepoints();
  points.splice(idx, 1);
  localStorage.setItem(SAFEPOINT_KEY, JSON.stringify(points));
  renderIoPanel();
}

function startAutoSafepoint() {
  if (_safepointTimer) clearInterval(_safepointTimer);
  _safepointTimer = setInterval(() => {
    saveSafepoint();
  }, SAFEPOINT_AUTO_INTERVAL);
}

function initSafepoints() {
  if (S.accounts.length > 0 || S.data.length > 0) {
    const points = loadSafepoints();
    const last = points[0]?.meta?.timestamp || 0;
    if (Date.now() - last > 30 * 60 * 1000) saveSafepoint();
  }
  startAutoSafepoint();
}

// ══════════════════════════════════════
//  IO-PANEL — UI in Settings
// ══════════════════════════════════════
function renderIoPanel() {
  const el = document.getElementById("ioPanel");
  if (!el) return;

  const points = loadSafepoints();
  const typeMap = {
    manual: "\ud83d\udcbe Manuell",
    safepoint: "\u23f1 Auto",
    auto: "\u23f1 Auto",
  };

  const listHtml =
    points.length === 0
      ? `<div class="io-empty">Noch keine Safepoints vorhanden.<br>Wird automatisch st\xfcndlich erstellt.</div>`
      : points
          .map(
            (sp, i) => `
        <div class="io-sp-row">
          <div class="io-sp-info">
            <span class="io-sp-type">${typeMap[sp.meta.type] || "\ud83d\udccc"}</span>
            <div>
              <div class="io-sp-date">${esc(sp.meta.label || sp.meta.date)}</div>
              <div class="io-sp-meta">${sp.meta.accounts} Konten \xb7 ${sp.meta.posten} Posten \xb7 ${sp.meta.goals || 0} Ziele</div>
            </div>
          </div>
          <div class="io-sp-actions">
            <button class="btn sm" onclick="restoreSafepoint(${i})" onmouseenter="_showTooltip('Wiederherstellen', this)" onmouseleave="_hideTooltip()">⏮</button>
            <button class="btn sm danger-outline" onclick="deleteSafepoint(${i})" onmouseenter="_showTooltip('Löschen', this)" onmouseleave="_hideTooltip()">🗑</button>
          </div>
        </div>`,
          )
          .join("");

  el.innerHTML = `
    <div class="io-section">
      <div class="io-sec-title">\ud83d\udce4 Export / Import</div>
      <div class="io-btn-row">
        <button class="btn primary" onclick="exportAll()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Exportieren (.fbs)
        </button>
        <button class="btn" onclick="importAll()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 14 12 9 7 14"/><line x1="12" y1="9" x2="12" y2="21"/></svg>
          Importieren
        </button>
      </div>
      <div class="io-hint">Die .fbs-Datei ist ein vollst\xe4ndiger Snapshot \u2014 Konten, Posten, Ziele, Vertr\xe4ge. Ideal zum \xdcbertragen auf einen anderen PC oder als Backup.</div>
    </div>
    <div class="io-section">
      <div class="io-sec-title">
        \u23f1 Safepoints
        <button class="btn sm" style="margin-left:auto;" onclick="_createNamedSafepoint()">+ Jetzt sichern</button>
      </div>
      <div class="io-sp-list">${listHtml}</div>
      <div class="io-hint">Automatisch alle 60 Minuten \xb7 max. ${SAFEPOINT_MAX} Eintr\xe4ge \xb7 nur lokal gespeichert</div>
    </div>`;
}

function _createNamedSafepoint() {
  appPrompt("Name für diesen Safepoint (optional):", {
    placeholder: 'z.B. "Vor dem Test"',
  }).then((label) => {
    saveSafepoint(label || null);
    renderIoPanel();
    appAlert("Safepoint gespeichert.", { icon: "\u2705", title: "Gesichert" });
  });
}

function closeIoPanel() {
  if (typeof renderSettings === "function") renderSettings();
}
