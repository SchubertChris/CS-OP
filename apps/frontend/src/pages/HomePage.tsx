/* ============================================================
   CandleScope — Home Page (Redesign)
   src/pages/HomePage.tsx

   Premium-Editorial-Landingpage. Header/Footer/Theme kommen aus
   RootLayout (unverändert). Eigener Motion-Layer scoped auf diese
   Seite: ScrollThread (zeichnender Diamant + Checkpoints),
   FloatingFrames (schwebende Screenshots), Disziplin-Ticker,
   Count-ups, Ghost-Typo, Film-Grain. Alles reduced-motion-aware.
   ============================================================ */

import { useRef } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion, useScroll, useTransform, useSpring } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { GradientText } from '../components/ui'
import { useSiteImages } from '../hooks/useSiteImages'
import {
  Reveal, Stagger, StaggerItem, CountUp, DisciplineTicker, Magnetic,
} from '../components/home/primitives'
import ThreeParticleTimeline from '../components/home/ThreeParticleTimeline'
import FloatingFrame from '../components/home/FloatingFrame'
import HeroOrbit from '../components/home/HeroOrbit'
import CinematicScroll from '../components/home/CinematicScroll'
import { CASES } from '../data/cases'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]
const SECTION = 'px-6 md:px-12 lg:px-20 max-w-[1320px] mx-auto'

/* ─── EYEBROW ─────────────────────────────────────────────── */
function Eyebrow({ num, children }: { num: string; children: ReactNode }) {
  return (
    <Reveal className="flex items-center gap-3 font-mono text-[0.72rem] tracking-[0.2em] uppercase text-[var(--cs-text-2)] mb-8">
      <span className="text-[#C9A84C]">{num}</span>
      <span>{children}</span>
    </Reveal>
  )
}

