export const config = { runtime: 'edge' }

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 })
  if (req.method !== 'GET') return Response.json({ error: 'Method not allowed' }, { status: 405 })

  const upstream = await fetch('https://candlescope.de/api/auth/me', {
    method: 'GET',
    headers: { Cookie: req.headers.get('Cookie') ?? '' },
  })

  const data = await upstream.json()
  return Response.json(data, { status: upstream.status })
}
