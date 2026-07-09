import type { VercelRequest, VercelResponse } from '@vercel/node'
import { neon } from '@neondatabase/serverless'
import { requireAdmin } from '../_lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (!await requireAdmin(req, res)) return
  try {
  const sql = neon(process.env.DATABASE_URL ?? '')
  const type = req.query.type as string

  if (type === 'overview') {
    const [today, week, month, total, downloads] = await Promise.all([
      sql`SELECT COUNT(*)::int AS n FROM page_views WHERE created_at > NOW()-INTERVAL '1 day'`,
      sql`SELECT COUNT(*)::int AS n FROM page_views WHERE created_at > NOW()-INTERVAL '7 days'`,
      sql`SELECT COUNT(*)::int AS n FROM page_views WHERE created_at > NOW()-INTERVAL '30 days'`,
      sql`SELECT COUNT(*)::int AS n FROM page_views`,
      sql`SELECT COUNT(*)::int AS n FROM events WHERE name='download_click' AND created_at>NOW()-INTERVAL '30 days'`,
    ])
    const sparkline = await sql`SELECT DATE(created_at)::text AS date,COUNT(*)::int AS views FROM page_views WHERE created_at>NOW()-INTERVAL '30 days' GROUP BY DATE(created_at) ORDER BY DATE(created_at)`
    return res.status(200).json({ today:(today[0] as {n:number}).n, week:(week[0] as {n:number}).n, month:(month[0] as {n:number}).n, total:(total[0] as {n:number}).n, downloads:(downloads[0] as {n:number}).n, sparkline })
  }

  if (type === 'pages') {
    const rows = await sql`SELECT path,COUNT(*)::int AS views,COUNT(DISTINCT session_id)::int AS visitors FROM page_views WHERE created_at>NOW()-INTERVAL '30 days' GROUP BY path ORDER BY views DESC LIMIT 10`
    return res.status(200).json({ pages: rows })
  }

  if (type === 'devices') {
    const [devices, browsers] = await Promise.all([
      sql`SELECT device,COUNT(*)::int AS n FROM page_views WHERE created_at>NOW()-INTERVAL '30 days' GROUP BY device ORDER BY n DESC`,
      sql`SELECT browser,COUNT(*)::int AS n FROM page_views WHERE created_at>NOW()-INTERVAL '30 days' GROUP BY browser ORDER BY n DESC LIMIT 6`,
    ])
    return res.status(200).json({ devices, browsers })
  }

  if (type === 'geo') {
    const rows = await sql`SELECT COALESCE(country,'XX') AS country,COUNT(*)::int AS views FROM page_views WHERE created_at>NOW()-INTERVAL '30 days' GROUP BY country ORDER BY views DESC LIMIT 10`
    return res.status(200).json({ geo: rows })
  }

  if (type === 'live') {
    const rows = await sql`SELECT COUNT(*)::int AS n FROM sessions WHERE last_seen>NOW()-INTERVAL '60 seconds'`
    return res.status(200).json({ live: (rows[0] as {n:number}).n })
  }

  if (type === 'events') {
    const rows = await sql`SELECT name,path,meta,created_at FROM events ORDER BY created_at DESC LIMIT 50`
    return res.status(200).json({ events: rows })
  }

  return res.status(404).json({ error: 'Not found' })
  } catch {
    return res.status(500).json({ error: 'Interner Fehler' })
  }
}
