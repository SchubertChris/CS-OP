import type { VercelRequest, VercelResponse } from '@vercel/node'
import { UAParser } from 'ua-parser-js'
import { neon } from '@neondatabase/serverless'
import { getClientIp } from '../_lib/ip.js'
import { isRateLimited } from '../_lib/rate-limit.js'

// Interne Security-Event-Namen — dürfen NICHT über den öffentlichen Endpoint
// eingeschleust werden (analytics/security.ts wertet exakt diese Namen aus;
// sonst ließe sich das Security-Dashboard fälschen / Brute-Force verschleiern).
const RESERVED_EVENT_NAMES = new Set([
  'login_fail', 'totp_fail', 'rate_limited', 'login_success', 'totp_success',
])

// Fail-open: Analytics nie wegen eines DB-Fehlers blocken.
async function softRateLimited(key: string, max: number, windowMs: number): Promise<boolean> {
  try { return await isRateLimited(key, max, windowMs) }
  catch { return false }
}

function parseUA(ua: string) {
  if (!ua) return { device: 'desktop' as const, browser: 'Unknown', os: 'Unknown' }
  const parser = new UAParser(ua)
  const result = parser.getResult()
  const t = result.device.type
  const device = t === 'mobile' ? 'mobile' as const : t === 'tablet' ? 'tablet' as const : 'desktop' as const
  return { device, browser: result.browser.name ?? 'Unknown', os: result.os.name ?? 'Unknown' }
}

function getCountry(req: VercelRequest): string | null {
  return (req.headers['x-vercel-ip-country'] as string) ?? null
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()
  const action = req.query.action as string
  const sql = neon(process.env.DATABASE_URL ?? '')
  const ua = req.headers['user-agent'] ?? ''

  if (action === 'pageview') {
    if (/bot|crawler|spider|googlebot|bingbot|slurp/i.test(ua)) return res.status(200).json({ ok: true })
    const { path, referrer, sessionId } = req.body ?? {}
    if (!path || !sessionId) return res.status(400).json({ error: 'Fehlende Felder' })
    if (String(path).startsWith('/admin')) return res.status(200).json({ ok: true })
    if (await softRateLimited(`track:pv:${getClientIp(req)}`, 200, 60_000))
      return res.status(429).json({ error: 'Zu viele Anfragen' })
    const { device, browser, os } = parseUA(ua)
    const country = getCountry(req)
    await sql`INSERT INTO page_views (path,referrer,country,device,browser,os,session_id) VALUES (
      ${String(path).slice(0,200)},${referrer?String(referrer).slice(0,500):null},
      ${country},${device},${browser.slice(0,50)},${os.slice(0,50)},${String(sessionId).slice(0,36)})`
    return res.status(200).json({ ok: true })
  }

  if (action === 'heartbeat') {
    const { sessionId } = req.body ?? {}
    if (!sessionId) return res.status(400).json({ error: 'sessionId fehlt' })
    if (await softRateLimited(`track:hb:${getClientIp(req)}`, 120, 60_000))
      return res.status(429).json({ error: 'Zu viele Anfragen' })
    const { device, browser } = parseUA(ua)
    const country = getCountry(req)
    await sql`INSERT INTO sessions (session_id,last_seen,country,device,browser)
      VALUES (${String(sessionId).slice(0,36)},NOW(),${country},${device},${browser.slice(0,50)})
      ON CONFLICT (session_id) DO UPDATE SET last_seen=NOW()`
    return res.status(200).json({ ok: true })
  }

  if (action === 'event') {
    const { name, path, sessionId, meta } = req.body ?? {}
    if (!name || !sessionId) return res.status(400).json({ error: 'Fehlende Felder' })
    if (RESERVED_EVENT_NAMES.has(String(name)))
      return res.status(400).json({ error: 'Ungültiger Event-Name' })
    if (await softRateLimited(`track:event:${getClientIp(req)}`, 60, 60_000))
      return res.status(429).json({ error: 'Zu viele Anfragen' })
    await sql`INSERT INTO events (name,path,session_id,meta) VALUES (
      ${String(name).slice(0,100)},${path?String(path).slice(0,200):null},
      ${String(sessionId).slice(0,36)},${meta?JSON.stringify(meta):null})`
    return res.status(200).json({ ok: true })
  }

  return res.status(404).json({ error: 'Not found' })
}
