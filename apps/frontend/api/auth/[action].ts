import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'
import QRCode from 'qrcode'
import { SignJWT, jwtVerify } from 'jose'
import { authenticator } from 'otplib'
import { neon } from '@neondatabase/serverless'

const jwtSecret = () => new TextEncoder().encode(
  process.env.jwt_secret ?? 'fallback-dev-secret'
)

async function issueTempToken() {
  return new SignJWT({ step: 'totp' })
    .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('5m')
    .sign(jwtSecret())
}

async function issueAdminToken() {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('8h')
    .sign(jwtSecret())
}

async function verifyJwt(token: string) {
  try { const { payload } = await jwtVerify(token, jwtSecret()); return payload }
  catch { return null }
}

function getToken(req: VercelRequest) {
  const c = req.headers.cookie ?? ''
  const m = c.match(/cs_admin=([^;]+)/)
  return m ? m[1] : null
}

function setAdminCookie(res: VercelResponse, token: string) {
  res.setHeader('Set-Cookie', `cs_admin=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${8 * 3600}`)
}

function clearAdminCookie(res: VercelResponse) {
  res.setHeader('Set-Cookie', 'cs_admin=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0')
}

async function requireAdmin(req: VercelRequest, res: VercelResponse) {
  const token = getToken(req)
  if (!token) { res.status(401).json({ error: 'Nicht eingeloggt' }); return null }
  const payload = await verifyJwt(token)
  if (!payload || payload['role'] !== 'admin') {
    res.status(401).json({ error: 'Nicht eingeloggt' }); return null
  }
  return payload
}

async function isRateLimited(key: string, max: number, windowMs: number) {
  try {
    const sql = neon(process.env.DATABASE_URL ?? '')
    const resetAt = new Date(Date.now() + windowMs).toISOString()
    const rows = await sql`
      INSERT INTO rate_limits (key, count, reset_at) VALUES (${key}, 1, ${resetAt})
      ON CONFLICT (key) DO UPDATE
        SET count    = CASE WHEN rate_limits.reset_at < NOW() THEN 1 ELSE rate_limits.count + 1 END,
            reset_at = CASE WHEN rate_limits.reset_at < NOW() THEN ${resetAt}::timestamptz ELSE rate_limits.reset_at END
      RETURNING count`
    return (rows[0] as { count: number }).count > max
  } catch { return false }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  const action = req.query.action as string

  if (action === 'login') {
    if (req.method !== 'POST') return res.status(405).end()
    try {
      const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? 'unknown'
      if (await isRateLimited(`login:${ip}`, 5, 15 * 60 * 1000))
        return res.status(429).json({ error: 'Zu viele Versuche.' })
      const { password } = req.body ?? {}
      if (!password || typeof password !== 'string')
        return res.status(400).json({ error: 'Passwort fehlt' })
      if (!await bcrypt.compare(password, process.env.admin_password_hash ?? ''))
        return res.status(401).json({ error: 'Ungültige Anmeldedaten' })
      return res.status(200).json({ tempToken: await issueTempToken() })
    } catch (e) { return res.status(500).json({ error: String(e) }) }
  }

  if (action === 'logout') {
    if (req.method !== 'POST') return res.status(405).end()
    clearAdminCookie(res)
    return res.status(200).json({ ok: true })
  }

  if (action === 'me') {
    if (req.method !== 'GET') return res.status(405).end()
    try {
      const payload = await requireAdmin(req, res)
      if (!payload) return
      return res.status(200).json({ ok: true, role: 'admin' })
    } catch (e) { return res.status(500).json({ error: String(e) }) }
  }

  if (action === 'totp-setup') {
    if (req.method !== 'GET') return res.status(405).end()
    try {
      const setupToken = process.env.setup_token
      if (!setupToken) return res.status(403).json({ error: 'Setup nicht aktiviert' })
      if (req.query.token !== setupToken) return res.status(403).json({ error: 'Ungültiger Token' })
      const secret = process.env.totp_secret || authenticator.generateSecret(20)
      const otpUrl = authenticator.keyuri('Chris', 'CandleScope', secret)
      const qrDataUrl = await QRCode.toDataURL(otpUrl, { width: 300, margin: 2 })
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
<p class="warn">Danach setup_token aus Vercel loeschen!</p></body></html>`)
    } catch (e) { return res.status(500).json({ error: String(e) }) }
  }

  if (action === 'totp-verify') {
    if (req.method !== 'POST') return res.status(405).end()
    try {
      const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? 'unknown'
      if (await isRateLimited(`totp:${ip}`, 10, 5 * 60 * 1000))
        return res.status(429).json({ error: 'Zu viele Versuche.' })
      const { code, tempToken } = req.body ?? {}
      if (!code || !tempToken) return res.status(400).json({ error: 'Code und Token erforderlich' })
      const payload = await verifyJwt(tempToken)
      if (!payload || payload['step'] !== 'totp') return res.status(401).json({ error: 'Ungültige Sitzung' })
      authenticator.options = { window: 1 }
      if (!authenticator.verify({ token: String(code), secret: process.env.totp_secret ?? '' }))
        return res.status(401).json({ error: 'Ungültige Anmeldedaten' })
      setAdminCookie(res, await issueAdminToken())
      return res.status(200).json({ ok: true })
    } catch (e) { return res.status(500).json({ error: String(e) }) }
  }

  return res.status(404).json({ error: 'Not found' })
}
