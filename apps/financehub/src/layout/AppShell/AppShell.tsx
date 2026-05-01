import { useState, useEffect, useRef } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  SquaresFour, Wallet, ChartLineUp, Target, Archive, Gear,
  MagnifyingGlass, X, ArrowRight, CaretDown, Plus,
  CurrencyBtc, Printer, ShareNetwork, DownloadSimple, Toolbox,
  Bell, User, SignOut, CheckCircle, Info, Warning,
  ArrowCounterClockwise,
} from '@phosphor-icons/react'
import { useAuthStore } from '../../store/authStore'
import { useShellStore, type ModalKey } from '../../store/shellStore'
import { BuchungsModal } from '../../features/transactions/components/BuchungsModal'
import { DruckVorschau } from '../../shared/components/DruckVorschau/DruckVorschau'
import { NotizModal } from '../../features/notes/components/NotizModal'
import { ExportModal } from '../../shared/components/ExportModal/ExportModal'
import { TeilenModal } from '../../shared/components/TeilenModal/TeilenModal'
import styles from './AppShell.module.scss'

const NAV = [
  { Icon: SquaresFour, label: 'Dashboard',     path: '/app/dashboard'    },
  { Icon: Wallet,      label: 'Konten',         path: '/app/accounts'     },
  { Icon: ChartLineUp, label: 'Analyse',        path: '/app/analytics'    },
  { Icon: Target,      label: 'Ziele',          path: '/app/goals'        },
  { Icon: Archive,     label: 'Archiv',         path: '/app/archive'      },
  { Icon: Gear,        label: 'Einstellungen',  path: '/app/settings'     },
]

const RADIAL_ACTIONS: { Icon: React.ElementType; label: string; action: ModalKey }[] = [
  { Icon: CurrencyBtc,    label: 'Neue Buchung', action: 'buchung' },
  { Icon: Printer,        label: 'Drucken',      action: 'druck'   },
  { Icon: ShareNetwork,   label: 'Teilen',       action: 'teilen'  },
  { Icon: Toolbox,        label: 'Notizen',      action: 'notes'   },
  { Icon: DownloadSimple, label: 'Export',       action: 'export'  },
]

const NOTIFS = [
  { Icon: CheckCircle, label: 'Zahlung eingegangen',  sub: '€ 2.400 von Kunde A',  time: 'vor 2 Min.',  unread: true,  color: '#22C55E' },
  { Icon: Warning,     label: 'Budget fast erreicht', sub: 'Essen: 92 %',           time: 'vor 18 Min.', unread: true,  color: '#F59E0B' },
  { Icon: Info,        label: 'Sync abgeschlossen',   sub: '3 neue Transaktionen',  time: 'vor 1 Std.',  unread: false, color: '#3B82F6' },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function ShellNotifPanel({ onClose }: { onClose: () => void }) {
  const unread = NOTIFS.filter(n => n.unread).length
  return (
    <div className={styles.panel} onClick={e => e.stopPropagation()}>
      <div className={styles.panelHead}>
        <span>Benachrichtigungen</span>
        <span className={styles.notifCount}>{unread} neu</span>
      </div>
      {NOTIFS.map((n, i) => (
        <div key={i} className={`${styles.notifRow} ${n.unread ? styles.notifUnread : ''}`} onClick={onClose}>
          <n.Icon size={14} weight="fill" style={{ color: n.color, flexShrink: 0 }} />
          <div className={styles.notifBody}>
            <span className={styles.notifTitle}>{n.label}</span>
            <span className={styles.notifSub}>{n.sub}</span>
          </div>
          <span className={styles.notifTime}>{n.time}</span>
        </div>
      ))}
    </div>
  )
}

function ShellUserMenu({ onClose, onLogout }: { onClose: () => void; onLogout: () => void }) {
  const user = useAuthStore(s => s.user)
  const initials = user?.displayName
    ? user.displayName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? 'CS'
  const name  = user?.displayName ?? user?.email ?? 'Nutzer'
  const email = user?.email ?? ''
  const navigate = useNavigate()

  return (
    <div className={`${styles.panel} ${styles.userPanel}`} onClick={e => e.stopPropagation()}>
      <div className={styles.userHead}>
        <div className={styles.avatarLg}>{initials}</div>
        <div>
          <div className={styles.userName}>{name}</div>
          <div className={styles.userEmail}>{email}</div>
        </div>
      </div>
      <div className={styles.divider} />
      {[
        { Icon: User, label: 'Profil',         path: '/app/settings' },
        { Icon: Gear, label: 'Einstellungen',  path: '/app/settings' },
      ].map(({ Icon, label, path }) => (
        <button key={label} className={styles.menuRow} onClick={() => { navigate(path); onClose() }}>
          <Icon size={13} /><span>{label}</span>
        </button>
      ))}
      <div className={styles.divider} />
      <button className={`${styles.menuRow} ${styles.menuLogout}`} onClick={onLogout}>
        <SignOut size={13} /><span>Abmelden</span>
      </button>
    </div>
  )
}

function ShellCmdPalette({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('')
  const inputRef  = useRef<HTMLInputElement>(null)
  const navigate  = useNavigate()
  const filtered  = NAV.filter(n => n.label.toLowerCase().includes(q.toLowerCase()))

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 40) }, [])
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  return (
    <div className={styles.cmdBackdrop} onClick={onClose}>
      <div className={styles.cmdBox} onClick={e => e.stopPropagation()}>
        <div className={styles.cmdSearch}>
          <MagnifyingGlass size={15} />
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Seite oder Aktion suchen…" />
          <button onClick={onClose}><X size={13} /></button>
        </div>
        <div className={styles.cmdList}>
          {filtered.map(({ Icon, label, path }) => (
            <button key={label} className={styles.cmdRow}
              onClick={() => { navigate(path); onClose() }}>
              <Icon size={15} weight="duotone" /><span>{label}</span>
              <ArrowRight size={10} className={styles.cmdArrow} />
            </button>
          ))}
          {filtered.length === 0 && <p className={styles.cmdEmpty}>Keine Treffer für „{q}"</p>}
        </div>
      </div>
    </div>
  )
}

