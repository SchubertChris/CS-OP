import type { Posten, Transfer, Booking, BookingStatus, Interval } from '../types/models';
import { today, toIso, getMonthKey, makeDate, clampDay } from './date';
import { genId } from './format';

const YEARS_BACK    = 5;
const MONTHS_FORWARD = 3;

function intervalMonths(interval: Interval): number {
  switch (interval) {
    case 'monatl.':    return 1;
    case 'viertelj.':  return 3;
    case 'halbjährl.': return 6;
    case 'jährl.':     return 12;
    case 'einmalig':   return 0;
  }
}

function bookingDate(year: number, month: number, day: number): string {
  return makeDate(year, month, clampDay(day, year, month));
}

export function generateBookings(
  posten: Posten[],
  transfers: Transfer[],
  existingBookings: Booking[],
): Booking[] {
  const now        = new Date();
  const todayStr   = toIso(now);
  const todayMk    = getMonthKey(todayStr);

  // Berechne Zeitfenster
  const startDate  = new Date(now);
  startDate.setFullYear(startDate.getFullYear() - YEARS_BACK);
  startDate.setDate(1);

  const endDate    = new Date(now);
  endDate.setMonth(endDate.getMonth() + MONTHS_FORWARD + 1);
  endDate.setDate(0); // letzter Tag des End-Monats

  const upcomingEnd = toIso(endDate);

  // Bestehende Buchungen als Map für Dedup + Status-Übernahme
  const existingMap = new Map<string, Booking>();
  for (const b of existingBookings) {
    if (b.postenId) existingMap.set(`${b.postenId}:${b.monthKey}`, b);
    if (b.transferId) existingMap.set(`tr:${b.transferId}:${b.monthKey}`, b);
  }

  const result: Booking[] = [];

  // ── Posten → Buchungen ──────────────────────────────────────
  for (const p of posten) {
    const step = intervalMonths(p.interval);

    if (p.interval === 'einmalig') {
      if (!p.contractStart) continue;
      const mk  = getMonthKey(p.contractStart);
      const key = `${p.id}:${mk}`;
      if (existingMap.has(key)) {
        result.push(existingMap.get(key)!);
        continue;
      }
      const dateStr = p.contractStart;
      result.push(makePosten(p, dateStr, mk, todayStr, todayMk));
      continue;
    }

    // Startmonat
    const contractStartDate = p.contractStart
      ? new Date(p.contractStart + 'T00:00:00')
      : startDate;
    const contractEndDate   = p.contractEnd
      ? new Date(p.contractEnd + 'T00:00:00')
      : null;

    let cur = new Date(Math.max(startDate.getTime(), contractStartDate.getTime()));
    cur.setDate(1);

    while (true) {
      const dateStr = bookingDate(cur.getFullYear(), cur.getMonth() + 1, p.due);
      if (dateStr > upcomingEnd) break;
      if (contractEndDate && dateStr > toIso(contractEndDate)) break;

      const mk  = getMonthKey(dateStr);
      const key = `${p.id}:${mk}`;

      if (existingMap.has(key)) {
        result.push(existingMap.get(key)!);
      } else {
        const amount = p.overrides[mk] ?? p.amount;
        result.push(makePosten({ ...p, amount }, dateStr, mk, todayStr, todayMk));
      }

      cur.setMonth(cur.getMonth() + step);
    }
  }

  // ── Transfers → Buchungen ───────────────────────────────────
  for (const t of transfers) {
    if (!t.interval) {
      const mk  = getMonthKey(t.date);
      const key = `tr:${t.id}:${mk}`;
      if (existingMap.has(key)) {
        result.push(existingMap.get(key)!);
        continue;
      }
      result.push(makeTransfer(t, t.date, mk, todayStr));
      continue;
    }

    const step = intervalMonths(t.interval as Interval);
    let cur    = new Date(startDate);
    cur.setDate(1);

    while (true) {
      const dateStr = bookingDate(cur.getFullYear(), cur.getMonth() + 1, t.execDay);
      if (dateStr > upcomingEnd) break;

      const mk  = getMonthKey(dateStr);
      const key = `tr:${t.id}:${mk}`;

      if (existingMap.has(key)) {
        result.push(existingMap.get(key)!);
      } else {
        result.push(makeTransfer(t, dateStr, mk, todayStr));
      }

      cur.setMonth(cur.getMonth() + step);
    }
  }

  return result;
}

function inferStatus(dateStr: string, todayStr: string, todayMk: string): BookingStatus {
  const mk = getMonthKey(dateStr);
  if (dateStr <= todayStr) return 'gebucht';
  if (mk === todayMk)      return 'gebucht';
  return 'vorgemerkt';
}

function makePosten(
  p: Posten,
  dateStr: string,
  mk: string,
  todayStr: string,
  todayMk: string,
): Booking {
  return {
    id:         genId('bk'),
    postenId:   p.id,
    transferId: null,
    date:       dateStr,
    monthKey:   mk,
    name:       p.name,
    type:       p.type,
    amount:     p.amount,
    baseAmount: p.amount,
    accountId:  p.accountId,
    status:     inferStatus(dateStr, todayStr, todayMk),
    note:       p.note,
    interval:   p.interval,
    categoryId: p.categoryId,
    creditorId: p.creditorId,
  };
}

function makeTransfer(
  t: Transfer,
  dateStr: string,
  mk: string,
  todayStr: string,
): Booking {
  return {
    id:         genId('bk'),
    postenId:   null,
    transferId: t.id,
    date:       dateStr,
    monthKey:   mk,
    name:       t.note || 'Umbuchung',
    type:       'umbuchung',
    amount:     t.amount,
    baseAmount: t.amount,
    accountId:  t.fromId,
    status:     dateStr <= todayStr ? 'gebucht' : 'vorgemerkt',
    note:       t.note,
    interval:   t.interval as Interval | null,
    categoryId: null,
    creditorId: null,
  };
}

/** Gibt nur sichtbare Buchungen zurück (für Transaktionen-Liste) */
export function visibleBookings(bookings: Booking[]): Booking[] {
  return bookings.filter(
    (b) => b.status === 'gebucht' || b.status === 'geändert' || b.status === 'beglichen',
  );
}

/** Gibt Buchungen eines Monats zurück (inkl. vorgemerkt — für Dashboard/Jahresanalyse) */
export function bookingsForMonth(bookings: Booking[], mk: string): Booking[] {
  return bookings.filter((b) => b.monthKey === mk && b.status !== 'ausgesetzt');
}

/** Nettosaldo eines Monats */
export function monthlyNet(bookings: Booking[], mk: string): number {
  return bookingsForMonth(bookings, mk).reduce((sum, b) => {
    if (b.type === 'einnahme') return sum + b.amount;
    if (b.type === 'ausgabe')  return sum - b.amount;
    return sum;
  }, 0);
}

/** Heute: nächster Zahltag als ISO-Datum */
export function nextZahltag(zahltag: number): string {
  const n = new Date();
  const thisMonth = makeDate(n.getFullYear(), n.getMonth() + 1, zahltag);
  if (thisMonth >= toIso(n)) return thisMonth;
  const next = new Date(n.getFullYear(), n.getMonth() + 1, 1);
  return makeDate(next.getFullYear(), next.getMonth() + 1, zahltag);
}

/** Gibt den Zahltag für einen Monat zurück */
export function zahltag(): string {
  return today();
}
