// ══════════════════════════════════════
//  PIVOT-TABELLE v2
//  – Alle Posten, Transfers, Einmalige
//  – Konto-Gruppierung mit Summenzeilen
//  – Drag & Drop Zeilenreihenfolge
//  – Edit via Modal (bestehend)
//  – Doppelzählungs-Schutz für Transfers
//  – Jahres- und Monatsansicht
// ══════════════════════════════════════

// ── STATE ─────────────────────────────
let _pvYear = new Date().getFullYear();
let _pvMonth = new Date().getMonth();
let _pvView = "jahr"; // "jahr" | "monat"
let _pvGroup = "konto"; // "konto" | "typ" | "flat"
let _pvFilterAccount = ""; // "" = alle Konten
let _pvRowOrder = []; // [{ kind, id }] — persistierte Reihenfolge
let _pvDragSrc = null;

// ── EINSTIEG ──────────────────────────
let _pvInitialized = false;
function renderPivot(yr) {
  if (yr) _pvYear = yr;
  if (!_pvInitialized) { _pvLoadOrder(); _pvInitialized = true; }
  const container = document.getElementById("pivotContainer");
  if (!container) return;

  container.innerHTML =
    _pvToolbarHtml() +
    `
    <div id="pvTblWrap"></div>
    <div id="pvFooter"></div>`;

  _pvRenderTable();
}

// Hook: wird von modal.js nach savePosten/saveTransfer aufgerufen
// Setzt auf renderJahr() / renderDashboard() auf — kein direkter Aufruf nötig
// Aber als Fallback: wenn pivotContainer sichtbar ist, direkt neu rendern
function _pvRefreshIfVisible() {
  const container = document.getElementById("pivotContainer");
  if (container) renderPivot(_pvYear);
}

// ── TOOLBAR ───────────────────────────
function _pvToolbarHtml() {
  const curY = new Date().getFullYear();
  // Jahres-Selector: frühestes contractStart aus S.data bis curY + 2
  const minDataYear = (() => {
    let min = curY - 2;
    (S.data || []).forEach((p) => {
      if (p.contractStart) {
        const y = new Date(p.contractStart).getFullYear();
        if (y < min) min = y;
      }
    });
    (S.bookings || []).forEach((b) => {
      if (b.date) {
        const y = new Date(b.date).getFullYear();
        if (y < min) min = y;
      }
    });
    (S.transfers || []).forEach((t) => {
      if (t.date) {
        const y = new Date(t.date).getFullYear();
        if (y < min) min = y;
      }
    });
    return min;
  })();
  const years = [];
  for (let y = minDataYear; y <= curY + 2; y++) years.push(y);

  const monSel =
    _pvView === "monat"
      ? `
    <select class="pivot-sel" onchange="_pvMonth=+this.value;_pvRenderTable()">
      ${MONTHS.map((m, i) => `<option value="${i}"${i === _pvMonth ? " selected" : ""}>${m}</option>`).join("")}
    </select>`
      : "";

  return `<div class="pivot-toolbar">
    <div class="pivot-vtoggle">
      <button class="pvt-btn${_pvView === "jahr" ? " active" : ""}"
        onclick="_pvView='jahr';renderPivot(_pvYear)">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>Jahr
      </button>
      <button class="pvt-btn${_pvView === "monat" ? " active" : ""}"
        onclick="_pvView='monat';renderPivot(_pvYear)">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="8" y1="6" x2="21" y2="6"/>
          <line x1="8" y1="12" x2="21" y2="12"/>
          <line x1="8" y1="18" x2="21" y2="18"/>
          <line x1="3" y1="6" x2="3.01" y2="6"/>
        </svg>Monat
      </button>
    </div>

    <!-- Jahres-Selector -->
    <select class="pivot-sel pivot-yr-sel"
      onchange="_pvYear=+this.value;renderPivot(_pvYear)">
      ${years.map((y) => `<option value="${y}"${y === _pvYear ? " selected" : ""}>${y}</option>`).join("")}
    </select>

    ${monSel}

    <!-- Konto-Filter -->
    <select class="pivot-sel" onchange="_pvFilterAccount=this.value;_pvRenderTable()" onmouseenter="_showTooltip('Konto filtern', this)" onmouseleave="_hideTooltip()">
      <option value="">Alle Konten</option>
      ${(S.accounts || []).map(a => `<option value="${a.id}"${_pvFilterAccount === a.id ? " selected" : ""}>${esc(a.label)}</option>`).join("")}
    </select>

    <div class="pivot-vtoggle" style="margin-left:auto;">
      <button class="pvt-btn pvt-grp-btn${_pvGroup === "konto" ? " active" : ""}"
        onclick="_pvSetGroup('konto')" onmouseenter="_showTooltip('Nach Konto gruppieren', this)" onmouseleave="_hideTooltip()">Konto</button>
      <button class="pvt-btn pvt-grp-btn${_pvGroup === "typ" ? " active" : ""}"
        onclick="_pvSetGroup('typ')" onmouseenter="_showTooltip('Nach Typ gruppieren', this)" onmouseleave="_hideTooltip()">Typ</button>
      <button class="pvt-btn pvt-grp-btn${_pvGroup === "flat" ? " active" : ""}"
        onclick="_pvSetGroup('flat')" onmouseenter="_showTooltip('Alle flach anzeigen', this)" onmouseleave="_hideTooltip()">Alle</button>
    </div>
    <button class="pvt-icon-btn" onclick="_pvResetOrder()" onmouseenter="_showTooltip('Reihenfolge zurücksetzen', this)" onmouseleave="_hideTooltip()">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="1 4 1 10 7 10"/>
        <path d="M3.51 15a9 9 0 1 0 .49-4.95"/>
      </svg>
    </button>
    <button class="pvt-icon-btn" onclick="_pvExportCSV()" onmouseenter="_showTooltip('Als CSV exportieren', this)" onmouseleave="_hideTooltip()">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    </button>

    <!-- NEU: Anlegen-Dropdown -->
    <div class="pvt-new-wrap" id="pvtNewWrap">
      <button class="btn primary pvt-new-btn" onclick="_pvToggleNewMenu(event)">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Neu
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-left:2px;">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <div class="pvt-new-menu" id="pvtNewMenu">
        <div class="pvt-new-label">Fixposten</div>
        <button class="pvt-new-item" onclick="_pvNewPosten('ausgabe')">
          <span class="pvt-new-dot" style="background:var(--red)"></span>
          Neue Ausgabe
          <span class="pvt-new-hint">Miete, Abo, Versicherung…</span>
        </button>
        <button class="pvt-new-item" onclick="_pvNewPosten('einnahme')">
          <span class="pvt-new-dot" style="background:var(--green)"></span>
          Neue Einnahme
          <span class="pvt-new-hint">Gehalt, Zinsen, Mieteinnahme…</span>
        </button>
        <div class="pvt-new-divider"></div>
        <div class="pvt-new-label">Einzelbuchung</div>
        <button class="pvt-new-item" onclick="_pvNewEinmalig('ausgabe')">
          <span class="pvt-new-dot" style="background:var(--amber)"></span>
          Einmalige Ausgabe
          <span class="pvt-new-hint">Reparatur, Anschaffung…</span>
        </button>
        <button class="pvt-new-item" onclick="_pvNewEinmalig('einnahme')">
          <span class="pvt-new-dot" style="background:var(--teal)"></span>
          Einmalige Einnahme
          <span class="pvt-new-hint">Bonus, Verkauf…</span>
        </button>
        <div class="pvt-new-divider"></div>
        <div class="pvt-new-label">Planung</div>
        <button class="pvt-new-item" onclick="_pvNewTransfer()">
          <span class="pvt-new-dot" style="background:var(--blue)"></span>
          Umbuchung
          <span class="pvt-new-hint">Sparplan, Depot…</span>
        </button>
        <button class="pvt-new-item" onclick="_pvNewSparplan()">
          <span class="pvt-new-dot" style="background:var(--blue)"></span>
          Sparplan / Ziel
          <span class="pvt-new-hint">Sparrate als Fixposten…</span>
        </button>
      </div>
    </div>
  </div>`;
}

