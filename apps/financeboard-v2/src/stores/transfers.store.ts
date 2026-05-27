import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Transfer } from '../types/models';

interface TransfersStore {
  transfers: Transfer[];
  setTransfers: (transfers: Transfer[]) => void;
  upsert: (t: Transfer) => void;
  remove: (id: string) => void;
}

export const useTransfersStore = create<TransfersStore>()(
  persist(
    (set) => ({
      transfers: [],
      setTransfers: (transfers) => set({ transfers }),
      upsert: (t) =>
        set((s) => {
          const idx = s.transfers.findIndex((x) => x.id === t.id);
          if (idx === -1) return { transfers: [...s.transfers, t] };
          const next = [...s.transfers];
          next[idx] = t;
          return { transfers: next };
        }),
      remove: (id) =>
        set((s) => ({ transfers: s.transfers.filter((t) => t.id !== id) })),
    }),
    { name: 'csf_transfers_v2' },
  ),
);
