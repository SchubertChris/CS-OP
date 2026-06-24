/* ============================================================
   CandleScope — About Page
   src/pages/AboutPage.tsx
   ============================================================ */
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import PageHero from '../components/ui/PageHero'
import {
  SectionWrapper, SectionHeader, GoldDivider,
  GradientText, CtaButton, TagList, HighlightLine,
  CardIcon,
} from '../components/ui'
import {
  TrendingUp, Zap, Users, Heart,
  BookOpen, Shield, Star, ArrowRight,
  Globe, Bot, GraduationCap, Briefcase,
} from 'lucide-react'
import { useSiteImages } from '../hooks/useSiteImages'

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

function TimelineItem({ year, title, desc, current }: {
  year: string; title: string; desc: string; current?: boolean
}) {
  return (
    <div className="relative flex gap-6 pb-10 last:pb-0">
      <div className="flex flex-col items-center shrink-0">
        <div className={`w-3 h-3 rounded-full border-2 mt-1 shrink-0 ${current ? 'border-[#C9A84C] bg-[#C9A84C]' : 'border-[#C9A84C]/40 bg-[var(--cs-bg)]'}`} />
        <div className="w-px flex-1 bg-gradient-to-b from-[#C9A84C]/30 to-transparent mt-2" />
      </div>
      <div className="flex-1 pb-2">
        <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--cs-text-2)] mb-1 block">{year}</span>
        <h4 className="font-display text-base text-[var(--cs-text)] mb-1">{title}</h4>
        <p className="text-[var(--cs-text-2)] text-sm leading-relaxed">{desc}</p>
        {current && (
          <div className="flex items-center gap-1.5 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00C896] animate-pulse" />
            <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#00C896]">Aktuell</span>
          </div>
        )}
      </div>
    </div>
  )
}

function ValueCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}
      className="flex flex-col gap-3 p-6 rounded-xl border border-[var(--cs-border-w2)] bg-[var(--cs-s1)] hover:border-[#C9A84C]/20 transition-colors duration-300 h-full">
      <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/8 border border-[#C9A84C]/15 flex items-center justify-center text-[#C9A84C]/70 shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-display text-sm text-[var(--cs-text)] mb-1">{title}</h4>
        <p className="text-[var(--cs-text-2)] text-[13px] leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  )
}

function ServiceCard({ icon, title, desc, tags }: {
  icon: React.ReactNode; title: string; desc: string; tags: string[]
}) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.22 }}
      className="flex flex-col h-full rounded-xl border border-[var(--cs-border-w2)] bg-[var(--cs-s1)] p-6 hover:border-[#C9A84C]/20 transition-colors duration-300">
      <CardIcon>{icon}</CardIcon>
      <h4 className="font-display text-base text-[var(--cs-text)] mb-2">{title}</h4>
      <p className="text-[var(--cs-text-2)] text-[13px] leading-relaxed mb-4 flex-1">{desc}</p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map(t => (
          <span key={t} className="font-mono text-[10px] tracking-[0.1em] px-2 py-0.5 rounded-full border border-[#C9A84C]/25 text-[var(--cs-text-2)]">{t}</span>
        ))}
      </div>
    </motion.div>
  )
}

const SKILLS_DEV = ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Node.js', 'NestJS', 'PostgreSQL', 'Docker', 'Git', 'Linux']
const SKILLS_FINANCE = ['Technische Analyse', 'Aktien', 'ETFs', 'Krypto', 'DeFi', 'Portfolio-Management', 'Haushaltsbuch']
const SKILLS_OTHER = ['Automatisierung', 'KI-Tools', 'Claude AI', 'ChatGPT', 'Discord', 'Community-Building', 'Prompt Engineering']

