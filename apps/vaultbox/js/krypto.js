// ══════════════════════════════════════
//  KRYPTO — FIFO Steuerauswertung
// ══════════════════════════════════════

let _krAssets   = [];
let _krActive   = null;
let _krTxs      = [];
let _krYear     = new Date().getFullYear();
let _krReport   = null;
let _krTab      = "tx"; // "tx" | "report"

async function renderKrypto() {
  const p = document.getElementById("p-krypto");
  if (!p) return;
  p.innerHTML = "";

  if (!window.csf?.crypto) {
    const msg = _e("div", "kr-no-ipc");
    msg.textContent = "Krypto-Modul nicht verfügbar (nur in Electron).";
    p.appendChild(msg);
    return;
  }

  _krAssets = await window.csf.crypto.getAssets();
  if (_krActive && !_krAssets.find(a => a.asset === _krActive)) _krActive = null;
  if (!_krActive && _krAssets.length) _krActive = _krAssets[0].asset;

  _krRender(p);
}

function _krRender(p) {
  p.innerHTML = "";

  // ── Topbar ───────────────────────────
  const topbar = _e("div", "kr-topbar");

  const title = _e("div", "kr-topbar-title");
  title.textContent = "Krypto · FIFO-Steuer";
  topbar.appendChild(title);

  const actions = _e("div", "kr-topbar-actions");

  const btnAdd = _e("button", "btn primary kr-btn-add");
  btnAdd.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Transaktion`;
  btnAdd.addEventListener("click", _krOpenAddModal);
  actions.appendChild(btnAdd);

  const btnCsv = _e("button", "btn secondary kr-btn-csv");
  btnCsv.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> CSV Import`;
  btnCsv.addEventListener("click", _krOpenCsvImport);
  actions.appendChild(btnCsv);

  topbar.appendChild(actions);
  p.appendChild(topbar);

  // ── Layout ──────────────────────────
  const layout = _e("div", "kr-layout");

  // Sidebar: Asset-Liste
  const sidebar = _e("div", "kr-sidebar");
  _krRenderAssetList(sidebar);
  layout.appendChild(sidebar);

  // Main: Tabs
  const main = _e("div", "kr-main");
  _krRenderMain(main);
  layout.appendChild(main);

  p.appendChild(layout);
}

function _krRenderAssetList(sidebar) {
  sidebar.innerHTML = "";

  const hdr = _e("div", "kr-sidebar-hdr");
  hdr.textContent = "Assets";
  sidebar.appendChild(hdr);

  if (!_krAssets.length) {
    const empty = _e("div", "kr-sidebar-empty");
    empty.textContent = "Noch keine Transaktionen";
    sidebar.appendChild(empty);
    return;
  }

  for (const a of _krAssets) {
    const item = _e("div", "kr-asset-item" + (a.asset === _krActive ? " active" : ""));
    item.addEventListener("click", () => {
      _krActive = a.asset;
      renderKrypto();
    });
    const name = _e("span", "kr-asset-name");
    name.textContent = a.asset;
    const holding = _e("span", "kr-asset-holding");
    const amt = Number(a.holding);
    holding.textContent = amt > 0 ? _krFmtAmt(amt) : "0";
    item.appendChild(name);
    item.appendChild(holding);
    sidebar.appendChild(item);
  }
}

async function _krRenderMain(main) {
  main.innerHTML = "";

  // ── Tab-Bar ─────────────────────────
  const tabs = _e("div", "kr-tabs");

  const tabTx = _e("button", "kr-tab" + (_krTab === "tx" ? " active" : ""));
  tabTx.textContent = _krActive ? `${_krActive} — Transaktionen` : "Transaktionen";
  tabTx.addEventListener("click", () => { _krTab = "tx"; renderKrypto(); });
  tabs.appendChild(tabTx);

  const tabRep = _e("button", "kr-tab" + (_krTab === "report" ? " active" : ""));
  tabRep.textContent = "Steuer-Report";
  tabRep.addEventListener("click", () => { _krTab = "report"; renderKrypto(); });
  tabs.appendChild(tabRep);

  main.appendChild(tabs);

  try {
    if (_krTab === "tx") {
      await _krRenderTxTab(main);
    } else {
      await _krRenderReportTab(main);
    }
  } catch (err) {
    const errEl = _e("div", "kr-empty");
    errEl.textContent = "Fehler beim Laden: " + (err?.message || String(err));
    main.appendChild(errEl);
  }
}

