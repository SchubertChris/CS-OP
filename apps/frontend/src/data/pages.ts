/* ============================================================
   CandleScope — Mockdaten
   src/data/pages.ts

   Phase 1: Alle Seiten als TypeScript-Objekte.
   Phase 2: Diese Datei wird durch API-Calls ersetzt.
   Die Datenstruktur bleibt identisch — kein Store-Umbau nötig.
   ============================================================ */

import type { Page } from '../types/page.types'

/* ─── Hilfsfunktion: ISO Timestamp ────────────────────────── */
const ts = (date: string) => new Date(date).toISOString()

/* ============================================================
   PAGES
   ============================================================ */
export const INITIAL_PAGES: Page[] = [

  /* ── Home ───────────────────────────────────────────────── */
  {
    id:       'page-home',
    slug:     '',           // Root → /
    title:    'Home',
    isSystem: true,
    nav: {
      label:    'Home',
      icon:     'Home',
      position: 0,
      visible:  false,      // kein Nav-Link — Logo führt zur Home
    },
    seo: {
      title:       'CandleScope — Trading & Technologie',
      description: 'WebDev · Finance · Gaming · Merch · Kurse. Eine Marke von Chris Schubert.',
    },
    blocks: [
      {
        id:    'home-hero',
        type:  'hero',
        order: 0,
        props: {
          eyebrow:     'CandleScope',
          titleLine1:  'Trading &',
          titleLine2:  'Technologie',
          titleAccent: 'line2',
          description: 'WebDev · Finance · Gaming · Merch · Kurse. Eine Marke. Alles unter einem Dach — gebaut von Chris Schubert.',
          badge:       'Est. 2025',
          theme:       'home',
          ctas: [
            { label: 'Mehr erfahren',     href: '/about',   variant: 'primary' },
            { label: 'Finance entdecken', href: '/finance', variant: 'ghost'   },
          ],
        },
      },
    ],
    createdAt: ts('2025-01-01'),
    updatedAt: ts('2026-03-14'),
  },

  /* ── Finance ─────────────────────────────────────────────── */
  {
    id:       'page-finance',
    slug:     'finance',
    title:    'Finance',
    isSystem: false,
    nav: {
      label:    'Finance',
      icon:     'TrendingUp',
      position: 1,
      visible:  true,
    },
    seo: {
      title:       'Finance — CandleScope',
      description: 'Haushaltsbuch · Trading · DeFi · Krypto · Anlageberatung auf Anfrage.',
    },
    blocks: [
      {
        id:    'finance-hero',
        type:  'hero',
        order: 0,
        props: {
          eyebrow:     'Finance',
          titleLine1:  'Märkte &',
          titleLine2:  'Tools',
          titleAccent: 'line2',
          description: 'Haushaltsbuch-Software · Trading · DeFi · Krypto · Anlageberatung auf Anfrage. Finanzielle Kontrolle beginnt mit den richtigen Werkzeugen.',
          badge:       'Haushaltsbuch verfügbar',
          theme:       'finance',
          ctas: [
            { label: 'Haushaltsbuch kaufen', href: '#haushaltsbuch', variant: 'primary' },
            { label: 'Beratung anfragen',    href: '/contact',       variant: 'ghost'   },
          ],
        },
      },
    ],
    createdAt: ts('2025-01-01'),
    updatedAt: ts('2026-03-14'),
  },

  /* ── Dev & Web ───────────────────────────────────────────── */
  {
    id:       'page-dev',
    slug:     'dev',
    title:    'Dev & Web',
    isSystem: false,
    nav: {
      label:    'Dev & Web',
      icon:     'Code2',
      position: 2,
      visible:  true,
    },
    seo: {
      title:       'Dev & Web — CandleScope',
      description: 'Maßgeschneiderte Websites · Web-Apps · Open Source Projekte.',
    },
    blocks: [
      {
        id:    'dev-hero',
        type:  'hero',
        order: 0,
        props: {
          eyebrow:     'Dev & Web',
          titleLine1:  'Code &',
          titleLine2:  'Projekte',
          titleAccent: 'line2',
          description: 'Maßgeschneiderte Websites · Web-Apps · Open Source Projekte. Sauberer Code, modernes Design, technisch stark.',
          badge:       'Open for work',
          theme:       'dev',
          ctas: [
            { label: 'GitHub ansehen',  href: 'https://github.com/SchubertChris', variant: 'primary' },
            { label: 'Projekt anfragen', href: '/contact', variant: 'ghost' },
          ],
        },
      },
    ],
    createdAt: ts('2025-01-01'),
    updatedAt: ts('2026-03-14'),
  },

  /* ── About ───────────────────────────────────────────────── */
  {
    id:       'page-about',
    slug:     'about',
    title:    'About',
    isSystem: false,
    nav: {
      label:    'About',
      icon:     'User',
      position: 3,
      visible:  true,
    },
    seo: {
      title:       'About Chris Schubert — CandleScope',
      description: 'WebDev · Finance-Spezialist · Gamer · Unternehmer.',
    },
    blocks: [
      {
        id:    'about-hero',
        type:  'hero',
        order: 0,
        props: {
          eyebrow:     'About',
          titleLine1:  'Chris',
          titleLine2:  'Schubert',
          titleAccent: 'line2',
          description: 'WebDev · Finance-Spezialist · Gamer · Unternehmer. Ich baue Dinge die funktionieren — und verstehe Märkte die andere meiden.',
          theme:       'about',
          ctas: [
            { label: 'Kontakt aufnehmen', href: '/contact',                      variant: 'primary' },
            { label: 'GitHub',            href: 'https://github.com/SchubertChris', variant: 'ghost' },
          ],
        },
      },
    ],
    createdAt: ts('2025-01-01'),
    updatedAt: ts('2026-03-14'),
  },

  /* ── Community ───────────────────────────────────────────── */
  {
    id:       'page-community',
    slug:     'community',
    title:    'Community',
    isSystem: false,
    nav: {
      label:    'Community',
      icon:     'MessageSquare',
      position: 4,
      visible:  true,
    },
    seo: {
      title:       'Community — CandleScope',
      description: 'Discord · Community · Events · Austausch.',
    },
    blocks: [
      {
        id:    'community-hero',
        type:  'hero',
        order: 0,
        props: {
          eyebrow:     'Community',
          titleLine1:  'Discord &',
          titleLine2:  'Community',
          titleAccent: 'line2',
          description: 'Trading · Tech · Gaming · Austausch. Werde Teil der CandleScope Community.',
          badge:       'Coming soon',
          theme:       'community',
          ctas: [
            { label: 'Discord beitreten', href: 'https://discord.gg/', variant: 'primary' },
          ],
        },
      },
    ],
    createdAt: ts('2025-01-01'),
    updatedAt: ts('2026-03-14'),
  },

  /* ── Kontakt ─────────────────────────────────────────────── */
  {
    id:       'page-contact',
    slug:     'contact',
    title:    'Kontakt',
    isSystem: false,
    nav: {
      label:    'Kontakt',
      icon:     'Mail',
      position: 5,
      visible:  true,
    },
    seo: {
      title:       'Kontakt — CandleScope',
      description: 'Projekt · Kooperation · Beratung · Einfach ein Gespräch.',
    },
    blocks: [
      {
        id:    'contact-hero',
        type:  'hero',
        order: 0,
        props: {
          eyebrow:     'Kontakt',
          titleLine1:  'Lass uns',
          titleLine2:  'reden',
          titleAccent: 'line2',
          description: 'Projekt · Kooperation · Beratung · Einfach ein Gespräch. Ich antworte innerhalb von 24 Stunden.',
          theme:       'contact',
          ctas: [
            { label: 'E-Mail schreiben', href: 'mailto:hello@candlescope.de', variant: 'primary' },
          ],
        },
      },
    ],
    createdAt: ts('2025-01-01'),
    updatedAt: ts('2026-03-14'),
  },

  /* ── Impressum (System) ──────────────────────────────────── */
  {
    id:       'page-impressum',
    slug:     'impressum',
    title:    'Impressum',
    isSystem: true,
    nav: {
      label:    'Impressum',
      icon:     'FileText',
      position: 99,
      visible:  false,    // nur im Footer
    },
    seo: {
      title: 'Impressum — CandleScope',
    },
    blocks: [
      {
        id:    'impressum-hero',
        type:  'hero',
        order: 0,
        props: {
          eyebrow:     'Rechtliches',
          titleLine1:  'Im-',
          titleLine2:  'pressum',
          titleAccent: 'line2',
          description: 'Angaben gemäß § 5 TMG.',
          theme:       'default',
          ctas: [],
        },
      },
    ],
    createdAt: ts('2025-01-01'),
    updatedAt: ts('2026-03-14'),
  },

  /* ── Datenschutz (System) ────────────────────────────────── */
  {
    id:       'page-datenschutz',
    slug:     'datenschutz',
    title:    'Datenschutz',
    isSystem: true,
    nav: {
      label:    'Datenschutz',
      icon:     'Shield',
      position: 100,
      visible:  false,    // nur im Footer
    },
    seo: {
      title: 'Datenschutz — CandleScope',
    },
    blocks: [
      {
        id:    'datenschutz-hero',
        type:  'hero',
        order: 0,
        props: {
          eyebrow:     'Rechtliches',
          titleLine1:  'Daten-',
          titleLine2:  'schutz',
          titleAccent: 'line2',
          description: 'Datenschutzerklärung gemäß DSGVO.',
          theme:       'default',
          ctas: [],
        },
      },
    ],
    createdAt: ts('2025-01-01'),
    updatedAt: ts('2026-03-14'),
  },
]

/* ─── Hilfsfunktionen ──────────────────────────────────────── */

/** Alle sichtbaren Nav-Seiten sortiert nach Position */
export function getNavPages(pages: Page[]) {
  return pages
    .filter(p => p.nav?.visible)
    .sort((a, b) => (a.nav?.position ?? 99) - (b.nav?.position ?? 99))
}

/** Seite nach Slug finden */
export function getPageBySlug(pages: Page[], slug: string): Page | undefined {
  return pages.find(p => p.slug === slug || (slug === '' && p.slug === ''))
}