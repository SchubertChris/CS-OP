/* ============================================================
   CandleScope — Datenschutzerklärung
   src/pages/DatenschutzPage.tsx
   DSGVO-konform für Deutschland · Stand: 2026
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
        <p className="text-[#5a5550] font-mono text-[12px]">Stand: April 2026</p>
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
            (340 Pine Street, Suite 603, San Francisco, CA 94104, USA). Beim Aufruf der Website werden
            automatisch Verbindungsdaten an Vercel übermittelt, darunter IP-Adresse, Browsertyp,
            Betriebssystem, Referrer-URL sowie Datum und Uhrzeit des Zugriffs.
          </p>
          <p className="text-[14px] mt-3">
            Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse
            an einem sicheren und effizienten Betrieb der Website). Vercel hat Standardvertragsklauseln
            (SCCs) gemäß Art. 46 Abs. 2 lit. c DSGVO abgeschlossen.
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
            (Name, E-Mail-Adresse, Nachricht) über den Dienst{' '}
            <strong className="text-[#F5F0E8]">Formspree Inc.</strong> (Auftragsverarbeiter, USA)
            verarbeitet und per E-Mail an uns weitergeleitet.
          </p>
          <p className="text-[14px] mt-3">
            Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung)
            bzw. Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Beantwortung von Anfragen).
            Zweck der Verarbeitung ist ausschließlich die Bearbeitung Ihrer Anfrage.
          </p>
          <p className="text-[14px] mt-3">
            Die übermittelten Daten werden nicht an weitere Dritte weitergegeben und nach vollständiger
            Erledigung Ihrer Anfrage, spätestens nach 6 Monaten, gelöscht. Weitere Informationen:{' '}
            <a href="https://formspree.io/legal/privacy-policy" target="_blank" rel="noopener noreferrer"
              className="text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors">
              formspree.io/legal/privacy-policy
            </a>
          </p>
        </section>

        {/* 4. Externe Dienste */}
        <section>
          <h2 className="font-display text-xl text-[#F5F0E8] mb-4">4. Externe Dienste</h2>
          <p className="text-[14px]">
            Diese Website ruft öffentliche Daten von externen APIs ab. Dabei werden keine
            personenbezogenen Daten übermittelt oder gespeichert:
          </p>
          <div className="flex flex-col gap-3 mt-4 text-[14px]">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]/50 mt-2 shrink-0" />
              <p>
                <strong className="text-[#F5F0E8]">GitHub API:</strong>{' '}
                Abruf öffentlicher Repository-Daten (Sterne, Commits). Es werden keine
                personenbezogenen Daten gespeichert oder weitergegeben.{' '}
                <a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement"
                  target="_blank" rel="noopener noreferrer"
                  className="text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors">
                  GitHub Privacy Statement
                </a>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]/50 mt-2 shrink-0" />
              <p>
                <strong className="text-[#F5F0E8]">Discord API:</strong>{' '}
                Abruf öffentlicher Serverstatistiken (Mitgliederzahl). Es werden keine
                personenbezogenen Daten gespeichert oder weitergegeben.{' '}
                <a href="https://discord.com/privacy" target="_blank" rel="noopener noreferrer"
                  className="text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors">
                  Discord Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* 5. localStorage */}
        <section>
          <h2 className="font-display text-xl text-[#F5F0E8] mb-4">5. Lokaler Speicher (localStorage)</h2>
          <p className="text-[14px]">
            Diese Website speichert technisch notwendige Daten im lokalen Speicher (localStorage) des
            Browsers. Gespeichert werden ausschließlich Daten für folgende Zwecke:
          </p>
          <div className="flex flex-col gap-2 mt-4 text-[14px]">
            {[
              'Admin-Panel Session (Authentifizierungsstatus)',
              'Cookie-Consent-Einstellungen',
              'Page-Builder-Daten',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]/50 mt-2 shrink-0" />
                <p>{item}</p>
              </div>
            ))}
          </div>
          <p className="text-[14px] mt-3">
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (technisch notwendig; kein Consent
            erforderlich). Die gespeicherten Daten verbleiben ausschließlich im Browser des Nutzers
            und werden nicht an Dritte weitergegeben.
          </p>
        </section>

        {/* 6. Keine Tracking-Dienste */}
        <section>
          <h2 className="font-display text-xl text-[#F5F0E8] mb-4">6. Keine Tracking-Dienste</h2>
          <p className="text-[14px]">
            Diese Website verwendet <strong className="text-[#F5F0E8]">keine</strong> Analytics-,
            Werbe- oder Tracking-Skripte. Es werden weder Google Analytics, Meta Pixel noch
            vergleichbare Dienste eingesetzt.
          </p>
        </section>

        {/* 7. Betroffenenrechte */}
        <section>
          <h2 className="font-display text-xl text-[#F5F0E8] mb-4">7. Ihre Rechte</h2>
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
          <p className="text-[14px] mt-3">
            Sie haben zudem das Recht, sich bei der zuständigen Datenschutz-Aufsichtsbehörde
            Ihres Bundeslandes über die Verarbeitung Ihrer personenbezogenen Daten zu beschweren.
          </p>
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