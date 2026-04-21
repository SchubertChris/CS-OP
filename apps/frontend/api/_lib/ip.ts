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
