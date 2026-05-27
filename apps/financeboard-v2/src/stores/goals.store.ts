import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Goal } from '../types/models';

interface GoalsStore {
  goals: Goal[];
  setGoals: (goals: Goal[]) => void;
  upsert: (g: Goal) => void;
  remove: (id: string) => void;
}

export const useGoalsStore = create<GoalsStore>()(
  persist(
    (set) => ({
      goals: [],
      setGoals: (goals) => set({ goals }),
      upsert: (g) =>
        set((s) => {
          const idx = s.goals.findIndex((x) => x.id === g.id);
          if (idx === -1) return { goals: [...s.goals, g] };
          const next = [...s.goals];
          next[idx] = g;
          return { goals: next };
        }),
      remove: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
    }),
    { name: 'csf_goals_v2' },
  ),
);
