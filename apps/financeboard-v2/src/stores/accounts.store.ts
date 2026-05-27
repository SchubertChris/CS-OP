import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Account } from '../types/models';

interface AccountsStore {
  accounts: Account[];
  setAccounts: (accounts: Account[]) => void;
  upsert: (account: Account) => void;
  remove: (id: string) => void;
  reorder: (ids: string[]) => void;
}

export const useAccountsStore = create<AccountsStore>()(
  persist(
    (set) => ({
      accounts: [],

      setAccounts: (accounts) => set({ accounts }),

      upsert: (account) =>
        set((s) => {
          const idx = s.accounts.findIndex((a) => a.id === account.id);
          if (idx === -1) return { accounts: [...s.accounts, account] };
          const next = [...s.accounts];
          next[idx] = account;
          return { accounts: next };
        }),

      remove: (id) =>
        set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) })),

      reorder: (ids) =>
        set((s) => ({
          accounts: ids
            .map((id) => s.accounts.find((a) => a.id === id))
            .filter((a): a is Account => a !== undefined),
        })),
    }),
    { name: 'csf_accounts_v2' },
  ),
);

// Selektoren
export const selectTotalBalance = (accounts: Account[]) =>
  accounts.filter((a) => a.include).reduce((sum, a) => sum + a.balance, 0);

export const selectMainAccount = (accounts: Account[]) =>
  accounts.find((a) => a.isMain) ?? null;
