import type { VercelRequest, VercelResponse } from '@vercel/node'
import { setCorsHeaders } from './_lib/cors'
import { sql } from './_lib/db'

// ── Öffentlicher Endpunkt: GET /api/images ─────────────────────────────────
// Gibt alle Site-Images als { key: url } Map zurück.
// Kein Auth erforderlich — nur lesend.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET')    return res.status(405).end()

  try {
    const rows = await sql<{ key: string; url: string }[]>`
      SELECT key, url FROM site_images ORDER BY key
    `
    const map: Record<string, string> = {}
    for (const row of rows) map[row.key] = row.url

    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
    return res.status(200).json(map)
  } catch {
    // Tabelle noch nicht erstellt → leere Map zurückgeben, Frontend nutzt Fallbacks
    return res.status(200).json({})
  }
}
