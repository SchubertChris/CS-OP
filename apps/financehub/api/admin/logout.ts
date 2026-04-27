export const config = { runtime: 'edge' }

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 })
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 })

  const upstream = await fetch('https://candlescope.de/api/auth/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: req.headers.get('Cookie') ?? '' },
  })

  // Cookie löschen
  const headers = new Headers({ 'Content-Type': 'application/json' })
  headers.set('Set-Cookie', 'cs_admin=; HttpOnly; Secure; SameSite=Lax; Domain=.candlescope.de; Path=/; Max-Age=0')

  return new Response(JSON.stringify({ success: true }), { status: upstream.status, headers })
}
