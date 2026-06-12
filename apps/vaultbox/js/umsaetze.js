// ══════════════════════════════════════
//  UMSÄTZE v2 — Buchungshistorie
//  Zeigt S.bookings[] + S.transfers
//  chronologisch nach Datum
//  Nur vergangene / aktuelle Buchungen
// ══════════════════════════════════════

// ── STATE ─────────────────────────────
let _umView = "list"; // "list" | "tile"
let _umFocusMonth = null; // null = alle, "YYYY-MM" = Monatsfokus — wird beim ersten Render gesetzt
let _umFilter = {
  search: "",
  type: "all",
  accountId: "",
  dateFrom: "",
  dateTo: "",
  status: "all",
  amtMin: "",
  amtMax: "",
  iban: "", // IBAN-Filter
  interval: "all", // Intervall-Filter
  categoryId: "", // Kategorie-Filter
  creditorId: "", // Kreditor-Filter
};
let _umSort = { k: "date", asc: false }; // neueste zuerst

// ── CSV EXPORT ────────────────────────
function exportBookingsCSV() {
  const data = _umGetFiltered();
  if (!data.length) {
    if (typeof showToast === "function") showToast("Keine Buchungen zum Exportieren", "warning");
    return;
  }
  const rows = [
    ["Datum", "Name", "Typ", "Betrag (€)", "Intervall", "Konto", "Status", "Kategorie", "Kreditor", "Notiz"].join(";"),
    ...data.map((b) => {
      const acc = getAccount(b.accountId);
      const catId = b.categoryId || (b.postenId ? (S.data.find(p => p.id === b.postenId) || {}).categoryId : null);
      const credId = b.creditorId || (b.postenId ? (S.data.find(p => p.id === b.postenId) || {}).creditorId : null);
      const catName = catId ? ((S.categories || []).find(c => c.id === catId) || {}).name || "" : "";
      const credName = credId ? ((S.creditors || []).find(c => c.id === credId) || {}).name || "" : "";
      return [
        b.date || "",
        `"${(b.name || "").replace(/"/g, '""')}"`,
        b.type === "einnahme" ? "Einnahme" : b.type === "ausgabe" ? "Ausgabe" : "Übertrag",
        String(parseFloat(b.amount) || 0).replace(".", ","),
        b.interval || "",
        acc ? `"${acc.label.replace(/"/g, '""')}"` : "",
        b.status || "gebucht",
        `"${catName.replace(/"/g, '""')}"`,
        `"${credName.replace(/"/g, '""')}"`,
        `"${(b.note || "").replace(/"/g, '""')}"`,
      ].join(";");
    }),
  ];
  const csv = rows.join("\r\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `buchungen_${todayIso()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  if (typeof showToast === "function") showToast(`${data.length} Buchungen exportiert`, "success");
}

// ── EINSTIEG ──────────────────────────
function renderPosten() {
  const pg = document.getElementById("p-posten");
  if (!pg) return;

  // Standardmäßig aktuellen Monat fokussieren (einmalig beim ersten Render)
  if (_umFocusMonth === null) {
    _umFocusMonth = todayIso().slice(0, 7);
  }

  // initBookings() NICHT hier aufrufen — das passiert nur beim App-Start (index.html).
  // Ein erneuter Aufruf hier würde nach clearUserData() gelöschte Bookings
  // sofort wieder aus S.data regenerieren.

  _renderUmHeader(pg);
  _renderUmMonthNav(pg);
  _renderUmBody(pg);
}

// ── MONATSFOKUS-NAVIGATOR ─────────────
function _renderUmMonthNav(pg) {
  let navEl = pg.querySelector(".um-month-nav");
  if (!navEl) {
    navEl = document.createElement("div");
    navEl.className = "um-month-nav";
    // Nach .ph einfügen (page-header)
    const ph = pg.querySelector(".ph");
    if (ph && ph.nextSibling) {
      pg.insertBefore(navEl, ph.nextSibling);
    } else {
      pg.appendChild(navEl);
    }
  }

  // Monatsliste aus Buchungen ableiten
  const allMonths = [...new Set((S.bookings || [])
    .map(b => (b.monthKey || b.date?.slice(0, 7)))
    .filter(Boolean)
  )].sort((a, b) => b.localeCompare(a));

  const cur = _umFocusMonth;

  // KPI für fokussierten Monat — inkl. vorgemerkt (Monatsvorschau), excl. ausgesetzt
  const monthData = (S.bookings || []).filter(b => {
    if (cur && (b.monthKey || b.date?.slice(0, 7)) !== cur) return false;
    if (b.status === "ausgesetzt") return false;
    return true;
  });
  const kpiInc = monthData.filter(b => b.type === "einnahme").reduce((s, b) => s + b.amount, 0);
  const kpiExp = monthData.filter(b => b.type === "ausgabe").reduce((s, b) => s + b.amount, 0);
  const kpiSaldo = kpiInc - kpiExp;
  const kpiCount = monthData.length;

  // Monat-Label
  let monthLabel = "Alle Monate";
  if (cur) {
    const [y, m] = cur.split("-").map(Number);
    monthLabel = (MONTHS[m - 1] || "") + " " + y;
  }

  // Pfeile: prev/next Monat
  const curIdx = allMonths.indexOf(cur);
  const prevMonth = curIdx < allMonths.length - 1 ? allMonths[curIdx + 1] : null;
  const nextMonth = curIdx > 0 ? allMonths[curIdx - 1] : null;

  navEl.innerHTML = `
    <div class="umn-header">
      <div class="umn-nav">
        <button class="umn-arrow${prevMonth ? "" : " umn-arrow--dis"}"
          onclick="${prevMonth ? `_umFocusMonth='${prevMonth}';renderPosten()` : ""}" onmouseenter="_showTooltip('Vorheriger Monat',this)" onmouseleave="_hideTooltip()">‹</button>
        <div class="umn-month-label">${monthLabel}</div>
        <button class="umn-arrow${nextMonth ? "" : " umn-arrow--dis"}"
          onclick="${nextMonth ? `_umFocusMonth='${nextMonth}';renderPosten()` : ""}" onmouseenter="_showTooltip('Nächster Monat',this)" onmouseleave="_hideTooltip()">›</button>
      </div>
      <button class="umn-all-btn${!cur ? " active" : ""}"
        onclick="_umFocusMonth=null;renderPosten()">Alle anzeigen</button>
    </div>
    <div class="umn-kpis">
      <div class="umn-kpi umn-kpi--inc">
        <div class="umn-kpi-lbl">Einnahmen</div>
        <div class="umn-kpi-val">+${fm(kpiInc)}</div>
      </div>
      <div class="umn-kpi umn-kpi--exp">
        <div class="umn-kpi-lbl">Ausgaben</div>
        <div class="umn-kpi-val">−${fm(kpiExp)}</div>
      </div>
      <div class="umn-kpi umn-kpi--bal ${kpiSaldo >= 0 ? "pos" : "neg"}">
        <div class="umn-kpi-lbl">Saldo</div>
        <div class="umn-kpi-val">${kpiSaldo >= 0 ? "+" : "−"}${fm(Math.abs(kpiSaldo))}</div>
      </div>
      <div class="umn-kpi umn-kpi--cnt">
        <div class="umn-kpi-lbl">Buchungen</div>
        <div class="umn-kpi-val">${kpiCount}</div>
      </div>
    </div>`;
}

// ── HEADER ────────────────────────────
function _renderUmHeader(pg) {
  const ph = pg.querySelector(".ph");
  if (!ph) return;
  // Nur statischer Titel — Toolbar liegt im Panel (wie Verträge)
  ph.innerHTML = `
    <div>
      <div class="ph-title">Umsätze</div>
      <div class="ph-sub" id="umHeaderSub">Buchungshistorie</div>
    </div>`;
}

// ── BODY ──────────────────────────────
function _renderUmBody(pg) {
  let panel = pg.querySelector(".panel");
  if (!panel) {
    panel = document.createElement("div");
    panel.className = "panel";
    pg.appendChild(panel);
  }

  const data = _umGetFiltered();
  const all = _umGetFiltered();
  const inc = all.filter((b) => b.type === "einnahme").reduce((s, b) => s + b.amount, 0);
  const exp = all.filter((b) => b.type === "ausgabe").reduce((s, b) => s + b.amount, 0);
  const hasFilter = _umHasActiveFilter();

  // Subtitle aktualisieren
  const sub = document.getElementById("umHeaderSub");
  if (sub) sub.innerHTML = `${all.length} Buchungen · <span style="color:var(--green)">+${fm(inc)}</span> · <span style="color:var(--red)">−${fm(exp)}</span>${hasFilter ? ' <span class="um-filter-badge">Gefiltert</span>' : ""}`;

  // Toolbar-Header (wie ctr-page-header in Verträge)
  let toolbar = panel.querySelector(".um-panel-toolbar");
  if (!toolbar) {
    toolbar = document.createElement("div");
    toolbar.className = "um-panel-toolbar";
    panel.insertBefore(toolbar, panel.firstChild);
  }
  toolbar.innerHTML = `
    <div class="um-toolbar-l">
      <div class="pivot-vtoggle">
        <button class="pvt-btn${_umView === "list" ? " active" : ""}" onclick="_umView='list';renderPosten()">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
          </svg>Liste
        </button>
        <button class="pvt-btn${_umView === "tile" ? " active" : ""}" onclick="_umView='tile';renderPosten()">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
          </svg>Kacheln
        </button>
      </div>
      <button class="btn${hasFilter ? " btn-filter-active" : ""}" onclick="_umOpenFilter()">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
        </svg>Filter${hasFilter ? " ●" : ""}
      </button>
      <select class="um-acc-quick" onchange="_umFilter.accountId=this.value;renderPosten()" onmouseenter="_showTooltip('Nach Konto filtern',this)" onmouseleave="_hideTooltip()">
        <option value="">Alle Konten</option>
        ${S.accounts.map(a => `<option value="${a.id}"${_umFilter.accountId === a.id ? ' selected' : ''}>${esc(a.label)}</option>`).join('')}
      </select>
    </div>
    <div class="um-toolbar-r">
      <button class="btn" onclick="exportBookingsCSV()">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        CSV
      </button>
      <button class="btn" onclick="openAuszugDialog()">⬇ Export</button>
      <button class="btn" onclick="openModal(null,'transfer')">⇄ Umbuchung</button>
      <button class="btn primary" onclick="openModal()">+ Neuer Posten</button>
    </div>`;

  // ── Filter-Breadcrumb ──
  let breadcrumb = panel.querySelector(".um-filter-breadcrumb");
  if (hasFilter) {
    if (!breadcrumb) {
      breadcrumb = document.createElement("div");
      breadcrumb.className = "um-filter-breadcrumb";
      toolbar.after(breadcrumb);
    }
    const chips = [];
    if (_umFilter.search) chips.push({ label: `Suche: "${esc(_umFilter.search)}"`, clear: () => { _umFilter.search = ""; renderPosten(); } });
    if (_umFilter.type !== "all") chips.push({ label: _umFilter.type === "einnahme" ? "Einnahmen" : _umFilter.type === "ausgabe" ? "Ausgaben" : "Umbuchungen", clear: () => { _umFilter.type = "all"; renderPosten(); } });
    if (_umFilter.accountId) {
      const acc = getAccount(_umFilter.accountId);
      chips.push({ label: `Konto: ${acc ? esc(acc.label) : _umFilter.accountId}`, clear: () => { _umFilter.accountId = ""; renderPosten(); } });
    }
    if (_umFilter.categoryId) {
      const cat = (S.categories || []).find(c => c.id === _umFilter.categoryId);
      chips.push({ label: `Kategorie: ${cat ? esc(cat.name) : _umFilter.categoryId}`, clear: () => { _umFilter.categoryId = ""; renderPosten(); } });
    }
    if (_umFilter.creditorId) {
      const cred = (S.creditors || []).find(c => c.id === _umFilter.creditorId);
      chips.push({ label: `Kreditor: ${cred ? esc(cred.name) : _umFilter.creditorId}`, clear: () => { _umFilter.creditorId = ""; renderPosten(); } });
    }
    if (_umFilter.status !== "all") chips.push({ label: `Status: ${esc(_umFilter.status)}`, clear: () => { _umFilter.status = "all"; renderPosten(); } });
    if (_umFilter.dateFrom || _umFilter.dateTo) chips.push({ label: `Zeitraum: ${_umFilter.dateFrom || ""}–${_umFilter.dateTo || ""}`, clear: () => { _umFilter.dateFrom = ""; _umFilter.dateTo = ""; renderPosten(); } });
    if (_umFilter.amtMin || _umFilter.amtMax) chips.push({ label: `Betrag: ${_umFilter.amtMin || "0"}–${_umFilter.amtMax || "∞"}`, clear: () => { _umFilter.amtMin = ""; _umFilter.amtMax = ""; renderPosten(); } });
    if (_umFilter.interval !== "all") chips.push({ label: `Intervall: ${esc(_umFilter.interval)}`, clear: () => { _umFilter.interval = "all"; renderPosten(); } });
    if (_umFilter.iban) chips.push({ label: `IBAN: ${esc(_umFilter.iban)}`, clear: () => { _umFilter.iban = ""; renderPosten(); } });

    while (breadcrumb.firstChild) breadcrumb.removeChild(breadcrumb.firstChild);
    chips.forEach(chip => {
      const el = document.createElement("span");
      el.className = "um-bc-chip";
      el.innerHTML = `${chip.label} <button class="um-bc-x" onmouseenter="_showTooltip('Filter entfernen',this)" onmouseleave="_hideTooltip()">×</button>`;
      el.querySelector(".um-bc-x").addEventListener("click", chip.clear);
      breadcrumb.appendChild(el);
    });
    const resetBtn = document.createElement("button");
    resetBtn.className = "um-bc-reset";
    resetBtn.textContent = "Alle zurücksetzen";
    resetBtn.addEventListener("click", () => { _umResetFilter(); renderPosten(); });
    breadcrumb.appendChild(resetBtn);
  } else if (breadcrumb) {
    breadcrumb.remove();
  }

  // Nur Nicht-Toolbar-Kinder entfernen (Toolbar bleibt erhalten)
  function _clearPanelContent() {
    Array.from(panel.children).forEach(c => {
      if (!c.classList.contains("um-panel-toolbar") && !c.classList.contains("um-filter-breadcrumb")) c.remove();
    });
  }

  if (data.length === 0) {
    _clearPanelContent();
    const empty = document.createElement("div");
    empty.innerHTML = `
      <div class="panel-head"><div class="panel-title">Buchungshistorie</div></div>
      <div style="padding:48px;text-align:center;color:var(--text3);">
        <div style="font-size:2em;margin-bottom:12px;opacity:.25">📋</div>
        <div style="font-weight:600;margin-bottom:4px;color:var(--text2)">
          ${_umHasActiveFilter() ? "Keine Buchungen für diesen Filter" : "Noch keine Buchungen"}
        </div>
        <div style="font-size:.8em;">
          ${_umHasActiveFilter()
            ? '<button class="btn sm" onclick="_umResetFilter();renderPosten()">Filter zurücksetzen</button>'
            : "Buchungen werden beim App-Start aus deinen Fixposten generiert"}
        </div>
      </div>`;
    while (empty.firstChild) panel.appendChild(empty.firstChild);
    return;
  }

  if (_umView === "tile") {
    _renderUmTiles(panel, data);
  } else {
    _renderUmList(panel, data);
  }
}

// ── SPARZIEL-BUCHUNGEN ERZEUGEN ────────
// Sparziele mit monthlyRate > 0 erscheinen als geplante Ausgaben (virtuell, nicht in S.bookings)
function _umGoalBookings() {
  const result = [];
  const now = today();
  const todayStr = todayIso();
  (S.goals || []).forEach(g => {
    if (!(g.monthlyRate > 0)) return;
    // Stichtag: Tag 1 jedes Monats bis Deadline
    const deadline = g.deadline ? g.deadline.slice(0, 7) : null;
    // Alle Monate vom ersten Sparziel-Monat bis heute + 12 Monate
    const start = g.startDate ? g.startDate.slice(0, 7)
      : (now.getFullYear() - 1) + "-" + String(now.getMonth() + 1).padStart(2, "0");
    const end = deadline || `${now.getFullYear() + 1}-12`;
    // Durch Monate iterieren
    let [sy, sm] = start.split("-").map(Number);
    const [ey, em] = end.split("-").map(Number);
    while (sy < ey || (sy === ey && sm <= em)) {
      const mk = `${sy}-${String(sm).padStart(2, "0")}`;
      const dateStr = `${mk}-01`;
      result.push({
        id:        `_goal_${g.id}_${mk}`,
        postenId:  null,
        goalId:    g.id,
        date:      dateStr,
        monthKey:  mk,
        name:      `Sparplan: ${g.name}`,
        type:      "ausgabe",
        amount:    g.monthlyRate,
        baseAmount: g.monthlyRate,
        accountId: g.accountId || "",
        status:    dateStr <= todayStr ? "gebucht" : "geplant",
        note:      g.deadline ? `Ziel: ${g.deadline}` : "",
        interval:  "monatl.",
        _isGoal:   true,
        _goalIcon: g.icon || "🎯",
        _goalColor: g.color || "var(--blue)",
        _goalDeadline: g.deadline || "",
      });
      sm++;
      if (sm > 12) { sm = 1; sy++; }
    }
  });
  return result;
}

// ── DATEN HOLEN & FILTERN ─────────────
function _umGetFiltered() {
  // Sparziel-Buchungen als virtuelle Einträge einmischen
  const goalBks = _umGoalBookings();
  // Duplikate vermeiden: wenn bereits eine echte Sparplan-Buchung für diesen Monat existiert → überspringen
  const existingGoalMks = new Set(
    (S.bookings || []).filter(b => b.goalId).map(b => `${b.goalId}_${b.monthKey}`)
  );
  const virtualGoals = goalBks.filter(g => !existingGoalMks.has(`${g.goalId}_${g.monthKey}`));

  // Nur bereits getätigte Umsätze:
  // - kein "vorgemerkt" (Zukunft)
  // - kein Datum in der Zukunft (außer "beglichen" — die können ein früheres Datum haben)
  const _todayStr = todayIso();
  const _showVorgemerkt = _umFilter.status === "vorgemerkt";
  let data = [
    ...(S.bookings || []).filter(b => {
      if (_showVorgemerkt) return b.status === "vorgemerkt";
      return b.status !== "vorgemerkt" &&
        (b.status === "beglichen" || !b.date || b.date <= _todayStr);
    }),
    ...(_showVorgemerkt ? [] : virtualGoals)
  ];

  // Monatsfokus-Filter — wird bei aktiver Suche deaktiviert (alle Monate durchsuchen)
  if (_umFocusMonth && !_umFilter.search) {
    data = data.filter(b => (b.monthKey || b.date?.slice(0, 7)) === _umFocusMonth);
  }

  // Suche
  if (_umFilter.search) {
    const q = _umFilter.search.toLowerCase();
    data = data.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.note || "").toLowerCase().includes(q) ||
        (b.amount + "").includes(q),
    );
  }
  // Typ
  if (_umFilter.type !== "all") {
    data = data.filter((b) => b.type === _umFilter.type);
  }
  // Konto
  if (_umFilter.accountId) {
    data = data.filter((b) => b.accountId === _umFilter.accountId);
  }
  // Datum Von
  if (_umFilter.dateFrom) {
    data = data.filter((b) => b.date >= _umFilter.dateFrom);
  }
  // Datum Bis
  if (_umFilter.dateTo) {
    data = data.filter((b) => b.date <= _umFilter.dateTo);
  }
  // Status
  if (_umFilter.status !== "all") {
    data = data.filter((b) => b.status === _umFilter.status);
  }
  // Kategorie
  if (_umFilter.categoryId) {
    data = data.filter((b) => {
      if (b.categoryId) return b.categoryId === _umFilter.categoryId;
      if (!b.postenId) return false;
      const p = S.data.find((d) => d.id === b.postenId);
      return p && p.categoryId === _umFilter.categoryId;
    });
  }
  // Kreditor
  if (_umFilter.creditorId) {
    data = data.filter((b) => {
      if (b.creditorId) return b.creditorId === _umFilter.creditorId;
      if (!b.postenId) return false;
      const p = S.data.find((d) => d.id === b.postenId);
      return p && p.creditorId === _umFilter.creditorId;
    });
  }
  // Betrag Min
  if (_umFilter.amtMin !== "") {
    const min = parseFloat(_umFilter.amtMin);
    if (!isNaN(min)) data = data.filter((b) => Math.abs(b.amount) >= min);
  }
  // Betrag Max
  if (_umFilter.amtMax !== "") {
    const max = parseFloat(_umFilter.amtMax);
    if (!isNaN(max)) data = data.filter((b) => Math.abs(b.amount) <= max);
  }
  // IBAN
  if (_umFilter.iban) {
    const ibanQ = _umFilter.iban.replace(/\s/g, "").toUpperCase();
    data = data.filter((b) => {
      const acc = (S.accounts || []).find((a) => a.id === b.accountId);
      if (!acc || !acc.iban) return false;
      return acc.iban.replace(/\s/g, "").toUpperCase().includes(ibanQ);
    });
  }

  // Sortierung
  data.sort((a, b) => {
    const k = _umSort.k;
    let va = a[k] ?? "",
      vb = b[k] ?? "";
    if (k === "amount") {
      va = +va;
      vb = +vb;
    }
    if (va < vb) return _umSort.asc ? -1 : 1;
    if (va > vb) return _umSort.asc ? 1 : -1;
    // Tiebreaker: neuere id (höherer Timestamp im genId) zuerst
    return String(b.id || "").localeCompare(String(a.id || ""));
  });

  return data;
}

