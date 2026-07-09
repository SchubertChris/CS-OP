import { SignJWT, jwtVerify } from 'jose'
import type { VercelRequest, VercelResponse } from '@vercel/node'

// Fail-closed: ohne konfiguriertes Secret NIEMALS signieren/verifizieren.
// Kein Fallback — ein hartcodiertes Secret im öffentlichen Repo wäre fälschbar
// (Angreifer könnte ein Admin-Cookie selbst signieren).
function getJwtSecret(): Uint8Array {
  const secret = process.env.jwt_secret
  if (!secret) throw new Error('jwt_secret ist nicht konfiguriert')
  return new TextEncoder().encode(secret)
}

export async function issueTempToken(): Promise<string> {
  return new SignJWT({ step: 'totp' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(getJwtSecret())
}

export async function issueAdminToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(getJwtSecret())
}

export async function verifyToken(token: string): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
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
  res.setHeader('Set-Cookie',
    `cs_admin=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${8 * 3600}`
  )
}

export function clearAdminCookie(res: VercelResponse) {
  res.setHeader('Set-Cookie',
    'cs_admin=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'
  )
}

export async function requireAdmin(
  req: VercelRequest,
  res: VercelResponse
): Promise<Record<string, unknown> | null> {
  const token = getTokenFromCookie(req)
  if (!token) { res.status(401).json({ error: 'Nicht eingeloggt' }); return null }
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') {
    res.status(401).json({ error: 'Nicht eingeloggt' }); return null
  }
  return payload
}
