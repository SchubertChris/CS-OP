/* ============================================================
   CandleScope — ShopRay Page
   src/pages/ShopRayPage.tsx

   Marketing-Seite für das ShopRay Shop-Template
   ============================================================ */

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import PageHero from '../components/ui/PageHero'
import {
  SectionHeader, GoldDivider, Card, CardIcon,
  GradientText, Badge, CtaButton, HighlightLine,
} from '../components/ui'
import {
  ShoppingBag, LayoutDashboard, CreditCard, Database,
  Shield, Smartphone, Code2, Zap, Package, FileCheck,
  ArrowRight, Check, Users, Globe, Lock, Server,
} from 'lucide-react'

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

/* ── Mock Browser Window ───────────────────────────────────── */
function BrowserMock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-[#C9A84C]/20 shadow-2xl shadow-black/60">
      <div className="bg-[var(--cs-s4)] px-4 py-2.5 flex items-center gap-2 border-b border-[#C9A84C]/8">
        <div className="w-3 h-3 rounded-full bg-[#ef4444]/70" />
        <div className="w-3 h-3 rounded-full bg-[#eab308]/70" />
        <div className="w-3 h-3 rounded-full bg-[#22c55e]/70" />
        <span className="text-[var(--cs-text-3)] text-[10px] ml-2 font-mono">{title}</span>
      </div>
      {children}
    </div>
  )
}

/* ── Shop-Demo Mockup ──────────────────────────────────────── */
function ShopMockup() {
  return (
    <BrowserMock title="ShopRay — Shop Frontend">
      <div className="bg-[var(--cs-s2)] p-6 min-h-[340px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--cs-border-w)]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#C9A84C]/20 flex items-center justify-center">
              <ShoppingBag size={11} className="text-[#C9A84C]" />
            </div>
            <span className="text-[var(--cs-text)] text-[11px] font-semibold tracking-wider">ShopRay</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-20 h-1.5 rounded-full bg-[var(--cs-border-w2)]" />
            <div className="w-14 h-1.5 rounded-full bg-[var(--cs-border-w2)]" />
            <div className="w-6 h-6 rounded-full bg-[#C9A84C]/20 flex items-center justify-center">
              <ShoppingBag size={10} className="text-[#C9A84C]" />
            </div>
          </div>
        </div>
        {/* Product Grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { price: '29,90 €', badge: 'NEU', highlight: true },
            { price: '49,90 €', badge: 'TOP', highlight: false },
            { price: '19,90 €', badge: '',    highlight: false },
          ].map((p, i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-[var(--cs-border-w)]">
              <div className={`h-20 flex items-center justify-center relative ${p.highlight ? 'bg-[#C9A84C]/15' : 'bg-[var(--cs-s3)]'}`}>
                <Package size={22} className="text-[var(--cs-text-4)]" />
                {p.badge && (
                  <span className="absolute top-2 right-2 text-[8px] font-bold bg-[#C9A84C] text-[#080808] px-1.5 py-0.5 rounded-full">
                    {p.badge}
                  </span>
                )}
              </div>
              <div className="p-2.5 bg-[var(--cs-s4)]">
                <div className="w-16 h-1.5 rounded-full bg-[var(--cs-border-w3)] mb-1.5" />
                <div className="w-10 h-1.5 rounded-full bg-[var(--cs-border-w2)] mb-2" />
                <div className="flex items-center justify-between">
                  <span className="text-[#C9A84C] text-[11px] font-bold">{p.price}</span>
                  <div className="w-16 h-5 rounded-lg bg-[#C9A84C]/20 flex items-center justify-center">
                    <span className="text-[#C9A84C] text-[8px] font-bold tracking-wider">KAUFEN</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Cart strip */}
        <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-[#C9A84C]/8 border border-[#C9A84C]/15">
          <div className="flex items-center gap-2">
            <ShoppingBag size={13} className="text-[#C9A84C]" />
            <span className="text-[#C9A84C] text-[10px] font-semibold">2 Artikel im Warenkorb</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--cs-text-2)] text-[10px]">79,80 €</span>
            <ArrowRight size={12} className="text-[#C9A84C]" />
          </div>
        </div>
      </div>
    </BrowserMock>
  )
}

