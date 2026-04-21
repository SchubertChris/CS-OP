// src/components/finance/TestimonialsSection.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, CheckCircle2, AlertCircle } from 'lucide-react'

const FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_ID ?? ''

type ModalStatus = 'idle' | 'sending' | 'success' | 'error'

function ReviewModal({ onClose }: { onClose: () => void }) {
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [subject, setSubject] = useState('FinanceBoard Bewertung')
  const [message, setMessage] = useState('')
  const [status,  setStatus]  = useState<ModalStatus>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) return
    if (!FORMSPREE_ID) { alert('Formspree ID fehlt'); return }
    setStatus('sending')
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, email, message, _subject: `[FinanceBoard] ${subject} — ${name}` }),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  const inputCls = `w-full bg-[#0a0a0a] border border-[#C9A84C]/15 rounded-lg px-4 py-2.5
                    text-[#F5F0E8] text-sm placeholder:text-[#5a5550]
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
        className="w-full max-w-md bg-[#0e0e0e] border border-[#C9A84C]/15 rounded-2xl p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[#C9A84C] text-[10px] tracking-[0.18em] uppercase mb-0.5">FinanceBoard</p>
            <h3 className="text-[#F5F0E8] font-bold text-lg">Bewertung einreichen</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#5a5550] hover:text-[#F5F0E8] transition-colors duration-150 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {status === 'success' ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 size={36} className="text-[#C9A84C]" />
            <p className="text-[#F5F0E8] font-medium">Danke für dein Feedback!</p>
            <p className="text-[#9A9590] text-sm">Ich meld mich wenn's passt.</p>
            <button
              onClick={onClose}
              className="mt-2 text-[#C9A84C] text-sm border border-[#C9A84C]/25 px-5 py-2 rounded-lg
                         hover:border-[#C9A84C]/45 transition-colors duration-200 cursor-pointer"
            >
              Schließen
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[#9A9590] text-xs">Name</label>
                <input
                  className={inputCls}
                  placeholder="Dein Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[#9A9590] text-xs">E-Mail</label>
                <input
                  type="email"
                  className={inputCls}
                  placeholder="du@mail.de"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#9A9590] text-xs">Betreff</label>
              <input
                className={inputCls}
                value={subject}
                onChange={e => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#9A9590] text-xs">Deine Bewertung</label>
              <textarea
                className={`${inputCls} resize-none`}
                rows={4}
                placeholder="Was hältst du vom FinanceBoard? Was funktioniert gut, was könnte besser sein?"
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
              />
            </div>

            {status === 'error' && (
              <div className="flex items-center gap-2 text-[#ef4444] text-xs">
                <AlertCircle size={14} />
                <span>Fehler beim Senden — versuch es nochmal.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="mt-1 flex items-center justify-center gap-2 bg-[#C9A84C] text-[#080808]
                         font-bold text-sm px-6 py-3 rounded-lg hover:opacity-90 transition-opacity
                         duration-200 disabled:opacity-50 cursor-pointer"
            >
              {status === 'sending' ? (
                <span className="opacity-70">Wird gesendet…</span>
              ) : (
                <>
                  <Send size={14} />
                  Absenden
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}

const STARS = 5

interface Review {
  name: string
  role: string
  text: string
  stars: number
  initials: string
}

const REVIEWS: Review[] = [
  {
    name: 'Sento',
    role: 'Trader & Community',
    text: 'Die Jahresanalyse mit den Candlesticks — hab ich Chris direkt geschrieben. Sieht aus wie ein richtiges Trading-Terminal, nur für den eigenen Haushalt. Verwende es jeden Monat.',
    stars: 5,
    initials: 'S',
  },
  {
    name: 'DoctorHinky',
    role: 'Community Member',
    text: 'Hab\'s ehrlich nur installiert weil Chris es gebaut hat — aber dann hab ich gemerkt dass ich endlich weiß wo mein Geld bleibt. Kein Abo, läuft offline, null Drama. Läuft.',
    stars: 5,
    initials: 'DH',
  },
  {
    name: 'Sandra',
    role: 'Freundin & Testerin',
    text: 'Ich versteh nicht alles davon aber allein die Vertragsübersicht hat sich gelohnt — endlich alle Abos auf einen Blick. Und wenn man nicht weiterkommt hilft Chris einfach.',
    stars: 5,
    initials: 'S',
  },
]

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: STARS }).map((_, i) => (
        <svg
          key={i}
          width="13" height="13"
          viewBox="0 0 24 24"
          fill={i < count ? '#C9A84C' : 'none'}
          stroke={i < count ? '#C9A84C' : '#3a3530'}
          strokeWidth="2"
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </div>
  )
}

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="w-9 h-9 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20
                    flex items-center justify-center shrink-0">
      <span className="text-[#C9A84C] text-xs font-bold font-mono">{initials}</span>
    </div>
  )
}

export default function TestimonialsSection() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <section className="py-20 px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase mb-3">Nutzerstimmen</p>
          <h2 className="text-3xl font-bold text-[#F5F0E8]">Was andere sagen</h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {REVIEWS.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1, ease: [0.4, 0, 0.2, 1] }}
              className="bg-[#0e0e0e] border border-[#C9A84C]/10 rounded-2xl p-6 flex flex-col gap-4
                         hover:border-[#C9A84C]/20 transition-colors duration-300"
            >
              <StarRating count={r.stars} />
              <p className="text-[#9A9590] text-sm leading-relaxed flex-1">
                „{r.text}"
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-[#C9A84C]/8">
                <Avatar initials={r.initials} />
                <div>
                  <p className="text-[#F5F0E8] text-sm font-medium">{r.name}</p>
                  <p className="text-[#5a5550] text-xs">{r.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA — eigene Bewertung */}
        <div className="text-center">
          <p className="text-[#5a5550] text-sm mb-4">
            Du nutzt FinanceBoard? Ich freue mich über dein Feedback.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 border border-[#C9A84C]/20 text-[#9A9590]
                       text-sm px-5 py-2.5 rounded-lg hover:border-[#C9A84C]/35 hover:text-[#F5F0E8]
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
