import { useEffect, useRef, useCallback } from 'react'
import styles from './IntroAnimation.module.scss'

interface Props {
  onComplete: () => void
}

// ── Tunnel Config ─────────────────────────────────────────────────────────────
const CAM_SPEED  = 1100   // units / sec — höher = schneller
const Z_GAP      = 520    // Abstand zwischen Item-Slots
const ITEM_SLOTS = 9      // Items pro Loop
const LOOP_SIZE  = ITEM_SLOTS * Z_GAP  // 4680
const NEAR_CLIP  = 580    // wie nah Elemente kommen bevor sie wrappen
const STAR_COUNT = 180

// Reihenfolge der Items in einem Loop (9 Slots à Z_GAP)
const SLOT_DEFS = [
  { type: 'text', label: 'CANDLESCOPE' },
  { type: 'card', cardIdx: 0 },
  { type: 'text', label: 'FINANZHUB'   },
  { type: 'card', cardIdx: 1 },
  { type: 'text', label: 'SYSTEM'      },
  { type: 'card', cardIdx: 2 },
  { type: 'text', label: 'BEREIT'      },
  { type: 'card', cardIdx: 0 },
  { type: 'text', label: 'CANDLESCOPE' },
] as const

const CARD_CONFIGS = [
  { label: 'NETTOVERMÖGEN', value: '€ 24.890', sub: '+12.4% · YTD',    accent: '#22C55E', x: -300, y:  80 },
  { label: 'CASHFLOW',      value: '€ 1.240',  sub: 'pro Monat',        accent: '#C9A84C', x:  280, y: -100 },
  { label: 'SPARQUOTE',     value: '34 %',      sub: '↑ +3% ggü. Vormonat', accent: '#C9A84C', x: -220, y: -150 },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function css(el: HTMLElement, props: Partial<CSSStyleDeclaration>) {
  Object.assign(el.style, props)
}

function getCSSVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function makeTextEl(label: string, gold: string, textColor: string): HTMLElement {
  const el = document.createElement('div')
  el.textContent = label
  css(el, {
    position: 'absolute', left: '0', top: '0',
    fontSize: 'clamp(100px, 16vw, 240px)',
    fontWeight: '800',
    fontFamily: "'Geist', 'Space Grotesk', sans-serif",
    color: 'transparent',
    webkitTextStroke: `2px ${gold}28`,
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    letterSpacing: '-0.05em',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    opacity: '0',
    willChange: 'transform, opacity',
    // Light-mode fallback: slightly stronger stroke
    textShadow: `0 0 80px ${gold}18`,
  })
  // Adapt stroke for light mode — more visible on light bg
  if (textColor.startsWith('#F') || textColor.startsWith('rgb(2') || textColor.startsWith('rgb(1')) {
    // dark text = light mode
    el.style.webkitTextStroke = `1.5px ${gold}40`
  }
  return el
}

function makeCardEl(idx: number, gold: string, surfaceBg: string, textColor: string): HTMLElement {
  const cfg = CARD_CONFIGS[idx]
  const wrap = document.createElement('div')
  css(wrap, {
    position: 'absolute', left: '0', top: '0',
    width: '300px',
    padding: '24px 26px',
    background: surfaceBg,
    border: `1px solid ${gold}2A`,
    borderRadius: '10px',
    backdropFilter: 'blur(14px)',
    transform: 'translate(-50%, -50%)',
    boxShadow: `0 24px 70px rgba(0,0,0,0.45), 0 0 0 1px ${gold}12`,
    opacity: '0',
    willChange: 'transform, opacity',
    overflow: 'hidden',
  })

  const lbl = document.createElement('div')
  lbl.textContent = cfg.label
  css(lbl, {
    fontFamily: "'Geist Mono', monospace",
    fontSize: '9px', letterSpacing: '0.18em',
    textTransform: 'uppercase', color: `${gold}80`,
    marginBottom: '12px',
  })

  const val = document.createElement('div')
  val.textContent = cfg.value
  css(val, {
    fontFamily: "'Geist', sans-serif",
    fontSize: '36px', fontWeight: '700',
    color: textColor, letterSpacing: '-0.03em', lineHeight: '1',
  })

  const sub = document.createElement('div')
  sub.textContent = cfg.sub
  css(sub, {
    fontFamily: "'Geist Mono', monospace",
    fontSize: '11px', color: cfg.accent, marginTop: '10px',
  })

  const num = document.createElement('div')
  num.textContent = `0${idx + 1}`
  css(num, {
    position: 'absolute', bottom: '18px', right: '20px',
    fontFamily: "'Geist Mono', monospace",
    fontSize: '28px', fontWeight: '800', color: `${gold}08`,
  })

  const tlCorner = document.createElement('div')
  css(tlCorner, {
    position: 'absolute', top: '-1px', left: '-1px',
    width: '12px', height: '12px',
    borderTop: `1px solid ${gold}55`, borderLeft: `1px solid ${gold}55`,
  })
  const brCorner = document.createElement('div')
  css(brCorner, {
    position: 'absolute', bottom: '-1px', right: '-1px',
    width: '12px', height: '12px',
    borderBottom: `1px solid ${gold}55`, borderRight: `1px solid ${gold}55`,
  })

  wrap.appendChild(lbl)
  wrap.appendChild(val)
  wrap.appendChild(sub)
  wrap.appendChild(num)
  wrap.appendChild(tlCorner)
  wrap.appendChild(brCorner)
  return wrap
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Item = {
  el: HTMLElement
  type: 'text' | 'card' | 'star'
  x: number
  y: number
  baseZ: number
  idx: number
}

// ── Component ─────────────────────────────────────────────────────────────────

export function IntroAnimation({ onComplete }: Props) {
  const overlayRef  = useRef<HTMLDivElement>(null)
  const worldRef    = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const fpsRef      = useRef<HTMLSpanElement>(null)
  const coordRef    = useRef<HTMLSpanElement>(null)
  const doneRef     = useRef(false)

  const handleSkip = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    const overlay = overlayRef.current
    if (overlay) {
      overlay.style.transition = 'opacity 0.4s ease'
      overlay.style.opacity = '0'
    }
    setTimeout(onComplete, 420)
  }, [onComplete])

  useEffect(() => {
    const overlay  = overlayRef.current
    const world = worldRef.current!
    if (!overlay || !worldRef.current || !viewportRef.current) return

    // Lese Theme-Variablen einmalig beim Start
    const gold      = getCSSVar('--cs-gold')   || '#C9A84C'
    const textColor = getCSSVar('--cs-text')   || '#F0ECE8'
    // Glassmorphism-Hintergrund abhängig vom Theme
    const isLight   = document.documentElement.classList.contains('light')
    const surfaceBg = isLight
      ? 'rgba(255,255,255,0.65)'
      : 'rgba(12,12,12,0.60)'

    const items: Item[] = []
    const mouse = { x: 0, y: 0 }

    const onMouse = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouse)

    // ── Build items ──────────────────────────────────────────────────────────

    SLOT_DEFS.forEach((def, i) => {
      const baseZ = -i * Z_GAP
      if (def.type === 'text') {
        const el = makeTextEl(def.label, gold, textColor)
        world.appendChild(el)
        items.push({ el, type: 'text', x: 0, y: 0, baseZ, idx: i })
      } else {
        const cfg = CARD_CONFIGS[def.cardIdx]
        const el  = makeCardEl(def.cardIdx, gold, surfaceBg, textColor)
        world.appendChild(el)
        items.push({ el, type: 'card', x: cfg.x, y: cfg.y, baseZ, idx: i })
      }
    })

    // Stars
    for (let i = 0; i < STAR_COUNT; i++) {
      const el = document.createElement('div')
      css(el, {
        position: 'absolute', left: '0', top: '0',
        width: '2px', height: '2px',
        borderRadius: '50%',
        background: i % 6 === 0 ? `${gold}BB` : isLight ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.55)',
        transform: 'translate(-50%, -50%)',
        willChange: 'transform, opacity',
      })
      world.appendChild(el)
      items.push({
        el, type: 'star', idx: i,
        x: (Math.random() - 0.5) * 3000,
        y: (Math.random() - 0.5) * 3000,
        baseZ: -Math.random() * LOOP_SIZE,
      })
    }

    // ── RAF – infinite loop ──────────────────────────────────────────────────

    let rafId: number
    let lastTime: number | null = null
    let cameraZ = 0

    function frame(time: number) {
      if (doneRef.current) return

      const dt = lastTime !== null ? Math.min(time - lastTime, 50) : 16
      lastTime = time
      cameraZ += (dt / 1000) * CAM_SPEED

      if (fpsRef.current)
        fpsRef.current.textContent = String(Math.round(1000 / Math.max(dt, 1)))
      if (coordRef.current)
        coordRef.current.textContent = cameraZ.toFixed(0).padStart(7, '0')

      // Camera tilt from mouse
      world.style.transform =
        `rotateX(${mouse.y * 5}deg) rotateY(${mouse.x * 5}deg)`

      items.forEach(item => {
        const relZ = item.baseZ + cameraZ

        // ── Infinite modulo wrap ──
        let vizZ = ((relZ % LOOP_SIZE) + LOOP_SIZE) % LOOP_SIZE
        if (vizZ > NEAR_CLIP) vizZ -= LOOP_SIZE
        // vizZ is now in (-LOOP_SIZE + NEAR_CLIP, NEAR_CLIP]

        // ── Opacity ──
        const FAR  = -3200
        const FADE_IN_END = -2000
        let alpha = 1
        if (vizZ < FAR)                           alpha = 0
        else if (vizZ < FADE_IN_END)              alpha = (vizZ - FAR) / (FADE_IN_END - FAR)
        if (item.type !== 'star' && vizZ > 150)   alpha = Math.max(0, 1 - (vizZ - 150) / (NEAR_CLIP - 150))
        if (item.type === 'star' && vizZ > NEAR_CLIP - 80) alpha = 0

        const a = Math.max(0, Math.min(1, alpha))
        item.el.style.opacity = String(a)

        if (a > 0) {
          if (item.type === 'card') {
            const t    = time * 0.001
            const floatY = Math.sin(t * 0.9 + item.idx * 1.4) * 22
            const rotZ   = Math.cos(t * 0.6 + item.idx * 1.1) * 8
            const rotY   = Math.sin(t * 0.4 + item.idx * 0.9) * 6
            item.el.style.transform =
              `translate3d(${item.x}px, ${item.y + floatY}px, ${vizZ}px) rotateZ(${rotZ}deg) rotateY(${rotY}deg)`
          } else if (item.type === 'text') {
            const t     = time * 0.001
            const scale = 1 + Math.sin(t * 0.7 + item.idx) * 0.04
            item.el.style.transform =
              `translate3d(${item.x}px, ${item.y}px, ${vizZ}px) scale(${scale})`
          } else {
            // star — simple translate, no rotation overhead
            item.el.style.transform =
              `translate3d(${item.x}px, ${item.y}px, ${vizZ}px)`
          }
        }
      })

      rafId = requestAnimationFrame(frame)
    }

    rafId = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMouse)
      items.forEach(item => {
        if (world.contains(item.el)) world.removeChild(item.el)
      })
    }
  }, [])

  return (
    <div ref={overlayRef} className={styles.overlay} onClick={handleSkip}>
      <div className={styles.scanlines} />
      <div className={styles.vignette} />

      <div className={`${styles.corner} ${styles.tl}`} />
      <div className={`${styles.corner} ${styles.tr}`} />
      <div className={`${styles.corner} ${styles.bl}`} />
      <div className={`${styles.corner} ${styles.br}`} />

      <div ref={viewportRef} className={styles.viewport}>
        <div ref={worldRef} className={styles.world} />
      </div>

      <div className={styles.hud}>
        <div className={styles.hudRow}>
          <span>SYS.<span className={styles.hudAccent}>LIVE</span></span>
          <div className={styles.hudLine} />
          <span>FPS <span className={styles.hudAccent} ref={fpsRef}>60</span></span>
        </div>
        <div className={styles.hudRow}>
          <span>Z.COORD <span className={styles.hudAccent} ref={coordRef}>0000000</span></span>
          <div className={styles.hudLine} />
          <span>CANDLESCOPE <span className={styles.hudAccent}>v1.0</span></span>
        </div>
      </div>

      <span className={styles.skip}>Klicken zum Überspringen</span>
    </div>
  )
}
