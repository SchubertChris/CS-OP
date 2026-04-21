import type { VercelRequest, VercelResponse } from '@vercel/node'
import QRCode from 'qrcode'
import { generateSecret, generateOtpAuthUrl } from '../_lib/totp'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const setupToken = process.env.setup_token
  if (!setupToken) {
    return res.status(403).json({ error: 'Setup bereits abgeschlossen oder nicht aktiviert' })
  }

  if (req.query.token !== setupToken) {
    return res.status(403).json({ error: 'Ungültiger Setup-Token' })
  }

  const secret     = process.env.totp_secret || generateSecret()
  const otpUrl     = generateOtpAuthUrl(secret, 'Chris', 'CandleScope')
  const qrDataUrl  = await QRCode.toDataURL(otpUrl, { width: 300, margin: 2 })

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  return res.status(200).send(`<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <title>CandleScope — TOTP Setup</title>
  <style>
    body { background: #080808; color: #F5F0E8; font-family: monospace;
           display: flex; flex-direction: column; align-items: center;
           justify-content: center; min-height: 100vh; gap: 24px; margin: 0; }
    img  { border: 2px solid #C9A84C; border-radius: 8px; }
    code { background: #111; padding: 12px 20px; border-radius: 6px;
           color: #C9A84C; font-size: 1.1em; letter-spacing: 0.1em; }
    p    { color: #9A9590; text-align: center; max-width: 420px; line-height: 1.6; }
    .warn { color: #FF4444; font-size: 0.85em; }
  </style>
</head>
<body>
  <h1 style="color:#C9A84C; letter-spacing:0.2em;">CANDLESCOPE TOTP SETUP</h1>
  <img src="${qrDataUrl}" alt="QR Code" width="300" height="300" />
  <p>1. Microsoft Authenticator öffnen<br>
     2. + → Anderes Konto → QR-Code scannen<br>
     3. "CandleScope" erscheint in der App</p>
  <p>Secret (falls manuell eingeben):</p>
  <code>${secret}</code>
  <p>4. Trage <strong>totp_secret</strong> in Vercel ein:<br>
     <code style="font-size:0.9em;">${secret}</code></p>
  <p class="warn">⚠ Danach setup_token aus Vercel-ENV löschen!<br>
     Dieser Endpoint ist dann dauerhaft deaktiviert.</p>
</body>
</html>`)
}
