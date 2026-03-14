import { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import {
  TrendingUp,
  Code2,
  User,
  MessageSquare,
  Shield,
  Menu,
  X,
  ChevronRight,
  Mail,
} from 'lucide-react'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
  tooltip: string
}

const navItems: NavItem[] = [
  {
    to: '/finance',
    label: 'Finance',
    icon: <TrendingUp size={18} strokeWidth={1.5} />,
    tooltip: 'Haushaltsbuch · Trading · Tools',
  },
  {
    to: '/dev',
    label: 'Dev & Web',
    icon: <Code2 size={18} strokeWidth={1.5} />,
    tooltip: 'Websites · Coding · Projekte',
  },
  {
    to: '/about',
    label: 'About',
    icon: <User size={18} strokeWidth={1.5} />,
    tooltip: 'Über mich · Angebote · CV',
  },
  {
    to: '/community',
    label: 'Community',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <circle cx="9" cy="10" r="1" fill="currentColor" />
        <circle cx="12" cy="10" r="1" fill="currentColor" />
        <circle cx="15" cy="10" r="1" fill="currentColor" />
      </svg>
    ),
    tooltip: 'Discord · Community · Events',
  },
  {
    to: '/contact',
    label: 'Kontakt',
    icon: <MessageSquare size={18} strokeWidth={1.5} />,
    tooltip: 'Anfragen · Kooperationen',
  },
]

