// ══════════════════════════════════════
//  VERTRÄGE & LAUFZEITEN
// ══════════════════════════════════════

let _ctrShowExpired = true;
let _ctrView = "list"; // "list" | "grid"
let _ctrSort = "end";
let _ctrSortAsc = true;
let _ctrIntervalFilter = "all"; // "all" | "monatl." | "viertelj." | "halbjährl." | "jährl." | "einmalig"
// Gespeicherte Spaltenbreiten — überleben Re-Renders im selben Session
let _ctrColWidths = null;

// ── STATUS ────────────────────────────
function _ctrStatus(p) {
  const now = new Date();
  if (_hasDate(p.contractEnd)) {
    const end = new Date(p.contractEnd);
    const endOfMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0);
    if (now > endOfMonth) return "expired";
    const daysLeft = Math.ceil((endOfMonth - now) / 86400000);
    if (daysLeft <= 60) return "expiring";
  }
  if (_hasDate(p.contractStart)) {
    const start = new Date(p.contractStart);
    if (now < new Date(start.getFullYear(), start.getMonth(), 1))
      return "future";
  }
  return "active";
}

function _ctrDaysLeft(p) {
  if (!_hasDate(p.contractEnd)) return null;
  const end = new Date(p.contractEnd);
  const endOfMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0);
  return Math.ceil((endOfMonth - new Date()) / 86400000);
}

function _ctrStatusBadge(p) {
  const status = _ctrStatus(p);
  const type = p.type === "einnahme" ? "Einnahme" : "Ausgabe";
  const days = _ctrDaysLeft(p);
  switch (status) {
    case "expired":
      return `<span class="ctr-badge ctr-expired" onmouseenter="_showTooltip('${type} ist abgelaufen und nicht mehr aktiv.',this)" onmouseleave="_hideTooltip()">${type} beendet</span>`;
    case "expiring":
      return `<span class="ctr-badge ctr-expiring" onmouseenter="_showTooltip('Läuft in ${days} Tagen ab — verlängern oder kündigen?',this)" onmouseleave="_hideTooltip()">Endet in ${days}d</span>`;
    case "future":
      return `<span class="ctr-badge ctr-future" onmouseenter="_showTooltip('Startdatum liegt in der Zukunft — noch nicht aktiv.',this)" onmouseleave="_hideTooltip()">Startet bald</span>`;
    default:
      return _hasDate(p.contractEnd)
        ? `<span class="ctr-badge ctr-active" onmouseenter="_showTooltip('Aktiver Vertrag mit festem Laufzeitende.',this)" onmouseleave="_hideTooltip()">Aktiv</span>`
        : `<span class="ctr-badge ctr-open" onmouseenter="_showTooltip('Unbefristeter Vertrag ohne Laufzeitende.',this)" onmouseleave="_hideTooltip()">Unbefristet</span>`;
  }
}

// ── SORTIERUNG ────────────────────────
function _ctrSortPosten(list) {
  const ord = { active: 0, expiring: 1, future: 2, expired: 3 };
  return [...list].sort((a, b) => {
    const sa = ord[_ctrStatus(a)] ?? 9;
    const sb = ord[_ctrStatus(b)] ?? 9;
    if (sa !== sb) return sa - sb;
    let va, vb;
    switch (_ctrSort) {
      case "end":
        va = _hasDate(a.contractEnd)
          ? new Date(a.contractEnd).getTime()
          : _ctrStatus(a) === "expired"
            ? 0
            : Infinity;
        vb = _hasDate(b.contractEnd)
          ? new Date(b.contractEnd).getTime()
          : _ctrStatus(b) === "expired"
            ? 0
            : Infinity;
        break;
      case "start":
        va = _hasDate(a.contractStart)
          ? new Date(a.contractStart).getTime()
          : 0;
        vb = _hasDate(b.contractStart)
          ? new Date(b.contractStart).getTime()
          : 0;
        break;
      case "amount":
        va = parseFloat(a.amount) || 0;
        vb = parseFloat(b.amount) || 0;
        break;
      default: // name
        return _ctrSortAsc
          ? (a.name || "").localeCompare(b.name || "", "de")
          : (b.name || "").localeCompare(a.name || "", "de");
    }
    return _ctrSortAsc ? va - vb : vb - va;
  });
}

