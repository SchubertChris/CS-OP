import type { VercelRequest, VercelResponse } from '@vercel/node'

const ALLOWED_ORIGINS = new Set([
  'https://app.candlescope.de',
  'http://localhost:5174',
  'http://localhost:5173',
])

export function setCorsHeaders(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin as string | undefined
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  }
}
