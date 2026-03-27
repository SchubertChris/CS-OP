/* ============================================================
   CandleScope — Admin Login (Zweistufig)
   src/admin/AdminLogin.tsx
   ============================================================ */

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, ArrowRight, Lock, Eye, EyeOff, Home } from 'lucide-react'
import { useAdminStore } from '../store/useAdminStore'
import { motion, AnimatePresence } from 'framer-motion'

type Step = 'pin' | 'password'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { verifyPin, verifyPassword } = useAdminStore()

  const [step, setStep] = useState<Step>('pin')
  const [pin, setPin] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)

  /* ── PIN eingeben ──────────────────────────────────── */
  const handlePinDigit = (digit: number) => {
    if (pin.length >= 4) return
    setPin(p => p + digit)
    setError('')
  }

  const handlePinDelete = () => setPin(p => p.slice(0, -1))
  const handlePinClear = () => setPin('')

  /* ── PIN absenden ──────────────────────────────────── */
  const handlePinSubmit = async () => {
    if (pin.length !== 4) return
    setLoading(true)
    setError('')
    const ok = await verifyPin(pin)
    setLoading(false)
    if (ok) {
      setPin('')
      setStep('password')
    } else {
      setError('Falsche PIN')
      setShake(true)
      setTimeout(() => { setShake(false); setPin('') }, 600)
    }
  }

  /* ── Passwort absenden ─────────────────────────────── */
  const handlePasswordSubmit = async () => {
    if (!password.trim()) return
    setLoading(true)
    setError('')
    const ok = await verifyPassword(password)
    setLoading(false)
    if (ok) {
      navigate('/admin')
    } else {
      setError('Falsches Passwort')
      setShake(true)
      setTimeout(() => { setShake(false); setPassword('') }, 600)
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-6">

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#C9A84C]/3 blur-[120px]" />
      </div>

      <motion.div className="relative w-full max-w-sm"
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#0d0d0d] border border-[#C9A84C]/20 flex items-center justify-center">
            <Shield size={22} strokeWidth={1.5} className="text-[#C9A84C]" />
          </div>
        </div>

        <h1 className="font-display text-2xl text-[#F5F0E8] text-center tracking-[0.06em] mb-1">Admin Panel</h1>
        <p className="text-[#3a3530] text-sm text-center mb-2 tracking-[0.04em]">CandleScope · Chris Schubert</p>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className={`flex items-center gap-1.5 ${step === 'pin' ? 'text-[#C9A84C]' : 'text-[#00C896]'}`}>
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-mono ${step === 'pin' ? 'border-[#C9A84C] bg-[#C9A84C]/10' : 'border-[#00C896] bg-[#00C896]/10'}`}>
              {step === 'password' ? '✓' : '1'}
            </div>
            <span className="text-[11px] tracking-[0.1em] uppercase">PIN</span>
          </div>
          <div className="w-8 h-px bg-[#C9A84C]/20" />
          <div className={`flex items-center gap-1.5 ${step === 'password' ? 'text-[#C9A84C]' : 'text-[#3a3530]'}`}>
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-mono ${step === 'password' ? 'border-[#C9A84C] bg-[#C9A84C]/10' : 'border-[#3a3530]'}`}>
              2
            </div>
            <span className="text-[11px] tracking-[0.1em] uppercase">Passwort</span>
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* ── Schritt 1: PIN ──────────────────────────── */}
          {step === 'pin' && (
            <motion.div key="pin"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}>

              {/* PIN Dots */}
              <motion.div className="flex gap-3 justify-center mb-6"
                animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
                transition={{ duration: 0.4 }}>
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className={`w-12 h-14 rounded-xl border flex items-center justify-center transition-all duration-200 ${pin.length > i ? 'border-[#C9A84C]/50 bg-[#C9A84C]/10' :
                      pin.length === i ? 'border-[#C9A84C]/30 bg-[#0d0d0d]' :
                        'border-[#ffffff]/6 bg-[#0d0d0d]'
                    }`}>
                    {pin.length > i && <div className="w-2.5 h-2.5 rounded-full bg-[#C9A84C]" />}
                  </div>
                ))}
              </motion.div>

              {error && (
                <p className="text-[#FF4444] text-[11px] text-center tracking-[0.06em] mb-4">{error}</p>
              )}

              {/* Numpad */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                  <button key={n} onClick={() => handlePinDigit(n)}
                    className="h-14 rounded-xl bg-[#0d0d0d] border border-[#ffffff]/6 text-[#F5F0E8] text-lg font-display hover:bg-[#1a1a1a] hover:border-[#C9A84C]/20 active:scale-95 transition-all duration-150">
                    {n}
                  </button>
                ))}
                <button onClick={handlePinClear}
                  className="h-14 rounded-xl bg-[#0d0d0d] border border-[#ffffff]/6 text-[#5a5550] text-sm hover:text-[#F5F0E8] hover:bg-[#1a1a1a] active:scale-95 transition-all duration-150">
                  C
                </button>
                <button onClick={() => handlePinDigit(0)}
                  className="h-14 rounded-xl bg-[#0d0d0d] border border-[#ffffff]/6 text-[#F5F0E8] text-lg font-display hover:bg-[#1a1a1a] hover:border-[#C9A84C]/20 active:scale-95 transition-all duration-150">
                  0
                </button>
                <button onClick={handlePinDelete}
                  className="h-14 rounded-xl bg-[#0d0d0d] border border-[#ffffff]/6 text-[#5a5550] text-sm hover:text-[#F5F0E8] hover:bg-[#1a1a1a] active:scale-95 transition-all duration-150">
                  ⌫
                </button>
              </div>

              <button onClick={handlePinSubmit} disabled={pin.length !== 4 || loading}
                className="w-full relative overflow-hidden group h-12 rounded-full border border-[#C9A84C]/30 text-[#C9A84C] text-[11px] tracking-[0.16em] uppercase flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <span className="relative z-10 group-hover:text-[#080808] transition-colors duration-300 flex items-center gap-2">
                  {loading ? 'Prüfe...' : 'PIN bestätigen'}
                  <ArrowRight size={14} strokeWidth={1.5} />
                </span>
                <span className="absolute inset-0 bg-[#C9A84C] rounded-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              </button>
            </motion.div>
          )}

          {/* ── Schritt 2: Passwort ─────────────────────── */}
          {step === 'password' && (
            <motion.div key="password"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}>

              <div className="flex items-center justify-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/25 flex items-center justify-center">
                  <Lock size={18} strokeWidth={1.5} className="text-[#C9A84C]" />
                </div>
              </div>

              <p className="text-[#9A9590] text-sm text-center mb-6 leading-relaxed">
                PIN korrekt. Jetzt Passwort eingeben.
              </p>

              <motion.div className="mb-4"
                animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
                transition={{ duration: 0.4 }}>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError('') }}
                    onKeyDown={e => e.key === 'Enter' && handlePasswordSubmit()}
                    placeholder="Passwort eingeben..."
                    autoFocus
                    className={`w-full bg-[#0d0d0d] border rounded-xl px-4 py-3.5 pr-12 text-[14px] text-[#F5F0E8] placeholder:text-[#3a3530] focus:outline-none transition-colors ${error ? 'border-[#FF4444]/50' : 'border-[#ffffff]/8 focus:border-[#C9A84C]/40'
                      }`}
                  />
                  <button onClick={() => setShowPassword(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5a5550] hover:text-[#9A9590] transition-colors">
                    {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                  </button>
                </div>
                {error && <p className="text-[#FF4444] text-[11px] mt-2 tracking-[0.06em]">{error}</p>}
              </motion.div>

              <button onClick={handlePasswordSubmit} disabled={!password.trim() || loading}
                className="w-full relative overflow-hidden group h-12 rounded-full border border-[#C9A84C]/30 text-[#C9A84C] text-[11px] tracking-[0.16em] uppercase flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition-all mb-4">
                <span className="relative z-10 group-hover:text-[#080808] transition-colors duration-300 flex items-center gap-2">
                  {loading ? 'Prüfe...' : 'Einloggen'}
                  <ArrowRight size={14} strokeWidth={1.5} />
                </span>
                <span className="absolute inset-0 bg-[#C9A84C] rounded-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              </button>

              <button onClick={() => { setStep('pin'); setPassword(''); setError('') }}
                className="w-full text-[11px] tracking-[0.1em] uppercase text-[#5a5550] hover:text-[#9A9590] transition-colors">
                ← Zurück zur PIN
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Bottom Links ────────────────────────────────── */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#ffffff]/5">
          <p className="text-[10px] text-[#2a2a2a] tracking-[0.08em]">
            CandleScope Admin · Geschützt
          </p>
          <Link to="/"
            className="flex items-center gap-1.5 text-[11px] tracking-[0.1em] uppercase text-[#3a3530] hover:text-[#C9A84C] transition-colors duration-200 group">
            <Home size={12} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
            Home
          </Link>
        </div>

      </motion.div>
    </div>
  )
}