import { create } from 'zustand'

interface AdminUIState {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
}

export const useAdminStore = create<AdminUIState>()((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}))
