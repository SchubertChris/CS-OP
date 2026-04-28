import { useState, useEffect, useCallback } from 'react'
import { CandlescopeLogo } from '../../shared/components/Logo/CandlescopeLogo'
import { applyThemeFull, resetTheme } from '../../utils/theme'
import type { BaseMode, AccentMode } from '../../utils/theme'
import { IntroAnimation } from './IntroAnimation'
import styles from './DevSandboxPage.module.scss'
import introStyles from './IntroAnimation.module.scss'

const ACCENTS: { id: AccentMode; label: string; color: string }[] = [
  { id: 'default',  label: 'Gold',     color: '#C9A84C' },
  { id: 'ocean',    label: 'Ocean',    color: '#4B9EFF' },
  { id: 'forest',   label: 'Forest',   color: '#34C772' },
  { id: 'rose',     label: 'Rose',     color: '#F97070' },
  { id: 'midnight', label: 'Midnight', color: '#3B5BDB' },
]

// ─── Sandbox-Page ─────────────────────────────────────────────────────────────

export default function DevSandboxPage() {
  const [mode,    setMode]    = useState<BaseMode>('light')
  const [accent,  setAccent]  = useState<AccentMode>('default')
  const [playing, setPlaying] = useState(true)

  const replay    = useCallback(() => setPlaying(true), [])
  const onComplete = useCallback(() => setPlaying(false), [])

  // Theme bei Änderung anwenden — mit globalem Wipe
  useEffect(() => {
    applyThemeFull(mode, accent)
  }, [mode, accent])

  // Beim Verlassen der Sandbox: auf Default zurücksetzen
  useEffect(() => {
    return () => resetTheme()
  }, [])

  // Midnight ist immer dark → Mode-Buttons irrelevant
  const isMidnight = accent === 'midnight'

  return (
    <div className={styles.sandbox}>

      {/* ── Topbar ── */}
      <header className={styles.topbar}>

        <div className={styles.brand}>
          <CandlescopeLogo size={14} />
          <span className={styles.brandLabel}>Dev Sandbox</span>
        </div>

        <div className={styles.controls}>

          {/* Light / Dark Toggle */}
          <div className={`${styles.modeToggle} ${isMidnight ? styles.disabled : ''}`}>
            <button
              className={`${styles.modeBtn} ${mode === 'light' && !isMidnight ? styles.modeBtnActive : ''}`}
              onClick={() => !isMidnight && setMode('light')}
              disabled={isMidnight}
              title="Light Mode"
            >
              <span>☀</span> Light
            </button>
            <button
              className={`${styles.modeBtn} ${(mode === 'dark' || isMidnight) ? styles.modeBtnActive : ''}`}
              onClick={() => !isMidnight && setMode('dark')}
              disabled={isMidnight}
              title="Dark Mode"
            >
              <span>☾</span> Dark
            </button>
          </div>

          {/* Accent Dots */}
          <div className={styles.accents}>
            {ACCENTS.map(a => (
              <button
                key={a.id}
                className={`${styles.accentDot} ${accent === a.id ? styles.accentActive : ''}`}
                style={{ '--dot': a.color } as React.CSSProperties}
                onClick={() => setAccent(a.id)}
                title={a.label}
                aria-label={`Theme: ${a.label}`}
              />
            ))}
          </div>

          {/* Aktuelles Theme-Label */}
          <span className={styles.themeLabel}>
            {isMidnight ? 'Midnight' : `${ACCENTS.find(a => a.id === accent)?.label} · ${mode === 'dark' ? 'Dark' : 'Light'}`}
          </span>

        </div>
      </header>

      {/* ── Canvas ── */}
      <main className={styles.canvas}>
        <div className={styles.canvasInner}>
          <div className={introStyles.sandboxWrap}>
            {playing
              ? <IntroAnimation key={String(playing)} onComplete={onComplete} />
              : (
                <div className={introStyles.doneState}>
                  <span>Animation abgeschlossen</span>
                  <button className={introStyles.replayBtn} onClick={replay}>
                    Replay
                  </button>
                </div>
              )
            }
          </div>
        </div>
      </main>

    </div>
  )
}
