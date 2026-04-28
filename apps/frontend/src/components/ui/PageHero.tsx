import { useLayoutEffect, useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'

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
      <span className={`block text-5xl sm:text-6xl md:text-7xl xl:text-8xl ${accent === 'line1' ? 'text-[#C9A84C]' : 'text-[var(--cs-text)]'}`}>
        {chars1.map((char, i) => (
          <motion.span key={i} custom={i} variants={CHAR_VARIANTS} initial="hidden" animate="visible"
            className="inline-block" style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}>
            {char}
          </motion.span>
        ))}
      </span>
      <span className={`block text-5xl sm:text-6xl md:text-7xl xl:text-8xl ${accent === 'line2' ? 'text-[#C9A84C]' : 'text-[var(--cs-text)]'}`}>
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

/* ── Finance: Portfolio Rings ────────────────────────────── */
function FinanceBg() {
  const cx = 340, cy = 200
  const rings = [
    { r: 130, pct: 0.78, label: 'Girokonto', delay: 0.5 },
    { r: 100, pct: 0.62, label: 'Tagesgeld', delay: 0.85 },
    { r: 72,  pct: 0.45, label: 'Depot',     delay: 1.2 },
    { r: 46,  pct: 0.28, label: 'Sparziel',  delay: 1.55 },
  ]
  const endPt = (r: number, pct: number) => ({
    x: cx + r * Math.cos(-Math.PI / 2 + pct * 2 * Math.PI),
    y: cy + r * Math.sin(-Math.PI / 2 + pct * 2 * Math.PI),
  })

  return (
    <>
      {/* Mobile — 3 soft rings */}
      <svg className="absolute top-12 left-0 pointer-events-none block md:hidden"
        width="100vw" height="220" viewBox="0 0 400 220" preserveAspectRatio="xMidYMin meet">
        {[80, 56, 34].map((r, i) => (
          <g key={i} transform="rotate(-90, 200, 110)">
            <motion.circle cx={200} cy={110} r={r}
              fill="none" stroke="#C9A84C" strokeWidth={1.5}
              initial={{ pathLength: 0 }} animate={{ pathLength: [0.78, 0.62, 0.45][i] }}
              transition={{ delay: 0.5 + i * 0.3, duration: 1.4, ease: [0.22, 1, 0.36, 1] }} />
          </g>
        ))}
        {[80, 56, 34].map((r, i) => (
          <circle key={`t-${i}`} cx={200} cy={110} r={r}
            fill="none" stroke="#C9A84C" strokeOpacity={0.06} strokeWidth={1} />
        ))}
        <circle cx={200} cy={110} r={5} fill="#C9A84C" fillOpacity={0.7} />
      </svg>

      {/* Desktop — full animated rings with labels */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
        viewBox="0 0 500 400" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="rglow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Track circles */}
        {rings.map((ring, i) => (
          <circle key={`tr-${i}`} cx={cx} cy={cy} r={ring.r}
            fill="none" stroke="#C9A84C" strokeOpacity={0.07} strokeWidth={1} />
        ))}

        {/* Animated arcs */}
        {rings.map((ring, i) => (
          <g key={`arc-${i}`} transform={`rotate(-90, ${cx}, ${cy})`}>
            <motion.circle cx={cx} cy={cy} r={ring.r}
              fill="none" stroke="#C9A84C"
              strokeWidth={i === 0 ? 2.5 : i === 1 ? 2 : 1.5}
              strokeOpacity={0.75 - i * 0.1}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: ring.pct }}
              transition={{ delay: ring.delay, duration: 1.6, ease: [0.22, 1, 0.36, 1] }} />
          </g>
        ))}

        {/* End dots + labels */}
        {rings.map((ring, i) => {
          const pt = endPt(ring.r, ring.pct)
          return (
            <g key={`ep-${i}`}>
              <motion.circle cx={pt.x} cy={pt.y} r={3.5} fill="#C9A84C"
                filter="url(#rglow)"
                initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: ring.delay + 1.5, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }} />
              <motion.text
                x={pt.x + (pt.x > cx ? 9 : -9)} y={pt.y + 4}
                fill="#C9A84C" fillOpacity={0.5} fontSize={8.5}
                fontFamily="JetBrains Mono, monospace"
                textAnchor={pt.x > cx ? 'start' : 'end'}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: ring.delay + 1.7, duration: 0.5 }}>
                {ring.label}
              </motion.text>
            </g>
          )
        })}

        {/* Center */}
        <motion.circle cx={cx} cy={cy} r={5} fill="#C9A84C"
          initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 0.85, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }} />
        <motion.circle cx={cx} cy={cy} r={14} fill="none" stroke="#C9A84C"
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 0.25, 0], scale: [0.4, 1.8, 2.4] }}
          transition={{ delay: 0.8, duration: 2.2, repeat: Infinity, repeatDelay: 3.5 }} />
      </svg>
    </>
  )
}

