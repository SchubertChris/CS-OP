export default function DatenschutzPage() {
  return (
    <section className="min-h-screen pt-32 pb-24 px-8 md:px-16 lg:px-24">
      <div className="max-w-2xl mx-auto">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[#C9A84C] mb-4">
          Rechtliches
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-[#F5F0E8] tracking-tight mb-12">
          Datenschutz
        </h1>

        <div className="flex flex-col gap-10 text-sm text-[#5a5550] leading-relaxed">

          <div className="flex flex-col gap-2">
            <span className="text-[10px] tracking-[0.16em] uppercase text-[#3a3530]">1. Verantwortlicher</span>
            <p>
              Verantwortlich für die Datenverarbeitung auf dieser Website ist
              Chris Schubert, CandleScope, hello@candlescope.de.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] tracking-[0.16em] uppercase text-[#3a3530]">2. Erhobene Daten</span>
            <p>
              Diese Website erhebt beim Besuch automatisch technische Daten
              (IP-Adresse, Browser, Betriebssystem, Zugriffszeit). Diese Daten
              werden ausschließlich zur Sicherstellung des Betriebs verwendet
              und nicht an Dritte weitergegeben.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] tracking-[0.16em] uppercase text-[#3a3530]">3. Cookies</span>
            <p>
              Diese Website verwendet derzeit keine Tracking-Cookies. Technisch
              notwendige Cookies können für die Funktion der Seite eingesetzt
              werden.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] tracking-[0.16em] uppercase text-[#3a3530]">4. Ihre Rechte</span>
            <p>
              Sie haben das Recht auf Auskunft, Berichtigung, Löschung und
              Einschränkung der Verarbeitung Ihrer personenbezogenen Daten.
              Wenden Sie sich dazu per E-Mail an hello@candlescope.de.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] tracking-[0.16em] uppercase text-[#3a3530]">5. Hosting</span>
            <p>
              Diese Website wird auf einem Server von IONOS SE, Elgendorfer Str. 57,
              56410 Montabaur, Deutschland gehostet. Die Verarbeitung erfolgt
              auf Basis von Art. 6 Abs. 1 lit. f DSGVO.
            </p>
          </div>

        </div>

        <div className="mt-16 h-px w-24 bg-gradient-to-r from-[#C9A84C] to-transparent" />
      </div>
    </section>
  )
}