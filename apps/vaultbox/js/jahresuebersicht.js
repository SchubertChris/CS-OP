// ══════════════════════════════════════
//  JAHRESÜBERSICHT — Karten · Diagramme · Jahresvergleich
// ══════════════════════════════════════

let _jahresChart = null;
let _sparChart = null;
let _verglChart = null;
let _candleChart    = null;
let _candleRange    = "1J";   // "3M" | "6M" | "1J" | "2J" | "5J" | "MAX"
let _candleInterval = "1M";   // "1T" | "1W" | "1M"  — Kerzenintervall (Default: Monat)
let _candleType     = "candle"; // "candle" | "line" | "area"
let _candleCompare  = false;  // Income vs Expense Vergleich einblenden
let _candleGrowth   = false;  // Netto-Wachstumslinie einblenden
let _jahrA = new Date().getFullYear();
let _jahrB = new Date().getFullYear() - 1;
let _compareMode = false;
let _jahrView = "cards"; // "cards" | "list"
let _jahrMA = false; // Gleitender Durchschnitt (3-Monats-MA)

// ══════════════════════════════════════
//  MONATS-ANNOTATION
// ══════════════════════════════════════
async function _jahrEditNote(monthKey, evt) {
  if (evt) { evt.stopPropagation(); evt.preventDefault(); }
  if (!S.yearNotes) S.yearNotes = {};
  const existing = S.yearNotes[monthKey] || "";
  const val = await appPrompt(
    `Notiz für ${monthKey} (max. 80 Zeichen):`,
    { value: existing, placeholder: "z.B. Urlaub, Jahresrechnung …", maxLength: 80 }
  );
  if (val === null) return;
  if (val.trim() === "") {
    delete S.yearNotes[monthKey];
  } else {
    S.yearNotes[monthKey] = val.trim().slice(0, 80);
  }
  persist();
  renderJahr();
}

// ══════════════════════════════════════
//  CANDLESTICK — TradingView-Style
// ══════════════════════════════════════

// Gibt den Bucket-Key für ein Datum zurück je nach Intervall
function _candleBucketKey(dateStr, interval) {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (interval === "1J") return `${y}-01-01`;
  if (interval === "1M") return `${y}-${String(m).padStart(2,"0")}-01`;
  if (interval === "1W") {
    // ISO-Woche: Montag-Basis
    const dt = new Date(Date.UTC(y, m - 1, d));
    const day = dt.getUTCDay() || 7; // Sonntag=7
    dt.setUTCDate(d - day + 1);      // Montag dieser Woche
    return dt.toISOString().slice(0, 10);
  }
  return dateStr.slice(0, 10); // "1T" = täglich
}

function _buildCandleData() {
  // ── Welche Konten fließen ein? ────────────────────────────────────────────
  // Alle Konten mit include:true (Giro, Visa, Tagesgeld, etc.)
  // Depot + VL werden als separate Anlagelinie mitgeführt (immer)
  const includedIds  = new Set((S.accounts || []).filter(a => a.include).map(a => a.id));
  const investIds    = new Set((S.accounts || []).filter(a =>
    ["depot","vl","festgeld"].includes(a.accountType)).map(a => a.id));

  // ── Alle Ereignisse als flache Liste zusammenstellen ──────────────────────
  const events = []; // { date, inc, exp, invest }

  // 1. Buchungen (Fixposten: Einnahmen + Ausgaben)
  (S.bookings || []).forEach(bk => {
    if (!bk.date || bk.status === "ausgesetzt") return;
    if (bk.type === "umbuchung") return;
    // Konten mit include:true → Hauptbalance; invest-Konten ohne include → Anlage-Serie
    const forMain   = includedIds.has(bk.accountId);
    const forInvest = !forMain && investIds.has(bk.accountId);
    const amt = Math.abs(bk.amount || 0);
    if (bk.type === "einnahme") {
      events.push({ date: bk.date, inc: forMain ? amt : 0, exp: 0, invest: forInvest ? amt : 0 });
    } else {
      events.push({ date: bk.date, inc: 0, exp: forMain ? amt : 0, invest: 0 });
    }
  });

  // 2. Transfers — Sparraten in Depot/VL/Festgeld → Anlage-Serie
  (S.transfers || []).forEach(tr => {
    if (!tr.date) return;
    const amt = Math.abs(tr.amount || 0);
    const toInvest  = investIds.has(tr.toId);
    const fromMain  = includedIds.has(tr.fromId);
    // Abfluss aus Hauptkonto (Ausgabe), Zufluss ins Depot = Invest-Wachstum
    if (fromMain) {
      events.push({ date: tr.date, inc: 0, exp: amt, invest: toInvest ? amt : 0 });
    } else if (toInvest) {
      // Interner Transfer innerhalb Invest (z.B. Tagesgeld→Festgeld) — nur Invest-Seite
      events.push({ date: tr.date, inc: 0, exp: 0, invest: 0 });
    }
  });

  if (!events.length) return { candles: [], incLine: [], expLine: [], netLine: [], investLine: [] };

  events.sort((a, b) => a.date.localeCompare(b.date));

  // ── Nach Bucket aggregieren ───────────────────────────────────────────────
  const buckets = {};
  events.forEach(ev => {
    const key = _candleBucketKey(ev.date, _candleInterval);
    if (!buckets[key]) buckets[key] = { inc: 0, exp: 0, invest: 0 };
    buckets[key].inc    += ev.inc;
    buckets[key].exp    += ev.exp;
    buckets[key].invest += ev.invest;
  });

  // ── Lücken auffüllen: bei 1T/1W jeden Tag/Woche ohne Buchung als Null-Bucket einfügen ──
  const sortedKeys = Object.keys(buckets).sort();
  if (sortedKeys.length >= 2) {
    let cur  = new Date(sortedKeys[0] + "T00:00:00Z");
    const last = new Date(sortedKeys[sortedKeys.length - 1] + "T00:00:00Z");
    while (cur <= last) {
      const dateStr = cur.toISOString().slice(0, 10);
      const key = _candleBucketKey(dateStr, _candleInterval);
      if (!buckets[key]) buckets[key] = { inc: 0, exp: 0, invest: 0 };
      if (_candleInterval === "1J") {
        cur = new Date(Date.UTC(cur.getUTCFullYear() + 1, 0, 1));
      } else if (_candleInterval === "1M") {
        cur = new Date(Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth() + 1, 1));
      } else if (_candleInterval === "1W") {
        cur = new Date(cur.getTime() + 7 * 24 * 3600 * 1000);
      } else {
        cur = new Date(cur.getTime() + 24 * 3600 * 1000);
      }
    }
  }

  // ── Zeitreihen aufbauen ───────────────────────────────────────────────────
  // Startkapital = Summe der aktuellen Kontostände (nur included Konten)
  // Da wir historisch aufbauen, starten wir bei 0 (relative Entwicklung)
  let balance = 0, cumInc = 0, cumExp = 0, cumInvest = 0;
  const candles = [], incLine = [], expLine = [], netLine = [], investLine = [];

  Object.keys(buckets).sort().forEach(key => {
    const g = buckets[key];
    const open  = parseFloat(balance.toFixed(2));
    const net   = g.inc - g.exp;
    balance    += net;
    cumInc     += g.inc;
    cumExp     += g.exp;
    cumInvest  += g.invest;

    const close = parseFloat(balance.toFixed(2));
    // Dochte: High zeigt Einnahmen-Peak, Low zeigt Ausgaben-Tal
    const high  = parseFloat((Math.max(open, close) + g.inc  * 0.05).toFixed(2));
    const low   = parseFloat((Math.min(open, close) - g.exp  * 0.05).toFixed(2));

    candles.push({ time: key, open, high, low, close });
    incLine.push({ time: key, value: parseFloat(cumInc.toFixed(2)) });
    expLine.push({ time: key, value: parseFloat(cumExp.toFixed(2)) });
    netLine.push({ time: key, value: parseFloat((cumInc - cumExp).toFixed(2)) });
    investLine.push({ time: key, value: parseFloat(cumInvest.toFixed(2)) });
  });

  // Heute-Bucket: Grenze zwischen Ist und Prognose
  const _tn = new Date();
  const _todayStr = `${_tn.getFullYear()}-${String(_tn.getMonth()+1).padStart(2,"0")}-${String(_tn.getDate()).padStart(2,"0")}`;
  const todayKey = _candleBucketKey(_todayStr, _candleInterval);

  return { candles, incLine, expLine, netLine, investLine, todayKey };
}

function _candleFilterRange(arr) {
  if (_candleRange === "MAX") return arr;
  if (_candleRange === "YTD") {
    const ytd = new Date().getFullYear() + "-01-01";
    return arr.filter(c => (c.time || c) >= ytd);
  }
  const months = { "1J": 12, "2J": 24, "3J": 36, "5J": 60 }[_candleRange] || 12;
  const now = new Date();
  const cutoff = new Date(Date.UTC(now.getFullYear(), now.getMonth() - months, 1));
  const cutStr = cutoff.toISOString().slice(0, 10);
  return arr.filter(c => (c.time || c) >= cutStr);
}

// Guard: verhindert parallele Aufrufe (z.B. rAF + ResizeObserver gleichzeitig)
let _candleBuilding = false;

