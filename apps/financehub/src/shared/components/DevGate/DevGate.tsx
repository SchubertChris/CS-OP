import { useState } from 'react'
import { CandleScopeMarkImage } from '../Logo/CandleScopeMarkImage'
import styles from './DevGate.module.scss'

const GATE_CODE   = import.meta.env.VITE_DEV_GATE_CODE as string | undefined
const STORAGE_KEY = '_cs_gate'

function isUnlocked(): boolean {
  if (!GATE_CODE) return true
  return localStorage.getItem(STORAGE_KEY) === GATE_CODE
}

interface Props {
  children: React.ReactNode
}

export function DevGate({ children }: Props) {
  const [unlocked, setUnlocked] = useState(isUnlocked)
  const [open, setOpen]         = useState(false)
  const [input, setInput]       = useState('')
  const [error, setError]       = useState(false)

  if (unlocked) return <>{children}</>

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input === GATE_CODE) {
      localStorage.setItem(STORAGE_KEY, GATE_CODE)
      setUnlocked(true)
    } else {
      setError(true)
      setInput('')
      setTimeout(() => setError(false), 2000)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.brand}>
          <CandleScopeMarkImage size={64} />
          <span className={styles.brandName}>CandleScope</span>
        </div>

        <div className={styles.status}>
          <span className={styles.statusDot} />
          In Entwicklung
        </div>

        <p className={styles.headline}>FinanzHub kommt bald.</p>
        <p className={styles.sub}>
          Wir bauen gerade etwas Besonderes. Der CandleScope FinanzHub wird
          dein persönlicher Finanz-Cockpit — smarter, privater, schöner.
        </p>

        {!open && (
          <button className={styles.gateToggle} onClick={() => setOpen(true)}>
            ⬡ Entwicklerzugang
          </button>
        )}

        {open && (
          <form className={styles.gateForm} onSubmit={handleSubmit}>
            <input
              className={styles.gateInput}
              type="password"
              placeholder="Zugangscode"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
            />
            <button className={styles.gateBtn} type="submit">→</button>
          </form>
        )}

        {error && (
          <span className={styles.gateError}>Falscher Code.</span>
        )}
      </div>
    </div>
  )
}
