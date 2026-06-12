// ══════════════════════════════════════
//  ACCOUNTS — Konten verwalten
// ══════════════════════════════════════

const ACC_PRESET_COLORS = [
  "#00FFD5", // neon cyan
  "#00ff4c", // neon mint green
  "#595F34", // neon olive green
  "#0FF0FC", // neon turqoise
  "#00A3FF", // neon blue
  "#0050fd", // neon deep ocean
  "#7C3AED", // neon violet
  "#BC13FE", // neon purple
  "#EA00FF", // neon magenta‑pink
  "#FF007A", // neon hot pink
  "#F9E400", // neon yellow‑orange
  "#c9a11d", // neon yellow golden
  "#ff2600c2", // neon orange‑red
  "#C0E3F0", // neon light blue
  "#B3B1A1", // neon gray
  "#6C2831", // neon dark red
  "#D6C69A", // neon light yellow
  "#595F34", // neon olive green
  "#00637C", // neon dark cyan
  "#848283", // neon dark gray
];

const ACC_TYPES = [
  { value: "girokonto", label: "Girokonto" },
  { value: "kreditkarte", label: "Kreditkarte" },
  { value: "tagesgeld", label: "Tagesgeld" },
  { value: "sparkonto", label: "Sparkonto" },
  { value: "depot", label: "Depot" },
  { value: "festgeld", label: "Festgeld" },
  { value: "vl", label: "VL-Konto" },
  { value: "sonstiges", label: "Sonstiges" },
];

// ── GROUP SORT STATE ──────────────────
let _groupSortMode = "manual";
let _groupSortMenuOpen = false;

// ── REFERENZKONTO einer Gruppe ────────
function _groupRefAcc(accs) {
  const ref = accs.find((a) => a.isGroupRef);
  if (ref) return ref;
  const main = accs.find((a) => a.isMain);
  if (main) return main;
  const giro = accs.find((a) => a.accountType === "girokonto");
  if (giro) return giro;
  return accs[0];
}

function _accTypeLabel(type) {
  return (ACC_TYPES.find((t) => t.value === type) || { label: type || "—" })
    .label;
}

// ══════════════════════════════════════
//  RENDER ACCOUNTS — horizontale Karten
// ══════════════════════════════════════
function renderAccounts() {
  const list = document.getElementById("accList");
  if (!list) return;

  // Saldo-Tag
  const kTag = document.getElementById("kontenSaldoTag");
  if (kTag) {
    const tot = S.accounts
      .filter((a) => a.include)
      .reduce((s, a) => s + (a.balance || 0), 0);
    kTag.textContent = fm(tot);
    kTag.style.color = tot >= 0 ? "var(--green)" : "var(--red)";
  }

  // Gruppieren
  const grouped = {};
  const ungrouped = [];
  S.accounts.forEach((acc) => {
    const bg = (acc.bankGroup || "").trim();
    const key = bg ? bg.charAt(0).toUpperCase() + bg.slice(1) : "";
    if (key) {
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(acc);
    } else {
      ungrouped.push(acc);
    }
  });

  // Gruppen-Reihenfolge
  const allKeys = Object.keys(grouped);
  let orderedGroups;
  if (_groupSortMode === "alpha") {
    orderedGroups = [...allKeys].sort((a, b) => a.localeCompare(b, "de"));
  } else if (_groupSortMode === "balance") {
    orderedGroups = [...allKeys].sort((a, b) => {
      const ba = grouped[b].reduce((s, x) => s + (x.balance || 0), 0);
      const bb = grouped[a].reduce((s, x) => s + (x.balance || 0), 0);
      return ba - bb;
    });
  } else {
    const known = (S.groupOrder || []).filter((g) => allKeys.includes(g));
    const fresh = allKeys.filter((g) => !known.includes(g)).sort();
    orderedGroups = [...known, ...fresh];
  }
  if (JSON.stringify(orderedGroups) !== JSON.stringify(S.groupOrder || [])) {
    S.groupOrder = orderedGroups;
    persist();
  }

  // Sortier-Dropdown
  const sortLabel = { manual: "Manuell", alpha: "A – Z", balance: "Saldo ↓" }[
    _groupSortMode
  ];
  let html = `
    <div class="acc-sort-header">
      <span class="acc-sort-label">Gruppen:</span>
      <div class="acc-sort-dropdown" id="accSortDrop">
        <button class="acc-sort-trigger" onclick="_toggleGroupSortMenu()">
          ${sortLabel}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <div class="acc-sort-menu ${_groupSortMenuOpen ? "open" : ""}">
          ${["manual", "alpha", "balance"]
            .map(
              (m) => `
            <div class="acc-sort-opt ${_groupSortMode === m ? "active" : ""}" onclick="_setGroupSort('${m}')">
              ${{ manual: "⠿ Manuell (Drag & Drop)", alpha: "A – Z alphabetisch", balance: "Nach Saldo" }[m]}
            </div>`,
            )
            .join("")}
        </div>
      </div>
    </div>
    <div class="acc-groups-wrap">`;

  // ── Benannte Gruppen ──
  orderedGroups.forEach((groupName) => {
    const accs = grouped[groupName];
    const refAcc = _groupRefAcc(accs);
    const others = accs.filter((a) => a.id !== refAcc.id);
    const groupAccOrder = _getGroupAccOrder(
      groupName,
      refAcc.id,
      others.map((a) => a.id),
    );
    const sortedOthers = groupAccOrder
      .map((id) => others.find((a) => a.id === id))
      .filter(Boolean);
    const allGroupAccs = [refAcc, ...sortedOthers];

    const groupBal = accs
      .filter((a) => a.include)
      .reduce((s, a) => s + (a.balance || 0), 0);
    const isDraggable = _groupSortMode === "manual";

    html += `
      <div class="acc-grp"
        data-group="${esc(groupName)}"
        ${isDraggable ? `ondragover="_groupDragOver(event)" ondrop="_groupDrop(event)" ondragend="_groupDragEnd(event)"` : ""}>
        <div class="acc-grp-head">
          <div class="acc-grp-drag"
            ${isDraggable ? `draggable="true" ondragstart="_groupHeaderDragStart(event,'${esc(groupName)}')" onmouseenter="_showTooltip('Gruppe verschieben', this)" onmouseleave="_hideTooltip()"` : ""}
            style="${isDraggable ? "" : "opacity:0;pointer-events:none"}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="5" r="1"/><circle cx="15" cy="5" r="1"/>
              <circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/>
              <circle cx="9" cy="19" r="1"/><circle cx="15" cy="19" r="1"/>
            </svg>
          </div>
          <span class="acc-grp-name">${esc(groupName)}</span>
          <span class="acc-grp-total" style="color:${groupBal >= 0 ? "var(--green)" : "var(--red)"}">${fm(groupBal)}</span>
        </div>
        <div class="acc-items-row" data-group="${esc(groupName)}">
          ${allGroupAccs.map((acc) => _renderAccCard(acc, acc.id === refAcc.id, groupName)).join("")}
          ${_renderAddBtn()}
        </div>
      </div>`;
  });

  // ── Ungrouped ──
  if (ungrouped.length > 0) {
    html += `<div class="acc-grp acc-grp-ungrouped">`;
    if (orderedGroups.length > 0) {
      html += `<div class="acc-grp-head"><span class="acc-grp-name" style="opacity:.5">Weitere</span></div>`;
    }
    html += `<div class="acc-items-row">`;
    html += ungrouped.map((acc) => _renderAccCard(acc, false, null)).join("");
    html += _renderAddBtn();
    html += `</div></div>`;
  }

  // Wenn gar keine Konten vorhanden
  if (S.accounts.length === 0) {
    html += `<div class="acc-grp"><div class="acc-items-row">${_renderAddBtn()}</div></div>`;
  }

  html += `</div>`; // .acc-groups-wrap

  list.innerHTML = html;

  // Footer-Button entfernen falls vorhanden (wird jetzt inline als Karte gezeigt)
  const existingFoot = document.getElementById("accManagerFooter");
  if (existingFoot) existingFoot.remove();
}

