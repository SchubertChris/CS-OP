/* ============================================================
   CandleScope — Header
   src/components/layout/Header.tsx
   ============================================================ */

import { useState, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import {
  TrendingUp, Code2, User, MessageSquare,
  Shield, ChevronRight, Mail,
} from 'lucide-react'
import csLogo from '../../assets/images/CandleScopeLogo.png'
import { useTheme } from '../../contexts/ThemeContext'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
  tooltip: string
}

const navItems: NavItem[] = [
  { to: '/finance',   label: 'Finance',   icon: <TrendingUp size={18} strokeWidth={1.5} />,   tooltip: 'Haushaltsbuch · Trading · Tools' },
  { to: '/dev',       label: 'Dev & Web', icon: <Code2 size={18} strokeWidth={1.5} />,         tooltip: 'Websites · Coding · Projekte' },
  { to: '/about',     label: 'About',     icon: <User size={18} strokeWidth={1.5} />,           tooltip: 'Über mich · Angebote · CV' },
  { to: '/community', label: 'Community', icon: <MessageSquare size={18} strokeWidth={1.5} />, tooltip: 'Discord · Community · Events' },
  { to: '/contact',   label: 'Kontakt',   icon: <Mail size={18} strokeWidth={1.5} />,           tooltip: 'Anfragen · Kooperationen' },
]

function DesktopTooltip({ text }: { text: string }) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 px-3 py-1.5 bg-[var(--cs-s2)] border border-[#C9A84C]/20 text-[var(--cs-text-2)] text-[10px] tracking-[0.1em] uppercase whitespace-nowrap rounded-lg shadow-xl shadow-black/60 pointer-events-none opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 delay-100 z-50">
      {text}
      <span className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--cs-s2)] border-l border-t border-[#C9A84C]/20 rotate-45" />
    </div>
  )
}

function SidebarTooltip({ label, tooltip }: { label: string; tooltip: string }) {
  return (
    <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200 delay-75 z-50 min-w-max hidden md:block">
      <div className="bg-[var(--cs-s2)] border border-[#C9A84C]/20 rounded-xl px-3.5 py-2.5 shadow-2xl shadow-black/60">
        <p className="text-[13px] font-medium text-[var(--cs-text)] tracking-[0.02em]">{label}</p>
        <p className="text-[10px] text-[var(--cs-text-2)] tracking-[0.08em] uppercase mt-0.5">{tooltip}</p>
      </div>
      <span className="absolute left-full top-1/2 -translate-y-1/2 -ml-px border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[6px] border-l-[#C9A84C]/20" />
    </div>
  )
}

