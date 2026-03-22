/* ============================================================
   CandleScope — Finance Page mit epischen Scroll-Effekten
   src/pages/FinancePage.tsx
   ============================================================ */

import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  motion, useScroll, useTransform, useSpring,
  useInView, useMotionValue,
} from 'framer-motion'
import PageHero from '../components/ui/PageHero'
import {
  SectionHeader, GoldDivider,
  Card, CardIcon, GradientText, Badge, CtaButton,
  HighlightLine, TagList,
} from '../components/ui'
import {
  BarChart2, Shield, Wallet, FileText,
  TrendingUp, Coins, CheckCircle2, ArrowRight,
  Palette, Lock, RefreshCw, Calendar,
} from 'lucide-react'

import imgUebersicht from '../assets/images/Übersicht.webp'
import imgJahresuebersicht from '../assets/images/Jahresüberblick.webp'
import imgDokumente from '../assets/images/Dokumentenarchiv.webp'
import imgDesign from '../assets/images/CostumDesign.webp'

/* ── Scroll Animations ─────────────────────────────────── */
function useParallax(speed = 0.3) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * 80}px`, `-${speed * 80}px`])
  const smooth = useSpring(y, { stiffness: 60, damping: 20 })
  return { ref, y: smooth }
}

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const smoothX = useSpring(rotateX, { stiffness: 150, damping: 20 })
  const smoothY = useSpring(rotateY, { stiffness: 150, damping: 20 })

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    rotateY.set(x * 8)
    rotateX.set(-y * 5)
  }

  return (
    <motion.div ref={ref} onMouseMove={handleMove}
      onMouseLeave={() => { rotateX.set(0); rotateY.set(0) }}
      style={{ rotateX: smoothX, rotateY: smoothY, transformPerspective: 1200 }}
      className={className}>
      {children}
    </motion.div>
  )
}

function Reveal({ children, direction = 'up', delay = 0, className }: {
  children: React.ReactNode; direction?: 'up' | 'left' | 'right' | 'scale'; delay?: number; className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const variants = {
    up: { hidden: { opacity: 0, y: 48 }, visible: { opacity: 1, y: 0 } },
    left: { hidden: { opacity: 0, x: -60 }, visible: { opacity: 1, x: 0 } },
    right: { hidden: { opacity: 0, x: 60 }, visible: { opacity: 1, x: 0 } },
    scale: { hidden: { opacity: 0, scale: 0.88 }, visible: { opacity: 1, scale: 1 } },
  }
  return (
    <motion.div ref={ref} variants={variants[direction]} initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const }}
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
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className={className}>
      {children}
    </motion.div>
  )
}

function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={{
      hidden: { opacity: 0, y: 32, filter: 'blur(8px)' },
      visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
    }} className={className}>
      {children}
    </motion.div>
  )
}

function AnimatedCounter({ target, suffix = '' }: { target: number | string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)
  const isNumber = typeof target === 'number'

  useEffect(() => {
    if (!isInView || !isNumber) return
    const duration = 1800
    const steps = 60
    const increment = (target as number) / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= (target as number)) { setCount(target as number); clearInterval(timer) }
      else { setCount(Math.floor(current)) }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [isInView, target, isNumber])

  return <span ref={ref}>{isNumber ? count : target}{suffix}</span>
}

function ScreenshotReveal({ src, alt, direction = 'right' }: { src: string; alt: string; direction?: 'left' | 'right' }) {
  const { ref, y } = useParallax(0.15)
  return (
    <Reveal direction={direction === 'right' ? 'right' : 'left'} delay={0.1}>
      <TiltCard>
        <div ref={ref} className="relative">
          <motion.div className="absolute -inset-6 rounded-3xl"
            style={{ background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.12) 0%, transparent 70%)' }}
            animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="relative rounded-2xl overflow-hidden border border-[#C9A84C]/25 shadow-2xl shadow-black/70" style={{ y }}>
            <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 pointer-events-none z-10"
              initial={{ x: '-100%' }} whileInView={{ x: '200%' }} viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.5, ease: 'easeInOut' }} />
            <img src={src} alt={alt} className="w-full h-auto block" loading="lazy" />
          </motion.div>
        </div>
      </TiltCard>
    </Reveal>
  )
}

/* ── Data ──────────────────────────────────────────────── */
const FEATURES = [
  { icon: <BarChart2 size={20} strokeWidth={1.5} />, title: 'Finanzüberblick', desc: 'Vermögen, Einkommen, Fixausgaben auf einen Blick.' },
  { icon: <Wallet size={20} strokeWidth={1.5} />, title: 'Kontenverwaltung', desc: 'Giro, Kreditkarte, Depot — alles in einer Ansicht.' },
  { icon: <TrendingUp size={20} strokeWidth={1.5} />, title: 'Jahresanalyse', desc: 'Interaktive Charts für Verlauf und Sparquote.' },
  { icon: <FileText size={20} strokeWidth={1.5} />, title: 'Dokumentenarchiv', desc: 'Verträge, Versicherungen kategorisiert.' },
  { icon: <Calendar size={20} strokeWidth={1.5} />, title: 'Zahlungsübersicht', desc: 'Nächste Abbuchungen und Fälligkeiten.' },
  { icon: <Palette size={20} strokeWidth={1.5} />, title: 'Custom Design', desc: 'Themes, Schrift, Hintergrundbild.' },
  { icon: <Lock size={20} strokeWidth={1.5} />, title: 'Privacy Lock', desc: 'Auto-Lock nach Inaktivität.' },
  { icon: <RefreshCw size={20} strokeWidth={1.5} />, title: 'Auto-Save', desc: 'Lokal gespeichert — kein Cloud-Zwang.' },
]

const INCLUDED = [
  'Dashboard mit Echtzeit-Übersicht',
  'Unbegrenzte Konten & Kategorien',
  'Jahres- & Monatsanalysen',
  'Fixkosten & Vertragsverwaltung',
  'Dokumentenarchiv',
  'Einmalzahlung — kein Abo',
  'Lokale Datenspeicherung',
  'Custom Design & Themes',
  'Passwortschutz',
  'Kostenlose Updates',
]

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
export default function FinancePage() {
  return (
    <>
      {/* ── Hero ────────────────────────────────────────── */}
      <PageHero
        eyebrow="Finance"
        titleLine1="Märkte &"
        titleLine2="Tools"
        titleAccent="line2"
        description="Haushaltsbuch-Software · Trading · DeFi · Krypto. Finanzielle Kontrolle beginnt mit den richtigen Werkzeugen."
        badge="Haushaltsbuch verfügbar"
        theme="finance"
      >
        <a href="#haushaltsbuch"
          className="relative overflow-hidden group text-[11px] tracking-[0.16em] uppercase border border-[#C9A84C]/35 text-[#C9A84C] px-7 py-3.5 rounded-full">
          <span className="relative z-10 group-hover:text-[#080808] transition-colors duration-300">Haushaltsbuch entdecken</span>
          <span className="absolute inset-0 bg-[#C9A84C] rounded-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        </a>
        <Link to="/contact"
          className="text-[11px] tracking-[0.16em] uppercase text-[#5a5550] hover:text-[#F5F0E8] transition-colors duration-300 flex items-center gap-2 group">
          Beratung anfragen
          <span className="w-4 h-px bg-current transition-all duration-300 group-hover:w-6" />
        </Link>
      </PageHero>

      {/* ── Produkt Intro ───────────────────────────────── */}
      <section id="haushaltsbuch" className="px-8 md:px-16 lg:px-24 py-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <Reveal direction="left">
            <Badge variant="gold" className="mb-5">Haushaltsbuch · v2026</Badge>
            <SectionHeader
              eyebrow="Das Produkt"
              title={<>Finanzielle Kontrolle<br /><GradientText>in deiner Hand</GradientText></>}
              description="Eine vollständige Desktop-App für deine Finanzen — ohne Abo, ohne Cloud, ohne Kompromisse."
              className="mb-8"
            />
            <StaggerContainer className="flex flex-col gap-3 mb-8">
              {[
                'Einmalzahlung — kein Abo, keine versteckten Kosten',
                'Deine Daten bleiben lokal auf deinem Gerät',
                'Vollständig personalisierbar — dein Design, deine Regeln',
              ].map((item, i) => (
                <StaggerItem key={i}>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={16} strokeWidth={1.5} className="text-[#00C896] shrink-0 mt-0.5" />
                    <span className="text-[#9A9590] text-sm">{item}</span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
            <CtaButton href="/contact" variant="primary">Jetzt kaufen</CtaButton>
          </Reveal>
          <ScreenshotReveal src={imgUebersicht} alt="CandleScope Dashboard" direction="right" />
        </div>
      </section>

      <GoldDivider className="mx-8 md:mx-16 lg:px-24" />

      {/* ── Stats ───────────────────────────────────────── */}
      <section className="px-8 md:px-16 lg:px-24 py-20">
        <div className="max-w-4xl mx-auto">
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {[
              { value: 8, suffix: '+', label: 'Module' },
              { value: '∞', suffix: '', label: 'Konten' },
              { value: 100, suffix: '%', label: 'Lokal & Privat' },
              { value: '1x', suffix: '', label: 'Zahlung — kein Abo' },
            ].map((s, i) => (
              <StaggerItem key={i}>
                <div className="flex flex-col gap-1">
                  <div className="font-display text-4xl md:text-5xl text-[#C9A84C] leading-none">
                    <AnimatedCounter target={s.value} suffix={s.suffix} />
                  </div>
                  <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#5a5550]">{s.label}</span>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <GoldDivider className="mx-8 md:mx-16 lg:px-24" />

      {/* ── Jahresübersicht ─────────────────────────────── */}
      <section className="px-8 md:px-16 lg:px-24 py-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <ScreenshotReveal src={imgJahresuebersicht} alt="Jahresübersicht" direction="left" />
          <Reveal direction="right" delay={0.15}>
            <SectionHeader
              eyebrow="Analyse"
              title={<>Deine Finanzen<br /><GradientText>im Jahresüberblick</GradientText></>}
              description="Monatlicher Verlauf, Sparquote, Einnahmen und Ausgaben als interaktive Charts."
              className="mb-6"
            />
            <StaggerContainer className="flex flex-col gap-3">
              {[
                'Monatlicher Saldo als Linien- und Balkendiagramm',
                'Sparquote im Jahresverlauf',
                'Monatsvergleich mit Detailansicht',
                'Zahlungsplan & Fälligkeiten',
              ].map((item, i) => (
                <StaggerItem key={i}>
                  <div className="flex items-start gap-3">
                    <ArrowRight size={14} strokeWidth={1.5} className="text-[#C9A84C]/60 shrink-0 mt-1" />
                    <span className="text-[#9A9590] text-sm">{item}</span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </Reveal>
        </div>
      </section>

      <GoldDivider className="mx-8 md:mx-16 lg:px-24" />

      {/* ── Dokumentenarchiv ────────────────────────────── */}
      <section className="px-8 md:px-16 lg:px-24 py-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <Reveal direction="left" delay={0.1}>
            <SectionHeader
              eyebrow="Dokumentenarchiv"
              title={<>Alle Dokumente<br /><GradientText>immer griffbereit</GradientText></>}
              description="Verträge, Versicherungen, Legitimationen — kategorisiert und jederzeit zugänglich."
              className="mb-6"
            />
            <StaggerContainer className="grid grid-cols-2 gap-2 mb-6">
              {['Verträge', 'Versicherungen', 'Legitimationen', 'Karten & Konten', 'Rechnungen', 'Lohn & Gehalt', 'Eingänge & Post', 'Sonstiges'].map((cat, i) => (
                <StaggerItem key={i}>
                  <div className="flex items-center gap-2 px-3 py-2 border border-[#ffffff]/6 rounded-lg bg-[#0d0d0d] hover:border-[#C9A84C]/20 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]/50" />
                    <span className="text-[12px] text-[#9A9590]">{cat}</span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </Reveal>
          <ScreenshotReveal src={imgDokumente} alt="Dokumentenarchiv" direction="right" />
        </div>
      </section>

      <GoldDivider className="mx-8 md:mx-16 lg:px-24" />

      {/* ── Features Grid ───────────────────────────────── */}
      <section className="px-8 md:px-16 lg:px-24 py-24">
        <div className="max-w-6xl mx-auto">
          <Reveal direction="up" className="mb-14">
            <SectionHeader
              eyebrow="Funktionen"
              title={<>Alles was du<br /><GradientText>brauchst</GradientText></>}
              description="Kein Feature-Bloat — nur was wirklich zählt."
            />
          </Reveal>
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <StaggerItem key={i}>
                <motion.div whileHover={{ y: -4, transition: { duration: 0.2 } }} className="h-full">
                  <Card variant={i < 4 ? 'elevated' : 'default'} padding="md" className="h-full">
                    <CardIcon>{f.icon}</CardIcon>
                    <h3 className="font-display text-base text-[#F5F0E8] mb-2">{f.title}</h3>
                    <p className="text-[#9A9590] text-[13px] leading-relaxed">{f.desc}</p>
                  </Card>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <GoldDivider className="mx-8 md:mx-16 lg:px-24" />

      {/* ── Design Screenshot ────────────────────────────── */}
      <section className="px-8 md:px-16 lg:px-24 py-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <ScreenshotReveal src={imgDesign} alt="Custom Design Einstellungen" direction="left" />
          <Reveal direction="right" delay={0.15}>
            <SectionHeader
              eyebrow="Personalisierung"
              title={<>Dein Design.<br /><GradientText>Deine Regeln.</GradientText></>}
              description="Farbschema, Schriftgröße, Hintergrundbild — vollständig an dich anpassbar."
              className="mb-6"
            />
            <TagList tags={['Candlescope Theme', 'Nacht-Blau', 'Crimson', 'Custom Hintergrundbild', 'Schriftgrößen', 'Privacy Lock']} />
          </Reveal>
        </div>
      </section>

      <GoldDivider className="mx-8 md:mx-16 lg:px-24" />

      {/* ── Preis ───────────────────────────────────────── */}
      <section className="px-8 md:px-16 lg:px-24 py-24">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <Reveal direction="left">
            <SectionHeader
              eyebrow="Im Lieferumfang"
              title={<>Was du<br /><GradientText>bekommst</GradientText></>}
              className="mb-8"
            />
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INCLUDED.map((item, i) => (
                <StaggerItem key={i}>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={15} strokeWidth={1.5} className="text-[#00C896] shrink-0 mt-0.5" />
                    <span className="text-[#9A9590] text-sm">{item}</span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </Reveal>

          <Reveal direction="right" delay={0.2}>
            <motion.div
              animate={{ boxShadow: ['0 0 0px rgba(201,168,76,0)', '0 0 40px rgba(201,168,76,0.15)', '0 0 0px rgba(201,168,76,0)'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="rounded-2xl">
              <Card variant="gold" padding="lg">
                <Badge variant="gold" className="mb-4">Einmalzahlung</Badge>
                <div className="flex items-end gap-2 mb-2">
                  <span className="font-display text-5xl text-[#F5F0E8]">XX</span>
                  <span className="font-display text-2xl text-[#C9A84C] mb-1">€</span>
                </div>
                <p className="text-[#9A9590] text-sm mb-6">Einmalig · Keine Folgekosten · Alle Updates inklusive</p>
                <HighlightLine className="mb-6">
                  Keine Cloud, kein Abo, kein Tracking. Deine Finanzen gehören dir.
                </HighlightLine>
                <CtaButton href="/contact" variant="primary" className="w-full justify-center">
                  Jetzt kaufen
                </CtaButton>
                <p className="text-[11px] text-[#5a5550] text-center mt-3 font-mono">
                  Fragen? hello@candlescope.de
                </p>
              </Card>
            </motion.div>
          </Reveal>
        </div>
      </section>

      <GoldDivider className="mx-8 md:mx-16 lg:px-24" />

      {/* ── Trading & DeFi ──────────────────────────────── */}
      <section className="px-8 md:px-16 lg:px-24 py-24">
        <div className="max-w-6xl mx-auto">
          <Reveal direction="up" className="mb-14">
            <SectionHeader
              eyebrow="Trading & DeFi"
              title={<>Märkte <GradientText>verstehen</GradientText></>}
              description="Insights zu Aktien, Krypto und DeFi — basierend auf eigener Erfahrung."
            />
          </Reveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {[
              { icon: <TrendingUp size={20} strokeWidth={1.5} />, title: 'Aktien & ETFs', desc: 'Langfristige Strategien, Portfolio-Aufbau und Marktanalysen.' },
              { icon: <Coins size={20} strokeWidth={1.5} />, title: 'Krypto & DeFi', desc: 'Bitcoin, Ethereum, DeFi-Protokolle und Risikomanagement.' },
              { icon: <Shield size={20} strokeWidth={1.5} />, title: 'Risiko & Strategie', desc: 'Diversifikation, Positionsgrößen und psychologische Fallstricke.' },
            ].map((item, i) => (
              <StaggerItem key={i}>
                <motion.div whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                  <Card variant="elevated">
                    <CardIcon>{item.icon}</CardIcon>
                    <h3 className="font-display text-lg text-[#F5F0E8] mb-2">{item.title}</h3>
                    <p className="text-[#9A9590] text-sm leading-relaxed">{item.desc}</p>
                  </Card>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
          <Reveal direction="up" delay={0.3}>
            <HighlightLine>
              Alle Inhalte zu Finanzen und Trading sind persönliche Meinung — keine Anlageberatung. Keine BaFin-Lizenz vorhanden.
            </HighlightLine>
          </Reveal>
        </div>
      </section>

      <GoldDivider className="mx-8 md:mx-16 lg:px-24" />

      {/* ── Final CTA ───────────────────────────────────── */}
      <section className="px-8 md:px-16 lg:px-24 py-24">
        <div className="max-w-2xl mx-auto">
          <Reveal direction="scale">
            <div className="text-center flex flex-col items-center gap-6">
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 3, repeat: Infinity }}
                className="w-16 h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
              <SectionHeader
                eyebrow="Loslegen"
                title={<>Finanzielle Kontrolle<br /><GradientText>ab heute</GradientText></>}
                description="Das CandleScope Haushaltsbuch — einmal kaufen, für immer nutzen."
                align="center"
              />
              <div className="flex items-center gap-4 flex-wrap justify-center">
                <CtaButton href="/contact" variant="primary">Jetzt kaufen</CtaButton>
                <CtaButton href="#haushaltsbuch" variant="ghost">Mehr erfahren</CtaButton>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}