import type { VercelRequest, VercelResponse } from '@vercel/node'
import { setCorsHeaders } from './_lib/cors'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { name, email, topic, message } = req.body

  if (!name || !email || !topic || !message) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('RESEND_API_KEY is not configured')
    return res.status(500).json({ error: 'Mail service not configured' })
  }

  const toEmail = process.env.CONTACT_RECEIVER_EMAIL ?? 'info@candlescope.de'
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: `CandleScope Kontakt <${fromEmail}>`,
        to: toEmail,
        reply_to: email,
        subject: `[CandleScope] ${topic} — ${name}`,
        text: `Name: ${name}\nE-Mail: ${email}\nThema: ${topic}\n\nNachricht:\n${message}`
      })
    })

    if (!resendRes.ok) {
      const errText = await resendRes.text()
      console.error('Resend API error:', errText)
      return res.status(500).json({ error: 'Failed to send message via Resend' })
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Contact handler error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
