/* ============================================================
   CandleScope — Selected Work (Landingpage)
   src/data/cases.ts

   Vier Produkte, vier Disziplinen. imageKey wird zur Laufzeit
   über useSiteImages().img() aufgelöst. null = stilvoller
   Platzhalter-Frame (Produkt existiert noch nicht als Screenshot).
   ============================================================ */

export interface CaseStat {
  value: number
  suffix?: string
  label: string
}

export interface CaseStudy {
  id: string
  index: string
  name: string
  discipline: string
  tagline: string
  imageKey: string | null
  frameLabel: string
  tech: string[]
  problem: string
  solution: string
  result: string
  stats: CaseStat[]
  href: string
  external?: boolean
  status?: string
}

export const CASES: CaseStudy[] = [
  {
    id: 'vaultbox',
    index: '01',
    name: 'VaultBox',
    discipline: 'Finanz',
    tagline: 'Privacy-First Finanz-Tresor für den Desktop.',
    imageKey: 'finance-yearly',
    frameLabel: 'Desktop',
    tech: ['Electron', 'TypeScript', 'SQLite', 'Argon2id'],
    problem: 'Finanz-Tools zwingen in die Cloud und monetarisieren sensible Daten.',
    solution: 'Offline-Desktop-App mit Zero-Knowledge-Verschlüsselung und FIFO-Krypto-Steuer-Engine.',
    result: 'Komplett offline, Zero-Knowledge (AES-256-GCM / Argon2id), eigene FIFO-Steuer-Engine.',
    stats: [
      { value: 100, suffix: '%', label: 'offline' },
      { value: 256, label: 'Bit AES-GCM' },
    ],
    href: '/dev',
    status: 'Live',
  },
  {
    id: 'shopray-crm',
    index: '02',
    name: 'ShopRay · CRM & Admin',
    discipline: 'CRM',
    tagline: 'Vollwertiges Admin- & CRM-System hinter dem Shop.',
    imageKey: 'shopray-admin',
    frameLabel: 'Admin',
    tech: ['React 19', 'Node', 'Supabase', 'Stripe'],
    problem: 'Shop-Betreiber jonglieren Kunden, Bestellungen und Produkte über mehrere Tools.',
    solution: 'Ein integriertes Admin-/CRM-Panel: Kunden, Bestellungen, Produkte, Rollen — alles an einem Ort.',
    result: 'Kundenverwaltung, Bestell-Pipeline, Produkt-CRUD, Rollen & Rechte, Live-Statistiken.',
    stats: [
      { value: 60, suffix: '+', label: 'API-Routen' },
      { value: 8, label: 'CRM-Module' },
    ],
    href: '/shopray',
    status: 'Live',
  },
  {
    id: 'shopray',
    index: '03',
    name: 'ShopRay · Storefront',
    discipline: 'Commerce',
    tagline: 'Verkaufsfertiges Shop-Frontend in einem Deploy.',
    imageKey: 'shopray-shop',
    frameLabel: 'Commerce',
    tech: ['React 19', 'Node', 'Supabase', 'Stripe'],
    problem: 'Fertige, sichere Shop-Templates kosten Unsummen.',
    solution: 'Komplettes Shop-Frontend mit Checkout, Stripe und DSGVO-Rechnungen.',
    result: 'Storefront, Checkout, Stripe integriert, DSGVO-konform, Vercel-ready.',
    stats: [
      { value: 30, suffix: '+', label: 'Seiten' },
      { value: 60, suffix: '+', label: 'API-Routen' },
    ],
    href: '/shopray',
    status: 'Live',
  },
  {
    id: 'sentinel',
    index: '04',
    name: 'CandleScope Sentinel',
    discipline: 'Security',
    tagline: 'Security-Cockpit für den Desktop.',
    imageKey: 'sentinel',
    frameLabel: 'Security',
    tech: ['Tauri v2', 'Rust', 'React'],
    problem: 'Sicherheits-Status verstreut und unsichtbar.',
    solution: 'Desktop-Tool mit Live-Security-Checks, Tray und Verlaufs-Score.',
    result: 'Live-Check-Kategorien, Tray + Notifications, Installer (.msi/.exe), i18n DE/EN.',
    stats: [
      { value: 6, label: 'Check-Kategorien' },
    ],
    href: '/dev',
    status: 'In Entwicklung',
  },
]
