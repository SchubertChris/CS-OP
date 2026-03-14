import { Link } from 'react-router-dom'
import PageHero from '../components/ui/PageHero'

export default function FinancePage() {
  return (
    <PageHero
      eyebrow="Finance"
      titleLine1="Märkte &"
      titleLine2="Tools"
      titleAccent="line2"
      description="Haushaltsbuch-Software · Trading · DeFi · Krypto · Anlageberatung auf Anfrage. Finanzielle Kontrolle beginnt mit den richtigen Werkzeugen."
      badge="Haushaltsbuch verfügbar"
      theme="finance"
    >
      <a href="#haushaltsbuch"
        className="relative overflow-hidden group text-[11px] tracking-[0.16em] uppercase border border-[#C9A84C]/35 text-[#C9A84C] px-7 py-3.5 rounded-full">
        <span className="relative z-10 group-hover:text-[#080808] transition-colors duration-300">Haushaltsbuch kaufen</span>
        <span className="absolute inset-0 bg-[#C9A84C] rounded-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
      </a>
      <Link to="/contact"
        className="text-[11px] tracking-[0.16em] uppercase text-[#5a5550] hover:text-[#F5F0E8] transition-colors duration-300 flex items-center gap-2 group">
        Beratung anfragen
        <span className="w-4 h-px bg-current transition-all duration-300 group-hover:w-6" />
      </Link>
    </PageHero>
  )
}