import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Creditor } from '../types/models';

interface CreditorsStore {
  creditors: Creditor[];
  setCreditors: (creditors: Creditor[]) => void;
  upsert: (c: Creditor) => void;
  remove: (id: string) => void;
}

export const useCreditorsStore = create<CreditorsStore>()(
  persist(
    (set) => ({
      creditors: [],
      setCreditors: (creditors) => set({ creditors }),
      upsert: (c) =>
        set((s) => {
          const idx = s.creditors.findIndex((x) => x.id === c.id);
          if (idx === -1) return { creditors: [...s.creditors, c] };
          const next = [...s.creditors];
          next[idx] = c;
          return { creditors: next };
        }),
      remove: (id) =>
        set((s) => ({ creditors: s.creditors.filter((c) => c.id !== id) })),
    }),
    { name: 'csf_creditors_v2' },
  ),
);
