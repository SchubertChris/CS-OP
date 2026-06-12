// ══════════════════════════════════════
//  MODAL — Posten · Umbuchung · Universal
// ══════════════════════════════════════

// ── Finance-Tipps (zufällig pro Modal-Öffnung) ──
const _FINANCE_TIPS = [
  { icon: "💡", text: "Spare mindestens 10% deines Nettoeinkommens automatisch am Zahltag." },
  { icon: "📊", text: "Regel 50/30/20: 50% Bedarf, 30% Wünsche, 20% Sparen & Investieren." },
  { icon: "🚨", text: "Ein Notgroschen von 3–6 Monatsausgaben schützt vor unerwarteten Kosten." },
  { icon: "📉", text: "Inflationsschutz: Tagesgeld allein reicht nicht — ETFs helfen langfristig." },
  { icon: "🔄", text: "Überprüfe deine Verträge jährlich — Wechsel spart oft hunderte Euro." },
  { icon: "🎯", text: "Konkrete Sparziele mit Deadline erhöhen die Erfolgsquote drastisch." },
  { icon: "⚡", text: "Kleine Beträge, großer Effekt: 5 € täglich = über 1.800 € im Jahr." },
  { icon: "🏦", text: "Zinsen auf Schulden sind immer höher als Zinsen auf Ersparnisse — zuerst tilgen." },
  { icon: "📱", text: "Abos regelmäßig prüfen: Ø 150 € pro Jahr für vergessene Mitgliedschaften." },
  { icon: "🌱", text: "Frühzeitig investieren zahlt sich durch den Zinseszinseffekt massiv aus." },
  { icon: "🧾", text: "Belege und Verträge digital archivieren spart Zeit bei Steuererklärung & Reklamation." },
  { icon: "💳", text: "Kreditkarten mit Cashback oder Meilen nutzen — aber immer vollständig bezahlen." },
  { icon: "📅", text: "Fixkosten am Jahresanfang bündeln — oft gibt es Rabatt für Vorauszahlung." },
  { icon: "🔒", text: "Finanzpasswörter und PINs niemals wiederverwenden — Sicherheit schützt Vermögen." },
  { icon: "📈", text: "Breit gestreute ETFs schlagen aktiv gemanagte Fonds langfristig zu ~80%." },
  { icon: "🏠", text: "Immobilien als Investment: Lage, Lage, Lage — und die Nebenkosten nicht vergessen." },
  { icon: "🎲", text: "Investiere nie Geld, das du kurzfristig brauchst — Märkte schwanken immer." },
  { icon: "💰", text: "Gehaltserhöhung? Lebe nicht mehr auf — investiere die Differenz direkt." },
  { icon: "🧮", text: "Netto-Vermögen regelmäßig berechnen: Aktiva minus Passiva = echter Überblick." },
  { icon: "🤝", text: "Steuerberater lohnt sich ab ~40k€ Einkommen — Rückerstattungen übersteigen oft die Kosten." },
];

function _randomTip() {
  return _FINANCE_TIPS[Math.floor(Math.random() * _FINANCE_TIPS.length)];
}

function _refreshModalTip(overlayId) {
  const modal = document.querySelector(`#${overlayId} .modal-side`);
  if (!modal) return;
  const tip = _randomTip();
  const iconEl = modal.querySelector(".modal-side-tip-icon");
  const textEl = modal.querySelector(".modal-side-tip-text");
  if (iconEl) {
    iconEl.style.transform = "scale(0.7)";
    iconEl.style.opacity = "0";
    setTimeout(() => {
      iconEl.textContent = tip.icon;
      iconEl.style.transition = "transform 0.2s ease, opacity 0.2s ease";
      iconEl.style.transform = "scale(1)";
      iconEl.style.opacity = "1";
    }, 120);
  }
  if (textEl) {
    textEl.style.opacity = "0";
    setTimeout(() => {
      textEl.textContent = tip.text;
      textEl.style.transition = "opacity 0.25s ease";
      textEl.style.opacity = "1";
    }, 120);
  }
}

