/* ============================================================
   CandleScope — Home Motion Primitives
   src/components/home/primitives.tsx

   Kleine, scharf abgegrenzte Bausteine für die Landingpage.
   Alle respektieren prefers-reduced-motion.
   Signature-Easing: cubic-bezier(0.16, 1, 0.3, 1)
   ============================================================ */

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  motion, AnimatePresence, useInView, useReducedMotion,
} from 'framer-motion'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

/* ─── Reveal — Element gleitet beim Sichtbarwerden ein ─────── */
export function Reveal({
  children, delay = 0, y = 22, className,
}: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduced = useReducedMotion()
  return (
    <motion.div
      ref={ref}
      initial={reduced ? false : { opacity: 0, y }}
      animate={reduced || inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── Stagger — Kinder kommen versetzt rein ───────────────── */
export function Stagger({
  children, className, gap = 0.09,
}: { children: ReactNode; className?: string; gap?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={{ show: { transition: { staggerChildren: gap } } }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* StaggerItem — KEIN Blur (geteilte Items dürfen nicht blurren) */
export function StaggerItem({
  children, className, y = 26,
}: { children: ReactNode; className?: string; y?: number }) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      variants={{
        hidden: reduced ? { opacity: 1 } : { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── CountUp — zählt von 0 auf Zielwert sobald sichtbar ───── */
export function CountUp({
  to, suffix = '', duration = 1.6, className,
}: { to: number; suffix?: string; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const reduced = useReducedMotion()
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (reduced) { setVal(to); return }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / (duration * 1000))
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(eased * to))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration, reduced])

  return <span ref={ref} className={className}>{val}{suffix}</span>
}

/* ─── DisciplineTicker — rotierendes Disziplin-Wort ───────── */
const DISCIPLINES = ['Security', 'Automation', 'Datenanalyse', 'Agentensysteme']

export function DisciplineTicker({ className }: { className?: string }) {
  const reduced = useReducedMotion()
  const [i, setI] = useState(0)

  useEffect(() => {
    if (reduced) return
    const t = setInterval(() => setI(p => (p + 1) % DISCIPLINES.length), 2200)
    return () => clearInterval(t)
  }, [reduced])

  if (reduced) {
    return <span className={className}>{DISCIPLINES[0]}</span>
  }

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', overflow: 'hidden', verticalAlign: 'bottom', lineHeight: 1.4 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={i}
          initial={{ y: '110%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-110%', opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className={className}
          style={{ display: 'inline-block', whiteSpace: 'nowrap' }}
        >
          {DISCIPLINES[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

/* ─── FilmGrain — feine Film-Körnung (CSS in styles/index.css) */
export function FilmGrain() {
  return <div className="cs-grain" aria-hidden="true" />
}