async function _krRenderTxTab(main) {
  if (!_krActive) {
    const empty = _e("div", "kr-empty");
    empty.textContent = "Zuerst eine Transaktion hinzufügen.";
    main.appendChild(empty);
    return;
  }

  const txs = await window.csf.crypto.getTxs(_krActive);
  _krTxs = txs;

  if (!txs.length) {
    const empty = _e("div", "kr-empty");
    empty.textContent = `Keine Transaktionen für ${_krActive}.`;
    main.appendChild(empty);
    return;
  }

  const table = _e("div", "kr-table-wrap");
  const TYPE_LABELS = { buy: "Kauf", sell: "Verkauf", transfer_in: "Eingang", transfer_out: "Ausgang", fee: "Gebühr" };
  const TYPE_CLASSES = { buy: "kr-type-buy", sell: "kr-type-sell", transfer_in: "kr-type-in", transfer_out: "kr-type-out", fee: "kr-type-fee" };

  let html = `<table class="kr-table">
    <thead><tr>
      <th>Datum</th><th>Typ</th><th>Menge</th><th>Kurs (€)</th><th>Wert (€)</th><th>Gebühr (€)</th><th>Börse</th><th>Notiz</th><th></th>
    </tr></thead><tbody>`;

  for (const tx of txs) {
    const val = (tx.amount * tx.price_eur).toFixed(2);
    const safeCls   = TYPE_CLASSES[tx.type] || "";
    const safeLabel = esc(TYPE_LABELS[tx.type] || tx.type);
    html += `<tr>
      <td>${esc(tx.date)}</td>
      <td><span class="kr-type-badge ${safeCls}">${safeLabel}</span></td>
      <td class="kr-num">${_krFmtAmt(tx.amount)}</td>
      <td class="kr-num">${Number(tx.price_eur).toLocaleString("de-DE", {minimumFractionDigits:2,maximumFractionDigits:2})}</td>
      <td class="kr-num">${Number(val).toLocaleString("de-DE", {minimumFractionDigits:2,maximumFractionDigits:2})}</td>
      <td class="kr-num">${Number(tx.fee_eur).toLocaleString("de-DE", {minimumFractionDigits:2,maximumFractionDigits:2})}</td>
      <td>${esc(tx.exchange || "—")}</td>
      <td class="kr-note">${esc(tx.note || "")}</td>
      <td><button class="kr-del-btn" onmouseenter="_showTooltip('Löschen',this)" onmouseleave="_hideTooltip()" onclick="_krDeleteTx(${tx.id})">✕</button></td>
    </tr>`;
  }
  html += "</tbody></table>";
  table.innerHTML = html;
  main.appendChild(table);
}

