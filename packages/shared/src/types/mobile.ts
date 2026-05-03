export type PushTopic =
  | 'payment_due'
  | 'budget_warning'
  | 'budget_exceeded'
  | 'unusual_transaction'
  | 'sync_completed'
  | 'sync_error'
  | 'goal_milestone'
  | 'streak_at_risk'
  | 'badge_unlocked'
  | 'weekly_digest'

export interface PushSubscription {
  id: string
  userId: string
  platform: 'web' | 'ios' | 'android'
  endpoint: string
  enabled: boolean
  topics: PushTopic[]
  createdAt: string
  lastUsedAt: string | null
}

export interface PushNotification {
  id: string
  userId: string
  topic: PushTopic
  title: string
  body: string
  data: Record<string, string>
  sentAt: string
  deliveredAt: string | null
  tappedAt: string | null
}

export interface MobileSettings {
  userId: string
  biometricAuthEnabled: boolean
  quickActionsEnabled: boolean
  offlineModeEnabled: boolean
  widgetAccountIds: string[]
  appLockTimeout: number
}
