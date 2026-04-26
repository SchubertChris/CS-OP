import { useState } from 'react'
import type { RegisterData } from '../types/auth.types'
import { useAuthStore } from '../../../store/authStore'

export function useRegister() {
  const setUser = useAuthStore((s) => s.setUser)
  const [serverError, setServerError] = useState<string | null>(null)

  async function register(data: RegisterData): Promise<void> {
    setServerError(null)
    await new Promise<void>((r) => setTimeout(r, 900))
    if (data.email.toLowerCase().includes('taken')) {
      setServerError('Diese E-Mail-Adresse ist bereits registriert.')
      throw new Error('email_taken')
    }
    setUser({
      id: 'mock-1',
      email: data.email,
      displayName: data.displayName,
      avatarUrl: null,
      role: 'user',
      proExpiresAt: null,
    })
  }

  return {
    register,
    serverError,
    clearError: () => setServerError(null),
  }
}