function ShellStatusBar() {
  const [syncing, setSyncing] = useState(false)
  const user = useAuthStore(s => s.user)
  const sync = () => { setSyncing(true); setTimeout(() => setSyncing(false), 1800) }
  return (
    <footer className={styles.statusBar}>
      <div className={styles.statusLeft}>
        <span className={styles.statusDot} /><span>Verbunden</span>
      </div>
      <div className={styles.statusCenter}>
        <button className={`${styles.syncBtn} ${syncing ? styles.syncing : ''}`}
          onClick={e => { e.stopPropagation(); sync() }}>
          <ArrowCounterClockwise size={10} weight="bold" />
        </button>
        <span>{syncing ? 'Synchronisiere…' : 'Letzter Sync: vor 2 Min.'}</span>
      </div>
      <div className={styles.statusRight}>
        <span>{user?.email ?? ''}</span>
        <span className={styles.version}>v0.1.0</span>
      </div>
    </footer>
  )
}

// ── AppShell ──────────────────────────────────────────────────────────────────

export function AppShell() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { logout } = useAuthStore()

  const {
    openModal, setOpenModal,
    pillOpen, setPillOpen,
    cmdOpen, setCmdOpen,
    notifOpen, setNotifOpen,
    userOpen, setUserOpen,
    ringOpen, setRingOpen,
    closeAll,
  } = useShellStore()

  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 1024px)').matches)
  const user     = useAuthStore(s => s.user)
  const unread   = NOTIFS.filter(n => n.unread).length
  const activeIdx = NAV.findIndex(n => location.pathname.startsWith(n.path))
  const active    = activeIdx >= 0 ? activeIdx : 0
  const { Icon: ActiveIcon } = NAV[active]

  const initials = user?.displayName
    ? user.displayName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? 'CS'

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const fn = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(true) }
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [setCmdOpen])

  const R           = isDesktop ? 150 : 110
  const ANGLE_START = 180
  const ANGLE_END   = 268

  const handleRingAction = (action: ModalKey) => {
    setRingOpen(false)
    setOpenModal(action)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // dismiss openModal on outside click — placeholder until modals exist
  const handleBgClick = () => {
    closeAll()
    if (openModal) setOpenModal(null)
  }

  return (
    <div className={styles.shell} onClick={handleBgClick}>

      {/* ⌘K trigger */}
      <button className={styles.cmdTrigger} onClick={e => { e.stopPropagation(); setCmdOpen(true) }}>
        <MagnifyingGlass size={13} /><span>Suchen oder navigieren…</span><kbd>⌘K</kbd>
      </button>

      {/* Top-right: Notif + User */}
      <div className={styles.topRight} onClick={e => e.stopPropagation()}>
        <div className={styles.popWrap}>
          <button
            className={`${styles.iconBtn} ${notifOpen ? styles.iconActive : ''}`}
            onClick={() => { setNotifOpen(!notifOpen); setUserOpen(false); setRingOpen(false) }}
          >
            <Bell size={15} weight={notifOpen ? 'fill' : 'regular'} />
            {unread > 0 && <span className={styles.badge}>{unread}</span>}
          </button>
          {notifOpen && <ShellNotifPanel onClose={() => setNotifOpen(false)} />}
        </div>
        <div className={styles.popWrap}>
          <button
            className={`${styles.userChip} ${userOpen ? styles.chipActive : ''}`}
            onClick={() => { setUserOpen(!userOpen); setNotifOpen(false); setRingOpen(false) }}
          >
            <div className={styles.avatar}>{initials}</div>
            <span>{user?.displayName?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'Nutzer'}</span>
            <CaretDown size={9} className={`${styles.caret} ${userOpen ? styles.caretOpen : ''}`} />
          </button>
          {userOpen && <ShellUserMenu onClose={() => setUserOpen(false)} onLogout={handleLogout} />}
        </div>
      </div>

      {/* Main content */}
      <main className={styles.main}>
        <div className={styles.inner}>
          <Outlet />
        </div>
      </main>

      {/* Radial Ring */}
      <div className={styles.ringAnchor} onClick={e => e.stopPropagation()}>
        {RADIAL_ACTIONS.map(({ Icon, label, action }, i) => {
          const angle = (ANGLE_START + ((ANGLE_END - ANGLE_START) / (RADIAL_ACTIONS.length - 1)) * i) * (Math.PI / 180)
          const x = Math.cos(angle) * R
          const y = -Math.sin(angle) * R
          return (
            <div
              key={label}
              className={styles.ringItemWrap}
              style={{
                transform: ringOpen ? `translate(${x}px, ${y}px)` : 'translate(0,0) scale(0.3)',
                opacity: ringOpen ? 1 : 0,
                transitionDelay: ringOpen ? `${i * 40}ms` : `${(RADIAL_ACTIONS.length - 1 - i) * 25}ms`,
              }}
            >
              <button className={styles.ringItem} title={label} onClick={() => handleRingAction(action)}>
                <Icon size={16} weight="duotone" />
              </button>
            </div>
          )
        })}
        <button
          className={`${styles.ringBtn} ${ringOpen ? styles.ringBtnOpen : ''}`}
          onClick={() => { setRingOpen(!ringOpen); setUserOpen(false); setNotifOpen(false) }}
        >
          {ringOpen ? <X size={15} weight="bold" /> : <Plus size={15} weight="bold" />}
        </button>
      </div>

      {/* Pill Nav */}
      <div className={`${styles.pill} ${pillOpen ? styles.pillOpen : ''}`} onClick={e => e.stopPropagation()}>
        {pillOpen
          ? NAV.map(({ Icon, label, path }, i) => (
              <button
                key={label}
                className={`${styles.pillItem} ${active === i ? styles.pillActive : ''}`}
                onClick={() => { navigate(path); setPillOpen(false) }}
              >
                <Icon size={18} weight={active === i ? 'fill' : 'regular'} />
                <span>{label}</span>
              </button>
            ))
          : (
            <button className={styles.pillClosed} onClick={() => setPillOpen(true)}>
              <ActiveIcon size={18} weight="fill" />
              <span>{NAV[active].label}</span>
              <div className={styles.dots}>
                {NAV.map((_, i) => <span key={i} className={`${styles.dot} ${i === active ? styles.dotOn : ''}`} />)}
              </div>
            </button>
          )
        }
      </div>

      {/* Status Bar */}
      <ShellStatusBar />

      {/* Command Palette */}
      {cmdOpen && <ShellCmdPalette onClose={() => setCmdOpen(false)} />}

      {openModal === 'buchung' && <BuchungsModal onClose={() => setOpenModal(null)} />}
      {openModal === 'druck'   && <DruckVorschau onClose={() => setOpenModal(null)} />}
      {openModal === 'notes'   && <NotizModal    onClose={() => setOpenModal(null)} />}
      {openModal === 'export'  && <ExportModal   onClose={() => setOpenModal(null)} />}
      {openModal === 'teilen'  && <TeilenModal   onClose={() => setOpenModal(null)} />}
    </div>
  )
}
