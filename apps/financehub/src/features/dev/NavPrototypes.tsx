import { useState, useEffect, useRef } from 'react'
import {
  SquaresFour, Wallet, ChartLineUp, Target, Gear, Archive,
  MagnifyingGlass, X, Plus, ArrowRight, CaretDown,
  Printer, ShareNetwork, Bookmark, DownloadSimple,
  Bell, User, SignOut, CheckCircle, Info, Warning,
  ArrowCounterClockwise,
} from '@phosphor-icons/react'
import styles from './NavPrototypes.module.scss'

const NAV = [
  { Icon: SquaresFour, label: 'Dashboard' },
  { Icon: Wallet,      label: 'Konten'    },
  { Icon: ChartLineUp, label: 'Analyse'   },
  { Icon: Target,      label: 'Ziele'     },
  { Icon: Archive,     label: 'Archiv'    },
  { Icon: Gear,        label: 'Einstellungen' },
]

// ── Mock Background ─────────────────────────────────────────────────────────────

function MockBg({ title }: { title: string }) {
  return (
    <div className={styles.mockBg}>
      <div className={styles.mockGrid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles.mockCard} />
        ))}
      </div>
      <span className={styles.sectionLabel}>{title}</span>
    </div>
  )
}

// ── 01 — Radial Command Ring ────────────────────────────────────────────────────

function RadialNav() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const R = 130

  return (
    <section className={styles.section} onClick={() => setOpen(false)}>
      <MockBg title="01 — Radial Command Ring" />
      <div className={styles.radialRoot} onClick={e => e.stopPropagation()}>
        {NAV.map(({ Icon, label }, i) => {
          const angle = (Math.PI / (NAV.length - 1)) * i
          const x = -Math.cos(angle) * R
          const y = -Math.sin(angle) * R
          return (
            <button
              key={label}
              className={`${styles.radialItem} ${active === i ? styles.active : ''}`}
              style={{
                transform: open ? `translate(${x}px, ${y}px) scale(1)` : 'translate(0,0) scale(0.4)',
                opacity: open ? 1 : 0,
                transitionDelay: open ? `${i * 40}ms` : `${(NAV.length - 1 - i) * 25}ms`,
              }}
              onClick={() => { setActive(i); setOpen(false) }}
              title={label}
            >
              <Icon size={19} weight={active === i ? 'fill' : 'duotone'} />
              <span>{label}</span>
            </button>
          )
        })}
        <button className={`${styles.fab} ${open ? styles.fabOpen : ''}`} onClick={() => setOpen(v => !v)}>
          {open ? <X size={22} weight="bold" /> : <Plus size={22} weight="bold" />}
        </button>
      </div>
    </section>
  )
}

// ── 02 — Command Palette ────────────────────────────────────────────────────────

