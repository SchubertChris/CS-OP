import { X, Printer } from '@phosphor-icons/react'
import styles from './DruckVorschau.module.scss'

const PRINT_ROWS = [
  { name: 'Kunde A GmbH',  date: '28.04.2026', amount: '+2.400,00', pos: true  },
  { name: 'Amazon Prime',  date: '30.04.2026', amount: '-14,99',    pos: false },
  { name: 'Rewe',          date: '27.04.2026', amount: '-67,42',    pos: false },
  { name: 'Spotify',       date: '25.04.2026', amount: '-9,99',     pos: false },
  { name: 'SCHUFA',        date: '01.04.2026', amount: '-29,95',    pos: false },
]

interface DruckVorschauProps {
  onClose: () => void
}

export function DruckVorschau({ onClose }: DruckVorschauProps) {
  return (
    <div className={styles.modal}>

        <div className={styles.head}>
          <span className={styles.title}>Druckvorschau</span>
          <button className={styles.close} onClick={onClose}><X size={14} /></button>
        </div>

        <div className={styles.paper}>
          <div className={styles.paperHeader}>
            <span className={styles.paperBrand}>CandleScope</span>
            <span className={styles.paperMeta}>Transaktionen · April 2026</span>
          </div>
          {PRINT_ROWS.map((r, i) => (
            <div key={i} className={styles.paperRow}>
              <span className={styles.paperName}>{r.name}</span>
              <span className={styles.paperDate}>{r.date}</span>
              <span className={`${styles.paperAmt} ${r.pos ? styles.pos : styles.neg}`}>
                {r.amount} €
              </span>
            </div>
          ))}
        </div>

        <div className={styles.foot}>
          <button className={styles.cancelBtn} onClick={onClose}>Abbrechen</button>
          <button className={styles.printBtn} onClick={() => window.print()}>
            <Printer size={13} weight="bold" />Drucken
          </button>
        </div>

      </div>
  )
}
