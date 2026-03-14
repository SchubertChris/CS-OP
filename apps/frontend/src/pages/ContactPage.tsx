import PageHero from '../components/ui/PageHero'

export default function ContactPage() {
  return (
    <PageHero
      eyebrow="Kontakt"
      titleLine1="Lass uns"
      titleLine2="reden"
      titleAccent="line2"
      description="Projekt · Kooperation · Beratung · Einfach ein Gespräch. Ich antworte innerhalb von 24 Stunden."
      theme="contact"
    >
      <a href="mailto:hello@candlescope.de"
        className="relative overflow-hidden group text-[11px] tracking-[0.16em] uppercase border border-[#C9A84C]/35 text-[#C9A84C] px-7 py-3.5 rounded-full">
        <span className="relative z-10 group-hover:text-[#080808] transition-colors duration-300">E-Mail schreiben</span>
        <span className="absolute inset-0 bg-[#C9A84C] rounded-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
      </a>
    </PageHero>
  )
}