function _refreshCandleChart() {
  if (_candleBuilding) return;
  _candleBuilding = true;

  // Sync all control buttons
  document.querySelectorAll("#candleRangeRow .tf-chip").forEach(b =>
    b.classList.toggle("active", b.dataset.range === _candleRange));
  document.querySelectorAll("#candleIntervalRow .tf-chip").forEach(b =>
    b.classList.toggle("active", b.dataset.itv === _candleInterval));
  document.querySelectorAll(".ct-btn[data-type]").forEach(b =>
    b.classList.toggle("active", b.dataset.type === _candleType));
  const cmpBtn = document.getElementById("candleCmpBtn");
  if (cmpBtn) cmpBtn.classList.toggle("active", _candleCompare);
  const growthBtn = document.getElementById("candleGrowthBtn");
  if (growthBtn) growthBtn.classList.toggle("active", _candleGrowth);

  const container = document.getElementById("jahresCandleChart");
  if (!container) { _candleBuilding = false; return; }
  if (typeof LightweightCharts === "undefined") {
    container.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text3);font-size:.8em">Chart-Bibliothek wird geladen…</div>';
    _candleBuilding = false;
    return;
  }

  // ResizeObserver zuerst trennen, damit kein Re-Trigger während Umbau
  if (window._candleResizeObs) { window._candleResizeObs.disconnect(); window._candleResizeObs = null; }

  // Chart vollständig entfernen — erst remove(), dann DOM leeren
  if (_candleChart) {
    try { _candleChart.remove(); } catch(e) {}
    _candleChart = null;
  }
  container.innerHTML = "";

  const { candles: allCandles, incLine: allInc, expLine: allExp, netLine: allNet, investLine: allInvest, todayKey } = _buildCandleData();
  const candles    = _candleFilterRange(allCandles);
  const incLine    = _candleFilterRange(allInc);
  const expLine    = _candleFilterRange(allExp);
  const netLine    = _candleFilterRange(allNet);
  const investLine = _candleFilterRange(allInvest);

  if (!candles.length) {
    container.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text3);font-size:.8em">Keine Buchungsdaten für diesen Zeitraum</div>';
    _candleBuilding = false;
    return;
  }

  // Split Ist vs. Prognose am heutigen Bucket
  // firstForecastIdx = erster Bucket >= todayKey
  const firstForecastIdx = candles.findIndex(c => c.time >= todayKey);
  const confirmedCandles = firstForecastIdx > 0 ? candles.slice(0, firstForecastIdx) : (firstForecastIdx === 0 ? [] : candles);
  const forecastCandles  = firstForecastIdx >= 0 ? candles.slice(firstForecastIdx) : [];
  // Verbindungspunkt: letzter confirmed-Punkt wird als erster forecast-Punkt wiederholt
  const bridgeCandle = confirmedCandles.length ? confirmedCandles[confirmedCandles.length - 1] : null;
  const forecastCandlesFull = bridgeCandle && forecastCandles.length ? [bridgeCandle, ...forecastCandles] : forecastCandles;

  function _splitLine(line) {
    const confLine = firstForecastIdx > 0 ? line.slice(0, firstForecastIdx) : (firstForecastIdx === 0 ? [] : line);
    const fcLine   = firstForecastIdx >= 0 ? line.slice(Math.max(0, firstForecastIdx - 1)) : [];
    return { confLine, fcLine };
  }

  const textCol  = _jcss("--text3")   || "#6b7a99";
  const blue     = _jcss("--blue")    || "#4d9eff";
  const green    = _jcss("--green")   || "#00e5a0";
  const red      = _jcss("--red")     || "#ff4d6a";
  const panel2   = _jcss("--panel2")  || "#1d2235";
  const purple   = _jcss("--purple")  || "#7b5fff";
  const gold     = _jcss("--yellow")  || "#ffb547";
  const border   = _jcss("--border")  || "rgba(255,255,255,.06)";

  const MONTHS_DE = ["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"];
  function _fmtTick(t, type) {
    let y, m, d;
    if (typeof t === "number") {
      const dt = new Date(t * 1000);
      y = dt.getUTCFullYear(); m = dt.getUTCMonth(); d = dt.getUTCDate();
    } else if (typeof t === "string") {
      const p = t.split("-").map(Number);
      y = p[0]; m = p[1] - 1; d = p[2];
    } else if (t && typeof t === "object") {
      y = t.year; m = (t.month || 1) - 1; d = t.day || 1;
    } else { return ""; }
    if (type === 0) return String(y);
    if (type === 1) return MONTHS_DE[m] + " " + y;
    return d + ". " + MONTHS_DE[m];
  }

  _candleChart = LightweightCharts.createChart(container, {
    width:  container.clientWidth,
    height: container.clientHeight || 380,
    layout: {
      background: { type: "solid", color: "transparent" },
      textColor: textCol,
      fontFamily: "'DM Mono', monospace",
      fontSize: 11,
    },
    grid: {
      vertLines: { color: border, style: 1 },
      horzLines: { color: border, style: 1 },
    },
    crosshair: {
      mode: 1,
      vertLine: { color: textCol, labelBackgroundColor: panel2 },
      horzLine: { color: textCol, labelBackgroundColor: panel2 },
    },
    rightPriceScale: {
      borderVisible: false,
      textColor: textCol,
      scaleMargins: { top: 0.12, bottom: 0.08 },
      autoScale: true,
    },
    timeScale: {
      borderVisible: false,
      textColor: textCol,
      tickMarkFormatter: _fmtTick,
      rightOffset: 6,
    },
    handleScroll: { mouseWheel: true, pressedMouseMove: true },
    handleScale:  { mouseWheel: true, pinch: true },
  });

  const priceFormat = { type: "custom", formatter: v => fm(v, true) };

  // ── Haupt-Serie: Ist (solid) + Prognose (ghost/dashed) ────────────────────
  if (_candleType === "candle") {
    // Bestätigte Kerzen — volle Farben
    if (confirmedCandles.length) {
      _candleChart.addCandlestickSeries({
        upColor: green, downColor: red,
        borderUpColor: green, borderDownColor: red,
        wickUpColor: green, wickDownColor: red, priceFormat,
      }).setData(confirmedCandles);
    }
    // Vorgemerkte Kerzen — ausgeblendet / ghost
    if (forecastCandlesFull.length) {
      _candleChart.addCandlestickSeries({
        upColor: green + "44", downColor: red + "44",
        borderUpColor: green + "77", borderDownColor: red + "77",
        wickUpColor: green + "55", wickDownColor: red + "55", priceFormat,
        lastValueVisible: false,
      }).setData(forecastCandlesFull);
    }
    // Fallback: keine Splits möglich → alles zeigen
    if (!confirmedCandles.length && !forecastCandlesFull.length) {
      _candleChart.addCandlestickSeries({
        upColor: green, downColor: red,
        borderUpColor: green, borderDownColor: red,
        wickUpColor: green, wickDownColor: red, priceFormat,
      }).setData(candles);
    }
  } else if (_candleType === "bar") {
    if (confirmedCandles.length) {
      _candleChart.addBarSeries({ upColor: green, downColor: red, priceFormat }).setData(confirmedCandles);
    }
    if (forecastCandlesFull.length) {
      _candleChart.addBarSeries({ upColor: green + "44", downColor: red + "44", priceFormat, lastValueVisible: false }).setData(forecastCandlesFull);
    }
    if (!confirmedCandles.length && !forecastCandlesFull.length) {
      _candleChart.addBarSeries({ upColor: green, downColor: red, priceFormat }).setData(candles);
    }
  } else if (_candleType === "line") {
    const allClose = candles.map(c => ({ time: c.time, value: c.close }));
    const { confLine: confClose, fcLine: fcClose } = _splitLine(allClose);
    if (confClose.length) {
      _candleChart.addLineSeries({
        color: blue, lineWidth: 2, lineStyle: 0,
        priceLineVisible: false, lastValueVisible: true,
        crosshairMarkerVisible: true, crosshairMarkerRadius: 5, priceFormat,
      }).setData(confClose);
    }
    if (fcClose.length) {
      _candleChart.addLineSeries({
        color: blue + "66", lineWidth: 2, lineStyle: 2,
        priceLineVisible: false, lastValueVisible: true,
        crosshairMarkerVisible: false, priceFormat,
        title: "Prognose",
      }).setData(fcClose);
    }
    if (!confClose.length && !fcClose.length) {
      _candleChart.addLineSeries({ color: blue, lineWidth: 2, priceLineVisible: false, lastValueVisible: true, crosshairMarkerVisible: true, crosshairMarkerRadius: 5, priceFormat }).setData(allClose);
    }
  } else if (_candleType === "area") {
    const allClose = candles.map(c => ({ time: c.time, value: c.close }));
    const { confLine: confClose, fcLine: fcClose } = _splitLine(allClose);
    if (confClose.length) {
      _candleChart.addAreaSeries({
        topColor: blue + "44", bottomColor: blue + "05",
        lineColor: blue, lineWidth: 2, lineStyle: 0,
        priceLineVisible: false, lastValueVisible: true, priceFormat,
      }).setData(confClose);
    }
    if (fcClose.length) {
      _candleChart.addAreaSeries({
        topColor: blue + "18", bottomColor: blue + "03",
        lineColor: blue + "66", lineWidth: 2, lineStyle: 2,
        priceLineVisible: false, lastValueVisible: true, priceFormat,
        title: "Prognose",
      }).setData(fcClose);
    }
    if (!confClose.length && !fcClose.length) {
      _candleChart.addAreaSeries({ topColor: blue + "44", bottomColor: blue + "05", lineColor: blue, lineWidth: 2, priceLineVisible: false, lastValueVisible: true, priceFormat }).setData(allClose);
    }
  }

  // Vergleich: Kumulierte Einnahmen (grün) + Ausgaben (rot) als Linien
  if (_candleCompare && incLine.length) {
    const { confLine: confInc, fcLine: fcInc } = _splitLine(incLine);
    const { confLine: confExp, fcLine: fcExp } = _splitLine(expLine);
    if (confInc.length) _candleChart.addLineSeries({ color: green + "cc", lineWidth: 1.5, lineStyle: 0, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false, priceFormat, title: "∑ Einnahmen" }).setData(confInc);
    if (fcInc.length)   _candleChart.addLineSeries({ color: green + "55", lineWidth: 1.5, lineStyle: 2, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false, priceFormat }).setData(fcInc);
    if (confExp.length) _candleChart.addLineSeries({ color: red   + "cc", lineWidth: 1.5, lineStyle: 0, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false, priceFormat, title: "∑ Ausgaben" }).setData(confExp);
    if (fcExp.length)   _candleChart.addLineSeries({ color: red   + "55", lineWidth: 1.5, lineStyle: 2, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false, priceFormat }).setData(fcExp);
  }

  // Depot/VL-Sparfluss: kumulierte Einzahlungen in Anlagekonten.
  // Eigene (unsichtbare) Preisachse "invest" — sonst zieht die kleine Depot-Summe
  // die Hauptskala auf 0 und die Kerzen kleben oben.
  if (investLine.length) {
    const { confLine: confInv, fcLine: fcInv } = _splitLine(investLine);
    if (confInv.length) _candleChart.addLineSeries({ color: purple + "99", lineWidth: 1, lineStyle: 0, priceLineVisible: false, lastValueVisible: true, crosshairMarkerVisible: false, priceFormat, title: "∑ Depot/VL", priceScaleId: "invest" }).setData(confInv);
    if (fcInv.length)   _candleChart.addLineSeries({ color: purple + "44", lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false, priceFormat, priceScaleId: "invest" }).setData(fcInv);
    if (!confInv.length && !fcInv.length) _candleChart.addLineSeries({ color: purple + "99", lineWidth: 1, lineStyle: 3, priceLineVisible: false, lastValueVisible: true, crosshairMarkerVisible: false, priceFormat, title: "∑ Depot/VL", priceScaleId: "invest" }).setData(investLine);
    // Depot-Linie unten halten, ohne die Hauptachse zu beeinflussen
    try {
      _candleChart.priceScale("invest").applyOptions({
        scaleMargins: { top: 0.82, bottom: 0.02 },
        visible: false,
      });
    } catch (_) {}
  }

  // Wachstum: Kumuliertes Netto (∑ Einnahmen − ∑ Ausgaben) als Fläche
  if (_candleGrowth && netLine.length) {
    const { confLine: confNet, fcLine: fcNet } = _splitLine(netLine);
    if (confNet.length) _candleChart.addAreaSeries({ topColor: gold + "33", bottomColor: gold + "05", lineColor: gold + "dd", lineWidth: 1.5, lineStyle: 0, priceLineVisible: false, lastValueVisible: true, crosshairMarkerVisible: true, crosshairMarkerRadius: 4, priceFormat, title: "∑ Wachstum" }).setData(confNet);
    if (fcNet.length)   _candleChart.addAreaSeries({ topColor: gold + "14", bottomColor: gold + "03", lineColor: gold + "77", lineWidth: 1.5, lineStyle: 2, priceLineVisible: false, lastValueVisible: true, crosshairMarkerVisible: false, priceFormat }).setData(fcNet);
    if (!confNet.length && !fcNet.length) _candleChart.addAreaSeries({ topColor: gold + "33", bottomColor: gold + "05", lineColor: gold + "dd", lineWidth: 1.5, priceLineVisible: false, lastValueVisible: true, crosshairMarkerVisible: true, crosshairMarkerRadius: 4, priceFormat, title: "∑ Wachstum" }).setData(netLine);
  }

  // Zwei-Stufen-Fit: sofort + nach Layout-Pass damit Candles die volle Höhe nutzen
  _candleChart.timeScale().fitContent();
  setTimeout(() => {
    if (_candleChart) {
      _candleChart.timeScale().fitContent();
      _candleChart.priceScale("right").applyOptions({ autoScale: true });
    }
    _candleBuilding = false;
  }, 80);

  // Grab-Cursor für Pan
  container.style.cursor = "grab";
  container.addEventListener("mousedown", () => { container.style.cursor = "grabbing"; });
  container.addEventListener("mouseup",   () => { container.style.cursor = "grab"; });
  container.addEventListener("mouseleave",() => { container.style.cursor = "grab"; });

  window._candleResizeObs = new ResizeObserver(() => {
    if (_candleChart && container.clientWidth > 0) {
      _candleChart.applyOptions({ width: container.clientWidth });
    }
  });
  window._candleResizeObs.observe(container);
}

// ── CSS-VAR HELPER ───────────────────
function _jcss(v) {
  return getComputedStyle(document.documentElement).getPropertyValue(v).trim();
}