const TIMELINE = [
  { year: '1994', title: 'Potsdam — Aufgewachsen', desc: 'In Potsdam geboren und aufgewachsen — seit dem zehnten Lebensjahr am PC, immer neugierig auf Technik, Hardware und wie Dinge funktionieren.' },
  { year: '2007', title: 'Stahnsdorf — Eigenverantwortung', desc: 'Mit 13 nach Stahnsdorf gezogen. Mit 15 erste eigene Jobs, mit 17 den Führerschein selbst finanziert. Eigenverantwortung war keine Entscheidung — sie war die einzige Option.' },
  { year: '2010', title: 'Gastronomie — Hotelfach bis Bundestag', desc: 'Ausbildung zum Hotelfachmann und 13 Jahre Gastronomie auf verschiedenen Levels — Das Juliette Potsdam, Käfer im Bundestag Berlin und mehr. Verlässlichkeit und Qualität unter Druck.' },
  { year: '2019', title: 'BBU — Vorstandsfahrer', desc: 'Vertrauensposition als Vorstandsfahrer für Maren Kern bei der BBU. Diskretion, Zuverlässigkeit und Professionalität auf höchstem Level.' },
  { year: '2022', title: 'CandleScope — Die Marke entsteht', desc: 'Gründung der Marke CandleScope. Finance-Dashboard, eigene Website, Community — alles aus einer Hand. Krypto und Finanzen nicht als Hobby sondern als echtes Interessensfeld mit eigenem Tool-Stack.' },
  { year: '2023', title: 'DCI Berlin — Webentwicklung', desc: 'Weiterbildung zum Webentwickler beim Digital Career Institute Berlin — kombiniert mit allem was vorher und nachher selbst beigebracht wurde. Seit dem zehnten Lebensjahr am PC, Technik war immer da.' },
  { year: '2025', title: 'Sparda Bank — Kundenbetreuung', desc: 'Seit Oktober 2025 im Kundenservice der Sparda Bank — parallel weiter an CandleScope und eigenen Projekten.' },
  { year: '2026', title: 'VaultBox — eigene Desktop-App', desc: 'Entwicklung von VaultBox — eine vollständige Offline-Finanz-App für Haushaltsbuch, Verträge und Krypto-Steuer. Selbst entwickelt, selbst deployed. Nächstes Kapitel hat begonnen.', current: true },
]

const VALUES = [
  { icon: <Star size={16} strokeWidth={1.5} />, title: 'Qualität statt Quantität', desc: 'Lieber weniger Dinge — aber die richtig. Kein Bloat, kein Halbfertiges.' },
  { icon: <Zap size={16} strokeWidth={1.5} />, title: 'Effizienz durch Automatisierung', desc: 'Was automatisiert werden kann, wird automatisiert. Zeit ist das wertvollste Gut.' },
  { icon: <Users size={16} strokeWidth={1.5} />, title: 'Community & Zusammenhalt', desc: 'Alleine kommt man schnell, gemeinsam kommt man weiter. Netzwerke und echte Verbindungen zählen mehr als Solo-Ego.' },
  { icon: <BookOpen size={16} strokeWidth={1.5} />, title: 'Kontinuierliches Lernen', desc: 'Märkte und Technologie stehen nicht still. Wer aufhört zu lernen, wird überholt — das ist keine Option.' },
  { icon: <Shield size={16} strokeWidth={1.5} />, title: 'Ehrlichkeit & Transparenz', desc: 'Keine leeren Versprechen, kein Verkaufen von Träumen. Klartext in jede Richtung — das erwarte ich auch von Partnern.' },
  { icon: <Heart size={16} strokeWidth={1.5} />, title: 'Eigenverantwortung & Fokus', desc: 'Langfristige Unabhängigkeit entsteht durch konsequentes Handeln, nicht durch Warten auf die richtige Gelegenheit.' },
]

