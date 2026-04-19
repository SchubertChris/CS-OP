// src/components/finance/FeatureGrid.tsx
import {
  LayoutDashboard, ArrowLeftRight, CandlestickChart,
  FileText, Building2, Target, Layers, Archive,
  Settings, Download,
} from 'lucide-react'

const MODULES = [
  { icon: LayoutDashboard,   title: 'Dashboard',        desc: 'KPIs, Cockpit, Zahlungsübersicht auf einen Blick' },
  { icon: ArrowLeftRight,    title: 'Transaktionen',     desc: 'Buchungen, Kategorien, Filter und Schnellsuche' },
  { icon: CandlestickChart,  title: 'Jahresanalyse',     desc: 'Candlestick-Charts, Prognose und Moving Average' },
  { icon: FileText,          title: 'Verträge',          desc: 'Subscriptions und Verträge im Überblick' },
  { icon: Building2,         title: 'Kreditoren',        desc: 'Payees mit Favicon-Pills und Kontoverknüpfung' },
  { icon: Target,            title: 'Sparziele',         desc: 'Tracker mit Live-Feedback und automatischer Rate' },
  { icon: Layers,            title: 'Vision Board',      desc: 'Freier Canvas für finanzielle Ziele und Ideen' },
  { icon: Archive,           title: 'Archiv',            desc: 'Dokumentenverwaltung mit Kategorien und Suche' },
  { icon: Settings,          title: 'Einstellungen',     desc: '6 Themes, Schriftarten, Privacy Lock' },
  { icon: Download,          title: 'Import / Export',   desc: '.fbs Format, CSV-Export, Auto-Safepoints' },
]

export default function FeatureGrid() {
  return (
    <section className="py-20 px-8 max-w-6xl mx-auto">
      <div className="text-center mb-14">
        <p className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase mb-3">Module</p>
        <h2 className="text-3xl font-bold text-[#F5F0E8]">Alles was du brauchst</h2>
        <p className="text-[#9A9590] mt-3 max-w-md mx-auto text-sm leading-relaxed">
          10 vollständig integrierte Module — kein Plugin-Dschungel, keine Abo-Extras.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {MODULES.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="bg-[#111111] border border-[#C9A84C]/8 rounded-xl p-5
                       hover:border-[#C9A84C]/20 transition-colors duration-200 group"
          >
            <Icon size={22} strokeWidth={1.5} className="text-[#C9A84C]" />
            <p className="text-[#F5F0E8] font-semibold text-sm mt-3">{title}</p>
            <p className="text-[#9A9590] text-xs mt-1.5 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
