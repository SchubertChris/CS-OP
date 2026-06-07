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

/**
 * Gibt die echte Client-IP zurück, nicht manipulierbar.
 *
 * Vercel setzt x-real-ip auf die tatsächliche Client-IP (Edge-seitig, nicht
 * vom Client überschreibbar). Als Fallback das LETZTE Token von
 * x-forwarded-for — der Wert den Vercels Edge selbst angehängt hat.
 * Das ERSTE Token wird bewusst NICHT verwendet: ein Angreifer kann beliebige
 * Werte vorne in den Header schreiben und so IP-basiertes Rate-Limiting umgehen.
 */
export function getClientIp(req: VercelRequest): string {
  const realIp = req.headers['x-real-ip'] as string | undefined
  if (realIp?.trim()) return realIp.trim()

  const xff = req.headers['x-forwarded-for'] as string | undefined
  if (xff) {
    const last = xff.split(',').pop()?.trim()
    if (last) return last
  }

  return 'unknown'
}
