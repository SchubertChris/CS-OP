import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyToken, issueAdminToken, setAdminCookie } from '../_lib/auth'
import { verifyTotp } from '../_lib/totp'
import { isRateLimited } from '../_lib/rate-limit'
import { setCorsHeaders } from '../_lib/cors'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? 'unknown'

  const { code, tempToken } = req.body ?? {}
  if (!code || !tempToken || typeof tempToken !== 'string') {
    return res.status(400).json({ error: 'Code und Token erforderlich' })
  }

  // Doppeltes Rate-Limit: per IP und per tempToken-Hash (5 Versuche je Token)
  const tokenHash = Array.from(
    new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(tempToken)))
  ).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16)

  if (await isRateLimited(`totp:ip:${ip}`, 10, 5 * 60 * 1000)) {
    return res.status(429).json({ error: 'Zu viele Versuche.' })
  }
  if (await isRateLimited(`totp:tok:${tokenHash}`, 5, 5 * 60 * 1000)) {
    return res.status(429).json({ error: 'Zu viele Versuche für diesen Code.' })
  }

  const payload = await verifyToken(tempToken)
  if (!payload || payload.step !== 'totp') {
    return res.status(401).json({ error: 'Ungültige Sitzung' })
  }

  const secret = process.env.TOTP_SECRET ?? ''
  if (!verifyTotp(String(code), secret)) {
    return res.status(401).json({ error: 'Ungültige Anmeldedaten' })
  }

  const adminToken = await issueAdminToken()
  setAdminCookie(res, adminToken)
  return res.status(200).json({ ok: true })
}
