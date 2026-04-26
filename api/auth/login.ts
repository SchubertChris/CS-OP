import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'
import { issueTempToken } from '../_lib/auth'
import { isRateLimited } from '../_lib/rate-limit'
import { setCorsHeaders } from '../_lib/cors'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? 'unknown'

  if (await isRateLimited(`login:${ip}`, 5, 15 * 60 * 1000)) {
    return res.status(429).json({ error: 'Zu viele Versuche. Bitte 15 Minuten warten.' })
  }

  const { password } = req.body ?? {}
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Passwort fehlt' })
  }

  const hash = process.env.admin_password_hash ?? ''
  const ok   = await bcrypt.compare(password, hash)

  if (!ok) {
    return res.status(401).json({ error: 'Ungültige Anmeldedaten' })
  }

  const tempToken = await issueTempToken()
  return res.status(200).json({ tempToken })
}