function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) { setQuery(''); setTimeout(() => inputRef.current?.focus(), 50) }
  }, [open])

  const filtered = NAV.filter(n => n.label.toLowerCase().includes(query.toLowerCase()))

  return (
    <section className={styles.section}>
      <MockBg title="02 — Command Palette  ⌘K" />
      <button className={styles.cmdTrigger} onClick={() => setOpen(true)}>
        <MagnifyingGlass size={13} />
        <span>Suchen oder navigieren…</span>
        <kbd>⌘K</kbd>
      </button>
      {open && (
        <div className={styles.paletteBackdrop} onClick={() => setOpen(false)}>
          <div className={styles.palette} onClick={e => e.stopPropagation()}>
            <div className={styles.paletteSearch}>
              <MagnifyingGlass size={15} />
              <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Seite oder Aktion suchen…" />
              <button onClick={() => setOpen(false)}><X size={14} /></button>
            </div>
            <div className={styles.paletteList}>
              {filtered.map(({ Icon, label }) => (
                <button key={label} className={styles.paletteItem} onClick={() => setOpen(false)}>
                  <Icon size={17} weight="duotone" />
                  <span>{label}</span>
                  <ArrowRight size={12} className={styles.paletteArrow} />
                </button>
              ))}
              {filtered.length === 0 && <p className={styles.paletteEmpty}>Keine Treffer für „{query}"</p>}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

// ── 03 — Morphing Pill Dock ─────────────────────────────────────────────────────

function PillDock() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const { Icon: ActiveIcon } = NAV[active]

  return (
    <section className={styles.section} onClick={() => setOpen(false)}>
      <MockBg title="03 — Morphing Pill Dock" />
      <div className={`${styles.pill} ${open ? styles.pillOpen : ''}`} onClick={e => e.stopPropagation()}>
        {open
          ? NAV.map(({ Icon, label }, i) => (
            <button key={label} className={`${styles.pillItem} ${active === i ? styles.active : ''}`}
              onClick={() => { setActive(i); setOpen(false) }}>
              <Icon size={20} weight={active === i ? 'fill' : 'regular'} />
              <span>{label}</span>
            </button>
          ))
          : (
            <button className={styles.pillClosed} onClick={() => setOpen(true)}>
              <ActiveIcon size={20} weight="fill" />
              <span>{NAV[active].label}</span>
              <div className={styles.pillDots}>
                {NAV.map((_, i) => (
                  <span key={i} className={`${styles.pillDot} ${i === active ? styles.pillDotActive : ''}`} />
                ))}
              </div>
            </button>
          )
        }
      </div>
    </section>
  )
}

// ── 04 — Sliding Tab Bar ────────────────────────────────────────────────────────

function TabBar() {
  const [active, setActive] = useState(0)
  const tabsRef  = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)
  const [ind, setInd] = useState({ left: 0, width: 0 })

  useEffect(() => {
    const el = activeRef.current
    const parent = tabsRef.current
    if (el && parent) setInd({ left: el.offsetLeft, width: el.offsetWidth })
  }, [active])

  return (
    <section className={styles.section}>
      <MockBg title="04 — Sliding Tab Bar" />
      <div ref={tabsRef} className={styles.tabBar}>
        <div className={styles.tabIndicator} style={{ left: ind.left, width: ind.width }} />
        {NAV.map(({ Icon, label }, i) => (
          <button key={label} ref={i === active ? activeRef : undefined}
            className={`${styles.tab} ${active === i ? styles.tabActive : ''}`}
            onClick={() => setActive(i)}>
            <Icon size={16} weight={active === i ? 'fill' : 'regular'} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

// ── 05 — Floating User Chip ─────────────────────────────────────────────────────

function FloatingUserChip() {
  const [open, setOpen] = useState(false)

  return (
    <section className={styles.section} onClick={() => setOpen(false)}>
      <MockBg title="05 — Floating User Chip" />
      <div className={styles.userChipRoot} onClick={e => e.stopPropagation()}>
        <button className={`${styles.userChip} ${open ? styles.userChipOpen : ''}`} onClick={() => setOpen(v => !v)}>
          <div className={styles.userAvatar}>CS</div>
          <span className={styles.userChipName}>Chris S.</span>
          <CaretDown size={11} className={`${styles.userCaret} ${open ? styles.userCaretOpen : ''}`} />
        </button>
        {open && (
          <div className={styles.userMenu}>
            <div className={styles.userMenuHeader}>
              <div className={styles.userMenuAvatar}>CS</div>
              <div>
                <div className={styles.userMenuName}>Chris Schubert</div>
                <div className={styles.userMenuEmail}>chris@candlescope.de</div>
              </div>
            </div>
            <div className={styles.userMenuDivider} />
            {[
              { Icon: User,    label: 'Profil' },
              { Icon: Gear,    label: 'Einstellungen' },
            ].map(({ Icon, label }) => (
              <button key={label} className={styles.userMenuItem} onClick={() => setOpen(false)}>
                <Icon size={15} weight="regular" /><span>{label}</span>
              </button>
            ))}
            <div className={styles.userMenuDivider} />
            <button className={`${styles.userMenuItem} ${styles.userMenuLogout}`} onClick={() => setOpen(false)}>
              <SignOut size={15} /><span>Abmelden</span>
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

// ── 06 — Floating Action Toolbar ────────────────────────────────────────────────

const TOOLBAR_ACTIONS = [
  { Icon: MagnifyingGlass, label: 'Suche'    },
  { Icon: Printer,         label: 'Drucken'  },
  { Icon: ShareNetwork,    label: 'Teilen'   },
  { Icon: Bookmark,        label: 'Merken'   },
  { Icon: DownloadSimple,  label: 'Export'   },
]

function FloatingToolbar() {
  const [active, setActive] = useState<number | null>(null)

  return (
    <section className={styles.section}>
      <MockBg title="06 — Floating Action Toolbar" />
      <div className={styles.toolbar}>
        {TOOLBAR_ACTIONS.map(({ Icon, label }, i) => (
          <div key={label} className={styles.toolbarItem}>
            <span className={styles.toolbarLabel}>{label}</span>
            <button
              className={`${styles.toolbarBtn} ${active === i ? styles.active : ''}`}
              onClick={() => setActive(v => v === i ? null : i)}
              title={label}
            >
              <Icon size={18} weight={active === i ? 'fill' : 'regular'} />
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── 07 — Notification Center ────────────────────────────────────────────────────

const NOTIFS = [
  { Icon: CheckCircle, label: 'Zahlung eingegangen',   sub: '€ 2.400 von Kunde A',    time: 'vor 2 Min.',  unread: true,  color: '#22C55E' },
  { Icon: Warning,     label: 'Budget fast erreicht',   sub: 'Kategorie Essen: 92%',   time: 'vor 18 Min.', unread: true,  color: '#F59E0B' },
  { Icon: Info,        label: 'Sync abgeschlossen',     sub: '3 neue Transaktionen',   time: 'vor 1 Std.',  unread: false, color: '#3B82F6' },
  { Icon: CheckCircle, label: 'Sparziel erreicht',      sub: 'Urlaub 2025 ✓',          time: 'gestern',     unread: false, color: '#22C55E' },
]

function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const unread = NOTIFS.filter(n => n.unread).length

  return (
    <section className={styles.section} onClick={() => setOpen(false)}>
      <MockBg title="07 — Notification Center" />
      <div className={styles.notifRoot} onClick={e => e.stopPropagation()}>
        <button className={`${styles.notifBell} ${open ? styles.notifBellOpen : ''}`} onClick={() => setOpen(v => !v)}>
          <Bell size={20} weight={open ? 'fill' : 'regular'} />
          {unread > 0 && <span className={styles.notifBadge}>{unread}</span>}
        </button>
        {open && (
          <div className={styles.notifPanel}>
            <div className={styles.notifHeader}>
              <span>Benachrichtigungen</span>
              <span className={styles.notifCount}>{unread} neu</span>
            </div>
            <div className={styles.notifList}>
              {NOTIFS.map((n, i) => (
                <div key={i} className={`${styles.notifItem} ${n.unread ? styles.notifUnread : ''}`}>
                  <n.Icon size={18} weight="fill" style={{ color: n.color, flexShrink: 0 }} />
                  <div className={styles.notifText}>
                    <span className={styles.notifTitle}>{n.label}</span>
                    <span className={styles.notifSub}>{n.sub}</span>
                  </div>
                  <span className={styles.notifTime}>{n.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

// ── 08 — Expandable Search Pill ─────────────────────────────────────────────────

function ExpandableSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 180)
    else setQuery('')
  }, [open])

  return (
    <section className={styles.section} onClick={() => setOpen(false)}>
      <MockBg title="08 — Expandable Search Pill" />
      <div
        className={`${styles.searchPill} ${open ? styles.searchPillOpen : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <button className={styles.searchIcon} onClick={() => setOpen(v => !v)}>
          <MagnifyingGlass size={18} weight={open ? 'bold' : 'regular'} />
        </button>
        <input
          ref={inputRef}
          className={styles.searchInput}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Suchen…"
          onKeyDown={e => e.key === 'Escape' && setOpen(false)}
        />
        {open && query && (
          <button className={styles.searchClear} onClick={() => setQuery('')}>
            <X size={13} />
          </button>
        )}
      </div>
    </section>
  )
}

// ── 09 — Mini Status Bar ────────────────────────────────────────────────────────

function MiniStatusBar() {
  const [syncing, setSyncing] = useState(false)

  const triggerSync = () => {
    setSyncing(true)
    setTimeout(() => setSyncing(false), 1800)
  }

  return (
    <section className={styles.section}>
      <MockBg title="09 — Mini Status Bar" />
      <div className={styles.statusBar}>
        <div className={styles.statusLeft}>
          <span className={styles.statusDot} />
          <span>Verbunden</span>
        </div>
        <div className={styles.statusCenter}>
          <button className={`${styles.statusSync} ${syncing ? styles.statusSyncing : ''}`} onClick={triggerSync}>
            <ArrowCounterClockwise size={11} weight="bold" />
          </button>
          <span>{syncing ? 'Synchronisiere…' : 'Letzter Sync: vor 2 Min.'}</span>
        </div>
        <div className={styles.statusRight}>
          <span>chris@candlescope.de</span>
          <span className={styles.statusVersion}>v0.1.0</span>
        </div>
      </div>
    </section>
  )
}

// ── Export ─────────────────────────────────────────────────────────────────────

export function NavPrototypes() {
  return (
    <div className={styles.root}>
      <RadialNav />
      <CommandPalette />
      <PillDock />
      <TabBar />
      <FloatingUserChip />
      <FloatingToolbar />
      <NotificationCenter />
      <ExpandableSearch />
      <MiniStatusBar />
    </div>
  )
}
