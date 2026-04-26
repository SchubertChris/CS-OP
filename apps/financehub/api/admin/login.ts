export const config = { runtime: 'edge' }

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 })
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  let password: string
  try {
    const body = await req.json()
    password = body.password
  } catch {
    return Response.json({ error: 'Ungültiger Request-Body' }, { status: 400 })
  }

  const upstream = await fetch('https://candlescope.de/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })

  const data = await upstream.json()
  return Response.json(data, { status: upstream.status })
}
