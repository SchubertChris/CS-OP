import { useState, useEffect, useRef } from 'react'
import {
  SquaresFour, Wallet, ChartLineUp, Target, Archive, Gear,
  MagnifyingGlass, X, ArrowRight, CaretDown, Plus,
  Printer, ShareNetwork, Bookmark, DownloadSimple,
  Bell, User, SignOut, CheckCircle, Info, Warning,
  ArrowCounterClockwise,
} from '@phosphor-icons/react'
import styles from './LayoutPrototypes.module.scss'

// ── Shared data ────────────────────────────────────────────────────────────────

const NAV = [
  { Icon: SquaresFour, label: 'Dashboard'    },
  { Icon: Wallet,      label: 'Konten'        },
  { Icon: ChartLineUp, label: 'Analyse'       },
  { Icon: Target,      label: 'Ziele'         },
  { Icon: Archive,     label: 'Archiv'        },
  { Icon: Gear,        label: 'Einstellungen' },
]

const TOOLBAR = [
  { Icon: Printer,        label: 'Drucken' },
  { Icon: ShareNetwork,   label: 'Teilen'  },
  { Icon: Bookmark,       label: 'Merken'  },
  { Icon: DownloadSimple, label: 'Export'  },
]

const NOTIFS = [
  { Icon: CheckCircle, label: 'Zahlung eingegangen', sub: '€ 2.400 von Kunde A', time: 'vor 2 Min.',  unread: true,  color: '#22C55E' },
  { Icon: Warning,     label: 'Budget fast erreicht', sub: 'Essen: 92 %',         time: 'vor 18 Min.', unread: true,  color: '#F59E0B' },
  { Icon: Info,        label: 'Sync abgeschlossen',  sub: '3 neue Transaktionen', time: 'vor 1 Std.',  unread: false, color: '#3B82F6' },
]

// ── Sub-components ─────────────────────────────────────────────────────────────

function NotifPanel({ onClose }: { onClose: () => void }) {
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

function UserMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className={`${styles.panel} ${styles.userPanel}`} onClick={e => e.stopPropagation()}>
      <div className={styles.userHead}>
        <div className={styles.avatarLg}>CS</div>
        <div>
          <div className={styles.userName}>Chris Schubert</div>
          <div className={styles.userEmail}>chris@candlescope.de</div>
        </div>
      </div>
      <div className={styles.divider} />
      {[{ Icon: User, label: 'Profil' }, { Icon: Gear, label: 'Einstellungen' }].map(({ Icon, label }) => (
        <button key={label} className={styles.menuRow} onClick={onClose}>
          <Icon size={13} /><span>{label}</span>
        </button>
      ))}
      <div className={styles.divider} />
      <button className={`${styles.menuRow} ${styles.menuLogout}`} onClick={onClose}>
        <SignOut size={13} /><span>Abmelden</span>
      </button>
    </div>
  )
}

function CmdPalette({ onNavigate, onClose }: { onNavigate: (i: number) => void; onClose: () => void }) {
  const [q, setQ]     = useState('')
  const inputRef       = useRef<HTMLInputElement>(null)
  const filtered       = NAV.filter(n => n.label.toLowerCase().includes(q.toLowerCase()))

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
          {filtered.map(({ Icon, label }) => (
            <button key={label} className={styles.cmdRow} onClick={() => { onNavigate(NAV.findIndex(n => n.label === label)); onClose() }}>
              <Icon size={15} weight="duotone" /><span>{label}</span><ArrowRight size={10} className={styles.cmdArrow} />
            </button>
          ))}
          {filtered.length === 0 && <p className={styles.cmdEmpty}>Keine Treffer für „{q}"</p>}
        </div>
      </div>
    </div>
  )
}

