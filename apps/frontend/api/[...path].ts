import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'
import QRCode from 'qrcode'
import { sql } from './_lib/db'
import { parseUA } from './_lib/ua'
import { getCountry } from './_lib/ip'
import { isRateLimited } from './_lib/rate-limit'
import { generateSecret, generateOtpAuthUrl, verifyTotp } from './_lib/totp'
import {
  issueTempToken, clearAdminCookie, requireAdmin,
  verifyToken, issueAdminToken, setAdminCookie,
} from './_lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end()

  const url = req.url ?? ''
  const path = url.split('?')[0].replace(/^\/api\//, '')

  // ── MIGRATE ────────────────────────────────────────────────────────────────
  if (path === 'migrate') {
    const token = req.headers['x-migrate-token'] ?? req.query.token
    if (token !== process.env.setup_token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    try {
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

  // ── AUTH/LOGIN ─────────────────────────────────────────────────────────────
  if (path === 'auth/login') {
    if (req.method !== 'POST') return res.status(405).end()
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? 'unknown'
    if (await isRateLimited(`login:${ip}`, 5, 15 * 60 * 1000))
      return res.status(429).json({ error: 'Zu viele Versuche. Bitte 15 Minuten warten.' })
    const { password } = req.body ?? {}
    if (!password || typeof password !== 'string')
      return res.status(400).json({ error: 'Passwort fehlt' })
    const hash = process.env.admin_password_hash ?? ''
    if (!await bcrypt.compare(password, hash))
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' })
    return res.status(200).json({ tempToken: await issueTempToken() })
  }

  // ── AUTH/LOGOUT ────────────────────────────────────────────────────────────
  if (path === 'auth/logout') {
    if (req.method !== 'POST') return res.status(405).end()
    clearAdminCookie(res)
    return res.status(200).json({ ok: true })
  }

  // ── AUTH/ME ────────────────────────────────────────────────────────────────
  if (path === 'auth/me') {
    if (req.method !== 'GET') return res.status(405).end()
    const payload = await requireAdmin(req, res)
    if (!payload) return
    return res.status(200).json({ ok: true, role: 'admin' })
  }

  // ── AUTH/TOTP-SETUP ────────────────────────────────────────────────────────
  if (path === 'auth/totp-setup') {
    if (req.method !== 'GET') return res.status(405).end()
    const setupToken = process.env.setup_token
    if (!setupToken) return res.status(403).json({ error: 'Setup nicht aktiviert' })
    if (req.query.token !== setupToken) return res.status(403).json({ error: 'Ungültiger Token' })
    const secret = process.env.totp_secret || generateSecret()
    const qrDataUrl = await QRCode.toDataURL(generateOtpAuthUrl(secret, 'Chris', 'CandleScope'), { width: 300, margin: 2 })
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(200).send(`<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><title>TOTP Setup</title>
<style>body{background:#080808;color:#F5F0E8;font-family:monospace;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:24px;margin:0}
img{border:2px solid #C9A84C;border-radius:8px}code{background:#111;padding:12px 20px;border-radius:6px;color:#C9A84C;font-size:1.1em}
p{color:#9A9590;text-align:center;max-width:420px;line-height:1.6}.warn{color:#FF4444;font-size:0.85em}</style></head>
<body><h1 style="color:#C9A84C">CANDLESCOPE TOTP SETUP</h1>
<img src="${qrDataUrl}" width="300" height="300" />
<p>1. Microsoft Authenticator → + → Anderes Konto → QR scannen</p>
<code>${secret}</code>
<p>Trage <b>totp_secret</b> in Vercel ein mit diesem Wert.</p>
<p class="warn">⚠ Danach setup_token aus Vercel löschen!</p></body></html>`)
  }

  // ── AUTH/TOTP-VERIFY ───────────────────────────────────────────────────────
  if (path === 'auth/totp-verify') {
    if (req.method !== 'POST') return res.status(405).end()
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? 'unknown'
    if (await isRateLimited(`totp:${ip}`, 10, 5 * 60 * 1000))
      return res.status(429).json({ error: 'Zu viele Versuche.' })
    const { code, tempToken } = req.body ?? {}
    if (!code || !tempToken) return res.status(400).json({ error: 'Code und Token erforderlich' })
    const payload = await verifyToken(tempToken)
    if (!payload || payload.step !== 'totp') return res.status(401).json({ error: 'Ungültige Sitzung' })
    const secret = process.env.totp_secret ?? process.env.TOTP_SECRET ?? ''
    if (!verifyTotp(String(code), secret)) return res.status(401).json({ error: 'Ungültige Anmeldedaten' })
    setAdminCookie(res, await issueAdminToken())
    return res.status(200).json({ ok: true })
  }

  // ── TRACK/PAGEVIEW ─────────────────────────────────────────────────────────
  if (path === 'track/pageview') {
    if (req.method !== 'POST') return res.status(405).end()
    const ua = req.headers['user-agent'] ?? ''
    if (/bot|crawler|spider|googlebot|bingbot|slurp/i.test(ua)) return res.status(200).json({ ok: true })
    const { path: pPath, referrer, sessionId } = req.body ?? {}
    if (!pPath || !sessionId) return res.status(400).json({ error: 'Fehlende Felder' })
    if (String(pPath).startsWith('/admin')) return res.status(200).json({ ok: true })
    const { device, browser, os } = parseUA(ua)
    const country = getCountry(req)
    await sql`INSERT INTO page_views (path,referrer,country,device,browser,os,session_id) VALUES (
      ${String(pPath).slice(0,200)},${referrer?String(referrer).slice(0,500):null},
      ${country},${device},${browser.slice(0,50)},${os.slice(0,50)},${String(sessionId).slice(0,36)})`
    return res.status(200).json({ ok: true })
  }

  // ── TRACK/HEARTBEAT ────────────────────────────────────────────────────────
  if (path === 'track/heartbeat') {
    if (req.method !== 'POST') return res.status(405).end()
    const { sessionId } = req.body ?? {}
    if (!sessionId) return res.status(400).json({ error: 'sessionId fehlt' })
    const ua = req.headers['user-agent'] ?? ''
    const { device, browser } = parseUA(ua)
    const country = getCountry(req)
    await sql`INSERT INTO sessions (session_id,last_seen,country,device,browser)
      VALUES (${String(sessionId).slice(0,36)},NOW(),${country},${device},${browser.slice(0,50)})
      ON CONFLICT (session_id) DO UPDATE SET last_seen=NOW()`
    return res.status(200).json({ ok: true })
  }

  // ── TRACK/EVENT ────────────────────────────────────────────────────────────
  if (path === 'track/event') {
    if (req.method !== 'POST') return res.status(405).end()
    const { name, path: ePath, sessionId, meta } = req.body ?? {}
    if (!name || !sessionId) return res.status(400).json({ error: 'Fehlende Felder' })
    await sql`INSERT INTO events (name,path,session_id,meta) VALUES (
      ${String(name).slice(0,100)},${ePath?String(ePath).slice(0,200):null},
      ${String(sessionId).slice(0,36)},${meta?JSON.stringify(meta):null})`
    return res.status(200).json({ ok: true })
  }

  // ── ANALYTICS ──────────────────────────────────────────────────────────────
  if (path.startsWith('analytics/')) {
    if (!await requireAdmin(req, res)) return
    const sub = path.replace('analytics/', '')

    if (sub === 'overview') {
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
    if (sub === 'pages') {
      const rows = await sql`SELECT path,COUNT(*)::int AS views,COUNT(DISTINCT session_id)::int AS visitors FROM page_views WHERE created_at>NOW()-INTERVAL '30 days' GROUP BY path ORDER BY views DESC LIMIT 10`
      return res.status(200).json({ pages: rows })
    }
    if (sub === 'devices') {
      const [devices, browsers] = await Promise.all([
        sql`SELECT device,COUNT(*)::int AS n FROM page_views WHERE created_at>NOW()-INTERVAL '30 days' GROUP BY device ORDER BY n DESC`,
        sql`SELECT browser,COUNT(*)::int AS n FROM page_views WHERE created_at>NOW()-INTERVAL '30 days' GROUP BY browser ORDER BY n DESC LIMIT 6`,
      ])
      return res.status(200).json({ devices, browsers })
    }
    if (sub === 'geo') {
      const rows = await sql`SELECT COALESCE(country,'XX') AS country,COUNT(*)::int AS views FROM page_views WHERE created_at>NOW()-INTERVAL '30 days' GROUP BY country ORDER BY views DESC LIMIT 10`
      return res.status(200).json({ geo: rows })
    }
    if (sub === 'live') {
      const rows = await sql`SELECT COUNT(*)::int AS n FROM sessions WHERE last_seen>NOW()-INTERVAL '60 seconds'`
      return res.status(200).json({ live: (rows[0] as {n:number}).n })
    }
    if (sub === 'events') {
      const rows = await sql`SELECT name,path,meta,created_at FROM events ORDER BY created_at DESC LIMIT 50`
      return res.status(200).json({ events: rows })
    }
  }

  return res.status(404).json({ error: 'Not found' })
}
