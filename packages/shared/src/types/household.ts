export interface Haushalt {
  id: string
  name: string
  createdByUserId: string
  members: HaushaltMember[]
  createdAt: string
}

export interface HaushaltMember {
  userId: string
  displayName: string
  avatarUrl: string | null
  role: 'owner' | 'member' | 'readonly'
  joinedAt: string
}

export interface SharedExpense {
  id: string
  haushaltId: string
  paidByUserId: string
  description: string
  amount: number
  date: string
  categoryId: string | null
  splits: Array<{
    userId: string
    amount: number
    settled: boolean
  }>
  createdAt: string
}

export interface HaushaltBalance {
  haushaltId: string
  fromUserId: string
  toUserId: string
  amount: number
}