/* ── Dev: Git Flow Graph ────────────────────────────────── */
function DevBg() {
  // Commits: [x, branch(0=main,1=feat,2=hotfix), label, gold]
  const commits: [number, number, string, boolean][] = [
    [60,  0, 'init',     false],
    [130, 0, '',         false],
    [180, 1, 'feat: ui', false],
    [240, 1, 'feat: api',false],
    [300, 2, 'fix:build',false],
    [360, 0, 'merge',    false],
    [430, 0, 'v10.6',    true ],
    [490, 0, 'HEAD',     true ],
  ]
  const branchY: Record<number, number> = { 0: 180, 1: 96, 2: 230 }
  // Feature branch arc: x from 130 to 360, apex y=96
  const featPath = `M 130 180 C 155 180, 160 96, 180 96 L 240 96 C 290 96, 340 180, 360 180`
  // Hotfix arc: x from 130 to 360 lower
  const hotfixPath = `M 130 180 C 155 180, 160 230, 180 230 L 300 230 C 330 230, 345 180, 360 180`
  // Main line
  const mainPath = `M 40 180 L 490 180`

  const branchColors: Record<number, string> = { 0: '#C9A84C', 1: '#7C9EFF', 2: '#FF8A65' }
  const branchLabels = [
    { label: 'main',    color: '#C9A84C', y: 44 },
    { label: 'feature', color: '#7C9EFF', y: 56 },
    { label: 'hotfix',  color: '#FF8A65', y: 68 },
  ]

  return (
    <>
      {/* Mobile — simplified horizontal branch lines */}
      <svg className="absolute top-14 left-0 pointer-events-none block md:hidden"
        width="100vw" height="160" viewBox="0 0 400 160" preserveAspectRatio="xMidYMin meet">
        <defs>
          <mask id="gitMaskM">
            <motion.rect x="0" y="0" width="400" height="160" fill="white"
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
              style={{ transformOrigin: '0 0' }}
              transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }} />
          </mask>
        </defs>
        <g mask="url(#gitMaskM)">
          <line x1="20" y1="90" x2="390" y2="90" stroke="#C9A84C" strokeOpacity="0.35" strokeWidth="1.5" />
          <path d="M 80 90 C 100 90, 105 48, 120 48 L 260 48 C 275 48, 280 90, 300 90"
            fill="none" stroke="#7C9EFF" strokeOpacity="0.3" strokeWidth="1.2" />
        </g>
        {[80, 150, 220, 300, 370].map((x, i) => (
          <motion.circle key={i} cx={x} cy={90} r={4}
            fill={i >= 3 ? '#C9A84C' : '#1a1a1a'} stroke="#C9A84C" strokeWidth={1.5}
            strokeOpacity={0.5}
            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.15, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }} />
        ))}
        {[150, 260].map((x, i) => (
          <motion.circle key={i} cx={x} cy={48} r={3.5}
            fill="#1a1a1a" stroke="#7C9EFF" strokeWidth={1.2} strokeOpacity={0.5}
            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + i * 0.2, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }} />
        ))}
        <motion.text x="370" y="76" fill="#C9A84C" fillOpacity="0.6" fontSize="8"
          fontFamily="JetBrains Mono, monospace" textAnchor="middle"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>HEAD</motion.text>
      </svg>

      {/* Desktop — full git flow */}
      <div className="absolute top-12 right-4 xl:right-10 w-[520px] pointer-events-none hidden md:block">
        {/* Branch legend */}
        <motion.div className="flex items-center gap-5 mb-4 pl-2"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          {branchLabels.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="w-3 h-px" style={{ backgroundColor: color, opacity: 0.6, display: 'inline-block' }} />
              <span className="text-[9px] font-mono" style={{ color, opacity: 0.55 }}>{label}</span>
            </div>
          ))}
        </motion.div>

        <svg width="100%" viewBox="0 0 530 300" overflow="visible">
          <defs>
            <mask id="gitMask">
              <motion.rect x="0" y="0" width="530" height="300" fill="white"
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                style={{ transformOrigin: '0 0' }}
                transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1], delay: 0.4 }} />
            </mask>
            <filter id="cglow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Branch lines */}
          <g mask="url(#gitMask)">
            <path d={mainPath} fill="none" stroke="#C9A84C" strokeOpacity="0.35" strokeWidth="1.5" />
            <path d={featPath} fill="none" stroke="#7C9EFF" strokeOpacity="0.3" strokeWidth="1.2" />
            <path d={hotfixPath} fill="none" stroke="#FF8A65" strokeOpacity="0.25" strokeWidth="1.2" />
          </g>

          {/* Horizontal tick lines */}
          {[90, 150, 215, 300, 370, 440].map((x) => (
            <line key={x} x1={x} y1={170} x2={x} y2={190}
              stroke="#C9A84C" strokeOpacity="0.08" strokeWidth="0.8" />
          ))}

          {/* Commits */}
          {commits.map(([x, branch, label, gold], i) => {
            const y = branchY[branch]
            const color = branchColors[branch]
            return (
              <g key={i}>
                <motion.circle cx={x} cy={y} r={gold ? 6 : 5}
                  fill={gold ? '#C9A84C' : '#111'} stroke={color} strokeWidth={gold ? 0 : 1.5}
                  strokeOpacity={gold ? 0 : 0.6}
                  filter={gold ? 'url(#cglow)' : undefined}
                  initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.18, duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }} />
                {label && (
                  <motion.text x={x} y={y - 13} fill={color} fillOpacity={gold ? 0.8 : 0.45}
                    fontSize={8} fontFamily="JetBrains Mono, monospace" textAnchor="middle"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 1.0 + i * 0.18, duration: 0.4 }}>
                    {label}
                  </motion.text>
                )}
              </g>
            )
          })}

          {/* HEAD pulse */}
          <motion.circle cx={490} cy={180} r={14} fill="none" stroke="#C9A84C"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: [0, 0.3, 0], scale: [0.4, 1.6, 2.2] }}
            transition={{ delay: 3.0, duration: 1.8, repeat: Infinity, repeatDelay: 3 }} />
        </svg>
      </div>
    </>
  )
}

