import { useEffect, useState } from 'react'

// ── Fallback-URLs (public/images/ — immer verfügbar) ──────────────────────
const DEFAULTS: Record<string, string> = {
  'home-preview':         '/images/home-preview.webp',
  'about-chris':          '/images/about-chris.webp',
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

// ── Singleton-Cache — API nur einmal pro Page-Load fetchen ─────────────────
let _cache: Record<string, string> | null = null
let _pending: Promise<Record<string, string>> | null = null

async function fetchImages(): Promise<Record<string, string>> {
  if (_cache) return _cache
  if (_pending) return _pending

  _pending = fetch('/api/images')
    .then(r => r.ok ? r.json() : {})
    .then((data: Record<string, string>) => {
      _cache = { ...DEFAULTS, ...data }
      _pending = null
      return _cache
    })
    .catch(() => {
      _pending = null
      return DEFAULTS
    })

  return _pending
}

// ── Hook ──────────────────────────────────────────────────────────────────
export function useSiteImages(): {
  img: (key: string) => string
  loading: boolean
} {
  const [images, setImages] = useState<Record<string, string>>(_cache ?? DEFAULTS)
  const [loading, setLoading] = useState(!_cache)

  useEffect(() => {
    if (_cache) return
    fetchImages().then(map => {
      setImages(map)
      setLoading(false)
    })
  }, [])

  return {
    /** Gibt die URL für einen Image-Key zurück. Fallback = lokaler Pfad. */
    img: (key: string) => images[key] ?? DEFAULTS[key] ?? '',
    loading,
  }
}
