import type { SmartInsight } from './analytics'

export interface AiTransactionContext {
  monthKey: string
  categoryBreakdown: Array<{
    categoryName: string
    amount: number
    transactionCount: number
    vsLastMonth: number
  }>
  totalIncome: number
  totalExpenses: number
  savingsRate: number
  budgetAdherence: number
}

export interface AiInsightRequest {
  userId: string
  requestType:
    | 'monthly_analysis'
    | 'anomaly_detection'
    | 'savings_advice'
    | 'year_review'
    | 'free_question'
  context: AiTransactionContext
  question: string | null
  language: 'de' | 'en'
}

export interface AiInsightResponse {
  requestId: string
  insights: SmartInsight[]
  summary: string
  tokensUsed: number
  modelId: string
  generatedAt: string
}

export interface SmartInsightRecord extends SmartInsight {
  userId: string
  monthKey: string
  source: 'ai_claude' | 'rule_based' | 'system'
  createdAt: string
  actedOnAt: string | null
}
