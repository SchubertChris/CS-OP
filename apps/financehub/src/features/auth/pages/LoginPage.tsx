import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import { EnvelopeSimple, Lock } from '@phosphor-icons/react'
import { Input } from '../../../shared/components/Input/Input'
import { Button } from '../../../shared/components/Button/Button'
import { Alert } from '../../../shared/components/Alert/Alert'
import { CandleScopeMarkImage } from '../../../shared/components/Logo/CandleScopeMarkImage'
import { useLogin } from '../hooks/useLogin'
import { loginSchema } from '../types/auth.types'
import type { LoginData } from '../types/auth.types'
import styles from './LoginPage.module.scss'

type AuthView = 'login' | 'register'

const CARD_TRANSITION = { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const }

export default function LoginPage() {
  const navigate = useNavigate()
  const [view, setView] = useState<AuthView>('login')

  const { login, serverError: loginError, clearError: clearLoginError } = useLogin()

  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) })

  const switchView = (next: AuthView) => {
    clearLoginError()
    loginForm.reset()
    setView(next)
  }

  const onLogin = async (data: LoginData) => {
    try {
      const role = await login(data)
      navigate(role === 'admin' ? '/role-select' : '/app/dashboard', { replace: true })
    } catch { /* error in useLogin */ }
  }

  const serverError = loginError
  const clearError  = clearLoginError

  return (
    <div className={styles.page}>
      <div className={styles.bgOrb} aria-hidden="true" />
      <motion.div
        className={styles.card}
        layout
        style={{ maxWidth: view === 'register' ? 620 : 500 }}
        initial={{ opacity: 0, y: 28, scale: 0.96, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0,  scale: 1,    filter: 'blur(0px)' }}
        transition={CARD_TRANSITION}
      >

        {/* ── Tab Toggle — Pill-Stil, card overflow:hidden clippt Ecken ── */}
        <div className={styles.tabs} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'login'}
            className={`${styles.tab} ${view === 'login' ? styles.tabActive : ''}`}
            onClick={() => switchView('login')}
          >
            Anmelden
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'register'}
            className={`${styles.tab} ${view === 'register' ? styles.tabActive : ''}`}
            onClick={() => switchView('register')}
          >
            Registrieren
          </button>
        </div>

        {/* ── Inhalt — blurt kurz beim Tab-Wechsel ── */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={view}
            initial={{ filter: 'blur(8px)', opacity: 0.6 }}
            animate={{ filter: 'blur(0px)', opacity: 1 }}
            exit={{ filter: 'blur(8px)', opacity: 0.6 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
          >
            {/* layout auf dem Header damit Framer den Gegentransform für
                den card-layout-Wechsel anwenden kann — Logo verzerrt sonst */}
            <motion.div layout className={styles.brandedHeader}>
              <CandleScopeMarkImage size={64} className={styles.brandMark} />
              <span className={styles.brandName}>CandleScope</span>
            </motion.div>

            <div className={styles.formContent}>
              {serverError && (
                <Alert variant="error" dismissible onDismiss={clearError}>
                  {serverError}
                </Alert>
              )}

              {view === 'login' ? (
                <form onSubmit={loginForm.handleSubmit(onLogin)} className={styles.form} noValidate>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="E-Mail"
                    autoComplete="email"
                    variant="flat"
                    leading={<EnvelopeSimple size={16} />}
                    error={loginForm.formState.errors.email?.message}
                    {...loginForm.register('email')}
                  />
                  <div className={styles.passwordGroup}>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Passwort"
                      autoComplete="current-password"
                      variant="flat"
                      leading={<Lock size={16} />}
                      error={loginForm.formState.errors.password?.message}
                      {...loginForm.register('password')}
                    />
                    <a href="/forgot-password" className={styles.forgotLink}>
                      Passwort vergessen?
                    </a>
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    loading={loginForm.formState.isSubmitting}
                    disabled={loginForm.formState.isSubmitting}
                    className={styles.submitBtn}
                  >
                    Anmelden
                  </Button>
                </form>
              ) : (
                <div className={styles.registerLocked}>
                  <span className={styles.registerLockedIcon}>🔒</span>
                  <p className={styles.registerLockedTitle}>Registrierung noch nicht verfügbar</p>
                  <p className={styles.registerLockedSub}>
                    Der CandleScope FinanzHub befindet sich noch in der Entwicklung.
                    Registrierungen sind aktuell nur auf Einladung möglich.
                  </p>
                  <a href="mailto:kontakt@candlescope.de" className={styles.registerLockedLink}>
                    kontakt@candlescope.de
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

      </motion.div>
    </div>
  )
}
