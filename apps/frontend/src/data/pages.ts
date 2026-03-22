/* ============================================================
   CandleScope — Mockdaten
   src/data/pages.ts
   ============================================================ */

import type { Page } from '../types/page.types'

const ts = (date: string) => new Date(date).toISOString()

export const INITIAL_PAGES: Page[] = [
  {
    id: 'page-home', slug: '', title: 'Home',
    isSystem: true, published: true,
    nav: { label: 'Home', icon: 'Home', position: 0, visible: false },
    seo: { title: 'CandleScope — Trading & Technologie', description: 'WebDev · Finance · Gaming · Merch · Kurse.' },
    blocks: [{
      id: 'home-hero', type: 'hero', order: 0,
      props: {
        eyebrow: 'CandleScope', titleLine1: 'Trading &', titleLine2: 'Technologie',
        titleAccent: 'line2', theme: 'home', badge: 'Est. 2025',
        description: 'WebDev · Finance · Gaming · Merch · Kurse. Eine Marke von Chris Schubert.',
        ctas: [
          { label: 'Mehr erfahren', href: '/about', variant: 'primary' },
          { label: 'Finance entdecken', href: '/finance', variant: 'ghost' },
        ],
      },
    }],
    createdAt: ts('2025-01-01'), updatedAt: ts('2026-03-14'),
  },
  {
    id: 'page-finance', slug: 'finance', title: 'Finance',
    isSystem: false, published: true,
    nav: { label: 'Finance', icon: 'TrendingUp', position: 1, visible: true },
    seo: { title: 'Finance — CandleScope', description: 'Haushaltsbuch · Trading · DeFi · Krypto.' },
    blocks: [{
      id: 'finance-hero', type: 'hero', order: 0,
      props: {
        eyebrow: 'Finance', titleLine1: 'Märkte &', titleLine2: 'Tools',
        titleAccent: 'line2', theme: 'finance', badge: 'Haushaltsbuch verfügbar',
        description: 'Haushaltsbuch-Software · Trading · DeFi · Krypto · Anlageberatung auf Anfrage.',
        ctas: [
          { label: 'Haushaltsbuch kaufen', href: '#haushaltsbuch', variant: 'primary' },
          { label: 'Beratung anfragen', href: '/contact', variant: 'ghost' },
        ],
      },
    }],
    createdAt: ts('2025-01-01'), updatedAt: ts('2026-03-14'),
  },
  {
    id: 'page-dev', slug: 'dev', title: 'Dev & Web',
    isSystem: false, published: true,
    nav: { label: 'Dev & Web', icon: 'Code2', position: 2, visible: true },
    seo: { title: 'Dev & Web — CandleScope', description: 'Websites · Web-Apps · Open Source.' },
    blocks: [{
      id: 'dev-hero', type: 'hero', order: 0,
      props: {
        eyebrow: 'Dev & Web', titleLine1: 'Code &', titleLine2: 'Projekte',
        titleAccent: 'line2', theme: 'dev', badge: 'Open for work',
        description: 'Maßgeschneiderte Websites · Web-Apps · Open Source Projekte.',
        ctas: [
          { label: 'GitHub ansehen', href: 'https://github.com/SchubertChris', variant: 'primary' },
          { label: 'Projekt anfragen', href: '/contact', variant: 'ghost' },
        ],
      },
    }],
    createdAt: ts('2025-01-01'), updatedAt: ts('2026-03-14'),
  },
  {
    id: 'page-about', slug: 'about', title: 'About',
    isSystem: false, published: true,
    nav: { label: 'About', icon: 'User', position: 3, visible: true },
    seo: { title: 'About Chris Schubert — CandleScope' },
    blocks: [{
      id: 'about-hero', type: 'hero', order: 0,
      props: {
        eyebrow: 'About', titleLine1: 'Chris', titleLine2: 'Schubert',
        titleAccent: 'line2', theme: 'about',
        description: 'WebDev · Finance-Spezialist · Gamer · Unternehmer.',
        ctas: [
          { label: 'Kontakt aufnehmen', href: '/contact', variant: 'primary' },
          { label: 'GitHub', href: 'https://github.com/SchubertChris', variant: 'ghost' },
        ],
      },
    }],
    createdAt: ts('2025-01-01'), updatedAt: ts('2026-03-14'),
  },
  {
    id: 'page-community', slug: 'community', title: 'Community',
    isSystem: false, published: true,
    nav: { label: 'Community', icon: 'MessageSquare', position: 4, visible: true },
    seo: { title: 'Community — CandleScope' },
    blocks: [{
      id: 'community-hero', type: 'hero', order: 0,
      props: {
        eyebrow: 'Community', titleLine1: 'Discord &', titleLine2: 'Community',
        titleAccent: 'line2', theme: 'community', badge: 'Coming soon',
        description: 'Trading · Tech · Gaming · Austausch.',
        ctas: [{ label: 'Discord beitreten', href: 'https://discord.gg/', variant: 'primary' }],
      },
    }],
    createdAt: ts('2025-01-01'), updatedAt: ts('2026-03-14'),
  },
  {
    id: 'page-contact', slug: 'contact', title: 'Kontakt',
    isSystem: false, published: true,
    nav: { label: 'Kontakt', icon: 'Mail', position: 5, visible: true },
    seo: { title: 'Kontakt — CandleScope' },
    blocks: [{
      id: 'contact-hero', type: 'hero', order: 0,
      props: {
        eyebrow: 'Kontakt', titleLine1: 'Lass uns', titleLine2: 'reden',
        titleAccent: 'line2', theme: 'contact',
        description: 'Projekt · Kooperation · Beratung. Ich antworte innerhalb von 24 Stunden.',
        ctas: [{ label: 'E-Mail schreiben', href: 'mailto:hello@candlescope.de', variant: 'primary' }],
      },
    }],
    createdAt: ts('2025-01-01'), updatedAt: ts('2026-03-14'),
  },
  {
    id: 'page-impressum', slug: 'impressum', title: 'Impressum',
    isSystem: true, published: true,
    nav: { label: 'Impressum', icon: 'FileText', position: 99, visible: false },
    blocks: [{
      id: 'impressum-hero', type: 'hero', order: 0,
      props: {
        eyebrow: 'Rechtliches', titleLine1: 'Im-', titleLine2: 'pressum',
        titleAccent: 'line2', theme: 'default', description: 'Angaben gemäß § 5 TMG.', ctas: [],
      },
    }],
    createdAt: ts('2025-01-01'), updatedAt: ts('2026-03-14'),
  },
  {
    id: 'page-datenschutz', slug: 'datenschutz', title: 'Datenschutz',
    isSystem: true, published: true,
    nav: { label: 'Datenschutz', icon: 'Shield', position: 100, visible: false },
    blocks: [{
      id: 'datenschutz-hero', type: 'hero', order: 0,
      props: {
        eyebrow: 'Rechtliches', titleLine1: 'Daten-', titleLine2: 'schutz',
        titleAccent: 'line2', theme: 'default', description: 'Datenschutzerklärung gemäß DSGVO.', ctas: [],
      },
    }],
    createdAt: ts('2025-01-01'), updatedAt: ts('2026-03-14'),
  },
]

export function getNavPages(pages: Page[]) {
  return pages
    .filter(p => p.nav?.visible && p.published)
    .sort((a, b) => (a.nav?.position ?? 99) - (b.nav?.position ?? 99))
}

export function getPageBySlug(pages: Page[], slug: string): Page | undefined {
  return pages.find(p => p.slug === slug || (slug === '' && p.slug === ''))
}