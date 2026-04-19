// src/components/finance/UspStrip.tsx
import { WifiOff, BadgeCheck, Monitor, Lock } from 'lucide-react'

const USPS = [
  {
    icon: <WifiOff size={22} strokeWidth={1.5} className="text-[#C9A84C]" />,
    title: 'Offline-First',
    sub: 'Keine Internetverbindung nötig',
  },
  {
    icon: <BadgeCheck size={22} strokeWidth={1.5} className="text-[#C9A84C]" />,
    title: 'Einmalig kaufen',
    sub: 'Kein Abo, keine versteckten Kosten',
  },
  {
    icon: <Monitor size={22} strokeWidth={1.5} className="text-[#C9A84C]" />,
    title: 'Windows 10 / 11',
    sub: 'Desktop-App · ~150 MB',
  },
  {
    icon: <Lock size={22} strokeWidth={1.5} className="text-[#C9A84C]" />,
    title: 'Deine Daten',
    sub: 'Alles lokal in %APPDATA%',
  },
]

export default function UspStrip() {
  return (
    <section className="border-t border-b border-[#C9A84C]/8 py-10">
      <div className="max-w-5xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
        {USPS.map(({ icon, title, sub }) => (
          <div key={title} className="flex flex-col items-center text-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#C9A84C]/8 border border-[#C9A84C]/15 flex items-center justify-center">
              {icon}
            </div>
            <div>
              <p className="text-[#F5F0E8] font-semibold text-sm">{title}</p>
              <p className="text-[#9A9590] text-xs mt-0.5 leading-relaxed">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
