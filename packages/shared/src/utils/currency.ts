export function formatCurrency(
  amountInCent: number,
  currency = 'EUR',
  locale = 'de-DE'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amountInCent / 100)
}

export function formatCurrencyCompact(amountInCent: number, locale = 'de-DE'): string {
  const amount = amountInCent / 100
  if (Math.abs(amount) >= 1_000_000)
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(amount / 1_000_000) + ' Mio. €'
  if (Math.abs(amount) >= 1_000)
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(amount / 1_000) + ' T€'
  return formatCurrency(amountInCent, 'EUR', locale)
}

export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.')
  return Math.round(parseFloat(cleaned) * 100) || 0
}

export function centsToEuros(cents: number): number {
  return cents / 100
}

export function eurosToCents(euros: number): number {
  return Math.round(euros * 100)
}

export function formatSavingsRate(rate: number): string {
  return `${rate.toFixed(1)} %`
}
