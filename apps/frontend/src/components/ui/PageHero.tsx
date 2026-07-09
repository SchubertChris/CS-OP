import { useLayoutEffect, useState } from 'react'
import { motion } from 'framer-motion'

/* ─── Mobile Check Hook ─────────────────────────────────── */
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

/* ── Finance: Portfolio Rings (Static) ────────────────────── */
function FinanceBg() {
  const cx = 350, cy = 200
  const circles = [130, 100, 72, 46]
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40 hidden md:block"
      viewBox="0 0 500 400" preserveAspectRatio="xMidYMid slice">
      {circles.map((r, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke="#C9A84C" strokeOpacity={0.15 - i * 0.02} strokeWidth={1} />
      ))}
      <circle cx={cx} cy={cy} r={4} fill="#C9A84C" fillOpacity={0.5} />
    </svg>
  )
}

/* ── Dev: Git Flow Graph (Static) ────────────────────────── */
function DevBg() {
  return (
    <svg className="absolute top-12 right-4 xl:right-10 w-[520px] pointer-events-none opacity-40 hidden md:block"
      viewBox="0 0 530 300" overflow="visible">
      <line x1={40} y1={180} x2={490} y2={180} stroke="#C9A84C" strokeOpacity={0.25} strokeWidth={1.5} />
      <path d="M 130 180 C 155 180, 160 96, 180 96 L 240 96 C 290 96, 340 180, 360 180" fill="none" stroke="#C9A84C" strokeOpacity={0.18} strokeWidth={1.2} />
      <circle cx={130} cy={180} r={4} fill="#C9A84C" fillOpacity={0.4} />
      <circle cx={180} cy={96} r={4} fill="#C9A84C" fillOpacity={0.4} />
      <circle cx={360} cy={180} r={4} fill="#C9A84C" fillOpacity={0.4} />
    </svg>
  )
}

/* ── About: Skill Constellation (Static) ─────────────────── */
function AboutBg() {
  const cx = 50, cy = 50
  const circles = [15, 28, 42]
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40 hidden md:block"
      viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      {circles.map((r, i) => (
        <circle key={i} cx={`${cx}%`} cy={`${cy}%`} r={`${r}%`} fill="none" stroke="#C9A84C" strokeOpacity={0.12 - i * 0.03} strokeWidth="0.25" />
      ))}
      <circle cx={`${cx}%`} cy={`${cy}%`} r="1%" fill="#C9A84C" fillOpacity={0.6} />
      <circle cx={`${cx - 20}%`} cy={`${cy - 20}%`} r="0.8%" fill="#C9A84C" fillOpacity={0.4} />
      <circle cx={`${cx + 30}%`} cy={`${cy + 10}%`} r="1.2%" fill="#C9A84C" fillOpacity={0.5} />
    </svg>
  )
}

/* ── Community: Member Network (Static) ──────────────────── */
function CommunityBg() {
  const members = [
    { x: 68, y: 22, label: 'Code' },
    { x: 80, y: 38, label: 'React' },
    { x: 85, y: 58, label: 'Node.js' },
    { x: 74, y: 72, label: 'DevOps' },
    { x: 60, y: 68, label: 'Python' },
    { x: 58, y: 48, label: 'Next.js' },
    { x: 65, y: 34, label: 'SQL' },
    { x: 76, y: 50, label: 'API' },
  ]
  const edges = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0],[7,1],[7,5],[7,3]]
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-45 hidden md:block"
      viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      {edges.map(([a, b], i) => (
        <line key={i} x1={`${members[a].x}%`} y1={`${members[a].y}%`} x2={`${members[b].x}%`} y2={`${members[b].y}%`} stroke="#C9A84C" strokeWidth="0.25" strokeOpacity={0.15} />
      ))}
      {members.map((m, i) => (
        <g key={i}>
          {/* Static dot */}
          <circle cx={`${m.x}%`} cy={`${m.y}%`} r="0.6%" fill="#C9A84C" fillOpacity={0.7} />
          {/* Static halo */}
          <circle cx={`${m.x}%`} cy={`${m.y}%`} r="1.5%" fill="none" stroke="#C9A84C" strokeWidth="0.3" strokeOpacity={0.2} />
          {/* Tech label */}
          <text x={`${m.x + 1.8}%`} y={`${m.y + 0.6}%`} fill="#C9A84C" fillOpacity={0.65} fontSize="1.8" fontFamily="JetBrains Mono, monospace" textAnchor="start">{m.label}</text>
        </g>
      ))}
    </svg>
  )
}

/* ── Contact: Radar Sweep (Static) ───────────────────────── */
function ContactBg() {
  const cx = 75, cy = 45
  const rings = [12, 22, 32, 42]
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40 hidden md:block"
      viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      {rings.map((r, i) => (
        <circle key={i} cx={`${cx}%`} cy={`${cy}%`} r={`${r}%`} fill="none" stroke="#C9A84C" strokeWidth="0.3" strokeOpacity={0.15 - i * 0.03} strokeDasharray="1.5 3" />
      ))}
      <line x1={`${cx}%`} y1="10%" x2={`${cx}%`} y2="80%" stroke="#C9A84C" strokeWidth="0.2" strokeOpacity={0.1} />
      <line x1="30%" y1={`${cy}%`} x2="95%" y2={`${cy}%`} stroke="#C9A84C" strokeWidth="0.2" strokeOpacity={0.1} />
      <circle cx={`${cx}%`} cy={`${cy}%`} r="1%" fill="#C9A84C" fillOpacity={0.6} />
    </svg>
  )
}

/* ── Home: Dev Stack Card (Static) ───────────────────────── */
function HomeBg() {
  const spark = [28, 22, 30, 18, 25, 14, 20, 10, 16, 6, 11, 3]
  const sparkPath = spark.map((y, i) => `${i === 0 ? 'M' : 'L'} ${i * 20} ${y}`).join(' ')
  const sparkFill = sparkPath + ` L 220 44 L 0 44 Z`

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
            <motion.rect x="0" y="0" width="220" height="44" fill="white"
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
              style={{ transformOrigin: 'left center', transformBox: 'fill-box' }}
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
                    <motion.rect x="0" y="0" width="220" height="44" fill="white"
                      initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                      style={{ transformOrigin: 'left center', transformBox: 'fill-box' }}
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
                      <motion.div className="h-full bg-[#C9A84C]/50 rounded-full origin-left"
                        style={{ width: `${cat.pct}%` }}
                        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
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