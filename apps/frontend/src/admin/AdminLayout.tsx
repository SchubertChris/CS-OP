/* ============================================================
   CandleScope — Admin Command Center Layout
   src/admin/AdminLayout.tsx
   ============================================================ */

import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, Settings, LogOut, Eye, Layers } from 'lucide-react'
import { useAdminStore } from '../store/useAdminStore'
import { usePagesStore } from '../store/usePagesStore'
import { motion, AnimatePresence } from 'framer-motion'
import csLogo from '../assets/images/CandleScopeLogo.png'

const navItems = [
  { to: '/admin', label: 'Command', short: 'CMD', icon: LayoutDashboard, end: true },
  { to: '/admin/pages', label: 'Pages', short: 'PGS', icon: FileText, end: false },
  { to: '/admin/settings', label: 'System', short: 'SYS', icon: Settings, end: false },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  useAdminStore() // sidebar state — logout via /api/auth/logout
  const { isDirty, pages } = usePagesStore()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const pad = (n: number) => String(n).padStart(2, '0')
  const timeStr = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`
  const dateStr = time.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div className="min-h-screen bg-[var(--cs-bg)] text-[var(--cs-text)] flex flex-col overflow-hidden">

      <div className="pointer-events-none fixed inset-0 z-0"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(201,168,76,0.006) 2px, rgba(201,168,76,0.006) 4px)' }} />

      {[['top-0 left-0', 'top-3 left-3'], ['top-0 right-0', 'top-3 right-3'], ['bottom-0 left-0', 'bottom-3 left-3'], ['bottom-0 right-0', 'bottom-3 right-3']].map(([pos, inner], i) => (
        <div key={i} className={`fixed ${pos} w-16 h-16 pointer-events-none z-10`}>
          <div className={`absolute ${inner} w-6 h-px bg-[#C9A84C]/30`} />
          <div className={`absolute ${inner} w-px h-6 bg-[#C9A84C]/30`} />
        </div>
      ))}

      <header className="relative z-30 shrink-0">

        {/* ── Zeile 1: Logo + Aktionen ───────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 md:px-10 h-12 md:h-14 border-b border-[#C9A84C]/15">

          {/* Logo */}
          <div className="flex items-center gap-2 md:gap-5">
            <div className="flex items-center gap-2">
              <img src={csLogo} alt="CandleScope" className="w-5 h-5 object-contain shrink-0" />
              <span className="font-display text-[11px] md:text-[12px] tracking-[0.18em] uppercase text-[#C9A84C]">CandleScope</span>
              <span className="text-[var(--cs-text-3)] text-[11px]">/</span>
              <span className="font-mono text-[10px] md:text-[11px] tracking-[0.14em] text-[var(--cs-text-2)] uppercase">Admin</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <motion.div className="w-1.5 h-1.5 rounded-full bg-[#00C896]"
                animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
              <span className="font-mono text-[11px] text-[var(--cs-text-2)] tracking-[0.1em]">LIVE</span>
            </div>
          </div>

          {/* Desktop-Nav — nur auf md+ */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) =>
                  `relative flex items-center gap-2 px-4 py-1.5 transition-all duration-200 ${isActive ? 'text-[#C9A84C]' : 'text-[var(--cs-text-2)] hover:text-[var(--cs-text)]'}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={14} strokeWidth={1.5} className="shrink-0" />
                    <span className="font-mono text-[11px] tracking-[0.12em] uppercase">{label}</span>
                    {isActive && (
                      <motion.div className="absolute inset-x-0 -bottom-[1px] h-px bg-[#C9A84C]"
                        layoutId="nav-indicator" transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }} />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Aktionen */}
          <div className="flex items-center gap-2 md:gap-4">
            <AnimatePresence>
              {isDirty && (
                <motion.div className="flex items-center gap-1.5"
                  initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}>
                  <motion.div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]"
                    animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1 }} />
                  <span className="font-mono text-[10px] text-[var(--cs-text-2)] tracking-[0.1em] hidden sm:block">UNSAVED</span>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="hidden md:flex flex-col items-end">
              <span className="font-mono text-[12px] text-[var(--cs-text-2)] tracking-[0.06em]">{timeStr}</span>
              <span className="font-mono text-[10px] text-[var(--cs-text-3)] tracking-[0.06em]">{dateStr}</span>
            </div>
            <div className="hidden md:block w-px h-5 bg-[#C9A84C]/15" />
            <a href="https://app.candlescope.de/app/dashboard" target="_blank" rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--cs-text-2)] hover:text-[#C9A84C] transition-colors">
              <Layers size={13} strokeWidth={1.5} />
              <span className="hidden md:block">Hub</span>
            </a>
            <button onClick={() => window.open('/', '_blank')}
              className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--cs-text-2)] hover:text-[#C9A84C] transition-colors">
              <Eye size={13} strokeWidth={1.5} />
              <span className="hidden md:block">Site</span>
            </button>
            <button onClick={async () => { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }); navigate('/') }}
              className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--cs-text-2)] hover:text-[#FF4444] transition-colors">
              <LogOut size={13} strokeWidth={1.5} />
              <span className="hidden sm:block">Exit</span>
            </button>
          </div>
        </div>

        {/* ── Zeile 2: Mobile-Nav (nur < md) ────────────────────────────── */}
        <nav className="flex md:hidden border-b border-[#C9A84C]/15">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `relative flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors duration-200 ${isActive ? 'text-[#C9A84C]' : 'text-[var(--cs-text-3)]'}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} strokeWidth={1.5} />
                  <span className="font-mono text-[9px] tracking-[0.12em] uppercase">{label}</span>
                  {isActive && (
                    <motion.div className="absolute inset-x-0 bottom-0 h-[2px] bg-[#C9A84C]"
                      layoutId="mob-nav-indicator" transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }} />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Stats-Leiste ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 md:gap-6 px-4 md:px-10 h-8 md:h-9 border-b border-[#C9A84C]/8 bg-[var(--cs-bg)]/50 overflow-x-auto">
          <StatItem label="PAGES" value={String(pages.length)} />
          <StatItem label="NAV" value={String(pages.filter(p => p.nav?.visible).length)} />
          <StatItem label="BLOCKS" value={String(pages.reduce((a, p) => a + p.blocks.length, 0))} />
          <div className="ml-auto shrink-0 font-mono text-[9px] md:text-[10px] text-[var(--cs-text-3)] tracking-[0.1em]">CS-ADMIN v1.0</div>
        </div>
      </header>

      <main className="flex-1 relative z-20 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[11px] text-[var(--cs-text-3)] tracking-[0.12em]">{label}</span>
      <span className="font-mono text-[12px] text-[var(--cs-text)] tracking-[0.06em] font-medium">{value}</span>
    </div>
  )
}