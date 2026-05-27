import { create } from 'zustand';

interface UiStore {
  // Aktiver Monat für Dashboard/Transaktionen (MonthKey "YYYY-M")
  activeMonthKey: string;
  setActiveMonthKey: (mk: string) => void;

  // Geöffnete Modals
  openModal: string | null;
  openModalWith: (name: string) => void;
  closeModal: () => void;

  // Toast-Queue
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

function currentMonthKey(): string {
  const n = new Date();
  return `${n.getFullYear()}-${n.getMonth() + 1}`;
}

let toastCounter = 0;

export const useUiStore = create<UiStore>()((set) => ({
  activeMonthKey: currentMonthKey(),
  setActiveMonthKey: (mk) => set({ activeMonthKey: mk }),

  openModal: null,
  openModalWith: (name) => set({ openModal: name }),
  closeModal: () => set({ openModal: null }),

  toasts: [],
  addToast: (toast) =>
    set((s) => ({
      toasts: [
        ...s.toasts,
        { ...toast, id: `toast_${++toastCounter}` },
      ],
    })),
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