// ── NEU-MENÜ ──────────────────────────
function _pvToggleNewMenu(e) {
  e.stopPropagation();
  const menu = document.getElementById("pvtNewMenu");
  if (!menu) return;
  const isOpen = menu.classList.contains("open");
  menu.classList.toggle("open", !isOpen);
  if (!isOpen) {
    setTimeout(
      () => document.addEventListener("click", _pvCloseNewMenu, { once: true }),
      10,
    );
  }
}
function _pvCloseNewMenu() {
  document.getElementById("pvtNewMenu")?.classList.remove("open");
}

function _pvNewPosten(type) {
  _pvCloseNewMenu();
  // Modal öffnen mit Typ vorbelegt
  openModal();
  // Typ nach kurzem Delay setzen (Modal braucht einen Tick zum Rendern)
  setTimeout(() => {
    const fType = document.getElementById("fType");
    if (fType) {
      fType.value = type;
      // Intervall auf monatl. vorbelegen
      const fInterval = document.getElementById("fInterval");
      if (fInterval) fInterval.value = "monatl.";
      // contractStart auf aktuellen Monat
      const fStart = document.getElementById("fStart");
      if (fStart && !fStart.value) {
        const n = new Date();
        fStart.value = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-01`;
      }
    }
  }, 50);
}

function _pvNewEinmalig(type) {
  _pvCloseNewMenu();
  openModal();
  setTimeout(() => {
    const fType = document.getElementById("fType");
    if (fType) fType.value = type;
    const fInterval = document.getElementById("fInterval");
    if (fInterval) fInterval.value = "einmalig";
    // Datum = aktuelles Pivot-Jahr + aktueller Monat
    const fStart = document.getElementById("fStart");
    if (fStart) {
      const m = _pvView === "monat" ? _pvMonth : new Date().getMonth();
      fStart.value = `${_pvYear}-${String(m + 1).padStart(2, "0")}-01`;
    }
    const fEnd = document.getElementById("fEnd");
    if (fEnd) fEnd.value = "";
  }, 50);
}

function _pvNewTransfer() {
  _pvCloseNewMenu();
  openModal(null, "transfer");
}

function _pvNewSparplan() {
  _pvCloseNewMenu();
  // Sparziel-Modal öffnen falls vorhanden, sonst Posten-Modal mit Sparplan-Defaults
  if (typeof openGoalModal === "function") {
    openGoalModal();
  } else {
    openModal();
    setTimeout(() => {
      const fType = document.getElementById("fType");
      if (fType) fType.value = "ausgabe";
      const fInterval = document.getElementById("fInterval");
      if (fInterval) fInterval.value = "monatl.";
      const fName = document.getElementById("fName");
      if (fName) fName.placeholder = "z.B. Sparplan ETF, Urlaubskasse…";
    }, 50);
  }
}

// ── SPALTEN ───────────────────────────
function _pvCols() {
  if (_pvView === "monat") {
    const days = new Date(_pvYear, _pvMonth + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => ({
      label: String(i + 1),
      mIdx: _pvMonth,
      day: i + 1,
    }));
  }
  return MONTHS_S.map((m, i) => ({ label: m, mIdx: i, day: null }));
}

// ── DOPPELZÄHLUNG-SCHUTZ ─────────────
// Transfers die auch als Fixposten in S.data stehen → nur einmal zählen
function _pvIsTransferDuplicate(transfer) {
  return S.data.some(
    (p) =>
      p.type === "ausgabe" &&
      p.accountId === transfer.fromId &&
      Math.abs(
        (parseFloat(p.amount) || 0) - (parseFloat(transfer.amount) || 0),
      ) < 0.01 &&
      (p.note || "").toLowerCase().includes("→") === false, // kein expliziter Transfer-Posten
    // Wenn Posten explizit als Transfer-Posten angelegt: amount + accountId matchen
  );
}

// ── BETRAG FÜR ZELLE ─────────────────
function _pvCellAmt(item, col) {
  const { mIdx, day } = col;
  const yr = _pvYear;

  if (item.kind === "posten") {
    const p = item.ref;
    if (day !== null) {
      const due = parseInt(p.due) || 0;
      if (due !== day) return 0;
    }
    if (!_pvIsActiveInMonth(p, mIdx, yr)) return 0;
    // Override prüfen (hat Priorität über alles)
    const oKey = `${yr}-${String(mIdx + 1).padStart(2, "0")}`;
    if (p.overrides && oKey in p.overrides) {
      const ov = p.overrides[oKey];
      // Neues Format: { amount, status, note } — altes Format: Zahl
      if (typeof ov === "object" && ov !== null) {
        if (ov.status === "ausgesetzt") return 0;
        return typeof ov.amount === "number"
          ? ov.amount
          : parseFloat(p.amount) || 0;
      }
      return ov; // altes Format: direkt Zahl
    }
    // monthActualForYear liefert bereits den korrekten anteiligen Betrag (z.B. viertelj.)
    if (typeof monthActualForYear === "function") {
      const v = monthActualForYear(p, mIdx, yr);
      return v > 0 ? v : parseFloat(p.amount) || 0;
    }
    return parseFloat(p.amount) || 0;
  }

  if (item.kind === "transfer") {
    const t = item.ref;
    if (day !== null) {
      // Monatsansicht: Ausführungstag
      const execDay =
        parseInt(t.execDay) || (t.date ? new Date(t.date).getDate() : 0);
      if (execDay !== day) return 0;
    }
    if (!_pvTransferActiveInMonth(t, mIdx, yr)) return 0;
    // Wenn die Buchung für diesen Monat manuell ausgesetzt wurde, 0 anzeigen
    const mk = `${yr}-${String(mIdx + 1).padStart(2, "0")}`;
    const suspendedBk = (S.bookings || []).find(
      (b) => b.transferId === t.id && b.monthKey === mk && b.status === "ausgesetzt"
    );
    if (suspendedBk) return 0;
    return parseFloat(t.amount) || 0;
  }

  if (item.kind === "booking") {
    const b = item.ref;
    if (!b.date) return 0;
    const d = new Date(b.date);
    if (d.getFullYear() !== yr || d.getMonth() !== mIdx) return 0;
    if (day !== null && d.getDate() !== day) return 0;
    return parseFloat(b.amount) || 0;
  }

  return 0;
}

// ── AKTIV-CHECK POSTEN (immer year-aware) ────────────────
// WICHTIG: activeInMonth() aus utils.js ignoriert das Jahr — hier eigene Logik
function _pvIsActiveInMonth(p, mIdx, yr) {
  // monthActualForYear ist year-aware wenn vorhanden
  if (typeof monthActualForYear === "function") {
    return monthActualForYear(p, mIdx, yr) > 0;
  }
  // Eigene vollständige year-aware Implementierung
  const intv = p.interval || "monatl.";
  if (intv === "einmalig") {
    const d = p.contractStart ? new Date(p.contractStart) : null;
    return d && d.getMonth() === mIdx && d.getFullYear() === yr;
  }
  // contractStart/End: Monatsgrenzen mit Jahr prüfen
  if (p.contractStart) {
    const cs = new Date(p.contractStart);
    if (new Date(yr, mIdx + 1, 0) < cs) return false; // Monat endet vor Start
  }
  if (p.contractEnd) {
    const ce = new Date(p.contractEnd);
    if (new Date(yr, mIdx, 1) > ce) return false; // Monat beginnt nach Ende
  }
  if (intv === "monatl.") return true;
  // Intervall-Berechnung: immer relativ zum contractStart oder Jahresanfang
  const mse = yr * 12 + mIdx;
  const start = p.contractStart
    ? new Date(p.contractStart)
    : new Date(yr, 0, 1);
  const diff = mse - (start.getFullYear() * 12 + start.getMonth());
  if (diff < 0) return false;
  if (intv === "viertelj.") return diff % 3 === 0;
  if (intv === "halbjährl.") return diff % 6 === 0;
  if (intv === "jährl.") return diff % 12 === 0;
  return true;
}

// ── AKTIV-CHECK TRANSFER ─────────────
function _pvTransferActiveInMonth(t, mIdx, yr) {
  if (t.interval && t.interval !== "einmalig") {
    // Wiederkehrend
    if (
      t.contractStart &&
      new Date(t.contractStart) > new Date(yr, mIdx + 1, 0)
    )
      return false;
    if (t.contractEnd && new Date(t.contractEnd) < new Date(yr, mIdx, 1))
      return false;
    const intv = t.interval;
    const mse = yr * 12 + mIdx;
    const start = t.date ? new Date(t.date) : new Date(yr, 0, 1);
    const diff = mse - (start.getFullYear() * 12 + start.getMonth());
    if (diff < 0) return false;
    if (intv === "monatl.") return true;
    if (intv === "viertelj.") return diff % 3 === 0;
    if (intv === "halbjährl.") return diff % 6 === 0;
    if (intv === "jährl.") return diff % 12 === 0;
    return true;
  }
  // Einmalig: nur im Monat des Datums
  if (!t.date) return false;
  const d = new Date(t.date);
  return d.getMonth() === mIdx && d.getFullYear() === yr;
}

// ── ZEILEN AUFBAUEN ───────────────────
function _pvBuildRows() {
  const rows = [];

  // Posten — nur wenn im gewählten Jahr in mind. einem Monat aktiv
  S.data.forEach((p) => {
    // Prüfe ob der Posten im gewählten Jahr irgendwann aktiv ist
    // Einmalig: nur wenn contractStart im gewählten Jahr liegt
    if ((p.interval || "monatl.") === "einmalig") {
      if (!p.contractStart) return;
      if (new Date(p.contractStart).getFullYear() !== _pvYear) return;
    } else {
      // Wiederkehrend: mindestens ein Monat im Jahr muss aktiv sein
      const activeAnyMonth = Array.from({ length: 12 }, (_, m) => m).some((m) =>
        _pvIsActiveInMonth(p, m, _pvYear),
      );
      if (!activeAnyMonth) return;
    }

    rows.push({
      kind: "posten",
      id: "p_" + p.id,
      ref: p,
      label: p.name,
      type: p.type, // "einnahme" | "ausgabe"
      accountId: p.accountId,
      interval: p.interval,
      isTransferPosten:
        (p.note || "").includes("→") && (p.interval || "") !== "einmalig",
    });
  });

  // Transfers (nur wenn NICHT bereits als Posten doppelt + im Jahr aktiv)
  (S.transfers || []).forEach((t) => {
    // Prüfe ob dieser Transfer schon als Posten erfasst ist
    const alreadyAsPosten = S.data.some(
      (p) =>
        p.accountId === t.fromId &&
        Math.abs((parseFloat(p.amount) || 0) - (parseFloat(t.amount) || 0)) <
          0.01 &&
        p.type === "ausgabe",
    );
    if (alreadyAsPosten) return; // nicht doppelt anzeigen

    // Prüfe ob Transfer im gewählten Jahr irgendwann aktiv ist
    if (t.interval && t.interval !== "einmalig") {
      const activeAnyMonth = Array.from({ length: 12 }, (_, m) => m).some((m) =>
        _pvTransferActiveInMonth(t, m, _pvYear),
      );
      if (!activeAnyMonth) return;
    } else {
      // Einmalig: nur im Jahr des Datums
      if (!t.date) return;
      if (new Date(t.date).getFullYear() !== _pvYear) return;
    }

    rows.push({
      kind: "transfer",
      id: "t_" + t.id,
      ref: t,
      label: (() => {
        const from = S.accounts.find((a) => a.id === t.fromId);
        const to = S.accounts.find((a) => a.id === t.toId);
        return (from ? from.label : "?") + " → " + (to ? to.label : "?");
      })(),
      type: "umbuchung",
      accountId: t.fromId,
      // interval: null kommt von alten Transfers → als "einmalig" anzeigen
      interval:
        t.interval && t.interval !== "einmalig" ? t.interval : "einmalig",
    });
  });

  // Manuelle Einzelbuchungen (postenId === null, transferId === null)
  // Diese tauchen nur in S.bookings auf und müssen explizit eingebunden werden
  (S.bookings || [])
    .filter((b) =>
      !b.postenId &&
      !b.transferId &&
      b.date &&
      new Date(b.date).getFullYear() === _pvYear &&
      b.status !== "ausgesetzt" &&
      b.status !== "vorgemerkt",
    )
    .forEach((b) => {
      const bkId = "bk_" + b.id;
      // Bereits als Zeile vorhanden? (Dedup bei re-render)
      if (rows.some((r) => r.id === bkId)) return;
      rows.push({
        kind: "booking",
        id: bkId,
        ref: b,
        label: b.name,
        type: b.type,
        accountId: b.accountId,
        interval: "einmalig",
      });
    });

  // Konto-Filter anwenden
  if (_pvFilterAccount) {
    return rows.filter((r) => r.accountId === _pvFilterAccount);
  }
  return rows;
}

// ── REIHENFOLGE (Drag & Drop) ─────────
function _pvGetOrderedRows(allRows) {
  if (!_pvRowOrder.length) return allRows;
  const orderMap = {};
  _pvRowOrder.forEach((id, i) => (orderMap[id] = i));
  const ordered = [...allRows].sort((a, b) => {
    const ia = orderMap[a.id] ?? 9999;
    const ib = orderMap[b.id] ?? 9999;
    return ia - ib;
  });
  return ordered;
}

function _pvSaveOrder(rows) {
  _pvRowOrder = rows.map((r) => r.id);
  try { localStorage.setItem("csf_pv_order", JSON.stringify(_pvRowOrder)); } catch(e) {}
}

function _pvLoadOrder() {
  try {
    const raw = localStorage.getItem("csf_pv_order");
    if (raw) _pvRowOrder = JSON.parse(raw);
  } catch(e) {}
}

// Gruppe umschalten ohne Toolbar neu zu bauen (Animation bleibt erhalten)
function _pvSetGroup(g) {
  _pvGroup = g;
  document.querySelectorAll(".pvt-grp-btn").forEach(btn => {
    const isActive = btn.title === "Nach Konto" && g === "konto"
      || btn.title === "Nach Typ"   && g === "typ"
      || btn.title === "Alle flach" && g === "flat";
    btn.classList.toggle("active", isActive);
  });
  _pvRenderTable();
}

function _pvResetOrder() {
  _pvRowOrder = [];
  _pvFilterAccount = "";
  try { localStorage.removeItem("csf_pv_order"); } catch(e) {}
  renderPivot(_pvYear);
}

// ── GRUPPIERUNG ───────────────────────
function _pvGroupRows(rows) {
  if (_pvGroup === "flat") return [{ label: null, rows }];

  if (_pvGroup === "typ") {
    const ein = rows.filter((r) => r.type === "einnahme");
    const aus = rows.filter((r) => r.type === "ausgabe");
    const trf = rows.filter((r) => r.type === "umbuchung");
    const res = [];
    if (ein.length)
      res.push({ label: "Einnahmen", rows: ein, type: "einnahme" });
    if (aus.length) res.push({ label: "Ausgaben", rows: aus, type: "ausgabe" });
    if (trf.length)
      res.push({ label: "Umbuchungen", rows: trf, type: "umbuchung" });
    return res;
  }

  // group by konto
  const accMap = {};
  const noAcc = [];
  rows.forEach((r) => {
    const acc = S.accounts.find((a) => a.id === r.accountId);
    if (!acc) {
      noAcc.push(r);
      return;
    }
    if (!accMap[acc.id])
      accMap[acc.id] = { label: acc.label, color: acc.color, rows: [], acc };
    accMap[acc.id].rows.push(r);
  });
  const res = Object.values(accMap).sort((a, b) =>
    a.label.localeCompare(b.label),
  );
  if (noAcc.length)
    res.push({ label: "Ohne Konto", rows: noAcc, color: "var(--border2)" });
  return res;
}

// ── HAUPT-RENDER ──────────────────────
function _pvRenderTable() {
  const wrap = document.getElementById("pvTblWrap");
  const footer = document.getElementById("pvFooter");
  if (!wrap) return;

  const cols = _pvCols();
  const allRows = _pvGetOrderedRows(_pvBuildRows());
  const groups = _pvGroupRows(allRows);

  const n = typeof today === "function" ? today() : new Date();
  const curM = n.getMonth();
  const curY = n.getFullYear();
  const todayD = n.getDate();

  // Gesamttotals
  let grandInc = 0,
    grandExp = 0;

  let html = `<div class="pv-scroll"><table class="pv-table">`;

  // ── HEADER ──
  html += `<thead><tr>`;
  html += `<th class="pv-th-drag"></th>`;
  html += `<th class="pv-th-name">Posten</th>`;
  cols.forEach((c) => {
    const isCur =
      _pvView === "monat"
        ? c.day === todayD && curM === _pvMonth && curY === _pvYear
        : _pvYear === curY && c.mIdx === curM;
    html += `<th class="pv-th-col${isCur ? " pv-th-cur" : ""}">${c.label}</th>`;
  });
  html += `<th class="pv-th-sum">Gesamt</th>`;
  html += `</tr></thead><tbody id="pvTbody">`;

  // ── GRUPPEN ──
  groups.forEach((grp) => {
    let grpInc = 0,
      grpExp = 0;

    // Section-Header
    if (grp.label) {
      const dot = grp.color
        ? `<span class="pv-acc-dot" style="background:${grp.color}"></span>`
        : "";
      html += `<tr class="pv-section-head">
        <td></td>
        <td colspan="${cols.length + 2}">${dot}${esc(grp.label)}</td>
      </tr>`;
    }

    // Datenzeilen
    grp.rows.forEach((row) => {
      const isInc = row.type === "einnahme";
      const isTrf = row.type === "umbuchung";
      const acc = S.accounts.find((a) => a.id === row.accountId);
      const dot = acc
        ? `<span class="pv-acc-dot" style="background:${acc.color}"></span>`
        : "";

      // Zeilensumme
      let rowTotal = 0;
      const cells = cols.map((c) => {
        const v = _pvCellAmt(row, c);
        rowTotal += v;
        return v;
      });

      if (isInc) grpInc += rowTotal;
      else if (!isTrf) grpExp += rowTotal;

      // Edit-Button Ziel
      const editCall =
        row.kind === "posten"
          ? `openModal(${S.data.indexOf(row.ref)})`
          : `openModal(null,'transfer','${row.ref.id}')`;

      // Intervall-Badge
      const itvCls = isInc ? "pv-itv-in" : isTrf ? "pv-itv-trf" : "pv-itv-out";
      const itvBadge = `<span class="pv-itv ${itvCls}">${row.interval || "—"}</span>`;

      html += `<tr class="pv-row" draggable="true"
          data-pvid="${row.id}"
          ondragstart="_pvDragStart(event,'${row.id}')"
          ondragover="_pvDragOver(event)"
          ondrop="_pvDrop(event,'${row.id}')"
          ondragend="_pvDragEnd(event)">
        <td class="pv-td-drag" onmouseenter="_showTooltip('Zeile verschieben', this)" onmouseleave="_hideTooltip()"
          ondragstart="event.stopPropagation()" onclick="event.stopPropagation()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" opacity=".4">
            <circle cx="9" cy="6" r="1" fill="currentColor" stroke="none"/>
            <circle cx="15" cy="6" r="1" fill="currentColor" stroke="none"/>
            <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none"/>
            <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none"/>
            <circle cx="9" cy="18" r="1" fill="currentColor" stroke="none"/>
            <circle cx="15" cy="18" r="1" fill="currentColor" stroke="none"/>
          </svg>
        </td>
        <td class="pv-td-name pv-td-clickable" onclick="${editCall}" onmouseenter="_showTooltip('Serie bearbeiten', this)" onmouseleave="_hideTooltip()">
          <div class="pv-name-inner">
            ${dot}
            <span class="pv-name-txt" title="${esc(row.label)}">${esc(row.label)}</span>
            ${itvBadge}
            <span class="pv-name-hint">✎</span>
          </div>
        </td>`;

      cells.forEach((v, ci) => {
        const isCur =
          _pvView === "monat"
            ? cols[ci].day === todayD && curM === _pvMonth && curY === _pvYear
            : _pvYear === curY && cols[ci].mIdx === curM;
        const amtCls =
          v > 0 ? (isInc ? "pv-in" : isTrf ? "pv-trf" : "pv-out") : "";
        const prefix = v > 0 ? (isInc ? "+" : isTrf ? "⇄" : "−") : "";
        // Override-Markierung
        const oKey2 = `${_pvYear}-${String(cols[ci].mIdx + 1).padStart(2, "0")}`;
        const _oRaw =
          row.kind === "posten" && row.ref.overrides
            ? row.ref.overrides[oKey2]
            : undefined;
        const hasOvr = _oRaw !== undefined;
        // Neues Format: Objekt; altes Format: Zahl
        const _oAmt = hasOvr
          ? typeof _oRaw === "object"
            ? _oRaw.amount
            : _oRaw
          : undefined;
        const _oPaused =
          hasOvr &&
          ((typeof _oRaw === "object" &&
            (_oRaw.status === "ausgesetzt" || _oRaw.amount === 0)) ||
            (typeof _oRaw === "number" && _oRaw === 0));
        const _oSettled =
          hasOvr && typeof _oRaw === "object" && _oRaw.status === "beglichen";
        // Zelle klickbar wenn aktiv → Popover
        const colLabel =
          _pvView === "monat"
            ? `${cols[ci].day}. ${MONTHS[_pvMonth]} ${_pvYear}`
            : `${MONTHS_S[cols[ci].mIdx]} ${_pvYear}`;
        const isActive =
          _pvIsActiveInMonth(row.ref || {}, cols[ci].mIdx, _pvYear) || hasOvr;
        const cellClick =
          v > 0 || _oPaused
            ? ` onclick="_pvShowPopover(event,'${row.id}',${ci},'${colLabel.replace(/'/g, "\\'")}','${editCall.replace(/'/g, "\\'")}',${v})" onmouseenter="_showTooltip('Details', this)" onmouseleave="_hideTooltip()"`
            : isActive && row.kind === "posten"
              ? ` onclick="_pvShowPopover(event,'${row.id}',${ci},'${colLabel.replace(/'/g, "\\'")}','${editCall.replace(/'/g, "\\'")}',${v})" onmouseenter="_showTooltip('Betrag überschreiben', this)" onmouseleave="_hideTooltip()"`
              : "";
        const tdExtra = hasOvr ? (_oSettled ? " pv-td-settled" : " pv-td-override") : "";
        const clickable = cellClick ? " pv-td-clickable" : "";
        html += `<td class="pv-td${isCur ? " pv-col-cur" : ""}${clickable}${tdExtra}"${cellClick}>`;
        if (v > 0) {
          html += `<span class="pv-amt ${amtCls}">${prefix}${_pvFmt(v)}</span>`;
          if (_oSettled) html += `<span class="pv-settled-mark" onmouseenter="_showTooltip('Beglichen${_oRaw.paidDate && _oRaw.paidDate !== _oRaw.settledAt?.slice(0,10) ? ' am ' + new Date(_oRaw.paidDate).toLocaleDateString('de-DE') : ''}', this)" onmouseleave="_hideTooltip()">✓</span>`;
        } else if (_oPaused) {
          // Ausgesetzte Buchung: zeige ∅ statt — damit erkennbar
          html += `<span class="pv-zero pv-zero-paused" onmouseenter="_showTooltip('Ausgesetzt', this)" onmouseleave="_hideTooltip()">∅</span>`;
        } else if (_oSettled) {
          html += `<span class="pv-zero pv-settled-zero" onmouseenter="_showTooltip('Beglichen', this)" onmouseleave="_hideTooltip()">✓</span>`;
        } else {
          html += `<span class="pv-zero">—</span>`;
        }
        html += `</td>`;
      });

      // Zeilensumme
      const totCls =
        rowTotal > 0 ? (isInc ? "pv-in" : isTrf ? "pv-trf" : "pv-out") : "";
      const totPfx = rowTotal > 0 ? (isInc ? "+" : isTrf ? "⇄" : "−") : "";
      html += `<td class="pv-td pv-td-sum">`;
      if (rowTotal > 0)
        html += `<span class="pv-amt ${totCls}">${totPfx}${_pvFmt(rowTotal)}</span>`;
      else html += `<span class="pv-zero">—</span>`;
      html += `</td></tr>`;
    });

    // Gruppen-Summenzeilen (nur wenn Konto-Gruppierung)
    if (_pvGroup === "konto" && grp.label) {
      if (grpInc > 0) {
        html += `<tr class="pv-grp-sum pv-grp-sum-in">
          <td></td>
          <td class="pv-td-name pv-sum-lbl">Σ Einnahmen ${esc(grp.label)}</td>`;
        let colSum = 0;
        cols.forEach((c) => {
          let s = 0;
          grp.rows
            .filter((r) => r.type === "einnahme")
            .forEach((r) => (s += _pvCellAmt(r, c)));
          colSum += s;
          html += `<td class="pv-td">${s > 0 ? `<span class="pv-amt pv-in">+${_pvFmt(s)}</span>` : `<span class="pv-zero">—</span>`}</td>`;
        });
        html += `<td class="pv-td pv-td-sum"><span class="pv-amt pv-in">+${_pvFmt(grpInc)}</span></td></tr>`;
      }
      if (grpExp > 0) {
        html += `<tr class="pv-grp-sum pv-grp-sum-out">
          <td></td>
          <td class="pv-td-name pv-sum-lbl">Σ Ausgaben ${esc(grp.label)}</td>`;
        cols.forEach((c) => {
          let s = 0;
          grp.rows
            .filter((r) => r.type === "ausgabe")
            .forEach((r) => (s += _pvCellAmt(r, c)));
          html += `<td class="pv-td">${s > 0 ? `<span class="pv-amt pv-out">−${_pvFmt(s)}</span>` : `<span class="pv-zero">—</span>`}</td>`;
        });
        html += `<td class="pv-td pv-td-sum"><span class="pv-amt pv-out">−${_pvFmt(grpExp)}</span></td></tr>`;
      }
      // Diff-Zeile pro Konto
      if (grpInc > 0 || grpExp > 0) {
        const diff = grpInc - grpExp;
        html += `<tr class="pv-grp-diff">
          <td></td>
          <td class="pv-td-name pv-sum-lbl">Diff ${esc(grp.label)}</td>`;
        cols.forEach((c) => {
          let inc = 0,
            exp = 0;
          grp.rows.forEach((r) => {
            const v = _pvCellAmt(r, c);
            if (r.type === "einnahme") inc += v;
            else if (r.type === "ausgabe") exp += v;
          });
          const d = inc - exp;
          const hasAny = inc > 0 || exp > 0;
          html += `<td class="pv-td">${hasAny ? `<span class="pv-amt ${d >= 0 ? "pv-in" : "pv-out"}">${d >= 0 ? "+" : "−"}${_pvFmt(Math.abs(d))}</span>` : `<span class="pv-zero">—</span>`}</td>`;
        });
        html += `<td class="pv-td pv-td-sum"><span class="pv-amt ${diff >= 0 ? "pv-in" : "pv-out"}">${diff >= 0 ? "+" : "−"}${_pvFmt(Math.abs(diff))}</span></td></tr>`;
      }

      grandInc += grpInc;
      grandExp += grpExp;
    } else {
      grp.rows.forEach((r) => {
        if (r.type === "einnahme") {
          let tot = 0;
          cols.forEach((c) => (tot += _pvCellAmt(r, c)));
          grandInc += tot;
        } else if (r.type === "ausgabe") {
          let tot = 0;
          cols.forEach((c) => (tot += _pvCellAmt(r, c)));
          grandExp += tot;
        }
      });
    }
  });

  // ── GESAMT-SUMMENZEILEN (nur wenn >1 Gruppe, sonst redundant) ──
  const grandBal = grandInc - grandExp;
  const showGrandTotal = groups.length > 1;

  if (showGrandTotal) {
    html += `<tr class="pv-total-row pv-total-inc">
      <td></td>
      <td class="pv-td-name pv-sum-lbl">Σ Einnahmen gesamt</td>`;
    cols.forEach((c) => {
      let s = 0;
      allRows
        .filter((r) => r.type === "einnahme")
        .forEach((r) => (s += _pvCellAmt(r, c)));
      html += `<td class="pv-td">${s > 0 ? `<span class="pv-amt pv-in pv-bold">+${_pvFmt(s)}</span>` : `<span class="pv-zero">—</span>`}</td>`;
    });
    html += `<td class="pv-td pv-td-sum"><span class="pv-amt pv-in pv-bold">+${_pvFmt(grandInc)}</span></td></tr>`;

    html += `<tr class="pv-total-row pv-total-out">
      <td></td>
      <td class="pv-td-name pv-sum-lbl">Σ Ausgaben gesamt</td>`;
    cols.forEach((c) => {
      let s = 0;
      allRows
        .filter((r) => r.type === "ausgabe")
        .forEach((r) => (s += _pvCellAmt(r, c)));
      html += `<td class="pv-td">${s > 0 ? `<span class="pv-amt pv-out pv-bold">−${_pvFmt(s)}</span>` : `<span class="pv-zero">—</span>`}</td>`;
    });
    html += `<td class="pv-td pv-td-sum"><span class="pv-amt pv-out pv-bold">−${_pvFmt(grandExp)}</span></td></tr>`;
  }

  // Verfügbar gesamt immer anzeigen (aber Label anpassen)
  const balLabel = showGrandTotal ? "Verfügbar gesamt" : "Verfügbar";
  html += `<tr class="pv-total-row pv-total-bal">
    <td></td>
    <td class="pv-td-name pv-sum-lbl">${balLabel}</td>`;
  cols.forEach((c) => {
    let inc = 0,
      exp = 0;
    allRows.forEach((r) => {
      const v = _pvCellAmt(r, c);
      if (r.type === "einnahme") inc += v;
      else if (r.type === "ausgabe") exp += v;
    });
    const d = inc - exp;
    const has = inc > 0 || exp > 0;
    html += `<td class="pv-td">${has ? `<span class="pv-amt ${d >= 0 ? "pv-in" : "pv-out"} pv-bold">${d >= 0 ? "+" : "−"}${_pvFmt(Math.abs(d))}</span>` : `<span class="pv-zero">—</span>`}</td>`;
  });
  html += `<td class="pv-td pv-td-sum"><span class="pv-amt ${grandBal >= 0 ? "pv-in" : "pv-out"} pv-bold">${grandBal >= 0 ? "+" : "−"}${_pvFmt(Math.abs(grandBal))}</span></td></tr>`;

  html += `</tbody></table></div>`;
  wrap.innerHTML = html;

  // Footer Pills
  footer.innerHTML = `<div class="pv-pills">
    <div class="pv-pill pv-pill-in">
      <span class="pv-pill-lbl">Σ Einnahmen</span>
      <span class="pv-pill-val">+${_pvFmt(grandInc)} €</span>
    </div>
    <div class="pv-pill pv-pill-out">
      <span class="pv-pill-lbl">Σ Ausgaben</span>
      <span class="pv-pill-val">−${_pvFmt(grandExp)} €</span>
    </div>
    <div class="pv-pill ${grandBal >= 0 ? "pv-pill-bal-pos" : "pv-pill-bal-neg"}">
      <span class="pv-pill-lbl">Verfügbar</span>
      <span class="pv-pill-val">${grandBal >= 0 ? "+" : "−"}${_pvFmt(Math.abs(grandBal))} €</span>
    </div>
  </div>`;
}