// ── KONTO-KARTE ───────────────────────
function _renderAccCard(acc, isRef, groupName) {
  const color = acc.color || "var(--blue)";
  const typeLabel = _accTypeLabel(acc.accountType);
  const balVal =
    typeof acc.balance === "number"
      ? acc.balance.toFixed(2).replace(".", ",")
      : "0,00";
  const isDraggable = groupName && !isRef && _groupSortMode === "manual";
  const bdStr = acc.balanceDate
    ? new Date(acc.balanceDate).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
      })
    : "";
  const bdFull = acc.balanceDate
    ? new Date(acc.balanceDate).toLocaleDateString("de-DE")
    : "";

  return `
    <div class="acc-item ${acc.isMain ? "acc-item-main" : ""}"
      id="accrow-${acc.id}"
      style="--acc-color:${color};cursor:pointer"
      onclick="openAccountModal('${acc.id}')"
      ${
        isDraggable
          ? `draggable="true"
          data-accid="${acc.id}"
          data-group="${esc(groupName || "")}"
          ondragstart="_accDragStart(event)"
          ondragover="_accDragOver(event)"
          ondrop="_accDrop(event)"
          ondragend="_accDragEnd(event)"`
          : ""
      }>

      <!-- Klick öffnet Modal (aber nicht auf Inputs) -->
      <div class="acc-item-top">
        <span class="acc-dot" style="background:${color}"></span>
        <span class="acc-name" title="${esc(acc.label)}">${esc(acc.label)}</span>
        <div class="acc-badges">
          ${isRef ? `<span class="acc-badge acc-badge-ref">REF</span>` : ""}
          ${acc.isMain ? `<span class="acc-badge acc-badge-main">★ Haupt</span>` : ""}
          ${acc.accountType === "vl" ? `<span class="acc-badge" style="background:rgba(0,200,120,.1);color:var(--green);border:1px solid rgba(0,200,120,.2)">VL</span>` : ""}
        </div>
      </div>

      <div class="acc-bal-wrap" onclick="event.stopPropagation()">
        <input
          class="acc-bal-inp"
          type="text"
          id="ai-${acc.id}"
          value="${balVal}"
          placeholder="0,00"
          oninput="setBalance('${acc.id}', this.value)"
          onkeydown="if(event.key==='Enter')this.blur()"
        />
        <span class="acc-bal-cur">€</span>
      </div>

      <div class="acc-item-bot">
        <span class="acc-type">${typeLabel}</span>
        ${bdStr ? `<span class="acc-bal-date" onmouseenter="_showTooltip('Aktualisiert am ${bdFull}',this)" onmouseleave="_hideTooltip()">${bdStr}</span>` : ""}
        <label class="acc-include" onclick="event.stopPropagation()">
          <input
            type="checkbox"
            id="ic-${acc.id}"
            ${acc.include ? "checked" : ""}
            onchange="toggleInclude('${acc.id}', this.checked)"
          />
          ein
        </label>
      </div>

      ${
        acc.accountType === "kreditkarte" && acc.creditLimit > 0
          ? (() => {
              const used = Math.abs(acc.balance || 0);
              const pct = Math.min(
                100,
                Math.round((used / acc.creditLimit) * 100),
              );
              const barColor =
                pct >= 90
                  ? "var(--red)"
                  : pct >= 70
                    ? "var(--yellow,#f0a500)"
                    : "var(--green)";
              return `<div class="acc-cc-limit" onclick="event.stopPropagation()"
          onmouseenter="_showTooltip('Auslastung: ${fm(used).replace(" €", "")} von ${fm(acc.creditLimit)} (${pct}%)', this)"
          onmouseleave="_hideTooltip()">
          <div class="acc-cc-bar-wrap">
            <div class="acc-cc-bar-fill" style="width:${pct}%;background:${barColor}"></div>
          </div>
          <span class="acc-cc-pct" style="color:${barColor}">${pct}%</span>
        </div>`;
            })()
          : ""
      }

    </div>`;
}

