export interface Category {
  id: string
  userId: string
  name: string
  color: string
  icon: string
  isDefault: boolean
  parentId: string | null
}

export type DefaultCategoryId =
  | 'cat_wohnen'
  | 'cat_lebensmittel'
  | 'cat_verkehr'
  | 'cat_freizeit'
  | 'cat_gesundheit'
  | 'cat_sparen'
  | 'cat_versicherung'
  | 'cat_kleidung'
  | 'cat_bildung'
  | 'cat_sonstiges'

export type RuleMatchField = 'name' | 'creditor_name' | 'iban' | 'amount_exact' | 'amount_range'
export type RuleMatchType  = 'contains' | 'starts_with' | 'equals' | 'regex'

export interface CategoryRule {
  id: string
  userId: string
  name: string
  priority: number
  isSystem: boolean
  matchField: RuleMatchField
  matchType: RuleMatchType
  matchValue: string
  assignCategoryId: string
  assignCreditorId: string | null
  createdAt: string
}

export interface CategorizationResult {
  transactionId: string
  matchedRuleId: string | null
  suggestedCategoryId: string | null
  confidence: number
  source: 'rule' | 'ai' | 'history'
}
