import type { VercelRequest, VercelResponse } from '@vercel/node'
import { neon } from '@neondatabase/serverless'
import { requireAdmin } from '../_lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (!await requireAdmin(req, res)) return

  const sql = neon(process.env.DATABASE_URL ?? '')

  try {
    const [counts, topIps, recent] = await Promise.all([
      sql`
        SELECT name, COUNT(*)::int AS n
        FROM events
        WHERE name IN ('login_fail', 'totp_fail', 'rate_limited', 'login_success', 'totp_success')
          AND created_at > NOW() - INTERVAL '24 hours'
        GROUP BY name
      `,
      sql`
        SELECT meta->>'ip' AS ip, COUNT(*)::int AS count
        FROM events
        WHERE name IN ('login_fail', 'totp_fail', 'rate_limited')
          AND created_at > NOW() - INTERVAL '24 hours'
          AND meta->>'ip' IS NOT NULL
        GROUP BY meta->>'ip'
        ORDER BY count DESC
        LIMIT 5
      `,
      sql`
        SELECT name, meta, created_at
        FROM events
        WHERE name IN ('login_fail', 'totp_fail', 'rate_limited', 'login_success', 'totp_success')
        ORDER BY created_at DESC
        LIMIT 20
      `,
    ])

    const last24h: Record<string, number> = {}
    for (const row of counts as { name: string; n: number }[]) {
      last24h[row.name] = row.n
    }

    return res.status(200).json({ last24h, topIps, recentEvents: recent })
  } catch {
    return res.status(500).json({ error: 'Interner Fehler' })
  }
}
