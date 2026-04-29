import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { IntroAnimation } from '../../intro/IntroAnimation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import {
  EnvelopeSimple, Lock, ArrowLeft,
  UserPlus, User, Key,
} from '@phosphor-icons/react'
import { TwoFAVerify } from '../components/TwoFAVerify'
import { Input } from '../../../shared/components/Input/Input'
import { Button } from '../../../shared/components/Button/Button'
import { Alert } from '../../../shared/components/Alert/Alert'
import { CandleScopeMarkImage } from '../../../shared/components/Logo/CandleScopeMarkImage'
import { useLogin } from '../hooks/useLogin'
import { loginSchema, hubRegisterSchema } from '../types/auth.types'
import type { LoginData, HubRegisterData } from '../types/auth.types'
import type { UserRole } from '../../../store/authStore'
import { useAuthStore } from '../../../store/authStore'
import { useAppStore } from '../../../store/appStore'
import { PageBackground } from '../../../shared/components/Background'
import styles from './LoginPage.module.scss'

type AuthView = 'login' | 'register' | '2fa'

const INVITE_CODES = (import.meta.env.VITE_INVITE_CODE as string | undefined ?? '')
  .split(',').map(c => c.trim()).filter(Boolean)

const CARD_TRANSITION = { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const }

export default function LoginPage() {
  const navigate  = useNavigate()
  const setUser   = useAuthStore((s) => s.setUser)
  const setTheme  = useAppStore((s) => s.setTheme)
  const [searchParams] = useSearchParams()

  // Theme-Sync: index.html hat den CSS-Wechsel bereits synchron vollzogen,
  // hier nur noch den Zustand-Store nachziehen damit der Rest der App konsistent ist.
  useEffect(() => {
    const t = searchParams.get('theme')
    if (t === 'dark' || t === 'light') setTheme(t)
  }, [])

  const [showIntro, setShowIntro]         = useState(false)
  const [view, setView]                   = useState<AuthView>('login')
  const [pendingRole, setPendingRole]     = useState<UserRole | null>(null)
  const [pendingToken, setPendingToken]   = useState<string | null>(null)
  const [totpCode, setTotpCode]           = useState('')
  const [totpError, setTotpError]         = useState<string | false>(false)
  const [totpLoading, setTotpLoading]     = useState(false)
  const [inviteCode, setInviteCode]       = useState('')
  const [inviteVerified, setInviteVerified] = useState(false)
  const [inviteError, setInviteError]     = useState(false)

  const { login, verifyAdminTotp, serverError: loginError, clearError: clearLoginError } = useLogin()

  const loginForm    = useForm<LoginData>({ resolver: zodResolver(loginSchema) })
  const registerForm = useForm<HubRegisterData>({ resolver: zodResolver(hubRegisterSchema) })

  const switchView = (next: AuthView) => {
    clearLoginError()
    loginForm.reset()
    setInviteVerified(false)
    setInviteCode('')
    setInviteError(false)
    setView(next)
  }

  const onLogin = async (data: LoginData) => {
    try {
      const { role, requiresTwoFactor, tempToken } = await login(data)
      if (requiresTwoFactor) {
        setPendingRole(role)
        setPendingToken(tempToken ?? null)
        setTotpCode('')
        setTotpError(false)
        setView('2fa')
      } else {
        if (role === 'admin') navigate('/role-select', { replace: true })
        else setShowIntro(true)
      }
    } catch { /* error in useLogin */ }
  }

  const onVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^\d{6}$/.test(totpCode)) {
      setTotpError('Bitte 6 Ziffern eingeben.')
      setTimeout(() => setTotpError(false), 2500)
      return
    }
    setTotpLoading(true)
    try {
      if (pendingToken) {
        await verifyAdminTotp(totpCode, pendingToken)
      } else {
        await new Promise<void>((r) => setTimeout(r, 600))
      }
      if (pendingRole === 'admin') navigate('/role-select', { replace: true })
      else setShowIntro(true)
    } catch (err) {
      setTotpCode('')
      const msg = err instanceof Error ? err.message : 'Ungültiger Code.'
      setTotpError(msg)
      setTimeout(() => setTotpError(false), 3000)
    } finally {
      setTotpLoading(false)
    }
  }

  const onCheckInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (INVITE_CODES.length > 0 && INVITE_CODES.includes(inviteCode.trim())) {
      setInviteVerified(true)
    } else {
      setInviteError(true)
      setTimeout(() => setInviteError(false), 2500)
    }
  }

  const onRegister = async (data: HubRegisterData) => {
    await new Promise<void>((r) => setTimeout(r, 800))
    setUser({
      id: `user-${Date.now()}`,
      email: data.email,
      displayName: data.displayName,
      avatarUrl: null,
      role: 'user',
      proExpiresAt: null,
    })
    setShowIntro(true)
  }

  const animKey = view === 'register'
    ? (inviteVerified ? 'register-form' : 'register-invite')
    : view

  const cardMaxWidth =
    view === '2fa' ? 440 :
    (view === 'register' && inviteVerified) ? 560 : 500

  if (showIntro) {
    return (
      <IntroAnimation
        isLight={document.documentElement.classList.contains('theme-light')}
        onComplete={() => navigate('/app/dashboard', { replace: true })}
      />
    )
  }

  return (
    <div className={styles.page}>
      <PageBackground />
      <div className={styles.pageInner}>
      <motion.div
        className={styles.card}
        layout
        style={{ maxWidth: cardMaxWidth }}
        initial={{ opacity: 0, y: 28, scale: 0.96, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0,  scale: 1,    filter: 'blur(0px)' }}
        transition={CARD_TRANSITION}
      >

        {/* Tab Toggle — nur bei login/register */}
        {view !== '2fa' && (
          <div className={styles.tabs} role="tablist">
            <button
              type="button" role="tab" aria-selected={view === 'login'}
              className={`${styles.tab} ${view === 'login' ? styles.tabActive : ''}`}
              onClick={() => switchView('login')}
            >
              Anmelden
            </button>
            <button
              type="button" role="tab" aria-selected={view === 'register'}
              className={`${styles.tab} ${view === 'register' ? styles.tabActive : ''}`}
              onClick={() => switchView('register')}
            >
              Registrieren
            </button>
          </div>
        )}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={animKey}
            initial={{ filter: 'blur(8px)', opacity: 0.6 }}
            animate={{ filter: 'blur(0px)', opacity: 1 }}
            exit={{ filter: 'blur(8px)', opacity: 0.6 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
          >
            <motion.div layout className={styles.brandedHeader}>
              <CandleScopeMarkImage size={64} />
              <span className={styles.brandName}>CandleScope</span>
            </motion.div>

            <div className={styles.formContent}>

              {/* ── Anmelden ───────────────────────────────────────────── */}
              {view === 'login' && (
                <>
                  {loginError && (
                    <Alert variant="error" dismissible onDismiss={clearLoginError}>
                      {loginError}
                    </Alert>
                  )}
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className={styles.form} noValidate>
                    <Input
                      id="login-email" type="email" placeholder="E-Mail"
                      autoComplete="email" variant="flat"
                      leading={<EnvelopeSimple size={16} />}
                      error={loginForm.formState.errors.email?.message}
                      {...loginForm.register('email')}
                    />
                    <div className={styles.passwordGroup}>
                      <Input
                        id="login-password" type="password" placeholder="Passwort"
                        autoComplete="current-password" variant="flat"
                        leading={<Lock size={16} />}
                        error={loginForm.formState.errors.password?.message}
                        {...loginForm.register('password')}
                      />
                      <a href="/forgot-password" className={styles.forgotLink}>
                        Passwort vergessen?
                      </a>
                    </div>
                    <Button type="submit" size="lg"
                      loading={loginForm.formState.isSubmitting}
                      disabled={loginForm.formState.isSubmitting}
                      className={styles.submitBtn}
                    >
                      Anmelden
                    </Button>
                  </form>
                </>
              )}

              {/* ── Registrieren: Einladungscode ───────────────────────── */}
              {view === 'register' && !inviteVerified && (
                <form onSubmit={onCheckInvite} className={styles.form}>
                  <div className={styles.inviteHeader}>
                    <UserPlus size={32} weight="duotone" className={styles.inviteIcon} />
                    <p className={styles.registerLockedTitle}>Einladungscode erforderlich</p>
                    <p className={styles.registerLockedSub}>
                      Der FinanzHub ist aktuell auf Einladung beschränkt.
                      Gib deinen persönlichen Code ein.
                    </p>
                  </div>
                  <Input
                    id="invite-code" type="text" placeholder="Einladungscode"
                    variant="flat" leading={<Key size={16} />}
                    autoComplete="off"
                    error={inviteError ? 'Ungültiger Einladungscode.' : undefined}
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                  />
                  <Button type="submit" size="lg" className={styles.submitBtn}
                    disabled={!inviteCode.trim()}>
                    Weiter
                  </Button>
                  <a href="mailto:info@candlescope.de" className={styles.registerLockedLink}>
                    Keinen Code? — info@candlescope.de
                  </a>
                </form>
              )}

              {/* ── Registrieren: Formular ─────────────────────────────── */}
              {view === 'register' && inviteVerified && (
                <form
                  onSubmit={registerForm.handleSubmit(onRegister)}
                  className={styles.formGrid}
                  noValidate
                >
                  <Input
                    id="reg-name" type="text" placeholder="Anzeigename"
                    variant="flat" leading={<User size={16} />}
                    autoComplete="name"
                    error={registerForm.formState.errors.displayName?.message}
                    {...registerForm.register('displayName')}
                  />
                  <Input
                    id="reg-email" type="email" placeholder="E-Mail"
                    variant="flat" leading={<EnvelopeSimple size={16} />}
                    autoComplete="email"
                    error={registerForm.formState.errors.email?.message}
                    {...registerForm.register('email')}
                  />
                  <Input
                    id="reg-pw" type="password" placeholder="Passwort"
                    variant="flat" leading={<Lock size={16} />}
                    autoComplete="new-password"
                    error={registerForm.formState.errors.password?.message}
                    {...registerForm.register('password')}
                  />
                  <Input
                    id="reg-pw2" type="password" placeholder="Passwort bestätigen"
                    variant="flat" leading={<Lock size={16} />}
                    autoComplete="new-password"
                    error={registerForm.formState.errors.confirmPassword?.message}
                    {...registerForm.register('confirmPassword')}
                  />
                  <Button
                    type="submit" size="lg"
                    loading={registerForm.formState.isSubmitting}
                    disabled={registerForm.formState.isSubmitting}
                  >
                    Konto erstellen
                  </Button>
                </form>
              )}

              {/* ── Zwei-Faktor-Authentifizierung ──────────────────────── */}
              {view === '2fa' && (
                <TwoFAVerify
                  totpCode={totpCode}
                  totpError={totpError}
                  isLoading={totpLoading}
                  onChange={setTotpCode}
                  onSubmit={onVerify2FA}
                  onBack={() => { setView('login'); setTotpCode(''); setTotpError(false) }}
                />
              )}

            </div>
          </motion.div>
        </AnimatePresence>

      </motion.div>

      <a href="https://candlescope.de" className={styles.backToSite}>
        <ArrowLeft size={12} />
        Zurück zur Website
      </a>
      </div>
    </div>
  )
}
