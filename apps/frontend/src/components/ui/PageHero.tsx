import { useEffect, useLayoutEffect, useState } from 'react'
import { motion } from 'framer-motion'

/* ─── Mobile Check Hook ─────────────────────────────────── */
// matchMedia statt innerWidth — kein Forced Reflow
const mobileQuery = typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)') : null

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => mobileQuery?.matches ?? false)
  useLayoutEffect(() => {
    if (!mobileQuery) return
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mobileQuery.addEventListener('change', handler)
    return () => mobileQuery.removeEventListener('change', handler)
  }, [])
  return isMobile
}

/* ─── Types ─────────────────────────────────────────────── */
type HeroTheme = 'home' | 'finance' | 'dev' | 'about' | 'community' | 'contact' | 'default'

interface PageHeroProps {
  eyebrow: string
  titleLine1: string
  titleLine2: string
  titleAccent?: 'line1' | 'line2'
  description: string
  badge?: string
  theme?: HeroTheme
  children?: React.ReactNode
}

/* ─── Char animation ────────────────────────────────────── */
const CHAR_VARIANTS = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.025, duration: 0.55, ease: 'easeOut' as const },
  }),
}

function AnimatedTitle({ line1, line2, accent }: { line1: string; line2: string; accent: 'line1' | 'line2' }) {
  const chars1 = line1.split('')
  const chars2 = line2.split('')
  return (
    <h1 className="font-display leading-[1.05] tracking-[-0.01em] mb-8">
      <span className={`block text-5xl sm:text-6xl md:text-7xl xl:text-8xl ${accent === 'line1' ? 'text-[#C9A84C]' : 'text-[#F5F0E8]'}`}>
        {chars1.map((char, i) => (
          <motion.span key={i} custom={i} variants={CHAR_VARIANTS} initial="hidden" animate="visible"
            className="inline-block" style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}>
            {char}
          </motion.span>
        ))}
      </span>
      <span className={`block text-5xl sm:text-6xl md:text-7xl xl:text-8xl ${accent === 'line2' ? 'text-[#C9A84C]' : 'text-[#F5F0E8]'}`}>
        {chars2.map((char, i) => (
          <motion.span key={i} custom={chars1.length + i} variants={CHAR_VARIANTS} initial="hidden" animate="visible"
            className="inline-block" style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}>
            {char}
          </motion.span>
        ))}
      </span>
    </h1>
  )
}