// ── ADD-BUTTON KARTE ──────────────────
function _renderAddBtn() {
  return `
    <button class="acc-add-btn" onclick="openAccountModal(null)" onmouseenter="_showTooltip('Konto hinzufügen', this)" onmouseleave="_hideTooltip()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      Konto
    </button>`;
}

// ── GRUPPE SORT DROPDOWN ──────────────
function _toggleGroupSortMenu() {
  _groupSortMenuOpen = !_groupSortMenuOpen;
  renderAccounts();
  if (_groupSortMenuOpen) {
    setTimeout(
      () =>
        document.addEventListener("click", _closeGroupSortMenu, { once: true }),
      10,
    );
  }
}
function _closeGroupSortMenu() {
  _groupSortMenuOpen = false;
  const menu = document.querySelector(".acc-sort-menu");
  if (menu) menu.classList.remove("open");
}
function _setGroupSort(mode) {
  _groupSortMode = mode;
  _groupSortMenuOpen = false;
  if (mode !== "manual") S.groupOrder = [];
  persist();
  renderAccounts();
}

// ── KONTEN-REIHENFOLGE IN GRUPPE ──────
function _getGroupAccOrder(groupName, refId, otherIds) {
  const stored = (S.groupAccOrder || {})[groupName] || [];
  const known = stored.filter((id) => otherIds.includes(id));
  const fresh = otherIds.filter((id) => !known.includes(id));
  return [...known, ...fresh];
}
function _setGroupAccOrder(groupName, orderedIds) {
  if (!S.groupAccOrder) S.groupAccOrder = {};
  S.groupAccOrder[groupName] = orderedIds;
  persist();
}

// ── DRAG: GRUPPEN-HEADER ──────────────
let _dragSrcGroupName = null;
function _groupHeaderDragStart(e, groupName) {
  _dragSrcGroupName = groupName;
  e.dataTransfer.effectAllowed = "move";
  e.stopPropagation();
  setTimeout(() => {
    const el = document.querySelector(`.acc-grp[data-group="${groupName}"]`);
    if (el) el.classList.add("acc-grp--dragging");
  }, 0);
}
function _groupDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  if (_dragSrcGroupName && !_dragSrcAccId) {
    const group = e.currentTarget.closest(".acc-grp");
    if (group && group.dataset.group !== _dragSrcGroupName) {
      document
        .querySelectorAll(".acc-grp")
        .forEach((g) => g.classList.remove("acc-grp--over"));
      group.classList.add("acc-grp--over");
    }
  }
}
function _groupDrop(e) {
  e.preventDefault();
  if (!_dragSrcGroupName) return;
  const targetGroup = e.currentTarget.closest(".acc-grp")?.dataset?.group;
  if (!targetGroup || targetGroup === _dragSrcGroupName) return;
  const order = [...(S.groupOrder || [])];
  const fi = order.indexOf(_dragSrcGroupName);
  const ti = order.indexOf(targetGroup);
  if (fi < 0 || ti < 0) return;
  order.splice(fi, 1);
  order.splice(ti, 0, _dragSrcGroupName);
  S.groupOrder = order;
  persist();
  renderAccounts();
}
function _groupDragEnd(e) {
  document
    .querySelectorAll(".acc-grp")
    .forEach((g) => g.classList.remove("acc-grp--dragging", "acc-grp--over"));
  _dragSrcGroupName = null;
}

// ── DRAG: KONTEN INNERHALB GRUPPE ─────
let _dragSrcAccId = null;
let _dragSrcAccGroup = null;
function _accDragStart(e) {
  _dragSrcAccId = e.currentTarget.dataset.accid;
  _dragSrcAccGroup = e.currentTarget.dataset.group;
  e.dataTransfer.effectAllowed = "move";
  e.currentTarget.classList.add("acc-item--dragging");
  e.stopPropagation();
}
function _accDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  if (!_dragSrcAccId) return;
  const target = e.currentTarget;
  if (target.dataset.accid === _dragSrcAccId) return;
  if (target.dataset.group !== _dragSrcAccGroup) return;
  document
    .querySelectorAll(".acc-item--over")
    .forEach((r) => r.classList.remove("acc-item--over"));
  target.classList.add("acc-item--over");
}
function _accDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  if (!_dragSrcAccId) return;
  const targetId = e.currentTarget.dataset.accid;
  const targetGroup = e.currentTarget.dataset.group;
  if (!targetId || targetId === _dragSrcAccId) return;
  if (targetGroup !== _dragSrcAccGroup) return;

  const groupName = _dragSrcAccGroup;
  const accs = S.accounts.filter((a) => {
    const bg = (a.bankGroup || "").trim();
    const key = bg ? bg.charAt(0).toUpperCase() + bg.slice(1) : "";
    return key === groupName;
  });
  const refAcc = _groupRefAcc(accs);
  const others = accs.filter((a) => a.id !== refAcc.id);
  const order = _getGroupAccOrder(
    groupName,
    refAcc.id,
    others.map((a) => a.id),
  );

  const fi = order.indexOf(_dragSrcAccId);
  const ti = order.indexOf(targetId);
  if (fi < 0 || ti < 0) return;
  order.splice(fi, 1);
  order.splice(ti, 0, _dragSrcAccId);
  _setGroupAccOrder(groupName, order);
  renderAccounts();
}
function _accDragEnd(e) {
  document
    .querySelectorAll(".acc-item--dragging,.acc-item--over")
    .forEach((r) => r.classList.remove("acc-item--dragging", "acc-item--over"));
  _dragSrcAccId = null;
  _dragSrcAccGroup = null;
}

