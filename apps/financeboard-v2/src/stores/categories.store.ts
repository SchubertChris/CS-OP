import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Category } from '../types/models';
import { DEFAULT_CATEGORIES } from '../lib/seed';

interface CategoriesStore {
  categories: Category[];
  setCategories: (cats: Category[]) => void;
  upsert: (c: Category) => void;
  remove: (id: string) => void;
  reset: () => void;
}

export const useCategoriesStore = create<CategoriesStore>()(
  persist(
    (set) => ({
      categories: [...DEFAULT_CATEGORIES],

      setCategories: (categories) => set({ categories }),

      upsert: (c) =>
        set((s) => {
          const idx = s.categories.findIndex((x) => x.id === c.id);
          if (idx === -1) return { categories: [...s.categories, c] };
          const next = [...s.categories];
          next[idx] = c;
          return { categories: next };
        }),

      remove: (id) =>
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),

      reset: () => set({ categories: [...DEFAULT_CATEGORIES] }),
    }),
    { name: 'csf_categories_v2' },
  ),
);
