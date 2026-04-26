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

  if (await isRateLimited(`totp:${ip}`, 10, 5 * 60 * 1000)) {
    return res.status(429).json({ error: 'Zu viele Versuche.' })
  }

  const { code, tempToken } = req.body ?? {}
  if (!code || !tempToken) {
    return res.status(400).json({ error: 'Code und Token erforderlich' })
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
