import { Link } from 'react-router-dom'
import PageHero from '../components/ui/PageHero'

export default function AboutPage() {
  return (
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
  )
}