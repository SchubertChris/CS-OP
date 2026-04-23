/* ============================================================
   CandleScope — Home Page
   src/pages/HomePage.tsx
   ============================================================ */

import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useScroll, useTransform, useSpring } from 'framer-motion'
import PageHero from '../components/ui/PageHero'
import {
  SectionHeader, GoldDivider, Card, CardIcon,
  GradientText, Badge, CtaButton, HighlightLine,
} from '../components/ui'
import {
  TrendingUp, Code2, Gamepad2, MessageSquare,
  ArrowRight, Wallet, BarChart2, Github,
  Zap, Star,
} from 'lucide-react'

import imgUebersicht from '../assets/images/Präsentation-WebsiteBild.webp'

/* ── Animation Helpers ─────────────────────────────────────── */
function Reveal({ children, direction = 'up', delay = 0, className }: {
  children: React.ReactNode
  direction?: 'up' | 'left' | 'right' | 'scale'
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const variants = {
    up: { hidden: { opacity: 0, y: 48 }, visible: { opacity: 1, y: 0 } },
    left: { hidden: { opacity: 0, x: -60 }, visible: { opacity: 1, x: 0 } },
    right: { hidden: { opacity: 0, x: 60 }, visible: { opacity: 1, x: 0 } },
    scale: { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } },
  }
  return (
    <motion.div ref={ref} variants={variants[direction]} initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}>
      {children}
    </motion.div>
  )
}

function StaggerContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
      variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
      className={className}>
      {children}
    </motion.div>
  )
}

function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={{
      hidden: { opacity: 0, y: 32, filter: 'blur(6px)' },
      visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
    }} className={className}>
      {children}
    </motion.div>
  )
}

function ParallaxScreenshot({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useSpring(useTransform(scrollYProgress, [0, 1], ['40px', '-40px']), { stiffness: 60, damping: 20 })
  return (
    <Reveal direction="right" delay={0.1}>
      <div ref={ref} className="relative">
        <motion.div className="absolute -inset-6 rounded-3xl pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.1) 0%, transparent 70%)' }}
          animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 4, repeat: Infinity }} />
        <motion.div style={{ y }}
          className="relative rounded-2xl overflow-hidden border border-[#C9A84C]/20 shadow-2xl shadow-black/60">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/4 to-transparent -skew-x-12 pointer-events-none z-10"
            initial={{ x: '-100%' }} whileInView={{ x: '200%' }} viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.4, ease: 'easeInOut' }} />
          <img src={src} alt={alt} className="w-full h-auto block" loading="lazy" />
        </motion.div>
      </div>
    </Reveal>
  )
}

/* ── Marquee ────────────────────────────────────────────────── */
const MARQUEE_ITEMS = [
  { text: 'CandleScope', icon: <Star size={14} strokeWidth={1.5} /> },
  { text: 'Fintech', icon: <TrendingUp size={14} strokeWidth={1.5} /> },
  { text: 'Finance Tools', icon: <Wallet size={14} strokeWidth={1.5} /> },
  { text: 'WebDev', icon: <Code2 size={14} strokeWidth={1.5} /> },
  { text: 'Coding', icon: <Zap size={14} strokeWidth={1.5} /> },
  { text: 'Gaming', icon: <Gamepad2 size={14} strokeWidth={1.5} /> },
  { text: 'Community', icon: <MessageSquare size={14} strokeWidth={1.5} /> },
  { text: 'Open Source', icon: <Github size={14} strokeWidth={1.5} /> },
  { text: 'Haushaltsbuch', icon: <BarChart2 size={14} strokeWidth={1.5} /> },
]

function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS]
  return (
    <div className="relative overflow-hidden border-y border-[#C9A84C]/10 py-4 bg-[var(--cs-bg)]">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[var(--cs-bg)] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[var(--cs-bg)] to-transparent z-10 pointer-events-none" />
      <motion.div className="flex items-center gap-10 w-max"
        animate={{ x: ['0%', '-33.33%'] }}
        transition={{ duration: 28, ease: 'linear', repeat: Infinity }}>
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2.5 shrink-0">
            <span className="text-[#C9A84C]/50">{item.icon}</span>
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--cs-text-3)]">{item.text}</span>
            <span className="w-1 h-1 rounded-full bg-[#C9A84C]/20 ml-4" />
          </div>
        ))}
      </motion.div>
    </div>
  )
}


