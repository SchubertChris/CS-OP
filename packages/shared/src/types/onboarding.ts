export type OnboardingStep =
  | 'welcome'
  | 'create_account'
  | 'set_zahltag'
  | 'first_transaction'
  | 'set_budget'
  | 'create_goal'
  | 'connect_bank'
  | 'complete'

export interface OnboardingState {
  userId: string
  currentStep: OnboardingStep
  completedSteps: OnboardingStep[]
  skippedSteps: OnboardingStep[]
  completionPercent: number
  startedAt: string
  completedAt: string | null
  templateUsed: string | null
}

export interface OnboardingTemplate {
  id: string
  name: string
  description: string
  emoji: string
  defaultCategories: string[]
  defaultBudgetItems: Array<{ categoryId: string; suggestedAmount: number }>
  suggestedZahltag: number
}