async function _krRenderReportTab(main) {
  // Jahr-Picker + Export-Buttons
  const ctrl = _e("div", "kr-report-ctrl");

  const yearSel = _e("select", "kr-year-sel");
  const curYear = new Date().getFullYear();
  for (let y = curYear; y >= 2017; y--) {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    if (y === _krYear) opt.selected = true;
    yearSel.appendChild(opt);
  }
  yearSel.addEventListener("change", () => { _krYear = Number(yearSel.value); _krRenderReportTab(main); });
  ctrl.appendChild(yearSel);

  const assetSel = _e("select", "kr-asset-sel");
  const optAll = document.createElement("option");
  optAll.value = "";
  optAll.textContent = "Alle Assets";
  assetSel.appendChild(optAll);
  for (const a of _krAssets) {
    const opt = document.createElement("option");
    opt.value = a.asset;
    opt.textContent = a.asset;
    if (a.asset === (_krTab === "report" ? _krActive : null)) opt.selected = true;
    assetSel.appendChild(opt);
  }
  assetSel.addEventListener("change", () => { _krActive = assetSel.value || null; _krRenderReportTab(main); });
  ctrl.appendChild(assetSel);

  const btnCsvExp = _e("button", "btn secondary");
  btnCsvExp.textContent = "CSV Export";
  btnCsvExp.addEventListener("click", () => _krExportCsv());
  ctrl.appendChild(btnCsvExp);

  const btnPdf = _e("button", "btn secondary");
  btnPdf.textContent = "PDF Bericht";
  btnPdf.addEventListener("click", () => _krExportPdf());
  ctrl.appendChild(btnPdf);

  // Altes Content entfernen (außer tabs)
  const tabs = main.querySelector(".kr-tabs");
  main.innerHTML = "";
  if (tabs) main.appendChild(tabs);
  main.appendChild(ctrl);

  if (!window.csf?.crypto) return;

  const data = await window.csf.crypto.getReport(_krActive || null, _krYear);
  _krReport = data;

  // KPI-Strip
  const kpis = _e("div", "kr-kpi-strip");
  const { summary } = data;
  const net = summary.totalTaxable;

  _krKpi(kpis, "Steuerpfl. Gewinn", `${_krFmtEur(Math.max(0, net))}`, "green");
  _krKpi(kpis, "Steuerpfl. Verlust", `${_krFmtEur(Math.min(0, net))}`, "red");
  _krKpi(kpis, "Steuerfreie Gewinne", `${_krFmtEur(summary.taxFreeGain)}`, "dim");
  _krKpi(kpis, "Zu versteuern (Netto)", `${_krFmtEur(net)}`, net >= 0 ? "yellow" : "green");
  main.appendChild(kpis);

  const freigrenze = _e("div", "kr-freigrenze");
  const limit600 = net > 0 && net < 600;
  freigrenze.textContent = limit600
    ? `✓ Unter Freigrenze von 600 € — steuerfrei (§ 23 Abs. 3 S. 5 EStG)`
    : net >= 600
      ? `⚠ Über Freigrenze — gesamter Gewinn von ${_krFmtEur(net)} ist steuerpflichtig`
      : "";
  freigrenze.className = "kr-freigrenze" + (limit600 ? " ok" : net >= 600 ? " warn" : "");
  main.appendChild(freigrenze);

  if (!data.matches.length) {
    const empty = _e("div", "kr-empty");
    empty.textContent = `Keine Verkäufe in ${_krYear}.`;
    main.appendChild(empty);
    return;
  }

  // Tabelle
  const tableWrap = _e("div", "kr-table-wrap");
  let html = `<table class="kr-table">
    <thead><tr>
      <th>Asset</th><th>Menge</th><th>Kauf</th><th>Verkauf</th><th>Haltedauer</th>
      <th>Einstieg (€)</th><th>Ausstieg (€)</th><th>Gewinn/Verlust (€)</th><th>Status</th>
    </tr></thead><tbody>`;

  for (const m of data.matches) {
    const gain = m.gain_eur;
    const gainCls = gain >= 0 ? "kr-gain-pos" : "kr-gain-neg";
    html += `<tr class="${m.tax_free ? "kr-row-taxfree" : ""}">
      <td><strong>${esc(m.asset)}</strong></td>
      <td class="kr-num">${_krFmtAmt(m.amount)}</td>
      <td>${esc(m.buy_date)}</td>
      <td>${esc(m.sell_date)}</td>
      <td class="kr-num">${m.holding_days} Tage</td>
      <td class="kr-num">${_krFmtEur(m.buy_price_eur * m.amount)}</td>
      <td class="kr-num">${_krFmtEur(m.sell_price_eur * m.amount)}</td>
      <td class="kr-num ${gainCls}">${gain >= 0 ? "+" : ""}${_krFmtEur(gain)}</td>
      <td>${m.tax_free ? '<span class="kr-badge-free">Steuerfrei</span>' : '<span class="kr-badge-tax">Steuerpflichtig</span>'}</td>
    </tr>`;
  }
  html += "</tbody></table>";
  tableWrap.innerHTML = html;
  main.appendChild(tableWrap);
}

