export interface NetWorthSnapshot {
  date: string
  totalAssets: number
  totalLiabilities: number
  netWorth: number
}

export interface MonthlySummary {
  monthKey: string
  totalIncome: number
  totalExpenses: number
  netBalance: number
  savingsRate: number
  open: number
  high: number
  low: number
  close: number
  categoryBreakdown: Array<{
    categoryId: string
    amount: number
    percentage: number
  }>
}

export interface SmartInsight {
  id: string
  type: 'savings_tip' | 'unusual_expense' | 'subscription_detected' | 'goal_progress' | 'forecast'
  title: string
  description: string
  severity: 'info' | 'warning' | 'positive'
  actionLabel: string | null
  actionUrl: string | null
  generatedAt: string
  dismissedAt: string | null
}

export interface CandlestickCandle {
  monthKey: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  bullish: boolean
  income: number
  expenses: number
  net: number
  savingsRate: number
}

export interface CandlestickIndicators {
  monthKey: string
  sma3: number | null
  sma6: number | null
  sma12: number | null
  bollingerUpper: number | null
  bollingerLower: number | null
  bollingerMid: number | null
}

export interface YearAnalytics {
  year: number
  candles: CandlestickCandle[]
  indicators: CandlestickIndicators[]
  summary: {
    totalIncome: number
    totalExpenses: number
    netSavings: number
    avgSavingsRate: number
    bestMonth: string
    worstMonth: string
    netWorthDelta: number
  }
}

export interface YearComparison {
  yearA: YearAnalytics
  yearB: YearAnalytics
  incomeGrowth: number
  expenseGrowth: number
  netWorthGrowth: number
}

export interface CategoryDrillDown {
  monthKey: string
  categoryId: string
  amount: number
  transactionCount: number
  avgPerTransaction: number
  vsLastMonth: number
  vsYearAvg: number
}

export interface BillCalendarEntry {
  date: string
  lineItemId: string
  name: string
  amount: number
  accountId: string
  categoryId: string | null
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  balanceAfter: number
  alert: 'none' | 'low_balance' | 'overdue'
}

export interface BalanceForecast {
  accountId: string
  generatedAt: string
  days: Array<{
    date: string
    startBalance: number
    entries: BillCalendarEntry[]
    endBalance: number
    lowestIntraday: number
    alert: boolean
  }>
  warningThreshold: number
}

export interface SpendingForecast {
  monthKey: string
  generatedAt: string
  currentSpend: number
  projectedTotal: number
  confidence: number
  basis: 'linear' | 'weighted_avg' | 'ai'
  categoryForecasts: Array<{
    categoryId: string
    projected: number
    budget: number | null
    alertLevel: 'none' | 'warning' | 'critical'
  }>
}
