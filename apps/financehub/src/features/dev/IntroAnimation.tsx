import { useEffect, useRef } from 'react'
import styles from './IntroAnimation.module.scss'

interface Props {
  onComplete: () => void
}

const DURATION  = 4200
const CAM_SPEED = 420
const STAR_COUNT = 120

const CARDS = [
  { label: 'NETTOVERMÖGEN', value: '€ 24.890', sub: '+12.4% · YTD', color: '#22C55E', x: -260, y:  60 },
  { label: 'CASHFLOW',      value: '€ 1.240',  sub: 'pro Monat',     color: '#C9A84C', x:  220, y: -80 },
  { label: 'SPARQUOTE',     value: '34 %',      sub: '↑ vs. Vormonat',color: '#C9A84C', x: -180, y:-120 },
]

const BIG_TEXTS = [
  { label: 'CANDLESCOPE', z: -500  },
  { label: 'FINANZHUB',   z: -1400 },
  { label: 'BEREIT',      z: -2400 },
]

const CARD_Z = [-900, -1600, -2100]

function applyStyle(el: HTMLElement, props: Partial<CSSStyleDeclaration>) {
  Object.assign(el.style, props)
}

function makeCard(cfg: typeof CARDS[number], index: number): HTMLElement {
  const wrap = document.createElement('div')
  applyStyle(wrap, {
    position: 'absolute', left: '0', top: '0',
    width: '240px',
    padding: '20px 22px',
    background: 'rgba(10,10,10,0.55)',
    border: '1px solid rgba(201,168,76,0.18)',
    borderRadius: '8px',
    backdropFilter: 'blur(10px)',
    transform: 'translate(-50%, -50%)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    opacity: '0',
    willChange: 'transform, opacity',
    overflow: 'hidden',
  })

  const lbl = document.createElement('div')
  lbl.textContent = cfg.label
  applyStyle(lbl, {
    fontFamily: "'Geist Mono', monospace",
    fontSize: '9px', letterSpacing: '0.16em',
    textTransform: 'uppercase', color: 'rgba(201,168,76,0.5)',
    marginBottom: '10px',
  })

  const val = document.createElement('div')
  val.textContent = cfg.value
  applyStyle(val, {
    fontFamily: "'Geist', sans-serif",
    fontSize: '28px', fontWeight: '700',
    color: '#F0ECE8', letterSpacing: '-0.02em', lineHeight: '1',
  })

  const sub = document.createElement('div')
  sub.textContent = cfg.sub
  applyStyle(sub, {
    fontFamily: "'Geist Mono', monospace",
    fontSize: '10px', color: cfg.color, marginTop: '8px',
  })

  const num = document.createElement('div')
  num.textContent = `0${index + 1}`
  applyStyle(num, {
    position: 'absolute', bottom: '14px', right: '16px',
    fontFamily: "'Geist Mono', monospace",
    fontSize: '24px', fontWeight: '800',
    color: 'rgba(255,255,255,0.04)',
  })

  const cornerTL = document.createElement('div')
  applyStyle(cornerTL, {
    position: 'absolute', top: '-1px', left: '-1px',
    width: '10px', height: '10px',
    borderTop: '1px solid rgba(201,168,76,0.4)',
    borderLeft: '1px solid rgba(201,168,76,0.4)',
  })

  const cornerBR = document.createElement('div')
  applyStyle(cornerBR, {
    position: 'absolute', bottom: '-1px', right: '-1px',
    width: '10px', height: '10px',
    borderBottom: '1px solid rgba(201,168,76,0.4)',
    borderRight: '1px solid rgba(201,168,76,0.4)',
  })

  wrap.appendChild(lbl)
  wrap.appendChild(val)
  wrap.appendChild(sub)
  wrap.appendChild(num)
  wrap.appendChild(cornerTL)
  wrap.appendChild(cornerBR)
  return wrap
}

type Item = { el: HTMLElement; type: string; x: number; y: number; baseZ: number }

