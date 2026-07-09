/* ============================================================
   CandleScope — Dev & Web Page  (nur echte Daten, keine doppelten Animationen)
   src/pages/DevPage.tsx

   ANIMATION REGEL:
   - SectionHeader  → animiert sich selbst via useReveal (CSS)
   - StaggerContainer → animiert Kinder via Framer Motion
   - NIEMALS beides gleichzeitig auf demselben Element
   - Kein <Reveal> um SectionHeader oder StaggerContainer
   ============================================================ */
import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useReducedMotion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Reveal, Magnetic } from '../components/home/primitives'
import {
  SectionWrapper, SectionHeader, GoldDivider,
  Card, CardIcon, GradientText, Badge, CtaButton, TagList,
} from '../components/ui'
import {
  Globe, Terminal, GitBranch,
  ExternalLink, Code2, Package, Zap, Users, ArrowRight,
  BookOpen, Layers, Coffee, Loader2, AlertCircle, Lock,
} from 'lucide-react'

/* ════════════════════════════════════════════════════════════════
   GITHUB HOOKS
   ════════════════════════════════════════════════════════════════ */
interface ContributionDay { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }
interface GitHubContributions { total: Record<string, number>; contributions: ContributionDay[] }

function useGitHubContributions(username: string) {
  const [data, setData] = useState<GitHubContributions | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  useEffect(() => {
    if (!username) return
    setStatus('loading')
    fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() as Promise<GitHubContributions> })
      .then(d => { setData(d); setStatus('success') })
      .catch(() => setStatus('error'))
  }, [username])
  return { data, status }
}

interface GitHubUser { public_repos: number; followers: number }
function useGitHubUser(username: string) {
  const [data, setData] = useState<GitHubUser | null>(null)
  useEffect(() => {
    fetch(`https://api.github.com/users/${username}`)
      .then(r => r.json() as Promise<GitHubUser>)
      .then(d => setData(d))
      .catch(() => { })
  }, [username])
  return data
}

/* ════════════════════════════════════════════════════════════════
   STAGGER — nur für Kinder ohne eigene Animation
   ════════════════════════════════════════════════════════════════ */
function StaggerContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className={className}>
      {children}
    </motion.div>
  )
}

function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={{
      hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
      visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
    }} className={className}>
      {children}
    </motion.div>
  )
}

/* ════════════════════════════════════════════════════════════════
   GITHUB ACTIVITY
   ════════════════════════════════════════════════════════════════ */
function ContribSquare({ day }: { day: ContributionDay }) {
  const bg = ['bg-[#ffffff]/5', 'bg-[#C9A84C]/20', 'bg-[#C9A84C]/40', 'bg-[#C9A84C]/65', 'bg-[#C9A84C]'][day.level]
  return (
    <motion.div
      className={`w-3 h-3 rounded-sm ${bg} cursor-default`}
      whileHover={{ scale: 1.5, zIndex: 10 }}
      transition={{ duration: 0.12 }}
      title={day.date ? `${day.date}: ${day.count} Contribution${day.count !== 1 ? 's' : ''}` : ''}
    />
  )
}

function ContribSkeleton() {
  return (
    <div className="flex gap-1 animate-pulse">
      {Array.from({ length: 52 }, (_, w) => (
        <div key={w} className="flex flex-col gap-1">
          {Array.from({ length: 7 }, (_, d) => (
            <div key={d} className="w-3 h-3 rounded-sm bg-[#ffffff]/5" />
          ))}
        </div>
      ))}
    </div>
  )
}

function buildMonthLabels(contributions: ContributionDay[]): string[] {
  const names = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
  const labels: string[] = []
  let lastMonth = -1
  for (let w = 0; w < 52; w++) {
    const day = contributions[w * 7]
    if (!day) { labels.push(''); continue }
    const month = new Date(day.date).getMonth()
    if (month !== lastMonth) { labels.push(names[month]); lastMonth = month }
    else labels.push('')
  }
  return labels
}

function StatPill({ icon, value, label, loading }: {
  icon: React.ReactNode; value: string; label: string; loading?: boolean
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border border-[var(--cs-border-w2)] rounded-full bg-[var(--cs-s1)]">
      <span className="text-[#C9A84C]/70">{icon}</span>
      {loading
        ? <div className="w-8 h-4 rounded bg-[#ffffff]/10 animate-pulse" />
        : <span className="font-display text-base text-[var(--cs-text)]">{value}</span>
      }
      <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--cs-text-3)]">{label}</span>
    </div>
  )
}

