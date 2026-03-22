/* ============================================================
   CandleScope — Page Builder Types
   src/types/page.types.ts
   ============================================================ */


export type HeroTheme =
  | 'home' | 'finance' | 'dev' | 'about'
  | 'community' | 'contact' | 'default'

export type BlockType =
  | 'hero' | 'text' | 'card-grid' | 'list'
  | 'image' | 'stats' | 'cta-banner'
  | 'timeline' | 'divider' | 'embed'

/* ─── Block Props ──────────────────────────────────────────── */
export interface HeroBlockProps {
  eyebrow: string
  titleLine1: string
  titleLine2: string
  titleAccent?: 'line1' | 'line2'
  description: string
  badge?: string
  theme?: HeroTheme
  ctas?: Array<{ label: string; href: string; variant: 'primary' | 'ghost' }>
}

export interface TextBlockProps {
  content: string
  alignment?: 'left' | 'center' | 'right'
  maxWidth?: 'sm' | 'md' | 'lg' | 'full'
}

export interface CardGridBlockProps {
  cols: 2 | 3 | 4
  cards: Array<{
    id: string; title: string; description: string
    icon?: string; href?: string; badge?: string
  }>
}

export interface ListBlockProps {
  title?: string
  style?: 'bullet' | 'numbered' | 'icon' | 'check'
  items: Array<{ id: string; text: string; subtext?: string; icon?: string }>
}

export interface ImageBlockProps {
  src: string; alt: string; caption?: string
  layout?: 'full' | 'center' | 'left' | 'right'
  rounded?: boolean
}

export interface StatsBlockProps {
  items: Array<{ id: string; value: string; label: string; suffix?: string }>
}

export interface CtaBannerBlockProps {
  title: string; description?: string
  buttonLabel: string; buttonHref: string
  variant?: 'gold' | 'dark' | 'outline'
}

export interface TimelineBlockProps {
  title?: string
  items: Array<{
    id: string; date: string; title: string
    description: string; status?: 'done' | 'active' | 'upcoming'
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

/* ─── Block Props Map ──────────────────────────────────────── */
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

export interface Block<T extends BlockType = BlockType> {
  id: string
  type: T
  props: BlockPropsMap[T]
  order: number
}

export type AnyBlock = { [T in BlockType]: Block<T> }[BlockType]

/* ─── Nav Config ───────────────────────────────────────────── */
export interface PageNavConfig {
  label:    string
  icon:     string
  position: number
  visible:  boolean
}

/* ─── Page ─────────────────────────────────────────────────── */
export interface Page {
  id:         string
  slug:       string
  title:      string
  nav?:       PageNavConfig
  isSystem:   boolean
  published:  boolean      // false = Entwurf, true = live auf Website
  blocks:     AnyBlock[]
  seo?: {
    title?:       string
    description?: string
    ogImage?:     string
  }
  createdAt:  string
  updatedAt:  string
}

export type PageMeta = Pick<
  Page, 'id' | 'slug' | 'title' | 'nav' | 'isSystem' | 'published' | 'createdAt' | 'updatedAt'
>

export interface BlockConfig {
  type:         BlockType
  label:        string
  description:  string
  icon:         string
  category:     'content' | 'layout'
  defaultProps: BlockPropsMap[BlockType]
}

export interface PagesState {
  pages:         Page[]
  activePage:    Page | null
  isDirty:       boolean
  isSaving:      boolean
  selectedBlock: string | null
}