export interface Tag {
  id: string
  userId: string
  name: string
  color: string
}

export interface TransactionTag {
  transactionId: string
  tagId: string
}

export type TaggableEntityType = 'transaction' | 'goal' | 'document' | 'note'

export interface EntityTag {
  entityType: TaggableEntityType
  entityId: string
  tagId: string
}
