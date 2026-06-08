// src/components/finance/FaqAccordion.tsx
import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

const FAQ = [
  {
    q: 'Läuft die App auf Mac oder Linux?',
    a: 'Nein — aktuell ausschließlich Windows 10 und Windows 11 (64-Bit). Mac- und Linux-Versionen sind für eine spätere Version geplant.',
  },
  {
    q: 'Wo werden meine Daten gespeichert?',
    a: 'Alles lokal auf deinem PC unter %APPDATA%/candlescope-financeboard/. Keine Cloud, keine Server, keine Weitergabe an Dritte.',
  },
  {
    q: 'Was passiert wenn ich die App deinstalliere?',
    a: 'Die Daten bleiben im AppData-Ordner erhalten und gehen nicht verloren. Du kannst sie dort manuell löschen oder vor der Deinstallation per Export sichern.',
  },
  {
    q: 'Gibt es automatische Updates?',
    a: 'Noch nicht — neue Versionen werden auf candlescope.de bekannt gegeben. Der Auto-Updater ist für eine der nächsten Versionen geplant.',
  },
  {
    q: 'Was bedeutet "für begrenzte Zeit kostenlos"?',
    a: 'Sobald das Produkt offiziell verkauft wird, gilt der reguläre Preis (39 €) für neue Downloads. Wer jetzt lädt, behält die App dauerhaft und kostenlos.',
  },
]

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="py-20 px-8 max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase mb-3">FAQ</p>
        <h2 className="text-3xl font-bold text-[var(--cs-text)]">Häufige Fragen</h2>
      </div>
      <div className="flex flex-col gap-2">
        {FAQ.map(({ q, a }, i) => (
          <div
            key={i}
            className="bg-[var(--cs-s3)] border border-[#C9A84C]/8 rounded-xl overflow-hidden
                       hover:border-[#C9A84C]/15 transition-colors duration-200"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
            >
              <span className="text-[var(--cs-text)] text-sm font-medium">{q}</span>
              {open === i
                ? <Minus size={16} strokeWidth={1.5} className="text-[#C9A84C] shrink-0" />
                : <Plus  size={16} strokeWidth={1.5} className="text-[var(--cs-text-2)] shrink-0" />
              }
            </button>
            <div
              style={{
                display: 'grid',
                gridTemplateRows: open === i ? '1fr' : '0fr',
                transition: 'grid-template-rows 250ms cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-5 text-[var(--cs-text-2)] text-sm leading-relaxed">{a}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
