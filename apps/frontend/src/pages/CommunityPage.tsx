/* ============================================================
   CandleScope — Community Page
   src/pages/CommunityPage.tsx
   ============================================================ */
import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import PageHero from '../components/ui/PageHero'
import {
  SectionWrapper, SectionHeader, GoldDivider,
  Card, CardIcon, GradientText, CtaButton, TagList,
} from '../components/ui'
import {
  MessageSquare, TrendingUp,
  Shield, BarChart2, Code2, Video,
  CheckCircle2, ArrowRight, Volume2, Terminal, Zap, GitBranch,
} from 'lucide-react'

/* ── Discord Invite Hook ─────────────────────────────────── */
interface DiscordInvite {
  approximate_member_count: number
  approximate_presence_count: number
  guild: { name: string; description: string | null }
}

function useDiscordInvite(code: string) {
  const [data, setData] = useState<DiscordInvite | null>(null)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  useEffect(() => {
    fetch(`https://discord.com/api/v9/invites/${code}?with_counts=true`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() as Promise<DiscordInvite> })
      .then(d => { setData(d); setStatus('success') })
      .catch(() => setStatus('error'))
  }, [code])
  return { data, status }
}

/* ── Animation helpers ───────────────────────────────────── */
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

function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}>
      {children}
    </motion.div>
  )
}

/* ── Stat Card ───────────────────────────────────────────── */
function StatCard({ value, label, sub, loading }: {
  value: string; label: string; sub?: string; loading?: boolean
}) {
  return (
    <div className="flex flex-col gap-1 p-6 rounded-xl border border-[#ffffff]/8 bg-[var(--cs-s1)]">
      {loading
        ? <div className="w-16 h-8 rounded bg-[#ffffff]/10 animate-pulse mb-1" />
        : <span className="font-display text-4xl text-[#C9A84C] leading-none">{value}</span>
      }
      <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--cs-text)]">{label}</span>
      {sub && <span className="font-mono text-[10px] text-[var(--cs-text-3)]">{sub}</span>}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   DISCORD SERVER PREVIEW — animiert, versetzt, mit Emojis
════════════════════════════════════════════════════════════ */
const DISCORD_STRUCTURE = [
  {
    name: '| START',
    emoji: '📌',
    channels: [
      { name: 'willkommen', emoji: '👋', type: 'text' },
      { name: 'regeln', emoji: '📋', type: 'text' },
      { name: 'forum', emoji: '💬', type: 'forum' },
      { name: 'neues', emoji: '🆕', type: 'text' },
    ],
  },
  {
    name: '| Community',
    emoji: '💡',
    channels: [
      { name: 'global', emoji: '🌍', type: 'text' },
      { name: 'long', emoji: '📈', type: 'text' },
      { name: 'short', emoji: '📉', type: 'text' },
      { name: 'setups', emoji: '🎯', type: 'text' },
      { name: 'scam-alarm', emoji: '🚨', type: 'text' },
    ],
  },
  {
    name: '| Anlage & Vorsorge',
    emoji: '💰',
    channels: [
      { name: 'aktien', emoji: '📊', type: 'text' },
      { name: 'anleihen', emoji: '🏦', type: 'text' },
      { name: 'depotvorstellung', emoji: '💼', type: 'text' },
      { name: 'devisen', emoji: '💱', type: 'text' },
      { name: 'exchange-traded-funds', emoji: '📦', type: 'text' },
      { name: 'rohstoffe', emoji: '🪙', type: 'text' },
    ],
  },
  {
    name: '| Coding & Tech',
    emoji: '💻',
    channels: [
      { name: 'webdev', emoji: '🌐', type: 'text' },
      { name: 'trading-bots', emoji: '🤖', type: 'text' },
      { name: 'automatisierung', emoji: '⚡', type: 'text' },
      { name: 'code-review', emoji: '🔍', type: 'forum' },
      { name: 'tools', emoji: '🛠️', type: 'text' },
    ],
  },
  {
    name: '| Speak',
    emoji: '🎙️',
    channels: [
      { name: 'CandleScope |', emoji: '', type: 'voice' },
      { name: 'CandleScope ||', emoji: '', type: 'voice' },
      { name: 'CandleScope |||', emoji: '', type: 'voice' },
    ],
  },
]