function FloatToolbar() {
  const [active, setActive] = useState<number | null>(null)
  return (
    <div className={styles.floatToolbar}>
      {TOOLBAR.map(({ Icon, label }, i) => (
        <div key={label} className={styles.toolItem}>
          <span className={styles.toolLabel}>{label}</span>
          <button
            className={`${styles.toolBtn} ${active === i ? styles.toolBtnActive : ''}`}
            onClick={e => { e.stopPropagation(); setActive(v => v === i ? null : i) }}
          >
            <Icon size={15} weight={active === i ? 'fill' : 'regular'} />
          </button>
        </div>
      ))}
    </div>
  )
}

function StatusBar({ onSync }: { onSync?: () => void }) {
  const [syncing, setSyncing] = useState(false)
  const sync = () => { setSyncing(true); onSync?.(); setTimeout(() => setSyncing(false), 1800) }
  return (
    <footer className={styles.statusBar}>
      <div className={styles.statusLeft}>
        <span className={styles.statusDot} /><span>Verbunden</span>
      </div>
      <div className={styles.statusCenter}>
        <button className={`${styles.syncBtn} ${syncing ? styles.syncing : ''}`} onClick={e => { e.stopPropagation(); sync() }}>
          <ArrowCounterClockwise size={10} weight="bold" />
        </button>
        <span>{syncing ? 'Synchronisiere…' : 'Letzter Sync: vor 2 Min.'}</span>
      </div>
      <div className={styles.statusRight}>
        <span>chris@candlescope.de</span>
        <span className={styles.version}>v0.1.0</span>
      </div>
    </footer>
  )
}

// ── Layout A — "Floating" — Alles schwebend ────────────────────────────────────

function LayoutA() {
  const [active,   setActive]   = useState(0)
  const [pillOpen, setPillOpen] = useState(false)
  const [cmdOpen,  setCmdOpen]  = useState(false)
  const [notifOpen,setNotifOpen]= useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const { Icon: ActiveIcon }    = NAV[active]
  const unread                  = NOTIFS.filter(n => n.unread).length

  return (
    <section className={styles.section} onClick={() => { setPillOpen(false); setNotifOpen(false); setUserOpen(false) }}>
      <span className={styles.label}>A — Floating Everything</span>

      {/* Content ghost */}
      <div className={styles.ghost}>{NAV[active].label}</div>

      {/* Top-left: Search → ⌘K */}
      <button className={styles.cmdTrigger} onClick={e => { e.stopPropagation(); setCmdOpen(true) }}>
        <MagnifyingGlass size={13} /><span>Suchen oder navigieren…</span><kbd>⌘K</kbd>
      </button>

      {/* Top-right: Bell + User */}
      <div className={styles.topRight} onClick={e => e.stopPropagation()}>
        <div className={styles.popWrap}>
          <button className={`${styles.iconBtn} ${notifOpen ? styles.iconActive : ''}`}
            onClick={() => { setNotifOpen(v => !v); setUserOpen(false) }}>
            <Bell size={15} weight={notifOpen ? 'fill' : 'regular'} />
            {unread > 0 && <span className={styles.badge}>{unread}</span>}
          </button>
          {notifOpen && <NotifPanel onClose={() => setNotifOpen(false)} />}
        </div>
        <div className={styles.popWrap}>
          <button className={`${styles.userChip} ${userOpen ? styles.chipActive : ''}`}
            onClick={() => { setUserOpen(v => !v); setNotifOpen(false) }}>
            <div className={styles.avatar}>CS</div>
            <span>Chris S.</span>
            <CaretDown size={9} className={`${styles.caret} ${userOpen ? styles.caretOpen : ''}`} />
          </button>
          {userOpen && <UserMenu onClose={() => setUserOpen(false)} />}
        </div>
      </div>

      {/* Right: Floating Toolbar */}
      <FloatToolbar />

      {/* Bottom-center: Morphing Pill */}
      <div className={`${styles.pill} ${pillOpen ? styles.pillOpen : ''}`} onClick={e => e.stopPropagation()}>
        {pillOpen
          ? NAV.map(({ Icon, label }, i) => (
              <button key={label} className={`${styles.pillItem} ${active === i ? styles.pillActive : ''}`}
                onClick={() => { setActive(i); setPillOpen(false) }}>
                <Icon size={18} weight={active === i ? 'fill' : 'regular'} />
                <span>{label}</span>
              </button>
            ))
          : (
            <button className={styles.pillClosed} onClick={() => setPillOpen(true)}>
              <ActiveIcon size={18} weight="fill" />
              <span>{NAV[active].label}</span>
              <div className={styles.dots}>{NAV.map((_, i) => <span key={i} className={`${styles.dot} ${i === active ? styles.dotOn : ''}`} />)}</div>
            </button>
          )
        }
      </div>

      <StatusBar />
      {cmdOpen && <CmdPalette onNavigate={setActive} onClose={() => setCmdOpen(false)} />}
    </section>
  )
}

