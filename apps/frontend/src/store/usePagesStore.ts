/* ============================================================
   CandleScope — Pages Store
   src/store/usePagesStore.ts
   ============================================================ */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { Page, AnyBlock, BlockType } from '../types/page.types'
import { INITIAL_PAGES, getNavPages, getPageBySlug } from '../data/pages'
import { getBlockConfig } from '../types/block.registry'

interface PagesStore {
  pages:         Page[]
  activePage:    Page | null
  isDirty:       boolean
  isSaving:      boolean
  selectedBlock: string | null

  loadPages:        ()                                                                              => void
  getNavPages:      ()                                                                              => Page[]
  getPageBySlug:    (slug: string)                                                                  => Page | undefined
  setActivePage:    (pageId: string)                                                                => void
  clearActivePage:  ()                                                                              => void
  createPage:       (data: CreatePageInput)                                                         => Page
  updatePage:       (pageId: string, data: Partial<Pick<Page, 'title' | 'slug' | 'nav' | 'seo'>>) => void
  publishPage:      (pageId: string)                                                                => void
  unpublishPage:    (pageId: string)                                                                => void
  deletePage:       (pageId: string)                                                                => void
  toggleNavVisible: (pageId: string)                                                                => void
  addBlock:         (pageId: string, type: BlockType, afterBlockId?: string)                       => AnyBlock
  updateBlock:      (pageId: string, blockId: string, props: Record<string, unknown>)              => void
  deleteBlock:      (pageId: string, blockId: string)                                              => void
  moveBlockUp:      (pageId: string, blockId: string)                                              => void
  moveBlockDown:    (pageId: string, blockId: string)                                              => void
  duplicateBlock:   (pageId: string, blockId: string)                                              => void
  selectBlock:      (blockId: string | null)                                                        => void
  saveActive:       ()                                                                              => void
}

interface CreatePageInput {
  title:        string
  slug:         string
  navLabel?:    string
  navIcon?:     string
  navPosition?: number
  showInNav?:   boolean
}

function reorder(blocks: AnyBlock[]): AnyBlock[] {
  return blocks.map((b, i) => ({ ...b, order: i }))
}

function updatePagesArray(pages: Page[], pageId: string, updater: (p: Page) => Page): Page[] {
  return pages.map(p => p.id === pageId ? updater(p) : p)
}

