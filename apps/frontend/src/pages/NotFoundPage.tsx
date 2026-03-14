import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="min-h-screen flex items-center justify-center px-8">
      <div className="text-center">
        <p className="font-display text-[120px] md:text-[180px] text-[#C9A84C]/10 leading-none select-none mb-0">
          404
        </p>
        <p className="text-[11px] tracking-[0.2em] uppercase text-[#C9A84C] -mt-4 mb-6">
          Seite nicht gefunden
        </p>
        <p className="text-[#5a5550] text-sm max-w-xs mx-auto leading-relaxed mb-10">
          Diese Seite existiert nicht oder wurde verschoben.
        </p>
        <Link
          to="/"
          className="relative overflow-hidden group inline-flex text-[10px] tracking-[0.16em] uppercase border border-[#C9A84C]/30 text-[#C9A84C] px-8 py-3 rounded-full"
        >
          <span className="relative z-10 group-hover:text-[#080808] transition-colors duration-300">
            Zurück zur Startseite
          </span>
          <span className="absolute inset-0 bg-[#C9A84C] rounded-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        </Link>
      </div>
    </section>
  )
}