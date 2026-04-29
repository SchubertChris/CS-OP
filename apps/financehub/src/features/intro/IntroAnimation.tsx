import { useEffect, useRef, useCallback } from 'react'
import styles from './IntroAnimation.module.scss'
import csLogo from '../../assets/CandleScope.webp'

interface Props {
  onComplete: () => void
  isLight: boolean
}

// ── Tunnel Config ─────────────────────────────────────────────────────────────
const CAM_SPEED  = 1100
const Z_GAP      = 520
const ITEM_SLOTS = 10
const LOOP_SIZE  = ITEM_SLOTS * Z_GAP  // 5200
const NEAR_CLIP  = 580
const STAR_COUNT = 180

type SlotDef =
  | { type: 'text'; label: string; x: number; rotZ: number }
  | { type: 'card'; cardIdx: number }
  | { type: 'icon'; symbol: string }
  | { type: 'logo' }

// Wörter wechseln links/rechts — x ist Mittelpunkt-Offset vom Bildschirm-Zentrum
const SLOT_DEFS: SlotDef[] = [
  { type: 'text', label: 'CANDLESCOPE', x: -280, rotZ:  4 },
  { type: 'card', cardIdx: 0 },
  { type: 'text', label: 'FINANZHUB',   x:  280, rotZ: -4 },
  { type: 'card', cardIdx: 1 },
  { type: 'text', label: 'PORTFOLIO',   x: -280, rotZ:  4 },
  { type: 'card', cardIdx: 2 },
  { type: 'text', label: 'RENDITE',     x:  280, rotZ: -4 },
  { type: 'card', cardIdx: 0 },
  { type: 'icon', symbol: '₿' },
  { type: 'logo' },
]

