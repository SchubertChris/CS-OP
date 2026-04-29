import { useState, useEffect, useRef } from 'react'
import {
  SquaresFour, Wallet, ChartLineUp, Target, Gear, Archive,
  MagnifyingGlass, X, Plus, ArrowRight, CaretDown,
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
                transform: open
                  ? `translate(${x}px, ${y}px) scale(1)`
                  : 'translate(0,0) scale(0.4)',
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

        <button
          className={`${styles.fab} ${open ? styles.fabOpen : ''}`}
          onClick={() => setOpen(v => !v)}
        >
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
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Seite oder Aktion suchen…"
              />
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
              {filtered.length === 0 && (
                <p className={styles.paletteEmpty}>Keine Treffer für „{query}"</p>
              )}
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

      <div
        className={`${styles.pill} ${open ? styles.pillOpen : ''}`}
        onClick={e => e.stopPropagation()}
      >
        {open
          ? NAV.map(({ Icon, label }, i) => (
            <button
              key={label}
              className={`${styles.pillItem} ${active === i ? styles.active : ''}`}
              onClick={() => { setActive(i); setOpen(false) }}
            >
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

// ── 04 — Edge Peek Drawer ───────────────────────────────────────────────────────

function EdgeDrawer() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)

  return (
    <section className={styles.section} onClick={() => setOpen(false)}>
      <MockBg title="04 — Edge Peek Drawer" />

      <button
        className={`${styles.edgeTab} ${open ? styles.edgeTabOpen : ''}`}
        onClick={e => { e.stopPropagation(); setOpen(v => !v) }}
        title="Navigation öffnen"
      >
        <span className={styles.edgeTabPip} />
        <span className={styles.edgeTabPip} />
        <span className={styles.edgeTabPip} />
      </button>

      <nav
        className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.drawerHeader}>
          <span className={styles.drawerBrand}>CANDLESCOPE</span>
          <button className={styles.drawerClose} onClick={() => setOpen(false)}>
            <X size={14} />
          </button>
        </div>

        <div className={styles.drawerItems}>
          {NAV.map(({ Icon, label }, i) => (
            <button
              key={label}
              className={`${styles.drawerItem} ${active === i ? styles.active : ''}`}
              onClick={() => { setActive(i); setOpen(false) }}
            >
              <Icon size={19} weight={active === i ? 'fill' : 'regular'} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </section>
  )
}

// ── 05 — Speed Dial Stack ───────────────────────────────────────────────────────

function SpeedDial() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)

  return (
    <section className={styles.section} onClick={() => setOpen(false)}>
      <MockBg title="05 — Speed Dial Stack" />

      <div className={styles.speedRoot} onClick={e => e.stopPropagation()}>
        {[...NAV].reverse().map(({ Icon, label }, i) => {
          const realIdx = NAV.length - 1 - i
          return (
            <div
              key={label}
              className={styles.speedItem}
              style={{
                transform: open ? `translateY(${-(i + 1) * 56}px)` : 'translateY(0)',
                opacity: open ? 1 : 0,
                transitionDelay: open ? `${i * 35}ms` : `${(NAV.length - 1 - i) * 22}ms`,
                pointerEvents: open ? 'auto' : 'none',
              }}
              onClick={() => { setActive(realIdx); setOpen(false) }}
            >
              <span className={styles.speedLabel}>{label}</span>
              <button className={`${styles.speedBtn} ${active === realIdx ? styles.active : ''}`}>
                <Icon size={17} weight={active === realIdx ? 'fill' : 'regular'} />
              </button>
            </div>
          )
        })}

        <button
          className={`${styles.fab} ${open ? styles.fabOpen : ''}`}
          onClick={() => setOpen(v => !v)}
        >
          {open ? <X size={22} weight="bold" /> : <Plus size={22} weight="bold" />}
        </button>
      </div>
    </section>
  )
}

// ── 06 — Sliding Tab Bar ────────────────────────────────────────────────────────

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
      <MockBg title="06 — Sliding Tab Bar" />
      <div ref={tabsRef} className={styles.tabBar}>
        <div
          className={styles.tabIndicator}
          style={{ left: ind.left, width: ind.width }}
        />
        {NAV.map(({ Icon, label }, i) => (
          <button
            key={label}
            ref={i === active ? activeRef : undefined}
            className={`${styles.tab} ${active === i ? styles.tabActive : ''}`}
            onClick={() => setActive(i)}
          >
            <Icon size={16} weight={active === i ? 'fill' : 'regular'} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

// ── 07 — Dynamic Island ──────────────────────────────────────────────────────────

function DynamicIsland() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const { Icon: ActiveIcon } = NAV[active]

  return (
    <section className={styles.section} onClick={() => setOpen(false)}>
      <MockBg title="07 — Dynamic Island" />
      <div
        className={`${styles.island} ${open ? styles.islandOpen : ''}`}
        onClick={e => { e.stopPropagation(); !open && setOpen(true) }}
      >
        {open
          ? (
            <div className={styles.islandMenu}>
              {NAV.map(({ Icon, label }, i) => (
                <button
                  key={label}
                  className={`${styles.islandItem} ${active === i ? styles.active : ''}`}
                  onClick={() => { setActive(i); setOpen(false) }}
                >
                  <Icon size={18} weight={active === i ? 'fill' : 'regular'} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )
          : (
            <div className={styles.islandClosed}>
              <ActiveIcon size={15} weight="fill" />
              <span>{NAV[active].label}</span>
            </div>
          )
        }
      </div>
    </section>
  )
}

// ── 08 — Vertical Side Labels ────────────────────────────────────────────────────

function SideLabels() {
  const [active, setActive] = useState(0)
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <section className={styles.section}>
      <MockBg title="08 — Vertical Side Labels" />
      <nav className={styles.sideNav}>
        {NAV.map(({ Icon, label }, i) => {
          const isActive = active === i
          const isHov    = hovered === i
          return (
            <button
              key={label}
              className={`${styles.sideItem} ${isActive ? styles.active : ''}`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setActive(i)}
            >
              <span className={`${styles.sidePip} ${isActive || isHov ? styles.sidePipActive : ''}`} />
              <Icon size={15} weight={isActive ? 'fill' : 'regular'} />
              <span className={styles.sideItemLabel}>{label}</span>
            </button>
          )
        })}
      </nav>
    </section>
  )
}

// ── 09 — Breadcrumb Flyout ───────────────────────────────────────────────────────

function BreadcrumbFlyout() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const { Icon: ActiveIcon } = NAV[active]

  return (
    <section className={styles.section} onClick={() => setOpen(false)}>
      <MockBg title="09 — Breadcrumb Flyout" />
      <div className={styles.breadcrumbBar} onClick={e => e.stopPropagation()}>
        <span className={styles.bcRoot}>CANDLESCOPE</span>
        <span className={styles.bcSep}>/</span>
        <button
          className={`${styles.bcCurrent} ${open ? styles.bcCurrentOpen : ''}`}
          onClick={() => setOpen(v => !v)}
        >
          <ActiveIcon size={14} weight="fill" />
          <span>{NAV[active].label}</span>
          <CaretDown size={12} className={`${styles.bcCaret} ${open ? styles.bcCaretOpen : ''}`} />
        </button>

        {open && (
          <div className={styles.bcDropdown}>
            {NAV.map(({ Icon, label }, i) => (
              <button
                key={label}
                className={`${styles.bcItem} ${active === i ? styles.active : ''}`}
                onClick={() => { setActive(i); setOpen(false) }}
              >
                <Icon size={15} weight={active === i ? 'fill' : 'regular'} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ── 10 — Corner Fan ─────────────────────────────────────────────────────────────

function CornerFan() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const R = 115

  return (
    <section className={styles.section} onClick={() => setOpen(false)}>
      <MockBg title="10 — Corner Fan" />
      <div className={styles.fanRoot} onClick={e => e.stopPropagation()}>
        {NAV.map(({ Icon, label }, i) => {
          const angle = (i / (NAV.length - 1)) * (Math.PI / 2)
          const x = -Math.sin(angle) * R
          const y = -Math.cos(angle) * R
          const isActive = active === i
          return (
            <button
              key={label}
              className={`${styles.fanItem} ${isActive ? styles.active : ''}`}
              style={{
                transform: open
                  ? `translate(${x}px, ${y}px) scale(1)`
                  : 'translate(0, 0) scale(0.3)',
                opacity: open ? 1 : 0,
                transitionDelay: open ? `${i * 42}ms` : `${(NAV.length - 1 - i) * 26}ms`,
              }}
              onClick={() => { setActive(i); setOpen(false) }}
              title={label}
            >
              <Icon size={19} weight={isActive ? 'fill' : 'duotone'} />
              <span>{label}</span>
            </button>
          )
        })}
        <button
          className={`${styles.fab} ${open ? styles.fabOpen : ''}`}
          onClick={() => setOpen(v => !v)}
        >
          {open ? <X size={22} weight="bold" /> : <Plus size={22} weight="bold" />}
        </button>
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
      <EdgeDrawer />
      <SpeedDial />
      <TabBar />
      <DynamicIsland />
      <SideLabels />
      <BreadcrumbFlyout />
      <CornerFan />
    </div>
  )
}
