/* ============================================================
   CandleScope — Datenschutz
   src/pages/DatenschutzPage.tsx
   ============================================================ */
import { SectionWrapper, GoldDivider } from '../components/ui'

function DSSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.16em] text-[#C9A84C]/60 uppercase mb-3">{title}</p>
      <div className="text-[#9A9590] text-sm leading-relaxed flex flex-col gap-2">
        {children}
      </div>
    </div>
  )
}

export default function DatenschutzPage() {
  return (
    <>
      <div className="pt-32 px-8 md:px-16 lg:px-24 pb-10">
        <p className="font-mono text-[11px] tracking-[0.2em] text-[#C9A84C]/60 uppercase mb-4">Rechtliches</p>
        <h1 className="font-display text-4xl md:text-5xl text-[#F5F0E8] tracking-tight">Datenschutz&shy;erklärung</h1>
      </div>

      <SectionWrapper maxWidth="md" reveal={false}>
        <div className="flex flex-col gap-8">

          <DSSection title="1. Verantwortlicher">
            <p>
              Verantwortlicher im Sinne der DSGVO: Chris Schubert, hello@candlescope.de
              {/* TODO: vollständige Adresse */}
            </p>
          </DSSection>

          <GoldDivider />

          <DSSection title="2. Datenerfassung">
            <p>
              Diese Website erhebt beim Aufruf automatisch technische Daten (Server-Logs):
              IP-Adresse (anonymisiert), Zeitpunkt des Zugriffs, aufgerufene URL, verwendeter Browser.
            </p>
            <p>
              Diese Daten werden ausschließlich zur Sicherstellung des Betriebs verwendet und
              nicht an Dritte weitergegeben. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.
            </p>
          </DSSection>

          <GoldDivider />

          <DSSection title="3. Hosting">
            <p>
              Diese Website wird auf einem Server von IONOS SE, Elgendorfer Str. 57, 56410 Montabaur,
              Deutschland gehostet. Die IONOS-Datenschutzerklärung findest du unter ionos.de.
            </p>
          </DSSection>

          <GoldDivider />

          <DSSection title="4. Cookies">
            <p>
              Diese Website verwendet ausschließlich technisch notwendige Cookies (z.B. für den
              Admin-Bereich). Es werden keine Tracking- oder Marketing-Cookies eingesetzt.
            </p>
          </DSSection>

          <GoldDivider />

          <DSSection title="5. Keine Analytics">
            <p>
              Aktuell wird kein externes Analytics-Tool eingesetzt. Bei Einführung von Plausible
              Analytics (DSGVO-konform, ohne Cookies) wird diese Erklärung aktualisiert.
            </p>
          </DSSection>

          <GoldDivider />

          <DSSection title="6. Deine Rechte">
            <p>Du hast das Recht auf:</p>
            <ul className="list-none flex flex-col gap-1 pl-4">
              {[
                'Auskunft über deine gespeicherten Daten (Art. 15 DSGVO)',
                'Berichtigung unrichtiger Daten (Art. 16 DSGVO)',
                'Löschung deiner Daten (Art. 17 DSGVO)',
                'Einschränkung der Verarbeitung (Art. 18 DSGVO)',
                'Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)',
                'Datenübertragbarkeit (Art. 20 DSGVO)',
              ].map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#C9A84C]/40 mt-1">·</span>
                  {r}
                </li>
              ))}
            </ul>
            <p className="mt-2">
              Anfragen an: <a href="mailto:hello@candlescope.de"
                className="text-[#C9A84C] hover:text-[#E8C56D] transition-colors">
                hello@candlescope.de
              </a>
            </p>
          </DSSection>

          <GoldDivider />

          <DSSection title="7. Beschwerderecht">
            <p>
              Du hast das Recht, dich bei einer Datenschutzaufsichtsbehörde zu beschweren.
              Zuständig ist die Aufsichtsbehörde deines Bundeslandes.
            </p>
          </DSSection>

          <p className="font-mono text-[10px] text-[#3a3530] mt-4">
            Stand: März 2026 · Diese Erklärung wird bei Bedarf aktualisiert.
          </p>
        </div>
      </SectionWrapper>
    </>
  )
}