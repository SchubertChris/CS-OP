/* ============================================================
   CandleScope — Pages Store
   src/store/usePagesStore.ts

   Verwaltet alle Seiten und Blöcke.
   Phase 1: Daten aus INITIAL_PAGES (Mockdaten)
   Phase 2: API-Calls ersetzen loadPages() — Rest bleibt gleich
   ============================================================ */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { Page, AnyBlock, BlockType, PagesState } from '../types/page.types'
import { INITIAL_PAGES, getNavPages, getPageBySlug } from '../data/pages'
import { getBlockConfig } from '../types/block.registry'

/* ─── Store Interface ──────────────────────────────────────── */
interface PagesStore extends PagesState {

  /* ── Seiten ─────────────────────────────────────────────── */
  loadPages:        ()                              => void
  getNavPages:      ()                              => Page[]
  getPageBySlug:    (slug: string)                  => Page | undefined
  setActivePage:    (pageId: string)                => void
  clearActivePage:  ()                              => void

  createPage:       (data: CreatePageInput)         => Page
  updatePage:       (pageId: string, data: Partial<Pick<Page, 'title' | 'slug' | 'nav' | 'seo'>>) => void
  deletePage:       (pageId: string)                => void
  toggleNavVisible: (pageId: string)                => void

  /* ── Blöcke ─────────────────────────────────────────────── */
  addBlock:         (pageId: string, type: BlockType, afterBlockId?: string) => AnyBlock
  updateBlock:      (pageId: string, blockId: string, props: Record<string, unknown>) => void
  deleteBlock:      (pageId: string, blockId: string)                       => void
  moveBlockUp:      (pageId: string, blockId: string)                       => void
  moveBlockDown:    (pageId: string, blockId: string)                       => void
  duplicateBlock:   (pageId: string, blockId: string)                       => void

  /* ── Editor UI ──────────────────────────────────────────── */
  selectBlock:      (blockId: string | null)        => void
  markSaved:        ()                              => void
}

/* ─── Input Types ──────────────────────────────────────────── */
interface CreatePageInput {
  title:       string
  slug:        string
  navLabel?:   string
  navIcon?:    string
  navPosition?: number
  showInNav?:  boolean
}

/* ─── Helpers ──────────────────────────────────────────────── */
function reorder(blocks: AnyBlock[]): AnyBlock[] {
  return blocks.map((b, i) => ({ ...b, order: i }))
}

function updatePagesArray(pages: Page[], pageId: string, updater: (p: Page) => Page): Page[] {
  return pages.map(p => p.id === pageId ? updater(p) : p)
}

