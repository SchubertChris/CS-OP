let _goalCreatePosten = true; // Auto-Posten beim Erstellen eines Ziels

// ══════════════════════════════════════
//  GOALS — Sparziele
// ══════════════════════════════════════

// Ziele leben in S.goals[]
// { id, name, targetAmount, currentAmount, monthlyRate, deadline, color, icon }

function renderGoals() {
  const el = document.getElementById("p-goals");
  if (!el) return;

  const goals = S.goals || [];

  el.innerHTML = `
  <div class="ph">
    <div>
      <div class="ph-title">Sparziele</div>
      <div class="ph-sub">${goals.length} Ziel${goals.length !== 1 ? "e" : ""} · ${goals.filter((g) => _goalPct(g) >= 100).length} erreicht</div>
    </div>
    <button class="btn primary" onclick="openGoalModal()">+ Neues Ziel</button>
  </div>

  <div class="goals-layout">
    <div class="goals-main">
      ${
        goals.length === 0
          ? `
        <div class="empty-state">
          <div class="empty-icon" style="display:flex;justify-content:center;color:var(--blue)">${iconHtml("target", 34)}</div>
          <div class="empty-title">Noch keine Sparziele</div>
          <div class="empty-sub">Lege dein erstes Ziel an — Urlaub, Auto, Notgroschen oder Depot-Aufbau</div>
          <button class="btn primary" style="margin-top:16px;" onclick="openGoalModal()">+ Erstes Ziel anlegen</button>
        </div>
      `
          : `
        <div class="goals-grid">
          ${goals.map((g) => _renderGoalCard(g)).join("")}
        </div>
      `
      }
    </div>
    <div class="goals-sidebar">

      <div class="goals-promo-card">
        <div class="goals-promo-badge">🔐 VaultBox</div>
        <div class="goals-promo-title">Sparziele. Offline. Sicher.</div>
        <div class="goals-promo-body">
          Deine Sparziele bleiben vollständig lokal — kein Server, keine Cloud, kein Tracking. Setze Ziele, verknüpfe Konten und behalte den Überblick.
        </div>
        <div class="goals-promo-tags">
          <span>100% Offline</span><span>Kein Abo</span>
          <span>149€ einmalig</span><span>FIFO Engine</span>
        </div>
      </div>

      <div class="goals-faq-card" style="margin-top:12px;">
        <div class="goals-faq-badge">FAQ</div>
        <div class="goals-faq-list" id="goalsFaqList"></div>
      </div>

      <div class="goals-tips-card" style="margin-top:12px;">
        <div class="goals-faq-badge goals-tips-badge">Finanztipps</div>
        <div class="goals-tips-list" id="goalsTipsList"></div>
      </div>

    </div>
  </div>
`;

  _renderGoalIconPicker();
  _renderGoalColorPicker(null);
  _renderGoalsSidebar();
}

