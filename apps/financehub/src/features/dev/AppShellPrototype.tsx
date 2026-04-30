import { useState, useEffect, useRef } from 'react'
import {
  SquaresFour, Wallet, ChartLineUp, Target, Archive, Gear,
  MagnifyingGlass, X, ArrowRight, CaretDown,
  Printer, ShareNetwork, Bookmark, DownloadSimple,
  Bell, User, SignOut, CheckCircle, Info, Warning,
  ArrowCounterClockwise,
} from '@phosphor-icons/react'
import styles from './AppShellPrototype.module.scss'

const NAV = [
  { Icon: SquaresFour, label: 'Dashboard'    },
  { Icon: Wallet,      label: 'Konten'        },
  { Icon: ChartLineUp, label: 'Analyse'       },
  { Icon: Target,      label: 'Ziele'         },
  { Icon: Archive,     label: 'Archiv'        },
  { Icon: Gear,        label: 'Einstellungen' },
]

const TOOLBAR = [
  { Icon: MagnifyingGlass, label: 'Suche'   },
  { Icon: Printer,         label: 'Drucken' },
  { Icon: ShareNetwork,    label: 'Teilen'  },
  { Icon: Bookmark,        label: 'Merken'  },
  { Icon: DownloadSimple,  label: 'Export'  },
]

const NOTIFS = [
  { Icon: CheckCircle, label: 'Zahlung eingegangen', sub: '€ 2.400 von Kunde A', time: 'vor 2 Min.',  unread: true,  color: '#22C55E' },
  { Icon: Warning,     label: 'Budget fast erreicht', sub: 'Essen: 92 %',         time: 'vor 18 Min.', unread: true,  color: '#F59E0B' },
  { Icon: Info,        label: 'Sync abgeschlossen',  sub: '3 neue Transaktionen', time: 'vor 1 Std.',  unread: false, color: '#3B82F6' },
  { Icon: CheckCircle, label: 'Sparziel erreicht',   sub: 'Urlaub 2025 ✓',        time: 'gestern',     unread: false, color: '#22C55E' },
]

