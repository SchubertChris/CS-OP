import type { VercelRequest } from '@vercel/node'

export function anonymizeIp(ip: string): string {
  if (ip.includes(':')) return ip.split(':').slice(0, -1).join(':') + ':0'
  const parts = ip.split('.')
  if (parts.length === 4) { parts[3] = '0'; return parts.join('.') }
  return ip
}

export function getCountry(req: VercelRequest): string | null {
  return (req.headers['x-vercel-ip-country'] as string) ?? null
}

// Vertrauenswürdige Client-IP. `x-real-ip` wird von Vercel gesetzt und ist NICHT
// vom Client kontrollierbar — im Gegensatz zum linkesten `x-forwarded-for`-Element,
// das ein Angreifer selbst voranstellen könnte (Rate-Limit-Umgehung).
export function getClientIp(req: VercelRequest): string {
  const real = req.headers['x-real-ip']
  if (typeof real === 'string' && real.length > 0) return real
  const xff = req.headers['x-forwarded-for']
  if (typeof xff === 'string' && xff.length > 0) {
    const parts = xff.split(',').map((s) => s.trim()).filter(Boolean)
    if (parts.length > 0) return parts[parts.length - 1]
  }
  return 'unknown'
}
