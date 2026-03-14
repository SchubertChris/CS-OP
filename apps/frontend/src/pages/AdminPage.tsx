export default function AdminPage() {
  return (
    <section className="min-h-screen pt-32 px-8 md:px-16 lg:px-24">
      <div className="max-w-5xl mx-auto">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[#C9A84C] mb-4">
          Admin
        </p>
        <h1 className="font-display text-5xl md:text-7xl text-[#F5F0E8] tracking-tight mb-6">
          Control<br />
          <span className="text-[#C9A84C]">Panel</span>
        </h1>
        <p className="text-[#5a5550] text-base max-w-xl leading-relaxed">
          Blog · Content · Nutzer · Bestellungen.<br />
          Auth & Dashboard folgen in Phase 2.
        </p>
        <div className="mt-8 inline-flex items-center gap-3 border border-[#C9A84C]/20 px-5 py-3 rounded-full">
          <span className="w-2 h-2 rounded-full bg-[#C9A84C]/40 animate-pulse" />
          <span className="text-[11px] tracking-[0.1em] uppercase text-[#3a3530]">
            Zugang gesperrt — Phase 2
          </span>
        </div>
        <div className="mt-16 h-px w-24 bg-gradient-to-r from-[#C9A84C] to-transparent" />
      </div>
    </section>
  )
}