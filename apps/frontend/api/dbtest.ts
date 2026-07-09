import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAdmin } from './_lib/auth.js'

// Debug-Endpoint: nur für eingeloggte Admins. Gibt im Fehlerfall KEINE
// DB-URL-Fragmente (Host/Port/DB-Name) mehr an den Client zurück.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!(await requireAdmin(req, res))) return

  const dbUrl = process.env.DATABASE_URL ?? process.env.database_url ?? ''
  if (!dbUrl) return res.status(500).json({ error: 'DATABASE_URL not set' })

  try {
    const { neon } = await import('@neondatabase/serverless')
    const sql = neon(dbUrl)
    const rows = await sql`SELECT 1 AS ok`
    return res.status(200).json({ ok: true, rows })
  } catch {
    return res.status(500).json({ error: 'DB-Verbindung fehlgeschlagen' })
  }
}
