/* ============================================================
   CandleScope — Header
   src/components/layout/Header.tsx
   ============================================================ */

import { useState, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import {
  Code2, User, MessageSquare,
  ChevronRight, Mail, LogIn, Sun, Moon, Calendar,
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
  { to: '/dev',       label: 'Dev & Web', icon: <Code2 size={18} strokeWidth={1.5} />,         tooltip: 'Websites · Coding · Projekte' },
  { to: '/about',     label: 'About',     icon: <User size={18} strokeWidth={1.5} />,           tooltip: 'Über mich · Angebote · CV' },
  { to: '/community', label: 'Community', icon: <MessageSquare size={18} strokeWidth={1.5} />, tooltip: 'Discord · Community · Events' },
  { to: '/contact',   label: 'Kontakt',   icon: <Mail size={18} strokeWidth={1.5} />,           tooltip: 'Anfragen · Kooperationen' },
]

function DesktopTooltip({ text }: { text: string }) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 px-3 py-1.5 bg-[var(--cs-s2)] border border-[#C9A84C]/20 text-[var(--cs-text-2)] text-[10px] tracking-[0.1em] uppercase whitespace-nowrap rounded-lg shadow-xl shadow-black/60 pointer-events-none opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-[opacity,transform] duration-200 delay-100 z-50">
      {text}
      <span className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--cs-s2)] border-l border-t border-[#C9A84C]/20 rotate-45" />
    </div>
  )
}


