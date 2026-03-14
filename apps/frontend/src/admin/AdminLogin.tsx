/* ============================================================
   CandleScope — Admin Login
   src/admin/AdminLogin.tsx

   Phase 1: Durchklickbar — Enter drücken oder Button klicken
   Phase 2: useAdminStore.login(pin) aktivieren
   ============================================================ */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, ArrowRight } from 'lucide-react'
import { useAdminStore } from '../store/useAdminStore'
import { motion } from 'framer-motion'

export default function AdminLogin() {
  const navigate  = useNavigate()
  const { login, setupPin, hasPin } = useAdminStore()
  const [pin, setPin]     = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    setLoading(true)

    /* ── Phase 1: Bypass — einfach einloggen ── */
    // TODO Phase 2: echten PIN-Check aktivieren
    // if (pin.length === 4) {
    //   const ok = hasPin ? await login(pin) : (await setupPin(pin), true)
    //   if (!ok) { setError('Falscher PIN'); setLoading(false); return }
    // }

    /* Direkt weiter */
    setTimeout(() => navigate('/admin'), 300)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-6">

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#C9A84C]/3 blur-[120px]" />
      </div>

      <motion.div
        className="relative w-full max-w-sm"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#0d0d0d] border border-[#C9A84C]/20 flex items-center justify-center">
            <Shield size={22} strokeWidth={1.5} className="text-[#C9A84C]" />
          </div>
        </div>

        {/* Title */}
        <h1 className="font-display text-2xl text-[#F5F0E8] text-center tracking-[0.06em] mb-2">
          Admin Panel
        </h1>
        <p className="text-[#3a3530] text-sm text-center mb-10 tracking-[0.04em]">
          CandleScope · Chris Schubert
        </p>

        {/* PIN Input */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3 justify-center">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className={`w-12 h-14 rounded-xl border flex items-center justify-center transition-all duration-200 ${
                  pin.length > i
                    ? 'border-[#C9A84C]/50 bg-[#C9A84C]/10'
                    : pin.length === i
                    ? 'border-[#C9A84C]/30 bg-[#0d0d0d]'
                    : 'border-[#ffffff]/6 bg-[#0d0d0d]'
                }`}
              >
                {pin.length > i && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#C9A84C]" />
                )}
              </div>
            ))}
          </div>

          {/* Hidden real input */}
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={e => {
              const val = e.target.value.replace(/\D/g, '')
              setPin(val)
              setError('')
            }}
            onKeyDown={handleKeyDown}
            autoFocus
            className="absolute opacity-0 w-0 h-0"
          />

          {/* Error */}
          {error && (
            <p className="text-[#FF4444] text-[11px] text-center tracking-[0.06em]">
              {error}
            </p>
          )}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2 mt-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <button
              key={n}
              onClick={() => {
                if (pin.length < 4) setPin(p => p + n)
              }}
              className="h-14 rounded-xl bg-[#0d0d0d] border border-[#ffffff]/6 text-[#F5F0E8] text-lg font-display tracking-wide hover:bg-[#1a1a1a] hover:border-[#C9A84C]/20 active:scale-95 transition-all duration-150"
            >
              {n}
            </button>
          ))}

          {/* Clear */}
          <button
            onClick={() => setPin('')}
            className="h-14 rounded-xl bg-[#0d0d0d] border border-[#ffffff]/6 text-[#5a5550] text-sm hover:text-[#F5F0E8] hover:bg-[#1a1a1a] active:scale-95 transition-all duration-150"
          >
            C
          </button>

          {/* 0 */}
          <button
            onClick={() => {
              if (pin.length < 4) setPin(p => p + '0')
            }}
            className="h-14 rounded-xl bg-[#0d0d0d] border border-[#ffffff]/6 text-[#F5F0E8] text-lg font-display hover:bg-[#1a1a1a] hover:border-[#C9A84C]/20 active:scale-95 transition-all duration-150"
          >
            0
          </button>

          {/* Backspace */}
          <button
            onClick={() => setPin(p => p.slice(0, -1))}
            className="h-14 rounded-xl bg-[#0d0d0d] border border-[#ffffff]/6 text-[#5a5550] text-sm hover:text-[#F5F0E8] hover:bg-[#1a1a1a] active:scale-95 transition-all duration-150"
          >
            ⌫
          </button>
        </div>

        {/* Enter Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-6 h-13 relative overflow-hidden group rounded-full border border-[#C9A84C]/30 text-[#C9A84C] text-[11px] tracking-[0.16em] uppercase flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50"
        >
          <span className="relative z-10 group-hover:text-[#080808] transition-colors duration-300">
            {loading ? 'Wird geladen...' : hasPin ? 'Einloggen' : 'Zugang öffnen'}
          </span>
          <ArrowRight size={14} strokeWidth={1.5} className="relative z-10 group-hover:text-[#080808] transition-colors duration-300" />
          <span className="absolute inset-0 bg-[#C9A84C] rounded-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        </button>

        <p className="text-[10px] text-[#2a2a2a] text-center mt-6 tracking-[0.08em]">
          Phase 1 · Bypass aktiv
        </p>
      </motion.div>
    </div>
  )
}