function _renderGoalsSidebar() {
  const faq = document.getElementById("goalsFaqList");
  const tips = document.getElementById("goalsTipsList");
  if (!faq || !tips) return;

  const FAQS = [
    {
      q: "Wie viel sollte ich monatlich sparen?",
      a: "Faustregel 50/30/20: 50% Fixkosten, 30% Lifestyle, 20% Sparen & Investieren.",
    },
    {
      q: "Was ist ein Notgroschen?",
      a: "3–6 Monatsgehälter auf Tagesgeld. Sofort verfügbar für Notfälle — nicht für alltägliche Ausgaben anrühren.",
    },
    {
      q: "Sparrate oder Einmalinvestition?",
      a: "Monatliche Raten (Cost-Average-Effekt) reduzieren das Timing-Risiko. Bei klarer Marktdelle kann eine Einmalzahlung besser sein.",
    },
    {
      q: "ETF oder Einzelaktien?",
      a: "Für langfristigen Aufbau empfehlen Experten breit gestreute ETFs (z.B. MSCI World) statt Einzelwetten.",
    },
    {
      q: "Wann lohnt sich Sondertilgung?",
      a: "Wenn Kreditzins > Anlagerendite. Bei günstigen Krediten oft besser investieren statt tilgen.",
    },
    {
      q: "Was sind VL-Leistungen?",
      a: "Vermögenswirksame Leistungen: AG zahlt bis zu 40 €/Mon direkt auf Spar-/Fondskonto. Oft nicht abgerufen — im Arbeitsvertrag prüfen!",
    },
  ];

  const TIPS = [
    {
      icon: "📈",
      tip: "Zinseszins wirkt ab 10+ Jahren exponentiell. Je früher du anfängst, desto mehr arbeitet dein Geld.",
    },
    {
      icon: "🔄",
      tip: 'Automatisierte Daueraufträge verhindern, dass Geld "weg ist" bevor du sparst. Erst sparen, dann ausgeben.',
    },
    {
      icon: "💡",
      tip: "VL werden oft nicht abgerufen. Prüfe deinen Arbeitsvertrag — 40 €/Mon vom AG sind 480 € pro Jahr geschenkt.",
    },
    {
      icon: "⚠️",
      tip: "Über 100.000 € pro Bank sind nicht durch die Einlagensicherung geschützt. Aufteilen auf mehrere Institute.",
    },
    {
      icon: "🎯",
      tip: 'Konkrete Ziele sparen sich leichter. Nicht "irgendwann Urlaub" — sondern "Mallorca Juli 2026, 1.400 €".',
    },
    {
      icon: "🏠",
      tip: "Eigenkapital von mind. 20% des Kaufpreises senkt Zinslast und Monatsrate beim Immobilienkauf erheblich.",
    },
  ];

  faq.innerHTML = FAQS.map(
    (f, i) => `
    <div class="goals-faq-item" onclick="this.classList.toggle('open')">
      <div class="goals-faq-q">
        <span>${esc(f.q)}</span>
        <svg class="goals-faq-chev" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <div class="goals-faq-a">${esc(f.a)}</div>
    </div>`,
  ).join("");

  tips.innerHTML = TIPS.map(
    (t) => `
    <div class="goals-tip-item">
      <span class="goals-tip-icon">${t.icon}</span>
      <span class="goals-tip-text">${esc(t.tip)}</span>
    </div>`,
  ).join("");
}

function _goalPct(g) {
  if (!g.targetAmount || g.targetAmount <= 0) return 0;
  return Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
}

function _goalMonthsLeft(g) {
  if (!g.deadline) return null;
  const now = new Date();
  const dl = new Date(g.deadline);
  const months = (dl.getFullYear() - now.getFullYear()) * 12 + (dl.getMonth() - now.getMonth());
  return Math.max(0, months);
}

function _goalUpdateFeedback() {
  const target    = pp(document.getElementById("gfTarget")?.value   || "0");
  const current   = pp(document.getElementById("gfCurrent")?.value  || "0");
  const startVal  = document.getElementById("gfStart")?.value;
  const deadlineVal = document.getElementById("gfDeadline")?.value;
  const rateEl    = document.getElementById("gfRate");
  const sliderEl  = document.getElementById("gfRateSlider");
  const panel     = document.getElementById("gfFeedbackPanel");
  const hint      = document.getElementById("gfRateHint");

  // Monate berechnen
  let months = 0;
  if (deadlineVal) {
    const n = new Date();
    const startDate = startVal ? new Date(startVal) : n;
    const deadline  = new Date(deadlineVal);
    months = Math.max(0,
      (deadline.getFullYear() - startDate.getFullYear()) * 12 +
      (deadline.getMonth()    - startDate.getMonth())
    );
  }

  const remaining    = Math.max(0, target - current);
  const optimalRate  = (months > 0 && remaining > 0) ? remaining / months : 0;

  // Auto-Fill: nur wenn Feld leer und Daten vorhanden
  if (rateEl && !rateEl.value.trim() && optimalRate > 0) {
    rateEl.value = optimalRate.toFixed(2).replace(".", ",");
    if (hint) hint.textContent = "automatisch berechnet";
  }

  const rate = pp(rateEl?.value || "0");

  // Slider aktualisieren
  if (sliderEl && optimalRate > 0) {
    const sliderMax = Math.max(Math.ceil(optimalRate * 2.5 / 5) * 5, 50);
    sliderEl.max = sliderMax;
    sliderEl.value = Math.min(rate, sliderMax);
    const minEl = document.getElementById("gfSliderMin");
    const maxEl = document.getElementById("gfSliderMax");
    if (minEl) minEl.textContent = "0 €";
    if (maxEl) maxEl.textContent = fmShort(sliderMax) + " €";
  }

  // Feedback-Panel
  if (!panel) return;
  if (target <= 0 || months <= 0) { panel.style.display = "none"; return; }
  panel.style.display = "";

  const _set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  _set("gfFbTarget",    fmShort(target)    + " €");
  _set("gfFbCurrent",   fmShort(current)   + " €");
  _set("gfFbRemaining", fmShort(remaining) + " €");
  _set("gfFbMonths",    months + " Monat" + (months !== 1 ? "e" : ""));

  const statusEl = document.getElementById("gfFbStatus");
  if (!statusEl) return;

  if (rate <= 0) {
    statusEl.className = "gf-fb-status gf-fb-warn";
    statusEl.textContent = "Bitte Sparrate eingeben";
    return;
  }

  const shortfall     = remaining - rate * months; // positiv = Fehlbetrag
  const monthsNeeded  = Math.ceil(remaining / rate);

  if (shortfall <= 0.01) {
    const monthsEarly = months - monthsNeeded;
    statusEl.className = "gf-fb-status gf-fb-ok";
    statusEl.textContent = monthsEarly > 0
      ? `✓ Erreichbar — ${monthsEarly} Monat${monthsEarly !== 1 ? "e" : ""} vor Deadline`
      : `✓ Genau erreichbar zum Zieldatum`;
  } else {
    statusEl.className = "gf-fb-status gf-fb-warn";
    statusEl.textContent = `⚠ Fehlbetrag: ${fmShort(Math.ceil(shortfall))} € bis Deadline`;
  }
}