export default function Header() {
  const [scrolled, setScrolled]         = useState(false)
  const [sidebarOpen, setSidebarOpen]   = useState(false)
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
        transition-[background-color,border-color,box-shadow,height] duration-500
        ${scrolled
          ? 'h-16 backdrop-blur-2xl border-b border-[#C9A84C]/10 shadow-xl shadow-black/40'
          : 'h-20 bg-transparent'
        }
      `}
      style={scrolled ? { background: 'var(--cs-header-bg)' } : undefined}>
        <Link to="/" aria-label="CandleScope Startseite" className="group flex items-center gap-3 shrink-0">
          <img src={csLogo} alt=""
            className="w-9 h-9 object-contain transition-transform duration-300 group-hover:scale-105" />
          <span className="font-display tracking-[0.15em] text-[var(--cs-text)] uppercase text-base">
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
          <button onClick={toggle} aria-label="Theme wechseln"
            className="w-8 h-8 flex items-center justify-center rounded-full border border-[#C9A84C]/45 text-[var(--cs-text)] transition-colors duration-200 cursor-pointer bg-transparent">
            {theme === 'dark' ? <Sun size={14} strokeWidth={1.5} /> : <Moon size={14} strokeWidth={1.5} />}
          </button>
          <a
            href={`https://app.candlescope.de/login?theme=${theme}`}
            aria-label="Zum CandleScope Login"
            className="flex items-center gap-1.5 text-[11px] tracking-[0.12em] uppercase px-4 py-2 rounded-full border border-[#C9A84C]/45 text-[var(--cs-text)] font-semibold transition-colors duration-200 bg-transparent"
          >
            <LogIn size={12} strokeWidth={2} />
            Login
          </a>
          <button
            data-cal-link="chris-schubert-9newp6"
            aria-label="Termin vereinbaren"
            className="flex items-center gap-1.5 text-[11px] tracking-[0.12em] uppercase px-4 py-2 rounded-full bg-[var(--cs-gold)] text-[var(--cs-on-gold)] font-semibold transition-colors duration-200 hover:bg-[var(--cs-gold-hi)] cursor-pointer"
          >
            <Calendar size={12} strokeWidth={2} />
            Termin
          </button>
        </div>
      </header>

      {/* ── Mobile Icon Sidebar ──────────────────────────── */}
      <div className="fixed right-0 top-[30%] z-40 lg:hidden flex items-center">

        {/* Lasche — groß genug zum Antippen */}
        <button
          onClick={() => setSidebarOpen(v => !v)}
          aria-label={sidebarOpen ? 'Navigation schließen' : 'Navigation öffnen'}
          className="w-8 h-16 flex items-center justify-center border border-[#C9A84C]/20 border-r-0 rounded-l-xl text-[#C9A84C]/60 hover:text-[#C9A84C] transition-colors duration-200 shrink-0"
          style={{ background: 'var(--cs-sidebar-mob)' }}
        >
          <ChevronRight
            size={15} strokeWidth={2}
            className={`transition-transform duration-300 ${sidebarOpen ? 'rotate-0' : 'rotate-180'}`}
          />
        </button>

        {/* Sidebar Panel */}
        <div
          className="flex flex-col gap-1 py-3 backdrop-blur-xl border border-[#C9A84C]/15 rounded-l-2xl overflow-hidden transition-[opacity] duration-300"
          style={{
            background: 'var(--cs-sidebar-mob)',
            width: sidebarOpen ? '164px' : '0px',
            opacity: sidebarOpen ? 1 : 0,
            padding: sidebarOpen ? '12px 8px' : '12px 0',
          }}
        >
          {/* Logo */}
          <Link to="/" aria-label="CandleScope Startseite"
            className="flex items-center gap-2.5 px-2 h-10 mb-1 shrink-0 overflow-hidden">
            <img src={csLogo} alt=""
              className="w-6 h-6 object-contain shrink-0 hover:scale-110 transition-transform duration-200" />
            <span className="font-display text-[11px] tracking-[0.12em] uppercase text-[var(--cs-text)] whitespace-nowrap">
              Candle<span className="text-[#C9A84C]">Scope</span>
            </span>
          </Link>

          <div className="h-px bg-[#C9A84C]/20 mb-1 mx-2 shrink-0" />

          {/* Nav items */}
          {navItems.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} aria-label={label}
              className={({ isActive }) => `
                relative flex items-center gap-3 px-2 h-10 rounded-xl transition-[background-color,color] duration-200 shrink-0 overflow-hidden
                ${isActive
                  ? 'bg-[#C9A84C]/15 text-[#C9A84C]'
                  : 'text-[var(--cs-text-2)] hover:bg-[#C9A84C]/8 hover:text-[#C9A84C]'
                }
              `}>
              {({ isActive }) => (
                <>
                  <span className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-full transition-opacity duration-300 ${isActive ? 'bg-[#C9A84C] opacity-100' : 'opacity-0'}`} />
                  <span className="shrink-0 ml-1">{icon}</span>
                  <span className="text-[11px] tracking-[0.08em] font-medium whitespace-nowrap">{label}</span>
                </>
              )}
            </NavLink>
          ))}

          <div className="h-px bg-[#C9A84C]/20 my-1 mx-2 shrink-0" />

          {/* App Login */}
          <a href={`https://app.candlescope.de/login?theme=${theme}`} aria-label="Zum CandleScope Login"
            className="flex items-center gap-3 px-2 h-10 rounded-xl text-[#C9A84C] hover:bg-[#C9A84C]/8 transition-colors duration-200 shrink-0 overflow-hidden">
            <span className="shrink-0 ml-1"><LogIn size={16} strokeWidth={1.5} /></span>
            <span className="text-[11px] tracking-[0.08em] font-medium whitespace-nowrap">Login</span>
          </a>

          {/* Hire me */}
          <Link to="/contact" aria-label="Hire me – Kontakt aufnehmen"
            className="flex items-center gap-3 px-2 h-10 rounded-xl text-[var(--cs-text-2)] hover:bg-[#C9A84C]/8 hover:text-[#C9A84C] transition-colors duration-200 shrink-0 overflow-hidden">
            <span className="shrink-0 ml-1"><Mail size={16} strokeWidth={1.5} /></span>
            <span className="text-[11px] tracking-[0.08em] font-medium whitespace-nowrap">Hire me</span>
          </Link>

          {/* Termin vereinbaren */}
          <button
            data-cal-link="chris-schubert-9newp6"
            aria-label="Termin vereinbaren"
            className="flex items-center gap-3 px-2 h-10 rounded-xl text-[var(--cs-text-2)] hover:bg-[#C9A84C]/8 hover:text-[#C9A84C] transition-colors duration-200 shrink-0 overflow-hidden w-full text-left cursor-pointer"
          >
            <span className="shrink-0 ml-1"><Calendar size={16} strokeWidth={1.5} /></span>
            <span className="text-[11px] tracking-[0.08em] font-medium whitespace-nowrap">Termin vereinbaren</span>
          </button>

          {/* Theme Toggle */}
          <button onClick={toggle} aria-label="Theme wechseln"
            className="flex items-center gap-3 px-2 h-10 rounded-xl text-[var(--cs-text-3)] hover:bg-[#C9A84C]/8 hover:text-[#C9A84C] transition-colors duration-200 cursor-pointer shrink-0 overflow-hidden w-full">
            <span className="shrink-0 ml-1">
              {theme === 'dark' ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
            </span>
            <span className="text-[11px] tracking-[0.08em] font-medium whitespace-nowrap">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>
        </div>
      </div>

    </>
  )
}