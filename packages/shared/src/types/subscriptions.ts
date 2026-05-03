export interface DetectedSubscription {
  id: string
  userId: string
  name: string
  creditorId: string | null
  detectedAmount: number
  interval: 'monthly' | 'quarterly' | 'yearly'
  nextExpected: string
  categoryId: string | null
  transactionIds: string[]
  firstSeenDate: string
  lastSeenDate: string
  status: 'active' | 'cancelled' | 'paused' | 'snoozed'
  priceHistory: Array<{
    date: string
    amount: number
  }>
  cancelUrl: string | null
  annualCost: number
}

export interface SubscriptionScanResult {
  scannedAt: string
  detected: DetectedSubscription[]
  newThisRun: number
  priceChanges: Array<{
    subscriptionId: string
    oldAmount: number
    newAmount: number
    delta: number
  }>
  totalAnnualCost: number
}
