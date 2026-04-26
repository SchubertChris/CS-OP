import { useState } from 'react'
import type { LoginData } from '../types/auth.types'
import { useAuthStore, type UserRole } from '../../../store/authStore'

const ADMIN_EMAIL = 'schubert_chris@rocketmail.com'

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser)
  const [serverError, setServerError] = useState<string | null>(null)

  async function login(data: LoginData): Promise<UserRole> {
    setServerError(null)
    await new Promise<void>((r) => setTimeout(r, 900))

    if (data.email.toLowerCase().includes('error')) {
      setServerError('E-Mail oder Passwort ist falsch.')
      throw new Error('invalid_credentials')
    }

    const isAdmin = data.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
    const role: UserRole = isAdmin ? 'admin' : 'user'

    setUser({
      id: 'mock-1',
      email: data.email,
      displayName: isAdmin ? 'Candlescope' : data.email.split('@')[0],
      avatarUrl: null,
      role,
    })

    return role
  }

  return {
    login,
    serverError,
    clearError: () => setServerError(null),
  }
}
