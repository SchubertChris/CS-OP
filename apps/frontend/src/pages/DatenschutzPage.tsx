/* ============================================================
   CandleScope — Datenschutzerklärung
   src/pages/DatenschutzPage.tsx
   DSGVO-konform für Deutschland · Stand: 2025
   ============================================================ */

import { Link } from 'react-router-dom'

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen px-8 md:px-16 lg:px-24 py-32 max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-12">
        <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#C9A84C]/60 mb-4 flex items-center gap-3">
          <span className="w-6 h-px bg-[#C9A84C]/40" />
          Rechtliches
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-[#F5F0E8] tracking-tight mb-4">
          Datenschutzerklärung
        </h1>
        <p className="text-[#5a5550] font-mono text-[12px]">Stand: März 2025</p>
        <div className="h-px bg-gradient-to-r from-[#C9A84C]/30 to-transparent mt-4" />
      </div>

      <div className="flex flex-col gap-10 text-[#9A9590] leading-relaxed">

        {/* 1. Verantwortlicher */}
        <section>
          <h2 className="font-display text-xl text-[#F5F0E8] mb-4">1. Verantwortlicher</h2>
          <p className="text-[14px]">
            Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:
          </p>
          <div className="flex flex-col gap-1 text-[15px] mt-4 pl-4 border-l border-[#C9A84C]/20">
            <p className="text-[#F5F0E8] font-medium">Chris Schubert</p>
            <p>Hans-Marchwitza-Ring 19</p>
            <p>14473 Potsdam</p>
            <p>Deutschland</p>
            <p className="mt-2">
              E-Mail:{' '}
              <a href="mailto:info@candlescope.de"
                className="text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors">
                info@candlescope.de
              </a>
            </p>
          </div>
        </section>

        {/* 2. Hosting */}
        <section>
          <h2 className="font-display text-xl text-[#F5F0E8] mb-4">2. Hosting</h2>
          <p className="text-[14px]">
            Diese Website wird bei <strong className="text-[#F5F0E8]">Vercel Inc.</strong> gehostet
            (440 N Barranca Ave #4133, Covina, CA 91723, USA). Beim Aufruf der Website werden automatisch
            Verbindungsdaten an Vercel übermittelt, darunter IP-Adresse, Browsertyp, Betriebssystem,
            Referrer-URL sowie Datum und Uhrzeit des Zugriffs.
          </p>
          <p className="text-[14px] mt-3">
            Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse
            an einem sicheren und effizienten Betrieb der Website). Vercel ist unter dem EU-US Data Privacy
            Framework zertifiziert.
          </p>
          <p className="text-[14px] mt-3">
            Weitere Informationen:{' '}
            <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer"
              className="text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors">
              vercel.com/legal/privacy-policy
            </a>
          </p>
        </section>

        {/* 3. Kontaktformular */}
        <section>
          <h2 className="font-display text-xl text-[#F5F0E8] mb-4">3. Kontaktformular</h2>
          <p className="text-[14px]">
            Wenn Sie das Kontaktformular auf dieser Website nutzen, werden die eingegebenen Daten
            (Name, E-Mail-Adresse, Nachricht) über den Dienst <strong className="text-[#F5F0E8]">Formspree</strong>
            {' '}(Formspree Inc., USA) verarbeitet und per E-Mail an uns weitergeleitet.
          </p>
          <p className="text-[14px] mt-3">
            Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung)
            bzw. Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Beantwortung von Anfragen).
          </p>
          <p className="text-[14px] mt-3">
            Die übermittelten Daten werden ausschließlich zur Bearbeitung Ihrer Anfrage verwendet und
            nicht an Dritte weitergegeben. Formspree verarbeitet die Daten auf US-amerikanischen Servern.
            Weitere Informationen:{' '}
            <a href="https://formspree.io/legal/privacy-policy" target="_blank" rel="noopener noreferrer"
              className="text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors">
              formspree.io/legal/privacy-policy
            </a>
          </p>
        </section>

        {/* 4. Cookies & Lokaler Speicher */}
        <section>
          <h2 className="font-display text-xl text-[#F5F0E8] mb-4">4. Cookies & Lokaler Speicher</h2>
          <p className="text-[14px]">
            Diese Website verwendet keine Tracking-Cookies und keine Analyse-Tools wie Google Analytics.
            Es werden lediglich technisch notwendige Daten im lokalen Speicher (localStorage) des Browsers
            gespeichert, um die Funktionalität der Website sicherzustellen (z. B. Einstellungen des
            Admin-Bereichs).
          </p>
          <p className="text-[14px] mt-3">
            Diese Speicherung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO und erfordert keine
            gesonderte Einwilligung.
          </p>
        </section>

        {/* 5. Externe Links */}
        <section>
          <h2 className="font-display text-xl text-[#F5F0E8] mb-4">5. Externe Dienste & Links</h2>
          <p className="text-[14px]">
            Diese Website enthält Links zu externen Diensten wie GitHub und Discord. Beim Anklicken dieser
            Links verlassen Sie unsere Website. Für die Datenschutzpraktiken dieser Drittanbieter sind wir
            nicht verantwortlich.
          </p>
          <div className="flex flex-col gap-2 mt-4 text-[14px]">
            <p>
              <strong className="text-[#F5F0E8]">GitHub:</strong>{' '}
              <a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement"
                target="_blank" rel="noopener noreferrer"
                className="text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors">
                GitHub Privacy Statement
              </a>
            </p>
            <p>
              <strong className="text-[#F5F0E8]">Discord:</strong>{' '}
              <a href="https://discord.com/privacy" target="_blank" rel="noopener noreferrer"
                className="text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors">
                Discord Privacy Policy
              </a>
            </p>
          </div>
        </section>

        {/* 6. Ihre Rechte */}
        <section>
          <h2 className="font-display text-xl text-[#F5F0E8] mb-4">6. Ihre Rechte</h2>
          <p className="text-[14px] mb-4">
            Sie haben gegenüber uns folgende Rechte hinsichtlich der Sie betreffenden personenbezogenen Daten:
          </p>
          <div className="flex flex-col gap-3 text-[14px]">
            {[
              { title: 'Auskunftsrecht', desc: 'Art. 15 DSGVO — Sie können Auskunft über Ihre gespeicherten Daten verlangen.' },
              { title: 'Berichtigungsrecht', desc: 'Art. 16 DSGVO — Sie können die Berichtigung unrichtiger Daten verlangen.' },
              { title: 'Recht auf Löschung', desc: 'Art. 17 DSGVO — Sie können die Löschung Ihrer Daten verlangen.' },
              { title: 'Recht auf Einschränkung', desc: 'Art. 18 DSGVO — Sie können die Einschränkung der Verarbeitung verlangen.' },
              { title: 'Widerspruchsrecht', desc: 'Art. 21 DSGVO — Sie können der Verarbeitung widersprechen.' },
              { title: 'Datenübertragbarkeit', desc: 'Art. 20 DSGVO — Sie können Ihre Daten in einem gängigen Format erhalten.' },
            ].map((r, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]/50 mt-2 shrink-0" />
                <p>
                  <strong className="text-[#F5F0E8]">{r.title}:</strong>{' '}{r.desc}
                </p>
              </div>
            ))}
          </div>
          <p className="text-[14px] mt-4">
            Zur Ausübung Ihrer Rechte wenden Sie sich bitte an:{' '}
            <a href="mailto:info@candlescope.de"
              className="text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors">
              info@candlescope.de
            </a>
          </p>
        </section>

        {/* 7. Beschwerderecht */}
        <section>
          <h2 className="font-display text-xl text-[#F5F0E8] mb-4">7. Beschwerderecht bei der Aufsichtsbehörde</h2>
          <p className="text-[14px]">
            Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung
            Ihrer personenbezogenen Daten zu beschweren. Zuständige Aufsichtsbehörde für Brandenburg ist:
          </p>
          <div className="flex flex-col gap-1 text-[14px] mt-4 pl-4 border-l border-[#C9A84C]/20">
            <p className="text-[#F5F0E8]">Landesbeauftragte für den Datenschutz und das Recht auf Akteneinsicht Brandenburg</p>
            <p>Stahnsdorfer Damm 77</p>
            <p>14532 Kleinmachnow</p>
            <p>
              Website:{' '}
              <a href="https://www.lda.brandenburg.de" target="_blank" rel="noopener noreferrer"
                className="text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors">
                www.lda.brandenburg.de
              </a>
            </p>
          </div>
        </section>

        {/* 8. Aktualität */}
        <section className="border border-[#C9A84C]/15 rounded-2xl p-6 bg-[#0d0d0d]">
          <h2 className="font-display text-lg text-[#F5F0E8] mb-3">Aktualität dieser Erklärung</h2>
          <p className="text-[14px]">
            Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen, um sie stets den
            aktuellen rechtlichen Anforderungen zu entsprechen oder Änderungen unserer Leistungen umzusetzen.
            Es gilt jeweils die aktuelle Version auf dieser Seite.
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