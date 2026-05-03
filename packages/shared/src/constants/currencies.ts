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