function _initModalSidePanels() {
  const sideHtml = `
    <div class="modal-side">
      <div class="modal-side-logo">
        <div class="modal-side-logo-box">
          <span style="font-size:22px">🔐</span>
        </div>
        <div class="modal-side-brand">Vault<span class="modal-side-accent">Box</span></div>
      </div>
      <div class="modal-side-divider"></div>
      <div class="modal-side-tip">
        <div class="modal-side-tip-header">
          <div class="modal-side-tip-icon">💡</div>
          <div class="modal-side-tip-label">Finanztipp</div>
          <button class="modal-side-tip-refresh" onclick="_refreshModalTip(this.closest('.overlay').id)" onmouseenter="_showTooltip('Neuer Tipp', this)" onmouseleave="_hideTooltip()">↻</button>
        </div>
        <div class="modal-side-tip-text">Öffne das Modal für einen Tipp.</div>
      </div>
      <div class="modal-side-footer">VaultBox · 2026</div>
    </div>`;

  document.querySelectorAll(".overlay .modal").forEach((modal) => {
    // Bestehende Kinder in .modal-main wrappen
    const main = document.createElement("div");
    main.className = "modal-main";
    while (modal.firstChild) main.appendChild(modal.firstChild);
    modal.appendChild(main);
    // Side-Panel anhängen
    modal.insertAdjacentHTML("beforeend", sideHtml);
  });
}

document.addEventListener("DOMContentLoaded", _initModalSidePanels);

let _editIdx = null;
let _editTrfId = null;
let _activeTab = "posten";
let _selectedCategoryId = null;
let _empfMode = "text"; // "text" | "account"

function _applyEmpfMode() {
  const isAcc = _empfMode === "account";
  const textInput = document.getElementById("fEmpfaenger");
  const accWrap   = document.getElementById("fEmpfAccWrap");
  const btn       = document.getElementById("btnEmpfKonto");
  if (textInput) { textInput.style.display = isAcc ? "none" : ""; if (!isAcc) textInput.value = ""; }
  if (accWrap)   accWrap.style.display = isAcc ? "" : "none";
  if (btn)       btn.classList.toggle("active", isAcc);
  if (isAcc)     _fillAccountSelect("fEmpfAcc", "");
}

function _toggleEmpfMode() {
  _empfMode = _empfMode === "text" ? "account" : "text";
  _applyEmpfMode();
}

function _savePostenAsTransfer() {
  const fromId = document.getElementById("fAccount")?.value || "";
  const toId   = document.getElementById("fEmpfAcc")?.value  || "";
  const amount = parseFloat(document.getElementById("fAmount")?.value) || 0;
  if (!fromId || !toId || fromId === toId || amount <= 0) {
    appAlert("Bitte Quell- und Zielkonto (verschieden) sowie einen Betrag angeben.", { icon: "⚠️", title: "Fehlende Angaben" });
    return;
  }
  const interval = document.getElementById("fInterval")?.value || "einmalig";
  const isOnce   = interval === "einmalig";
  const t = {
    id:       genId("trf"),
    fromId,
    toId,
    amount,
    date:     document.getElementById("fBookingDate")?.value || document.getElementById("fStart")?.value || today().toISOString().slice(0, 10),
    note:     document.getElementById("fNote")?.value.trim() || "",
    interval: isOnce ? "einmalig" : interval,
    execDay:  isOnce ? null : (parseInt(document.getElementById("fDue")?.value) || null),
  };
  S.transfers.push(t);
  persist();
  closeModal();
  _afterSave();
}

// ── KATEGORIE-PICKER ─────────────────
function _fillCategoryPicker(selectedId) {
  _selectedCategoryId = selectedId || null;
  const container = document.getElementById("fCategoryPicker");
  if (!container) return;
  while (container.firstChild) container.removeChild(container.firstChild);

  const cats = Array.isArray(S.categories) && S.categories.length
    ? S.categories
    : (typeof DEFAULT_CATEGORIES !== "undefined" ? DEFAULT_CATEGORIES : []);

  // "Keine" chip
  const noneChip = document.createElement("button");
  noneChip.type = "button";
  noneChip.className = "cat-chip" + (!_selectedCategoryId ? " active" : "");
  noneChip.textContent = "Keine";
  noneChip.dataset.catId = "";
  if (!_selectedCategoryId) {
    noneChip.style.borderColor = "var(--blue)";
    noneChip.style.background = "var(--blue-a08)";
    noneChip.style.color = "var(--blue)";
  }
  noneChip.addEventListener("click", () => _pickCategory("", container));
  container.appendChild(noneChip);

  cats.forEach((cat) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "cat-chip" + (cat.id === _selectedCategoryId ? " active" : "");
    chip.dataset.catId = cat.id;

    const iconSpan = document.createElement("span");
    iconSpan.className = "cat-chip-icon";
    iconSpan.textContent = cat.icon || "📦";
    chip.appendChild(iconSpan);

    const nameSpan = document.createElement("span");
    nameSpan.textContent = cat.name;
    chip.appendChild(nameSpan);

    if (cat.id === _selectedCategoryId) {
      chip.style.borderColor = cat.color;
      chip.style.background = cat.color + "22";
      chip.style.color = cat.color;
    }
    chip.addEventListener("click", () => _pickCategory(cat.id, container));
    container.appendChild(chip);
  });
}

