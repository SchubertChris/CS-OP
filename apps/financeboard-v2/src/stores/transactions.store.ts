import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Posten, Booking } from '../types/models';

interface TransactionsStore {
  posten: Posten[];
  bookings: Booking[];
  setPosten: (posten: Posten[]) => void;
  setBookings: (bookings: Booking[]) => void;
  upsertPosten: (p: Posten) => void;
  removePosten: (id: string) => void;
  updateBooking: (id: string, patch: Partial<Booking>) => void;
}

export const useTransactionsStore = create<TransactionsStore>()(
  persist(
    (set) => ({
      posten:   [],
      bookings: [],

      setPosten:   (posten)   => set({ posten }),
      setBookings: (bookings) => set({ bookings }),

      upsertPosten: (p) =>
        set((s) => {
          const idx = s.posten.findIndex((x) => x.id === p.id);
          if (idx === -1) return { posten: [...s.posten, p] };
          const next = [...s.posten];
          next[idx] = p;
          return { posten: next };
        }),

      removePosten: (id) =>
        set((s) => ({ posten: s.posten.filter((p) => p.id !== id) })),

      updateBooking: (id, patch) =>
        set((s) => ({
          bookings: s.bookings.map((b) => (b.id === id ? { ...b, ...patch } : b)),
        })),
    }),
    {
      name: 'csf_transactions_v2',
      partialize: (s) => ({ posten: s.posten, bookings: s.bookings }),
    },
  ),
);