/* ── Finance: ETF Trendline ─────────────────────────────── */
function FinanceBg() {
  const isMobile = useIsMobile()
  const path = "M0,130 L60,112 L120,118 L180,95 L240,102 L300,78 L360,85 L420,60 L480,67 L540,46 L600,52 L660,32 L720,10"
  const fill = path + " L720,140 L0,140 Z"

  return (
    <>
      <svg className="absolute top-16 left-0 pointer-events-none block md:hidden"
        width="100vw" height="260" viewBox="0 0 720 140" preserveAspectRatio="xMinYMin meet">
        <defs>
          <linearGradient id="mTrendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="mTrendLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#C9A84C" stopOpacity="0" />
            <stop offset="10%" stopColor="#C9A84C" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#C9A84C" stopOpacity="0.4" />
          </linearGradient>
          <mask id="mTrendMask">
            <motion.rect x="0" y="0" height="140" fill="white"
              initial={{ width: 0 }} animate={{ width: 720 }}
              transition={{ duration: 3, ease: [0.22, 1, 0.36, 1], delay: 0.4 }} />
          </mask>
        </defs>
        <path d={fill} fill="url(#mTrendFill)" mask="url(#mTrendMask)" />
        <path d={path} fill="none" stroke="url(#mTrendLine)" strokeWidth="2.5" mask="url(#mTrendMask)" />
        {[35, 70, 105].map((y, i) => (
          <motion.line key={y} x1="0" y1={y} x2="720" y2={y}
            stroke="#C9A84C" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="4 8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.8 + i * 0.1, duration: 0.6 }} />
        ))}
        <motion.circle cx="720" cy="5" r="3" fill="#C9A84C"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 3.3, duration: 0.3 }} />
        {/* Pulsierender Ring — NUR Desktop */}
        {!isMobile && (
          <motion.circle cx="720" cy="5" r="8" fill="none" stroke="#C9A84C" strokeOpacity="0.3"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 0.5, 0], scale: [0, 1.5, 2] }}
            transition={{ delay: 3.5, duration: 1.2, repeat: Infinity, repeatDelay: 2 }} />
        )}
      </svg>

      <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
        viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="trendLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#C9A84C" stopOpacity="0" />
            <stop offset="20%" stopColor="#C9A84C" stopOpacity="0.5" />
            <stop offset="80%" stopColor="#C9A84C" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#C9A84C" stopOpacity="0.1" />
          </linearGradient>
          <mask id="trendMask">
            <motion.rect x="0" y="0" height="400" fill="white"
              initial={{ width: 0 }} animate={{ width: 1200 }}
              transition={{ duration: 3.5, ease: [0.22, 1, 0.36, 1], delay: 0.4 }} />
          </mask>
        </defs>
        <path d="M0,320 L40,290 L80,310 L120,270 L160,285 L200,240 L240,255 L280,210 L320,225 L360,185 L400,195 L440,155 L480,170 L520,130 L560,145 L600,105 L640,120 L680,85 L720,95 L760,60 L800,70 L840,40 L880,55 L920,25 L960,35 L1000,15 L1040,28 L1080,10 L1120,20 L1160,5 L1200,12 L1200,400 L0,400 Z"
          fill="url(#trendFill)" mask="url(#trendMask)" />
        <path d="M0,320 L40,290 L80,310 L120,270 L160,285 L200,240 L240,255 L280,210 L320,225 L360,185 L400,195 L440,155 L480,170 L520,130 L560,145 L600,105 L640,120 L680,85 L720,95 L760,60 L800,70 L840,40 L880,55 L920,25 L960,35 L1000,15 L1040,28 L1080,10 L1120,20 L1160,5 L1200,12"
          fill="none" stroke="url(#trendLine)" strokeWidth="1.5" mask="url(#trendMask)" />
        {[80, 160, 240, 320].map((y, i) => (
          <motion.line key={y} x1="0" y1={y} x2="1200" y2={y}
            stroke="#C9A84C" strokeOpacity="0.04" strokeWidth="1" strokeDasharray="4 8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.8 + i * 0.1, duration: 0.6 }} />
        ))}
        <motion.circle cx="1200" cy="12" r="3" fill="#C9A84C"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 3.8, duration: 0.3 }} />
        <motion.circle cx="1200" cy="12" r="8" fill="none" stroke="#C9A84C" strokeOpacity="0.3"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.5, 0], scale: [0, 1.5, 2] }}
          transition={{ delay: 3.9, duration: 1.2, repeat: Infinity, repeatDelay: 2 }} />
        {[{ y: 80, l: '+12.4%' }, { y: 160, l: '+8.1%' }, { y: 240, l: '+3.2%' }].map(({ y, l }) => (
          <motion.text key={l} x="1190" y={y + 4} fill="#C9A84C" fillOpacity="0.18"
            fontSize="9" textAnchor="end" fontFamily="JetBrains Mono, monospace"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}>{l}</motion.text>
        ))}
      </svg>
    </>
  )
}

