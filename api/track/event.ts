import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '../_lib/db'
import { isRateLimited } from '../_lib/rate-limit'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? 'unknown'
  if (await isRateLimited(`track:ev:${ip}`, 30, 60 * 1000)) {
    return res.status(429).json({ error: 'Too many requests' })
  }

  const { name, path, sessionId, meta } = req.body ?? {}
  if (!name || !sessionId) return res.status(400).json({ error: 'Fehlende Felder' })

  await sql`
    INSERT INTO events (name, path, session_id, meta)
    VALUES (
      ${String(name).slice(0, 100)},
      ${path ? String(path).slice(0, 200) : null},
      ${String(sessionId).slice(0, 36)},
      ${meta ? JSON.stringify(meta) : null}
    )
  `

  return res.status(200).json({ ok: true })
}
