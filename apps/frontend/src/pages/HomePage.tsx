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
  Zap, Star, Play,
} from 'lucide-react'

import imgUebersicht from '../assets/images/Übersicht.webp'

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
    <div className="relative overflow-hidden border-y border-[#C9A84C]/10 py-4 bg-[#080808]">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#080808] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#080808] to-transparent z-10 pointer-events-none" />
      <motion.div className="flex items-center gap-10 w-max"
        animate={{ x: ['0%', '-33.33%'] }}
        transition={{ duration: 28, ease: 'linear', repeat: Infinity }}>
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2.5 shrink-0">
            <span className="text-[#C9A84C]/50">{item.icon}</span>
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-[#5a5550]">{item.text}</span>
            <span className="w-1 h-1 rounded-full bg-[#C9A84C]/20 ml-4" />
          </div>
        ))}
      </motion.div>
    </div>
  )
}

/* ── Video Player (lädt erst beim Klick) ───────────────────── */
function LazyVideoPlayer() {
  const [clicked, setClicked] = useState(false)
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleClick = () => {
    setClicked(true)
    // Video wird erst jetzt ins DOM eingesetzt — kurz warten bis mounted
    setTimeout(() => {
      videoRef.current?.play()
    }, 100)
  }

  const handleVideoPlay = () => {
    setPlaying(true)
  }

  return (
    <div className="relative group">
      {/* Äußerer Glow */}
      <motion.div
        className="absolute -inset-3 rounded-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.08) 0%, transparent 70%)' }}
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Video Container */}
      <div className="relative rounded-2xl overflow-hidden border border-[#C9A84C]/20 shadow-2xl shadow-black/70 aspect-video bg-[#0d0d0d]">

        {/* Shine sweep */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 pointer-events-none z-10"
          initial={{ x: '-100%' }} whileInView={{ x: '200%' }} viewport={{ once: true }}
          transition={{ duration: 1.4, delay: 0.3, ease: 'easeInOut' }}
        />

        {/* Placeholder / Play Button — solange nicht geklickt */}
        {!clicked && (
          <motion.div
            onClick={handleClick}
            className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer z-30 bg-[#0d0d0d]"
          >
            {/* Hintergrund Grid-Pattern */}
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'linear-gradient(#C9A84C 1px, transparent 1px), linear-gradient(90deg, #C9A84C 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
            <motion.div
              className="relative w-20 h-20 rounded-full border-2 border-[#C9A84C]/60 flex items-center justify-center bg-[#080808]/80 backdrop-blur-sm"
              animate={{
                scale: [1, 1.08, 1],
                borderColor: ['rgba(201,168,76,0.4)', 'rgba(201,168,76,0.8)', 'rgba(201,168,76,0.4)'],
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <Play size={28} strokeWidth={1.5} className="text-[#C9A84C] ml-1.5" />
            </motion.div>
            <p className="relative mt-5 font-mono text-[11px] tracking-[0.18em] uppercase text-[#5a5550]">
              Video abspielen
            </p>
          </motion.div>
        )}

        {/* Video — erst nach Klick im DOM */}
        {clicked && (
          <>
            <video
              ref={videoRef}
              muted
              loop
              playsInline
              onPlay={handleVideoPlay}
              className="w-full h-full object-cover block"
            >
              <source src="/video/CandleScope.webm" type="video/webm" />
              <source src="/video/CandleScope.mp4" type="video/mp4" />
            </video>

            {/* Fade-in von schwarz */}
            {playing && (
              <motion.div
                className="absolute inset-0 bg-black pointer-events-none z-20"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            )}

            {/* Fade-out zu schwarz im Loop */}
            {playing && (
              <motion.div
                className="absolute inset-0 bg-black pointer-events-none z-20"
                animate={{ opacity: [0, 0, 0, 0, 0, 0, 0, 0, 1] }}
                transition={{
                  duration: 10,
                  ease: 'linear',
                  repeat: Infinity,
                  times: [0, 0.1, 0.3, 0.5, 0.6, 0.7, 0.75, 0.85, 1],
                }}
              />
            )}
          </>
        )}

        {/* Unten Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#080808]/60 to-transparent pointer-events-none z-10" />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════ */
export default function HomePage() {
  return (
    <>
      {/* ── 1. Hero ───────────────────────────────────────── */}
      <PageHero
        eyebrow="CandleScope"
        titleLine1="Trading &"
        titleLine2="Technologie"
        titleAccent="line2"
        description="Fintech · Finance Tools · WebDev · Gaming. Eine Marke — gebaut von Chris Schubert."
        badge="Est. 2025"
        theme="home"
      >
        <a href="#produkt"
          className="relative overflow-hidden group text-[11px] tracking-[0.16em] uppercase border border-[#C9A84C]/35 text-[#C9A84C] px-7 py-3.5 rounded-full">
          <span className="relative z-10 group-hover:text-[#080808] transition-colors duration-300">Produkt entdecken</span>
          <span className="absolute inset-0 bg-[#C9A84C] rounded-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        </a>
        <Link to="/about"
          className="text-[11px] tracking-[0.16em] uppercase text-[#5a5550] hover:text-[#F5F0E8] transition-colors duration-300 flex items-center gap-2 group">
          Über mich
          <span className="w-4 h-px bg-current transition-all duration-300 group-hover:w-6" />
        </Link>
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
              description="CandleScope baut Finance-Tools die wirklich funktionieren — angefangen mit dem Haushaltsbuch. Mehr folgt."
            />
            <div className="shrink-0">
              <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#3a3530] mb-2">Gegründet</p>
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
              desc: 'Vollständige Finanz-App — lokal, privat, einmalig kaufen. Kein Abo.',
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
                  <h3 className="font-display text-xl text-[#F5F0E8] mb-2 group-hover:text-[#C9A84C] transition-colors">{item.title}</h3>
                  <p className="text-[#9A9590] text-sm leading-relaxed mb-6">{item.desc}</p>
                  <Link to={item.href}
                    className="flex items-center gap-2 text-[11px] tracking-[0.1em] uppercase text-[#C9A84C]/50 group-hover:text-[#C9A84C] transition-colors mt-auto">
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
              description="Finanzielle Kontrolle ohne Abo, ohne Cloud, ohne Kompromisse. Einmal kaufen — für immer nutzen."
              className="mb-8"
            />
            <div className="flex flex-col gap-3 mb-8">
              {[
                'Dashboard mit Echtzeit-Übersicht',
                'Jahresanalysen & interaktive Charts',
                'Dokumentenarchiv & Vertragsverwaltung',
                'Custom Design — 3 Themes inklusive',
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]/60 shrink-0" />
                  <span className="text-[#9A9590] text-sm">{f}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <CtaButton href="/finance" variant="primary">Produkt ansehen</CtaButton>
              <CtaButton href="/contact" variant="ghost">Kaufanfrage</CtaButton>
            </div>
          </Reveal>
          <ParallaxScreenshot src={imgUebersicht} alt="CandleScope Haushaltsbuch" />
        </div>
      </section>

      {/* ── Video — Produkt in Aktion ─────────────────────── */}
      <section className="px-8 md:px-16 lg:px-24 py-12 pb-24">
        <div className="max-w-6xl mx-auto">
          <Reveal direction="up" className="mb-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/25 flex items-center justify-center">
                  <Play size={12} strokeWidth={1.5} className="text-[#C9A84C] ml-0.5" />
                </div>
                <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#9A9590]">
                  Produkt in Aktion
                </span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-[#C9A84C]/20 to-transparent" />
            </div>
          </Reveal>

          <Reveal direction="scale" delay={0.1}>
            <LazyVideoPlayer />
          </Reveal>
        </div>
      </section>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* ── 5. Der Typ dahinter ───────────────────────────── */}
      <section className="px-8 md:px-16 lg:px-24 py-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <Reveal direction="left">
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#C9A84C]/60 mb-6 flex items-center gap-3">
              <span className="w-6 h-px bg-[#C9A84C]/40" />
              Der Typ dahinter
              <span className="w-6 h-px bg-[#C9A84C]/40" />
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-[#F5F0E8] tracking-tight leading-[1.1] mb-6">
              Ich bin<br />
              <GradientText>Chris Schubert.</GradientText>
            </h2>
            <div className="flex flex-col gap-4 max-w-xl">
              <p className="text-[#9A9590] leading-relaxed">
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
                className="flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase text-[#9A9590] hover:text-[#F5F0E8] transition-colors group">
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
                    className="group flex items-center gap-5 p-4 border border-[#ffffff]/6 rounded-2xl bg-[#0d0d0d] hover:border-[#C9A84C]/25 hover:bg-[#C9A84C]/3 transition-all duration-200">
                    <div className="w-11 h-11 rounded-xl bg-[#C9A84C]/8 border border-[#C9A84C]/15 flex items-center justify-center text-[#C9A84C]/70 group-hover:text-[#C9A84C] group-hover:border-[#C9A84C]/30 transition-all shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-[#F5F0E8] group-hover:text-[#C9A84C] transition-colors">{item.label}</p>
                      <p className="text-[12px] text-[#9A9590] mt-0.5">{item.desc}</p>
                    </div>
                    <ArrowRight size={15} strokeWidth={1.5} className="text-[#3a3530] group-hover:text-[#C9A84C]/60 group-hover:translate-x-1 transition-all shrink-0" />
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
              title={<>Bereit für<br /><GradientText>mehr?</GradientText></>}
              description="Projekt · Kooperation · einfach Hallo sagen. Ich antworte innerhalb von 24 Stunden."
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
    </>
  )
}