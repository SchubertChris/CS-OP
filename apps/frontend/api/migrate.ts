import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getDb } from './_lib/db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = (req.headers['x-migrate-token'] ?? req.query.token) as string
  if (token !== process.env.setup_token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const sql = getDb()

    await sql`CREATE TABLE IF NOT EXISTS page_views (
      id SERIAL PRIMARY KEY, path TEXT NOT NULL, referrer TEXT,
      country VARCHAR(2), device VARCHAR(20), browser VARCHAR(50), os VARCHAR(50),
      session_id VARCHAR(36) NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW()
    )`
    await sql`CREATE INDEX IF NOT EXISTS idx_pv_created ON page_views(created_at)`
    await sql`CREATE INDEX IF NOT EXISTS idx_pv_path    ON page_views(path)`
    await sql`CREATE INDEX IF NOT EXISTS idx_pv_session ON page_views(session_id)`

    await sql`CREATE TABLE IF NOT EXISTS sessions (
      session_id VARCHAR(36) PRIMARY KEY, last_seen TIMESTAMPTZ DEFAULT NOW(),
      country VARCHAR(2), device VARCHAR(20), browser VARCHAR(50)
    )`
    await sql`CREATE INDEX IF NOT EXISTS idx_sess_seen ON sessions(last_seen)`

    await sql`CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, path TEXT,
      session_id VARCHAR(36), meta JSONB, created_at TIMESTAMPTZ DEFAULT NOW()
    )`
    await sql`CREATE INDEX IF NOT EXISTS idx_ev_created ON events(created_at)`
    await sql`CREATE INDEX IF NOT EXISTS idx_ev_name    ON events(name)`

    await sql`CREATE TABLE IF NOT EXISTS rate_limits (
      key TEXT PRIMARY KEY, count INTEGER DEFAULT 1, reset_at TIMESTAMPTZ NOT NULL
    )`

    return res.status(200).json({ ok: true, message: 'Schema erstellt' })
  } catch (e: unknown) {
    return res.status(500).json({ error: String(e) })
  }
}