/* ─── Desktop Tooltip (nach unten) ────────────────────────── */
function DesktopTooltip({ text }: { text: string }) {
  return (
    <div className="
      absolute top-full left-1/2 -translate-x-1/2 mt-3
      px-3 py-1.5
      bg-[#0f0f0f] border border-[#C9A84C]/20
      text-[#9A9590] text-[10px] tracking-[0.1em] uppercase whitespace-nowrap
      rounded-lg shadow-xl shadow-black/60
      pointer-events-none
      opacity-0 group-hover:opacity-100
      translate-y-1 group-hover:translate-y-0
      transition-all duration-200 delay-100
      z-50
    ">
      {text}
      <span className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0f0f0f] border-l border-t border-[#C9A84C]/20 rotate-45" />
    </div>
  )
}

/* ─── Mobile Sidebar Tooltip (nach links) ─────────────────── */
function SidebarTooltip({ label, tooltip }: { label: string; tooltip: string }) {
  return (
    <div className="
      absolute right-full mr-4 top-1/2 -translate-y-1/2
      pointer-events-none
      opacity-0 group-hover:opacity-100
      translate-x-2 group-hover:translate-x-0
      transition-all duration-200 delay-75
      z-50 min-w-max
    ">
      <div className="bg-[#0f0f0f] border border-[#C9A84C]/20 rounded-xl px-3.5 py-2.5 shadow-2xl shadow-black/60">
        <p className="text-[13px] font-medium text-[#F5F0E8] tracking-[0.02em]">{label}</p>
        <p className="text-[10px] text-[#5a5550] tracking-[0.08em] uppercase mt-0.5">{tooltip}</p>
      </div>
      {/* Arrow → rechts */}
      <span className="
        absolute left-full top-1/2 -translate-y-1/2 -ml-px
        border-t-[5px] border-t-transparent
        border-b-[5px] border-b-transparent
        border-l-[6px] border-l-[#C9A84C]/20
      " />
    </div>
  )
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted]   = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    if (menuOpen) {
      requestAnimationFrame(() => setTimeout(() => setMounted(true), 20))
    } else {
      setMounted(false)
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      {/* ══════════════════════════════════════════════════════
          DESKTOP TOP NAV  (lg+)
      ══════════════════════════════════════════════════════ */}
      <header className={`
        fixed top-0 left-0 right-0 z-50
        hidden lg:flex items-center justify-between
        px-12 xl:px-20
        transition-all duration-500
        ${scrolled
          ? 'h-16 bg-[#080808]/95 backdrop-blur-2xl border-b border-[#C9A84C]/10 shadow-xl shadow-black/40'
          : 'h-20 bg-transparent'
        }
      `}>

        {/* Logo */}
        <Link to="/" className="group flex items-center gap-3 shrink-0">
          <div className="relative w-7 h-7 shrink-0">
            <div className="absolute inset-0 border border-[#C9A84C]/50 rotate-45 group-hover:rotate-[225deg] transition-transform duration-700 rounded-sm" />
            <div className="absolute inset-[5px] bg-[#C9A84C]/15 rotate-45 group-hover:rotate-[225deg] transition-transform duration-700 delay-75 rounded-sm" />
            <div className="absolute inset-[9px] bg-[#C9A84C] rotate-45 group-hover:scale-125 transition-transform duration-300 rounded-sm" />
          </div>
          <span className={`
            font-display tracking-[0.15em] text-[#F5F0E8] uppercase
            transition-all duration-500
            ${scrolled ? 'text-base' : 'text-lg'}
          `}>
            Candle<span className="text-[#C9A84C]">Scope</span>
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-1">
          {navItems.map(({ to, label, icon, tooltip }) => (
            <div key={to} className="relative group">
              <NavLink
                to={to}
                className={({ isActive }) => `
                  relative flex items-center gap-2
                  px-4 py-2.5
                  text-[11px] tracking-[0.1em] uppercase
                  rounded-lg
                  transition-colors duration-250
                  ${isActive
                    ? 'text-[#C9A84C]'
                    : 'text-[#5a5550] hover:text-[#F5F0E8]'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <span className={`
                      shrink-0 transition-colors duration-250
                      ${isActive ? 'text-[#C9A84C]' : 'text-[#3a3530] group-hover:text-[#C9A84C]/70'}
                    `}>
                      {icon}
                    </span>
                    {label}
                    {/* Active underline */}
                    <span className={`
                      absolute bottom-0 left-4 right-4 h-px
                      bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent
                      transition-opacity duration-300
                      ${isActive ? 'opacity-100' : 'opacity-0'}
                    `} />
                  </>
                )}
              </NavLink>
              <DesktopTooltip text={tooltip} />
            </div>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4 shrink-0">
          <Link
            to="/admin"
            className="group flex items-center gap-1.5 text-[10px] tracking-[0.12em] uppercase text-[#2a2a2a] hover:text-[#C9A84C] transition-colors duration-250"
          >
            <Shield size={13} strokeWidth={1.5} className="group-hover:scale-110 transition-transform shrink-0" />
            Admin
          </Link>

          <div className="w-px h-4 bg-[#C9A84C]/15" />

          <a
            href="mailto:hello@candlescope.de"
            className="relative overflow-hidden group text-[10px] tracking-[0.15em] uppercase border border-[#C9A84C]/35 text-[#C9A84C] px-5 py-2.5 rounded-full transition-colors duration-300"
          >
            <span className="relative z-10 group-hover:text-[#080808] transition-colors duration-300">
              Hire me
            </span>
            <span className="absolute inset-0 bg-[#C9A84C] rounded-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          </a>
        </div>
      </header>


      {/* ══════════════════════════════════════════════════════
          MOBILE / TABLET RIGHT ICON SIDEBAR  (< lg)
          Immer sichtbar — feste Position rechts, mittig-oben
      ══════════════════════════════════════════════════════ */}
      <aside className={`
        fixed right-0 z-40
        lg:hidden
        flex flex-col items-center
        transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
        ${menuOpen ? 'opacity-0 translate-x-4 pointer-events-none' : 'opacity-100 translate-x-0'}
      `}
        style={{ top: '30%' }}
      >
        {/* Pill container — dockt rechts an */}
        <div className="
          flex flex-col items-center gap-1
          bg-[#0d0d0d]/90 backdrop-blur-2xl
          border border-r-0 border-[#C9A84C]/12
          rounded-l-2xl
          px-2 py-3
          shadow-2xl shadow-black/60
        ">

          {/* Logo mini */}
          <Link to="/" className="group w-10 h-10 flex items-center justify-center rounded-xl transition-colors duration-200 hover:bg-[#C9A84C]/8 mb-0.5">
            <div className="relative w-5 h-5 shrink-0">
              <div className="absolute inset-0 border border-[#C9A84C]/50 rotate-45 group-hover:rotate-[225deg] transition-transform duration-700 rounded-sm" />
              <div className="absolute inset-[3px] bg-[#C9A84C]/15 rotate-45 rounded-sm" />
              <div className="absolute inset-[7px] bg-[#C9A84C] rotate-45 rounded-sm" />
            </div>
          </Link>

          {/* Divider */}
          <div className="w-5 h-px bg-[#C9A84C]/20 my-1" />

          {/* Nav Items */}
          {navItems.map(({ to, label, icon, tooltip }, i) => (
            <div
              key={to}
              className="relative group"
              style={{
                animationDelay: `${i * 60}ms`,
              }}
            >
              <NavLink
                to={to}
                className={({ isActive }) => `
                  w-10 h-10 flex items-center justify-center
                  rounded-xl
                  transition-all duration-200
                  ${isActive
                    ? 'bg-[#C9A84C]/15 text-[#C9A84C] shadow-inner'
                    : 'text-[#3a3530] hover:bg-[#C9A84C]/8 hover:text-[#C9A84C]'
                  }
                `}
              >
                {({ isActive }) => (
                  <span className={`transition-colors duration-200 ${isActive ? 'text-[#C9A84C]' : ''}`}>
                    {icon}
                  </span>
                )}
              </NavLink>

              {/* Active indicator — goldene Linie links */}
              <NavLink to={to} tabIndex={-1} className="absolute left-0 top-2 bottom-2 pointer-events-none">
                {({ isActive }) => (
                  <span className={`
                    block w-0.5 h-full rounded-full
                    transition-all duration-300
                    ${isActive ? 'bg-[#C9A84C] opacity-100' : 'opacity-0'}
                  `} />
                )}
              </NavLink>

              <SidebarTooltip label={label} tooltip={tooltip} />
            </div>
          ))}

          {/* Divider */}
          <div className="w-5 h-px bg-[#C9A84C]/20 my-1" />

          {/* Menu open */}
          <button
            onClick={() => setMenuOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-[#2a2a2a] hover:bg-[#C9A84C]/8 hover:text-[#C9A84C] transition-all duration-200"
            aria-label="Menü öffnen"
          >
            <Menu size={16} strokeWidth={1.5} />
          </button>

          {/* Mail mini */}
          <a
            href="mailto:hello@candlescope.de"
            className="w-10 h-10 flex items-center justify-center rounded-xl text-[#2a2a2a] hover:bg-[#C9A84C]/8 hover:text-[#C9A84C] transition-all duration-200"
            aria-label="Kontakt"
          >
            <Mail size={15} strokeWidth={1.5} />
          </a>
        </div>
      </aside>


      {/* ══════════════════════════════════════════════════════
          FULLSCREEN MENU (beide Breakpoints)
      ══════════════════════════════════════════════════════ */}
      <div
        className={`fixed inset-0 z-[60] ${menuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        style={{ opacity: menuOpen ? 1 : 0, transition: 'opacity 0.35s ease' }}
      >
        {/* BG */}
        <div className="absolute inset-0 bg-[#060606]" />

        {/* Gold accent lines */}
        <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-[#C9A84C]/12 to-transparent" />
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-[#C9A84C]/12 to-transparent" />

        {/* Top bar */}
        <div className="relative flex items-center justify-between px-6 md:px-12 h-16 border-b border-[#C9A84C]/10">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="font-display text-base tracking-[0.14em] text-[#F5F0E8] uppercase"
          >
            Candle<span className="text-[#C9A84C]">Scope</span>
          </Link>
          <button
            onClick={() => setMenuOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-[#C9A84C]/20 text-[#9A9590] hover:text-[#C9A84C] hover:border-[#C9A84C]/50 transition-all duration-300"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="relative flex flex-col justify-center h-[calc(100%-8rem)] px-6 md:px-16">
          {navItems.map(({ to, label, icon, tooltip }, i) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              style={{
                transitionDelay: mounted ? `${i * 65}ms` : '0ms',
                opacity:   mounted ? 1 : 0,
                transform: mounted ? 'translateY(0px)' : 'translateY(18px)',
                transition: 'opacity 0.4s ease, transform 0.4s ease',
              }}
              className={({ isActive }) => `
                group flex items-center justify-between
                py-5 md:py-6
                border-b border-[#ffffff]/4
                ${isActive ? 'text-[#C9A84C]' : 'text-[#3a3530] hover:text-[#F5F0E8]'}
              `}
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-5 md:gap-8">
                    <span className={`transition-colors duration-300 ${isActive ? 'text-[#C9A84C]' : 'text-[#2a2a2a] group-hover:text-[#C9A84C]'}`}>
                      {icon}
                    </span>
                    <div className="flex flex-col gap-0.5 md:gap-1">
                      <span className="font-display text-2xl md:text-3xl tracking-[0.05em] transition-colors duration-300">
                        {label}
                      </span>
                      <span className="text-[10px] tracking-[0.12em] text-[#2a2a2a] group-hover:text-[#5a5550] transition-colors uppercase">
                        {tooltip}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    strokeWidth={1.5}
                    className={`shrink-0 transition-all duration-300 group-hover:translate-x-1.5 ${isActive ? 'text-[#C9A84C]' : 'text-[#2a2a2a] group-hover:text-[#5a5550]'}`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom bar */}
        <div
          className="relative flex items-center justify-between px-6 md:px-16 h-16 border-t border-[#C9A84C]/10"
          style={{
            transitionDelay: mounted ? '360ms' : '0ms',
            opacity:   mounted ? 1 : 0,
            transform: mounted ? 'translateY(0px)' : 'translateY(10px)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
          }}
        >
          <Link
            to="/admin"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase text-[#2a2a2a] hover:text-[#C9A84C] transition-colors"
          >
            <Shield size={13} strokeWidth={1.5} />
            Admin
          </Link>
          <a
            href="mailto:hello@candlescope.de"
            className="relative overflow-hidden group text-[10px] tracking-[0.16em] uppercase border border-[#C9A84C]/30 text-[#C9A84C] px-6 py-2.5 rounded-full"
          >
            <span className="relative z-10 group-hover:text-[#080808] transition-colors duration-300">Hire me</span>
            <span className="absolute inset-0 bg-[#C9A84C] rounded-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          </a>
        </div>
      </div>
    </>
  )
}