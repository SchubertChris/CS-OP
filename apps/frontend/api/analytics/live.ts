import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAdmin } from '../_lib/auth'
import { sql } from '../_lib/db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (!await requireAdmin(req, res)) return

  const rows = await sql`
    SELECT COUNT(*)::int AS n
    FROM sessions
    WHERE last_seen > NOW() - INTERVAL '60 seconds'
  `
  return res.status(200).json({ live: (rows[0] as { n: number }).n })
}