/* ── Dev: Terminal ──────────────────────────────────────── */
function DevBg() {
  const isMobile = useIsMobile()
  const lines = [
    { text: 'const scope = new CandleScope()', delay: 0.4, indent: 0 },
    { text: 'await scope.init({ theme: "dark" })', delay: 0.9, indent: 1 },
    { text: 'scope.on("market:open", (data) => {', delay: 1.4, indent: 0 },
    { text: 'return render(<Dashboard />, data)', delay: 1.9, indent: 2 },
    { text: '})', delay: 2.4, indent: 0 },
    { text: '// ✓ compiled in 84ms', delay: 2.9, indent: 0 },
  ]

  return (
    <>
      <div className="absolute top-16 left-4 right-16 pointer-events-none block md:hidden">
        <motion.div className="border border-[#C9A84C]/20 rounded-xl overflow-hidden bg-[#0a0a0a]/60 backdrop-blur-sm"
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}>
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[#C9A84C]/10">
            <div className="w-2 h-2 rounded-full bg-[#ff5f57]/50" />
            <div className="w-2 h-2 rounded-full bg-[#ffbd2e]/50" />
            <div className="w-2 h-2 rounded-full bg-[#28c840]/50" />
            <span className="ml-2 text-[9px] font-mono text-[#3a3530] tracking-wider">candlescope.ts</span>
          </div>
          <div className="px-3 py-3 flex flex-col gap-1.5">
            {lines.map((line, i) => (
              <motion.div key={i} className="flex items-start gap-2"
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: line.delay, duration: 0.4 }}>
                <span className="text-[#3a3530] text-[9px] font-mono w-3 shrink-0 text-right">{i + 1}</span>
                <span className={`text-[9px] font-mono leading-relaxed ${
                  line.text.startsWith('//') ? 'text-[#5a5550]' :
                  line.text.startsWith('const') || line.text.startsWith('await') ? 'text-[#C9A84C]/80' :
                  'text-[#F5F0E8]/60'}`}
                  style={{ paddingLeft: `${line.indent * 12}px` }}>
                  {line.text}
                  {/* Cursor — NUR Desktop */}
                  {i === lines.length - 1 && !isMobile && (
                    <motion.span className="inline-block w-1 h-3 bg-[#C9A84C] ml-0.5 align-middle"
                      animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1 }} />
                  )}
                  {/* Cursor Mobile — statisch */}
                  {i === lines.length - 1 && isMobile && (
                    <span className="inline-block w-1 h-3 bg-[#C9A84C] ml-0.5 align-middle opacity-70" />
                  )}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="absolute top-20 right-16 xl:right-24 w-[480px] pointer-events-none hidden md:block">
        <motion.div className="border border-[#C9A84C]/15 rounded-2xl overflow-hidden bg-[#0a0a0a]/50 backdrop-blur-md shadow-2xl shadow-black/60"
          initial={{ opacity: 0, y: -16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}>
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#C9A84C]/10">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]/50" />
            <span className="ml-3 text-[10px] font-mono text-[#3a3530] tracking-widest">candlescope.ts</span>
          </div>
          <div className="px-5 py-5 flex flex-col gap-2">
            {lines.map((line, i) => (
              <motion.div key={i} className="flex items-start gap-3"
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: line.delay, duration: 0.5 }}>
                <span className="text-[#2a2a2a] text-[11px] font-mono w-4 shrink-0 text-right">{i + 1}</span>
                <span className={`text-[11px] font-mono leading-relaxed ${
                  line.text.startsWith('//') ? 'text-[#5a5550]' :
                  line.text.startsWith('const') || line.text.startsWith('await') ? 'text-[#C9A84C]' :
                  'text-[#F5F0E8]/70'}`}
                  style={{ paddingLeft: `${line.indent * 16}px` }}>
                  {line.text}
                  {i === lines.length - 1 && (
                    <motion.span className="inline-block w-1.5 h-3.5 bg-[#C9A84C] ml-0.5 align-middle"
                      animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1 }} />
                  )}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  )
}

