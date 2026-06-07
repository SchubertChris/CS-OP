import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '../_lib/db'
import { parseUA } from '../_lib/ua'
import { getCountry } from '../_lib/ip'
import { isRateLimited } from '../_lib/rate-limit'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const ua = req.headers['user-agent'] ?? ''
  if (/bot|crawler|spider|googlebot|bingbot|slurp/i.test(ua)) {
    return res.status(200).json({ ok: true })
  }

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? 'unknown'
  if (await isRateLimited(`track:pv:${ip}`, 60, 60 * 1000)) {
    return res.status(429).json({ error: 'Too many requests' })
  }

  const { path, referrer, sessionId } = req.body ?? {}
  if (!path || !sessionId) return res.status(400).json({ error: 'Fehlende Felder' })

  if (String(path).startsWith('/admin')) {
    return res.status(200).json({ ok: true })
  }

  const { device, browser, os } = parseUA(ua)
  const country = getCountry(req)

  await sql`
    INSERT INTO page_views (path, referrer, country, device, browser, os, session_id)
    VALUES (
      ${String(path).slice(0, 200)},
      ${referrer ? String(referrer).slice(0, 500) : null},
      ${country},
      ${device},
      ${browser.slice(0, 50)},
      ${os.slice(0, 50)},
      ${String(sessionId).slice(0, 36)}
    )
  `

  return res.status(200).json({ ok: true })
}
