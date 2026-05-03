export interface Goal {
  id: string
  userId: string
  name: string
  icon: string
  color: string
  targetAmount: number
  currentAmount: number
  monthlyRate: number
  startDate: string
  deadline: string | null
  accountId: string | null
  linkedLineItemId: string | null
  note: string | null
  completed: boolean
  createdAt: string
}

export interface GoalProjection {
  goalId: string
  monthsLeft: number
  neededMonthlyRate: number
  projectedCompletionDate: string
  onTrack: boolean
  completionPercentage: number
}
