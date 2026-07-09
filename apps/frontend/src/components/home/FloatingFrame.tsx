/* ============================================================
   CandleScope — Floating Frame (Flat & Optimized)
   src/components/home/FloatingFrame.tsx

   Screenshot in einem Browser-/Device-Frame, das je nach
   Scroll-Fortschritt vertikal SCHWEBT (Parallax).
   Bild: grayscale → Farbe sobald es in Sicht ist.
   KLICK → Lightbox mittig im Bildschirm; Klick weg / Esc →
   wieder normal.
   Kein 3D-Tilt oder 3D-Faltung mehr, um CPU/GPU-Performance zu
   schonen und unzuverlässiges Custom-Cursor-Glitching zu vermeiden.
   ============================================================ */

import { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  motion, AnimatePresence, useScroll, useTransform, useSpring, useReducedMotion, useInView,
} from 'framer-motion'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

interface Props {
  src?: string | null
  label: string
  chrome?: string
  glow?: string
  placeholder?: boolean
  ratio?: string
  from?: 'left' | 'right' | 'none'
  /** 'case' = invertierender Blend-Cursor (Standard). 'case-solid' = stabile
   *  Variante ohne mix-blend (für Bereiche mit Transform-Compositing wie das Karussell). */
  cursorMode?: 'case' | 'case-solid'
}

export default function FloatingFrame({ src, label, chrome = 'App', glow = '30% 30%', placeholder = false, ratio = '16/10', from = 'none', cursorMode = 'case' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const [open, setOpen] = useState(false)
  
  // Farbe sobald der Frame in Sicht ist (reversibel)
  const inView = useInView(ref, { margin: '-12% 0px -12% 0px' })

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const yRaw = useTransform(scrollYProgress, [0, 1], [44, -44])
  const y = useSpring(yRaw, { stiffness: 55, damping: 20 })

  // Eintritt vom Seitenrand
  const offX = from === 'right' ? '34%' : from === 'left' ? '-34%' : '0%'
  const enterX = useTransform(scrollYProgress, [0.14, 0.52], [offX, '0%'])
  const enterOpacity = useTransform(scrollYProgress, [0.14, 0.4], [0, 1])

  const showImage = !!src && !placeholder

  // Esc schließt die Lightbox
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <motion.div
      ref={ref}
      style={{
        x: reduced || from === 'none' ? 0 : enterX,
        y: reduced ? 0 : y,
        opacity: reduced || from === 'none' ? 1 : enterOpacity,
      }}
      className="relative"
    >
      <motion.div
        data-cursor={showImage ? cursorMode : undefined}
        onClick={() => showImage && setOpen(true)}
        style={{ aspectRatio: ratio }}
        className="group relative select-none rounded-lg overflow-hidden
                   border border-[#C9A84C]/22 bg-[var(--cs-s1)]
                   shadow-2xl shadow-black/50
                   transition-[box-shadow,border-color] duration-500
                   hover:border-[#C9A84C]/45 hover:shadow-[0_0_60px_rgba(201,168,76,0.12)]"
      >
        {/* Gold-Glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(circle at ${glow}, rgba(201,168,76,0.14), transparent 58%)` }}
        />

        {/* Hit-Ebene für den Custom-Cursor */}
        {showImage && (
          <div
            className="absolute inset-0 z-30 cursor-pointer"
            data-cursor={cursorMode}
            aria-hidden="true"
          />
        )}

        {/* Browser-Chrome */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-1.5 px-3.5 py-2.5 border-b border-[var(--cs-border-w)] bg-[var(--cs-s1)]/70 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-[var(--cs-text-3)]" />
          <span className="w-2 h-2 rounded-full bg-[var(--cs-text-4)]" />
          <span className="w-2 h-2 rounded-full bg-[#C9A84C]/45" />
          <span className="ml-2 font-mono text-[10px] font-medium tracking-[0.16em] uppercase text-[var(--cs-text-2)]">{chrome}</span>
        </div>

        {showImage ? (
          <>
            <img
              src={src!}
              alt={`${label} — ${chrome}`}
              loading="lazy"
              draggable={false}
              className={`absolute inset-0 w-full h-full object-cover object-top select-none contrast-[1.03] transition-[filter] duration-500 ${inView ? 'grayscale-0' : 'grayscale'}`}
            />
            {/* Vignette — dunkler Rand */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(125% 125% at 50% 42%, transparent 46%, rgba(8,8,8,0.55) 100%)' }}
            />
          </>
        ) : (
          /* Platzhalter */
          <div className="absolute inset-0 flex items-end justify-between p-5 pt-12
                          bg-[repeating-linear-gradient(180deg,var(--cs-border-w)_0_1px,transparent_1px_26px)]">
            <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-[#C9A84C]">{label}</span>
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--cs-text-3)]">{chrome}</span>
          </div>
        )}

        {/* Label-Leiste unten */}
        {showImage && (
          <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between px-4 pt-8 pb-3
                            bg-gradient-to-t from-[#080808]/92 via-[#080808]/55 to-transparent pointer-events-none">
            <span className="font-mono text-[11px] font-medium tracking-[0.16em] uppercase text-[#E8C56D]">{label}</span>
            <span className="font-mono text-[11px] font-medium tracking-[0.14em] uppercase text-[#C8C3BB]">{chrome}</span>
          </div>
        )}
      </motion.div>

      {/* Lightbox — Klick öffnet mittig */}
      {showImage && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              className="cs-lightbox"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.26, ease: EASE }}
            >
              <motion.figure
                className="cs-lightbox-frame"
                initial={{ opacity: 0, scale: 0.92, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 10 }}
                transition={{ duration: 0.34, ease: EASE }}
              >
                <img src={src!} alt={label} draggable={false} className="select-none" />
                <figcaption className="cs-lightbox-cap">
                  <span>{label}</span>
                  <span>{chrome}</span>
                </figcaption>
              </motion.figure>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </motion.div>
  )
}
