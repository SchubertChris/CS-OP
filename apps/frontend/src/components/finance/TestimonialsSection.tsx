// src/components/finance/TestimonialsSection.tsx
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, AlertCircle } from 'lucide-react'
import { useReviewStore } from '../../store/useReviewStore'

/* ── Shared star polygon ── */
const STAR_POLY = '12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26'

/* ── Static star display ── */
function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24"
          fill={i < count ? '#C9A84C' : 'none'}
          stroke={i < count ? '#C9A84C' : '#3a3530'}
          strokeWidth="2">
          <polygon points={STAR_POLY} />
        </svg>
      ))}
    </div>
  )
}

/* ── Interactive star picker (inside modal) ── */
function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  const active = hovered || value
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i + 1)}
          onMouseEnter={() => setHovered(i + 1)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${i + 1} Stern${i > 0 ? 'e' : ''}`}
          className="cursor-pointer transition-transform duration-100 hover:scale-110 active:scale-95"
        >
          <svg width="26" height="26" viewBox="0 0 24 24"
            fill={active > i ? '#C9A84C' : 'none'}
            stroke={active > i ? '#C9A84C' : 'currentColor'}
            strokeWidth="2"
            className={active <= i ? 'text-[var(--cs-text-3)]' : ''}
            style={{ transition: 'fill 0.1s, stroke 0.1s' }}>
            <polygon points={STAR_POLY} />
          </svg>
        </button>
      ))}
    </div>
  )
}

/* ── Review submission modal ── */
function ReviewModal({ onClose }: { onClose: () => void }) {
  const submit = useReviewStore(s => s.submit)

  const [name,   setName]   = useState('')
  const [role,   setRole]   = useState('')
  const [stars,  setStars]  = useState(0)
  const [text,   setText]   = useState('')
  const [done,   setDone]   = useState(false)
  const [tried,  setTried]  = useState(false)

  const canSubmit = name.trim() && stars > 0 && text.trim()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTried(true)
    if (!canSubmit) return
    submit({ name: name.trim(), role: role.trim(), stars, text: text.trim() })
    setDone(true)
  }

  const inputCls = `w-full bg-[var(--cs-input)] border border-[#C9A84C]/15 rounded-lg px-4 py-2.5
                    text-[var(--cs-text)] text-sm placeholder:text-[var(--cs-text-3)]
                    focus:outline-none focus:border-[#C9A84C]/40 transition-colors duration-200`

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
        className="w-full max-w-md bg-[var(--cs-s2)] border border-[#C9A84C]/15 rounded-2xl p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[#C9A84C] text-[10px] tracking-[0.18em] uppercase mb-0.5">FinanceBoard</p>
            <h3 className="text-[var(--cs-text)] font-bold text-lg">Bewertung einreichen</h3>
          </div>
          <button onClick={onClose}
            className="text-[var(--cs-text-3)] hover:text-[var(--cs-text)] transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {done ? (
          /* Success state */
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 size={36} className="text-[#C9A84C]" />
            <p className="text-[var(--cs-text)] font-medium">Danke für dein Feedback!</p>
            <p className="text-[var(--cs-text-2)] text-sm">Deine Bewertung wird geprüft und bald sichtbar.</p>
            <button onClick={onClose}
              className="mt-2 text-[#C9A84C] text-sm border border-[#C9A84C]/25 px-5 py-2 rounded-lg
                         hover:border-[#C9A84C]/45 transition-colors cursor-pointer">
              Schließen
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Stars */}
            <div className="flex flex-col gap-2">
              <label className="text-[var(--cs-text-2)] text-xs">Sterne *</label>
              <StarInput value={stars} onChange={setStars} />
              {tried && stars === 0 && (
                <p className="text-[#ef4444] text-[11px]">Bitte wähle eine Bewertung</p>
              )}
            </div>

            {/* Name + Kontext */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[var(--cs-text-2)] text-xs">Name *</label>
                <input
                  className={inputCls}
                  placeholder="Dein Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[var(--cs-text-2)] text-xs">Kontext</label>
                <input
                  className={inputCls}
                  placeholder="z.B. Trader, Student"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                />
              </div>
            </div>

            {/* Review text */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[var(--cs-text-2)] text-xs">Deine Bewertung *</label>
              <textarea
                className={`${inputCls} resize-none`}
                rows={4}
                placeholder="Was hältst du vom FinanceBoard? Was funktioniert gut, was könnte besser sein?"
                value={text}
                onChange={e => setText(e.target.value)}
                required
              />
            </div>

            {tried && !canSubmit && (
              <div className="flex items-center gap-2 text-[#ef4444] text-xs">
                <AlertCircle size={14} />
                <span>Bitte füll alle Pflichtfelder aus.</span>
              </div>
            )}

            <button
              type="submit"
              className="mt-1 flex items-center justify-center gap-2 bg-[#C9A84C] text-[#080808]
                         font-bold text-sm px-6 py-3 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
            >
              Einreichen
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}

/* ── Avatar ── */
function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  return parts.length === 1
    ? parts[0].slice(0, 2).toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="w-9 h-9 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20
                    flex items-center justify-center shrink-0">
      <span className="text-[#C9A84C] text-xs font-bold font-mono">{getInitials(name)}</span>
    </div>
  )
}

/* ── Section ── */
export default function TestimonialsSection() {
  const [modalOpen, setModalOpen] = useState(false)
  const reviews = useReviewStore(s => s.reviews)
  const approved = useMemo(() => reviews.filter(r => r.status === 'approved'), [reviews])

  return (
    <section className="py-20 px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase mb-3">Nutzerstimmen</p>
          <h2 className="text-3xl font-bold text-[var(--cs-text)]">Was andere sagen</h2>
        </div>

        {/* Review cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {approved.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: [0.4, 0, 0.2, 1] }}
              className="bg-[var(--cs-s2)] border border-[#C9A84C]/10 rounded-2xl p-6 flex flex-col gap-4
                         hover:border-[#C9A84C]/20 transition-colors duration-300"
            >
              <StarRating count={r.stars} />
              <p className="text-[var(--cs-text-2)] text-sm leading-relaxed flex-1">„{r.text}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-[#C9A84C]/8">
                <Avatar name={r.name} />
                <div>
                  <p className="text-[var(--cs-text)] text-sm font-medium">{r.name}</p>
                  <p className="text-[var(--cs-text-3)] text-xs">{r.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-[var(--cs-text-3)] text-sm mb-4">
            Du nutzt FinanceBoard? Ich freue mich über dein Feedback.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 border border-[#C9A84C]/20 text-[var(--cs-text-2)]
                       text-sm px-5 py-2.5 rounded-lg hover:border-[#C9A84C]/35 hover:text-[var(--cs-text)]
                       transition-all duration-200 cursor-pointer"
          >
            ✉ Bewertung einreichen
          </button>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && <ReviewModal onClose={() => setModalOpen(false)} />}
      </AnimatePresence>
    </section>
  )
}
