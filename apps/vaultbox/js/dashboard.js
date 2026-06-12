let _dashBalView = "gesamt"; // "gesamt" | "haupt"

// ══════════════════════════════════════
//  DASHBOARD v3 — Cockpit · KPIs · Donut
//  Verlaufs-Chart entfernt
//  Donut krasser mit Balken-Legende
// ══════════════════════════════════════

let donutInst = null;
let _donutMode = "posten"; // "posten" | "category"
let _ccDetailOpen = null;

Chart.defaults.color = "#c8cdd8";
Chart.defaults.font.family = "'DM Mono',monospace";
Chart.defaults.font.size = 10;
Chart.defaults.plugins.tooltip.cornerRadius = 10;
Chart.defaults.plugins.tooltip.padding = 12;
Chart.defaults.plugins.tooltip.titleFont = { size: 11, weight: "700", family: "'Space Grotesk',sans-serif" };
Chart.defaults.plugins.tooltip.bodyFont = { size: 10 };
Chart.defaults.plugins.tooltip.displayColors = true;
Chart.defaults.plugins.tooltip.boxWidth = 8;
Chart.defaults.plugins.tooltip.boxHeight = 8;
Chart.defaults.plugins.legend.labels.boxWidth = 8;
Chart.defaults.plugins.legend.labels.boxHeight = 8;
Chart.defaults.plugins.legend.labels.borderRadius = 3;
Chart.defaults.plugins.legend.labels.useBorderRadius = true;
Chart.defaults.plugins.legend.labels.padding = 16;

function css(v) {
  return getComputedStyle(document.documentElement).getPropertyValue(v).trim();
}