function renderJahr() {
  const pg = document.getElementById("p-jahr");
  if (!pg) return;

  const n = today();
  const yr = _jahrA;

  // Verfügbare Jahre (aus Daten ableiten + aktuelle ± 2)
  const dataYears = new Set();
  S.data.forEach((p) => {
    if (p.activeFrom) dataYears.add(new Date(p.activeFrom).getFullYear());
  });
  const curYear = n.getFullYear();
  for (let y = curYear - 3; y <= curYear; y++) dataYears.add(y);
  const allYears = [...dataYears].sort((a, b) => b - a);

  // Jahr-KPIs vorausberechnen (für Terminal-Header)
  const _preMonths = _calcMonths(_jahrA);
  const _yInc   = _preMonths.reduce((s, m) => s + m.inc, 0);
  const _yExp   = _preMonths.reduce((s, m) => s + m.exp, 0);
  const _yBal   = _yInc - _yExp;
  const _ySpar  = _yInc > 0 ? ((_yBal / _yInc) * 100) : 0;
  const _yPos   = _yBal >= 0;
  const _yPosMos = _preMonths.filter(m => m.bal > 0).length;

  pg.innerHTML = `
    <!-- ══ TERMINAL HEADER ══ -->
    <div class="jh-terminal-bar">
      <div class="jht-left">
        <div class="jht-ticker-wrap">
          <span class="jht-ticker-name">FINANZ/${yr}</span>
          <select class="jht-year-sel" onchange="_jahrA=+this.value;renderJahr()">
            ${allYears.map((y) => `<option value="${y}" ${y === _jahrA ? "selected" : ""}>${y}</option>`).join("")}
          </select>
        </div>
        <div class="jht-price ${_yPos ? "jht-pos" : "jht-neg"}">${fm(_yBal, true)}</div>
        <div class="jht-spar-badge ${_ySpar >= 20 ? "jht-badge-good" : _ySpar >= 10 ? "jht-badge-mid" : "jht-badge-bad"}">${_yPos ? "▲" : "▼"} ${_ySpar.toFixed(1)}%</div>
      </div>
      <div class="jht-stats-strip">
        <div class="jht-kpi">
          <span class="jht-kpi-lbl">∑ Einnahmen</span>
          <span class="jht-kpi-val jht-kv-in">+${fm(_yInc)}</span>
        </div>
        <span class="jht-sep">|</span>
        <div class="jht-kpi">
          <span class="jht-kpi-lbl">∑ Ausgaben</span>
          <span class="jht-kpi-val jht-kv-out">−${fm(_yExp)}</span>
        </div>
        <span class="jht-sep">|</span>
        <div class="jht-kpi">
          <span class="jht-kpi-lbl">Ø / Monat</span>
          <span class="jht-kpi-val">${fm(_yBal / 12, true)}</span>
        </div>
        <span class="jht-sep">|</span>
        <div class="jht-kpi">
          <span class="jht-kpi-lbl">Positive Monate</span>
          <span class="jht-kpi-val">${_yPosMos} / 12</span>
        </div>
      </div>
      <div class="jht-controls">
        <button class="jht-ctrl-btn ${_compareMode ? "jht-ctrl-active" : ""}"
          onclick="_compareMode=!_compareMode;renderJahr();" onmouseenter="_showTooltip('Jahresvergleich', this)" onmouseleave="_hideTooltip()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
          Vergleich
        </button>
        ${_compareMode ? `
          <span class="jht-vs">vs</span>
          <select class="jht-year-sel" onchange="_jahrB=+this.value;renderJahr()">
            ${allYears.map((y) => `<option value="${y}" ${y === _jahrB ? "selected" : ""}>${y}</option>`).join("")}
          </select>
        ` : ""}
        <button class="jht-ctrl-btn" onclick="_exportJahresBericht()" onmouseenter="_showTooltip('Jahresbericht als PDF exportieren', this)" onmouseleave="_hideTooltip()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export
        </button>
      </div>
    </div>

    <!-- ══ TRADING CHART ══ -->
    <div class="panel jahr-candle-panel" style="margin-bottom:14px;">
      <div class="jh-chart-toolbar">
        <div class="jh-ct-left">
          <span class="jh-ct-title">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
            Balance-Chart
          </span>
          <div class="jh-ct-divider"></div>
          <div class="tf-row" id="candleIntervalRow">
            <button class="tf-chip active" data-itv="1T" onclick="_candleInterval='1T';_refreshCandleChart()">1T</button>
            <button class="tf-chip" data-itv="1W" onclick="_candleInterval='1W';_refreshCandleChart()">1W</button>
            <button class="tf-chip" data-itv="1M" onclick="_candleInterval='1M';_refreshCandleChart()">1M</button>
            <button class="tf-chip" data-itv="1J" onclick="_candleInterval='1J';_refreshCandleChart()">1J</button>
          </div>
          <div class="jh-ct-divider"></div>
          <div class="tf-row" id="candleRangeRow">
            <button class="tf-chip" data-range="YTD" onclick="_candleRange='YTD';_refreshCandleChart()">YTD</button>
            <button class="tf-chip active" data-range="1J" onclick="_candleRange='1J';_refreshCandleChart()">1J</button>
            <button class="tf-chip" data-range="2J" onclick="_candleRange='2J';_refreshCandleChart()">2J</button>
            <button class="tf-chip" data-range="3J" onclick="_candleRange='3J';_refreshCandleChart()">3J</button>
            <button class="tf-chip" data-range="5J" onclick="_candleRange='5J';_refreshCandleChart()">5J</button>
            <button class="tf-chip" data-range="MAX" onclick="_candleRange='MAX';_refreshCandleChart()">MAX</button>
          </div>
        </div>
        <div class="jh-ct-right">
          <div class="candle-type-toggle">
            <button class="ct-btn active" data-type="candle" onclick="_candleType='candle';_refreshCandleChart()" onmouseenter="_showTooltip('Kerzendiagramm',this)" onmouseleave="_hideTooltip()">${iconHtml("chart-candle", 14)}</button>
            <button class="ct-btn" data-type="bar" onclick="_candleType='bar';_refreshCandleChart()" onmouseenter="_showTooltip('Balkendiagramm',this)" onmouseleave="_hideTooltip()">${iconHtml("chart-bar", 14)}</button>
            <button class="ct-btn" data-type="line" onclick="_candleType='line';_refreshCandleChart()" onmouseenter="_showTooltip('Liniendiagramm',this)" onmouseleave="_hideTooltip()">${iconHtml("chart-line", 14)}</button>
            <button class="ct-btn" data-type="area" onclick="_candleType='area';_refreshCandleChart()" onmouseenter="_showTooltip('Flächendiagramm',this)" onmouseleave="_hideTooltip()">${iconHtml("chart-area", 14)}</button>
          </div>
          <div class="jh-ct-divider"></div>
          <button class="ct-btn" id="candleCmpBtn" onclick="_candleCompare=!_candleCompare;_refreshCandleChart()" onmouseenter="_showTooltip('Einnahmen vs. Ausgaben vergleichen',this)" onmouseleave="_hideTooltip()" style="border:1px solid var(--border);border-radius:7px;padding:4px 9px;">⇄ Vgl</button>
          <button class="ct-btn" id="candleGrowthBtn" onclick="_candleGrowth=!_candleGrowth;_refreshCandleChart()" onmouseenter="_showTooltip('Netto-Wachstum anzeigen',this)" onmouseleave="_hideTooltip()" style="border:1px solid var(--border);border-radius:7px;padding:4px 9px;">↗ Wachstum</button>
        </div>
      </div>
      <div id="jahresCandleChart" class="jahr-candle-body"></div>
    </div>
    </div>

    <!-- Haupt-Kombinationschart: Ausgaben beider Jahre als Balken + Saldo als Linie -->
    <div class="panel" style="margin-bottom:14px;">
      <div class="panel-head">
        <div class="panel-title">
          ${
            _compareMode
              ? `Ausgaben & Saldo — ${_jahrA} vs. ${_jahrB}`
              : `Monatlicher Verlauf ${_jahrA}`
          }
        </div>
        <div class="panel-tag" style="display:flex;gap:10px;align-items:center;">
          ${
            _compareMode
              ? `
            <span style="display:inline-flex;align-items:center;gap:5px;font-size:.85em;">
              <span style="width:20px;height:3px;background:var(--blue);border-radius:2px;display:inline-block;"></span>${_jahrA} Ausgaben
            </span>
            <span style="display:inline-flex;align-items:center;gap:5px;font-size:.85em;">
              <span style="width:20px;height:3px;background:rgba(255,181,71,.8);border-radius:2px;display:inline-block;border-top:2px dashed rgba(255,181,71,.8);"></span>${_jahrB} Ausgaben
            </span>
          `
              : `<span style="color:var(--text3);font-size:.85em">Einnahmen vs. Ausgaben · Saldo als Linie</span>
                 <button class="ct-btn${_jahrMA ? " active" : ""}" id="jahrMABtn"
                   onclick="_jahrMA=!_jahrMA;_renderJahresChart(_calcMonths(_jahrA),null)"
                   onmouseenter="_showTooltip('3-Monats gleitender Durchschnitt',this)" onmouseleave="_hideTooltip()"
                   style="border:1px solid var(--border);border-radius:7px;padding:4px 9px;margin-left:4px;">∿ MA</button>`
          }
        </div>
      </div>
      <div class="panel-body" style="padding-bottom:8px;">
        <div style="position:relative;height:${_compareMode ? "320px" : "260px"};">
          <canvas id="jahresBarChart"></canvas>
        </div>
      </div>
    </div>
    </div>

    ${
      _compareMode
        ? `
    <!-- Δ Differenz-Chart: zeigt wo sich was verbessert/verschlechtert hat -->
    <div class="panel" style="margin-bottom:14px;">
      <div class="panel-head">
        <div class="panel-title">Δ Ausgaben-Differenz ${_jahrA} minus ${_jahrB}</div>
        <div class="panel-tag">Grün = weniger ausgegeben als Vorjahr · Rot = mehr ausgegeben</div>
      </div>
      <div class="panel-body"><div style="position:relative;height:180px;"><canvas id="verglChart"></canvas></div></div>
    </div>
    </div>
    `
        : `
    <!-- Sparquote nur im Einzelmodus -->
    <div class="panel" style="margin-bottom:14px;">
      <div class="panel-head">
        <div class="panel-title">Sparquote ${_jahrA}</div>
        <div class="panel-tag">% des Einkommens gespart</div>
      </div>
      <div class="panel-body"><div style="position:relative;height:220px;"><canvas id="sparChart"></canvas></div></div>
    </div>
    </div>
    `
    }

    <!-- ══ SUMMARY PANEL ══ -->
    <div id="jahresSummaryPanel"></div>

    <!-- Sparziele Fortschritt -->
    ${
      (S.goals || []).length > 0
        ? `
    <div class="panel" style="margin-bottom:16px;">
      <div class="panel-head">
        <div class="panel-title">Sparziele — Fortschritt</div>
        <div class="panel-tag">${(S.goals || []).length} Ziele</div>
      </div>
      <div class="goals-year-grid" id="goalsYearGrid"></div>
    </div>
    </div>`
        : ""
    }

    <!-- ══ PIVOT-TABELLE ══ -->
    <div id="pivotPanelWrap" class="panel" style="margin-bottom:14px;">
      <div class="panel-head">
        <div>
          <div class="panel-title">Zahlungsplan</div>
          <div class="panel-sub">Alle Posten auf einen Blick</div>
        </div>
        <div class="panel-tag" id="pivotPanelTag">Pivot · ${yr}</div>
      </div>
      <div class="panel-body" style="padding-top:14px;">
        <div id="pivotContainer"></div>
      </div>
    </div>
    </div>

    <!-- ══ HEATMAP ══ -->
    <div class="panel jh-heatmap-panel" style="margin-bottom:14px;">
      <div class="panel-head">
        <div class="panel-title">Jahres-Heatmap ${yr}</div>
        <div class="panel-tag">Monatssaldo auf einen Blick · Klick öffnet Details</div>
      </div>
      <div id="jahresHeatmap" class="jh-heatmap-body"></div>
    </div>
    </div>

    <!-- ══ MONATSÜBERSICHT ══ -->
    <div class="jh-months-head">
      <div class="panel-title">Monatsübersicht ${yr}</div>
      <div class="view-toggle">
        <button class="vt-btn ${_jahrView === "cards" ? "active" : ""}" data-view="cards" onclick="_jahrSetView('cards')" onmouseenter="_showTooltip('Kartenansicht', this)" onmouseleave="_hideTooltip()">${iconHtml("grid", 14)}</button>
        <button class="vt-btn ${_jahrView === "list" ? "active" : ""}" data-view="list" onclick="_jahrSetView('list')" onmouseenter="_showTooltip('Listenansicht', this)" onmouseleave="_hideTooltip()">${iconHtml("list", 14)}</button>
      </div>
    </div>
    <div id="yearGrid"></div>`;

  const monthsA = _preMonths;
  const monthsB = _compareMode ? _calcMonths(_jahrB) : null;

  _renderJahresChart(monthsA, monthsB);
  if (_compareMode && monthsB) {
    _renderVerglChart(monthsA, monthsB);
  } else {
    _renderSparChart(monthsA, null);
  }
  _renderJahresHeatmap(monthsA, n, yr);
  if ((S.goals || []).length > 0) _renderGoalsYear();
  _renderJahresSummary(monthsA, yr, n);
  _renderMonthCards(monthsA, n, yr);
  // Candlestick nach DOM-Paint
  requestAnimationFrame(() => _refreshCandleChart());
}

// Karten/Liste umschalten OHNE die ganze Seite + Charts neu zu bauen —
// nur die Toggle-Buttons und die Monatskarten aktualisieren.
function _jahrSetView(view) {
  if (_jahrView === view) return;
  _jahrView = view;
  document.querySelectorAll(".jh-months-head .vt-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.view === view);
  });
  _renderMonthCards(_calcMonths(_jahrA), today(), _jahrA);
}

function _calcMonths(year) {
  const n = today();
  const curY = n.getFullYear();
  const curM = n.getMonth();

  return Array.from({ length: 12 }, (_, m) => {
    const mk = `${year}-${String(m + 1).padStart(2, "0")}`;

    // Vergangene + aktueller Monat → echte Buchungen aus S.bookings (wenn vorhanden)
    // Zukunft → S.data (geplante Werte)
    const isFuture = year > curY || (year === curY && m > curM);

    let inc = 0,
      exp = 0;
    let usedBookings = false;

    if (!isFuture && Array.isArray(S.bookings) && S.bookings.length > 0) {
      const bks = S.bookings.filter((b) => b.monthKey === mk);
      if (bks.length > 0) {
        usedBookings = true;
        bks.forEach((b) => {
          if (b.status === "ausgesetzt") return;
          const amt = b.amount || 0;
          if (b.type === "einnahme") inc += amt;
          else if (b.type === "ausgabe") exp += amt;
        });
      }
    }

    if (!usedBookings) {
      // Zukunft oder noch keine Bookings → S.data (geplante Werte)
      // Auch: aktueller Monat wenn initBookings noch nicht lief
      S.data.forEach((p) => {
        const v = monthActualYear(p, m, year);
        if (!v) return;
        if (p.type === "einnahme") inc += v;
        else if (p.type === "ausgabe") exp += v;
      });
      if (inc === 0 && S.monthlyIncome > 0) inc = S.monthlyIncome;
    }
    // Für Monate aus Bookings: kein monthlyIncome-Override

    return {
      inc,
      exp,
      bal: inc - exp,
      spar: inc > 0 ? Math.max(0, ((inc - exp) / inc) * 100) : 0,
    };
  });
}

// monthActualYear — delegiert an utils.js monthActualForYear (year-aware)
function monthActualYear(p, m, year) {
  return monthActualForYear(p, m, year);
}

