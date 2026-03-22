/* ============================================================
   CandleScope — Dev & Web Page
   src/pages/DevPage.tsx
   ============================================================ */
import { Link } from 'react-router-dom'
import PageHero from '../components/ui/PageHero'
import { SectionWrapper, SectionHeader, GoldDivider, Card, CardIcon, GradientText, Badge, CtaButton, TagList } from '../components/ui'
import { Globe, Smartphone, Terminal, GitBranch } from 'lucide-react'

export default function DevPage() {
  const STACK = ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Node.js', 'NestJS', 'PostgreSQL', 'Prisma', 'Docker', 'Nginx']

  return (
    <>
      <PageHero
        eyebrow="Dev & Web"
        titleLine1="Code &"
        titleLine2="Projekte"
        titleAccent="line2"
        description="Maßgeschneiderte Websites · Web-Apps · Open Source Projekte. Sauberer Code, modernes Design, technisch stark."
        badge="Open for work"
        theme="dev"
      >
        <a href="https://github.com/SchubertChris" target="_blank" rel="noopener noreferrer"
          className="relative overflow-hidden group text-[11px] tracking-[0.16em] uppercase border border-[#C9A84C]/35 text-[#C9A84C] px-7 py-3.5 rounded-full">
          <span className="relative z-10 group-hover:text-[#080808] transition-colors duration-300">GitHub ansehen</span>
          <span className="absolute inset-0 bg-[#C9A84C] rounded-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        </a>
        <Link to="/contact"
          className="text-[11px] tracking-[0.16em] uppercase text-[#5a5550] hover:text-[#F5F0E8] transition-colors duration-300 flex items-center gap-2 group">
          Projekt anfragen
          <span className="w-4 h-px bg-current transition-all duration-300 group-hover:w-6" />
        </Link>
      </PageHero>

      {/* ── Services ────────────────────────────────────── */}
      <SectionWrapper id="services">
        <SectionHeader
          eyebrow="Was ich baue"
          title={<>Code der <GradientText>funktioniert</GradientText></>}
          description="Von der Landing Page bis zur komplexen Web-App — immer mit Fokus auf Performance, Design und Wartbarkeit."
          className="mb-14"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: <Globe size={20} strokeWidth={1.5} />, title: 'Websites', desc: 'Schnelle, SEO-optimierte Websites mit modernem Design.' },
            { icon: <Smartphone size={20} strokeWidth={1.5} />, title: 'Web-Apps', desc: 'React-basierte Anwendungen — skalierbar und typsicher.' },
            { icon: <Terminal size={20} strokeWidth={1.5} />, title: 'Backends', desc: 'NestJS APIs, PostgreSQL, Docker — production-ready.' },
          ].map((s, i) => (
            <Card key={i} variant="elevated">
              <CardIcon>{s.icon}</CardIcon>
              <h3 className="font-display text-lg text-[#F5F0E8] mb-2">{s.title}</h3>
              <p className="text-[#9A9590] text-sm leading-relaxed">{s.desc}</p>
            </Card>
          ))}
        </div>
      </SectionWrapper>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* ── Tech Stack ──────────────────────────────────── */}
      <SectionWrapper id="stack">
        <SectionHeader
          eyebrow="Tech Stack"
          title={<>Mein <GradientText>Werkzeugkasten</GradientText></>}
          className="mb-10"
        />
        <TagList tags={STACK} />
      </SectionWrapper>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* ── Projekte ────────────────────────────────────── */}
      <SectionWrapper id="projects">
        <SectionHeader
          eyebrow="Projekte"
          title={<>Aktuelle <GradientText>Arbeiten</GradientText></>}
          description="Ausgewählte Projekte — von Open Source bis Client-Work."
          className="mb-14"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card variant="gold">
            <Badge variant="gold" className="mb-3">Aktuell</Badge>
            <h3 className="font-display text-xl text-[#F5F0E8] mb-2">CandleScope.de</h3>
            <p className="text-[#9A9590] text-sm leading-relaxed mb-4">
              Personal Brand Website mit eigenem CMS / Page Builder — gebaut mit React, Vite, TypeScript und Tailwind.
            </p>
            <TagList tags={['React', 'TypeScript', 'Tailwind', 'Zustand']} />
            <div className="flex items-center gap-2 mt-4">
              <a href="https://github.com/SchubertChris" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[11px] tracking-[0.1em] uppercase text-[#C9A84C]/60 hover:text-[#C9A84C] transition-colors">
                <GitBranch size={13} strokeWidth={1.5} /> GitHub
              </a>
            </div>
          </Card>
        </div>
      </SectionWrapper>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      <SectionWrapper maxWidth="md">
        <div className="text-center flex flex-col items-center gap-6">
          <SectionHeader
            eyebrow="Anfrage"
            title={<>Dein Projekt <GradientText>umsetzen</GradientText></>}
            description="Du hast eine Idee? Ich baue sie — sauber, schnell, modern."
            align="center"
          />
          <CtaButton href="/contact" variant="primary">Projekt anfragen</CtaButton>
        </div>
      </SectionWrapper>
    </>
  )
}