// Alias für bestehende Aufrufe
function _goalAutoRate() { _goalUpdateFeedback(); }

function _goalOnRateInput() {
  const hint = document.getElementById("gfRateHint");
  if (hint) hint.textContent = "";
  _goalUpdateFeedback();
}

function _goalOnSliderInput() {
  const slider = document.getElementById("gfRateSlider");
  const rateEl = document.getElementById("gfRate");
  if (!slider || !rateEl) return;
  rateEl.value = parseFloat(slider.value).toFixed(2).replace(".", ",");
  const hint = document.getElementById("gfRateHint");
  if (hint) hint.textContent = "";
  _goalUpdateFeedback();
}

function _renderGoalCard(g) {
  const pct = _goalPct(g);
  const months = _goalMonthsLeft(g);
  const remaining = Math.max(0, (g.targetAmount || 0) - (g.currentAmount || 0));
  const done = pct >= 100;
  const idx = (S.goals || []).indexOf(g);

  return `
  <div class="goal-card ${done ? "done" : ""}" onclick="openGoalModal(${idx})">
    <div class="goal-card-top">
      <div class="goal-icon-badge" style="background:${g.color || "#4d9eff"}22;color:${g.color || "#4d9eff"};display:inline-flex;align-items:center;justify-content:center">${uiIcon(g.icon || "target", 18)}</div>
      <div class="goal-card-meta">
        <div class="goal-card-name">${esc(g.name)}</div>
        ${months !== null ? `<div class="goal-card-deadline">${months > 0 ? months + " Monate verbleibend" : "⚠ Zieldatum überschritten"}</div>` : ""}
      </div>
      <div style="margin-left:auto;display:flex;gap:6px;">
        ${!done ? `<button class="btn sm" onclick="event.stopPropagation(); _goalAddAmount(${idx})" onmouseenter="_showTooltip('Betrag hinzufügen',this)" onmouseleave="_hideTooltip()" style="font-size:13px;">+€</button>` : ""}
        <button class="btn sm" onclick="event.stopPropagation(); openGoalModal(${idx})">✎</button>
      </div>
    </div>
    <div class="goal-prog-track">
      <div class="goal-prog-fill" style="width:${pct}%;background:${g.color || "#4d9eff"};"></div>
      ${[25, 50, 75].map(m => `
        <div class="goal-milestone${pct >= m ? " reached" : ""}" style="left:${m}%" onmouseenter="_showTooltip('${m}% Meilenstein${pct >= m ? " ✓ erreicht" : ""}',this)" onmouseleave="_hideTooltip()"></div>
      `).join("")}
    </div>
    <div class="goal-card-nums">
      <div>
        <div class="goal-num-val" style="color:${g.color || "#4d9eff"}">${fm(g.currentAmount || 0)}</div>
        <div class="goal-num-lbl">gespart</div>
      </div>
      <div style="text-align:center;">
        <div class="goal-num-val ${done ? "done-val" : ""}">${pct}%</div>
        <div class="goal-num-lbl">${done ? "✓ Erreicht" : "Fortschritt"}</div>
      </div>
      <div style="text-align:right;">
        <div class="goal-num-val">${fm(g.targetAmount || 0)}</div>
        <div class="goal-num-lbl">Ziel</div>
      </div>
    </div>
    ${
      g.monthlyRate > 0 && !done
        ? `
      <div class="goal-rate-row">
        <span>Sparrate ${fm(g.monthlyRate)}/Mon</span>
        <span style="color:var(--text3);">noch ${fm(remaining)} offen</span>
      </div>
    `
        : ""
    }
    ${(() => {
      const linkedPosten = (S.data || []).find(p => p.goalId === g.id);
      if (linkedPosten) {
        return `<div class="goal-posten-link" onclick="event.stopPropagation();openModal(${(S.data||[]).indexOf(linkedPosten)})" onmouseenter="_showTooltip('Verknüpften Posten bearbeiten',this)" onmouseleave="_hideTooltip()">
          <span style="opacity:.6;font-size:.85em;">📋</span>
          <span>${esc(linkedPosten.name)}</span>
          <span style="color:var(--text3);">${fm(linkedPosten.amount || 0)}/Mon</span>
        </div>`;
      } else {
        return `<div class="goal-posten-missing" onmouseenter="_showTooltip('Kein Spar-Posten verknüpft – Ziel im Modal neu speichern um ihn zu erstellen',this)" onmouseleave="_hideTooltip()">
          ⚠ Posten fehlt
        </div>`;
      }
    })()}
  </div>`;
}

