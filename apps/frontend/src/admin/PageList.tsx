/* ============================================================
   CandleScope — Admin Page List
   src/admin/PageList.tsx
   ============================================================ */

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FileText, Plus, Eye, EyeOff, Trash2,
  TrendingUp, Code2, User, MessageSquare,
  Globe, Layers, ArrowUpRight, Search,
} from 'lucide-react'
import { usePagesStore } from '../store/usePagesStore'
import { AnimatePresence, motion } from 'framer-motion'

const iconMap: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  TrendingUp, Code2, User, MessageSquare, FileText, Globe, Layers,
}

export default function PageList() {
  const navigate = useNavigate()
  const { pages, loadPages, deletePage, toggleNavVisible } = usePagesStore()
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => { loadPages() }, [loadPages])

  const filtered = pages.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 md:p-10 max-w-5xl">

      {/* Header */}
      <div className="mb-8">
        <p className="font-mono text-[11px] tracking-[0.2em] text-[#9A9590] uppercase mb-3">── SEITEN</p>
        <div className="flex items-end justify-between gap-4">
          <h1 className="font-display text-3xl text-[#F5F0E8] tracking-tight">Page Manager</h1>
          <button
            onClick={() => navigate('/admin/pages/new')}
            className="relative overflow-hidden group flex items-center gap-2 text-[12px] tracking-[0.12em] uppercase border border-[#C9A84C]/40 text-[#C9A84C] px-5 py-2.5 rounded-full shrink-0"
          >
            <span className="relative z-10 group-hover:text-[#080808] transition-colors duration-300 flex items-center gap-2">
              <Plus size={13} strokeWidth={1.5} /> Neue Seite
            </span>
            <span className="absolute inset-0 bg-[#C9A84C] rounded-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-5 relative">
        <Search size={14} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9590]" />
        <input
          type="text"
          placeholder="Seiten suchen..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#0d0d0d] border border-[#ffffff]/8 rounded-xl pl-10 pr-4 py-3 text-[14px] text-[#F5F0E8] placeholder:text-[#5a5550] font-mono focus:outline-none focus:border-[#C9A84C]/30 transition-colors"
        />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-5 mb-5">
        {[
          { label: 'GESAMT',  value: pages.length },
          { label: 'IN NAV',  value: pages.filter(p => p.nav?.visible).length },
          { label: 'LIVE',    value: pages.filter(p => p.published).length },
          { label: 'BLÖCKE', value: pages.reduce((a, p) => a + p.blocks.length, 0) },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="font-mono text-[11px] tracking-[0.12em] text-[#5a5550]">{s.label}</span>
            <span className="font-mono text-[13px] text-[#C9A84C]/80 font-medium">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Page list */}
      <div className="flex flex-col gap-2">
        {filtered.map((page) => {
          const Icon = iconMap[page.nav?.icon ?? ''] ?? FileText
          return (
            <div
              key={page.id}
              className="group relative border border-[#ffffff]/6 rounded-xl bg-[#0d0d0d] hover:border-[#C9A84C]/25 hover:bg-[#C9A84C]/3 transition-all duration-200"
            >
              <Link to={`/admin/pages/${page.id}`} className="flex items-center gap-4 p-4 pr-28">
                <div className="w-11 h-11 rounded-xl border border-[#ffffff]/8 bg-[#1a1a1a] flex items-center justify-center text-[#9A9590] group-hover:text-[#C9A84C] group-hover:border-[#C9A84C]/25 transition-all shrink-0">
                  <Icon size={17} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[15px] font-medium text-[#F5F0E8] group-hover:text-[#C9A84C] transition-colors truncate">
                      {page.title}
                    </span>
                    {page.isSystem && (
                      <span className="font-mono text-[10px] text-[#9A9590] border border-[#ffffff]/10 px-2 py-0.5 rounded shrink-0">SYS</span>
                    )}
                    {page.published && (
                      <span className="font-mono text-[10px] text-[#00C896] border border-[#00C896]/25 px-2 py-0.5 rounded shrink-0">LIVE</span>
                    )}
                    {page.nav?.visible && (
                      <span className="font-mono text-[10px] text-[#C9A84C]/60 border border-[#C9A84C]/20 px-2 py-0.5 rounded shrink-0">
                        NAV·{page.nav.position}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[12px] text-[#9A9590]">/{page.slug || ''}</span>
                    <span className="font-mono text-[12px] text-[#5a5550]">{page.blocks.length} Block{page.blocks.length !== 1 ? 's' : ''}</span>
                    <span className="font-mono text-[12px] text-[#5a5550]">{new Date(page.updatedAt).toLocaleDateString('de-DE')}</span>
                  </div>
                </div>
                <ArrowUpRight size={15} strokeWidth={1.5} className="text-[#5a5550] group-hover:text-[#C9A84C]/60 transition-colors shrink-0" />
              </Link>

              {/* Hover actions */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={e => { e.preventDefault(); toggleNavVisible(page.id) }}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    page.nav?.visible
                      ? 'text-[#C9A84C] bg-[#C9A84C]/12'
                      : 'text-[#9A9590] hover:text-[#F5F0E8] bg-[#1a1a1a]'
                  }`}
                >
                  {page.nav?.visible ? <Eye size={14} strokeWidth={1.5} /> : <EyeOff size={14} strokeWidth={1.5} />}
                </button>
                {!page.isSystem && (
                  <button
                    onClick={e => { e.preventDefault(); setConfirmDelete(page.id) }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9A9590] hover:text-[#FF4444] hover:bg-[#FF4444]/10 bg-[#1a1a1a] transition-all"
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="font-mono text-[13px] text-[#5a5550] tracking-[0.1em]">Keine Seiten gefunden</p>
          </div>
        )}
      </div>

      {/* Delete confirm overlay */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#080808]/85 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#0d0d0d] border border-[#FF4444]/25 rounded-2xl p-6 max-w-sm w-full mx-4"
              initial={{ scale: 0.95, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 8 }}
            >
              <p className="font-mono text-[12px] tracking-[0.14em] text-[#FF4444] mb-3">LÖSCHEN</p>
              <p className="text-[15px] text-[#F5F0E8] mb-1">
                Seite &quot;{pages.find(p => p.id === confirmDelete)?.title}&quot; löschen?
              </p>
              <p className="text-[13px] text-[#9A9590] mb-5">
                Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => { deletePage(confirmDelete); setConfirmDelete(null) }}
                  className="flex-1 py-3 rounded-xl bg-[#FF4444]/10 border border-[#FF4444]/30 text-[#FF4444] font-mono text-[12px] tracking-[0.1em] hover:bg-[#FF4444]/20 transition-all"
                >
                  LÖSCHEN
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-3 rounded-xl border border-[#ffffff]/8 text-[#9A9590] font-mono text-[12px] tracking-[0.1em] hover:text-[#F5F0E8] transition-all"
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