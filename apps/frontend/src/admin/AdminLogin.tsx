import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, Eye, EyeOff, Home, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ADMIN } from './config'

type Step = 'password' | 'totp'

// ── Lockout-Tracking (localStorage) ────────────────────────────────────────
const RL_KEY    = '_cs_rl'
const MAX_TRIES = 3
const LOCK_MS   = 15 * 60 * 1000

function loadRL(): { attempts: number; until: number } {
  try { return JSON.parse(localStorage.getItem(RL_KEY) ?? '{"attempts":0,"until":0}') }
  catch { return { attempts: 0, until: 0 } }
}

function recordFailure(): boolean {
  const s     = loadRL()
  const tries = s.attempts + 1
  const until = tries >= MAX_TRIES ? Date.now() + LOCK_MS : s.until
  localStorage.setItem(RL_KEY, JSON.stringify({ attempts: tries, until }))
  return tries >= MAX_TRIES
}

function clearRL() { localStorage.removeItem(RL_KEY) }

// ── Komponente ──────────────────────────────────────────────────────────────
export default function AdminLogin() {
  const navigate = useNavigate()

  // Lockout-State aus localStorage initialisieren
  const [locked, setLocked]       = useState(() => Date.now() < loadRL().until)
  const [remaining, setRemaining] = useState(() => {
    const s = loadRL(); return Math.max(0, Math.ceil((s.until - Date.now()) / 1000))
  })

  const [step, setStep]           = useState<Step>('password')
  const [password, setPassword]   = useState('')
  const [totp, setTotp]           = useState(['', '', '', '', '', ''])
  const [tempToken, setTempToken] = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [shake, setShake]         = useState(false)
  const totpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown während Lockout
  useEffect(() => {
    if (!locked) return
    const id = setInterval(() => {
      const rem = Math.max(0, Math.ceil((loadRL().until - Date.now()) / 1000))
      if (rem <= 0) { clearRL(); setLocked(false); setRemaining(0) }
      else setRemaining(rem)
    }, 1000)
    return () => clearInterval(id)
  }, [locked])

  const triggerShake = (msg: string) => {
    setError(msg); setShake(true)
    setTimeout(() => setShake(false), 600)
  }

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim() || locked) return
    setLoading(true); setError('')
    try {
      const r    = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await r.json()
      if (!r.ok) {
        const nowLocked = recordFailure()
        if (nowLocked) {
          setLocked(true)
          setRemaining(Math.ceil(LOCK_MS / 1000))
        } else {
          const { attempts } = loadRL()
          triggerShake(`${data.error ?? 'Ungültiges Passwort'} (${MAX_TRIES - attempts} Versuch${MAX_TRIES - attempts === 1 ? '' : 'e'} übrig)`)
        }
        return
      }
      clearRL()
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
    if (next.every(d => d !== '') && next.join('').length === 6) handleTotpSubmit(next.join(''))
  }

  const handleTotpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !totp[i] && i > 0) totpRefs.current[i - 1]?.focus()
  }

  const handleTotpSubmit = async (code: string) => {
    setLoading(true); setError('')
    try {
      const r    = await fetch('/api/auth/totp-verify', {
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
      navigate(`/${ADMIN}`)
    } finally {
      setLoading(false)
    }
  }

  const minutes = Math.floor(remaining / 60)
  const seconds = String(remaining % 60).padStart(2, '0')

  return (
    <div className="min-h-screen bg-[var(--cs-bg)] flex items-center justify-center px-6">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#C9A84C]/3 blur-[100px]" />
      </div>

      <motion.div className="relative w-full max-w-sm"
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>

        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-[#C9A84C]/10 border border-[#C9A84C]/25 flex items-center justify-center mb-5">
            {locked
              ? <Lock size={24} strokeWidth={1.5} className="text-[#FF4444]" />
              : <Shield size={24} strokeWidth={1.5} className="text-[#C9A84C]" />
            }
          </div>
          <h1 className="font-display text-2xl text-[var(--cs-text)] tracking-tight">Admin Access</h1>
          <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--cs-text-2)] mt-1">
            {locked ? 'Zugang gesperrt' : step === 'password' ? 'Passwort eingeben' : 'Authenticator Code'}
          </p>
        </div>

        <motion.div animate={shake ? { x: [-8, 8, -6, 6, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="bg-[var(--cs-s2)] border border-[#C9A84C]/15 rounded-2xl p-8">

          {/* ── Lockout-Anzeige ── */}
          {locked ? (
            <div className="flex flex-col items-center gap-5 text-center">
              <div className="text-4xl font-mono text-[#FF4444] tracking-widest">
                {minutes}:{seconds}
              </div>
              <p className="text-[var(--cs-text-2)] text-sm leading-relaxed">
                Zu viele Fehlversuche.<br />
                Bitte warte bis der Zugang entsperrt wird.
              </p>
            </div>
          ) : (
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
                      className="w-full bg-[var(--cs-s4)] border border-[#C9A84C]/15 rounded-xl px-4 py-3.5 pr-12 text-[var(--cs-text)] text-sm outline-none focus:border-[#C9A84C]/40 transition-colors placeholder-[var(--cs-text-3)]"
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--cs-text-2)] hover:text-[var(--cs-text)] transition-colors">
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

                  <p className="text-[var(--cs-text-2)] text-sm text-center leading-relaxed">
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
                        className="w-11 h-14 text-center text-xl font-mono bg-[var(--cs-s4)] border border-[#C9A84C]/20 rounded-xl text-[var(--cs-text)] outline-none focus:border-[#C9A84C]/60 transition-colors"
                      />
                    ))}
                  </div>

                  {error && <p className="text-[#FF4444] text-xs text-center">{error}</p>}

                  {loading && (
                    <div className="w-6 h-6 rounded-full border-2 border-[#C9A84C]/20 border-t-[#C9A84C] animate-spin" />
                  )}

                  <button onClick={() => { setStep('password'); setTotp(['','','','','','']); setError('') }}
                    className="text-[var(--cs-text-2)] text-xs hover:text-[var(--cs-text)] transition-colors">
                    ← Zurück
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </motion.div>

        <div className="flex justify-center mt-6">
          <Link to="/" className="flex items-center gap-2 text-[var(--cs-text-2)] hover:text-[var(--cs-text)] text-xs transition-colors">
            <Home size={13} /> Zur Website
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
