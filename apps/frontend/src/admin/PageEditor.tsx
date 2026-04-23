/* ============================================================
   CandleScope — Admin Page Editor
   src/admin/PageEditor.tsx
   ============================================================ */

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Plus, ChevronUp, ChevronDown,
  Eye, EyeOff, Settings, GripVertical,
  ChevronRight, Save, Globe, Sparkles,
} from 'lucide-react'
import { usePagesStore } from '../store/usePagesStore'
import { BLOCK_REGISTRY, CONTENT_BLOCKS, LAYOUT_BLOCKS } from '../types/block.registry'
import type { BlockType } from '../types/page.types'
import { AnimatePresence, motion } from 'framer-motion'
import BlockEditor, { BLOCK_ICONS } from './BlockEditor'

export default function PageEditor() {
  const { id } = useParams<{ id: string }>()
  const {
    pages, loadPages, setActivePage, clearActivePage, activePage,
    addBlock, moveBlockUp, moveBlockDown,
    selectBlock, selectedBlock, updatePage,
    toggleNavVisible, publishPage, unpublishPage,
    saveActive, isDirty,
  } = usePagesStore()

  const [showBlockPicker,  setShowBlockPicker]  = useState(false)
  const [showPageSettings, setShowPageSettings] = useState(false)
  const [editTitle,        setEditTitle]        = useState('')
  const [editSlug,         setEditSlug]         = useState('')
  const [savedFlash,       setSavedFlash]       = useState(false)

  useEffect(() => { loadPages() }, [loadPages])

  useEffect(() => {
    if (id && id !== 'new') setActivePage(id)
    return () => clearActivePage()
  }, [id, setActivePage, clearActivePage])

  useEffect(() => {
    if (activePage) {
      setEditTitle(activePage.title)
      setEditSlug(activePage.slug)
    }
  }, [activePage?.id])

  if (!activePage) {
    const loaded = pages.length > 0
    if (!loaded) return null
    return (
      <div className="flex items-center justify-center h-full p-10 text-center">
        <div>
          <p className="font-mono text-[13px] text-[var(--cs-text-2)] tracking-[0.1em] mb-3">SEITE NICHT GEFUNDEN</p>
          <Link to="/admin/pages" className="font-mono text-[13px] text-[#C9A84C]">← Zurück</Link>
        </div>
      </div>
    )
  }

  const page = activePage

  const handleAddBlock = (type: BlockType) => {
    addBlock(page.id, type)
    setShowBlockPicker(false)
  }

  const handleSave = () => {
    saveActive()
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 2000)
  }

  const handleSaveSettings = () => {
    updatePage(page.id, { title: editTitle, slug: editSlug })
    setShowPageSettings(false)
  }

  const selectedBlockData = page.blocks.find(b => b.id === selectedBlock)

  return (
    <div className="flex h-[calc(100vh-88px)] overflow-hidden">

      {/* ── Left: Block List ─────────────────────────── */}
      <div className="w-72 shrink-0 border-r border-[#C9A84C]/10 flex flex-col bg-[var(--cs-bg)]">

        {/* Page header */}
        <div className="px-4 py-4 border-b border-[#C9A84C]/10 shrink-0">
          <Link to="/admin/pages"
            className="flex items-center gap-1.5 font-mono text-[12px] tracking-[0.1em] text-[var(--cs-text-2)] hover:text-[#C9A84C] transition-colors mb-3">
            <ArrowLeft size={12} strokeWidth={1.5} /> PAGES
          </Link>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="font-display text-lg text-[var(--cs-text)] truncate">{page.title}</h2>
              <p className="font-mono text-[12px] text-[var(--cs-text-2)] mt-0.5">/{page.slug || ''}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => toggleNavVisible(page.id)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  page.nav?.visible ? 'text-[#C9A84C] bg-[#C9A84C]/10' : 'text-[var(--cs-text-2)] hover:text-[var(--cs-text)] bg-[var(--cs-s2)]'
                }`}>
                {page.nav?.visible ? <Eye size={14} strokeWidth={1.5} /> : <EyeOff size={14} strokeWidth={1.5} />}
              </button>
              <button onClick={() => setShowPageSettings(true)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--cs-text-2)] hover:text-[#C9A84C] bg-[var(--cs-s2)] transition-all">
                <Settings size={14} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Publish + Save */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => page.published ? unpublishPage(page.id) : publishPage(page.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-mono text-[11px] tracking-[0.1em] uppercase border transition-all ${
                page.published
                  ? 'border-[#00C896]/40 bg-[#00C896]/10 text-[#00C896]'
                  : 'border-[var(--cs-text)]/12 bg-[var(--cs-s2)] text-[var(--cs-text-2)] hover:border-[#C9A84C]/30 hover:text-[#C9A84C]'
              }`}>
              <Globe size={12} strokeWidth={1.5} />
              {page.published ? 'LIVE' : 'ENTWURF'}
            </button>
            <button
              onClick={handleSave}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-mono text-[11px] tracking-[0.1em] uppercase border transition-all ${
                savedFlash
                  ? 'border-[#00C896]/40 bg-[#00C896]/10 text-[#00C896]'
                  : isDirty
                  ? 'border-[#C9A84C]/40 bg-[#C9A84C]/10 text-[#C9A84C]'
                  : 'border-[var(--cs-text)]/12 bg-[var(--cs-s2)] text-[var(--cs-text-2)]'
              }`}>
              <Save size={12} strokeWidth={1.5} />
              {savedFlash ? 'SAVED ✓' : isDirty ? 'SAVE *' : 'SAVED'}
            </button>
          </div>
        </div>

        {/* Block List */}
        <div className="flex-1 overflow-y-auto py-3 px-3">
          {page.blocks.length === 0 ? (
            <div className="py-8 text-center">
              <p className="font-mono text-[12px] text-[var(--cs-text-3)] tracking-[0.1em]">Keine Blöcke</p>
              <p className="font-mono text-[11px] text-[var(--cs-text-3)] mt-1">Block hinzufügen ↓</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {page.blocks.slice().sort((a, b) => a.order - b.order).map(block => {
                const BlockIcon = BLOCK_ICONS[block.type] ?? Sparkles
                const config = BLOCK_REGISTRY.find(b => b.type === block.type)
                const isSelected = selectedBlock === block.id
                return (
                  <div
                    key={block.id}
                    className={`group relative rounded-xl border transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'border-[#C9A84C]/40 bg-[#C9A84C]/8'
                        : 'border-[var(--cs-text)]/8 bg-[var(--cs-s2)] hover:border-[#C9A84C]/20 hover:bg-[#C9A84C]/4'
                    }`}
                    onClick={() => selectBlock(isSelected ? null : block.id)}
                  >
                    <div className="flex items-center gap-2.5 p-3 pr-10">
                      <GripVertical size={13} strokeWidth={1.5} className="text-[var(--cs-text-3)] shrink-0" />
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#C9A84C]/20 text-[#C9A84C]' : 'bg-[var(--cs-s4)] text-[var(--cs-text-2)]'
                      }`}>
                        <BlockIcon size={14} strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-[13px] font-medium truncate ${isSelected ? 'text-[#C9A84C]' : 'text-[var(--cs-text)]'}`}>
                          {config?.label ?? block.type}
                        </p>
                        <p className="font-mono text-[11px] text-[var(--cs-text-3)] truncate">{block.type}</p>
                      </div>
                      {isSelected && <ChevronRight size={12} className="ml-auto text-[#C9A84C]/60 shrink-0" />}
                    </div>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={e => { e.stopPropagation(); moveBlockUp(page.id, block.id) }}
                        className="w-5 h-5 rounded flex items-center justify-center text-[var(--cs-text-2)] hover:text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-all">
                        <ChevronUp size={12} strokeWidth={2} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); moveBlockDown(page.id, block.id) }}
                        className="w-5 h-5 rounded flex items-center justify-center text-[var(--cs-text-2)] hover:text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-all">
                        <ChevronDown size={12} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Add block */}
        <div className="px-3 py-3 border-t border-[#C9A84C]/10 shrink-0">
          <button onClick={() => setShowBlockPicker(true)}
            className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-[#C9A84C]/25 rounded-xl font-mono text-[12px] tracking-[0.1em] uppercase text-[var(--cs-text-2)] hover:text-[#C9A84C] hover:border-[#C9A84C]/50 transition-all">
            <Plus size={13} strokeWidth={1.5} />
            Block hinzufügen
          </button>
        </div>
      </div>

      {/* ── Right: Block Editor ───────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {selectedBlockData ? (
          <BlockEditor block={selectedBlockData} pageId={page.id} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-10 text-center">
            <div className="w-14 h-14 rounded-2xl border border-[#C9A84C]/20 flex items-center justify-center mb-5">
              <Sparkles size={22} strokeWidth={1.5} className="text-[#C9A84C]/50" />
            </div>
            <p className="font-mono text-[13px] text-[var(--cs-text-2)] tracking-[0.12em] mb-2">BLOCK AUSWÄHLEN</p>
            <p className="text-[13px] text-[var(--cs-text-3)] max-w-xs mb-10 leading-relaxed">
              Klicke links auf einen Block um ihn zu bearbeiten.
            </p>
            {/* Page info */}
            <div className="border border-[var(--cs-text)]/10 rounded-xl p-5 bg-[var(--cs-s2)] text-left w-full max-w-sm">
              <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                {[
                  { k: 'TITLE',   v: page.title },
                  { k: 'SLUG',    v: '/' + (page.slug || '') },
                  { k: 'BLOCKS',  v: String(page.blocks.length) },
                  { k: 'STATUS',  v: page.published ? '🟢 LIVE' : '⚪ ENTWURF' },
                  { k: 'NAV',     v: page.nav?.visible ? 'Sichtbar' : 'Versteckt' },
                  { k: 'UPDATED', v: new Date(page.updatedAt).toLocaleDateString('de-DE') },
                ].map(({ k, v }) => (
                  <div key={k}>
                    <p className="font-mono text-[10px] text-[var(--cs-text-3)] tracking-[0.12em] mb-0.5">{k}</p>
                    <p className="text-[13px] text-[var(--cs-text)] truncate">{v}</p>
                  </div>
                ))}
              </div>
              {page.published && (
                <div className="mt-4 pt-3 border-t border-[var(--cs-text)]/8">
                  <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[12px] text-[var(--cs-text-2)] hover:text-[#C9A84C] transition-colors">
                    <Eye size={13} strokeWidth={1.5} /> Seite live ansehen
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Block Picker ─────────────────────────── */}
      <AnimatePresence>
        {showBlockPicker && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowBlockPicker(false)}
          >
            <motion.div
              className="bg-[var(--cs-s2)] border border-[#C9A84C]/20 rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto"
              initial={{ y: 32, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 32, scale: 0.97 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <p className="font-mono text-[13px] tracking-[0.14em] text-[#C9A84C] font-medium">BLOCK AUSWÄHLEN</p>
                <button onClick={() => setShowBlockPicker(false)} className="font-mono text-[12px] text-[var(--cs-text-2)] hover:text-[var(--cs-text)] transition-colors">ESC</button>
              </div>
              {[{ label: 'CONTENT', blocks: CONTENT_BLOCKS }, { label: 'LAYOUT', blocks: LAYOUT_BLOCKS }].map(({ label, blocks }) => (
                <div key={label} className="mb-5">
                  <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--cs-text-2)] mb-3">{label}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {blocks.map(config => {
                      const Icon = BLOCK_ICONS[config.type] ?? Sparkles
                      return (
                        <button key={config.type} onClick={() => handleAddBlock(config.type as BlockType)}
                          className="flex items-center gap-3 p-3 rounded-xl border border-[var(--cs-text)]/8 bg-[var(--cs-bg)] hover:border-[#C9A84C]/30 hover:bg-[#C9A84C]/5 transition-all text-left group">
                          <div className="w-9 h-9 rounded-lg border border-[var(--cs-text)]/10 bg-[var(--cs-s2)] flex items-center justify-center text-[var(--cs-text-2)] group-hover:text-[#C9A84C] group-hover:border-[#C9A84C]/25 transition-all shrink-0">
                            <Icon size={15} strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="text-[13px] text-[var(--cs-text)] group-hover:text-[#C9A84C] transition-colors">{config.label}</p>
                            <p className="font-mono text-[10px] text-[var(--cs-text-3)] mt-0.5">{config.description.split(' ').slice(0, 5).join(' ')}</p>
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

      {/* ── Page Settings ────────────────────────── */}
      <AnimatePresence>
        {showPageSettings && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowPageSettings(false)}
          >
            <motion.div
              className="bg-[var(--cs-s2)] border border-[#C9A84C]/20 rounded-2xl p-6 w-full max-w-sm mx-4"
              initial={{ scale: 0.97, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97, y: 8 }}
              onClick={e => e.stopPropagation()}
            >
              <p className="font-mono text-[13px] tracking-[0.14em] text-[#C9A84C] font-medium mb-5">SEITEN-EINSTELLUNGEN</p>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="font-mono text-[11px] tracking-[0.12em] text-[var(--cs-text-2)] block mb-2">TITEL</label>
                  <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                    className="w-full bg-[var(--cs-bg)] border border-[var(--cs-text)]/12 rounded-xl px-4 py-3 text-[14px] text-[var(--cs-text)] font-mono focus:outline-none focus:border-[#C9A84C]/40 transition-colors" />
                </div>
                <div>
                  <label className="font-mono text-[11px] tracking-[0.12em] text-[var(--cs-text-2)] block mb-2">SLUG</label>
                  <div className="flex items-center gap-1.5 bg-[var(--cs-bg)] border border-[var(--cs-text)]/12 rounded-xl px-4 py-3 focus-within:border-[#C9A84C]/40 transition-colors">
                    <span className="font-mono text-[14px] text-[var(--cs-text-2)]">/</span>
                    <input type="text" value={editSlug}
                      onChange={e => setEditSlug(e.target.value.replace(/[^a-z0-9-]/g, ''))}
                      disabled={page.isSystem}
                      className="flex-1 bg-transparent text-[14px] text-[var(--cs-text)] font-mono focus:outline-none disabled:opacity-40" />
                  </div>
                  {page.isSystem && (
                    <p className="font-mono text-[11px] text-[var(--cs-text-3)] mt-1.5">System-Seiten können nicht umbenannt werden.</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={handleSaveSettings}
                  className="flex-1 py-3 rounded-xl bg-[#C9A84C]/12 border border-[#C9A84C]/35 text-[var(--cs-text-2)] font-mono text-[12px] tracking-[0.1em] hover:bg-[#C9A84C]/20 hover:text-[var(--cs-text)] transition-all">
                  SPEICHERN
                </button>
                <button onClick={() => setShowPageSettings(false)}
                  className="flex-1 py-3 rounded-xl border border-[var(--cs-text)]/10 text-[var(--cs-text-2)] font-mono text-[12px] tracking-[0.1em] hover:text-[var(--cs-text)] transition-all">
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