/* ══════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const [dlOpen, setDlOpen] = useState(false)

  return (
    <div style={{ overflowX: 'hidden' }}>
      {/* ── Download Coming-Soon Modal ────────────────────── */}
      {dlOpen && (
        <motion.div
          className="fixed inset-0 z-[9000] flex items-center justify-center px-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => setDlOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
          {/* Card */}
          <motion.div
            className="relative z-10 w-full max-w-sm border border-[#C9A84C]/25 rounded-2xl bg-[var(--cs-s0)] p-8 shadow-2xl shadow-black"
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={e => e.stopPropagation()}>

            {/* Icon */}
            <div className="flex items-center justify-center w-12 h-12 rounded-full border border-[#C9A84C]/25 bg-[#C9A84C]/8 mb-6 mx-auto">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v10l4 2" /><circle cx="12" cy="12" r="10" />
              </svg>
            </div>

            <p className="text-[10px] font-mono tracking-[0.22em] uppercase text-[#C9A84C] text-center mb-2">Bald verfügbar</p>
            <h2 className="text-xl font-display text-[var(--cs-text)] text-center leading-snug mb-3">
              Download startet<br />am <span className="text-[#C9A84C]">8. Juni 2026</span>
            </h2>
            <p className="text-[13px] text-[var(--cs-text-3)] text-center leading-relaxed mb-7">
              Candlescope FinanceBoard v10.6 für Windows — vollständig offline, kostenlos, kein Abo.
            </p>

            <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C]/15 to-transparent mb-7" />

            <button
              onClick={() => setDlOpen(false)}
              className="w-full text-[11px] tracking-[0.16em] uppercase bg-[#C9A84C] text-[#080808] py-3 rounded-full font-semibold hover:bg-[#d4b55a] transition-colors duration-200">
              Verstanden
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* ── 1. Hero ───────────────────────────────────────── */}
      <PageHero
        eyebrow="FinanceBoard · Kostenlos für Windows"
        titleLine1="Dein Geld."
        titleLine2="Dein Gerät."
        titleAccent="line1"
        description="Professionelles Haushaltsbuch für Windows — vollständig offline, kein Abo, keine Cloud. Einmal herunterladen, dauerhaft behalten."
        badge="v10.6 · Gratis"
        theme="home"
      >
        {/* Primär-CTA: solid gold — höchste Priorität */}
        <button
          onClick={() => setDlOpen(true)}
          className="relative overflow-hidden group text-[11px] tracking-[0.18em] uppercase bg-[#C9A84C] text-[#080808] px-8 py-3.5 rounded-full font-semibold shadow-lg shadow-[#C9A84C]/25 hover:shadow-[#C9A84C]/40 transition-shadow duration-300 cursor-pointer">
          <span className="relative z-10">Kostenlos herunterladen</span>
          <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full" />
        </button>

        {/* Sekundär-CTA */}
        <a href="#produkt"
          className="text-[11px] tracking-[0.16em] uppercase text-[var(--cs-text-3)] hover:text-[var(--cs-text)] transition-colors duration-300 flex items-center gap-2 group">
          App entdecken
          <span className="w-4 h-px bg-current transition-all duration-300 group-hover:w-6" />
        </a>

        {/* Vertrauens-Strip: konkrete Zahlen statt Mini-Tags */}
        <div className="w-full pt-5 border-t border-[#C9A84C]/8">
          <div className="flex flex-wrap items-center gap-6">
            {[
              { val: '100%', label: 'Offline' },
              { val: '0',    label: 'Abonnements' },
              { val: '10',   label: 'Module' },
              { val: '∞',    label: 'Nutzungsdauer' },
            ].map(({ val, label }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span className="font-mono text-[15px] text-[#C9A84C] leading-none tabular-nums">{val}</span>
                <span className="font-mono text-[8px] tracking-[0.18em] uppercase text-[var(--cs-text-4)]">{label}</span>
              </div>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
              <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--cs-text-4)]">Windows · Gratis</span>
            </div>
          </div>
        </div>
      </PageHero>

      {/* ── 2. Marquee ────────────────────────────────────── */}
      <Marquee />

      {/* ── 3. CandleScope — Die Marke ────────────────────── */}
      <section className="px-8 md:px-16 lg:px-24 py-24 max-w-6xl mx-auto">
        <Reveal direction="up" className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <SectionHeader
              eyebrow="Die Marke"
              title={<><GradientText>CandleScope</GradientText><br />ist Fintech.</>}
              description="CandleScope baut Finance-Tools die funktionieren — lokal, privat, ohne Abo. Das Haushaltsbuch ist der Anfang."
            />
            <div className="shrink-0">
              <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--cs-text-4)] mb-2">Gegründet</p>
              <p className="font-display text-4xl text-[#C9A84C]">2022</p>
            </div>
          </div>
        </Reveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: <BarChart2 size={22} strokeWidth={1.5} />,
              badge: 'Live', badgeVariant: 'green' as const,
              title: 'Haushaltsbuch',
              desc: 'Vollständige Finanz-App — lokal, privat, kostenlos. Deine Daten bleiben auf deinem Gerät.',
              href: '/finance', cta: 'Entdecken',
            },
            {
              icon: <TrendingUp size={22} strokeWidth={1.5} />,
              badge: 'Bald', badgeVariant: 'muted' as const,
              title: 'Trading Tools',
              desc: 'Analyse-Tools, Portfolioverwaltung und Markt-Insights. In Entwicklung.',
              href: '/finance', cta: 'Mehr erfahren',
            },
            {
              icon: <Wallet size={22} strokeWidth={1.5} />,
              badge: 'Roadmap', badgeVariant: 'muted' as const,
              title: 'DeFi Dashboard',
              desc: 'Krypto und DeFi übersichtlich verwalten. Geplant.',
              href: '/finance', cta: 'Auf Roadmap',
            },
          ].map((item, i) => (
            <StaggerItem key={i}>
              <motion.div whileHover={{ y: -5, transition: { duration: 0.2 } }} className="h-full">
                <Card variant={i === 0 ? 'gold' : 'elevated'} padding="lg" className="h-full group">
                  <div className="flex items-start justify-between mb-5">
                    <CardIcon>{item.icon}</CardIcon>
                    <Badge variant={item.badgeVariant}>{item.badge}</Badge>
                  </div>
                  <h3 className="font-display text-xl text-[var(--cs-text)] mb-2 group-hover:text-[#C9A84C] transition-colors">{item.title}</h3>
                  <p className="text-[var(--cs-text-2)] text-sm leading-relaxed mb-6">{item.desc}</p>
                  <Link to={item.href}
                    className="flex items-center gap-2 text-[11px] tracking-[0.1em] uppercase text-[var(--cs-text-2)] group-hover:text-[#C9A84C] transition-colors mt-auto">
                    {item.cta}
                    <ArrowRight size={13} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Card>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* ── 4. Featured Produkt ───────────────────────────── */}
      <section id="produkt" className="px-8 md:px-16 lg:px-24 py-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <Reveal direction="left">
            <Badge variant="gold" className="mb-5">Featured Produkt</Badge>
            <SectionHeader
              eyebrow="CandleScope Finance"
              title={<>Das<br /><GradientText>Haushaltsbuch</GradientText></>}
              description="Finanzielle Kontrolle ohne Abo, ohne Cloud, ohne Kompromisse. Einmal herunterladen — für immer nutzen."
              className="mb-8"
            />
            <div className="flex flex-col gap-3 mb-8">
              {[
                'Dashboard mit Echtzeit-Übersicht',
                'Jahresanalysen & interaktive Charts',
                'Dokumentenarchiv & Vertragsverwaltung',
                'Custom Design — 4 Themes inklusive',
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]/60 shrink-0" />
                  <span className="text-[var(--cs-text-2)] text-sm">{f}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <CtaButton href="/finance" variant="primary">Alle Features ansehen</CtaButton>
              <CtaButton href="/contact" variant="ghost">Frage stellen</CtaButton>
            </div>
          </Reveal>
          <ParallaxScreenshot src={imgUebersicht} alt="CandleScope Haushaltsbuch" />
        </div>
      </section>

      {/* ── App in Aktion ─────────────────────────────────── */}
      <section className="px-8 md:px-16 lg:px-24 py-12 pb-24">
        <div className="max-w-6xl mx-auto">
          <Reveal direction="up" className="mb-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-[#C9A84C] animate-pulse" />
                <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--cs-text-2)]">
                  FinanceBoard — App in Aktion
                </span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-[#C9A84C]/20 to-transparent" />
              <Link to="/finance"
                className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--cs-text-2)] hover:text-[#C9A84C] transition-colors flex items-center gap-1.5 shrink-0">
                Alle Features <ArrowRight size={11} strokeWidth={1.5} />
              </Link>
            </div>
          </Reveal>

          <Reveal direction="scale" delay={0.1}>
            <div className="relative group">
              <motion.div
                className="absolute -inset-4 rounded-3xl pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.07) 0%, transparent 70%)' }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="relative rounded-2xl overflow-hidden border border-[#C9A84C]/20 shadow-2xl shadow-black/70">
                <div className="bg-[var(--cs-s4)] px-4 py-2.5 flex items-center gap-2 border-b border-[#C9A84C]/8">
                  <div className="w-3 h-3 rounded-full bg-[#ef4444]/70" />
                  <div className="w-3 h-3 rounded-full bg-[#eab308]/70" />
                  <div className="w-3 h-3 rounded-full bg-[#22c55e]/70" />
                  <span className="text-[var(--cs-text-3)] text-[10px] ml-2 font-mono">Candlescope FinanceBoard v10.6 — Dashboard</span>
                  <div className="ml-auto flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00C896] animate-pulse" />
                    <span className="font-mono text-[9px] text-[var(--cs-text-4)] tracking-wider">LIVE</span>
                  </div>
                </div>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent -skew-x-12 pointer-events-none z-10"
                  initial={{ x: '-100%' }} whileInView={{ x: '200%' }} viewport={{ once: true }}
                  transition={{ duration: 1.6, delay: 0.4, ease: 'easeInOut' }}
                />
                <img
                  src={imgUebersicht}
                  alt="CandleScope FinanceBoard Dashboard"
                  className="w-full h-auto block"
                  loading="lazy"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* ── 5. Der Typ dahinter ───────────────────────────── */}
      <section className="px-8 md:px-16 lg:px-24 py-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <Reveal direction="left">
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-[var(--cs-text-2)] mb-6 flex items-center gap-3">
              <span className="w-6 h-px bg-[#C9A84C]/40" />
              Der Typ dahinter
              <span className="w-6 h-px bg-[#C9A84C]/40" />
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-[var(--cs-text)] tracking-tight leading-[1.1] mb-6">
              Ich bin<br />
              <GradientText>Chris Schubert.</GradientText>
            </h2>
            <div className="flex flex-col gap-4 max-w-xl">
              <p className="text-[var(--cs-text-2)] leading-relaxed">
                Ich baue Software die ich selbst nutze — das Haushaltsbuch ist entstanden weil
                ich nichts Besseres finden konnte. Ich trade, ich code, ich game.
                CandleScope ist die Marke die das alles zusammenhält.
              </p>
              <HighlightLine>
                Kein Influencer. Kein Coach. Einfach jemand der Dinge baut.
              </HighlightLine>
            </div>
            <div className="flex items-center gap-4 mt-8 flex-wrap">
              <CtaButton href="/about" variant="primary">Mehr über mich</CtaButton>
              <a href="https://github.com/SchubertChris" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase text-[var(--cs-text-2)] hover:text-[var(--cs-text)] transition-colors group">
                <Github size={14} strokeWidth={1.5} />
                GitHub
                <span className="w-4 h-px bg-current transition-all duration-300 group-hover:w-6" />
              </a>
            </div>
          </Reveal>

          <Reveal direction="right" delay={0.15}>
            <StaggerContainer className="flex flex-col gap-3">
              {[
                { icon: <Code2 size={18} strokeWidth={1.5} />, label: 'WebDev', desc: 'React · TypeScript · Node.js · Full-Stack', href: '/dev' },
                { icon: <TrendingUp size={18} strokeWidth={1.5} />, label: 'Finance & Trading', desc: 'Aktien · Krypto · DeFi · eigene Tools', href: '/finance' },
                { icon: <Gamepad2 size={18} strokeWidth={1.5} />, label: 'Gaming', desc: 'Leidenschaft für Tech und Spiele', href: '/community' },
                { icon: <MessageSquare size={18} strokeWidth={1.5} />, label: 'Community', desc: 'Discord · Austausch · gemeinsam wachsen', href: '/community' },
              ].map((item, i) => (
                <StaggerItem key={i}>
                  <Link to={item.href}
                    className="group flex items-center gap-5 p-4 border border-[var(--cs-border-w)] rounded-2xl bg-[var(--cs-s1)] hover:border-[#C9A84C]/25 hover:bg-[#C9A84C]/3 transition-all duration-200">
                    <div className="w-11 h-11 rounded-xl bg-[#C9A84C]/8 border border-[#C9A84C]/15 flex items-center justify-center text-[#C9A84C]/70 group-hover:text-[#C9A84C] group-hover:border-[#C9A84C]/30 transition-all shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-[var(--cs-text)] group-hover:text-[#C9A84C] transition-colors">{item.label}</p>
                      <p className="text-[12px] text-[var(--cs-text-2)] mt-0.5">{item.desc}</p>
                    </div>
                    <ArrowRight size={15} strokeWidth={1.5} className="text-[var(--cs-text-4)] group-hover:text-[#C9A84C]/60 group-hover:translate-x-1 transition-all shrink-0" />
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </Reveal>
        </div>
      </section>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* ── 6. CTA ────────────────────────────────────────── */}
      <section className="px-8 md:px-16 lg:px-24 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <Reveal direction="scale">
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-16 h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent mx-auto mb-8"
            />
            <SectionHeader
              eyebrow="Lass uns reden"
              title={<>Ein Projekt?<br /><GradientText>Schreib mir.</GradientText></>}
              description="Web-Projekt, Kooperation oder eine Frage zum FinanceBoard — ich antworte innerhalb von 24 Stunden."
              align="center"
              className="mb-8"
            />
            <div className="flex items-center gap-4 justify-center flex-wrap">
              <CtaButton href="/contact" variant="primary">Kontakt aufnehmen</CtaButton>
              <CtaButton href="/finance" variant="ghost">Produkt ansehen</CtaButton>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}