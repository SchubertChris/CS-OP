// src/pages/FinancePage.tsx
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
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
    <span className="font-bold text-4xl text-[#F5F0E8] tabular-nums">
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
  return (
    <div className="min-h-screen bg-[#080808] pt-20">

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
                v10.6 · Jetzt verfügbar
              </span>
            </StaggerItem>

            <StaggerItem>
              <h1 className="text-5xl md:text-6xl font-black leading-[1.05] text-[#F5F0E8]">
                Finance<span className="text-[#C9A84C]">Board.</span>
                <br />Offline.
                <br />Unter Kontrolle.
              </h1>
            </StaggerItem>

            <StaggerItem>
              <p className="text-[#9A9590] text-base leading-relaxed max-w-sm">
                Kein Cloud-Zwang. Keine Abo-Falle. Deine Finanzen bleiben auf deinem Gerät — für immer.
              </p>
            </StaggerItem>

            <StaggerItem>
              <ul className="flex flex-col gap-2.5">
                {BENEFITS.map(b => (
                  <li key={b} className="flex items-center gap-3">
                    <Check size={15} strokeWidth={2} className="text-[#C9A84C] shrink-0" />
                    <span className="text-[#9A9590] text-sm">{b}</span>
                  </li>
                ))}
              </ul>
            </StaggerItem>

            <StaggerItem>
              <div className="flex items-center gap-3 flex-wrap">
                <a
                  href="/downloads/FinanceBoard-Setup.exe"
                  download
                  className="bg-[#C9A84C] text-[#080808] font-bold px-6 py-3.5 rounded-lg
                             hover:opacity-90 transition-opacity duration-200 text-sm"
                >
                  ↓ Gratis herunterladen
                </a>
                <button
                  onClick={() => document.getElementById('screenshots')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border border-[#C9A84C]/25 text-[#9A9590] px-5 py-3.5 rounded-lg
                             hover:border-[#C9A84C]/40 hover:text-[#F5F0E8] transition-all duration-200 text-sm"
                >
                  Demo ansehen →
                </button>
              </div>
            </StaggerItem>
          </StaggerContainer>

          {/* App-Fenster-Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="relative hidden lg:block"
          >
            <div className="absolute -inset-4 rounded-2xl bg-[#C9A84C]/3 blur-3xl pointer-events-none" />
            <div className="relative rounded-xl overflow-hidden border border-[#C9A84C]/15
                            shadow-[0_0_60px_rgba(201,168,76,0.08)]">
              <div className="bg-[#161616] px-4 py-2.5 flex items-center gap-2 border-b border-[#C9A84C]/8">
                <div className="w-3 h-3 rounded-full bg-[#ef4444]/70" />
                <div className="w-3 h-3 rounded-full bg-[#eab308]/70" />
                <div className="w-3 h-3 rounded-full bg-[#22c55e]/70" />
                <span className="text-[#5a5550] text-[10px] ml-2 font-mono">Candlescope FinanceBoard v10.6</span>
              </div>
              <div className="bg-[#0e0e0e] h-[340px] flex">
                <div className="w-14 bg-[#090909] border-r border-[#C9A84C]/6 flex flex-col items-center gap-3 pt-4">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className={`w-6 h-1 rounded-full ${i === 1 ? 'bg-[#C9A84C]' : 'bg-[#C9A84C]/15'}`} />
                  ))}
                </div>
                <div className="flex-1 p-5 flex flex-col gap-4">
                  <div className="grid grid-cols-3 gap-3">
                    {['+ 2.840 €', '− 1.240 €', '+ 1.600 €'].map((v, i) => (
                      <div key={i} className="bg-[#141414] border border-[#C9A84C]/8 rounded-lg p-3">
                        <div className={`text-xs font-bold ${i === 2 ? 'text-[#22c55e]' : i === 0 ? 'text-[#C9A84C]' : 'text-[#9A9590]'}`}>
                          {v}
                        </div>
                        <div className="text-[#5a5550] text-[9px] mt-1">
                          {['Einnahmen', 'Ausgaben', 'Netto'][i]}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 bg-[#141414] border border-[#C9A84C]/8 rounded-lg p-4 flex items-end gap-2">
                    {[35, 60, 42, 78, 55, 88, 40, 70, 62, 95, 50, 75].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm"
                        style={{
                          height: `${h}%`,
                          background: i % 3 === 1 ? '#C9A84C' : `rgba(201,168,76,${0.2 + (i % 3) * 0.15})`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
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
              <p className="text-[#9A9590] text-xs tracking-[0.1em] uppercase">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ⑥ DOWNLOAD */}
      <DownloadCard />

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
          <h2 className="text-3xl md:text-4xl font-bold text-[#F5F0E8] mb-4">
            Deine Finanzen. Dein Gerät.
          </h2>
          <p className="text-[#9A9590] mb-8 text-sm">
            Kostenlos starten — kein Konto, kein Abo, keine Cloud.
          </p>
          <a
            href="/downloads/FinanceBoard-Setup.exe"
            download
            className="inline-flex items-center gap-2 bg-[#C9A84C] text-[#080808] font-bold
                       px-8 py-4 rounded-lg hover:opacity-90 transition-opacity duration-200"
          >
            ↓ Gratis herunterladen
          </a>
        </motion.div>
      </section>
    </div>
  )
}