function _renderJahresChart(monthsA, monthsB) {
  const ctx = document.getElementById("jahresBarChart");
  if (!ctx) return;
  if (_jahresChart) {
    _jahresChart.destroy();
  }

  // ── Farben live aus CSS-Vars ──────────────────────────────────
  const accent = _jcss("--blue") || "#4d9eff";
  const accentA30 = _jcss("--blue-a35") || "rgba(77,158,255,.3)";
  const accentA08 = _jcss("--blue-a08") || "rgba(77,158,255,.07)";
  const greenColor = _jcss("--green") || "#00e5a0";
  const greenA10 = _jcss("--green-a10") || "rgba(0,229,160,.1)";
  const greenA18 = _jcss("--green-a18") || "rgba(0,229,160,.18)";
  const redColor = _jcss("--red") || "#ff4d6a";
  const text3 = _jcss("--text3") || "#6b7a99";
  const panel2 = _jcss("--panel2") || "#1d2235";
  const border2 = _jcss("--border2") || "#252d42";
  const textCol = _jcss("--text") || "#e4e8f5";
  const text2 = _jcss("--text2") || "#8892aa";

  // Tick + Grid — immer von --text3 abgeleitet
  const TC = { color: text3, font: { size: 10 }, maxTicksLimit: 6 };
  const gridA = { color: border2, drawBorder: false };
  const tooltipStyle = {
    backgroundColor: panel2,
    borderColor: border2,
    borderWidth: 1,
    cornerRadius: 10,
    padding: 12,
    titleColor: textCol,
    titleFont: { size: 11, weight: "700", family: "'Space Grotesk',sans-serif" },
    bodyColor: text2,
    bodyFont: { size: 10 },
  };

  if (monthsB) {
    // ── VERGLEICHSMODUS ──────────────────────────────────────────
    const expA = monthsA.map((m) => m.exp);
    const expB = monthsB.map((m) => m.exp);
    const balA = monthsA.map((m) => m.bal);
    const balB = monthsB.map((m) => m.bal);

    _jahresChart = new Chart(ctx, {
      data: {
        labels: MONTHS_S,
        datasets: [
          {
            type: "bar",
            label: `Ausgaben ${_jahrA}`,
            data: expA,
            backgroundColor: accentA30,
            borderColor: accent,
            borderWidth: 1,
            borderRadius: 6,
            borderSkipped: "bottom",
            yAxisID: "yAmt",
            order: 2,
          },
          {
            type: "bar",
            label: `Ausgaben ${_jahrB}`,
            data: expB,
            backgroundColor: "rgba(255,181,71,.18)",
            borderColor: "rgba(255,181,71,.55)",
            borderWidth: 1,
            borderRadius: 6,
            borderSkipped: "bottom",
            yAxisID: "yAmt",
            order: 3,
          },
          {
            type: "line",
            label: `Saldo ${_jahrA}`,
            data: balA,
            borderColor: greenColor,
            backgroundColor: greenA10,
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 6,
            pointBackgroundColor: greenColor,
            pointBorderWidth: 0,
            fill: false,
            tension: 0.4,
            yAxisID: "ySaldo",
            order: 0,
          },
          {
            type: "line",
            label: `Saldo ${_jahrB}`,
            data: balB,
            borderColor: "rgba(255,77,106,.85)",
            backgroundColor: "transparent",
            borderWidth: 1.5,
            pointRadius: 3,
            pointHoverRadius: 6,
            pointBackgroundColor: "rgba(255,77,106,.85)",
            pointBorderWidth: 0,
            borderDash: [5, 3],
            fill: false,
            tension: 0.4,
            yAxisID: "ySaldo",
            order: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            labels: { color: text3, font: { size: 10 }, padding: 16 },
          },
          tooltip: {
            ...tooltipStyle,
            callbacks: {
              label: (ctx) =>
                ` ${ctx.dataset.label}: ${fm(ctx.parsed.y, true)}`,
            },
          },
        },
        scales: {
          x: { ticks: TC, grid: gridA, border: { display: false } },
          yAmt: {
            type: "linear",
            position: "left",
            ticks: { ...TC, callback: (v) => fm(v) },
            grid: gridA,
            border: { display: false },
            title: { display: true, text: "Ausgaben", color: text3, font: { size: 9 } },
          },
          ySaldo: {
            type: "linear",
            position: "right",
            ticks: { ...TC, callback: (v) => fm(v, true) },
            grid: { drawOnChartArea: false },
            border: { display: false },
            title: { display: true, text: "Saldo", color: text3, font: { size: 9 } },
          },
        },
      },
    });
  } else {
    // ── EINZELMODUS ──────────────────────────────────────────────
    const inc = monthsA.map((m) => m.inc);
    const exp = monthsA.map((m) => m.exp);
    const bal = monthsA.map((m) => m.bal);

    // ── Budget-Soll-Linie: geplante Ausgaben aus S.data ──
    const _sollExp = MONTHS_S.map((_, m) => {
      let s = 0;
      S.data.forEach(p => {
        if (p.type !== "ausgabe") return;
        const v = typeof monthActualForYear === "function"
          ? monthActualForYear(p, m, _jahrA) : 0;
        s += v;
      });
      return parseFloat(s.toFixed(2));
    });
    const _sollDataset = {
      type: "line",
      label: "Budget (Soll)",
      data: _sollExp,
      borderColor: "rgba(255,181,71,.65)",
      backgroundColor: "transparent",
      borderWidth: 1.5,
      borderDash: [4, 3],
      pointRadius: 0,
      fill: false,
      tension: 0.3,
      yAxisID: "yAmt",
      order: 4,
    };

    // ── Restjahr-Prognose (nur für aktuelles Jahr mit Zukunftsmonaten) ──
    const _pnow = today();
    const _pCurM = _pnow.getMonth();
    const _pCurY = _pnow.getFullYear();
    let prognoseDataset = null;
    if (_jahrA === _pCurY && _pCurM < 11) {
      // Ø der letzten 3 tatsächlichen Monate (bis einschl. aktueller Monat)
      const _lastSlice = monthsA.slice(Math.max(0, _pCurM - 2), _pCurM + 1);
      const _avgBal = _lastSlice.length
        ? _lastSlice.reduce((s, m) => s + m.bal, 0) / _lastSlice.length
        : 0;
      // Array: null für vergangene, Verbindungspunkt bei curM, Prognose ab curM+1
      const pData = monthsA.map((m, i) => {
        if (i < _pCurM) return null;
        if (i === _pCurM) return parseFloat(m.bal.toFixed(2));
        return parseFloat(_avgBal.toFixed(2));
      });
      prognoseDataset = {
        type: "line",
        label: "Prognose",
        data: pData,
        borderColor: accent + "88",
        backgroundColor: "transparent",
        borderWidth: 1.5,
        borderDash: [6, 4],
        pointRadius: pData.map((v, i) => (i === _pCurM ? 4 : 0)),
        pointBackgroundColor: accent,
        pointBorderWidth: 0,
        fill: false,
        tension: 0.3,
        yAxisID: "ySaldo",
        order: 1,
        spanGaps: false,
      };
    }

    const baseDatasets = [
      {
        type: "bar",
        label: "Einnahmen",
        data: inc,
        backgroundColor: greenA10,
        borderColor: greenA18,
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: "bottom",
        yAxisID: "yAmt",
        order: 2,
      },
      {
        type: "bar",
        label: "Ausgaben",
        data: exp,
        backgroundColor: "rgba(255,77,106,.18)",
        borderColor: "rgba(255,77,106,.55)",
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: "bottom",
        yAxisID: "yAmt",
        order: 3,
      },
      _sollDataset,
      {
        type: "line",
        label: "Monatssaldo",
        data: bal,
        borderColor: accent,
        backgroundColor: accentA08,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: accent,
        pointBorderWidth: 0,
        fill: true,
        tension: 0.4,
        yAxisID: "ySaldo",
        order: 0,
      },
    ];
    if (prognoseDataset) baseDatasets.push(prognoseDataset);

    // ── 3-Monats gleitender Durchschnitt (Saldo) ──
    if (_jahrMA) {
      const maData = bal.map((v, i) => {
        const slice = bal.slice(Math.max(0, i - 1), i + 2);
        return parseFloat((slice.reduce((s, x) => s + x, 0) / slice.length).toFixed(2));
      });
      baseDatasets.push({
        type: "line",
        label: "∿ MA (3M)",
        data: maData,
        borderColor: _jcss("--purple") || "#7b5fff",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0.5,
        yAxisID: "ySaldo",
        order: 0,
      });
      const maBtn = document.getElementById("jahrMABtn");
      if (maBtn) maBtn.classList.add("active");
    }

    _jahresChart = new Chart(ctx, {
      data: {
        labels: MONTHS_S,
        datasets: baseDatasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            labels: { color: text3, font: { size: 10 }, padding: 16 },
          },
          tooltip: {
            ...tooltipStyle,
            callbacks: {
              label: (ctx) =>
                ` ${ctx.dataset.label}: ${fm(ctx.parsed.y, true)}`,
            },
          },
        },
        scales: {
          x: { ticks: TC, grid: gridA, border: { display: false } },
          yAmt: {
            type: "linear",
            position: "left",
            ticks: { ...TC, callback: (v) => fm(v) },
            grid: gridA,
            border: { display: false },
          },
          ySaldo: {
            type: "linear",
            position: "right",
            ticks: { ...TC, callback: (v) => fm(v, true) },
            grid: { drawOnChartArea: false },
            border: { display: false },
          },
        },
      },
    });
  }
}

function _renderSparChart(monthsA, monthsB) {
  const ctx = document.getElementById("sparChart");
  if (!ctx) return;
  if (_sparChart) {
    _sparChart.destroy();
  }

  // ── Farben live aus CSS-Vars ──────────────────────────────────
  const accent = _jcss("--blue") || "#4d9eff";
  const accentA12 = _jcss("--blue-a12") || "rgba(77,158,255,.12)";
  const greenColor = _jcss("--green") || "#00e5a0";
  const redColor = _jcss("--red") || "#ff4d6a";
  const text3 = _jcss("--text3") || "#6b7a99";
  const panel2s = _jcss("--panel2") || "#1d2235";
  const border2s = _jcss("--border2") || "#252d42";
  const textCols = _jcss("--text") || "#e4e8f5";
  const text2s = _jcss("--text2") || "#8892aa";

  const valuesA = monthsA.map((m) => parseFloat(m.spar.toFixed(1)));
  const valuesB = monthsB
    ? monthsB.map((m) => parseFloat(m.spar.toFixed(1)))
    : [];

  // Dynamic Y axis: zoom in on actual range with generous padding
  const allVals = [...valuesA, ...valuesB].filter((v) => v > 0);
  const minVal = allVals.length ? Math.min(...allVals) : 0;
  const maxVal = allVals.length ? Math.max(...allVals) : 100;
  const range = Math.max(maxVal - minVal, 5);
  const pad = range * 0.4;
  const yMin = Math.max(0, Math.floor(minVal - pad));
  const yMax = Math.min(100, Math.ceil(maxVal + pad));

  const datasets = [
    {
      label: `Sparquote ${_jahrA} %`,
      data: valuesA,
      borderColor: accent,
      backgroundColor: accentA12,
      borderWidth: 2.5,
      pointRadius: 5,
      // Punkte: grün = gut, Akzent = mittel, rot = schlecht
      pointBackgroundColor: valuesA.map((v) =>
        v >= 30 ? greenColor : v >= 15 ? accent : redColor,
      ),
      pointBorderColor: "transparent",
      fill: true,
      tension: 0.4,
    },
  ];

  if (monthsB) {
    datasets.push({
      label: `Sparquote ${_jahrB} %`,
      data: valuesB,
      borderColor: "rgba(255,181,71,.85)",
      backgroundColor: "rgba(255,181,71,.05)",
      borderWidth: 2,
      pointRadius: 4,
      pointBackgroundColor: "rgba(255,181,71,.85)",
      fill: false,
      tension: 0.4,
      borderDash: [5, 3],
    });
  }

  const tooltipSpar = {
    backgroundColor: panel2s,
    borderColor: border2s,
    borderWidth: 1,
    cornerRadius: 10,
    padding: 12,
    titleColor: textCols,
    titleFont: { size: 11, weight: "700", family: "'Space Grotesk',sans-serif" },
    bodyColor: text2s,
    bodyFont: { size: 10 },
  };

  _sparChart = new Chart(ctx, {
    type: "line",
    data: { labels: MONTHS_S, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { labels: { color: text3, font: { size: 10 }, padding: 16 } },
        tooltip: {
          ...tooltipSpar,
          callbacks: {
            label: (ctx) =>
              ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}%`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: text3, font: { size: 10 }, maxTicksLimit: 12 },
          grid: { color: _jcss("--border2") || "rgba(255,255,255,.04)", drawBorder: false },
          border: { display: false },
        },
        y: {
          min: yMin,
          max: yMax,
          ticks: { color: text3, font: { size: 10 }, callback: (v) => v + "%", maxTicksLimit: 6 },
          grid: { color: _jcss("--border2") || "rgba(255,255,255,.04)" },
          border: { display: false },
        },
      },
    },
  });
}

function _renderVerglChart(monthsA, monthsB) {
  const ctx = document.getElementById("verglChart");
  if (!ctx) return;
  if (_verglChart) {
    _verglChart.destroy();
  }

  // ── Farben live aus CSS-Vars ──────────────────────────────────
  const accent = _jcss("--blue") || "#4d9eff";
  const greenColor = _jcss("--green") || "#00e5a0";
  const greenA30 = _jcss("--green-a25") || "rgba(0,229,160,.3)";
  const greenA18 = _jcss("--green-a18") || "rgba(0,229,160,.18)";
  const redColor = _jcss("--red") || "#ff4d6a";
  const text3 = _jcss("--text3") || "#6b7a99";
  const panel2v = _jcss("--panel2") || "#1d2235";
  const border2v = _jcss("--border2") || "#252d42";
  const textColv = _jcss("--text") || "#e4e8f5";
  const text2v = _jcss("--text2") || "#8892aa";

  // Δ Ausgaben: negativ = WENIGER ausgegeben = gut (grün)
  const deltaExp = monthsA.map((m, i) =>
    parseFloat((m.exp - monthsB[i].exp).toFixed(2)),
  );
  const deltaSal = monthsA.map((m, i) =>
    parseFloat((m.bal - monthsB[i].bal).toFixed(2)),
  );

  _verglChart = new Chart(ctx, {
    data: {
      labels: MONTHS_S,
      datasets: [
        {
          type: "bar",
          label: `Δ Ausgaben (${_jahrA}−${_jahrB})`,
          data: deltaExp,
          // Mehr ausgegeben = rot, weniger = grün — semantisch, theme-neutral
          backgroundColor: deltaExp.map((d) =>
            d > 0 ? "rgba(255,77,106,.35)" : greenA30,
          ),
          borderColor: deltaExp.map((d) =>
            d > 0 ? "rgba(255,77,106,.8)" : greenA18,
          ),
          borderWidth: 1.5,
          borderRadius: 4,
          yAxisID: "y",
          order: 1,
        },
        {
          type: "line",
          label: `Δ Saldo (${_jahrA}−${_jahrB})`,
          data: deltaSal,
          // Saldo-Linie: Theme-Akzentfarbe
          borderColor: accent,
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: deltaSal.map((d) =>
            d >= 0 ? greenColor : redColor,
          ),
          fill: false,
          tension: 0.3,
          yAxisID: "y",
          order: 0,
          borderDash: [4, 2],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { labels: { color: text3, font: { size: 10 }, padding: 16 } },
        tooltip: {
          backgroundColor: panel2v,
          borderColor: border2v,
          borderWidth: 1,
          cornerRadius: 10,
          padding: 12,
          titleColor: textColv,
          titleFont: { size: 11, weight: "700", family: "'Space Grotesk',sans-serif" },
          bodyColor: text2v,
          bodyFont: { size: 10 },
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${fm(ctx.parsed.y, true)}`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: text3, font: { size: 10 }, maxTicksLimit: 12 },
          grid: { color: _jcss("--border2") || "rgba(255,255,255,.04)", drawBorder: false },
          border: { display: false },
        },
        y: {
          ticks: { color: text3, font: { size: 10 }, callback: (v) => fm(v, true), maxTicksLimit: 6 },
          grid: { color: _jcss("--border2") || "rgba(255,255,255,.04)" },
          border: { display: false },
        },
      },
    },
  });
}

