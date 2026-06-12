// ══════════════════════════════════════
//  PRINT — Theme-aware mehrseitige Druckansicht
// ══════════════════════════════════════

function openPrintPreview() {
  // Druck immer in hellem Layout — unabhängig vom App-Theme
  const colors = {
    bg:      '#ffffff',
    panel:   '#f5f5f5',
    panel2:  '#ebebeb',
    border:  '#bbbbbb',
    text:    '#000000',
    text2:   '#111111',
    text3:   '#333333',
    blue:    '#1a56db',
    green:   '#15803d',
    red:     '#b91c1c',
    amber:   '#b45309',
  };

  // Daten aufbereiten
  const n      = today();
  const mIdx   = n.getMonth();
  const yr     = n.getFullYear();
  const main   = getMainAccount();
  const mainIncome = (main && main.monthlyIncome > 0)
    ? main.monthlyIncome
    : S.data.filter(p=>p.type==='einnahme').reduce((s,p)=>s+avgMonthly(p),0);

  let totalBal = 0;
  S.accounts.forEach(a => { if (a.include) totalBal += a.balance; });
  let fixOut = 0, fixIn = 0;
  S.data.forEach(p => {
    if (p.type==='ausgabe') fixOut += avgMonthly(p);
    else fixIn += avgMonthly(p);
  });
  const frei = mainIncome - fixOut;

  const d     = buildMainAccountData();
  const allIt = typeof _buildAllAccountItems === 'function'
    ? _buildAllAccountItems(d.nextZahltag, d.mIdx, d.yr, d.day)
    : d.items;

  const dateStr = n.toLocaleDateString('de-DE', {
    weekday:'long', day:'2-digit', month:'long', year:'numeric'
  });

  // ── HTML-Generatoren ────────────────
  const esc2 = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  const header = (title, sub) => `
    <div class="ph">
      <div class="ph-logo">
        <div class="ph-logo-mark">CS</div>
        <div>
          <div class="ph-app">VaultBox</div>
          <div class="ph-sub">${esc2(sub)}</div>
        </div>
      </div>
      <div class="ph-right">
        <div class="ph-title">${esc2(title)}</div>
        <div class="ph-date">${dateStr}</div>
      </div>
    </div>`;

  const footer = `
    <div class="pf">
      <span>VaultBox · ${yr}</span>
      <span>Erstellt: ${n.toLocaleDateString('de-DE')}</span>
    </div>`;

  const kpiCard = (label, val, sub, color) => `
    <div class="kpi-card">
      <div class="kpi-lbl">${esc2(label)}</div>
      <div class="kpi-val" style="color:${color}">${val}</div>
      <div class="kpi-sub">${esc2(sub)}</div>
    </div>`;

  const dueRows = items => items.length === 0
    ? `<tr><td colspan="3" class="empty-row">✓ Keine weiteren Fälligkeiten</td></tr>`
    : items.map(i=>`
        <tr class="${i.urgent?'urgent-row':''}${i.isNxt?' nextm-row':''}">
          <td><span class="day-pill">${i.due}.${i.isNxt?' '+MONTHS_S[i.dueMo]:''}</span></td>
          <td>${esc2(i.name)}</td>
          <td class="r neg">−${fm(i.amt)}</td>
        </tr>`).join('');

  // Konten-Tabelle (mit Gruppen)
  const grouped = {};
  const ungrouped = [];
  S.accounts.forEach(a => {
    const bg = (a.bankGroup||'').trim();
    const key = bg ? bg.charAt(0).toUpperCase()+bg.slice(1) : '';
    if (key) { if (!grouped[key]) grouped[key]=[]; grouped[key].push(a); }
    else ungrouped.push(a);
  });
  let kontenRows = '';
  const orderedGroups = [...(S.groupOrder||[]).filter(g=>grouped[g]),
    ...Object.keys(grouped).filter(g=>!(S.groupOrder||[]).includes(g)).sort()];
  orderedGroups.forEach(gn => {
    const accs = grouped[gn];
    const gBal = accs.filter(a=>a.include).reduce((s,a)=>s+a.balance,0);
    kontenRows += `<tr class="group-row"><td colspan="3"><strong>${esc2(gn)}</strong></td>
      <td class="r" style="color:${gBal>=0?colors.green:colors.red}">${fm(gBal)}</td><td></td></tr>`;
    accs.forEach(a => {
      kontenRows += `<tr>
        <td style="padding-left:18px;">${esc2(a.label)}</td>
        <td class="muted">${esc2(_accTypeLabel(a.accountType))}</td>
        <td class="mono muted">${a.iban?'···'+String(a.iban).slice(-4):''}</td>
        <td class="r ${a.balance>=0?'pos':'neg'}">${fm(a.balance)}</td>
        <td class="center">${a.include?'✓':''}</td>
      </tr>`;
    });
  });
  ungrouped.forEach(a => {
    kontenRows += `<tr>
      <td>${esc2(a.label)}</td>
      <td class="muted">${esc2(_accTypeLabel(a.accountType))}</td>
      <td class="mono muted">${a.iban?'···'+String(a.iban).slice(-4):''}</td>
      <td class="r ${a.balance>=0?'pos':'neg'}">${fm(a.balance)}</td>
      <td class="center">${a.include?'✓':''}</td>
    </tr>`;
  });

  // Posten-Tabelle
  const postenSorted = [
    ...S.data.filter(p=>p.type==='ausgabe').sort((a,b)=>b.amount-a.amount),
    ...S.data.filter(p=>p.type==='einnahme').sort((a,b)=>b.amount-a.amount)
  ];
  const postenRows = postenSorted.map(p => {
    const isOut = p.type === 'ausgabe';
    return `<tr>
      <td>${esc2(p.name)}</td>
      <td><span class="badge ${isOut?'badge-red':'badge-green'}">${isOut?'Ausgabe':'Einnahme'}</span></td>
      <td>${esc2(p.interval||'—')}</td>
      <td class="center">${p.due?p.due+'.':'—'}</td>
      <td class="muted">${esc2(typeof accLabel==='function'?accLabel(p.accountId):p.accountId||'—')}</td>
      <td class="r ${isOut?'neg':'pos'}">${fm(p.amount||0)}</td>
      <td class="r muted">${avgMonthly(p)>0?fm(avgMonthly(p)):'—'}</td>
    </tr>`;
  }).join('');

  // Verträge
  const ctItems = S.data.filter(p=>p.contractEnd||p.contractStart)
    .sort((a,b)=>{ const ae=a.contractEnd||'9999',be=b.contractEnd||'9999'; return ae<be?-1:1; });
  const ctRows = ctItems.map(p => {
    const e    = p.contractEnd ? new Date(p.contractEnd) : null;
    const diff = e ? Math.round((e-n)/86400000) : null;
    let status = 'Laufend', statusClass = 'badge-green';
    if (diff!==null) {
      if (diff<0)   { status='Abgelaufen';         statusClass='badge-red'; }
      else if(diff<=30) { status=diff+'d';          statusClass='badge-amber'; }
      else if(diff<=90) { status=Math.round(diff/30)+'M'; statusClass='badge-amber'; }
      else          { status=Math.round(diff/30)+'M'; statusClass='badge-green'; }
    }
    return `<tr>
      <td>${esc2(p.name)}</td>
      <td class="muted">${p.contractStart?new Date(p.contractStart).toLocaleDateString('de-DE',{month:'2-digit',year:'numeric'}):'—'}</td>
      <td class="muted">${e?e.toLocaleDateString('de-DE'):'—'}</td>
      <td class="r">${fm(p.amount||0)}</td>
      <td class="muted">${esc2(p.interval||'—')}</td>
      <td><span class="badge ${statusClass}">${status}</span></td>
    </tr>`;
  }).join('');

  // Jahresübersicht
  const yearCards = Array.from({length:12},(_,m) => {
    let inc=0, exp=0;
    S.data.forEach(p => {
      const v = monthActual(p,m);
      if(p.type==='einnahme') inc+=v; else exp+=v;
    });
    if (inc===0 && mainIncome>0) inc = mainIncome;
    const bal2 = inc-exp;
    const isCur = m===mIdx;
    return `<div class="year-card ${isCur?'year-card--cur':''}">
      <div class="yc-month">${MONTHS_S[m]}${isCur?' ★':''}</div>
      <div class="yc-row"><span class="yc-lbl">Einnahmen</span><span class="yc-val pos">${inc>0?'+'+fm(inc):'—'}</span></div>
      <div class="yc-row"><span class="yc-lbl">Ausgaben</span><span class="yc-val neg">${exp>0?'−'+fm(exp):'—'}</span></div>
      <div class="yc-bal" style="color:${bal2>=0?colors.green:colors.red}">${fm(bal2,true)}</div>
    </div>`;
  }).join('');

  // Sparziele
  const goalCards = (S.goals||[]).map(g => {
    const pct  = g.targetAmount>0 ? Math.min(100,Math.round((g.currentAmount/g.targetAmount)*100)) : 0;
    const rem  = Math.max(0,(g.targetAmount||0)-(g.currentAmount||0));
    return `<div class="goal-card-p">
      <div class="gc-top">
        <span class="gc-icon">${g.icon||'🎯'}</span>
        <div>
          <div class="gc-name">${esc2(g.name)}</div>
          ${g.deadline?`<div class="gc-dead muted">${new Date(g.deadline).toLocaleDateString('de-DE')}</div>`:''}
        </div>
        <div class="gc-pct" style="color:${g.color||colors.blue}">${pct}%</div>
      </div>
      <div class="gc-prog-track"><div class="gc-prog-fill" style="width:${pct}%;background:${g.color||colors.blue}"></div></div>
      <div class="gc-nums">
        <span>${fm(g.currentAmount||0)} gespart</span>
        <span class="muted">${fm(rem)} noch offen</span>
        <span>${fm(g.targetAmount||0)} Ziel</span>
      </div>
      ${g.monthlyRate>0?`<div class="gc-rate muted">Sparrate: ${fm(g.monthlyRate)}/Mon</div>`:''}
    </div>`;
  }).join('');

  // ── CSS ────────────────────────────
  const css = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --panel:  ${colors.panel};
      --panel2: ${colors.panel2};
      --border: ${colors.border};
      --text:   ${colors.text};
      --text2:  ${colors.text2};
      --text3:  ${colors.text3};
      --blue:   ${colors.blue};
      --green:  ${colors.green};
      --red:    ${colors.red};
      --amber:  ${colors.amber};
    }
    @page { size: A4; margin: 14mm 14mm 16mm; }
    body  { background: ${colors.bg}; color: ${colors.text}; font-family: 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 9pt; line-height: 1.5; }

    /* Header */
    .ph { display: flex; justify-content: space-between; align-items: flex-start;
          border-bottom: 2px solid ${colors.blue}; padding-bottom: 8px; margin-bottom: 14px; }
    .ph-logo { display: flex; gap: 10px; align-items: center; }
    .ph-logo-mark { width: 34px; height: 34px; background: #1a56db; border-radius: 7px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 13pt; font-weight: 900; color: #fff; letter-spacing: -1px; }
    .ph-app   { font-size: 10pt; font-weight: 700; color: ${colors.text}; font-family: 'Segoe UI', Arial, sans-serif; }
    .ph-sub   { font-size: 7pt; color: ${colors.text3}; }
    .ph-right { text-align: right; }
    .ph-title { font-size: 11pt; font-weight: 700; color: ${colors.blue}; }
    .ph-date  { font-size: 7pt; color: ${colors.text3}; margin-top: 2px; }

    /* Footer */
    .pf { display: flex; justify-content: space-between;
          border-top: 1px solid ${colors.border}; padding-top: 5px;
          margin-top: 12px; font-size: 6.5pt; color: ${colors.text3}; }

    /* Section heading */
    .sec { font-size: 9pt; font-weight: 700; color: ${colors.blue};
           border-left: 3px solid ${colors.blue}; padding-left: 8px;
           margin: 16px 0 8px; }

    /* KPI Cards */
    .kpi-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; margin-bottom: 14px; }
    .kpi-card { background: ${colors.panel}; border: 1px solid ${colors.border};
                border-radius: 6px; padding: 9px 11px; }
    .kpi-lbl  { font-size: 7pt; color: ${colors.text3}; text-transform: uppercase; letter-spacing: .3px; font-weight: 600; }
    .kpi-val  { font-size: 14pt; font-weight: 700; margin: 3px 0 1px; }
    .kpi-sub  { font-size: 6.5pt; color: ${colors.text3}; }

    /* Tables */
    table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
    th    { background: ${colors.panel2}; color: ${colors.text3}; font-size: 7pt; font-family: 'Segoe UI', Arial, sans-serif;
            text-transform: uppercase; letter-spacing: .4px; padding: 5px 7px;
            border-bottom: 2px solid ${colors.border}; text-align: left; font-weight: 700; }
    td    { padding: 5px 7px; border-bottom: 1px solid ${colors.border};
            color: ${colors.text2}; font-size: 7.5pt; vertical-align: middle; font-weight: 500; }
    tr:last-child td { border-bottom: none; }
    tfoot td { border-top: 1px solid ${colors.border}; border-bottom: none;
               font-weight: 700; color: ${colors.text}; background: ${colors.panel2}; }
    .group-row td { background: ${colors.panel2}; color: #000000; font-size: 7pt; font-weight: 600;
                    padding: 4px 7px; border-top: 1px solid ${colors.border}; }
    .r      { text-align: right; }
    .center { text-align: center; }
    .muted  { color: #333333 !important; font-weight: 500; }
    .mono   { font-family: 'Courier New', monospace; font-size: 7.5pt; }
    .pos    { color: ${colors.green} !important; }
    .neg    { color: ${colors.red} !important; }
    .urgent-row td { background: rgba(255,77,106,.06); }
    .nextm-row td  { color: ${colors.text3}; }
    .empty-row { color: ${colors.text3}; font-size: 7pt; }

    /* Badges */
    .badge { display: inline-block; font-size: 6pt; font-weight: 700;
             padding: 1px 6px; border-radius: 4px; letter-spacing: .3px; }
    .badge-green { background: rgba(0,229,160,.12); color: ${colors.green}; border: 1px solid rgba(0,229,160,.25); }
    .badge-red   { background: rgba(255,77,106,.12); color: ${colors.red};   border: 1px solid rgba(255,77,106,.25); }
    .badge-amber { background: rgba(255,181,71,.12); color: ${colors.amber}; border: 1px solid rgba(255,181,71,.25); }

    /* Day pill */
    .day-pill { display: inline-block; background: ${colors.panel2}; border: 1px solid ${colors.border};
                border-radius: 4px; padding: 1px 5px; font-size: 6.5pt;
                color: ${colors.text3}; margin-right: 5px; }

    /* Cockpit due-list */
    .cockpit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .cockpit-col  { background: ${colors.panel}; border: 1px solid ${colors.border};
                    border-radius: 6px; padding: 10px 12px; }
    .cc-lbl  { font-size: 7.5pt; font-weight: 700; color: ${colors.text2}; margin-bottom: 6px; }
    .prog-track { height: 3px; background: ${colors.border}; border-radius: 2px; margin-bottom: 4px; }
    .prog-fill  { height: 3px; background: ${colors.blue}; border-radius: 2px; }
    .prog-lbl   { display: flex; justify-content: space-between; font-size: 6pt; color: ${colors.text3}; margin-bottom: 8px; }
    .sum-row    { display: flex; justify-content: space-between; padding: 3px 0;
                  border-bottom: 1px solid ${colors.border}; font-size: 7.5pt; }
    .sum-row.total { font-weight: 700; border-bottom: none; margin-top: 2px; font-size: 8pt; }
    .sum-lbl { color: ${colors.text3}; }

    /* Jahresübersicht */
    .year-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 7px; }
    .year-card { background: ${colors.panel}; border: 1px solid ${colors.border};
                 border-radius: 5px; padding: 7px 8px; }
    .year-card--cur { border-color: ${colors.blue}; background: ${colors.panel2}; }
    .yc-month { font-size: 7.5pt; font-weight: 700; color: ${colors.text2}; margin-bottom: 4px; }
    .yc-row   { display: flex; justify-content: space-between; font-size: 6.5pt; margin-bottom: 1px; }
    .yc-lbl   { color: ${colors.text3}; }
    .yc-val   { font-weight: 600; }
    .yc-bal   { font-size: 8.5pt; font-weight: 700; margin-top: 4px; text-align: right; }

    /* Sparziele */
    .goals-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; }
    .goal-card-p { background: ${colors.panel}; border: 1px solid ${colors.border};
                   border-radius: 5px; padding: 9px 10px; }
    .gc-top  { display: flex; gap: 7px; align-items: flex-start; margin-bottom: 6px; }
    .gc-icon { font-size: 14pt; line-height: 1; }
    .gc-name { font-size: 7.5pt; font-weight: 700; color: ${colors.text}; }
    .gc-dead { font-size: 6pt; margin-top: 1px; }
    .gc-pct  { margin-left: auto; font-size: 10pt; font-weight: 700; }
    .gc-prog-track { height: 3px; background: ${colors.border}; border-radius: 2px; margin-bottom: 5px; }
    .gc-prog-fill  { height: 3px; border-radius: 2px; }
    .gc-nums { display: flex; justify-content: space-between; font-size: 6pt; color: ${colors.text3}; }
    .gc-rate { font-size: 6.5pt; margin-top: 4px; }

    /* Page breaks */
    .page-break { page-break-before: always; margin-top: 14mm; }

    /* Farbtreue beim Drucken / PDF — immer hell */
    @media print {
      html, body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
                   background: #fff !important; color: #000 !important; color-scheme: light; }
      td, th { color: #111111 !important; }
      .muted { color: #333333 !important; }
      .print-toolbar { display: none !important; }
      .content { margin-top: 0 !important; }
    }

    /* Print toolbar (screen only) */
    @media screen {
      body { padding: 20px; max-width: 860px; margin: 0 auto; }
      .print-toolbar {
        position: fixed; top: 0; left: 0; right: 0; z-index: 999;
        background: ${colors.panel2}; border-bottom: 1px solid ${colors.border};
        display: flex; align-items: center; gap: 10px; padding: 10px 20px;
      }
      .print-toolbar h2 { font-size: 10pt; color: ${colors.text2}; margin: 0; flex: 1; }
      .pb { display: inline-block; padding: 7px 16px; border-radius: 6px; font-size: 8.5pt;
            font-weight: 600; cursor: pointer; border: none; font-family: inherit; }
      .pb-primary { background: ${colors.blue}; color: ${colors.bg}; }
      .pb-pdf     { background: rgba(255,181,71,.15); color: ${colors.amber}; border: 1px solid rgba(255,181,71,.3); }
      .pb-close   { background: transparent; color: ${colors.text3}; border: 1px solid ${colors.border}; }
      .content    { margin-top: 54px; }
    }
  `;

  // ── Aktive Seite erkennen ────────────
  const _activePage = (() => {
    const p = document.querySelector('.page.active');
    return p ? p.id.replace('p-', '') : 'dashboard';
  })();

  // ── Seitenspezifischer Inhalt ────────
  const _pageContent = (() => {
    switch (_activePage) {

      case 'dashboard':
        return `
  ${header('Dashboard — Übersicht & Zahlungsplan', `${MONTHS[mIdx]} ${yr} · Stand heute`)}
  <div class="kpi-row">
    ${kpiCard('Gesamtvermögen', fm(totalBal), `${S.accounts.filter(a=>a.include).length} Konten einbezogen`, colors.blue)}
    ${kpiCard('Monatseinkommen', fm(mainIncome), `Zahltag ${getZahltag()}. des Monats`, colors.green)}
    ${kpiCard('Fixausgaben Ø/Mon', fm(fixOut), `${S.data.filter(p=>p.type==='ausgabe').length} Posten`, colors.red)}
    ${kpiCard('Variabel verfügbar', fm(frei,true), 'Eingang − Fixkosten', frei>=0?colors.green:colors.red)}
  </div>
  <div class="sec">Zahlungsplan bis Zahltag (${getZahltag()}. ${MONTHS_S[d.nextZahltag.getMonth()]})</div>
  <div class="cockpit-grid">
    <div class="cockpit-col">
      <div class="cc-lbl">${main ? esc2(main.label) : 'Hauptkonto'}</div>
      <div class="prog-track"><div class="prog-fill" style="width:${d.pct}%"></div></div>
      <div class="prog-lbl"><span>${getZahltag()}. ${MONTHS_S[mIdx===0?11:mIdx-1]}</span><span>${getZahltag()}. ${MONTHS_S[d.nextZahltag.getMonth()]}</span></div>
      <div class="sum-row"><span class="sum-lbl">Kontostand</span><span style="color:${colors.blue}">${fm(d.mainBal)}</span></div>
      <div class="sum-row"><span class="sum-lbl">Noch fällig</span><span style="color:${colors.red}">−${fm(d.totalFix)}</span></div>
      <div class="sum-row total"><span class="sum-lbl">Verbleibend</span><span style="color:${d.verbleibend>=0?colors.green:colors.red}">${fm(d.verbleibend,true)}</span></div>
    </div>
    <div class="cockpit-col">
      <div class="cc-lbl">Alle fälligen Posten (${allIt.length})</div>
      <table><tbody>${dueRows(allIt)}</tbody></table>
    </div>
  </div>
  <div class="sec">Kontostände</div>
  <table>
    <thead><tr><th>Konto</th><th>Typ</th><th>IBAN</th><th class="r">Stand</th><th class="center">Ein</th></tr></thead>
    <tbody>${kontenRows}</tbody>
    <tfoot><tr><td colspan="3"><strong>Gesamt (einbezogen)</strong></td><td class="r">${fm(totalBal)}</td><td></td></tr></tfoot>
  </table>
  ${footer}`;

      case 'posten':
        return `
  ${header('Einnahmen & Ausgaben', 'Alle festen Posten')}
  <div class="kpi-row">
    ${kpiCard('Einnahmen Ø/Mon', fm(fixIn), `${S.data.filter(p=>p.type==='einnahme').length} Posten`, colors.green)}
    ${kpiCard('Ausgaben Ø/Mon', fm(fixOut), `${S.data.filter(p=>p.type==='ausgabe').length} Posten`, colors.red)}
    ${kpiCard('Saldo Ø/Mon', fm(frei,true), 'Einnahmen − Ausgaben', frei>=0?colors.green:colors.red)}
    ${kpiCard('Posten gesamt', S.data.length, 'Alle Einträge', colors.blue)}
  </div>
  <div class="sec">Alle festen Posten (${S.data.length})</div>
  <table>
    <thead><tr><th>Bezeichnung</th><th>Typ</th><th>Intervall</th><th class="center">Fällig</th><th>Konto</th><th class="r">Betrag</th><th class="r">Ø/Mon</th></tr></thead>
    <tbody>${postenRows}</tbody>
    <tfoot><tr><td colspan="5"><strong>Monatssaldo Ø</strong></td><td></td>
      <td class="r" style="color:${frei>=0?colors.green:colors.red}"><strong>${fm(frei,true)}</strong></td></tr></tfoot>
  </table>
  ${footer}`;

      case 'vertraege':
        return `
  ${header('Verträge & Laufzeiten', `${ctItems.length} Verträge`)}
  <div class="kpi-row">
    ${kpiCard('Aktive Verträge', ctItems.filter(p=>!p.contractEnd||new Date(p.contractEnd)>=n).length, 'Noch laufend', colors.blue)}
    ${kpiCard('Laufen bald aus', ctItems.filter(p=>{ const e=p.contractEnd?new Date(p.contractEnd):null; const diff=e?Math.round((e-n)/86400000):null; return diff!==null&&diff>=0&&diff<=90; }).length, 'In 90 Tagen', colors.amber)}
    ${kpiCard('Monatl. Kosten', fm(ctItems.reduce((s,p)=>s+(p.type==='ausgabe'?avgMonthly(p):0),0)), 'Alle Verträge Ø/Mon', colors.red)}
    ${kpiCard('Verträge gesamt', ctItems.length, 'Mit Laufzeitdaten', colors.blue)}
  </div>
  <div class="sec">Verträge & Laufzeiten</div>
  ${ctItems.length > 0
    ? `<table><thead><tr><th>Bezeichnung</th><th>Start</th><th>Ende</th><th class="r">Betrag</th><th>Intervall</th><th>Status</th></tr></thead><tbody>${ctRows}</tbody></table>`
    : `<p class="muted" style="font-size:7.5pt;padding:6px 0;">Keine Verträge hinterlegt.</p>`}
  ${footer}`;

      case 'jahr':
        return `
  ${header('Jahresübersicht', `${yr}`)}
  <div class="kpi-row">
    ${kpiCard('Gesamtvermögen', fm(totalBal), 'Alle Konten einbezogen', colors.blue)}
    ${kpiCard('Einnahmen Ø/Mon', fm(fixIn), `${yr}`, colors.green)}
    ${kpiCard('Ausgaben Ø/Mon', fm(fixOut), `${yr}`, colors.red)}
    ${kpiCard('Saldo Ø/Mon', fm(frei,true), `${yr}`, frei>=0?colors.green:colors.red)}
  </div>
  <div class="sec">Jahresübersicht ${yr}</div>
  <div class="year-grid">${yearCards}</div>
  ${footer}`;

      case 'goals':
        return `
  ${header('Sparziele', `${(S.goals||[]).length} Ziele · Stand heute`)}
  <div class="kpi-row">
    ${kpiCard('Aktive Ziele', (S.goals||[]).length, 'Gesamt', colors.blue)}
    ${kpiCard('Gesamt gespart', fm((S.goals||[]).reduce((s,g)=>s+(g.currentAmount||0),0)), 'Über alle Ziele', colors.green)}
    ${kpiCard('Noch offen', fm((S.goals||[]).reduce((s,g)=>s+Math.max(0,(g.targetAmount||0)-(g.currentAmount||0)),0)), 'Bis Zielerfüllung', colors.amber)}
    ${kpiCard('Sparrate Ø/Mon', fm((S.goals||[]).reduce((s,g)=>s+(g.monthlyRate||0),0)), 'Alle Ziele', colors.blue)}
  </div>
  <div class="sec">Sparziele</div>
  <div class="goals-grid">${goalCards}</div>
  ${footer}`;

      case 'umsaetze': {
        const mKey = `${yr}-${String(mIdx+1).padStart(2,'0')}`;
        const monthBk = (S.bookings||[])
          .filter(b => b.monthKey === mKey && ['gebucht','geändert','beglichen'].includes(b.status))
          .sort((a,b) => a.date > b.date ? 1 : -1);
        const totalIn  = monthBk.filter(b=>b.type==='einnahme').reduce((s,b)=>s+(b.amount||0),0);
        const totalOut = monthBk.filter(b=>b.type==='ausgabe').reduce((s,b)=>s+(b.amount||0),0);
        const bkRows = monthBk.map(b => {
          const isOut = b.type === 'ausgabe';
          const postenCatId = b.postenId ? ((S.data||[]).find(p=>p.id===b.postenId)||{}).categoryId : null;
          const catId = b.categoryId || postenCatId;
          const cat = catId ? (S.categories||[]).find(c=>c.id===catId) : null;
          const catBadge = cat
            ? `<span class="badge" style="background:${cat.color}22;color:${cat.color};border:1px solid ${cat.color}44">${esc2(cat.icon||'')} ${esc2(cat.name)}</span>`
            : '<span class="muted">—</span>';
          const statusCls = b.status==='beglichen'?'badge-green':b.status==='geändert'?'badge-amber':'badge-green';
          return `<tr>
            <td class="mono muted" style="font-size:7pt">${esc2(b.date)}</td>
            <td>${esc2(b.name)}</td>
            <td class="muted">${esc2(typeof accLabel==='function'?accLabel(b.accountId):b.accountId||'—')}</td>
            <td>${catBadge}</td>
            <td><span class="badge ${statusCls}">${esc2(b.status)}</span></td>
            <td class="r ${isOut?'neg':'pos'}">${isOut?'−':'+'}${fm(b.amount||0)}</td>
          </tr>`;
        }).join('') || `<tr><td colspan="6" class="empty-row">Keine Buchungen in diesem Monat</td></tr>`;
        return `
  ${header('Buchungshistorie', `${MONTHS[mIdx]} ${yr} · ${monthBk.length} Buchungen`)}
  <div class="kpi-row">
    ${kpiCard('Buchungen', monthBk.length, `${MONTHS[mIdx]} ${yr}`, colors.blue)}
    ${kpiCard('Einnahmen', fm(totalIn), 'Monat', colors.green)}
    ${kpiCard('Ausgaben', fm(totalOut), 'Monat', colors.red)}
    ${kpiCard('Saldo', fm(totalIn-totalOut,true), 'Netto', (totalIn-totalOut)>=0?colors.green:colors.red)}
  </div>
  <div class="sec">Buchungen ${MONTHS[mIdx]} ${yr}</div>
  <table>
    <thead><tr><th>Datum</th><th>Bezeichnung</th><th>Konto</th><th>Kategorie</th><th>Status</th><th class="r">Betrag</th></tr></thead>
    <tbody>${bkRows}</tbody>
    <tfoot><tr><td colspan="4"></td><td class="r"><strong>Netto</strong></td>
      <td class="r" style="color:${(totalIn-totalOut)>=0?colors.green:colors.red}"><strong>${fm(totalIn-totalOut,true)}</strong></td></tr></tfoot>
  </table>
  ${footer}`;
      }

      case 'kreditoren': {
        const creds = S.creditors || [];
        const credRows = creds.map(c => {
          const acc = c.accountId ? (S.accounts||[]).find(a=>a.id===c.accountId) : null;
          return `<tr>
            <td><strong>${esc2(c.name)}</strong></td>
            <td class="muted">${esc2(c.email||'—')}</td>
            <td class="muted">${esc2(c.phone||'—')}</td>
            <td class="muted">${acc ? esc2(acc.label) : '—'}</td>
            <td class="muted" style="max-width:160px;overflow:hidden;text-overflow:ellipsis">${esc2(c.note||'—')}</td>
          </tr>`;
        }).join('') || `<tr><td colspan="5" class="empty-row">Keine Kreditoren hinterlegt.</td></tr>`;
        return `
  ${header('Kreditoren & Zahlungsempfänger', `${creds.length} Einträge`)}
  <div class="kpi-row">
    ${kpiCard('Kreditoren', creds.length, 'Eingetragen', colors.blue)}
    ${kpiCard('Mit Konto', creds.filter(c=>c.accountId).length, 'Verknüpft', colors.green)}
    ${kpiCard('Mit E-Mail', creds.filter(c=>c.email).length, 'Eingetragen', colors.blue)}
    ${kpiCard('Mit Notiz', creds.filter(c=>c.note).length, 'Eingetragen', colors.amber)}
  </div>
  <div class="sec">Kreditoren & Zahlungsempfänger</div>
  <table>
    <thead><tr><th>Name</th><th>E-Mail</th><th>Telefon</th><th>Konto</th><th>Notiz</th></tr></thead>
    <tbody>${credRows}</tbody>
  </table>
  ${footer}`;
      }

      case 'pivot': {
        const pvYr = yr;
        const pvRows = (S.data||[]).map(p => {
          const cells = Array.from({length:12},(_,m) => {
            const overrideKey = `${pvYr}-${m+1}`;
            let v = 0;
            if (p.overrides && p.overrides[overrideKey] !== undefined) {
              v = p.overrides[overrideKey];
            } else if (typeof activeInMonth === 'function' && activeInMonth(p, m, pvYr)) {
              v = p.amount || 0;
            }
            const cls = v > 0 ? (p.type==='ausgabe'?'neg':'pos') : 'muted';
            return `<td class="r ${cls}" style="font-size:6pt;padding:4px 5px">${v>0?(typeof fmShort==='function'?fmShort(v):v):'—'}</td>`;
          }).join('');
          return `<tr>
            <td style="max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc2(p.name)}</td>
            <td><span class="badge ${p.type==='ausgabe'?'badge-red':'badge-green'}">${p.type==='ausgabe'?'A':'E'}</span></td>
            ${cells}
          </tr>`;
        }).join('') || `<tr><td colspan="14" class="empty-row">Keine Posten vorhanden.</td></tr>`;
        const moHdr = MONTHS_S.map(m=>`<th class="r" style="font-size:6pt;padding:4px 5px">${m}</th>`).join('');
        return `
  ${header('Pivot-Tabelle', `${pvYr} — Monatliche Übersicht`)}
  <div class="sec">Einnahmen & Ausgaben ${pvYr}</div>
  <div style="overflow-x:auto">
  <table style="min-width:100%;table-layout:fixed">
    <thead><tr><th style="width:110px">Bezeichnung</th><th style="width:28px">Typ</th>${moHdr}</tr></thead>
    <tbody>${pvRows}</tbody>
  </table>
  </div>
  ${footer}`;
      }

      default:
        // Alle Seiten als Fallback
        return `
  ${header('Übersicht & Zahlungsplan', `${MONTHS[mIdx]} ${yr} · Stand heute`)}
  <div class="kpi-row">
    ${kpiCard('Gesamtvermögen', fm(totalBal), `${S.accounts.filter(a=>a.include).length} Konten einbezogen`, colors.blue)}
    ${kpiCard('Monatseinkommen', fm(mainIncome), `Zahltag ${getZahltag()}. des Monats`, colors.green)}
    ${kpiCard('Fixausgaben Ø/Mon', fm(fixOut), `${S.data.filter(p=>p.type==='ausgabe').length} Posten`, colors.red)}
    ${kpiCard('Variabel verfügbar', fm(frei,true), 'Eingang − Fixkosten', frei>=0?colors.green:colors.red)}
  </div>
  <div class="sec">Kontostände</div>
  <table>
    <thead><tr><th>Konto</th><th>Typ</th><th>IBAN</th><th class="r">Stand</th><th class="center">Ein</th></tr></thead>
    <tbody>${kontenRows}</tbody>
    <tfoot><tr><td colspan="3"><strong>Gesamt</strong></td><td class="r">${fm(totalBal)}</td><td></td></tr></tfoot>
  </table>
  ${footer}
  <div class="page-break">
  ${header('Einnahmen & Ausgaben', 'Alle festen Posten')}
  <table>
    <thead><tr><th>Bezeichnung</th><th>Typ</th><th>Intervall</th><th class="center">Fällig</th><th>Konto</th><th class="r">Betrag</th><th class="r">Ø/Mon</th></tr></thead>
    <tbody>${postenRows}</tbody>
  </table>
  ${footer}</div>
  <div class="page-break">
  ${header('Verträge & Jahresübersicht', `${yr}`)}
  ${ctItems.length > 0
    ? `<table><thead><tr><th>Bezeichnung</th><th>Start</th><th>Ende</th><th class="r">Betrag</th><th>Intervall</th><th>Status</th></tr></thead><tbody>${ctRows}</tbody></table>`
    : ''}
  <div class="sec">Jahresübersicht ${yr}</div>
  <div class="year-grid">${yearCards}</div>
  ${footer}</div>
  ${(S.goals||[]).length > 0 ? `<div class="page-break">
  ${header('Sparziele', `${(S.goals||[]).length} Ziele`)}
  <div class="goals-grid">${goalCards}</div>
  ${footer}</div>` : ''}`;
    }
  })();

  const _pageTitle = {
    dashboard: 'Dashboard', posten: 'Einnahmen & Ausgaben',
    vertraege: 'Verträge', jahr: 'Jahresübersicht',
    goals: 'Sparziele', pivot: 'Pivot', umsaetze: 'Buchungshistorie',
    kreditoren: 'Kreditoren',
  }[_activePage] || 'Gesamtübersicht';

  // ── HTML zusammenbauen ───────────────
  const allHTML = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>VaultBox — ${_pageTitle}</title>
  <style>${css}</style>
</head>
<body>
  <div class="print-toolbar">
    <h2>📄 ${_pageTitle} — VaultBox</h2>
    <button class="pb pb-pdf" onclick="window.print()">⬇ Als PDF speichern</button>
    <button class="pb pb-primary" onclick="window.print()">🖨 Drucken</button>
    <button class="pb pb-close" onclick="window.close()">✕ Schließen</button>
  </div>
  <div class="content">
  ${_pageContent}
  </div>
</body>
</html>`;

    // Electron: eigene BrowserWindow via IPC
  if (window.csf && window.csf.print && window.csf.print.html) {
    window.csf.print.html(allHTML);
  }
}