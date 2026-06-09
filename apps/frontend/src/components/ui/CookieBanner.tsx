/* ============================================================
   CandleScope — Cookie Banner
   src/components/ui/CookieBanner.tsx
   ============================================================ */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart2, Shield, ChevronDown, ChevronUp } from 'lucide-react'
import { CONSENT_EVENT } from '../../hooks/useAnalytics'

const STORAGE_KEY = 'candlescope-cookie-consent'
type Consent = 'accepted' | 'rejected' | null

export default function CookieBanner() {
  const [consent, setConsent]   = useState<Consent>(null)
  const [expanded, setExpanded] = useState(false)
  const [visible, setVisible]   = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Consent
    if (stored === 'accepted' || stored === 'rejected') {
      setConsent(stored)
      return
    }
    const t = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(t)
  }, [])

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT))
    setConsent('accepted')
    setVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem(STORAGE_KEY, 'rejected')
    setConsent('rejected')
    setVisible(false)
  }

  if (consent !== null) return null

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            className="fixed inset-0 z-[90] bg-[var(--cs-backdrop)] backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
          <motion.div
            className="fixed inset-0 z-[91] flex items-center justify-center px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="relative w-full max-w-lg"
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="absolute -inset-6 rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.08)_0%,transparent_70%)] pointer-events-none" />
              <div className="relative rounded-2xl border border-[#C9A84C]/25 bg-[var(--cs-s1)] overflow-hidden shadow-2xl shadow-black/60">
                <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C]/60 to-transparent" />
                <div className="p-8">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center">
                        <BarChart2 size={18} strokeWidth={1.5} className="text-[#C9A84C]" />
                      </div>
                      <div>
                        <h2 className="font-display text-lg text-[var(--cs-text)] tracking-wide">Datenschutz-Einstellungen</h2>
                        <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--cs-text-2)] mt-0.5">CandleScope · DSGVO</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-[var(--cs-text-2)] text-sm leading-relaxed mb-5">
                    Wir nutzen ein minimales, <span className="text-[var(--cs-text)]">selbstgehostetes Analyse-Tool</span>,
                    um Candlescope performanter und intuitiver zu gestalten. Die Daten werden anonymisiert
                    verarbeitet, verbleiben ausschließlich auf unseren Servern und werden{' '}
                    <span className="text-[var(--cs-text)]">niemals an Dritte weitergegeben</span>.
                  </p>

                  <button
                    onClick={() => setExpanded(v => !v)}
                    className="flex items-center gap-2 text-[11px] tracking-[0.1em] uppercase text-[var(--cs-text-3)] hover:text-[var(--cs-text-2)] transition-colors mb-4 cursor-pointer bg-transparent border-none outline-none"
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
                        <div className="mb-5 p-4 rounded-xl border border-[var(--cs-border-w)] bg-[var(--cs-bg)] flex flex-col gap-3">
                          {/* Technisch notwendig */}
                          <div className="flex items-start gap-3">
                            <Shield size={14} strokeWidth={1.5} className="text-[#00C896] mt-0.5 shrink-0" />
                            <div>
                              <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--cs-text)] mb-1">
                                Technisch notwendig
                                <span className="ml-2 text-[#00C896] normal-case tracking-normal font-sans text-[10px]">Immer aktiv</span>
                              </p>
                              <p className="text-[var(--cs-text-2)] text-[12px] leading-relaxed">
                                Session-Cookie für das Admin-Panel, Consent-Einstellung im localStorage.
                                Keine externen Dienste, keine Weitergabe an Dritte.
                              </p>
                            </div>
                          </div>
                          {/* Analytics */}
                          <div className="flex items-start gap-3">
                            <BarChart2 size={14} strokeWidth={1.5} className="text-[#C9A84C]/60 mt-0.5 shrink-0" />
                            <div>
                              <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--cs-text-2)] mb-1">Analyse (optional)</p>
                              <p className="text-[var(--cs-text-3)] text-[12px] leading-relaxed">
                                Selbstgehostetes Analyse-System: besuchte Seiten, anonyme Sitzungs-ID
                                (nur im Arbeitsspeicher), Gerätekategorie und Herkunftsland.
                                Keine IP-Speicherung · Keine externen Dienste · Löschung nach 90 Tagen.
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-row gap-3">
                    <div
                      onClick={handleAccept}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && handleAccept()}
                      style={{ WebkitTapHighlightColor: 'transparent', minHeight: '52px' }}
                      className="flex-1 rounded-full border border-[#C9A84C]/40 flex items-center justify-center text-[11px] tracking-[0.16em] uppercase text-[#C9A84C] font-medium cursor-pointer select-none active:opacity-70 transition-opacity duration-150 px-4"
                    >
                      Alle akzeptieren
                    </div>
                    <div
                      onClick={handleDecline}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && handleDecline()}
                      style={{ WebkitTapHighlightColor: 'transparent', minHeight: '52px' }}
                      className="flex-1 rounded-full border border-[var(--cs-border-w2)] flex items-center justify-center text-[11px] tracking-[0.16em] uppercase text-[var(--cs-text-2)] cursor-pointer select-none active:opacity-70 transition-opacity duration-150 px-4"
                    >
                      Nur notwendige
                    </div>
                  </div>

                  <p className="font-mono text-[10px] tracking-[0.08em] text-center mt-4 text-[var(--cs-text-4)]">
                    Weitere Details in der{' '}
                    <a href="/datenschutz" className="hover:text-[#C9A84C] transition-colors underline underline-offset-2">
                      Datenschutzerklärung
                    </a>
                  </p>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C]/30 to-transparent" />
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
