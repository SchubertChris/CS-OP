import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  const action = req.query.action as string

  if (action === 'login') {
    if (req.method !== 'POST') return res.status(405).end()
    try {
      const { isRateLimited } = await import('../_lib/rate-limit')
      const { issueTempToken } = await import('../_lib/auth')
      const { default: bcrypt } = await import('bcryptjs')
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
    } catch (e) { return res.status(500).json({ error: String(e) }) }
  }

  if (action === 'logout') {
    if (req.method !== 'POST') return res.status(405).end()
    const { clearAdminCookie } = await import('../_lib/auth')
    clearAdminCookie(res)
    return res.status(200).json({ ok: true })
  }

  if (action === 'me') {
    if (req.method !== 'GET') return res.status(405).end()
    try {
      const { requireAdmin } = await import('../_lib/auth')
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
      const { generateSecret, generateOtpAuthUrl } = await import('../_lib/totp')
      const { default: QRCode } = await import('qrcode')
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
<p class="warn">Danach setup_token aus Vercel loeschen!</p></body></html>`)
    } catch (e) { return res.status(500).json({ error: String(e) }) }
  }

  if (action === 'totp-verify') {
    if (req.method !== 'POST') return res.status(405).end()
    try {
      const { isRateLimited } = await import('../_lib/rate-limit')
      const { verifyToken, issueAdminToken, setAdminCookie } = await import('../_lib/auth')
      const { verifyTotp } = await import('../_lib/totp')
      const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? 'unknown'
      if (await isRateLimited(`totp:${ip}`, 10, 5 * 60 * 1000))
        return res.status(429).json({ error: 'Zu viele Versuche.' })
      const { code, tempToken } = req.body ?? {}
      if (!code || !tempToken) return res.status(400).json({ error: 'Code und Token erforderlich' })
      const payload = await verifyToken(tempToken)
      if (!payload || payload.step !== 'totp') return res.status(401).json({ error: 'Ungültige Sitzung' })
      const secret = process.env.totp_secret ?? ''
      if (!verifyTotp(String(code), secret)) return res.status(401).json({ error: 'Ungültige Anmeldedaten' })
      setAdminCookie(res, await issueAdminToken())
      return res.status(200).json({ ok: true })
    } catch (e) { return res.status(500).json({ error: String(e) }) }
  }

  return res.status(404).json({ error: 'Not found' })
}
