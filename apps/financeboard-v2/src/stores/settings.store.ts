import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Settings, DEFAULT_SETTINGS } from '../types/settings';

interface SettingsStore {
  settings: Settings;
  set: (patch: Partial<Settings>) => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: { ...DEFAULT_SETTINGS },

      set: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      reset: () =>
        set({ settings: { ...DEFAULT_SETTINGS } }),
    }),
    {
      name: 'csf_settings_v2',
      partialize: (s) => ({ settings: s.settings }),
    },
  ),
);