// ── BALANCE / INCLUDE ─────────────────
function setBalance(id, val) {
  const acc = getAccount(id);
  if (acc) {
    acc.balance = pp(val);
    const n = new Date();
    acc.balanceDate = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
    persist();
    refreshDash();
  }
}

function toggleInclude(id, v) {
  const acc = getAccount(id);
  if (acc) {
    acc.include = v;
    persist();
    refreshDash();
  }
}

function setMonthlyIncome(val) {
  S.monthlyIncome = pp(val);
  persist();
  refreshDash();
}

// ── ACCOUNT MODAL ─────────────────────
let _editAccId = null;
let _selectedAccColor = ACC_PRESET_COLORS[0];

let _accOverlayMousedownOnBg = false;
document.addEventListener("DOMContentLoaded", () => {
  const ov = document.getElementById("accModalOverlay");
  if (!ov) return;
  ov.addEventListener("mousedown", (e) => {
    _accOverlayMousedownOnBg = e.target === ov;
  });
});

function openAccountModal(id = null) {
  _editAccId = id || null;
  const acc = id ? getAccount(id) : null;

  document.getElementById("accModalTitle").textContent = acc
    ? "Konto bearbeiten"
    : "Neues Konto";
  document.getElementById("accFLabel").value = acc ? acc.label : "";
  document.getElementById("accFSub").value = acc ? acc.sub || "" : "";
  document.getElementById("accFBalance").value =
    acc && acc.balance !== 0 ? acc.balance.toFixed(2).replace(".", ",") : "";
  const noteEl = document.getElementById("accFNote");
  if (noteEl) noteEl.value = acc ? acc.note || "" : "";
  const bgSel = document.getElementById("accFBankGroup");
  if (bgSel) {
    const existingGroups = [
      ...new Set(S.accounts.filter((a) => a.bankGroup).map((a) => a.bankGroup)),
    ].sort();
    bgSel.innerHTML =
      `<option value="">— Keine Gruppe —</option>` +
      existingGroups
        .map((g) => `<option value="${esc(g)}">${esc(g)}</option>`)
        .join("") +
      `<option value="__new__">＋ Neue Gruppe...</option>`;
    bgSel.value = acc?.bankGroup || "";
  }
  const bgNewEl = document.getElementById("accFBankGroupNew");
  if (bgNewEl) {
    bgNewEl.value = "";
    bgNewEl.style.display = "none";
  }
  const miEl = document.getElementById("accFMonthlyIncome");
  if (miEl)
    miEl.value =
      acc && acc.monthlyIncome > 0
        ? acc.monthlyIncome.toFixed(2).replace(".", ",")
        : "";
  _toggleMainIncomeField();

  // VL-Beitrag vorbelegen
  const vlRateEl = document.getElementById("accFVlRate");
  if (vlRateEl)
    vlRateEl.value =
      acc && acc.vlMonthlyRate > 0
        ? acc.vlMonthlyRate.toFixed(2).replace(".", ",")
        : "";
  const vlStartEl = document.getElementById("accFVlStart");
  if (vlStartEl) {
    if (acc && acc.accountType === "vl") {
      const existingVlPosten = S.data.find(
        (p) =>
          p.type === "einnahme" &&
          p.accountId === acc.id &&
          p.interval === "monatl." &&
          (p.name || "").startsWith("VL-Beitrag"),
      );
      vlStartEl.value = existingVlPosten?.contractStart
        ? existingVlPosten.contractStart.slice(0, 10)
        : new Date().toISOString().slice(0, 10);
    } else {
      const now = new Date();
      vlStartEl.value = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .slice(0, 10);
    }
  }

  // Zahltag + Erste Buchung vorbelegen
  const globalZahltag =
    (typeof CFG !== "undefined" && CFG.zahltag) || S.zahltag || 15;
  const ztEl = document.getElementById("accFZahltag");
  if (ztEl) ztEl.value = String(globalZahltag);
  const csEl = document.getElementById("accFContractStart");
  if (csEl) {
    if (acc) {
      // Beim Bearbeiten: contractStart des bestehenden Einnahmen-Postens laden
      const existingPosten = S.data.find(
        (p) =>
          p.type === "einnahme" &&
          p.accountId === acc.id &&
          p.interval === "monatl.",
      );
      csEl.value = existingPosten?.contractStart
        ? existingPosten.contractStart.slice(0, 10)
        : new Date().toISOString().slice(0, 10);
    } else {
      // Neues Konto: Standard = Monatsanfang des aktuellen Monats
      const now = new Date();
      csEl.value = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .slice(0, 10);
    }
  }

  const typeEl = document.getElementById("accFType");
  if (typeEl) {
    typeEl.value = acc ? acc.accountType || "girokonto" : "girokonto";
    typeEl.onchange = () => {
      updateAccNumberFields(acc);
      _updateBillingFields();
    };
  }
  updateAccNumberFields(acc);

  const isMainEl = document.getElementById("accFIsMain");
  if (isMainEl) {
    isMainEl.checked = acc ? !!acc.isMain : false;
    isMainEl.onchange = _toggleMainIncomeField;
  }

  // isGroupRef checkbox
  const grpRefRow = document.getElementById("accFGroupRefRow");
  const grpRefEl = document.getElementById("accFIsGroupRef");
  if (grpRefRow && grpRefEl) {
    const hasBankGroup = !!(acc?.bankGroup || "").trim();
    grpRefRow.style.display = hasBankGroup ? "" : "none";
    grpRefEl.checked = acc ? !!acc.isGroupRef : false;
  }

  _updateBillingFields(acc);

  _selectedAccColor = acc ? acc.color : ACC_PRESET_COLORS[0];
  renderAccColorPicker(_selectedAccColor);

  const delBtn = document.getElementById("accModalDelete");
  if (delBtn) delBtn.style.display = acc ? "" : "none";

  document.getElementById("accModalOverlay").classList.add("open");
  if (typeof _refreshModalTip === "function")
    _refreshModalTip("accModalOverlay");
  setTimeout(() => document.getElementById("accFLabel").focus(), 50);
}

