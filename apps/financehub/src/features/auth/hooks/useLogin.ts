import { useState, useRef } from 'react'
import type { LoginData } from '../types/auth.types'
import { useAuthStore, type UserRole } from '../../../store/authStore'

// Admin-Email via Vercel Env (VITE_ADMIN_EMAIL) konfigurierbar.
// Fallback nur für lokale Entwicklung — in Produktion immer setzen.
const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL as string | undefined) ?? ''
// Proxy-Endpoints in apps/financehub/api/admin/ — same-origin, kein CORS-Problem.
const ADMIN_API   = (import.meta.env.VITE_ADMIN_API_URL as string | undefined) ?? '/api/admin'

export interface LoginResult {
  role: UserRole
  requiresTwoFactor: boolean
  tempToken?: string
}

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser)
  const [serverError, setServerError] = useState<string | null>(null)
  // Zwischenspeicher: Admin-Email zwischen Login und TOTP-Verify
  const pendingAdminEmail = useRef<string | null>(null)

  async function login(data: LoginData): Promise<LoginResult> {
    setServerError(null)

    const isAdmin = ADMIN_EMAIL !== '' && data.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()

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

      // setUser ERST nach erfolgreichem TOTP — nicht hier
      pendingAdminEmail.current = data.email
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

    // TOTP erfolgreich → jetzt erst als Admin einloggen
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