function _umHasActiveFilter() {
  return !!(
    _umFilter.search ||
    _umFilter.type !== "all" ||
    _umFilter.accountId ||
    _umFilter.dateFrom ||
    _umFilter.dateTo ||
    _umFilter.status !== "all" ||
    _umFilter.amtMin ||
    _umFilter.amtMax ||
    _umFilter.iban ||
    _umFilter.interval !== "all" ||
    _umFilter.categoryId ||
    _umFilter.creditorId
  );
}

function _umResetFilter() {
  _umFilter = {
    search: "",
    type: "all",
    accountId: "",
    dateFrom: "",
    dateTo: "",
    status: "all",
    amtMin: "",
    amtMax: "",
    iban: "",
    interval: "all",
    categoryId: "",
    creditorId: "",
  };
}

// ── MONATSABSCHLUSS ───────────────────

function _upsertMonthCloseEntry(mk) {
  if (!Array.isArray(S.closedMonths) || !S.closedMonths.includes(mk)) return;

  let totalIn = 0, totalOut = 0;
  (S.bookings || []).forEach(b => {
    const bMk = b.monthKey || b.date?.slice(0, 7);
    if (bMk !== mk) return;
    if (b.isMonthCloseEntry) return;
    if (b.status === "ausgesetzt") return;
    if (b.type === "umbuchung") return;
    const amt = Math.abs(b.amount || 0);
    if (b.type === "einnahme") totalIn += amt;
    else totalOut += amt;
  });

  const surplus = totalIn - totalOut;
  const existIdx = S.bookings.findIndex(b => b.isMonthCloseEntry && (b.monthKey || b.date?.slice(0, 7)) === mk);

  if (Math.abs(surplus) < 0.01) {
    if (existIdx >= 0) S.bookings.splice(existIdx, 1);
    return;
  }

  const [yr, mon] = mk.split("-").map(Number);
  const lastDay = new Date(yr, mon, 0).getDate();
  const date = `${mk}-${String(lastDay).padStart(2, "0")}`;
  const mainAcc = typeof getMainAccount === "function" ? getMainAccount() : null;
  const accId = mainAcc?.id || S.accounts?.[0]?.id || null;

  const entry = {
    id: existIdx >= 0 ? S.bookings[existIdx].id : genId("mc"),
    isMonthCloseEntry: true,
    monthKey: mk,
    date,
    name: "Monatsabschluss — Verbuchter Überschuss",
    type: surplus > 0 ? "ausgabe" : "einnahme",
    amount: Math.abs(surplus),
    baseAmount: Math.abs(surplus),
    accountId: accId,
    status: "gebucht",
    note: `Automatisch beim Abschluss ${mk}`,
    interval: "einmalig",
    categoryId: null,
    creditorId: null,
    postenId: null,
    transferId: null,
  };

  if (existIdx >= 0) S.bookings[existIdx] = entry;
  else S.bookings.push(entry);
}

