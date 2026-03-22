/* ============================================================
   CandleScope — 404 Not Found
   src/pages/NotFoundPage.tsx
   ============================================================ */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrendingDown, ArrowLeft, RotateCcw } from 'lucide-react'

const CANDLES = [
  { o: 40, c: 55, h: 58, l: 38, bull: true },
  { o: 55, c: 70, h: 73, l: 52, bull: true },
  { o: 70, c: 65, h: 75, l: 62, bull: false },
  { o: 65, c: 80, h: 84, l: 63, bull: true },
  { o: 80, c: 95, h: 98, l: 78, bull: true },
  { o: 95, c: 88, h: 100, l: 85, bull: false },
  { o: 88, c: 105, h: 108, l: 86, bull: true },
  { o: 105, c: 115, h: 118, l: 102, bull: true },
  { o: 115, c: 108, h: 120, l: 105, bull: false },
  { o: 108, c: 90, h: 112, l: 88, bull: false },
  { o: 90, c: 68, h: 92, l: 60, bull: false },
  { o: 68, c: 45, h: 70, l: 38, bull: false },
  { o: 45, c: 22, h: 48, l: 15, bull: false },
]

const W = 560
const H = 180
const PAD = { l: 20, r: 20, t: 20, b: 20 }
const chartH = H - PAD.t - PAD.b
const maxPrice = 130
const scale = chartH / maxPrice
const spacing = (W - PAD.l - PAD.r) / CANDLES.length
const candleW = spacing * 0.55

function GlitchText({ text, className }: { text: string; className?: string }) {
  const [glitch, setGlitch] = useState(false)
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true)
      setTimeout(() => setGlitch(false), 150)
    }, 2800 + Math.random() * 1200)
    return () => clearInterval(interval)
  }, [])
  return (
    <span className={`relative inline-block ${className}`}>
      {text}
      {glitch && (
        <>
          <span className="absolute inset-0 text-[#FF4444] translate-x-[2px]" aria-hidden>{text}</span>
          <span className="absolute inset-0 text-[#C9A84C] -translate-x-[2px] translate-y-[1px]" aria-hidden>{text}</span>
        </>
      )}
    </span>
  )
}

function FallingNumbers() {
  const numbers = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    value: (Math.random() > 0.5 ? '-' : '') + (Math.random() * 99 | 0) + '.' + (Math.random() * 99 | 0) + '%',
    x: 5 + Math.random() * 90,
    delay: Math.random() * 4,
    duration: 3 + Math.random() * 4,
    red: Math.random() > 0.3,
  }))
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {numbers.map(n => (
        <motion.div key={n.id}
          className={`absolute font-mono text-[10px] tracking-wider select-none ${n.red ? 'text-[#FF4444]/40' : 'text-[#C9A84C]/30'}`}
          style={{ left: `${n.x}%` }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: '110vh', opacity: [0, 0.8, 0.8, 0] }}
          transition={{ duration: n.duration, delay: n.delay, repeat: Infinity, repeatDelay: Math.random() * 3, ease: 'linear' }}>
          {n.value}
        </motion.div>
      ))}
    </div>
  )
}

function Scanlines() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 opacity-30"
      style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)' }} />
  )
}