const SERVICES = [
  { icon: <Globe size={20} strokeWidth={1.5} />, title: 'Websites & Web-Apps', desc: 'Von der Landing Page bis zur komplexen Web-App — React, TypeScript, moderne Architektur. Klarer Code, kein Overhead, direkte Kommunikation.', tags: ['React', 'TypeScript', 'Vite', 'Node.js'] },
  { icon: <TrendingUp size={20} strokeWidth={1.5} />, title: 'Trading-Analyse & Setups', desc: 'Technische Analyse, Chart-Setups und Marktperspektiven — basierend auf eigener Erfahrung. Keine BaFin-Lizenz, keine Beratung.', tags: ['TA', 'Aktien', 'Krypto', 'ETFs'] },
  { icon: <GraduationCap size={20} strokeWidth={1.5} />, title: 'Finance Coaching', desc: 'Haushaltsbuch einrichten, Portfolio aufbauen, Grundlagen verstehen — gemeinsam statt alleine. Persönliche Meinung, kein Finanzberater.', tags: ['Budgeting', 'Portfolio', 'Grundlagen'] },
  { icon: <Bot size={20} strokeWidth={1.5} />, title: 'Automatisierung & Scripting', desc: 'Repetitive Aufgaben automatisieren, Workflows optimieren, Tools bauen die Zeit sparen. Python, Node.js, KI-Integration.', tags: ['Python', 'Node.js', 'KI', 'Workflows'] },
  { icon: <Briefcase size={20} strokeWidth={1.5} />, title: 'Mentoring & Wissensweitergabe', desc: 'Was ich gelernt habe teile ich — Webdev, Trading, Finanzen. Für Einsteiger die einen ehrlichen Ratgeber suchen.', tags: ['WebDev', 'Finance', 'Karriere'] },
]

const FUN_FACTS = [
  '🎮 Gaming seit ich einen Controller halten kann — hauptsächlich PC',
  '🚗 Führerschein mit 17 selbst bezahlt — erste echte Lektion in Eigenverantwortung',
  '☕ Kaffee ist kein Getränk, es ist eine Lebenseinstellung',
  '🤖 Claude AI ist mein täglicher Copilot — ich nutze KI nicht als Ersatz, sondern als Werkzeug',
  '📈 Mein erster Trade war eine Katastrophe — das beste was mir passieren konnte',
  '🏙️ Potsdam ist meine Stadt — Bundestag, Brandenburger Tor, alles um die Ecke',
]

