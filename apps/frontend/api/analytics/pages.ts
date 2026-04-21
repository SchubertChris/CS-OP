import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAdmin } from '../_lib/auth'
import { sql } from '../_lib/db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (!await requireAdmin(req, res)) return

  const rows = await sql`
    SELECT
      path,
      COUNT(*)::int                     AS views,
      COUNT(DISTINCT session_id)::int   AS visitors
    FROM page_views
    WHERE created_at > NOW() - INTERVAL '30 days'
    GROUP BY path
    ORDER BY views DESC
    LIMIT 10
  `
  return res.status(200).json({ pages: rows })
}
