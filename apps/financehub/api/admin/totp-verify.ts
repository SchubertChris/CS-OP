export const config = { runtime: 'edge' }

const MAX_AGE = 8 * 3600

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 })
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  let code: string, tempToken: string
  try {
    const body = await req.json()
    code      = body.code
    tempToken = body.tempToken
  } catch {
    return Response.json({ error: 'Ungültiger Request-Body' }, { status: 400 })
  }

  const upstream = await fetch('https://candlescope.de/api/auth/totp-verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, tempToken }),
  })

  const data = await upstream.json()

  if (!upstream.ok) {
    return Response.json(data, { status: upstream.status })
  }

  // Extract token from upstream Set-Cookie and re-issue with Domain=.candlescope.de
  // so the cookie works on both app.candlescope.de and candlescope.de (AdminGuard).
  const upstreamCookie = upstream.headers.get('set-cookie') ?? ''
  const tokenMatch     = upstreamCookie.match(/cs_admin=([^;]+)/)

  const headers = new Headers({ 'Content-Type': 'application/json' })
  if (tokenMatch) {
    headers.set(
      'Set-Cookie',
      `cs_admin=${tokenMatch[1]}; HttpOnly; Secure; SameSite=Strict; Domain=.candlescope.de; Path=/; Max-Age=${MAX_AGE}`,
    )
  }

  return new Response(JSON.stringify(data), { status: 200, headers })
}
