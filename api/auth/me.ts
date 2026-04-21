import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAdmin } from '../_lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).end()
  const payload = await requireAdmin(req, res)
  if (!payload) return
  return res.status(200).json({ ok: true, role: 'admin' })
}
