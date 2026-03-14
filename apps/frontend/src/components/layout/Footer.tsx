import { Link } from 'react-router-dom'
import { Github, TrendingUp, Code2, User, MessageSquare, Mail, ExternalLink } from 'lucide-react'

const footerNav = [
  { to: '/finance', label: 'Finance', icon: <TrendingUp size={14} strokeWidth={1.5} />, desc: 'Haushaltsbuch · Trading · Tools' },
  { to: '/dev', label: 'Dev & Web', icon: <Code2 size={14} strokeWidth={1.5} />, desc: 'Websites · Coding · Projekte' },
  { to: '/about', label: 'About', icon: <User size={14} strokeWidth={1.5} />, desc: 'Über mich · Angebote' },
  { to: '/contact', label: 'Kontakt', icon: <MessageSquare size={14} strokeWidth={1.5} />, desc: 'Anfragen · Kooperationen' },
]

const legalLinks = [
  { to: '/impressum', label: 'Impressum' },
  { to: '/datenschutz', label: 'Datenschutz' },
]

const DiscordIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.001.022.015.04.03.05a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
)

export default function Footer() {
  return (
    <footer className="mt-40 border-t border-[#C9A84C]/10">
      <div className="px-8 md:px-14 lg:px-20 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-14">

          {/* Brand */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <Link to="/" className="group flex items-center gap-3 w-fit">
              <div className="relative w-8 h-8 shrink-0">
                <div className="absolute inset-0 border border-[#C9A84C]/40 rotate-45 group-hover:rotate-[225deg] transition-transform duration-700 rounded-sm" />
                <div className="absolute inset-[5px] bg-[#C9A84C]/15 rotate-45 rounded-sm" />
                <div className="absolute inset-[10px] bg-[#C9A84C] rotate-45 rounded-sm" />
              </div>
              <span className="font-display text-lg tracking-[0.14em] text-[#F5F0E8] uppercase">
                Candle<span className="text-[#C9A84C]">Scope</span>
              </span>
            </Link>
            <p className="text-sm text-[#3a3530] leading-loose max-w-[220px]">
              Trading · WebDev · Finance · Gaming.<br />Alles unter einer Marke.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://github.com/SchubertChris" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-[#ffffff]/6 text-[#3a3530] hover:text-[#C9A84C] hover:border-[#C9A84C]/30 transition-all duration-300"
                aria-label="GitHub">
                <Github size={15} strokeWidth={1.5} />
              </a>
              <a href="https://discord.gg/" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-[#ffffff]/6 text-[#3a3530] hover:text-[#C9A84C] hover:border-[#C9A84C]/30 transition-all duration-300"
                aria-label="Discord">
                <DiscordIcon />
              </a>
              <a href="mailto:hello@candlescope.de"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-[#ffffff]/6 text-[#3a3530] hover:text-[#C9A84C] hover:border-[#C9A84C]/30 transition-all duration-300"
                aria-label="E-Mail">
                <Mail size={15} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-5">
            <span className="text-[10px] tracking-[0.18em] uppercase text-[#2a2a2a]">Navigation</span>
            <div className="flex flex-col gap-4">
              {footerNav.map(({ to, label, icon, desc }) => (
                <Link key={to} to={to}
                  className="group flex items-start gap-3 text-[#5a5550] hover:text-[#F5F0E8] transition-colors duration-300">
                  <span className="mt-0.5 text-[#2a2a2a] group-hover:text-[#C9A84C] transition-colors duration-300 shrink-0">
                    {icon}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm tracking-[0.04em]">{label}</span>
                    <span className="text-[10px] tracking-[0.08em] text-[#2a2a2a] group-hover:text-[#3a3530] transition-colors uppercase">{desc}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Kontakt */}
          <div className="flex flex-col gap-5">
            <span className="text-[10px] tracking-[0.18em] uppercase text-[#2a2a2a]">Kontakt</span>
            <div className="flex flex-col gap-4">
              <a href="mailto:hello@candlescope.de"
                className="group flex items-center gap-2 text-sm text-[#5a5550] hover:text-[#C9A84C] transition-colors duration-300 w-fit">
                hello@candlescope.de
                <ExternalLink size={11} strokeWidth={1.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <a href="https://candlescope.de"
                className="group flex items-center gap-2 text-sm text-[#5a5550] hover:text-[#C9A84C] transition-colors duration-300 w-fit">
                candlescope.de
                <ExternalLink size={11} strokeWidth={1.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <a href="https://discord.gg/" target="_blank" rel="noopener noreferrer"
                className="group flex items-center gap-2 text-sm text-[#5a5550] hover:text-[#C9A84C] transition-colors duration-300 w-fit mt-1">
                <DiscordIcon />
                Discord beitreten
                <ExternalLink size={11} strokeWidth={1.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-5">
            <span className="text-[10px] tracking-[0.18em] uppercase text-[#2a2a2a]">Zusammenarbeit</span>
            <p className="text-sm text-[#3a3530] leading-loose">
              Projekt, Kooperation oder ein Gespräch über Märkte?
            </p>
            <a href="mailto:hello@candlescope.de"
              className="relative overflow-hidden group w-fit text-[10px] tracking-[0.16em] uppercase border border-[#C9A84C]/30 text-[#C9A84C] px-6 py-3 rounded-full">
              <span className="relative z-10 transition-colors duration-300 group-hover:text-[#080808]">
                Kontakt aufnehmen
              </span>
              <span className="absolute inset-0 bg-[#C9A84C] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-full" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#C9A84C]/8 px-8 md:px-14 lg:px-20 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="text-[11px] text-[#2a2a2a] tracking-[0.08em]">
            © {new Date().getFullYear()} CandleScope · Chris Schubert
          </span>
          <div className="flex items-center gap-6">
            {legalLinks.map(({ to, label }) => (
              <Link key={to} to={to}
                className="text-[11px] text-[#2a2a2a] hover:text-[#5a5550] tracking-[0.08em] transition-colors duration-300">
                {label}
              </Link>
            ))}
            <span className="text-[11px] text-[#2a2a2a] tracking-[0.08em]">
              Built with React · Vite · TS
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}