export function IntroAnimation({ onComplete }: Props) {
  const overlayRef  = useRef<HTMLDivElement>(null)
  const worldRef    = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const fpsRef      = useRef<HTMLSpanElement>(null)
  const coordRef    = useRef<HTMLSpanElement>(null)
  const progRef     = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const overlay  = overlayRef.current
    const world    = worldRef.current
    const viewport = viewportRef.current
    if (!overlay || !world || !viewport) return

    const items: Item[] = []
    const mouse = { x: 0, y: 0 }

    const onMouse = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouse)

    // Big ghost text
    BIG_TEXTS.forEach(cfg => {
      const el = document.createElement('div')
      el.textContent = cfg.label
      applyStyle(el, {
        position: 'absolute', left: '0', top: '0',
        fontSize: 'clamp(56px, 9vw, 120px)',
        fontWeight: '800',
        fontFamily: "'Geist', 'Space Grotesk', sans-serif",
        color: 'transparent',
        webkitTextStroke: '1.5px rgba(201,168,76,0.15)',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        letterSpacing: '-0.04em',
        opacity: '0',
        willChange: 'transform, opacity',
      })
      world.appendChild(el)
      items.push({ el, type: 'text', x: 0, y: 0, baseZ: cfg.z })
    })

    // Cards
    CARDS.forEach((cfg, i) => {
      const el = makeCard(cfg, i)
      world.appendChild(el)
      items.push({ el, type: 'card', x: cfg.x, y: cfg.y, baseZ: CARD_Z[i] })
    })

    // Stars
    for (let i = 0; i < STAR_COUNT; i++) {
      const el = document.createElement('div')
      applyStyle(el, {
        position: 'absolute', left: '0', top: '0',
        width: '2px', height: '2px',
        borderRadius: '50%',
        background: i % 7 === 0 ? 'rgba(201,168,76,0.7)' : 'rgba(255,255,255,0.65)',
        transform: 'translate(-50%, -50%)',
        willChange: 'transform, opacity',
      })
      world.appendChild(el)
      items.push({
        el, type: 'star',
        x: (Math.random() - 0.5) * 2400,
        y: (Math.random() - 0.5) * 2400,
        baseZ: -Math.random() * 2800 - 200,
      })
    }

    // RAF
    let rafId: number
    let startTime: number | null = null
    let lastTime = 0
    let done = false

    function frame(time: number) {
      if (!startTime) startTime = time
      const elapsed  = time - startTime
      const progress = Math.min(elapsed / DURATION, 1)

      const delta = time - lastTime
      lastTime = time
      if (fpsRef.current && delta > 0)
        fpsRef.current.textContent = String(Math.round(1000 / delta))

      const cameraZ = (elapsed / 1000) * CAM_SPEED

      if (coordRef.current)
        coordRef.current.textContent = cameraZ.toFixed(0).padStart(7, '0')
      if (progRef.current)
        progRef.current.textContent = `${Math.round(progress * 100)}%`

      if (world) {
        world.style.transform =
          `rotateX(${mouse.y * 3.5}deg) rotateY(${mouse.x * 3.5}deg)`
      }

      items.forEach(item => {
        const relZ = item.baseZ + cameraZ
        let alpha = 1
        if (relZ < -3000)      alpha = 0
        else if (relZ < -2200) alpha = (relZ + 3000) / 800
        if (relZ > 80 && item.type !== 'star') alpha = Math.max(0, 1 - (relZ - 80) / 280)
        if (relZ > 220)        alpha = 0

        const a = Math.max(0, Math.min(1, alpha))
        item.el.style.opacity = String(a)
        if (a > 0) {
          item.el.style.transform = `translate3d(${item.x}px, ${item.y}px, ${relZ}px)`
        }
      })

      if (overlay && progress > 0.82)
        overlay.style.opacity = String(Math.max(0, 1 - (progress - 0.82) / 0.18))

      if (progress >= 1 && !done) {
        done = true
        setTimeout(onComplete, 350)
        return
      }
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
  }, [onComplete])

  return (
    <div ref={overlayRef} className={styles.overlay} onClick={onComplete}>
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
          <span>SYS.<span className={styles.hudAccent}>INIT</span></span>
          <div className={styles.hudLine} />
          <span>FPS <span className={styles.hudAccent} ref={fpsRef}>60</span></span>
        </div>
        <div className={styles.hudRow}>
          <span>Z.COORD <span className={styles.hudAccent} ref={coordRef}>0000000</span></span>
          <div className={styles.hudLine} />
          <span>PROG <span className={styles.hudAccent} ref={progRef}>0%</span></span>
        </div>
      </div>

      <span className={styles.skip}>Klicken zum Überspringen</span>
    </div>
  )
}
