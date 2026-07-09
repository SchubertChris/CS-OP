import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'
import QRCode from 'qrcode'
import { authenticator } from 'otplib'
import {
  issueTempToken, issueAdminToken, verifyToken,
  setAdminCookie, clearAdminCookie, requireAdmin,
} from '../_lib/auth.js'
import { isRateLimited } from '../_lib/rate-limit.js'
import { getClientIp } from '../_lib/ip.js'
import { getDb } from '../_lib/db.js'

async function logEvent(name: string, meta: Record<string, string>) {
  try {
    const sql = getDb()
    await sql`INSERT INTO events (name, meta) VALUES (${name}, ${JSON.stringify(meta)})`
  } catch { /* Logging darf nie werfen */ }
}

// Fail-closed Rate-Limit für Auth: bei DB-Fehler als "limitiert" behandeln.
// Sonst würde ein DB-Ausfall unbegrenzte Passwort-Versuche erlauben.
async function authRateLimited(key: string, max: number, windowMs: number): Promise<boolean> {
  try {
    return await isRateLimited(key, max, windowMs)
  } catch {
    return true
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  const action = req.query.action as string

  if (action === 'login') {
    if (req.method !== 'POST') return res.status(405).end()
    try {
      const ip = getClientIp(req)
      if (await authRateLimited(`login:${ip}`, 5, 15 * 60 * 1000)) {
        await logEvent('rate_limited', { ip, action: 'login' })
        return res.status(429).json({ error: 'Zu viele Versuche.' })
      }
      const { password } = req.body ?? {}
      if (!password || typeof password !== 'string')
        return res.status(400).json({ error: 'Passwort fehlt' })
      const hash = process.env.admin_password_hash
      if (!hash || !(await bcrypt.compare(password, hash))) {
        await logEvent('login_fail', { ip })
        return res.status(401).json({ error: 'Ungültige Anmeldedaten' })
      }
      await logEvent('login_success', { ip })
      return res.status(200).json({ tempToken: await issueTempToken() })
    } catch { return res.status(500).json({ error: 'Interner Fehler' }) }
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
    } catch { return res.status(500).json({ error: 'Interner Fehler' }) }
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
    } catch { return res.status(500).json({ error: 'Interner Fehler' }) }
  }

  if (action === 'totp-verify') {
    if (req.method !== 'POST') return res.status(405).end()
    try {
      const ip = getClientIp(req)
      if (await authRateLimited(`totp:${ip}`, 10, 5 * 60 * 1000)) {
        await logEvent('rate_limited', { ip, action: 'totp' })
        return res.status(429).json({ error: 'Zu viele Versuche.' })
      }
      const { code, tempToken } = req.body ?? {}
      if (!code || !tempToken) return res.status(400).json({ error: 'Code und Token erforderlich' })
      const payload = await verifyToken(tempToken)
      if (!payload || payload['step'] !== 'totp') return res.status(401).json({ error: 'Ungültige Sitzung' })
      // Fail-closed: 2FA darf ohne konfiguriertes Secret niemals durchlassen.
      const totpSecret = process.env.totp_secret
      if (!totpSecret) return res.status(500).json({ error: 'Interner Fehler' })
      authenticator.options = { window: 1 }
      if (!authenticator.verify({ token: String(code), secret: totpSecret })) {
        await logEvent('totp_fail', { ip })
        return res.status(401).json({ error: 'Ungültige Anmeldedaten' })
      }
      await logEvent('totp_success', { ip })
      setAdminCookie(res, await issueAdminToken())
      return res.status(200).json({ ok: true })
    } catch { return res.status(500).json({ error: 'Interner Fehler' }) }
  }

  return res.status(404).json({ error: 'Not found' })
}
