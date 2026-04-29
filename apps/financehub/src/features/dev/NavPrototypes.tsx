import { useState, useEffect, useRef } from 'react'
import {
  SquaresFour, Wallet, ChartLineUp, Target, Gear, Archive,
  MagnifyingGlass, X, Plus, ArrowRight,
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

// ── Export ─────────────────────────────────────────────────────────────────────

export function NavPrototypes() {
  return (
    <div className={styles.root}>
      <RadialNav />
      <CommandPalette />
      <PillDock />
      <EdgeDrawer />
      <SpeedDial />
    </div>
  )
}