function renderAccColorPicker(selected) {
  const row = document.getElementById("accColorRow");
  if (!row) return;
  row.innerHTML = ACC_PRESET_COLORS.map(
    (c) => `
    <div class="color-swatch ${c === selected ? "active" : ""}"
         style="background:${c};"
         onclick="selectAccColor('${c}')"></div>
  `,
  ).join("");
}

function selectAccColor(c) {
  _selectedAccColor = c;
  renderAccColorPicker(c);
}

async function saveAccountModal() {
  const labelEl = document.getElementById("accFLabel");
  if (!validateField(labelEl, (v) => v.trim().length > 0, "Pflichtfeld")) {
    labelEl.focus();
    return;
  }
  const label = labelEl.value.trim();

  const sub = document.getElementById("accFSub").value.trim();
  const note = document.getElementById("accFNote")?.value.trim() || "";
  const ibanRaw = _readAccNumber();
  const balance = pp(document.getElementById("accFBalance").value);
  const accountType = document.getElementById("accFType")?.value || "girokonto";
  const isMain = document.getElementById("accFIsMain")?.checked || false;
  const isGroupRef =
    document.getElementById("accFIsGroupRef")?.checked || false;
  let bankGroupRaw =
    document.getElementById("accFBankGroup")?.value.trim() || "";
  if (bankGroupRaw === "__new__") {
    bankGroupRaw =
      document.getElementById("accFBankGroupNew")?.value.trim() || "";
  }
  const bankGroup = bankGroupRaw
    ? bankGroupRaw.charAt(0).toUpperCase() + bankGroupRaw.slice(1)
    : "";
  const monthlyInc = isMain
    ? pp(document.getElementById("accFMonthlyIncome")?.value || "0")
    : 0;
  const inputZahltag = isMain
    ? Math.min(
        31,
        Math.max(
          1,
          parseInt(document.getElementById("accFZahltag")?.value) || 15,
        ),
      )
    : null;
  const incomeContractStart = isMain
    ? document.getElementById("accFContractStart")?.value ||
      new Date().toISOString().slice(0, 10)
    : null;
  const vlMonthlyRate =
    accountType === "vl"
      ? pp(document.getElementById("accFVlRate")?.value || "0")
      : 0;
  const vlContractStart =
    accountType === "vl"
      ? document.getElementById("accFVlStart")?.value ||
        new Date().toISOString().slice(0, 10)
      : null;
  const billingType = document.getElementById("accFBillingType")?.value || null;
  const billingDay =
    parseInt(document.getElementById("accFBillingDay")?.value) || null;
  const creditLimit =
    accountType === "kreditkarte"
      ? pp(document.getElementById("accFCreditLimit")?.value || "0") || 0
      : 0;
  const ccExp = document.getElementById("ccExp")?.value || "";
  const ccCvv = document.getElementById("ccCvv")?.value || "";

  if (isMain)
    S.accounts.forEach((a) => {
      a.isMain = false;
    });

  if (_editAccId) {
    const acc = getAccount(_editAccId);
    if (acc) {
      acc.label = label;
      acc.sub = sub;
      acc.iban = ibanRaw;
      acc.accountType = accountType;
      acc.balance = balance;
      acc.color = _selectedAccColor;
      acc.note = note;
      acc.isMain = isMain;
      acc.isGroupRef = isGroupRef;
      acc.bankGroup = bankGroup;
      if (isMain) acc.monthlyIncome = monthlyInc;
      if (accountType === "vl") acc.vlMonthlyRate = vlMonthlyRate;
      acc.billingType =
        accountType === "kreditkarte" ? billingType || "stichtag" : null;
      acc.billingDay = accountType === "kreditkarte" ? billingDay : null;
      acc.creditLimit = accountType === "kreditkarte" ? creditLimit : 0;
      if (ccExp) acc.ccExp = ccExp;
      if (ccCvv) acc.ccCvv = ccCvv;
    }
  } else {
    S.accounts.push({
      id: genId("acc"),
      label,
      sub,
      accountType,
      iban: ibanRaw,
      ccExp,
      ccCvv,
      color: _selectedAccColor,
      balance,
      include: true,
      note,
      isMain,
      isGroupRef,
      bankGroup,
      monthlyIncome: isMain ? monthlyInc : 0,
      vlMonthlyRate: accountType === "vl" ? vlMonthlyRate : 0,
      billingType:
        accountType === "kreditkarte" ? billingType || "stichtag" : null,
      billingDay: accountType === "kreditkarte" ? billingDay : null,
      creditLimit: accountType === "kreditkarte" ? creditLimit : 0,
    });
  }

  // ── Zahltag: Abweichung vom globalen Wert prüfen ─────────────────────
  let effectiveZahltag =
    (typeof CFG !== "undefined" && CFG.zahltag) || S.zahltag || 15;
  if (isMain && inputZahltag && inputZahltag !== effectiveZahltag) {
    const sync = await appConfirm(
      `Der eingegebene Zahltag (${inputZahltag}.) weicht vom globalen Zahltag (${effectiveZahltag}.) ab.\n\nSoll der globale Zahltag auf den ${inputZahltag}. aktualisiert werden?`,
      {
        title: "Zahltag synchronisieren",
        confirmLabel: "Ja, global aktualisieren",
        cancelLabel: "Nein, nur für dieses Konto",
      },
    );
    if (sync) {
      effectiveZahltag = inputZahltag;
      if (typeof CFG !== "undefined") CFG.zahltag = inputZahltag;
      S.zahltag = inputZahltag;
      if (typeof saveSettings === "function") saveSettings();
    } else {
      effectiveZahltag = inputZahltag;
    }
  } else if (isMain && inputZahltag) {
    effectiveZahltag = inputZahltag;
  }

  // ── Einnahmen-Posten synchronisieren ──────────────────────────────────
  let _incomePostenChanged = false;
  if (isMain && monthlyInc > 0) {
    const contractStart =
      incomeContractStart || new Date().toISOString().slice(0, 10);
    if (_editAccId) {
      const existing = S.data.find(
        (p) =>
          p.type === "einnahme" &&
          p.accountId === _editAccId &&
          p.interval === "monatl.",
      );
      if (existing) {
        existing.amount = monthlyInc;
        existing.due = String(effectiveZahltag);
        if (incomeContractStart) existing.contractStart = contractStart;
        _incomePostenChanged = true;
      } else {
        S.data.push({
          id: genId("p"),
          name: `Gehalt – ${label}`,
          type: "einnahme",
          amount: monthlyInc,
          interval: "monatl.",
          due: String(effectiveZahltag),
          accountId: _editAccId,
          note: "",
          contractStart,
          contractEnd: "",
          overrides: {},
          goalId: null,
        });
        _incomePostenChanged = true;
      }
    } else {
      const newAccId = S.accounts[S.accounts.length - 1].id;
      S.data.push({
        id: genId("p"),
        name: `Gehalt – ${label}`,
        type: "einnahme",
        amount: monthlyInc,
        interval: "monatl.",
        due: String(effectiveZahltag),
        accountId: newAccId,
        note: "",
        contractStart,
        contractEnd: "",
        overrides: {},
        goalId: null,
      });
      _incomePostenChanged = true;
    }
  }
  // ── Buchungen + abhängige Views sofort aktualisieren ──────────────────
  if (_incomePostenChanged && typeof initBookings === "function") {
    initBookings();

    // Erste Buchung: wenn contractStart ≤ heute liegt aber die generierte Buchung
    // als "vorgemerkt" markiert wurde (zahltag > heute), den Buchungstermin auf
    // contractStart setzen und als "gebucht" markieren — sonst sieht der Nutzer
    // nichts in Umsätze, obwohl das Gehalt laut Eingabe bereits eingegangen ist.
    if (incomeContractStart) {
      const todayStr = todayIso();
      const startMonth = incomeContractStart.slice(0, 7); // "YYYY-MM"
      if (incomeContractStart <= todayStr) {
        // Posten-ID des zuletzt gepushten Einnahmen-Postens finden
        const accIdForPosten =
          _editAccId || S.accounts[S.accounts.length - 1]?.id;
        const incomePosten = S.data.find(
          (p) =>
            p.type === "einnahme" &&
            p.accountId === accIdForPosten &&
            p.interval === "monatl.",
        );
        if (incomePosten) {
          const firstBk = S.bookings.find(
            (b) =>
              b.postenId === incomePosten.id &&
              (b.monthKey || b.date?.slice(0, 7)) === startMonth,
          );
          if (firstBk && firstBk.status === "vorgemerkt") {
            firstBk.date = incomeContractStart;
            firstBk.status = "gebucht";
            firstBk.monthKey = startMonth;
          }
        }
      }
    }
  }
  // ──────────────────────────────────────────────────────────────────────

  // ── VL-Beitrag Posten synchronisieren ────────────────────────────────
  let _vlPostenChanged = false;
  if (accountType === "vl" && vlMonthlyRate > 0) {
    const vlStart = vlContractStart || new Date().toISOString().slice(0, 10);
    const accIdForVl = _editAccId || S.accounts[S.accounts.length - 1]?.id;
    if (_editAccId) {
      const existingVl = S.data.find(
        (p) =>
          p.type === "einnahme" &&
          p.accountId === _editAccId &&
          p.interval === "monatl." &&
          (p.name || "").startsWith("VL-Beitrag"),
      );
      if (existingVl) {
        existingVl.name = `VL-Beitrag – ${label}`;
        existingVl.amount = vlMonthlyRate;
        if (vlContractStart) existingVl.contractStart = vlStart;
        _vlPostenChanged = true;
      } else {
        S.data.push({
          id: genId("p"),
          name: `VL-Beitrag – ${label}`,
          type: "einnahme",
          amount: vlMonthlyRate,
          interval: "monatl.",
          due: "1",
          accountId: accIdForVl,
          note: "",
          contractStart: vlStart,
          contractEnd: "",
          overrides: {},
          goalId: null,
        });
        _vlPostenChanged = true;
      }
    } else {
      S.data.push({
        id: genId("p"),
        name: `VL-Beitrag – ${label}`,
        type: "einnahme",
        amount: vlMonthlyRate,
        interval: "monatl.",
        due: "1",
        accountId: accIdForVl,
        note: "",
        contractStart: vlStart,
        contractEnd: "",
        overrides: {},
        goalId: null,
      });
      _vlPostenChanged = true;
    }
    if (_vlPostenChanged && typeof initBookings === "function") initBookings();
  } else if (accountType === "vl" && vlMonthlyRate === 0 && _editAccId) {
    // Betrag auf 0 gesetzt → bestehenden VL-Posten entfernen
    const idx = S.data.findIndex(
      (p) =>
        p.type === "einnahme" &&
        p.accountId === _editAccId &&
        p.interval === "monatl." &&
        (p.name || "").startsWith("VL-Beitrag"),
    );
    if (idx !== -1) {
      S.data.splice(idx, 1);
      _vlPostenChanged = true;
      if (typeof initBookings === "function") initBookings();
    }
  }
  // ──────────────────────────────────────────────────────────────────────

  persist();
  closeAccountModal();
  renderAccounts();
  refreshDash();
  if (typeof renderVertraege === "function") renderVertraege();
  if (typeof updateContractBadge === "function") updateContractBadge();
  if (
    (_incomePostenChanged || _vlPostenChanged) &&
    typeof renderPosten === "function"
  )
    renderPosten();
  if (typeof showToast === "function")
    showToast("Konto gespeichert", "success", 2400);
}

