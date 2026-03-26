/* ============================================================
   CandleScope — Community Page
   src/pages/CommunityPage.tsx
   ============================================================ */
import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import PageHero from '../components/ui/PageHero'
import {
  SectionWrapper, SectionHeader, GoldDivider,
  Card, CardIcon, GradientText, CtaButton, TagList,
} from '../components/ui'
import {
  MessageSquare, Users, Zap, TrendingUp,
  Shield, BarChart2, Code2, Video,
  ExternalLink, CheckCircle2, ArrowRight,
  Loader2,
} from 'lucide-react'

/* ════════════════════════════════════════════════════════════════
   DISCORD INVITE HOOK — live Member Count
   ════════════════════════════════════════════════════════════════ */
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

/* ════════════════════════════════════════════════════════════════
   ANIMATION HELPERS
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
      hidden:  { opacity: 0, y: 28, filter: 'blur(6px)' },
      visible: { opacity: 1, y: 0,  filter: 'blur(0px)', transition: { duration: 0.55, ease: [0.22,1,0.36,1] as const } },
    }} className={className}>
      {children}
    </motion.div>
  )
}

/* ════════════════════════════════════════════════════════════════
   STAT CARD
   ════════════════════════════════════════════════════════════════ */
function StatCard({ value, label, sub, loading }: {
  value: string; label: string; sub?: string; loading?: boolean
}) {
  return (
    <div className="flex flex-col gap-1 p-6 rounded-xl border border-[#ffffff]/8 bg-[#0d0d0d]">
      {loading
        ? <div className="w-16 h-8 rounded bg-[#ffffff]/10 animate-pulse mb-1" />
        : <span className="font-display text-4xl text-[#C9A84C] leading-none">{value}</span>
      }
      <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#F5F0E8]">{label}</span>
      {sub && <span className="font-mono text-[10px] text-[#5a5550]">{sub}</span>}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   DISCORD SERVER PREVIEW
   ════════════════════════════════════════════════════════════════ */
function ServerPreview() {
  const categories = [
    {
      name: 'START',
      channels: ['willkommen', 'regeln', 'forum', 'neues'],
    },
    {
      name: 'COMMUNITY',
      channels: ['global', 'long', 'short', 'setups', 'scam-alarm'],
    },
    {
      name: 'ANLAGE & VORSORGE',
      channels: ['aktien', 'anleihen', 'devisen', 'exchange-traded-funds', 'rohstoffe'],
    },
    {
      name: 'SPEAK',
      channels: ['CandleScope I', 'CandleScope II', 'CandleScope III'],
      voice: true,
    },
  ]

  return (
    <div className="rounded-xl border border-[#ffffff]/8 bg-[#0d0d0d] overflow-hidden">
      {/* Server Header */}
      <div className="px-4 py-3 border-b border-[#ffffff]/6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#C9A84C]/20 flex items-center justify-center">
            <span className="text-[8px] font-bold text-[#C9A84C]">CS</span>
          </div>
          <span className="font-display text-sm text-[#F5F0E8] tracking-wide">CANDLESCOPE</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-[#00C896]" />
          <span className="font-mono text-[9px] text-[#5a5550]">online</span>
        </div>
      </div>

      {/* Channels */}
      <div className="p-3 flex flex-col gap-1 max-h-72 overflow-y-auto">
        {categories.map(cat => (
          <div key={cat.name} className="mb-2">
            <p className="font-mono text-[9px] tracking-[0.16em] text-[#5a5550] px-2 mb-1">{cat.name}</p>
            {cat.channels.map(ch => (
              <div key={ch}
                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[#ffffff]/4 transition-colors cursor-default group">
                {cat.voice
                  ? <span className="text-[#5a5550] text-[12px] group-hover:text-[#9A9590]">🔊</span>
                  : <span className="text-[#5a5550] text-[12px] group-hover:text-[#9A9590]">#</span>
                }
                <span className="font-mono text-[11px] text-[#9A9590] group-hover:text-[#F5F0E8] transition-colors">{ch}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   EMAIL WAITLIST
   ════════════════════════════════════════════════════════════════ */
function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) { setStatus('error'); return }
    // Hier später echten API-Call einfügen
    setStatus('success')
    setEmail('')
  }

  return (
    <div className="rounded-xl border border-[#C9A84C]/20 bg-gradient-to-br from-[#0f0e0c] to-[#080808] p-8">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#C9A84C]/70">Early Access</span>
      </div>
      <h3 className="font-display text-xl text-[#F5F0E8] mb-2">
        Sei dabei wenn es <GradientText>richtig losgeht</GradientText>
      </h3>
      <p className="text-[#9A9590] text-sm leading-relaxed mb-6">
        Trag dich ein und erhalte als Erstes Zugang zu exklusiven Features, Member-only Inhalten und Live-Events.
      </p>

      {status === 'success' ? (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-[#00C896]/20 bg-[#00C896]/5">
          <CheckCircle2 size={18} strokeWidth={1.5} className="text-[#00C896] shrink-0" />
          <span className="text-sm text-[#F5F0E8]">Du bist auf der Liste — wir melden uns!</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="deine@email.de"
            className={`flex-1 px-4 py-3 rounded-xl bg-[#080808] border text-sm text-[#F5F0E8] placeholder-[#5a5550] outline-none transition-colors ${
              status === 'error' ? 'border-[#FF4444]/50' : 'border-[#ffffff]/10 focus:border-[#C9A84C]/40'
            }`}
          />
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

/* ════════════════════════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════════════════════════ */
const INVITE_CODE = 'HRxbTW4ujT'

const FEATURES = [
  {
    icon: <TrendingUp size={20} strokeWidth={1.5} />,
    title: 'Trading Setups & Signale',
    desc: 'Täglich frische Setups, Entry-Punkte und Marktanalysen von der Community.',
  },
  {
    icon: <Video size={20} strokeWidth={1.5} />,
    title: 'Live Q&A Sessions',
    desc: 'Regelmäßige Live-Sessions mit Chart-Analysen, Fragen und direktem Austausch.',
  },
  {
    icon: <Shield size={20} strokeWidth={1.5} />,
    title: 'Scam-Alarm & Warnungen',
    desc: 'Community-geprüfte Warnungen vor Betrug, Pump & Dump und unseriösen Angeboten.',
  },
  {
    icon: <BarChart2 size={20} strokeWidth={1.5} />,
    title: 'Depot-Vorstellungen',
    desc: 'Zeig dein Portfolio, hol dir Feedback und lern von den Strategien anderer.',
  },
  {
    icon: <Code2 size={20} strokeWidth={1.5} />,
    title: 'Dev & Tech Talk',
    desc: 'Webentwicklung, Automatisierung, Trading-Bots — Tech-Austausch auf Augenhöhe.',
  },
  {
    icon: <MessageSquare size={20} strokeWidth={1.5} />,
    title: 'Gemeinsame Chartanalysen',
    desc: 'Technische Analyse im Team — mehrere Augen sehen mehr als eines.',
  },
]

export default function CommunityPage() {
  const { data: discord, status: discordStatus } = useDiscordInvite(INVITE_CODE)

  const memberCount = discord?.approximate_member_count
  const onlineCount = discord?.approximate_presence_count

  return (
    <>
      <PageHero
        eyebrow="Community"
        titleLine1="Discord &"
        titleLine2="Community"
        titleAccent="line2"
        description="Trading · Tech · Chartanalysen · Austausch. Eine Community die wirklich was bringt."
        badge="Jetzt live"
        theme="community"
      >
        <a href={`https://discord.gg/${INVITE_CODE}`} target="_blank" rel="noopener noreferrer"
          className="relative overflow-hidden group text-[11px] tracking-[0.16em] uppercase border border-[#C9A84C]/35 text-[#C9A84C] px-7 py-3.5 rounded-full">
          <span className="relative z-10 group-hover:text-[#080808] transition-colors duration-300">Discord beitreten</span>
          <span className="absolute inset-0 bg-[#C9A84C] rounded-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        </a>
        <a href="#waitlist"
          className="text-[11px] tracking-[0.16em] uppercase text-[#5a5550] hover:text-[#F5F0E8] transition-colors duration-300 flex items-center gap-2 group">
          Early Access
          <span className="w-4 h-px bg-current transition-all duration-300 group-hover:w-6" />
        </a>
      </PageHero>

      {/* ── Live Stats ───────────────────────────────────── */}
      <SectionWrapper id="stats" maxWidth="lg">
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StaggerItem>
            <StatCard
              value={memberCount ? String(memberCount) : '—'}
              label="Member"
              sub="gesamt"
              loading={discordStatus === 'loading'}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              value={onlineCount ? String(onlineCount) : '—'}
              label="Online"
              sub="gerade aktiv"
              loading={discordStatus === 'loading'}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard value="6" label="Kategorien" sub="im Server" />
          </StaggerItem>
          <StaggerItem>
            <StatCard value="24/7" label="Aktiv" sub="immer offen" />
          </StaggerItem>
        </StaggerContainer>
      </SectionWrapper>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* ── Was die Community bietet ─────────────────────── */}
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
                  <h3 className="font-display text-lg text-[#F5F0E8] mb-2">{f.title}</h3>
                  <p className="text-[#9A9590] text-sm leading-relaxed">{f.desc}</p>
                </Card>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </SectionWrapper>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* ── Server Vorschau + Discord CTA ────────────────── */}
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
                'Trading Setups · Long & Short Channels',
                'Anlage & Vorsorge — Aktien · ETFs · Devisen · Rohstoffe',
                'Scam-Alarm für die Community',
                '3 Voice Channels für Live-Sessions',
                'Organisierte Moderationsstruktur',
              ].map((item, i) => (
                <StaggerItem key={i}>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={15} strokeWidth={1.5} className="text-[#00C896] shrink-0 mt-0.5" />
                    <span className="text-[#9A9590] text-sm">{item}</span>
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

      {/* ── Tags ─────────────────────────────────────────── */}
      <SectionWrapper id="topics">
        <SectionHeader
          eyebrow="Themen"
          title={<>Worüber wir <GradientText>reden</GradientText></>}
          className="mb-10"
        />
        <TagList tags={[
          'Aktien', 'ETFs', 'Krypto', 'Devisen', 'Rohstoffe', 'Anleihen',
          'Technische Analyse', 'Fundamental', 'Trading Psychology',
          'React', 'TypeScript', 'Web Dev', 'Automatisierung',
          'Depot-Aufbau', 'DeFi', 'Options', 'Futures',
        ]} />
      </SectionWrapper>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* ── Waitlist ─────────────────────────────────────── */}
      <SectionWrapper id="waitlist" maxWidth="lg">
        <WaitlistForm />
      </SectionWrapper>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* ── Final CTA ────────────────────────────────────── */}
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
              className="flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase text-[#5a5550] hover:text-[#F5F0E8] transition-colors duration-200">
              Early Access <ArrowRight size={13} strokeWidth={1.5} />
            </a>
          </div>
          {discordStatus === 'success' && memberCount && (
            <p className="font-mono text-[11px] text-[#5a5550]">
              {memberCount} Member · {onlineCount} gerade online
            </p>
          )}
        </div>
      </SectionWrapper>
    </>
  )
}