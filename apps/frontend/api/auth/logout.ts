import type { VercelRequest, VercelResponse } from '@vercel/node'
import { clearAdminCookie } from '../_lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()
  clearAdminCookie(res)
  return res.status(200).json({ ok: true })
}
