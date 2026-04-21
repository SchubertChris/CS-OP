import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAdmin } from '../_lib/auth'
import { sql } from '../_lib/db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (!await requireAdmin(req, res)) return

  const [devices, browsers] = await Promise.all([
    sql`
      SELECT device, COUNT(*)::int AS n
      FROM page_views
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY device ORDER BY n DESC
    `,
    sql`
      SELECT browser, COUNT(*)::int AS n
      FROM page_views
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY browser ORDER BY n DESC
      LIMIT 6
    `,
  ])
  return res.status(200).json({ devices, browsers })
}