/* ── About: Network ─────────────────────────────────────── */
function AboutBg() {
  const isMobile = useIsMobile()
  const mNodes = [
    { cx: 18, cy: 15, r: 2.5, delay: 0.3 }, { cx: 42, cy: 25, r: 1.8, delay: 0.6 },
    { cx: 65, cy: 18, r: 2,   delay: 0.5 }, { cx: 28, cy: 40, r: 3,   delay: 0.9 },
    { cx: 55, cy: 38, r: 1.8, delay: 1.1 }, { cx: 78, cy: 32, r: 2,   delay: 0.8 },
    { cx: 45, cy: 58, r: 2,   delay: 0.7 }, { cx: 70, cy: 55, r: 1.5, delay: 1.3 },
  ]
  const mEdges = [
    { x1: 18, y1: 15, x2: 42, y2: 25, delay: 0.7 }, { x1: 42, y1: 25, x2: 65, y2: 18, delay: 0.8 },
    { x1: 42, y1: 25, x2: 28, y2: 40, delay: 0.9 }, { x1: 65, y1: 18, x2: 78, y2: 32, delay: 1.0 },
    { x1: 65, y1: 18, x2: 55, y2: 38, delay: 1.0 }, { x1: 28, y1: 40, x2: 45, y2: 58, delay: 1.1 },
    { x1: 55, y1: 38, x2: 45, y2: 58, delay: 1.2 }, { x1: 78, y1: 32, x2: 70, y2: 55, delay: 1.3 },
    { x1: 45, y1: 58, x2: 70, y2: 55, delay: 1.4 },
  ]
  const dNodes = [
    { cx: 72, cy: 18, r: 2,   delay: 0.3 }, { cx: 85, cy: 35, r: 1.5, delay: 0.6 },
    { cx: 65, cy: 42, r: 2.5, delay: 0.9 }, { cx: 90, cy: 55, r: 1.5, delay: 1.2 },
    { cx: 75, cy: 62, r: 2,   delay: 0.5 }, { cx: 60, cy: 70, r: 1.5, delay: 1.4 },
    { cx: 88, cy: 72, r: 2,   delay: 0.8 },
  ]
  const dEdges = [
    { x1: 72, y1: 18, x2: 85, y2: 35, delay: 0.7 }, { x1: 85, y1: 35, x2: 65, y2: 42, delay: 0.9 },
    { x1: 85, y1: 35, x2: 90, y2: 55, delay: 1.0 }, { x1: 65, y1: 42, x2: 75, y2: 62, delay: 1.1 },
    { x1: 90, y1: 55, x2: 75, y2: 62, delay: 1.2 }, { x1: 75, y1: 62, x2: 60, y2: 70, delay: 1.3 },
    { x1: 75, y1: 62, x2: 88, y2: 72, delay: 1.4 },
  ]

  return (
    <>
      <svg className="absolute top-16 left-0 pointer-events-none block md:hidden"
        width="100vw" height="360" viewBox="0 0 100 100" preserveAspectRatio="xMinYMin meet">
        {mEdges.map((e, i) => (
          <motion.line key={i} x1={`${e.x1}%`} y1={`${e.y1}%`} x2={`${e.x2}%`} y2={`${e.y2}%`}
            stroke="#C9A84C" strokeWidth="0.4"
            initial={{ strokeOpacity: 0 }} animate={{ strokeOpacity: 0.4 }}
            transition={{ delay: e.delay, duration: 0.8 }} />
        ))}
        {mNodes.map((n, i) => (
          <g key={i}>
            <motion.circle cx={`${n.cx}%`} cy={`${n.cy}%`} r={`${n.r}%`} fill="#C9A84C"
              initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 0.5, scale: 1 }}
              transition={{ delay: n.delay, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }} />
            {/* Pulse Ring — NUR Desktop */}
            {!isMobile && (
              <motion.circle cx={`${n.cx}%`} cy={`${n.cy}%`} r={`${n.r * 3}%`}
                fill="none" stroke="#C9A84C"
                initial={{ strokeOpacity: 0, scale: 0.5 }}
                animate={{ strokeOpacity: [0, 0.5, 0], scale: [0.8, 1.8, 2.2] }}
                transition={{ delay: n.delay + 0.5, duration: 2.5, repeat: Infinity, repeatDelay: 3 + i * 0.5 }} />
            )}
          </g>
        ))}
      </svg>

      <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
        viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {dEdges.map((e, i) => (
          <motion.line key={i} x1={`${e.x1}%`} y1={`${e.y1}%`} x2={`${e.x2}%`} y2={`${e.y2}%`}
            stroke="#C9A84C" strokeWidth="0.3"
            initial={{ strokeOpacity: 0 }} animate={{ strokeOpacity: 0.15 }}
            transition={{ delay: e.delay, duration: 0.8 }} />
        ))}
        {dNodes.map((n, i) => (
          <g key={i}>
            <motion.circle cx={`${n.cx}%`} cy={`${n.cy}%`} r={`${n.r}%`} fill="#C9A84C"
              initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 0.4, scale: 1 }}
              transition={{ delay: n.delay, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }} />
            <motion.circle cx={`${n.cx}%`} cy={`${n.cy}%`} r={`${n.r * 2.5}%`}
              fill="none" stroke="#C9A84C"
              initial={{ strokeOpacity: 0, scale: 0.5 }}
              animate={{ strokeOpacity: [0, 0.15, 0], scale: [0.8, 1.6, 2] }}
              transition={{ delay: n.delay + 0.5, duration: 2.5, repeat: Infinity, repeatDelay: 3 + i * 0.5 }} />
          </g>
        ))}
      </svg>
    </>
  )
}