function _krKpi(container, label, value, color) {
  const card = _e("div", `kr-kpi-card kr-kpi-${color}`);
  const lbl  = _e("div", "kr-kpi-label");
  lbl.textContent = label;
  const val  = _e("div", "kr-kpi-value");
  val.textContent = value;
  card.appendChild(lbl);
  card.appendChild(val);
  container.appendChild(card);
}

// ── ADD TRANSACTION MODAL ──────────────
function _krOpenAddModal() {
  const TYPE_OPTIONS = [
    { v: "buy",          l: "Kauf" },
    { v: "sell",         l: "Verkauf" },
    { v: "transfer_in",  l: "Eingang (Mining/Schenkung)" },
    { v: "transfer_out", l: "Ausgang (kein Steuervorgang)" },
  ];

  let overlay = document.getElementById("krAddOverlay");
  if (overlay) { overlay.remove(); }

  overlay = document.createElement("div");
  overlay.id = "krAddOverlay";
  overlay.className = "kr-modal-overlay";
  overlay.addEventListener("mousedown", (e) => { if (e.target === overlay) overlay.remove(); });

  const box = _e("div", "kr-modal-box");

  const hdr = _e("div", "kr-modal-hdr");
  hdr.innerHTML = `<span>Neue Transaktion</span><button class="kr-modal-close" onclick="document.getElementById('krAddOverlay')?.remove()">✕</button>`;
  box.appendChild(hdr);

  const form = _e("div", "kr-form");

  function row(label, input) {
    const r = _e("div", "kr-form-row");
    const lbl = _e("label", "kr-form-label");
    lbl.textContent = label;
    r.appendChild(lbl);
    r.appendChild(input);
    return r;
  }

  const assetInp  = _krInp("text",   "z.B. BTC",    _krActive || "");
  const typeInp   = _krSelect(TYPE_OPTIONS);
  const dateInp   = _krInp("date",   "",            today());
  const amtInp    = _krInp("number", "0.0",         "");
  const priceInp  = _krInp("number", "Preis in €",  "");
  const feeInp    = _krInp("number", "Gebühr in €", "0");
  const exchInp   = _krInp("text",   "z.B. Binance", "");
  const noteInp   = _krInp("text",   "Optional",    "");

  form.appendChild(row("Asset",      assetInp));
  form.appendChild(row("Typ",        typeInp));
  form.appendChild(row("Datum",      dateInp));
  form.appendChild(row("Menge",      amtInp));
  form.appendChild(row("Kurs (€)",   priceInp));
  form.appendChild(row("Gebühr (€)", feeInp));
  form.appendChild(row("Börse",      exchInp));
  form.appendChild(row("Notiz",      noteInp));

  const errEl = _e("div", "kr-form-err");
  form.appendChild(errEl);

  const btnRow = _e("div", "kr-form-btns");
  const btnSave = _e("button", "btn primary");
  btnSave.textContent = "Speichern";
  btnSave.addEventListener("click", async () => {
    errEl.textContent = "";
    const asset = assetInp.value.trim().toUpperCase();
    const type  = typeInp.value;
    const date  = dateInp.value;
    const amount    = parseFloat(amtInp.value);
    const price_eur = parseFloat(priceInp.value);
    const fee_eur   = parseFloat(feeInp.value) || 0;

    if (!asset)        { errEl.textContent = "Asset eingeben (z.B. BTC)"; return; }
    if (!date)         { errEl.textContent = "Datum fehlt"; return; }
    if (isNaN(amount) || amount <= 0) { errEl.textContent = "Menge muss > 0 sein"; return; }
    if (isNaN(price_eur) || price_eur < 0) { errEl.textContent = "Kurs (€) ungültig"; return; }

    btnSave.disabled = true;
    btnSave.textContent = "Speichert…";
    await window.csf.crypto.addTx({ asset, type, date, amount, price_eur, fee_eur, exchange: exchInp.value.trim(), note: noteInp.value.trim() });
    overlay.remove();
    await renderKrypto();
    showToast(`${asset} ${type === "buy" ? "Kauf" : "Transaktion"} gespeichert.`, "success", 2500);
  });

  const btnCancel = _e("button", "btn secondary");
  btnCancel.textContent = "Abbrechen";
  btnCancel.addEventListener("click", () => overlay.remove());
  btnRow.appendChild(btnCancel);
  btnRow.appendChild(btnSave);

  form.appendChild(btnRow);
  box.appendChild(form);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  setTimeout(() => assetInp.focus(), 80);
}

