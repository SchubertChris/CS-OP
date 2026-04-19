// src/components/finance/DownloadCard.tsx
import { Check } from 'lucide-react'
import { SOCIALS } from '../../data/socials'

const INCLUDED = [
  '10 integrierte Module',
  '6 Themes inkl. Hell- und Dunkel-Modi',
  'Lokale Datensicherheit — kein Cloud-Upload',
  'Auto-Safepoints (stündlich)',
  'Import / Export (.fbs + CSV)',
  'Kein Abo — einmalig',
]

interface DownloadCardProps {
  downloadUrl?: string
}

export default function DownloadCard({ downloadUrl = '/downloads/FinanceBoard-Setup.exe' }: DownloadCardProps) {
  return (
    <section className="py-20 px-8 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase mb-3">Download</p>
        <h2 className="text-3xl font-bold text-[#F5F0E8]">Jetzt herunterladen</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] rounded-2xl overflow-hidden border border-[#C9A84C]/15">

        {/* Links: Was enthalten */}
        <div className="bg-[#111111] p-8 border-b md:border-b-0 md:border-r border-[#C9A84C]/8">
          <p className="text-[#C9A84C] text-xs tracking-[0.14em] uppercase mb-6">Was du bekommst</p>
          <ul className="flex flex-col gap-4">
            {INCLUDED.map(item => (
              <li key={item} className="flex items-start gap-3">
                <Check size={15} strokeWidth={2} className="text-[#C9A84C] mt-0.5 shrink-0" />
                <span className="text-[#9A9590] text-sm leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Rechts: CTA */}
        <div className="bg-[#0e0e0e] p-8 flex flex-col items-center justify-center text-center gap-4">
          <div>
            <p className="text-[#5a5550] line-through text-sm mb-1">39 €</p>
            <p className="text-[#C9A84C] text-5xl font-black leading-none">Gratis</p>
            <p className="text-[#5a5550] text-xs mt-2">Für begrenzte Zeit</p>
          </div>
          <div className="w-full flex flex-col gap-3 mt-2">
            <a
              href={downloadUrl}
              download
              className="w-full bg-[#C9A84C] text-[#080808] font-bold text-sm py-3.5 rounded-lg
                         hover:opacity-90 transition-opacity duration-200 text-center"
            >
              ↓ Windows herunterladen
            </a>
            {SOCIALS.kofi && (
              <a
                href={SOCIALS.kofi}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full border border-[#C9A84C]/20 text-[#9A9590] text-sm py-3 rounded-lg
                           hover:border-[#C9A84C]/35 hover:text-[#F5F0E8] transition-all duration-200
                           flex items-center justify-center gap-2"
              >
                <span>☕</span>
                Projekt unterstützen
              </a>
            )}
          </div>
          <p className="text-[#5a5550] text-[10px]">Freiwillig · via Ko-fi</p>
        </div>
      </div>
    </section>
  )
}
