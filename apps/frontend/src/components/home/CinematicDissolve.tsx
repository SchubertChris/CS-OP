/* ============================================================
   CandleScope — Cinematic Scroll Dissolve Component
   src/components/home/CinematicDissolve.tsx
   ============================================================ */

import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'

export default function CinematicDissolve({ imageSrc }: { imageSrc: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  // Stay 100vw throughout, zoom scale slightly, fade out / dissolve on scroll progress
  const scale = useTransform(scrollYProgress, [0.22, 0.58], [1.05, 0.9])
  
  // Fade out / dissolve opacity
  const opacity = useTransform(scrollYProgress, [0.45, 0.68], [1, 0])
  
  // Dynamic blur dissolve
  const blurValue = useTransform(scrollYProgress, [0.4, 0.68], [0, 24])
  const filter = useTransform(blurValue, (b) => `blur(${b}px)`)

  // Subtle Y translation offset
  const y = useTransform(scrollYProgress, [0.22, 0.68], [0, 80])

  // Dynamically scale top padding to clear header only when full screen
  const paddingTop = useTransform(scrollYProgress, [0.22, 0.58], ['80px', '0px'])

  if (reduced) return null

  return (
    <div ref={containerRef} className="relative h-[220vh] z-[16] pointer-events-none">
      <div className="sticky top-0 h-[100vh] w-screen flex items-center justify-center overflow-hidden">
        <motion.div
          style={{ width: '100vw', height: '100vh', scale, opacity, filter, y, paddingTop }}
          className="relative flex flex-col items-center justify-center gap-2 md:gap-5"
        >
          {/* Logo — komplett sichtbar (kein Beschnitt), transparenter Hintergrund */}
          <img
            src={imageSrc}
            alt="CandleScope Logo"
            className="max-w-[80vw] max-h-[56vh] object-contain"
            loading="lazy"
          />

          {/* Geschwungener Schriftzug unter dem Logo (SVG-Bogen, theme-aware Gold) */}
          <svg
            viewBox="0 0 600 130"
            className="w-[min(78vw,600px)] h-auto overflow-visible"
            role="img"
            aria-label="Think big — then double it."
          >
            <defs>
              <path id="cs-dissolve-arc" d="M25,110 Q300,18 575,110" fill="none" />
            </defs>
            <text
              textAnchor="middle"
              style={{
                fontFamily: '"Playfair Display", Georgia, "Times New Roman", serif',
                fontStyle: 'italic',
                fontWeight: 500,
                fontSize: '34px',
                letterSpacing: '0.02em',
                fill: 'var(--cs-fx-spark, #C9A84C)',
              }}
            >
              <textPath href="#cs-dissolve-arc" startOffset="50%">
                Think big — then double it.
              </textPath>
            </text>
          </svg>
        </motion.div>
      </div>
    </div>
  )
}
