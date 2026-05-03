export interface FinanceStreak {
  userId: string
  type:
    | 'under_budget'
    | 'no_impulse_buy'
    | 'daily_tracking'
    | 'savings_goal_hit'
  currentStreak: number
  longestStreak: number
  lastUpdated: string
}

export interface FinanceBadge {
  id: string
  key: BadgeKey
  name: string
  description: string
  iconEmoji: string
  unlockedAt: string | null
  secret: boolean
}

export type BadgeKey =
  | 'first_transaction'
  | 'first_budget'
  | 'first_goal_completed'
  | 'under_budget_3months'
  | 'no_spend_week'
  | 'networth_zero'
  | 'networth_10k'
  | 'networth_50k'
  | 'networth_100k'
  | 'networth_250k'
  | 'debt_free'
  | 'savings_rate_30'
  | 'year_review_shared'

export interface YearReview {
  userId: string
  year: number
  generatedAt: string
  highlights: Array<{
    key: string
    title: string
    value: string
    emoji: string
    description: string
  }>
  topCategory: { name: string; amount: number; emoji: string }
  biggestExpense: { name: string; amount: number; date: string }
  bestMonth: { monthKey: string; savingsRate: number }
  badgesUnlocked: BadgeKey[]
  shareableImageUrl: string | null
}
