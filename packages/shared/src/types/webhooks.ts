export type FinanceEventType =
  | 'transaction.created'
  | 'transaction.updated'
  | 'transaction.deleted'
  | 'account.balance_updated'
  | 'goal.completed'
  | 'goal.milestone'
  | 'budget.exceeded'
  | 'subscription.detected'
  | 'subscription.price_changed'
  | 'banking.sync_completed'
  | 'banking.sync_failed'
  | 'banking.connection_expired'
  | 'tax.year_review_ready'

export interface FinanceEvent {
  id: string
  userId: string
  type: FinanceEventType
  payload: Record<string, unknown>
  occurredAt: string
}

export interface Webhook {
  id: string
  userId: string
  url: string
  secret: string
  events: FinanceEventType[]
  enabled: boolean
  lastTriggeredAt: string | null
  failureCount: number
  createdAt: string
}
