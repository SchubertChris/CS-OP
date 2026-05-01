import { Link } from 'react-router-dom'
import { CandlescopeLogo } from '../../shared/components/Logo/CandlescopeLogo'
import styles from './AppFooter.module.scss'

const LINKS = [
  { label: 'Impressum',   to: '/impressum'   },
  { label: 'Datenschutz', to: '/datenschutz' },
  { label: 'AGB',         to: '/agb'         },
]

export function AppFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.brand}>
        <CandlescopeLogo size={14} color="var(--cs-text-3)" />
        <span className={styles.copy}>© 2026 CandleScope</span>
      </div>

      <nav className={styles.links}>
        {LINKS.map(({ label, to }) => (
          <Link key={to} to={to} className={styles.link}>{label}</Link>
        ))}
      </nav>
    </footer>
  )
}