// ── FORMAT ────────────────────────────
function _pvFmt(v) {
  return Math.abs(v).toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ── DRAG & DROP ───────────────────────
function _pvDragStart(e, id) {
  _pvDragSrc = id;
  e.currentTarget.classList.add("pv-dragging");
  e.dataTransfer.effectAllowed = "move";
}

function _pvDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  const row = e.currentTarget;
  document
    .querySelectorAll(".pv-row.pv-drag-over")
    .forEach((r) => r.classList.remove("pv-drag-over"));
  row.classList.add("pv-drag-over");
}

function _pvDrop(e, targetId) {
  e.preventDefault();
  if (!_pvDragSrc || _pvDragSrc === targetId) return;

  // Aktuelle DOM-Reihenfolge auslesen
  const rows = [...document.querySelectorAll(".pv-row[data-pvid]")];
  const ids = rows.map((r) => r.getAttribute("data-pvid"));

  const srcIdx = ids.indexOf(_pvDragSrc);
  const tgtIdx = ids.indexOf(targetId);
  if (srcIdx === -1 || tgtIdx === -1) return;

  ids.splice(srcIdx, 1);
  ids.splice(tgtIdx, 0, _pvDragSrc);
  _pvRowOrder = ids;

  _pvDragSrc = null;
  _pvRenderTable();
}

