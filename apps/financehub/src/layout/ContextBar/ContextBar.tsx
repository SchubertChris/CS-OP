import { useLocation } from 'react-router-dom'
import { MagnifyingGlass, Bell } from '@phosphor-icons/react'
import { Avatar } from '../../shared/components/Avatar/Avatar'
import { Button } from '../../shared/components/Button/Button'
import styles from './ContextBar.module.scss'

const ROUTE_META: Record<string, { title: string; subtitle?: string }> = {
  '/app/dashboard':    { title: 'Übersicht' },
  '/app/transactions': { title: 'Transaktionen' },
  '/app/accounts':     { title: 'Konten' },
  '/app/analytics':    { title: 'Auswertung' },
  '/app/goals':        { title: 'Sparziele' },
  '/app/contracts':    { title: 'Verträge' },
  '/app/banking':      { title: 'Verbindungen' },
  '/app/archive':      { title: 'Archiv' },
  '/app/postbox':      { title: 'Postbox' },
  '/app/devices':      { title: 'Geräte' },
  '/app/settings':     { title: 'Einstellungen' },
}

interface ContextBarProps {
  expanded: boolean
  onSearchClick?: () => void
  onBellClick?: () => void
  netWorth?: string
  notificationCount?: number
}

export function ContextBar({
  expanded,
  onSearchClick,
  onBellClick,
  netWorth = '€24.890',
  notificationCount = 0,
}: ContextBarProps) {
  const { pathname } = useLocation()

  const meta = Object.entries(ROUTE_META).find(([path]) => pathname.startsWith(path))
  const title = meta?.[1].title ?? 'CandleScope'
  const subtitle = meta?.[1].subtitle

  return (
    <header className={`${styles.bar} ${expanded ? styles.expanded : ''}`}>

      {/* Search trigger */}
      <button className={styles.searchTrigger} onClick={onSearchClick}>
        <MagnifyingGlass size={13} className={styles.searchIcon} />
        <span className={styles.searchText}>Suchen...</span>
        <kbd className={styles.kbd}>⌘K</kbd>
      </button>

      {/* Page title */}
      <div className={styles.titleArea}>
        <span className={styles.title}>{title}</span>
        {subtitle && (
          <>
            <span className={styles.titleSep}>·</span>
            <span className={styles.subtitle}>{subtitle}</span>
          </>
        )}
      </div>

      {/* Right side */}
      <div className={styles.rightArea}>

        {/* Net-worth pill */}
        <div className={styles.netWorth}>
          <span className={styles.netWorthValue}>{netWorth}</span>
        </div>

        {/* Notification bell */}
        <div className={styles.bellWrap}>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            iconLeft={<Bell size={16} weight={notificationCount > 0 ? 'fill' : 'regular'} />}
            onClick={onBellClick}
          />
          {notificationCount > 0 && <span className={styles.notifDot} />}
        </div>

        {/* User avatar */}
        <Avatar name="Chris Schubert" size="xs" status="online" />
      </div>
    </header>
  )
}