function _pickCategory(catId, container) {
  _selectedCategoryId = catId || null;
  // Update all chips
  Array.from(container.children).forEach((chip) => {
    const isSelected = chip.dataset.catId === (catId || "");
    chip.classList.toggle("active", isSelected);
    chip.style.borderColor = "";
    chip.style.background = "";
    chip.style.color = "";
    if (isSelected) {
      if (!catId) {
        chip.style.borderColor = "var(--blue)";
        chip.style.background = "var(--blue-a08)";
        chip.style.color = "var(--blue)";
      } else {
        const cats = Array.isArray(S.categories) && S.categories.length
          ? S.categories
          : (typeof DEFAULT_CATEGORIES !== "undefined" ? DEFAULT_CATEGORIES : []);
        const cat = cats.find((c) => c.id === catId);
        if (cat) {
          chip.style.borderColor = cat.color;
          chip.style.background = cat.color + "22";
          chip.style.color = cat.color;
        }
      }
    }
  });
}

// ── KREDITOR-SELECT ───────────────────
function _fillCreditorSelect(selectedId) {
  const sel = document.getElementById("fCreditor");
  if (!sel) return;
  while (sel.firstChild) sel.removeChild(sel.firstChild);
  const none = document.createElement("option");
  none.value = ""; none.textContent = "— kein Kreditor —";
  sel.appendChild(none);
  const creds = Array.isArray(S.creditors) ? S.creditors : [];
  creds.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.name;
    if (c.id === selectedId) opt.selected = true;
    sel.appendChild(opt);
  });
  if (!selectedId) sel.value = "";
}

function openModal(idx, tab = "posten", trfId = null) {
  // Archiv-Tab: bei Posten immer zeigen, bei Transfer verstecken
  const archTab = document.getElementById("modalTabArchive");
  if (archTab) archTab.style.display = tab !== "transfer" ? "" : "none";
  _editIdx = idx !== undefined && idx !== null ? idx : null;
  _editTrfId = trfId;
  _activeTab = tab;
  switchModalTab(tab, false);
  if (tab === "posten") {
    _fillPostenForm(_editIdx !== null ? S.data[_editIdx] : null);
  } else {
    _fillTransferForm(trfId ? S.transfers.find((t) => t.id === trfId) : null);
  }
  const ov = document.getElementById("modalOverlay");
  ov.classList.add("open");
  if (typeof _modalPush === "function") _modalPush("modalOverlay");
  _refreshModalTip("modalOverlay");
  setTimeout(() => document.getElementById("fName")?.focus(), 50);
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
  if (typeof _modalPop === "function") _modalPop("modalOverlay");
  _editIdx = null;
  _editTrfId = null;
  ["fName", "fAmount"].forEach(id => clearValidation(document.getElementById(id)));
}

let _overlayMousedownOnBg = false;

document.addEventListener("DOMContentLoaded", () => {
  const ov = document.getElementById("modalOverlay");
  if (!ov) return;
  ov.addEventListener("mousedown", (e) => {
    _overlayMousedownOnBg = e.target === ov;
  });
});

function overlayClick(e) {
  if (_overlayMousedownOnBg && e.target === document.getElementById("modalOverlay")) closeModal();
}

function switchModalTab(tab, fill = true) {
  _activeTab = tab;
  document
    .querySelectorAll(".modal-tab")
    .forEach((t) => t.classList.toggle("active", t.dataset.tab === tab));
  document
    .querySelectorAll(".modal-pane")
    .forEach((p) => p.classList.toggle("active", p.id === "mpane-" + tab));
  const h = document.getElementById("modalH");
  if (tab === "posten") {
    // Titel wird von _togglePostenMode() gesetzt — hier nur Fallback
    h.textContent = _editIdx !== null ? "Buchung bearbeiten" : "Neue Buchung";
  }
  if (tab === "transfer")
    h.textContent =
      _editTrfId !== null ? "Umbuchung bearbeiten" : "Neue Umbuchung";
  if (fill) {
    if (tab === "posten") _fillPostenForm(null);
    if (tab === "transfer") _fillTransferForm(null);
  }
}

