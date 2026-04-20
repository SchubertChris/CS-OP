// src/components/finance/TestimonialsSection.tsx
import { motion } from 'framer-motion'
import { SOCIALS } from '../../data/socials'

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
    name: 'Markus R.',
    role: 'Freelancer, Berlin',
    text: 'Endlich eine App die einfach funktioniert — ohne Abo-Falle oder Cloud-Zwang. Meine Verträge und Ausgaben hab ich jetzt wirklich im Griff.',
    stars: 5,
    initials: 'MR',
  },
  {
    name: 'Sandra K.',
    role: 'Angestellte, München',
    text: 'Die Jahresübersicht mit den Candlestick-Charts hat mich überzeugt. Sieht aus wie ein professionelles Trading-Tool — für meine Privatfinanzen.',
    stars: 5,
    initials: 'SK',
  },
  {
    name: 'Thomas W.',
    role: 'Student, Hamburg',
    text: 'Gratis, offline, kein Datenschutz-Albtraum. Genau das hab ich gesucht. Läuft seit Monaten stabil auf meinem Windows-PC.',
    stars: 5,
    initials: 'TW',
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
            Du nutzt FinanceBoard? Wir freuen uns über dein Feedback.
          </p>
          <a
            href={SOCIALS.email + '?subject=FinanceBoard%20Bewertung'}
            className="inline-flex items-center gap-2 border border-[#C9A84C]/20 text-[#9A9590]
                       text-sm px-5 py-2.5 rounded-lg hover:border-[#C9A84C]/35 hover:text-[#F5F0E8]
                       transition-all duration-200"
          >
            ✉ Bewertung einreichen
          </a>
        </div>
      </div>
    </section>
  )
}