export const usePagesStore = create<PagesStore>()(
  devtools(
    persist(
      (set, get) => ({

        pages:         [],
        activePage:    null,
        isDirty:       false,
        isSaving:      false,
        selectedBlock: null,

        /* ── Laden ──────────────────────────────────────── */
        loadPages: () => {
          if (get().pages.length === 0) {
            set({ pages: INITIAL_PAGES }, false, 'loadPages')
          }
        },

        getNavPages:   () => getNavPages(get().pages),
        getPageBySlug: (slug) => getPageBySlug(get().pages, slug),

        setActivePage: (pageId) => {
          const page = get().pages.find(p => p.id === pageId) ?? null
          set({ activePage: page, selectedBlock: null, isDirty: false }, false, 'setActivePage')
        },

        clearActivePage: () => {
          set({ activePage: null, selectedBlock: null, isDirty: false }, false, 'clearActivePage')
        },

        /* ── Seite erstellen (mit Hero Default) ─────────── */
        createPage: (data) => {
          const heroConfig = getBlockConfig('hero')!
          const heroBlock: AnyBlock = {
            id:    `block-${nanoid(8)}`,
            type:  'hero',
            order: 0,
            props: {
              ...heroConfig.defaultProps,
              eyebrow:     data.navLabel ?? data.title,
              titleLine1:  data.title,
              titleLine2:  'Titel',
              titleAccent: 'line2' as const,
              theme:       'default' as const,
            } as never,
          }

          const newPage: Page = {
            id:        `page-${nanoid(8)}`,
            slug:      data.slug,
            title:     data.title,
            isSystem:  false,
            published: false,        // ← Entwurf by default
            nav: {
              label:    data.navLabel    ?? data.title,
              icon:     data.navIcon     ?? 'FileText',
              position: data.navPosition ?? get().pages.length,
              visible:  data.showInNav   ?? false,
            },
            blocks:    [heroBlock],  // ← Hero automatisch
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }

          set(state => ({ pages: [...state.pages, newPage] }), false, 'createPage')
          return newPage
        },

        /* ── Seite updaten ──────────────────────────────── */
        updatePage: (pageId, data) => {
          set(
            state => ({
              pages: updatePagesArray(state.pages, pageId, p => ({
                ...p, ...data,
                nav:       data.nav ? { ...p.nav!, ...data.nav } : p.nav,
                updatedAt: new Date().toISOString(),
              })),
              isDirty: true,
            }),
            false, 'updatePage'
          )
        },

        /* ── Publizieren / Depublizieren ────────────────── */
        publishPage: (pageId) => {
          set(
            state => ({
              pages: updatePagesArray(state.pages, pageId, p => ({
                ...p, published: true, updatedAt: new Date().toISOString(),
              })),
            }),
            false, 'publishPage'
          )
        },

        unpublishPage: (pageId) => {
          set(
            state => ({
              pages: updatePagesArray(state.pages, pageId, p => ({
                ...p, published: false, updatedAt: new Date().toISOString(),
              })),
            }),
            false, 'unpublishPage'
          )
        },

        /* ── Seite löschen ──────────────────────────────── */
        deletePage: (pageId) => {
          const page = get().pages.find(p => p.id === pageId)
          if (page?.isSystem) return
          set(
            state => ({
              pages:      state.pages.filter(p => p.id !== pageId),
              activePage: state.activePage?.id === pageId ? null : state.activePage,
            }),
            false, 'deletePage'
          )
        },

        toggleNavVisible: (pageId) => {
          set(
            state => ({
              pages: updatePagesArray(state.pages, pageId, p => ({
                ...p,
                nav: p.nav ? { ...p.nav, visible: !p.nav.visible } : p.nav,
                updatedAt: new Date().toISOString(),
              })),
            }),
            false, 'toggleNavVisible'
          )
        },

        /* ── Block hinzufügen ───────────────────────────── */
        addBlock: (pageId, type, afterBlockId) => {
          const config = getBlockConfig(type)
          if (!config) throw new Error(`Unknown block type: ${type}`)

          const newBlock = {
            id:    `block-${nanoid(8)}`,
            type,
            order: 0,
            props: config.defaultProps,
          } as AnyBlock

          set(
            state => ({
              pages: updatePagesArray(state.pages, pageId, p => {
                const blocks = [...p.blocks]
                if (afterBlockId) {
                  const idx = blocks.findIndex(b => b.id === afterBlockId)
                  blocks.splice(idx + 1, 0, newBlock)
                } else {
                  blocks.push(newBlock)
                }
                return { ...p, blocks: reorder(blocks), updatedAt: new Date().toISOString() }
              }),
              isDirty: true,
            }),
            false, 'addBlock'
          )
          return newBlock
        },

        /* ── Block updaten ──────────────────────────────── */
        updateBlock: (pageId, blockId, props) => {
          set(
            state => ({
              pages: updatePagesArray(state.pages, pageId, p => ({
                ...p,
                blocks: p.blocks.map(b =>
                  b.id === blockId
                    ? ({ ...b, props: { ...(b.props as Record<string, unknown>), ...props } } as AnyBlock)
                    : b
                ),
                updatedAt: new Date().toISOString(),
              })),
              isDirty: true,
            }),
            false, 'updateBlock'
          )
        },

        deleteBlock: (pageId, blockId) => {
          set(
            state => ({
              pages: updatePagesArray(state.pages, pageId, p => ({
                ...p,
                blocks: reorder(p.blocks.filter(b => b.id !== blockId)),
                updatedAt: new Date().toISOString(),
              })),
              selectedBlock: state.selectedBlock === blockId ? null : state.selectedBlock,
              isDirty: true,
            }),
            false, 'deleteBlock'
          )
        },

        moveBlockUp: (pageId, blockId) => {
          set(
            state => ({
              pages: updatePagesArray(state.pages, pageId, p => {
                const blocks = [...p.blocks]
                const idx = blocks.findIndex(b => b.id === blockId)
                if (idx <= 0) return p
                ;[blocks[idx - 1], blocks[idx]] = [blocks[idx], blocks[idx - 1]]
                return { ...p, blocks: reorder(blocks), updatedAt: new Date().toISOString() }
              }),
              isDirty: true,
            }),
            false, 'moveBlockUp'
          )
        },

        moveBlockDown: (pageId, blockId) => {
          set(
            state => ({
              pages: updatePagesArray(state.pages, pageId, p => {
                const blocks = [...p.blocks]
                const idx = blocks.findIndex(b => b.id === blockId)
                if (idx >= blocks.length - 1) return p
                ;[blocks[idx], blocks[idx + 1]] = [blocks[idx + 1], blocks[idx]]
                return { ...p, blocks: reorder(blocks), updatedAt: new Date().toISOString() }
              }),
              isDirty: true,
            }),
            false, 'moveBlockDown'
          )
        },

        duplicateBlock: (pageId, blockId) => {
          set(
            state => ({
              pages: updatePagesArray(state.pages, pageId, p => {
                const blocks = [...p.blocks]
                const idx = blocks.findIndex(b => b.id === blockId)
                if (idx === -1) return p
                const original = blocks[idx]
                const copy = {
                  ...original,
                  id:    `block-${nanoid(8)}`,
                  props: { ...(original.props as Record<string, unknown>) },
                } as AnyBlock
                blocks.splice(idx + 1, 0, copy)
                return { ...p, blocks: reorder(blocks), updatedAt: new Date().toISOString() }
              }),
              isDirty: true,
            }),
            false, 'duplicateBlock'
          )
        },

        selectBlock: (blockId) => set({ selectedBlock: blockId }, false, 'selectBlock'),

        /* ── Manuell speichern (setzt isDirty auf false) ── */
        saveActive: () => {
          set({ isDirty: false, isSaving: false }, false, 'saveActive')
          /* Phase 2: hier API-Call → POST /api/pages/:id */
        },
      }),

      {
        name:    'candlescope-pages-v2',
        version: 2,
        /* Auto-Save: pages immer persistiert → jede Änderung
           wird automatisch in localStorage gesichert        */
        partialize: (state) => ({ pages: state.pages }),
      }
    ),
    { name: 'PagesStore' }
  )
)