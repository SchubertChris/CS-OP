import type { Category } from '../types/models';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_wohnen',       name: 'Wohnen',       color: '#4d9eff', icon: '🏠', sortOrder: 0,  isDefault: true },
  { id: 'cat_lebensmittel', name: 'Lebensmittel', color: '#34d399', icon: '🛒', sortOrder: 1,  isDefault: true },
  { id: 'cat_transport',    name: 'Transport',    color: '#f59e0b', icon: '🚗', sortOrder: 2,  isDefault: true },
  { id: 'cat_gesundheit',   name: 'Gesundheit',   color: '#ec4899', icon: '🏥', sortOrder: 3,  isDefault: true },
  { id: 'cat_freizeit',     name: 'Freizeit',     color: '#a78bfa', icon: '🎮', sortOrder: 4,  isDefault: true },
  { id: 'cat_restaurant',   name: 'Restaurant',   color: '#fb923c', icon: '🍽️', sortOrder: 5,  isDefault: true },
  { id: 'cat_shopping',     name: 'Shopping',     color: '#f472b6', icon: '👗', sortOrder: 6,  isDefault: true },
  { id: 'cat_bildung',      name: 'Bildung',      color: '#60a5fa', icon: '📚', sortOrder: 7,  isDefault: true },
  { id: 'cat_versicherung', name: 'Versicherung', color: '#6b7280', icon: '🛡️', sortOrder: 8,  isDefault: true },
  { id: 'cat_sparen',       name: 'Sparen',       color: '#d4a843', icon: '💰', sortOrder: 9,  isDefault: true },
  { id: 'cat_gehalt',       name: 'Gehalt',       color: '#22c55e', icon: '💼', sortOrder: 10, isDefault: true },
  { id: 'cat_sonstiges',    name: 'Sonstiges',    color: '#9ca3af', icon: '📦', sortOrder: 11, isDefault: true },
];