// ── KPI STRIP ─────────────────────────
function _ctrRenderKPIs(allPosten) {
  const active = allPosten.filter(p => ['active', 'future'].includes(_ctrStatus(p)));
  const expiring = allPosten.filter(p => _ctrStatus(p) === 'expiring');
  const totalOut = allPosten
    .filter(p => p.type !== 'einnahme' && _ctrStatus(p) !== 'expired')
    .reduce((s, p) => s + avgMonthly(p), 0);
  const totalIn = allPosten
    .filter(p => p.type === 'einnahme' && _ctrStatus(p) !== 'expired')
    .reduce((s, p) => s + avgMonthly(p), 0);

  // Top-3 Ausgaben-Verträge
  const top3 = allPosten
    .filter(p => p.type !== 'einnahme' && _ctrStatus(p) !== 'expired')
    .sort((a, b) => avgMonthly(b) - avgMonthly(a))
    .slice(0, 3);

  const top3Html = top3.length ? top3.map((p, i) => `
    <div class="ctr-top3-row">
      <span class="ctr-top3-rank">${i + 1}</span>
      <span class="ctr-top3-name" title="${esc(p.name)}">${esc(p.name.length > 22 ? p.name.slice(0, 20) + "…" : p.name)}</span>
      <span class="ctr-top3-amt">${fm(avgMonthly(p))}/Mo</span>
    </div>`).join("") : `<div style="color:var(--text3);font-size:.75em;padding:4px 0">Keine Daten</div>`;

  const warnStyle = expiring.length > 0 ? 'color:var(--amber)' : '';
  return `<div class="ctr-kpi-strip">
    <div class="ctr-kpi">
      <div class="ctr-kpi-val">${active.length + expiring.length}</div>
      <div class="ctr-kpi-lbl">Aktive Verträge</div>
    </div>
    <div class="ctr-kpi" style="${expiring.length > 0 ? '--ctr-kpi-accent:linear-gradient(90deg,var(--amber),transparent)' : ''}">
      <div class="ctr-kpi-val" style="${warnStyle}">${expiring.length}</div>
      <div class="ctr-kpi-lbl">Laufen bald aus</div>
    </div>
    <div class="ctr-kpi" style="--ctr-kpi-accent:linear-gradient(90deg,var(--red-a35,rgba(255,77,106,.35)),transparent)">
      <div class="ctr-kpi-val" style="color:var(--red)">−${fm(totalOut)}</div>
      <div class="ctr-kpi-lbl">Mtl. Kosten</div>
    </div>
    <div class="ctr-kpi" style="--ctr-kpi-accent:linear-gradient(90deg,var(--green-a35,rgba(0,229,160,.35)),transparent)">
      <div class="ctr-kpi-val" style="color:var(--green)">+${fm(totalIn)}</div>
      <div class="ctr-kpi-lbl">Mtl. Einnahmen</div>
    </div>
    <div class="ctr-kpi ctr-kpi-top3" style="--ctr-kpi-accent:linear-gradient(90deg,var(--blue-a20),transparent)">
      <div class="ctr-kpi-lbl" style="margin-bottom:6px;font-weight:700;color:var(--text2)">Top 3 Kosten</div>
      ${top3Html}
    </div>
  </div>`;
}

