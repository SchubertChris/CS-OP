import { useState, useEffect, useRef, type ReactNode } from 'react'
import {
  SquaresFour, Wallet, ChartLineUp, Target, Archive, Gear,
  MagnifyingGlass, X, ArrowRight, CaretDown, Plus, CurrencyBtc,
  Printer, ShareNetwork, DownloadSimple,
  Bell, User, SignOut, CheckCircle, Info, Warning,
  ArrowCounterClockwise,
  ArrowUp, ArrowDown, Star, FolderOpen, CaretLeft, CaretRight,
  ArrowsLeftRight, DeviceMobile, Monitor,
  Toolbox, Question, Calculator, NotePencil, Trash, CaretUp,
  Copy, EnvelopeSimple, QrCode, Link, Lock, Globe,
} from '@phosphor-icons/react'
import candleScopeImg from '../../assets/CandleScope.webp'
import styles from './LayoutPrototypes.module.scss'

const NAV = [
  { Icon: SquaresFour, label: 'Dashboard'    },
  { Icon: Wallet,      label: 'Konten'        },
  { Icon: ChartLineUp, label: 'Analyse'       },
  { Icon: Target,      label: 'Ziele'         },
  { Icon: Archive,     label: 'Archiv'        },
  { Icon: Gear,        label: 'Einstellungen' },
]

const RADIAL_ACTIONS = [
  { Icon: CurrencyBtc,    label: 'Neue Buchung', action: 'buchung'  },
  { Icon: Printer,        label: 'Drucken',      action: 'druck'    },
  { Icon: ShareNetwork,   label: 'Teilen',       action: 'teilen'   },
  { Icon: Toolbox,        label: 'Notizen',      action: 'notes'    },
  { Icon: DownloadSimple, label: 'Export',       action: 'export'   },
] as const

const NOTIFS = [
  { Icon: CheckCircle, label: 'Zahlung eingegangen',  sub: '€ 2.400 von Kunde A',    time: 'vor 2 Min.',  unread: true,  color: '#22C55E' },
  { Icon: Warning,     label: 'Budget fast erreicht', sub: 'Essen: 92 %',             time: 'vor 18 Min.', unread: true,  color: '#F59E0B' },
  { Icon: Info,        label: 'Sync abgeschlossen',   sub: '3 neue Transaktionen',    time: 'vor 1 Std.',  unread: false, color: '#3B82F6' },
]

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
  const [q, setQ] = useState('')
  const inputRef  = useRef<HTMLInputElement>(null)
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
          {filtered.map(({ Icon, label }) => (
            <button key={label} className={styles.cmdRow}
              onClick={() => { onNavigate(NAV.findIndex(n => n.label === label)); onClose() }}>
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

function StatusBar({ onSync }: { onSync?: () => void }) {
  const [syncing, setSyncing] = useState(false)
  const sync = () => { setSyncing(true); onSync?.(); setTimeout(() => setSyncing(false), 1800) }
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
        <span>chris@candlescope.de</span>
        <span className={styles.version}>v0.1.0</span>
      </div>
    </footer>
  )
}

const FAQ_ITEMS = [
  { q: 'Wie buche ich eine neue Transaktion?',  a: 'Tippe auf den + Ring-Button unten rechts und wähle "Neue Buchung".' },
  { q: 'Wie verbinde ich mein Konto?',          a: 'Gehe zu Einstellungen → Konten → finAPI Verbindung hinzufügen.' },
  { q: 'Kann ich Kategorien selbst anlegen?',   a: 'Ja — unter Einstellungen → Kategorien kannst du eigene anlegen.' },
  { q: 'Wie funktioniert der Dauerauftrag?',    a: 'Beim Anlegen einer Buchung den Typ "Dauerauftrag" wählen und Intervall setzen.' },
  { q: 'Sind meine Daten sicher?',              a: 'Ja — alle Daten liegen verschlüsselt auf deutschen Servern (Frankfurt).' },
]

type FNPView = 'notes' | 'faq' | 'calc'

function LayoutE() {
  const [active,    setActive]    = useState(0)
  const [pillOpen,  setPillOpen]  = useState(false)
  const [cmdOpen,   setCmdOpen]   = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen,  setUserOpen]  = useState(false)
  const [ringOpen,  setRingOpen]  = useState(false)
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 1024px)').matches)
  const unread               = NOTIFS.filter(n => n.unread).length
  const { Icon: ActiveIcon } = NAV[active]

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const fn = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])

  const R           = isDesktop ? 150 : 110
  const ANGLE_START = 180
  const ANGLE_END   = 268

  const closeAll = () => { setUserOpen(false); setNotifOpen(false); setPillOpen(false); setRingOpen(false) }

  return (
    <section className={styles.section} onClick={closeAll}>
      <div className={styles.ghost}>{NAV[active].label}</div>

      <button className={styles.cmdTrigger} onClick={e => { e.stopPropagation(); setCmdOpen(true) }}>
        <MagnifyingGlass size={13} /><span>Suchen oder navigieren…</span><kbd>⌘K</kbd>
      </button>


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

      <div className={styles.ringAnchor} onClick={e => e.stopPropagation()}>
        {RADIAL_ACTIONS.map(({ Icon, label }, i) => {
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
              <button
                className={styles.ringItem}
                title={label}
                onClick={() => setRingOpen(false)}
              >
                <Icon size={16} weight="duotone" />
              </button>
            </div>
          )
        })}
        <button
          className={`${styles.ringBtn} ${ringOpen ? styles.ringBtnOpen : ''}`}
          onClick={() => { setRingOpen(v => !v); setUserOpen(false); setNotifOpen(false) }}
        >
          {ringOpen ? <X size={15} weight="bold" /> : <Plus size={15} weight="bold" />}
        </button>
      </div>

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
              <div className={styles.dots}>
                {NAV.map((_, i) => <span key={i} className={`${styles.dot} ${i === active ? styles.dotOn : ''}`} />)}
              </div>
            </button>
          )
        }
      </div>

      <StatusBar />
      {cmdOpen && <CmdPalette onNavigate={setActive} onClose={() => setCmdOpen(false)} />}
    </section>
  )
}

// ── Mock Section Helpers ───────────────────────────────────────────────────────

function FieldRow({ label, value, isTag }: { label: string; value: string; isTag?: boolean }) {
  return (
    <div className={styles.fieldRow}>
      <span className={styles.fieldLabel}>{label}</span>
      {isTag
        ? <span className={styles.fieldTag}>{value}</span>
        : <span className={styles.fieldValue}>{value}</span>
      }
    </div>
  )
}

