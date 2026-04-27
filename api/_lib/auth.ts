import { SignJWT, jwtVerify } from 'jose'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const jwtSecretValue = process.env.jwt_secret
if (!jwtSecretValue && process.env.VERCEL_ENV === 'production') {
  throw new Error('FATAL: jwt_secret env var is not set in production')
}
const JWT_SECRET = new TextEncoder().encode(jwtSecretValue ?? 'fallback-dev-secret-change-in-prod')

export async function issueTempToken(): Promise<string> {
  return new SignJWT({ step: 'totp' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(JWT_SECRET)
}

export async function issueAdminToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(JWT_SECRET)
}

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
  res.setHeader('Set-Cookie',
    `cs_admin=${token}; HttpOnly; Secure; SameSite=Strict; Domain=.candlescope.de; Path=/; Max-Age=${8 * 3600}`
  )
}

export function clearAdminCookie(res: VercelResponse) {
  res.setHeader('Set-Cookie',
    'cs_admin=; HttpOnly; Secure; SameSite=Strict; Domain=.candlescope.de; Path=/; Max-Age=0'
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