// ── HAUPTRENDER ───────────────────────
function renderVertraege() {
  const container = document.getElementById("contractList");
  if (!container) return;

  const _isVertrag = (p) =>
    p.interval !== "einmalig" &&
    (_hasDate(p.contractStart) || _hasDate(p.contractEnd));

  let posten = (S.data || []).filter(_isVertrag);

  if (!_ctrShowExpired) {
    posten = posten.filter((p) => _ctrStatus(p) !== "expired");
  }
  if (_ctrIntervalFilter !== "all") {
    posten = posten.filter((p) => p.interval === _ctrIntervalFilter);
  }

  posten = _ctrSortPosten(posten);

  const activeCount = (S.data || []).filter(
    (p) =>
      _isVertrag(p) &&
      ["active", "expiring", "future"].includes(_ctrStatus(p)),
  ).length;
  const expiredCount = (S.data || []).filter(
    (p) => _isVertrag(p) && _ctrStatus(p) === "expired",
  ).length;
  const expiringCount = posten.filter(
    (p) => _ctrStatus(p) === "expiring",
  ).length;

  // Sortier-Header Helper — nutzt native sortable-Klassen der App
  const thSort = (key, label, cls = "") => {
    const active = _ctrSort === key;
    const arr = active ? (_ctrSortAsc ? "↑" : "↓") : "↕";
    const click = active
      ? `_ctrSort='${key}';_ctrSortAsc=!_ctrSortAsc;renderVertraege()`
      : `_ctrSort='${key}';_ctrSortAsc=true;renderVertraege()`;
    return `<th class="sortable${active ? " sort-active" : ""}${cls ? " " + cls : ""}" onclick="${click}">
      <span class="th-inner">${label} <span class="sort-arr">${arr}</span></span>
    </th>`;
  };

  // Build allPosten (before filtering for expired toggle)
  const allForKPI = (S.data || []).filter(_isVertrag);

  // ── Page Header ──
  let html = `
    <div class="ctr-page-header">
      <div>
        <div class="ctr-page-title-lbl">Verträge & Laufzeiten</div>
        <div class="ctr-page-subtitle">
          ${activeCount} aktiv
          ${expiringCount > 0 ? `· <span style="color:var(--amber)">${expiringCount} laufen bald aus</span>` : ""}
          ${expiredCount > 0 ? `· ${expiredCount} abgelaufen` : ""}
        </div>
      </div>
      <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
        ${
          expiredCount > 0
            ? `
          <div class="icon-btn" onclick="_ctrShowExpired=!_ctrShowExpired;renderVertraege()" onmouseenter="_showTooltip('${_ctrShowExpired ? "Abgelaufene ausblenden" : "Abgelaufene einblenden"}',this)" onmouseleave="_hideTooltip()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              ${
                _ctrShowExpired
                  ? '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/><line x1="3" y1="3" x2="21" y2="21"/>'
                  : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'
              }
            </svg>
            ${_ctrShowExpired ? "Abgelaufene" : `${expiredCount} abgelaufen`}
          </div>`
            : ""
        }
        <div class="icon-btn ${_ctrView === "list" ? "primary" : ""}" onclick="_ctrView='list';renderVertraege()" onmouseenter="_showTooltip('Listenansicht',this)" onmouseleave="_hideTooltip()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
            <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
        </div>
        <div class="icon-btn ${_ctrView === "grid" ? "primary" : ""}" onclick="_ctrView='grid';renderVertraege()" onmouseenter="_showTooltip('Kartenansicht',this)" onmouseleave="_hideTooltip()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
          </svg>
        </div>
        <div class="icon-btn primary" onclick="openModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Neuer Posten
        </div>
      </div>
    </div>
    ${_ctrRenderKPIs(allForKPI)}
    <div class="ctr-interval-filter">
      ${["all","monatl.","viertelj.","halbjährl.","jährl.","einmalig"].map(v => {
        const label = { all:"Alle", "monatl.":"Monatl.", "viertelj.":"Viertelj.", "halbjährl.":"Halbjährl.", "jährl.":"Jährl.", "einmalig":"Einmalig" }[v];
        return `<button class="ctr-itv-btn${_ctrIntervalFilter === v ? " active" : ""}" onclick="_ctrIntervalFilter='${v}';renderVertraege()">${label}</button>`;
      }).join("")}
    </div>
    ${expiringCount > 0 && !sessionStorage.getItem("csf_ctr_hint_dismissed") ? `
    <div class="ctr-expiry-hint">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span class="ctr-expiry-hint-text">${expiringCount} ${expiringCount === 1 ? "Vertrag läuft" : "Verträge laufen"} bald aus — verlängern oder kündigen?</span>
      <button class="ctr-expiry-hint-close" onclick="_ctrDismissHint()" onmouseenter="_showTooltip('Hinweis ausblenden',this)" onmouseleave="_hideTooltip()">✕</button>
    </div>` : ""}`;

  if (posten.length === 0) {
    html += `<div style="padding:48px 20px;text-align:center;color:var(--text3)">
      <div style="font-size:1.8em;margin-bottom:10px">📋</div>
      <div style="font-size:.85em;font-weight:700;color:var(--text2);margin-bottom:4px">Keine Verträge</div>
      <div style="font-size:.75em">Füge einem Posten ein Start- oder Enddatum hinzu</div>
    </div>`;
    container.innerHTML = html;
    return;
  }

  if (_ctrView === "grid") {
    html += _ctrRenderGrid(posten);
  } else {
    html += _ctrRenderList(posten, thSort);
  }

  container.innerHTML = html; // safe: all user values passed through esc()
  if (_ctrView === "list") _ctrInitColResize();
}

