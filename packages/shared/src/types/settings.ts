export interface NotificationSettings {
  emailDigest: boolean
  paymentReminders: boolean
  unusualSpending: boolean
  goalMilestones: boolean
  syncErrors: boolean
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system'
  zahltag: number
  currency: string
  locale: string
  defaultAccountId: string | null
  hiddenAccountIds: string[]
  notifications: NotificationSettings
}