export default function Header() {
  const [scrolled, setScrolled]       = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const { theme, toggle } = useTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setSidebarOpen(false) }, [pathname])

  return (
    <>
      {/* ── Desktop Top Nav ─────────────────────────────── */}
      <header className={`
        fixed top-0 left-0 right-0 z-50
        hidden lg:flex items-center justify-between
        px-12 xl:px-20
        transition-all duration-500
        ${scrolled
          ? 'h-16 backdrop-blur-2xl border-b border-[#C9A84C]/10 shadow-xl shadow-black/40'
          : 'h-20 bg-transparent'
        }
      `}
      style={scrolled ? { background: 'var(--cs-header-bg)' } : undefined}>
        <Link to="/" aria-label="CandleScope Startseite" className="group flex items-center gap-3 shrink-0">
          <img src={csLogo} alt="CandleScope Logo"
            className={`object-contain transition-all duration-500 group-hover:scale-105 ${scrolled ? 'w-8 h-8' : 'w-10 h-10'}`} />
          <span className={`font-display tracking-[0.15em] text-[var(--cs-text)] uppercase transition-all duration-500 ${scrolled ? 'text-sm' : 'text-base'}`}>
            Candle<span className="text-[#C9A84C]">Scope</span>
          </span>
        </Link>

        {/* Pill-Nav */}
        <nav className="flex items-center bg-[var(--cs-s3)] border border-[#C9A84C]/12 rounded-full px-5 py-1.5 gap-1">
          {navItems.map(({ to, label, tooltip }) => (
            <div key={to} className="relative group">
              <NavLink to={to} className={({ isActive }) => `
                relative px-4 py-2 text-[11px] tracking-[0.12em] uppercase font-medium
                transition-colors duration-200 rounded-full
                ${isActive
                  ? 'text-[#C9A84C] font-semibold'
                  : 'text-[var(--cs-text-2)] hover:text-[var(--cs-text)]'
                }
              `}>
                {label}
              </NavLink>
              <DesktopTooltip text={tooltip} />
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <Link to="/admin" aria-label="Admin Panel"
            className="group flex items-center gap-1.5 text-[11px] tracking-[0.12em] uppercase text-[var(--cs-text-2)] hover:text-[#C9A84C] transition-colors duration-250">
            <Shield size={13} strokeWidth={1.5} className="group-hover:scale-110 transition-transform shrink-0" />
            Admin
          </Link>
          <div className="w-px h-4 bg-[#C9A84C]/15" />
          <button onClick={toggle} aria-label="Theme wechseln"
            className="w-8 h-8 flex items-center justify-center rounded-full border border-[#C9A84C]/20 text-[#C9A84C]/60 hover:text-[#C9A84C] hover:border-[#C9A84C]/40 transition-all duration-200 cursor-pointer text-sm">
            {theme === 'dark' ? '☀' : '☽'}
          </button>
          <a
            href="/downloads/FinanceBoard-Setup.exe"
            download
            aria-label="FinanceBoard herunterladen"
            className="relative overflow-hidden group text-[11px] tracking-[0.15em] uppercase bg-[#C9A84C] text-[#080808] font-bold px-5 py-2.5 rounded-full transition-opacity duration-200 hover:opacity-90"
          >
            ↓ Gratis laden
          </a>
        </div>
      </header>

      {/* ── Mobile Icon Sidebar ──────────────────────────── */}
      {/* Wrapper — position fixed, immer sichtbar */}
      <div className="fixed right-0 top-[30%] z-40 lg:hidden flex items-center">

        {/* Toggle-Pfeil — IMMER sichtbar, unabhängig vom Sidebar-State */}
        <button
          onClick={() => setSidebarOpen(v => !v)}
          aria-label={sidebarOpen ? 'Navigation schließen' : 'Navigation öffnen'}
          className="w-5 h-10 flex items-center justify-center border border-[#C9A84C]/20 border-r-0 rounded-l-lg text-[#C9A84C]/60 hover:text-[#C9A84C] transition-colors duration-200 shrink-0"
          style={{ background: 'var(--cs-sidebar-mob)' }}
        >
          <ChevronRight
            size={12} strokeWidth={2}
            className={`transition-transform duration-300 ${sidebarOpen ? 'rotate-0' : 'rotate-180'}`}
          />
        </button>

        {/* Sidebar Panel — collapsed/expanded */}
        <div
          className="flex flex-col items-center gap-1 py-3 px-1.5 backdrop-blur-xl border border-[#C9A84C]/15 rounded-l-2xl overflow-hidden transition-all duration-300"
          style={{ background: 'var(--cs-sidebar-mob)' }}
          style={{ width: sidebarOpen ? '56px' : '0px', opacity: sidebarOpen ? 1 : 0 }}
        >
          {/* Logo */}
          <Link to="/" aria-label="CandleScope Startseite" className="flex items-center justify-center w-10 h-10 mb-1 shrink-0">
            <img src={csLogo} alt="CandleScope"
              className="w-7 h-7 object-contain hover:scale-110 transition-transform duration-200" />
          </Link>

          <div className="w-5 h-px bg-[#C9A84C]/20 mb-1 shrink-0" />

          {/* Nav items */}
          {navItems.map(({ to, label, icon, tooltip }) => (
            <div key={to} className="relative group shrink-0">
              <NavLink to={to} aria-label={label}
                className={({ isActive }) => `
                  relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200
                  ${isActive
                    ? 'bg-[#C9A84C]/15 text-[#C9A84C]'
                    : 'text-[var(--cs-text-2)] hover:bg-[#C9A84C]/8 hover:text-[#C9A84C]'
                  }
                `}>
                {({ isActive }) => (
                  <>
                    <span className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-full transition-all duration-300 ${isActive ? 'bg-[#C9A84C] opacity-100' : 'opacity-0'}`} />
                    {icon}
                  </>
                )}
              </NavLink>
              <SidebarTooltip label={label} tooltip={tooltip} />
            </div>
          ))}

          <div className="w-5 h-px bg-[#C9A84C]/20 my-1 shrink-0" />

          {/* Admin */}
          <div className="relative group shrink-0">
            <Link to="/admin" aria-label="Admin Panel"
              className="w-10 h-10 flex items-center justify-center rounded-xl text-[var(--cs-text-2)] hover:bg-[#C9A84C]/8 hover:text-[#C9A84C] transition-all duration-200">
              <Shield size={16} strokeWidth={1.5} />
            </Link>
            <SidebarTooltip label="Admin" tooltip="Panel · CMS" />
          </div>

          {/* Hire me */}
          <div className="relative group shrink-0">
            <Link to="/contact" aria-label="Hire me – Kontakt aufnehmen"
              className="w-10 h-10 flex items-center justify-center rounded-xl text-[var(--cs-text-2)] hover:bg-[#C9A84C]/8 hover:text-[#C9A84C] transition-all duration-200">
              <Mail size={16} strokeWidth={1.5} />
            </Link>
            <SidebarTooltip label="Hire me" tooltip="Kontakt aufnehmen" />
          </div>

          {/* Theme Toggle */}
          <div className="relative group shrink-0">
            <button onClick={toggle} aria-label="Theme wechseln"
              className="w-10 h-10 flex items-center justify-center rounded-xl text-[var(--cs-text-3)] hover:bg-[#C9A84C]/8 hover:text-[#C9A84C] transition-all duration-200 cursor-pointer text-base">
              {theme === 'dark' ? '☀' : '☽'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}