// ── Layout B — "Strip" — Minimaler Topstreifen + ⌘K zentral ───────────────────

function LayoutB() {
  const [active,   setActive]   = useState(0)
  const [cmdOpen,  setCmdOpen]  = useState(false)
  const [notifOpen,setNotifOpen]= useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const unread                  = NOTIFS.filter(n => n.unread).length

  return (
    <section className={styles.section} onClick={() => { setNotifOpen(false); setUserOpen(false) }}>
      <span className={styles.label}>B — Minimaler Strip + Command-Button</span>

      {/* Content ghost */}
      <div className={styles.ghost}>{NAV[active].label}</div>

      {/* Thin top strip */}
      <div className={styles.topStrip} onClick={e => e.stopPropagation()}>
        <div className={styles.stripLeft}>
          <div className={styles.logoMini}>CS</div>
          <div className={styles.stripDots}>
            {NAV.map((_, i) => (
              <button key={i}
                className={`${styles.navDot} ${i === active ? styles.navDotOn : ''}`}
                onClick={() => setActive(i)}
                title={NAV[i].label}
              />
            ))}
          </div>
        </div>
        <div className={styles.stripRight}>
          <div className={styles.popWrap}>
            <button className={`${styles.iconBtn} ${notifOpen ? styles.iconActive : ''}`}
              onClick={() => { setNotifOpen(v => !v); setUserOpen(false) }}>
              <Bell size={15} weight={notifOpen ? 'fill' : 'regular'} />
              {unread > 0 && <span className={styles.badge}>{unread}</span>}
            </button>
            {notifOpen && <NotifPanel onClose={() => setNotifOpen(false)} />}
          </div>
          <div className={styles.popWrap}>
            <button className={`${styles.userChip} ${userOpen ? styles.chipActive : ''}`}
              onClick={() => { setUserOpen(v => !v); setNotifOpen(false) }}>
              <div className={styles.avatar}>CS</div>
              <span>Chris S.</span>
              <CaretDown size={9} className={`${styles.caret} ${userOpen ? styles.caretOpen : ''}`} />
            </button>
            {userOpen && <UserMenu onClose={() => setUserOpen(false)} />}
          </div>
        </div>
      </div>

      {/* Right: Floating Toolbar */}
      <FloatToolbar />

      {/* Center-bottom: Big ⌘K entry point (the "nav button") */}
      <button className={styles.bigCmd} onClick={e => { e.stopPropagation(); setCmdOpen(true) }}>
        <MagnifyingGlass size={16} />
        <span>Was möchtest du tun?</span>
        <kbd>⌘K</kbd>
      </button>

      <StatusBar />
      {cmdOpen && <CmdPalette onNavigate={setActive} onClose={() => setCmdOpen(false)} />}
    </section>
  )
}

// ── Layout C — "Radial FAB" — FAB als Navigation ───────────────────────────────

