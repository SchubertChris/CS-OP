import { useState, useEffect, useRef } from 'react'
import {
  SquaresFour, Wallet, ChartLineUp, Target, Archive, Gear,
  MagnifyingGlass, X, Plus, ArrowRight, CaretDown, List,
  Printer, ShareNetwork, Bookmark, DownloadSimple,
  Bell, User, SignOut, CheckCircle, Info, Warning,
  ArrowCounterClockwise, Receipt, PiggyBank,
} from '@phosphor-icons/react'
import styles from './AppShellPrototype.module.scss'

const NAV = [
  { Icon: SquaresFour, label: 'Dashboard'     },
  { Icon: Wallet,      label: 'Konten'         },
  { Icon: ChartLineUp, label: 'Analyse'        },
  { Icon: Target,      label: 'Ziele'          },
  { Icon: Archive,     label: 'Archiv'         },
  { Icon: Gear,        label: 'Einstellungen'  },
]

const TABS = ['Übersicht', 'Transaktionen', 'Prognose']

const TOOLBAR = [
  { Icon: MagnifyingGlass, label: 'Suche'   },
  { Icon: Printer,         label: 'Drucken' },
  { Icon: ShareNetwork,    label: 'Teilen'  },
  { Icon: Bookmark,        label: 'Merken'  },
  { Icon: DownloadSimple,  label: 'Export'  },
]

const FAB_ACTIONS = [
  { Icon: Receipt,   label: 'Transaktion' },
  { Icon: Target,    label: 'Ziel'        },
  { Icon: PiggyBank, label: 'Konto'       },
]

const NOTIFS = [
  { Icon: CheckCircle, label: 'Zahlung eingegangen', sub: '€ 2.400 von Kunde A', time: 'vor 2 Min.',  unread: true,  color: '#22C55E' },
  { Icon: Warning,     label: 'Budget fast erreicht', sub: 'Kategorie Essen: 92%', time: 'vor 18 Min.', unread: true,  color: '#F59E0B' },
  { Icon: Info,        label: 'Sync abgeschlossen',  sub: '3 neue Transaktionen', time: 'vor 1 Std.',  unread: false, color: '#3B82F6' },
  { Icon: CheckCircle, label: 'Sparziel erreicht',   sub: 'Urlaub 2025 ✓',        time: 'gestern',     unread: false, color: '#22C55E' },
]

const UPCOMING = [
  { label: 'Netflix',  amount: '€ 13,99',  date: 'Morgen' },
  { label: 'Miete',    amount: '€ 840,00', date: '01. Mai' },
  { label: 'Spotify',  amount: '€ 9,99',   date: '03. Mai' },
]

const BARS = [40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95]

