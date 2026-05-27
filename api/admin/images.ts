import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAdmin } from '../_lib/auth'
import { setCorsHeaders } from '../_lib/cors'
import { sql } from '../_lib/db'

// ── Admin-Endpunkt: /api/admin/images ──────────────────────────────────────
// GET  → alle Bilder auflisten (key, url, label, updated_at)
// PATCH → { key, url } → URL eines Bildes aktualisieren

const SEED: Array<{ key: string; url: string; label: string }> = [
  { key: 'home-preview',        url: '/images/home-preview.webp',        label: 'Homepage Vorschau (FinanceBoard)' },
  { key: 'about-chris',         url: '/images/about-chris.webp',         label: 'Chris Schubert Foto' },
  { key: 'shopray-shop',        url: '/images/shopray-shop.webp',        label: 'ShopRay – Shop-Ansicht' },
  { key: 'shopray-admin',       url: '/images/shopray-admin.webp',       label: 'ShopRay – Admin-Dashboard' },
  { key: 'shopray-collections', url: '/images/shopray-collections.webp', label: 'ShopRay – Kollektionen' },
  { key: 'shopray-account',     url: '/images/shopray-account.webp',     label: 'ShopRay – Kundenprofil' },
  { key: 'shopray-wishlist',    url: '/images/shopray-wishlist.webp',    label: 'ShopRay – Wunschliste' },
  { key: 'finance-yearly',      url: '/images/finance-yearly.webp',      label: 'FinanceBoard – Jahresübersicht' },
  { key: 'finance-archive',     url: '/images/finance-archive.webp',     label: 'FinanceBoard – Archiv' },
  { key: 'finance-goals',       url: '/images/finance-goals.webp',       label: 'FinanceBoard – Sparziele' },
  { key: 'finance-transactions',url: '/images/finance-transactions.webp',label: 'FinanceBoard – Transaktionen' },
  { key: 'finance-modals',      url: '/images/finance-modals.webp',      label: 'FinanceBoard – Modals' },
  { key: 'finance-visionboard', url: '/images/finance-visionboard.webp', label: 'FinanceBoard – VisionBoard' },
  { key: 'finance-about',       url: '/images/finance-about.webp',       label: 'FinanceBoard – Über die App' },
  { key: 'finance-tutorial',    url: '/images/finance-tutorial.webp',    label: 'FinanceBoard – Tutorial' },
  { key: 'hero',                url: '/images/hero.webp',                label: 'Hero-Bild allgemein' },
  { key: 'candlescope',         url: '/images/candlescope.webp',         label: 'CandleScope allgemein' },
]

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const admin = await requireAdmin(req, res)
  if (!admin) return

  // ── GET: alle Bilder listen ──────────────────────────────────────────────
  if (req.method === 'GET') {
    const rows = await sql`SELECT key, url, label, updated_at FROM site_images ORDER BY key`
    return res.status(200).json(rows)
  }

  // ── POST: Seed — Initialdaten einspielen ────────────────────────────────
  if (req.method === 'POST' && (req.query.action === 'seed')) {
    await sql`
      CREATE TABLE IF NOT EXISTS site_images (
        key        TEXT PRIMARY KEY,
        url        TEXT NOT NULL,
        label      TEXT NOT NULL DEFAULT '',
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    for (const img of SEED) {
      await sql`
        INSERT INTO site_images (key, url, label)
        VALUES (${img.key}, ${img.url}, ${img.label})
        ON CONFLICT (key) DO NOTHING
      `
    }
    const rows = await sql`SELECT key, url, label, updated_at FROM site_images ORDER BY key`
    return res.status(200).json({ seeded: true, rows })
  }

  // ── PATCH: URL eines Bildes aktualisieren ───────────────────────────────
  if (req.method === 'PATCH') {
    const { key, url } = req.body ?? {}
    if (!key || typeof key !== 'string')  return res.status(400).json({ error: 'key fehlt' })
    if (!url || typeof url !== 'string')  return res.status(400).json({ error: 'url fehlt' })
    if (!url.startsWith('http') && !url.startsWith('/')) {
      return res.status(400).json({ error: 'url muss mit http oder / beginnen' })
    }

    const rows = await sql`
      UPDATE site_images
      SET url = ${url}, updated_at = NOW()
      WHERE key = ${key}
      RETURNING key, url, label, updated_at
    `
    if (!rows.length) return res.status(404).json({ error: `Bild "${key}" nicht gefunden` })
    return res.status(200).json(rows[0])
  }

  return res.status(405).end()
}
