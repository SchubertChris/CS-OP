/** Heutiges Datum als "YYYY-MM-DD" — NIEMALS toISOString() (UTC-Shift in CET/CEST) */
export function today(): string {
  const n = new Date();
  return toIso(n);
}

/** Date → "YYYY-MM-DD" ohne UTC-Shift */
export function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** "YYYY-MM-DD" → MonthKey "YYYY-M" (z.B. "2025-1") */
export function getMonthKey(iso: string): string {
  const [y, m] = iso.split('-');
  return `${y}-${Number(m)}`;
}

/** Aktueller MonthKey */
export function currentMonthKey(): string {
  const n = new Date();
  return `${n.getFullYear()}-${n.getMonth() + 1}`;
}

/** MonthKey → erster Tag des Monats als Date */
export function monthStart(mk: string): Date {
  const [y, m] = mk.split('-').map(Number);
  return new Date(y!, m! - 1, 1);
}

/** MonthKey → letzter Tag des Monats als Date */
export function monthEnd(mk: string): Date {
  const [y, m] = mk.split('-').map(Number);
  return new Date(y!, m!, 0);
}

/** Anzahl Tage in einem Monat (1-basiert) */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** Tag auf gültigen Bereich für Monat klemmen */
export function clampDay(day: number, year: number, month: number): number {
  return Math.min(day, daysInMonth(year, month));
}

/** Datum "YYYY-MM-DD" aus Jahr + Monat (1-basiert) + Tag — mit Day-Clamping */
export function makeDate(year: number, month: number, day: number): string {
  const clamped = clampDay(day, year, month);
  return `${year}-${String(month).padStart(2, '0')}-${String(clamped).padStart(2, '0')}`;
}

/** Prüft ob ein Datum in einem bestimmten Monat liegt */
export function isInMonth(iso: string, mk: string): boolean {
  return getMonthKey(iso) === mk;
}

/** Fügt N Monate zu einem Datum hinzu */
export function addMonths(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y!, m! - 1, d!);
  date.setMonth(date.getMonth() + n);
  return toIso(date);
}

/** Differenz in Monaten zwischen zwei MonthKeys */
export function monthDiff(fromMk: string, toMk: string): number {
  const [fy, fm] = fromMk.split('-').map(Number);
  const [ty, tm] = toMk.split('-').map(Number);
  return (ty! - fy!) * 12 + (tm! - fm!);
}

/** MonthKey → "Jan 2025" */
export function fmMonthKey(mk: string): string {
  const [y, m] = mk.split('-').map(Number);
  const d = new Date(y!, m! - 1, 1);
  return d.toLocaleDateString('de-DE', { month: 'short', year: 'numeric' });
}

/** Array von MonthKeys von start bis end (inklusive) */
export function monthRange(startMk: string, endMk: string): string[] {
  const result: string[] = [];
  let current = startMk;
  while (current <= endMk) {
    result.push(current);
    current = addMonths(`${current}-01`, 1).slice(0, 7).replace('-0', '-').replace(/^(\d{4})-0?(\d+)$/, '$1-$2');
    const [y, m] = current.split('-').map(Number);
    current = `${y}-${m}`;
  }
  return result;
}
