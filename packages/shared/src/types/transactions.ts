export type PostenType = 'ausgabe' | 'einnahme'
export type PostenInterval = 'monatl.' | 'viertelj.' | 'halbjährl.' | 'jährl.' | 'einmalig'

export type BookingStatus =
  | 'gebucht'
  | 'vorgemerkt'
  | 'ausgesetzt'
  | 'geändert'
  | 'beglichen'

export interface LineItem {
  id: string
  userId: string
  name: string
  type: PostenType
  amount: number
  interval: PostenInterval
  dueDay: number
  accountId: string | null
  contractStart: string | null
  contractEnd: string | null
  categoryId: string | null
  creditorId: string | null
  goalId: string | null
  amountOverrides: Record<string, number>
  paused: boolean
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  userId: string
  accountId: string
  lineItemId: string | null
  transferId: string | null
  bankingTransactionId: string | null
  name: string
  type: PostenType
  amount: number
  date: string
  monthKey: string
  status: BookingStatus
  categoryId: string | null
  creditorId: string | null
  note: string | null
  receiptUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface AccountTransfer {
  id: string
  userId: string
  fromAccountId: string
  toAccountId: string
  amount: number
  date: string
  interval: PostenInterval
  execDay: number | null
  note: string | null
  createdAt: string
}

export interface Creditor {
  id: string
  userId: string
  name: string
  email: string | null
  phone: string | null
  website: string | null
  address: string | null
  color: string
  icon: string
  logoDomain: string | null
  accountId: string | null
  note: string | null
  createdAt: string
}

export type BuchungsFlow = 'einnahme' | 'ausgabe' | 'umbuchung'
export type BuchungsTyp = 'einzeln' | 'dauerauftrag'
export type Zahlungsart = 'ueberweisung' | 'lastschrift' | 'bargeld' | 'karte'
export type DauerauftragIntervall =
  | 'taeglich'
  | 'woechentlich'
  | 'monatlich'
  | 'vierteljaehrlich'
  | 'halbjaehrlich'

export interface BuchungsFormState {
  flow:        BuchungsFlow
  typ:         BuchungsTyp
  amount:      number
  kontoId:     string
  zielkontoId: string | null
  kreditorId:  string | null
  zweck:       string
  datum:       string
  kategorieId: string | null
  zahlungsart: Zahlungsart
  intervall:   DauerauftragIntervall | null
  notiz:       string | null
}

export interface TransactionCreateRequest {
  accountId:   string
  flow:        'einnahme' | 'ausgabe'
  amount:      number
  date:        string
  name:        string
  categoryId:  string | null
  creditorId:  string | null
  zahlungsart: Zahlungsart
  note:        string | null
}

export interface UmbuchungCreateRequest {
  fromAccountId: string
  toAccountId:   string
  amount:        number
  date:          string
  note:          string | null
}

export interface DauerauftragCreateRequest {
  accountId:   string
  flow:        'einnahme' | 'ausgabe'
  amount:      number
  name:        string
  intervall:   DauerauftragIntervall
  startDate:   string
  categoryId:  string | null
  creditorId:  string | null
  zahlungsart: Zahlungsart
  note:        string | null
}