function deleteAccount() {
  if (!_editAccId) return;
  const acc = getAccount(_editAccId);
  if (!acc) return;
  appConfirm(
    `Konto "${acc.label}" löschen?\nAlle verknüpften Posten verlieren die Kontozuordnung.`,
    {
      icon: "🏦",
      title: "Konto löschen",
      confirmLabel: "Löschen",
      confirmClass: "danger",
    },
  ).then((ok) => {
    if (ok) _doDeleteAccount();
  });
}
function _doDeleteAccount() {
  if (!_editAccId) return;
  const label = getAccount(_editAccId)?.label || "Konto";
  S.data.forEach((p) => {
    if (p.accountId === _editAccId) p.accountId = "";
  });
  S.transfers = S.transfers.filter(
    (t) => t.fromId !== _editAccId && t.toId !== _editAccId,
  );
  S.accounts = S.accounts.filter((a) => a.id !== _editAccId);
  persist();
  closeAccountModal();
  renderAccounts();
  refreshDash();
  if (typeof showToast === "function")
    showToast(`"${label}" gelöscht`, "info", 2400);
}

function closeAccountModal() {
  document.getElementById("accModalOverlay").classList.remove("open");
  _editAccId = null;
}

// ── BILLING FELDER (Kreditkarten) ─────
function _updateBillingFields(acc) {
  const row = document.getElementById("accBillingRow");
  const type = document.getElementById("accFType")?.value || "girokonto";
  if (!row) return;
  if (type === "vl") {
    row.style.display = "";
    row.innerHTML = `<div class="fg" style="grid-column:1/-1;">
      <div style="background:rgba(0,229,160,.07);border:1px solid rgba(0,229,160,.2);border-radius:var(--r1);padding:10px 14px;font-size:.78em;color:var(--text2);line-height:1.6;">
        💡 <strong>VL-Konto:</strong> Der AG-Anteil wird als Einnahme-Posten hinterlegt — er taucht nicht als Abzug auf deinem Girokonto auf, sondern erhöht direkt den Stand dieses Kontos.
      </div>
    </div>`;
    return;
  }
  if (type !== "kreditkarte") {
    row.style.display = "none";
    return;
  }
  row.style.display = "";
  const bt = acc?.billingType || "stichtag";
  const bd = acc?.billingDay || 25;
  row.innerHTML = `
    <div class="fg">
      <label>Abrechnungsart</label>
      <select id="accFBillingType" onchange="_toggleBillingDay()"
        style="background:var(--input-bg);border:1px solid var(--border2);border-radius:var(--r1);padding:8px 10px;color:var(--text);font-size:.85em;width:100%;outline:none;">
        <option value="stichtag" ${bt === "stichtag" ? "selected" : ""}>Stichtag (Monatsabrechnung)</option>
        <option value="direkt"   ${bt === "direkt" ? "selected" : ""}>Direktbelastung</option>
        <option value="prepaid"  ${bt === "prepaid" ? "selected" : ""}>Prepaid / Guthaben</option>
      </select>
    </div>
    <div class="fg" id="billingDayWrap" style="${bt !== "stichtag" ? "display:none" : ""}">
      <label>Abrechnungstag</label>
      <input id="accFBillingDay" type="number" min="1" max="31" value="${bd}"
        style="background:var(--input-bg);border:1px solid var(--border2);border-radius:var(--r1);padding:8px 10px;color:var(--text);font-size:.85em;width:100%;box-sizing:border-box;outline:none;">
    </div>
    <div class="fg" style="grid-column:1/-1;">
      <label>Kreditlimit <span style="opacity:.5;font-size:.85em;">(optional)</span></label>
      <input id="accFCreditLimit" type="text" inputmode="decimal" placeholder="z.B. 5000"
        value="${acc?.creditLimit ? acc.creditLimit.toString().replace(".", ",") : ""}"
        style="background:var(--input-bg);border:1px solid var(--border2);border-radius:var(--r1);padding:8px 10px;color:var(--text);font-size:.85em;width:100%;box-sizing:border-box;outline:none;">
    </div>`;
}