async function _umReopenMonth(mk) {
  const months = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
  const [yr, mon] = mk.split("-").map(Number);
  const label = `${months[mon - 1]} ${yr}`;
  const ok = await appConfirm(
    `Abschluss von ${label} rückgängig machen?\n\nDie automatische Abschluss-Buchung wird entfernt. Buchungen bleiben erhalten — nur der Schutz wird aufgehoben.`,
    { icon: "🔓", title: "Abschluss aufheben", confirmLabel: "Öffnen", confirmClass: "danger" }
  );
  if (!ok) return;
  S.closedMonths = (S.closedMonths || []).filter(m => m !== mk);
  S.bookings = S.bookings.filter(b => !(b.isMonthCloseEntry && (b.monthKey || b.date?.slice(0, 7)) === mk));
  if (typeof initBookings === "function") initBookings();
  persist();
  if (document.getElementById("p-posten")) _renderUmBody(document.getElementById("p-posten"));
  if (typeof renderDashboard === "function") renderDashboard();
  if (typeof renderJahr === "function") renderJahr();
  showToast(`${label} wieder geöffnet`, "info");
}

async function _umCloseMonthPrompt(mk) {
  const months = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
  const [yr, mon] = mk.split("-").map(Number);
  const label = `${months[mon - 1]} ${yr}`;
  const ok = await appConfirm(
    `${label} abschließen?\n\nAlle vorgemerkten Buchungen werden als gebucht markiert. Der verbleibende Überschuss wird als "Verbuchter Überschuss" eingetragen, damit Einnahmen und Ausgaben auf ±0 aufgehen.`,
    { confirmLabel: "Abschließen" }
  );
  if (!ok) return;
  if (!Array.isArray(S.closedMonths)) S.closedMonths = [];
  if (S.closedMonths.includes(mk)) return;
  S.bookings.forEach(b => {
    const bMk = b.monthKey || b.date?.slice(0, 7);
    if (bMk === mk && b.status === "vorgemerkt") b.status = "gebucht";
  });
  S.closedMonths.push(mk);
  _upsertMonthCloseEntry(mk);
  persist();
  _renderUmBody(document.getElementById("p-posten"));
  if (typeof renderDashboard === "function") renderDashboard();
  if (typeof renderJahr === "function") renderJahr();
  showToast(`${label} abgeschlossen`, "success");
}

