import { useState, useEffect } from 'react'
import { CandlescopeLogo } from '../../shared/components/Logo/CandlescopeLogo'
import { applyThemeFull, resetTheme } from '../../utils/theme'
import type { BaseMode, AccentMode } from '../../utils/theme'
import { LayoutPrototypes } from './LayoutPrototypes'
import { NavPrototypes } from './NavPrototypes'
import styles from './DevSandboxPage.module.scss'

const ACCENTS: { id: AccentMode; label: string; color: string }[] = [
  { id: 'default',  label: 'Gold',     color: '#C9A84C' },
  { id: 'ocean',    label: 'Ocean',    color: '#4B9EFF' },
  { id: 'forest',   label: 'Forest',   color: '#34C772' },
  { id: 'rose',     label: 'Rose',     color: '#F97070' },
  { id: 'midnight', label: 'Midnight', color: '#3B5BDB' },
]

export default function DevSandboxPage() {
  const [mode,   setMode]   = useState<BaseMode>('light')
  const [accent, setAccent] = useState<AccentMode>('default')

  useEffect(() => { applyThemeFull(mode, accent) }, [mode, accent])
  useEffect(() => () => resetTheme(), [])

  const isMidnight = accent === 'midnight'

  return (
    <div className={styles.sandbox}>

      <header className={styles.topbar}>
        <div className={styles.brand}>
          <CandlescopeLogo size={14} />
          <span className={styles.brandLabel}>Dev Sandbox</span>
        </div>

        <div className={styles.controls}>
          <div className={`${styles.modeToggle} ${isMidnight ? styles.disabled : ''}`}>
            <button
              className={`${styles.modeBtn} ${mode === 'light' && !isMidnight ? styles.modeBtnActive : ''}`}
              onClick={() => !isMidnight && setMode('light')}
              disabled={isMidnight}
            >
              <span>☀</span> Light
            </button>
            <button
              className={`${styles.modeBtn} ${mode === 'dark' || isMidnight ? styles.modeBtnActive : ''}`}
              onClick={() => !isMidnight && setMode('dark')}
              disabled={isMidnight}
            >
              <span>☾</span> Dark
            </button>
          </div>

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

          <span className={styles.themeLabel}>
            {isMidnight ? 'Midnight' : `${ACCENTS.find(a => a.id === accent)?.label} · ${mode === 'dark' ? 'Dark' : 'Light'}`}
          </span>
        </div>
      </header>

      <main className={styles.canvas}>
        <div className={styles.canvasInner}>
          <LayoutPrototypes />
          <NavPrototypes />
        </div>
      </main>

    </div>
  )
}