function _toggleBillingDay() {
  const bt = document.getElementById("accFBillingType")?.value;
  const wrap = document.getElementById("billingDayWrap");
  if (wrap) wrap.style.display = bt === "stichtag" ? "" : "none";
}

// ── DYNAMISCHE NUMMERNFELDER ──────────
function updateAccNumberFields(acc) {
  const row = document.getElementById("accNumberRow");
  const type = document.getElementById("accFType")?.value || "girokonto";
  if (!row) return;

  if (type === "kreditkarte") {
    const parts = _splitCardNumber(acc?.iban || "");
    row.innerHTML = `
      <div class="fg" style="grid-column:1/-1;">
        <label>Kartennummer <span style="opacity:.5;font-size:.85em;">(optional)</span></label>
        <div class="cc-blocks" id="ccBlocks">
          <input class="cc-block" id="cc1" type="text" inputmode="numeric" maxlength="4" placeholder="••••" value="${parts[0]}"
            oninput="ccBlockInput(this,'cc2')" onkeydown="ccBlockBack(event,this,null)">
          <span class="cc-sep">—</span>
          <input class="cc-block" id="cc2" type="text" inputmode="numeric" maxlength="4" placeholder="••••" value="${parts[1]}"
            oninput="ccBlockInput(this,'cc3')" onkeydown="ccBlockBack(event,this,'cc1')">
          <span class="cc-sep">—</span>
          <input class="cc-block" id="cc3" type="text" inputmode="numeric" maxlength="4" placeholder="••••" value="${parts[2]}"
            oninput="ccBlockInput(this,'cc4')" onkeydown="ccBlockBack(event,this,'cc2')">
          <span class="cc-sep">—</span>
          <input class="cc-block" id="cc4" type="text" inputmode="numeric" maxlength="4" placeholder="••••" value="${parts[3]}"
            oninput="ccBlockInput(this,null)" onkeydown="ccBlockBack(event,this,'cc3')">
        </div>
      </div>
      <div class="fg">
        <label>Ablaufdatum</label>
        <input id="ccExp" type="text" inputmode="numeric" maxlength="5" placeholder="MM/JJ"
          value="${acc?.ccExp || ""}" oninput="ccExpInput(this)">
      </div>
      <div class="fg">
        <label>CVV <span style="opacity:.5;font-size:.85em;">(optional)</span></label>
        <input id="ccCvv" type="text" inputmode="numeric" maxlength="4" placeholder="•••"
          value="${acc?.ccCvv || ""}">
      </div>`;
  } else if (type === "depot" || type === "vl") {
    const raw = acc?.iban || "";
    const ph = type === "vl" ? "z.B. 123 456 789" : "z.B. 1234 5678 9012";
    row.innerHTML = `
      <div class="fg" style="grid-column:1/-1;">
        <label>Depotnummer <span style="opacity:.5;font-size:.85em;">(optional)</span></label>
        <input id="accFDepot" type="text" inputmode="numeric" maxlength="20"
          placeholder="${ph}"
          value="${_formatGroups(raw, 4)}"
          oninput="this.value=_formatGroups(this.value.replace(/\\s/g,''),4)">
      </div>`;
    // VL-Beitrag Zeile anzeigen
    const vlRow = document.getElementById("accFVlRateRow");
    if (vlRow) vlRow.style.display = type === "vl" ? "" : "none";
  } else {
    const ibanVal = acc?.iban ? formatIban(acc.iban) : "";
    row.innerHTML = `
      <div class="fg" style="grid-column:1/-1;">
        <label>IBAN <span style="opacity:.5;font-size:.85em;">(optional)</span></label>
        <input id="accFIban" type="text" inputmode="text" maxlength="34"
          placeholder="DE89 3704 0044 0532 0130 00"
          value="${ibanVal}"
          oninput="this.value=formatIban(this.value)">
      </div>`;
    // VL-Beitrag Zeile ausblenden
    const vlRow = document.getElementById("accFVlRateRow");
    if (vlRow) vlRow.style.display = "none";
  }
}

