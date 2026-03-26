/* ============================================================
   CandleScope — GitHub Activity Section (Live)
   src/components/sections/GitHubActivity.tsx

   Verwendung in DevPage:
     import GitHubActivity from '../components/sections/GitHubActivity'
     ...
     <GitHubActivity username="SchubertChris" />
   ============================================================ */
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { GitBranch, Star, Code2, Users, ExternalLink, AlertCircle, Loader2 } from 'lucide-react'
import { useGitHubContributions, type ContributionDay } from '../../hooks/useGitHubContributions'

/* ── Reveal helper (lokal) ──────────────────────────────────── */
function Reveal({ children, delay = 0, className }: {
  children: React.ReactNode; delay?: number; className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] as const }}
      className={className}>
      {children}
    </motion.div>
  )
}

/* ── Single contribution square ─────────────────────────────── */
function Square({ day }: { day: ContributionDay }) {
  const bg = [
    'bg-[#ffffff]/5',
    'bg-[#C9A84C]/20',
    'bg-[#C9A84C]/40',
    'bg-[#C9A84C]/65',
    'bg-[#C9A84C]',
  ][day.level]

  return (
    <motion.div
      className={`w-3 h-3 rounded-sm ${bg} cursor-default`}
      whileHover={{ scale: 1.5, zIndex: 10 }}
      transition={{ duration: 0.12 }}
      title={`${day.date}: ${day.count} Contribution${day.count !== 1 ? 's' : ''}`}
    />
  )
}

/* ── Skeleton loader ─────────────────────────────────────────── */
function Skeleton() {
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

/* ── Stat Pill ───────────────────────────────────────────────── */
function StatPill({ icon, value, label }: {
  icon: React.ReactNode; value: string; label: string
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border border-[#ffffff]/8 rounded-full bg-[#0d0d0d]">
      <span className="text-[#C9A84C]/70">{icon}</span>
      <span className="font-display text-base text-[#F5F0E8]">{value}</span>
      <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#5a5550]">{label}</span>
    </div>
  )
}

/* ── Month labels aus echten Daten ──────────────────────────── */
function monthLabels(contributions: ContributionDay[]): string[] {
  const labels: string[] = []
  let lastMonth = -1
  // 52 Wochen, pro Woche nur die erste gefundene Date prüfen
  for (let w = 0; w < 52; w++) {
    const day = contributions[w * 7]
    if (!day) { labels.push(''); continue }
    const month = new Date(day.date).getMonth()
    if (month !== lastMonth) {
      const names = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez']
      labels.push(names[month])
      lastMonth = month
    } else {
      labels.push('')
    }
  }
  return labels
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════ */
interface GitHubActivityProps {
  username: string
  /** Echte Repo-Stats (optional, aus GitHub REST API oder manuell) */
  stats?: { commits: string; stars: string; repos: string; followers: string }
}

const DEFAULT_STATS = {
  commits:   '400+',
  stars:     '56',
  repos:     '12',
  followers: '8',
}

export default function GitHubActivity({ username, stats = DEFAULT_STATS }: GitHubActivityProps) {
  const { data, status } = useGitHubContributions(username)

  // Contributions auf 52×7 = 364 Felder normieren
  const contributions: ContributionDay[] = data?.contributions.slice(-364) ?? []

  // Jahres-Total aus den echten Daten
  const yearKey = Object.keys(data?.total ?? {}).sort().at(-1)
  const totalThisYear = yearKey ? data!.total[yearKey] : null

  // Weeks-Grid aufbauen
  const weeks: ContributionDay[][] = []
  for (let w = 0; w < 52; w++) {
    const slice = contributions.slice(w * 7, w * 7 + 7)
    // padding falls weniger als 7 Tage
    while (slice.length < 7) slice.push({ date: '', count: 0, level: 0 })
    weeks.push(slice)
  }

  const labels = contributions.length ? monthLabels(contributions) : []

  return (
    <>
      {/* Stats Pills */}
      <Reveal delay={0.1} className="mb-8">
        <div className="flex flex-wrap gap-3">
          <StatPill icon={<GitBranch size={14} strokeWidth={1.5} />}
            value={totalThisYear ? `${totalThisYear}` : stats.commits}
            label="Contributions / Jahr" />
          <StatPill icon={<Star size={14} strokeWidth={1.5} />}
            value={stats.stars} label="Stars gesamt" />
          <StatPill icon={<Code2 size={14} strokeWidth={1.5} />}
            value={stats.repos} label="Repositories" />
          <StatPill icon={<Users size={14} strokeWidth={1.5} />}
            value={stats.followers} label="Follower" />
        </div>
      </Reveal>

      {/* Contribution Graph Card */}
      <Reveal delay={0.2}>
        <div className="rounded-xl border border-[#ffffff]/8 bg-[#0d0d0d] p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#5a5550]">
                Contribution Graph
              </span>
              {status === 'loading' && (
                <Loader2 size={12} strokeWidth={1.5} className="text-[#5a5550] animate-spin" />
              )}
              {status === 'success' && totalThisYear && (
                <span className="font-mono text-[10px] text-[#C9A84C]/50">
                  {totalThisYear} in {yearKey}
                </span>
              )}
              {status === 'error' && (
                <span className="flex items-center gap-1 font-mono text-[10px] text-[#FF4444]/60">
                  <AlertCircle size={11} strokeWidth={1.5} />
                  API nicht erreichbar
                </span>
              )}
            </div>
            <a href={`https://github.com/${username}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.1em] uppercase text-[#C9A84C]/60 hover:text-[#C9A84C] transition-colors">
              GitHub <ExternalLink size={11} strokeWidth={1.5} />
            </a>
          </div>

          {/* Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              {/* Month labels */}
              {labels.length > 0 && (
                <div className="flex gap-1 mb-1">
                  {labels.map((label, i) => (
                    <div key={i} className="flex-1 font-mono text-[9px] text-[#5a5550] tracking-[0.1em] truncate">
                      {label}
                    </div>
                  ))}
                </div>
              )}

              {/* Squares or Skeleton */}
              {status === 'loading' || contributions.length === 0
                ? <Skeleton />
                : (
                  <motion.div
                    className="flex gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    {weeks.map((week, wi) => (
                      <div key={wi} className="flex flex-col gap-1">
                        {week.map((day, di) => (
                          <Square key={di} day={day} />
                        ))}
                      </div>
                    ))}
                  </motion.div>
                )
              }

              {/* Legend */}
              <div className="flex items-center gap-2 mt-3 justify-end">
                <span className="font-mono text-[9px] text-[#5a5550]">Weniger</span>
                {([0, 1, 2, 3, 4] as const).map((l) => (
                  <div key={l} className={`w-3 h-3 rounded-sm ${['bg-[#ffffff]/5','bg-[#C9A84C]/20','bg-[#C9A84C]/40','bg-[#C9A84C]/65','bg-[#C9A84C]'][l]}`} />
                ))}
                <span className="font-mono text-[9px] text-[#5a5550]">Mehr</span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </>
  )
}