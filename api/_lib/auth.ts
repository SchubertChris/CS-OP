import { SignJWT, jwtVerify } from 'jose'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const jwtSecretValue = process.env.jwt_secret
if (!jwtSecretValue && process.env.VERCEL_ENV === 'production') {
  throw new Error('FATAL: jwt_secret env var is not set in production')
}
const JWT_SECRET = new TextEncoder().encode(jwtSecretValue ?? 'fallback-dev-secret-change-in-prod')

const SESSION_DURATION_SECONDS = 8 * 3600       // 8h Cookie-Lebensdauer
const SESSION_MAX_AGE_SECONDS  = 24 * 3600      // 24h absolutes Session-Maximum

/** Kurzlebiges Token nach erstem Login-Schritt — nur für TOTP-Verify gültig */
export async function issueTempToken(): Promise<string> {
  return new SignJWT({ step: 'totp' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(JWT_SECRET)
}

/**
 * Langlebiges Admin-Token nach erfolgreichem 2FA.
 * Trägt rootIat — den Zeitstempel des allerersten Logins.
 * Dieser Wert wird bei Renewals NICHT erneuert und begrenzt
 * die absolute Session-Dauer auf SESSION_MAX_AGE_SECONDS.
 */
export async function issueAdminToken(): Promise<string> {
  const rootIat = Math.floor(Date.now() / 1000)
  return new SignJWT({ role: 'admin', rootIat })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(JWT_SECRET)
}

/**
 * Token-Renewal: neues 8h-Token auf Basis eines bestehenden.
 * Der rootIat aus dem Vorgänger wird übernommen — die 24h-Grenze
 * läuft weiter, unabhängig davon wie oft erneuert wird.
 */
export async function refreshAdminToken(existingRootIat: number): Promise<string> {
  if (!Number.isFinite(existingRootIat)) throw new Error('Ungültiger rootIat')
  return new SignJWT({ role: 'admin', rootIat: existingRootIat })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(JWT_SECRET)
}

/** Rohes Token verifizieren — gibt Payload oder null zurück */
export async function verifyToken(token: string): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as Record<string, unknown>
  } catch {
    return null
  }
}

export function getTokenFromCookie(req: VercelRequest): string | null {
  const cookie = req.headers.cookie ?? ''
  const match = cookie.match(/cs_admin=([^;]+)/)
  return match ? match[1] : null
}

export function setAdminCookie(res: VercelResponse, token: string) {
  res.setHeader(
    'Set-Cookie',
    `cs_admin=${token}; HttpOnly; Secure; SameSite=Strict; Domain=.candlescope.de; Path=/; Max-Age=${SESSION_DURATION_SECONDS}`
  )
}

export function clearAdminCookie(res: VercelResponse) {
  res.setHeader(
    'Set-Cookie',
    'cs_admin=; HttpOnly; Secure; SameSite=Strict; Domain=.candlescope.de; Path=/; Max-Age=0'
  )
}

/**
 * Zentrale Auth-Guard-Funktion.
 * Prüft: Token vorhanden → Signatur gültig → Rolle = admin
 *       → Session nicht älter als 24h (rootIat-Grenze).
 * Gibt Payload zurück oder setzt Response und gibt null zurück.
 */
export async function requireAdmin(
  req: VercelRequest,
  res: VercelResponse
): Promise<Record<string, unknown> | null> {
  const token = getTokenFromCookie(req)
  if (!token) {
    res.status(401).json({ error: 'Nicht eingeloggt' })
    return null
  }

  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') {
    clearAdminCookie(res)
    res.status(401).json({ error: 'Nicht eingeloggt' })
    return null
  }

  // Absolute Session-Grenze: 24h ab ursprünglichem Login (rootIat)
  // Fehlendes oder ungültiges rootIat = Ablehnung (fail-closed)
  if (typeof payload.rootIat !== 'number' || !Number.isFinite(payload.rootIat)) {
    clearAdminCookie(res)
    res.status(401).json({ error: 'Sitzung abgelaufen. Bitte erneut anmelden.' })
    return null
  }
  const sessionAgeSeconds = Math.floor(Date.now() / 1000) - payload.rootIat
  if (sessionAgeSeconds > SESSION_MAX_AGE_SECONDS) {
    clearAdminCookie(res)
    res.status(401).json({ error: 'Sitzung abgelaufen. Bitte erneut anmelden.' })
    return null
  }

  return payload
}