/* ── About: Skill Constellation ─────────────────────────── */
function AboutBg() {
  // x/y in viewBox units (0–100)
  const nodes = [
    { x: 62, y: 18, label: 'React',      r: 2.2, delay: 0.3 },
    { x: 76, y: 28, label: 'TypeScript', r: 1.8, delay: 0.55 },
    { x: 85, y: 44, label: 'Node.js',    r: 2,   delay: 0.8 },
    { x: 80, y: 62, label: 'Electron',   r: 1.6, delay: 1.05 },
    { x: 68, y: 74, label: 'Finance',    r: 2.4, delay: 1.3 },
    { x: 55, y: 65, label: 'Trading',    r: 1.8, delay: 1.55 },
    { x: 60, y: 48, label: 'WebDev',     r: 2,   delay: 1.8 },
    { x: 70, y: 36, label: 'Potsdam',    r: 1.6, delay: 2.05 },
  ]
  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0], [6, 1], [5, 3],
  ]

  return (
    <>
      {/* Mobile */}
      <svg className="absolute top-14 left-0 pointer-events-none block md:hidden"
        width="100vw" height="280" viewBox="0 0 100 100" preserveAspectRatio="xMidYMin meet">
        {edges.map(([a, b], i) => (
          <motion.line key={i}
            x1={`${nodes[a].x}%`} y1={`${nodes[a].y}%`}
            x2={`${nodes[b].x}%`} y2={`${nodes[b].y}%`}
            stroke="#C9A84C" strokeWidth="0.3"
            initial={{ strokeOpacity: 0 }} animate={{ strokeOpacity: 0.25 }}
            transition={{ delay: 0.6 + i * 0.1, duration: 0.8 }} />
        ))}
        {nodes.map((n, i) => (
          <motion.circle key={i} cx={`${n.x}%`} cy={`${n.y}%`} r={`${n.r * 1.1}%`}
            fill="#C9A84C"
            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 0.55, scale: 1 }}
            transition={{ delay: n.delay, duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }} />
        ))}
      </svg>

      {/* Desktop */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
        viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="starGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Edges */}
        {edges.map(([a, b], i) => (
          <motion.line key={i}
            x1={`${nodes[a].x}%`} y1={`${nodes[a].y}%`}
            x2={`${nodes[b].x}%`} y2={`${nodes[b].y}%`}
            stroke="#C9A84C" strokeWidth="0.25"
            initial={{ strokeOpacity: 0 }} animate={{ strokeOpacity: 0.18 }}
            transition={{ delay: 0.7 + i * 0.12, duration: 1 }} />
        ))}

        {/* Nodes */}
        {nodes.map((n, i) => (
          <g key={i}>
            {/* Glow halo */}
            <motion.circle cx={`${n.x}%`} cy={`${n.y}%`} r={`${n.r * 2.2}%`}
              fill="#C9A84C" fillOpacity={0.04}
              initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: n.delay, duration: 0.6 }} />
            {/* Star dot */}
            <motion.circle cx={`${n.x}%`} cy={`${n.y}%`} r={`${n.r}%`}
              fill="#C9A84C" filter="url(#starGlow)"
              initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 0.75, scale: 1 }}
              transition={{ delay: n.delay, duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }} />
            {/* Label */}
            <motion.text
              x={`${n.x + (n.x > 72 ? n.r + 1.5 : -(n.r + 1.5))}%`}
              y={`${n.y + 0.5}%`}
              fill="#C9A84C" fillOpacity={0.4} fontSize="2.2"
              fontFamily="JetBrains Mono, monospace"
              textAnchor={n.x > 72 ? 'start' : 'end'}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: n.delay + 0.4, duration: 0.6 }}>
              {n.label}
            </motion.text>
            {/* Occasional pulse */}
            {i % 3 === 0 && (
              <motion.circle cx={`${n.x}%`} cy={`${n.y}%`} r={`${n.r * 3}%`}
                fill="none" stroke="#C9A84C"
                initial={{ strokeOpacity: 0, scale: 0.5 }}
                animate={{ strokeOpacity: [0, 0.2, 0], scale: [0.6, 1.8, 2.4] }}
                transition={{ delay: n.delay + 1, duration: 2.8, repeat: Infinity, repeatDelay: 4 + i * 0.6 }} />
            )}
          </g>
        ))}
      </svg>
    </>
  )
}