// ── CSV IMPORT ────────────────────────
function _krOpenCsvImport() {
  let overlay = document.getElementById("krCsvOverlay");
  if (overlay) { overlay.remove(); }

  overlay = document.createElement("div");
  overlay.id = "krCsvOverlay";
  overlay.className = "kr-modal-overlay";
  overlay.addEventListener("mousedown", (e) => { if (e.target === overlay) overlay.remove(); });

  const box = _e("div", "kr-modal-box");
  box.style.maxWidth = "560px";

  const hdr = _e("div", "kr-modal-hdr");
  hdr.innerHTML = `<span>CSV Import</span><button class="kr-modal-close" onclick="document.getElementById('krCsvOverlay')?.remove()">✕</button>`;
  box.appendChild(hdr);

  const hint = _e("div", "kr-csv-hint");
  hint.innerHTML = `
    <p>CSV-Datei mit Kopfzeile. Unterstützte Felder:</p>
    <code>asset, type, date (YYYY-MM-DD), amount, price_eur, fee_eur, exchange</code>
    <p>Typ-Werte: <code>buy</code>, <code>sell</code>, <code>transfer_in</code>, <code>transfer_out</code></p>
  `;
  box.appendChild(hint);

  const form = _e("div", "kr-form");

  const textarea = _e("textarea", "kr-csv-input");
  textarea.placeholder = "CSV hier einfügen oder Datei hochladen…\nasset,type,date,amount,price_eur,fee_eur\nBTC,buy,2023-01-15,0.5,19500,12.50";
  textarea.rows = 10;
  form.appendChild(textarea);

  const fileBtn = _e("button", "btn secondary");
  fileBtn.textContent = "Datei auswählen";
  fileBtn.style.marginBottom = "4px";
  fileBtn.addEventListener("click", () => {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = ".csv,.txt";
    inp.addEventListener("change", (e) => {
      const f = e.target.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = (ev) => { textarea.value = ev.target.result; };
      reader.readAsText(f, "UTF-8");
    });
    inp.click();
  });
  form.appendChild(fileBtn);

  const errEl = _e("div", "kr-form-err");
  form.appendChild(errEl);

  const btnRow = _e("div", "kr-form-btns");
  const btnImport = _e("button", "btn primary");
  btnImport.textContent = "Importieren";
  btnImport.addEventListener("click", async () => {
    const csv = textarea.value.trim();
    if (!csv) { errEl.textContent = "Bitte CSV einfügen."; return; }
    btnImport.disabled = true;
    btnImport.textContent = "Importiert…";
    const mappings = {
      delimiter: csv.includes(";") ? ";" : ",",
      asset: "asset", type: "type", date: "date",
      amount: "amount", price_eur: "price_eur", fee_eur: "fee_eur",
      exchange: "exchange",
    };
    const r = await window.csf.crypto.importCsv(csv, mappings);
    overlay.remove();
    await renderKrypto();
    showToast(`${r.imported} Transaktionen importiert${r.errors ? `, ${r.errors} Fehler` : ""}.`, r.errors ? "warning" : "success", 4000);
  });

  const btnCancel = _e("button", "btn secondary");
  btnCancel.textContent = "Abbrechen";
  btnCancel.addEventListener("click", () => overlay.remove());
  btnRow.appendChild(btnCancel);
  btnRow.appendChild(btnImport);
  form.appendChild(btnRow);

  box.appendChild(form);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

// ── DELETE ────────────────────────────
async function _krDeleteTx(id) {
  const ok = await appConfirm("Transaktion löschen? Die FIFO-Berechnung wird neu berechnet.", { confirmLabel: "Löschen", cancelLabel: "Abbrechen" });
  if (!ok) return;
  await window.csf.crypto.deleteTx(id);
  await renderKrypto();
  showToast("Transaktion gelöscht.", "info", 2000);
}

// ── PDF EXPORT ────────────────────────
async function _krExportPdf() {
  if (!_krReport) return;
  const yr = _krYear;
  const { matches, summary } = _krReport;
  const TYPE_LABELS = { buy: "Kauf", sell: "Verkauf", transfer_in: "Eingang", transfer_out: "Ausgang" };

  let rows = "";
  for (const m of matches) {
    const gain = m.gain_eur;
    rows += `<tr>
      <td>${esc(m.asset)}</td>
      <td style="text-align:right">${_krFmtAmt(m.amount)}</td>
      <td>${esc(m.buy_date)}</td>
      <td>${esc(m.sell_date)}</td>
      <td style="text-align:right">${m.holding_days} Tage</td>
      <td style="text-align:right">${_krFmtEur(m.buy_price_eur * m.amount)}&nbsp;€</td>
      <td style="text-align:right">${_krFmtEur(m.sell_price_eur * m.amount)}&nbsp;€</td>
      <td style="text-align:right;color:${gain>=0?"#16a34a":"#dc2626"}">${gain>=0?"+":""}${_krFmtEur(gain)}&nbsp;€</td>
      <td>${m.tax_free ? "Steuerfrei" : "Steuerpflichtig"}</td>
    </tr>`;
  }

  const net = summary.totalTaxable;
  const html = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"/>
  <style>
    body{font-family:Segoe UI,Arial,sans-serif;font-size:12px;color:#111;padding:32px}
    h1{font-size:20px;margin:0 0 4px}
    .sub{color:#555;margin-bottom:24px}
    table{width:100%;border-collapse:collapse;margin-top:16px}
    th{background:#f3f4f6;padding:6px 8px;text-align:left;border-bottom:2px solid #e5e7eb;font-size:11px}
    td{padding:5px 8px;border-bottom:1px solid #e5e7eb}
    .kpi{display:flex;gap:24px;margin-bottom:20px}
    .kpi-card{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;min-width:140px}
    .kpi-label{font-size:10px;color:#666;margin-bottom:4px}
    .kpi-value{font-size:16px;font-weight:700}
    .green{color:#16a34a} .red{color:#dc2626} .yellow{color:#ca8a04}
    .footer{margin-top:32px;font-size:10px;color:#999;border-top:1px solid #e5e7eb;padding-top:12px}
  </style></head><body>
  <h1>VaultBox — Krypto Steuer-Report ${yr}</h1>
  <div class="sub">Erstellt am ${new Date().toLocaleDateString("de-DE")} · FIFO-Methode · § 23 EStG</div>
  <div class="kpi">
    <div class="kpi-card"><div class="kpi-label">Steuerpfl. Gewinn</div><div class="kpi-value green">${_krFmtEur(Math.max(0, net))} €</div></div>
    <div class="kpi-card"><div class="kpi-label">Steuerpfl. Verlust</div><div class="kpi-value red">${_krFmtEur(Math.min(0, net))} €</div></div>
    <div class="kpi-card"><div class="kpi-label">Steuerfreie Gewinne</div><div class="kpi-value">${_krFmtEur(summary.taxFreeGain)} €</div></div>
    <div class="kpi-card"><div class="kpi-label">Netto steuerpflichtig</div><div class="kpi-value ${net>=0?"yellow":"green"}">${net>=0?"+":""}${_krFmtEur(net)} €</div></div>
  </div>
  ${net > 0 && net < 600 ? `<p style="color:#16a34a;font-weight:600">✓ Unter Freigrenze von 600 € — vollständig steuerfrei (§ 23 Abs. 3 S. 5 EStG)</p>` : ""}
  <table>
    <thead><tr><th>Asset</th><th>Menge</th><th>Kaufdatum</th><th>Verkaufdatum</th><th>Haltedauer</th><th>Einstieg</th><th>Ausstieg</th><th>Gewinn/Verlust</th><th>Status</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">VaultBox · Kein Steuerberater-Ersatz · Alle Angaben ohne Gewähr</div>
  </body></html>`;

  if (window.csf?.print?.html) {
    window.csf.print.html(html);
  }
}

// ── CSV EXPORT ─────────────────────────
function _krExportCsv() {
  if (!_krReport?.matches?.length) { showToast("Keine Daten für Export.", "warning", 2000); return; }
  const { matches } = _krReport;
  const esc_csv = (v) => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
  const lines = ["Asset,Menge,Kaufdatum,Verkaufdatum,Haltedauer (Tage),Einstieg (€),Ausstieg (€),Gewinn/Verlust (€),Steuerrelevant"];
  for (const m of matches) {
    lines.push([
      m.asset, _krFmtAmt(m.amount), m.buy_date, m.sell_date, m.holding_days,
      (m.buy_price_eur * m.amount).toFixed(2),
      (m.sell_price_eur * m.amount).toFixed(2),
      m.gain_eur.toFixed(2),
      m.tax_free ? "Steuerfrei" : "Steuerpflichtig"
    ].map(esc_csv).join(","));
  }
  const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `VaultBox-Krypto-Report-${_krYear}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── UTILS ─────────────────────────────
function _e(tag, cls) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  return el;
}

function _krInp(type, placeholder, value) {
  const inp = document.createElement("input");
  inp.type = type;
  inp.className = "kr-input";
  inp.placeholder = placeholder;
  if (value !== undefined) inp.value = value;
  return inp;
}

function _krSelect(options) {
  const sel = document.createElement("select");
  sel.className = "kr-input";
  for (const o of options) {
    const opt = document.createElement("option");
    opt.value = o.v;
    opt.textContent = o.l;
    sel.appendChild(opt);
  }
  return sel;
}

function _krFmtAmt(v) {
  const n = Number(v);
  if (n < 0.001 && n > 0) return n.toFixed(8);
  if (n < 1) return n.toFixed(6);
  return n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

function _krFmtEur(v) {
  return Number(v).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── DEMO SEED ─────────────────────────
async function seedCryptoData() {
  if (!window.csf?.crypto) return;
  const existing = await window.csf.crypto.getAssets();
  if (existing.length > 0) return;

  const txs = [
    { asset: "BTC", type: "buy",  date: "2024-01-15", amount: 0.12, price_eur: 38000, fee_eur: 10,  exchange: "Bitvavo", note: "Demo-Daten" },
    { asset: "BTC", type: "buy",  date: "2024-07-20", amount: 0.05, price_eur: 58000, fee_eur: 7,   exchange: "Bitvavo", note: "Demo-Daten" },
    { asset: "BTC", type: "sell", date: "2025-02-10", amount: 0.08, price_eur: 89000, fee_eur: 14,  exchange: "Bitvavo", note: "Demo-Daten" },
    { asset: "ETH", type: "buy",  date: "2024-03-10", amount: 1.5,  price_eur: 3200,  fee_eur: 5,   exchange: "Kraken",  note: "Demo-Daten" },
    { asset: "ETH", type: "buy",  date: "2024-10-05", amount: 0.5,  price_eur: 2400,  fee_eur: 3,   exchange: "Kraken",  note: "Demo-Daten" },
    { asset: "SOL", type: "buy",  date: "2025-03-01", amount: 20,   price_eur: 140,   fee_eur: 3,   exchange: "Kraken",  note: "Demo-Daten" },
  ];

  for (const tx of txs) {
    await window.csf.crypto.addTx(tx);
  }
}