function _fillPostenForm(p) {
  _empfMode = "text";
  _applyEmpfMode();
  document.getElementById("modalH").textContent = p
    ? "Posten bearbeiten"
    : "Neue Buchung";
  _fillAccountSelect("fAccount", p ? p.accountId : "");

  // Archiv-Panel immer laden — bei neuem Posten mit temp-ID
  if (typeof renderArchivePanel === "function") {
    const archRefId = p ? p.id : "new_" + Date.now();
    const archName = p ? p.name || "Posten" : "Neuer Posten";
    // temp-ID für neuen Posten merken damit Dokumente nach Speichern umgehängt werden können
    window._archiveTempId = p ? null : archRefId;
    renderArchivePanel("modalArchivePanel", archRefId, "posten", archName);
  }

  if (p) {
    document.getElementById("fName").value = p.name;
    document.getElementById("fType").value = p.type;
    document.getElementById("fAmount").value = p.amount;
    document.getElementById("fInterval").value = p.interval;
    document.getElementById("fNote").value = p.note || "";
    const empEl = document.getElementById("fEmpfaenger");
    if (empEl) empEl.value = p.empfaenger || "";

    if (p.interval === "einmalig") {
      // Einzelbuchung: contractStart ist das Buchungsdatum
      const bd = document.getElementById("fBookingDate");
      if (bd) bd.value = p.contractStart || "";
      document.getElementById("fDue").value = "";
      document.getElementById("fStart").value = "";
      document.getElementById("fEnd").value = "";
    } else {
      // Serienbuchung
      document.getElementById("fDue").value = p.due || "";
      document.getElementById("fStart").value = p.contractStart || "";
      document.getElementById("fEnd").value = p.contractEnd || "";
      const bd = document.getElementById("fBookingDate");
      if (bd) bd.value = "";
    }
    const cdEl = document.getElementById("fCancellationDays");
    if (cdEl) cdEl.value = p.cancellationDays || "";
  } else {
    ["fName", "fAmount", "fDue", "fStart", "fEnd", "fNote", "fEmpfaenger"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    const bd = document.getElementById("fBookingDate");
    if (bd) bd.value = today().toISOString().slice(0, 10);
    document.getElementById("fType").value = "ausgabe";
    document.getElementById("fInterval").value = "monatl.";
  }

  // Kategorie-Picker befüllen
  _fillCategoryPicker(p ? (p.categoryId || null) : null);

  // Kreditor-Select befüllen
  _fillCreditorSelect(p ? (p.creditorId || null) : null);

  // Felder je nach Modus ein/ausblenden
  _togglePostenMode();

  // Bei Verträgen: Einzelbuchungs-Button + Umbuchung-Tab ausblenden
  const isVertrag = p && !!(p.contractStart || p.contractEnd);
  const btnEinzel = document.getElementById("btnModeEinzel");
  if (btnEinzel) btnEinzel.style.display = isVertrag ? "none" : "";
  const trfTab = document.querySelector(".modal-tabs [data-tab='transfer']");
  if (trfTab) trfTab.style.display = isVertrag ? "none" : "";

  const del = document.getElementById("postenModalDelete");
  if (del) del.style.display = _editIdx !== null ? "" : "none";
}

function savePosten() {
  if (_empfMode === "account") { _savePostenAsTransfer(); return; }
  const nameEl   = document.getElementById("fName");
  const amountEl = document.getElementById("fAmount");
  const name = nameEl.value.trim();
  let valid = true;
  valid = validateField(nameEl, v => v.trim().length > 0, "Pflichtfeld") && valid;
  valid = validateField(amountEl, v => parseFloat(v) > 0, "Betrag muss größer als 0 sein") && valid;
  if (!valid) { nameEl.focus(); return; }

  // ── OVERRIDES ERHALTEN ──
  // Beim Bearbeiten einer bestehenden Serie die overrides nicht verlieren
  const existingOverrides =
    _editIdx !== null && S.data[_editIdx]?.overrides
      ? S.data[_editIdx].overrides
      : undefined;

  // goalId ebenfalls erhalten falls vorhanden
  const existingGoalId =
    _editIdx !== null ? S.data[_editIdx]?.goalId : undefined;

  const p = {
    id:
      _editIdx !== null
        ? S.data[_editIdx].id
        : (() => {
            const newId = genId("p");
            // Temp-Archiv-Docs auf echte ID umhängen
            if (window._archiveTempId && window.csf?.archive?.relinkDocs) {
              window.csf.archive
                .relinkDocs(window._archiveTempId, newId)
                .catch(() => {});
              window._archiveTempId = null;
            }
            return newId;
          })(),
    name,
    type: document.getElementById("fType").value,
    amount: parseFloat(document.getElementById("fAmount").value) || 0,
    interval: document.getElementById("fInterval").value,
    accountId: document.getElementById("fAccount").value,
    note: document.getElementById("fNote").value.trim(),
    empfaenger: (document.getElementById("fEmpfaenger")?.value || "").trim(),
    // Einmalig: Buchungsdatum = contractStart, kein Ende, kein Fällig-Tag
    ...(document.getElementById("fInterval").value === "einmalig"
      ? {
          due: "",
          contractStart: document.getElementById("fBookingDate")?.value || "",
          contractEnd:   document.getElementById("fBookingDate")?.value || "",
        }
      : {
          due:           document.getElementById("fDue").value.trim(),
          contractStart: document.getElementById("fStart").value,
          contractEnd:   document.getElementById("fEnd").value,
        }),
  };

  // categoryId immer speichern (auch null)
  p.categoryId = _selectedCategoryId || null;

  // creditorId immer speichern (auch null)
  const credSel = document.getElementById("fCreditor");
  p.creditorId = credSel ? (credSel.value || null) : null;

  // cancellationDays nur bei Verträgen
  const cdVal = parseInt(document.getElementById("fCancellationDays")?.value) || 0;
  p.cancellationDays = cdVal > 0 ? cdVal : 0;

  // Optionale Felder nur wenn vorhanden
  if (existingOverrides && Object.keys(existingOverrides).length > 0) {
    p.overrides = existingOverrides;
  }
  if (existingGoalId) {
    p.goalId = existingGoalId;
  }

  const isNew = _editIdx === null;
  const oldDue = (!isNew) ? (S.data[_editIdx]?.due || "") : "";

  if (!isNew) S.data[_editIdx] = p;
  else S.data.push(p);

  persist();
  closeModal();
  _afterSave();
  if (typeof showToast === "function")
    showToast(isNew ? `Posten erstellt` : `Posten gespeichert`, "success", 2400);

  if (p.due === "31" && p.interval !== "einmalig")
    setTimeout(() => showToast("Hinweis: Tag 31 wird in kurzen Monaten auf den Monatsletzten gesetzt.", "info", 5000), 600);

  // Fälligkeitstag geändert? → vorgemerkte Buchungen fragen
  if (!isNew && oldDue && p.due && oldDue !== p.due && p.interval !== "einmalig") {
    const vorgemerkte = (S.bookings || []).filter(b => b.postenId === p.id && b.status === "vorgemerkt");
    if (vorgemerkte.length > 0) {
      appConfirm(
        `Fälligkeitstag wurde von ${oldDue}. auf ${p.due}. geändert.\n${vorgemerkte.length} ausstehende Buchung${vorgemerkte.length !== 1 ? "en" : ""} auf den neuen Tag anpassen?`,
        { icon: "📅", title: "Buchungsdaten anpassen?", confirmLabel: "Anpassen" }
      ).then(ok => {
        if (!ok) return;
        _updateVorgemerkteDay(p.id, parseInt(p.due));
      });
    }
  }
}

function _updateVorgemerkteDay(postenId, newDay) {
  (S.bookings || []).forEach(b => {
    if (b.postenId !== postenId || b.status !== "vorgemerkt") return;
    const parts = b.date.split("-");
    const yr = parseInt(parts[0]);
    const mo = parseInt(parts[1]);
    const lastDay = new Date(yr, mo, 0).getDate();
    const clamped = Math.min(newDay, lastDay);
    b.date = `${yr}-${String(mo).padStart(2, "0")}-${String(clamped).padStart(2, "0")}`;
  });
  persist();
  if (typeof renderPosten === "function") renderPosten();
  if (typeof renderVertraege === "function") renderVertraege();
  if (typeof showToast === "function") showToast("Buchungsdaten aktualisiert", "success", 2200);
}

function deletePosten() {
  if (_editIdx === null) return;
  const name = S.data[_editIdx].name;
  appConfirm(`"${name}" wirklich löschen?`, {
    icon: "🗑️",
    title: "Posten löschen",
    confirmLabel: "Löschen",
    confirmClass: "danger",
  }).then((ok) => {
    if (ok) _doDeletePosten(_editIdx);
  });
}
function _doDeletePosten(idx) {
  const name = S.data[idx]?.name || "Posten";
  S.data.splice(idx, 1);
  persist();
  closeModal();
  _afterSave();
  if (typeof showToast === "function") showToast(`"${name}" gelöscht`, "info", 2400);
}

function _fillTransferForm(t) {
  _fillAccountSelect("fTrfFrom", t ? t.fromId : "");
  _fillAccountSelect("fTrfTo", t ? t.toId : "");

  if (t) {
    document.getElementById("fTrfAmount").value = t.amount;
    document.getElementById("fTrfDate").value = t.date || "";
    document.getElementById("fTrfNote").value = t.note || "";
    document.getElementById("fTrfInterval").value = t.interval || "einmalig";
    document.getElementById("fTrfExecDay").value = t.execDay || "";
    _toggleTrfInterval();
  } else {
    document.getElementById("fTrfAmount").value = "";
    document.getElementById("fTrfDate").value = today()
      .toISOString()
      .slice(0, 10);
    document.getElementById("fTrfNote").value = "";
    document.getElementById("fTrfInterval").value = "einmalig";
    document.getElementById("fTrfExecDay").value = "";
    _toggleTrfInterval();
  }

  const del = document.getElementById("trfModalDelete");
  if (del) del.style.display = _editTrfId ? "" : "none";
}

function saveTransfer() {
  const fromId = document.getElementById("fTrfFrom").value;
  const toId = document.getElementById("fTrfTo").value;
  const amount = parseFloat(document.getElementById("fTrfAmount").value) || 0;
  if (!fromId || !toId || fromId === toId || amount <= 0) {
    appAlert(
      "Bitte Quell- und Zielkonto (verschieden) sowie einen Betrag angeben.",
      { icon: "⚠️", title: "Fehlende Angaben" },
    );
    return;
  }
  const interval = document.getElementById("fTrfInterval").value;
  const execDay =
    parseInt(document.getElementById("fTrfExecDay")?.value) || null;
  const t = {
    id: _editTrfId || genId("trf"),
    fromId,
    toId,
    amount,
    date:
      document.getElementById("fTrfDate").value ||
      today().toISOString().slice(0, 10),
    note: document.getElementById("fTrfNote").value.trim(),
    // interval: null wird als einmalig behandelt, "einmalig" explizit für Label
    interval: interval !== "einmalig" ? interval : "einmalig",
    execDay: interval !== "einmalig" ? execDay : null,
  };
  if (_editTrfId) {
    const idx = S.transfers.findIndex((x) => x.id === _editTrfId);
    if (idx >= 0) S.transfers[idx] = t;
    else S.transfers.push(t);
  } else {
    S.transfers.push(t);
  }
  persist();
  closeModal();
  _afterSave();
}

function deleteTransfer() {
  if (!_editTrfId) return;
  appConfirm("Umbuchung wirklich löschen?", {
    icon: "🗑️",
    title: "Umbuchung löschen",
    confirmLabel: "Löschen",
    confirmClass: "danger",
  }).then((ok) => {
    if (!ok) return;
    S.transfers = S.transfers.filter((t) => t.id !== _editTrfId);
    persist();
    closeModal();
    _afterSave();
  });
}

function _accTypeLabel(t) {
  const map = { girokonto:"Girokonto", kreditkarte:"Kreditkarte", tagesgeld:"Tagesgeld", sparkonto:"Sparkonto", depot:"Depot", festgeld:"Festgeld", vl:"VL", sonstiges:"Sonstiges" };
  return map[t] || t || "Konto";
}

function _fillAccountSelect(selectId, selectedVal) {
  const sel = document.getElementById(selectId);
  if (!sel) return;

  // Fill hidden native select (keeps save logic working)
  while (sel.options.length) sel.remove(0);
  const noneOpt = document.createElement("option");
  noneOpt.value = "";
  noneOpt.textContent = "— nicht zugeordnet —";
  sel.appendChild(noneOpt);
  S.accounts.forEach(a => {
    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = a.label;
    if (a.id === selectedVal) opt.selected = true;
    sel.appendChild(opt);
  });

  // Update custom dropdown trigger (if exists)
  const chosen = S.accounts.find(a => a.id === selectedVal);
  const dotEl = document.getElementById(selectId + "Dot");
  const labelEl = document.getElementById(selectId + "Label");
  if (dotEl) dotEl.style.background = chosen ? (chosen.color || "var(--border2)") : "var(--border2)";
  if (labelEl) labelEl.textContent = chosen ? chosen.label : "— nicht zugeordnet —";

  const menu = document.getElementById(selectId + "Menu");
  if (!menu) return;
  while (menu.firstChild) menu.removeChild(menu.firstChild);

  // "None" option
  const noneDiv = document.createElement("div");
  noneDiv.className = "acc-select-none";
  noneDiv.textContent = "— nicht zugeordnet —";
  noneDiv.dataset.accId = "";
  noneDiv.dataset.accColor = "";
  noneDiv.dataset.accLabel = "— nicht zugeordnet —";
  menu.appendChild(noneDiv);

  S.accounts.forEach(a => {
    const item = document.createElement("div");
    item.className = "acc-select-item" + (a.id === selectedVal ? " selected" : "");
    item.style.borderLeft = "3px solid " + (a.color || "transparent");
    item.dataset.accId = a.id;
    item.dataset.accColor = a.color || "";
    item.dataset.accLabel = a.label;

    const dot = document.createElement("div");
    dot.className = "acc-select-item-dot";
    dot.style.background = a.color || "var(--border2)";

    const info = document.createElement("div");
    info.className = "acc-select-item-info";

    const namEl = document.createElement("div");
    namEl.className = "acc-select-item-name";
    namEl.textContent = a.label;
    info.appendChild(namEl);

    const ibanStr = _accNumberDisplay(a);
    if (ibanStr) {
      const sub = document.createElement("div");
      sub.className = "acc-select-item-sub";
      sub.textContent = ibanStr;
      info.appendChild(sub);
    }

    // Hover preview tooltip
    const preview = document.createElement("div");
    preview.className = "acc-select-preview";
    if (a.bankGroup) {
      const grp = document.createElement("div");
      grp.className = "acc-preview-group";
      grp.textContent = a.bankGroup;
      preview.appendChild(grp);
    }
    if (ibanStr) {
      const ibanEl = document.createElement("div");
      ibanEl.className = "acc-preview-iban";
      ibanEl.textContent = ibanStr;
      preview.appendChild(ibanEl);
    }
    const typeEl = document.createElement("div");
    typeEl.className = "acc-preview-type";
    typeEl.textContent = _accTypeLabel(a.accountType);
    preview.appendChild(typeEl);

    item.appendChild(dot);
    item.appendChild(info);
    item.appendChild(preview);
    menu.appendChild(item);
  });

  // Event delegation — avoids inline handlers
  menu._selectId = selectId;
  if (!menu._hasListener) {
    menu._hasListener = true;
    menu.addEventListener("click", function(e) {
      const target = e.target.closest("[data-acc-id]");
      if (!target) return;
      _pickAccItem(this._selectId, target.dataset.accId, target.dataset.accLabel, target.dataset.accColor);
    });
  }
}

function _closeAllAccDropdowns() {
  document.querySelectorAll(".acc-select-wrap.open").forEach(w => w.classList.remove("open"));
  const portal = document.getElementById("_accDropPortal");
  if (portal) portal.remove();
}

function _toggleAccDropdown(selectId) {
  const wrap    = document.getElementById(selectId + "Wrap");
  const trigger = document.getElementById(selectId + "Trigger");
  const menu    = document.getElementById(selectId + "Menu");
  if (!wrap || !menu) return;
  const isOpen = wrap.classList.contains("open");
  _closeAllAccDropdowns();
  if (!isOpen) {
    wrap.classList.add("open");
    const r = (trigger || wrap).getBoundingClientRect();
    // Teleport to document.body to escape overflow:hidden / backdrop-filter containment
    const portal = document.createElement("div");
    portal.id = "_accDropPortal";
    portal.className = "acc-select-menu";
    portal.style.cssText = `top:${r.bottom + 4}px;left:${r.left}px;width:${Math.max(r.width, 220)}px;display:block`;
    // Mirror all children and the select-id reference
    portal._selectId = selectId;
    while (portal.firstChild) portal.removeChild(portal.firstChild);
    Array.from(menu.childNodes).forEach(n => portal.appendChild(n.cloneNode(true)));
    // Mark selected
    portal.querySelectorAll("[data-acc-id]").forEach(el => {
      const sel = document.getElementById(selectId);
      el.classList.toggle("selected", sel && el.dataset.accId === sel.value);
    });
    // Event delegation
    portal.addEventListener("click", e => {
      const target = e.target.closest("[data-acc-id]");
      if (!target) return;
      _pickAccItem(portal._selectId, target.dataset.accId, target.dataset.accLabel, target.dataset.accColor);
      _closeAllAccDropdowns();
    });
    document.body.appendChild(portal);
    // Close on outside click
    setTimeout(() => {
      document.addEventListener("click", function _accOutside(e) {
        if (!e.target.closest("#_accDropPortal") && !e.target.closest("#" + selectId + "Wrap")) {
          _closeAllAccDropdowns();
          document.removeEventListener("click", _accOutside);
        }
      });
    }, 0);
  }
}

function _pickAccItem(selectId, id, label, color) {
  const sel = document.getElementById(selectId);
  if (sel) sel.value = id;
  const dotEl = document.getElementById(selectId + "Dot");
  const labelEl = document.getElementById(selectId + "Label");
  if (dotEl) dotEl.style.background = color || "var(--border2)";
  if (labelEl) labelEl.textContent = label || "— nicht zugeordnet —";
  const wrap = document.getElementById(selectId + "Wrap");
  if (wrap) wrap.classList.remove("open");
  _closeAllAccDropdowns();
}

document.addEventListener("click", e => {
  if (!e.target.closest(".acc-select-wrap") && !e.target.closest("#_accDropPortal")) {
    _closeAllAccDropdowns();
  }
}, true);

function _afterSave() {
  // Bookings neu generieren — Serie könnte geändert worden sein
  // (neue Beträge, geänderte Laufzeit etc.)
  if (typeof _syncBookingsAfterSerieEdit === "function")
    _syncBookingsAfterSerieEdit();

  refreshDash();
  updateContractBadge();
  // Aktive Seite neu rendern
  if (document.getElementById("p-posten")?.classList.contains("active"))
    renderPosten();
  if (document.getElementById("p-vertraege")?.classList.contains("active"))
    renderVertraege();
  if (document.getElementById("p-jahr")?.classList.contains("active"))
    renderJahr();
  if (document.getElementById("p-goals")?.classList.contains("active"))
    renderGoals();
  if (typeof _pvRefreshIfVisible === "function") _pvRefreshIfVisible();
}

// Schaltet das Formular zwischen Einzelbuchung und Serienbuchung
function _togglePostenMode() {
  const iv = document.getElementById("fInterval")?.value || "monatl.";
  const isEinmalig = iv === "einmalig";

  // Segmented control state
  const btnSerie = document.getElementById("btnModeSerie");
  const btnEinzel = document.getElementById("btnModeEinzel");
  if (btnSerie) btnSerie.classList.toggle("active", !isEinmalig);
  if (btnEinzel) btnEinzel.classList.toggle("active", isEinmalig);

  // Intervall-Selector nur bei Serie
  const intRow = document.getElementById("fIntervalRow");
  if (intRow) intRow.style.display = isEinmalig ? "none" : "";

  // Fällig-Tag nur bei Serie
  const dueRow = document.getElementById("fDueRow");
  if (dueRow) dueRow.style.display = isEinmalig ? "none" : "";

  // Buchungsdatum nur bei Einmalig
  const bdRow = document.getElementById("fBookingDateRow");
  if (bdRow) bdRow.style.display = isEinmalig ? "" : "none";

  // Laufzeit-Zeile nur bei Serie
  const laufRow = document.getElementById("fLaufzeitRow");
  if (laufRow) laufRow.style.display = isEinmalig ? "none" : "";

  // Kündigungsfrist nur bei Serie (wenn contractEnd gesetzt oder Editieren)
  const cancelRow = document.getElementById("fCancellationRow");
  if (cancelRow) cancelRow.style.display = isEinmalig ? "none" : "";

  // Modal-Titel / Header anpassen
  const h = document.getElementById("modalH");
  if (h) {
    if (isEinmalig) {
      h.textContent = _editIdx !== null ? "Einzelbuchung bearbeiten" : "Neue Einzelbuchung";
    } else {
      h.textContent = _editIdx !== null ? "Serienbuchung bearbeiten" : "Neue Serienbuchung";
    }
  }
}

// Setzt den Modus über die Toggle-Buttons
function _setPostenMode(mode) {
  const sel = document.getElementById("fInterval");
  if (!sel) return;
  if (mode === "einmalig") {
    sel.value = "einmalig";
  } else if (sel.value === "einmalig") {
    sel.value = "monatl.";
  }
  _togglePostenMode();
}

function _toggleTrfInterval() {
  const iv      = document.getElementById("fTrfInterval")?.value || "einmalig";
  const dateRow = document.getElementById("fTrfDateRow");
  const dayRow  = document.getElementById("fTrfDayRow");
  const lbl     = document.getElementById("fTrfDateLabel");
  if (dateRow) dateRow.style.display = "";
  if (dayRow)  dayRow.style.display  = iv !== "einmalig" ? "" : "none";
  if (lbl)     lbl.textContent       = iv !== "einmalig" ? "Startdatum" : "Buchungsdatum";
}
