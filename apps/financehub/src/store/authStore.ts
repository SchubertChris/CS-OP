import { create } from 'zustand'

export type UserRole = 'admin' | 'moderator' | 'user' | 'user_pro'

export interface User {
  id: string
  email: string
  displayName: string | null
  avatarUrl: string | null
  role: UserRole
  proExpiresAt: string | null
}

export function isPro(user: User): boolean {
  if (user.role === 'admin' || user.role === 'moderator') return true
  if (user.role === 'user_pro') {
    if (!user.proExpiresAt) return true
    return new Date(user.proExpiresAt) > new Date()
  }
  return false
}

export function isStaff(user: User): boolean {
  return user.role === 'admin' || user.role === 'moderator'
}

export function isAdmin(user: User): boolean {
  return user.role === 'admin'
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
