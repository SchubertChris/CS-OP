// ══════════════════════════════════════
//  BOOKINGS — Das Uhrwerk
//  Generiert echte S.bookings[] Einträge
//  aus vergangenen Serien (S.data)
//  Läuft beim App-Start automatisch
// ══════════════════════════════════════

/**
 * Booking-Objekt:
 * {
 *   id:         "bk_...",
 *   postenId:   "p_..." | null,       // Quelle: Fixposten
 *   transferId: "trf_..." | null,     // Quelle: Transfer
 *   date:       "2026-03-15",         // Fälligkeitsdatum (YYYY-MM-DD)
 *   monthKey:   "2026-03",            // Für Dedup-Check
 *   name:       "Pro Potsdam GmbH",
 *   type:       "einnahme"|"ausgabe"|"umbuchung",
 *   amount:     557.37,               // Tatsächlicher Betrag (editierbar)
 *   baseAmount: 557.37,               // Original-Betrag der Serie
 *   accountId:  "acc_giro",
 *   status:     "gebucht"|"vorgemerkt"|"ausgesetzt"|"geändert"|"beglichen",
 *   note:       "",
 *   interval:   "monatl.",
 * }
 */

// ── INITIALISIERUNG ───────────────────
// Wird von main.js nach hydrate() aufgerufen
function initBookings() {
  if (!S.bookings) S.bookings = [];
  _generatePastBookings();
}

// ── HAUPTFUNKTION ─────────────────────
// Wie viele Monate in die Zukunft als "vorgemerkt" generieren
const _UPCOMING_MONTHS = 3;