// ── LISTEN-ANSICHT ────────────────────
function _renderUmList(panel, data) {
  // Gruppieren nach Monat
  const groups = {};
  data.forEach((b) => {
    const mk = b.monthKey || b.date.slice(0, 7);
    if (!groups[mk]) groups[mk] = [];
    groups[mk].push(b);
  });

  const sortedKeys = Object.keys(groups).sort((a, b) =>
    _umSort.asc ? a.localeCompare(b) : b.localeCompare(a),
  );

  let html = `
    <div class="panel-head">
      <div class="panel-title">Buchungshistorie</div>
      <div style="display:flex;gap:8px;align-items:center;">
        <input class="um-search" placeholder="Suchen… ↵" value="${esc(_umFilter.search)}"
          onkeydown="if(event.key==='Enter'){_umFilter.search=this.value;_renderUmBody(document.getElementById('p-posten'))}"
          onsearch="_umFilter.search=this.value;_renderUmBody(document.getElementById('p-posten'))">
        <div style="font-size:.72em;color:var(--text3);font-family:var(--mono);">${data.length} Einträge</div>
      </div>
    </div>
    <div class="um-list">
      <div class="um-list-head">
        <div class="um-lh-spacer"></div>
        <div class="um-lh-name">Bezeichnung</div>
        <div class="um-lh-date">Datum</div>
        <div class="um-lh-acc">Konto</div>
        <div class="um-lh-amt">Betrag</div>
      </div>`;

  const _umNow = today();
  const _umCurMk = `${_umNow.getFullYear()}-${String(_umNow.getMonth()+1).padStart(2,'0')}`;

  sortedKeys.forEach((mk) => {
    const [yr, mon] = mk.split("-").map(Number);
    const monthName = MONTHS[mon - 1] + " " + yr;
    const grpItems = groups[mk];
    const grpInc = grpItems
      .filter((b) => b.type === "einnahme")
      .reduce((s, b) => s + b.amount, 0);
    const grpExp = grpItems
      .filter((b) => b.type === "ausgabe")
      .reduce((s, b) => s + b.amount, 0);
    const isClosed = (S.closedMonths || []).includes(mk);
    const isPast = mk < _umCurMk;

    html += `
      <div class="um-month-group${isClosed ? " um-month-group--closed" : ""}">
        <div class="um-month-head">
          <span class="um-month-label">
            ${isClosed ? `<svg class="um-lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>` : ""}
            ${monthName}
          </span>
          <span class="um-month-stats">
            ${grpInc > 0 ? `<span style="color:var(--green)">+${fm(grpInc)}</span>` : ""}
            ${grpExp > 0 ? `<span style="color:var(--red)">−${fm(grpExp)}</span>` : ""}
            ${isClosed ? `<span class="um-closed-badge">🔒 Abgeschlossen</span><button class="btn sm" onclick="event.stopPropagation();_umReopenMonth('${mk}')" onmouseenter="_showTooltip('Abschluss rückgängig machen',this)" onmouseleave="_hideTooltip()">Öffnen</button>` : ""}
            ${isPast && !isClosed ? `<button class="btn sm um-close-month-btn" onclick="event.stopPropagation();_umCloseMonthPrompt('${mk}')" onmouseenter="_showTooltip('Monat abschließen — alle Buchungen finalisieren',this)" onmouseleave="_hideTooltip()">Abschließen</button>` : ""}
          </span>
        </div>`;

    grpItems.forEach((b) => {
      const acc = S.accounts.find((a) => a.id === b.accountId);
      const isInc = b.type === "einnahme";
      const isTrf = b.type === "umbuchung";
      const _linkedGoalPosten = !b._isGoal && b.postenId ? S.data.find(p => p.id === b.postenId && p.goalId) : null;
      const isGoal = !!b._isGoal || !!_linkedGoalPosten;
      const isCloseEntry = !!b.isMonthCloseEntry;
      const amtCls = isInc ? "amt-in" : isTrf ? "um-trf" : "amt-out";
      const prefix = isInc ? "+" : isTrf ? "⇄" : "−";
      const isAusstehend = b.status === "ausstehend";
      const changed = b.amount !== b.baseAmount && b.status !== "ausgesetzt";

      // Kategorie auflösen — direkt auf Booking ODER via verlinktem Posten
      const _rowCat = (() => {
        let catId = b.categoryId;
        if (!catId && b.postenId) {
          const _rp = S.data.find(d => d.id === b.postenId);
          catId = _rp?.categoryId;
        }
        if (!catId) return null;
        return (Array.isArray(S.categories) ? S.categories : []).find(c => c.id === catId) || null;
      })();

      // Monatsschnitt berechnen
      const avgAmt = (() => {
        if (!b.postenId) return null;
        const p = S.data.find((d) => d.id === b.postenId);
        if (!p) return null;
        const avg = typeof avgMonthly === "function" ? avgMonthly(p) : 0;
        return avg > 0 && Math.abs(avg - b.amount) > 0.5 ? avg : null;
      })();

      // Deadline-Info für Sparziele
      const deadlineInfo = isGoal && b._goalDeadline
        ? `<span class="um-goal-deadline" style="color:${b._goalColor};opacity:.8;">Ziel: ${new Date(b._goalDeadline).toLocaleDateString("de-DE",{year:"numeric",month:"short"})}</span>`
        : "";

      const dotStyle = isGoal
        ? `background:${b._goalColor};box-shadow:0 0 0 2px ${b._goalColor}33;`
        : `background:${acc ? acc.color : "var(--border2)"}`;

      // Kreditor-Badge für Meta-Zeile
      const _umBkCred = (() => {
        let credId = b.creditorId;
        if (!credId && b.postenId) {
          const _bp = S.data.find(d => d.id === b.postenId);
          credId = _bp?.creditorId;
        }
        if (!credId) return null;
        return (S.creditors || []).find(c => c.id === credId) || null;
      })();
      const credLogoOnly = _umBkCred ? (() => {
        const color = _umBkCred.color || "var(--blue)";
        const logoUrl = _krLogoUrl(_umBkCred);
        const inner = logoUrl
          ? `<img src="${logoUrl}" onerror="this.style.display='none'" />`
          : `${esc((_umBkCred.icon || (_umBkCred.name||"?")[0]).slice(0,2))}`;
        return `<span class="um-cred-logo" style="background:${color}18;border-color:${color}35;color:${color}" onmouseenter="_showTooltip('Kreditor: ${esc(_umBkCred.name)}',this)" onmouseleave="_hideTooltip()">${inner}</span>`;
      })() : `<span class="um-cred-logo um-cred-logo--empty"></span>`;

      html += `
        <div class="um-row${isGoal ? " um-row-goal" : ""}${isAusstehend ? " um-row-pending" : ""}${isCloseEntry ? " um-row-close-entry" : ""}" data-type="${b.type}" data-status="${b.status || ""}" onclick="${isCloseEntry ? `_umOpenEdit('${b.id}')` : isGoal ? `_umOpenGoal('${b.goalId}')` : `_umOpenEdit('${b.id}')`}">
          <div class="um-row-dot" style="${dotStyle}">${isGoal ? `<span class="um-goal-dot-icon">${b._goalIcon}</span>` : ""}</div>
          <div class="um-row-cat"${_rowCat ? ` onmouseenter="_showTooltip('${esc(_rowCat.name)}',this)" onmouseleave="_hideTooltip()"` : ""}>
            ${_rowCat
              ? `<span class="um-cat-icon" style="background:${_rowCat.color}20;color:${_rowCat.color};border-color:${_rowCat.color}40">${_rowCat.icon}</span>`
              : `<span class="um-cat-icon um-cat-icon--empty"></span>`}
          </div>
          <div class="um-row-cred">
            ${credLogoOnly}
          </div>
          <div class="um-row-main">
            <div class="um-row-name">${esc(b.name)}${isCloseEntry ? ` <span class="um-close-badge">🔒 Auto</span>` : b._isGoal ? ` <span class="um-goal-badge" style="background:${b._goalColor}22;color:${b._goalColor}">Sparziel</span>` : _linkedGoalPosten ? ` <span class="um-goal-badge">Sparplan</span>` : ""}${isAusstehend ? ` <span class="um-pending-badge">ausstehend</span>` : ""}</div>
            ${b.note && !isGoal ? `<div class="um-row-comment">${esc(b.note)}</div>` : ""}
            ${(b.interval && b.interval !== "einmalig") || deadlineInfo ? `<div class="um-row-meta">${b.interval && b.interval !== "einmalig" ? `<span class="um-itv">${b.interval}</span>` : ""}${deadlineInfo}</div>` : ""}
          </div>
          <div class="um-col-date">${b.date ? new Date(b.date).toLocaleDateString("de-DE") : "—"}</div>
          <div class="um-col-acc"${acc ? ` onmouseenter="_showTooltip('${esc(acc.label)}',this)" onmouseleave="_hideTooltip()"` : ""}>${acc ? esc(acc.label) : "—"}</div>
          <div class="um-row-amt">
            <span class="${amtCls} um-amt-main">${prefix}${fm(b.amount)}</span>
            ${changed ? `<div class="um-base-amt">${prefix}${fm(b.baseAmount)}</div>` : ""}
            ${avgAmt ? `<div class="um-avg-hint">Ø ${fm(avgAmt)}/Mon</div>` : ""}
          </div>
          <div class="um-row-actions">
            ${isCloseEntry ? "" : isAusstehend ? `<button class="btn sm btn-settle" onclick="event.stopPropagation();_umBegleichen('${b.id}')" onmouseenter="_showTooltip('Zahlung begleichen',this)" onmouseleave="_hideTooltip()">✓ Begleichen</button>` : ""}
            ${!isCloseEntry && !isGoal && !isAusstehend ? `<button class="btn sm" onclick="event.stopPropagation();_umOpenEdit('${b.id}')" onmouseenter="_showTooltip('Buchung bearbeiten',this)" onmouseleave="_hideTooltip()">✎</button>` : ""}
            ${!isCloseEntry && b.postenId && !isAusstehend ? `<button class="btn sm" onclick="event.stopPropagation();_umOpenSerie('${b.postenId}')" onmouseenter="_showTooltip('Serie bearbeiten',this)" onmouseleave="_hideTooltip()">≡</button>` : ""}
          </div>
        </div>`;
    });

    html += `</div>`;
  });

  html += `</div>`;

  // ── Summen-Footer ──────────────────────
  const totalInc = data.filter(b => b.type === "einnahme").reduce((s, b) => s + b.amount, 0);
  const totalExp = data.filter(b => b.type === "ausgabe").reduce((s, b) => s + b.amount, 0);
  const totalNet = totalInc - totalExp;
  html += `
  <div class="um-list-footer">
    <span class="um-lf-item"><span class="um-lf-lbl">Einnahmen</span><span class="um-lf-val inc">+${fm(totalInc)}</span></span>
    <span class="um-lf-sep">·</span>
    <span class="um-lf-item"><span class="um-lf-lbl">Ausgaben</span><span class="um-lf-val exp">−${fm(totalExp)}</span></span>
    <span class="um-lf-sep">·</span>
    <span class="um-lf-item"><span class="um-lf-lbl">Saldo</span><span class="um-lf-val ${totalNet >= 0 ? "inc" : "exp"}">${totalNet >= 0 ? "+" : "−"}${fm(Math.abs(totalNet))}</span></span>
    <span class="um-lf-count">${data.length} Buchungen</span>
  </div>`;

  // Toolbar-Div erhalten — nur Inhalt ersetzen
  Array.from(panel.children).forEach(c => { if (!c.classList.contains("um-panel-toolbar")) c.remove(); });
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  while (tmp.firstChild) panel.appendChild(tmp.firstChild);
}

// ── KACHEL-ANSICHT ────────────────────
function _renderUmTiles(panel, data) {
  const groups = {};
  data.forEach((b) => {
    const mk = b.monthKey || b.date?.slice(0, 7) || "?";
    if (!groups[mk]) groups[mk] = [];
    groups[mk].push(b);
  });
  const sortedKeys = Object.keys(groups).sort((a, b) =>
    _umSort.asc ? a.localeCompare(b) : b.localeCompare(a),
  );

  let html = `<div class="panel-head">
    <div class="panel-title">Buchungshistorie</div>
    <input class="um-search" placeholder="Suchen… ↵" value="${esc(_umFilter.search)}"
      onkeydown="if(event.key==='Enter'){_umFilter.search=this.value;_renderUmBody(document.getElementById('p-posten'))}"
      onsearch="_umFilter.search=this.value;_renderUmBody(document.getElementById('p-posten'))">
  </div>`;

  sortedKeys.forEach((mk) => {
    const [yr, mon] = mk.split("-").map(Number);
    const monthName = (MONTHS[mon - 1] || "?") + " " + yr;
    const grpItems = groups[mk];
    const grpInc = grpItems
      .filter((b) => b.type === "einnahme")
      .reduce((s, b) => s + b.amount, 0);
    const grpExp = grpItems
      .filter((b) => b.type === "ausgabe")
      .reduce((s, b) => s + b.amount, 0);
    const grpBal = grpInc - grpExp;
    const grpCount = grpItems.length;

    html += `<div class="utmg">
      <div class="utmg-head">
        <div class="utmg-head-l">
          <span class="utmg-name">${monthName}</span>
          <span class="utmg-count">${grpCount} Buchung${grpCount !== 1 ? "en" : ""}</span>
        </div>
        <div class="utmg-head-r">
          ${grpInc > 0 ? `<span class="utmg-inc">+${fm(grpInc)}</span>` : ""}
          ${grpExp > 0 ? `<span class="utmg-exp">−${fm(grpExp)}</span>` : ""}
          <span class="utmg-bal ${grpBal >= 0 ? "utmg-pos" : "utmg-neg"}">${grpBal >= 0 ? "+" : "−"}${fm(Math.abs(grpBal))}</span>
        </div>
      </div>
      <div class="ut-grid">`;

    grpItems.forEach((b) => {
      const acc = S.accounts.find((a) => a.id === b.accountId);
      const isInc = b.type === "einnahme";
      const isTrf = b.type === "umbuchung";
      const amtCls = isInc ? "ut-pos" : isTrf ? "ut-trf" : "ut-neg";
      const prefix = isInc ? "+" : isTrf ? "⇄" : "−";
      const stCls =
        { gebucht: "ut-st-ok", geändert: "ut-st-chg", ausgesetzt: "ut-st-pau" }[
          b.status
        ] || "";
      const changed = b.amount !== b.baseAmount && b.status !== "ausgesetzt";
      const accColor = acc ? acc.color : "var(--border2)";
      // IBAN — letzte 4 Zeichen
      const iban4 = acc?.iban ? acc.iban.replace(/\s/g, "").slice(-4) : null;
      // Ø Monatsschnitt
      const tileAvg = (() => {
        if (!b.postenId) return null;
        const p = S.data.find((d) => d.id === b.postenId);
        if (!p) return null;
        const avg = typeof avgMonthly === "function" ? avgMonthly(p) : 0;
        return avg > 0 && Math.abs(avg - b.amount) > 0.5 ? avg : null;
      })();

      const tileCatId = b.categoryId || (b.postenId ? (S.data.find(d => d.id === b.postenId) || {}).categoryId : null);
      const tileCat = tileCatId ? (S.categories || []).find(c => c.id === tileCatId) : null;

      const tileCred = (() => {
        let credId = b.creditorId;
        if (!credId && b.postenId) credId = (S.data.find(d => d.id === b.postenId) || {}).creditorId;
        if (!credId) return null;
        return (S.creditors || []).find(c => c.id === credId) || null;
      })();
      const avatarHtml = (() => {
        if (tileCred) {
          const cc = tileCred.color || "var(--blue)";
          const logoUrl = typeof _krLogoUrl === "function" ? _krLogoUrl(tileCred) : null;
          const inner = logoUrl
            ? `<img src="${logoUrl}" alt="" style="width:20px;height:20px;object-fit:contain;border-radius:3px" onerror="this.style.display='none'" />`
            : `<span style="font-size:.82em;font-weight:700;line-height:1">${esc(tileCred.icon ? tileCred.icon.slice(0, 2) : (tileCred.name || "?")[0].toUpperCase())}</span>`;
          return `<div class="ut-av" style="background:${cc}18;border-color:${cc}35;color:${cc}" onmouseenter="_showTooltip('${esc(tileCred.name)}',this)" onmouseleave="_hideTooltip()">${inner}</div>`;
        }
        if (tileCat) {
          return `<div class="ut-av" style="background:${tileCat.color}18;border-color:${tileCat.color}30;color:${tileCat.color}">${tileCat.icon}</div>`;
        }
        const typeIcon = isInc ? "↑" : isTrf ? "⇄" : "↓";
        return `<div class="ut-av" style="background:${accColor}18;border-color:${accColor}30;color:${accColor}">${typeIcon}</div>`;
      })();

      const accLbl     = acc ? acc.label : "—";
      const dateShort  = b.date ? new Date(b.date).toLocaleDateString("de-DE", {day:"2-digit",month:"2-digit",year:"2-digit"}) : "—";
      const chipCat    = tileCat ? `<span class="ut-chip" style="background:${tileCat.color}18;border-color:${tileCat.color}28;color:${tileCat.color}">${tileCat.icon} ${esc(tileCat.name)}</span>` : "";
      const chipItv    = `<span class="ut-chip ut-chip-itv">${b.interval || "—"}</span>`;
      const chipStatus = b.status !== "gebucht" ? `<span class="ut-badge ${stCls}">${b.status}</span>` : "";
      const chipAvg    = tileAvg ? `<span class="ut-chip ut-chip-avg">Ø ${fm(tileAvg)}</span>` : "";

      html += `<div class="ut-card" onclick="_umOpenEdit('${b.id}')">
        <div class="ut-card-accent" style="background:${accColor}"></div>
        <div class="ut-card-body">
          <div class="ut-card-row1">
            ${avatarHtml}
            <div class="ut-card-info">
              <div class="ut-card-name" title="${esc(b.name)}">${esc(b.name)}</div>
              <div class="ut-card-sub">${esc(accLbl)} · ${dateShort}</div>
            </div>
            <div class="ut-card-amt-col">
              <span class="${amtCls}">${prefix}${fm(b.amount)}</span>
              ${changed ? `<span class="ut-card-base">${prefix}${fm(b.baseAmount)}</span>` : ""}
            </div>
          </div>
          <div class="ut-card-chips">${chipCat}${chipItv}${chipStatus}${chipAvg}</div>
        </div>
      </div>`;
    });

    html += `</div></div>`;
  });

  if (!sortedKeys.length) {
    html += `<div class="um-empty"><div class="um-empty-icon">∅</div><div>Keine Buchungen gefunden</div></div>`;
  }

  // Toolbar erhalten
  Array.from(panel.children).forEach(c => { if (!c.classList.contains("um-panel-toolbar")) c.remove(); });
  const tmp2 = document.createElement("div");
  tmp2.innerHTML = html;
  while (tmp2.firstChild) panel.appendChild(tmp2.firstChild);
}

// ── BUCHUNG BEARBEITEN MODAL ──────────
function _umOpenEdit(bookingId) {
  const bk = (S.bookings || []).find((b) => b.id === bookingId);
  if (!bk) return;
  if (bk.isMonthCloseEntry) {
    appAlert(
      `Diese Buchung wird automatisch beim Monatsabschluss berechnet.\n\nSie passt sich an, wenn sich andere Buchungen in diesem Monat ändern, und hält Einnahmen und Ausgaben auf ±0.`,
      { icon: "🔒", title: "Automatische Abschlussbuchung" }
    );
    return;
  }

  document.getElementById("umEditOverlay")?.remove();

  const isInc = bk.type === "einnahme";
  const prefix = isInc ? "+" : bk.type === "umbuchung" ? "⇄" : "−";
  const dateStr = bk.date
    ? new Date(bk.date).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })
    : "—";

  const resetBtn = bk.amount !== bk.baseAmount
    ? `<button class="btn sm" onclick="document.getElementById('umEditAmt').value='${bk.baseAmount.toFixed(2)}'" onmouseenter="_showTooltip('Originalbetrag zurücksetzen',this)" onmouseleave="_hideTooltip()">↺ ${fm(bk.baseAmount)}</button>`
    : "";

  // Serie/Transfer btn — nur für wiederkehrende Serien, nicht für einmalige
  const serieBtnP2 = bk.postenId && bk.interval !== "einmalig"
    ? `<button class="btn" onclick="document.getElementById('umEditOverlay').remove();_umOpenSerie('${bk.postenId}')">Serie ✎</button>`
    : bk.transferId
      ? `<button class="btn" onclick="document.getElementById('umEditOverlay').remove();openModal(null,'transfer','${bk.transferId}')">Transfer ✎</button>`
      : "";

  // Posten für Seite 2 — Kategorie + Kreditor
  const _umPosten2 = bk.postenId ? (S.data || []).find(d => d.id === bk.postenId) : null;
  // Fallback: read categoryId/creditorId directly from booking when no posten exists
  const _umCatCur  = _umPosten2 ? (_umPosten2.categoryId  || "") : (bk.categoryId  || "");
  const _umCredCur = _umPosten2 ? (_umPosten2.creditorId  || "") : (bk.creditorId  || "");

  const _catOpts = (() => {
    let opts = `<option value="">— keine —</option>`;
    (S.categories || []).forEach(c => {
      opts += `<option value="${c.id}"${_umCatCur === c.id ? " selected" : ""}>${c.icon} ${esc(c.name)}</option>`;
    });
    return opts;
  })();

  const _credOpts = (() => {
    let opts = `<option value="">— keiner —</option>`;
    (S.creditors || []).forEach(c => {
      opts += `<option value="${c.id}"${_umCredCur === c.id ? " selected" : ""}>${esc(c.name)}</option>`;
    });
    return opts;
  })();

  const credRow = `
        <div class="frow c2">
          <div class="fg">
            <label>Kategorie</label>
            <select id="umEditCategoryId">${_catOpts}</select>
          </div>
          <div class="fg">
            <label>Kreditor</label>
            <select id="umEditCreditorId">${_credOpts}</select>
          </div>
        </div>`;

  // Status-Buttons inkl. vorgemerkt (bidirektional)
  const statusBtns = ["gebucht", "geändert", "ausgesetzt", "vorgemerkt"]
    .map(s => `<button class="btn sm${bk.status === s ? " primary" : ""}" id="umStBtn_${s}" onclick="_umSetStatus('${s}')">${s}</button>`)
    .join("");

  const ov = document.createElement("div");
  ov.id = "umEditOverlay";
  ov.className = "overlay open";
  ov.style.cssText = "z-index:900";
  ov.innerHTML = `
    <div class="modal">
      <div class="modal-main">
        <div class="modal-header">
          <button class="mp-back" id="umEditBack" style="display:none" onclick="_umGoPage(1)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            Zurück
          </button>
          <div id="umEditHeadInfo" style="flex:1;min-width:0">
            <h3 style="margin:0;font-size:.95em;font-weight:700;color:var(--text);letter-spacing:-.2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(bk.name)}</h3>
            <div style="font-size:.67em;color:var(--text3);margin-top:3px;font-family:var(--mono)">${dateStr} · ${bk.interval || "—"}</div>
          </div>
          <div id="umEditPageTitle" class="mp-title" style="display:none">Details</div>
          <button onclick="document.getElementById('umEditOverlay').remove()" class="modal-close">✕</button>
        </div>

        <!-- Seite 1: Betrag · Status · Konto -->
        <div id="umEditPage1">
          <div class="frow c2">
            <div class="fg">
              <label>Betrag</label>
              <div style="display:flex;align-items:center;gap:6px">
                <span style="color:var(--text3);font-size:.9em">${prefix}</span>
                <input id="umEditAmt" type="number" step="0.01" min="0" value="${bk.amount.toFixed(2)}" style="font-family:var(--mono)">
                <span style="color:var(--text3);font-size:.85em">€</span>
                ${resetBtn}
              </div>
            </div>
            <div class="fg">
              <label>Konto</label>
              <div class="acc-select-wrap" id="umEditAccWrap">
                <select id="umEditAcc" class="acc-select-hidden"></select>
                <div class="acc-select-trigger" id="umEditAccTrigger" onclick="_toggleAccDropdown('umEditAcc')" tabindex="0">
                  <span class="acc-select-dot" id="umEditAccDot"></span>
                  <span class="acc-select-label" id="umEditAccLabel">— nicht zugeordnet —</span>
                  <svg class="acc-select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                <div class="acc-select-menu" id="umEditAccMenu" style="display:none"></div>
              </div>
            </div>
          </div>

          <div class="frow">
            <div class="fg">
              <label>Status</label>
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:2px">
                ${statusBtns}
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn danger" onclick="_umDeleteBooking('${bk.id}')">Löschen</button>
            <button class="btn mp-details-btn" onclick="_umGoPage(2)" style="margin-left:auto">
              Details
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <button class="btn primary" onclick="_umSaveEdit('${bk.id}')">Speichern</button>
          </div>
        </div>

        <!-- Seite 2: Bezeichnung · Datum · Notiz · Kreditor -->
        <div id="umEditPage2" style="display:none">
          <div class="frow">
            <div class="fg">
              <label>Bezeichnung</label>
              <input id="umEditName" type="text" value="${esc(bk.name)}">
            </div>
          </div>

          <div class="frow">
            <div class="fg">
              <label>Buchungsdatum</label>
              <input id="umEditDate" type="date" value="${bk.date || ""}">
            </div>
          </div>

          <div class="frow">
            <div class="fg">
              <label>Notiz</label>
              <input id="umEditNote" type="text" placeholder="Optionale Anmerkung…" value="${esc(bk.note || "")}">
            </div>
          </div>

          ${credRow}

          <div class="modal-actions">
            ${serieBtnP2}
            <button class="btn" style="margin-left:auto" onclick="document.getElementById('umEditOverlay').remove()">Abbrechen</button>
            <button class="btn primary" onclick="_umSaveEdit('${bk.id}')">Speichern</button>
          </div>
        </div>
      </div>
      <div class="modal-side">
        <div class="modal-side-logo">
          <div class="modal-side-logo-box"><span style="font-size:22px">🔐</span></div>
          <div class="modal-side-brand">Vault<span class="modal-side-accent">Box</span></div>
        </div>
        <div class="modal-side-divider"></div>
        <div class="modal-side-tip">
          <div class="modal-side-tip-header">
            <div class="modal-side-tip-icon">💡</div>
            <div class="modal-side-tip-label">Finanztipp</div>
            <button class="modal-side-tip-refresh" onclick="_refreshModalTip('umEditOverlay')" onmouseenter="_showTooltip('Neuer Tipp',this)" onmouseleave="_hideTooltip()">↻</button>
          </div>
          <div class="modal-side-tip-text">Öffne das Modal für einen Tipp.</div>
        </div>
        <div class="modal-side-footer">VaultBox · 2026</div>
      </div>
    </div>`;

  document.body.appendChild(ov);
  ov.addEventListener("click", (e) => { if (e.target === ov) ov.remove(); });
  if (typeof _fillAccountSelect === "function") _fillAccountSelect("umEditAcc", bk.accountId);
  _refreshModalTip("umEditOverlay");
}

// Seitennavigation im Buchungs-Modal (Apple-Style)
function _umGoPage(page) {
  const p1 = document.getElementById("umEditPage1");
  const p2 = document.getElementById("umEditPage2");
  const back = document.getElementById("umEditBack");
  const headInfo = document.getElementById("umEditHeadInfo");
  const pageTitle = document.getElementById("umEditPageTitle");
  if (!p1 || !p2) return;
  if (page === 2) {
    p1.style.display = "none";
    p2.style.display = "";
    back.style.display = "flex";
    headInfo.style.display = "none";
    pageTitle.style.display = "";
  } else {
    p1.style.display = "";
    p2.style.display = "none";
    back.style.display = "none";
    headInfo.style.display = "flex";
    pageTitle.style.display = "none";
  }
}

function _umSetStatus(s) {
  document
    .querySelectorAll("[id^='umStBtn_']")
    .forEach((b) => b.classList.remove("primary"));
  document.getElementById("umStBtn_" + s)?.classList.add("primary");
  if (s === "ausgesetzt") {
    const inp = document.getElementById("umEditAmt");
    if (inp) inp.value = "0.00";
  }
}

function _umSaveEdit(bookingId) {
  const amt = parseFloat(document.getElementById("umEditAmt")?.value) || 0;
  const note = document.getElementById("umEditNote")?.value.trim() || "";
  const name = document.getElementById("umEditName")?.value.trim() || "";
  const accId = document.getElementById("umEditAcc")?.value || "";
  const date = document.getElementById("umEditDate")?.value || "";
  const status =
    document
      .querySelector("[id^='umStBtn_'].primary")
      ?.id.replace("umStBtn_", "") || "gebucht";

  saveBooking(bookingId, { amount: amt, note, name, accountId: accId, status, ...(date ? { date } : {}) });

  // Kategorie + Kreditor speichern — auf Posten wenn verknüpft, sonst direkt auf Booking
  const bk = (S.bookings || []).find(b => b.id === bookingId);
  const catEl = document.getElementById("umEditCategoryId");
  const credEl = document.getElementById("umEditCreditorId");
  if (bk && (catEl || credEl)) {
    const catVal  = catEl?.value  || null;
    const credVal = credEl?.value || null;
    if (bk.postenId) {
      const p = (S.data || []).find(d => d.id === bk.postenId);
      if (p) {
        p.categoryId  = catVal;
        p.creditorId  = credVal;
        persist();
      }
    } else {
      // Keine Posten-Verknüpfung → direkt auf Booking schreiben
      bk.categoryId  = catVal;
      bk.creditorId  = credVal;
      persist();
    }
  }

  // Abschluss-Buchung anpassen wenn Monat finalisiert ist
  const _editMk = bk?.monthKey || bk?.date?.slice(0, 7);
  if (_editMk && (S.closedMonths || []).includes(_editMk)) {
    _upsertMonthCloseEntry(_editMk);
    persist();
  }

  document.getElementById("umEditOverlay")?.remove();
  renderPosten();
}

function _umDeleteBooking(bookingId) {
  const bk = S.bookings.find((b) => b.id === bookingId);
  const name = bk ? bk.name : "Buchung";
  appConfirm(`"${name}" wirklich löschen?`, {
    icon: "🗑️",
    title: "Buchung löschen",
    confirmLabel: "Löschen",
    confirmClass: "danger",
  }).then((ok) => {
    if (!ok) return;
    const _delMk = bk?.monthKey || bk?.date?.slice(0, 7);
    deleteBooking(bookingId);
    if (_delMk && (S.closedMonths || []).includes(_delMk)) {
      _upsertMonthCloseEntry(_delMk);
      persist();
    }
    document.getElementById("umEditOverlay")?.remove();
  });
}

function _umOpenSerie(postenId) {
  const idx = S.data.findIndex((p) => p.id === postenId);
  if (idx >= 0) openModal(idx);
}

// ── ZAHLUNG BEGLEICHEN ────────────────
function _umBegleichen(bookingId) {
  const bk = (S.bookings || []).find((b) => b.id === bookingId);
  if (!bk) return;

  document.getElementById("umBegleichenOverlay")?.remove();

  const todayStr = todayIso();
  const prefix = bk.type === "einnahme" ? "+" : bk.type === "umbuchung" ? "⇄" : "−";
  const acc = S.accounts.find((a) => a.id === bk.accountId);
  const accOpts = S.accounts
    .map((a) => `<option value="${a.id}" ${a.id === bk.accountId ? "selected" : ""}>${esc(a.label)}</option>`)
    .join("");

  const ov = document.createElement("div");
  ov.id = "umBegleichenOverlay";
  ov.className = "overlay open";
  ov.style.cssText = "z-index:900";
  ov.innerHTML = `
    <div class="modal" style="max-width:460px">
      <div class="modal-main">
        <div class="modal-header">
          <div>
            <h3 style="margin:0;font-size:.95em;font-weight:700;color:var(--text);letter-spacing:-.2px">Zahlung begleichen</h3>
            <div style="font-size:.67em;color:var(--text3);margin-top:3px;font-family:var(--mono)">${esc(bk.name)} · ${prefix}${fm(bk.amount)}</div>
          </div>
          <button onclick="document.getElementById('umBegleichenOverlay').remove()" class="modal-close">✕</button>
        </div>

        <div style="background:var(--panel2);border:1px solid var(--border2);border-radius:10px;padding:12px 14px;margin-bottom:16px;font-size:.8em;color:var(--text3)">
          Geplant für <strong style="color:var(--text2)">${bk.date ? new Date(bk.date).toLocaleDateString("de-DE",{day:"2-digit",month:"long",year:"numeric"}) : "—"}</strong>
          · wird auf das eingegebene Datum gebucht
        </div>

        <div class="frow c2">
          <div class="fg">
            <label>Buchungsdatum</label>
            <input id="umBegDate" type="date" value="${bk.date && bk.date <= todayStr ? bk.date : todayStr}" max="${todayStr}" />
          </div>
          <div class="fg">
            <label>Konto</label>
            <select id="umBegAcc">${accOpts}</select>
          </div>
        </div>
        <div class="frow c2">
          <div class="fg">
            <label>Betrag €</label>
            <div style="display:flex;align-items:center;gap:6px">
              <span style="color:var(--text3);font-size:.9em">${prefix}</span>
              <input id="umBegAmt" type="number" step="0.01" min="0" value="${bk.amount.toFixed(2)}" style="font-family:var(--mono)">
            </div>
          </div>
          <div class="fg">
            <label>Notiz</label>
            <input id="umBegNote" type="text" placeholder="Optional…" value="${esc(bk.note || "")}">
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn" onclick="document.getElementById('umBegleichenOverlay').remove()" style="margin-right:auto">Abbrechen</button>
          <button class="btn primary" onclick="_umConfirmBegleichen('${bookingId}')">✓ Jetzt begleichen</button>
        </div>
      </div>
    </div>`;

  document.body.appendChild(ov);
  ov.addEventListener("click", (e) => { if (e.target === ov) ov.remove(); });
  setTimeout(() => document.getElementById("umBegDate")?.focus(), 50);
}

function _umConfirmBegleichen(bookingId) {
  const settledDate = document.getElementById("umBegDate")?.value;
  const amt = parseFloat(document.getElementById("umBegAmt")?.value) || undefined;
  const note = document.getElementById("umBegNote")?.value.trim() || undefined;
  const accId = document.getElementById("umBegAcc")?.value || undefined;
  if (!settledDate) return;

  // Konto direkt am Booking-Objekt setzen bevor saveBooking läuft
  const bkRef = (S.bookings || []).find(b => b.id === bookingId);
  if (bkRef && accId) bkRef.accountId = accId;

  saveBooking(bookingId, { settledDate, amount: amt, note });

  document.getElementById("umBegleichenOverlay")?.remove();
  if (typeof showToast === "function") showToast("Zahlung beglichen", "success", 2200);
  // Zum Buchungsmonat navigieren
  _umFocusMonth = settledDate.slice(0, 7);
  renderPosten();
}

// ── QUICK-DATUM: echtes Zahlungsdatum für gebuchte Serie ──
function _umQuickDate(bookingId) {
  const bk = (S.bookings || []).find((b) => b.id === bookingId);
  if (!bk) return;

  document.getElementById("umQuickDateOverlay")?.remove();

  const prefix = bk.type === "einnahme" ? "+" : "−";
  // Vorschlag: heute, aber nicht in der Zukunft nach dem geplanten Datum
  const todayStr = todayIso();
  const defaultDate = bk.date < todayStr ? bk.date : todayStr;

  const ov = document.createElement("div");
  ov.id = "umQuickDateOverlay";
  ov.className = "overlay open";
  ov.style.cssText = "z-index:900";
  ov.innerHTML = `
    <div class="modal" style="max-width:360px">
      <div class="modal-main">
        <div class="modal-header">
          <div>
            <h3 style="margin:0;font-size:.92em;font-weight:700;color:var(--text)">Zahlungsdatum anpassen</h3>
            <div style="font-size:.67em;color:var(--text3);margin-top:3px;font-family:var(--mono)">${esc(bk.name)} · ${prefix}${fm(bk.amount)}</div>
          </div>
          <button onclick="document.getElementById('umQuickDateOverlay').remove()" class="modal-close">✕</button>
        </div>

        <div style="background:var(--panel2);border:1px solid var(--border2);border-radius:10px;padding:10px 14px;margin-bottom:14px;font-size:.78em;color:var(--text3)">
          Geplant: <strong style="color:var(--text2)">${bk.date ? new Date(bk.date).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"}) : "—"}</strong>
          · Trage das echte Abgangsdatum ein
        </div>

        <div class="frow">
          <div class="fg">
            <label>Tatsächliches Zahlungsdatum</label>
            <input id="umQDDate" type="date" value="${defaultDate}" />
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn" onclick="document.getElementById('umQuickDateOverlay').remove()" style="margin-right:auto">Abbrechen</button>
          <button class="btn primary" onclick="_umConfirmQuickDate('${bookingId}')">Übernehmen</button>
        </div>
      </div>
    </div>`;

  document.body.appendChild(ov);
  ov.addEventListener("click", (e) => { if (e.target === ov) ov.remove(); });
  setTimeout(() => document.getElementById("umQDDate")?.focus(), 50);
}

function _umConfirmQuickDate(bookingId) {
  const newDate = document.getElementById("umQDDate")?.value;
  if (!newDate) return;

  const bk = (S.bookings || []).find(b => b.id === bookingId);
  if (!bk) return;

  // Datum + ggf. Monat aktualisieren, Status bleibt "gebucht" / wird "beglichen" wenn Monat wechselt
  const newMk = newDate.slice(0, 7);
  const monthChanged = newMk !== (bk.originalMonthKey || bk.monthKey);
  bk.originalMonthKey = bk.originalMonthKey || bk.monthKey;
  bk.date = newDate;
  bk.monthKey = newMk;
  if (monthChanged) bk.status = "beglichen";
  // Für Einzelbuchungen: contractStart aktualisieren
  if (bk.interval === "einmalig" && bk.postenId) {
    const p = S.data.find(d => d.id === bk.postenId);
    if (p) { p.contractStart = newDate; p.contractEnd = newDate; }
  }

  persist();
  document.getElementById("umQuickDateOverlay")?.remove();
  if (typeof showToast === "function") showToast("Zahlungsdatum aktualisiert", "success", 2000);
  _umFocusMonth = newDate.slice(0, 7);
  _afterSaveBooking();
  renderPosten();
}

function _umOpenGoal(goalId) {
  // Zur Sparziele-Seite navigieren und das Ziel highlighten
  const navEl = document.querySelector('.nav-item[onclick*="goals"]');
  if (navEl) nav(navEl, "goals");
}

// ── FILTER MODAL ──────────────────────
function _umOpenFilter() {
  document.getElementById("umFilterOverlay")?.remove();

  const n = today();
  const accOpts = S.accounts
    .map(
      (a) =>
        `<option value="${a.id}" ${a.id === _umFilter.accountId ? "selected" : ""}>${esc(a.label)}</option>`,
    )
    .join("");

  const ov = document.createElement("div");
  ov.id = "umFilterOverlay";
  ov.style.cssText =
    "position:fixed;inset:0;z-index:900;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;";
  // aktive Filter zählen für Badge
  const _activeCount = [
    _umFilter.search,
    _umFilter.type !== "all" ? "x" : "",
    _umFilter.accountId,
    _umFilter.dateFrom,
    _umFilter.dateTo,
    _umFilter.status !== "all" ? "x" : "",
    _umFilter.amtMin,
    _umFilter.amtMax,
    _umFilter.iban,
    _umFilter.interval !== "all" ? "x" : "",
  ].filter(Boolean).length;

  ov.innerHTML = `
    <div class="umf-modal">

      <!-- Header -->
      <div class="umf-header">
        <div>
          <div class="umf-title">Filter & Sortierung</div>
          <div class="umf-sub">${_activeCount > 0 ? _activeCount + " Filter aktiv" : "Alle Buchungen"}</div>
        </div>
        <button class="pv-pop-close" onclick="document.getElementById('umFilterOverlay').remove()">✕</button>
      </div>

      <!-- Body: 2-spaltig -->
      <div class="umf-body">

        <!-- Linke Spalte -->
        <div class="umf-col">

          <div class="umf-section">
            <div class="umf-section-title">Suche</div>
            <input id="umFSearch" class="um-edit-inp" type="text"
              placeholder="Name, Notiz, Betrag…"
              value="${esc(_umFilter.search)}">
          </div>

          <div class="umf-section">
            <div class="umf-section-title">Zeitraum</div>
            <div class="umf-quick-btns">
              ${[
                ["month", "Dieser Monat"],
                ["lastmonth", "Letzter Monat"],
                ["quarter", "Quartal"],
                ["year", "Dieses Jahr"],
                ["all", "Alle"],
              ]
                .map(
                  ([v, l]) => `
                <button class="umf-quick" onclick="_umFQuick('${v}')">${l}</button>`,
                )
                .join("")}
            </div>
            <div class="umf-date-row">
              <div class="umf-date-field">
                <span class="umf-date-lbl">Von</span>
                <input id="umFFrom" class="um-edit-inp" type="date" value="${_umFilter.dateFrom}">
              </div>
              <div class="umf-date-sep">→</div>
              <div class="umf-date-field">
                <span class="umf-date-lbl">Bis</span>
                <input id="umFTo" class="um-edit-inp" type="date" value="${_umFilter.dateTo}">
              </div>
            </div>
          </div>

          <div class="umf-section">
            <div class="umf-section-title">Betrag (€)</div>
            <div class="umf-range-row">
              <input id="umFAmtMin" class="um-edit-inp mono" type="number" step="0.01" min="0"
                placeholder="Min" value="${_umFilter.amtMin || ""}">
              <span class="umf-date-sep">—</span>
              <input id="umFAmtMax" class="um-edit-inp mono" type="number" step="0.01" min="0"
                placeholder="Max" value="${_umFilter.amtMax || ""}">
            </div>
          </div>

          <div class="umf-section">
            <div class="umf-section-title">IBAN</div>
            <input id="umFIban" class="um-edit-inp mono" type="text"
              placeholder="DE89… oder letzte 4 Ziffern"
              value="${esc(_umFilter.iban)}">
          </div>

        </div>

        <!-- Rechte Spalte -->
        <div class="umf-col">

          <div class="umf-section">
            <div class="umf-section-title">Typ</div>
            <div class="umf-chips">
              ${[
                ["all", "Alle"],
                ["einnahme", "Einnahmen"],
                ["ausgabe", "Ausgaben"],
                ["umbuchung", "Umbuchungen"],
              ]
                .map(
                  ([v, l]) => `
                <button class="umf-chip${_umFilter.type === v ? " active" : ""}" id="umFTyp_${v}"
                  onclick="document.querySelectorAll('[id^=umFTyp_]').forEach(b=>b.classList.remove('active'));this.classList.add('active')">${l}</button>`,
                )
                .join("")}
            </div>
          </div>

          <div class="umf-section">
            <div class="umf-section-title">Intervall</div>
            <div class="umf-chips">
              ${[
                ["all", "Alle"],
                ["monatl.", "Monatl."],
                ["viertelj.", "Viertelj."],
                ["halbjährl.", "Halbjährl."],
                ["jährl.", "Jährl."],
                ["einmalig", "Einmalig"],
              ]
                .map(
                  ([v, l]) => `
                <button class="umf-chip${_umFilter.interval === v ? " active" : ""}" id="umFInt_${v}"
                  onclick="document.querySelectorAll('[id^=umFInt_]').forEach(b=>b.classList.remove('active'));this.classList.add('active')">${l}</button>`,
                )
                .join("")}
            </div>
          </div>

          <div class="umf-section">
            <div class="umf-section-title">Status</div>
            <div class="umf-chips">
              ${[
                ["all", "Alle"],
                ["gebucht", "Gebucht"],
                ["geändert", "Geändert"],
                ["ausgesetzt", "Ausgesetzt"],
                ["vorgemerkt", "Vorgemerkt"],
              ]
                .map(
                  ([v, l]) => `
                <button class="umf-chip${_umFilter.status === v ? " active" : ""}" id="umFSt_${v}"
                  onclick="document.querySelectorAll('[id^=umFSt_]').forEach(b=>b.classList.remove('active'));this.classList.add('active')">${l}</button>`,
                )
                .join("")}
            </div>
          </div>

          <div class="umf-section">
            <div class="umf-section-title">Konto</div>
            <select id="umFAcc" class="um-edit-inp">
              <option value="">Alle Konten</option>
              ${accOpts}
            </select>
          </div>

          <div class="umf-section">
            <div class="umf-section-title">Kategorie</div>
            <div class="umf-chips umf-cat-chips">
              <button class="umf-chip${!_umFilter.categoryId ? " active" : ""}" id="umFCat_"
                onclick="document.querySelectorAll('[id^=umFCat_]').forEach(b=>b.classList.remove('active'));this.classList.add('active')">Alle</button>
              ${(Array.isArray(S.categories) ? S.categories : []).map(c =>
                `<button class="umf-chip${_umFilter.categoryId === c.id ? " active" : ""}" id="umFCat_${c.id}"
                  style="${_umFilter.categoryId === c.id ? `background:${c.color}22;color:${c.color};border-color:${c.color}` : ""}"
                  onclick="document.querySelectorAll('[id^=umFCat_]').forEach(b=>{b.classList.remove('active');b.style.background='';b.style.color='';b.style.borderColor='';});this.classList.add('active');this.style.background='${c.color}22';this.style.color='${c.color}';this.style.borderColor='${c.color}'">${c.icon} ${esc(c.name)}</button>`
              ).join("")}
            </div>
          </div>

          <div class="umf-section">
            <div class="umf-section-title">Kreditor</div>
            <div class="umf-chips umf-kred-chips">
              <button class="umf-chip${!_umFilter.creditorId ? " active" : ""}" id="umFKred_"
                onclick="document.querySelectorAll('[id^=umFKred_]').forEach(b=>b.classList.remove('active'));this.classList.add('active')">Alle</button>
              ${(Array.isArray(S.creditors) ? S.creditors : []).map(c => {
                const col = c.color || "var(--blue)";
                return `<button class="umf-chip${_umFilter.creditorId === c.id ? " active" : ""}" id="umFKred_${c.id}"
                  style="${_umFilter.creditorId === c.id ? `background:${col}22;color:${col};border-color:${col}` : ""}"
                  onclick="document.querySelectorAll('[id^=umFKred_]').forEach(b=>{b.classList.remove('active');b.style.background='';b.style.color='';b.style.borderColor='';});this.classList.add('active');this.style.background='${col}22';this.style.color='${col}';this.style.borderColor='${col}'">${esc(c.name)}</button>`;
              }).join("")}
            </div>
          </div>

          <div class="umf-section">
            <div class="umf-section-title">Sortierung</div>
            <div class="umf-range-row">
              <select id="umFSortK" class="um-edit-inp" style="flex:1">
                <option value="date"   ${_umSort.k === "date" ? "selected" : ""}>Datum</option>
                <option value="amount" ${_umSort.k === "amount" ? "selected" : ""}>Betrag</option>
                <option value="name"   ${_umSort.k === "name" ? "selected" : ""}>Name</option>
                <option value="type"   ${_umSort.k === "type" ? "selected" : ""}>Typ</option>
              </select>
              <select id="umFSortDir" class="um-edit-inp" style="flex:1">
                <option value="desc" ${!_umSort.asc ? "selected" : ""}>↓ Neueste</option>
                <option value="asc"  ${_umSort.asc ? "selected" : ""}>↑ Älteste</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      <!-- Footer -->
      <div class="umf-footer">
        <button class="btn" onclick="_umResetFilter();document.getElementById('umFilterOverlay').remove();renderPosten()">
          ↺ Zurücksetzen
        </button>
        <div style="display:flex;gap:8px;margin-left:auto;">
          <button class="btn" onclick="document.getElementById('umFilterOverlay').remove()">Abbrechen</button>
          <button class="btn primary" onclick="_umApplyFilter()">Anwenden</button>
        </div>
      </div>
    </div>`;

  document.body.appendChild(ov);
  ov.addEventListener("click", (e) => {
    if (e.target === ov) ov.remove();
  });
}

function _umFQuick(mode) {
  const n = today();
  const pad = (v) => String(v).padStart(2, "0");
  if (mode === "all") {
    document.getElementById("umFFrom").value = "";
    document.getElementById("umFTo").value = "";
    return;
  }
  if (mode === "month") {
    document.getElementById("umFFrom").value =
      `${n.getFullYear()}-${pad(n.getMonth() + 1)}-01`;
    document.getElementById("umFTo").value = todayIso();
    return;
  }
  if (mode === "lastmonth") {
    const lm = new Date(n.getFullYear(), n.getMonth() - 1, 1);
    const le = new Date(n.getFullYear(), n.getMonth(), 0);
    document.getElementById("umFFrom").value =
      `${lm.getFullYear()}-${pad(lm.getMonth() + 1)}-01`;
    document.getElementById("umFTo").value =
      `${le.getFullYear()}-${pad(le.getMonth() + 1)}-${pad(le.getDate())}`;
    return;
  }
  if (mode === "quarter") {
    const q = Math.floor(n.getMonth() / 3);
    document.getElementById("umFFrom").value =
      `${n.getFullYear()}-${pad(q * 3 + 1)}-01`;
    document.getElementById("umFTo").value = todayIso();
    return;
  }
  if (mode === "year") {
    document.getElementById("umFFrom").value = `${n.getFullYear()}-01-01`;
    document.getElementById("umFTo").value = todayIso();
    return;
  }
}

function _umApplyFilter() {
  _umFilter.search = document.getElementById("umFSearch")?.value.trim() || "";
  _umFilter.type =
    document
      .querySelector("[id^='umFTyp_'].active")
      ?.id.replace("umFTyp_", "") || "all";
  _umFilter.accountId = document.getElementById("umFAcc")?.value || "";
  _umFilter.dateFrom = document.getElementById("umFFrom")?.value || "";
  _umFilter.dateTo = document.getElementById("umFTo")?.value || "";
  _umFilter.status =
    document.querySelector("[id^='umFSt_'].active")?.id.replace("umFSt_", "") ||
    "all";
  _umFilter.amtMin = document.getElementById("umFAmtMin")?.value || "";
  _umFilter.amtMax = document.getElementById("umFAmtMax")?.value || "";
  _umFilter.iban = document.getElementById("umFIban")?.value.trim() || "";
  _umFilter.interval =
    document
      .querySelector("[id^='umFInt_'].active")
      ?.id.replace("umFInt_", "") || "all";
  const _catRaw = document.querySelector("[id^='umFCat_'].active")?.id.replace("umFCat_", "") || "";
  _umFilter.categoryId = _catRaw === "" ? "" : _catRaw;
  const _kredRaw = document.querySelector("[id^='umFKred_'].active")?.id.replace("umFKred_", "") || "";
  _umFilter.creditorId = _kredRaw === "" ? "" : _kredRaw;
  const sk = document.getElementById("umFSortK")?.value;
  const sd = document.getElementById("umFSortDir")?.value;
  if (sk) _umSort.k = sk;
  if (sd) _umSort.asc = sd === "asc";
  document.getElementById("umFilterOverlay")?.remove();
  renderPosten();
}

// ── KONTOAUSZUG EXPORT ────────────────
function openAuszugDialog() {
  const accOpts = S.accounts
    .map((a) => `<option value="${a.id}">${esc(a.label)}</option>`)
    .join("");
  document.getElementById("auszugDialog")?.remove();
  const n = today();
  const firstOfMonth = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-01`;
  const todayStr = todayIso();

  const dlg = document.createElement("div");
  dlg.id = "auszugDialog";
  dlg.style.cssText =
    "position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;";
  dlg.innerHTML = `
    <div style="background:var(--panel);border:1px solid var(--border2);border-radius:16px;padding:28px;width:420px;max-width:90vw;box-shadow:0 20px 60px rgba(0,0,0,.4);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <div><div style="font-size:1em;font-weight:700;">Kontoauszug exportieren</div><div style="font-size:.7em;color:var(--text3);margin-top:2px;">Aus Buchungshistorie</div></div>
        <div onclick="document.getElementById('auszugDialog').remove()" style="cursor:pointer;color:var(--text3);padding:4px 8px;">✕</div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;">
        <button class="btn sm" onclick="document.getElementById('azFrom').value='${firstOfMonth}';document.getElementById('azTo').value='${todayStr}'">Dieser Monat</button>
        <button class="btn sm" onclick="document.getElementById('azFrom').value='${n.getFullYear()}-01-01';document.getElementById('azTo').value='${todayStr}'">Dieses Jahr</button>
        <button class="btn sm" onclick="document.getElementById('azFrom').value='';document.getElementById('azTo').value=''">Alles</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
        <div><label style="font-size:.68em;color:var(--text3);display:block;margin-bottom:4px;">Von</label>
          <input id="azFrom" type="date" value="${firstOfMonth}" style="width:100%;box-sizing:border-box;background:var(--panel2);border:1px solid var(--border2);border-radius:var(--r1);padding:7px 10px;color:var(--text);font-size:.82em;outline:none;"></div>
        <div><label style="font-size:.68em;color:var(--text3);display:block;margin-bottom:4px;">Bis</label>
          <input id="azTo" type="date" value="${todayStr}" style="width:100%;box-sizing:border-box;background:var(--panel2);border:1px solid var(--border2);border-radius:var(--r1);padding:7px 10px;color:var(--text);font-size:.82em;outline:none;"></div>
      </div>
      <div style="margin-bottom:16px;">
        <label style="font-size:.68em;color:var(--text3);display:block;margin-bottom:4px;">Konto</label>
        <select id="azAcc" style="width:100%;background:var(--panel2);border:1px solid var(--border2);border-radius:var(--r1);padding:7px 10px;color:var(--text);font-size:.82em;outline:none;">
          <option value="">Alle Konten</option>${accOpts}
        </select>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;">
        <button class="btn" onclick="document.getElementById('auszugDialog').remove()">Abbrechen</button>
        <button class="btn primary" onclick="runAuszugExport()">⬇ Exportieren</button>
      </div>
    </div>`;
  document.body.appendChild(dlg);
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) dlg.remove();
  });
}