/* ── Community: Signal waves ────────────────────────────── */
function CommunityBg() {
  const isMobile = useIsMobile()
  return (
    <>
      <svg className="absolute top-14 left-0 pointer-events-none block md:hidden"
        width="100vw" height="340" viewBox="0 0 100 100" preserveAspectRatio="xMinYMin meet">
        <motion.circle cx="50%" cy="38%" r="3%" fill="#C9A84C"
          initial={{ opacity: 0 }} animate={{ opacity: 0.7 }}
          transition={{ delay: 0.4, duration: 0.5 }} />
        {/* Ringe — NUR Desktop */}
        {!isMobile && [1, 2, 3, 4].map((ring, i) => (
          <motion.circle key={ring} cx="50%" cy="38%" r={`${ring * 14}%`}
            fill="none" stroke="#C9A84C" strokeWidth="0.4"
            initial={{ strokeOpacity: 0, scale: 0.2 }}
            animate={{ strokeOpacity: [0, 0.55, 0.25, 0], scale: [0.2, 1, 1.2, 1.4] }}
            transition={{ delay: 0.5 + i * 0.35, duration: 3.5, repeat: Infinity, repeatDelay: 1.5, ease: 'easeOut' }} />
        ))}
        {/* Mobile: statische Ringe */}
        {isMobile && [1, 2, 3].map((ring) => (
          <motion.circle key={ring} cx="50%" cy="38%" r={`${ring * 14}%`}
            fill="none" stroke="#C9A84C" strokeWidth="0.4" strokeOpacity={0.15 / ring}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + ring * 0.2, duration: 0.6 }} />
        ))}
      </svg>

      <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
        viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <motion.circle cx="75%" cy="45%" r="1%" fill="#C9A84C"
          initial={{ opacity: 0 }} animate={{ opacity: 0.6 }}
          transition={{ delay: 0.4, duration: 0.5 }} />
        {[1, 2, 3, 4, 5].map((ring, i) => (
          <motion.circle key={ring} cx="75%" cy="45%" r={`${ring * 8}%`}
            fill="none" stroke="#C9A84C" strokeWidth="0.3"
            initial={{ strokeOpacity: 0, scale: 0.2 }}
            animate={{ strokeOpacity: [0, 0.18, 0.08, 0], scale: [0.2, 1, 1.2, 1.4] }}
            transition={{ delay: 0.5 + i * 0.35, duration: 3.5, repeat: Infinity, repeatDelay: 1.5, ease: 'easeOut' }} />
        ))}
        {[{ cx: 60, cy: 30, delay: 1.2 }, { cx: 88, cy: 32, delay: 1.5 }, { cx: 55, cy: 58, delay: 1.8 }, { cx: 92, cy: 60, delay: 2.0 }].map((dot, i) => (
          <motion.circle key={i} cx={`${dot.cx}%`} cy={`${dot.cy}%`} r="0.8%" fill="#C9A84C"
            initial={{ opacity: 0 }} animate={{ opacity: [0, 0.5, 0.3] }}
            transition={{ delay: dot.delay, duration: 0.6 }} />
        ))}
      </svg>
    </>
  )
}

/* ── Contact: Morse ─────────────────────────────────────── */
function ContactBg() {
  const mMorse = [
    { type: 'dot', x: 8, y: 25, delay: 0.3 }, { type: 'dot', x: 16, y: 25, delay: 0.5 },
    { type: 'dot', x: 24, y: 25, delay: 0.7 }, { type: 'dot', x: 32, y: 25, delay: 0.9 },
    { type: 'dot', x: 44, y: 25, delay: 1.2 }, { type: 'dash', x: 55, y: 25, delay: 1.5 },
    { type: 'dot', x: 66, y: 25, delay: 1.7 }, { type: 'dot', x: 74, y: 25, delay: 1.9 },
    { type: 'dash', x: 10, y: 45, delay: 2.1 }, { type: 'dot', x: 22, y: 45, delay: 2.3 },
    { type: 'dash', x: 30, y: 45, delay: 2.5 }, { type: 'dot', x: 42, y: 45, delay: 2.7 },
    { type: 'dot', x: 52, y: 45, delay: 2.9 }, { type: 'dot', x: 60, y: 45, delay: 3.1 },
    { type: 'dot', x: 68, y: 45, delay: 3.3 },
  ]
  const dMorse = [
    { type: 'dot', x: 60, y: 25, delay: 0.3 }, { type: 'dot', x: 63, y: 25, delay: 0.5 },
    { type: 'dot', x: 66, y: 25, delay: 0.7 }, { type: 'dot', x: 69, y: 25, delay: 0.9 },
    { type: 'dot', x: 74, y: 25, delay: 1.2 }, { type: 'dot', x: 79, y: 25, delay: 1.5 },
    { type: 'dash', x: 83, y: 25, delay: 1.7 }, { type: 'dot', x: 90, y: 25, delay: 1.9 },
    { type: 'dot', x: 93, y: 25, delay: 2.1 }, { type: 'dash', x: 60, y: 35, delay: 2.4 },
    { type: 'dot', x: 67, y: 35, delay: 2.6 }, { type: 'dash', x: 70, y: 35, delay: 2.8 },
    { type: 'dot', x: 77, y: 35, delay: 3.0 }, { type: 'dot', x: 82, y: 35, delay: 3.3 },
    { type: 'dot', x: 85, y: 35, delay: 3.5 }, { type: 'dot', x: 88, y: 35, delay: 3.7 },
  ]

  const renderMorse = (items: typeof mMorse, scale = 1) => items.map((m, i) =>
    m.type === 'dot' ? (
      <motion.circle key={i} cx={`${m.x}%`} cy={`${m.y}%`} r={`${0.8 * scale}%`} fill="#C9A84C"
        initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 0.7, scale: 1 }}
        transition={{ delay: m.delay, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }} />
    ) : (
      <motion.rect key={i} x={`${m.x}%`} y={`${m.y - 0.6 * scale}%`}
        width={`${4 * scale}%`} height={`${1.2 * scale}%`} rx="0.5%" fill="#C9A84C"
        initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 0.7, scaleX: 1 }}
        transition={{ delay: m.delay, duration: 0.4 }} />
    )
  )

  return (
    <>
      <svg className="absolute top-16 left-0 pointer-events-none block md:hidden"
        width="100vw" height="300" viewBox="0 0 100 80" preserveAspectRatio="xMinYMin meet">
        {renderMorse(mMorse, 1.2)}
        <motion.line x1="5%" y1="60%" x2="80%" y2="60%"
          stroke="#C9A84C" strokeOpacity="0" strokeWidth="0.3" strokeDasharray="1 3"
          initial={{ strokeOpacity: 0 }} animate={{ strokeOpacity: 0.15 }}
          transition={{ delay: 0.2, duration: 1 }} />
      </svg>
      <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
        viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {renderMorse(dMorse)}
        <motion.line x1="58%" y1="42%" x2="96%" y2="42%"
          stroke="#C9A84C" strokeOpacity="0" strokeWidth="0.2" strokeDasharray="1 3"
          initial={{ strokeOpacity: 0 }} animate={{ strokeOpacity: 0.12 }}
          transition={{ delay: 0.2, duration: 1 }} />
      </svg>
    </>
  )
}

