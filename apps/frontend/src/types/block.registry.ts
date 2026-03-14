/* ============================================================
   CandleScope — Block Registry
   src/types/block.registry.ts

   Metadaten je Block-Typ für den Editor-Picker.
   Default-Props werden beim Hinzufügen eines neuen Blocks
   als Startbelegung verwendet.
   ============================================================ */

import type { BlockConfig } from './page.types'

export const BLOCK_REGISTRY: BlockConfig[] = [
  /* ── Content Blöcke ──────────────────────────────────── */
  {
    type:        'hero',
    label:       'Hero',
    description: 'Großer Einstiegsbereich mit Titel, Beschreibung und CTA',
    icon:        'Sparkles',
    category:    'content',
    defaultProps: {
      eyebrow:     'Abschnitt',
      titleLine1:  'Dein Titel',
      titleLine2:  'Hier',
      titleAccent: 'line2',
      description: 'Kurze Beschreibung des Bereichs.',
      theme:       'default',
      ctas: [
        { label: 'Mehr erfahren', href: '#', variant: 'primary' },
      ],
    },
  },
  {
    type:        'text',
    label:       'Text',
    description: 'Fließtext, Markdown-Unterstützung',
    icon:        'AlignLeft',
    category:    'content',
    defaultProps: {
      content:   '## Überschrift\n\nDein Text hier...',
      alignment: 'left',
      maxWidth:  'md',
    },
  },
  {
    type:        'card-grid',
    label:       'Card Grid',
    description: 'Raster aus Karten — 2, 3 oder 4 Spalten',
    icon:        'LayoutGrid',
    category:    'content',
    defaultProps: {
      cols: 3,
      cards: [
        { id: 'c1', title: 'Titel', description: 'Beschreibung der Karte.', icon: 'Star' },
        { id: 'c2', title: 'Titel', description: 'Beschreibung der Karte.', icon: 'Star' },
        { id: 'c3', title: 'Titel', description: 'Beschreibung der Karte.', icon: 'Star' },
      ],
    },
  },
  {
    type:        'list',
    label:       'Liste',
    description: 'Auflistung mit Icons, Bullets oder Nummern',
    icon:        'List',
    category:    'content',
    defaultProps: {
      title: 'Liste',
      style: 'check',
      items: [
        { id: 'l1', text: 'Erster Punkt' },
        { id: 'l2', text: 'Zweiter Punkt' },
        { id: 'l3', text: 'Dritter Punkt' },
      ],
    },
  },
  {
    type:        'image',
    label:       'Bild',
    description: 'Einzelnes Bild mit optionaler Bildunterschrift',
    icon:        'Image',
    category:    'content',
    defaultProps: {
      src:     '',
      alt:     '',
      caption: '',
      layout:  'full',
      rounded: true,
    },
  },
  {
    type:        'stats',
    label:       'Stats',
    description: 'Kennzahlen und Zahlen prominent darstellen',
    icon:        'BarChart2',
    category:    'content',
    defaultProps: {
      items: [
        { id: 's1', value: '42+',  label: 'Projekte' },
        { id: 's2', value: '5',    label: 'Jahre Erfahrung' },
        { id: 's3', value: '100%', label: 'Zufriedenheit' },
      ],
    },
  },
  {
    type:        'timeline',
    label:       'Timeline',
    description: 'Zeitstrahl für Erfahrungen, Roadmap oder Geschichte',
    icon:        'GitBranch',
    category:    'content',
    defaultProps: {
      title: 'Timeline',
      items: [
        { id: 't1', date: '2024', title: 'Erster Eintrag', description: 'Beschreibung.', status: 'done' },
        { id: 't2', date: '2025', title: 'Zweiter Eintrag', description: 'Beschreibung.', status: 'active' },
        { id: 't3', date: '2026', title: 'Dritter Eintrag', description: 'Beschreibung.', status: 'upcoming' },
      ],
    },
  },
  {
    type:        'embed',
    label:       'Embed',
    description: 'YouTube, Vimeo oder beliebige iFrames',
    icon:        'Play',
    category:    'content',
    defaultProps: {
      url:   '',
      type:  'youtube',
      ratio: '16/9',
    },
  },

  /* ── Layout Blöcke ───────────────────────────────────── */
  {
    type:        'cta-banner',
    label:       'CTA Banner',
    description: 'Voller Aufruf zum Handeln mit Button',
    icon:        'Megaphone',
    category:    'layout',
    defaultProps: {
      title:       'Bereit loszulegen?',
      description: 'Kurze, überzeugende Beschreibung.',
      buttonLabel: 'Jetzt starten',
      buttonHref:  '/contact',
      variant:     'gold',
    },
  },
  {
    type:        'divider',
    label:       'Divider',
    description: 'Trennlinie oder Abstandshalter',
    icon:        'Minus',
    category:    'layout',
    defaultProps: {
      style:   'gold',
      spacing: 'md',
    },
  },
]

/* Hilfsfunktion: Block-Config nach Typ abrufen */
export function getBlockConfig(type: string): BlockConfig | undefined {
  return BLOCK_REGISTRY.find(b => b.type === type)
}

/* Blöcke nach Kategorie gruppiert */
export const CONTENT_BLOCKS = BLOCK_REGISTRY.filter(b => b.category === 'content')
export const LAYOUT_BLOCKS  = BLOCK_REGISTRY.filter(b => b.category === 'layout')