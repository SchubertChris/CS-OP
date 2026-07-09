// src/components/finance/DownloadCard.tsx
import { useState } from 'react'
import { Check, Download, Coffee } from 'lucide-react'
import { SOCIALS } from '../../data/socials'
import { useDownloadCount } from '../../hooks/useDownloadCount'
import { isLaunched, DOWNLOAD_URL, trackDownload } from '../../hooks/useLaunchGate'

const INCLUDED = [
  '10 integrierte Module',
  '4 Themes inkl. Hell- und Dunkel-Modi',
  'Lokale Datensicherheit — kein Cloud-Upload',
  'Auto-Safepoints (stündlich)',
  'Import / Export (.fbs + CSV)',
  'Kein Abo — einmalig',
]

interface DownloadCardProps {
  onDownload?: () => void   // nur noch als Fallback / Coming-Soon
}

export default function DownloadCard({ onDownload }: DownloadCardProps) {
  const downloads = useDownloadCount()
  const launched  = isLaunched()
  const [downloading, setDownloading] = useState(false)

  function handleDownload() {
    if (launched) {
      setDownloading(true)
      trackDownload(crypto.randomUUID())
      window.location.href = DOWNLOAD_URL
      setTimeout(() => setDownloading(false), 3000)
    } else {
      onDownload?.()
    }
  }

  return (
    <section className="py-20 px-8 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase mb-3">Download</p>
        <h2 className="text-3xl font-bold text-[var(--cs-text)]">
          {launched ? 'Jetzt kostenlos herunterladen' : 'Ab 8. Juni 2026 verfügbar'}
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] rounded-2xl overflow-hidden border border-[#C9A84C]/15">

        {/* Links: Was enthalten */}
        <div className="bg-[var(--cs-s3)] p-8 border-b md:border-b-0 md:border-r border-[#C9A84C]/8">
          <p className="text-[#C9A84C] text-xs tracking-[0.14em] uppercase mb-6">Was du bekommst</p>
          <ul className="flex flex-col gap-4">
            {INCLUDED.map(item => (
              <li key={item} className="flex items-start gap-3">
                <Check size={15} strokeWidth={2} className="text-[#C9A84C] mt-0.5 shrink-0" />
                <span className="text-[var(--cs-text-2)] text-sm leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Rechts: CTA */}
        <div className="bg-[var(--cs-s2)] p-8 flex flex-col items-center justify-center text-center gap-4">
          <div>
            <p className="text-[var(--cs-text-3)] line-through text-sm mb-1">39 €</p>
            <p className="text-[#C9A84C] text-5xl font-black leading-none">Gratis</p>
            <p className="text-[var(--cs-text-3)] text-xs mt-2">
              {launched ? 'Windows 10/11 · 64-bit' : 'Verfügbar ab 8.6.2026'}
            </p>
          </div>
          <div className="w-full flex flex-col gap-3 mt-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full bg-[#C9A84C] text-[#080808] font-bold text-sm py-3.5 rounded-lg
                         hover:opacity-90 transition-opacity duration-200 text-center cursor-pointer
                         disabled:opacity-80 disabled:cursor-default"
            >
              <span className="inline-flex items-center justify-center gap-2">
                {downloading ? <Check size={15} strokeWidth={2} /> : <Download size={15} strokeWidth={2} />}
                {downloading ? 'Download startet…' : launched ? 'Windows herunterladen' : 'Am 8. Juni verfügbar'}
              </span>
            </button>
            {SOCIALS.kofi && (
              <a
                href={SOCIALS.kofi}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full border border-[#C9A84C]/20 text-[var(--cs-text-2)] text-sm py-3 rounded-lg
                           hover:border-[#C9A84C]/35 hover:text-[var(--cs-text)] transition-colors duration-200
                           flex items-center justify-center gap-2"
              >
                <Coffee size={15} strokeWidth={1.5} />
                Projekt unterstützen
              </a>
            )}
          </div>
          <p className="text-[var(--cs-text-3)] text-[10px]">Freiwillig · via Ko-fi</p>
          {downloads !== null && downloads > 0 && (
            <p className="text-[var(--cs-text-3)] text-[10px] mt-1">
              ↓ {downloads.toLocaleString('de-DE')} Downloads
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