// ── MAIN ENTRY ────────────────────────
function renderDashboard() {
  const d = document.getElementById("todayStr");
  if (d)
    d.textContent = today().toLocaleDateString("de-DE", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  renderAccounts();
  refreshDash();
  updateContractBadge();
}

function refreshDash() {
  renderKPIs();
  renderMonthInsights();
  renderCockpit();
  renderDonut();
  renderKatAuswertung();
  _checkBudgetWarning();
}

function _checkBudgetWarning() {
  const main = getMainAccount();
  const mainIncome = main && main.monthlyIncome > 0
    ? main.monthlyIncome
    : S.data.filter((p) => p.type === "einnahme").reduce((s, p) => s + avgMonthly(p), 0);
  if (mainIncome <= 0) return;

  const n = today();
  const mk = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`;
  const exp = (S.bookings || [])
    .filter(b => b.monthKey === mk && b.type === "ausgabe" && b.status !== "ausgesetzt")
    .reduce((s, b) => s + b.amount, 0);

  const pct = (exp / mainIncome) * 100;
  const sessionKey = `csf_budget_warn_${mk}`;

  if (pct >= 100 && !sessionStorage.getItem(sessionKey + "_100")) {
    sessionStorage.setItem(sessionKey + "_100", "1");
    showToast(`Budget überschritten — ${pct.toFixed(0)}% von ${fm(mainIncome)} verbraucht`, "error", 6000);
  } else if (pct >= 80 && !sessionStorage.getItem(sessionKey + "_80")) {
    sessionStorage.setItem(sessionKey + "_80", "1");
    showToast(`Budget-Warnung: ${pct.toFixed(0)}% von ${fm(mainIncome)} bereits verbraucht`, "warning", 5000);
  }
}

function setMonthlyIncome(val) {
  S.monthlyIncome = pp(val);
  persist();
  refreshDash();
}

// ══════════════════════════════════════
//  KPI ROW — 4 Karten
// ══════════════════════════════════════
function _dashEmptyState(containerId, icon, title, sub, btnLabel, btnFn) {
  const el = document.getElementById(containerId);
  if (!el) return;
  while (el.firstChild) el.removeChild(el.firstChild);
  const wrap = document.createElement("div"); wrap.className = "dash-empty-state";
  const ic = document.createElement("div"); ic.className = "dash-es-icon"; ic.textContent = icon;
  const t = document.createElement("div"); t.className = "dash-es-title"; t.textContent = title;
  const s = document.createElement("div"); s.className = "dash-es-sub"; s.textContent = sub;
  wrap.appendChild(ic); wrap.appendChild(t); wrap.appendChild(s);
  if (btnLabel && btnFn) {
    const btn = document.createElement("button"); btn.className = "btn primary";
    btn.textContent = btnLabel; btn.onclick = btnFn;
    wrap.appendChild(btn);
  }
  el.appendChild(wrap);
}

function renderKPIs() {
  if (!S.accounts || S.accounts.length === 0) {
    _dashEmptyState("kpiRow", "🏦", "Noch kein Konto angelegt",
      "Füge dein erstes Konto hinzu um das Dashboard zu aktivieren.",
      "Konto hinzufügen", () => openAccountModal());
    return;
  }
  let totalBal = 0;
  S.accounts.forEach((a) => { if (a.include) totalBal += a.balance; });

  const giroAccs = S.accounts.filter((a) => a.include && a.accountType === "girokonto");
  const giroBal = giroAccs.reduce((s, a) => s + (a.balance || 0), 0);
  const main = getMainAccount();

  const mainIncome =
    main && main.monthlyIncome > 0
      ? main.monthlyIncome
      : S.data.filter((p) => p.type === "einnahme").reduce((s, p) => s + avgMonthly(p), 0);

  let fixOut = 0;
  S.data.forEach((p) => { if (p.type === "ausgabe") fixOut += avgMonthly(p); });

  const sparquote = mainIncome > 0 ? Math.max(0, ((mainIncome - fixOut) / mainIncome) * 100) : 0;
  const sqRingColor = sparquote >= 20 ? "var(--green)" : sparquote >= 10 ? "var(--amber)" : "var(--red)";

  const cockpitD = buildMainAccountData();
  const verfügbar = cockpitD.verbleibend;
  const daysToZ = cockpitD.daysToZ;

  const investBal = S.accounts
    .filter((a) => a.include && ["depot", "invest", "etf", "vl", "festgeld"].includes(a.accountType))
    .reduce((s, a) => s + (a.balance || 0), 0);

  const now = today();
  const curM = now.getMonth(), curY = now.getFullYear();
  const prevM = curM === 0 ? 11 : curM - 1;
  const prevY = curM === 0 ? curY - 1 : curY;
  const curSum  = _monthSummary(curY, curM);
  const prevSum = _monthSummary(prevY, prevM);
  const expTrend = prevSum.expense > 0 ? ((curSum.expense - prevSum.expense) / prevSum.expense) * 100 : 0;
  const incTrend = prevSum.income > 0  ? ((curSum.income  - prevSum.income)  / prevSum.income)  * 100 : 0;

  // Month focus card calculations
  const MONTHS = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
  const monthLabel = MONTHS[curM] + " " + curY;
  const bilanz = curSum.income - curSum.expense;
  const bilanzColor = bilanz >= 0 ? "var(--green)" : "var(--red)";
  const spentPct = mainIncome > 0 ? Math.min(curSum.expense / mainIncome * 100, 100) : Math.min(curSum.expense / (curSum.income || 1) * 100, 100);
  const spentColor = spentPct >= 100 ? "var(--red)" : spentPct >= 80 ? "var(--amber)" : "var(--green)";
  const incPct = mainIncome > 0 ? Math.min(curSum.income / mainIncome * 100, 100) : 100;

  // Timeline
  const zahltag = getZahltag();
  const monthDays = new Date(curY, curM + 1, 0).getDate();
  const dayNow = now.getDate();
  const monthPct = monthDays > 1 ? Math.min((dayNow - 1) / (monthDays - 1) * 100, 100) : 100;
  const zahltPct = Math.min(zahltag / monthDays * 100, 97);

  // Status chips
  const allDueItems = _buildAllAccountItems(cockpitD.nextZahltag, cockpitD.mIdx, cockpitD.yr, cockpitD.day);
  const urgentCount = allDueItems.filter((i) => i.urgent).length;
  const problemChips = [];
  if (verfügbar < 0)
    problemChips.push({ cls: "danger", icon: "⚠", text: `Knapp: ${fm(verfügbar, true)}` });
  if (sparquote < 10 && mainIncome > 0)
    problemChips.push({ cls: "warn", icon: "▲", text: `Sparquote ${sparquote.toFixed(0)} %` });
  if (urgentCount > 0)
    problemChips.push({ cls: "warn", icon: "⚡", text: `${urgentCount} Zahlung${urgentCount > 1 ? "en" : ""} fällig` });
  const chips = problemChips.length === 0
    ? [{ cls: "ok", icon: "✓", text: "Alles im grünen Bereich" }]
    : problemChips;
  if (investBal > 0)
    chips.push({ cls: "ok", icon: "◎", text: `Invest: ${fmShort(investBal)} €` });

  // Sparquote ring (52px version)
  const rSq2 = 20, circSq2 = 2 * Math.PI * rSq2;
  const sqDash2 = Math.min(sparquote / 100, 1) * circSq2;
  const sqGap2  = circSq2 - sqDash2;

  document.getElementById("kpiRow").innerHTML = `
    <div class="dash-hero">

      <!-- MONAT IM FOKUS: Einnahmen vs. Ausgaben -->
      <div class="dh-month" onmouseenter="_showTooltip('Einnahmen und Ausgaben im ${esc(monthLabel)}',this)" onmouseleave="_hideTooltip()">
        <div class="dh-month-head">
          <span class="dh-label">${esc(monthLabel)}</span>
          <span class="dh-month-tag">Monat im Fokus</span>
        </div>
        <div class="dh-flows">
          <div class="dh-flow">
            <div class="dh-flow-top">
              <span class="dh-flow-lbl">Einnahmen</span>
            </div>
            <div class="dh-flow-val in">${fm(curSum.income)}</div>
            <div class="dh-flow-track"><div class="dh-flow-fill" style="width:${incPct.toFixed(1)}%;background:var(--green)"></div></div>
          </div>
          <div class="dh-flow">
            <div class="dh-flow-top">
              <span class="dh-flow-lbl">Ausgaben</span>
            </div>
            <div class="dh-flow-val out">${fm(-curSum.expense)}</div>
            <div class="dh-flow-track"><div class="dh-flow-fill" style="width:${spentPct.toFixed(1)}%;background:${spentColor}"></div></div>
          </div>
        </div>
        <div class="dh-bilanz">
          <span class="dh-bilanz-lbl">Bilanz</span>
          <span class="dh-bilanz-val" style="color:${bilanzColor}">${bilanz >= 0 ? "+" : ""}${fm(bilanz)}</span>
        </div>
      </div>

      <!-- VERFÜGBAR: bis Zahltag + Timeline -->
      <div class="dh-vf-sec" onmouseenter="_showTooltip('Kontostand minus alle geplanten Ausgaben bis zum Zahltag (${zahltag}.)',this)" onmouseleave="_hideTooltip()">
        <div class="dh-label">Verfügbar bis Zahltag</div>
        <div class="dh-vf-amount ${verfügbar >= 0 ? "pos" : "neg"}">${fm(verfügbar, true)}</div>
        <div class="dh-vf-days">${daysToZ === 0
          ? '<span style="color:var(--blue);font-weight:700">Zahltag ist heute!</span>'
          : `noch <strong>${daysToZ}</strong> Tag${daysToZ !== 1 ? "e" : ""}`}</div>
        <div class="dh-timeline-wrap">
          <div class="dh-timeline-track">
            <div class="dh-timeline-fill" style="width:${monthPct.toFixed(1)}%"></div>
            <div class="dh-timeline-marker" style="left:${zahltPct.toFixed(1)}%" onmouseenter="_showTooltip('Zahltag: ${zahltag}. des Monats',this)" onmouseleave="_hideTooltip()"></div>
            <div class="dh-timeline-thumb" style="left:${monthPct.toFixed(1)}%"></div>
          </div>
          <div class="dh-timeline-ends">
            <span>1.</span>
            <span>${monthDays}.</span>
          </div>
        </div>
      </div>

      <!-- GESAMTVERMÖGEN: sekundäre Kennzahl -->
      <div class="dh-main" onmouseenter="_showTooltip('Summe aller Konten mit aktiviertem Einschluss',this)" onmouseleave="_hideTooltip()">
        <div class="dh-label">Gesamtvermögen</div>
        <div class="dh-val">${fm(totalBal)}</div>
        <div class="dh-main-rows">
          <div class="dh-main-row">
            <span class="dh-main-row-lbl">Liquidität</span>
            <span class="dh-main-row-val ${giroBal >= 0 ? "blue" : "red"}">${fm(giroBal)}</span>
          </div>
          ${investBal > 0 ? `<div class="dh-main-row">
            <span class="dh-main-row-lbl">Invest</span>
            <span class="dh-main-row-val">${fm(investBal)}</span>
          </div>` : ""}
        </div>
        <div class="dh-trend">${_trendBadge(incTrend, false)}</div>
      </div>

      <!-- STATUS + SPARQUOTE -->
      <div class="dh-status">
        <div class="dh-sq-wrap" onmouseenter="_showTooltip('Sparquote: ≥ 20 % = gut · 10–20 % = ok · < 10 % = kritisch',this)" onmouseleave="_hideTooltip()">
          <svg width="52" height="52" viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="${rSq2}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="3.5"/>
            <circle cx="26" cy="26" r="${rSq2}" fill="none" stroke="${sqRingColor}" stroke-width="3.5"
              stroke-dasharray="${sqDash2.toFixed(2)} ${sqGap2.toFixed(2)}"
              stroke-dashoffset="${(circSq2 * 0.25).toFixed(2)}"
              stroke-linecap="round" style="transition:stroke-dasharray .8s cubic-bezier(.4,0,.2,1)"/>
            <text x="26" y="30" text-anchor="middle" font-size="10" font-weight="800"
              fill="${sqRingColor}" font-family="var(--mono)">${sparquote.toFixed(0)}%</text>
          </svg>
          <div class="dh-sq-lbl">Sparquote</div>
        </div>
        <div class="dh-chips">
          ${chips.map((c) => `<div class="dh-chip ${c.cls}">${c.icon} ${esc(c.text)}</div>`).join("")}
        </div>
      </div>
    </div>`;
}

// ══════════════════════════════════════
//  TREND — Monatlicher Vergleich
// ══════════════════════════════════════

/**
 * Berechnet Einnahmen/Ausgaben für einen Monat aus S.bookings.
 * Gibt { income, expense, balance } zurück.
 */
function _monthSummary(yr, mIdx) {
  const key = `${yr}-${String(mIdx + 1).padStart(2, "0")}`;
  let income = 0, expense = 0;
  (S.bookings || []).forEach((b) => {
    if (!b.monthKey || !b.monthKey.startsWith(key)) return;
    if (b.status === "ausgesetzt") return;
    const amt = parseFloat(b.amount) || 0;
    if (b.type === "einnahme") income += amt;
    else if (b.type === "ausgabe") expense += amt;
  });
  return { income, expense, balance: income - expense };
}

/**
 * Gibt einen Trend-Badge HTML-String zurück.
 * pct: prozentuale Veränderung (positiv = gut bei income, schlecht bei expense)
 * inverse: true wenn höher = schlechter (z.B. Ausgaben)
 */
function _trendBadge(pct, inverse = false) {
  if (!isFinite(pct) || Math.abs(pct) < 0.5) {
    return `<span class="kpi3-trend neutral">± 0%</span>`;
  }
  const isPositive = inverse ? pct < 0 : pct > 0;
  const arrow = pct > 0 ? "▲" : "▼";
  const cls = isPositive ? "up" : "down";
  return `<span class="kpi3-trend ${cls}">${arrow} ${Math.abs(pct).toFixed(1)}%</span>`;
}

// ══════════════════════════════════════
//  COCKPIT DATA BUILDERS
// ══════════════════════════════════════
function buildMainAccountData() {
  const n = today();
  const day = n.getDate(),
    mIdx = n.getMonth(),
    yr = n.getFullYear();
  const zahltag = getZahltag();
  const main = getMainAccount();

  let nextZahltag, daysToZ;
  if (day <= zahltag) {
    // Zahltag heute oder noch nicht erreicht — Fenster bleibt in diesem Monat
    nextZahltag = new Date(yr, mIdx, zahltag);
    daysToZ = zahltag - day; // 0 wenn heute = Zahltag
  } else {
    const nm = (mIdx + 1) % 12,
      ny = mIdx === 11 ? yr + 1 : yr;
    nextZahltag = new Date(ny, nm, zahltag);
    daysToZ = Math.round((nextZahltag - n) / 86400000);
  }

  const items = [],
    seen = new Set(),
    mCheck = [mIdx];
  if (nextZahltag.getMonth() !== mIdx || nextZahltag.getFullYear() !== yr)
    mCheck.push(nextZahltag.getMonth());

  mCheck.forEach((cm) => {
    const cy = cm < mIdx ? yr + 1 : yr;
    S.data.forEach((p) => {
      if (p.type !== "ausgabe") return;
      if (!activeInMonth(p, cm)) return;
      if (main && p.accountId !== main.id) return;
      const dd = parseInt(p.due) || 0;
      if (dd < 1) return;
      const amt = parseFloat(p.amount) || 0;
      if (amt <= 0) return;
      const mk = `${cy}-${String(cm + 1).padStart(2, "0")}`;
      const dObj = new Date(cy, cm, dd);
      if (dObj >= new Date(yr, mIdx, day) && dObj <= nextZahltag) {
        const key = p.id + "_" + dd + "_" + cm;
        if (seen.has(key)) return;
        const alreadyProcessed = (S.bookings || []).some(
          (b) =>
            b.postenId === p.id &&
            (b.originalMonthKey === mk || b.monthKey === mk) &&
            (b.status === "beglichen" || b.status === "gebucht"),
        );
        if (alreadyProcessed) return;
        seen.add(key);
        items.push({
          name: p.name,
          due: dd,
          dueMo: cm,
          amt,
          postenId: p.id,
          monthKey: mk,
          isNxt: cm !== mIdx,
          urgent: cm === mIdx && dd - day <= 2 && dd > day,
          dueToday: cm === mIdx && dd === day,
        });
      }
    });
  });
  items.sort((a, b) =>
    a.dueMo !== b.dueMo ? a.dueMo - b.dueMo : a.due - b.due,
  );

  const totalFix = items.reduce((s, i) => s + i.amt, 0);
  const mainBal = main ? main.balance : 0;
  const verbleibend = mainBal - totalFix;
  const pct = Math.min(Math.max(((30 - daysToZ) / 30) * 100, 2), 98);
  return {
    n,
    day,
    mIdx,
    yr,
    zahltag,
    nextZahltag,
    daysToZ,
    main,
    items,
    totalFix,
    mainBal,
    verbleibend,
    pct,
  };
}

function buildCreditCardData(acc) {
  const n = today();
  const day = n.getDate(),
    mIdx = n.getMonth(),
    yr = n.getFullYear();
  const billingType = acc.billingType || "stichtag";
  const billingDay = acc.billingDay || 25;

  if (billingType === "prepaid" || billingType === "direkt") {
    return {
      acc,
      billingType,
      items: [],
      totalItems: 0,
      bal: acc.balance,
      saldo: acc.balance,
      nextBilling: null,
      daysToB: 0,
      pct: 100,
    };
  }

  let nextBilling, daysToB;
  if (day <= billingDay) {
    // Abrechnungstag heute oder noch nicht erreicht
    nextBilling = new Date(yr, mIdx, billingDay);
    daysToB = billingDay - day; // 0 wenn heute = Abrechnungstag
  } else {
    const nm = (mIdx + 1) % 12,
      ny = mIdx === 11 ? yr + 1 : yr;
    nextBilling = new Date(ny, nm, billingDay);
    daysToB = Math.round((nextBilling - n) / 86400000);
  }
  const pct = Math.min(Math.max(((30 - daysToB) / 30) * 100, 2), 98);

  const items = [],
    seen = new Set(),
    mCheck = [mIdx];
  if (nextBilling.getMonth() !== mIdx) mCheck.push(nextBilling.getMonth());

  mCheck.forEach((cm) => {
    const cy = cm < mIdx ? yr + 1 : yr;
    S.data.forEach((p) => {
      if (p.type !== "ausgabe") return;
      if (!activeInMonth(p, cm)) return;
      if (p.accountId !== acc.id) return;
      const dd = parseInt(p.due) || 0;
      if (dd < 1) return;
      const amt = parseFloat(p.amount) || 0;
      if (amt <= 0) return;
      const dObj = new Date(cy, cm, dd);
      if (dObj >= new Date(yr, mIdx, day) && dObj <= nextBilling) {
        const key = p.id + "_" + dd + "_" + cm;
        if (seen.has(key)) return;
        const mk = `${cy}-${String(cm + 1).padStart(2, "0")}`;
        const alreadyProcessed = (S.bookings || []).some(
          (b) => b.postenId === p.id &&
            (b.originalMonthKey === mk || b.monthKey === mk) &&
            (b.status === "beglichen" || b.status === "gebucht"),
        );
        if (alreadyProcessed) return;
        seen.add(key);
        items.push({
          postenId: p.id,
          monthKey: mk,
          name: p.name,
          due: dd,
          dueMo: cm,
          amt,
          isNxt: cm !== mIdx,
          urgent: cm === mIdx && dd - day <= 2 && dd > day,
          dueToday: cm === mIdx && dd === day,
        });
      }
    });
  });
  items.sort((a, b) =>
    a.dueMo !== b.dueMo ? a.dueMo - b.dueMo : a.due - b.due,
  );

  const totalItems = items.reduce((s, i) => s + i.amt, 0);
  const bal = acc.balance,
    saldo = bal - totalItems;
  return {
    acc,
    billingType,
    billingDay,
    items,
    totalItems,
    bal,
    saldo,
    nextBilling,
    daysToB,
    pct,
  };
}

function _buildAllAccountItems(nextZahltag, mIdx, yr, day) {
  const items = [],
    seen = new Set(),
    mCheck = [mIdx];
  if (nextZahltag.getMonth() !== mIdx || nextZahltag.getFullYear() !== yr)
    mCheck.push(nextZahltag.getMonth());

  mCheck.forEach((cm) => {
    const cy = cm < mIdx ? yr + 1 : yr;
    S.data.forEach((p) => {
      if (p.type !== "ausgabe") return;
      if (!activeInMonth(p, cm)) return;
      const dd = parseInt(p.due) || 0;
      if (dd < 1) return;
      const amt = parseFloat(p.amount) || 0;
      if (amt <= 0) return;

      // Kreditkarten-Posten nur mitzählen wenn deren Abrechnungstag
      // vor dem nächsten Zahltag liegt — sonst trifft die Rechnung
      // erst nach dem Gehaltseingang und ist kein aktuelles Risiko.
      if (p.accountId) {
        const pacc = (S.accounts || []).find((a) => a.id === p.accountId);
        if (
          pacc &&
          pacc.accountType === "kreditkarte" &&
          pacc.billingType !== "prepaid" &&
          pacc.billingType !== "direkt"
        ) {
          const bd = pacc.billingDay || 25;
          const nextBilling =
            day < bd
              ? new Date(yr, mIdx, bd)
              : new Date(
                  mIdx === 11 ? yr + 1 : yr,
                  (mIdx + 1) % 12,
                  bd,
                );
          if (nextBilling >= nextZahltag) return;
        }
      }

      const dObj = new Date(cy, cm, dd);
      if (dObj >= new Date(yr, mIdx, day) && dObj <= nextZahltag) {
        const key = p.id + "_" + dd + "_" + cm;
        if (seen.has(key)) return;
        const mk = `${cy}-${String(cm + 1).padStart(2, "0")}`;
        const alreadyProcessed = (S.bookings || []).some(
          (b) =>
            b.postenId === p.id &&
            (b.originalMonthKey === mk || b.monthKey === mk) &&
            (b.status === "beglichen" || b.status === "gebucht"),
        );
        if (alreadyProcessed) return;
        seen.add(key);
        items.push({
          name: p.name,
          due: dd,
          dueMo: cm,
          amt,
          accountId: p.accountId,
          postenId: p.id,
          monthKey: mk,
          isNxt: cm !== mIdx,
          urgent: cm === mIdx && dd - day <= 2 && dd > day,
          dueToday: cm === mIdx && dd === day,
        });
      }
    });
  });
  items.sort((a, b) =>
    a.dueMo !== b.dueMo ? a.dueMo - b.dueMo : a.due - b.due,
  );
  return items;
}

// ══════════════════════════════════════
//  COCKPIT — Zahlungsübersicht
// ══════════════════════════════════════
function renderCockpit() {
  const d = buildMainAccountData();
  const ccs = getCreditCards();
  const zahltag = getZahltag();

  document.getElementById("cockpitSub").textContent = d.daysToZ === 0
    ? `Heute ${d.day}. ${MONTHS[d.mIdx]} · Zahltag ist heute`
    : `Heute ${d.day}. ${MONTHS[d.mIdx]} · Zahltag in ${d.daysToZ} Tagen`;
  document.getElementById("cockpitTag").textContent = d.daysToZ === 0
    ? `Zahltag: ${zahltag}. ${MONTHS_S[d.mIdx]}`
    : `${d.day}. → ${zahltag}. ${MONTHS_S[d.nextZahltag.getMonth()]}`;

  const makeItems = (items) =>
    items.length === 0
      ? `<div class="due-empty">✓ ${d.daysToZ === 0 ? "Keine offenen Abbuchungen heute" : `Keine weiteren Abbuchungen bis zum ${zahltag}. ${MONTHS_S[d.nextZahltag.getMonth()]}`}</div>`
      : items
          .map(
            (i) => `
        <div class="due-row${i.isNxt ? " next-m" : ""}${i.urgent ? " urgent" : ""}${i.dueToday ? " due-today" : ""}">
          <div class="due-row-l">
            <span class="due-day-pill">${i.dueToday ? "Heute" : `${i.due}.${i.isNxt ? " " + MONTHS_S[i.dueMo] : ""}`}</span>
            <span class="due-name">${esc(i.name)}</span>
          </div>
          <div class="due-row-r">
            <span class="due-amt">−${fm(i.amt)}</span>
            ${i.postenId ? `<button class="due-paid-btn" onclick="_dashMarkPaid('${i.postenId}','${i.monthKey}')" onmouseenter="_showTooltip('Als bezahlt markieren', this)" onmouseleave="_hideTooltip()">✓</button>` : ""}
          </div>
        </div>`,
          )
          .join("");

  // ── Saldo-Block ──
  let saldiHtml = "";
  if (_dashBalView === "gesamt") {
    let totBal = 0;
    S.accounts.forEach((a) => {
      if (a.include) totBal += a.balance;
    });
    const liqTypes = [
      "girokonto",
      "tagesgeld",
      "sparkonto",
      "festgeld",
      "sonstiges",
    ];
    let liq = 0;
    S.accounts.forEach((a) => {
      if (!a.include) return;
      if (liqTypes.includes(a.accountType)) liq += a.balance;
      // Kreditkarten bewusst nicht in Liquidität — werden separat verwaltet
    });
    const allItems = _buildAllAccountItems(d.nextZahltag, d.mIdx, d.yr, d.day);
    const allFix = allItems.reduce((s, i) => s + i.amt, 0);
    const frei = liq - allFix;
    saldiHtml = `
      <div class="ckt-saldi">
        <div class="ckt-saldi-row"><span>Alle Konten</span><span style="color:var(--blue)">${fm(totBal)}</span></div>
        <div class="ckt-saldi-row"><span>Liquidität</span><span style="color:${liq >= 0 ? "var(--text2)" : "var(--red)"}">${fm(liq)}</span></div>
        <div class="ckt-saldi-row"><span>Offene Posten</span><span style="color:var(--red)">−${fm(allFix)}</span></div>
        <div class="ckt-saldi-row ckt-saldi-total">
          <span>Verfügbar gesamt</span>
          <span style="color:${frei >= 0 ? "var(--green)" : "var(--red)"}">${fm(frei, true)}</span>
        </div>
      </div>`;
  } else {
    saldiHtml = `
      <div class="ckt-saldi">
        <div class="ckt-saldi-row"><span>${d.main ? esc(d.main.label) : "Giro"}-Stand</span><span style="color:var(--blue)">${fm(d.mainBal)}</span></div>
        <div class="ckt-saldi-row"><span>Noch fällig</span><span style="color:var(--red)">−${fm(d.totalFix)}</span></div>
        <div class="ckt-saldi-row ckt-saldi-total">
          <span>Verbleibend</span>
          <span style="color:${d.verbleibend >= 0 ? "var(--green)" : "var(--red)"}">${fm(d.verbleibend, true)}</span>
        </div>
      </div>`;
  }

  // ── Timeline-Balken ──
  const timelineHtml = `
    <div class="ckt-timeline">
      <div class="ckt-tl-bar">
        <div class="ckt-tl-fill" style="width:${d.pct}%"></div>
        <div class="ckt-tl-cursor" style="left:${d.pct}%"></div>
      </div>
      <div class="ckt-tl-labels">
        <span>${zahltag}. ${MONTHS_S[d.mIdx === 0 ? 11 : d.mIdx - 1]}</span>
        <span class="ckt-tl-today">${d.day}. ${MONTHS_S[d.mIdx]}</span>
        <span style="color:var(--blue)">${zahltag}. ${MONTHS_S[d.nextZahltag.getMonth()]}</span>
      </div>
    </div>`;

  // ── Hauptkonto-Spalte ──
  const mainCol = `
    <div class="ckt-col ckt-col-main">
      <div class="ckt-col-header">
        <div class="ckt-col-title">
          <span class="ckt-acc-dot" style="background:${d.main?.color || "var(--blue)"}"></span>
          <span>${d.main ? esc(d.main.label) : "Hauptkonto"}</span>
        </div>
        <div class="ckt-bal-toggle">
          <button class="ckt-toggle-btn${_dashBalView === "gesamt" ? " active" : ""}" onclick="_dashBalView='gesamt';renderCockpit()">Gesamt</button>
          <button class="ckt-toggle-btn${_dashBalView === "haupt" ? " active" : ""}" onclick="_dashBalView='haupt';renderCockpit()">Haupt</button>
        </div>
      </div>
      ${timelineHtml}
      ${saldiHtml}
      <div class="ckt-due-title">Nächste Abbuchungen</div>
      <div class="due-list">${
        _dashBalView === "gesamt"
          ? makeItems(_buildAllAccountItems(d.nextZahltag, d.mIdx, d.yr, d.day))
          : makeItems(d.items)
      }</div>
    </div>`;

  // ── Kreditkarten-Spalte ──
  let ccHtml = "";
  if (ccs.length === 0) {
    ccHtml = `<div class="ckt-col ckt-col-cc">
      <div class="ckt-col-header"><div class="ckt-col-title">Kreditkarten</div></div>
      <div class="ckt-cc-empty">Keine Kreditkartenkonten angelegt</div>
    </div>`;
  } else if (ccs.length === 1) {
    ccHtml = _renderCCCol(buildCreditCardData(ccs[0]), makeItems);
  } else {
    ccHtml = _renderCCMulti(ccs, makeItems);
  }

  document.getElementById("cockpitCols").innerHTML = mainCol + ccHtml;
}

function _renderCCCol(d, makeItems) {
  const typeLabel =
    { stichtag: "Stichtag", direkt: "Direkt", prepaid: "Prepaid" }[
      d.billingType
    ] || "—";

  if (d.billingType === "prepaid" || d.billingType === "direkt") {
    return `<div class="ckt-col">
      <div class="ckt-col-header">
        <div class="ckt-col-title">
          <span class="ckt-acc-dot" style="background:${d.acc.color}"></span>
          <span>${esc(d.acc.label)}</span>
          <span class="ckt-cc-badge">${typeLabel}</span>
        </div>
      </div>
      <div class="ckt-saldi">
        <div class="ckt-saldi-row ckt-saldi-total"><span>Guthaben</span><span style="color:var(--green)">${fm(d.bal, true)}</span></div>
      </div>
      <div class="due-empty">Direkt / Prepaid — keine offenen Posten</div>
    </div>`;
  }

  return `<div class="ckt-col">
    <div class="ckt-col-header">
      <div class="ckt-col-title">
        <span class="ckt-acc-dot" style="background:${d.acc.color}"></span>
        <span>${esc(d.acc.label)}</span>
        <span class="ckt-cc-badge">${typeLabel}</span>
      </div>
    </div>
    <div class="ckt-timeline">
      <div class="ckt-tl-bar" style="--fill-color:${d.acc.color}">
        <div class="ckt-tl-fill" style="width:${d.pct}%;background:${d.acc.color}"></div>
      </div>
      <div class="ckt-tl-labels">
        <span>1. ${MONTHS_S[d.nextBilling.getMonth() === 0 ? 11 : d.nextBilling.getMonth() - 1]}</span>
        <span style="color:${d.acc.color}">${d.billingDay}. ${MONTHS_S[d.nextBilling.getMonth()]} · ${d.daysToB}d</span>
      </div>
    </div>
    <div class="ckt-saldi">
      <div class="ckt-saldi-row"><span>Kartenstand</span><span style="color:${d.acc.color}">${fm(d.bal)}</span></div>
      <div class="ckt-saldi-row"><span>Offene Buchungen</span><span style="color:var(--red)">−${fm(d.totalItems)}</span></div>
      <div class="ckt-saldi-row ckt-saldi-total"><span>Saldo</span><span style="color:${d.saldo >= 0 ? "var(--green)" : "var(--red)"}">${fm(d.saldo, true)}</span></div>
    </div>
    <div class="ckt-due-title">Offene Posten bis Stichtag</div>
    <div class="due-list">${makeItems(d.items)}</div>
  </div>`;
}

function _renderCCMulti(ccs, makeItems) {
  const summaries = ccs.map((c) => buildCreditCardData(c));
  const totalBal = summaries.reduce((s, d) => s + d.bal, 0);
  const totalOpen = summaries.reduce((s, d) => s + d.totalItems, 0);

  return `<div class="ckt-col">
    <div class="ckt-col-header">
      <div class="ckt-col-title">Kreditkarten <span class="ckt-cc-badge">${ccs.length} Karten</span></div>
    </div>
    <div class="ckt-saldi">
      <div class="ckt-saldi-row"><span>Gesamtsaldo</span><span style="color:${totalBal >= 0 ? "var(--green)" : "var(--amber)"}">${fm(totalBal, true)}</span></div>
      <div class="ckt-saldi-row"><span>Offene Buchungen</span><span style="color:var(--red)">−${fm(totalOpen)}</span></div>
    </div>
    <div class="ckt-cc-accordion">
      ${summaries
        .map(
          (d) => `
        <div class="ckt-cc-row" onclick="_ccDetailOpen=_ccDetailOpen==='${d.acc.id}'?null:'${d.acc.id}';renderCockpit()">
          <div class="ckt-cc-row-l">
            <span class="ckt-acc-dot" style="background:${d.acc.color}"></span>
            <span class="ckt-cc-name">${esc(d.acc.label)}</span>
            <span class="ckt-cc-badge">${{ stichtag: "Stichtag", direkt: "Direkt", prepaid: "Prepaid" }[d.billingType] || "—"}</span>
          </div>
          <span style="font-family:var(--mono);font-size:.8em;color:${d.bal >= 0 ? "var(--green)" : "var(--amber)"}">${fm(d.bal, true)}</span>
          <svg class="ckt-chevron${_ccDetailOpen === d.acc.id ? " open" : ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
        ${_ccDetailOpen === d.acc.id ? `<div class="ckt-cc-detail">${_ccDetailInner(d, makeItems)}</div>` : ""}
      `,
        )
        .join("")}
    </div>
  </div>`;
}

function _ccDetailInner(d, makeItems) {
  if (d.billingType === "prepaid" || d.billingType === "direkt") {
    return `<div class="ckt-saldi-row"><span>Stand</span><span>${fm(d.bal, true)}</span></div>`;
  }
  return `
    <div class="ckt-timeline" style="margin:8px 0;">
      <div class="ckt-tl-bar"><div class="ckt-tl-fill" style="width:${d.pct}%;background:${d.acc.color}"></div></div>
      <div class="ckt-tl-labels"><span>Abr. ${d.billingDay}. ${MONTHS_S[d.nextBilling.getMonth()]}</span><span style="color:${d.acc.color}">${d.daysToB}d</span></div>
    </div>
    <div class="ckt-saldi">
      <div class="ckt-saldi-row"><span>Offene Buchungen</span><span style="color:var(--red)">−${fm(d.totalItems)}</span></div>
      <div class="ckt-saldi-row ckt-saldi-total"><span>Saldo</span><span style="color:${d.saldo >= 0 ? "var(--green)" : "var(--red)"}">${fm(d.saldo, true)}</span></div>
    </div>
    <div class="due-list" style="margin-top:6px;">${makeItems(d.items)}</div>`;
}

function toggleCCDetail(accId) {
  _ccDetailOpen = _ccDetailOpen === accId ? null : accId;
  renderCockpit();
}

// ── DASHBOARD: Als bezahlt markieren ──
function _dashMarkPaid(postenId, monthKey) {
  const bk = (S.bookings || []).find(
    (b) =>
      b.postenId === postenId &&
      (b.originalMonthKey === monthKey || b.monthKey === monthKey) &&
      b.status !== "beglichen",
  );
  const nowStr  = new Date().toISOString();
  const todayDt = nowStr.slice(0, 10);
  if (bk) {
    bk.originalMonthKey = bk.originalMonthKey || bk.monthKey;
    // Frühzahlung (Fälligkeit in der Zukunft) → Datum auf heute setzen
    // Nachträgliche Bestätigung (Fälligkeit vergangen) → Originaldatum behalten
    const paidEarly = bk.date > todayDt;
    if (paidEarly) {
      bk.date     = todayDt;
      bk.monthKey = todayDt.slice(0, 7);
    }
    bk.status    = "beglichen";
    bk.settledAt = nowStr;
    // Override auf Verpflichtungsmonat → Pivot erkennt Zahlung
    if (bk.postenId) {
      const p = (S.data || []).find((d) => d.id === bk.postenId);
      if (p) {
        if (!p.overrides) p.overrides = {};
        p.overrides[bk.originalMonthKey] = {
          amount:    bk.amount,
          status:    "beglichen",
          note:      bk.note || "",
          settledAt: nowStr,
          paidDate:  bk.date,
        };
      }
    }
    persist();
    if (typeof _afterSaveBooking === "function") _afterSaveBooking();
    return;
  } else {
    // Kein Booking vorhanden → direkt anlegen mit originalem Fälligkeitsdatum
    const p = (S.data || []).find((d) => d.id === postenId);
    if (!p) return;
    // Datum aus monthKey + due-Tag des Postens ableiten
    const dueDay = String(parseInt(p.due) || 1).padStart(2, "0");
    const newBk = {
      id: "bk_" + Date.now(),
      postenId,
      name: p.name,
      amount: p.amount,
      baseAmount: p.amount,
      type: p.type,
      interval: p.interval,
      accountId: p.accountId,
      date: `${monthKey}-${dueDay}`,
      monthKey,
      originalMonthKey: monthKey,
      status: "beglichen",
      settledAt: nowStr,
    };
    if (!S.bookings) S.bookings = [];
    S.bookings.push(newBk);
    persist();
    if (typeof _afterSaveBooking === "function") _afterSaveBooking();
    else refreshDash();
  }
}

// ══════════════════════════════════════
//  DONUT — Ausgaben-Analyse (KRASSER)
// ══════════════════════════════════════
function renderDonut() {
  // Sync toggle button state
  const btnP = document.getElementById("donutBtnPosten");
  const btnK = document.getElementById("donutBtnKat");
  if (btnP) btnP.classList.toggle("active", _donutMode !== "category");
  if (btnK) btnK.classList.toggle("active", _donutMode === "category");

  const rawCats = {};
  const _donutCatIds = {}; // label → categoryId (nur für category-Modus)
  if (_donutMode === "category") {
    // Gruppiere nach Kategorie
    const allCats = Array.isArray(S.categories) && S.categories.length
      ? S.categories
      : (typeof DEFAULT_CATEGORIES !== "undefined" ? DEFAULT_CATEGORIES : []);
    S.data.forEach((p) => {
      if (p.type !== "ausgabe") return;
      const v = avgMonthly(p);
      if (v <= 0) return;
      const cat = allCats.find((c) => c.id === p.categoryId);
      const label = cat ? (cat.icon + " " + cat.name) : "📦 Sonstiges";
      rawCats[label] = (rawCats[label] || 0) + v;
      if (cat && !_donutCatIds[label]) _donutCatIds[label] = cat.id;
    });
  } else {
    S.data.forEach((p) => {
      if (p.type !== "ausgabe") return;
      const v = avgMonthly(p);
      if (v <= 0) return;
      rawCats[p.name] = (rawCats[p.name] || 0) + v;
    });
  }
  const entries = Object.entries(rawCats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const total = entries.reduce((s, [, v]) => s + v, 0);

  const totalEl = document.getElementById("donutTotal");
  if (totalEl) totalEl.textContent = fmShort(total) + " €";

  if (donutInst) {
    donutInst.destroy();
    donutInst = null;
  }

  const legendEl = document.getElementById("donutLegend");
  if (!entries.length) {
    if (legendEl)
      legendEl.innerHTML =
        '<div class="donut-empty">Keine Ausgaben erfasst</div>';
    return;
  }

  const colors = getDonutColors();
  const panel2 = css("--panel2") || "#1d2235";
  const border2 = css("--border2") || "#252d42";
  const textCol = css("--text") || "#e4e8f5";

  donutInst = new Chart(
    document.getElementById("donutChart").getContext("2d"),
    {
      type: "doughnut",
      data: {
        labels: entries.map(([k]) => k),
        datasets: [
          {
            data: entries.map(([, v]) => parseFloat(v.toFixed(2))),
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: panel2,
            hoverOffset: 10,
            hoverBorderWidth: 0,
            hoverBackgroundColor: colors.map((c) => c.replace(/[\d.]+\)$/, "1)")),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "72%",
        animation: { duration: 900, easing: "easeInOutQuart" },
        onClick: (evt, elements) => {
          if (!elements.length) return;
          const idx = elements[0].index;
          const label = entries[idx]?.[0];
          if (!label) return;
          const catId = _donutCatIds[label];
          if (catId) _umFilter.categoryId = catId;
          _navTo("posten");
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: panel2,
            borderColor: border2,
            borderWidth: 1,
            padding: 12,
            titleColor: textCol,
            titleFont: { size: 11, weight: "700" },
            bodyColor: css("--text2") || "#8892aa",
            callbacks: {
              label: (ctx) => {
                const pct = ((ctx.raw / total) * 100).toFixed(1);
                return `  ${fm(ctx.raw)}  (${pct}%)`;
              },
            },
          },
        },
      },
    },
  );

  // Legende als horizontale Fortschrittsbalken
  if (legendEl) {
    legendEl.innerHTML = entries
      .map(([k, v], i) => {
        const pct = ((v / total) * 100).toFixed(1);
        const barW = Math.round((v / entries[0][1]) * 100); // relativ zur größten Kategorie
        return `
        <div class="donut-bar-item" style="cursor:pointer" onmouseenter="_showTooltip('In Transaktionen anzeigen', this)" onmouseleave="_hideTooltip()" onclick="_donutNavToCategory('${esc(k)}')">
          <div class="donut-bar-head">
            <div class="donut-bar-l">
              <span class="donut-bar-dot" style="background:${colors[i]}"></span>
              <span class="donut-bar-name" title="${esc(k)}">${esc(k.length > 22 ? k.slice(0, 20) + "…" : k)}</span>
            </div>
            <div class="donut-bar-r">
              <span class="donut-bar-val">${fmShort(v)}</span>
              <span class="donut-bar-pct">${pct}%</span>
            </div>
          </div>
          <div class="donut-bar-track">
            <div class="donut-bar-fill" style="width:${barW}%;background:${colors[i]};transition:width .8s ${i * 0.05}s cubic-bezier(.22,1,.36,1)"></div>
          </div>
        </div>`;
      })
      .join("");
  }
}

// ── STUB: renderBarChart bleibt als no-op damit andere Aufrufer nicht crashen
function renderBarChart() {}

// Donut-Legende: Klick → Transaktionen mit Kategorie-Filter
function _donutNavToCategory(label) {
  const allCats = Array.isArray(S.categories) && S.categories.length
    ? S.categories
    : (typeof DEFAULT_CATEGORIES !== "undefined" ? DEFAULT_CATEGORIES : []);
  const cat = allCats.find(c => (c.icon + " " + c.name) === label);
  if (cat) _umFilter.categoryId = cat.id;
  _navTo("posten");
}

// ══════════════════════════════════════
//  MONATS-INSIGHTS — Cashflow + Budget + Jahreskosten
// ══════════════════════════════════════
let _miChartInst = null;
let _miViewM = null; // null = aktueller Monat
let _miViewY = null;

function _miNavMonth(dir) {
  const now = today();
  let m = _miViewM !== null ? _miViewM : now.getMonth();
  let y = _miViewY !== null ? _miViewY : now.getFullYear();
  m += dir;
  if (m < 0)  { m = 11; y--; }
  if (m > 11) { m = 0;  y++; }
  // Nicht in die Zukunft navigieren
  const nowM = now.getMonth(), nowY = now.getFullYear();
  if (y > nowY || (y === nowY && m > nowM)) { m = nowM; y = nowY; }
  _miViewM = m; _miViewY = y;
  renderMonthInsights();
}

function _miResetToday() {
  _miViewM = null; _miViewY = null;
  renderMonthInsights();
}

function _renderBudgetPromo(cur, mainIncome, spentPct) {
  const tips = [
    { icon: "💡", text: "Spare mindestens 10% deines Einkommens automatisch per Dauerauftrag.", action: null },
    { icon: "📊", text: "Mit der Jahresübersicht erkennst du saisonale Ausgabenmuster auf einen Blick.", action: "_navTo('jahr')" },
    { icon: "🎯", text: "Sparziele helfen dir, große Anschaffungen strukturiert zu planen.", action: "_navTo('goals')" },
    { icon: "📋", text: "Verträge und Abos in der Vertragsverwaltung — dort siehst du deine Jahreskosten.", action: "_navTo('vertraege')" },
    { icon: "🔒", text: "Aktiviere den Passwortschutz unter Einstellungen, um deine Finanzdaten zu sichern.", action: "_navTo('settings')" },
  ];

  let tipIdx = 0;
  if (spentPct > 90) tipIdx = 0;
  else if (spentPct > 70) tipIdx = 1;
  else {
    const n = today();
    tipIdx = (n.getDate() + n.getMonth()) % tips.length;
  }
  const tip = tips[tipIdx];

  const savingsRate = mainIncome > 0 ? Math.max(0, ((mainIncome - cur.expense) / mainIncome) * 100) : 0;
  const rateColor = savingsRate >= 20 ? "var(--green)" : savingsRate >= 10 ? "var(--amber)" : "var(--red)";
  const rateLabel = savingsRate >= 20 ? "Sehr gut" : savingsRate >= 10 ? "Gut" : "Zu niedrig";

  return `<div class="mi-budget-promo">
    <div class="mi-promo-rate">
      <span class="mi-promo-rate-lbl">Sparquote diesen Monat</span>
      <span class="mi-promo-rate-val" style="color:${rateColor}">${savingsRate.toFixed(1)}%</span>
      <span class="mi-promo-rate-badge" style="background:${rateColor}20;color:${rateColor}">${rateLabel}</span>
    </div>
    <div class="mi-promo-tip"${tip.action ? ` onclick="${tip.action}" style="cursor:pointer"` : ""}>
      <span class="mi-promo-tip-icon">${tip.icon}</span>
      <span class="mi-promo-tip-text">${tip.text}</span>
      ${tip.action ? `<span class="mi-promo-tip-arrow">→</span>` : ""}
    </div>
    ${localStorage.getItem("csf_promo_hidden") ? "" : `
    <div class="mi-promo-brand">
      <div class="mi-promo-brand-glow"></div>
      <button class="mi-promo-brand-close" onclick="_hideBudgetPromo()" onmouseenter="_showTooltip('Werbung ausblenden',this)" onmouseleave="_hideTooltip()">✕</button>
      <div class="mi-promo-brand-inner">
        <div class="mi-promo-brand-head">
          <span style="font-size:20px;line-height:1" class="mi-promo-brand-img">🔐</span>
          <div>
            <div class="mi-promo-brand-name">Vault<span style="color:var(--blue)">Box</span></div>
            <div class="mi-promo-brand-sub">v1.0 · 2026</div>
          </div>
        </div>
        <div class="mi-promo-brand-title">Offline. Privat. Dein Vermögen.</div>
        <div class="mi-promo-brand-body">Alle Daten lokal. Kein Server, kein Abo, kein Tracking. 149€ einmalig.</div>
        <div class="mi-promo-brand-tags">
          <span>100% Offline</span><span>FIFO Engine</span><span>Lizenziert</span>
        </div>
      </div>
    </div>`}
  </div>`;
}

function _hideBudgetPromo() {
  localStorage.setItem("csf_promo_hidden", "1");
  renderMonthInsights();
}

function renderMonthInsights() {
  const el = document.getElementById("monthInsights");
  if (!el) return;

  const now = today();
  const realM = now.getMonth(), realY = now.getFullYear();
  const curM = _miViewM !== null ? _miViewM : realM;
  const curY = _miViewY !== null ? _miViewY : realY;
  const isCurrentMonth = curM === realM && curY === realY;

  // ── 6-Monats-Daten ──
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const mIdx = ((curM - i) % 12 + 12) % 12;
    const yr   = curM - i < 0 ? curY - 1 : curY;
    months.push({ mIdx, yr, key: `${yr}-${String(mIdx + 1).padStart(2, "0")}`, label: MONTHS_S[mIdx] });
  }
  const summaries = months.map((m) => ({ ...m, ..._monthSummary(m.yr, m.mIdx) }));

  // ── Monatsstatus (aktueller Monat) ──
  const cur = summaries[5];
  const main = getMainAccount();
  const mainIncome = main && main.monthlyIncome > 0
    ? main.monthlyIncome
    : S.data.filter((p) => p.type === "einnahme").reduce((s, p) => s + avgMonthly(p), 0);
  const spentPct  = mainIncome > 0 ? Math.min((cur.expense / mainIncome) * 100, 100) : 0;
  const remaining = mainIncome - cur.expense;
  const spentColor = spentPct > 90 ? "var(--red)" : spentPct > 70 ? "var(--amber)" : "var(--green)";

  // ── Trend vs. Vormonat ──
  const prev = summaries[4];
  const expTrend = prev.expense > 0 ? ((cur.expense - prev.expense) / prev.expense) * 100 : 0;
  const incTrendMi = prev.income > 0  ? ((cur.income  - prev.income)  / prev.income)  * 100 : 0;

  // ── Nettovermögen-Sparkline (6-Monats-Rückrechnung) ──
  const totalNow = S.accounts.filter(a => a.include).reduce((s, a) => s + (a.balance || 0), 0);
  const nwPoints = new Array(6);
  nwPoints[5] = totalNow;
  for (let i = 4; i >= 0; i--) {
    nwPoints[i] = nwPoints[i + 1] - (summaries[i + 1].income - summaries[i + 1].expense);
  }
  const nwMin = Math.min(...nwPoints);
  const nwMax = Math.max(...nwPoints);
  const nwRange = nwMax - nwMin || 1;
  const nwTrend = nwPoints[5] - nwPoints[0];
  const nwTrendPct = nwPoints[0] !== 0 ? (nwTrend / Math.abs(nwPoints[0])) * 100 : 0;
  const sparkColor = nwTrend >= 0 ? "var(--green)" : "var(--red)";
  const nwSvgW = 300, nwSvgH = 50;
  const nwPts = nwPoints.map((v, i) => {
    const x = (i / 5) * (nwSvgW - 20) + 10;
    const y = nwSvgH - 10 - ((v - nwMin) / nwRange) * (nwSvgH - 20);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const nwDots = nwPoints.map((v, i) => {
    const x = (i / 5) * (nwSvgW - 20) + 10;
    const y = nwSvgH - 10 - ((v - nwMin) / nwRange) * (nwSvgH - 20);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.5" fill="${sparkColor}"/>`;
  }).join("");

  // ── Jahreskosten ──
  let fixAnnual = 0;
  S.data.forEach((p) => { if (p.type === "ausgabe") fixAnnual += avgMonthly(p) * 12; });
  const contractCount = (S.data || []).filter(
    (p) => p.interval !== "einmalig" && (p.contractStart || p.contractEnd),
  ).length;

  // ── Zone 2: Monatsbudget → #monthBudget ──
  const budgetEl = document.getElementById("monthBudget");
  if (budgetEl) {
    budgetEl.innerHTML = `
      <div class="mi-card mi-budget-card">
        <div class="mi-card-head">
          <div class="mi-month-nav" onclick="event.stopPropagation()">
            <button class="mi-nav-btn" onclick="_miNavMonth(-1)" onmouseenter="_showTooltip('Vormonat',this)" onmouseleave="_hideTooltip()">‹</button>
            <span class="mi-nav-label">${MONTHS[curM]} ${curY !== realY ? curY : ""}</span>
            <button class="mi-nav-btn" onclick="_miNavMonth(1)" ${isCurrentMonth ? "disabled style='opacity:.3;cursor:default'" : ""} onmouseenter="_showTooltip('Nächster Monat',this)" onmouseleave="_hideTooltip()">›</button>
            ${!isCurrentMonth ? `<button class="mi-nav-today" onclick="_miResetToday()" onmouseenter="_showTooltip('Zurück zu heute',this)" onmouseleave="_hideTooltip()">Heute</button>` : ""}
          </div>
          <span class="mi-nav-hint mi-clickable" onclick="_navTo('posten')" onmouseenter="_showTooltip('Zu den Umsätzen',this)" onmouseleave="_hideTooltip()">Umsätze →</span>
        </div>
        <div class="mi-budget">
          <div class="mi-budget-row">
            <span class="mi-budget-lbl">Ausgegeben</span>
            <span class="mi-budget-val" style="color:${spentColor}">${fm(cur.expense)}</span>
          </div>
          <div class="mi-progress-track">
            <div class="mi-progress-fill" style="width:${spentPct.toFixed(1)}%;background:${spentColor}"></div>
          </div>
          <div class="mi-budget-row mi-budget-sub">
            <span style="color:var(--text3)">${spentPct.toFixed(0)}% von ${fm(mainIncome)}</span>
            <span style="color:${remaining >= 0 ? "var(--green)" : "var(--red)"}">Rest: ${fm(remaining, true)}</span>
          </div>
          <div class="mi-budget-stats">
            <div class="mi-bstat">
              <div class="mi-bstat-val" style="color:var(--green)">${fm(cur.income)}</div>
              <div class="mi-bstat-lbl">Einnahmen</div>
            </div>
            <div class="mi-bstat">
              <div class="mi-bstat-val" style="color:var(--red)">${fm(cur.expense)}</div>
              <div class="mi-bstat-lbl">Ausgaben</div>
              ${prev.expense > 0 ? `<div class="mi-bstat-trend">${_trendBadge(expTrend, true)}</div>` : ""}
            </div>
            <div class="mi-bstat">
              <div class="mi-bstat-val" style="color:${cur.balance >= 0 ? "var(--teal,#2dd4bf)" : "var(--red)"}">${fm(cur.balance, true)}</div>
              <div class="mi-bstat-lbl">Bilanz</div>
            </div>
          </div>
        </div>
        ${_renderBudgetPromo(cur, mainIncome, spentPct)}
      </div>`;
  }

  // ── Zone 4: Analyse-Zeile → #monthInsights ──
  el.innerHTML = `
    <div class="mi-analyse-grid">

      <!-- Cashflow-Chart (klickbar → Jahresübersicht) -->
      <div class="mi-card mi-card-chart mi-clickable" onclick="_navTo('jahr')" onmouseenter="_showTooltip('Zur Jahresübersicht', this)" onmouseleave="_hideTooltip()">
        <div class="mi-card-head">
          <span class="mi-card-title">Cashflow · letzte 6 Monate</span>
          <div style="display:flex;align-items:center;gap:12px">
            <div class="mi-legend">
              <span class="mi-leg-dot" style="background:var(--green)"></span><span>Einnahmen</span>
              <span class="mi-leg-dot" style="background:var(--red)"></span><span>Ausgaben</span>
            </div>
            <span class="mi-nav-hint">Jahresübersicht →</span>
          </div>
        </div>
        <div class="mi-chart-wrap"><canvas id="miCashflowChart"></canvas></div>
      </div>

      <!-- Fixkosten (klickbar → Verträge) -->
      <div class="mi-card mi-clickable" onclick="_navTo('vertraege')" onmouseenter="_showTooltip('Zu den Verträgen', this)" onmouseleave="_hideTooltip()">
        <div class="mi-card-head">
          <span class="mi-card-title">Fixkosten · Jahressicht</span>
          <span class="mi-nav-hint">Verträge →</span>
        </div>
        <div class="mi-annual">
          <div class="mi-annual-val">${fm(fixAnnual)}<span class="mi-annual-cur"> / Jahr</span></div>
          <div class="mi-annual-sub">≈ ${fm(fixAnnual / 12)} / Monat</div>
          <div class="mi-annual-row">
            <span>Aktive Verträge</span>
            <span style="color:var(--blue);font-family:var(--mono);font-weight:700">${contractCount}</span>
          </div>
          <div class="mi-annual-row">
            <span>Fixposten gesamt</span>
            <span style="color:var(--blue);font-family:var(--mono);font-weight:700">${S.data.filter((p) => p.type === "ausgabe").length}</span>
          </div>
          <div class="mi-annual-row">
            <span>Ø tägl. Fixkosten</span>
            <span style="font-family:var(--mono);font-weight:700">${fm(fixAnnual / 365)}</span>
          </div>
        </div>
      </div>

      <!-- Nettovermögen Sparkline -->
      <div class="mi-card mi-card-nw">
        <div class="mi-card-head">
          <span class="mi-card-title">Nettovermögen · letzte 6 Monate</span>
          <span>${_trendBadge(nwTrendPct, false)}</span>
        </div>
        <div class="mi-nw-wrap">
          <div class="mi-nw-lbl">
            <div class="mi-nw-month">${months[0].label}</div>
            <div class="mi-nw-val">${fm(nwPoints[0])}</div>
          </div>
          <svg viewBox="0 0 ${nwSvgW} ${nwSvgH}" class="mi-nw-svg" preserveAspectRatio="none">
            <polyline points="${nwPts}" fill="none" stroke="${sparkColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            ${nwDots}
          </svg>
          <div class="mi-nw-lbl" style="text-align:right">
            <div class="mi-nw-month">${months[5].label}</div>
            <div class="mi-nw-val" style="color:${sparkColor}">${fm(nwPoints[5])}</div>
          </div>
        </div>
        <div class="mi-nw-months">${months.map(m => `<span>${m.label}</span>`).join("")}</div>
      </div>

    </div>`;

  // ── Chart rendern ──
  if (_miChartInst) { _miChartInst.destroy(); _miChartInst = null; }
  const canvas = document.getElementById("miCashflowChart");
  if (!canvas) return;

  const panel2  = css("--panel2")  || "#1d2235";
  const border2 = css("--border2") || "#252d42";
  const textCol = css("--text")    || "#e4e8f5";

  const ctx2d = canvas.getContext("2d");
  const h = canvas.parentElement.offsetHeight || 110;

  const gradGreen = ctx2d.createLinearGradient(0, 0, 0, h);
  gradGreen.addColorStop(0, "rgba(34,197,94,0.28)");
  gradGreen.addColorStop(1, "rgba(34,197,94,0.01)");

  const gradRed = ctx2d.createLinearGradient(0, 0, 0, h);
  gradRed.addColorStop(0, "rgba(239,68,68,0.22)");
  gradRed.addColorStop(1, "rgba(239,68,68,0.01)");

  _miChartInst = new Chart(ctx2d, {
    type: "line",
    data: {
      labels: summaries.map((m) => m.label),
      datasets: [
        {
          label: "Einnahmen",
          data: summaries.map((m) => parseFloat(m.income.toFixed(2))),
          borderColor: "rgba(34,197,94,0.9)",
          backgroundColor: gradGreen,
          borderWidth: 2,
          fill: true,
          tension: 0.42,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "rgba(34,197,94,1)",
          pointHoverBorderColor: "#fff",
          pointHoverBorderWidth: 2,
        },
        {
          label: "Ausgaben",
          data: summaries.map((m) => parseFloat(m.expense.toFixed(2))),
          borderColor: "rgba(239,68,68,0.85)",
          backgroundColor: gradRed,
          borderWidth: 2,
          fill: true,
          tension: 0.42,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "rgba(239,68,68,1)",
          pointHoverBorderColor: "#fff",
          pointHoverBorderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: panel2,
          borderColor: border2,
          borderWidth: 1,
          titleColor: textCol,
          bodyColor: css("--text2") || "#8892aa",
          callbacks: { label: (ctx) => `  ${ctx.dataset.label}: ${fm(ctx.raw)}` },
        },
      },
      scales: {
        x: {
          grid: { color: "rgba(255,255,255,0.03)" },
          ticks: { color: css("--text3") || "#555e72" },
          border: { color: "transparent" },
        },
        y: {
          grid: { color: "rgba(255,255,255,0.04)" },
          ticks: {
            color: css("--text3") || "#555e72",
            callback: (v) => fmShort(v) + "€",
          },
          border: { color: "transparent" },
          beginAtZero: true,
        },
      },
    },
  });
}

