import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '../_lib/db'
import { parseUA } from '../_lib/ua'
import { getCountry } from '../_lib/ip'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const { sessionId } = req.body ?? {}
  if (!sessionId) return res.status(400).json({ error: 'sessionId fehlt' })

  const ua               = req.headers['user-agent'] ?? ''
  const { device, browser } = parseUA(ua)
  const country          = getCountry(req)

  await sql`
    INSERT INTO sessions (session_id, last_seen, country, device, browser)
    VALUES (${String(sessionId).slice(0, 36)}, NOW(), ${country}, ${device}, ${browser.slice(0, 50)})
    ON CONFLICT (session_id) DO UPDATE
      SET last_seen = NOW()
  `

  return res.status(200).json({ ok: true })
}