/* ── Community: Member Network ──────────────────────────── */
function CommunityBg() {
  const members = [
    { x: 68, y: 22, init: 'A', delay: 0.3 },
    { x: 80, y: 38, init: 'M', delay: 0.55 },
    { x: 85, y: 58, init: 'S', delay: 0.8 },
    { x: 74, y: 72, init: 'J', delay: 1.05 },
    { x: 60, y: 68, init: 'K', delay: 1.3 },
    { x: 58, y: 48, init: 'T', delay: 1.55 },
    { x: 65, y: 34, init: 'L', delay: 1.8 },
    { x: 76, y: 50, init: 'P', delay: 2.05 },
  ]
  const edges = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0],[7,1],[7,5],[7,3]]

  return (
    <>
      {/* Mobile */}
      <svg className="absolute top-14 left-0 pointer-events-none block md:hidden"
        width="100vw" height="300" viewBox="0 0 100 100" preserveAspectRatio="xMidYMin meet">
        {edges.map(([a, b], i) => (
          <motion.line key={i}
            x1={`${members[a].x}%`} y1={`${members[a].y}%`}
            x2={`${members[b].x}%`} y2={`${members[b].y}%`}
            stroke="#C9A84C" strokeWidth="0.3"
            initial={{ strokeOpacity: 0 }} animate={{ strokeOpacity: 0.2 }}
            transition={{ delay: 0.6 + i * 0.08, duration: 0.7 }} />
        ))}
        {members.map((m, i) => (
          <g key={i}>
            <motion.circle cx={`${m.x}%`} cy={`${m.y}%`} r="3.5%"
              fill="#111" stroke="#C9A84C" strokeWidth="0.5" strokeOpacity="0.5"
              initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: m.delay, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }} />
            <motion.text x={`${m.x}%`} y={`${m.y + 1}%`}
              fill="#C9A84C" fillOpacity="0.6" fontSize="3.5"
              fontFamily="JetBrains Mono, monospace" textAnchor="middle"
              dominantBaseline="middle"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: m.delay + 0.3, duration: 0.4 }}>
              {m.init}
            </motion.text>
          </g>
        ))}
      </svg>

      {/* Desktop */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
        viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="aGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Edges */}
        {edges.map(([a, b], i) => (
          <motion.line key={i}
            x1={`${members[a].x}%`} y1={`${members[a].y}%`}
            x2={`${members[b].x}%`} y2={`${members[b].y}%`}
            stroke="#C9A84C" strokeWidth="0.25"
            initial={{ strokeOpacity: 0 }} animate={{ strokeOpacity: 0.15 }}
            transition={{ delay: 0.6 + i * 0.1, duration: 0.9 }} />
        ))}

        {/* Member nodes */}
        {members.map((m, i) => (
          <g key={i}>
            {/* Outer ring */}
            <motion.circle cx={`${m.x}%`} cy={`${m.y}%`} r="4%"
              fill="none" stroke="#C9A84C" strokeWidth="0.35" strokeOpacity="0.25"
              initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: m.delay, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }} />
            {/* Avatar */}
            <motion.circle cx={`${m.x}%`} cy={`${m.y}%`} r="2.5%"
              fill="var(--cs-s2)" stroke="#C9A84C" strokeWidth="0.4" strokeOpacity="0.5"
              filter="url(#aGlow)"
              initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: m.delay + 0.1, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }} />
            {/* Initial */}
            <motion.text x={`${m.x}%`} y={`${m.y}%`}
              fill="#C9A84C" fillOpacity="0.65" fontSize="2"
              fontFamily="JetBrains Mono, monospace" textAnchor="middle"
              dominantBaseline="middle"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: m.delay + 0.35, duration: 0.5 }}>
              {m.init}
            </motion.text>
            {/* Pulse on every 3rd node */}
            {i % 3 === 0 && (
              <motion.circle cx={`${m.x}%`} cy={`${m.y}%`} r="6%"
                fill="none" stroke="#C9A84C"
                initial={{ strokeOpacity: 0, scale: 0.5 }}
                animate={{ strokeOpacity: [0, 0.18, 0], scale: [0.5, 1.5, 2] }}
                transition={{ delay: m.delay + 1.2, duration: 2.5, repeat: Infinity, repeatDelay: 4 + i * 0.8 }} />
            )}
          </g>
        ))}
      </svg>
    </>
  )
}