// accent: null → verwendet theme-gold; '#22C55E' → fest (Gewinn-Grün)
const CARD_CONFIGS = [
  { label: 'NETTOVERMÖGEN', value: '€ 24.890', sub: '+12.4% · YTD',        accent: '#22C55E', x: -300, y:  80 },
  { label: 'CASHFLOW',      value: '€ 1.240',  sub: 'pro Monat',            accent: null,      x:  280, y: -100 },
  { label: 'SPARQUOTE',     value: '34 %',      sub: '↑ +3% ggü. Vormonat', accent: null,      x: -220, y: -150 },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function css(el: HTMLElement, props: Partial<CSSStyleDeclaration>) {
  Object.assign(el.style, props)
}

function getCSSVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function makeTextEl(label: string, gold: string, isLight: boolean): HTMLElement {
  const el = document.createElement('div')
  el.textContent = label
  css(el, {
    position: 'absolute', left: '0', top: '0',
    fontSize: 'clamp(100px, 16vw, 240px)',
    fontWeight: isLight ? '900' : '800',
    fontFamily: isLight
      ? "'Impact', 'Arial Black', 'Franklin Gothic Heavy', sans-serif"
      : "'Geist', 'Space Grotesk', sans-serif",
    color: isLight ? 'rgba(12, 9, 4, 0.65)' : 'transparent',
    webkitTextStroke: isLight ? 'none' : `2px ${gold}28`,
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    letterSpacing: isLight ? '0.04em' : '-0.05em',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    opacity: '0',
    willChange: 'transform, opacity',
    textShadow: isLight ? 'none' : `0 0 80px ${gold}18`,
  })
  return el
}

function makeLogoEl(gold: string, isLight: boolean): HTMLElement {
  const wrap = document.createElement('div')
  css(wrap, {
    position: 'absolute', left: '0', top: '0',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    opacity: '0',
    willChange: 'transform, opacity',
    filter: isLight
      ? `drop-shadow(0 4px 20px ${gold}60)`
      : `drop-shadow(0 0 40px ${gold}80) drop-shadow(0 0 80px ${gold}40)`,
  })
  const ns  = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(ns, 'svg')
  svg.setAttribute('width', '260')
  svg.setAttribute('height', '249')
  svg.setAttribute('viewBox', '0 0 48 46')
  svg.setAttribute('fill', 'none')
  const path = document.createElementNS(ns, 'path')
  path.setAttribute('d', 'M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z')
  path.setAttribute('fill', gold)
  svg.appendChild(path)
  wrap.appendChild(svg)
  return wrap
}

function makeIconEl(symbol: string, gold: string): HTMLElement {
  const el = document.createElement('div')
  el.textContent = symbol
  css(el, {
    position: 'absolute', left: '0', top: '0',
    fontSize: 'clamp(140px, 22vw, 320px)',
    fontWeight: '800',
    fontFamily: "'Geist', sans-serif",
    color: gold,
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    opacity: '0',
    willChange: 'transform, opacity',
    textShadow: `0 0 60px ${gold}60, 0 0 120px ${gold}30`,
  })
  return el
}

function makeCardEl(idx: number, gold: string, surfaceBg: string, textColor: string, isLight: boolean): HTMLElement {
  const cfg = CARD_CONFIGS[idx]
  const wrap = document.createElement('div')
  css(wrap, {
    position: 'absolute', left: '0', top: '0',
    width: '300px',
    padding: '24px 26px',
    background: surfaceBg,
    border: `1px solid ${gold}${isLight ? '50' : '2A'}`,
    borderRadius: '10px',
    backdropFilter: 'blur(14px)',
    transform: 'translate(-50%, -50%)',
    boxShadow: isLight
      ? `0 12px 40px rgba(0,0,0,0.12), 0 0 0 1px ${gold}30`
      : `0 24px 70px rgba(0,0,0,0.45), 0 0 0 1px ${gold}12`,
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
    fontSize: '11px', color: cfg.accent ?? gold, marginTop: '10px',
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
  type: 'text' | 'card' | 'star' | 'icon' | 'logo'
  x: number
  y: number
  rotZ: number
  baseZ: number
  idx: number
}

// ── Component ─────────────────────────────────────────────────────────────────

export function IntroAnimation({ onComplete, isLight }: Props) {
  const overlayRef  = useRef<HTMLDivElement>(null)
  const worldRef    = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const cinemaRef   = useRef<HTMLDivElement>(null)
  const doneRef     = useRef(false)

  const fadeOut = useCallback((duration: number, withCinema = false) => {
    if (doneRef.current) return
    doneRef.current = true
    const overlay = overlayRef.current
    if (!overlay) return

    if (withCinema) {
      // 1. Tunnel fade out
      const vp = viewportRef.current
      if (vp) { vp.style.transition = 'opacity 0.9s ease'; vp.style.opacity = '0' }

      // 2. Cinema-Logo + Buchstaben einblenden
      setTimeout(() => {
        const cinema = cinemaRef.current
        if (cinema) {
          cinema.style.transition = 'opacity 1s ease'
          cinema.style.opacity = '1'
          // Buchstaben einzeln von unten einfaden
          cinema.querySelectorAll<HTMLElement>('[data-letter]').forEach((el, i) => {
            setTimeout(() => {
              el.style.opacity = '1'
              el.style.transform = 'translateY(0)'
            }, 320 + i * 70)
          })
        }
      }, 600)

      // 3. Alles fade out
      setTimeout(() => {
        overlay.style.transition = 'opacity 1.2s ease'
        overlay.style.opacity = '0'
        setTimeout(onComplete, 1220)
      }, 2200)
    } else {
      overlay.style.transition = `opacity ${duration}ms ease`
      overlay.style.opacity = '0'
      setTimeout(onComplete, duration + 20)
    }
  }, [onComplete])

  const handleSkip = useCallback(() => fadeOut(400), [fadeOut])

  useEffect(() => {
    const overlay  = overlayRef.current
    const world = worldRef.current!
    if (!overlay || !worldRef.current || !viewportRef.current) return

    const gold      = getCSSVar('--cs-gold') || '#C9A84C'
    const textColor = getCSSVar('--cs-text') || '#F0ECE8'
    const surfaceBg = isLight ? 'rgba(255,255,255,0.65)' : 'rgba(12,12,12,0.60)'

    const items: Item[] = []
    const mouse = { x: 0, y: 0 }

    const onMouse = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouse)

    // ── Build items ──────────────────────────────────────────────────────────

    SLOT_DEFS.forEach((def, i) => {
      // Leichter Z-Jitter: Elemente kommen dynamisch unregelmäßig
      const jitter = (Math.random() - 0.5) * Z_GAP * 0.18
      const baseZ  = -i * Z_GAP + jitter

      if (def.type === 'text') {
        const el = makeTextEl(def.label, gold, isLight)
        world.appendChild(el)
        items.push({ el, type: 'text', x: def.x, y: 0, rotZ: def.rotZ, baseZ, idx: i })
      } else if (def.type === 'card') {
        const cfg = CARD_CONFIGS[def.cardIdx]
        const el  = makeCardEl(def.cardIdx, gold, surfaceBg, textColor, isLight)
        world.appendChild(el)
        items.push({ el, type: 'card', x: cfg.x, y: cfg.y, rotZ: 0, baseZ, idx: i })
      } else if (def.type === 'icon') {
        const el = makeIconEl(def.symbol, gold)
        world.appendChild(el)
        items.push({ el, type: 'icon', x: 0, y: 0, rotZ: 0, baseZ, idx: i })
      } else {
        const el = makeLogoEl(gold, isLight)
        world.appendChild(el)
        items.push({ el, type: 'logo', x: 0, y: 0, rotZ: 0, baseZ, idx: i })
      }
    })

    // Stars
    for (let i = 0; i < STAR_COUNT; i++) {
      const el = document.createElement('div')
      css(el, {
        position: 'absolute', left: '0', top: '0',
        width: '2px', height: '2px',
        borderRadius: '50%',
        background: i % 6 === 0 ? `${gold}CC` : isLight ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.55)',
        transform: 'translate(-50%, -50%)',
        willChange: 'transform, opacity',
      })
      world.appendChild(el)
      items.push({
        el, type: 'star', idx: i,
        x: (Math.random() - 0.5) * 3000,
        y: (Math.random() - 0.5) * 3000,
        rotZ: 0,
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

      // Camera tilt from mouse
      world.style.transform =
        `rotateX(${mouse.y * 5}deg) rotateY(${mouse.x * 5}deg)`

      items.forEach(item => {
        const relZ = item.baseZ + cameraZ

        // ── Infinite modulo wrap ──
        let vizZ = ((relZ % LOOP_SIZE) + LOOP_SIZE) % LOOP_SIZE
        if (vizZ > NEAR_CLIP) vizZ -= LOOP_SIZE
        // vizZ is now in (-LOOP_SIZE + NEAR_CLIP, NEAR_CLIP]

        // ── Opacity — Hintere Elemente bleiben schwach, volle Sichtbarkeit erst nah ──
        const FAR      = -3000  // ab hier taucht ein Element auf
        const DIM_END  = -1400  // Fernbereich endet (max 30% alpha)
        const PEAK     = -400   // ab hier volle Opazität
        const FADE_OUT = 150    // Fade-out beginnt beim Näherkommen

        let alpha = 0
        if (item.type === 'star') {
          if (vizZ >= -2000 && vizZ < FADE_OUT)        alpha = 0.5
          else if (vizZ >= FADE_OUT && vizZ < NEAR_CLIP - 80) alpha = 0
        } else if (vizZ >= FAR && vizZ < DIM_END) {
          alpha = ((vizZ - FAR) / (DIM_END - FAR)) * 0.30
        } else if (vizZ >= DIM_END && vizZ < PEAK) {
          alpha = 0.30 + ((vizZ - DIM_END) / (PEAK - DIM_END)) * 0.70
        } else if (vizZ >= PEAK && vizZ < FADE_OUT) {
          alpha = 1
        } else if (vizZ >= FADE_OUT) {
          alpha = Math.max(0, 1 - (vizZ - FADE_OUT) / (NEAR_CLIP - FADE_OUT))
        }

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
              `translate3d(${item.x}px, ${item.y}px, ${vizZ}px) translate(-50%, -50%) scale(${scale}) rotateZ(${item.rotZ}deg)`
          } else if (item.type === 'icon') {
            const t      = time * 0.001
            const scale  = 1 + Math.sin(t * 1.2 + item.idx * 0.8) * 0.06
            const floatY = Math.sin(t * 0.5 + item.idx) * 18
            item.el.style.transform =
              `translate3d(${item.x}px, ${floatY}px, ${vizZ}px) translate(-50%, -50%) scale(${scale})`
          } else if (item.type === 'logo') {
            const t      = time * 0.001
            const scale  = 1 + Math.sin(t * 0.8 + item.idx * 0.6) * 0.05
            const floatY = Math.sin(t * 0.4 + item.idx) * 14
            const rotZ   = Math.sin(t * 0.3 + item.idx * 0.5) * 4
            item.el.style.transform =
              `translate3d(0px, ${floatY}px, ${vizZ}px) translate(-50%, -50%) scale(${scale}) rotateZ(${rotZ}deg)`
          } else {
            item.el.style.transform =
              `translate3d(${item.x}px, ${item.y}px, ${vizZ}px)`
          }
        }
      })

      rafId = requestAnimationFrame(frame)
    }

    rafId = requestAnimationFrame(frame)

    // Nach 6 Sekunden: Cinema-Sequenz
    const autoTimer = setTimeout(() => fadeOut(0, true), 6000)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(autoTimer)
      window.removeEventListener('mousemove', onMouse)
      items.forEach(item => {
        if (world.contains(item.el)) world.removeChild(item.el)
      })
    }
  }, [fadeOut, isLight])

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

      <div ref={cinemaRef} className={styles.cinemaReveal}>
        <img src={csLogo} className={styles.cinemaLogo} alt="" aria-hidden />
        <div className={styles.cinemaLetters}>
          {'CANDLE'.split('').map((l, i) => (
            <span key={i} data-letter="1" className={styles.cinemaLetter}>{l}</span>
          ))}
          {'SCOPE'.split('').map((l, i) => (
            <span key={i + 6} data-letter="1" className={`${styles.cinemaLetter} ${styles.cinemaAccent}`}>{l}</span>
          ))}
        </div>
      </div>

      <span className={styles.skip}>Klicken zum Überspringen</span>
    </div>
  )
}