// ══════════════════════════════════════
//  KATEGORIEN-AUSWERTUNG
// ══════════════════════════════════════

let _katMonth = null; // null = aktueller Monat

function renderKatAuswertung() {
  const el = document.getElementById("katAuswertung");
  if (!el) return;

  const n = today();
  const curKey = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`;
  if (!_katMonth) _katMonth = curKey;

  // Verfügbare Monate aus Bookings + aktuellem Monat
  const monthSet = new Set([curKey]);
  (S.bookings || []).forEach((b) => { if (b.monthKey) monthSet.add(b.monthKey); });
  const allMonths = [...monthSet].sort();
  const mIdx = allMonths.indexOf(_katMonth);
  const prevMk = mIdx > 0 ? allMonths[mIdx - 1] : null;
  const nextMk = mIdx < allMonths.length - 1 ? allMonths[mIdx + 1] : null;

  // Buchungen dieses Monats
  const bks = (S.bookings || []).filter(
    (b) => b.monthKey === _katMonth && b.type === "ausgabe" && b.status !== "ausgesetzt"
  );

  // Kategorien-Map aufbauen
  const allCats = Array.isArray(S.categories) && S.categories.length
    ? S.categories
    : (typeof DEFAULT_CATEGORIES !== "undefined" ? DEFAULT_CATEGORIES : []);

  const catMap = {}; // catId → { label, color, icon, total }
  bks.forEach((b) => {
    const catId = b.categoryId
      || (b.postenId ? (S.data.find((p) => p.id === b.postenId) || {}).categoryId : null)
      || "__none__";
    if (!catMap[catId]) {
      const cat = allCats.find((c) => c.id === catId);
      catMap[catId] = {
        label: cat ? cat.name : "Sonstiges",
        color: cat ? cat.color : "var(--text3)",
        icon: cat ? cat.icon : "📦",
        total: 0,
        count: 0,
      };
    }
    catMap[catId].total += Math.abs(b.amount || 0);
    catMap[catId].count++;
  });

  const entries = Object.entries(catMap)
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.total - a.total);
  const grandTotal = entries.reduce((s, e) => s + e.total, 0);

  // Monats-Label
  const [my, mm] = _katMonth.split("-").map(Number);
  const monthLabel = (MONTHS[mm - 1] || "") + " " + my;

  // DOM aufbauen
  el.textContent = "";
  const panel = document.createElement("div");
  panel.className = "panel kat-panel";

  // Header
  const head = document.createElement("div");
  head.className = "panel-head";

  const titleWrap = document.createElement("div");
  const pt = document.createElement("div"); pt.className = "panel-title"; pt.textContent = "Ausgaben nach Kategorie";
  const ps = document.createElement("div"); ps.className = "panel-sub"; ps.textContent = monthLabel;
  titleWrap.appendChild(pt); titleWrap.appendChild(ps);

  const controls = document.createElement("div");
  controls.style.cssText = "display:flex;align-items:center;gap:8px";

  const prevBtn = document.createElement("button");
  prevBtn.className = "umn-arrow" + (prevMk ? "" : " umn-arrow--dis");
  prevBtn.textContent = "‹";
  prevBtn.addEventListener("mouseenter", () => _showTooltip("Vorheriger Monat", prevBtn));
  prevBtn.addEventListener("mouseleave", _hideTooltip);
  if (prevMk) prevBtn.onclick = () => { _katMonth = prevMk; renderKatAuswertung(); };

  const nextBtn = document.createElement("button");
  nextBtn.className = "umn-arrow" + (nextMk ? "" : " umn-arrow--dis");
  nextBtn.textContent = "›";
  nextBtn.addEventListener("mouseenter", () => _showTooltip("Nächster Monat", nextBtn));
  nextBtn.addEventListener("mouseleave", _hideTooltip);
  if (nextMk) nextBtn.onclick = () => { _katMonth = nextMk; renderKatAuswertung(); };

  const isKatClosed = (S.closedMonths || []).includes(_katMonth);
  if (isKatClosed) {
    const lockTag = document.createElement("span");
    lockTag.className = "panel-tag";
    lockTag.style.cssText = "cursor:pointer;";
    lockTag.textContent = "🔒 Abgeschlossen";
    lockTag.addEventListener("mouseenter", () => _showTooltip("Abschluss rückgängig machen", lockTag));
    lockTag.addEventListener("mouseleave", _hideTooltip);
    lockTag.addEventListener("click", () => _umReopenMonth(_katMonth));
    controls.appendChild(lockTag);
  }

  const totTag = document.createElement("div");
  totTag.className = "panel-tag";
  totTag.textContent = grandTotal > 0 ? "−" + fm(grandTotal) : "Keine Ausgaben";

  controls.appendChild(prevBtn);
  controls.appendChild(nextBtn);
  controls.appendChild(totTag);

  head.appendChild(titleWrap);
  head.appendChild(controls);
  panel.appendChild(head);

  if (!entries.length) {
    const empty = document.createElement("div");
    empty.className = "kat-empty";
    empty.textContent = "Keine kategorisierten Ausgaben in diesem Monat";
    panel.appendChild(empty);
    el.appendChild(panel);
    return;
  }

  // Kategorie-Zeilen
  const body = document.createElement("div");
  body.className = "kat-body";

  entries.forEach((e) => {
    const pct = grandTotal > 0 ? (e.total / grandTotal) * 100 : 0;
    const barW = entries[0].total > 0 ? (e.total / entries[0].total) * 100 : 0;

    const row = document.createElement("div");
    row.className = "kat-row";
    row.style.cursor = "pointer";
    row.addEventListener("mouseenter", () => _showTooltip("In Transaktionen anzeigen", row));
    row.addEventListener("mouseleave", _hideTooltip);
    row.onclick = () => {
      if (e.id !== "__none__") {
        _umFilter.categoryId = e.id;
        _umFocusMonth = _katMonth;
      }
      _navTo("posten");
    };

    // Icon + Name
    const left = document.createElement("div"); left.className = "kat-row-left";
    const dot = document.createElement("span"); dot.className = "kat-dot";
    dot.style.background = e.color;
    const icon = document.createElement("span"); icon.className = "kat-icon"; icon.textContent = e.icon;
    const name = document.createElement("span"); name.className = "kat-name"; name.textContent = e.label;
    left.appendChild(dot); left.appendChild(icon); left.appendChild(name);

    // Balken
    const track = document.createElement("div"); track.className = "kat-track";
    const fill = document.createElement("div"); fill.className = "kat-fill";
    fill.style.cssText = `width:${barW.toFixed(1)}%;background:${e.color}`;
    track.appendChild(fill);

    // Rechts: Betrag + %
    const right = document.createElement("div"); right.className = "kat-row-right";
    const val = document.createElement("span"); val.className = "kat-val"; val.textContent = fm(e.total);
    const pctEl = document.createElement("span"); pctEl.className = "kat-pct"; pctEl.textContent = pct.toFixed(0) + "%";
    right.appendChild(val); right.appendChild(pctEl);

    row.appendChild(left); row.appendChild(track); row.appendChild(right);
    body.appendChild(row);
  });

  panel.appendChild(body);
  el.appendChild(panel);
}
