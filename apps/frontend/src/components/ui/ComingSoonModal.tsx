import { motion } from 'framer-motion'
import { X, Clock } from 'lucide-react'

export default function ComingSoonModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(6px)', backgroundColor: 'rgba(8,8,8,0.75)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-full max-w-sm bg-[var(--cs-s2)] border border-[#C9A84C]/20 rounded-2xl p-8
                   flex flex-col items-center text-center gap-5 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--cs-text-3)] hover:text-[var(--cs-text)] transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
        <div className="w-14 h-14 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20
                        flex items-center justify-center">
          <Clock size={24} className="text-[#C9A84C]" />
        </div>
        <div>
          <p className="text-[#C9A84C] text-xs tracking-[0.15em] uppercase mb-2">Bald verfügbar</p>
          <h3 className="text-[var(--cs-text)] font-bold text-xl mb-2">Download startet am</h3>
          <p className="text-[#C9A84C] text-3xl font-black">8. Juni 2026</p>
        </div>
        <p className="text-[var(--cs-text-2)] text-sm leading-relaxed">
          Die erste Version geht am 8.6.2026 online — kostenlos für alle.
          Bis dahin kannst du dich schon mal auf Discord melden.
        </p>
        <button
          onClick={onClose}
          className="bg-[#C9A84C] text-[#080808] font-bold text-sm px-8 py-3 rounded-lg
                     hover:opacity-90 transition-opacity duration-200 cursor-pointer"
        >
          Verstanden
        </button>
      </motion.div>
    </div>
  )
}