function _renderGoalsYear() {
  const el = document.getElementById("goalsYearGrid");
  if (!el) return;
  el.innerHTML = (S.goals || [])
    .map((g) => {
      const pct = Math.min(
        100,
        g.targetAmount > 0
          ? Math.round((g.currentAmount / g.targetAmount) * 100)
          : 0,
      );
      const remaining = Math.max(
        0,
        (g.targetAmount || 0) - (g.currentAmount || 0),
      );
      const months = g.deadline
        ? Math.max(
            0,
            Math.round(
              (new Date(g.deadline) - today()) / (1000 * 60 * 60 * 24 * 30),
            ),
          )
        : null;
      return `<div class="goal-year-item">
      <div class="goal-year-top">
        <span style="color:${g.color || "var(--blue)"};display:inline-flex;align-items:center">${uiIcon(g.icon || "target", 17)}</span>
        <div>
          <div style="font-size:.82em;font-weight:700;color:var(--text1)">${esc(g.name)}</div>
          ${months !== null ? `<div style="font-size:.68em;color:var(--text3)">${months > 0 ? months + " Monate verbleibend" : "⚠ Zieldatum überschritten"}</div>` : ""}
        </div>
        <div style="margin-left:auto;font-family:var(--mono);font-size:.82em;font-weight:700;color:${g.color || "var(--blue)"}">${pct}%</div>
      </div>
      <div style="height:8px;background:var(--panel2);border-radius:4px;overflow:hidden;margin:8px 0 6px;">
        <div style="height:100%;width:${pct}%;background:${g.color || "var(--blue)"};border-radius:4px;transition:width .5s;"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:.68em;color:var(--text3);">
        <span>${fm(g.currentAmount || 0)} gespart</span>
        <span>noch ${fm(remaining)}</span>
        <span>Ziel: ${fm(g.targetAmount || 0)}</span>
      </div>
    </div>`;
    })
    .join("");
}

// ══════════════════════════════════════
//  JAHRESBILANZ SUMMARY PANEL
// ══════════════════════════════════════

// ══════════════════════════════════��═══
//  JAHRES-EXPORT / PDF-REPORT
// ══════════════════════════════════════