/* ── Contact: Radar Sweep ────────────────────────────────── */
function ContactBg() {
  const cx = 75, cy = 45  // center in viewBox 0 0 100 100
  const rings = [12, 22, 32, 42]

  // SVG-nativer Drehpunkt: rotate(angle cx cy) — kein CSS-Transform-Box-Problem
  const sweepRef = useRef<SVGGElement>(null)
  const sweepAngle = useMotionValue(0)
  useEffect(() => {
    const unsub = sweepAngle.on('change', v =>
      sweepRef.current?.setAttribute('transform', `rotate(${v} ${cx} ${cy})`)
    )
    const anim = animate(sweepAngle, 360, { duration: 5, repeat: Infinity, ease: 'linear' })
    return () => { unsub(); anim.stop() }
  }, [sweepAngle])

  // delay = ((angle + 90) % 360) / 360 * 5 — exakt synchron mit Arm-Rotation
  const icons = [
    { angle: 40,  r: 18, delay: 1.806 }, // Mail
    { angle: 110, r: 28, delay: 2.778 }, // Phone
    { angle: 200, r: 14, delay: 4.028 }, // Pin
    { angle: 310, r: 34, delay: 0.556 }, // Chat
  ]
  const toXY = (angle: number, r: number) => ({
    x: cx + r * Math.cos((angle * Math.PI) / 180),
    y: cy + r * Math.sin((angle * Math.PI) / 180),
  })

  return (
    <>
      {/* Mobile — static rings + crosshair */}
      <svg className="absolute top-14 left-0 pointer-events-none block md:hidden"
        width="100vw" height="280" viewBox="0 0 100 100" preserveAspectRatio="xMidYMin meet">
        {[14, 28, 42].map((r, i) => (
          <motion.circle key={i} cx="50%" cy="40%" r={`${r}%`}
            fill="none" stroke="#C9A84C" strokeWidth="0.35" strokeOpacity={0.18 - i * 0.04}
            strokeDasharray="1.5 3"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.2, duration: 0.7 }} />
        ))}
        <motion.line x1="50%" y1="10%" x2="50%" y2="70%"
          stroke="#C9A84C" strokeWidth="0.2" strokeOpacity="0.12"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} />
        <motion.line x1="15%" y1="40%" x2="85%" y2="40%"
          stroke="#C9A84C" strokeWidth="0.2" strokeOpacity="0.12"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} />
        <motion.circle cx="50%" cy="40%" r="1.5%"
          fill="#C9A84C" fillOpacity="0.7"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} />
      </svg>

      {/* Desktop — animated radar */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
        viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="sweepGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
          </radialGradient>
          <filter id="bGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Weicher Schweif — blendet die harte Kante aus */}
          <filter id="sweepBlur" x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur stdDeviation="0.9" />
          </filter>
          <style>{`
            @keyframes radarFlash {
              0%   { opacity: 0.85; }
              12%  { opacity: 0.45; }
              40%  { opacity: 0.15; }
              100% { opacity: 0.07; }
            }
            .radar-icon { opacity: 0.07; }
          `}</style>
        </defs>

        {/* Rings */}
        {rings.map((r, i) => (
          <motion.circle key={i} cx={`${cx}%`} cy={`${cy}%`} r={`${r}%`}
            fill="none" stroke="#C9A84C" strokeWidth="0.3"
            strokeOpacity={0.2 - i * 0.03} strokeDasharray="2 4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.15, duration: 0.7 }} />
        ))}

        {/* Crosshair */}
        <motion.line x1={`${cx}%`} y1={`${cy - 44}%`} x2={`${cx}%`} y2={`${cy + 44}%`}
          stroke="#C9A84C" strokeWidth="0.2" strokeOpacity="0.1"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} />
        <motion.line x1={`${cx - 44}%`} y1={`${cy}%`} x2={`${cx + 44}%`} y2={`${cy}%`}
          stroke="#C9A84C" strokeWidth="0.2" strokeOpacity="0.1"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} />

        {/* Rotating sweep — Drehpunkt exakt bei (cx,cy) via SVG rotate(a cx cy) */}
        <g ref={sweepRef}>
          <line x1={cx} y1={cy} x2={cx} y2={cy - 43}
            stroke="#C9A84C" strokeWidth="0.4" strokeOpacity="0.5" />
          <path
            d={`M ${cx} ${cy} L ${cx + 43 * Math.cos(-Math.PI / 2 - 0.8)} ${cy + 43 * Math.sin(-Math.PI / 2 - 0.8)} A 43 43 0 0 1 ${cx} ${cy - 43} Z`}
            fill="url(#sweepGrad)" opacity="0.5" filter="url(#sweepBlur)" />
        </g>

        {/* Icons — leuchten auf wenn Arm drüberfährt, synchron mit Rotation */}
        {icons.map((b, i) => {
          const pt = toXY(b.angle, b.r)
          return (
            <g key={i}
              transform={`translate(${pt.x} ${pt.y})`}
              className="radar-icon"
              style={{ animation: `radarFlash 5s linear ${b.delay}s infinite` }}
              stroke="#C9A84C" strokeWidth="0.45" fill="none"
              strokeLinecap="round" strokeLinejoin="round"
            >
              {i === 0 && /* Mail */ <>
                <path d="M-2.5,-1.8 L2.5,-1.8 L2.5,1.8 L-2.5,1.8 Z" />
                <polyline points="-2.5,-1.8 0,0.5 2.5,-1.8" />
              </>}
              {i === 1 && /* Smartphone */ <>
                <rect x="-1.5" y="-2.8" width="3" height="5.5" rx="0.5" />
                <line x1="-0.6" y1="2" x2="0.6" y2="2" />
              </>}
              {i === 2 && /* MapPin */ <>
                <path d="M-1.8,-1.8 A2.5,2.5,0,0,1,1.8,-1.8 Q1.5,0.5,0,3 Q-1.5,0.5,-1.8,-1.8 Z" />
                <circle cx="0" cy="-1.2" r="0.75" />
              </>}
              {i === 3 && /* Chat */ <>
                <path d="M-2.5,-2.2 L2.5,-2.2 L2.5,0.8 L0.5,0.8 L0,2.5 L-0.5,0.8 L-2.5,0.8 Z" />
              </>}
            </g>
          )
        })}

        {/* Center dot */}
        <motion.circle cx={`${cx}%`} cy={`${cy}%`} r="0.8%" fill="#C9A84C"
          initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ delay: 0.4 }} />
      </svg>
    </>
  )
}