export function AppShellPrototype() {
  const [activePage,    setActivePage]    = useState(0)
  const [railExpanded,  setRailExpanded]  = useState(false)
  const [cmdOpen,       setCmdOpen]       = useState(false)
  const [cmdQuery,      setCmdQuery]      = useState('')
  const [userOpen,      setUserOpen]      = useState(false)
  const [notifOpen,     setNotifOpen]     = useState(false)
  const [searchOpen,    setSearchOpen]    = useState(false)
  const [searchQuery,   setSearchQuery]   = useState('')
  const [tabActive,     setTabActive]     = useState(0)
  const [tabInd,        setTabInd]        = useState({ left: 0, width: 0 })
  const [fabOpen,       setFabOpen]       = useState(false)
  const [toolbarActive, setToolbarActive] = useState<number | null>(null)
  const [syncing,       setSyncing]       = useState(false)

  const tabsRef      = useRef<HTMLDivElement>(null)
  const activeTabRef = useRef<HTMLButtonElement>(null)
  const cmdInputRef  = useRef<HTMLInputElement>(null)
  const searchRef    = useRef<HTMLInputElement>(null)

  const unread   = NOTIFS.filter(n => n.unread).length
  const filtered = NAV.filter(n => n.label.toLowerCase().includes(cmdQuery.toLowerCase()))

  useEffect(() => {
    if (cmdOpen) { setCmdQuery(''); setTimeout(() => cmdInputRef.current?.focus(), 50) }
  }, [cmdOpen])

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 180)
    else setSearchQuery('')
  }, [searchOpen])

  useEffect(() => {
    const el = activeTabRef.current, par = tabsRef.current
    if (el && par) setTabInd({ left: el.offsetLeft, width: el.offsetWidth })
  }, [tabActive])

  useEffect(() => {
    if (!cmdOpen) return
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') setCmdOpen(false) }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [cmdOpen])

  const closeAll = () => { setUserOpen(false); setNotifOpen(false); setFabOpen(false) }

  return (
    <div className={styles.shell} onClick={closeAll}>

      {/* ── Rail ─────────────────────────────────────────────────────── */}
      <nav
        className={`${styles.rail} ${railExpanded ? styles.railExpanded : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.railLogo}>
          <div className={styles.logoMark}>CS</div>
          {railExpanded && <span className={styles.logoText}>CandleScope</span>}
        </div>

        <div className={styles.railNav}>
          {NAV.map(({ Icon, label }, i) => (
            <button
              key={label}
              className={`${styles.railItem} ${activePage === i ? styles.railActive : ''}`}
              onClick={() => setActivePage(i)}
              title={!railExpanded ? label : undefined}
            >
              <Icon size={20} weight={activePage === i ? 'fill' : 'regular'} />
              {railExpanded && <span className={styles.railLabel}>{label}</span>}
            </button>
          ))}
        </div>

        <div className={styles.railBottom}>
          {fabOpen && FAB_ACTIONS.map(({ Icon, label }, i) => (
            <div key={label} className={styles.fabAction} style={{ '--i': i } as React.CSSProperties}>
              {railExpanded && <span className={styles.fabActionLabel}>{label}</span>}
              <button className={styles.fabActionBtn} title={label} onClick={e => e.stopPropagation()}>
                <Icon size={16} weight="duotone" />
              </button>
            </div>
          ))}
          <button
            className={`${styles.fab} ${fabOpen ? styles.fabOpen : ''}`}
            onClick={e => { e.stopPropagation(); setFabOpen(v => !v) }}
          >
            {fabOpen ? <X size={18} weight="bold" /> : <Plus size={18} weight="bold" />}
          </button>
        </div>
      </nav>

      {/* ── Main ─────────────────────────────────────────────────────── */}
      <div className={styles.main}>

        {/* Topbar */}
        <header className={styles.topbar} onClick={e => e.stopPropagation()}>
          <button className={styles.railToggle} onClick={() => setRailExpanded(v => !v)}>
            <List size={18} />
          </button>

          <div className={`${styles.searchPill} ${searchOpen ? styles.searchOpen : ''}`}
            onClick={e => e.stopPropagation()}>
            <button className={styles.searchIcon} onClick={() => setSearchOpen(v => !v)}>
              <MagnifyingGlass size={15} weight={searchOpen ? 'bold' : 'regular'} />
            </button>
            {!searchOpen && (
              <button className={styles.cmdHint} onClick={() => setCmdOpen(true)}>
                <span>Suchen oder navigieren…</span>
                <kbd>⌘K</kbd>
              </button>
            )}
            {searchOpen && (
              <>
                <input
                  ref={searchRef}
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Suchen…"
                  onKeyDown={e => {
                    if (e.key === 'Escape') setSearchOpen(false)
                    if (e.key === 'Enter') { setCmdOpen(true); setCmdQuery(searchQuery); setSearchOpen(false) }
                  }}
                />
                {searchQuery && (
                  <button className={styles.searchClear} onClick={() => setSearchQuery('')}>
                    <X size={12} />
                  </button>
                )}
              </>
            )}
          </div>

          <div className={styles.topRight}>
            {/* Notification Bell */}
            <div className={styles.popWrap}>
              <button
                className={`${styles.iconBtn} ${notifOpen ? styles.iconBtnActive : ''}`}
                onClick={() => { setNotifOpen(v => !v); setUserOpen(false) }}
              >
                <Bell size={18} weight={notifOpen ? 'fill' : 'regular'} />
                {unread > 0 && <span className={styles.badge}>{unread}</span>}
              </button>

              {notifOpen && (
                <div className={styles.notifPanel} onClick={e => e.stopPropagation()}>
                  <div className={styles.panelHeader}>
                    <span>Benachrichtigungen</span>
                    <span className={styles.notifCount}>{unread} neu</span>
                  </div>
                  <div className={styles.notifList}>
                    {NOTIFS.map((n, i) => (
                      <div key={i} className={`${styles.notifItem} ${n.unread ? styles.unread : ''}`}>
                        <n.Icon size={16} weight="fill" style={{ color: n.color, flexShrink: 0 }} />
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

            {/* User Chip */}
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
                <div className={styles.userMenu} onClick={e => e.stopPropagation()}>
                  <div className={styles.userMenuHead}>
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
        </header>

        {/* Content */}
        <main className={styles.content}>
          {/* Tab Bar */}
          <div ref={tabsRef} className={styles.tabBar}>
            <div className={styles.tabIndicator} style={{ left: tabInd.left, width: tabInd.width }} />
            {TABS.map((tab, i) => (
              <button
                key={tab}
                ref={i === tabActive ? activeTabRef : undefined}
                className={`${styles.tab} ${tabActive === i ? styles.tabActive : ''}`}
                onClick={() => setTabActive(i)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Dashboard Grid */}
          <div className={styles.grid}>
            <div className={`${styles.card} ${styles.statCard}`}>
              <span className={styles.cardLabel}>Nettovermögen</span>
              <span className={styles.cardValue}>€ 48.250</span>
              <span className={styles.cardDeltaPos}>+€ 1.240 diesen Monat</span>
            </div>
            <div className={`${styles.card} ${styles.statCard}`}>
              <span className={styles.cardLabel}>Einnahmen</span>
              <span className={styles.cardValue}>€ 4.800</span>
              <span className={styles.cardDeltaPos}>+12 % ggü. Vormonat</span>
            </div>
            <div className={`${styles.card} ${styles.statCard}`}>
              <span className={styles.cardLabel}>Ausgaben</span>
              <span className={styles.cardValue}>€ 2.340</span>
              <span className={styles.cardDeltaNeg}>+5 % ggü. Vormonat</span>
            </div>

            <div className={`${styles.card} ${styles.chartCard}`}>
              <span className={styles.cardLabel}>Jahresübersicht</span>
              <div className={styles.chartMock}>
                {BARS.map((h, i) => (
                  <div key={i} className={styles.bar} style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>

            <div className={`${styles.card} ${styles.upcomingCard}`}>
              <span className={styles.cardLabel}>Fällig diese Woche</span>
              <div className={styles.upcomingList}>
                {UPCOMING.map(item => (
                  <div key={item.label} className={styles.upcomingItem}>
                    <span className={styles.upcomingName}>{item.label}</span>
                    <span className={styles.upcomingDate}>{item.date}</span>
                    <span className={styles.upcomingAmt}>{item.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating Action Toolbar */}
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
        </main>

        {/* Status Bar */}
        <footer className={styles.statusBar}>
          <div className={styles.statusLeft}>
            <span className={styles.statusDot} />
            <span>Verbunden</span>
          </div>
          <div className={styles.statusCenter}>
            <button
              className={`${styles.syncBtn} ${syncing ? styles.syncing : ''}`}
              onClick={() => { setSyncing(true); setTimeout(() => setSyncing(false), 1800) }}
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
      </div>

      {/* ── Command Palette ───────────────────────────────────────────── */}
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
                    if (idx >= 0) setActivePage(idx)
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