export default function NotFoundPage() {
  const [phase, setPhase] = useState<'rising' | 'peak' | 'crash' | 'dead'>('rising')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('peak'), 1200)
    const t2 = setTimeout(() => setPhase('crash'), 2200)
    const t3 = setTimeout(() => setPhase('dead'), 3800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  const resetAnimation = () => {
    setPhase('rising')
    setTimeout(() => setPhase('peak'), 1200)
    setTimeout(() => setPhase('crash'), 2200)
    setTimeout(() => setPhase('dead'), 3800)
  }

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center relative overflow-hidden px-6">
      <Scanlines />
      <FallingNumbers />

      <motion.div className="absolute inset-0 pointer-events-none"
        animate={{
          background: phase === 'crash' || phase === 'dead'
            ? 'radial-gradient(ellipse at 50% 50%, rgba(255,68,68,0.06) 0%, transparent 70%)'
            : 'radial-gradient(ellipse at 50% 50%, rgba(201,168,76,0.03) 0%, transparent 70%)',
        }}
        transition={{ duration: 1 }} />

      {/* Terminal header */}
      <motion.div className="w-full max-w-2xl mb-6"
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0d0d0d] border border-[#C9A84C]/15 rounded-t-xl">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF4444]/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#C9A84C]/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#00C896]/30" />
          </div>
          <span className="font-mono text-[11px] text-[#5a5550] tracking-[0.14em]">CS-TERMINAL · MARKET DATA · ERROR</span>
          <motion.div className="flex items-center gap-1.5"
            animate={{ opacity: phase === 'dead' ? [1, 0.3, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 1 }}>
            <div className={`w-1.5 h-1.5 rounded-full ${phase === 'dead' ? 'bg-[#FF4444]' : 'bg-[#00C896]'}`} />
            <span className="font-mono text-[10px] text-[#5a5550]">{phase === 'dead' ? 'OFFLINE' : 'LIVE'}</span>
          </motion.div>
        </div>

        <div className="bg-[#060606] border-x border-[#C9A84C]/15 p-4 relative overflow-hidden">
          {[0.25, 0.5, 0.75].map(f => (
            <div key={f} className="absolute left-4 right-4 h-px bg-[#C9A84C]/6"
              style={{ top: `${PAD.t + f * chartH}px` }} />
          ))}
          {[100, 75, 50, 25].map((price) => (
            <span key={price} className="absolute right-5 font-mono text-[9px] text-[#3a3530]"
              style={{ top: `${PAD.t + (1 - price / maxPrice) * chartH - 6}px` }}>
              {price}
            </span>
          ))}

          <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
            <motion.path
              d={`M${PAD.l + spacing * 0.5},${H - PAD.b - 55 * scale}
                 L${PAD.l + spacing * 2.5},${H - PAD.b - 80 * scale}
                 L${PAD.l + spacing * 4.5},${H - PAD.b - 95 * scale}
                 L${PAD.l + spacing * 7.5},${H - PAD.b - 110 * scale}
                 L${PAD.l + spacing * 9.5},${H - PAD.b - 95 * scale}
                 L${PAD.l + spacing * 10.5},${H - PAD.b - 68 * scale}
                 L${PAD.l + spacing * 11.5},${H - PAD.b - 42 * scale}
                 L${PAD.l + spacing * 12.5},${H - PAD.b - 18 * scale}`}
              fill="none"
              stroke={phase === 'crash' || phase === 'dead' ? '#FF4444' : '#C9A84C'}
              strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4 3"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 3, delay: 0.5, ease: 'easeInOut' }} />

            {CANDLES.map((c, i) => {
              const x = PAD.l + i * spacing + spacing / 2
              const top = H - PAD.b - c.h * scale
              const bot = H - PAD.b - c.l * scale
              const bodyT = H - PAD.b - Math.max(c.o, c.c) * scale
              const bodyB = H - PAD.b - Math.min(c.o, c.c) * scale
              const bodyH = Math.max(bodyB - bodyT, 3)
              const isCrash = i >= 9
              const crashDelay = isCrash ? 2.2 + (i - 9) * 0.15 : 0
              return (
                <motion.g key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={phase !== 'rising' || i < 9
                    ? { opacity: 1, y: phase === 'dead' && isCrash ? [0, 0, 40] : 0, rotate: phase === 'dead' && isCrash ? [0, 0, (i % 2 === 0 ? 15 : -15)] : 0 }
                    : { opacity: 0, y: 20 }
                  }
                  transition={{
                    opacity: { delay: isCrash ? crashDelay : i * 0.08, duration: 0.3 },
                    y: isCrash && phase === 'dead' ? { delay: 2.8 + (i - 9) * 0.12, duration: 0.6, ease: 'easeIn' } : { delay: i * 0.08, duration: 0.3 },
                    rotate: isCrash && phase === 'dead' ? { delay: 2.8 + (i - 9) * 0.12, duration: 0.5 } : {},
                  }}
                  style={{ transformOrigin: `${x}px ${bodyT + bodyH / 2}px` }}>
                  <line x1={x} y1={top} x2={x} y2={bot} stroke={c.bull ? '#C9A84C' : '#FF4444'} strokeOpacity={c.bull ? 0.6 : 0.8} strokeWidth={isCrash ? 1.5 : 1} />
                  <rect x={x - candleW / 2} y={bodyT} width={candleW} height={bodyH}
                    fill={c.bull ? 'rgba(201,168,76,0.7)' : 'rgba(255,68,68,0.7)'}
                    stroke={c.bull ? '#C9A84C' : '#FF4444'} strokeWidth="0.5" rx="2" />
                </motion.g>
              )
            })}

            {(phase === 'crash' || phase === 'dead') && (
              <motion.g initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                style={{ transformOrigin: `${PAD.l + spacing * 11}px ${H - PAD.b - 40 * scale}px` }}>
                <motion.path
                  d={`M${PAD.l + spacing * 10},${H - PAD.b - 80 * scale} L${PAD.l + spacing * 11.5},${H - PAD.b - 30 * scale} L${PAD.l + spacing * 10.8},${H - PAD.b - 30 * scale} L${PAD.l + spacing * 11},${H - PAD.b - 10 * scale} L${PAD.l + spacing * 11.4},${H - PAD.b - 10 * scale} L${PAD.l + spacing * 11},${H - PAD.b - 30 * scale} L${PAD.l + spacing * 12},${H - PAD.b - 30 * scale}Z`}
                  fill="#FF4444" fillOpacity="0.25" stroke="#FF4444" strokeWidth="0.5" />
              </motion.g>
            )}
          </svg>

          {phase === 'crash' && (
            <motion.div className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <motion.span className="font-display text-5xl font-bold text-[#FF4444] tracking-[0.1em]"
                animate={{ scale: [1, 1.05, 0.98, 1], opacity: [1, 0.8, 1] }}
                transition={{ duration: 0.4, repeat: 2 }}>
                CRASH
              </motion.span>
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-4 px-4 py-2 bg-[#0a0a0a] border-x border-b border-[#C9A84C]/15 rounded-b-xl overflow-hidden">
          <motion.span className="font-mono text-[10px] text-[#FF4444] font-medium"
            animate={phase === 'dead' ? { opacity: [1, 0.4, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.8 }}>
            CS/USD ▼ -100.00%
          </motion.span>
          <span className="font-mono text-[10px] text-[#5a5550]">VOL: 0</span>
          <span className="font-mono text-[10px] text-[#5a5550]">MKT: CLOSED</span>
          <motion.span className="font-mono text-[10px] text-[#FF4444] ml-auto"
            animate={phase === 'dead' ? { opacity: [1, 0, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.5 }}>
            ■ PAGE_NOT_FOUND: 0x404
          </motion.span>
        </div>
      </motion.div>

      {/* 404 */}
      <motion.div className="relative mb-4 select-none"
        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}>
        <GlitchText text="404"
          className="font-display text-[8rem] md:text-[12rem] font-bold leading-none tracking-[-0.04em] text-[#F5F0E8]" />
        <motion.div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#FF4444]"
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ delay: 0.8, duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />
      </motion.div>

      {/* Error message */}
      <motion.div className="text-center mb-10 max-w-md"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <TrendingDown size={16} strokeWidth={1.5} className="text-[#FF4444]" />
          <span className="font-mono text-[12px] tracking-[0.16em] text-[#FF4444] uppercase">Market Position Not Found</span>
        </div>
        <p className="text-[#9A9590] text-base leading-relaxed">
          Diese Seite hat gecrasht wie ein Penny Stock im Bärenmarkt. Kein Stop-Loss konnte das verhindern.
        </p>
        <motion.p className="font-mono text-[11px] text-[#3a3530] mt-3 tracking-[0.08em]"
          animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2 }}>
          ERR_ROUTE_NOT_FOUND · HTTP 404 · CANDLESCOPE.DE
        </motion.p>
      </motion.div>

      {/* Actions */}
      <motion.div className="flex flex-col sm:flex-row items-center gap-4"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}>
        <Link to="/"
          className="relative overflow-hidden group flex items-center gap-2 text-[12px] tracking-[0.14em] uppercase border border-[#C9A84C]/40 text-[#C9A84C] px-7 py-3.5 rounded-full">
          <span className="relative z-10 group-hover:text-[#080808] transition-colors duration-300 flex items-center gap-2">
            <ArrowLeft size={14} strokeWidth={1.5} />
            Zurück zur Startseite
          </span>
          <span className="absolute inset-0 bg-[#C9A84C] rounded-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        </Link>
        <button onClick={resetAnimation}
          className="flex items-center gap-2 text-[12px] tracking-[0.14em] uppercase text-[#9A9590] hover:text-[#F5F0E8] transition-colors">
          <RotateCcw size={13} strokeWidth={1.5} />
          Crash nochmal ansehen
        </button>
      </motion.div>

      <motion.div className="absolute bottom-6 left-0 right-0 flex justify-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
        <motion.span className="font-mono text-[10px] text-[#2a2a2a] tracking-[0.14em]"
          animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 3 }}>
          {'>'} candlescope.de ~ portfolio-not-found_
          <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}
            className="inline-block ml-0.5 w-2 h-3 bg-[#C9A84C]/40 align-middle" />
        </motion.span>
      </motion.div>
    </div>
  )
}