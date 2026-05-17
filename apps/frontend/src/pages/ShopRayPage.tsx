/* ============================================================
   CandleScope — ShopRay Page
   src/pages/ShopRayPage.tsx
   ============================================================ */

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  SectionHeader, GoldDivider, Card, CardIcon,
  GradientText, Badge, CtaButton, HighlightLine,
} from '../components/ui'
import {
  ShoppingBag, LayoutDashboard, CreditCard, Database,
  Shield, Smartphone, Code2, Zap, FileCheck,
  ArrowRight, Check, Users, Globe, Lock, Server,
} from 'lucide-react'

import imgShop         from '../assets/images/Shop.webp'
import imgAdmin        from '../assets/images/AdminDashboard.webp'
import imgKollektionen from '../assets/images/Kollektionen.webp'
import imgAccount      from '../assets/images/AccountDash.webp'
import imgWunschliste  from '../assets/images/AccountWunschliste.webp'

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
    up:    { hidden: { opacity: 0, y: 48 }, visible: { opacity: 1, y: 0 } },
    left:  { hidden: { opacity: 0, x: -60 }, visible: { opacity: 1, x: 0 } },
    right: { hidden: { opacity: 0, x: 60 },  visible: { opacity: 1, x: 0 } },
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
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className={className}>
      {children}
    </motion.div>
  )
}

function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={{
      hidden: { opacity: 0, y: 32, filter: 'blur(6px)' },
      visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
    }} className={className}>
      {children}
    </motion.div>
  )
}

/* ── Char-by-char Title ────────────────────────────────────── */
const CHAR_VARIANTS = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.025, duration: 0.55, ease: 'easeOut' as const },
  }),
}

function AnimatedTitle({ line1, line2 }: { line1: string; line2: string }) {
  const c1 = line1.split('')
  const c2 = line2.split('')
  return (
    <h1 className="font-display leading-[1.05] tracking-[-0.01em] mb-8">
      <span className="block text-5xl sm:text-6xl md:text-7xl xl:text-8xl text-[#C9A84C]">
        {c1.map((ch, i) => (
          <motion.span key={i} custom={i} variants={CHAR_VARIANTS} initial="hidden" animate="visible"
            className="inline-block" style={{ whiteSpace: ch === ' ' ? 'pre' : 'normal' }}>{ch}</motion.span>
        ))}
      </span>
      <span className="block text-5xl sm:text-6xl md:text-7xl xl:text-8xl text-[var(--cs-text)]">
        {c2.map((ch, i) => (
          <motion.span key={i} custom={c1.length + i} variants={CHAR_VARIANTS} initial="hidden" animate="visible"
            className="inline-block" style={{ whiteSpace: ch === ' ' ? 'pre' : 'normal' }}>{ch}</motion.span>
        ))}
      </span>
    </h1>
  )
}

/* ── Screenshot Frame ──────────────────────────────────────── */
function ScreenshotFrame({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`rounded-2xl overflow-hidden border border-[#C9A84C]/20 shadow-2xl shadow-black/50 ${className}`}>
      {/* Browser chrome */}
      <div className="bg-[var(--cs-s4)] px-4 py-2.5 flex items-center gap-2 border-b border-[#C9A84C]/8">
        <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#eab308]/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]/60" />
        <span className="text-[var(--cs-text-4)] text-[9px] ml-2 font-mono tracking-wider">shopray.demo</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="text-[var(--cs-text-4)] text-[8px] font-mono tracking-wider">LIVE</span>
        </div>
      </div>
      <img src={src} alt={alt} className="w-full h-auto block" loading="lazy" />
    </div>
  )
}

