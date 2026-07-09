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

          {/* Futuristic straight text claim under the logo */}
          <div className="font-mono text-[0.68rem] tracking-[0.4em] uppercase text-[var(--cs-text-3)] flex items-center gap-4 mt-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
            <span>Think big — then double it.</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
