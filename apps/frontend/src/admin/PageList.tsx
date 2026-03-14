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
import { motion, AnimatePresence } from 'framer-motion'

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

  const handleDelete = (id: string) => {
    deletePage(id)
    setConfirmDelete(null)
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl">

      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="font-mono text-[10px] tracking-[0.2em] text-[#3a3530] uppercase mb-3">
          ── SEITEN
        </p>
        <div className="flex items-end justify-between gap-4">
          <h1 className="font-display text-3xl text-[#F5F0E8] tracking-tight">
            Page Manager
          </h1>
          <button
            onClick={() => navigate('/admin/pages/new')}
            className="relative overflow-hidden group flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase border border-[#C9A84C]/40 text-[#C9A84C] px-5 py-2.5 rounded-full shrink-0"
          >
            <span className="relative z-10 group-hover:text-[#080808] transition-colors duration-300 flex items-center gap-2">
              <Plus size={13} strokeWidth={1.5} />
              Neue Seite
            </span>
            <span className="absolute inset-0 bg-[#C9A84C] rounded-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          </button>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        className="mb-5 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Search size={13} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3a3530]" />
        <input
          type="text"
          placeholder="Seiten suchen..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#080808] border border-[#ffffff]/6 rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#F5F0E8] placeholder:text-[#2a2a2a] font-mono focus:outline-none focus:border-[#C9A84C]/30 transition-colors"
        />
      </motion.div>

      {/* Stats row */}
      <motion.div
        className="flex items-center gap-4 mb-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        {[
          { label: 'GESAMT',  value: pages.length },
          { label: 'IN NAV',  value: pages.filter(p => p.nav?.visible).length },
          { label: 'SYSTEM',  value: pages.filter(p => p.isSystem).length },
          { label: 'BLÖCKE', value: pages.reduce((a, p) => a + p.blocks.length, 0) },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className="font-mono text-[9px] tracking-[0.14em] text-[#2a2a2a]">{s.label}</span>
            <span className="font-mono text-[10px] text-[#C9A84C]/60">{s.value}</span>
          </div>
        ))}
      </motion.div>

      {/* Page list */}
      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {filtered.map((page, i) => {
            const Icon = iconMap[page.nav?.icon ?? ''] ?? FileText
            return (
              <motion.div
                key={page.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ delay: i * 0.03 }}
                className="group relative border border-[#ffffff]/4 rounded-xl bg-[#080808] hover:border-[#C9A84C]/20 transition-all duration-200"
              >
                <Link
                  to={`/admin/pages/${page.id}`}
                  className="flex items-center gap-4 p-4 pr-32"
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl border border-[#ffffff]/6 bg-[#0d0d0d] flex items-center justify-center text-[#3a3530] group-hover:text-[#C9A84C] group-hover:border-[#C9A84C]/20 transition-all shrink-0">
                    <Icon size={16} strokeWidth={1.5} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm text-[#F5F0E8]/80 group-hover:text-[#F5F0E8] transition-colors">
                        {page.title}
                      </span>
                      {page.isSystem && (
                        <span className="font-mono text-[8px] text-[#3a3530] border border-[#ffffff]/4 px-1.5 py-0.5 rounded">
                          SYS
                        </span>
                      )}
                      {page.nav?.visible && (
                        <span className="font-mono text-[8px] text-[#C9A84C]/40 border border-[#C9A84C]/15 px-1.5 py-0.5 rounded">
                          NAV·{page.nav.position}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-[#3a3530]">
                        /{page.slug || ''}
                      </span>
                      <span className="font-mono text-[10px] text-[#2a2a2a]">
                        {page.blocks.length} Block{page.blocks.length !== 1 ? 's' : ''}
                      </span>
                      <span className="font-mono text-[10px] text-[#2a2a2a]">
                        {new Date(page.updatedAt).toLocaleDateString('de-DE')}
                      </span>
                    </div>
                  </div>

                  <ArrowUpRight size={14} strokeWidth={1.5} className="text-[#2a2a2a] group-hover:text-[#C9A84C]/50 transition-colors shrink-0" />
                </Link>

                {/* Actions — appear on hover */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Toggle Nav */}
                  <button
                    onClick={e => { e.preventDefault(); toggleNavVisible(page.id) }}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      page.nav?.visible
                        ? 'text-[#C9A84C] bg-[#C9A84C]/10'
                        : 'text-[#3a3530] hover:text-[#9A9590] bg-[#0d0d0d]'
                    }`}
                    title={page.nav?.visible ? 'Aus Nav entfernen' : 'In Nav anzeigen'}
                  >
                    {page.nav?.visible
                      ? <Eye size={13} strokeWidth={1.5} />
                      : <EyeOff size={13} strokeWidth={1.5} />
                    }
                  </button>

                  {/* Delete — nur nicht-System */}
                  {!page.isSystem && (
                    <button
                      onClick={e => { e.preventDefault(); setConfirmDelete(page.id) }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[#3a3530] hover:text-[#FF4444] hover:bg-[#FF4444]/8 bg-[#0d0d0d] transition-all"
                      title="Seite löschen"
                    >
                      <Trash2 size={13} strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="font-mono text-[11px] text-[#2a2a2a] tracking-[0.12em]">
              KEINE SEITEN GEFUNDEN
            </p>
          </div>
        )}
      </div>

      {/* Delete confirm overlay */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#080808]/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#0d0d0d] border border-[#FF4444]/20 rounded-2xl p-6 max-w-sm w-full mx-4"
              initial={{ scale: 0.95, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 8 }}
            >
              <p className="font-mono text-[10px] tracking-[0.16em] text-[#FF4444] mb-2">LÖSCHEN</p>
              <p className="text-sm text-[#F5F0E8] mb-1">
                Seite &quot;{pages.find(p => p.id === confirmDelete)?.title}&quot; löschen?
              </p>
              <p className="font-mono text-[10px] text-[#3a3530] mb-5">
                Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 py-2.5 rounded-xl bg-[#FF4444]/10 border border-[#FF4444]/30 text-[#FF4444] font-mono text-[11px] tracking-[0.1em] hover:bg-[#FF4444]/20 transition-all"
                >
                  LÖSCHEN
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
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