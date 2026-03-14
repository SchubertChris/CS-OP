/* ============================================================
   CandleScope — Admin Command Center
   src/admin/AdminLayout.tsx

   Kein Sidebar. Kein Standard-Dashboard.
   Vollbild Command-Center — wie ein Trading Terminal.
   Navigation über schwebende Top-Bar mit Keyboard-Feeling.
   ============================================================ */

import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  Eye,
  Zap,
} from 'lucide-react'
import { useAdminStore } from '../store/useAdminStore'
import { usePagesStore } from '../store/usePagesStore'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { to: '/admin',           label: 'Command',  short: 'CMD', icon: LayoutDashboard, end: true  },
  { to: '/admin/pages',     label: 'Pages',    short: 'PGS', icon: FileText,        end: false },
  { to: '/admin/settings',  label: 'System',   short: 'SYS', icon: Settings,        end: false },
]

export default function AdminLayout() {
  const navigate    = useNavigate()
  const location    = useLocation()
  const { logout }  = useAdminStore()
  const { isDirty, pages } = usePagesStore()
  const [time, setTime] = useState(new Date())

  /* Live clock */
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const pad = (n: number) => String(n).padStart(2, '0')
  const timeStr = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`
  const dateStr = time.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F0E8] flex flex-col overflow-hidden">

      {/* ── Scan line effect ──────────────────────────────── */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(201,168,76,0.008) 2px, rgba(201,168,76,0.008) 4px)',
        }}
      />

      {/* ── Corner decorations ───────────────────────────── */}
      <div className="fixed top-0 left-0 w-16 h-16 pointer-events-none z-10">
        <div className="absolute top-3 left-3 w-6 h-px bg-[#C9A84C]/40" />
        <div className="absolute top-3 left-3 w-px h-6 bg-[#C9A84C]/40" />
      </div>
      <div className="fixed top-0 right-0 w-16 h-16 pointer-events-none z-10">
        <div className="absolute top-3 right-3 w-6 h-px bg-[#C9A84C]/40" />
        <div className="absolute top-3 right-3 w-px h-6 bg-[#C9A84C]/40" />
      </div>
      <div className="fixed bottom-0 left-0 w-16 h-16 pointer-events-none z-10">
        <div className="absolute bottom-3 left-3 w-6 h-px bg-[#C9A84C]/40" />
        <div className="absolute bottom-3 left-3 w-px h-6 bg-[#C9A84C]/40" />
      </div>
      <div className="fixed bottom-0 right-0 w-16 h-16 pointer-events-none z-10">
        <div className="absolute bottom-3 right-3 w-6 h-px bg-[#C9A84C]/40" />
        <div className="absolute bottom-3 right-3 w-px h-6 bg-[#C9A84C]/40" />
      </div>

      {/* ── Top Command Bar ───────────────────────────────── */}
      <header className="relative z-30 shrink-0">
        <div className="flex items-center justify-between px-6 md:px-10 h-14 border-b border-[#C9A84C]/12">

          {/* Left: Logo + Status */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2.5">
              <div className="relative w-5 h-5 shrink-0">
                <div className="absolute inset-0 border border-[#C9A84C]/60 rotate-45 rounded-sm" />
                <div className="absolute inset-[3px] bg-[#C9A84C]/20 rotate-45 rounded-sm" />
                <div className="absolute inset-[6px] bg-[#C9A84C] rotate-45 rounded-sm" />
              </div>
              <span className="font-display text-[11px] tracking-[0.2em] uppercase text-[#C9A84C]">
                CandleScope
              </span>
              <span className="text-[#3a3530] text-[10px] tracking-[0.1em]">/</span>
              <span className="font-mono text-[10px] tracking-[0.14em] text-[#5a5550] uppercase">
                Admin
              </span>
            </div>

            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-1.5">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-[#00C896]"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              <span className="font-mono text-[10px] text-[#3a3530] tracking-[0.1em]">LIVE</span>
            </div>
          </div>

          {/* Center: Nav */}
          <nav className="flex items-center gap-1">
            {navItems.map(({ to, label, short, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `relative flex items-center gap-2 px-3 md:px-4 py-1.5 transition-all duration-200 group ${
                    isActive
                      ? 'text-[#C9A84C]'
                      : 'text-[#3a3530] hover:text-[#9A9590]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={13} strokeWidth={1.5} className="shrink-0" />
                    <span className="hidden md:block font-mono text-[10px] tracking-[0.12em] uppercase">
                      {label}
                    </span>
                    <span className="md:hidden font-mono text-[10px] tracking-[0.12em] uppercase">
                      {short}
                    </span>
                    {isActive && (
                      <motion.div
                        className="absolute inset-x-0 -bottom-[1px] h-px bg-[#C9A84C]"
                        layoutId="nav-indicator"
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right: Clock + Actions */}
          <div className="flex items-center gap-4">
            {/* Dirty indicator */}
            <AnimatePresence>
              {isDirty && (
                <motion.div
                  className="flex items-center gap-1.5"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                >
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                  <span className="font-mono text-[10px] text-[#C9A84C]/60 tracking-[0.1em] hidden sm:block">
                    UNSAVED
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Clock */}
            <div className="hidden md:flex flex-col items-end">
              <span className="font-mono text-[11px] text-[#C9A84C]/70 tracking-[0.06em]">
                {timeStr}
              </span>
              <span className="font-mono text-[9px] text-[#3a3530] tracking-[0.06em]">
                {dateStr}
              </span>
            </div>

            <div className="w-px h-5 bg-[#C9A84C]/10" />

            {/* View site */}
            <button
              onClick={() => window.open('/', '_blank')}
              className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] uppercase text-[#3a3530] hover:text-[#C9A84C] transition-colors"
            >
              <Eye size={13} strokeWidth={1.5} />
              <span className="hidden sm:block">Site</span>
            </button>

            {/* Logout */}
            <button
              onClick={() => { logout(); navigate('/') }}
              className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] uppercase text-[#3a3530] hover:text-[#FF4444] transition-colors"
            >
              <LogOut size={13} strokeWidth={1.5} />
              <span className="hidden sm:block">Exit</span>
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-6 px-6 md:px-10 h-8 border-b border-[#C9A84C]/6 bg-[#080808]/50">
          <StatItem label="PAGES" value={String(pages.length)} />
          <StatItem label="NAV" value={String(pages.filter(p => p.nav?.visible).length)} />
          <StatItem label="BLOCKS" value={String(pages.reduce((a, p) => a + p.blocks.length, 0))} />
          <div className="ml-auto font-mono text-[9px] text-[#2a2a2a] tracking-[0.1em]">
            CS-ADMIN v1.0 · PHASE-1
          </div>
        </div>
      </header>

      {/* ── Page Content ─────────────────────────────────── */}
      <main className="flex-1 relative z-20 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-[9px] text-[#2a2a2a] tracking-[0.12em]">{label}</span>
      <span className="font-mono text-[9px] text-[#C9A84C]/60 tracking-[0.06em]">{value}</span>
    </div>
  )
}