function GitHubActivitySection({ username }: { username: string }) {
  const { data: contribData, status } = useGitHubContributions(username)
  const userData = useGitHubUser(username)
  const contributions: ContributionDay[] = contribData?.contributions.slice(-364) ?? []
  const yearKey = Object.keys(contribData?.total ?? {}).sort().at(-1)
  const totalThisYear = yearKey ? contribData!.total[yearKey] : null
  const weeks: ContributionDay[][] = []
  for (let w = 0; w < 52; w++) {
    const slice = contributions.slice(w * 7, w * 7 + 7)
    while (slice.length < 7) slice.push({ date: '', count: 0, level: 0 })
    weeks.push(slice)
  }
  const labels = contributions.length ? buildMonthLabels(contributions) : []

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-8">
        <StatPill icon={<GitBranch size={14} strokeWidth={1.5} />} value={totalThisYear ? String(totalThisYear) : '—'} label="Contributions / Jahr" loading={status === 'loading'} />
        <StatPill icon={<Code2 size={14} strokeWidth={1.5} />} value={userData ? String(userData.public_repos) : '—'} label="Repositories" loading={!userData} />
        <StatPill icon={<Users size={14} strokeWidth={1.5} />} value={userData ? String(userData.followers) : '—'} label="Follower" loading={!userData} />
      </div>
      <div className="rounded-xl border border-[var(--cs-border-w2)] bg-[var(--cs-s1)] p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--cs-text-3)]">Contribution Graph</span>
            {status === 'loading' && <Loader2 size={12} strokeWidth={1.5} className="text-[var(--cs-text-3)] animate-spin" />}
            {status === 'success' && totalThisYear && <span className="font-mono text-[10px] text-[var(--cs-text-2)]">{totalThisYear} in {yearKey}</span>}
            {status === 'error' && <span className="flex items-center gap-1 font-mono text-[10px] text-[#FF4444]/60"><AlertCircle size={11} strokeWidth={1.5} /> API nicht erreichbar</span>}
          </div>
          <a href={`https://github.com/${username}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--cs-text-2)] hover:text-[#C9A84C] transition-colors">
            GitHub <ExternalLink size={11} strokeWidth={1.5} />
          </a>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            {labels.length > 0 && (
              <div className="flex gap-1 mb-1">
                {labels.map((l, i) => <div key={i} className="flex-1 font-mono text-[9px] text-[var(--cs-text-3)] tracking-[0.1em] truncate">{l}</div>)}
              </div>
            )}
            {status === 'loading' || contributions.length === 0
              ? <ContribSkeleton />
              : (
                <motion.div className="flex gap-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                  {weeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-1">
                      {week.map((day, di) => <ContribSquare key={di} day={day} />)}
                    </div>
                  ))}
                </motion.div>
              )
            }
            <div className="flex items-center gap-2 mt-3 justify-end">
              <span className="font-mono text-[9px] text-[var(--cs-text-3)]">Weniger</span>
              {([0, 1, 2, 3, 4] as const).map(l => (
                <div key={l} className={`w-3 h-3 rounded-sm ${['bg-[#ffffff]/5', 'bg-[#C9A84C]/20', 'bg-[#C9A84C]/40', 'bg-[#C9A84C]/65', 'bg-[#C9A84C]'][l]}`} />
              ))}
              <span className="font-mono text-[9px] text-[var(--cs-text-3)]">Mehr</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ════════════════════════════════════════════════════════════════
   PROJECT CARDS  — whileHover ist ok, kein scroll-trigger
   ════════════════════════════════════════════════════════════════ */
function SpotlightCard({ title, description, tags, href, githubHref, status }: {
  title: string; description: string; tags: string[]; href?: string; githubHref?: string; status: 'live' | 'wip'
}) {
  const statusColor = { live: 'text-[#00C896]', wip: 'text-[#C9A84C]' }[status]
  const statusDot = { live: 'bg-[#00C896]', wip: 'bg-[#C9A84C]' }[status]
  const statusLabel = { live: 'Live', wip: 'In Arbeit' }[status]
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.25 }}
      className="relative rounded-2xl border border-[#C9A84C]/20 bg-gradient-to-br from-[var(--cs-s2)] to-[var(--cs-s1)] p-8 overflow-hidden group">
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500
        bg-[radial-gradient(ellipse_at_top_left,rgba(201,168,76,0.08)_0%,transparent_60%)] pointer-events-none" />
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Badge variant="gold">Featured</Badge>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${statusDot} animate-pulse`} />
            <span className={`font-mono text-[10px] tracking-[0.14em] uppercase ${statusColor}`}>{statusLabel}</span>
          </div>
        </div>
      </div>
      <h3 className="font-display text-2xl md:text-3xl text-[var(--cs-text)] mb-3 leading-tight">{title}</h3>
      <p className="text-[var(--cs-text-2)] text-sm leading-relaxed mb-6 max-w-lg">{description}</p>
      <TagList tags={tags} />
      <div className="flex items-center gap-4 mt-6 pt-6 border-t border-[var(--cs-border-w)]">
        {githubHref && (
          <a href={githubHref} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[11px] tracking-[0.1em] uppercase text-[var(--cs-text-3)] hover:text-[#C9A84C] transition-colors">
            <GitBranch size={13} strokeWidth={1.5} /> GitHub
          </a>
        )}
        {href && (
          <a href={href} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[11px] tracking-[0.1em] uppercase text-[var(--cs-text-2)] hover:text-[#C9A84C] transition-colors ml-auto">
            Live ansehen <ExternalLink size={12} strokeWidth={1.5} />
          </a>
        )}
      </div>
    </motion.div>
  )
}

function ProjectCard({ title, description, tags, href, githubHref, status, locked }: {
  title: string; description: string; tags: string[]; href?: string; githubHref?: string; status: 'live' | 'wip'; locked?: boolean
}) {
  const statusDot = { live: 'bg-[#00C896]', wip: 'bg-[#C9A84C]' }[status]
  const statusLabel = { live: 'Live', wip: 'In Arbeit' }[status]
  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.22 }}
      className="flex flex-col h-full rounded-xl border border-[var(--cs-border-w2)] bg-[var(--cs-s1)] p-6 group hover:border-[#C9A84C]/20 transition-colors duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
          <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--cs-text-3)]">{statusLabel}</span>
        </div>
        {locked && (
          <div className="flex items-center gap-1 text-[var(--cs-text-3)]">
            <Lock size={11} strokeWidth={1.5} />
            <span className="font-mono text-[9px] tracking-[0.1em] uppercase">Privat</span>
          </div>
        )}
      </div>
      <h4 className="font-display text-base text-[var(--cs-text)] mb-2">{title}</h4>
      <p className="text-[var(--cs-text-2)] text-[13px] leading-relaxed mb-4 flex-1">{description}</p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {tags.map(t => (
          <span key={t} className="font-mono text-[10px] tracking-[0.1em] px-2 py-0.5 rounded-full border border-[#C9A84C]/25 text-[var(--cs-text-2)]">{t}</span>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-auto">
        {githubHref && (
          <a href={githubHref} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[11px] tracking-[0.1em] uppercase text-[var(--cs-text-3)] hover:text-[#C9A84C] transition-colors">
            <GitBranch size={12} strokeWidth={1.5} /> GitHub
          </a>
        )}
        {href && (
          <a href={href} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[11px] tracking-[0.1em] uppercase text-[var(--cs-text-2)] hover:text-[#C9A84C] transition-colors ml-auto">
            Ansehen <ExternalLink size={11} strokeWidth={1.5} />
          </a>
        )}
      </div>
    </motion.div>
  )
}

/* ════════════════════════════════════════════════════════════════
   DEV PIPELINE — Signature-Grafik: aufsteigende CI/CD-Pipeline.
   9 nummerierte Hex-Stufen auf diagonaler Gold-Rail von unten-links
   (Idee) nach oben-rechts (Marketing); Tech-Tributaries speisen ein,
   Labels oben-links, Komet + Zündung zeigen Richtung. Maus-Parallax.
   ════════════════════════════════════════════════════════════════ */
const PL_STAGES = ['Idee', 'Tech Stack', 'Architecture', 'Database', 'Sicherheit', 'Testing', 'Deployment', 'Launching', 'Marketing']
const PL_N = PL_STAGES.length
const PL_X0 = 66, PL_Y0 = 476
const PL_X1 = 416, PL_Y1 = 70
function plPos(i: number) {
  const t = i / (PL_N - 1)
  return { x: PL_X0 + t * (PL_X1 - PL_X0), y: PL_Y0 + t * (PL_Y1 - PL_Y0) }
}
const PL_TRIBS = [
  { i: 1, tag: 'React · Vite',    c: '#7C9EFF' },
  { i: 2, tag: 'Monorepo',        c: '#A78BFA' },
  { i: 3, tag: 'Supabase · PG',   c: '#22D3EE' },
  { i: 4, tag: 'Ed25519 · AES',   c: '#7C9EFF' },
  { i: 5, tag: 'Vitest · Zod',    c: '#A78BFA' },
  { i: 6, tag: 'Docker · Vercel', c: '#22D3EE' },
]
function plHex(cx: number, cy: number, r: number) {
  let p = ''
  for (let k = 0; k < 6; k++) {
    const a = (Math.PI / 180) * (60 * k - 90)
    p += `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)} `
  }
  return p.trim()
}

function DevGitFlow() {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 120, damping: 22 })
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 120, damping: 22 })
  const glowX = useSpring(useTransform(mx, [-0.5, 0.5], [-22, 22]), { stiffness: 60, damping: 20 })
  const glowY = useSpring(useTransform(my, [-0.5, 0.5], [-22, 22]), { stiffness: 60, damping: 20 })

  const onMove = (e: React.MouseEvent) => {
    if (reduced) return
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = () => { mx.set(0); my.set(0) }

  const a = plPos(0)
  const b = plPos(PL_N - 1)
  const railD = `M${a.x},${a.y} L${b.x},${b.y}`

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative w-full max-w-[470px] mx-auto select-none"
      style={{ perspective: 1000 }}
      aria-hidden="true"
    >
      <motion.div
        className="absolute inset-0 -z-10 blur-3xl opacity-70"
        style={{
          x: reduced ? 0 : glowX, y: reduced ? 0 : glowY,
          background: 'radial-gradient(46% 46% at 62% 38%, rgba(201,168,76,0.16), transparent 72%)',
        }}
      />
      <motion.svg
        viewBox="0 0 480 540"
        className="w-full h-auto overflow-visible"
        style={{ rotateX: reduced ? 0 : rotX, rotateY: reduced ? 0 : rotY, transformStyle: 'preserve-3d' }}
      >
        <defs>
          <linearGradient id="pl-rail" x1={a.x} y1={a.y} x2={b.x} y2={b.y} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--cs-gold)" stopOpacity="0.35" />
            <stop offset="55%" stopColor="var(--cs-gold)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--cs-gold-hi)" stopOpacity="1" />
          </linearGradient>
          <filter id="pl-glow" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="2.2" result="bl" />
            <feMerge><feMergeNode in="bl" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <marker id="pl-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto">
            <path d="M0,0 L9,5 L0,10 z" fill="var(--cs-gold-hi)" />
          </marker>
        </defs>

        {/* Dezentes PCB-Dot-Grid */}
        <g fill="var(--cs-gold)" fillOpacity="0.05">
          {Array.from({ length: 72 }).map((_, k) => (
            <circle key={k} cx={30 + (k % 8) * 60} cy={30 + Math.floor(k / 8) * 60} r="1" />
          ))}
        </g>

        {/* HUD-Ecken */}
        <g stroke="var(--cs-gold)" strokeOpacity="0.28" strokeWidth="1.1" fill="none" strokeLinecap="round">
          <path d="M16,34 L16,16 L34,16" />
          <path d="M446,16 L464,16 L464,34" />
          <path d="M16,506 L16,524 L34,524" />
          <path d="M446,524 L464,524 L464,506" />
        </g>

        {/* Tributaries — speisen aus unten-rechts einwärts in die Stufen */}
        {PL_TRIBS.map((t) => {
          const n = plPos(t.i)
          const sx = n.x + 60
          const sy = n.y + 36
          const d = `M${sx},${sy} C${sx - 18},${sy} ${n.x + 26},${n.y + 4} ${n.x + 13},${n.y}`
          return (
            <g key={t.i}>
              <path id={`pl-trib-${t.i}`} d={d} fill="none" stroke={t.c} strokeOpacity="0.4"
                    strokeWidth="1.3" strokeLinecap="round" strokeDasharray="4 7">
                {!reduced && <animate attributeName="stroke-dashoffset" from="0" to="-11" dur="0.9s" repeatCount="indefinite" />}
              </path>
              {!reduced && (
                <circle r="2" fill={t.c}>
                  <animateMotion dur="2.8s" begin={`${t.i * 0.3}s`} repeatCount="indefinite" calcMode="linear"><mpath href={`#pl-trib-${t.i}`} /></animateMotion>
                  <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.85;1" dur="2.8s" begin={`${t.i * 0.3}s`} repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={sx} cy={sy} r="2.4" fill="var(--cs-s1)" stroke={t.c} strokeWidth="1.2" />
              <text x={sx + 6} y={sy + 3} textAnchor="start" fontFamily="ui-monospace, monospace"
                    fontSize="9" fill={t.c} fillOpacity="0.75" letterSpacing="0.2">{t.tag}</text>
            </g>
          )
        })}

        {/* Rail-Basis mit Luminanz-Gradient + Richtungspfeil ins Ziel */}
        <path d={railD} fill="none" stroke="url(#pl-rail)" strokeWidth="2.6" strokeLinecap="round" markerEnd="url(#pl-arrow)" />
        {/* Fließende Richtungs-Dashes */}
        <path id="pl-rail-path" d={railD} fill="none" stroke="var(--cs-gold-hi)" strokeWidth="2.6"
              strokeLinecap="round" strokeDasharray="5 13" strokeOpacity="0.8">
          {!reduced && <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="0.9s" repeatCount="indefinite" />}
        </path>
        {/* Energie-Komet: zeichnet die Reise Idee → Marketing physisch nach */}
        {!reduced && (
          <circle r="3.6" fill="#ffffff" filter="url(#pl-glow)">
            <animateMotion dur="4.6s" repeatCount="indefinite" calcMode="linear"><mpath href="#pl-rail-path" /></animateMotion>
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.92;1" dur="4.6s" repeatCount="indefinite" />
          </circle>
        )}

        {/* Stufen-Knoten */}
        {PL_STAGES.map((label, i) => {
          const p = plPos(i)
          const isStart = i === 0
          const isEnd = i === PL_N - 1
          const R = isEnd ? 17 : 14.5
          return (
            <motion.g key={i}
              initial={reduced ? undefined : { opacity: 0, y: 8 }}
              animate={reduced ? undefined : { opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Sequenzielle Zündung — Stufen leuchten der Reihe nach auf */}
              {!reduced && (
                <circle cx={p.x} cy={p.y} r={R} fill="none"
                        stroke={isEnd ? 'var(--cs-gold-hi)' : 'var(--cs-gold)'} strokeWidth="1">
                  <animate attributeName="r" values={`${R};${R + 15};${R}`} dur="2.6s" begin={`${i * 0.26}s`} repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0;0.5" dur="2.6s" begin={`${i * 0.26}s`} repeatCount="indefinite" />
                </circle>
              )}
              {/* Präzisions-Außenring */}
              <polygon points={plHex(p.x, p.y, R + 4)} fill="none" stroke="var(--cs-gold)" strokeWidth="0.7" strokeOpacity="0.3" />
              {/* Hex-Modul (transparent-golden, kein dunkler Fill) */}
              <polygon points={plHex(p.x, p.y, R)} fill="var(--cs-gold)" fillOpacity={isEnd ? 0.16 : 0.07}
                       stroke="var(--cs-gold)" strokeWidth="1.5" strokeOpacity="0.9" filter="url(#pl-glow)" />
              {/* Stufen-Index 01–09 */}
              <text x={p.x} y={p.y + 3} textAnchor="middle" fontFamily="ui-monospace, monospace"
                    fontSize="9" fontWeight="600" fill="var(--cs-gold-hi)" letterSpacing="0.5">
                {String(i + 1).padStart(2, '0')}
              </text>
              {/* Hairline-Connector zum Label */}
              <line x1={p.x - R - 2} y1={p.y} x2={p.x - R - 11} y2={p.y} stroke="var(--cs-gold)" strokeOpacity="0.35" strokeWidth="0.75" />
              {/* Stufen-Name (rechtsbündig, obere-linke Zone) */}
              <text x={p.x - R - 13} y={p.y + 3.5} textAnchor="end" fontFamily="ui-monospace, monospace"
                    fontSize="11.5" fill={isStart || isEnd ? 'var(--cs-gold-hi)' : 'var(--cs-gold)'}
                    fillOpacity={isStart || isEnd ? 1 : 0.9} letterSpacing="0.2">
                {label}
              </text>
            </motion.g>
          )
        })}
      </motion.svg>
    </div>
  )
}

export default function DevPage() {
  const STACK = ['React', 'TypeScript', 'Vite', 'SCSS', 'Node.js', 'Express.js', 'Supabase', 'PostgreSQL', 'Zod', 'Docker', 'Git', 'Linux']
  const userData = useGitHubUser('SchubertChris')
  const pageRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={pageRef} className="relative" style={{ overflowX: 'clip' }}>
      <div className="relative z-[5]">
        {/* ═══════════ HERO ═══════════ */}
        <section className="min-h-[100svh] grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center gap-12 lg:gap-16 px-6 md:px-12 lg:px-20 max-w-[1320px] mx-auto pt-32 pb-20">
          <div className="flex flex-col justify-center">
            <Reveal>
              <p className="font-mono uppercase tracking-[0.2em] text-[0.72rem] text-[var(--cs-text-2)] mb-7 flex items-center gap-3">
                <span className="w-6 h-px bg-[var(--cs-gold)]/50" />
                Fullstack Developer · Potsdam, DE
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="font-display font-semibold leading-[0.98] tracking-[-0.04em] text-display-xl text-[var(--cs-text)]">
                <span className="block">Von der Idee</span>
                <span className="block"><GradientText>zum Produkt.</GradientText></span>
              </h1>
            </Reveal>
            <Reveal delay={0.18}>
              <p className="mt-8 max-w-[54ch] leading-relaxed text-[var(--cs-text-2)] text-lg">
                Ich entwickle React-Apps, Desktop-Software und Backends, die wirklich in Produktion gehen — sauber, schnell, wartbar.
              </p>
            </Reveal>
            <Reveal delay={0.26}>
              <div className="flex flex-wrap items-center gap-4 mt-9">
                <Magnetic strength={0.2}>
                  <Link to="/contact"
                    className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] uppercase bg-[var(--cs-gold)] text-[var(--cs-on-gold)] px-7 py-3.5 rounded-full font-semibold hover:bg-[var(--cs-gold-hi)] transition-colors duration-300">
                    Projekt anfragen
                  </Link>
                </Magnetic>
                <Magnetic strength={0.2}>
                  <a href="https://github.com/SchubertChris" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] uppercase border border-[var(--cs-border-w3)] text-[var(--cs-text)] px-7 py-3.5 rounded-full hover:border-[var(--cs-gold)] hover:text-[var(--cs-gold)] transition-colors duration-300">
                    <GitBranch size={14} strokeWidth={1.6} /> GitHub ansehen
                  </a>
                </Magnetic>
              </div>
            </Reveal>
            <Reveal delay={0.34}>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mt-10 font-mono">
                <span className="inline-flex items-center gap-2.5 text-[0.72rem] uppercase tracking-[0.18em] text-[var(--cs-text)]">
                  <span className="relative flex w-2 h-2">
                    <span className="absolute inset-0 rounded-full bg-[var(--cs-success)] animate-ping opacity-60" />
                    <span className="relative inline-flex rounded-full w-2 h-2 bg-[var(--cs-success)]" />
                  </span>
                  Verfügbar für Projekte
                </span>
                <span className="w-px h-3.5 bg-[var(--cs-border-w3)]" />
                <div className="flex flex-wrap gap-2">
                  {['React', 'TypeScript', 'Node', 'Electron'].map(t => (
                    <span key={t} className="px-3 py-1 rounded-full border border-[var(--cs-border-w)] text-[0.64rem] tracking-[0.12em] uppercase text-[var(--cs-text-2)]">{t}</span>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.42}>
              <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3 mt-9 font-mono">
                {[
                  { v: userData ? String(userData.public_repos) : '—', l: 'Repositories' },
                  { v: userData ? String(userData.followers) : '—', l: 'Follower' },
                  { v: '13+', l: 'Jahre Praxis' },
                ].map(s => (
                  <span key={s.l} className="flex items-baseline gap-2">
                    <span className="font-display font-semibold text-[1.7rem] leading-none text-[var(--cs-text)]">{s.v}</span>
                    <span className="text-[0.64rem] tracking-[0.16em] uppercase text-[var(--cs-text-3)]">{s.l}</span>
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Signature-Grafik rechts (Desktop) */}
          <div className="hidden lg:flex items-center justify-center">
            <DevGitFlow />
          </div>
        </section>

      {/* ── Services ─────────────────────────────────────── */}
      <SectionWrapper id="services">
        <SectionHeader
          eyebrow="Was ich baue"
          title={<>Code der <GradientText>funktioniert</GradientText></>}
          description="Von der Web-App über eigene Tools bis zur Automatisierung — immer mit Fokus auf Performance, Design und Wartbarkeit."
          className="mb-14"
        />
        {/* StaggerContainer direkt — kein extra Wrapper */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: <Globe size={20} strokeWidth={1.5} />, title: 'Web-Apps & Websites', desc: 'React & TypeScript — von der schnellen Landing Page bis zur skalierbaren Web-App: typsicher und production-ready.' },
            { icon: <Terminal size={20} strokeWidth={1.5} />, title: 'Tools & Backends', desc: 'APIs, Datenbanken und eigene Tools — von Trading-Dashboards bis zu Desktop-Software wie VaultBox.' },
            { icon: <Zap size={20} strokeWidth={1.5} />, title: 'Automatisierung & KI', desc: 'Wiederkehrende Abläufe automatisieren und Workflows mit KI beschleunigen — mehr Output, weniger Handarbeit.' },
          ].map((s, i) => (
            <StaggerItem key={i}>
              <Card variant="elevated" className="h-full">
                <CardIcon>{s.icon}</CardIcon>
                <h3 className="font-display text-lg text-[var(--cs-text)] mb-2">{s.title}</h3>
                <p className="text-[var(--cs-text-2)] text-sm leading-relaxed">{s.desc}</p>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </SectionWrapper>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* ── Tech Stack ───────────────────────────────────── */}
      <SectionWrapper id="stack">
        <SectionHeader
          eyebrow="Tech Stack"
          title={<>Mein <GradientText>Werkzeugkasten</GradientText></>}
          className="mb-10"
        />
        <TagList tags={STACK} />
      </SectionWrapper>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* ── Projekte ─────────────────────────────────────── */}
      <SectionWrapper id="projects">
        <SectionHeader
          eyebrow="Projekte"
          title={<>Ausgewählte <GradientText>Arbeiten</GradientText></>}
          description="Echte Projekte — von Portfolio bis Produktiv-App."
          className="mb-14"
        />
        {/* Spotlight — plain div, kein extra animate */}
        <div className="mb-5">
          <SpotlightCard
            title="CandleScope.de"
            description="Personal Brand Website — vollständig selbst entwickelt. Eigenes Design-System, Framer Motion Animationen, Admin Dashboard für Seitenanalyse und ein Auftritt der zur Marke passt."
            tags={['React', 'TypeScript', 'Vite', 'SCSS', 'Tailwind CSS', 'Framer Motion']}
            href="https://candlescope.de"
            status="live"
          />
        </div>
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StaggerItem>
            <ProjectCard
              title="ShopRay"
              description="Vollständiger E-Commerce-Shop — React 19, TypeScript, Stripe, Supabase Auth mit 2FA, Admin Panel, DSGVO-konform. Production-ready."
              tags={['React', 'TypeScript', 'Express', 'Supabase', 'Stripe']}
              href="https://shopray-indol.vercel.app"
              status="live"
              locked
            />
          </StaggerItem>
          <StaggerItem>
            <ProjectCard
              title="Learn To Grow"
              description="Abschlussprojekt — Lernplattform Frontend mit React und modernem UI-Design."
              tags={['React', 'JavaScript', 'CSS']}
              href="https://learn-to-grow.onrender.com"
              githubHref="https://github.com/SchubertChris/Final-Project-Frontend"
              status="live"
            />
          </StaggerItem>
          <StaggerItem>
            <ProjectCard
              title="VaultBox"
              description="Professionelles Haushaltsbuch für Windows — vollständig offline, kein Abo, keine Cloud. Einmal kaufen, dauerhaft behalten."
              tags={['Electron', 'Vanilla JS', 'Chart.js', 'CSS']}
              status="wip"
              locked
            />
          </StaggerItem>
        </StaggerContainer>
      </SectionWrapper>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* ── GitHub Activity ──────────────────────────────── */}
      <SectionWrapper id="github">
        <SectionHeader
          eyebrow="GitHub Activity"
          title={<>Code <GradientText>jeden Tag</GradientText></>}
          description="Contributions, Repos, Follower — live von GitHub."
          className="mb-10"
        />
        <GitHubActivitySection username="SchubertChris" />
      </SectionWrapper>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* ── GitHub Repos ─────────────────────────────────── */}
      <SectionWrapper id="open-source">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <SectionHeader
              eyebrow="GitHub"
              title={<>Projekte auf <GradientText>GitHub</GradientText></>}
              description="Einige Projekte sind öffentlich einsehbar — von der ersten Portfolio-Version bis zum Abschlussprojekt."
              className="mb-8"
            />
            <CtaButton variant="primary" href="https://github.com/SchubertChris" external>
              GitHub ansehen
            </CtaButton>
          </div>

          <div className="rounded-xl border border-[var(--cs-border-w2)] bg-[var(--cs-s1)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--cs-border-w)]">
              <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--cs-text-3)]">Repositories</span>
            </div>
            <div className="divide-y divide-[var(--cs-border-w)]">
              {[
                {
                  name: 'Learn To Grow',
                  desc: 'Abschlussprojekt — Lernplattform Frontend mit React und modernem UI-Design.',
                  tags: ['React', 'JavaScript', 'CSS'],
                  href: 'https://github.com/SchubertChris/Final-Project-Frontend',
                  locked: false,
                },
                {
                  name: 'ShopRay',
                  desc: 'Vollständiger E-Commerce-Shop — Stripe, Supabase Auth, 2FA, Admin Panel. Production-ready.',
                  tags: ['React', 'TypeScript', 'Supabase', 'Stripe'],
                  href: null,
                  locked: true,
                },
              ].map((repo, i) => (
                <motion.div key={i} whileHover={{ x: 4 }} transition={{ duration: 0.2 }}
                  className="flex items-start gap-4 px-6 py-5 group">
                  <div className="w-8 h-8 rounded-lg border border-[#C9A84C]/20 bg-[#C9A84C]/5 flex items-center justify-center shrink-0 mt-0.5">
                    <Package size={14} strokeWidth={1.5} className="text-[#C9A84C]/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display text-sm text-[var(--cs-text)]">{repo.name}</span>
                      {repo.locked
                        ? <span className="flex items-center gap-1 font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--cs-text-3)] px-2 py-0.5 rounded-full border border-[var(--cs-border-w2)]"><Lock size={9} strokeWidth={1.5} /> Privat</span>
                        : <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--cs-text-2)] px-2 py-0.5 rounded-full border border-[#C9A84C]/20">Public</span>
                      }
                    </div>
                    <p className="text-[var(--cs-text-2)] text-[13px] leading-relaxed mb-2">{repo.desc}</p>
                    <div className="flex flex-wrap gap-1">
                      {repo.tags.map(t => (
                        <span key={t} className="font-mono text-[9px] tracking-[0.08em] px-1.5 py-0.5 rounded border border-[var(--cs-border-w)] text-[var(--cs-text-3)]">{t}</span>
                      ))}
                    </div>
                  </div>
                  {repo.href && (
                    <a href={repo.href} target="_blank" rel="noopener noreferrer"
                      className="text-[var(--cs-text-3)] hover:text-[#C9A84C] transition-colors shrink-0 mt-1 opacity-0 group-hover:opacity-100">
                      <ExternalLink size={13} strokeWidth={1.5} />
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </SectionWrapper>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* ── Freelance CTA ────────────────────────────────── */}
      <SectionWrapper id="freelance">
        <div className="relative rounded-2xl border border-[#C9A84C]/20 bg-gradient-to-br from-[var(--cs-s2)] to-[var(--cs-bg)] p-10 md:p-14 overflow-hidden">
          <motion.div
            className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00C896] animate-pulse" />
                <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#00C896]">Verfügbar für Projekte</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl text-[var(--cs-text)] leading-tight mb-4">
                Dein Projekt.<br /><GradientText>Mein Code.</GradientText>
              </h2>
              <p className="text-[var(--cs-text-2)] leading-relaxed mb-8">
                Du hast eine Idee — ich setze sie um. Website, Web-App oder komplettes Backend. Sauber entwickelt, pünktlich geliefert, technisch solid.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/contact">
                  <CtaButton variant="primary" href="/contact">Projekt anfragen</CtaButton>
                </Link>
                <a href="mailto:info@candlescope.de"
                  className="flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase text-[var(--cs-text-3)] hover:text-[var(--cs-text)] transition-colors duration-200 px-4">
                  info@candlescope.de <ArrowRight size={13} strokeWidth={1.5} />
                </a>
              </div>
            </div>
            <StaggerContainer className="flex flex-col gap-4">
              {[
                { icon: <Zap size={16} strokeWidth={1.5} />, title: 'Schnelle Umsetzung', desc: 'Kein endloses Briefing — klare Anforderungen, schneller Start.' },
                { icon: <Layers size={16} strokeWidth={1.5} />, title: 'Skalierbare Architektur', desc: 'Code der wächst — keine Quick-Fixes die später Probleme machen.' },
                { icon: <BookOpen size={16} strokeWidth={1.5} />, title: 'Saubere Dokumentation', desc: 'Du bekommst Code den du verstehst und selbst pflegen kannst.' },
                { icon: <Coffee size={16} strokeWidth={1.5} />, title: 'Direkte Kommunikation', desc: 'Kein Agentur-Overhead — du redest direkt mit dem Entwickler.' },
              ].map((item, i) => (
                <StaggerItem key={i}>
                  <div className="flex items-start gap-4 p-4 rounded-xl border border-[var(--cs-border-w)] bg-[var(--cs-backdrop)] hover:border-[#C9A84C]/15 transition-colors duration-200">
                    <div className="w-8 h-8 rounded-lg bg-[#C9A84C]/8 border border-[#C9A84C]/15 flex items-center justify-center shrink-0 text-[#C9A84C]/70">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-display text-sm text-[var(--cs-text)] mb-1">{item.title}</p>
                      <p className="text-[var(--cs-text-2)] text-[13px] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </SectionWrapper>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* ── Stats ────────────────────────────────────────── */}
      <SectionWrapper id="numbers" maxWidth="lg">
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {[
            { value: userData ? String(userData.public_repos) : '…', label: 'Repositories' },
            { value: userData ? String(userData.followers) : '…', label: 'Follower' },
            { value: '5', label: 'Projekte live' },
            { value: '13+', label: 'Jahre Praxiserfahrung' },
          ].map((s, i) => (
            <StaggerItem key={i}>
              <div className="flex flex-col gap-1">
                <span className="font-display text-4xl md:text-5xl text-[#C9A84C] leading-none">{s.value}</span>
                <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--cs-text-3)]">{s.label}</span>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </SectionWrapper>
      </div>
    </div>
  )
}