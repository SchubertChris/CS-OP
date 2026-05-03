export interface BankingConnection {
  id: string
  userId: string
  finApiConnectionId: string
  bankName: string
  bankLogoUrl: string | null
  status: 'active' | 'expired' | 'error' | 'pending'
  lastSyncAt: string | null
  nextSyncAt: string | null
  accountsCount: number
  createdAt: string
}

export interface BankingAccount {
  id: string
  userId: string
  connectionId: string
  finApiAccountId: string
  iban: string | null
  accountName: string
  accountType: string
  balance: number
  currency: string
  linkedLocalAccountId: string | null
}

export interface ConsentFlowState {
  step: 'bank_search' | 'credentials' | 'consent' | 'processing' | 'complete' | 'error'
  selectedBank: { id: string; name: string; logoUrl: string } | null
  consentUrl: string | null
  error: string | null
}
