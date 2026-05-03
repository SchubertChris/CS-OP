export interface BudgetEnvelope {
  id: string
  userId: string
  categoryId: string
  monthKey: string
  allocated: number
  spent: number
  rollover: number
  note: string | null
}

export interface BudgetEnvelopeStatus {
  envelope: BudgetEnvelope
  remaining: number
  percentUsed: number
  status: 'green' | 'yellow' | 'red' | 'overspent'
  daysLeftInMonth: number
  projectedOverspend: number | null
}

export interface BudgetTemplate {
  id: string
  userId: string
  name: string
  items: Array<{
    categoryId: string
    amount: number
  }>
  createdAt: string
}

export interface MonthlyBudgetConfig {
  userId: string
  monthKey: string
  totalBudget: number
  zahltag: number
  rolloverEnabled: boolean
}