function ServerPreview() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  const [activeChannel, setActiveChannel] = useState('global')

  // Flatten all channels for delay calculation
  let globalDelay = 0.3

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-[#C9A84C]/15 bg-[var(--cs-s1)] overflow-hidden shadow-2xl shadow-black/60"
    >
      {/* Gold top bar */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />

      {/* Server Header */}
      <div className="px-4 py-3 border-b border-[#ffffff]/6 flex items-center justify-between bg-[var(--cs-input)]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/25 flex items-center justify-center">
            <span className="text-[10px] font-bold text-[#C9A84C]">CS</span>
          </div>
          <span className="font-display text-sm text-[var(--cs-text)] tracking-[0.1em]">CANDLESCOPE</span>
        </div>
        <motion.div className="flex items-center gap-1.5"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}>
          <motion.div className="w-2 h-2 rounded-full bg-[#00C896]"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity }} />
          <span className="font-mono text-[9px] text-[var(--cs-text-3)]">online</span>
        </motion.div>
      </div>

      {/* Channel list */}
      <div className="p-3 max-h-80 overflow-y-auto scrollbar-thin">
        {DISCORD_STRUCTURE.map((cat) => (
          <div key={cat.name} className="mb-3">
            {/* Category header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: globalDelay - 0.1 }}
              className="flex items-center gap-1.5 px-2 mb-1"
            >
              <span className="text-[10px]">{cat.emoji}</span>
              <span className="font-mono text-[9px] tracking-[0.14em] text-[var(--cs-text-3)] uppercase">{cat.name}</span>
            </motion.div>

            {/* Channels — each with increasing delay */}
            {cat.channels.map((ch) => {
              const d = globalDelay
              // eslint-disable-next-line react-hooks/immutability
              globalDelay += 0.06
              return (
                <div key={ch.name} onClick={() => setActiveChannel(ch.name)}>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: d, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className={`flex items-center gap-2 px-2 py-[5px] rounded-md transition-colors cursor-pointer group ${activeChannel === ch.name
                        ? 'bg-[#C9A84C]/12 text-[#C9A84C]'
                        : 'hover:bg-[#ffffff]/5'
                      }`}
                  >
                    {ch.type === 'voice' ? (
                      <Volume2 size={12} strokeWidth={1.5} className="text-[var(--cs-text-3)] group-hover:text-[var(--cs-text-2)] shrink-0" />
                    ) : ch.type === 'forum' ? (
                      <span className="font-mono text-[11px] text-[var(--cs-text-3)]">≡</span>
                    ) : (
                      <span className="font-mono text-[12px] text-[var(--cs-text-3)] group-hover:text-[var(--cs-text-2)]">#</span>
                    )}
                    {ch.emoji && <span className="text-[11px]">{ch.emoji}</span>}
                    <span className={`font-mono text-[11px] truncate transition-colors ${activeChannel === ch.name
                        ? 'text-[#C9A84C]'
                        : 'text-[#6a6460] group-hover:text-[var(--cs-text)]'
                      }`}>
                      {ch.name}
                    </span>
                    {activeChannel === ch.name && (
                      <motion.div layoutId="activeIndicator"
                        className="ml-auto w-1 h-4 rounded-full bg-[#C9A84C]" />
                    )}
                  </motion.div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Bottom online bar */}
      <div className="px-4 py-3 border-t border-[#ffffff]/6 bg-[var(--cs-input)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/30 flex items-center justify-center">
            <span className="text-[8px] font-bold text-[#C9A84C]">CS</span>
          </div>
          <div>
            <p className="font-mono text-[9px] text-[var(--cs-text)]">Chris Schubert</p>
            <p className="font-mono text-[8px] text-[var(--cs-text-3)]">👑 Admin</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00C896]" />
          <span className="font-mono text-[9px] text-[var(--cs-text-3)]">online</span>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent" />
    </motion.div>
  )
}

/* ── Waitlist Form ────────────────────────────────────────── */
function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) { setStatus('error'); return }
    setStatus('success')
    setEmail('')
  }

  return (
    <div className="rounded-xl border border-[#C9A84C]/20 bg-gradient-to-br from-[var(--cs-s2)] to-[var(--cs-bg)] p-8">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--cs-text-2)]">Early Access</span>
      </div>
      <h3 className="font-display text-xl text-[var(--cs-text)] mb-2">
        Sei dabei wenn es <GradientText>richtig losgeht</GradientText>
      </h3>
      <p className="text-[var(--cs-text-2)] text-sm leading-relaxed mb-6">
        Trag dich ein und erhalte als Erstes Zugang zu exklusiven Features, Member-only Inhalten und Live-Events.
      </p>
      {status === 'success' ? (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-[#00C896]/20 bg-[#00C896]/5">
          <CheckCircle2 size={18} strokeWidth={1.5} className="text-[#00C896] shrink-0" />
          <span className="text-sm text-[var(--cs-text)]">Du bist auf der Liste — wir melden uns!</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="deine@email.de"
            className={`flex-1 px-4 py-3 rounded-xl bg-[var(--cs-bg)] border text-sm text-[var(--cs-text)] placeholder-[var(--cs-text-3)] outline-none transition-colors ${status === 'error' ? 'border-[#FF4444]/50' : 'border-[#ffffff]/10 focus:border-[#C9A84C]/40'
              }`} />
          <button type="submit"
            className="relative overflow-hidden group px-6 py-3 rounded-xl border border-[#C9A84C]/35 text-[11px] tracking-[0.14em] uppercase text-[#C9A84C] whitespace-nowrap">
            <span className="relative z-10 group-hover:text-[#080808] transition-colors duration-300">Eintragen</span>
            <span className="absolute inset-0 bg-[#C9A84C] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-xl" />
          </button>
        </form>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════ */
const INVITE_CODE = 'HRxbTW4ujT'

const FEATURES = [
  { icon: <TrendingUp size={20} strokeWidth={1.5} />, title: 'Trading Setups & Signale', desc: 'Täglich frische Setups, Entry-Punkte und Marktanalysen von der Community.' },
  { icon: <Video size={20} strokeWidth={1.5} />, title: 'Live Q&A Sessions', desc: 'Regelmäßige Live-Sessions mit Chart-Analysen, Fragen und direktem Austausch.' },
  { icon: <Shield size={20} strokeWidth={1.5} />, title: 'Scam-Alarm & Warnungen', desc: 'Community-geprüfte Warnungen vor Betrug, Pump & Dump und unseriösen Angeboten.' },
  { icon: <BarChart2 size={20} strokeWidth={1.5} />, title: 'Depot-Vorstellungen', desc: 'Zeig dein Portfolio, hol dir Feedback und lern von den Strategien anderer.' },
  { icon: <Code2 size={20} strokeWidth={1.5} />, title: 'Webdev & Open Source', desc: 'React, TypeScript, APIs — Code-Austausch, Reviews und gemeinsame Projekte mit anderen Entwicklern.' },
  { icon: <Terminal size={20} strokeWidth={1.5} />, title: 'Trading Bots & Automatisierung', desc: 'Eigene Bots bauen, Strategien automatisieren, Broker-APIs nutzen — von der Idee bis zur Umsetzung.' },
  { icon: <MessageSquare size={20} strokeWidth={1.5} />, title: 'Gemeinsame Chartanalysen', desc: 'Technische Analyse im Team — mehrere Augen sehen mehr als eines.' },
]

export default function CommunityPage() {
  const { data: discord, status: discordStatus } = useDiscordInvite(INVITE_CODE)
  const memberCount = discord?.approximate_member_count
  const onlineCount = discord?.approximate_presence_count

  return (
    <>
      <PageHero
        eyebrow="Candlescope Community · Discord"
        titleLine1="Finanzen lernen."
        titleLine2="Gemeinsam."
        titleAccent="line1"
        description="Trading · Chartanalysen · Dev & Automatisierung — eine aktive Community ohne Bullshit. Kein Schnellreich-werden-Versprechen, nur ehrlicher Austausch."
        badge="Jetzt live"
        theme="community"
      >
        {/* Primär-CTA: Discord-Join ist die einzige Conversion hier */}
        <a href={`https://discord.gg/${INVITE_CODE}`} target="_blank" rel="noopener noreferrer"
          className="relative overflow-hidden group text-[11px] tracking-[0.18em] uppercase bg-[#C9A84C] text-[#080808] px-8 py-3.5 rounded-full font-semibold shadow-lg shadow-[#C9A84C]/25 hover:shadow-[#C9A84C]/40 transition-shadow duration-300">
          <span className="relative z-10">Discord beitreten</span>
          <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full" />
        </a>

        {/* Sekundär-CTA */}
        <a href="#features"
          className="text-[11px] tracking-[0.16em] uppercase text-[var(--cs-text-3)] hover:text-[var(--cs-text)] transition-colors duration-300 flex items-center gap-2 group">
          Was dich erwartet
          <span className="w-4 h-px bg-current transition-transform duration-300 group-hover:scale-x-[1.5] origin-left" />
        </a>

        {/* Live-Status + Tool-Tipp */}
        <div className="w-full pt-5 border-t border-[#C9A84C]/8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
              <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--cs-text-4)]">
                {memberCount ? `${memberCount} Member` : 'Server aktiv'}
              </span>
            </div>
            <span className="w-px h-3 bg-[#C9A84C]/12" />
            <Link to="/finance"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C9A84C]/5 border border-[#C9A84C]/20 hover:border-[#C9A84C]/40 hover:bg-[#C9A84C]/8 transition-colors group">
              <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--cs-text-2)] group-hover:text-[#C9A84C] transition-colors">FinanceBoard · Gratis</span>
              <ArrowRight size={9} strokeWidth={1.5} className="text-[var(--cs-text-3)] group-hover:text-[#C9A84C] transition-colors" />
            </Link>
            <span className="font-mono text-[9px] text-[var(--cs-text-4)]">100% offline · kein Abo</span>
          </div>
        </div>
      </PageHero>

      {/* Stats */}
      <SectionWrapper id="stats" maxWidth="lg">
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StaggerItem><StatCard value={memberCount ? String(memberCount) : '—'} label="Member" sub="gesamt" loading={discordStatus === 'loading'} /></StaggerItem>
          <StaggerItem><StatCard value={onlineCount ? String(onlineCount) : '—'} label="Online" sub="gerade aktiv" loading={discordStatus === 'loading'} /></StaggerItem>
          <StaggerItem><StatCard value="6" label="Kategorien" sub="im Server" /></StaggerItem>
          <StaggerItem><StatCard value="24/7" label="Aktiv" sub="immer offen" /></StaggerItem>
        </StaggerContainer>
      </SectionWrapper>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* ── Kein Bullshit ──────────────────────────────────── */}
      <SectionWrapper>
        <Reveal>
          <div className="relative rounded-3xl border border-[#C9A84C]/15 overflow-hidden p-10 md:p-14 text-center">
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 65%)' }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="relative">
              <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#C9A84C]/70 mb-4">Was wir nicht sind</p>
              <h2 className="font-display text-2xl md:text-4xl text-[var(--cs-text)] leading-tight mb-8">
                Kein Hype. Keine Versprechen.<br />
                <GradientText>Nur ehrlicher Austausch.</GradientText>
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {[
                  '✗ Keine bezahlten Signale',
                  '✗ Kein Pump & Dump',
                  '✗ Kein Coaching-Bullshit',
                ].map((item, i) => (
                  <span key={i} className="px-5 py-2 rounded-full border border-[var(--cs-border-w)] bg-[var(--cs-s1)] font-mono text-[11px] tracking-[0.08em] text-[var(--cs-text-2)]">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </SectionWrapper>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* Features */}
      <SectionWrapper id="features">
        <SectionHeader
          eyebrow="Was dich erwartet"
          title={<>Mehr als nur <GradientText>ein Server</GradientText></>}
          description="Eine aktive Community rund um Trading, Finanzen und Tech — mit echtem Mehrwert."
          className="mb-14"
        />
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <StaggerItem key={i}>
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="h-full">
                <Card variant="elevated" className="h-full">
                  <CardIcon>{f.icon}</CardIcon>
                  <h3 className="font-display text-lg text-[var(--cs-text)] mb-2">{f.title}</h3>
                  <p className="text-[var(--cs-text-2)] text-sm leading-relaxed">{f.desc}</p>
                </Card>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </SectionWrapper>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* ── Für wen? ───────────────────────────────────────── */}
      <SectionWrapper id="audience">
        <SectionHeader
          eyebrow="Für wen?"
          title={<>Ein Server — <GradientText>drei Communities</GradientText></>}
          description="Ob du tradest, codest oder beides — hier findest du Leute die auf demselben Weg sind."
          className="mb-14"
        />
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              emoji: '📈',
              label: 'Trader & Investor',
              desc: 'Du willst nicht allein traden. Chart-Austausch, Setups, Marktanalysen — und jemand der dich auf Bullshit hinweist.',
              tags: ['Setups', 'Chartanalyse', 'Depot', 'ETFs'],
              href: '#features',
            },
            {
              emoji: '💻',
              label: 'Developer',
              desc: 'Du baust Trading-Bots, automatisierst Strategien oder entwickelst Web-Apps. Hier findest du Gleichgesinnte und echte Code-Reviews.',
              tags: ['Bots', 'APIs', 'TypeScript', 'Open Source'],
              href: '#dev',
            },
            {
              emoji: '🌱',
              label: 'Einsteiger',
              desc: 'Du willst Finanzen verstehen — ohne Hype, ohne Schnellreich-werden-Versprechen. Einfach lernen, Fragen stellen, wachsen.',
              tags: ['Grundlagen', 'ETF-Start', 'Budgetplanung', 'FinanceBoard'],
              href: '#features',
            },
          ].map((card, i) => (
            <StaggerItem key={i}>
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="h-full">
                <div className="h-full flex flex-col gap-4 p-6 rounded-2xl border border-[var(--cs-border-w)] bg-[var(--cs-s1)] hover:border-[#C9A84C]/25 hover:bg-[#C9A84C]/3 transition-colors duration-300">
                  <span className="text-3xl">{card.emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-display text-lg text-[var(--cs-text)] mb-2">{card.label}</h3>
                    <p className="text-[var(--cs-text-2)] text-sm leading-relaxed">{card.desc}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {card.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-1 rounded-full bg-[#C9A84C]/6 border border-[#C9A84C]/15 font-mono text-[10px] tracking-[0.08em] text-[var(--cs-text-3)]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <a href={card.href} className="flex items-center gap-2 text-[11px] tracking-[0.1em] uppercase text-[var(--cs-text-2)] hover:text-[#C9A84C] transition-colors group">
                    Mehr sehen <ArrowRight size={12} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </SectionWrapper>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* Server Preview */}
      <SectionWrapper id="server">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <SectionHeader
              eyebrow="Discord Server"
              title={<>Dein neues <GradientText>Trading Zuhause</GradientText></>}
              description="Strukturiert, klar und auf das Wesentliche fokussiert — Channels für jeden Bereich."
              className="mb-8"
            />
            <StaggerContainer className="flex flex-col gap-3 mb-8">
              {[
                { icon: '📈', text: 'Trading Setups · Long & Short Channels' },
                { icon: '💰', text: 'Anlage & Vorsorge — Aktien · ETFs · Devisen · Rohstoffe' },
                { icon: '🚨', text: 'Scam-Alarm für die Community' },
                { icon: '🎙️', text: '3 Voice Channels für Live-Sessions' },
                { icon: '💻', text: 'Coding & Tech — Bots · Webdev · Automatisierung' },
                { icon: '🛡️', text: 'Organisierte Moderationsstruktur' },
              ].map((item, i) => (
                <StaggerItem key={i}>
                  <div className="flex items-start gap-3">
                    <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
                    <span className="text-[var(--cs-text-2)] text-sm">{item.text}</span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
            <a href={`https://discord.gg/${INVITE_CODE}`} target="_blank" rel="noopener noreferrer">
              <CtaButton variant="primary" href={`https://discord.gg/${INVITE_CODE}`} external>
                Jetzt beitreten
              </CtaButton>
            </a>
          </div>
          <ServerPreview />
        </div>
      </SectionWrapper>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* Tags */}
      <SectionWrapper id="topics">
        <SectionHeader
          eyebrow="Themen"
          title={<>Worüber wir <GradientText>reden</GradientText></>}
          className="mb-10"
        />
        <div className="flex flex-col gap-6">
          <div>
            <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--cs-text-3)] mb-3">Finanzen & Trading</p>
            <TagList tags={['Aktien', 'ETFs', 'Krypto', 'Devisen', 'Rohstoffe', 'Anleihen', 'Technische Analyse', 'Fundamental', 'Trading Psychology', 'Depot-Aufbau', 'DeFi', 'Options', 'Futures']} />
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--cs-text-3)] mb-3">Dev & Tech</p>
            <TagList tags={['React', 'TypeScript', 'Node.js', 'Express.js', 'Supabase', 'REST APIs', 'Trading Bots', 'Automatisierung', 'Web Scraping', 'Open Source', 'Code Review']} />
          </div>
        </div>
      </SectionWrapper>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* Dev & Tech Hub */}
      <SectionWrapper id="dev">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <SectionHeader
              eyebrow="Coding Community"
              title={<>Nicht nur <GradientText>Trader</GradientText></>}
              description="Ein eigener Bereich für Entwickler — egal ob du Trading-Bots baust, Web-Apps entwickelst oder einfach Gleichgesinnte suchst."
              className="mb-8"
            />
            <StaggerContainer className="flex flex-col gap-3 mb-8">
              {[
                { icon: <Terminal size={14} strokeWidth={1.5} />, text: 'Trading Bots & Broker-API Integration' },
                { icon: <Code2    size={14} strokeWidth={1.5} />, text: 'Code Reviews & gemeinsame Projekte' },
                { icon: <Zap      size={14} strokeWidth={1.5} />, text: 'Automatisierung von Strategien & Workflows' },
                { icon: <GitBranch size={14} strokeWidth={1.5} />, text: 'Open Source Tools für Trader & Entwickler' },
              ].map((item, i) => (
                <StaggerItem key={i}>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg border border-[#C9A84C]/20 bg-[#C9A84C]/5 flex items-center justify-center shrink-0 text-[#C9A84C]/70">
                      {item.icon}
                    </div>
                    <span className="text-[var(--cs-text-2)] text-sm">{item.text}</span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
            <a href={`https://discord.gg/${INVITE_CODE}`} target="_blank" rel="noopener noreferrer">
              <CtaButton variant="primary" href={`https://discord.gg/${INVITE_CODE}`} external>
                Dev-Channel betreten
              </CtaButton>
            </a>
          </div>

          {/* Code-Snippet Mockup */}
          <div className="rounded-2xl border border-[#C9A84C]/15 bg-[var(--cs-s1)] overflow-hidden shadow-2xl shadow-black/40">
            <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C]/30 to-transparent" />
            <div className="px-4 py-3 border-b border-[#ffffff]/6 flex items-center gap-2 bg-[var(--cs-input)]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
              </div>
              <span className="font-mono text-[10px] text-[var(--cs-text-3)] ml-2">trading-bot.ts</span>
            </div>
            <div className="p-5 font-mono text-[12px] leading-relaxed">
              <div className="text-[#C9A84C]/60"><span className="text-[var(--cs-text-3)]">// 📌 #trading-bots Channel</span></div>
              <div className="mt-2">
                <span className="text-[#7dd3fc]">const</span>
                <span className="text-[var(--cs-text)]"> bot </span>
                <span className="text-[#C9A84C]">=</span>
                <span className="text-[#7dd3fc]"> new</span>
                <span className="text-[#86efac]"> TradingBot</span>
                <span className="text-[var(--cs-text-3)]">{'({'}</span>
              </div>
              <div className="ml-4 text-[var(--cs-text-2)]">
                <div><span className="text-[#fca5a5]">symbol</span><span className="text-[var(--cs-text-3)]">: </span><span className="text-[#86efac]">'BTC/USDT'</span><span className="text-[var(--cs-text-3)]">,</span></div>
                <div><span className="text-[#fca5a5]">strategy</span><span className="text-[var(--cs-text-3)]">: </span><span className="text-[#86efac]">'RSI + EMA'</span><span className="text-[var(--cs-text-3)]">,</span></div>
                <div><span className="text-[#fca5a5]">interval</span><span className="text-[var(--cs-text-3)]">: </span><span className="text-[#86efac]">'1h'</span><span className="text-[var(--cs-text-3)]">,</span></div>
              </div>
              <div className="text-[var(--cs-text-3)]">{'})'}</div>
              <div className="mt-3">
                <span className="text-[#7dd3fc]">await</span>
                <span className="text-[var(--cs-text)]"> bot</span>
                <span className="text-[#C9A84C]">.</span>
                <span className="text-[#86efac]">start</span>
                <span className="text-[var(--cs-text-3)]">()</span>
              </div>
              <div className="mt-4 pt-4 border-t border-[#ffffff]/6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00C896] animate-pulse" />
                <span className="text-[#00C896] text-[10px]">Running — 3 community members online im Channel</span>
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* ── Live Chat Mockup ────────────────────────────────── */}
      <SectionWrapper id="activity">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <SectionHeader
              eyebrow="Live Austausch"
              title={<>So klingt die <GradientText>Community</GradientText></>}
              description="Kein Marketing-Script. Das sind echte Gespräche — Setups, Code, Fragen und Antworten."
              className="mb-8"
            />
            <StaggerContainer className="flex flex-col gap-3 mb-8">
              {[
                { emoji: '💬', text: 'Täglich aktiver Austausch in mehreren Channels' },
                { emoji: '🔥', text: 'Setup-Sharing mit echtem Community-Feedback' },
                { emoji: '🤝', text: 'Direkte Antworten statt Copy-Paste-Boilerplate' },
                { emoji: '⚡', text: 'Trading-Bots die live in der Community gebaut werden' },
              ].map((item, i) => (
                <StaggerItem key={i}>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{item.emoji}</span>
                    <span className="text-[var(--cs-text-2)] text-sm">{item.text}</span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
            <a href={`https://discord.gg/${INVITE_CODE}`} target="_blank" rel="noopener noreferrer">
              <CtaButton variant="primary" href={`https://discord.gg/${INVITE_CODE}`} external>
                Jetzt beitreten
              </CtaButton>
            </a>
          </div>

          {/* Discord Chat Mockup */}
          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-[#C9A84C]/15 bg-[var(--cs-s1)] overflow-hidden shadow-2xl shadow-black/40">
              <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C]/30 to-transparent" />
              <div className="px-4 py-3 border-b border-[#ffffff]/6 bg-[var(--cs-input)] flex items-center gap-2">
                <span className="font-mono text-[12px] text-[var(--cs-text-3)]">#</span>
                <span className="font-mono text-[11px] text-[var(--cs-text-2)]">setups</span>
                <div className="ml-auto flex items-center gap-1.5">
                  <motion.div className="w-1.5 h-1.5 rounded-full bg-[#00C896]"
                    animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                  <span className="font-mono text-[9px] text-[var(--cs-text-4)]">live</span>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-5">
                {[
                  {
                    avatar: 'AT', color: '#5865F2',
                    name: 'Alex_T.', time: 'Heute 09:42',
                    text: 'BTC Setup läuft — Einstieg 65k, TP 68k, SL 63.5k 🎯',
                    code: null,
                    reactions: [{ emoji: '🔥', count: 4 }, { emoji: '✅', count: 2 }],
                  },
                  {
                    avatar: 'MD', color: '#57F287',
                    name: 'MaxDev', time: 'Heute 10:14',
                    text: 'Hat jemand die Binance WebSocket API im Griff? Reconnect klappt nicht...',
                    code: `ws.on('error', () => reconnect())`,
                    reactions: [],
                  },
                  {
                    avatar: 'CS', color: '#C9A84C',
                    name: 'Chris_S 👑', time: 'Heute 10:17',
                    text: '@MaxDev setTimeout 3000ms vor dem reconnect() — WS braucht kurz bis die Connection wirklich closed ist.',
                    code: null,
                    reactions: [{ emoji: '👍', count: 3 }],
                  },
                  {
                    avatar: 'SR', color: '#FEE75C',
                    name: 'Stefan_R', time: 'Heute 11:02',
                    text: 'ETH/USD Daily — das Wedge Pattern spannt sich zu. Breakout oder Breakdown?',
                    code: null,
                    reactions: [{ emoji: '📊', count: 5 }, { emoji: '🤔', count: 3 }],
                  },
                ].map((msg, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-[#080808] shrink-0 mt-0.5"
                      style={{ background: msg.color }}>
                      {msg.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-semibold text-[12px] text-[var(--cs-text)]">{msg.name}</span>
                        <span className="font-mono text-[9px] text-[var(--cs-text-4)]">{msg.time}</span>
                      </div>
                      <p className="text-[12px] text-[var(--cs-text-2)] leading-relaxed">{msg.text}</p>
                      {msg.code && (
                        <code className="block mt-1.5 px-3 py-2 rounded-lg bg-[var(--cs-s4)] font-mono text-[11px] text-[#7dd3fc] border border-[#ffffff]/6">
                          {msg.code}
                        </code>
                      )}
                      {msg.reactions.length > 0 && (
                        <div className="flex gap-1.5 mt-1.5">
                          {msg.reactions.map(r => (
                            <span key={r.emoji} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ffffff]/6 border border-[#ffffff]/10 text-[11px]">
                              {r.emoji}
                              <span className="font-mono text-[10px] text-[var(--cs-text-3)]">{r.count}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent" />
            </div>
          </Reveal>
        </div>
      </SectionWrapper>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* Waitlist */}
      <SectionWrapper id="waitlist" maxWidth="lg">
        <WaitlistForm />
      </SectionWrapper>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* Final CTA */}
      <SectionWrapper maxWidth="md">
        <div className="text-center flex flex-col items-center gap-6">
          <SectionHeader
            eyebrow="Bereit?"
            title={<>Komm in die <GradientText>Community</GradientText></>}
            description="Kostenlos · Keine Verpflichtung · Direkt loslegen"
            align="center"
          />
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <a href={`https://discord.gg/${INVITE_CODE}`} target="_blank" rel="noopener noreferrer">
              <CtaButton variant="primary" href={`https://discord.gg/${INVITE_CODE}`} external>
                Discord beitreten
              </CtaButton>
            </a>
            <a href="#waitlist"
              className="flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase text-[var(--cs-text-3)] hover:text-[var(--cs-text)] transition-colors duration-200">
              Early Access <ArrowRight size={13} strokeWidth={1.5} />
            </a>
          </div>
          {discordStatus === 'success' && memberCount && (
            <p className="font-mono text-[11px] text-[var(--cs-text-3)]">
              {memberCount} Member · {onlineCount} gerade online
            </p>
          )}
        </div>
      </SectionWrapper>
    </>
  )
}