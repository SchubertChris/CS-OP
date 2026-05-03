export type AccountType =
  | 'girokonto'
  | 'bargeld'
  | 'paypal_digital'
  | 'tagesgeld'
  | 'sparkonto'
  | 'festgeld'
  | 'bausparvertrag'
  | 'depot'
  | 'krypto'
  | 'vl'
  | 'altersvorsorge'
  | 'kreditkarte'
  | 'kredit'
  | 'sonstiges'

export interface Account {
  id: string
  userId: string
  label: string
  accountType: AccountType
  balance: number
  color: string
  iban: string | null
  bankGroup: string | null
  isMain: boolean
  include: boolean
  vlMonthlyRate: number | null
  vlDepotNumber: string | null
  bankingConnectionId: string | null
  bankingAccountId: string | null
  lastSyncAt: string | null
  createdAt: string
  updatedAt: string
}

export interface BankGroup {
  name: string
  accounts: Account[]
  totalBalance: number
}