// ── 1. Buchungs-Modal ─────────────────────────────────────────────────────────

const MOCK_KONTEN = [
  { name: 'Girokonto · DKB', sub: '€ 3.240,00', color: '#3B82F6' },
  { name: 'Sparkasse Haupt', sub: '€ 8.910,50',  color: '#F59E0B' },
  { name: 'PayPal',          sub: '€ 124,80',    color: '#0070BA' },
]

const MOCK_KREDITOREN = [
  { name: 'Amazon.de',    initials: 'AM', color: '#FF9900', bg: 'rgba(255,153,0,0.15)'  },
  { name: 'Rewe',         initials: 'RW', color: '#EF4444', bg: 'rgba(239,68,68,0.15)'  },
  { name: 'Spotify',      initials: 'SP', color: '#1DB954', bg: 'rgba(29,185,84,0.15)'  },
  { name: 'Netflix',      initials: 'NF', color: '#E50914', bg: 'rgba(229,9,20,0.15)'   },
  { name: 'Kunde A GmbH', initials: 'KA', color: '#22C55E', bg: 'rgba(34,197,94,0.15)'  },
  { name: 'ADAC',         initials: 'AD', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  { name: 'Edeka',        initials: 'ED', color: '#16A34A', bg: 'rgba(22,163,74,0.15)'  },
  { name: 'Lidl',         initials: 'LI', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
]

const MOCK_KATEGORIEN = [
  { name: 'Abonnements',  emoji: '📱', color: '#8B5CF6', bg: 'rgba(139,92,246,0.14)' },
  { name: 'Lebensmittel', emoji: '🛒', color: '#22C55E', bg: 'rgba(34,197,94,0.14)'  },
  { name: 'Transport',    emoji: '🚗', color: '#3B82F6', bg: 'rgba(59,130,246,0.14)' },
  { name: 'Einnahmen',    emoji: '💰', color: '#F59E0B', bg: 'rgba(245,158,11,0.14)' },
  { name: 'Wohnen',       emoji: '🏠', color: '#EF4444', bg: 'rgba(239,68,68,0.14)'  },
  { name: 'Gesundheit',   emoji: '💊', color: '#EC4899', bg: 'rgba(236,72,153,0.14)' },
  { name: 'Freizeit',     emoji: '🎮', color: '#14B8A6', bg: 'rgba(20,184,166,0.14)' },
]

const MOCK_ZAHLUNGSARTEN = [
  { name: 'Überweisung', icon: '🏦' },
  { name: 'Lastschrift',  icon: '📋' },
  { name: 'Bargeld',      icon: '💵' },
  { name: 'Karte',        icon: '💳' },
]

const MOCK_INTERVALLE = [
  { name: 'Täglich'         },
  { name: 'Wöchentlich'     },
  { name: 'Monatlich'       },
  { name: 'Vierteljährlich' },
  { name: 'Halbjährlich'    },
]

const MONTH_NAMES = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']
const DAY_NAMES   = ['Mo','Di','Mi','Do','Fr','Sa','So']

function getCalDays(month: number, year: number) {
  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  return { startOffset: (firstDay + 6) % 7, daysInMonth }
}

function DropdownFieldRow({
  label, preview, isOpen, onToggle, children,
}: {
  label: string
  preview: ReactNode
  isOpen: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div className={styles.dropWrap}>
      <div
        className={`${styles.fieldRow} ${styles.fieldRowDrop} ${isOpen ? styles.fieldRowOpen : ''}`}
        onClick={onToggle}
      >
        <span className={styles.fieldLabel}>{label}</span>
        <div className={styles.fieldDropRight}>{preview}</div>
      </div>
      {isOpen && <div className={styles.dropList} onClick={e => e.stopPropagation()}>{children}</div>}
    </div>
  )
}

function SearchableDropdownFieldRow<T extends { name: string }>({
  label, preview, isOpen, onToggle, items, renderItem,
}: {
  label: string
  preview: ReactNode
  isOpen: boolean
  onToggle: () => void
  items: T[]
  renderItem: (item: T) => ReactNode
}) {
  const [q, setQ]  = useState('')
  const inputRef   = useRef<HTMLInputElement>(null)
  const showSearch = items.length > 5
  const filtered   = showSearch
    ? items.filter(i => i.name.toLowerCase().includes(q.toLowerCase()))
    : items

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 30)
    else setQ('')
  }, [isOpen])

  return (
    <div className={styles.dropWrap}>
      <div
        className={`${styles.fieldRow} ${styles.fieldRowDrop} ${isOpen ? styles.fieldRowOpen : ''}`}
        onClick={onToggle}
      >
        <span className={styles.fieldLabel}>{label}</span>
        <div className={styles.fieldDropRight}>{preview}</div>
      </div>
      {isOpen && (
        <div className={styles.dropList} onClick={e => e.stopPropagation()}>
          {showSearch && (
            <div className={styles.dropSearch}>
              <MagnifyingGlass size={12} />
              <input
                ref={inputRef}
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Suchen…"
                className={styles.dropSearchInput}
              />
              {q && (
                <button onClick={e => { e.stopPropagation(); setQ('') }}>
                  <X size={10} />
                </button>
              )}
            </div>
          )}
          <div className={styles.dropScroll}>
            {filtered.map(item => renderItem(item))}
            {showSearch && filtered.length === 0 && (
              <p className={styles.dropEmpty}>Kein Treffer für „{q}"</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function fmtAmount(raw: string): string {
  if (!raw) return ''
  const [intStr = '', decStr] = raw.split(',')
  const intFmt = intStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return decStr !== undefined ? intFmt + ',' + decStr : intFmt
}

function BuchungsModalSection() {
  const [viewMode,    setViewMode]   = useState<'mobile' | 'desktop'>('mobile')
  const isDesk                       = viewMode === 'desktop'
  const [flow,        setFlow]       = useState<'ein' | 'aus' | 'umbuchung'>('aus')
  const [type,        setType]       = useState<'einzeln' | 'dauerauftrag'>('einzeln')
  const [amount,      setAmount]     = useState('')
  const amountRef                    = useRef<HTMLInputElement>(null)
  const [openDrop,    setOpenDrop]   = useState<'konto' | 'zielkonto' | 'kreditor' | 'zweck' | 'datum' | 'kategorie' | 'zahlungsart' | 'intervall' | 'notiz' | null>(null)
  const [konto,       setKonto]      = useState('Girokonto · DKB')
  const [zielkonto,   setZielkonto]  = useState('Sparkasse Haupt')
  const [kreditor,    setKreditor]   = useState('Amazon.de')
  const [zweck,       setZweck]      = useState('Prime Jahresabo')
  const [kategorie,   setKategorie]  = useState('Abonnements')
  const [zahlungsart, setZahlungsart]= useState('Überweisung')
  const [intervall,   setIntervall]  = useState('Monatlich')
  const [notiz,       setNotiz]      = useState('')
  const [datum,       setDatum]      = useState({ day: 30, month: 3, year: 2026 })
  const [calNav,      setCalNav]     = useState({ month: 3, year: 2026 })

  type DropKey = 'konto' | 'zielkonto' | 'kreditor' | 'zweck' | 'datum' | 'kategorie' | 'zahlungsart' | 'intervall' | 'notiz'
  const toggle = (f: DropKey) => setOpenDrop(prev => prev === f ? null : f)

  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCalNav(p => p.month === 0 ? { month: 11, year: p.year - 1 } : { month: p.month - 1, year: p.year })
  }
  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCalNav(p => p.month === 11 ? { month: 0, year: p.year + 1 } : { month: p.month + 1, year: p.year })
  }

  const datumStr       = `${String(datum.day).padStart(2,'0')}.${String(datum.month+1).padStart(2,'0')}.${datum.year}`
  const selKonto       = MOCK_KONTEN.find(k => k.name === konto)!
  const selZielkonto   = MOCK_KONTEN.find(k => k.name === zielkonto) ?? MOCK_KONTEN[1]
  const selKreditor    = MOCK_KREDITOREN.find(k => k.name === kreditor)!
  const selKat         = MOCK_KATEGORIEN.find(k => k.name === kategorie)!
  const selZahlungsart = MOCK_ZAHLUNGSARTEN.find(z => z.name === zahlungsart)!

  return (
    <section className={styles.mockSection} onClick={() => setOpenDrop(null)}>
      <div className={styles.mockLabel}>Neue Buchung</div>

      {/* View-mode toggle */}
      <div className={styles.mockViewToggle} onClick={e => e.stopPropagation()}>
        <button
          className={`${styles.mockViewBtn} ${!isDesk ? styles.mockViewBtnActive : ''}`}
          onClick={() => setViewMode('mobile')}
          title="Mobil"
        >
          <DeviceMobile size={14} weight={!isDesk ? 'fill' : 'regular'} />
        </button>
        <button
          className={`${styles.mockViewBtn} ${isDesk ? styles.mockViewBtnActive : ''}`}
          onClick={() => setViewMode('desktop')}
          title="Desktop"
        >
          <Monitor size={14} weight={isDesk ? 'fill' : 'regular'} />
        </button>
      </div>

      <div className={`${styles.bModal} ${isDesk ? styles.bModalWide : ''}`} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.bModalHead}>
          <div className={styles.bModalHeadLeft}>
            <img src={candleScopeImg} alt="CandleScope" className={styles.bModalLogo} />
            <span className={styles.bModalTitle}>Neue Buchung</span>
          </div>
          <button className={styles.bModalClose}><X size={14} /></button>
        </div>

        <div className={styles.flowToggle}>
          <button className={`${styles.flowBtn} ${flow === 'ein' ? styles.flowIn : ''}`} onClick={() => setFlow('ein')}>
            <ArrowDown size={12} weight="bold" />Einnahme
          </button>
          <button className={`${styles.flowBtn} ${flow === 'aus' ? styles.flowOut : ''}`} onClick={() => setFlow('aus')}>
            <ArrowUp size={12} weight="bold" />Ausgabe
          </button>
          <button className={`${styles.flowBtn} ${flow === 'umbuchung' ? styles.flowTransfer : ''}`} onClick={() => setFlow('umbuchung')}>
            <ArrowsLeftRight size={12} weight="bold" />Umbuchung
          </button>
        </div>

        <div className={styles.typeToggle}>
          {(['einzeln', 'dauerauftrag'] as const).map(t => (
            <button
              key={t}
              className={`${styles.typeBtn} ${type === t ? styles.typeBtnActive : ''}`}
              onClick={() => setType(t)}
            >
              {t === 'einzeln' ? 'Einzeln' : 'Dauerauftrag'}
            </button>
          ))}
        </div>

        <div className={styles.amountRow} onClick={() => amountRef.current?.focus()}>
          <span className={`${styles.amountCurrency} ${
            flow === 'ein' ? styles.amountIn :
            flow === 'umbuchung' ? styles.amountTransfer :
            styles.amountOut
          }`}>€</span>
          <div className={styles.amountWrap}>
            {(() => {
              const parts      = fmtAmount(amount).split(',')
              const intDisplay = parts[0] || '0'
              const decDisplay = parts[1]
              const dim        = !amount
              return (
                <>
                  <span className={styles.amountInt} style={{ color: dim ? 'var(--cs-text-3)' : undefined }}>
                    {intDisplay}
                  </span>
                  <span className={styles.amountDec} style={{ color: dim ? 'var(--cs-text-3)' : undefined }}>
                    ,{decDisplay ?? '00'}
                  </span>
                </>
              )
            })()}
            <input
              ref={amountRef}
              className={styles.amountHiddenInput}
              type="text"
              inputMode="decimal"
              value={fmtAmount(amount)}
              onChange={e => {
                const stripped = e.target.value.replace(/\./g, '')
                const valid    = stripped.replace(/[^0-9,]/g, '')
                const parts    = valid.split(',')
                if (parts.length > 2) return
                if (parts[1] !== undefined && parts[1].length > 2) return
                setAmount(valid)
              }}
            />
          </div>
        </div>

        <div className={styles.fieldList}>

          {/* Konto */}
          <SearchableDropdownFieldRow
            label="Konto"
            isOpen={openDrop === 'konto'}
            onToggle={() => toggle('konto')}
            items={MOCK_KONTEN}
            preview={
              <div className={styles.dropPreview}>
                <span className={styles.dropDotSm} style={{ background: selKonto.color }} />
                <span className={styles.fieldValue}>{konto}</span>
              </div>
            }
            renderItem={k => (
              <div
                key={k.name}
                className={`${styles.dropItem} ${konto === k.name ? styles.dropItemActive : ''}`}
                onClick={() => { setKonto(k.name); setOpenDrop(null) }}
              >
                <span className={styles.dropDot} style={{ background: k.color }} />
                <div className={styles.dropItemInfo}>
                  <span className={styles.dropItemName}>{k.name}</span>
                  <span className={styles.dropItemSub}>{k.sub}</span>
                </div>
                {konto === k.name && <CheckCircle size={13} weight="fill" className={styles.dropCheck} />}
              </div>
            )}
          />

          {/* Zielkonto (Umbuchung) oder Kreditor */}
          {flow === 'umbuchung' ? (
            <SearchableDropdownFieldRow
              label="Zielkonto"
              isOpen={openDrop === 'zielkonto'}
              onToggle={() => toggle('zielkonto')}
              items={MOCK_KONTEN.filter(k => k.name !== konto)}
              preview={
                <div className={styles.dropPreview}>
                  <span className={styles.dropDotSm} style={{ background: selZielkonto.color }} />
                  <span className={styles.fieldValue}>{selZielkonto.name}</span>
                </div>
              }
              renderItem={k => (
                <div
                  key={k.name}
                  className={`${styles.dropItem} ${zielkonto === k.name ? styles.dropItemActive : ''}`}
                  onClick={() => { setZielkonto(k.name); setOpenDrop(null) }}
                >
                  <span className={styles.dropDot} style={{ background: k.color }} />
                  <div className={styles.dropItemInfo}>
                    <span className={styles.dropItemName}>{k.name}</span>
                    <span className={styles.dropItemSub}>{k.sub}</span>
                  </div>
                  {zielkonto === k.name && <CheckCircle size={13} weight="fill" className={styles.dropCheck} />}
                </div>
              )}
            />
          ) : (
            <SearchableDropdownFieldRow
              label="Kreditor"
              isOpen={openDrop === 'kreditor'}
              onToggle={() => toggle('kreditor')}
              items={MOCK_KREDITOREN}
              preview={
                <div className={styles.dropPreview}>
                  <div className={styles.dropAvatarSm} style={{ background: selKreditor.bg, color: selKreditor.color }}>
                    {selKreditor.initials}
                  </div>
                  <span className={styles.fieldValue}>{kreditor}</span>
                </div>
              }
              renderItem={k => (
                <div
                  key={k.name}
                  className={`${styles.dropItem} ${kreditor === k.name ? styles.dropItemActive : ''}`}
                  onClick={() => { setKreditor(k.name); setOpenDrop(null) }}
                >
                  <div className={styles.dropAvatar} style={{ background: k.bg, color: k.color }}>
                    {k.initials}
                  </div>
                  <span className={styles.dropItemName}>{k.name}</span>
                  {kreditor === k.name && <CheckCircle size={13} weight="fill" className={styles.dropCheck} />}
                </div>
              )}
            />
          )}

          {/* Verwendungszweck */}
          <DropdownFieldRow
            label="Verwendungszweck"
            isOpen={openDrop === 'zweck'}
            onToggle={() => toggle('zweck')}
            preview={<span className={styles.fieldValue}>{zweck || '—'}</span>}
          >
            <div className={styles.zweckDrop}>
              <input
                className={styles.zweckInput}
                value={zweck}
                onChange={e => setZweck(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setOpenDrop(null) }}
                placeholder="Verwendungszweck eingeben…"
                autoFocus
              />
            </div>
          </DropdownFieldRow>

          {/* Datum — Kalender */}
          <DropdownFieldRow
            label="Datum"
            isOpen={openDrop === 'datum'}
            onToggle={() => toggle('datum')}
            preview={<span className={styles.fieldValue}>{datumStr}</span>}
          >
            <div className={styles.calDrop}>
              <div className={styles.calHead}>
                <button className={styles.calNavBtn} onClick={prevMonth}>
                  <CaretLeft size={11} weight="bold" />
                </button>
                <span className={styles.calMonthLabel}>{MONTH_NAMES[calNav.month]} {calNav.year}</span>
                <button className={styles.calNavBtn} onClick={nextMonth}>
                  <CaretRight size={11} weight="bold" />
                </button>
              </div>
              <div className={styles.calGrid}>
                {DAY_NAMES.map(d => <span key={d} className={styles.calDayName}>{d}</span>)}
                {Array.from({ length: getCalDays(calNav.month, calNav.year).startOffset }).map((_, i) => (
                  <span key={`pad-${i}`} />
                ))}
                {Array.from({ length: getCalDays(calNav.month, calNav.year).daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const isSel = datum.day === day && datum.month === calNav.month && datum.year === calNav.year
                  return (
                    <button
                      key={day}
                      className={`${styles.calDay} ${isSel ? styles.calDaySelected : ''}`}
                      onClick={() => { setDatum({ day, month: calNav.month, year: calNav.year }); setOpenDrop(null) }}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>
          </DropdownFieldRow>

          {/* Kategorie (nicht bei Umbuchung) */}
          {flow !== 'umbuchung' && (
            <SearchableDropdownFieldRow
              label="Kategorie"
              isOpen={openDrop === 'kategorie'}
              onToggle={() => toggle('kategorie')}
              items={MOCK_KATEGORIEN}
              preview={
                <div className={styles.dropPreview}>
                  <div className={styles.dropCatIconSm} style={{ background: selKat.bg, color: selKat.color }}>
                    {selKat.emoji}
                  </div>
                  <span className={styles.fieldValue}>{kategorie}</span>
                </div>
              }
              renderItem={k => (
                <div
                  key={k.name}
                  className={`${styles.dropItem} ${kategorie === k.name ? styles.dropItemActive : ''}`}
                  onClick={() => { setKategorie(k.name); setOpenDrop(null) }}
                >
                  <div className={styles.dropCatIcon} style={{ background: k.bg, color: k.color }}>
                    {k.emoji}
                  </div>
                  <span className={styles.dropItemName}>{k.name}</span>
                  {kategorie === k.name && <CheckCircle size={13} weight="fill" className={styles.dropCheck} />}
                </div>
              )}
            />
          )}

          {/* Zahlungsart */}
          <SearchableDropdownFieldRow
            label="Zahlungsart"
            isOpen={openDrop === 'zahlungsart'}
            onToggle={() => toggle('zahlungsart')}
            items={MOCK_ZAHLUNGSARTEN}
            preview={
              <div className={styles.dropPreview}>
                <span className={styles.dropEmojiSm}>{selZahlungsart.icon}</span>
                <span className={styles.fieldValue}>{zahlungsart}</span>
              </div>
            }
            renderItem={z => (
              <div
                key={z.name}
                className={`${styles.dropItem} ${zahlungsart === z.name ? styles.dropItemActive : ''}`}
                onClick={() => { setZahlungsart(z.name); setOpenDrop(null) }}
              >
                <span className={styles.dropEmojiLg}>{z.icon}</span>
                <span className={styles.dropItemName}>{z.name}</span>
                {zahlungsart === z.name && <CheckCircle size={13} weight="fill" className={styles.dropCheck} />}
              </div>
            )}
          />

          {/* Intervall — nur Dauerauftrag */}
          {type === 'dauerauftrag' && (
            <SearchableDropdownFieldRow
              label="Intervall"
              isOpen={openDrop === 'intervall'}
              onToggle={() => toggle('intervall')}
              items={MOCK_INTERVALLE}
              preview={<span className={styles.fieldValue}>{intervall}</span>}
              renderItem={iv => (
                <div
                  key={iv.name}
                  className={`${styles.dropItem} ${intervall === iv.name ? styles.dropItemActive : ''}`}
                  onClick={() => { setIntervall(iv.name); setOpenDrop(null) }}
                >
                  <span className={styles.dropItemName}>{iv.name}</span>
                  {intervall === iv.name && <CheckCircle size={13} weight="fill" className={styles.dropCheck} />}
                </div>
              )}
            />
          )}

          {/* Notiz */}
          <DropdownFieldRow
            label="Notiz"
            isOpen={openDrop === 'notiz'}
            onToggle={() => toggle('notiz')}
            preview={
              <span className={styles.fieldValue} style={{ color: !notiz ? 'var(--cs-text-3)' : undefined }}>
                {notiz || '—'}
              </span>
            }
          >
            <div className={styles.zweckDrop}>
              <textarea
                className={`${styles.zweckInput} ${styles.notizTextarea}`}
                value={notiz}
                onChange={e => setNotiz(e.target.value)}
                onKeyDown={e => { if (e.key === 'Escape') setOpenDrop(null) }}
                placeholder="Eigene Notiz zur Buchung…"
                autoFocus
                rows={3}
              />
            </div>
          </DropdownFieldRow>

          {/* Status */}
          <FieldRow label="Status" value={type === 'einzeln' ? 'Gebucht' : 'Aktiv'} isTag />
        </div>

        <button className={styles.saveBtn} onClick={() => setOpenDrop(null)}>Speichern</button>
      </div>
    </section>
  )
}

// ── 2. Druck-Vorschau ─────────────────────────────────────────────────────────

const PRINT_ROWS = [
  { name: 'Kunde A GmbH',  date: '28.04.2026', amount: '+2.400,00', pos: true  },
  { name: 'Amazon Prime',  date: '30.04.2026', amount: '-14,99',    pos: false },
  { name: 'Rewe',          date: '27.04.2026', amount: '-67,42',    pos: false },
  { name: 'Spotify',       date: '25.04.2026', amount: '-9,99',     pos: false },
  { name: 'SCHUFA',        date: '01.04.2026', amount: '-29,95',    pos: false },
]

function DruckVorschauSection() {
  return (
    <section className={styles.mockSection}>
      <div className={styles.mockLabel}>Druck-Vorschau</div>
      <div className={styles.printModal}>
        <div className={styles.bModalHead}>
          <span className={styles.bModalTitle}>Druckvorschau</span>
          <button className={styles.bModalClose}><X size={14} /></button>
        </div>
        <div className={styles.paper}>
          <div className={styles.paperHeader}>
            <span className={styles.paperBrand}>CandleScope</span>
            <span className={styles.paperMeta}>Transaktionen · April 2026</span>
          </div>
          {PRINT_ROWS.map((r, i) => (
            <div key={i} className={styles.paperRow}>
              <span className={styles.paperRowName}>{r.name}</span>
              <span className={styles.paperRowDate}>{r.date}</span>
              <span className={`${styles.paperRowAmt} ${r.pos ? styles.paperPos : styles.paperNeg}`}>
                {r.amount} €
              </span>
            </div>
          ))}
        </div>
        <div className={styles.printModalFoot}>
          <button className={styles.printCancelBtn}>Abbrechen</button>
          <button className={styles.printBtn} onClick={() => window.print()}>
            <Printer size={13} weight="bold" />Drucken
          </button>
        </div>
      </div>
    </section>
  )
}

// ── 3. Notiz-Modal (mit Tool-Tabs) ───────────────────────────────────────────

type Note = { id: number; title: string; content: string }

const INIT_NOTES: Note[] = [
  { id: 1, title: 'Amazon Prime',  content: 'Läuft am <strong>03.05.</strong> aus — kündigen?<br>Kündigungslink: amazon.de/manage' },
  { id: 2, title: 'Monatsbudget',  content: '' },
]

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

const EMOJIS = [
  '😊','😄','😅','🤔','😬','🙄','🥳','🙏',
  '👍','👎','✅','❌','⚠️','💡','🔔','📌',
  '🎯','🚀','🌟','❤️','🎉','🔥','💪','👀',
  '💰','💸','🏦','💳','📊','📈','📉','🛒',
  '🏠','🚗','✈️','☕','📅','📝','🔑','📦',
]

function NotizModalSection() {
  const [view,       setView]       = useState<FNPView>('notes')
  const [notes,      setNotes]      = useState<Note[]>(INIT_NOTES)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [newTitle,   setNewTitle]   = useState('')
  const nextId                      = useRef(10)
  const editorRef                   = useRef<HTMLDivElement>(null)
  const [showEmoji,  setShowEmoji]  = useState(false)
  const [activeFmts, setActiveFmts] = useState<Set<string>>(new Set())
  const [faqOpen,    setFaqOpen]    = useState<number | null>(null)

  const loadEditorContent = (html: string) => {
    if (!editorRef.current) return
    const doc = new DOMParser().parseFromString(html, 'text/html')
    editorRef.current.replaceChildren(
      ...Array.from(doc.body.childNodes).map(n => n.cloneNode(true))
    )
  }

  useEffect(() => {
    const update = () => {
      if (editorRef.current?.contains(document.activeElement) || document.activeElement === editorRef.current) {
        setActiveFmts(new Set([
          document.queryCommandState('bold')          ? 'bold'   : '',
          document.queryCommandState('italic')        ? 'italic' : '',
          document.queryCommandState('strikeThrough') ? 'strike' : '',
        ].filter(Boolean)))
      }
    }
    document.addEventListener('selectionchange', update)
    return () => document.removeEventListener('selectionchange', update)
  }, [])

  useEffect(() => {
    if (!editorRef.current) return
    const note = notes.find(n => n.id === selectedId)
    if (note) {
      loadEditorContent(note.content)
      editorRef.current.focus()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  const saveEditor = () => {
    if (editorRef.current && selectedId !== null)
      updateContent(selectedId, editorRef.current.innerHTML)
  }

  const fmt = (cmd: string) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false)
    saveEditor()
  }

  const wrapCode = () => {
    const sel = window.getSelection()
    if (!sel || !editorRef.current?.contains(sel.anchorNode)) return
    editorRef.current.focus()
    const text = sel.toString()
    document.execCommand('insertHTML', false, text ? `<code>${text}</code>` : '<code>​</code>')
    saveEditor()
  }

  const insertAtCursor = (text: string) => {
    editorRef.current?.focus()
    document.execCommand('insertText', false, text)
    saveEditor()
  }
  const [calcDisp,   setCalcDisp]   = useState('0')
  const [calcPrev,   setCalcPrev]   = useState<number | null>(null)
  const [calcOp,     setCalcOp]     = useState<string | null>(null)
  const [calcFresh,  setCalcFresh]  = useState(false)

  const selectedNote = notes.find(n => n.id === selectedId)

  const createNote = () => {
    const title = newTitle.trim()
    if (!title) return
    const id = nextId.current++
    setNotes(prev => [...prev, { id, title, content: '' }])
    setSelectedId(id)
    setNewTitle('')
  }

  const updateContent = (id: number, content: string) =>
    setNotes(prev => prev.map(n => n.id === id ? { ...n, content } : n))

  const updateTitle = (id: number, title: string) =>
    setNotes(prev => prev.map(n => n.id === id ? { ...n, title } : n))

  const deleteNote = (id: number) => {
    setNotes(prev => prev.filter(n => n.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const pressCalc = (val: string) => {
    if (val === 'C')  { setCalcDisp('0'); setCalcPrev(null); setCalcOp(null); setCalcFresh(false); return }
    if (val === '±')  { setCalcDisp(d => d.startsWith('-') ? d.slice(1) : '-' + d); return }
    if (val === '%')  { setCalcDisp(d => String(parseFloat(d) / 100)); return }
    if (['+', '−', '×', '÷'].includes(val)) {
      setCalcPrev(parseFloat(calcDisp)); setCalcOp(val); setCalcFresh(true); return
    }
    if (val === '=') {
      if (calcPrev === null || !calcOp) return
      const cur = parseFloat(calcDisp)
      const res = calcOp === '+' ? calcPrev + cur : calcOp === '−' ? calcPrev - cur
                : calcOp === '×' ? calcPrev * cur : (cur !== 0 ? calcPrev / cur : NaN)
      setCalcDisp(String(parseFloat(res.toFixed(10))))
      setCalcPrev(null); setCalcOp(null); setCalcFresh(false); return
    }
    if (val === '.' && calcDisp.includes('.') && !calcFresh) return
    setCalcDisp(prev => {
      if (calcFresh) { setCalcFresh(false); return val === '.' ? '0.' : val }
      if (prev === '0' && val !== '.') return val
      return prev + val
    })
  }

  const CALC_BTNS = [
    ['C', '±', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '−'],
    ['1', '2', '3', '+'],
    ['0', '.', '='],
  ]

  const TOOL_TABS: { key: FNPView; Icon: typeof Question; label: string }[] = [
    { key: 'faq',   Icon: Question,   label: 'FAQ'     },
    { key: 'calc',  Icon: Calculator, label: 'Rechner' },
    { key: 'notes', Icon: NotePencil, label: 'Notizen' },
  ]

  const TITLES: Record<FNPView, string> = { notes: 'Notizen', faq: 'FAQ', calc: 'Rechner' }

  return (
    <section className={styles.mockSection}>
      <div className={styles.mockLabel}>Notizen & Tools</div>
      <div className={styles.chatModal}>

        {/* Header */}
        <div className={styles.chatHead}>
          <div className={styles.chatAvatar} style={{ background: 'var(--cs-surface-2)', color: 'var(--cs-gold)' }}>
            {view === 'notes'  && <NotePencil  size={14} weight="duotone" />}
            {view === 'faq'    && <Question    size={14} weight="duotone" />}
            {view === 'calc'   && <Calculator  size={14} weight="duotone" />}
            </div>
          <div className={styles.chatHeadInfo}>
            <div className={styles.chatName}>
              {view === 'notes' && selectedNote ? selectedNote.title : TITLES[view]}
            </div>
            {view === 'notes' && !selectedNote && (
              <div className={styles.chatSub}>{notes.length} Notiz{notes.length !== 1 ? 'en' : ''}</div>
            )}
          </div>
          <button className={styles.bModalClose}><X size={14} /></button>
        </div>

        {/* Zurück-Leiste (nur in Detailansicht) */}
        {view === 'notes' && selectedNote && (
          <button className={styles.notesBackBar} onClick={() => setSelectedId(null)}>
            <CaretLeft size={11} weight="bold" />
            <span>Alle Notizen</span>
          </button>
        )}

        {/* Content */}
        <div className={`${styles.chatBody} ${view === 'calc' ? styles.chatBodyCalc : ''}`}>

          {view === 'notes' && selectedId === null && (
            notes.length === 0
              ? <p className={styles.notesEmpty}>Noch keine Notizen.</p>
              : <div className={styles.notesList}>
                  {notes.map(n => (
                    <div key={n.id} className={styles.notesListItem} onClick={() => setSelectedId(n.id)}>
                      <div className={styles.notesListMain}>
                        <span className={styles.notesListTitle}>{n.title}</span>
                        {n.content && (
                          <span className={styles.notesListPrev}>{stripHtml(n.content)}</span>
                        )}
                      </div>
                      <button
                        className={styles.notesListDel}
                        onClick={e => { e.stopPropagation(); deleteNote(n.id) }}
                      >
                        <Trash size={11} />
                      </button>
                    </div>
                  ))}
                </div>
          )}

          {view === 'notes' && selectedNote && (
            <div className={styles.notesDetail} onClick={() => setShowEmoji(false)}>
              <input
                className={styles.notesDetailTitle}
                value={selectedNote.title}
                onChange={e => updateTitle(selectedId!, e.target.value)}
                placeholder="Titel"
              />
              <div className={styles.notesDetailBar} onClick={e => e.stopPropagation()}>
                <div className={styles.emojiPickerWrap}>
                  <button
                    className={`${styles.notesDetailBarBtn} ${showEmoji ? styles.notesDetailBarBtnActive : ''}`}
                    title="Emoji einfügen"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => setShowEmoji(v => !v)}
                  >😊</button>
                  {showEmoji && (
                    <div className={styles.emojiPicker}>
                      {EMOJIS.map(e => (
                        <button key={e} className={styles.emojiBtn}
                          onMouseDown={ev => ev.preventDefault()}
                          onClick={() => { insertAtCursor(e); setShowEmoji(false) }}>
                          {e}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className={styles.notesDetailBarDivider} />
                {([
                  { label: <strong>B</strong>, cmd: 'bold',          title: 'Fett (Strg+B)'        },
                  { label: <em>I</em>,         cmd: 'italic',        title: 'Kursiv (Strg+I)'      },
                  { label: <s>S</s>,           cmd: 'strikeThrough', title: 'Durchgestrichen'      },
                ]).map(({ label, cmd, title }) => (
                  <button key={cmd}
                    className={`${styles.notesDetailBarBtn} ${activeFmts.has(cmd) ? styles.notesDetailBarBtnActive : ''}`}
                    title={title}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => fmt(cmd)}>
                    {label}
                  </button>
                ))}
                <button className={styles.notesDetailBarBtn} title="Code"
                  onMouseDown={e => e.preventDefault()}
                  onClick={wrapCode}><code>`</code></button>
                <button className={styles.notesDetailBarBtn} title="Aufgabe einfügen"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => { editorRef.current?.focus(); document.execCommand('insertHTML', false, '<br>☐ '); saveEditor() }}>☑</button>
              </div>
              <div
                ref={editorRef}
                className={styles.notesDetailEditor}
                contentEditable
                suppressContentEditableWarning
                onInput={saveEditor}
              />
            </div>
          )}

          {view === 'faq' && (
            <div className={styles.faqList}>
              {FAQ_ITEMS.map((f, i) => (
                <div key={i} className={styles.faqItem}>
                  <button className={styles.faqQ} onClick={() => setFaqOpen(p => p === i ? null : i)}>
                    <span>{f.q}</span>
                    {faqOpen === i ? <CaretUp size={11} weight="bold" /> : <CaretDown size={11} weight="bold" />}
                  </button>
                  {faqOpen === i && <div className={styles.faqA}>{f.a}</div>}
                </div>
              ))}
            </div>
          )}

          {view === 'calc' && (
            <>
              <div className={styles.calcDisplay}>
                {calcOp && <span className={styles.calcOp}>{String(calcPrev)} {calcOp}</span>}
                <span className={styles.calcVal}>{calcDisp}</span>
              </div>
              <div className={styles.calcGrid}>
                {CALC_BTNS.flat().map((b, i) => (
                  <button
                    key={i}
                    className={`${styles.calcBtn}
                      ${['+','−','×','÷'].includes(b) ? styles.calcBtnOp   : ''}
                      ${b === '='                     ? styles.calcBtnEq   : ''}
                      ${['C','±','%'].includes(b)     ? styles.calcBtnTop  : ''}
                      ${b === '0'                     ? styles.calcBtnZero : ''}
                    `}
                    onClick={() => pressCalc(b)}
                  >{b}</button>
                ))}
              </div>
            </>
          )}

        </div>

        {/* Tool-Badges über dem Input */}
        <div className={styles.fnpToolbar}>
          {TOOL_TABS.map(({ key, Icon, label }) => (
            <button
              key={key}
              className={`${styles.fnpToolBtn} ${view === key ? styles.fnpToolBtnActive : ''}`}
              onClick={() => { setView(key); if (key !== 'notes') setSelectedId(null) }}
            >
              <Icon size={12} weight={view === key ? 'fill' : 'regular'} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Input — nur bei Notizen-Liste (nicht in Detailansicht) */}
        {view === 'notes' && selectedId === null && (
          <div className={styles.chatInput}>
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') createNote() }}
              placeholder="Neue Notiz: Titel eingeben…"
            />
            <button onClick={createNote} disabled={!newTitle.trim()}>
              <Plus size={14} weight="bold" />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

// ── 4. Merken-Karte ───────────────────────────────────────────────────────────

function MerkenSection() {
  const [saved, setSaved] = useState(false)
  return (
    <section className={styles.mockSection}>
      <div className={styles.mockLabel}>Merken</div>
      <div className={styles.merkenCard}>
        <button
          className={`${styles.merkenIcon} ${saved ? styles.merkenIconSaved : ''}`}
          onClick={() => setSaved(v => !v)}
        >
          <Star size={22} weight={saved ? 'fill' : 'regular'} />
        </button>
        <span className={styles.merkenTitle}>{saved ? 'Gespeichert' : 'Merken'}</span>
        <span className={styles.merkenSub}>
          {saved
            ? 'Amazon Prime wurde zu deinen Favoriten hinzugefügt.'
            : 'Diesen Eintrag zu den Favoriten hinzufügen?'}
        </span>
        <button className={styles.merkenAction} onClick={() => setSaved(v => !v)}>
          {saved ? 'Entfernen' : 'Jetzt merken'} <ArrowRight size={11} />
        </button>
      </div>
    </section>
  )
}

// ── 5. Export-Karte ───────────────────────────────────────────────────────────

const EXPORT_FORMATS = [
  { label: 'CSV',  desc: 'Kommagetrennte Tabelle', cls: 'fmtCsv'  },
  { label: 'PDF',  desc: 'Druckbares Dokument',    cls: 'fmtPdf'  },
  { label: 'XLSX', desc: 'Excel-Tabelle',           cls: 'fmtXlsx' },
] as const

function ExportSection() {
  const [downloading, setDownloading] = useState<string | null>(null)

  const startDownload = (label: string) => {
    setDownloading(label)
    setTimeout(() => setDownloading(null), 1800)
  }

  return (
    <section className={styles.mockSection}>
      <div className={styles.mockLabel}>Export</div>
      <div className={styles.exportCard}>
        <div className={styles.exportHead}>
          <div className={styles.exportTitle}>Exportieren</div>
          <div className={styles.exportSub}>Transaktionen · April 2026</div>
        </div>
        <div className={styles.exportFormats}>
          {EXPORT_FORMATS.map(f => (
            <div
              key={f.label}
              className={`${styles.exportFormat} ${downloading === f.label ? styles.exportFormatActive : ''}`}
              onClick={() => startDownload(f.label)}
            >
              <div className={styles.exportFmtLeft}>
                <div className={`${styles.exportFmtIcon} ${styles[f.cls]}`}>{f.label}</div>
                <div>
                  <div className={styles.exportFmtName}>{f.label}</div>
                  <div className={styles.exportFmtDesc}>
                    {downloading === f.label ? 'Wird vorbereitet…' : f.desc}
                  </div>
                </div>
              </div>
              {downloading === f.label
                ? <ArrowCounterClockwise size={14} className={`${styles.exportDownIcon} ${styles.exportDownSpin}`} />
                : <DownloadSimple size={14} className={styles.exportDownIcon} />}
            </div>
          ))}
        </div>
        <div className={styles.exportFoot}>
          <button className={styles.exportArchiveLink}>
            <FolderOpen size={13} />Zum Archiv <ArrowRight size={11} />
          </button>
        </div>
      </div>
    </section>
  )
}

// ── 6. Teilen-Modal ───────────────────────────────────────────────────────────

const ACCESS_OPTS = [
  { key: 'private' as const, label: 'Nur ich',    Icon: Lock  },
  { key: 'link'    as const, label: 'Mit Link',   Icon: Link  },
  { key: 'public'  as const, label: 'Öffentlich', Icon: Globe },
]

function TeilenSection() {
  const [copied, setCopied]         = useState(false)
  const [showQR, setShowQR]         = useState(false)
  const [access, setAccess]         = useState<'private' | 'link' | 'public'>('link')
  const [accessOpen, setAccessOpen] = useState(false)

  const copyLink = () => {
    navigator.clipboard.writeText('https://app.candlescope.de/share/apr26').catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const current = ACCESS_OPTS.find(o => o.key === access)!

  return (
    <section className={styles.mockSection} onClick={() => setAccessOpen(false)}>
      <div className={styles.mockLabel}>Teilen</div>
      <div className={styles.shareModal}>

        <div className={styles.shareHead}>
          <ShareNetwork size={15} />
          <span className={styles.shareTitle}>Teilen</span>
          <button className={styles.shareClose}><X size={14} /></button>
        </div>

        <div className={styles.sharePreview}>
          <div className={styles.sharePreviewIcon}><DownloadSimple size={16} /></div>
          <div className={styles.sharePreviewInfo}>
            <div className={styles.sharePreviewName}>Monatsbericht April 2026</div>
            <div className={styles.sharePreviewMeta}>PDF · 142 KB</div>
          </div>
        </div>

        <div className={styles.shareAccessWrap} onClick={e => e.stopPropagation()}>
          <span className={styles.shareAccessLabel}>Zugriff</span>
          <div className={styles.shareAccessSelect} onClick={() => setAccessOpen(o => !o)}>
            <current.Icon size={12} />
            <span>{current.label}</span>
            <CaretDown size={10} className={accessOpen ? styles.caretFlip : ''} />
            {accessOpen && (
              <div className={styles.shareAccessDropdown}>
                {ACCESS_OPTS.map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    className={`${styles.shareAccessOpt} ${access === key ? styles.shareAccessOptActive : ''}`}
                    onClick={e => { e.stopPropagation(); setAccess(key); setAccessOpen(false) }}
                  >
                    <Icon size={12} />
                    {label}
                    {access === key && <CheckCircle size={12} className={styles.shareAccessCheck} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.shareRows}>
          <div className={styles.shareRow}>
            <div className={styles.shareRowLeft}>
              <div className={styles.shareRowIcon}><Link size={14} /></div>
              <div>
                <div className={styles.shareRowLabel}>Link kopieren</div>
                <div className={styles.shareRowSub}>app.candlescope.de/share/apr26</div>
              </div>
            </div>
            <button
              className={`${styles.shareBtn} ${copied ? styles.shareBtnDone : ''}`}
              onClick={e => { e.stopPropagation(); copyLink() }}
            >
              {copied
                ? <><CheckCircle size={12} /> Kopiert!</>
                : <><Copy size={12} /> Kopieren</>}
            </button>
          </div>

          <div className={styles.shareRow}>
            <div className={styles.shareRowLeft}>
              <div className={styles.shareRowIcon}><EnvelopeSimple size={14} /></div>
              <div>
                <div className={styles.shareRowLabel}>Per E-Mail senden</div>
                <div className={styles.shareRowSub}>Einladung verschicken</div>
              </div>
            </div>
            <button className={styles.shareBtn} onClick={e => e.stopPropagation()}>
              <ArrowRight size={12} /> Senden
            </button>
          </div>

          <div className={styles.shareRow}>
            <div className={styles.shareRowLeft}>
              <div className={styles.shareRowIcon}><QrCode size={14} /></div>
              <div>
                <div className={styles.shareRowLabel}>QR-Code</div>
                <div className={styles.shareRowSub}>Zum Scannen teilen</div>
              </div>
            </div>
            <button
              className={`${styles.shareBtn} ${showQR ? styles.shareBtnActive : ''}`}
              onClick={e => { e.stopPropagation(); setShowQR(o => !o) }}
            >
              {showQR ? 'Ausblenden' : 'Anzeigen'}
            </button>
          </div>
        </div>

        {showQR && (
          <div className={styles.qrWrap}>
            <div className={styles.qrGrid}>
              {Array.from({ length: 49 }).map((_, i) => {
                const r = Math.floor(i / 7)
                const c = i % 7
                const outer = r === 0 || r === 6 || c === 0 || c === 6
                const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4
                return <div key={i} className={`${styles.qrCell} ${outer || inner ? styles.qrCellFilled : ''}`} />
              })}
            </div>
            <div className={styles.qrLabel}>Scannen zum Öffnen</div>
          </div>
        )}

      </div>
    </section>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────

export function LayoutPrototypes() {
  return (
    <>
      <LayoutE />
      <BuchungsModalSection />
      <DruckVorschauSection />
      <NotizModalSection />
      <MerkenSection />
      <ExportSection />
      <TeilenSection />
    </>
  )
}
