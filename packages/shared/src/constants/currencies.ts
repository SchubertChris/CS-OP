export interface CurrencyConfig {
  code: string
  symbol: string
  name: string
  locale: string
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'EUR', symbol: '€',  name: 'Euro',           locale: 'de-DE' },
  { code: 'CHF', symbol: 'Fr', name: 'Schweizer Franken', locale: 'de-CH' },
  { code: 'USD', symbol: '$',  name: 'US-Dollar',      locale: 'en-US' },
  { code: 'GBP', symbol: '£',  name: 'Britisches Pfund', locale: 'en-GB' },
]

export const DEFAULT_CURRENCY = 'EUR'
export const DEFAULT_LOCALE   = 'de-DE'

export function formatCurrency(amountInCent: number, currency = 'EUR', locale = 'de-DE'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amountInCent / 100)
}

export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.')
  return Math.round(parseFloat(cleaned) * 100) || 0
}
