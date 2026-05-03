import type { Account } from '../types/accounts'
import type { Goal, GoalProjection } from '../types/goals'
import type { Schuld, TilgungsplanEintrag, TilgungsMethode } from '../types/debt'

export function calcNetWorth(accounts: Account[]): number {
  return accounts
    .filter(a => a.include)
    .reduce((sum, a) => sum + a.balance, 0)
}

export function calcTotalAssets(accounts: Account[]): number {
  return accounts
    .filter(a => a.include && a.balance > 0)
    .reduce((sum, a) => sum + a.balance, 0)
}

export function calcTotalLiabilities(accounts: Account[]): number {
  return Math.abs(
    accounts
      .filter(a => a.include && a.balance < 0)
      .reduce((sum, a) => sum + a.balance, 0)
  )
}

export function calcGoalProjection(goal: Goal): GoalProjection {
  const remaining = goal.targetAmount - goal.currentAmount
  const monthsLeft = goal.monthlyRate > 0
    ? Math.ceil(remaining / goal.monthlyRate)
    : Infinity

  const projectedDate = new Date()
  projectedDate.setMonth(projectedDate.getMonth() + (isFinite(monthsLeft) ? monthsLeft : 0))

  const onTrack = goal.deadline
    ? new Date(projectedDate) <= new Date(goal.deadline)
    : true

  const neededMonthlyRate = goal.deadline
    ? calcNeededMonthlyRate(goal)
    : goal.monthlyRate

  return {
    goalId: goal.id,
    monthsLeft: isFinite(monthsLeft) ? monthsLeft : 9999,
    neededMonthlyRate,
    projectedCompletionDate: projectedDate.toISOString().split('T')[0],
    onTrack,
    completionPercentage: Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)),
  }
}

function calcNeededMonthlyRate(goal: Goal): number {
  if (!goal.deadline) return goal.monthlyRate
  const monthsLeft = calcMonthsUntil(goal.deadline)
  const remaining = goal.targetAmount - goal.currentAmount
  return monthsLeft > 0 ? Math.ceil(remaining / monthsLeft) : remaining
}

function calcMonthsUntil(isoDate: string): number {
  const target = new Date(isoDate)
  const now = new Date()
  return (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth())
}

export function calcDebtPayoffPlan(
  schulden: Schuld[],
  extraBudget: number,
  methode: TilgungsMethode
): TilgungsplanEintrag[] {
  const plan: TilgungsplanEintrag[] = []
  let remaining = schulden.map(s => ({ ...s, rest: s.restschuld }))

  const sorted = methode === 'schneeball'
    ? [...remaining].sort((a, b) => a.rest - b.rest)
    : [...remaining].sort((a, b) => b.zinssatz - a.zinssatz)

  let month = 0
  const MAX_MONTHS = 600

  while (sorted.some(s => s.rest > 0) && month < MAX_MONTHS) {
    month++
    let availableExtra = extraBudget

    for (const schuld of sorted) {
      if (schuld.rest <= 0) continue

      const monthlyRate = schuld.zinssatz / 100 / 12
      const zinsen = Math.round(schuld.rest * monthlyRate)
      const minTilgung = schuld.minMonatlicheRate - zinsen
      const extraTilgung = sorted.indexOf(schuld) === sorted.findIndex(s => s.rest > 0)
        ? availableExtra
        : 0
      const zahlung = Math.min(schuld.rest + zinsen, schuld.minMonatlicheRate + extraTilgung)
      const tilgung = zahlung - zinsen

      if (extraTilgung > 0) availableExtra = 0

      plan.push({
        monat: month,
        schuldId: schuld.id,
        restschuld: schuld.rest,
        zahlung,
        tilgung,
        zinsen,
        restschuldEnde: Math.max(0, schuld.rest - tilgung),
      })

      schuld.rest = Math.max(0, schuld.rest - tilgung)
      void minTilgung
    }
  }

  return plan
}