/* ─── GHOST WORD ──────────────────────────────────────────── */
function Ghost({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  // Glide horizontally based on scroll depth
  const xRaw = useTransform(scrollYProgress, [0, 1], [-80, 80])
  const x = useSpring(xRaw, { stiffness: 60, damping: 25 })

  return (
    <motion.span
      ref={ref}
      aria-hidden="true"
      style={reduced ? undefined : { x }}
      className={`pointer-events-none select-none absolute font-display font-semibold leading-[0.8] tracking-[-0.04em] text-[var(--cs-text)] opacity-[0.035] ${className ?? ''}`}
    >
      {children}
    </motion.span>
  )
}

/* ══════════════════════════════════════════════════════════════
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const pageRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { img } = useSiteImages()

  // Scroll-driven diamond masking transition for the introductory section
  const { scrollYProgress: sectionScroll } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const clipSize = useTransform(sectionScroll, [0.08, 0.45], [0, 240])
  const smoothClipSize = useSpring(clipSize, { stiffness: 85, damping: 20 })
  const clipPathValue = useTransform(smoothClipSize, (v) => {
    const half = v / 2
    const top = 50 - half
    const bottom = 50 + half
    const left = 50 - half
    const right = 50 + half
    return `polygon(50% ${top}%, ${right}% 50%, 50% ${bottom}%, ${left}% 50%)`
  })

  const blurIn = (delay = 0) =>
    reduced
      ? { initial: false as const, animate: { opacity: 1, y: 0, filter: 'blur(0px)' } }
      : {
        initial: { opacity: 0, y: 34, filter: 'blur(14px)' },
        animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
        transition: { duration: 1.1, delay, ease: EASE },
      }

  return (
    <div ref={pageRef} className="relative" style={{ overflowX: 'clip' }}>
      <ThreeParticleTimeline targetRef={pageRef} />

      <div className="relative z-[5]">

        {/* ═══════════ HERO ═══════════ */}
        <section className="min-h-[100svh] grid lg:grid-cols-[1.08fr_0.92fr] lg:items-center gap-10 lg:gap-14 px-6 md:px-12 lg:px-20 max-w-[1320px] mx-auto pt-32 pb-16">
          <div className="flex flex-col justify-center">
            <motion.div {...blurIn(0)}
              className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-2.5 font-mono uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[0.62rem] sm:text-[0.72rem] text-[var(--cs-text-2)] mb-7 bg-white/4 border border-white/5 rounded-2xl sm:rounded-full px-4 py-2 sm:px-4.5 sm:py-1.5 max-w-full backdrop-blur-sm">
              <span>Chris Schubert</span>
              <span className="text-[var(--cs-text-4)]">·</span>
              <span>Fullstack Developer</span>
              <span className="text-[var(--cs-text-4)]">·</span>
              <span>Potsdam, DE</span>
            </motion.div>

            <h1 className="font-display font-semibold leading-[0.95] tracking-[-0.04em] pr-2"
              style={{ fontSize: 'clamp(3rem, 1.2rem + 5.8vw, 6.2rem)' }}>
              <motion.span className="block" {...blurIn(0.05)}>Premium ist keine Sparte.</motion.span>
              <motion.span className="block mt-2" {...blurIn(0.18)}>
                <GradientText>Es ist meine Bauweise.</GradientText>
              </motion.span>
            </h1>

            {/* Disziplin-Ticker */}
            <motion.div {...blurIn(0.3)}
              className="flex items-baseline gap-3 mt-8 font-mono"
              style={{ fontSize: 'clamp(1rem, 0.9rem + 0.5vw, 1.35rem)' }}>
              <span className="uppercase tracking-[0.18em] text-[0.7em] text-[var(--cs-text-3)]">Ich baue</span>
              <span className="text-[var(--cs-text-4)]">→</span>
              <DisciplineTicker className="text-[#C9A84C] font-medium" />
            </motion.div>

            <Reveal delay={0.4} className="mt-8 max-w-[62ch]">
              <p className="leading-relaxed text-[var(--cs-text-2)]"
                style={{ fontSize: 'clamp(1.1rem, 1rem + 0.55vw, 1.45rem)' }}>
                Ein Entwickler, viele Disziplinen — Finanz, Security, Commerce.
                Selbst gebaut, selbst deployed, kompromisslos zu Ende gedacht.
              </p>
            </Reveal>

            <Reveal delay={0.5} className="flex flex-wrap items-center gap-5 mt-10">
              <Magnetic strength={0.15}>
                <a href="#work"
                  className="cs-btn-pill cs-btn-pill-primary px-8 py-4 text-[11px]">
                  Arbeiten ansehen
                </a>
              </Magnetic>
              <Magnetic strength={0.15}>
                <Link to="/contact"
                  className="cs-btn-pill cs-btn-pill-secondary px-8 py-4 text-[11px]">
                  Projekt starten
                </Link>
              </Magnetic>
            </Reveal>

            {/* Status + Stack */}
            <Reveal delay={0.58} className="flex flex-wrap items-center gap-x-5 gap-y-3 mt-10 font-mono">
              <span className="inline-flex items-center gap-2.5 text-[0.72rem] uppercase tracking-[0.18em] text-[var(--cs-text)]">
                <span className="relative flex w-2 h-2">
                  <span className="absolute inset-0 rounded-full bg-[#00C896] animate-ping opacity-60" />
                  <span className="relative inline-flex rounded-full w-2 h-2 bg-[#00C896]" />
                </span>
                Verfügbar für Projekte
              </span>
              <span className="w-px h-3.5 bg-[var(--cs-border-w3)]" />
              <div className="flex flex-wrap gap-2">
                {['React', 'TypeScript', 'Node', 'Electron'].map(t => (
                  <span key={t} className="px-3 py-1 rounded-full border border-[var(--cs-border-w)] text-[0.66rem] tracking-[0.12em] uppercase text-[var(--cs-text-2)]">{t}</span>
                ))}
              </div>
            </Reveal>

            {/* Count-up Stats */}
            <Reveal delay={0.66} className="flex flex-wrap items-baseline gap-x-8 gap-y-3 mt-10 font-mono">
              {[
                { to: 4, suffix: '', label: 'Produkte live' },
                { to: 13, suffix: '+', label: 'Jahre Code' },
                { to: 100, suffix: '%', label: 'selbst deployed' },
              ].map(s => (
                <span key={s.label} className="flex items-baseline gap-2">
                  <span className="font-display font-semibold text-[1.7rem] leading-none text-[var(--cs-text)]">
                    <CountUp to={s.to} suffix={s.suffix} />
                  </span>
                  <span className="text-[0.66rem] tracking-[0.16em] uppercase text-[var(--cs-text-3)]">{s.label}</span>
                </span>
              ))}
            </Reveal>
          </div>

          {/* Rechte Hero-Grafik (Universum/Orbit) — nur Desktop */}
          <div className="hidden lg:flex items-center justify-center">
            <HeroOrbit />
          </div>
        </section>



        {/* ═══════════ WAS ICH MACHE ═══════════ */}
        <div ref={sectionRef} className="relative">
          <motion.section
            style={reduced ? undefined : { clipPath: clipPathValue }}
            className="px-8 md:px-16 lg:px-24 max-w-[1240px] mx-auto py-20 md:py-28 cs-glass-panel border border-gold/15 rounded-3xl my-16 relative overflow-hidden"
          >
            {/* Ambient golden core inside the portal */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(201,168,76,0.06)_0%,transparent_70%)]" />

            <div className="relative z-10">
              <Eyebrow num="(01)">Was ich mache</Eyebrow>
              <Reveal delay={0.1}>
                <p className="font-display font-medium tracking-[-0.02em] leading-[1.28] max-w-[24ch] text-[var(--cs-text)]"
                  style={{ fontSize: 'clamp(2rem, 1.4rem + 2.6vw, 3.25rem)' }}>
                  Ich baue <span className="text-[#C9A84C]">Premium-Software</span> — vom{' '}
                  <span className="text-[#C9A84C]">Finanz-Tresor</span> bis zum{' '}
                  <span className="text-[#C9A84C]">Security-Tool</span>, end-to-end deployed.
                </p>
              </Reveal>
            </div>
          </motion.section>
        </div>

        {/* ═══════════ SELECTED WORK ═══════════ */}
        <section id="work" className="py-16 md:py-24 relative">
          <div className={`${SECTION} relative mb-8`}>
            <Ghost className="top-2 right-2 lg:right-8 leading-[0.8]" >
              <span style={{ fontSize: 'clamp(3.5rem,11vw,13rem)' }}>SECURITY</span>
            </Ghost>

            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <Eyebrow num="(02)">Selected Work</Eyebrow>
                <Reveal delay={0.1}>
                  <h2 className="font-display font-semibold tracking-[-0.02em] leading-none text-[var(--cs-text)]"
                    style={{ fontSize: 'clamp(2rem, 1.4rem + 2.6vw, 3.25rem)' }}>
                    Vier Produkte. Vier Disziplinen.
                  </h2>
                </Reveal>
              </div>
            </div>

            {/* Disziplin-Chips */}
            <Stagger className="flex flex-wrap gap-2.5 mt-8 mb-4">
              {['Finanz', 'CRM', 'Commerce', 'Security'].map(d => (
                <StaggerItem key={d}>
                  <span className="px-3.5 py-1.5 rounded-full border border-[#C9A84C]/30 font-mono text-[0.64rem] tracking-[0.18em] uppercase text-[#C9A84C]">{d}</span>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          <CinematicScroll cases={CASES} />
        </section>

        {/* ═══════════ DER MACHER ═══════════ */}
        <section className={`${SECTION} py-24 md:py-36 relative`}>
          <Ghost className="bottom-0 left-2 lg:left-8">
            <span style={{ fontSize: 'clamp(6rem,15vw,17rem)' }}>GEN.AI</span>
          </Ghost>

          <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-16 items-center relative">
            <FloatingFrame src={img('chris')} label="Chris Schubert" chrome="Portrait" ratio="4/5" glow="50% 35%" from="left" />
            <div>
              <Eyebrow num="(03)">Der Macher</Eyebrow>
              <Reveal delay={0.1}>
                <h2 className="font-display font-semibold tracking-[-0.02em] text-[var(--cs-text)] mb-7"
                  style={{ fontSize: 'clamp(2rem, 1.4rem + 2.6vw, 3.25rem)' }}>
                  Ich bin Chris Schubert.
                </h2>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="text-[var(--cs-text-2)] leading-relaxed mb-4 max-w-[60ch]">
                  Ich baue Fullstack — vom Datenmodell bis zur letzten Pixel-Politur — und liefere
                  Produkte end-to-end: gebaut, deployed, übergeben.
                </p>
              </Reveal>
              <Reveal delay={0.22}>
                <p className="text-[var(--cs-text-2)] leading-relaxed mb-8 max-w-[60ch]">
                  Ehrlich, ohne Hype und ohne Buzzword-Bingo. Was ich verspreche, steht am Ende live im Netz.
                </p>
              </Reveal>
              <Reveal delay={0.28}>
                <p className="border-l-2 border-[#C9A84C] pl-6 font-medium tracking-[-0.01em] leading-[1.4] text-[var(--cs-text)] mb-8 max-w-[42ch]"
                  style={{ fontSize: 'clamp(1.25rem, 1rem + 1vw, 1.7rem)' }}>
                  Kein Influencer. Kein Coach. Jemand der baut — und deployed.
                </p>
              </Reveal>
              <Reveal delay={0.34}>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[0.72rem] tracking-[0.14em] uppercase text-[var(--cs-text-3)]">
                  <span>Potsdam, DE</span>
                  <span className="text-[var(--cs-text-4)]">/</span>
                  <span>Fullstack</span>
                  <span className="text-[var(--cs-text-4)]">/</span>
                  <Link to="/about" className="inline-flex items-center gap-1.5 text-[var(--cs-text-2)] hover:text-[#C9A84C] transition-colors">
                    Mehr über mich <ArrowUpRight size={13} strokeWidth={1.6} />
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ═══════════ PROZESS ═══════════ */}
        <section className={`${SECTION} py-24 md:py-36 relative`}>
          <Eyebrow num="(04)">Prozess</Eyebrow>

          <Stagger className="grid md:grid-cols-2 gap-6 lg:gap-8 mt-12" gap={0.12}>
            {[
              { n: '01', t: 'Verstehen', d: 'Erst das Problem, dann der Code. Ich höre zu und denke das Ziel zu Ende.' },
              { n: '02', t: 'Konzept', d: 'Klarer Plan mit ehrlicher Aufwandsschätzung — bevor eine Zeile geschrieben wird.' },
              { n: '03', t: 'Bauen', d: 'Frühes echtes Deployment statt Mockups — du siehst Fortschritt, kein Versprechen.' },
              { n: '04', t: 'Liefern & Übergeben', d: 'Deployed, dokumentiert und sauber übergeben — bereit für den Betrieb.' },
            ].map(step => (
              <StaggerItem key={step.n} className="cs-glass-panel cs-glass-panel-glow p-8 rounded-2xl relative overflow-hidden group">
                {/* Accent glow corner */}
                <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(201,168,76,0.04)_0%,transparent_70%)] group-hover:bg-[radial-gradient(circle_at_top_right,rgba(201,168,76,0.08)_0%,transparent_70%)] transition-colors duration-500" />

                <div className="font-mono text-[1.4rem] font-bold tracking-[0.1em] text-[#C9A84C]/30 group-hover:text-[#C9A84C]/80 transition-colors duration-400 mb-6">{step.n}</div>
                <h3 className="font-display font-semibold tracking-[-0.02em] text-[var(--cs-text)] mb-3"
                  style={{ fontSize: 'clamp(1.5rem, 1.1rem + 1.4vw, 2.2rem)' }}>{step.t}</h3>
                <p className="text-[var(--cs-text-2)] leading-relaxed">{step.d}</p>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal delay={0.2}>
            <p className="mt-14 text-center font-mono text-[0.74rem] tracking-[0.14em] uppercase text-[var(--cs-text-3)]">
              Antwort in 24h · transparente Kosten · sauber dokumentiert
            </p>
          </Reveal>
        </section>

        {/* ═══════════ KONTAKT ═══════════ */}
        <section id="kontakt" className="px-6 md:px-12 lg:px-20 max-w-[1000px] mx-auto py-24 md:py-36">
          <div className="cs-glass-panel border border-gold/20 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
            {/* Ambient gold glow */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(201,168,76,0.06)_0%,transparent_70%)]" />

            <div className="relative z-10">
              <Eyebrow num="(05)">Lass uns reden</Eyebrow>
              <Reveal delay={0.1}>
                <h2 className="font-display font-semibold tracking-[-0.03em] leading-none text-[var(--cs-text)]"
                  style={{ fontSize: 'clamp(2.4rem, 1.4rem + 4vw, 4.5rem)' }}>
                  Hast du ein Projekt?<br />
                  <span className="block mt-3"><GradientText>Lass es uns bauen.</GradientText></span>
                </h2>
              </Reveal>
              <Reveal delay={0.18}>
                <p className="mt-7 text-[var(--cs-text-2)]" style={{ fontSize: 'clamp(1.1rem, 1rem + 0.55vw, 1.5rem)' }}>
                  Antwort in 24h.
                </p>
              </Reveal>
              <Reveal delay={0.26}>
                <div className="mt-10">
                  <Magnetic strength={0.15}>
                    <Link to="/contact"
                      className="cs-btn-pill cs-btn-pill-primary px-10 py-4.5 text-[12px]">
                      Projekt starten
                    </Link>
                  </Magnetic>
                </div>
              </Reveal>
              <Reveal delay={0.32}>
                <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 font-mono text-[0.78rem] tracking-[0.1em]">
                  <a href="mailto:info@candlescope.de" className="text-[var(--cs-text)] hover:text-[#C9A84C] transition-colors duration-300">info@candlescope.de</a>
                  <span className="text-[var(--cs-text-4)]">·</span>
                  <a href="https://github.com/SchubertChris" target="_blank" rel="noopener noreferrer"
                    className="text-[var(--cs-text-2)] hover:text-[#C9A84C] transition-colors duration-300">GitHub</a>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