/* ── Admin Mockup ──────────────────────────────────────────── */
function AdminMockup() {
  return (
    <BrowserMock title="ShopRay Admin — Dashboard">
      <div className="bg-[var(--cs-s1)] flex min-h-[260px]">
        {/* Sidebar */}
        <div className="w-14 border-r border-[var(--cs-border-w)] flex flex-col items-center py-4 gap-4">
          {[LayoutDashboard, Package, ShoppingBag, Users, CreditCard].map((Icon, i) => (
            <div key={i} className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${i === 0 ? 'bg-[#C9A84C]/20 text-[#C9A84C]' : 'text-[var(--cs-text-4)]'}`}>
              <Icon size={14} />
            </div>
          ))}
        </div>
        {/* Content */}
        <div className="flex-1 p-4">
          <p className="text-[9px] font-mono tracking-wider text-[var(--cs-text-3)] mb-3">DASHBOARD</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { label: 'Umsatz',       val: '3.290 €', color: 'text-[#C9A84C]' },
              { label: 'Bestellungen', val: '47',      color: 'text-[#22c55e]' },
              { label: 'Kunden',       val: '83',      color: 'text-[var(--cs-text)]' },
              { label: 'Produkte',     val: '25',      color: 'text-[var(--cs-text)]' },
            ].map((s, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-[var(--cs-s3)] border border-[var(--cs-border-w)]">
                <p className="text-[8px] text-[var(--cs-text-3)] mb-1">{s.label}</p>
                <p className={`text-[15px] font-bold ${s.color}`}>{s.val}</p>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            {['#0042 · 49,90 € · bezahlt', '#0041 · 29,90 € · versandt', '#0040 · 79,80 € · bezahlt'].map((r, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[var(--cs-s2)] border border-[var(--cs-border-w)]">
                <span className="text-[9px] font-mono text-[var(--cs-text-3)]">{r.split('·')[0]}</span>
                <span className="text-[9px] text-[var(--cs-text-2)]">{r.split('·')[1]}</span>
                <span className={`text-[8px] font-semibold ${r.includes('bezahlt') ? 'text-[#22c55e]' : 'text-[#C9A84C]'}`}>{r.split('·')[2]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BrowserMock>
  )
}

/* ══════════════════════════════════════════════════════════════
   PAGE
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
    badge: 'One-Push-Deploy', badgeVariant: 'green' as const,
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

export default function ShopRayPage() {
  return (
    <div style={{ overflowX: 'hidden' }}>

      {/* ── 1. Hero ───────────────────────────────────────── */}
      <PageHero
        eyebrow="Shop-Template · Für Entwickler & Agenturen"
        titleLine1="Dein Shop."
        titleLine2="Sofort fertig."
        titleAccent="line1"
        description="Vollständiges React + Node.js Shop-Template — Frontend, Backend, Admin-Panel, Stripe und Supabase bereits integriert. Einmal kaufen, beliebig oft einsetzen."
        badge="v1.0 · Einmalig"
        theme="dev"
      >
        <CtaButton href="/contact" variant="primary">Jetzt anfragen</CtaButton>
        <a
          href="https://shopray-indol.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] tracking-[0.16em] uppercase text-[var(--cs-text-3)] hover:text-[var(--cs-text)] transition-colors duration-300 flex items-center gap-2 group"
        >
          Live-Demo ansehen
          <span className="w-4 h-px bg-current transition-all duration-300 group-hover:w-6" />
        </a>

        {/* Stats */}
        <div className="w-full pt-5 border-t border-[#C9A84C]/8">
          <div className="flex flex-wrap items-center gap-6">
            {[
              { val: '3',   label: 'Projekte' },
              { val: '30+', label: 'API-Routen' },
              { val: '12',  label: 'Frontend-Pages' },
              { val: '1×',  label: 'Zahlung' },
            ].map(({ val, label }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span className="font-mono text-[15px] text-[#C9A84C] leading-none tabular-nums">{val}</span>
                <span className="font-mono text-[8px] tracking-[0.18em] uppercase text-[var(--cs-text-4)]">{label}</span>
              </div>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
              <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--cs-text-4)]">Sofort deployen</span>
            </div>
          </div>
        </div>
      </PageHero>

      {/* ── 2. Mockup Preview ─────────────────────────────── */}
      <section className="px-8 md:px-16 lg:px-24 py-12 pb-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Reveal direction="left" delay={0.05}>
            <ShopMockup />
          </Reveal>
          <Reveal direction="right" delay={0.15}>
            <AdminMockup />
          </Reveal>
        </div>
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
            <div className="flex flex-col gap-2.5">
              {INCLUDES.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check size={15} strokeWidth={2} className="text-[#C9A84C] shrink-0 mt-0.5" />
                  <span className="text-[var(--cs-text-2)] text-sm">{item}</span>
                </div>
              ))}
            </div>
            <HighlightLine className="mt-6">
              + Source Code komplett, keine Minifizierung, keine Lizenzbeschränkung für eigene Projekte.
            </HighlightLine>
          </Reveal>

          <Reveal direction="right" delay={0.1}>
            <div className="flex flex-col gap-4">
              {/* Tech Stack Tags */}
              <div className="p-5 rounded-2xl border border-[#C9A84C]/15 bg-[#C9A84C]/3">
                <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#C9A84C] mb-4">Tech Stack</p>
                <div className="flex flex-wrap gap-2">
                  {STACK.map((tag) => (
                    <span key={tag} className="font-mono text-[10px] tracking-[0.1em] px-2.5 py-1 rounded-full border border-[#C9A84C]/15 bg-[#C9A84C]/5 text-[var(--cs-text-2)]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Deployment */}
              <div className="p-5 rounded-2xl border border-[var(--cs-border-w)] bg-[var(--cs-s1)]">
                <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--cs-text-3)] mb-3">Deploy in 3 Schritten</p>
                <div className="flex flex-col gap-2">
                  {[
                    { n: '01', text: 'Supabase Schema ausführen + ENV-Variablen setzen' },
                    { n: '02', text: 'Stripe Keys eintragen (Test → Live wenn bereit)' },
                    { n: '03', text: 'git push → Vercel baut alle 3 Projekte automatisch' },
                  ].map((s) => (
                    <div key={s.n} className="flex items-start gap-3">
                      <span className="font-mono text-[11px] text-[#C9A84C]/50 shrink-0 mt-0.5">{s.n}</span>
                      <span className="text-[var(--cs-text-2)] text-[13px]">{s.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vercel logos */}
              <div className="flex items-center gap-3">
                {['Frontend', 'Backend', 'Admin'].map((p) => (
                  <div key={p} className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-[var(--cs-border-w)] bg-[var(--cs-s1)]">
                    <Globe size={13} strokeWidth={1.5} className="text-[var(--cs-text-3)]" />
                    <span className="text-[11px] text-[var(--cs-text-2)] font-medium">{p}</span>
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
              desc: 'Du hast einen Entwickler der ein Template braucht — ShopRay ist der Startpunkt der keine Monate Entwicklungszeit kostet.',
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
                description="Keine monatlichen Gebühren, keine Einschränkungen. Source Code komplett inklusive — du kannst alles anpassen."
                align="center"
                className="mb-10"
              />
            </div>

            {/* Pricing Card */}
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
                <a
                  href="https://shopray-indol.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[11px] tracking-[0.12em] uppercase text-[var(--cs-text-2)] hover:text-[#C9A84C] transition-colors group"
                >
                  <Lock size={12} strokeWidth={1.5} />
                  Demo ansehen
                  <ArrowRight size={11} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            {/* Guarantee strip */}
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
