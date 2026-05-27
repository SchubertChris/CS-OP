// Proxy: app.candlescope.de/api/admin/images → candlescope.de/api/admin/images
export const config = { runtime: 'edge' }

const UPSTREAM = 'https://candlescope.de/api/admin/images'

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 })

  const url   = new URL(req.url)
  const target = url.search ? `${UPSTREAM}${url.search}` : UPSTREAM

  const upstream = await fetch(target, {
    method:  req.method,
    headers: {
      'Content-Type': 'application/json',
      // Cookie weiterleiten damit requireAdmin greift
      ...(req.headers.get('cookie') ? { Cookie: req.headers.get('cookie')! } : {}),
    },
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
    // @ts-expect-error Edge-Runtime braucht duplex
    duplex: 'half',
  })

  const data = await upstream.json()
  return Response.json(data, { status: upstream.status })
}
