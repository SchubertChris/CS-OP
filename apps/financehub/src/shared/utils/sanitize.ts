/**
 * Sanitization Utilities — Input-Sicherheit
 *
 * React escaped JSX-Strings automatisch. Diese Utils decken die Lücken:
 * - URLs (href/src): React escaped javascript: Protokoll NICHT
 * - Externe Daten außerhalb von JSX
 * - Dateiname-Validierung für Uploads
 * - Numerische Felder, IBANs, Suchfelder
 *
 * Regeln:
 * 1. Kein innerHTML mit User-Input
 * 2. Alle href/src-Werte durch sanitizeUrl()
 * 3. Betragsfelder durch sanitizeAmount()
 * 4. Upload-Namen durch sanitizeFilename()
 */

// ---------------------------------------------------------------------------
// URL — verhindert javascript: und data: Protokolle in href/src
// ---------------------------------------------------------------------------
const SAFE_PROTOCOLS = new Set(['https:', 'http:', 'mailto:', 'tel:'])

export function sanitizeUrl(url: string): string {
  if (!url || url.trim() === '') return '#'
  try {
    const parsed = new URL(url, window.location.origin)
    return SAFE_PROTOCOLS.has(parsed.protocol) ? parsed.href : '#'
  } catch {
    // Relative URL — kein Protokoll = sicher wenn mit / oder . anfängt
    if (url.startsWith('/') || url.startsWith('.')) return url
    return '#'
  }
}

// ---------------------------------------------------------------------------
// BETRAG — nur Ziffern, Komma/Punkt, führendes Minus
// ---------------------------------------------------------------------------
export function sanitizeAmount(input: string): string {
  return input
    .replace(/[^0-9.,-]/g, '')
    .replace(/^(-?)(.*)$/, (_, sign, rest) => sign + rest.replace(/-/g, ''))
}

// ---------------------------------------------------------------------------
// IBAN — Buchstaben + Ziffern, formatiert in 4er-Gruppen
// ---------------------------------------------------------------------------
export function sanitizeIban(input: string): string {
  const clean = input.toUpperCase().replace(/[^A-Z0-9]/g, '')
  return clean.match(/.{1,4}/g)?.join(' ') ?? clean
}

// ---------------------------------------------------------------------------
// DATEINAME — für Archiv-Uploads, verhindert path traversal
// ---------------------------------------------------------------------------
export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._\-äöüÄÖÜß ]/g, '_')
    .replace(/\.{2,}/g, '.')
    .replace(/^[.\-]/, '_')
    .slice(0, 255)
}

// ---------------------------------------------------------------------------
// SEARCH QUERY — für Suchfelder
// ---------------------------------------------------------------------------
export function sanitizeSearchQuery(input: string): string {
  return input.replace(/[<>'"]/g, '').slice(0, 200)
}
