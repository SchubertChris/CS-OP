// src/pages/FinancePage.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import ComingSoonModal from '../components/ui/ComingSoonModal'
import imgDashboard from '../assets/images/Präsentation-WebsiteBild.webp'
import UspStrip from '../components/finance/UspStrip'
import ScreenshotSlider from '../components/finance/ScreenshotSlider'
import FeatureGrid from '../components/finance/FeatureGrid'
import DownloadCard from '../components/finance/DownloadCard'
import FaqAccordion from '../components/finance/FaqAccordion'
import TestimonialsSection from '../components/finance/TestimonialsSection'

function StaggerContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
    >
      {children}
    </motion.div>
  )
}

function StaggerItem({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden:  { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
      }}
    >
      {children}
    </motion.div>
  )
}

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  return (
    <span className="font-bold text-4xl text-[var(--cs-text)] tabular-nums">
      {value}{suffix}
    </span>
  )
}

const STATS = [
  { value: 10,   suffix: '',  label: 'Module'    },
  { value: 4,    suffix: '',  label: 'Themes'    },
  { value: 100,  suffix: '%', label: 'Offline'   },
  { value: 0,    suffix: '',  label: 'Abos'      },
]

const BENEFITS = [
  'Daten bleiben lokal auf deinem PC',
  '10 vollständige Module — kein Plugin-Chaos',
  'Einmalig — kein Abo, keine Cloud',
]


export default function FinancePage() {
  const [dlOpen, setDlOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[var(--cs-bg)] pt-20">

      {/* ① HERO — Split Layout */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px]
                          bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,168,76,0.08)_0%,transparent_70%)]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-8 py-20 md:py-28 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Text-Block */}
          <StaggerContainer className="flex flex-col gap-6">
            <StaggerItem>
              <span className="inline-flex items-center gap-2 bg-[#C9A84C]/8 border border-[#C9A84C]/20
                               rounded-full px-4 py-1.5 text-[#C9A84C] text-xs tracking-[0.1em] uppercase">
                v10.6 · Ab 8. Juni 2026
              </span>
            </StaggerItem>

            <StaggerItem>
              <h1 className="text-5xl md:text-6xl font-black leading-[1.05] text-[var(--cs-text)]">
                Finance<span className="text-[#C9A84C]">Board.</span>
                <br />Offline.
                <br />Unter Kontrolle.
              </h1>
            </StaggerItem>

            <StaggerItem>
              <p className="text-[var(--cs-text-2)] text-base leading-relaxed max-w-sm">
                Kein Cloud-Zwang. Keine Abo-Falle. Deine Finanzen bleiben auf deinem Gerät — für immer.
              </p>
            </StaggerItem>

            <StaggerItem>
              <ul className="flex flex-col gap-2.5">
                {BENEFITS.map(b => (
                  <li key={b} className="flex items-center gap-3">
                    <Check size={15} strokeWidth={2} className="text-[#C9A84C] shrink-0" />
                    <span className="text-[var(--cs-text-2)] text-sm">{b}</span>
                  </li>
                ))}
              </ul>
            </StaggerItem>

            <StaggerItem>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setDlOpen(true)}
                  className="bg-[#C9A84C] text-[#080808] font-bold px-6 py-3.5 rounded-lg
                             hover:opacity-90 transition-opacity duration-200 text-sm cursor-pointer"
                >
                  ↓ Gratis herunterladen
                </button>
                <button
                  onClick={() => document.getElementById('screenshots')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border border-[#C9A84C]/25 text-[var(--cs-text-2)] px-5 py-3.5 rounded-lg
                             hover:border-[#C9A84C]/40 hover:text-[var(--cs-text)] transition-all duration-200 text-sm"
                >
                  Demo ansehen →
                </button>
              </div>
            </StaggerItem>
          </StaggerContainer>

          {/* App-Screenshot */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="relative hidden lg:block"
          >
            <div className="absolute -inset-4 rounded-2xl bg-[#C9A84C]/3 blur-3xl pointer-events-none" />
            <div className="relative rounded-xl overflow-hidden border border-[#C9A84C]/15
                            shadow-[0_0_60px_rgba(201,168,76,0.08)]">
              <div className="bg-[var(--cs-s4)] px-4 py-2.5 flex items-center gap-2 border-b border-[#C9A84C]/8">
                <div className="w-3 h-3 rounded-full bg-[#ef4444]/70" />
                <div className="w-3 h-3 rounded-full bg-[#eab308]/70" />
                <div className="w-3 h-3 rounded-full bg-[#22c55e]/70" />
                <span className="text-[var(--cs-text-3)] text-[10px] ml-2 font-mono">Candlescope FinanceBoard v10.6</span>
              </div>
              <img
                src={imgDashboard}
                alt="FinanceBoard Dashboard"
                className="w-full object-cover"
                loading="eager"
              />
            </div>
          </motion.div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C]/10 to-transparent" />
      </section>

      {/* ② USP-STRIP */}
      <UspStrip />

      {/* ③ SCREENSHOTS */}
      <div id="screenshots">
        <ScreenshotSlider />
      </div>

      {/* ④ FEATURES */}
      <FeatureGrid />

      {/* ⑤ STATS */}
      <section className="border-t border-b border-[#C9A84C]/8 py-16">
        <div className="max-w-3xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(({ value, suffix, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <AnimatedCounter value={value} suffix={suffix} />
              <p className="text-[var(--cs-text-2)] text-xs tracking-[0.1em] uppercase">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ⑥ DOWNLOAD */}
      <DownloadCard onDownload={() => setDlOpen(true)} />

      {/* ⑦ FAQ */}
      <FaqAccordion />

      {/* ⑧ TESTIMONIALS */}
      <div className="border-t border-[#C9A84C]/8">
        <TestimonialsSection />
      </div>

      {/* ⑨ FOOTER-CTA */}
      <section className="py-24 text-center px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C]/10 to-transparent mb-20" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--cs-text)] mb-4">
            Deine Finanzen. Dein Gerät.
          </h2>
          <p className="text-[var(--cs-text-2)] mb-8 text-sm">
            Kostenlos starten — kein Konto, kein Abo, keine Cloud.
          </p>
          <button
            onClick={() => setDlOpen(true)}
            className="inline-flex items-center gap-2 bg-[#C9A84C] text-[#080808] font-bold
                       px-8 py-4 rounded-lg hover:opacity-90 transition-opacity duration-200 cursor-pointer"
          >
            ↓ Gratis herunterladen
          </button>
        </motion.div>
      </section>

      <AnimatePresence>
        {dlOpen && <ComingSoonModal onClose={() => setDlOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}