/* ── Home: Candlestick Chart ────────────────────────────── */
function HomeBg() {
  const candles = [
    { o: 82, c: 90, h: 93, l: 79, bull: true }, { o: 90, c: 86, h: 93, l: 83, bull: false },
    { o: 86, c: 94, h: 97, l: 84, bull: true },  { o: 94, c: 100, h: 103, l: 91, bull: true },
    { o: 100, c: 95, h: 104, l: 93, bull: false },{ o: 95, c: 105, h: 108, l: 93, bull: true },
    { o: 105, c: 99, h: 109, l: 97, bull: false },{ o: 99, c: 93, h: 102, l: 90, bull: false },
    { o: 93, c: 97, h: 100, l: 91, bull: true },  { o: 97, c: 91, h: 100, l: 88, bull: false },
    { o: 91, c: 100, h: 103, l: 89, bull: true }, { o: 100, c: 107, h: 110, l: 98, bull: true },
    { o: 107, c: 103, h: 111, l: 101, bull: false },{ o: 103, c: 111, h: 115, l: 101, bull: true },
    { o: 111, c: 116, h: 119, l: 109, bull: true },{ o: 116, c: 111, h: 120, l: 109, bull: false },
    { o: 111, c: 118, h: 122, l: 109, bull: true },{ o: 118, c: 113, h: 122, l: 111, bull: false },
    { o: 113, c: 105, h: 116, l: 102, bull: false },{ o: 105, c: 109, h: 112, l: 103, bull: true },
    { o: 109, c: 103, h: 112, l: 100, bull: false },{ o: 103, c: 112, h: 115, l: 101, bull: true },
    { o: 112, c: 118, h: 122, l: 110, bull: true },{ o: 118, c: 114, h: 122, l: 112, bull: false },
    { o: 114, c: 123, h: 127, l: 112, bull: true },{ o: 123, c: 119, h: 127, l: 117, bull: false },
    { o: 119, c: 128, h: 132, l: 117, bull: true },{ o: 128, c: 124, h: 132, l: 122, bull: false },
    { o: 124, c: 133, h: 137, l: 122, bull: true },
  ]

  const W = 1200, H = 360
  const PAD = { l: 40, r: 40, t: 28, b: 28 }
  const chartH = H - PAD.t - PAD.b
  const candleW = 13
  const spacing = (W - PAD.l - PAD.r) / candles.length
  const maxP = 142, minP = 72
  const toY = (p: number) => PAD.t + chartH - ((p - minP) / (maxP - minP)) * chartH

  const midPoints = candles.map((c, i) => ({
    x: PAD.l + i * spacing + spacing / 2,
    y: toY((c.o + c.c) / 2),
  }))

  const areaPath = `M ${midPoints[0].x},${midPoints[0].y} ` +
    midPoints.slice(1).map(p => `L ${p.x},${p.y}`).join(' ') +
    ` L ${midPoints[midPoints.length - 1].x},${H} L ${midPoints[0].x},${H} Z`

  const linePath = `M ${midPoints[0].x},${midPoints[0].y} ` +
    midPoints.slice(1).map(p => `L ${p.x},${p.y}`).join(' ')

  const lastPt = midPoints[midPoints.length - 1]

  return (
    <>
      {/* Mobile */}
      <svg className="absolute top-14 left-0 pointer-events-none block md:hidden"
        width="100vw" height="220" viewBox={`0 0 ${W} 260`} preserveAspectRatio="xMidYMin meet">
        <defs>
          <linearGradient id="mBull" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#C9A84C" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="mBear" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#C9A84C" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {[90, 110].map((price, i) => (
          <motion.line key={price} x1={PAD.l} y1={toY(price)} x2={W - PAD.r} y2={toY(price)}
            stroke="#C9A84C" strokeOpacity="0.05" strokeWidth="1" strokeDasharray="4 12"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.1 }} />
        ))}
        {candles.map((c, i) => {
          const x = PAD.l + i * spacing + spacing / 2
          const bTop = Math.min(toY(c.o), toY(c.c))
          const bBot = Math.max(toY(c.o), toY(c.c))
          return (
            <g key={i}>
              <motion.line x1={x} y1={toY(c.h)} x2={x} y2={toY(c.l)}
                stroke="#C9A84C" strokeOpacity={c.bull ? 0.4 : 0.15} strokeWidth="1"
                initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                transition={{ delay: 0.2 + i * 0.04, duration: 0.2 }} />
              <motion.rect x={x - candleW * 0.4} y={bTop}
                width={candleW * 0.8} height={Math.max(bBot - bTop, 2)}
                fill={c.bull ? 'url(#mBull)' : 'url(#mBear)'}
                stroke="#C9A84C" strokeOpacity={c.bull ? 0.4 : 0.1} strokeWidth="0.5" rx="2"
                initial={{ scaleY: 0, originY: bBot }} animate={{ scaleY: 1 }}
                transition={{ delay: 0.2 + i * 0.04, duration: 0.18, ease: [0.22, 1, 0.36, 1] }} />
            </g>
          )
        })}
        <motion.text x={W - PAD.r - 8} y={toY(133) - 5}
          fill="#C9A84C" fillOpacity="0.4" fontSize="16"
          fontFamily="JetBrains Mono, monospace" textAnchor="end"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}>+41.2%</motion.text>
      </svg>

      {/* Desktop */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
        viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="bull" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#C9A84C" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="bear" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#C9A84C" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
          </linearGradient>
          <mask id="reveal">
            <motion.rect x="0" y="0" height={H} fill="white"
              initial={{ width: 0 }} animate={{ width: W }}
              transition={{ duration: 2.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }} />
          </mask>
        </defs>
        {[90, 105, 120].map((price, i) => (
          <motion.line key={price} x1={PAD.l} y1={toY(price)} x2={W - PAD.r} y2={toY(price)}
            stroke="#C9A84C" strokeOpacity="0.04" strokeWidth="1" strokeDasharray="4 14"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.4 + i * 0.1 }} />
        ))}
        <path d={areaPath} fill="url(#area)" mask="url(#reveal)" />
        <motion.path d={linePath} fill="none" stroke="#C9A84C" strokeOpacity="0.1" strokeWidth="1" strokeDasharray="3 10" mask="url(#reveal)" />
        {candles.map((c, i) => {
          const x = PAD.l + i * spacing + spacing / 2
          const bTop = Math.min(toY(c.o), toY(c.c))
          const bBot = Math.max(toY(c.o), toY(c.c))
          return (
            <g key={i}>
              <motion.line x1={x} y1={toY(c.h)} x2={x} y2={toY(c.l)}
                stroke="#C9A84C" strokeOpacity={c.bull ? 0.4 : 0.15} strokeWidth="0.8"
                initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                transition={{ delay: 0.15 + i * 0.045, duration: 0.22 }} />
              <motion.rect x={x - candleW / 2} y={bTop} width={candleW} height={Math.max(bBot - bTop, 2.5)}
                fill={c.bull ? 'url(#bull)' : 'url(#bear)'}
                stroke="#C9A84C" strokeOpacity={c.bull ? 0.4 : 0.1} strokeWidth="0.6" rx="2"
                initial={{ scaleY: 0, originY: bBot }} animate={{ scaleY: 1 }}
                transition={{ delay: 0.15 + i * 0.045, duration: 0.18, ease: [0.22, 1, 0.36, 1] }} />
            </g>
          )
        })}
        {candles.map((c, i) => {
          const x = PAD.l + i * spacing + spacing / 2
          const vh = c.bull ? 10 : 6
          return (
            <motion.rect key={i} x={x - candleW / 2} y={H - PAD.b - vh}
              width={candleW} height={vh} fill="#C9A84C" fillOpacity={c.bull ? 0.06 : 0.025} rx="1"
              initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
              transition={{ delay: 0.5 + i * 0.035, duration: 0.12 }} />
          )
        })}
        <motion.text x={W - PAD.r - 8} y={toY(133) - 6}
          fill="#C9A84C" fillOpacity="0.4" fontSize="11"
          fontFamily="JetBrains Mono, monospace" textAnchor="end"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 2 }}>CS/USD · +41.2%</motion.text>
        <motion.circle cx={lastPt.x} cy={lastPt.y} r="3" fill="#C9A84C"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 2.4 }} />
        {/* Live-Dot Pulse — NUR Desktop */}
        <motion.circle cx={lastPt.x} cy={lastPt.y} r="8" fill="none" stroke="#C9A84C"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 0.35, 0], scale: [0.5, 1.6, 2.2] }}
          transition={{ delay: 2.6, duration: 1.6, repeat: Infinity, repeatDelay: 2.5 }} />
      </svg>
    </>
  )
}

