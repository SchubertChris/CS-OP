import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '../_lib/db'
import { parseUA } from '../_lib/ua'
import { getCountry } from '../_lib/ip'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const segments = Array.isArray(req.query.path) ? req.query.path : [req.query.path ?? '']
  const action = segments[0]

  const ua = req.headers['user-agent'] ?? ''
  const isBot = /bot|crawler|spider|googlebot|bingbot|slurp/i.test(ua)

  // POST /api/track/pageview
  if (action === 'pageview') {
    if (isBot) return res.status(200).json({ ok: true })
    const { path, referrer, sessionId } = req.body ?? {}
    if (!path || !sessionId) return res.status(400).json({ error: 'Fehlende Felder' })
    if (String(path).startsWith('/admin')) return res.status(200).json({ ok: true })
    const { device, browser, os } = parseUA(ua)
    const country = getCountry(req)
    await sql`
      INSERT INTO page_views (path, referrer, country, device, browser, os, session_id)
      VALUES (
        ${String(path).slice(0, 200)},
        ${referrer ? String(referrer).slice(0, 500) : null},
        ${country}, ${device}, ${browser.slice(0, 50)}, ${os.slice(0, 50)},
        ${String(sessionId).slice(0, 36)}
      )
    `
    return res.status(200).json({ ok: true })
  }

  // POST /api/track/heartbeat
  if (action === 'heartbeat') {
    const { sessionId } = req.body ?? {}
    if (!sessionId) return res.status(400).json({ error: 'sessionId fehlt' })
    const { device, browser } = parseUA(ua)
    const country = getCountry(req)
    await sql`
      INSERT INTO sessions (session_id, last_seen, country, device, browser)
      VALUES (${String(sessionId).slice(0, 36)}, NOW(), ${country}, ${device}, ${browser.slice(0, 50)})
      ON CONFLICT (session_id) DO UPDATE SET last_seen = NOW()
    `
    return res.status(200).json({ ok: true })
  }

  // POST /api/track/event
  if (action === 'event') {
    const { name, path, sessionId, meta } = req.body ?? {}
    if (!name || !sessionId) return res.status(400).json({ error: 'Fehlende Felder' })
    await sql`
      INSERT INTO events (name, path, session_id, meta)
      VALUES (
        ${String(name).slice(0, 100)},
        ${path ? String(path).slice(0, 200) : null},
        ${String(sessionId).slice(0, 36)},
        ${meta ? JSON.stringify(meta) : null}
      )
    `
    return res.status(200).json({ ok: true })
  }

  return res.status(404).json({ error: 'Not found' })
}