function ccBlockInput(el, nextId) {
  el.value = el.value.replace(/\D/g, "");
  if (el.value.length === 4 && nextId) document.getElementById(nextId)?.focus();
}
function ccBlockBack(e, el, prevId) {
  if (e.key === "Backspace" && el.value === "" && prevId) {
    e.preventDefault();
    const prev = document.getElementById(prevId);
    if (prev) {
      prev.focus();
      prev.setSelectionRange(prev.value.length, prev.value.length);
    }
  }
}
function ccExpInput(el) {
  let v = el.value.replace(/\D/g, "");
  if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2, 4);
  el.value = v;
}

function _readAccNumber() {
  const type = document.getElementById("accFType")?.value || "girokonto";
  if (type === "kreditkarte") {
    const n = ["cc1", "cc2", "cc3", "cc4"]
      .map((id) => document.getElementById(id)?.value || "")
      .join("");
    return n.toUpperCase();
  } else if (type === "depot" || type === "vl") {
    return (document.getElementById("accFDepot")?.value || "").replace(
      /\s/g,
      "",
    );
  } else {
    return (document.getElementById("accFIban")?.value || "")
      .replace(/\s/g, "")
      .toUpperCase();
  }
}

function _splitCardNumber(raw) {
  const clean = raw.replace(/\s/g, "");
  return [
    clean.slice(0, 4) || "",
    clean.slice(4, 8) || "",
    clean.slice(8, 12) || "",
    clean.slice(12, 16) || "",
  ];
}

function _formatGroups(raw, n) {
  return raw
    .replace(/\s/g, "")
    .replace(new RegExp(`(.{${n}})(?=.)`, "g"), "$1 ")
    .trim();
}

// ── BANKGROUP SELECT CHANGE ───────────
function _onBankGroupChange(sel) {
  const newEl = document.getElementById("accFBankGroupNew");
  const grpRefRow = document.getElementById("accFGroupRefRow");
  const isNew = sel.value === "__new__";
  const hasGroup = sel.value && !isNew;
  if (newEl) {
    newEl.style.display = isNew ? "" : "none";
    if (isNew) newEl.focus();
  }
  if (grpRefRow) grpRefRow.style.display = hasGroup || isNew ? "" : "none";
}

// ── MAIN INCOME FIELD TOGGLE ──────────
function _toggleMainIncomeField() {
  const isMain = document.getElementById("accFIsMain")?.checked;
  const incRow = document.getElementById("accFMainIncomeRow");
  const detailsRow = document.getElementById("accFIncomeDetailsRow");
  if (incRow) incRow.style.display = isMain ? "" : "none";
  if (detailsRow) detailsRow.style.display = isMain ? "" : "none";
}
