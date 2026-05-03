import type { DefaultCategoryId } from '../types/categories'

export interface DefaultCategory {
  id: DefaultCategoryId
  name: string
  icon: string
  color: string
  isExpense: boolean
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { id: 'cat_wohnen',       name: 'Wohnen',        icon: 'House',         color: '#6B7280', isExpense: true  },
  { id: 'cat_lebensmittel', name: 'Lebensmittel',  icon: 'ShoppingCart',  color: '#10B981', isExpense: true  },
  { id: 'cat_verkehr',      name: 'Verkehr',        icon: 'Car',           color: '#3B82F6', isExpense: true  },
  { id: 'cat_freizeit',     name: 'Freizeit',       icon: 'Gamepad2',      color: '#8B5CF6', isExpense: true  },
  { id: 'cat_gesundheit',   name: 'Gesundheit',     icon: 'Heart',         color: '#EF4444', isExpense: true  },
  { id: 'cat_sparen',       name: 'Sparen',         icon: 'PiggyBank',     color: '#C9A84C', isExpense: false },
  { id: 'cat_versicherung', name: 'Versicherung',   icon: 'Shield',        color: '#F59E0B', isExpense: true  },
  { id: 'cat_kleidung',     name: 'Kleidung',       icon: 'Shirt',         color: '#EC4899', isExpense: true  },
  { id: 'cat_bildung',      name: 'Bildung',        icon: 'GraduationCap', color: '#14B8A6', isExpense: true  },
  { id: 'cat_sonstiges',    name: 'Sonstiges',      icon: 'MoreHorizontal', color: '#9CA3AF', isExpense: true  },
]

export const CATEGORY_MAP = new Map(DEFAULT_CATEGORIES.map(c => [c.id, c]))
