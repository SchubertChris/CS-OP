/* ============================================================
   CandleScope — Intro Animation (minimal)
   src/components/ui/IntroAnimation.tsx

   Bewusst reduziert: nur Logo + Wortmarke darunter, kein
   Container/Box. Sanfter Glow, Blur-In-Wortmarke (Echo zum
   Hero), kurze Dauer, Klick zum Überspringen.
   ============================================================ */

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import csLogo from '../../assets/images/CandleScopeLogo.png'

const GOLD = '#C9A84C'
const DISPLAY_MS = 1800
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export default function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true)
  const doneRef = useRef(false)
  const reduced = useReducedMotion()

  const complete = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    setVisible(false)
    setTimeout(onComplete, 460)
  }, [onComplete])

  useEffect(() => {
    const orig = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const t = setTimeout(complete, DISPLAY_MS)
    return () => { clearTimeout(t); document.body.style.overflow = orig }
  }, [complete])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[300] flex flex-col items-center justify-center"
          style={{ background: 'var(--cs-bg)', cursor: 'pointer' }}
          onClick={complete}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
        >
          {/* Glow hinter dem Logo — kein Container, nur Licht */}
          <motion.div
            className="absolute pointer-events-none"
            style={{
              width: 460, height: 460, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(201,168,76,0.16), transparent 62%)',
            }}
            initial={reduced ? false : { opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: EASE }}
          />

          <motion.img
            src={csLogo}
            alt=""
            className="relative"
            style={{ width: 104, height: 104, objectFit: 'contain', filter: 'drop-shadow(0 0 28px rgba(201,168,76,0.35))' }}
            initial={reduced ? false : { opacity: 0, scale: 0.9, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          />

          {/* Wortmarke */}
          <motion.p
            className="relative mt-6 font-display font-semibold uppercase"
            style={{ fontSize: 'clamp(1.6rem,1rem+2vw,2.4rem)', letterSpacing: '0.2em', color: 'var(--cs-text)' }}
            initial={reduced ? false : { opacity: 0, y: 14, filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
          >
            Candle<span style={{ color: GOLD }}>Scope</span>
          </motion.p>

          {/* feine Gold-Linie, zeichnet sich */}
          <motion.span
            className="relative mt-5 block"
            style={{ height: 1, width: 180, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, transformOrigin: 'center' }}
            initial={reduced ? false : { scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