// ── QUICK-ADD BETRAG ─────────────────
function _goalAddAmount(idx) {
  const g = (S.goals || [])[idx];
  if (!g) return;
  appPrompt(`Betrag zu "${g.name}" hinzufügen:`, {
    icon: "💰",
    title: "Betrag hinzufügen",
    placeholder: "0,00",
    confirmLabel: "Hinzufügen",
  }).then(val => {
    if (val === null || val === false) return;
    const amount = parseFloat(String(val).replace(",", "."));
    if (isNaN(amount) || amount <= 0) {
      showToast("Ungültiger Betrag", "error");
      return;
    }
    const wasBelow = _goalPct(g) < 100;
    g.currentAmount = (g.currentAmount || 0) + amount;
    persist();
    renderGoals();
    if (typeof refreshDash === "function") refreshDash();
    showToast(`+${fm(amount)} zu "${g.name}" hinzugefügt`, "success", 2400);
    if (wasBelow && _goalPct(g) >= 100) {
      setTimeout(() => showToast(`🎉 "${g.name}" erreicht! Glückwunsch!`, "success", 5000), 400);
    }
  });
}

// ── GOAL MODAL ────────────────────────
let _editGoalIdx = null;
let _selectedGoalIcon = "target";
let _selectedGoalColor = "#4d9eff";

let _goalOverlayMousedownOnBg = false;
document.addEventListener("DOMContentLoaded", () => {
  const ov = document.getElementById("goalModalOverlay");
  if (!ov) return;
  ov.addEventListener("mousedown", (e) => {
    _goalOverlayMousedownOnBg = e.target === ov;
  });
});