/* ─── Theme selector ────────────────────────────────────── */
function ThemeBg({ theme }: { theme: HeroTheme }) {
  switch (theme) {
    case 'finance':   return <FinanceBg />
    case 'dev':       return <DevBg />
    case 'about':     return <AboutBg />
    case 'community': return <CommunityBg />
    case 'contact':   return <ContactBg />
    default:          return <HomeBg />
  }
}

/* ══════════════════════════════════════════════════════════
   PAGE HERO
══════════════════════════════════════════════════════════ */
export default function PageHero({
  eyebrow, titleLine1, titleLine2, titleAccent = 'line2',
  description, badge, theme = 'default', children,
}: PageHeroProps) {
  const isMobile = useIsMobile()

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-end pb-20 md:pb-28 px-8 md:px-16 lg:px-24 pt-28 overflow-hidden">

      {/* Base grid + ambient */}
      <motion.div className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}>
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(201,168,76,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.025) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }} />
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#C9A84C]/6 blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#C9A84C]/2 blur-[100px]" />
      </motion.div>

      {/* Theme SVG */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <ThemeBg theme={theme} />
      </div>

      {/* Left line */}
      <motion.div
        className="absolute left-8 md:left-16 lg:left-24 top-28 w-px bg-gradient-to-b from-[#C9A84C]/50 via-[#C9A84C]/10 to-transparent"
        style={{ height: '55%' }}
        initial={{ scaleY: 0, originY: 0 }} animate={{ scaleY: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl">
        <motion.div className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}>
          <span className="w-6 h-px bg-[#C9A84C]" />
          <span className="text-[11px] tracking-[0.22em] uppercase text-[#C9A84C] font-medium">{eyebrow}</span>
          {badge && (
            <motion.span className="text-[10px] tracking-[0.12em] uppercase border border-[#C9A84C]/25 text-[#C9A84C]/60 px-3 py-1 rounded-full"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}>
              {badge}
            </motion.span>
          )}
        </motion.div>

        <AnimatedTitle line1={titleLine1} line2={titleLine2} accent={titleAccent as 'line1' | 'line2'} />

        <motion.p className="text-[#5a5550] text-base md:text-lg max-w-xl leading-relaxed mb-10"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.75 }}>
          {description}
        </motion.p>

        {children && (
          <motion.div className="flex items-center gap-4 flex-wrap"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.95 }}>
            {children}
          </motion.div>
        )}
      </div>

      {/* Scroll hint — Bounce NUR Desktop */}
      <motion.div className="absolute bottom-8 left-8 md:left-16 lg:left-24 flex items-center gap-3"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 0.8 }}>
        {isMobile ? (
          <span className="w-px h-6 bg-gradient-to-b from-[#C9A84C]/60 to-transparent block" />
        ) : (
          <motion.span className="w-px h-6 bg-gradient-to-b from-[#C9A84C]/60 to-transparent block"
            animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }} />
        )}
        <span className="text-[10px] tracking-[0.16em] uppercase text-[#3a3530]">Scroll</span>
      </motion.div>

      {/* Bottom divider */}
      <motion.div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/15 to-transparent"
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }} />
    </section>
  )
}