import { useState } from 'react'
import type { LoginData } from '../types/auth.types'
import { useAuthStore, type UserRole } from '../../../store/authStore'

const ADMIN_EMAIL = 'schubert_chris@rocketmail.com'
// Proxy-Endpoints in apps/financehub/api/admin/ — same-origin, kein CORS-Problem.
// VITE_ADMIN_API_URL kann für lokale vercel dev-Tests überschrieben werden.
const ADMIN_API   = import.meta.env.VITE_ADMIN_API_URL as string | undefined
  ?? '/api/admin'

export interface LoginResult {
  role: UserRole
  requiresTwoFactor: boolean
  tempToken?: string
}

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser)
  const [serverError, setServerError] = useState<string | null>(null)

  async function login(data: LoginData): Promise<LoginResult> {
    setServerError(null)

    const isAdmin = data.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()

    if (isAdmin) {
      const r = await fetch(`${ADMIN_API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: data.password }),
      })
      const json = await r.json()
      if (!r.ok) {
        setServerError(json.error ?? 'Ungültige Anmeldedaten')
        throw new Error('invalid_credentials')
      }

      setUser({
        id: 'admin-1',
        email: data.email,
        displayName: 'Candlescope',
        avatarUrl: null,
        role: 'admin',
        proExpiresAt: null,
      })

      return { role: 'admin', requiresTwoFactor: true, tempToken: json.tempToken }
    }

    // Mock-Auth für alle anderen Rollen (bis Backend in Phase 1 Step 6 steht)
    await new Promise<void>((r) => setTimeout(r, 900))

    if (data.email.toLowerCase().includes('error')) {
      setServerError('E-Mail oder Passwort ist falsch.')
      throw new Error('invalid_credentials')
    }

    setUser({
      id: 'mock-1',
      email: data.email,
      displayName: data.email.split('@')[0],
      avatarUrl: null,
      role: 'user',
      proExpiresAt: null,
    })

    return { role: 'user', requiresTwoFactor: false }
  }

  async function verifyAdminTotp(code: string, tempToken: string): Promise<void> {
    const r = await fetch(`${ADMIN_API}/totp-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ code, tempToken }),
    })
    const json = await r.json()
    if (!r.ok) throw new Error(json.error ?? 'Falscher Code')
  }

  return {
    login,
    verifyAdminTotp,
    serverError,
    clearError: () => setServerError(null),
  }
}
