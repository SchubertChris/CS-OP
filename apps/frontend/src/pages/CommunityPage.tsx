/* ============================================================
   CandleScope — Community Page
   src/pages/CommunityPage.tsx
   ============================================================ */
import PageHero from '../components/ui/PageHero'
import { SectionWrapper, SectionHeader, GoldDivider, Card, CardIcon, GradientText, Badge, CtaButton } from '../components/ui'
import { MessageSquare, Users, Calendar, Zap } from 'lucide-react'

export default function CommunityPage() {
  return (
    <>
      <PageHero
        eyebrow="Community"
        titleLine1="Discord &"
        titleLine2="Community"
        titleAccent="line2"
        description="Trading · Tech · Gaming · Austausch. Werde Teil der CandleScope Community."
        badge="Coming soon"
        theme="community"
      >
        <a href="https://discord.gg/" target="_blank" rel="noopener noreferrer"
          className="relative overflow-hidden group text-[11px] tracking-[0.16em] uppercase border border-[#C9A84C]/35 text-[#C9A84C] px-7 py-3.5 rounded-full">
          <span className="relative z-10 group-hover:text-[#080808] transition-colors duration-300">Discord beitreten</span>
          <span className="absolute inset-0 bg-[#C9A84C] rounded-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        </a>
      </PageHero>

      {/* ── Was erwartet dich ── */}
      <SectionWrapper id="features">
        <SectionHeader
          eyebrow="Community"
          title={<>Mehr als nur <GradientText>ein Server</GradientText></>}
          description="Austausch, Wissen und Spaß — rund um Finance, Tech und Gaming."
          className="mb-14"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { icon: <MessageSquare size={20} strokeWidth={1.5} />, title: 'Diskussionen', desc: 'Finance, Tech, Gaming — zu jedem Thema ein Channel.' },
            { icon: <Users size={20} strokeWidth={1.5} />, title: 'Gleichgesinnte', desc: 'Triff Menschen mit denselben Interessen.' },
            { icon: <Calendar size={20} strokeWidth={1.5} />, title: 'Events', desc: 'Live-Sessions, Q&As und Community-Events.' },
            { icon: <Zap size={20} strokeWidth={1.5} />, title: 'Exklusiv', desc: 'Members-only Inhalte und frühzeitiger Zugang.' },
          ].map((f, i) => (
            <Card key={i} variant="elevated">
              <CardIcon>{f.icon}</CardIcon>
              <h3 className="font-display text-lg text-[#F5F0E8] mb-2">{f.title}</h3>
              <p className="text-[#9A9590] text-sm leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </SectionWrapper>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      <SectionWrapper maxWidth="md">
        <div className="text-center flex flex-col items-center gap-6">
          <Badge variant="muted">Coming soon</Badge>
          <SectionHeader
            eyebrow="Beitreten"
            title={<>Sei dabei <GradientText>von Anfang an</GradientText></>}
            description="Der Server wird bald geöffnet. Trag dich ein um als Erstes informiert zu werden."
            align="center"
          />
          <CtaButton href="https://discord.gg/" external variant="primary">Discord beitreten</CtaButton>
        </div>
      </SectionWrapper>
    </>
  )
}