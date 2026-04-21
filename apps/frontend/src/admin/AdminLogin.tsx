import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, Eye, EyeOff, Home } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Step = 'password' | 'totp'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [step, setStep]           = useState<Step>('password')
  const [password, setPassword]   = useState('')
  const [totp, setTotp]           = useState(['', '', '', '', '', ''])
  const [tempToken, setTempToken] = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [shake, setShake]         = useState(false)
  const totpRefs = useRef<(HTMLInputElement | null)[]>([])

  const triggerShake = (msg: string) => {
    setError(msg); setShake(true)
    setTimeout(() => setShake(false), 600)
  }

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return
    setLoading(true); setError('')
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await r.json()
      if (!r.ok) { triggerShake(data.error ?? 'Fehler'); return }
      setTempToken(data.tempToken)
      setPassword('')
      setStep('totp')
      setTimeout(() => totpRefs.current[0]?.focus(), 100)
    } finally {
      setLoading(false)
    }
  }

  const handleTotpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...totp]; next[i] = val; setTotp(next)
    if (val && i < 5) totpRefs.current[i + 1]?.focus()
    if (next.every(d => d !== '') && next.join('').length === 6) {
      handleTotpSubmit(next.join(''))
    }
  }

  const handleTotpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !totp[i] && i > 0) {
      totpRefs.current[i - 1]?.focus()
    }
  }

  const handleTotpSubmit = async (code: string) => {
    setLoading(true); setError('')
    try {
      const r = await fetch('/api/auth/totp-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code, tempToken }),
      })
      const data = await r.json()
      if (!r.ok) {
        setTotp(['', '', '', '', '', ''])
        triggerShake(data.error ?? 'Falscher Code')
        setTimeout(() => totpRefs.current[0]?.focus(), 100)
        return
      }
      navigate('/admin')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#C9A84C]/3 blur-[100px]" />
      </div>

      <motion.div className="relative w-full max-w-sm"
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>

        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-[#C9A84C]/10 border border-[#C9A84C]/25 flex items-center justify-center mb-5">
            <Shield size={24} strokeWidth={1.5} className="text-[#C9A84C]" />
          </div>
          <h1 className="font-display text-2xl text-[#F5F0E8] tracking-tight">Admin Access</h1>
          <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#9A9590] mt-1">
            {step === 'password' ? 'Passwort eingeben' : 'Authenticator Code'}
          </p>
        </div>

        <motion.div animate={shake ? { x: [-8, 8, -6, 6, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="bg-[#0a0a0a] border border-[#C9A84C]/15 rounded-2xl p-8">

          <AnimatePresence mode="wait">

            {step === 'password' && (
              <motion.form key="pw" onSubmit={handlePassword}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }}
                className="flex flex-col gap-4">

                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError('') }}
                    placeholder="Passwort"
                    autoFocus
                    className="w-full bg-[#111] border border-[#C9A84C]/15 rounded-xl px-4 py-3.5 pr-12 text-[#F5F0E8] text-sm outline-none focus:border-[#C9A84C]/40 transition-colors placeholder-[#5a5550]"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9A9590] hover:text-[#F5F0E8] transition-colors">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {error && <p className="text-[#FF4444] text-xs text-center">{error}</p>}

                <button type="submit" disabled={loading || !password.trim()}
                  className="w-full bg-[#C9A84C] text-[#080808] font-bold text-sm py-3.5 rounded-xl hover:bg-[#d4b55a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? '...' : 'Weiter →'}
                </button>
              </motion.form>
            )}

            {step === 'totp' && (
              <motion.div key="totp"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}
                className="flex flex-col items-center gap-6">

                <p className="text-[#9A9590] text-sm text-center leading-relaxed">
                  Microsoft Authenticator öffnen<br />
                  und den 6-stelligen Code eingeben
                </p>

                <div className="flex gap-2">
                  {totp.map((digit, i) => (
                    <input key={i}
                      ref={el => { totpRefs.current[i] = el }}
                      type="text" inputMode="numeric" maxLength={1} value={digit}
                      onChange={e => handleTotpChange(i, e.target.value)}
                      onKeyDown={e => handleTotpKeyDown(i, e)}
                      className="w-11 h-14 text-center text-xl font-mono bg-[#111] border border-[#C9A84C]/20 rounded-xl text-[#F5F0E8] outline-none focus:border-[#C9A84C]/60 transition-colors"
                    />
                  ))}
                </div>

                {error && <p className="text-[#FF4444] text-xs text-center">{error}</p>}

                {loading && (
                  <div className="w-6 h-6 rounded-full border-2 border-[#C9A84C]/20 border-t-[#C9A84C] animate-spin" />
                )}

                <button onClick={() => { setStep('password'); setTotp(['','','','','','']); setError('') }}
                  className="text-[#9A9590] text-xs hover:text-[#F5F0E8] transition-colors">
                  ← Zurück
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="flex justify-center mt-6">
          <Link to="/" className="flex items-center gap-2 text-[#9A9590] hover:text-[#F5F0E8] text-xs transition-colors">
            <Home size={13} /> Zur Website
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