/* ── Home: Floating Data Chips ──────────────────────────── */
function HomeBg() {
  // Sparkline points for mini SVG (12 values, normalized 0-40)
  const spark = [28, 22, 30, 18, 25, 14, 20, 10, 16, 6, 11, 3]
  const sparkPath = spark.map((y, i) => `${i === 0 ? 'M' : 'L'} ${i * 20} ${y}`).join(' ')
  const sparkFill = sparkPath + ` L ${11 * 20} 44 L 0 44 Z`

  const cats = [
    { label: 'Wohnen',  pct: 82 },
    { label: 'Leben',   pct: 58 },
    { label: 'Freizeit',pct: 34 },
  ]

  return (
    <>
      {/* Mobile — thin sparkline strip */}
      <svg className="absolute top-12 left-0 pointer-events-none block md:hidden"
        width="100vw" height="120" viewBox="0 0 220 44" preserveAspectRatio="xMidYMin meet">
        <defs>
          <linearGradient id="mSpFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
          </linearGradient>
          <mask id="mSpMask">
            <motion.rect x="0" y="0" height="44" fill="white"
              initial={{ width: 0 }} animate={{ width: 220 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }} />
          </mask>
        </defs>
        <path d={sparkFill} fill="url(#mSpFill)" mask="url(#mSpMask)" />
        <path d={sparkPath} fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeOpacity="0.55" mask="url(#mSpMask)" />
        <motion.circle cx={220} cy={3} r={3} fill="#C9A84C"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }} />
      </svg>

      {/* Desktop — 3 floating chips, no window chrome */}
      <div className="absolute inset-0 pointer-events-none hidden md:block">
        {/* Chip 1: Gesamtvermögen (large, top-right) */}
        <motion.div
          className="absolute top-[14%] right-[7%] xl:right-[9%]"
          initial={{ opacity: 0, y: -18, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}>
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}>
            <div className="border border-[#C9A84C]/20 rounded-2xl bg-[var(--cs-s0)]/80 backdrop-blur-md px-5 py-4 shadow-2xl shadow-black/70"
              style={{ boxShadow: '0 0 40px rgba(201,168,76,0.06), 0 20px 60px rgba(0,0,0,0.7)' }}>
              <div className="text-[9px] font-mono text-[#4a4540] tracking-widest uppercase mb-1">Gesamtvermögen</div>
              <div className="flex items-baseline gap-2.5">
                <span className="text-[28px] font-mono text-[var(--cs-text)] tracking-tight leading-none">€ 24,830</span>
                <motion.span className="text-[11px] font-mono text-[#22c55e]"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>
                  +3.2% YTD
                </motion.span>
              </div>
              <div className="mt-3 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/15 to-transparent" />
              <div className="mt-2 flex gap-4">
                {[{ l: 'Konten', v: '4' }, { l: 'Module', v: '10' }, { l: 'Offline', v: '100%' }].map(({ l, v }) => (
                  <div key={l}>
                    <div className="text-[8px] font-mono text-[var(--cs-text-4)]">{l}</div>
                    <div className="text-[11px] font-mono text-[#C9A84C]/70">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Connector line between chip 1 and chip 2 */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          <motion.line x1="75%" y1="30%" x2="80%" y2="52%"
            stroke="#C9A84C" strokeWidth="0.8" strokeOpacity="0.12" strokeDasharray="3 5"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }} />
          <motion.line x1="80%" y1="52%" x2="76%" y2="70%"
            stroke="#C9A84C" strokeWidth="0.8" strokeOpacity="0.08" strokeDasharray="3 5"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ delay: 1.8, duration: 0.8 }} />
        </svg>

        {/* Chip 2: Mini sparkline (mid-right, offset inward) */}
        <motion.div
          className="absolute top-[44%] right-[10%] xl:right-[12%]"
          style={{ opacity: 0.75 }}
          initial={{ opacity: 0, y: 14, scale: 0.94 }}
          animate={{ opacity: 0.75, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}>
            <div className="border border-[#C9A84C]/12 rounded-xl bg-[var(--cs-s0)]/70 backdrop-blur-md px-4 py-3 w-[200px]">
              <div className="text-[8px] font-mono text-[var(--cs-text-4)] tracking-widest uppercase mb-2">Ausgaben · Jan–Dez</div>
              <svg width="100%" viewBox="0 0 220 44">
                <defs>
                  <linearGradient id="spFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
                  </linearGradient>
                  <mask id="spMask">
                    <motion.rect x="0" y="0" height="44" fill="white"
                      initial={{ width: 0 }} animate={{ width: 220 }}
                      transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 1.0 }} />
                  </mask>
                </defs>
                <path d={sparkFill} fill="url(#spFill)" mask="url(#spMask)" />
                <path d={sparkPath} fill="none" stroke="#C9A84C" strokeWidth="1.8" strokeOpacity="0.55" mask="url(#spMask)" />
                <motion.circle cx={220} cy={3} r={3} fill="#C9A84C"
                  initial={{ opacity: 0 }} animate={{ opacity: 0.9 }} transition={{ delay: 2.6 }} />
              </svg>
              <div className="mt-1.5 flex justify-between">
                <span className="text-[8px] font-mono text-[var(--cs-text-4)]">Jan</span>
                <span className="text-[8px] font-mono text-[#C9A84C]/50">–12.4% ggü. Vorjahr</span>
                <span className="text-[8px] font-mono text-[var(--cs-text-4)]">Dez</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Chip 3: Category bars (lower-right, most faded) */}
        <motion.div
          className="absolute top-[68%] right-[8%] xl:right-[10%]"
          style={{ opacity: 0.5 }}
          initial={{ opacity: 0, y: 16, scale: 0.92 }}
          animate={{ opacity: 0.5, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.95, ease: [0.22, 1, 0.36, 1] }}>
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}>
            <div className="border border-[#C9A84C]/10 rounded-xl bg-[var(--cs-s0)]/65 backdrop-blur-md px-4 py-3 w-[180px]">
              <div className="text-[8px] font-mono text-[var(--cs-text-4)] tracking-widest uppercase mb-3">Kategorien</div>
              <div className="flex flex-col gap-2">
                {cats.map((cat, i) => (
                  <div key={cat.label}>
                    <div className="flex justify-between mb-0.5">
                      <span className="text-[8px] font-mono text-[#4a4540]">{cat.label}</span>
                      <span className="text-[8px] font-mono text-[#C9A84C]/50">{cat.pct}%</span>
                    </div>
                    <div className="h-0.5 w-full bg-[#C9A84C]/08 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-[#C9A84C]/50 rounded-full"
                        initial={{ width: 0 }} animate={{ width: `${cat.pct}%` }}
                        transition={{ delay: 1.4 + i * 0.2, duration: 1, ease: [0.22, 1, 0.36, 1] }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
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

        <motion.p className="text-[var(--cs-text-3)] text-base md:text-lg max-w-xl leading-relaxed mb-10"
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
        <span className="text-[10px] tracking-[0.16em] uppercase text-[var(--cs-text-4)]">Scroll</span>
      </motion.div>

      {/* Bottom divider */}
      <motion.div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/15 to-transparent"
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }} />
    </section>
  )
}