function _pvDragEnd(e) {
  e.currentTarget.classList.remove("pv-dragging");
  document
    .querySelectorAll(".pv-drag-over")
    .forEach((r) => r.classList.remove("pv-drag-over"));
  _pvDragSrc = null;
}

// ══════════════════════════════════════
//  PIVOT POPOVER — Einzelzellen-Details
// ══════════════════════════════════════

function _pvShowPopover(event, rowId, colIdx, colLabel, editCall, amount) {
  event.stopPropagation();
  _pvClosePopover();

  // Zeile finden
  const allRows = _pvBuildRows();
  const row = allRows.find((r) => r.id === rowId);
  if (!row) return;

  const isInc = row.type === "einnahme";
  const isTrf = row.type === "umbuchung";
  const acc = S.accounts.find((a) => a.id === row.accountId);
  const amtCls = isInc ? "pv-in" : isTrf ? "pv-trf" : "pv-out";
  const prefix = isInc ? "+" : isTrf ? "⇄" : "−";

  // Intervall-Info
  let intervalInfo = row.interval || "—";
  if (row.ref && row.ref.due) intervalInfo += ` · fällig am ${row.ref.due}.`;

  // Laufzeit
  let laufzeit = "";
  if (row.ref) {
    const s = row.ref.contractStart
      ? new Date(row.ref.contractStart).toLocaleDateString("de-DE", {
          month: "2-digit",
          year: "numeric",
        })
      : null;
    const e = row.ref.contractEnd
      ? new Date(row.ref.contractEnd).toLocaleDateString("de-DE")
      : null;
    if (s && e) laufzeit = `${s} – ${e}`;
    else if (s) laufzeit = `ab ${s}`;
  }

  // Override-Key für diesen Monat
  const oKey = (() => {
    if (_pvView === "monat")
      return `${_pvYear}-${String(_pvMonth + 1).padStart(2, "0")}`;
    const col = _pvCols()[colIdx];
    return `${_pvYear}-${String(col.mIdx + 1).padStart(2, "0")}`;
  })();
  const _oRawPop =
    row.kind === "posten" && row.ref.overrides
      ? row.ref.overrides[oKey]
      : undefined;
  const hasOverride = _oRawPop !== undefined;
  // Neues Format: {amount, status, note} — altes Format: Zahl
  const existingOverride = hasOverride
    ? typeof _oRawPop === "object"
      ? _oRawPop.amount
      : _oRawPop
    : null;
  const baseAmount =
    row.kind === "posten" ? parseFloat(row.ref.amount) || 0 : null;

  const pop = document.createElement("div");
  pop.id = "pvPopover";
  pop.className = "pv-popover";
  pop.innerHTML = `
    <div class="pv-pop-header">
      <div class="pv-pop-title">
        ${acc ? `<span style="background:${acc.color};width:7px;height:7px;border-radius:50%;display:inline-block;margin-right:5px;vertical-align:middle;flex-shrink:0;"></span>` : ""}
        <span>${esc(row.label)}</span>
      </div>
      <button class="pv-pop-close" onclick="_pvClosePopover()">✕</button>
    </div>
    <div class="pv-pop-period">${esc(colLabel)}</div>
    <div class="pv-pop-amount">
      <span class="pv-amt ${amtCls}" style="font-size:1.1em;font-weight:700;">${prefix}${_pvFmt(amount)} €</span>
      ${hasOverride ? `<span class="pv-pop-override-badge">Überschrieben · Original: ${prefix}${_pvFmt(baseAmount)} €</span>` : ""}
    </div>
    <div class="pv-pop-meta">
      <div class="pv-pop-meta-row">
        <span class="pv-pop-meta-lbl">Intervall</span>
        <span class="pv-pop-meta-val">${esc(intervalInfo)}</span>
      </div>
      ${
        acc
          ? `<div class="pv-pop-meta-row">
        <span class="pv-pop-meta-lbl">Konto</span>
        <span class="pv-pop-meta-val">${esc(acc.label)}</span>
      </div>`
          : ""
      }
      ${
        laufzeit
          ? `<div class="pv-pop-meta-row">
        <span class="pv-pop-meta-lbl">Laufzeit</span>
        <span class="pv-pop-meta-val">${esc(laufzeit)}</span>
      </div>`
          : ""
      }
      ${
        row.ref && row.ref.note
          ? `<div class="pv-pop-meta-row">
        <span class="pv-pop-meta-lbl">Notiz</span>
        <span class="pv-pop-meta-val">${esc(row.ref.note)}</span>
      </div>`
          : ""
      }
    </div>
    ${
      row.kind === "posten"
        ? `
    <div class="pv-pop-override">
      <div class="pv-pop-override-label">Betrag nur für ${esc(colLabel)} überschreiben</div>
      <div class="pv-pop-override-row">
        <input class="pv-pop-inp" id="pvOverrideInp" type="number" step="0.01" min="0"
          placeholder="${_pvFmt(baseAmount)}"
          value="${hasOverride && existingOverride > 0 ? existingOverride : ""}"
          onkeydown="if(event.key==='Enter')_pvSaveOverride('${row.ref.id}','${oKey}')">
        <span class="pv-pop-inp-unit">€</span>
        <button class="btn primary pv-pop-save-btn"
          onclick="_pvSaveOverride('${row.ref.id}','${oKey}')">
          Speichern
        </button>
      </div>
      <button class="pv-pop-aussetzen-btn"
        onclick="_pvSaveOverride('${row.ref.id}','${oKey}',true)">
        Buchung aussetzen (0 €)
      </button>
      ${
        hasOverride
          ? `<button class="pv-pop-reset-btn"
        onclick="_pvResetOverride('${row.ref.id}','${oKey}')">
        ↺ Zurücksetzen auf ${prefix}${_pvFmt(baseAmount)} €
      </button>`
          : ""
      }
    </div>`
        : ""
    }
    <div class="pv-pop-actions">
      <button class="btn pv-pop-serie-btn" onclick="_pvClosePopover();${editCall}">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Serie bearbeiten
      </button>
    </div>`;

  document.body.appendChild(pop);

  // Position: relativ zur geklickten Zelle
  const td = event.currentTarget;
  const rect = td.getBoundingClientRect();
  const scrollY = window.scrollY || 0;
  const scrollX = window.scrollX || 0;

  let top = rect.bottom + scrollY + 6;
  let left = rect.left + scrollX;

  // Nicht aus dem Viewport fallen
  requestAnimationFrame(() => {
    const pw = pop.offsetWidth || 240;
    const ph = pop.offsetHeight || 200;
    if (left + pw > window.innerWidth - 12) left = window.innerWidth - pw - 12;
    if (top + ph > window.innerHeight + scrollY - 12)
      top = rect.top + scrollY - ph - 6;
    if (left < 8) left = 8;
    pop.style.top = top + "px";
    pop.style.left = left + "px";
    pop.style.opacity = "1";
    pop.style.transform = "translateY(0)";
  });

  // Klick außerhalb schließt
  setTimeout(() => {
    document.addEventListener("click", _pvPopoverOutsideClick, { once: true });
  }, 10);
}

