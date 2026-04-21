import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAdmin } from '../_lib/auth'
import { sql } from '../_lib/db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (!await requireAdmin(req, res)) return

  const [today, week, month, total, downloads] = await Promise.all([
    sql`SELECT COUNT(*)::int AS n FROM page_views WHERE created_at > NOW() - INTERVAL '1 day'`,
    sql`SELECT COUNT(*)::int AS n FROM page_views WHERE created_at > NOW() - INTERVAL '7 days'`,
    sql`SELECT COUNT(*)::int AS n FROM page_views WHERE created_at > NOW() - INTERVAL '30 days'`,
    sql`SELECT COUNT(*)::int AS n FROM page_views`,
    sql`SELECT COUNT(*)::int AS n FROM events WHERE name = 'download_click' AND created_at > NOW() - INTERVAL '30 days'`,
  ])

  const sparkline = await sql`
    SELECT
      DATE(created_at)::text AS date,
      COUNT(*)::int           AS views
    FROM page_views
    WHERE created_at > NOW() - INTERVAL '30 days'
    GROUP BY DATE(created_at)
    ORDER BY DATE(created_at)
  `

  return res.status(200).json({
    today:     (today[0] as { n: number }).n,
    week:      (week[0]  as { n: number }).n,
    month:     (month[0] as { n: number }).n,
    total:     (total[0] as { n: number }).n,
    downloads: (downloads[0] as { n: number }).n,
    sparkline,
  })
}
