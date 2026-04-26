import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Alle verfügbaren Themes — einfach hier ergänzen wenn neue kommen
export type AppTheme = 'light' | 'dark' | 'system' // | 'midnight' | 'sepia'

interface AppStore {
  theme: AppTheme
  setTheme: (theme: AppTheme) => void
  railExpanded: boolean
  setRailExpanded: (expanded: boolean) => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      railExpanded: false,
      setRailExpanded: (railExpanded) => set({ railExpanded }),
    }),
    {
      name: 'cs-app-settings',
      partialize: (state) => ({ theme: state.theme, railExpanded: state.railExpanded }),
    },
  ),
)
