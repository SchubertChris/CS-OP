import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAdmin } from '../_lib/auth'
import { sql } from '../_lib/db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (!await requireAdmin(req, res)) return

  const rows = await sql`
    SELECT name, path, meta, created_at
    FROM events
    ORDER BY created_at DESC
    LIMIT 50
  `
  return res.status(200).json({ events: rows })
}
