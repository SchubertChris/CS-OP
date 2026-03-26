/* ============================================================
   CandleScope — About Page
   src/pages/AboutPage.tsx
   ============================================================ */
import { Link } from 'react-router-dom'
import PageHero from '../components/ui/PageHero'
import { SectionWrapper, SectionHeader, GoldDivider, GradientText, CtaButton, TagList, HighlightLine, StatItem } from '../components/ui'

export default function AboutPage() {
  const SKILLS_DEV = ['React', 'TypeScript', 'Node.js', 'NestJS', 'PostgreSQL', 'Docker', 'Tailwind CSS', 'Framer Motion']
  const SKILLS_FINANCE = ['Trading', 'DeFi', 'Krypto', 'Haushaltsbuch', 'Portfolio-Management']

  return (
    <>
      <PageHero
        eyebrow="About"
        titleLine1="Chris"
        titleLine2="Schubert"
        titleAccent="line2"
        description="WebDev · Finance-Spezialist · Gamer · Unternehmer. Ich baue Dinge die funktionieren — und verstehe Märkte die andere meiden."
        theme="about"
      >
        <Link to="/contact"
          className="relative overflow-hidden group text-[11px] tracking-[0.16em] uppercase border border-[#C9A84C]/35 text-[#C9A84C] px-7 py-3.5 rounded-full">
          <span className="relative z-10 group-hover:text-[#080808] transition-colors duration-300">Kontakt aufnehmen</span>
          <span className="absolute inset-0 bg-[#C9A84C] rounded-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        </Link>
        <a href="https://github.com/SchubertChris" target="_blank" rel="noopener noreferrer"
          className="text-[11px] tracking-[0.16em] uppercase text-[#5a5550] hover:text-[#F5F0E8] transition-colors duration-300 flex items-center gap-2 group">
          GitHub
          <span className="w-4 h-px bg-current transition-all duration-300 group-hover:w-6" />
        </a>
      </PageHero>

      {/* ── Story ───────────────────────────────────────── */}
      <SectionWrapper id="story">
        <SectionHeader
          eyebrow="Die Geschichte"
          title={<>Wer ist <GradientText>Chris Schubert</GradientText>?</>}
          className="mb-10"
        />
        <div className="max-w-2xl flex flex-col gap-6">
          <HighlightLine>
            Placeholder — deine persönliche Geschichte hier eintragen.
          </HighlightLine>
          <p className="text-[#9A9590] leading-relaxed">
            {/* TODO */}
          </p>
        </div>
      </SectionWrapper>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* ── Skills ──────────────────────────────────────── */}
      <SectionWrapper id="skills">
        <SectionHeader
          eyebrow="Skills"
          title={<>Was ich <GradientText>kann</GradientText></>}
          className="mb-10"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="font-mono text-[11px] tracking-[0.16em] text-[#C9A84C]/60 uppercase mb-4">Development</p>
            <TagList tags={SKILLS_DEV} />
          </div>
          <div>
            <p className="font-mono text-[11px] tracking-[0.16em] text-[#C9A84C]/60 uppercase mb-4">Finance</p>
            <TagList tags={SKILLS_FINANCE} />
          </div>
        </div>
      </SectionWrapper>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* ── Stats ───────────────────────────────────────── */}
      <SectionWrapper id="numbers" maxWidth="lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <StatItem value="5+" label="Jahre Dev" />
          <StatItem value="20+" label="Projekte" />
          <StatItem value="∞" label="Neugier" />
          <StatItem value="1" label="Marke" />
        </div>
      </SectionWrapper>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      <SectionWrapper maxWidth="md">
        <div className="text-center flex flex-col items-center gap-6">
          <SectionHeader
            eyebrow="Kontakt"
            title={<>Lass uns <GradientText>reden</GradientText></>}
            description="Projekt, Kooperation oder einfach ein Gespräch."
            align="center"
          />
          <CtaButton href="/contact" variant="primary">Nachricht schreiben</CtaButton>
        </div>
      </SectionWrapper>
    </>
  )
}