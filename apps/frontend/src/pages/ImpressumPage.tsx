/* ============================================================
   CandleScope — Impressum
   src/pages/ImpressumPage.tsx
   ============================================================ */
import { SectionWrapper, GoldDivider, HighlightLine } from '../components/ui'

export default function ImpressumPage() {
  return (
    <>
      <div className="pt-32 px-8 md:px-16 lg:px-24 pb-10">
        <p className="font-mono text-[11px] tracking-[0.2em] text-[#C9A84C]/60 uppercase mb-4">Rechtliches</p>
        <h1 className="font-display text-4xl md:text-5xl text-[#F5F0E8] tracking-tight">Impressum</h1>
      </div>

      <SectionWrapper maxWidth="md" reveal={false}>
        <div className="flex flex-col gap-8 text-[#9A9590] text-sm leading-relaxed">

          <div>
            <p className="font-mono text-[11px] tracking-[0.16em] text-[#C9A84C]/60 uppercase mb-3">Angaben gemäß § 5 TMG</p>
            <div className="flex flex-col gap-1">
              {/* TODO: echte Daten eintragen */}
              <p className="text-[#F5F0E8]">Chris Schubert</p>
              <p>Musterstraße 1 {/* TODO */}</p>
              <p>12345 Musterstadt {/* TODO */}</p>
              <p>Deutschland</p>
            </div>
          </div>

          <GoldDivider variant="fade" />

          <div>
            <p className="font-mono text-[11px] tracking-[0.16em] text-[#C9A84C]/60 uppercase mb-3">Kontakt</p>
            <div className="flex flex-col gap-1">
              <p>E-Mail: <a href="mailto:hello@candlescope.de" className="text-[#C9A84C] hover:text-[#E8C56D] transition-colors">hello@candlescope.de</a></p>
              <p>Website: <a href="https://candlescope.de" className="text-[#C9A84C] hover:text-[#E8C56D] transition-colors">candlescope.de</a></p>
            </div>
          </div>

          <GoldDivider variant="fade" />

          <div>
            <p className="font-mono text-[11px] tracking-[0.16em] text-[#C9A84C]/60 uppercase mb-3">Haftungsausschluss</p>
            <p>
              Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit
              und Aktualität der Inhalte kann keine Gewähr übernommen werden.
            </p>
          </div>

          <div>
            <p className="font-mono text-[11px] tracking-[0.16em] text-[#C9A84C]/60 uppercase mb-3">Finanz-Disclaimer</p>
            <HighlightLine>
              Alle Inhalte zu Finanzen, Trading und Kryptowährungen stellen keine Anlageberatung dar.
              Es handelt sich ausschließlich um persönliche Meinungen. Keine BaFin-Zulassung vorhanden.
              Investitionen sind mit Risiken verbunden.
            </HighlightLine>
          </div>

          <div>
            <p className="font-mono text-[11px] tracking-[0.16em] text-[#C9A84C]/60 uppercase mb-3">Urheberrecht</p>
            <p>
              Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem
              deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
              Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung
              des jeweiligen Autors bzw. Erstellers.
            </p>
          </div>

        </div>
      </SectionWrapper>
    </>
  )
}