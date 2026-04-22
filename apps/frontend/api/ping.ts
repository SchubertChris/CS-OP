import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(_req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({
    ok: true,
    ts: Date.now(),
    hasDb: !!process.env.DATABASE_URL,
    hasSetupToken: !!process.env.setup_token,
  })
}
