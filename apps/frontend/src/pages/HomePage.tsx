import { Link } from 'react-router-dom'
import PageHero from '../components/ui/PageHero'

export default function HomePage() {
  return (
    <PageHero
      eyebrow="CandleScope"
      titleLine1="Trading &"
      titleLine2="Technologie"
      titleAccent="line2"
      description="WebDev · Finance · Gaming · Merch · Kurse. Eine Marke. Alles unter einem Dach — gebaut von Chris Schubert."
      badge="Est. 2025"
      theme="home"
    >
      <Link
        to="/about"
        className="relative overflow-hidden group text-[11px] tracking-[0.16em] uppercase border border-[#C9A84C]/35 text-[#C9A84C] px-7 py-3.5 rounded-full"
      >
        <span className="relative z-10 group-hover:text-[#080808] transition-colors duration-300">
          Mehr erfahren
        </span>
        <span className="absolute inset-0 bg-[#C9A84C] rounded-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
      </Link>
      <Link
        to="/finance"
        className="text-[11px] tracking-[0.16em] uppercase text-[#5a5550] hover:text-[#F5F0E8] transition-colors duration-300 flex items-center gap-2 group"
      >
        Finance entdecken
        <span className="w-4 h-px bg-current transition-all duration-300 group-hover:w-6" />
      </Link>
    </PageHero>
  )
}