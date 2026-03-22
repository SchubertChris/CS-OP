/* ============================================================
   CandleScope — Admin Command Center Dashboard
   src/admin/AdminDashboard.tsx
   ============================================================ */

import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FileText, Plus, TrendingUp, Code2, User,
  MessageSquare, ArrowUpRight, ChevronRight,
  Layers, Zap, Globe,
} from 'lucide-react'
import { usePagesStore } from '../store/usePagesStore'

const iconMap: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  TrendingUp, Code2, User, MessageSquare, FileText, Globe, Layers,
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { pages, loadPages } = usePagesStore()

  useEffect(() => { loadPages() }, [loadPages])

  const navPages    = pages.filter(p => p.nav?.visible)
  const livePages   = pages.filter(p => p.published)
  const totalBlocks = pages.reduce((a, p) => a + p.blocks.length, 0)

  return (
    <div className="min-h-full p-6 md:p-10 flex flex-col gap-6">

      {/* ── Row 1: Welcome + Stats ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6">

        {/* Welcome module */}
        <div className="relative overflow-hidden border border-[#C9A84C]/15 rounded-2xl p-8 bg-[#080808]">
          {/* Candlestick deco */}
          <svg className="absolute right-0 top-0 h-full w-64 pointer-events-none opacity-[0.06]"
            viewBox="0 0 256 160" preserveAspectRatio="xMaxYMid meet">
            {[
              {x:20,o:80,c:110,h:120,l:70},{x:50,o:110,c:95,h:118,l:88},
              {x:80,o:95,c:125,h:132,l:92},{x:110,o:125,c:108,h:130,l:100},
              {x:140,o:108,c:138,h:145,l:105},{x:170,o:138,c:120,h:142,l:115},
              {x:200,o:120,c:148,h:155,l:118},{x:230,o:148,c:135,h:152,l:128},
            ].map((c, i) => {
              const s = 0.8, base = 160
              return (
                <g key={i}>
                  <line x1={c.x} y1={base-c.h*s} x2={c.x} y2={base-c.l*s} stroke="#C9A84C" strokeWidth="1"/>
                  <rect x={c.x-8} y={base-Math.max(c.o,c.c)*s} width="16"
                    height={Math.max(Math.abs(c.c-c.o)*s,3)}
                    fill={c.c>c.o?'#C9A84C':'none'} stroke="#C9A84C" strokeWidth="1"/>
                </g>
              )
            })}
          </svg>

          <div className="relative z-10">
            <p className="font-mono text-[11px] tracking-[0.2em] text-[#9A9590] uppercase mb-3">── COMMAND CENTER ──</p>
            <h1 className="font-display text-4xl md:text-5xl text-[#F5F0E8] tracking-tight leading-none mb-2">
              Willkommen,<br /><span className="text-[#C9A84C]">Chris.</span>
            </h1>
            <p className="text-[#9A9590] text-[14px] mt-4 font-mono tracking-[0.04em]">
              {pages.length} Seiten · {totalBlocks} Blöcke · {livePages.length} live
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => navigate('/admin/pages/new')}
                className="relative overflow-hidden group flex items-center gap-2 text-[12px] tracking-[0.12em] uppercase border border-[#C9A84C]/40 text-[#C9A84C] px-5 py-2.5 rounded-full"
              >
                <span className="relative z-10 group-hover:text-[#080808] transition-colors duration-300 flex items-center gap-2">
                  <Plus size={13} strokeWidth={1.5} /> Neue Seite
                </span>
                <span className="absolute inset-0 bg-[#C9A84C] rounded-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              </button>
              <button
                onClick={() => navigate('/admin/pages')}
                className="flex items-center gap-2 text-[12px] tracking-[0.12em] uppercase text-[#9A9590] hover:text-[#F5F0E8] transition-colors"
              >
                Alle Seiten <ChevronRight size={13} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Stats column */}
        <div className="flex lg:flex-col gap-3">
          {[
            { label: 'PAGES',  value: pages.length,    color: '#C9A84C' },
            { label: 'LIVE',   value: livePages.length, color: '#00C896' },
            { label: 'BLOCKS', value: totalBlocks,      color: '#4a9eff' },
            { label: 'NAV',    value: navPages.length,  color: '#9A9590' },
          ].map(s => (
            <div key={s.label} className="flex-1 lg:flex-none border border-[#C9A84C]/10 rounded-xl p-4 bg-[#080808] min-w-[88px]">
              <p className="font-mono text-[11px] tracking-[0.14em] mb-1.5" style={{ color: s.color + '80' }}>{s.label}</p>
              <p className="font-display text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Row 2: Pages Grid ──────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="font-mono text-[11px] tracking-[0.18em] text-[#9A9590] uppercase">── SEITEN</p>
          <Link to="/admin/pages"
            className="font-mono text-[12px] tracking-[0.1em] text-[#C9A84C]/50 hover:text-[#C9A84C] transition-colors flex items-center gap-1">
            Alle <ArrowUpRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {pages.map(page => {
            const Icon = iconMap[page.nav?.icon ?? ''] ?? FileText
            return (
              <Link
                key={page.id}
                to={`/admin/pages/${page.id}`}
                className="group flex items-center gap-4 p-4 border border-[#ffffff]/6 rounded-xl bg-[#0d0d0d] hover:border-[#C9A84C]/25 hover:bg-[#C9A84C]/3 transition-all duration-200"
              >
                <div className="w-11 h-11 rounded-xl border border-[#ffffff]/8 bg-[#1a1a1a] flex items-center justify-center text-[#9A9590] group-hover:text-[#C9A84C] group-hover:border-[#C9A84C]/25 transition-all shrink-0">
                  <Icon size={17} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-medium text-[#F5F0E8] group-hover:text-[#C9A84C] transition-colors truncate">{page.title}</p>
                    {page.isSystem && <span className="font-mono text-[9px] text-[#9A9590] border border-[#ffffff]/10 px-1.5 py-0.5 rounded shrink-0">SYS</span>}
                    {page.published && <span className="font-mono text-[9px] text-[#00C896] border border-[#00C896]/20 px-1.5 py-0.5 rounded shrink-0">LIVE</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="font-mono text-[12px] text-[#9A9590] truncate">/{page.slug}</p>
                    <span className="text-[#5a5550]">·</span>
                    <p className="font-mono text-[12px] text-[#5a5550] shrink-0">{page.blocks.length}B</p>
                  </div>
                </div>
                <ArrowUpRight size={14} strokeWidth={1.5} className="text-[#5a5550] group-hover:text-[#C9A84C]/60 transition-colors shrink-0" />
              </Link>
            )
          })}

          {/* New page button */}
          <button
            onClick={() => navigate('/admin/pages/new')}
            className="group flex items-center justify-center gap-3 p-4 border border-dashed border-[#C9A84C]/20 rounded-xl hover:border-[#C9A84C]/45 hover:bg-[#C9A84C]/3 transition-all duration-200 h-[72px]"
          >
            <Plus size={16} strokeWidth={1.5} className="text-[#9A9590] group-hover:text-[#C9A84C] transition-colors" />
            <span className="font-mono text-[12px] tracking-[0.12em] uppercase text-[#9A9590] group-hover:text-[#C9A84C] transition-colors">
              Neue Seite
            </span>
          </button>
        </div>
      </div>

      {/* ── Row 3: System info ─────────────────────── */}
      <div className="border border-[#C9A84C]/8 rounded-xl p-5 bg-[#080808]">
        <div className="flex flex-wrap items-center gap-6">
          {[
            { icon: Zap,    label: 'STACK',  value: 'React · Vite · TS · Zustand' },
            { icon: Globe,  label: 'DOMAIN', value: 'candlescope.de' },
            { icon: Layers, label: 'PHASE',  value: '1 · AKTIV' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon size={13} strokeWidth={1.5} className="text-[#C9A84C]/50" />
              <span className="font-mono text-[11px] text-[#5a5550] tracking-[0.1em]">{label}</span>
              <span className="font-mono text-[12px] text-[#9A9590]">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}