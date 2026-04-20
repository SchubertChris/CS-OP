// src/components/finance/ScreenshotSlider.tsx
import { useState } from 'react'
import { motion } from 'framer-motion'

import imgDashboard     from '../../assets/images/ÜbersichtUndTutorial.webp'
import imgJahr          from '../../assets/images/Jahresübersicht.webp'
import imgTransaktionen from '../../assets/images/Transaktionen.webp'
import imgSparziele     from '../../assets/images/Sparziele.webp'
import imgArchiv        from '../../assets/images/Archiv.webp'
import imgVision        from '../../assets/images/VisionBoard.webp'
import imgModals        from '../../assets/images/Modals.webp'

const SCREENSHOTS = [
  { label: 'Dashboard',      src: imgDashboard     },
  { label: 'Jahresanalyse',  src: imgJahr          },
  { label: 'Transaktionen',  src: imgTransaktionen },
  { label: 'Sparziele',      src: imgSparziele     },
  { label: 'Archiv',         src: imgArchiv        },
  { label: 'Vision Board',   src: imgVision        },
  { label: 'Modals',         src: imgModals        },
]

export default function ScreenshotSlider() {
  const [active, setActive] = useState(0)

  return (
    <section className="py-20">
      <div className="text-center mb-10 px-8">
        <p className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase mb-3">App in Aktion</p>
        <h2 className="text-3xl font-bold text-[#F5F0E8]">Sieh selbst</h2>
      </div>

      {/* Tab-Leiste */}
      <div className="flex items-center justify-center gap-2 px-8 mb-8 flex-wrap">
        {SCREENSHOTS.map(({ label }, i) => (
          <button
            key={label}
            onClick={() => setActive(i)}
            className={`px-4 py-1.5 rounded-full text-xs tracking-[0.1em] uppercase transition-all duration-200 cursor-pointer
              ${active === i
                ? 'bg-[#C9A84C]/15 border border-[#C9A84C]/30 text-[#C9A84C]'
                : 'border border-transparent text-[#9A9590] hover:text-[#F5F0E8]'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Bild */}
      <div className="px-8 max-w-5xl mx-auto">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="rounded-2xl overflow-hidden border border-[#C9A84C]/12
                     shadow-[0_0_80px_rgba(201,168,76,0.06)]"
        >
          {/* Fake Titlebar */}
          <div className="bg-[#161616] px-4 py-2.5 flex items-center gap-2 border-b border-[#C9A84C]/8">
            <div className="w-3 h-3 rounded-full bg-[#ef4444]/70" />
            <div className="w-3 h-3 rounded-full bg-[#eab308]/70" />
            <div className="w-3 h-3 rounded-full bg-[#22c55e]/70" />
            <span className="text-[#5a5550] text-[10px] ml-2 font-mono">
              Candlescope FinanceBoard v10.6 — {SCREENSHOTS[active].label}
            </span>
          </div>
          <img
            src={SCREENSHOTS[active].src}
            alt={`FinanceBoard ${SCREENSHOTS[active].label}`}
            className="w-full object-cover"
            loading="lazy"
          />
        </motion.div>
      </div>
    </section>
  )
}