function openGoalModal(idx = null) {
  _editGoalIdx = idx;
  const g = idx !== null ? (S.goals || [])[idx] : null;

  document.getElementById("goalModalTitle").textContent = g
    ? "Ziel bearbeiten"
    : "Neues Ziel";
  document.getElementById("gfName").value = g ? g.name : "";
  document.getElementById("gfTarget").value = g
    ? g.targetAmount.toFixed(2).replace(".", ",")
    : "";
  document.getElementById("gfCurrent").value = g
    ? (g.currentAmount || 0).toFixed(2).replace(".", ",")
    : "";
  document.getElementById("gfRate").value = g
    ? (g.monthlyRate || 0).toFixed(2).replace(".", ",")
    : "";
  document.getElementById("gfDeadline").value = g ? g.deadline || "" : "";
  const startEl = document.getElementById("gfStart");
  if (startEl) startEl.value = g ? g.startDate || "" : "";
  // Monatsanzeige aktualisieren
  if (typeof _goalAutoRate === "function") _goalAutoRate();

  // Konto-Dropdown befüllen
  const accSel = document.getElementById("gfAccount");
  if (accSel) {
    const main = typeof getMainAccount === "function" ? getMainAccount() : null;
    const giroAccs = (S.accounts || []).filter(
      (a) => a.accountType === "girokonto" || !a.accountType,
    );
    accSel.innerHTML =
      giroAccs
        .map(
          (a) =>
            `<option value="${a.id}" ${(g ? g.accountId : main?.id) === a.id ? "selected" : ""}>${esc(a.label)}</option>`,
        )
        .join("") || `<option value="">— kein Konto —</option>`;
  }

  _selectedGoalIcon = g ? g.icon || "target" : "target";
  _selectedGoalColor = g ? g.color || "#4d9eff" : "#4d9eff";

  _renderGoalIconPicker();
  _renderGoalColorPicker(_selectedGoalColor);

  const delBtn = document.getElementById("goalModalDelete");
  if (delBtn) delBtn.style.display = g ? "" : "none";

  // Auto-Posten toggle
  const cpEl = document.getElementById("gfCreatePosten");
  if (cpEl) cpEl.checked = _goalCreatePosten;

  document.getElementById("goalModalOverlay").classList.add("open");
  if (typeof _refreshModalTip === "function") _refreshModalTip("goalModalOverlay");
  setTimeout(() => document.getElementById("gfName").focus(), 50);
}

function closeGoalModal() {
  const ov = document.getElementById("goalModalOverlay");
  if (ov) ov.classList.remove("open");
  _editGoalIdx = null;
}

const GOAL_ICONS = [
  "target", "plane", "car", "home", "monitor", "wallet",
  "trending-up", "graduation-cap", "heart", "gift", "coins", "star",
  "shield", "dumbbell",
];

function selectGoalIcon(ic) {
  _selectedGoalIcon = ic;
  _renderGoalIconPicker();
}

function _renderGoalIconPicker() {
  const picker = document.getElementById("goalIconPicker");
  if (!picker) return;
  picker.innerHTML = GOAL_ICONS.map((name) =>
    `<button type="button" class="goal-icon-opt${name === _selectedGoalIcon ? " active" : ""}" data-icon="${name}" onclick="selectGoalIcon('${name}')">${iconHtml(name, 18)}</button>`
  ).join("");
}

function _renderGoalColorPicker(selected) {
  const row = document.getElementById("goalColorRow");
  if (!row) return;
  row.innerHTML = ACC_PRESET_COLORS.map(
    (c) => `
    <div class="color-swatch ${c === (selected || _selectedGoalColor) ? "active" : ""}"
         style="background:${c};"
         onclick="selectGoalColor('${c}')"></div>
  `,
  ).join("");
}

function selectGoalColor(c) {
  _selectedGoalColor = c;
  _renderGoalColorPicker(c);
}