function _generatePastBookings() {
  const n = today();
  const cutoffYr = n.getFullYear();
  const cutoffMon = n.getMonth() + 1; // Schleifengrenze: aktueller Monat inkludiert

  // Heutiges Datum als Vergleichsgrundlage (Tag-genau, offline)
  // WICHTIG: Kein toISOString() — das liefert UTC, was in CET/CEST einen Tag zurückspringen kann
  const todayStart = new Date(n.getFullYear(), n.getMonth(), n.getDate());
  const todayDateStr = `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;

  // "vorgemerkt"-Buchungen entfernen — werden frisch regeneriert
  // "beglichen" und "gebucht" (vergangenheit) bleiben erhalten
  // Migration: alte "gebucht"-Buchungen mit Datum in der Zukunft → auch entfernen
  // Verwaiste Buchungen: Posten/Transfer wurde gelöscht → Buchung mitentfernen
  const _validPostenIds = new Set((S.data || []).map(p => p.id));
  const _validTransferIds = new Set((S.transfers || []).map(t => t.id));
  S.bookings = S.bookings.filter(b => {
    if (!b.date || typeof b.date !== "string") return false; // korrupte Einträge
    // Abschluss-Buchungen: nur behalten wenn Monat noch finalisiert ist
    if (b.isMonthCloseEntry) {
      const _bMk = b.monthKey || b.date.slice(0, 7);
      return Array.isArray(S.closedMonths) && S.closedMonths.includes(_bMk);
    }
    // Verwaist: Posten/Transfer existiert nicht mehr → immer entfernen
    if (b.postenId && !_validPostenIds.has(b.postenId)) return false;
    if (b.transferId && !_validTransferIds.has(b.transferId)) return false;
    // Abgeschlossene Monate sind final — Buchungen bleiben unverändert erhalten
    const _bMk = b.monthKey || b.date.slice(0, 7);
    if ((S.closedMonths || []).includes(_bMk)) return true;
    if (b.status === "vorgemerkt" || b.status === "ausstehend") return false;
    if (b.status === "gebucht" && b.date > todayDateStr) return false;
    return true;
  });

  // Dedup-Set: originalMonthKey preferred (bei beglichenen Buchungen das geplante Monat)
  const existing = new Set(
    S.bookings
      .filter((b) => b.postenId)
      .map((b) => `${b.postenId}_${b.originalMonthKey || b.monthKey}`),
  );
  const existingTrf = new Set(
    S.bookings
      .filter((b) => b.transferId)
      .map((b) => `${b.transferId}_${b.originalMonthKey || b.monthKey}`),
  );

  const newBookings = [];

  // ── FIXPOSTEN → Buchungen ──
  S.data.forEach((p) => {
    if (p.interval === "einmalig") {
      // Einmalig: nur wenn contractStart in der Vergangenheit
      if (!p.contractStart) return;
      const d = new Date(p.contractStart);
      if (_isInFuture(d, cutoffYr, cutoffMon)) return;
      const mk = _monthKey(d);
      const dedupKey = `${p.id}_${mk}`;
      if (existing.has(dedupKey)) return;
      newBookings.push(_makeBooking(p, d, mk));
      return;
    }

    // Serielle Posten: alle vergangenen aktiven Monate
    const startDate = p.contractStart
      ? new Date(p.contractStart)
      : new Date(cutoffYr - 6, 0, 1);
    // null = kein Vertragsende → Schleife läuft bis upcomingEnd (3 Monate voraus)
    const endDate = (p.contractEnd && _hasDate(p.contractEnd))
      ? new Date(p.contractEnd)
      : null;

    // Von contractStart bis Stichtag + _UPCOMING_MONTHS
    let yr = startDate.getFullYear();
    let mon = startDate.getMonth();

    // Max 5 Jahre zurück um Performance zu schonen
    const minYr = cutoffYr - 5;
    if (yr < minYr) {
      yr = minYr;
      mon = 0;
    }

    // Grenze: aktueller Monat + _UPCOMING_MONTHS
    let upcomingEndYr = cutoffYr;
    let upcomingEndMon = cutoffMon - 1 + _UPCOMING_MONTHS;
    while (upcomingEndMon > 11) { upcomingEndMon -= 12; upcomingEndYr++; }

    while (true) {
      // Stopp wenn wir über upcoming-Grenze sind
      if (yr > upcomingEndYr || (yr === upcomingEndYr && mon > upcomingEndMon)) break;
      // Stopp wenn nach contractEnd
      if (
        endDate &&
        new Date(yr, mon, 1) >
          new Date(endDate.getFullYear(), endDate.getMonth(), 1)
      )
        break;

      if (activeInMonth(p, mon, yr)) {
        const mk = `${yr}-${String(mon + 1).padStart(2, "0")}`;
        const dedupKey = `${p.id}_${mk}`;

        if (!existing.has(dedupKey)) {
          const due = parseInt(p.due) || 1;
          const daysInMonth = new Date(yr, mon + 1, 0).getDate();
          const day = Math.min(due, daysInMonth);
          const bookingDate = new Date(yr, mon, day);
          // Tag-genau: Datum noch nicht erreicht → vorgemerkt, sonst gebucht (00:00 Uhr)
          const isScheduled = bookingDate > todayStart;
          newBookings.push(_makeBooking(p, bookingDate, mk, isScheduled ? "vorgemerkt" : "gebucht"));
        }
      }

      mon++;
      if (mon > 11) {
        mon = 0;
        yr++;
      }
    }
  });

  // ── TRANSFERS → Buchungen ──
  (S.transfers || []).forEach((t) => {
    if (!t.date) return;
    const d = new Date(t.date);

    if (t.interval && t.interval !== "einmalig") {
      // Wiederkehrende Transfers: wie Fixposten — inkl. upcoming months mit "vorgemerkt"
      const startDate = d;
      let yr = startDate.getFullYear();
      let mon = startDate.getMonth();
      const minYr = cutoffYr - 5;
      if (yr < minYr) {
        yr = minYr;
        mon = 0;
      }

      // Grenze: wie Fixposten — aktueller Monat + _UPCOMING_MONTHS
      let trfEndYr = cutoffYr;
      let trfEndMon = cutoffMon - 1 + _UPCOMING_MONTHS;
      while (trfEndMon > 11) { trfEndMon -= 12; trfEndYr++; }

      while (true) {
        if (yr > trfEndYr || (yr === trfEndYr && mon > trfEndMon)) break;
        if (!activeInMonth({ interval: t.interval, contractStart: t.date, contractEnd: null }, mon, yr)) {
          mon++;
          if (mon > 11) {
            mon = 0;
            yr++;
          }
          continue;
        }
        const mk = `${yr}-${String(mon + 1).padStart(2, "0")}`;
        const dedupKey = `${t.id}_${mk}`;
        if (!existingTrf.has(dedupKey)) {
          const execDay = parseInt(t.execDay) || d.getDate();
          const daysInMonth = new Date(yr, mon + 1, 0).getDate();
          const day = Math.min(execDay, daysInMonth);
          const bookingDate = new Date(yr, mon, day);
          const isTrfScheduled = bookingDate > todayStart;
          newBookings.push(_makeTransferBooking(t, bookingDate, mk, isTrfScheduled ? "vorgemerkt" : "gebucht"));
        }
        mon++;
        if (mon > 11) {
          mon = 0;
          yr++;
        }
      }
    } else {
      // Einmalige Transfers: nur wenn in der Vergangenheit
      if (_isInFuture(d, cutoffYr, cutoffMon)) return;
      const mk = _monthKey(d);
      const dedupKey = `${t.id}_${mk}`;
      if (existingTrf.has(dedupKey)) return;
      newBookings.push(_makeTransferBooking(t, d, mk));
    }
  });

  if (newBookings.length > 0) {
    S.bookings.push(...newBookings);
    // Sortieren: neueste zuerst
    S.bookings.sort((a, b) => String(b.date).localeCompare(String(a.date)));
    persist();
  }
}

// ── HILFSFUNKTIONEN ───────────────────
function _monthKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function _isInFuture(d, cutoffYr, cutoffMon) {
  // cutoffMon ist jetzt curMonth+1 → alles >= cutoffMon ist Zukunft
  return (
    d.getFullYear() > cutoffYr ||
    (d.getFullYear() === cutoffYr && d.getMonth() >= cutoffMon)
  );
}

function _makeBooking(p, date, monthKey, defaultStatus = "gebucht") {
  // Override-Betrag berücksichtigen (nur für vergangene/aktuelle Buchungen sinnvoll)
  const baseAmount = parseFloat(p.amount) || 0;
  let amount = baseAmount;
  let status = defaultStatus;
  let note = p.note || "";

  if (defaultStatus !== "vorgemerkt" && p.overrides && monthKey in p.overrides) {
    const ov = p.overrides[monthKey];
    if (typeof ov === "object") {
      amount = ov.amount !== undefined ? ov.amount : baseAmount;
      status = ov.status || (amount === 0 ? "ausgesetzt" : "geändert");
      note = ov.note !== undefined ? ov.note : note;
    } else {
      // Altes Format: nur Zahl
      amount = ov;
      status = amount === 0 ? "ausgesetzt" : "geändert";
    }
  }

  return {
    id: genId("bk"),
    postenId: p.id,
    transferId: null,
    date: `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`,
    monthKey,
    originalMonthKey: monthKey, // bleibt auch nach Begleichen erhalten (Dedup-Anker)
    name: p.name,
    type: p.type,
    amount,
    baseAmount,
    accountId: p.accountId,
    status,
    note,
    interval: p.interval,
  };
}

function _makeTransferBooking(t, date, monthKey, status = "gebucht") {
  const from = S.accounts.find((a) => a.id === t.fromId);
  const to = S.accounts.find((a) => a.id === t.toId);
  return {
    id: genId("bk"),
    postenId: null,
    transferId: t.id,
    date: `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`,
    monthKey,
    originalMonthKey: monthKey,
    name: (from ? from.label : "?") + " → " + (to ? to.label : "?"),
    type: "umbuchung",
    amount: parseFloat(t.amount) || 0,
    baseAmount: parseFloat(t.amount) || 0,
    accountId: t.fromId,
    status,
    note: t.note || "",
    interval: t.interval || "einmalig",
  };
}

// ── BUCHUNG BEARBEITEN ────────────────
function saveBooking(bookingId, changes) {
  const bk = S.bookings.find((b) => b.id === bookingId);
  if (!bk) return;

  // ── BEGLEICHEN: manuell als erledigt markiert ──
  if (changes.settledDate !== undefined) {
    // originalMonthKey VOR dem Überschreiben sichern (= geplanter Monat der Verpflichtung)
    bk.originalMonthKey = bk.originalMonthKey || bk.monthKey;
    const obligationMonth = bk.originalMonthKey;

    if (changes.amount !== undefined) bk.amount = parseFloat(changes.amount) || bk.amount;
    if (changes.note !== undefined) bk.note = changes.note;

    // settledAt = voller ISO-Timestamp für Anzeige (Datum + Uhrzeit)
    // date/monthKey = tatsächlicher Zahlungsmonat (kann vom Fälligkeitsmonat abweichen)
    bk.settledAt = changes.settledDate;
    bk.date      = changes.settledDate.slice(0, 10);
    bk.monthKey  = changes.settledDate.slice(0, 7);
    bk.status    = "beglichen";

    // Für Einzelbuchungen: contractStart in S.data aktualisieren
    if (bk.interval === "einmalig" && bk.postenId) {
      const p = S.data.find((d) => d.id === bk.postenId);
      if (p) { p.contractStart = bk.date; p.contractEnd = bk.date; }
    }

    // Override auf den VERPFLICHTUNGSMONAT schreiben → Pivot + Jahresübersicht
    // erkennen systemweit dass diese Periode beglichen ist, unabhängig vom Zahlungsdatum
    if (bk.postenId) {
      const p = S.data.find((d) => d.id === bk.postenId);
      if (p) {
        if (!p.overrides) p.overrides = {};
        p.overrides[obligationMonth] = {
          amount:    bk.amount,
          status:    "beglichen",
          note:      bk.note || "",
          settledAt: changes.settledDate,
          paidDate:  bk.date,       // tatsächliches Zahlungsdatum (ggf. anderer Monat)
        };
      }
    }

    persist();
    _afterSaveBooking();
    return;
  }

  const oldMonthKey = bk.monthKey;

  if (changes.amount !== undefined) {
    bk.amount = parseFloat(changes.amount) || 0;
    // Status automatisch ableiten wenn nicht explizit übergeben
    if (changes.status === undefined) {
      bk.status =
        bk.amount === 0
          ? "ausgesetzt"
          : bk.amount !== bk.baseAmount
            ? "geändert"
            : "gebucht";
    }
  }
  if (changes.note !== undefined) bk.note = changes.note;
  if (changes.status !== undefined) bk.status = changes.status;
  if (changes.accountId !== undefined) bk.accountId = changes.accountId;
  if (changes.name !== undefined) bk.name = changes.name;
  // Buchungsdatum manuell anpassen (monthKey wird mitgezogen)
  if (changes.date) {
    bk.date = changes.date;
    bk.monthKey = changes.date.slice(0, 7);
  }

  // ── SYNC → p.overrides ──
  // Damit Pivot-Tabelle denselben Wert liest
  if (bk.postenId) {
    const p = S.data.find((d) => d.id === bk.postenId);
    if (p) {
      if (!p.overrides) p.overrides = {};
      if (oldMonthKey !== bk.monthKey) delete p.overrides[oldMonthKey];
      if (bk.status === "gebucht" && bk.amount === bk.baseAmount) {
        // Wieder auf Original → Override entfernen
        delete p.overrides[bk.monthKey];
        if (Object.keys(p.overrides).length === 0) delete p.overrides;
      } else {
        p.overrides[bk.monthKey] = {
          amount: bk.amount,
          status: bk.status,
          note: bk.note,
        };
      }
    }
  }

  persist();
  _afterSaveBooking();
}

function _afterSaveBooking() {
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
  if (typeof renderVertraege === "function" &&
    document.getElementById("p-vertraege")?.classList.contains("active")
  ) {
    renderVertraege();
  }
  if (typeof _pvRefreshIfVisible === "function") _pvRefreshIfVisible();
  if (typeof refreshDash === "function") refreshDash();
  if (typeof updateContractBadge === "function") updateContractBadge();
}

// ── BUCHUNG LÖSCHEN ───────────────────
function deleteBooking(bookingId) {
  S.bookings = S.bookings.filter((b) => b.id !== bookingId);
  persist();
  if (typeof renderPosten === "function") renderPosten();
}

// ── MONATSSUMMEN AUS BOOKINGS ─────────
// Für Dashboard/Pivot: vergangene Monate aus echten Buchungen
function bookingsForMonth(yr, mIdx) {
  const mk = `${yr}-${String(mIdx + 1).padStart(2, "0")}`;
  return (S.bookings || []).filter(
    (b) => b.monthKey === mk && b.status !== "ausgesetzt" && b.status !== "vorgemerkt",
  );
}

function bookingsSumForMonth(yr, mIdx, type) {
  return bookingsForMonth(yr, mIdx)
    .filter((b) => !type || b.type === type)
    .reduce((s, b) => s + (b.amount || 0), 0);
}

// ── SYNC NACH SERIE-EDIT ──────────────
// Wird von _afterSave() aufgerufen wenn ein Posten bearbeitet wurde.
// Aktualisiert S.bookings-Einträge die KEINE manuelle Änderung haben
// (status === "gebucht" und amount === baseAmount).
// Einträge mit status "geändert" oder "ausgesetzt" bleiben unberührt.
function _syncBookingsAfterSerieEdit() {
  if (!Array.isArray(S.bookings)) return;

  S.data.forEach((p) => {
    const bks = S.bookings.filter((b) => b.postenId === p.id);
    bks.forEach((b) => {
      // Nur unveränderte und vorgemerkte Buchungen synchronisieren
      if (b.status !== "gebucht" && b.status !== "vorgemerkt") return;
      // Name, Konto, Intervall vom Posten aktualisieren
      b.name = p.name;
      b.accountId = p.accountId;
      b.interval = p.interval;
      b.type = p.type;
      // baseAmount aktualisieren — der Serienblock hat neuen Betrag
      const newBase = parseFloat(p.amount) || 0;
      b.baseAmount = newBase;
      b.amount = newBase; // unverändert → Serienamt übernehmen
    });
  });

  // Neue vergangene Monate generieren (falls Laufzeit verlängert wurde)
  _generatePastBookings();
}