function LayoutC() {
  const [active,   setActive]   = useState(0)
  const [fabOpen,  setFabOpen]  = useState(false)
  const [cmdOpen,  setCmdOpen]  = useState(false)
  const [notifOpen,setNotifOpen]= useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const R = 110
  const unread = NOTIFS.filter(n => n.unread).length

  return (
    <section className={styles.section} onClick={() => { setFabOpen(false); setNotifOpen(false); setUserOpen(false) }}>
      <span className={styles.label}>C — Radial FAB Navigation</span>

      <div className={styles.ghost}>{NAV[active].label}</div>

      {/* Top-left: ⌘K */}
      <button className={styles.cmdTrigger} onClick={e => { e.stopPropagation(); setCmdOpen(true) }}>
        <MagnifyingGlass size={13} /><span>Suchen oder navigieren…</span><kbd>⌘K</kbd>
      </button>

      {/* Top-right: Bell + User */}
      <div className={styles.topRight} onClick={e => e.stopPropagation()}>
        <div className={styles.popWrap}>
          <button className={`${styles.iconBtn} ${notifOpen ? styles.iconActive : ''}`}
            onClick={() => { setNotifOpen(v => !v); setUserOpen(false) }}>
            <Bell size={15} weight={notifOpen ? 'fill' : 'regular'} />
            {unread > 0 && <span className={styles.badge}>{unread}</span>}
          </button>
          {notifOpen && <NotifPanel onClose={() => setNotifOpen(false)} />}
        </div>
        <div className={styles.popWrap}>
          <button className={`${styles.userChip} ${userOpen ? styles.chipActive : ''}`}
            onClick={() => { setUserOpen(v => !v); setNotifOpen(false) }}>
            <div className={styles.avatar}>CS</div>
            <span>Chris S.</span>
            <CaretDown size={9} className={`${styles.caret} ${userOpen ? styles.caretOpen : ''}`} />
          </button>
          {userOpen && <UserMenu onClose={() => setUserOpen(false)} />}
        </div>
      </div>

      {/* Right: Floating Toolbar */}
      <FloatToolbar />

      {/* Bottom-right: Radial FAB */}
      <div className={styles.radialRoot} onClick={e => e.stopPropagation()}>
        {NAV.map(({ Icon, label }, i) => {
          const angle = (Math.PI * 1.1 / (NAV.length - 1)) * i - Math.PI * 0.05
          const x = -Math.cos(angle) * R
          const y = -Math.sin(angle) * R
          return (
            <button
              key={label}
              className={`${styles.radialItem} ${active === i ? styles.radialActive : ''}`}
              style={{
                transform: fabOpen ? `translate(${x}px, ${y}px) scale(1)` : 'translate(0,0) scale(0.3)',
                opacity: fabOpen ? 1 : 0,
                transitionDelay: fabOpen ? `${i * 35}ms` : `${(NAV.length - 1 - i) * 22}ms`,
              }}
              onClick={() => { setActive(i); setFabOpen(false) }}
              title={label}
            >
              <Icon size={17} weight={active === i ? 'fill' : 'duotone'} />
              <span>{label}</span>
            </button>
          )
        })}
        <button
          className={`${styles.fab} ${fabOpen ? styles.fabOpen : ''}`}
          onClick={() => setFabOpen(v => !v)}
        >
          {fabOpen ? <X size={20} weight="bold" /> : <Plus size={20} weight="bold" />}
        </button>
      </div>

      <StatusBar />
      {cmdOpen && <CmdPalette onNavigate={setActive} onClose={() => setCmdOpen(false)} />}
    </section>
  )
}

// ── Layout D — "Icon Rail Top" — Schmale Icon-Leiste oben ─────────────────────

