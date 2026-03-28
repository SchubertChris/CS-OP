/* ============================================================
   CandleScope — Cookie Banner
   src/components/ui/CookieBanner.tsx

   DSGVO-konform — nur technisch notwendige Cookies.
   Speichert Entscheidung in localStorage.
   ============================================================ */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, Shield, ChevronDown, ChevronUp } from 'lucide-react'


const STORAGE_KEY = 'candlescope-cookie-consent'

type Consent = 'accepted' | 'declined' | null

export default function CookieBanner() {
  const [consent, setConsent]     = useState<Consent>(null)
  const [expanded, setExpanded]   = useState(false)
  const [visible, setVisible]     = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Consent
    if (!stored) {
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    } else {
      setConsent(stored)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    setConsent('accepted')
    setVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem(STORAGE_KEY, 'declined')
    setConsent('declined')
    setVisible(false)
  }

  if (consent !== null) return null

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[90] bg-[#080808]/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />

          {/* Banner */}
          <motion.div
            className="fixed inset-0 z-[91] flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="relative w-full max-w-lg"
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Glow */}
              <div className="absolute -inset-6 rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.08)_0%,transparent_70%)] pointer-events-none" />

              <div className="relative rounded-2xl border border-[#C9A84C]/25 bg-[#0d0d0d] overflow-hidden shadow-2xl shadow-black/60">

                {/* Gold top bar */}
                <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C]/60 to-transparent" />

                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center">
                        <Cookie size={18} strokeWidth={1.5} className="text-[#C9A84C]" />
                      </div>
                      <div>
                        <h2 className="font-display text-lg text-[#F5F0E8] tracking-wide">Cookie-Einstellungen</h2>
                        <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#C9A84C]/50 mt-0.5">CandleScope · DSGVO</p>
                      </div>
                    </div>
                  </div>

                  {/* Text */}
                  <p className="text-[#9A9590] text-sm leading-relaxed mb-5">
                    Diese Website verwendet ausschließlich <span className="text-[#F5F0E8]">technisch notwendige Cookies</span> — 
                    keine Tracking-, Werbe- oder Analyse-Cookies. 
                    Deine Daten verlassen nicht deinen Browser.
                  </p>

                  {/* Details Toggle */}
                  <button
                    onClick={() => setExpanded(v => !v)}
                    className="flex items-center gap-2 text-[11px] tracking-[0.1em] uppercase text-[#5a5550] hover:text-[#9A9590] transition-colors mb-4 cursor-pointer"
                  >
                    {expanded ? <ChevronUp size={13} strokeWidth={1.5} /> : <ChevronDown size={13} strokeWidth={1.5} />}
                    Details anzeigen
                  </button>

                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="mb-5 p-4 rounded-xl border border-[#ffffff]/6 bg-[#080808] flex flex-col gap-3">
                          <div className="flex items-start gap-3">
                            <Shield size={14} strokeWidth={1.5} className="text-[#00C896] mt-0.5 shrink-0" />
                            <div>
                              <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-[#F5F0E8] mb-1">Technisch notwendig</p>
                              <p className="text-[#9A9590] text-[12px] leading-relaxed">
                                Session-Cookies für das Admin-Panel, Cookie-Consent Speicherung im localStorage. 
                                Keine externen Dienste, kein Tracking, keine Weitergabe an Dritte.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-3.5 h-3.5 rounded-full border border-[#5a5550] mt-0.5 shrink-0 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#5a5550]" />
                            </div>
                            <div>
                              <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-[#5a5550] mb-1">Analytics / Tracking</p>
                              <p className="text-[#5a5550] text-[12px]">Nicht vorhanden — wird nicht verwendet.</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleAccept}
                      className="relative overflow-hidden group flex-1 h-12 rounded-full border border-[#C9A84C]/40 text-[11px] tracking-[0.16em] uppercase text-[#C9A84C] font-medium cursor-pointer"
                    >
                      <span className="relative z-10 group-hover:text-[#080808] transition-colors duration-300">
                        Alle akzeptieren
                      </span>
                      <span className="absolute inset-0 bg-[#C9A84C] rounded-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    </button>
                    <button
                      onClick={handleDecline}
                      className="flex-1 h-12 rounded-full border border-[#ffffff]/8 text-[11px] tracking-[0.16em] uppercase text-[#9A9590] hover:text-[#F5F0E8] hover:border-[#ffffff]/15 transition-all duration-200 cursor-pointer"
                    >
                      Nur notwendige
                    </button>
                  </div>

                  {/* Legal Info — kein Link, verhindert Umgehung des Banners */}
                  <p className="font-mono text-[10px] tracking-[0.08em] text-center mt-4" style={{color: "#3a3530"}}>
                    Weitere Infos in Datenschutz &amp; Impressum — nach Bestätigung zugänglich.
                  </p>
                </div>

                {/* Gold bottom bar */}
                <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C]/30 to-transparent" />
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}