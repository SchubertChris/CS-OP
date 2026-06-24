// src/components/finance/ScreenshotSlider.tsx
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'

const SCREENSHOTS = [
  { label: 'Übersicht',      src: '/images/home-preview.webp'         },
  { label: 'Jahresanalyse',  src: '/images/finance-yearly.webp'       },
  { label: 'Transaktionen',  src: '/images/finance-transactions.webp' },
  { label: 'Sparziele',      src: '/images/finance-goals.webp'        },
  { label: 'Verträge',       src: '/images/finance-contract.webp'     },
  { label: 'Krypto / FIFO',  src: '/images/finance-krypto.webp'       },
  { label: 'Buchung',        src: '/images/finance-modals.webp'       },
  { label: 'Vision Board',   src: '/images/finance-visionboard.webp'  },
  { label: 'Druckvorschau',  src: '/images/finance-archive.webp'      },
  { label: 'Über die App',   src: '/images/finance-about.webp'        },
]

const AUTOPLAY_MS = 4500
const TOTAL       = SCREENSHOTS.length

function normalizeOffset(i: number, active: number) {
  let off = i - active
  if (off >  TOTAL / 2) off -= TOTAL
  if (off < -TOTAL / 2) off += TOTAL
  return off
}

export default function ScreenshotSlider() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const dragStart            = useRef<number>(0)

  const go = useCallback((i: number) => setActive((i + TOTAL) % TOTAL), [])

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => go(active + 1), AUTOPLAY_MS)
    return () => clearInterval(t)
  }, [active, paused, go])

  return (
    <section
      className="py-20 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Header */}
      <div className="text-center mb-10 px-8">
        <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-[#C9A84C] mb-3">VaultBox · App in Aktion</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--cs-text)]">Sieh dir die App an</h2>
      </div>

      {/* Tab-Navigation */}
      <div className="flex items-center justify-center gap-2 px-8 mb-10 flex-wrap">
        {SCREENSHOTS.map(({ label }, i) => (
          <button
            key={label}
            onClick={() => go(i)}
            className={`px-4 py-1.5 rounded-full text-xs tracking-[0.1em] uppercase transition-colors duration-200 cursor-pointer
              ${active === i
                ? 'bg-[#C9A84C]/15 border border-[#C9A84C]/35 text-[var(--cs-text)]'
                : 'border border-transparent text-[var(--cs-text-2)] hover:text-[var(--cs-text)]'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 3D Carousel — key=i so framer tracks real element positions */}
      <div
        className="relative overflow-hidden"
        style={{ height: 'clamp(280px, 36vw, 520px)' }}
        onPointerDown={e => { dragStart.current = e.clientX }}
        onPointerUp={e => {
          const d = e.clientX - dragStart.current
          if (Math.abs(d) > 40) d < 0 ? go(active + 1) : go(active - 1)
        }}
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none
                        bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(201,168,76,0.05)_0%,transparent_100%)]" />

        {SCREENSHOTS.map(({ src, label }, i) => {
          const off    = normalizeOffset(i, active)
          const abs    = Math.abs(off)
          const visible = abs <= 1

          return (
            <motion.div
              key={i}
              className="absolute inset-0 flex items-center justify-center"
              onClick={() => off !== 0 && go(i)}
              animate={{
                x:        `${off * 58}%`,
                rotateY:  off * -38,
                scale:    1 - abs * 0.14,
                opacity:  visible ? 1 - abs * 0.52 : 0,
                zIndex:   off === 0 ? 10 : 5,
              }}
              transition={
                visible
                  ? { type: 'spring', stiffness: 220, damping: 28, mass: 0.8 }
                  : { duration: 0 }
              }
              style={{
                perspective: '1100px',
                transformStyle: 'preserve-3d',
                cursor: off !== 0 ? 'pointer' : 'default',
                pointerEvents: abs > 1 ? 'none' : 'auto',
              }}
            >
              <div
                className="rounded-xl overflow-hidden border border-[#C9A84C]/15
                            shadow-[0_0_60px_rgba(201,168,76,0.08)]"
                style={{ width: 'clamp(300px, 52vw, 760px)' }}
              >
                <div className="bg-[var(--cs-s4)] px-4 py-2 flex items-center gap-2 border-b border-[#C9A84C]/8">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#eab308]/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]/70" />
                  <span className="text-[var(--cs-text-3)] text-[9px] ml-2 font-mono">
                    VaultBox — {label}
                  </span>
                </div>
                <img
                  src={src}
                  alt={`VaultBox ${label}`}
                  className="w-full object-cover block"
                  loading="lazy"
                  draggable={false}
                />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {SCREENSHOTS.map(({ label }, i) => (
          <button key={label} onClick={() => go(i)} aria-label={label} className="cursor-pointer">
            <span className={`block w-6 h-1.5 rounded-full origin-left transition-[transform,opacity] duration-300
              ${active === i
                ? 'scale-x-100 bg-[#C9A84C] opacity-100'
                : 'scale-x-[0.25] bg-[#C9A84C] opacity-25 hover:opacity-50'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Progress bar */}
      {!paused && (
        <div className="max-w-5xl mx-auto px-12 mt-4">
          <div className="h-px bg-[#C9A84C]/8 rounded-full overflow-hidden">
            <motion.div
              key={active}
              className="h-full bg-[#C9A84C]/35 origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: AUTOPLAY_MS / 1000, ease: 'linear' }}
            />
          </div>
        </div>
      )}
    </section>
  )
}
