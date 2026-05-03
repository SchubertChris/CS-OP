export function toMonthKey(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function monthKeyToDate(monthKey: string): Date {
  return new Date(`${monthKey}-01`)
}

export function formatMonthLabel(monthKey: string, locale = 'de-DE'): string {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' })
    .format(monthKeyToDate(monthKey))
}

export function formatDate(date: string | Date, locale = 'de-DE'): string {
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' })
    .format(typeof date === 'string' ? new Date(date) : date)
}

export function formatDateShort(date: string | Date, locale = 'de-DE'): string {
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit' })
    .format(typeof date === 'string' ? new Date(date) : date)
}

export function getCurrentMonthKey(): string {
  return toMonthKey(new Date())
}

export function getPreviousMonthKey(monthKey: string): string {
  const d = monthKeyToDate(monthKey)
  d.setMonth(d.getMonth() - 1)
  return toMonthKey(d)
}

export function getNextMonthKey(monthKey: string): string {
  const d = monthKeyToDate(monthKey)
  d.setMonth(d.getMonth() + 1)
  return toMonthKey(d)
}

export function getLast12MonthKeys(): string[] {
  const keys: string[] = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    keys.push(toMonthKey(d))
  }
  return keys
}

export function daysUntil(isoDate: string): number {
  const target = new Date(isoDate)
  const now = new Date()
  target.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - now.getTime()) / 86_400_000)
}
