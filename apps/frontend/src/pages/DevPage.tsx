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
import { motion, useInView } from 'framer-motion'
import PageHero from '../components/ui/PageHero'
import {
  SectionWrapper, SectionHeader, GoldDivider,
  Card, CardIcon, GradientText, Badge, CtaButton, TagList,
} from '../components/ui'
import {
  Globe, Smartphone, Terminal, GitBranch,
  ExternalLink, Code2, Package, Zap, Users, ArrowRight,
  CheckCircle2, BookOpen, Layers, Coffee, Loader2, AlertCircle, Lock,
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
   PAGE
   ════════════════════════════════════════════════════════════════ */
export default function DevPage() {
  const STACK = ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Node.js', 'NestJS', 'PostgreSQL', 'Prisma', 'Docker', 'Nginx', 'Git', 'Linux']
  const userData = useGitHubUser('SchubertChris')

  return (
    <>
      <PageHero
        eyebrow="Fullstack Developer · Potsdam, DE"
        titleLine1="Von der Idee"
        titleLine2="zum Produkt."
        titleAccent="line2"
        description="Ich entwickle React-Apps, Desktop-Software und Backends die wirklich in Produktion gehen — sauber, schnell, wartbar. Aktuell verfügbar."
        badge="Open for work"
        theme="dev"
      >
        {/* Primär-CTA: Anfragen zuerst — das ist die Conversion */}
        <Link to="/contact"
          className="relative overflow-hidden group text-[11px] tracking-[0.18em] uppercase bg-[#C9A84C] text-[#080808] px-8 py-3.5 rounded-full font-semibold shadow-lg shadow-[#C9A84C]/25 hover:shadow-[#C9A84C]/40 transition-shadow duration-300">
          <span className="relative z-10">Projekt anfragen</span>
          <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full" />
        </Link>

        {/* Sekundär-CTA */}
        <a href="https://github.com/SchubertChris" target="_blank" rel="noopener noreferrer"
          className="relative overflow-hidden group text-[11px] tracking-[0.16em] uppercase border border-[var(--cs-text)]/20 text-[var(--cs-text)] px-7 py-3.5 rounded-full">
          <span className="relative z-10 group-hover:text-[#080808] transition-colors duration-300">GitHub ansehen</span>
          <span className="absolute inset-0 bg-[#C9A84C] rounded-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        </a>

        {/* Flagship-Strip: Glaubwürdigkeit durch echtes Shipped Product */}
        <div className="w-full pt-5 border-t border-[var(--cs-text)]/8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[9px] tracking-[0.16em] uppercase text-[var(--cs-text-3)]">Flagship</span>
            <span className="w-px h-3 bg-[var(--cs-text)]/12" />
            <Link to="/finance" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C9A84C]/6 border border-[#C9A84C]/30 hover:border-[#C9A84C]/50 hover:bg-[#C9A84C]/10 transition-all group">
              <div className="w-1 h-1 rounded-full bg-[#22c55e]" />
              <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--cs-text-2)] group-hover:text-[#C9A84C] transition-colors">FinanceBoard v10.6</span>
              <ArrowRight size={9} strokeWidth={1.5} className="text-[var(--cs-text-3)] group-hover:text-[#C9A84C] transition-colors" />
            </Link>
            <div className="flex items-center gap-2 ml-1">
              {['React', 'TypeScript', 'Electron', 'Node.js'].map(tag => (
                <span key={tag} className="font-mono text-[9px] px-2 py-0.5 rounded border border-[var(--cs-text)]/12 text-[var(--cs-text-2)]">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </PageHero>

      {/* ── Services ─────────────────────────────────────── */}
      <SectionWrapper id="services">
        <SectionHeader
          eyebrow="Was ich baue"
          title={<>Code der <GradientText>funktioniert</GradientText></>}
          description="Von der Landing Page bis zur komplexen Web-App — immer mit Fokus auf Performance, Design und Wartbarkeit."
          className="mb-14"
        />
        {/* StaggerContainer direkt — kein extra Wrapper */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: <Globe size={20} strokeWidth={1.5} />, title: 'Websites', desc: 'Schnelle, SEO-optimierte Websites mit modernem Design und echtem Mehrwert.' },
            { icon: <Smartphone size={20} strokeWidth={1.5} />, title: 'Web-Apps', desc: 'React-basierte Anwendungen — skalierbar, typsicher und production-ready.' },
            { icon: <Terminal size={20} strokeWidth={1.5} />, title: 'Backends', desc: 'NestJS APIs, PostgreSQL, Docker — solide Architektur für echte Anforderungen.' },
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
            description="Personal Brand Website mit eigenem CMS & Page Builder — vollständig selbst entwickelt. Modulares Block-System, Admin Panel mit Live-Editor, Framer Motion Animationen und ein Design das zur Marke passt."
            tags={['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Zustand', 'Framer Motion']}
            href="https://candlescope.de"
            githubHref="https://github.com/SchubertChris/Candlescope-Frontend"
            status="live"
          />
        </div>
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StaggerItem>
            <ProjectCard
              title="Candlescope Dark Purple"
              description="Neuere Portfolio-Website — React + Vite + TypeScript mit modernem Layout und Projektübersicht."
              tags={['React', 'TypeScript', 'Vite', 'SCSS']}
              href="https://candlescope-frontend.vercel.app/"
              githubHref="https://github.com/SchubertChris/Candlescope-Frontend"
              status="live"
            />
          </StaggerItem>
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
              title="Candlescope FinanceBoard"
              description="Vollständige Desktop-App für Windows. Offline-first, kein Framework, kein Cloud-Zwang."
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

      {/* ── Open Source ──────────────────────────────────── */}
      <SectionWrapper id="open-source">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <SectionHeader
              eyebrow="Open Source"
              title={<>Code der <GradientText>geteilt wird</GradientText></>}
              description="CandleScope.de ist offen einsehbar — der Code hinter der Website ist auf GitHub verfügbar."
              className="mb-8"
            />
            <StaggerContainer className="flex flex-col gap-3 mb-8">
              {[
                'Vollständig auf GitHub einsehbar',
                'Issues und Feedback willkommen',
                'Sauber strukturiert und dokumentiert',
              ].map((item, i) => (
                <StaggerItem key={i}>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={15} strokeWidth={1.5} className="text-[#00C896] shrink-0 mt-0.5" />
                    <span className="text-[var(--cs-text-2)] text-sm">{item}</span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
            <CtaButton variant="primary" href="https://github.com/SchubertChris" external>
              GitHub ansehen
            </CtaButton>
          </div>

          <div className="rounded-xl border border-[var(--cs-border-w2)] bg-[var(--cs-s1)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--cs-border-w)]">
              <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--cs-text-3)]">Open Source</span>
            </div>
            <div className="px-6">
              <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}
                className="flex items-start gap-4 py-5 group">
                <div className="w-8 h-8 rounded-lg border border-[#C9A84C]/20 bg-[#C9A84C]/5 flex items-center justify-center shrink-0 mt-0.5">
                  <Package size={14} strokeWidth={1.5} className="text-[#C9A84C]/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display text-sm text-[var(--cs-text)]">CandleScope Frontend</span>
                    <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--cs-text-2)] px-2 py-0.5 rounded-full border border-[#C9A84C]/20">Author</span>
                  </div>
                  <p className="text-[var(--cs-text-2)] text-[13px] leading-relaxed">
                    Personal Brand Website mit eigenem Page Builder — React, TypeScript, Vite, Tailwind, Zustand.
                  </p>
                </div>
                <a href="https://github.com/SchubertChris/Candlescope-Frontend" target="_blank" rel="noopener noreferrer"
                  className="text-[var(--cs-text-3)] hover:text-[#C9A84C] transition-colors shrink-0 mt-1 opacity-0 group-hover:opacity-100">
                  <ExternalLink size={13} strokeWidth={1.5} />
                </a>
              </motion.div>
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
                <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#00C896]">Open for work</span>
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
            { value: '13+', label: 'Jahre Service-Erfahrung' },
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
    </>
  )
}