/* ============================================================
   CandleScope — Admin Page Editor
   src/admin/PageEditor.tsx
   ============================================================ */

import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Plus, ChevronUp, ChevronDown,
  Trash2, Copy, Eye, EyeOff, Settings,
  GripVertical, ChevronRight,
} from 'lucide-react'
import { usePagesStore } from '../store/usePagesStore'
import { BLOCK_REGISTRY, CONTENT_BLOCKS, LAYOUT_BLOCKS } from '../types/block.registry'
import type { AnyBlock, BlockType } from '../types/page.types'
import { motion, AnimatePresence } from 'framer-motion'

/* ── Block type icons ────────────────────────────────────── */
import {
  Sparkles, AlignLeft, LayoutGrid, List,
  Image, BarChart2, Megaphone, GitBranch,
  Minus, Play,
} from 'lucide-react'

const BLOCK_ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  hero: Sparkles, text: AlignLeft, 'card-grid': LayoutGrid,
  list: List, image: Image, stats: BarChart2,
  'cta-banner': Megaphone, timeline: GitBranch,
  divider: Minus, embed: Play,
}

export default function PageEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    pages, loadPages, setActivePage, clearActivePage,
    activePage, addBlock, deleteBlock, moveBlockUp,
    moveBlockDown, duplicateBlock, selectBlock, selectedBlock,
    updatePage, toggleNavVisible,
  } = usePagesStore()

  const [showBlockPicker, setShowBlockPicker] = useState(false)
  const [showPageSettings, setShowPageSettings] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editSlug, setEditSlug] = useState('')

  useEffect(() => {
    loadPages()
  }, [loadPages])

  useEffect(() => {
    if (id && id !== 'new') {
      setActivePage(id)
    }
    return () => clearActivePage()
  }, [id, setActivePage, clearActivePage])

  useEffect(() => {
    if (activePage) {
      setEditTitle(activePage.title)
      setEditSlug(activePage.slug)
    }
  }, [activePage?.id])

  if (!activePage && id !== 'new') {
    return (
      <div className="flex items-center justify-center h-full p-10">
        <div className="text-center">
          <p className="font-mono text-[10px] text-[#3a3530] tracking-[0.16em] mb-3">SEITE NICHT GEFUNDEN</p>
          <Link to="/admin/pages" className="font-mono text-[11px] text-[#C9A84C] hover:text-[#E8C56D]">
            ← Zurück
          </Link>
        </div>
      </div>
    )
  }

  const handleAddBlock = (type: BlockType) => {
    if (!activePage) return
    addBlock(activePage.id, type)
    setShowBlockPicker(false)
  }

  const handleSaveSettings = () => {
    if (!activePage) return
    updatePage(activePage.id, { title: editTitle, slug: editSlug })
    setShowPageSettings(false)
  }

  const page = activePage

  return (
    <div className="flex h-[calc(100vh-88px)] overflow-hidden">

      {/* ── Left: Block List ──────────────────────────────── */}
      <div className="w-72 shrink-0 border-r border-[#C9A84C]/8 flex flex-col bg-[#050505]">

        {/* Page header */}
        <div className="px-4 py-4 border-b border-[#C9A84C]/8 shrink-0">
          <Link
            to="/admin/pages"
            className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] text-[#3a3530] hover:text-[#C9A84C] transition-colors mb-3"
          >
            <ArrowLeft size={11} strokeWidth={1.5} />
            PAGES
          </Link>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="font-display text-base text-[#F5F0E8] truncate">{page?.title}</h2>
              <p className="font-mono text-[10px] text-[#3a3530] mt-0.5">/{page?.slug || ''}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {/* Nav toggle */}
              <button
                onClick={() => page && toggleNavVisible(page.id)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                  page?.nav?.visible
                    ? 'text-[#C9A84C] bg-[#C9A84C]/10'
                    : 'text-[#3a3530] hover:text-[#9A9590] bg-[#0d0d0d]'
                }`}
                title="Nav-Sichtbarkeit"
              >
                {page?.nav?.visible ? <Eye size={13} strokeWidth={1.5} /> : <EyeOff size={13} strokeWidth={1.5} />}
              </button>
              {/* Page settings */}
              <button
                onClick={() => setShowPageSettings(true)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#3a3530] hover:text-[#C9A84C] bg-[#0d0d0d] transition-all"
                title="Seiten-Einstellungen"
              >
                <Settings size={13} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Block list */}
        <div className="flex-1 overflow-y-auto py-3 px-3">
          {(!page?.blocks || page.blocks.length === 0) ? (
            <div className="py-8 text-center">
              <p className="font-mono text-[9px] text-[#2a2a2a] tracking-[0.14em]">KEINE BLÖCKE</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <AnimatePresence>
                {page?.blocks
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((block) => {
                    const BlockIcon = BLOCK_ICONS[block.type] ?? Sparkles
                    const config = BLOCK_REGISTRY.find(b => b.type === block.type)
                    const isSelected = selectedBlock === block.id
                    return (
                      <motion.div
                        key={block.id}
                        layout
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        className={`group relative rounded-xl border transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? 'border-[#C9A84C]/30 bg-[#C9A84C]/6'
                            : 'border-[#ffffff]/4 bg-[#080808] hover:border-[#C9A84C]/15'
                        }`}
                        onClick={() => selectBlock(isSelected ? null : block.id)}
                      >
                        <div className="flex items-center gap-2.5 p-2.5 pr-10">
                          <GripVertical size={12} strokeWidth={1.5} className="text-[#2a2a2a] shrink-0" />
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-[#C9A84C]/15 text-[#C9A84C]' : 'bg-[#0d0d0d] text-[#3a3530]'
                          }`}>
                            <BlockIcon size={13} strokeWidth={1.5} />
                          </div>
                          <div className="min-w-0">
                            <p className={`text-[11px] truncate ${isSelected ? 'text-[#C9A84C]' : 'text-[#9A9590]'}`}>
                              {config?.label ?? block.type}
                            </p>
                            <p className="font-mono text-[9px] text-[#2a2a2a] truncate">{block.type}</p>
                          </div>
                          {isSelected && <ChevronRight size={11} className="ml-auto text-[#C9A84C]/50 shrink-0" />}
                        </div>

                        {/* Hover actions */}
                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={e => { e.stopPropagation(); page && moveBlockUp(page.id, block.id) }}
                            className="w-5 h-5 rounded flex items-center justify-center text-[#3a3530] hover:text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-all">
                            <ChevronUp size={11} strokeWidth={2} />
                          </button>
                          <button onClick={e => { e.stopPropagation(); page && moveBlockDown(page.id, block.id) }}
                            className="w-5 h-5 rounded flex items-center justify-center text-[#3a3530] hover:text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-all">
                            <ChevronDown size={11} strokeWidth={2} />
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Add block button */}
        <div className="px-3 py-3 border-t border-[#C9A84C]/8 shrink-0">
          <button
            onClick={() => setShowBlockPicker(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-[#C9A84C]/20 rounded-xl font-mono text-[10px] tracking-[0.12em] uppercase text-[#3a3530] hover:text-[#C9A84C] hover:border-[#C9A84C]/40 transition-all"
          >
            <Plus size={12} strokeWidth={1.5} />
            Block hinzufügen
          </button>
        </div>
      </div>

      {/* ── Right: Block Detail / Preview ────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {selectedBlock ? (
            <BlockDetail
              key={selectedBlock}
              block={page?.blocks.find(b => b.id === selectedBlock)!}
              pageId={page?.id ?? ''}
            />
          ) : (
            <motion.div
              key="empty"
              className="flex flex-col items-center justify-center h-full p-10 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-12 h-12 rounded-2xl border border-[#C9A84C]/15 flex items-center justify-center mb-4">
                <Sparkles size={20} strokeWidth={1.5} className="text-[#C9A84C]/40" />
              </div>
              <p className="font-mono text-[11px] text-[#3a3530] tracking-[0.14em] mb-1">
                BLOCK AUSWÄHLEN
              </p>
              <p className="font-mono text-[10px] text-[#2a2a2a] max-w-xs">
                Klicke links auf einen Block um ihn zu bearbeiten, oder füge einen neuen hinzu.
              </p>

              {/* Quick preview of page */}
              {page && (
                <div className="mt-8 w-full max-w-sm">
                  <p className="font-mono text-[9px] text-[#2a2a2a] tracking-[0.14em] mb-3 text-left">
                    SEITEN-INFO
                  </p>
                  <div className="border border-[#ffffff]/4 rounded-xl p-4 bg-[#080808] text-left">
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                      {[
                        { k: 'TITLE',   v: page.title },
                        { k: 'SLUG',    v: '/' + (page.slug || '') },
                        { k: 'BLOCKS',  v: String(page.blocks.length) },
                        { k: 'NAV',     v: page.nav?.visible ? 'Sichtbar' : 'Versteckt' },
                        { k: 'SYSTEM',  v: page.isSystem ? 'Ja' : 'Nein' },
                        { k: 'UPDATED', v: new Date(page.updatedAt).toLocaleDateString('de-DE') },
                      ].map(({ k, v }) => (
                        <div key={k}>
                          <p className="font-mono text-[8px] text-[#2a2a2a] tracking-[0.12em]">{k}</p>
                          <p className="font-mono text-[11px] text-[#5a5550] truncate">{v}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#ffffff]/4">
                      <a
                        href={`/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 font-mono text-[10px] text-[#C9A84C]/50 hover:text-[#C9A84C] transition-colors"
                      >
                        <Eye size={11} strokeWidth={1.5} />
                        Seite ansehen
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Block Picker Overlay ──────────────────────────── */}
      <AnimatePresence>
        {showBlockPicker && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#080808]/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBlockPicker(false)}
          >
            <motion.div
              className="bg-[#0d0d0d] border border-[#C9A84C]/15 rounded-2xl p-5 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto"
              initial={{ y: 32, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 32, scale: 0.97 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="font-mono text-[10px] tracking-[0.18em] text-[#C9A84C]">BLOCK AUSWÄHLEN</p>
                <button onClick={() => setShowBlockPicker(false)} className="font-mono text-[10px] text-[#3a3530] hover:text-[#F5F0E8] transition-colors">ESC</button>
              </div>

              {[
                { label: 'CONTENT', blocks: CONTENT_BLOCKS },
                { label: 'LAYOUT',  blocks: LAYOUT_BLOCKS  },
              ].map(({ label, blocks }) => (
                <div key={label} className="mb-5">
                  <p className="font-mono text-[9px] tracking-[0.16em] text-[#3a3530] mb-2">{label}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {blocks.map(config => {
                      const Icon = BLOCK_ICONS[config.type] ?? Sparkles
                      return (
                        <button
                          key={config.type}
                          onClick={() => handleAddBlock(config.type as BlockType)}
                          className="flex items-center gap-3 p-3 rounded-xl border border-[#ffffff]/4 bg-[#080808] hover:border-[#C9A84C]/25 hover:bg-[#C9A84C]/4 transition-all text-left group"
                        >
                          <div className="w-8 h-8 rounded-lg border border-[#ffffff]/6 bg-[#0d0d0d] flex items-center justify-center text-[#3a3530] group-hover:text-[#C9A84C] group-hover:border-[#C9A84C]/20 transition-all shrink-0">
                            <Icon size={14} strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="text-[11px] text-[#9A9590] group-hover:text-[#F5F0E8] transition-colors">
                              {config.label}
                            </p>
                            <p className="font-mono text-[9px] text-[#2a2a2a] mt-0.5 leading-snug">
                              {config.description.split(' ').slice(0, 4).join(' ')}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page Settings Overlay ────────────────────────── */}
      <AnimatePresence>
        {showPageSettings && page && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#080808]/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPageSettings(false)}
          >
            <motion.div
              className="bg-[#0d0d0d] border border-[#C9A84C]/15 rounded-2xl p-6 w-full max-w-sm mx-4"
              initial={{ scale: 0.97, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97, y: 8 }}
              onClick={e => e.stopPropagation()}
            >
              <p className="font-mono text-[10px] tracking-[0.18em] text-[#C9A84C] mb-4">SEITEN-EINSTELLUNGEN</p>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="font-mono text-[9px] tracking-[0.14em] text-[#3a3530] block mb-1.5">TITLE</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="w-full bg-[#080808] border border-[#ffffff]/6 rounded-xl px-3 py-2.5 text-sm text-[#F5F0E8] font-mono focus:outline-none focus:border-[#C9A84C]/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="font-mono text-[9px] tracking-[0.14em] text-[#3a3530] block mb-1.5">SLUG</label>
                  <div className="flex items-center gap-1.5 bg-[#080808] border border-[#ffffff]/6 rounded-xl px-3 py-2.5 focus-within:border-[#C9A84C]/30 transition-colors">
                    <span className="font-mono text-sm text-[#3a3530]">/</span>
                    <input
                      type="text"
                      value={editSlug}
                      onChange={e => setEditSlug(e.target.value.replace(/[^a-z0-9-]/g, ''))}
                      disabled={page.isSystem}
                      className="flex-1 bg-transparent text-sm text-[#F5F0E8] font-mono focus:outline-none disabled:opacity-30"
                    />
                  </div>
                  {page.isSystem && (
                    <p className="font-mono text-[9px] text-[#3a3530] mt-1">System-Seiten können nicht umbenannt werden.</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <button
                  onClick={handleSaveSettings}
                  className="flex-1 py-2.5 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] font-mono text-[11px] tracking-[0.1em] hover:bg-[#C9A84C]/20 transition-all"
                >
                  SPEICHERN
                </button>
                <button
                  onClick={() => setShowPageSettings(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#ffffff]/6 text-[#5a5550] font-mono text-[11px] tracking-[0.1em] hover:text-[#F5F0E8] transition-all"
                >
                  ABBRECHEN
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Block Detail Panel ──────────────────────────────────── */
function BlockDetail({ block, pageId }: { block: AnyBlock; pageId: string }) {
  const { deleteBlock, duplicateBlock, updateBlock } = usePagesStore()
  const config = BLOCK_REGISTRY.find(b => b.type === block.type)
  const Icon = BLOCK_ICONS[block.type] ?? Sparkles

  const props = block.props as Record<string, unknown>

  return (
    <motion.div
      className="p-6 md:p-8 max-w-2xl"
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Block header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C]">
            <Icon size={16} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm text-[#F5F0E8]">{config?.label ?? block.type}</p>
            <p className="font-mono text-[9px] text-[#3a3530]">{block.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => duplicateBlock(pageId, block.id)}
            className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] uppercase text-[#3a3530] hover:text-[#C9A84C] transition-colors px-3 py-1.5 rounded-lg hover:bg-[#C9A84C]/8 border border-transparent hover:border-[#C9A84C]/15"
          >
            <Copy size={12} strokeWidth={1.5} />
            Duplizieren
          </button>
          <button
            onClick={() => deleteBlock(pageId, block.id)}
            className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] uppercase text-[#3a3530] hover:text-[#FF4444] transition-colors px-3 py-1.5 rounded-lg hover:bg-[#FF4444]/8 border border-transparent hover:border-[#FF4444]/15"
          >
            <Trash2 size={12} strokeWidth={1.5} />
            Löschen
          </button>
        </div>
      </div>

      {/* Props editor */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-[9px] tracking-[0.16em] text-[#3a3530] mb-1">PROPS</p>
        {Object.entries(props).map(([key, value]) => {
          if (typeof value === 'object' && value !== null) return null // Arrays/Objects later
          return (
            <div key={key}>
              <label className="font-mono text-[9px] tracking-[0.14em] text-[#3a3530] block mb-1.5 uppercase">
                {key}
              </label>
              {typeof value === 'boolean' ? (
                <button
                  onClick={() => updateBlock(pageId, block.id, { [key]: !value })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border font-mono text-[11px] transition-all ${
                    value
                      ? 'border-[#C9A84C]/30 bg-[#C9A84C]/8 text-[#C9A84C]'
                      : 'border-[#ffffff]/6 bg-[#080808] text-[#5a5550]'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${value ? 'bg-[#C9A84C]' : 'bg-[#3a3530]'}`} />
                  {value ? 'true' : 'false'}
                </button>
              ) : (
                <input
                  type="text"
                  defaultValue={String(value ?? '')}
                  onBlur={e => updateBlock(pageId, block.id, { [key]: e.target.value })}
                  className="w-full bg-[#080808] border border-[#ffffff]/6 rounded-xl px-3 py-2.5 text-sm text-[#F5F0E8] font-mono focus:outline-none focus:border-[#C9A84C]/30 transition-colors"
                />
              )}
            </div>
          )
        })}

        {/* Array props summary */}
        {Object.entries(props).map(([key, value]) => {
          if (!Array.isArray(value)) return null
          return (
            <div key={key} className="border border-[#ffffff]/4 rounded-xl p-3 bg-[#080808]">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[9px] tracking-[0.14em] text-[#3a3530] uppercase">{key}</p>
                <span className="font-mono text-[9px] text-[#C9A84C]/50">{value.length} items</span>
              </div>
              <p className="font-mono text-[9px] text-[#2a2a2a] mt-1">
                Array-Editor folgt in nächstem Update
              </p>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}