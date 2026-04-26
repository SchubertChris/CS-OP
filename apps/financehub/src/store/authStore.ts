import { create } from 'zustand'

export type UserRole = 'admin' | 'user'

interface User {
  id: string
  email: string
  displayName: string | null
  avatarUrl: string | null
  role: UserRole
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  requiresTwoFA: boolean
  sessionId: string | null
  setUser: (user: User) => void
  setRequiresTwoFA: (requires: boolean) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  requiresTwoFA: false,
  sessionId: null,
  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),
  setRequiresTwoFA: (requiresTwoFA) => set({ requiresTwoFA }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({
    user: null,
    isAuthenticated: false,
    requiresTwoFA: false,
    sessionId: null,
    isLoading: false,
  }),
}))
