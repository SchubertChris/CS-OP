export default function ImpressumPage() {
  return (
    <section className="min-h-screen pt-32 pb-24 px-8 md:px-16 lg:px-24">
      <div className="max-w-2xl mx-auto">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[#C9A84C] mb-4">
          Rechtliches
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-[#F5F0E8] tracking-tight mb-12">
          Impressum
        </h1>

        <div className="flex flex-col gap-10 text-sm text-[#5a5550] leading-relaxed">

          <div className="flex flex-col gap-2">
            <span className="text-[10px] tracking-[0.16em] uppercase text-[#3a3530]">Angaben gemäß § 5 TMG</span>
            <p className="text-[#9A9590]">
              Chris Schubert<br />
              CandleScope<br />
              [Straße & Hausnummer]<br />
              [PLZ] [Stadt]<br />
              Deutschland
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] tracking-[0.16em] uppercase text-[#3a3530]">Kontakt</span>
            <p className="text-[#9A9590]">
              E-Mail: hello@candlescope.de<br />
              Web: candlescope.de
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] tracking-[0.16em] uppercase text-[#3a3530]">Haftungsausschluss</span>
            <p>
              Alle Inhalte dieser Website, insbesondere Finance- und Trading-bezogene
              Inhalte, stellen keine Anlageberatung dar. Es handelt sich um persönliche
              Meinungen und Informationen ohne Gewähr. Investitionsentscheidungen
              erfolgen auf eigene Verantwortung.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] tracking-[0.16em] uppercase text-[#3a3530]">Urheberrecht</span>
            <p>
              Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen
              Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung,
              Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
              Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des
              jeweiligen Autors bzw. Erstellers.
            </p>
          </div>

        </div>

        <div className="mt-16 h-px w-24 bg-gradient-to-r from-[#C9A84C] to-transparent" />
      </div>
    </section>
  )
}