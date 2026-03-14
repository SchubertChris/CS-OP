/* ============================================================
   CandleScope — Admin Command Center Dashboard
   src/admin/AdminDashboard.tsx

   Kein Standard-Grid. Kein Sidebar.
   Vollbild-Module wie ein Trading Terminal.
   ============================================================ */

import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FileText, Plus, TrendingUp, Code2, User,
  MessageSquare, ArrowUpRight, ChevronRight,
  Layers, Zap, Globe,
} from 'lucide-react'
import { usePagesStore } from '../store/usePagesStore'
import { motion } from 'framer-motion'

const iconMap: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  TrendingUp, Code2, User, MessageSquare, FileText,
  Globe, Layers,
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { pages, loadPages } = usePagesStore()

  useEffect(() => { loadPages() }, [loadPages])

  const navPages    = pages.filter(p => p.nav?.visible)
  const totalBlocks = pages.reduce((a, p) => a + p.blocks.length, 0)

  return (
    <div className="min-h-full p-6 md:p-10 flex flex-col gap-6">

      {/* ── Row 1: Big Welcome + Quick Stats ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6">

        {/* Welcome module */}
        <motion.div
          className="relative overflow-hidden border border-[#C9A84C]/15 rounded-2xl p-8 bg-[#080808]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Background candlestick decoration */}
          <svg className="absolute right-0 top-0 h-full w-64 pointer-events-none opacity-[0.04]"
            viewBox="0 0 256 160" preserveAspectRatio="xMaxYMid meet">
            {[
              {x:20,o:80,c:110,h:120,l:70},{x:50,o:110,c:95,h:118,l:88},
              {x:80,o:95,c:125,h:132,l:92},{x:110,o:125,c:108,h:130,l:100},
              {x:140,o:108,c:138,h:145,l:105},{x:170,o:138,c:120,h:142,l:115},
              {x:200,o:120,c:148,h:155,l:118},{x:230,o:148,c:135,h:152,l:128},
            ].map((c,i) => {
              const s = 0.8
              const base = 160
              return (
                <g key={i}>
                  <line x1={c.x} y1={base-c.h*s} x2={c.x} y2={base-c.l*s} stroke="#C9A84C" strokeWidth="1"/>
                  <rect x={c.x-8} y={base-Math.max(c.o,c.c)*s} width="16"
                    height={Math.max(Math.abs(c.c-c.o)*s,3)}
                    fill={c.c>c.o?'#C9A84C':'none'}
                    stroke="#C9A84C" strokeWidth="1"/>
                </g>
              )
            })}
          </svg>

          <div className="relative z-10">
            <p className="font-mono text-[10px] tracking-[0.2em] text-[#3a3530] uppercase mb-3">
              ── COMMAND CENTER ──
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-[#F5F0E8] tracking-tight leading-none mb-2">
              Willkommen,<br />
              <span className="text-[#C9A84C]">Chris.</span>
            </h1>
            <p className="text-[#3a3530] text-sm mt-4 font-mono tracking-[0.04em]">
              {pages.length} Seiten · {totalBlocks} Blöcke · {navPages.length} in Navigation
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => navigate('/admin/pages/new')}
                className="relative overflow-hidden group flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase border border-[#C9A84C]/40 text-[#C9A84C] px-5 py-2.5 rounded-full transition-all duration-300"
              >
                <span className="relative z-10 group-hover:text-[#080808] transition-colors duration-300 flex items-center gap-2">
                  <Plus size={13} strokeWidth={1.5} />
                  Neue Seite
                </span>
                <span className="absolute inset-0 bg-[#C9A84C] rounded-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              </button>
              <button
                onClick={() => navigate('/admin/pages')}
                className="flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase text-[#5a5550] hover:text-[#F5F0E8] transition-colors"
              >
                Alle Seiten
                <ChevronRight size={13} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Mini stats column */}
        <div className="flex lg:flex-col gap-3">
          {[
            { label: 'PAGES',  value: pages.length,        color: '#C9A84C' },
            { label: 'NAV',    value: navPages.length,      color: '#00C896' },
            { label: 'BLOCKS', value: totalBlocks,          color: '#4a9eff' },
            { label: 'SYS',    value: pages.filter(p=>p.isSystem).length, color: '#9A9590' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              className="flex-1 lg:flex-none border border-[#C9A84C]/8 rounded-xl p-4 bg-[#080808] min-w-[80px]"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
            >
              <p className="font-mono text-[9px] tracking-[0.14em] mb-1" style={{ color: s.color + '60' }}>
                {s.label}
              </p>
              <p className="font-display text-3xl" style={{ color: s.color }}>
                {s.value}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Row 2: Pages Grid ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="font-mono text-[10px] tracking-[0.18em] text-[#3a3530] uppercase">
            ── SEITEN
          </p>
          <Link
            to="/admin/pages"
            className="font-mono text-[10px] tracking-[0.1em] text-[#C9A84C]/40 hover:text-[#C9A84C] transition-colors flex items-center gap-1"
          >
            Alle <ArrowUpRight size={11} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {pages.map((page, i) => {
            const Icon = iconMap[page.nav?.icon ?? ''] ?? FileText
            return (
              <motion.div
                key={page.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.04 }}
              >
                <Link
                  to={`/admin/pages/${page.id}`}
                  className="group flex items-center gap-4 p-4 border border-[#ffffff]/4 rounded-xl bg-[#080808] hover:border-[#C9A84C]/25 hover:bg-[#C9A84C]/3 transition-all duration-200"
                >
                  {/* Icon box */}
                  <div className="w-10 h-10 rounded-xl border border-[#ffffff]/6 bg-[#0d0d0d] flex items-center justify-center text-[#3a3530] group-hover:text-[#C9A84C] group-hover:border-[#C9A84C]/20 transition-all duration-200 shrink-0">
                    <Icon size={16} strokeWidth={1.5} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-[#F5F0E8]/80 group-hover:text-[#F5F0E8] transition-colors truncate">
                        {page.title}
                      </p>
                      {page.isSystem && (
                        <span className="font-mono text-[8px] text-[#3a3530] border border-[#ffffff]/4 px-1.5 py-0.5 rounded shrink-0">
                          SYS
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="font-mono text-[10px] text-[#3a3530] truncate">
                        /{page.slug}
                      </p>
                      <span className="text-[#2a2a2a]">·</span>
                      <p className="font-mono text-[10px] text-[#3a3530] shrink-0">
                        {page.blocks.length}B
                      </p>
                      {page.nav?.visible && (
                        <>
                          <span className="text-[#2a2a2a]">·</span>
                          <span className="font-mono text-[9px] text-[#C9A84C]/40 shrink-0">NAV</span>
                        </>
                      )}
                    </div>
                  </div>

                  <ArrowUpRight
                    size={14}
                    strokeWidth={1.5}
                    className="text-[#2a2a2a] group-hover:text-[#C9A84C]/50 transition-colors shrink-0"
                  />
                </Link>
              </motion.div>
            )
          })}

          {/* New Page button */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + pages.length * 0.04 }}
          >
            <button
              onClick={() => navigate('/admin/pages/new')}
              className="group w-full flex items-center justify-center gap-3 p-4 border border-dashed border-[#C9A84C]/15 rounded-xl hover:border-[#C9A84C]/40 hover:bg-[#C9A84C]/3 transition-all duration-200 h-[72px]"
            >
              <Plus size={16} strokeWidth={1.5} className="text-[#3a3530] group-hover:text-[#C9A84C] transition-colors" />
              <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-[#3a3530] group-hover:text-[#C9A84C] transition-colors">
                Neue Seite
              </span>
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Row 3: System Info ────────────────────────────── */}
      <motion.div
        className="border border-[#C9A84C]/8 rounded-xl p-5 bg-[#080808]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Zap size={12} strokeWidth={1.5} className="text-[#C9A84C]/40" />
            <span className="font-mono text-[10px] text-[#3a3530] tracking-[0.1em]">STACK</span>
            <span className="font-mono text-[10px] text-[#5a5550]">React · Vite · TS · Zustand</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe size={12} strokeWidth={1.5} className="text-[#C9A84C]/40" />
            <span className="font-mono text-[10px] text-[#3a3530] tracking-[0.1em]">DOMAIN</span>
            <span className="font-mono text-[10px] text-[#5a5550]">candlescope.de</span>
          </div>
          <div className="flex items-center gap-2">
            <Layers size={12} strokeWidth={1.5} className="text-[#C9A84C]/40" />
            <span className="font-mono text-[10px] text-[#3a3530] tracking-[0.1em]">PHASE</span>
            <span className="font-mono text-[10px] text-[#00C896]">1 · AKTIV</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#3a3530] tracking-[0.1em]">AUTH</span>
            <span className="font-mono text-[10px] text-[#C9A84C]/60">BYPASS · DEV</span>
          </div>
        </div>
      </motion.div>

    </div>
  )
}