function LayoutD() {
  const [active,   setActive]   = useState(0)
  const [cmdOpen,  setCmdOpen]  = useState(false)
  const [notifOpen,setNotifOpen]= useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const unread = NOTIFS.filter(n => n.unread).length

  const tabsRef   = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)
  const [ind, setInd] = useState({ left: 0, width: 0 })

  useEffect(() => {
    const el = activeRef.current, par = tabsRef.current
    if (el && par) setInd({ left: el.offsetLeft, width: el.offsetWidth })
  }, [active])

  return (
    <section className={styles.section} onClick={() => { setNotifOpen(false); setUserOpen(false) }}>
      <span className={styles.label}>D — Schmale Icon-Topbar + Sliding Tabs</span>

      <div className={styles.ghost}>{NAV[active].label}</div>

      {/* Top nav bar */}
      <div className={styles.topBar} onClick={e => e.stopPropagation()}>
        <div className={styles.logoMini}>CS</div>

        {/* Sliding tab nav */}
        <div ref={tabsRef} className={styles.tabNav}>
          <div className={styles.tabIndicator} style={{ left: ind.left, width: ind.width }} />
          {NAV.map(({ Icon, label }, i) => (
            <button
              key={label}
              ref={i === active ? activeRef : undefined}
              className={`${styles.tabItem} ${active === i ? styles.tabActive : ''}`}
              onClick={() => setActive(i)}
            >
              <Icon size={15} weight={active === i ? 'fill' : 'regular'} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className={styles.barRight}>
          <button className={styles.searchIconBtn} onClick={() => setCmdOpen(true)}>
            <MagnifyingGlass size={15} />
          </button>
          <div className={styles.popWrap}>
            <button className={`${styles.iconBtn} ${notifOpen ? styles.iconActive : ''}`}
              onClick={() => { setNotifOpen(v => !v); setUserOpen(false) }}>
              <Bell size={15} weight={notifOpen ? 'fill' : 'regular'} />
              {unread > 0 && <span className={styles.badge}>{unread}</span>}
            </button>
            {notifOpen && <NotifPanel onClose={() => setNotifOpen(false)} />}
          </div>
          <div className={styles.popWrap}>
            <button className={`${styles.userChip} ${userOpen ? styles.chipActive : ''}`}
              onClick={() => { setUserOpen(v => !v); setNotifOpen(false) }}>
              <div className={styles.avatar}>CS</div>
              <span>Chris S.</span>
              <CaretDown size={9} className={`${styles.caret} ${userOpen ? styles.caretOpen : ''}`} />
            </button>
            {userOpen && <UserMenu onClose={() => setUserOpen(false)} />}
          </div>
        </div>
      </div>

      {/* Right: Floating Toolbar */}
      <FloatToolbar />

      <StatusBar />
      {cmdOpen && <CmdPalette onNavigate={setActive} onClose={() => setCmdOpen(false)} />}
    </section>
  )
}

// ── Layout E — "A + Radial Ring" — wie A, rechte Toolbar → Radial top-right ──

const RADIAL_ACTIONS = [
  { Icon: Plus,           label: 'Neue Buchung' },
  { Icon: Printer,        label: 'Drucken'      },
  { Icon: ShareNetwork,   label: 'Teilen'       },
  { Icon: Bookmark,       label: 'Merken'       },
  { Icon: DownloadSimple, label: 'Export'       },
]

function LayoutE() {
  const [active,    setActive]    = useState(0)
  const [pillOpen,  setPillOpen]  = useState(false)
  const [cmdOpen,   setCmdOpen]   = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen,  setUserOpen]  = useState(false)
  const [ringOpen,  setRingOpen]  = useState(false)
  const unread              = NOTIFS.filter(n => n.unread).length
  const { Icon: ActiveIcon }= NAV[active]

  // Radial-Geometrie: Spreizung von 160° bis 270° (links + runter, nie aus dem Bildrand)
  const R = 88
  const ANGLE_START = 180
  const ANGLE_END   = 268

  const closeAll = () => { setUserOpen(false); setNotifOpen(false); setPillOpen(false); setRingOpen(false) }

  return (
    <section className={styles.section} onClick={closeAll}>
      <span className={styles.label}>E — Floating + Radial Action Ring</span>

      <div className={styles.ghost}>{NAV[active].label}</div>

      {/* Top-left: ⌘K */}
      <button className={styles.cmdTrigger} onClick={e => { e.stopPropagation(); setCmdOpen(true) }}>
        <MagnifyingGlass size={13} /><span>Suchen oder navigieren…</span><kbd>⌘K</kbd>
      </button>

      {/* Top-right: Bell + User — horizontal wie Layout A */}
      <div className={styles.topRight} onClick={e => e.stopPropagation()}>
        <div className={styles.popWrap}>
          <button className={`${styles.iconBtn} ${notifOpen ? styles.iconActive : ''}`}
            onClick={() => { setNotifOpen(v => !v); setUserOpen(false); setRingOpen(false) }}>
            <Bell size={15} weight={notifOpen ? 'fill' : 'regular'} />
            {unread > 0 && <span className={styles.badge}>{unread}</span>}
          </button>
          {notifOpen && <NotifPanel onClose={() => setNotifOpen(false)} />}
        </div>
        <div className={styles.popWrap}>
          <button className={`${styles.userChip} ${userOpen ? styles.chipActive : ''}`}
            onClick={() => { setUserOpen(v => !v); setNotifOpen(false); setRingOpen(false) }}>
            <div className={styles.avatar}>CS</div>
            <span>Chris S.</span>
            <CaretDown size={9} className={`${styles.caret} ${userOpen ? styles.caretOpen : ''}`} />
          </button>
          {userOpen && <UserMenu onClose={() => setUserOpen(false)} />}
        </div>
      </div>

      {/* Radial Ring — separates schwebendes Element unterhalb des Top-right-Clusters */}
      <div className={styles.ringAnchor} onClick={e => e.stopPropagation()}>
        {RADIAL_ACTIONS.map(({ Icon, label }, i) => {
          const angle = (ANGLE_START + ((ANGLE_END - ANGLE_START) / (RADIAL_ACTIONS.length - 1)) * i) * (Math.PI / 180)
          const x = Math.cos(angle) * R
          const y = -Math.sin(angle) * R
          return (
            <button
              key={label}
              className={styles.ringItem}
              style={{
                transform: ringOpen ? `translate(${x}px, ${y}px) scale(1)` : 'translate(0,0) scale(0.3)',
                opacity: ringOpen ? 1 : 0,
                transitionDelay: ringOpen ? `${i * 40}ms` : `${(RADIAL_ACTIONS.length - 1 - i) * 25}ms`,
              }}
              title={label}
              onClick={() => setRingOpen(false)}
            >
              <Icon size={15} weight="duotone" />
              <span>{label}</span>
            </button>
          )
        })}

        <button
          className={`${styles.ringBtn} ${ringOpen ? styles.ringBtnOpen : ''}`}
          onClick={() => { setRingOpen(v => !v); setUserOpen(false); setNotifOpen(false) }}
        >
          {ringOpen ? <X size={15} weight="bold" /> : <Plus size={15} weight="bold" />}
        </button>
      </div>

      {/* Bottom-center: Morphing Pill Nav */}
      <div className={`${styles.pill} ${pillOpen ? styles.pillOpen : ''}`} onClick={e => e.stopPropagation()}>
        {pillOpen
          ? NAV.map(({ Icon, label }, i) => (
              <button key={label} className={`${styles.pillItem} ${active === i ? styles.pillActive : ''}`}
                onClick={() => { setActive(i); setPillOpen(false) }}>
                <Icon size={18} weight={active === i ? 'fill' : 'regular'} /><span>{label}</span>
              </button>
            ))
          : (
            <button className={styles.pillClosed} onClick={() => setPillOpen(true)}>
              <ActiveIcon size={18} weight="fill" />
              <span>{NAV[active].label}</span>
              <div className={styles.dots}>{NAV.map((_, i) => <span key={i} className={`${styles.dot} ${i === active ? styles.dotOn : ''}`} />)}</div>
            </button>
          )
        }
      </div>

      <StatusBar />
      {cmdOpen && <CmdPalette onNavigate={setActive} onClose={() => setCmdOpen(false)} />}
    </section>
  )
}

// ── Export ─────────────────────────────────────────────────────────────────────

export function LayoutPrototypes() {
  return (
    <div>
      <LayoutA />
      <LayoutB />
      <LayoutC />
      <LayoutD />
      <LayoutE />
    </div>
  )
}
