import PageHero from '../components/ui/PageHero'

export default function CommunityPage() {
  return (
    <PageHero
      eyebrow="Community"
      titleLine1="Discord &"
      titleLine2="Community"
      titleAccent="line2"
      description="Trading · Tech · Gaming · Austausch. Werde Teil der CandleScope Community und tausch dich mit Gleichgesinnten aus."
      badge="Coming soon"
      theme="community"
    >
      <a href="https://discord.gg/" target="_blank" rel="noopener noreferrer"
        className="relative overflow-hidden group text-[11px] tracking-[0.16em] uppercase border border-[#C9A84C]/35 text-[#C9A84C] px-7 py-3.5 rounded-full">
        <span className="relative z-10 group-hover:text-[#080808] transition-colors duration-300">Discord beitreten</span>
        <span className="absolute inset-0 bg-[#C9A84C] rounded-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
      </a>
    </PageHero>
  )
}