export function AppShellPrototype() {
  const [active,        setActive]        = useState(0)
  const [pillOpen,      setPillOpen]      = useState(false)
  const [cmdOpen,       setCmdOpen]       = useState(false)
  const [cmdQuery,      setCmdQuery]      = useState('')
  const [userOpen,      setUserOpen]      = useState(false)
  const [notifOpen,     setNotifOpen]     = useState(false)
  const [toolbarActive, setToolbarActive] = useState<number | null>(null)
  const [syncing,       setSyncing]       = useState(false)

  const cmdInputRef = useRef<HTMLInputElement>(null)
  const filtered    = NAV.filter(n => n.label.toLowerCase().includes(cmdQuery.toLowerCase()))
  const unread      = NOTIFS.filter(n => n.unread).length
  const { Icon: ActiveIcon } = NAV[active]

  useEffect(() => {
    if (cmdOpen) { setCmdQuery(''); setTimeout(() => cmdInputRef.current?.focus(), 50) }
  }, [cmdOpen])

  useEffect(() => {
    if (!cmdOpen) return
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') setCmdOpen(false) }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [cmdOpen])

  const closeAll = () => { setUserOpen(false); setNotifOpen(false); setPillOpen(false) }

  return (
    <div className={styles.shell} onClick={closeAll}>

      {/* Leerer Content-Bereich — Seiteninhalt kommt hier rein */}
      <div className={styles.content}>
        <span className={styles.contentHint}>{NAV[active].label}</span>
      </div>

      {/* ── Float: Top-left — ⌘K ───────────────────────────────────────── */}
      <button
        className={styles.cmdTrigger}
        onClick={e => { e.stopPropagation(); setCmdOpen(true) }}
      >
        <MagnifyingGlass size={13} />
        <span>Suchen oder navigieren…</span>
        <kbd>⌘K</kbd>
      </button>

      {/* ── Float: Top-right — Notif + User ────────────────────────────── */}
      <div className={styles.topRight} onClick={e => e.stopPropagation()}>

        <div className={styles.popWrap}>
          <button
            className={`${styles.chipBtn} ${notifOpen ? styles.chipBtnActive : ''}`}
            onClick={() => { setNotifOpen(v => !v); setUserOpen(false) }}
          >
            <Bell size={16} weight={notifOpen ? 'fill' : 'regular'} />
            {unread > 0 && <span className={styles.badge}>{unread}</span>}
          </button>

          {notifOpen && (
            <div className={`${styles.panel} ${styles.notifPanel}`}>
              <div className={styles.panelHeader}>
                <span>Benachrichtigungen</span>
                <span className={styles.notifCount}>{unread} neu</span>
              </div>
              <div className={styles.notifList}>
                {NOTIFS.map((n, i) => (
                  <div key={i} className={`${styles.notifItem} ${n.unread ? styles.unread : ''}`}>
                    <n.Icon size={15} weight="fill" style={{ color: n.color, flexShrink: 0 }} />
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

        <div className={styles.popWrap}>
          <button
            className={`${styles.userChip} ${userOpen ? styles.userChipActive : ''}`}
            onClick={() => { setUserOpen(v => !v); setNotifOpen(false) }}
          >
            <div className={styles.avatar}>CS</div>
            <span>Chris S.</span>
            <CaretDown size={10} className={`${styles.caret} ${userOpen ? styles.caretOpen : ''}`} />
          </button>

          {userOpen && (
            <div className={`${styles.panel} ${styles.userPanel}`}>
              <div className={styles.userHead}>
                <div className={styles.avatarLg}>CS</div>
                <div>
                  <div className={styles.userName}>Chris Schubert</div>
                  <div className={styles.userEmail}>chris@candlescope.de</div>
                </div>
              </div>
              <div className={styles.divider} />
              {[{ Icon: User, label: 'Profil' }, { Icon: Gear, label: 'Einstellungen' }].map(({ Icon, label }) => (
                <button key={label} className={styles.menuItem} onClick={closeAll}>
                  <Icon size={14} /><span>{label}</span>
                </button>
              ))}
              <div className={styles.divider} />
              <button className={`${styles.menuItem} ${styles.menuLogout}`} onClick={closeAll}>
                <SignOut size={14} /><span>Abmelden</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Float: Right — Action Toolbar ──────────────────────────────── */}
      <div className={styles.floatToolbar} onClick={e => e.stopPropagation()}>
        {TOOLBAR.map(({ Icon, label }, i) => (
          <div key={label} className={styles.toolbarItem}>
            <span className={styles.toolbarLabel}>{label}</span>
            <button
              className={`${styles.toolbarBtn} ${toolbarActive === i ? styles.toolbarBtnActive : ''}`}
              onClick={() => setToolbarActive(v => v === i ? null : i)}
            >
              <Icon size={16} weight={toolbarActive === i ? 'fill' : 'regular'} />
            </button>
          </div>
        ))}
      </div>

      {/* ── Float: Bottom-center — Morphing Pill Nav ───────────────────── */}
      <div
        className={`${styles.pill} ${pillOpen ? styles.pillOpen : ''}`}
        onClick={e => e.stopPropagation()}
      >
        {pillOpen
          ? NAV.map(({ Icon, label }, i) => (
              <button
                key={label}
                className={`${styles.pillItem} ${active === i ? styles.pillItemActive : ''}`}
                onClick={() => { setActive(i); setPillOpen(false) }}
              >
                <Icon size={19} weight={active === i ? 'fill' : 'regular'} />
                <span>{label}</span>
              </button>
            ))
          : (
              <button className={styles.pillClosed} onClick={() => setPillOpen(true)}>
                <ActiveIcon size={19} weight="fill" />
                <span>{NAV[active].label}</span>
                <div className={styles.pillDots}>
                  {NAV.map((_, i) => (
                    <span key={i} className={`${styles.dot} ${i === active ? styles.dotActive : ''}`} />
                  ))}
                </div>
              </button>
            )
        }
      </div>

      {/* ── Float: Bottom — Status Bar ─────────────────────────────────── */}
      <footer className={styles.statusBar}>
        <div className={styles.statusLeft}>
          <span className={styles.statusDot} />
          <span>Verbunden</span>
        </div>
        <div className={styles.statusCenter}>
          <button
            className={`${styles.syncBtn} ${syncing ? styles.syncing : ''}`}
            onClick={e => { e.stopPropagation(); setSyncing(true); setTimeout(() => setSyncing(false), 1800) }}
          >
            <ArrowCounterClockwise size={10} weight="bold" />
          </button>
          <span>{syncing ? 'Synchronisiere…' : 'Letzter Sync: vor 2 Min.'}</span>
        </div>
        <div className={styles.statusRight}>
          <span>chris@candlescope.de</span>
          <span className={styles.version}>v0.1.0</span>
        </div>
      </footer>

      {/* ── Global: Command Palette ─────────────────────────────────────── */}
      {cmdOpen && (
        <div className={styles.cmdBackdrop} onClick={() => setCmdOpen(false)}>
          <div className={styles.cmdPalette} onClick={e => e.stopPropagation()}>
            <div className={styles.cmdSearch}>
              <MagnifyingGlass size={15} />
              <input
                ref={cmdInputRef}
                value={cmdQuery}
                onChange={e => setCmdQuery(e.target.value)}
                placeholder="Seite oder Aktion suchen…"
              />
              <button onClick={() => setCmdOpen(false)}><X size={13} /></button>
            </div>
            <div className={styles.cmdList}>
              {filtered.map(({ Icon, label }) => (
                <button
                  key={label}
                  className={styles.cmdItem}
                  onClick={() => {
                    const idx = NAV.findIndex(n => n.label === label)
                    if (idx >= 0) setActive(idx)
                    setCmdOpen(false)
                  }}
                >
                  <Icon size={16} weight="duotone" />
                  <span>{label}</span>
                  <ArrowRight size={11} className={styles.cmdArrow} />
                </button>
              ))}
              {filtered.length === 0 && (
                <p className={styles.cmdEmpty}>Keine Treffer für „{cmdQuery}"</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
