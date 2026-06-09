/* ============================================================
   CandleScope — Datenschutzerklärung
   src/pages/DatenschutzPage.tsx
   DSGVO-konform für Deutschland · Stand: Juni 2026
   ============================================================ */

import { Link } from 'react-router-dom'

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen px-8 md:px-16 lg:px-24 py-32 max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-12">
        <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-[var(--cs-text-2)] mb-4 flex items-center gap-3">
          <span className="w-6 h-px bg-[#C9A84C]/40" />
          Rechtliches
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-[var(--cs-text)] tracking-tight mb-4">
          Datenschutzerklärung
        </h1>
        <p className="text-[var(--cs-text-3)] font-mono text-[12px]">Stand: Juni 2026</p>
        <div className="h-px bg-gradient-to-r from-[#C9A84C]/30 to-transparent mt-4" />
      </div>

      <div className="flex flex-col gap-10 text-[var(--cs-text-2)] leading-relaxed">

        {/* 1. Verantwortlicher */}
        <section>
          <h2 className="font-display text-xl text-[var(--cs-text)] mb-4">1. Verantwortlicher</h2>
          <p className="text-[14px]">
            Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:
          </p>
          <div className="flex flex-col gap-1 text-[15px] mt-4 pl-4 border-l border-[#C9A84C]/20">
            <p className="text-[var(--cs-text)] font-medium">Chris Schubert</p>
            <p className="mt-2">
              E-Mail:{' '}
              <a href="mailto:info@candlescope.de"
                className="text-[var(--cs-text-2)] hover:text-[#C9A84C] transition-colors">
                info@candlescope.de
              </a>
            </p>
          </div>
        </section>

        {/* 2. Hosting */}
        <section>
          <h2 className="font-display text-xl text-[var(--cs-text)] mb-4">2. Hosting</h2>
          <p className="text-[14px]">
            Diese Website wird bei <strong className="text-[var(--cs-text)]">Vercel Inc.</strong> gehostet
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
              className="text-[var(--cs-text-2)] hover:text-[#C9A84C] transition-colors">
              vercel.com/legal/privacy-policy
            </a>
          </p>
        </section>

        {/* 3. Kontaktformular */}
        <section>
          <h2 className="font-display text-xl text-[var(--cs-text)] mb-4">3. Kontaktformular</h2>
          <p className="text-[14px]">
            Wenn Sie das Kontaktformular auf dieser Website nutzen, werden die eingegebenen Daten
            (Name, E-Mail-Adresse, Nachricht) über den Dienst{' '}
            <strong className="text-[var(--cs-text)]">Formspree Inc.</strong> (Auftragsverarbeiter, USA)
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
              className="text-[var(--cs-text-2)] hover:text-[#C9A84C] transition-colors">
              formspree.io/legal/privacy-policy
            </a>
          </p>
        </section>

        {/* 4. Externe Dienste */}
        <section>
          <h2 className="font-display text-xl text-[var(--cs-text)] mb-4">4. Externe Dienste</h2>
          <p className="text-[14px]">
            Diese Website ruft öffentliche Daten von externen APIs ab. Dabei werden keine
            personenbezogenen Daten übermittelt oder gespeichert:
          </p>
          <div className="flex flex-col gap-3 mt-4 text-[14px]">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]/50 mt-2 shrink-0" />
              <p>
                <strong className="text-[var(--cs-text)]">GitHub API:</strong>{' '}
                Abruf öffentlicher Repository-Daten (Sterne, Commits). Es werden keine
                personenbezogenen Daten gespeichert oder weitergegeben.{' '}
                <a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement"
                  target="_blank" rel="noopener noreferrer"
                  className="text-[var(--cs-text-2)] hover:text-[#C9A84C] transition-colors">
                  GitHub Privacy Statement
                </a>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]/50 mt-2 shrink-0" />
              <p>
                <strong className="text-[var(--cs-text)]">Discord API:</strong>{' '}
                Abruf öffentlicher Serverstatistiken (Mitgliederzahl). Es werden keine
                personenbezogenen Daten gespeichert oder weitergegeben.{' '}
                <a href="https://discord.com/privacy" target="_blank" rel="noopener noreferrer"
                  className="text-[var(--cs-text-2)] hover:text-[#C9A84C] transition-colors">
                  Discord Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* 5. localStorage */}
        <section>
          <h2 className="font-display text-xl text-[var(--cs-text)] mb-4">5. Lokaler Speicher (localStorage)</h2>
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

        {/* 6. Eigene Nutzungsstatistiken */}
        <section>
          <h2 className="font-display text-xl text-[var(--cs-text)] mb-4">6. Selbstgehostetes Analyse-System (einwilligungspflichtig)</h2>
          <p className="text-[14px]">
            Diese Website betreibt ein selbstgehostetes, datenschutzfreundliches Analyse-System.
            Es wird <strong className="text-[var(--cs-text)]">ausschließlich nach Ihrer ausdrücklichen Einwilligung</strong> aktiviert —
            standardmäßig ist das Tracking vollständig deaktiviert.
          </p>

          <p className="text-[14px] mt-4 font-medium text-[var(--cs-text)]">Zweck und Rechtsgrundlage</p>
          <p className="text-[14px] mt-1">
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. a DSGVO (Einwilligung). Das System dient
            ausschließlich dazu, die Struktur und Benutzerführung der Website zu optimieren.
          </p>

          <p className="text-[14px] mt-4 font-medium text-[var(--cs-text)]">Verarbeitete Daten (nur bei erteilter Einwilligung)</p>
          <div className="flex flex-col gap-2 mt-2 text-[14px]">
            {[
              'Aufgerufene Seite (URL-Pfad)',
              'Referrer-URL (verweisende Website, sofern vom Browser übermittelt)',
              'Anonyme Sitzungs-ID — wird ausschließlich im flüchtigen Arbeitsspeicher des Browsers gehalten (sessionStorage) und beim Schließen des Tabs automatisch verworfen',
              'Herkunftsland (auf Basis der IP-Adresse, ermittelt durch Vercel — ohne dauerhafte IP-Speicherung)',
              'Gerätetyp (Desktop / Tablet / Mobile)',
              'Browsertyp und Betriebssystem',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]/50 mt-2 shrink-0" />
                <p>{item}</p>
              </div>
            ))}
          </div>

          <p className="text-[14px] mt-4 font-medium text-[var(--cs-text)]">Ausdrücklich nicht verarbeitet</p>
          <div className="flex flex-col gap-2 mt-2 text-[14px]">
            {[
              'IP-Adressen werden nicht dauerhaft gespeichert',
              'Es werden keine Cookies für Analyse-Zwecke gesetzt',
              'Es werden keine Nutzerprofile erstellt oder Daten mit anderen Quellen verknüpft',
              'Externe Analyse-Dienste (Google Analytics, Meta Pixel o. Ä.) werden nicht eingesetzt',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00C896]/50 mt-2 shrink-0" />
                <p>{item}</p>
              </div>
            ))}
          </div>

          <p className="text-[14px] mt-4">
            Die Daten werden <strong className="text-[var(--cs-text)]">ausschließlich auf eigenen Servern</strong> (Vercel-Infrastruktur,
            vgl. Abschnitt 2) gespeichert und nach spätestens <strong className="text-[var(--cs-text)]">90 Tagen automatisch gelöscht</strong>.
          </p>

          <p className="text-[14px] mt-4 font-medium text-[var(--cs-text)]">Widerrufsrecht</p>
          <p className="text-[14px] mt-1">
            Sie können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen, indem Sie
            den Eintrag <code className="font-mono text-[12px] bg-[var(--cs-s3)] px-1.5 py-0.5 rounded">candlescope-cookie-consent</code> aus
            dem Browser-localStorage löschen oder uns unter{' '}
            <a href="mailto:info@candlescope.de" className="text-[var(--cs-text-2)] hover:text-[#C9A84C] transition-colors">
              info@candlescope.de
            </a>{' '}
            kontaktieren. Die Rechtmäßigkeit der bis zum Widerruf erfolgten Verarbeitung bleibt davon unberührt
            (Art. 7 Abs. 3 DSGVO).
          </p>
        </section>

        {/* 7. Calendly (externer Link) */}
        <section>
          <h2 className="font-display text-xl text-[var(--cs-text)] mb-4">7. Terminbuchung via Calendly</h2>
          <p className="text-[14px]">
            Auf der Kontaktseite befindet sich ein Link zu{' '}
            <strong className="text-[var(--cs-text)]">Calendly</strong> (Calendly LLC, 271 17th Street NW,
            Atlanta, GA 30363, USA). Beim Klick auf den Link verlassen Sie diese Website und werden
            zu Calendly weitergeleitet. Es werden dabei <strong className="text-[var(--cs-text)]">keine Daten von dieser
            Website an Calendly übermittelt</strong> — das Widget ist nicht eingebettet.
          </p>
          <p className="text-[14px] mt-3">
            Sobald Sie auf der Calendly-Seite einen Termin buchen, gelten die dortigen
            Datenschutzbestimmungen. Weitere Informationen:{' '}
            <a href="https://calendly.com/privacy" target="_blank" rel="noopener noreferrer"
              className="text-[var(--cs-text-2)] hover:text-[#C9A84C] transition-colors">
              calendly.com/privacy
            </a>
          </p>
        </section>

        {/* 8. Betroffenenrechte */}
        <section>
          <h2 className="font-display text-xl text-[var(--cs-text)] mb-4">8. Ihre Rechte</h2>
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
                  <strong className="text-[var(--cs-text)]">{r.title}:</strong>{' '}{r.desc}
                </p>
              </div>
            ))}
          </div>
          <p className="text-[14px] mt-4">
            Zur Ausübung Ihrer Rechte wenden Sie sich bitte an:{' '}
            <a href="mailto:info@candlescope.de"
              className="text-[var(--cs-text-2)] hover:text-[#C9A84C] transition-colors">
              info@candlescope.de
            </a>
          </p>
          <p className="text-[14px] mt-3">
            Sie haben zudem das Recht, sich bei der zuständigen Datenschutz-Aufsichtsbehörde
            Ihres Bundeslandes über die Verarbeitung Ihrer personenbezogenen Daten zu beschweren.
          </p>
        </section>

        {/* 9. Aktualität */}
        <section className="border border-[#C9A84C]/15 rounded-2xl p-6 bg-[var(--cs-s1)]">
          <h2 className="font-display text-lg text-[var(--cs-text)] mb-3">Aktualität dieser Erklärung</h2>
          <p className="text-[14px]">
            Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen, um sie stets den
            aktuellen rechtlichen Anforderungen zu entsprechen oder Änderungen unserer Leistungen umzusetzen.
            Es gilt jeweils die aktuelle Version auf dieser Seite.
          </p>
        </section>

        {/* Back Link */}
        <div className="pt-4 border-t border-[#C9A84C]/10">
          <Link to="/" className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--cs-text-2)] hover:text-[#C9A84C] transition-colors flex items-center gap-2">
            ← Zurück zur Startseite
          </Link>
        </div>

      </div>
    </div>
  )
}