/* ─── Store ────────────────────────────────────────────────── */
export const usePagesStore = create<PagesStore>()(
  devtools(
    persist(
      (set, get) => ({

        /* ── Initial State ──────────────────────────────────── */
        pages:         [],
        activePage:    null,
        isDirty:       false,
        isSaving:      false,
        selectedBlock: null,

        /* ── Seiten laden ───────────────────────────────────── */
        loadPages: () => {
          const { pages } = get()
          // Nur laden wenn noch leer (persist hat ggf. schon Daten)
          if (pages.length === 0) {
            set({ pages: INITIAL_PAGES }, false, 'loadPages')
          }
        },

        /* ── Nav Seiten abrufen ─────────────────────────────── */
        getNavPages: () => getNavPages(get().pages),

        /* ── Seite nach Slug ────────────────────────────────── */
        getPageBySlug: (slug) => getPageBySlug(get().pages, slug),

        /* ── Aktive Seite setzen ────────────────────────────── */
        setActivePage: (pageId) => {
          const page = get().pages.find(p => p.id === pageId) ?? null
          set({ activePage: page, selectedBlock: null, isDirty: false }, false, 'setActivePage')
        },

        clearActivePage: () => {
          set({ activePage: null, selectedBlock: null, isDirty: false }, false, 'clearActivePage')
        },

        /* ── Seite erstellen ────────────────────────────────── */
        createPage: (data) => {
          const newPage: Page = {
            id:       `page-${nanoid(8)}`,
            slug:     data.slug,
            title:    data.title,
            isSystem: false,
            nav: {
              label:    data.navLabel    ?? data.title,
              icon:     data.navIcon     ?? 'FileText',
              position: data.navPosition ?? get().pages.length,
              visible:  data.showInNav   ?? true,
            },
            blocks:    [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          set(
            state => ({ pages: [...state.pages, newPage] }),
            false,
            'createPage'
          )
          return newPage
        },

        /* ── Seite updaten ──────────────────────────────────── */
        updatePage: (pageId, data) => {
          set(
            state => ({
              pages: updatePagesArray(state.pages, pageId, p => ({
                ...p,
                ...data,
                nav: data.nav ? { ...p.nav!, ...data.nav } : p.nav,
                updatedAt: new Date().toISOString(),
              })),
            }),
            false,
            'updatePage'
          )
        },

        /* ── Seite löschen ──────────────────────────────────── */
        deletePage: (pageId) => {
          const page = get().pages.find(p => p.id === pageId)
          if (page?.isSystem) {
            console.warn('System-Seiten können nicht gelöscht werden.')
            return
          }
          set(
            state => ({
              pages:      state.pages.filter(p => p.id !== pageId),
              activePage: state.activePage?.id === pageId ? null : state.activePage,
            }),
            false,
            'deletePage'
          )
        },

        /* ── Nav Toggle ─────────────────────────────────────── */
        toggleNavVisible: (pageId) => {
          set(
            state => ({
              pages: updatePagesArray(state.pages, pageId, p => ({
                ...p,
                nav: p.nav ? { ...p.nav, visible: !p.nav.visible } : p.nav,
                updatedAt: new Date().toISOString(),
              })),
            }),
            false,
            'toggleNavVisible'
          )
        },

        /* ── Block hinzufügen ───────────────────────────────── */
        addBlock: (pageId, type, afterBlockId) => {
          const config = getBlockConfig(type)
          if (!config) throw new Error(`Unknown block type: ${type}`)

          const newBlock: AnyBlock = {
            id:    `block-${nanoid(8)}`,
            type,
            order: 0,
            props: config.defaultProps as never,
          }

          set(
            state => ({
              pages: updatePagesArray(state.pages, pageId, p => {
                let blocks = [...p.blocks]

                if (afterBlockId) {
                  const idx = blocks.findIndex(b => b.id === afterBlockId)
                  blocks.splice(idx + 1, 0, newBlock)
                } else {
                  blocks.push(newBlock)
                }

                return {
                  ...p,
                  blocks:    reorder(blocks),
                  updatedAt: new Date().toISOString(),
                }
              }),
              isDirty: true,
            }),
            false,
            'addBlock'
          )

          return newBlock
        },

        /* ── Block Props updaten ────────────────────────────── */
        updateBlock: (pageId, blockId, props) => {
          set(
            state => ({
              pages: updatePagesArray(state.pages, pageId, p => ({
                ...p,
                blocks: p.blocks.map(b =>
                  b.id === blockId
                    ? { ...b, props: { ...b.props, ...props } }
                    : b
                ),
                updatedAt: new Date().toISOString(),
              })),
              isDirty: true,
            }),
            false,
            'updateBlock'
          )
        },

        /* ── Block löschen ──────────────────────────────────── */
        deleteBlock: (pageId, blockId) => {
          set(
            state => ({
              pages: updatePagesArray(state.pages, pageId, p => ({
                ...p,
                blocks:    reorder(p.blocks.filter(b => b.id !== blockId)),
                updatedAt: new Date().toISOString(),
              })),
              selectedBlock: state.selectedBlock === blockId ? null : state.selectedBlock,
              isDirty: true,
            }),
            false,
            'deleteBlock'
          )
        },

        /* ── Block nach oben ────────────────────────────────── */
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
            false,
            'moveBlockUp'
          )
        },

        /* ── Block nach unten ───────────────────────────────── */
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
            false,
            'moveBlockDown'
          )
        },

        /* ── Block duplizieren ──────────────────────────────── */
        duplicateBlock: (pageId, blockId) => {
          set(
            state => ({
              pages: updatePagesArray(state.pages, pageId, p => {
                const blocks = [...p.blocks]
                const idx = blocks.findIndex(b => b.id === blockId)
                if (idx === -1) return p
                const original = blocks[idx]
                const copy: AnyBlock = {
                  ...original,
                  id: `block-${nanoid(8)}`,
                  props: { ...original.props } as never,
                }
                blocks.splice(idx + 1, 0, copy)
                return { ...p, blocks: reorder(blocks), updatedAt: new Date().toISOString() }
              }),
              isDirty: true,
            }),
            false,
            'duplicateBlock'
          )
        },

        /* ── Block selektieren (Editor) ─────────────────────── */
        selectBlock: (blockId) => {
          set({ selectedBlock: blockId }, false, 'selectBlock')
        },

        /* ── Als gespeichert markieren ──────────────────────── */
        markSaved: () => {
          set({ isDirty: false, isSaving: false }, false, 'markSaved')
        },
      }),

      {
        name:    'candlescope-pages',
        version: 1,
        // Phase 2: partialize ersetzen durch API-Sync
        partialize: (state) => ({ pages: state.pages }),
      }
    ),
    { name: 'PagesStore' }
  )
)