export default function AboutPage() {
  const { img } = useSiteImages()
  return (
    <>
      <PageHero
        eyebrow="Chris Schubert · Potsdam, DE"
        titleLine1="Selbst entwickelt."
        titleLine2="Produktiv deployed."
        titleAccent="line2"
        description="WebDev · Finance · KI-Automatisierung. Praxiserfahrung aus über einem Jahrzehnt — selbst gelernt, selbst gebaut, selbst verantwortet."
        badge="Verfügbar für Projekte"
        theme="about"
      >
        {/* Primär-CTA: Kontakt ist die Conversion dieser Seite */}
        <Link to="/contact"
          className="relative overflow-hidden group text-[11px] tracking-[0.18em] uppercase bg-[#C9A84C] text-[#080808] px-8 py-3.5 rounded-full font-semibold shadow-lg shadow-[#C9A84C]/25 hover:shadow-[#C9A84C]/40 transition-shadow duration-300">
          <span className="relative z-10">Zusammenarbeiten</span>
          <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full" />
        </Link>

        {/* Sekundär-CTA */}
        <a href="https://github.com/SchubertChris" target="_blank" rel="noopener noreferrer"
          className="text-[11px] tracking-[0.16em] uppercase text-[var(--cs-text-3)] hover:text-[var(--cs-text)] transition-colors duration-300 flex items-center gap-2 group">
          GitHub ansehen
          <span className="w-4 h-px bg-current transition-transform duration-300 group-hover:scale-x-[1.5] origin-left" />
        </a>

        {/* Credibility Strip: echtes Shipped Product als Beweis */}
        <div className="w-full pt-5 border-t border-[var(--cs-text)]/8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[9px] tracking-[0.16em] uppercase text-[var(--cs-text-3)]">Flagship</span>
            <span className="w-px h-3 bg-[var(--cs-text)]/12" />
            <Link to="/dev"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C9A84C]/6 border border-[#C9A84C]/30 hover:border-[#C9A84C]/50 hover:bg-[#C9A84C]/10 transition-colors group">
              <div className="w-1 h-1 rounded-full bg-[#22c55e]" />
              <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--cs-text-2)] group-hover:text-[#C9A84C] transition-colors">VaultBox</span>
              <ArrowRight size={9} strokeWidth={1.5} className="text-[var(--cs-text-3)] group-hover:text-[#C9A84C] transition-colors" />
            </Link>
            <span className="font-mono text-[9px] text-[var(--cs-text-3)]">selbst entwickelt · selbst deployed · offline</span>
          </div>
        </div>
      </PageHero>

      {/* ── Foto + Story ──────────────────────────────────── */}
      <SectionWrapper id="story">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden border border-[#C9A84C]/20">
              <img src={img('about-chris')} alt="Chris Schubert"
                className="w-full object-cover aspect-[4/5] grayscale hover:grayscale-0 transition-[filter] duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--cs-bg)]/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="font-display text-xl text-[var(--cs-text)] tracking-wide">Chris Schubert</p>
                <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--cs-text-2)] mt-1">Potsdam · WebDev · Trader</p>
              </div>
            </div>
            <div className="absolute -inset-4 rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.06)_0%,transparent_70%)] pointer-events-none" />
          </div>

          <div className="flex flex-col gap-6">
            <SectionHeader eyebrow="Die Geschichte" title={<>Eigener Weg.<br /><GradientText>Eigene Regeln.</GradientText></>} className="mb-2" />
            <HighlightLine>„Think big — then double it."</HighlightLine>
            <p className="text-[var(--cs-text-2)] leading-relaxed">
              1994 in Potsdam geboren und aufgewachsen — seit dem zehnten Lebensjahr am PC,
              immer neugierig auf Technik, Hardware und wie Dinge funktionieren.
              Mit 15 ersten eigenen Lohn verdient, mit 17 den Führerschein selbst bezahlt.
            </p>
            <p className="text-[var(--cs-text-2)] leading-relaxed">
              13 Jahre Gastronomie auf verschiedenen Levels — vom Hotelfach über das Juliette Potsdam
              bis hin zum Käfer im Bundestag Berlin. Das hat mich gelehrt was wirklich zählt:
              Verlässlichkeit, Qualität unter Druck und echte Kommunikation.
            </p>
            <p className="text-[var(--cs-text-2)] leading-relaxed">
              2023 die Weiterbildung zum Webentwickler beim DCI Berlin — kombiniert mit allem was ich
              mir davor und danach selbst beigebracht habe. React, TypeScript, Full-Stack —
              heute baue ich Dinge die funktionieren und gut aussehen.
            </p>
            <p className="text-[var(--cs-text-2)] leading-relaxed">
              Krypto und Finanzen sind kein Hobby — das ist echtes Interesse mit echtem Einsatz.
              Märkte verstehen, Chancen erkennen, eigene Tools bauen.
              2022 entstand CandleScope — meine Marke, mein Projekt, mein Weg.
            </p>
            <HighlightLine>"I automate what others do manually — for maximum efficiency and freedom."</HighlightLine>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/contact">
                <CtaButton variant="primary" href="/contact">Projekt anfragen</CtaButton>
              </Link>
              <Link to="/dev" className="flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase text-[var(--cs-text-3)] hover:text-[var(--cs-text)] transition-colors duration-200 px-2">
                Meine Projekte <ArrowRight size={13} strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* ── Timeline ─────────────────────────────────────── */}
      <SectionWrapper id="timeline">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <SectionHeader
              eyebrow="Werdegang"
              title={<>Ein Weg der <GradientText>nicht geplant war</GradientText></>}
              description="Kein gerader Weg — aber jede Station hat mich zu dem gemacht was ich heute bin."
              className="mb-10"
            />
            <CtaButton variant="primary" href="/contact">Lass uns arbeiten</CtaButton>
          </div>
          <div className="pt-2">
            {TIMELINE.map((item, i) => <TimelineItem key={i} {...item} />)}
          </div>
        </div>
      </SectionWrapper>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* ── Skills ───────────────────────────────────────── */}
      <SectionWrapper id="skills">
        <SectionHeader eyebrow="Skills" title={<>Was ich <GradientText>kann</GradientText></>} className="mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--cs-text-2)] uppercase mb-4">Development</p>
            <TagList tags={SKILLS_DEV} />
          </div>
          <div>
            <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--cs-text-2)] uppercase mb-4">Finance & Trading</p>
            <TagList tags={SKILLS_FINANCE} />
          </div>
          <div>
            <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--cs-text-2)] uppercase mb-4">KI & Automatisierung</p>
            <TagList tags={SKILLS_OTHER} />
          </div>
        </div>
      </SectionWrapper>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* ── Werte ────────────────────────────────────────── */}
      <SectionWrapper id="values">
        <SectionHeader
          eyebrow="Werte & Philosophie"
          title={<>Woran ich <GradientText>glaube</GradientText></>}
          description="Was mich antreibt — täglich, in jedem Projekt, in jeder Entscheidung."
          className="mb-14"
        />
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {VALUES.map((v, i) => <StaggerItem key={i}><ValueCard {...v} /></StaggerItem>)}
        </StaggerContainer>
      </SectionWrapper>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* ── Was ich anbiete ──────────────────────────────── */}
      <SectionWrapper id="services">
        <SectionHeader
          eyebrow="Was ich anbiete"
          title={<>Wofür du mich <GradientText>anfragen kannst</GradientText></>}
          description="Direkte Zusammenarbeit ohne Agentur-Overhead. Klare Angebote, verlässliche Umsetzung, ehrliches Feedback."
          className="mb-14"
        />
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((s, i) => <StaggerItem key={i} className="h-full"><ServiceCard {...s} /></StaggerItem>)}
        </StaggerContainer>
      </SectionWrapper>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* ── Fun Facts ────────────────────────────────────── */}
      <SectionWrapper id="fun-facts">
        <SectionHeader eyebrow="Fun Facts" title={<>Die <GradientText>persönliche Seite</GradientText></>} className="mb-10" />
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FUN_FACTS.map((fact, i) => (
            <StaggerItem key={i}>
              <div className="flex items-start gap-3 p-4 rounded-xl border border-[var(--cs-border-w)] bg-[var(--cs-s1)] hover:border-[#C9A84C]/15 transition-colors duration-200">
                <span className="text-base shrink-0">{fact.split(' ')[0]}</span>
                <span className="text-[var(--cs-text-2)] text-sm leading-relaxed">{fact.split(' ').slice(1).join(' ')}</span>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </SectionWrapper>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* ── Hire me CTA ──────────────────────────────────── */}
      <SectionWrapper id="hire">
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
                Lass uns etwas<br /><GradientText>Großes bauen.</GradientText>
              </h2>
              <p className="text-[var(--cs-text-2)] leading-relaxed mb-8">
                Ob Website, Web-App, Finance-Beratung oder einfach ein ehrliches Gespräch —
                ich bin direkt erreichbar. Kein Formular das ins Leere geht, kein Vertrieb der dich anruft.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/contact">
                  <CtaButton variant="primary" href="/contact">Jetzt anfragen</CtaButton>
                </Link>
                <a href="mailto:info@candlescope.de"
                  className="flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase text-[var(--cs-text-3)] hover:text-[var(--cs-text)] transition-colors duration-200 px-4">
                  info@candlescope.de <ArrowRight size={13} strokeWidth={1.5} />
                </a>
              </div>
            </div>
            <StaggerContainer className="flex flex-col gap-3">
              {[
                { label: 'Antwortzeit', value: 'Innerhalb 24h' },
                { label: 'Sprachen', value: 'Deutsch · English' },
                { label: 'Standort', value: 'Potsdam, Deutschland' },
                { label: 'Verfügbarkeit', value: 'Remote · Projektbasis' },
              ].map((item, i) => (
                <StaggerItem key={i}>
                  <div className="flex items-center justify-between px-5 py-3.5 rounded-xl border border-[var(--cs-border-w)] bg-[var(--cs-backdrop)]">
                    <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--cs-text-3)]">{item.label}</span>
                    <span className="text-sm text-[var(--cs-text)]">{item.value}</span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </SectionWrapper>
    </>
  )
}