function _pvPopoverOutsideClick(e) {
  const pop = document.getElementById("pvPopover");
  if (pop && !pop.contains(e.target)) _pvClosePopover();
}

function _pvClosePopover() {
  const pop = document.getElementById("pvPopover");
  if (pop) pop.remove();
  document.removeEventListener("click", _pvPopoverOutsideClick);
}

// ══════════════════════════════════════
//  OVERRIDE — Einzelmonat überschreiben
//  ZENTRALE SYNC-FUNKTION: schreibt immer
//  p.overrides UND S.bookings gleichzeitig
// ══════════════════════════════════════

/**
 * _pvApplyOverride(postenId, oKey, newAmt, note)
 * Schreibt Änderung in p.overrides UND in das passende S.bookings-Eintrag.
 * newAmt = null → Override entfernen (zurücksetzen)
 */
function _pvApplyOverride(postenId, oKey, newAmt, note) {
  const p = S.data.find((d) => d.id === postenId);
  if (!p) return;

  const baseAmount = parseFloat(p.amount) || 0;

  if (newAmt === null) {
    // ── RESET ──
    if (p.overrides) {
      delete p.overrides[oKey];
      if (Object.keys(p.overrides).length === 0) delete p.overrides;
    }
    // Booking zurücksetzen
    const bk = (S.bookings || []).find(
      (b) => b.postenId === postenId && b.monthKey === oKey,
    );
    if (bk) {
      bk.amount = baseAmount;
      bk.status = "gebucht";
      bk.note = p.note || "";
    }
  } else {
    // ── SETZEN ──
    const status =
      newAmt === 0
        ? "ausgesetzt"
        : newAmt !== baseAmount
          ? "geändert"
          : "gebucht";
    const noteVal = note !== undefined ? note : p.note || "";

    // p.overrides aktualisieren (neues Format: Objekt)
    if (!p.overrides) p.overrides = {};
    p.overrides[oKey] = { amount: newAmt, status, note: noteVal };

    // S.bookings aktualisieren — vorhandenen Eintrag suchen oder ggf. anlegen
    let bk = (S.bookings || []).find(
      (b) => b.postenId === postenId && b.monthKey === oKey,
    );
    if (bk) {
      bk.amount = newAmt;
      bk.status = status;
      bk.note = noteVal;
    } else {
      // Buchung existiert noch nicht (z.B. erst in der Pivot angelegt)
      // → anlegen damit Umsätze sie auch sieht
      if (!S.bookings) S.bookings = [];
      const [yr, mon] = oKey.split("-").map(Number);
      const due = parseInt(p.due) || 1;
      const daysInMonth = new Date(yr, mon, 0).getDate();
      const day = Math.min(due, daysInMonth);
      S.bookings.push({
        id: genId("bk"),
        postenId,
        transferId: null,
        date: `${yr}-${String(mon).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        monthKey: oKey,
        name: p.name,
        type: p.type,
        amount: newAmt,
        baseAmount,
        accountId: p.accountId,
        status,
        note: noteVal,
        interval: p.interval,
      });
      // Neueste zuerst
      S.bookings.sort((a, b) => b.date.localeCompare(a.date));
    }
  }

  persist();
  // Alle abhängigen Views synchron aktualisieren
  _pvClosePopover();
  _pvRenderTable();
  if (
    typeof renderPosten === "function" &&
    document.getElementById("p-posten")?.classList.contains("active")
  ) {
    renderPosten();
  }
  if (
    document.getElementById("p-jahr")?.classList.contains("active") &&
    typeof renderJahr === "function"
  ) {
    renderJahr();
  }
  if (typeof refreshDash === "function") refreshDash();
}

// ── PIVOT POPOVER SPEICHERN ───────────
function _pvSaveOverride(postenId, oKey, aussetzen = false) {
  const p = S.data.find((d) => d.id === postenId);
  if (!p) return;

  let newAmt;
  if (aussetzen) {
    newAmt = 0;
  } else {
    const inp = document.getElementById("pvOverrideInp");
    if (!inp) return;
    const val = parseFloat(inp.value.replace(",", "."));
    if (isNaN(val) || val < 0) {
      inp.style.borderColor = "var(--red)";
      inp.focus();
      return;
    }
    newAmt = val;
  }

  _pvApplyOverride(postenId, oKey, newAmt);
}

// ── PIVOT POPOVER ZURÜCKSETZEN ────────
function _pvResetOverride(postenId, oKey) {
  _pvApplyOverride(postenId, oKey, null);
}

// ══════════════════════════════════════
//  PIVOT SCROLL — Maus-Drag horizontal
//  Ermöglicht Klick+Ziehen zum Scrollen
//  (wie Touch-Scroll auf Desktop)
// ══════════════════════════════════════
(function _pvInitDragScroll() {
  // Delegiert auf .pv-scroll — auch nach re-render aktiv
  let _isDown = false;
  let _startX = 0;
  let _scrollL = 0;
  let _el = null;

  document.addEventListener("mousedown", (e) => {
    const scroll = e.target.closest(".pv-scroll");
    if (!scroll) return;
    // Nicht auslösen wenn auf klickbarem Element (Button, TD-clickable etc.)
    if (
      e.target.closest(
        "button, a, select, input, .pv-td-clickable, .pv-td-drag",
      )
    )
      return;

    _isDown = true;
    _el = scroll;
    _startX = e.pageX - scroll.offsetLeft;
    _scrollL = scroll.scrollLeft;
    scroll.classList.add("pv-dragging-scroll");
    e.preventDefault();
  });

  document.addEventListener("mouseleave", () => {
    if (!_isDown) return;
    _isDown = false;
    _el?.classList.remove("pv-dragging-scroll");
  });

  document.addEventListener("mouseup", () => {
    if (!_isDown) return;
    _isDown = false;
    _el?.classList.remove("pv-dragging-scroll");
    _el = null;
  });

  document.addEventListener("mousemove", (e) => {
    if (!_isDown || !_el) return;
    e.preventDefault();
    const x = e.pageX - _el.offsetLeft;
    const walk = (x - _startX) * 1.2; // 1.2 = Scroll-Multiplikator
    _el.scrollLeft = _scrollL - walk;
  });
})();

// ── CSV-EXPORT ────────────────────────
function _pvExportCSV() {
  const cols = _pvCols();
  const allRows = _pvGetOrderedRows(_pvBuildRows());

  function csvEsc(v) {
    const s = String(v == null ? "" : v);
    if (s.includes(";") || s.includes('"') || s.includes("\n")) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  const header = [
    "Bezeichnung", "Typ", "Konto", "Intervall",
    ...cols.map(c => c.label),
    "Summe"
  ].map(csvEsc).join(";");

  const lines = [header];
  allRows.forEach(row => {
    if (row.kind === "header") return;
    const acc = row.ref && row.ref.accountId ? getAccount(row.ref.accountId) : null;
    const name = row.ref ? (row.ref.name || row.ref.note || "") : (row.label || "");
    const typ = row.ref ? (row.ref.type || "umbuchung") : "";
    const konto = acc ? acc.label : "";
    const interval = row.ref ? (row.ref.interval || "") : "";
    const vals = cols.map(c => {
      const v = _pvCellAmt(row, c);
      return v !== 0 ? v.toFixed(2).replace(".", ",") : "";
    });
    const sum = cols.reduce((s, c) => s + _pvCellAmt(row, c), 0);
    lines.push([name, typ, konto, interval, ...vals, sum.toFixed(2).replace(".", ",")].map(csvEsc).join(";"));
  });

  const bom = "\uFEFF";
  const blob = new Blob([bom + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pivot_${_pvYear}${_pvView === "monat" ? "_" + String(_pvMonth + 1).padStart(2, "0") : ""}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("CSV exportiert", "success");
}