// ── SPALTENBREITEN DRAG-RESIZE ─────────
function _ctrInitColResize() {
  const table = document.querySelector("#contractList table");
  if (!table) return;
  const ths = Array.from(table.querySelectorAll("thead th"));

  // Gespeicherte Breiten wiederherstellen
  if (_ctrColWidths) {
    ths.forEach((th, i) => {
      if (_ctrColWidths[i] != null) {
        th.style.width = _ctrColWidths[i] + "px";
        th.style.minWidth = _ctrColWidths[i] + "px";
      }
    });
  }

  ths.forEach((th, i) => {
    if (i === ths.length - 1) return; // Edit-Button-Spalte überspringen
    th.style.position = "relative";
    const handle = document.createElement("div");
    handle.className = "col-resizer";
    handle.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startW = th.getBoundingClientRect().width;
      handle.classList.add("active");
      document.body.style.cursor = "col-resize";
      const onMove = (ev) => {
        const newW = Math.max(80, startW + ev.clientX - startX);
        th.style.width = newW + "px";
        th.style.minWidth = newW + "px";
        if (!_ctrColWidths) _ctrColWidths = new Array(ths.length).fill(null);
        _ctrColWidths[i] = newW;
      };
      const onUp = () => {
        handle.classList.remove("active");
        document.body.style.cursor = "";
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });
    th.appendChild(handle);
  });
}

