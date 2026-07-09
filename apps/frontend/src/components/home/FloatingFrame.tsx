/* ============================================================
   CandleScope — Floating Frame
   src/components/home/FloatingFrame.tsx

   Screenshot in einem Browser-/Device-Frame, das je nach
   Scroll-Fortschritt vertikal SCHWEBT (Parallax) und bei Hover
   leicht in 3D kippt. Bild: grayscale → Farbe sobald es in Sicht
   ist. KLICK → Lightbox mittig im Bildschirm; Klick weg / Esc →
   wieder normal. reduced-motion → kein Schweben/Tilt.
   ============================================================ */

import { useRef, useState, useEffect } from 'react'
import type { MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import {
  motion, AnimatePresence, useScroll, useTransform, useSpring, useReducedMotion, useInView, useMotionValue,
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
  // 3D-Tilt über MotionValues → kein React-Re-Render bei Mausbewegung
  const tiltX = useMotionValue(0)
  const tiltY = useMotionValue(0)
  const rotX = useSpring(tiltX, { stiffness: 150, damping: 18 })
  const rotY = useSpring(tiltY, { stiffness: 150, damping: 18 })
  // Farbe sobald der Frame in Sicht ist (reversibel)
  const inView = useInView(ref, { margin: '-12% 0px -12% 0px' })

  // Glint motion values for holographic mouse-following shine
  const glintX = useMotionValue(50)
  const glintY = useMotionValue(50)
  const glintBg = useTransform(() => {
    return `radial-gradient(circle at ${glintX.get()}% ${glintY.get()}%, rgba(255,255,255,0.42) 0%, transparent 55%)`
  })

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const yRaw = useTransform(scrollYProgress, [0, 1], [44, -44])
  const y = useSpring(yRaw, { stiffness: 55, damping: 20 })

  // Laptop opening angle on scroll: start closed (tilted back) and fold open as it scrolls into view
  const openRaw = useTransform(scrollYProgress, [0.08, 0.42], [42, 0])
  const openSpring = useSpring(openRaw, { stiffness: 85, damping: 20 })

  // Combine scroll-based fold and mouse hover tilt
  const finalRotX = useTransform(() => {
    return rotX.get() - (reduced ? 0 : openSpring.get())
  })

  // Scroll-gebundener Eintritt vom Seitenrand — später + knapper, reversibel
  const offX = from === 'right' ? '34%' : from === 'left' ? '-34%' : '0%'
  const enterX = useTransform(scrollYProgress, [0.14, 0.52], [offX, '0%'])
  const enterOpacity = useTransform(scrollYProgress, [0.14, 0.4], [0, 1])

  const showImage = !!src && !placeholder

  const onMove = (e: MouseEvent) => {
    if (reduced || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    tiltX.set(-py * 6)
    tiltY.set(px * 6)

    const mx = ((e.clientX - r.left) / r.width) * 100
    const my = ((e.clientY - r.top) / r.height) * 100
    glintX.set(mx)
    glintY.set(my)
  }
  const onLeave = () => {
    tiltX.set(0)
    tiltY.set(0)
    glintX.set(50)
    glintY.set(50)
  }

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
        perspective: 1200,
        transformStyle: 'preserve-3d',
      }}
      className="relative"
    >
      <motion.div
        data-cursor={showImage ? cursorMode : undefined}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        onClick={() => showImage && setOpen(true)}
        style={{ rotateX: finalRotX, rotateY: rotY, transformStyle: 'preserve-3d', aspectRatio: ratio, transformOrigin: 'bottom center' }}
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

        {/* Hit-Ebene: legt den "Ansehen"-Cursor + Klick über das GANZE Bild.
            FLACH (kein translateZ) — deckt exakt die Bildfläche und projiziert
            beim 3D-Tilt nicht über den Rand in den Hintergrund (sonst greift der
            Cursor mal aufs Bild, mal daneben = das inkonsistente „Spacken"). */}
        {showImage && (
          <div
            className="absolute inset-0 z-30"
            data-cursor={cursorMode}
            aria-hidden="true"
          />
        )}

        {/* Glass Glint Shine Overlay */}
        {!reduced && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: glintBg,
              transform: 'translateZ(30px)',
            }}
          />
        )}

        {/* Browser-Chrome */}
        <div
          className="absolute top-0 left-0 right-0 z-10 flex items-center gap-1.5 px-3.5 py-2.5 border-b border-[var(--cs-border-w)] bg-[var(--cs-s1)]/70 backdrop-blur-sm"
          style={{ transform: reduced ? undefined : 'translateZ(26px)', transformStyle: 'preserve-3d' }}
        >
          <span className="w-2 h-2 rounded-full bg-[var(--cs-text-3)]" />
          <span className="w-2 h-2 rounded-full bg-[var(--cs-text-4)]" />
          <span className="w-2 h-2 rounded-full bg-[#C9A84C]/45" />
          <span className="ml-2 font-mono text-[10px] font-medium tracking-[0.16em] uppercase text-[var(--cs-text-2)]" style={{ transform: reduced ? undefined : 'translateZ(10px)' }}>{chrome}</span>
        </div>

        {showImage ? (
          <>
            <img
              src={src!}
              alt={`${label} — ${chrome}`}
              loading="lazy"
              draggable={false}
              className={`absolute inset-0 w-full h-full object-cover object-top select-none contrast-[1.03] transition-[filter] duration-500 ${inView ? 'grayscale-0' : 'grayscale'}`}
              style={{ transform: 'translateZ(0px)' }}
            />
            {/* Vignette — dunkler Rand, damit helle Bildkanten sich vom Frame absetzen */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(125% 125% at 50% 42%, transparent 46%, rgba(8,8,8,0.55) 100%)' }}
            />
            {/* Kein Ganzbild-Invert mehr: der invertierte Farbeffekt bleibt lokal
                auf den Cursor beschränkt (.cs-cursor-case, mix-blend-mode: difference). */}
          </>
        ) : (
          /* Platzhalter — bewusst leer, wirkt wie ein „Coming soon"-Frame */
          <div className="absolute inset-0 flex items-end justify-between p-5 pt-12
                          bg-[repeating-linear-gradient(180deg,var(--cs-border-w)_0_1px,transparent_1px_26px)]">
            <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-[#C9A84C]">{label}</span>
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--cs-text-3)]">{chrome}</span>
          </div>
        )}

        {/* Label-Leiste unten — nur über echten Bildern (Caption-Scrim) */}
        {showImage && (
          <div
            className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between px-4 pt-8 pb-3
                            bg-gradient-to-t from-[#080808]/92 via-[#080808]/55 to-transparent pointer-events-none"
            style={{ transform: reduced ? undefined : 'translateZ(22px)', transformStyle: 'preserve-3d' }}
          >
            <span className="font-mono text-[11px] font-medium tracking-[0.16em] uppercase text-[#E8C56D]" style={{ transform: reduced ? undefined : 'translateZ(12px)' }}>{label}</span>
            <span className="font-mono text-[11px] font-medium tracking-[0.14em] uppercase text-[#C8C3BB]" style={{ transform: reduced ? undefined : 'translateZ(12px)' }}>{chrome}</span>
          </div>
        )}
      </motion.div>

      {/* Keyboard Base (renders static under the rotating screen lid) */}
      {!reduced && showImage && (
        <div
          className="absolute w-[98%] h-[12px] rounded-b-md pointer-events-none"
          style={{
            bottom: '-6px',
            left: '50%',
            transformOrigin: 'top center',
            transform: 'translateX(-50%) rotateX(80deg) translateZ(-4px)',
            background: 'linear-gradient(180deg, #161616 0%, #0d0d0d 100%)',
            border: '1px solid rgba(201, 168, 76, 0.22)',
            boxShadow: '0 12px 28px rgba(0, 0, 0, 0.75)',
          }}
        />
      )}

      {/* Lightbox — Klick öffnet mittig, Klick weg / Esc schließt */}
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