function _exportJahresBericht() {
  if (!window.csf?.print?.html) {
    showToast("PDF-Export nur in der Desktop-App verfügbar", "warning");
    return;
  }

  const months = _calcMonths(_jahrA);
  const n = today();
  const curY = n.getFullYear();
  const isCurrentYear = _jahrA === curY;
  const curM = isCurrentYear ? n.getMonth() : 11;

  const actualMonths = isCurrentYear ? months.slice(0, curM + 1) : months;
  const totalInc = actualMonths.reduce((s, m) => s + m.inc, 0);
  const totalExp = actualMonths.reduce((s, m) => s + m.exp, 0);
  const totalBal = totalInc - totalExp;
  const sparQuote = totalInc > 0 ? (totalBal / totalInc) * 100 : 0;

  // Kategorien-Breakdown für das Jahr
  const yearBks = (S.bookings || []).filter(b =>
    b.date && b.date.startsWith(_jahrA + "") &&
    b.type === "ausgabe" && b.status !== "ausgesetzt"
  );
  const allCats = Array.isArray(S.categories) && S.categories.length
    ? S.categories : (typeof DEFAULT_CATEGORIES !== "undefined" ? DEFAULT_CATEGORIES : []);
  const catMap = {};
  yearBks.forEach(b => {
    const catId = b.categoryId
      || (b.postenId ? (S.data.find(p => p.id === b.postenId) || {}).categoryId : null)
      || "__none__";
    if (!catMap[catId]) {
      const cat = allCats.find(c => c.id === catId);
      catMap[catId] = { label: cat ? cat.name : "Sonstiges", color: cat ? cat.color : "#888", icon: cat ? cat.icon : "package", total: 0 };
    }
    catMap[catId].total += Math.abs(b.amount || 0);
  });
  const catEntries = Object.entries(catMap).map(([, v]) => v).sort((a, b) => b.total - a.total);
  const catGrandTotal = catEntries.reduce((s, e) => s + e.total, 0);

  const fmPrint = (v, sign) => {
    const abs = Math.abs(v).toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    if (sign) return (v >= 0 ? "+" : "−") + abs + " €";
    return abs + " €";
  };

  const rowStyle = "border-bottom:1px solid #e5e7eb;padding:8px 0;display:flex;justify-content:space-between;font-size:13px;";
  const monthRows = MONTHS.map((name, i) => {
    const m = months[i];
    const isFut = isCurrentYear && i > curM;
    const balColor = m.bal >= 0 ? "#059669" : "#dc2626";
    return `<tr style="${isFut ? "color:#9ca3af;" : ""}">
      <td style="padding:6px 8px;font-size:12px">${name}</td>
      <td style="padding:6px 8px;font-size:12px;color:#059669;text-align:right">${isFut ? "—" : fmPrint(m.inc)}</td>
      <td style="padding:6px 8px;font-size:12px;color:#dc2626;text-align:right">${isFut ? "—" : fmPrint(m.exp)}</td>
      <td style="padding:6px 8px;font-size:12px;color:${isFut ? "#9ca3af" : balColor};text-align:right;font-weight:600">${isFut ? "—" : fmPrint(m.bal, true)}</td>
      <td style="padding:6px 8px;font-size:12px;color:#6b7280;text-align:right">${isFut ? "—" : m.spar.toFixed(0) + "%"}</td>
    </tr>`;
  }).join("");

  const catRows = catEntries.slice(0, 10).map(e => {
    const pct = catGrandTotal > 0 ? ((e.total / catGrandTotal) * 100).toFixed(0) : 0;
    return `<tr>
      <td style="padding:6px 8px;font-size:12px"><span style="color:${e.color};display:inline-flex;vertical-align:-1px">${uiIcon(e.icon, 11)}</span> ${esc(e.label)}</td>
      <td style="padding:6px 8px;font-size:12px;text-align:right;color:#dc2626">${fmPrint(e.total)}</td>
      <td style="padding:6px 8px;font-size:12px;text-align:right;color:#6b7280">${pct}%</td>
    </tr>`;
  }).join("");

  const reportDate = n.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

  const html = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8">
  <title>Jahresbericht ${_jahrA}</title>
  <style>
    body { font-family: Segoe UI, Arial, sans-serif; margin: 0; padding: 32px; color: #111827; background: #fff; }
    h1 { font-size: 22px; margin: 0 0 4px; color: #111827; }
    .sub { font-size: 13px; color: #6b7280; margin-bottom: 24px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
    .kpi { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; }
    .kpi-lbl { font-size: 10px; text-transform: uppercase; letter-spacing: .6px; color: #6b7280; margin-bottom: 4px; }
    .kpi-val { font-size: 18px; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
    th { background: #f3f4f6; padding: 8px; font-size: 11px; text-align: left; font-weight: 600; color: #374151; }
    th:not(:first-child) { text-align: right; }
    tr:nth-child(even) { background: #fafafa; }
    .section-title { font-size: 15px; font-weight: 700; margin: 0 0 10px; padding-bottom: 6px; border-bottom: 2px solid #e5e7eb; color: #111827; }
    .footer { margin-top: 28px; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 12px; display: flex; justify-content: space-between; }
  </style></head><body>
  <h1>Jahresbericht ${_jahrA}</h1>
  <div class="sub">Erstellt am ${reportDate}${isCurrentYear ? " · Jan – " + MONTHS_S[curM] : " · Gesamtjahr"}</div>

  <div class="kpi-grid">
    <div class="kpi"><div class="kpi-lbl">∑ Einnahmen</div><div class="kpi-val" style="color:#059669">+${fmPrint(totalInc)}</div></div>
    <div class="kpi"><div class="kpi-lbl">∑ Ausgaben</div><div class="kpi-val" style="color:#dc2626">−${fmPrint(totalExp)}</div></div>
    <div class="kpi"><div class="kpi-lbl">Netto-Saldo</div><div class="kpi-val" style="color:${totalBal >= 0 ? "#059669" : "#dc2626"}">${fmPrint(totalBal, true)}</div></div>
    <div class="kpi"><div class="kpi-lbl">Sparquote</div><div class="kpi-val">${sparQuote.toFixed(1)}%</div></div>
  </div>

  <div class="section-title">Monatliche Übersicht</div>
  <table>
    <thead><tr>
      <th>Monat</th><th style="text-align:right">Einnahmen</th><th style="text-align:right">Ausgaben</th>
      <th style="text-align:right">Saldo</th><th style="text-align:right">Sparquote</th>
    </tr></thead>
    <tbody>${monthRows}</tbody>
  </table>

  ${catEntries.length ? `
  <div class="section-title">Ausgaben nach Kategorie</div>
  <table>
    <thead><tr><th>Kategorie</th><th style="text-align:right">Gesamt</th><th style="text-align:right">Anteil</th></tr></thead>
    <tbody>${catRows}</tbody>
  </table>` : ""}

  <div class="footer">
    <span>VaultBox · Jahresbericht ${_jahrA}</span>
    <span>${reportDate}</span>
  </div>
  </body></html>`;

  window.csf.print.html(html);
  showToast("Jahresbericht wird gedruckt…", "info", 2500);
}

function _renderJahresSummary(months, yr, n) {
  const el = document.getElementById("jahresSummaryPanel");
  if (!el) return;

  const curY = n.getFullYear();
  const curM = n.getMonth();
  const isCurrentYear = yr === curY;

  const actualMonths = isCurrentYear ? months.slice(0, curM + 1) : months;
  const totalInc = actualMonths.reduce((s, m) => s + m.inc, 0);
  const totalExp = actualMonths.reduce((s, m) => s + m.exp, 0);
  const totalBal = totalInc - totalExp;
  const sparQuote = totalInc > 0 ? (totalBal / totalInc) * 100 : 0;

  let bestIdx = 0, worstIdx = 0;
  months.forEach((m, i) => {
    if (!isCurrentYear || i <= curM) {
      if (m.bal > months[bestIdx].bal) bestIdx = i;
      if (m.bal < months[worstIdx].bal) worstIdx = i;
    }
  });

  let prognoseBal = null;
  if (isCurrentYear && curM < 11) {
    const lastSlice = months.slice(Math.max(0, curM - 2), curM + 1);
    const avgBal = lastSlice.length ? lastSlice.reduce((s, m) => s + m.bal, 0) / lastSlice.length : 0;
    prognoseBal = totalBal + avgBal * (11 - curM);
  }

  const _mkCard = (lbl, val, col, sub) => {
    const card = document.createElement("div");
    card.className = "jhs-card";
    const l = document.createElement("div"); l.className = "jhs-lbl"; l.textContent = lbl;
    const v = document.createElement("div"); v.className = "jhs-val"; v.style.color = col; v.textContent = val;
    card.appendChild(l); card.appendChild(v);
    if (sub) { const s = document.createElement("div"); s.className = "jhs-sub"; s.textContent = sub; card.appendChild(s); }
    return card;
  };

  const panel = document.createElement("div");
  panel.className = "panel";
  panel.style.marginBottom = "14px";

  const head = document.createElement("div"); head.className = "panel-head";
  const ht = document.createElement("div"); ht.className = "panel-title"; ht.textContent = "Jahresbilanz " + yr;
  const htag = document.createElement("div"); htag.className = "panel-tag";
  htag.textContent = isCurrentYear ? "Jan – " + MONTHS_S[curM] : "Gesamtjahr";
  head.appendChild(ht); head.appendChild(htag);

  const grid = document.createElement("div"); grid.className = "jhs-grid";
  grid.appendChild(_mkCard("∑ Einnahmen", "+" + fm(totalInc), "var(--green)", ""));
  grid.appendChild(_mkCard("∑ Ausgaben", "−" + fm(totalExp), "var(--red)", ""));
  grid.appendChild(_mkCard("Netto-Saldo", fm(totalBal, true), totalBal >= 0 ? "var(--green)" : "var(--red)",
    sparQuote !== 0 ? "Sparquote: " + sparQuote.toFixed(1) + "%" : ""));
  grid.appendChild(_mkCard("Bestes Monat", fm(months[bestIdx].bal, true), "var(--green)", MONTHS[bestIdx]));
  grid.appendChild(_mkCard("Schlechtestes Monat", fm(months[worstIdx].bal, true), "var(--red)", MONTHS[worstIdx]));
  if (prognoseBal !== null) {
    grid.appendChild(_mkCard("Prognose Jahresende", fm(prognoseBal, true),
      prognoseBal >= 0 ? "var(--green)" : "var(--red)", "Ø letzte 3 Monate hochgerechnet"));
  }

  panel.appendChild(head); panel.appendChild(grid);
  el.textContent = "";
  el.appendChild(panel);
}

// ══════════════════════════════════════
//  JAHRES-HEATMAP — 12 Monatszellen
// ══════════════════════════════════════

function _renderJahresHeatmap(months, n, yr) {
  const el = document.getElementById("jahresHeatmap");
  if (!el) return;
  const curMo = n.getMonth();
  const curYr = n.getFullYear();
  const isCurrentYear = yr === curYr;
  const maxAbs = Math.max(...months.map(m => Math.abs(m.bal)), 1);

  el.innerHTML = months.map((m, idx) => {
    const isCur  = isCurrentYear && idx === curMo;
    const isFut  = isCurrentYear ? idx > curMo : yr > curYr;
    const pos    = m.bal >= 0;
    const intensity = Math.min(1, Math.abs(m.bal) / maxAbs);

    let bg, borderCol;
    if (isFut) {
      bg = "rgba(255,255,255,.02)";
      borderCol = "rgba(255,255,255,.06)";
    } else {
      const alpha = (0.07 + intensity * 0.40).toFixed(2);
      bg        = pos ? `rgba(0,229,160,${alpha})` : `rgba(255,77,106,${alpha})`;
      borderCol = pos ? "rgba(0,229,160,.22)"       : "rgba(255,77,106,.22)";
    }

    const valStr  = isFut ? "—" : fm(m.bal, true);
    const sparStr = (!isFut && m.inc > 0) ? m.spar.toFixed(0) + "%" : "";
    const valColor = isFut ? "var(--text3)" : pos ? "var(--green)" : "var(--red)";

    return `<div class="jhm-cell${isCur ? " jhm-cur" : ""}${isFut ? " jhm-fut" : ""}"
      style="background:${bg};border-color:${borderCol}"
      onclick="openMonthModal(${idx},${yr},{inc:${m.inc.toFixed(2)},exp:${m.exp.toFixed(2)},bal:${m.bal.toFixed(2)},spar:${m.spar.toFixed(2)}})"
      onmouseenter="_showTooltip('${MONTHS[idx]} ${yr}: ${valStr}',this)" onmouseleave="_hideTooltip()">
      <div class="jhm-month">${MONTHS_S[idx]}</div>
      <div class="jhm-val" style="color:${valColor}">${valStr}</div>
      ${sparStr ? `<div class="jhm-spar">${sparStr}</div>` : ""}
      ${isCur ? '<div class="jhm-now-dot"></div>' : ""}
    </div>`;
  }).join("");
}

// ══════════════════════════════════════
//  MONATSKARTEN — Karten & Listen-View
// ══════════════════════════════════════

/**
 * Gibt alle Posten zurück die in Monat mIdx / Jahr yr aktiv sind.
 * Berücksichtigt contractStart, contractEnd, Intervall.
 */
function _activePostenForMonth(mIdx, yr) {
  return S.data.filter((p) => activeInMonth(p, mIdx, yr));
}

/**
 * Gibt alle Transfers zurück die in Monat mIdx / Jahr yr fällig sind.
 * Monatliche Transfers: immer. Einmalige: wenn Datum im Monat liegt.
 */
function _activeTransfersForMonth(mIdx, yr) {
  return (S.transfers || []).filter((t) => {
    if (t.interval) return true; // wiederkehrend → immer aktiv
    if (!t.date) return false;
    const d = new Date(t.date);
    return d.getMonth() === mIdx && d.getFullYear() === yr;
  });
}

function _renderMonthCards(months, n, yr) {
  const grid = document.getElementById("yearGrid");
  if (!grid) return;
  grid.innerHTML = "";
  const curMo = n.getMonth();
  const isCurrentYear = yr === n.getFullYear();

  if (_jahrView === "list") {
    _renderMonthList(grid, months, n, yr, isCurrentYear, curMo);
  } else {
    _renderMonthGrid(grid, months, n, yr, isCurrentYear, curMo);
  }

  // ── PIVOT-TABELLE darunter, falls pivot.js geladen ──
  const pg = document.getElementById("p-jahr");
  if (!pg || typeof renderPivot !== "function") return;

  let pivotWrap = document.getElementById("pivotPanelWrap");
  if (!pivotWrap) {
    pivotWrap = document.createElement("div");
    pivotWrap.id = "pivotPanelWrap";
    pivotWrap.className = "panel";
    pivotWrap.style.marginTop = "14px";
    pivotWrap.innerHTML = `
      <div class="panel-head">
        <div>
          <div class="panel-title">Zahlungsplan</div>
          <div class="panel-sub">Alle Posten auf einen Blick</div>
        </div>
        <div class="panel-tag" id="pivotPanelTag">Pivot · ${yr}</div>
      </div>
      <div class="panel-body" style="padding-top:14px;">
        <div id="pivotContainer"></div>
      </div>`;
    pg.appendChild(pivotWrap);
  } else {
    const tag = document.getElementById("pivotPanelTag");
    if (tag) tag.textContent = `Pivot · ${yr}`;
  }

  renderPivot(yr);
}

// ── KARTEN-ANSICHT ────────────────────
function _renderMonthGrid(grid, months, n, yr, isCurrentYear, curMo) {
  grid.className = "year-grid";
  months.forEach((m, idx) => {
    const activePosten = _activePostenForMonth(idx, yr);
    const expiring = activePosten.filter((p) => {
      if (!p.contractEnd) return false;
      const e = new Date(p.contractEnd);
      return e.getMonth() === idx && e.getFullYear() === yr;
    });
    const newStarts = activePosten.filter((p) => {
      if (!p.contractStart) return false;
      const s = new Date(p.contractStart);
      return s.getMonth() === idx && s.getFullYear() === yr;
    });

    const card = document.createElement("div");
    const monthKey = `${yr}-${String(idx + 1).padStart(2, "0")}`;
    const noteText = (S.yearNotes || {})[monthKey] || "";
    const isMcClosed = (S.closedMonths || []).includes(monthKey);
    const closedLockHtml = isMcClosed
      ? `<span class="mc-lock-badge" onmouseenter="_showTooltip('Monat abgeschlossen',this)" onmouseleave="_hideTooltip()">&#x1F512;</span>`
      : "";
    card.className =
      "month-card clickable" +
      (isCurrentYear && idx === curMo ? " cur" : "") +
      (isCurrentYear && idx < curMo ? " past" : "") +
      (isMcClosed ? " mc-closed" : "");
    card.addEventListener("mouseenter", () => _showTooltip("Klicken für Details", card));
    card.addEventListener("mouseleave", _hideTooltip);
    card.onclick = () => openMonthModal(idx, yr, months[idx]);

    card.innerHTML = `
      <div class="mc-name">
        ${MONTHS[idx]}${isCurrentYear && idx === curMo ? ' &middot; <span style="color:var(--blue)">heute</span>' : ""}
        ${closedLockHtml}
        <button class="mc-note-btn" onclick="_jahrEditNote('${monthKey}', event)" onmouseenter="_showTooltip('${noteText ? esc(noteText) : "Notiz hinzufügen"}', this)" onmouseleave="_hideTooltip()">
          ${noteText ? "&#x1F4DD;" : "&#x270E;"}
        </button>
      </div>
      ${noteText ? `<div class="mc-note-text">${esc(noteText)}</div>` : ""}
      <div class="mc-row">
        <span class="mc-row-lbl">Einnahmen</span>
        <span class="mc-row-val" style="color:var(--green)">${m.inc > 0 ? "+" + fm(m.inc) : "—"}</span>
      </div>
      <div class="mc-row">
        <span class="mc-row-lbl">Ausgaben</span>
        <span class="mc-row-val" style="color:var(--red)">${m.exp > 0 ? "−" + fm(m.exp) : "—"}</span>
      </div>
      <hr class="mc-hr">
      <div class="mc-bal" style="color:${m.bal >= 0 ? "var(--green)" : "var(--red)"};">${fm(m.bal, true)}</div>
      <div class="mc-perf-bar">
        <div class="mc-perf-fill" style="width:${Math.min(100, m.spar).toFixed(1)}%;background:${m.spar >= 20 ? "var(--green)" : m.spar >= 8 ? "var(--amber)" : "var(--red)"}"></div>
      </div>
      <div class="mc-spar" style="color:var(--text3);font-size:.65em;margin-top:3px;">Sparquote: ${m.spar.toFixed(0)}%</div>
      <div class="mc-tags">
        ${activePosten.length > 0 ? `<span class="mc-tag mc-tag-count">${activePosten.length} Posten</span>` : ""}
        ${newStarts.map((p) => `<span class="mc-tag mc-tag-new">▶ ${esc(p.name)}</span>`).join("")}
        ${expiring.map((p) => `<span class="mc-contract-tag">⏱ ${esc(p.name)}</span>`).join("")}
      </div>`;
    grid.appendChild(card);
  });
}

// ── LISTEN-ANSICHT ────────────────────
function _renderMonthList(grid, months, n, yr, isCurrentYear, curMo) {
  grid.className = "year-list";
  months.forEach((m, idx) => {
    const activePosten = _activePostenForMonth(idx, yr);
    const einnahmen = activePosten.filter((p) => p.type === "einnahme");
    const ausgaben = activePosten.filter((p) => p.type === "ausgabe");
    const transfers = _activeTransfersForMonth(idx, yr);
    const isCur = isCurrentYear && idx === curMo;
    const isPast = isCurrentYear && idx < curMo;

    const ylrMk = `${yr}-${String(idx + 1).padStart(2, "0")}`;
    const isYlrClosed = (S.closedMonths || []).includes(ylrMk);
    const row = document.createElement("div");
    row.className =
      "year-list-row clickable" +
      (isCur ? " cur" : "") +
      (isPast ? " past" : "") +
      (isYlrClosed ? " ylr-closed" : "");
    row.onclick = () => openMonthModal(idx, yr, months[idx]);
    row.addEventListener("mouseenter", () => _showTooltip("Klicken für Details", row));
    row.addEventListener("mouseleave", _hideTooltip);

    // Posten-Pills (max 4 + Rest-Badge)
    const allItems = [
      ...einnahmen.map((p) => ({ ...p, _cls: "in" })),
      ...ausgaben.map((p) => ({ ...p, _cls: "out" })),
    ];
    const maxPills = 4;
    const pills = allItems
      .slice(0, maxPills)
      .map(
        (p) =>
          `<span class="ylr-pill ylr-pill-${p._cls}">${esc(p.name)}</span>`,
      )
      .join("");
    const more =
      allItems.length > maxPills
        ? `<span class="ylr-pill ylr-pill-more">+${allItems.length - maxPills}</span>`
        : "";

    row.innerHTML = `
      <div class="ylr-month">
        <div class="ylr-month-name${isCur ? " cur" : ""}">${MONTHS[idx]}${isYlrClosed ? " &#x1F512;" : ""}</div>
        <div class="ylr-month-year">${yr}</div>
      </div>
      <div class="ylr-numbers">
        <div class="ylr-num">
          <span class="ylr-lbl">Einnahmen</span>
          <span class="ylr-val" style="color:var(--green)">${m.inc > 0 ? "+" + fm(m.inc) : "—"}</span>
        </div>
        <div class="ylr-num">
          <span class="ylr-lbl">Ausgaben</span>
          <span class="ylr-val" style="color:var(--red)">${m.exp > 0 ? "−" + fm(m.exp) : "—"}</span>
        </div>
        <div class="ylr-num">
          <span class="ylr-lbl">Saldo</span>
          <span class="ylr-val" style="color:${m.bal >= 0 ? "var(--green)" : "var(--red)"};font-weight:700">${fm(m.bal, true)}</span>
        </div>
        <div class="ylr-num">
          <span class="ylr-lbl">Sparquote</span>
          <span class="ylr-val">${m.spar.toFixed(0)}%</span>
        </div>
      </div>
      <div class="ylr-pills">${pills}${more}${transfers.length > 0 ? `<span class="ylr-pill ylr-pill-trf">${transfers.length} Umbuchung${transfers.length > 1 ? "en" : ""}</span>` : ""}</div>
      <div class="ylr-arrow">›</div>`;
    grid.appendChild(row);
  });
}

// ══════════════════════════════════════
//  MONATS-MODAL — alle Buchungen & Umsätze
// ══════════════════════════════════════

// ══════════════════════════════════════
//  MONATS-MODAL — Premium Design
// ══════════════════════════════════════

function openMonthModal(mIdx, yr, mData) {
  document.getElementById("monthDetailModal")?.remove();

  const activePosten = _activePostenForMonth(mIdx, yr);
  const einnahmen = activePosten.filter((p) => p.type === "einnahme");
  const ausgaben = activePosten.filter((p) => p.type === "ausgabe");
  const transfers = _activeTransfersForMonth(mIdx, yr);
  const n = today();
  const isCurrent = mIdx === n.getMonth() && yr === n.getFullYear();
  const isPast =
    new Date(yr, mIdx, 1) < new Date(n.getFullYear(), n.getMonth(), 1);

  // Saldo-Balken: Anteil Ausgaben an Einnahmen
  const totalIn = mData.inc || 0;
  const totalOut = mData.exp || 0;
  const balColor = mData.bal >= 0 ? "var(--green)" : "var(--red)";
  const expPct =
    totalIn > 0
      ? Math.min(100, (totalOut / totalIn) * 100)
      : totalOut > 0
        ? 100
        : 0;
  const savePct = Math.max(0, 100 - expPct);

  // Monatsname + Jahreszahl + Wochentag des 1.
  const firstDay = new Date(yr, mIdx, 1);
  const weekDays = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  const monthFull = MONTHS[mIdx];

  // ── Monatskey ──────────────────────
  const monthKey = `${yr}-${String(mIdx + 1).padStart(2, "0")}`;

  // Status
  const isMonthClosed = (S.closedMonths || []).includes(monthKey);
  const closeEntryBk = isMonthClosed
    ? (S.bookings || []).find(b => b.isMonthCloseEntry && (b.monthKey || b.date?.slice(0, 7)) === monthKey)
    : null;
  const statusCfg = isCurrent
    ? { label: "Aktueller Monat", cls: "mm-status-current" }
    : isPast
      ? { label: "Vergangener Monat", cls: "mm-status-past" }
      : { label: "Ausstehend", cls: "mm-status-future" };

  // ── Vormonats-Vergleich ─────────────
  const prevMIdx = mIdx === 0 ? 11 : mIdx - 1;
  const prevYr   = mIdx === 0 ? yr - 1 : yr;
  const prevMk   = `${prevYr}-${String(prevMIdx + 1).padStart(2, "0")}`;
  let prevBal    = null;
  const prevBks  = (S.bookings || []).filter(b => b.monthKey === prevMk && b.status !== "ausgesetzt");
  if (prevBks.length) {
    const pInc = prevBks.filter(b => b.type === "einnahme").reduce((s, b) => s + b.amount, 0);
    const pExp = prevBks.filter(b => b.type === "ausgabe").reduce((s, b) => s + b.amount, 0);
    prevBal = pInc - pExp;
  }
  const deltaBal = prevBal !== null ? mData.bal - prevBal : null;
  const deltaColor = deltaBal === null ? "var(--text3)" : deltaBal >= 0 ? "var(--green)" : "var(--red)";
  const deltaStr = deltaBal === null ? "—"
    : (deltaBal >= 0 ? "+" : "") + fm(deltaBal, true);

  // ── Kategorien-Breakdown (echte Buchungen) ──────────────────────────
  const _mmCatBks = (S.bookings || []).filter(
    b => b.monthKey === monthKey && b.type === "ausgabe" && b.status !== "ausgesetzt"
  );
  const _mmAllCats = Array.isArray(S.categories) && S.categories.length
    ? S.categories
    : (typeof DEFAULT_CATEGORIES !== "undefined" ? DEFAULT_CATEGORIES : []);
  const _mmCatMap = {};
  _mmCatBks.forEach(b => {
    const catId = b.categoryId
      || (b.postenId ? (S.data.find(p => p.id === b.postenId) || {}).categoryId : null)
      || "__none__";
    if (!_mmCatMap[catId]) {
      const cat = _mmAllCats.find(c => c.id === catId);
      _mmCatMap[catId] = { label: cat ? cat.name : "Sonstiges", color: cat ? cat.color : "var(--text3)", icon: cat ? cat.icon : "package", total: 0 };
    }
    _mmCatMap[catId].total += Math.abs(b.amount || 0);
  });
  const _mmCatEntries = Object.entries(_mmCatMap)
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.total - a.total);
  const _mmCatTotal = _mmCatEntries.reduce((s, e) => s + e.total, 0);

  const catTabContent = _mmCatEntries.length
    ? `<div class="mm-cat-list">${_mmCatEntries.map(e => {
        const pct = _mmCatTotal > 0 ? ((e.total / _mmCatTotal) * 100).toFixed(0) : 0;
        const barW = _mmCatEntries[0].total > 0 ? ((e.total / _mmCatEntries[0].total) * 100).toFixed(1) : 0;
        return `<div class="mm-cat-row">
          <div class="mm-cat-left">
            <span class="mm-cat-dot" style="background:${e.color}"></span>
            <span class="mm-cat-icon" style="color:${e.color}">${uiIcon(e.icon, 14)}</span>
            <span class="mm-cat-name">${esc(e.label)}</span>
          </div>
          <div class="mm-cat-track"><div class="mm-cat-fill" style="width:${barW}%;background:${e.color}"></div></div>
          <div class="mm-cat-right">
            <span class="mm-cat-val">${fm(e.total)}</span>
            <span class="mm-cat-pct">${pct}%</span>
          </div>
        </div>`;
      }).join("")}
      <div class="mm-section-total"><span>Gesamt</span><span class="mm-amt-out">−${fm(_mmCatTotal)}</span></div>
    </div>`
    : `<div class="mm-empty-state"><div class="mm-empty-icon">📦</div><div class="mm-empty-label">Keine kategorisierten Ausgaben</div></div>`;

  function closeEntryRow(bk) {
    if (!bk) return "";
    const ceAcc = S.accounts.find(a => a.id === bk.accountId);
    const isIn = bk.type === "einnahme";
    const alertMsg = `Automatisch beim Monatsabschluss erstellt.\\nBetrag: ${bk.amount.toFixed(2).replace(".", ",")} \\u20ac\\nKonto: ${ceAcc ? ceAcc.label : "—"}`;
    return `<div class="mm-close-entry-sep"><span>&#x1F512; Abschluss-Ausgleich</span></div>
      <div class="mm-item mm-item-close" style="cursor:pointer;" onclick="appAlert('${alertMsg.replace(/'/g, "\\'")}',{title:'Abschluss-Buchung',icon:'&#x1F512;'})">
        <div class="mm-item-left">
          <div class="mm-item-dot" style="background:var(--blue)"></div>
          <div class="mm-item-info">
            <div class="mm-item-name">${esc(bk.name)}</div>
            <div class="mm-item-meta">
              ${ceAcc ? `<span>${esc(ceAcc.label)}</span><span class="mm-meta-sep">\xb7</span>` : ""}
              <span>einmalig</span>
            </div>
          </div>
        </div>
        <div class="mm-item-right">
          <div class="mm-item-amount ${isIn ? "mm-amt-in" : "mm-amt-out"}">${isIn ? "+" : "−"}${fm(bk.amount)}</div>
        </div>
      </div>`;
  }

  function postenRow(p, type) {
    const acc = S.accounts.find((a) => a.id === p.accountId);
    const mv = avgMonthly(p);
    const isIn = type === "einnahme";
    const idx = S.data.indexOf(p);

    // Echte Buchung für diesen Monat suchen (falls vorhanden)
    const bk = (S.bookings || []).find(
      (b) => b.postenId === p.id && b.monthKey === monthKey,
    );
    const baseAmt = parseFloat(p.amount) || 0;
    const actualAmt = bk ? bk.amount : baseAmt;
    const isChanged = bk && bk.status !== "gebucht";
    const isPaused = bk && bk.status === "ausgesetzt";

    // Ausgesetzte Buchungen nicht anzeigen
    if (isPaused) return "";

    let statusHtml = "";
    if (p.contractEnd) {
      const e = new Date(p.contractEnd),
        diff = Math.round((e - n) / 86400000);
      if (diff < 0)
        statusHtml = `<span class="badge expired">Abgelaufen</span>`;
      else if (diff <= 30)
        statusHtml = `<span class="badge warn">${diff}d</span>`;
      else if (diff <= 90)
        statusHtml = `<span class="badge warn">${Math.round(diff / 30)}M</span>`;
      else
        statusHtml = `<span class="badge ok">${e.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" })}</span>`;
    } else if (p.contractStart) {
      const s = new Date(p.contractStart);
      statusHtml =
        s > n
          ? `<span class="badge info">ab ${s.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}</span>`
          : `<span class="mm-dot-active"></span>`;
    } else {
      statusHtml = `<span class="mm-dot-active"></span>`;
    }

    // Buchungs-ID für Einzelbearbeitung (bk.id wenn vorhanden)
    const bkId = bk ? bk.id : null;

    return `<div class="mm-item" onclick="_mmOpenBookingEdit('${p.id}','${monthKey}',${idx})">
      <div class="mm-item-left">
        <div class="mm-item-dot" style="background:${acc ? acc.color : "var(--border2)"}"></div>
        <div class="mm-item-info">
          <div class="mm-item-name">
            ${esc(p.name)}
            ${isChanged ? `<span class="um-status um-st-changed" style="margin-left:5px;vertical-align:middle;">${bk.status}</span>` : ""}
          </div>
          <div class="mm-item-meta">
            ${acc ? `<span>${esc(acc.label)}</span><span class="mm-meta-sep">·</span>` : ""}
            <span>${p.interval}</span>
            ${p.due ? `<span class="mm-meta-sep">·</span><span>am ${p.due}.</span>` : ""}
          </div>
        </div>
      </div>
      <div class="mm-item-right" style="gap:8px;">
        <div>
          <div class="mm-item-amount ${isIn ? "mm-amt-in" : "mm-amt-out"}">${isIn ? "+" : "−"}${fm(actualAmt)}</div>
          ${
            isChanged
              ? `<div class="mm-item-avg" style="text-decoration:line-through;color:var(--text3);">${isIn ? "+" : "−"}${fm(baseAmt)}</div>`
              : mv > 0 && Math.abs(mv - baseAmt) > 0.01
                ? `<div class="mm-item-avg">Ø ${fm(mv)}/Mo</div>`
                : ""
          }
        </div>
        <div class="mm-item-status">${statusHtml}</div>
      </div>
    </div>`;
  }

  function transferRow(t) {
    const from = S.accounts.find((a) => a.id === t.fromId);
    const to = S.accounts.find((a) => a.id === t.toId);
    return `<div class="mm-item clickable" onclick="closeMonthModal();openModal(null,'transfer','${t.id}')">
      <div class="mm-item-left">
        <div class="mm-trf-icon">⇄</div>
        <div class="mm-item-info">
          <div class="mm-item-name">${from ? esc(from.label) : "?"} → ${to ? esc(to.label) : "?"}</div>
          <div class="mm-item-meta">
            <span>${t.interval || "einmalig"}</span>
            ${t.note ? `<span class="mm-meta-sep">·</span><span>${esc(t.note)}</span>` : ""}
          </div>
        </div>
      </div>
      <div class="mm-item-right">
        <div class="mm-item-amount mm-amt-trf">${fm(t.amount)}</div>
      </div>
    </div>`;
  }

  function emptyState(label) {
    return `<div class="mm-empty-state">
      <div class="mm-empty-icon">—</div>
      <div class="mm-empty-label">Keine ${label}</div>
    </div>`;
  }

  function section(items, type) {
    if (!items.length)
      return emptyState(
        type === "einnahme"
          ? "Einnahmen"
          : type === "ausgabe"
            ? "Ausgaben"
            : "Umbuchungen",
      );
    const rows =
      type === "transfer"
        ? items.map(transferRow).join("")
        : items.map((p) => postenRow(p, type)).join("");
    const total = items.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
    const avgTotal =
      type !== "transfer" ? items.reduce((s, p) => s + avgMonthly(p), 0) : 0;
    return `<div class="mm-items">${rows}</div>
      <div class="mm-section-total">
        <span>Gesamt</span>
        <span class="${type === "einnahme" ? "mm-amt-in" : type === "ausgabe" ? "mm-amt-out" : "mm-amt-trf"}">
          ${type === "einnahme" ? "+" : type === "ausgabe" ? "−" : ""}${fm(total)}
        </span>
      </div>`;
  }

  // ── Overlay + Modal HTML ───────────
  const overlay = document.createElement("div");
  overlay.id = "monthDetailModal";
  overlay.className = "overlay open";
  overlay.style.cssText = "z-index:600;";
  overlay.onclick = (e) => {
    if (e.target === overlay) closeMonthModal();
  };

  overlay.innerHTML = `<div class="mm-modal">

    <!-- ░░ HERO-HEADER ░░ -->
    <div class="mm-hero">
      <div class="mm-hero-bg"></div>
      <div class="mm-hero-content">
        <div class="mm-hero-left">
          <div class="mm-hero-month">${monthFull}</div>
          <div class="mm-hero-year">${yr}</div>
          <span class="mm-status ${statusCfg.cls}">${statusCfg.label}</span>
          ${isPast || isCurrent ? `<span class="mm-status ${isMonthClosed ? "mm-status-finalized" : "mm-status-open"}">${isMonthClosed ? "&#x1F512; Finalisiert" : "&#x1F513; Nicht finalisiert"}</span>` : ""}
        </div>
        <button class="mm-close" onclick="closeMonthModal()" onmouseenter="_showTooltip('Schließen',this)" onmouseleave="_hideTooltip()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <!-- Saldo-Balken -->
      <div class="mm-balance-bar-wrap">
        <div class="mm-balance-bar">
          <div class="mm-balance-fill mm-fill-out" style="width:${expPct.toFixed(1)}%"></div>
          <div class="mm-balance-fill mm-fill-in"  style="width:${savePct.toFixed(1)}%"></div>
        </div>
        <div class="mm-balance-labels">
          <span style="color:var(--red)">Ausgaben ${expPct.toFixed(0)}%</span>
          <span style="color:var(--green)">Verfügbar ${savePct.toFixed(0)}%</span>
        </div>
      </div>
    </div>

    <!-- ░░ KPI-REIHE ░░ -->
    <div class="mm-kpi-row">
      <div class="mm-kpi-card">
        <div class="mm-kpi-icon" style="background:var(--green-a10);color:var(--green)">↑</div>
        <div>
          <div class="mm-kpi-label">Einnahmen</div>
          <div class="mm-kpi-value" style="color:var(--green)">${totalIn > 0 ? "+" + fm(totalIn) : "—"}</div>
        </div>
      </div>
      <div class="mm-kpi-card">
        <div class="mm-kpi-icon" style="background:var(--red-a10);color:var(--red)">↓</div>
        <div>
          <div class="mm-kpi-label">Ausgaben</div>
          <div class="mm-kpi-value" style="color:var(--red)">${totalOut > 0 ? "−" + fm(totalOut) : "—"}</div>
        </div>
      </div>
      <div class="mm-kpi-card">
        <div class="mm-kpi-icon" style="background:var(--blue-a08);color:var(--blue)">=</div>
        <div>
          <div class="mm-kpi-label">Saldo</div>
          <div class="mm-kpi-value" style="color:${balColor}">${fm(mData.bal, true)}</div>
        </div>
      </div>
      <div class="mm-kpi-card">
        <div class="mm-kpi-icon" style="background:var(--amber-a10);color:var(--amber)">%</div>
        <div>
          <div class="mm-kpi-label">Sparquote</div>
          <div class="mm-kpi-value">${mData.spar.toFixed(1)}%</div>
        </div>
      </div>
      <div class="mm-kpi-card">
        <div class="mm-kpi-icon" style="background:var(--blue-a08);color:var(--blue)">Δ</div>
        <div>
          <div class="mm-kpi-label">vs. Vormonat</div>
          <div class="mm-kpi-value" style="color:${deltaColor}">${deltaStr}</div>
        </div>
      </div>
    </div>

    <!-- ░░ TABS ░░ -->
    <div class="mm-tabs">
      <button class="mm-tab active" onclick="_mmTab(this,'mm-tab-ein')">
        <span class="mm-tab-label">Einnahmen</span>
        <span class="mm-tab-count mm-tc-in">${einnahmen.length + (closeEntryBk && closeEntryBk.type === "einnahme" ? 1 : 0)}</span>
      </button>
      <button class="mm-tab" onclick="_mmTab(this,'mm-tab-aus')">
        <span class="mm-tab-label">Ausgaben</span>
        <span class="mm-tab-count mm-tc-out">${ausgaben.length + (closeEntryBk && closeEntryBk.type === "ausgabe" ? 1 : 0)}</span>
      </button>
      <button class="mm-tab" onclick="_mmTab(this,'mm-tab-trf')">
        <span class="mm-tab-label">Umbuchungen</span>
        <span class="mm-tab-count">${transfers.length}</span>
      </button>
      <button class="mm-tab" onclick="_mmTab(this,'mm-tab-kat')">
        <span class="mm-tab-label">Kategorien</span>
        <span class="mm-tab-count">${_mmCatEntries.length}</span>
      </button>
    </div>

    <!-- ░░ TAB-INHALTE ░░ -->
    <div class="mm-body">
      <div id="mm-tab-ein" class="mm-pane active">${section(einnahmen, "einnahme")}${closeEntryBk && closeEntryBk.type === "einnahme" ? closeEntryRow(closeEntryBk) : ""}</div>
      <div id="mm-tab-aus" class="mm-pane">${section(ausgaben, "ausgabe")}${closeEntryBk && closeEntryBk.type === "ausgabe" ? closeEntryRow(closeEntryBk) : ""}</div>
      <div id="mm-tab-trf" class="mm-pane">${section(transfers, "transfer")}</div>
      <div id="mm-tab-kat" class="mm-pane">${catTabContent}</div>
    </div>

    <!-- ░░ FOOTER ░░ -->
    <div class="mm-footer">
      <div class="mm-footer-info">
        ${activePosten.length} Posten aktiv · ${transfers.length} Umbuchungen
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn" onclick="closeMonthModal()">Schließen</button>
        <button class="btn" onclick="closeMonthModal();_umFocusMonth='${monthKey}';_navTo('posten')">Transaktionen →</button>
        ${isPast && !(S.closedMonths || []).includes(monthKey)
          ? `<button class="btn danger-outline" onclick="closeMonthModal();_umCloseMonthPrompt('${monthKey}')" onmouseenter="_showTooltip('Monat finalisieren — Überschuss automatisch verbuchen',this)" onmouseleave="_hideTooltip()">&#x1F512; Monat abschlie&szlig;en</button>`
          : (S.closedMonths || []).includes(monthKey)
            ? `<span class="mm-closed-hint">&#x1F512; Abgeschlossen</span><button class="btn sm" onclick="closeMonthModal();_umReopenMonth('${monthKey}')" onmouseenter="_showTooltip('Abschluss r\xfckg\xe4ngig machen',this)" onmouseleave="_hideTooltip()">&#x1F513; \xd6ffnen</button>`
            : ""}
        <button class="btn primary" onclick="closeMonthModal();openModal()">+ Neuer Posten</button>
      </div>
    </div>

  </div>`;

  document.body.appendChild(overlay);

  // Einblend-Animation
  requestAnimationFrame(() => {
    overlay.querySelector(".mm-modal")?.classList.add("mm-modal-in");
  });
}

function closeMonthModal() {
  document.getElementById("monthDetailModal")?.remove();
}

function _mmTab(btn, tabId) {
  const modal = btn.closest(".mm-modal") || btn.closest(".modal");
  if (!modal) return;
  modal
    .querySelectorAll(".mm-tab, .modal-tab")
    .forEach((b) => b.classList.remove("active"));
  modal
    .querySelectorAll(".mm-pane, .modal-pane")
    .forEach((p) => p.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById(tabId)?.classList.add("active");
}

// ══════════════════════════════════════
//  MONATSMODAL — Einzelbuchung bearbeiten
//  Öffnet ein schlankes Modal für eine
//  einzelne Buchung — NICHT die Serie
// ══════════════════════════════════════
function _mmOpenBookingEdit(postenId, monthKey, postenIdx) {
  // Buchung suchen oder vorbereiten
  const p = S.data[postenIdx];
  if (!p) return;

  let bk = (S.bookings || []).find(
    (b) => b.postenId === postenId && b.monthKey === monthKey,
  );
  const baseAmt = parseFloat(p.amount) || 0;
  const acc = S.accounts.find((a) => a.id === p.accountId);
  const isIn = p.type === "einnahme";

  // Falls noch keine Buchung für diesen Monat existiert → wird beim Speichern erzeugt
  const currentAmt = bk ? bk.amount : baseAmt;
  const currentNote = bk ? bk.note : p.note || "";
  const currentStat = bk ? bk.status : "gebucht";

  const [yr, mon] = monthKey.split("-").map(Number);
  const monthLabel = `${MONTHS[mon - 1]} ${yr}`;

  const accOpts = S.accounts
    .map(
      (a) =>
        `<option value="${a.id}"${a.id === (bk ? bk.accountId : p.accountId) ? " selected" : ""}>${esc(a.label)}</option>`,
    )
    .join("");


  // Bestehende Overlays schließen
  document.getElementById("mmBookingEditOverlay")?.remove();

  const _mmBkCred = (() => {
    if (!p.creditorId) return null;
    return (S.creditors || []).find(c => c.id === p.creditorId) || null;
  })();
  const mmCredBlock = _mmBkCred ? `
        <div class="um-edit-row">
          <label>Abgewickelt über</label>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-weight:600;color:var(--text)">${esc(_mmBkCred.name)}</span>
            <button class="btn sm" style="margin-left:auto" onclick="openCreditorDetails('${_mmBkCred.id}')">Details</button>
          </div>
        </div>` : "";

  const ov = document.createElement("div");
  ov.id = "mmBookingEditOverlay";
  ov.style.cssText =
    "position:fixed;inset:0;z-index:1100;background:rgba(0,0,0,.6);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;";
  ov.innerHTML = `
    <div class="um-edit-modal">
      <div class="um-edit-header">
        <div>
          <div class="um-edit-title">${esc(p.name)}</div>
          <div class="um-edit-sub">${monthLabel} · ${p.interval} · Einzelbuchung</div>
        </div>
        <button onclick="document.getElementById('mmBookingEditOverlay').remove()" class="pv-pop-close" style="font-size:1.2em;flex-shrink:0;">✕</button>
      </div>

      <div class="um-edit-body">

        <!-- Betrag -->
        <div class="um-edit-row">
          <label>Betrag nur für ${monthLabel}</label>
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="color:var(--text3);font-size:.9em;">${isIn ? "+" : "−"}</span>
            <input id="mmBkAmt" class="um-edit-inp mono" type="number" step="0.01" min="0"
              value="${currentAmt.toFixed(2)}" style="flex:1;">
            <span style="color:var(--text3);font-size:.85em;">€</span>
            ${
              currentAmt !== baseAmt
                ? `<button class="btn sm" onmouseenter="_showTooltip('Auf Serienbetrag zurücksetzen',this)" onmouseleave="_hideTooltip()"
                  onclick="document.getElementById('mmBkAmt').value='${baseAmt.toFixed(2)}'"
                  >↺ ${fm(baseAmt)}</button>`
                : `<span style="font-size:.7em;color:var(--text3);">Serie: ${fm(baseAmt)}</span>`
            }
          </div>
        </div>

        <!-- Status -->
        <div class="um-edit-row">
          <label>Status</label>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${["gebucht", "geändert", "ausgesetzt", "vorgemerkt"]
              .map(
                (s) => `
              <button class="btn sm${currentStat === s ? " primary" : ""}" id="mmBkSt_${s}"
                onclick="document.querySelectorAll('[id^=mmBkSt_]').forEach(b=>b.classList.remove('primary'));this.classList.add('primary');${s === "ausgesetzt" ? `document.getElementById('mmBkAmt').value='0.00';` : ""}"
              >${s}</button>`,
              )
              .join("")}
          </div>
        </div>

        <!-- Konto -->
        <div class="um-edit-row">
          <label>Konto (nur diese Buchung)</label>
          <select id="mmBkAcc" class="um-edit-inp">
            ${accOpts}
          </select>
        </div>

        <!-- Notiz -->
        <div class="um-edit-row">
          <label>Notiz (nur diese Buchung)</label>
          <input id="mmBkNote" class="um-edit-inp" type="text"
            placeholder="Optionale Anmerkung…" value="${esc(currentNote)}">
        </div>

        ${mmCredBlock}

      </div>

      <div class="um-edit-footer">
        ${bk ? `<button class="btn danger" onclick="_mmDeleteBooking('${bk.id}')">Löschen</button>` : ""}
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-left:auto;">
          ${p.interval !== "einmalig" ? `<button class="btn" onclick="document.getElementById('mmBookingEditOverlay').remove();openModal(${postenIdx})" onmouseenter="_showTooltip('Gesamte Serie bearbeiten',this)" onmouseleave="_hideTooltip()">Serie ✎</button>` : ""}
          <button class="btn" onclick="document.getElementById('mmBookingEditOverlay').remove()">Abbrechen</button>
          <button class="btn primary" onclick="_mmSaveBookingEdit('${postenId}','${monthKey}',${postenIdx})">Speichern</button>
        </div>
      </div>
    </div>`;

  document.body.appendChild(ov);
  ov.addEventListener("click", (e) => {
    if (e.target === ov) ov.remove();
  });
  setTimeout(() => document.getElementById("mmBkAmt")?.select(), 50);
}

function _mmSaveBookingEdit(postenId, monthKey, postenIdx) {
  const amt = parseFloat(document.getElementById("mmBkAmt")?.value) || 0;
  const note = document.getElementById("mmBkNote")?.value.trim() || "";
  const accId = document.getElementById("mmBkAcc")?.value || "";
  const status =
    document
      .querySelector("[id^='mmBkSt_'].primary")
      ?.id.replace("mmBkSt_", "") || "gebucht";

  // Buchung existiert bereits → saveBooking nutzen
  const bk = (S.bookings || []).find(
    (b) => b.postenId === postenId && b.monthKey === monthKey,
  );
  if (bk) {
    saveBooking(bk.id, { amount: amt, note, accountId: accId, status });
  } else {
    // Neue Einzelbuchung via _pvApplyOverride erzeugen
    _pvApplyOverride(postenId, monthKey, amt, note);
    // Konto separat setzen falls abweichend
    const newBk = (S.bookings || []).find(
      (b) => b.postenId === postenId && b.monthKey === monthKey,
    );
    if (newBk && accId) newBk.accountId = accId;
    persist();
  }

  document.getElementById("mmBookingEditOverlay")?.remove();

  // Monatsmodal neu öffnen mit aktualisierten Daten
  const [yr, mon] = monthKey.split("-").map(Number);
  const months = _calcMonths(yr);
  openMonthModal(mon - 1, yr, months[mon - 1]);
}

function _mmDeleteBooking(bookingId) {
  const bk = S.bookings.find((b) => b.id === bookingId);
  const name = bk ? bk.name : "Buchung";
  appConfirm(
    `"${name}" für diesen Monat löschen?\nDie Serie bleibt unverändert.`,
    {
      icon: "🗑️",
      title: "Einzelbuchung löschen",
      confirmLabel: "Löschen",
      confirmClass: "danger",
    },
  ).then((ok) => {
    if (!ok) return;
    deleteBooking(bookingId);
    document.getElementById("mmBookingEditOverlay")?.remove();
    // Monatsmodal schließen und neu öffnen
    if (bk) {
      const [yr, mon] = bk.monthKey.split("-").map(Number);
      closeMonthModal();
      const months = _calcMonths(yr);
      setTimeout(() => openMonthModal(mon - 1, yr, months[mon - 1]), 100);
    }
  });
}