function runAuszugExport() {
  const from = document.getElementById("azFrom")?.value || "";
  const to = document.getElementById("azTo")?.value || "";
  const accId = document.getElementById("azAcc")?.value || "";
  document.getElementById("auszugDialog")?.remove();
  exportKontoauszugBookings(from, to, accId);
}

function exportKontoauszugBookings(fromDate, toDate, accId) {
  const n = today();
  let data = [...(S.bookings || [])];
  if (fromDate) data = data.filter((b) => b.date >= fromDate);
  if (toDate) data = data.filter((b) => b.date <= toDate);
  if (accId) data = data.filter((b) => b.accountId === accId);
  data.sort((a, b) => b.date.localeCompare(a.date));

  const inc = data
    .filter((b) => b.type === "einnahme")
    .reduce((s, b) => s + b.amount, 0);
  const exp = data
    .filter((b) => b.type === "ausgabe")
    .reduce((s, b) => s + b.amount, 0);
  const rangeLabel =
    fromDate && toDate
      ? `${new Date(fromDate).toLocaleDateString("de-DE")} – ${new Date(toDate).toLocaleDateString("de-DE")}`
      : "Alle Zeiträume";

  const rows = data
    .map((b) => {
      const acc = S.accounts.find((a) => a.id === b.accountId);
      const color =
        b.type === "einnahme"
          ? "#1a6b1a"
          : b.type === "umbuchung"
            ? "#555"
            : "#b00";
      const prefix =
        b.type === "einnahme" ? "+" : b.type === "umbuchung" ? "⇄" : "−";
      return `<tr>
      <td>${new Date(b.date).toLocaleDateString("de-DE")}</td>
      <td>${esc(b.name)}</td>
      <td style="color:${color}">${b.type}</td>
      <td>${b.interval || "—"}</td>
      <td>${acc ? esc(acc.label) : "—"}</td>
      <td style="text-align:right;font-family:monospace;color:${color}">${prefix}${(b.amount || 0).toFixed(2).replace(".", ",")} €</td>
      <td style="font-size:.85em;color:#888">${b.status}</td>
    </tr>`;
    })
    .join("");

  const html = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8">
<title>Kontoauszug · VaultBox</title>
<style>body{font-family:'Segoe UI',Arial,sans-serif;font-size:11pt;color:#111;margin:0;padding:0;}
.header{background:#0f0e09;color:#fff;padding:24px 32px;display:flex;justify-content:space-between;}
.body{padding:28px 32px;}
table{width:100%;border-collapse:collapse;font-size:.85em;}
th{text-align:left;font-weight:700;font-size:.72em;text-transform:uppercase;letter-spacing:.8px;color:#666;padding:6px 8px;border-bottom:2px solid #e0e0e0;}
td{padding:6px 8px;border-bottom:1px solid #f0f0f0;}
.summary{display:flex;gap:20px;margin-bottom:24px;}
.kpi{background:#f7f8fa;border-radius:8px;padding:14px 18px;flex:1;}
.kpi-lbl{font-size:.7em;text-transform:uppercase;color:#888;margin-bottom:4px;}
.kpi-val{font-size:1.1em;font-weight:700;}
</style></head><body>
<div class="header">
  <div><div style="font-size:1.1em;font-weight:700;">VaultBox</div><div style="font-size:.75em;opacity:.6;">Buchungshistorie · ${rangeLabel}</div></div>
  <div style="font-size:.8em;opacity:.7;">Erstellt: ${n.toLocaleDateString("de-DE")}</div>
</div>
<div class="body">
  <div class="summary">
    <div class="kpi"><div class="kpi-lbl">Einnahmen</div><div class="kpi-val" style="color:#1a6b1a">+${inc.toFixed(2).replace(".", ",")} €</div></div>
    <div class="kpi"><div class="kpi-lbl">Ausgaben</div><div class="kpi-val" style="color:#b00">−${exp.toFixed(2).replace(".", ",")} €</div></div>
    <div class="kpi"><div class="kpi-lbl">Saldo</div><div class="kpi-val" style="color:${inc - exp >= 0 ? "#1a6b1a" : "#b00"}">${inc - exp >= 0 ? "+" : ""}${(inc - exp).toFixed(2).replace(".", ",")} €</div></div>
    <div class="kpi"><div class="kpi-lbl">Buchungen</div><div class="kpi-val">${data.length}</div></div>
  </div>
  <table><thead><tr><th>Datum</th><th>Bezeichnung</th><th>Typ</th><th>Intervall</th><th>Konto</th><th style="text-align:right">Betrag</th><th>Status</th></tr></thead>
  <tbody>${rows}</tbody></table>
</div></body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `buchungen_${todayIso()}.html`;
  a.click();
}
