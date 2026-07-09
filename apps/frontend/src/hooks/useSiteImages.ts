// ── Bild-Quellen (public/images/ — self-hosted, immer verfügbar) ──────────
// Hinweis: Ein dynamischer /api/images-Endpoint existiert (noch) nicht.
// Früher wurde er bei jedem Load gefetcht → 404 + unnötiger Netzwerk-Traffic.
// Solange es kein Backend für verwaltbare Bilder gibt, nutzen wir direkt die
// lokalen Defaults. Wenn der Endpoint kommt, hier wieder ein Fetch ergänzen.
const IMAGES: Record<string, string> = {
  'home-preview':         '/images/home-preview.webp',
  'about-chris':          '/images/about-chris.webp',
  'chris':                '/images/ImageVonMirNeu.webp',
  'sentinel':             '/images/Sentinel.webp',
  'shopray-shop':         '/images/shopray-shop.webp',
  'shopray-admin':        '/images/shopray-admin.webp',
  'shopray-collections':  '/images/shopray-collections.webp',
  'shopray-account':      '/images/shopray-account.webp',
  'shopray-wishlist':     '/images/shopray-wishlist.webp',
  'finance-yearly':       '/images/finance-yearly.webp',
  'finance-archive':      '/images/finance-archive.webp',
  'finance-goals':        '/images/finance-goals.webp',
  'finance-transactions': '/images/finance-transactions.webp',
  'finance-modals':       '/images/finance-modals.webp',
  'finance-visionboard':  '/images/finance-visionboard.webp',
  'finance-about':        '/images/finance-about.webp',
  'finance-tutorial':     '/images/finance-tutorial.webp',
  'hero':                 '/images/hero.webp',
  'candlescope':          '/images/candlescope.webp',
}

// Stabile Referenz — kein Re-Render bei Consumern.
function img(key: string): string {
  return IMAGES[key] ?? ''
}

// ── Hook ──────────────────────────────────────────────────────────────────
export function useSiteImages(): {
  img: (key: string) => string
  loading: boolean
} {
  return { img, loading: false }
}
