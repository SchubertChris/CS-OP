import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const dbUrl = process.env.DATABASE_URL ?? process.env.database_url ?? ''
  if (!dbUrl) return res.status(500).json({ error: 'DATABASE_URL not set' })

  try {
    const { neon } = await import('@neondatabase/serverless')
    const sql = neon(dbUrl)
    const rows = await sql`SELECT 1 AS ok`
    return res.status(200).json({ ok: true, rows })
  } catch (e: unknown) {
    return res.status(500).json({ error: String(e), dbUrl: dbUrl.replace(/:\/\/[^@]+@/, '://***@') })
  }
}
