/* ============================================================
   CandleScope — Cinematic Horizontal Scroll
   src/components/home/CinematicScroll.tsx
   ============================================================ */

import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { CaseStudy } from '../../data/cases'
import { useSiteImages } from '../../hooks/useSiteImages'
import FloatingFrame from './FloatingFrame'
import { Reveal } from './primitives'

interface Props {
  cases: CaseStudy[]
}

export default function CinematicScroll({ cases }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLargeScreen, setIsLargeScreen] = useState(false)
  const reduced = useReducedMotion()
  const { img } = useSiteImages()

  // Detect screen size on mount and resize
  useEffect(() => {
    const checkScreen = () => setIsLargeScreen(window.innerWidth >= 1024)
    checkScreen()
    window.addEventListener('resize', checkScreen, { passive: true })
    return () => window.removeEventListener('resize', checkScreen)
  }, [])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // Horizontal translation of the row: from 0% to -75% (for 4 items).
  // Delayed start (0.18) so the first card holds centred on entry, and the
  // slide finishes at 0.86 so the LAST card is held fully centred before unpin.
  const numItems = cases.length
  const translationPercentage = -((numItems - 1) / numItems) * 100
  const xRaw = useTransform(scrollYProgress, [0.32, 0.80], ['0%', `${translationPercentage}%`])
  const x = useSpring(xRaw, { stiffness: 95, damping: 23 })

  // Parallax offsets for background text in each slide (moves faster horizontally)
  const bgXRaw = useTransform(scrollYProgress, [0.32, 0.80], [0, -320])
  const bgX = useSpring(bgXRaw, { stiffness: 70, damping: 25 })

  // Render vertical layout on mobile or reduced-motion
  if (!isLargeScreen || reduced) {
    return (
      <div className="flex flex-col gap-16 px-6 md:px-12 py-12">
        {cases.map((c) => {
          const inDev = c.status === 'In Entwicklung'
          const src = c.imageKey ? img(c.imageKey) : null
          return (
            <div key={c.id} className="border-t border-[var(--cs-border-w)] pt-10 pb-8 flex flex-col gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-[0.78rem] tracking-[0.2em] text-[#C9A84C]">{c.index}</span>
                  {c.status && (
                    <span className={`px-2.5 py-1 rounded-full font-mono text-[0.6rem] tracking-[0.14em] uppercase border ${
                      inDev ? 'border-[#C9A84C]/40 text-[#C9A84C]' : 'border-[#00C896]/35 text-[#00C896]'
                    }`}>
                      {c.status}
                    </span>
                  )}
                </div>
                <h3 className="font-display font-semibold text-2xl text-[var(--cs-text)] mb-3">{c.name}</h3>
                <p className="text-[var(--cs-text-2)] leading-relaxed mb-4 max-w-[34ch]">{c.tagline}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {c.tech.map(t => (
                    <span key={t} className="px-3 py-1 rounded-full border border-[var(--cs-border-w)] font-mono text-[0.6rem] uppercase text-[var(--cs-text-2)]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <FloatingFrame src={src} placeholder={!c.imageKey} label={c.name} chrome={c.frameLabel} from="none" />
              
              <div className="flex flex-col gap-4 pt-4">
                {[
                  { k: 'Problem', v: c.problem },
                  { k: 'Lösung', v: c.solution },
                  { k: 'Ergebnis', v: c.result },
                ].map((row) => (
                  <div key={row.k} className="flex flex-col gap-1">
                    <span className="font-mono text-[0.65rem] tracking-[0.18em] uppercase text-[#C9A84C]">{row.k}</span>
                    <p className="text-[var(--cs-text-2)] text-sm leading-relaxed">{row.v}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    // Total vertical scroll range to control the horizontal sliding speed
    <div ref={containerRef} className="relative h-[560vh] z-10">
      {/* Sticky viewport container */}
      <div className="sticky top-0 h-[100vh] w-full overflow-hidden flex items-center">
        {/* Horizontal sliding track */}
        <motion.div
          style={{ x, width: `${numItems * 100}vw` }}
          className="flex h-full"
        >
          {cases.map((c, i) => {
            const inDev = c.status === 'In Entwicklung'
            const src = c.imageKey ? img(c.imageKey) : null
            
            return (
              <div
                key={c.id}
                className="w-[100vw] h-full flex-shrink-0 flex items-center justify-center px-12 md:px-20 lg:px-28 relative overflow-hidden"
              >
                {/* Immersive layered parallax background text */}
                <motion.div
                  style={{ x: bgX, y: '-50%' }}
                  className="absolute top-1/2 right-12 pointer-events-none select-none font-display font-semibold leading-none tracking-[-0.04em] text-[var(--cs-text)] opacity-[0.025] z-0"
                >
                  <span style={{ fontSize: 'clamp(8rem, 16vw, 22rem)' }}>
                    {c.discipline.toUpperCase()}
                  </span>
                </motion.div>

                {/* Main slide content grid */}
                <div className="w-full max-w-[1240px] grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-20 items-center z-10 relative">
                  
                  {/* Left content block */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="font-mono text-[0.85rem] font-bold tracking-[0.2em] text-[#C9A84C]">{c.index}</span>
                      {c.status && (
                        <span className={`px-2.5 py-1 rounded-full font-mono text-[0.62rem] tracking-[0.14em] uppercase border ${
                          inDev ? 'border-[#C9A84C]/45 text-[#C9A84C]' : 'border-[#00C896]/40 text-[#00C896]'
                        }`}>
                          {c.status}
                        </span>
                      )}
                    </div>

                    <Reveal>
                      <h3 className="font-display font-semibold tracking-[-0.03em] text-[var(--cs-text)] mb-4"
                          style={{ fontSize: 'clamp(2.2rem, 1.8rem + 1.8vw, 3.8rem)', lineHeight: 1.05 }}>
                        {c.name}
                      </h3>
                    </Reveal>

                    <p className="text-[var(--cs-text-2)] leading-relaxed mb-6 text-base lg:text-lg max-w-[38ch]">{c.tagline}</p>
                    
                    <div className="flex flex-wrap gap-2.5 mb-8">
                      {c.tech.map(t => (
                        <span key={t} className="px-3.5 py-2 rounded-full border border-[var(--cs-border-w2)] bg-[var(--cs-s0)]/40 font-mono text-[0.66rem] tracking-[0.1em] uppercase text-[var(--cs-text-2)]">
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Problem/Solution/Result columns */}
                    <div className="flex flex-col gap-4 border-l border-[#C9A84C]/25 pl-5 mb-8">
                      {[
                        { k: 'Problem', v: c.problem, color: 'text-[var(--cs-text-2)]' },
                        { k: 'Lösung', v: c.solution, color: 'text-[var(--cs-text-2)]' },
                        { k: 'Ergebnis', v: c.result, color: 'text-[var(--cs-text)] font-medium' },
                      ].map((row, idx) => (
                        <Reveal key={row.k} delay={idx * 0.05}>
                          <div className="flex flex-col">
                            <span className="font-mono text-[0.62rem] tracking-[0.2em] uppercase text-[#C9A84C] mb-0.5">{row.k}</span>
                            <p className={`text-xs lg:text-sm leading-relaxed max-w-[55ch] ${row.color}`}>{row.v}</p>
                          </div>
                        </Reveal>
                      ))}
                    </div>

                    {/* Detail link */}
                    <Link to={c.href}
                      className="group inline-flex items-center gap-2.5 font-mono text-[0.78rem] font-bold tracking-[0.16em] uppercase text-[#C9A84C] hover:text-[#E8C56D] transition-colors">
                      Case Study ansehen
                      <ArrowRight size={16} strokeWidth={1.8} className="group-hover:translate-x-1.5 transition-transform" />
                    </Link>
                  </div>

                  {/* Right 3D screenshot block */}
                  <div className="flex items-center justify-center">
                    <div className="w-full max-w-[540px]">
                      <FloatingFrame
                        src={src}
                        placeholder={!c.imageKey}
                        label={c.name}
                        chrome={c.frameLabel}
                        ratio="16/10"
                        from={i % 2 === 0 ? 'right' : 'left'}
                      />
                    </div>
                  </div>

                </div>
              </div>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}
