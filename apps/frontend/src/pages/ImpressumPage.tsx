/* ============================================================
   CandleScope — Impressum
   src/pages/ImpressumPage.tsx
   ============================================================ */

import { Link } from 'react-router-dom'

export default function ImpressumPage() {
  return (
    <div className="min-h-screen px-8 md:px-16 lg:px-24 py-32 max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-12">
        <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#C9A84C]/60 mb-4 flex items-center gap-3">
          <span className="w-6 h-px bg-[#C9A84C]/40" />
          Rechtliches
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-[#F5F0E8] tracking-tight mb-4">Impressum</h1>
        <div className="h-px bg-gradient-to-r from-[#C9A84C]/30 to-transparent" />
      </div>

      <div className="flex flex-col gap-10 text-[#9A9590] leading-relaxed">

        {/* Angaben gemäß § 5 TMG */}
        <section>
          <h2 className="font-display text-xl text-[#F5F0E8] mb-4">Angaben gemäß § 5 TMG</h2>
          <div className="flex flex-col gap-1 text-[15px]">
            <p className="text-[#F5F0E8] font-medium">Chris Schubert</p>
            <p>Hans-Marchwitza-Ring 19</p>
            <p>14473 Potsdam</p>
            <p>Deutschland</p>
          </div>
        </section>

        {/* Kontakt */}
        <section>
          <h2 className="font-display text-xl text-[#F5F0E8] mb-4">Kontakt</h2>
          <div className="flex flex-col gap-2 text-[15px]">
            <p>
              <span className="text-[#F5F0E8]">Telefon:</span>{' '}
              Nur auf Anfrage per E-Mail
            </p>
            <p>
              <span className="text-[#F5F0E8]">E-Mail:</span>{' '}
              <a href="mailto:info@candlescope.de"
                className="text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors">
                info@candlescope.de
              </a>
            </p>
          </div>
        </section>

        {/* Hinweis Privatperson */}
        <section className="border border-[#C9A84C]/15 rounded-2xl p-6 bg-[#0d0d0d]">
          <h2 className="font-display text-lg text-[#F5F0E8] mb-3">Hinweis</h2>
          <p className="text-[14px]">
            Diese Website wird von einer Privatperson betrieben. Es besteht keine Umsatzsteuer-Identifikationsnummer,
            da keine gewerbliche Tätigkeit im Sinne des Umsatzsteuergesetzes ausgeübt wird.
          </p>
        </section>

        {/* Verantwortlich für den Inhalt */}
        <section>
          <h2 className="font-display text-xl text-[#F5F0E8] mb-4">
            Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
          </h2>
          <div className="flex flex-col gap-1 text-[15px]">
            <p className="text-[#F5F0E8] font-medium">Chris Schubert</p>
            <p>Hans-Marchwitza-Ring 19</p>
            <p>14473 Potsdam</p>
          </div>
        </section>

        {/* Haftung für Inhalte */}
        <section>
          <h2 className="font-display text-xl text-[#F5F0E8] mb-4">Haftung für Inhalte</h2>
          <p className="text-[14px]">
            Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den
            allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
            verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen
            zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
          </p>
          <p className="text-[14px] mt-3">
            Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen
            Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt
            der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden
            Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
          </p>
        </section>

        {/* Haftung für Links */}
        <section>
          <h2 className="font-display text-xl text-[#F5F0E8] mb-4">Haftung für Links</h2>
          <p className="text-[14px]">
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.
            Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der
            verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
          </p>
          <p className="text-[14px] mt-3">
            Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft.
            Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche
            Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht
            zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
          </p>
        </section>

        {/* Urheberrecht */}
        <section>
          <h2 className="font-display text-xl text-[#F5F0E8] mb-4">Urheberrecht</h2>
          <p className="text-[14px]">
            Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
            Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb
            der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw.
            Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch
            gestattet.
          </p>
          <p className="text-[14px] mt-3">
            Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte
            Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem
            auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis.
            Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
          </p>
        </section>

        {/* Streitschlichtung */}
        <section>
          <h2 className="font-display text-xl text-[#F5F0E8] mb-4">Streitschlichtung</h2>
          <p className="text-[14px]">
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
            <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer"
              className="text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors">
              https://ec.europa.eu/consumers/odr/
            </a>
          </p>
          <p className="text-[14px] mt-3">
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </section>

        {/* Finanzielle Inhalte */}
        <section className="border border-[#C9A84C]/15 rounded-2xl p-6 bg-[#0d0d0d]">
          <h2 className="font-display text-lg text-[#F5F0E8] mb-3">Hinweis zu Finanzinhalten</h2>
          <p className="text-[14px]">
            Alle auf dieser Website veröffentlichten Inhalte zu Finanzen, Trading, Kryptowährungen und
            Investitionen stellen ausschließlich die persönliche Meinung des Betreibers dar und sind keine
            Anlageberatung im Sinne des Wertpapierhandelsgesetzes (WpHG). Der Betreiber verfügt über keine
            BaFin-Lizenz. Investitionsentscheidungen sollten stets auf Basis eigener Recherche und ggf.
            in Absprache mit einem zugelassenen Finanzberater getroffen werden.
          </p>
        </section>

        {/* Back Link */}
        <div className="pt-4 border-t border-[#C9A84C]/10">
          <Link to="/" className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#9A9590] hover:text-[#C9A84C] transition-colors flex items-center gap-2">
            ← Zurück zur Startseite
          </Link>
        </div>
      </div>
    </div>
  )
}