/* ── Custom ShopRay Hero ────────────────────────────────────── */
function ShopRayHero() {
  return (
    <section className="relative min-h-[92vh] flex flex-col justify-end pb-20 md:pb-28 px-8 md:px-16 lg:px-24 pt-28 overflow-hidden">

      {/* Ambient background */}
      <motion.div className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}>
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(201,168,76,0.025) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(201,168,76,0.025) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }} />
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#C9A84C]/6 blur-[100px]" />
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-[#C9A84C]/3 blur-[120px]" />
      </motion.div>

      {/* Left accent line */}
      <motion.div
        className="absolute left-8 md:left-16 lg:left-24 top-28 w-px bg-gradient-to-b from-[#C9A84C]/50 via-[#C9A84C]/10 to-transparent"
        style={{ height: '55%' }}
        initial={{ scaleY: 0, originY: 0 }} animate={{ scaleY: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      />

      {/* Content grid */}
      <div className="relative z-10 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

        {/* Left: Text */}
        <div className="max-w-xl">
          <motion.div className="flex items-center gap-4 mb-8"
            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}>
            <span className="w-6 h-px bg-[#C9A84C]" />
            <span className="text-[11px] tracking-[0.22em] uppercase text-[#C9A84C] font-medium">
              Shop-Template · Für Entwickler
            </span>
            <motion.span className="text-[10px] tracking-[0.12em] uppercase border border-[#C9A84C]/25 text-[#C9A84C]/60 px-3 py-1 rounded-full"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}>
              v1.0 · Einmalig
            </motion.span>
          </motion.div>

          <AnimatedTitle line1="Dein Shop." line2="Sofort fertig." />

          <motion.p className="text-[var(--cs-text-3)] text-base md:text-lg max-w-xl leading-relaxed mb-10"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.75 }}>
            Vollständiges React + Node.js Shop-Template — Frontend, Backend, Admin-Panel,
            Stripe und Supabase bereits integriert. Einmal kaufen, beliebig oft einsetzen.
          </motion.p>

          <motion.div className="flex items-center gap-4 flex-wrap mb-10"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.95 }}>
            <CtaButton href="/contact" variant="primary">Jetzt anfragen</CtaButton>
            <a href="https://shopray-indol.vercel.app" target="_blank" rel="noopener noreferrer"
              className="text-[11px] tracking-[0.16em] uppercase text-[var(--cs-text-3)] hover:text-[var(--cs-text)] transition-colors duration-300 flex items-center gap-2 group">
              Live-Demo
              <span className="w-4 h-px bg-current transition-all duration-300 group-hover:w-6" />
            </a>
          </motion.div>

          {/* Stats strip */}
          <motion.div className="pt-5 border-t border-[#C9A84C]/8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
            <div className="flex flex-wrap items-center gap-6">
              {[
                { val: '3',   label: 'Projekte' },
                { val: '30+', label: 'API-Routen' },
                { val: '12',  label: 'Pages' },
                { val: '1×',  label: 'Zahlung' },
              ].map(({ val, label }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <span className="font-mono text-[15px] text-[#C9A84C] leading-none tabular-nums">{val}</span>
                  <span className="font-mono text-[8px] tracking-[0.18em] uppercase text-[var(--cs-text-4)]">{label}</span>
                </div>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--cs-text-4)]">Deploy-ready</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: Floating Screenshots */}
        <div className="relative hidden lg:block h-[520px]">

          {/* Glow halo behind screenshots */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(201,168,76,0.12) 0%, transparent 70%)' }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Main screenshot: Shop */}
          <motion.div
            className="absolute top-0 left-0 right-0"
            initial={{ opacity: 0, x: 60, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              style={{ rotate: -1.5 }}>
              {/* Shine sweep */}
              <div className="relative overflow-hidden rounded-2xl">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 pointer-events-none z-10"
                  initial={{ x: '-100%' }} animate={{ x: '200%' }}
                  transition={{ duration: 1.4, delay: 1.0, ease: 'easeInOut' }}
                />
                <ScreenshotFrame src={imgShop} alt="ShopRay Shop" />
              </div>
            </motion.div>
          </motion.div>

          {/* Secondary screenshot: Admin — offset right + lower */}
          <motion.div
            className="absolute bottom-0 right-[-40px] w-[65%]"
            initial={{ opacity: 0, x: 40, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
              style={{ rotate: 1.5 }}>
              <ScreenshotFrame src={imgAdmin} alt="ShopRay Admin" />
            </motion.div>
          </motion.div>

        </div>
      </div>

      {/* Scroll hint */}
      <motion.div className="absolute bottom-8 left-8 md:left-16 lg:left-24 flex items-center gap-3 z-10"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
        <motion.span className="w-px h-6 bg-gradient-to-b from-[#C9A84C]/60 to-transparent block"
          animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }} />
        <span className="text-[10px] tracking-[0.16em] uppercase text-[var(--cs-text-4)]">Scroll</span>
      </motion.div>

      {/* Bottom divider */}
      <motion.div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/15 to-transparent"
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }} />
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════════════ */
const FEATURES = [
  {
    icon: <ShoppingBag size={22} strokeWidth={1.5} />,
    title: 'Vollständiges Frontend',
    desc: 'React 19 + TypeScript + SCSS. Shop, Produktdetail, Warenkorb, Checkout, Auth, Profil, Bestellhistorie, DSGVO — alles fertig.',
    badge: 'React + SCSS', badgeVariant: 'gold' as const,
  },
  {
    icon: <Server size={22} strokeWidth={1.5} />,
    title: 'Express Backend',
    desc: 'Node.js + Express + Zod-Validierung. REST-API für Produkte, Bestellungen, Auth, Admin. Supabase als Datenbank.',
    badge: 'Node.js + Zod', badgeVariant: 'muted' as const,
  },
  {
    icon: <LayoutDashboard size={22} strokeWidth={1.5} />,
    title: 'Admin Panel',
    desc: 'Eigenes React Admin-Panel mit 2FA (TOTP), Produkt- und Bestellverwaltung, Kundenliste, Support-Tickets, Statistiken.',
    badge: '2FA inklusive', badgeVariant: 'green' as const,
  },
  {
    icon: <CreditCard size={22} strokeWidth={1.5} />,
    title: 'Stripe Payments',
    desc: 'Stripe Checkout komplett eingebaut — Webhook, Zahlungsbestätigung, Test-Keys dokumentiert. Sofort einsatzbereit.',
    badge: 'Stripe', badgeVariant: 'muted' as const,
  },
  {
    icon: <Database size={22} strokeWidth={1.5} />,
    title: 'Supabase Datenbank',
    desc: 'Vollständiges Schema mit RLS, Migrations-Skripte, Seed-Daten. Supabase Auth mit Google OAuth und TOTP-MFA.',
    badge: 'Supabase', badgeVariant: 'muted' as const,
  },
  {
    icon: <Shield size={22} strokeWidth={1.5} />,
    title: 'DSGVO-konform',
    desc: 'ConsentBanner, Datenschutz, Impressum, AGB, "Meine Daten"-Seite, Account-Löschung. Alles nach deutschem Recht.',
    badge: 'Rechtssicher', badgeVariant: 'gold' as const,
  },
  {
    icon: <Smartphone size={22} strokeWidth={1.5} />,
    title: 'Mobile First',
    desc: 'Vollständig responsive. Alle Seiten auf Desktop, Tablet und Mobile getestet — keine Nacharbeit nötig.',
    badge: 'Responsive', badgeVariant: 'muted' as const,
  },
  {
    icon: <Zap size={22} strokeWidth={1.5} />,
    title: 'Vercel Deploy',
    desc: '3 separate Vercel-Projekte (Frontend, Backend, Admin) — ein `git push` und alle 3 bauen automatisch.',
    badge: 'One-Push', badgeVariant: 'green' as const,
  },
]

const STACK = [
  'React 19', 'TypeScript', 'SCSS (7-1)', 'Express.js', 'Node.js',
  'Supabase', 'PostgreSQL', 'Stripe', 'Zod', 'Vercel',
  'Supabase Auth', 'TOTP 2FA', 'RLS Policies', 'Vite', 'React Router',
]

const INCLUDES = [
  '12 Frontend-Seiten komplett fertig',
  'Vollständiges Admin Panel (8 Seiten)',
  'REST API mit 30+ Endpunkten',
  'Datenbankschema + 9 Migrations',
  'Seed-Daten (25 Produkte, Testkunden)',
  'SETUP.md — Schritt-für-Schritt Anleitung',
  'Stripe Test-Keys Dokumentation',
  'LMIV-konformes Produktdetail (Nährwerte)',
  'Produktbilder via Supabase Storage',
  'Demo-Mode (schreibende Aktionen geblockt)',
]

/* ══════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════ */
export default function ShopRayPage() {
  return (
    <div style={{ overflowX: 'hidden' }}>

      {/* ── 1. Custom Hero mit Screenshots ───────────────── */}
      <ShopRayHero />

      {/* ── 2. Screenshot-Galerie ─────────────────────────── */}
      <section className="px-8 md:px-16 lg:px-24 py-16 max-w-7xl mx-auto">
        <Reveal direction="up" className="mb-10">
          <div className="flex items-center gap-3">
            <div className="w-1 h-1 rounded-full bg-[#C9A84C] animate-pulse" />
            <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--cs-text-3)]">
              Alle Bereiche im Überblick
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-[#C9A84C]/20 to-transparent" />
          </div>
        </Reveal>

        {/* Top row: 3 screenshots */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {[
            { src: imgKollektionen, alt: 'Kollektionen-Seite' },
            { src: imgShop,         alt: 'Shop-Übersicht' },
            { src: imgAccount,      alt: 'Kunden-Dashboard' },
          ].map((item, i) => (
            <StaggerItem key={i}>
              <motion.div whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                <ScreenshotFrame src={item.src} alt={item.alt} />
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Bottom row: 2 screenshots wider */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { src: imgAdmin,       alt: 'Admin Dashboard' },
            { src: imgWunschliste, alt: 'Wunschliste' },
          ].map((item, i) => (
            <StaggerItem key={i}>
              <motion.div whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                <ScreenshotFrame src={item.src} alt={item.alt} />
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* ── 3. Features ───────────────────────────────────── */}
      <section className="px-8 md:px-16 lg:px-24 py-24 max-w-6xl mx-auto">
        <Reveal direction="up" className="mb-16">
          <SectionHeader
            eyebrow="Was enthalten ist"
            title={<>Alles drin.<br /><GradientText>Nichts fehlt.</GradientText></>}
            description="ShopRay ist kein Starter-Template — es ist ein fertig gebauter Shop. Verbinden, deployen, verkaufen."
          />
        </Reveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <StaggerItem key={i}>
              <Card variant={i === 0 ? 'gold' : 'elevated'} padding="lg" className="h-full">
                <div className="flex items-start justify-between mb-4">
                  <CardIcon>{f.icon}</CardIcon>
                  <Badge variant={f.badgeVariant}>{f.badge}</Badge>
                </div>
                <h3 className="font-display text-[15px] text-[var(--cs-text)] mb-2 leading-snug">{f.title}</h3>
                <p className="text-[var(--cs-text-2)] text-[12.5px] leading-relaxed">{f.desc}</p>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* ── 4. Was du bekommst ────────────────────────────── */}
      <section className="px-8 md:px-16 lg:px-24 py-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <Reveal direction="left">
            <SectionHeader
              eyebrow="Lieferumfang"
              title={<>Was du<br /><GradientText>bekommst.</GradientText></>}
              description="Alle Dateien, vollständige Dokumentation und direkter Ansprechpartner bei Fragen."
              className="mb-8"
            />
            <div className="flex flex-col gap-2.5 mb-6">
              {INCLUDES.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check size={15} strokeWidth={2} className="text-[#C9A84C] shrink-0 mt-0.5" />
                  <span className="text-[var(--cs-text-2)] text-sm">{item}</span>
                </div>
              ))}
            </div>
            <HighlightLine>
              Source Code komplett, keine Minifizierung, keine Lizenzbeschränkung für eigene Projekte.
            </HighlightLine>

            {/* Tech Stack Tags */}
            <div className="mt-6 p-5 rounded-2xl border border-[#C9A84C]/15 bg-[#C9A84C]/3">
              <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#C9A84C] mb-3">Tech Stack</p>
              <div className="flex flex-wrap gap-2">
                {STACK.map((tag) => (
                  <span key={tag} className="font-mono text-[10px] tracking-[0.1em] px-2.5 py-1 rounded-full border border-[#C9A84C]/15 bg-[#C9A84C]/5 text-[var(--cs-text-2)]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Right: Screenshots stacked */}
          <Reveal direction="right" delay={0.1}>
            <div className="flex flex-col gap-4">
              <motion.div whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                <ScreenshotFrame src={imgAccount} alt="Kundenprofil" />
              </motion.div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <Globe size={14} />, label: 'Frontend', sub: 'Vercel' },
                  { icon: <Server size={14} />, label: 'Backend', sub: 'Vercel' },
                  { icon: <LayoutDashboard size={14} />, label: 'Admin', sub: 'Vercel' },
                  { icon: <Database size={14} />, label: 'Database', sub: 'Supabase' },
                ].map((p) => (
                  <div key={p.label} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--cs-border-w)] bg-[var(--cs-s1)]">
                    <div className="w-8 h-8 rounded-lg bg-[#C9A84C]/8 border border-[#C9A84C]/15 flex items-center justify-center text-[#C9A84C]/70 shrink-0">
                      {p.icon}
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-[var(--cs-text)]">{p.label}</p>
                      <p className="text-[10px] text-[var(--cs-text-3)]">{p.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* ── 5. Für wen ────────────────────────────────────── */}
      <section className="px-8 md:px-16 lg:px-24 py-24 max-w-6xl mx-auto">
        <Reveal direction="up" className="mb-14">
          <SectionHeader
            eyebrow="Zielgruppe"
            title={<>Für wen ist<br /><GradientText>ShopRay?</GradientText></>}
          />
        </Reveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: <Code2 size={22} strokeWidth={1.5} />,
              badge: 'Entwickler', badgeVariant: 'gold' as const,
              title: 'Freelancer & Devs',
              desc: 'Du willst schnell einen Shop deployen ohne alles von Grund auf zu bauen. ShopRay gibt dir 80% der Arbeit fertig.',
              items: ['Sofort deployen', 'Eigener Code', 'Anpassbar'],
            },
            {
              icon: <Users size={22} strokeWidth={1.5} />,
              badge: 'Agenturen', badgeVariant: 'green' as const,
              title: 'Web-Agenturen',
              desc: 'Einmal kaufen, mehrfach einsetzen. Liefere Kundenprojekte schneller aus — das Template ist die Basis.',
              items: ['Mehrfachlizenz', 'Weiterverkäuflich', 'Dokumentiert'],
            },
            {
              icon: <ShoppingBag size={22} strokeWidth={1.5} />,
              badge: 'Gründer', badgeVariant: 'muted' as const,
              title: 'Shop-Betreiber',
              desc: 'Du hast einen Entwickler der ein Template braucht — ShopRay ist der Startpunkt ohne monatelange Entwicklungszeit.',
              items: ['Fertige Basis', 'Stripe ready', 'DSGVO konform'],
            },
          ].map((item, i) => (
            <StaggerItem key={i}>
              <motion.div whileHover={{ y: -5, transition: { duration: 0.2 } }} className="h-full">
                <Card variant={i === 1 ? 'gold' : 'elevated'} padding="lg" className="h-full group">
                  <div className="flex items-start justify-between mb-5">
                    <CardIcon>{item.icon}</CardIcon>
                    <Badge variant={item.badgeVariant}>{item.badge}</Badge>
                  </div>
                  <h3 className="font-display text-xl text-[var(--cs-text)] mb-3 group-hover:text-[#C9A84C] transition-colors">{item.title}</h3>
                  <p className="text-[var(--cs-text-2)] text-sm leading-relaxed mb-5">{item.desc}</p>
                  <div className="flex flex-col gap-1.5 mt-auto">
                    {item.items.map((it) => (
                      <div key={it} className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-[#C9A84C]/50 shrink-0" />
                        <span className="text-[12px] text-[var(--cs-text-2)]">{it}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* ── 6. Preis & CTA ────────────────────────────────── */}
      <section className="px-8 md:px-16 lg:px-24 py-24">
        <div className="max-w-3xl mx-auto">
          <Reveal direction="scale">
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-16 h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent mx-auto mb-8"
            />
            <div className="text-center mb-10">
              <SectionHeader
                eyebrow="Preis & Lizenz"
                title={<>Einmal kaufen.<br /><GradientText>Für immer einsetzen.</GradientText></>}
                description="Keine monatlichen Gebühren, keine Einschränkungen. Source Code komplett inklusive."
                align="center"
                className="mb-10"
              />
            </div>

            <div className="relative p-8 rounded-3xl border border-[#C9A84C]/25 bg-gradient-to-b from-[#C9A84C]/5 to-transparent text-center mb-8">
              <motion.div
                className="absolute -inset-px rounded-3xl pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.12) 0%, transparent 60%)' }}
              />
              <Badge variant="gold" className="mb-6">Einmalige Lizenz</Badge>
              <div className="mb-2">
                <span className="font-display text-6xl text-[var(--cs-text)]">Auf Anfrage</span>
              </div>
              <p className="text-[var(--cs-text-3)] text-sm mb-8">
                Preis richtet sich nach Nutzungsart — Einzelentwickler, Agentur oder White-Label.
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-8 text-left">
                {[
                  'Frontend + Backend + Admin',
                  'Vollständige Dokumentation',
                  'Stripe + Supabase Setup',
                  'Unbegrenzte eigene Projekte',
                  'Source Code ohne Einschränkung',
                  'Direkter Support via E-Mail',
                ].map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <Check size={13} strokeWidth={2} className="text-[#C9A84C] shrink-0 mt-0.5" />
                    <span className="text-[var(--cs-text-2)] text-[12px]">{f}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <CtaButton href="/contact" variant="primary">Jetzt anfragen</CtaButton>
                <a href="https://shopray-indol.vercel.app" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[11px] tracking-[0.12em] uppercase text-[var(--cs-text-2)] hover:text-[#C9A84C] transition-colors group">
                  <Lock size={12} strokeWidth={1.5} />
                  Demo ansehen
                  <ArrowRight size={11} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            <div className="flex items-center justify-center gap-8 flex-wrap">
              {[
                { icon: <FileCheck size={14} />, text: 'Kein Abo' },
                { icon: <Shield size={14} />, text: 'DSGVO-ready' },
                { icon: <Code2 size={14} />, text: 'Source Code' },
                { icon: <Zap size={14} />, text: 'Sofort lieferbar' },
              ].map((g) => (
                <div key={g.text} className="flex items-center gap-2 text-[var(--cs-text-3)] text-[11px]">
                  <span className="text-[#C9A84C]/60">{g.icon}</span>
                  {g.text}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  )
}