// ── LISTENANSICHT — native tbl-wrap ───
function _ctrRenderList(posten, thSort) {
  let rows = "";
  let shownExpiredSep = false;
  const _acked = _ctrAckedSet();

  posten.forEach((p) => {
    const status = _ctrStatus(p);
    const acc = S.accounts.find((a) => a.id === p.accountId);
    const color = acc ? acc.color : "var(--border2)";
    const isExp = status === "expired";
    const days = _ctrDaysLeft(p);
    const actionNeeded = status === "expiring" && !_acked.has(p.id);

    if (isExp && !shownExpiredSep) {
      shownExpiredSep = true;
      rows += `<tr class="ctr-sep-row">
        <td colspan="9">
          <span style="font-size:.62em;font-weight:800;text-transform:uppercase;letter-spacing:1.2px;color:var(--text3);opacity:.7">Abgelaufen</span>
        </td>
      </tr>`;
    }

    const startStr = _hasDate(p.contractStart)
      ? new Date(p.contractStart).toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "—";
    const endStr = _hasDate(p.contractEnd)
      ? new Date(p.contractEnd).toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "—";

    // Fortschrittsbalken (nur wenn Start + Ende vorhanden)
    let bar = "";
    if (_hasDate(p.contractStart) && _hasDate(p.contractEnd)) {
      const s = new Date(p.contractStart).getTime();
      const e = new Date(p.contractEnd).getTime();
      const pct = Math.min(
        100,
        Math.max(0, Math.round(((Date.now() - s) / (e - s)) * 100)),
      );
      const bc = isExp
        ? "var(--border2)"
        : status === "expiring"
          ? "var(--amber)"
          : color;
      bar = `<div style="height:2px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden;margin-top:5px;max-width:180px">
        <div style="height:100%;width:${pct}%;background:${bc};border-radius:2px;transition:width .4s"></div>
      </div>`;
    }

    const amtColor = p.type === "einnahme" ? "var(--green)" : "var(--red)";
    const amtSign = p.type === "einnahme" ? "+" : "−";

    const _ctrCat = (() => {
      if (!p.categoryId) return null;
      const _cats = Array.isArray(S.categories) ? S.categories : [];
      return _cats.find(c => c.id === p.categoryId) || null;
    })();
    const _ctrCred = (() => {
      if (!p.creditorId) return null;
      return (Array.isArray(S.creditors) ? S.creditors : []).find(c => c.id === p.creditorId) || null;
    })();

    rows += `<tr class="ctr-row${isExp ? " ctr-row-expired" : ""}${status === "expiring" ? " ctr-row-expiring" : ""}${actionNeeded ? " ctr-row-action" : ""}" onclick="openModal(${S.data.indexOf(p)})" style="cursor:pointer">
      <td class="ctr-td-name">
        <div style="display:flex;align-items:flex-start;gap:8px">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;margin-top:5px"></span>
          <div style="min-width:0;flex:1">
            <span class="ctr-name-text">${esc(p.name)}</span>
            ${p.note ? `<div class="ctr-note-text">${esc(p.note)}</div>` : ""}
            ${bar}
          </div>
        </div>
      </td>
      <td class="ctr-td-cat">
        ${_ctrCat
          ? `<span class="ctr-name-badge" onmouseenter="_showTooltip('Kategorie: ${esc(_ctrCat.name)}',this)" onmouseleave="_hideTooltip()" style="background:${esc(_ctrCat.color)}22;border-color:${esc(_ctrCat.color)}44;color:${esc(_ctrCat.color)};display:inline-flex;align-items:center;justify-content:center">${uiIcon(_ctrCat.icon, 14)}</span>`
          : `<span style="color:var(--text3)">—</span>`}
      </td>
      <td class="ctr-td-cred" onclick="event.stopPropagation()">
        ${_ctrCred ? (() => {
          const _cc = _ctrCred.color || "var(--blue)";
          const _cloUrl = _krLogoUrl(_ctrCred);
          const _ccE = esc(_cc);
          const _cav = _cloUrl
            ? `<img src="${esc(_cloUrl)}" style="width:18px;height:18px;object-fit:contain;border-radius:3px;vertical-align:middle;" onerror="this.style.display='none'" />`
            : `<span style="font-size:.65em;font-weight:700">${esc((_ctrCred.icon || (_ctrCred.name||"?")[0]).slice(0,2))}</span>`;
          return `<button class="ctr-cred-pill" style="background:color-mix(in srgb, ${_ccE} 18%, var(--cs-bg));border-color:${_ccE}55;color:${_ccE}" onmouseenter="_showTooltip('Kreditor: ${esc(_ctrCred.name)}',this)" onmouseleave="_hideTooltip()" onclick="event.stopPropagation();openCreditorPopover('${_ctrCred.id}',this)">${_cav} ${esc(_ctrCred.name)}</button>`;
        })() : `<span style="color:var(--text3)">—</span>`}
      </td>
      <td style="padding:12px 16px;font-family:var(--mono);font-size:.88em;color:var(--text2);white-space:nowrap">${startStr}</td>
      <td style="padding:12px 16px;font-family:var(--mono);font-size:.88em;white-space:nowrap;color:${status === "expiring" ? "var(--amber)" : isExp ? "var(--text3)" : "var(--text2)"}">
        ${endStr}
        ${days !== null && !isExp && days <= 60 ? `<span style="font-size:.75em;font-weight:700;color:var(--amber);margin-left:4px">${days}d</span>` : ""}
      </td>
      <td style="padding:12px 16px;font-family:var(--mono);font-weight:700;color:${amtColor};white-space:nowrap;text-align:right">${amtSign}${fm(parseFloat(p.amount) || 0)}</td>
      <td style="padding:12px 16px">
        <span style="font-size:.72em;font-weight:700;color:var(--text3);background:rgba(255,255,255,.04);border:1px solid var(--border);padding:2px 7px;border-radius:5px;white-space:nowrap">${p.interval || "—"}</span>
      </td>
      <td style="padding:12px 16px">${_ctrStatusBadge(p)}${(() => {
        if (!p.cancellationDays || !_hasDate(p.contractEnd)) return "";
        const deadline = new Date(p.contractEnd);
        deadline.setDate(deadline.getDate() - p.cancellationDays);
        const diffDays = Math.ceil((deadline - new Date()) / 86400000);
        if (diffDays > 60) return "";
        const dateStr = deadline.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
        if (diffDays < 0)
          return `<br><span class="ctr-badge ctr-cancel-missed" onmouseenter="_showTooltip('Kündigungsfrist abgelaufen am ${dateStr}',this)" onmouseleave="_hideTooltip()">⚠ Frist verpasst</span>`;
        return `<br><span class="ctr-badge ctr-cancel-warn" onmouseenter="_showTooltip('Kündigen bis ${dateStr} (${p.cancellationDays} Tage Frist)',this)" onmouseleave="_hideTooltip()">Kündigen bis ${dateStr}</span>`;
      })()}</td>
      <td style="padding:8px 10px;width:auto;text-align:right;white-space:nowrap" onclick="event.stopPropagation()">
        ${actionNeeded ? `<button class="ctr-ack-btn" onclick="event.stopPropagation();_ctrAck('${p.id}')" onmouseenter="_showTooltip('Handlungsbedarf erledigt — Markierung entfernen',this)" onmouseleave="_hideTooltip()">${iconHtml("check", 13)}</button>` : ""}
        <div class="icon-btn" style="min-width:unset;width:28px;height:28px;padding:0;display:inline-flex" onclick="openModal(${S.data.indexOf(p)})" onmouseenter="_showTooltip('Bearbeiten',this)" onmouseleave="_hideTooltip()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </div>
      </td>
    </tr>`;
  });

  return `<div class="tbl-wrap">
    <table>
      <thead>
        <tr>
          ${thSort("name", "Bezeichnung")}
          <th class="ctr-th-cat"><span class="th-inner">Kat.</span></th>
          <th class="ctr-th-cred"><span class="th-inner">Kreditor</span></th>
          ${thSort("start", "Start")}
          ${thSort("end", "Ende" + ttIcon("tt-vertrag-end"))}
          ${thSort("amount", "Betrag", "r")}
          <th><span class="th-inner">Intervall</span></th>
          <th><span class="th-inner">Status${ttIcon("tt-vertrag-status")}</span></th>
          <th style="width:44px"></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

// ── KARTENANSICHT ─────────────────────
function _ctrRenderGrid(posten) {
  let cards = "";
  let shownExpiredSep = false;
  const _acked = _ctrAckedSet();

  posten.forEach((p) => {
    const status = _ctrStatus(p);
    const acc = S.accounts.find((a) => a.id === p.accountId);
    const color = acc ? acc.color : "var(--border2)";
    const isExp = status === "expired";
    const actionNeeded = status === "expiring" && !_acked.has(p.id);
    const days = _ctrDaysLeft(p);

    if (isExp && !shownExpiredSep) {
      shownExpiredSep = true;
      cards += `<div class="ctr-grid-sep">Abgelaufen</div>`;
    }

    const startStr = _hasDate(p.contractStart)
      ? new Date(p.contractStart).toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : null;
    const endStr = _hasDate(p.contractEnd)
      ? new Date(p.contractEnd).toLocaleDateString("de-DE", {
          month: "2-digit",
          year: "numeric",
        })
      : null;

    let bar = "";
    if (_hasDate(p.contractStart) && _hasDate(p.contractEnd)) {
      const s = new Date(p.contractStart).getTime();
      const e = new Date(p.contractEnd).getTime();
      const pct = Math.min(
        100,
        Math.max(0, Math.round(((Date.now() - s) / (e - s)) * 100)),
      );
      const bc = isExp
        ? "var(--border2)"
        : status === "expiring"
          ? "var(--amber)"
          : color;
      bar = `<div style="height:2px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden;margin:10px 0 8px">
        <div style="height:100%;width:${pct}%;background:${bc};border-radius:2px"></div>
      </div>`;
    }

    const amtColor = p.type === "einnahme" ? "var(--green)" : "var(--red)";
    const amtSign = p.type === "einnahme" ? "+" : "−";

    const _ctrCat = p.categoryId ? (Array.isArray(S.categories) ? S.categories : []).find(c => c.id === p.categoryId) || null : null;
    const _ctrCred = p.creditorId ? (Array.isArray(S.creditors) ? S.creditors : []).find(c => c.id === p.creditorId) || null : null;
    const _catBadge = _ctrCat
      ? `<span class="ctr-card-cat" style="background:color-mix(in srgb, ${esc(_ctrCat.color)} 16%, var(--cs-bg));border-color:${esc(_ctrCat.color)}55;color:${esc(_ctrCat.color)}">${uiIcon(_ctrCat.icon, 12)} ${esc(_ctrCat.name)}</span>`
      : "";
    const _credBadge = _ctrCred ? (() => {
      const _ccE = esc(_ctrCred.color || "var(--blue)");
      const _cloUrl = _krLogoUrl(_ctrCred);
      const _cav = _cloUrl
        ? `<img src="${esc(_cloUrl)}" style="width:16px;height:16px;object-fit:contain;border-radius:3px;vertical-align:middle" onerror="this.style.display='none'" />`
        : `<span style="font-size:.7em;font-weight:700">${esc((_ctrCred.icon || (_ctrCred.name||"?")[0]).slice(0,2))}</span>`;
      return `<button class="ctr-cred-pill" style="background:color-mix(in srgb, ${_ccE} 18%, var(--cs-bg));border-color:${_ccE}55;color:${_ccE}" onmouseenter="_showTooltip('Kreditor: ${esc(_ctrCred.name)}',this)" onmouseleave="_hideTooltip()" onclick="event.stopPropagation();openCreditorPopover('${_ctrCred.id}',this)">${_cav} ${esc(_ctrCred.name)}</button>`;
    })() : "";

    cards += `<div class="ctr-card${isExp ? " ctr-card-expired" : ""}${status === "expiring" ? " ctr-card-expiring" : ""}${actionNeeded ? " ctr-card-action" : ""}"
      style="cursor:pointer;--ctr-color:${color}"
      onclick="openModal(${S.data.indexOf(p)})">
      <div class="ctr-card-head">
        <div class="ctr-card-title">
          <span style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;display:inline-block"></span>
          <span style="font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:.88em">${esc(p.name)}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
          ${actionNeeded ? `<button class="ctr-ack-btn" onclick="event.stopPropagation();_ctrAck('${p.id}')" onmouseenter="_showTooltip('Handlungsbedarf erledigt — Markierung entfernen',this)" onmouseleave="_hideTooltip()">${iconHtml("check", 13)}</button>` : ""}
          ${_ctrStatusBadge(p)}
        </div>
      </div>
      <div class="ctr-card-amount" style="color:${amtColor}">
        ${amtSign}${fm(parseFloat(p.amount) || 0)}
        <span style="font-size:.55em;font-weight:600;color:var(--text2);background:color-mix(in srgb, var(--text3) 14%, var(--cs-bg));border:1px solid var(--border2);padding:2px 7px;border-radius:5px;margin-left:4px;letter-spacing:.2px">${p.interval || ""}</span>
      </div>
      ${bar}
      <div class="ctr-card-dates">
        ${startStr ? `<div class="ctr-card-date-item"><span class="ctr-date-lbl">Start</span><span>${startStr}</span></div>` : ""}
        ${endStr ? `<div class="ctr-card-date-item" style="color:${status === "expiring" ? "var(--amber)" : "var(--text3)"}"><span class="ctr-date-lbl">Ende</span><span>${endStr}${days !== null && !isExp && days <= 60 ? ` <span style="color:var(--amber);font-weight:700">${days}d</span>` : ""}</span></div>` : ""}
      </div>
      ${p.note ? `<div class="ctr-card-note">${esc(p.note)}</div>` : ""}
      ${(_catBadge || _credBadge) ? `<div class="ctr-card-meta">${_catBadge}${_credBadge}</div>` : ""}
    </div>`;
  });

  return `<div class="ctr-grid">${cards}</div>`;
}

// ── HINT DISMISS ─────────────────────
function _ctrDismissHint() {
  sessionStorage.setItem("csf_ctr_hint_dismissed", "1");
  const hint = document.querySelector(".ctr-expiry-hint");
  if (hint) hint.remove();
}

// ── CONTRACT BADGE (Nav) ──────────────
// Zeigt einen Zähler in der Navigation, WENN Verträge in ≤ 60 Tagen enden.
// Abschaltbar über CFG.contractAlerts (Einstellungen → Verhalten).
// Spiegelt immer den aktuellen Stand — kein verstecktes Session-Verhalten.
// ── HANDLUNGSBEDARF (Kündigungsfrist) — Quittierung ──
// Ein Vertrag braucht Aufmerksamkeit, wenn er in ≤ 60 Tagen ausläuft.
// Der User kann den Handlungsbedarf pro Vertrag abhaken ("Erledigt") —
// gespeichert in localStorage. Sobald ein Vertrag nicht mehr ausläuft
// (verlängert/gekündigt), wird die Quittierung automatisch entfernt, damit
// erneutes Auslaufen wieder alarmiert.
function _ctrAckedSet() {
  try { return new Set(JSON.parse(localStorage.getItem("csf_ctr_acked") || "[]")); }
  catch (_) { return new Set(); }
}
function _ctrSaveAcked(set) {
  try { localStorage.setItem("csf_ctr_acked", JSON.stringify([...set])); } catch (_) {}
}
function _ctrIsExpiring(p) {
  return p.interval !== "einmalig" &&
    (_hasDate(p.contractStart) || _hasDate(p.contractEnd)) &&
    _ctrStatus(p) === "expiring";
}
function _ctrActionNeeded() {
  const acked = _ctrAckedSet();
  let changed = false;
  const out = [];
  (S.data || []).forEach((p) => {
    if (_ctrIsExpiring(p)) { if (!acked.has(p.id)) out.push(p); }
    else if (acked.has(p.id)) { acked.delete(p.id); changed = true; }
  });
  if (changed) _ctrSaveAcked(acked);
  return out;
}
function _ctrAck(id) {
  const s = _ctrAckedSet(); s.add(id); _ctrSaveAcked(s);
  if (typeof _hideTooltip === "function") _hideTooltip();
  if (typeof renderVertraege === "function") renderVertraege();
  updateContractBadge();
}
function _ctrUnack(id) {
  const s = _ctrAckedSet(); s.delete(id); _ctrSaveAcked(s);
  if (typeof renderVertraege === "function") renderVertraege();
  updateContractBadge();
}

// ── CONTRACT BADGE (Nav) ──────────────
// Einzelnes "!" in der Navigation, WENN mindestens ein Vertrag in ≤ 60 Tagen
// ausläuft und noch nicht abgehakt ist. Abschaltbar über CFG.contractAlerts.
function updateContractBadge() {
  const badge = document.getElementById("contractBadge");
  if (!badge) return;

  const _clear = () => {
    badge.style.display = "none";
    badge.onmouseenter = null;
    badge.onmouseleave = null;
  };

  if (typeof CFG !== "undefined" && CFG.contractAlerts === false) { _clear(); return; }

  const list = _ctrActionNeeded();
  if (!list.length) { _clear(); return; }

  badge.classList.remove("nav-badge--count");
  badge.classList.add("nav-badge--alert");
  badge.textContent = "!";
  badge.style.display = "";

  const txt = list.length === 1
    ? "1 Vertrag braucht Aufmerksamkeit — Kündigungsfrist läuft (≤ 60 Tage). Unter Verträge ansehen und abhaken."
    : `${list.length} Verträge brauchen Aufmerksamkeit — Kündigungsfrist läuft (≤ 60 Tage). Unter Verträge ansehen und abhaken.`;
  badge.onmouseenter = () => { if (typeof _showTooltip === "function") _showTooltip(txt, badge); };
  badge.onmouseleave = () => { if (typeof _hideTooltip === "function") _hideTooltip(); };
}
