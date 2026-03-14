/* ============================================================
   CandleScope — Page Builder Types
   src/types/page.types.ts

   Datenstruktur für Pages & Blöcke.
   Phase 1: Mockdaten in pages.ts
   Phase 2: identische Struktur — nur Quelle wechselt zu API
   ============================================================ */

import type { LucideIcon } from 'lucide-react'

/* ─── Hero Themes ──────────────────────────────────────────
   Jede Page hat ein thematisches SVG im Hintergrund.
   'default' fällt auf HomeBg zurück.
──────────────────────────────────────────────────────────── */
export type HeroTheme =
  | 'home'
  | 'finance'
  | 'dev'
  | 'about'
  | 'community'
  | 'contact'
  | 'default'

/* ─── Block Types ──────────────────────────────────────────
   Alle verfügbaren Block-Typen im Baukasten.
──────────────────────────────────────────────────────────── */
export type BlockType =
  | 'hero'        // ✅ Implementiert — PageHero Komponente
  | 'text'
  | 'card-grid'
  | 'list'
  | 'image'
  | 'stats'
  | 'cta-banner'
  | 'timeline'
  | 'divider'
  | 'embed'

/* ─── Block Props ──────────────────────────────────────────
   Typisierte Props je Block-Typ.
──────────────────────────────────────────────────────────── */

export interface HeroBlockProps {
  eyebrow: string
  titleLine1: string
  titleLine2: string
  titleAccent?: 'line1' | 'line2'
  description: string
  badge?: string
  theme?: HeroTheme
  ctas?: Array<{
    label: string
    href: string
    variant: 'primary' | 'ghost'
  }>
}

export interface TextBlockProps {
  content: string        // Markdown oder HTML
  alignment?: 'left' | 'center' | 'right'
  maxWidth?: 'sm' | 'md' | 'lg' | 'full'
}

export interface CardGridBlockProps {
  cols: 2 | 3 | 4
  cards: Array<{
    id: string
    title: string
    description: string
    icon?: string        // Lucide Icon Name
    href?: string
    badge?: string
  }>
}

export interface ListBlockProps {
  title?: string
  style?: 'bullet' | 'numbered' | 'icon' | 'check'
  items: Array<{
    id: string
    text: string
    subtext?: string
    icon?: string
  }>
}

export interface ImageBlockProps {
  src: string
  alt: string
  caption?: string
  layout?: 'full' | 'center' | 'left' | 'right'
  rounded?: boolean
}

export interface StatsBlockProps {
  items: Array<{
    id: string
    value: string       // z.B. "42+" oder "100k"
    label: string
    suffix?: string
  }>
}

export interface CtaBannerBlockProps {
  title: string
  description?: string
  buttonLabel: string
  buttonHref: string
  variant?: 'gold' | 'dark' | 'outline'
}

export interface TimelineBlockProps {
  title?: string
  items: Array<{
    id: string
    date: string
    title: string
    description: string
    status?: 'done' | 'active' | 'upcoming'
  }>
}

export interface DividerBlockProps {
  style?: 'line' | 'gold' | 'dots' | 'space'
  spacing?: 'sm' | 'md' | 'lg'
}

export interface EmbedBlockProps {
  url: string
  type: 'youtube' | 'vimeo' | 'iframe' | 'twitter'
  ratio?: '16/9' | '4/3' | '1/1'
  caption?: string
}

/* ─── Block Props Map ──────────────────────────────────────
   Verbindet BlockType mit den korrekten Props.
   Ermöglicht typsichere Verwendung im Editor.
──────────────────────────────────────────────────────────── */
export interface BlockPropsMap {
  'hero':       HeroBlockProps
  'text':       TextBlockProps
  'card-grid':  CardGridBlockProps
  'list':       ListBlockProps
  'image':      ImageBlockProps
  'stats':      StatsBlockProps
  'cta-banner': CtaBannerBlockProps
  'timeline':   TimelineBlockProps
  'divider':    DividerBlockProps
  'embed':      EmbedBlockProps
}

/* ─── Generic Block ────────────────────────────────────────
   Einzelner Block auf einer Seite.
──────────────────────────────────────────────────────────── */
export interface Block<T extends BlockType = BlockType> {
  id:        string
  type:      T
  props:     BlockPropsMap[T]
  order:     number
}

/* Untypisierte Variante für Rendering & Store */
export type AnyBlock = {
  [T in BlockType]: Block<T>
}[BlockType]

/* ─── Nav Item ─────────────────────────────────────────────
   Navigation-Eintrag für eine Seite.
──────────────────────────────────────────────────────────── */
export interface PageNavConfig {
  label:    string        // Anzeigename in Nav
  icon:     string        // Lucide Icon Name (z.B. 'TrendingUp')
  position: number        // Reihenfolge (1 = ganz links/oben)
  visible:  boolean       // In Nav anzeigen
}

/* ─── Page ─────────────────────────────────────────────────
   Eine vollständige Seite mit Blöcken.
──────────────────────────────────────────────────────────── */
export interface Page {
  id:         string
  slug:       string        // z.B. 'finance' → /finance
  title:      string        // Interner Name im Admin
  nav?:       PageNavConfig // Nav-Konfiguration
  isSystem:   boolean       // true = nicht löschbar (Impressum etc.)
  blocks:     AnyBlock[]
  seo?: {
    title?:       string
    description?: string
    ogImage?:     string
  }
  createdAt:  string        // ISO string
  updatedAt:  string
}

/* ─── Page Meta ────────────────────────────────────────────
   Leichtgewichtige Übersicht für Listen-Ansicht.
──────────────────────────────────────────────────────────── */
export type PageMeta = Pick<
  Page,
  'id' | 'slug' | 'title' | 'nav' | 'isSystem' | 'createdAt' | 'updatedAt'
>

/* ─── Block Config ─────────────────────────────────────────
   Metadaten je Block-Typ für den Editor (Picker, Labels).
──────────────────────────────────────────────────────────── */
export interface BlockConfig {
  type:        BlockType
  label:       string
  description: string
  icon:        string       // Lucide Icon Name
  category:    'content' | 'layout'
  defaultProps: BlockPropsMap[BlockType]
}

/* ─── Admin Store State ────────────────────────────────────
──────────────────────────────────────────────────────────── */
export interface AdminState {
  isAuthenticated: boolean
  pin:             string | null   // gehashter PIN in localStorage
  lastActivity:    number | null   // Timestamp für Auto-Logout
}

/* ─── Pages Store State ────────────────────────────────────
──────────────────────────────────────────────────────────── */
export interface PagesState {
  pages:          Page[]
  activePage:     Page | null
  isDirty:        boolean          // ungespeicherte Änderungen
  isSaving:       boolean
  selectedBlock:  string | null    // Block ID im Editor
}