function saveGoal() {
  const nameEl   = document.getElementById("gfName");
  const targetEl = document.getElementById("gfTarget");
  let valid = true;
  valid = validateField(nameEl,   v => v.trim().length > 0, "Pflichtfeld") && valid;
  valid = validateField(targetEl, v => pp(v) > 0,           "Betrag muss größer als 0 sein") && valid;
  if (!valid) { nameEl.focus(); return; }
  const name = nameEl.value.trim();

  const accSel = document.getElementById("gfAccount");
  const _mainAcc = typeof getMainAccount === "function" ? getMainAccount() : null;
  const chosenAccountId = accSel ? accSel.value : (_mainAcc ? _mainAcc.id : "");

  const _n = new Date();
  const _safeToday = `${_n.getFullYear()}-${String(_n.getMonth()+1).padStart(2,'0')}-${String(_n.getDate()).padStart(2,'0')}`;
  const startDateVal = (document.getElementById("gfStart")?.value || "").trim() || _safeToday;

  const g = {
    id: _editGoalIdx !== null ? S.goals[_editGoalIdx].id : genId("goal"),
    name,
    icon: _selectedGoalIcon,
    color: _selectedGoalColor,
    targetAmount: pp(document.getElementById("gfTarget").value),
    currentAmount: pp(document.getElementById("gfCurrent").value),
    monthlyRate: pp(document.getElementById("gfRate").value),
    deadline: document.getElementById("gfDeadline").value,
    startDate: startDateVal,
    accountId: chosenAccountId,
  };

  if (!S.goals) S.goals = [];
  const isNew = _editGoalIdx === null;
  if (_editGoalIdx !== null) {
    S.goals[_editGoalIdx] = g;
    // Verknüpften Posten mitaktualisieren falls vorhanden
    const linked = S.data.find((p) => p.goalId === g.id);
    if (linked) {
      linked.amount = g.monthlyRate;
      linked.name = g.name;
      linked.accountId = chosenAccountId;
      linked.contractStart = startDateVal;
      linked.contractEnd = g.deadline || "";
    }
  } else {
    S.goals.push(g);
  }

  // Auto-create recurring Posten if rate > 0 and new goal
  if (isNew && g.monthlyRate > 0 && _goalCreatePosten) {
    S.data.push({
      id: genId("p"),
      name: g.name,
      type: "ausgabe",
      amount: g.monthlyRate,
      interval: "monatl.",
      due: String(getZahltag ? getZahltag() : 1),
      accountId: chosenAccountId,
      note: "Automatisch aus Sparziel erstellt",
      contractStart: startDateVal,
      contractEnd: g.deadline || "",
      goalId: g.id,
    });
  }

  persist();
  closeGoalModal();
  renderGoals();
  if (typeof refreshDash === "function") refreshDash();
  if (typeof showToast === "function")
    showToast(isNew ? `Ziel erstellt` : `Ziel gespeichert`, "success", 2400);
  if (_goalPct(g) >= 100) {
    setTimeout(() => showToast(`🎉 "${g.name}" zu 100% erreicht!`, "success", 5000), 400);
  }
}

function deleteGoal() {
  if (_editGoalIdx === null) return;
  const g = S.goals[_editGoalIdx];
  if (!g) return;
  appConfirm(`Ziel "${g.name}" wirklich löschen?`, {
    icon: "🗑️",
    title: "Ziel löschen",
    confirmLabel: "Löschen",
    confirmClass: "danger",
  }).then((ok) => {
    if (ok) _doDeleteGoal(_editGoalIdx);
  });
}
function _doDeleteGoal(idx) {
  const name = S.goals[idx]?.name || "Ziel";
  S.goals.splice(idx, 1);
  persist();
  closeGoalModal();
  renderGoals();
  if (typeof showToast === "function") showToast(`"${name}" gelöscht`, "info", 2400);
}

// ── DASHBOARD ZIELE-WIDGET ────────────
function renderGoalsWidget() {
  const el = document.getElementById("goalsWidget");
  if (!el) return;
  const goals = (S.goals || []).filter((g) => _goalPct(g) < 100).slice(0, 3);
  if (goals.length === 0) {
    el.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text3);font-size:.8em;">
      <div style="margin-bottom:8px;opacity:.3;display:flex;justify-content:center">${iconHtml("target", 26)}</div>Keine aktiven Ziele
    </div>`;
    return;
  }
  el.innerHTML = goals
    .map((g) => {
      const pct = _goalPct(g);
      return `<div class="goal-mini">
      <div class="goal-mini-top">
        <span style="display:inline-flex;align-items:center;gap:5px"><span style="color:${g.color || "#4d9eff"};display:inline-flex">${uiIcon(g.icon || "target", 14)}</span>${esc(g.name)}</span>
        <span style="color:${g.color || "#4d9eff"};font-family:var(--mono);font-size:.78em;">${pct}%</span>
      </div>
      <div class="goal-mini-track">
        <div class="goal-mini-fill" style="width:${pct}%;background:${g.color || "#4d9eff"}"></div>
      </div>
      <div class="goal-mini-vals">
        <span>${fm(g.currentAmount || 0)}</span>
        <span style="color:var(--text3)">${fm(g.targetAmount || 0)}</span>
      </div>
    </div>`;
    })
    .join("");
}
