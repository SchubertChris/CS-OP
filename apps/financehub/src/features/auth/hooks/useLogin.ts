import { useState, useRef } from 'react'
import type { LoginData } from '../types/auth.types'
import { useAuthStore, type UserRole } from '../../../store/authStore'

const ADMIN_API = (import.meta.env.VITE_ADMIN_API_URL as string | undefined) ?? '/api/admin'

export interface LoginResult {
  role: UserRole
  requiresTwoFactor: boolean
  tempToken?: string
}

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser)
  const [serverError, setServerError] = useState<string | null>(null)
  const pendingAdminEmail = useRef<string | null>(null)

  async function login(data: LoginData): Promise<LoginResult> {
    setServerError(null)

    // Immer zuerst Admin-Endpoint versuchen.
    // Backend entscheidet ob das Passwort dem Admin gehört — kein Email-Hardcoding.
    const r = await fetch(`${ADMIN_API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: data.password }),
    })
    const json = await r.json()

    if (r.ok && json.tempToken) {
      // Admin-Login erfolgreich → setUser erst NACH TOTP
      pendingAdminEmail.current = data.email
      return { role: 'admin', requiresTwoFactor: true, tempToken: json.tempToken }
    }

    // Kein Admin → Login abweisen bis echtes User-Auth-Backend bereit ist
    await new Promise<void>((resolve) => setTimeout(resolve, 900))
    setServerError('E-Mail oder Passwort ist falsch.')
    throw new Error('invalid_credentials')
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

    // TOTP erfolgreich → jetzt als Admin einloggen
    setUser({
      id: 'admin-1',
      email: pendingAdminEmail.current ?? '',
      displayName: 'Candlescope',
      avatarUrl: null,
      role: 'admin',
      proExpiresAt: null,
    })
    pendingAdminEmail.current = null
  }

  return {
    login,
    verifyAdminTotp,
    serverError,
    clearError: () => setServerError(null),
  }
}
