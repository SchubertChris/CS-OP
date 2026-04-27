import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  House, ArrowsLeftRight, CreditCard, ChartLine,
  Target, Note, Buildings, FolderOpen, Envelope,
  Desktop, Gear, PushPin, PushPinSlash, Globe, ShieldStar,
} from '@phosphor-icons/react'
import { Avatar } from '../../shared/components/Avatar/Avatar'
import { CandleScopeMarkImage } from '../../shared/components/Logo/CandleScopeMarkImage'
import { useAuthStore, isAdmin } from '../../store/authStore'
import styles from './Rail.module.scss'

interface NavItem {
  path: string
  icon: React.ElementType
  label: string
  badge?: number
}

const NAV_ITEMS: NavItem[] = [
  { path: '/app/dashboard',    icon: House,           label: 'Übersicht' },
  { path: '/app/transactions', icon: ArrowsLeftRight, label: 'Transaktionen' },
  { path: '/app/accounts',     icon: CreditCard,      label: 'Konten' },
  { path: '/app/analytics',    icon: ChartLine,       label: 'Auswertung' },
  { path: '/app/goals',        icon: Target,          label: 'Sparziele' },
  { path: '/app/contracts',    icon: Note,            label: 'Verträge' },
  { path: '/app/banking',      icon: Buildings,       label: 'Verbindungen' },
  { path: '/app/archive',      icon: FolderOpen,      label: 'Archiv' },
  { path: '/app/postbox',      icon: Envelope,        label: 'Postbox', badge: 3 },
]

const BOTTOM_NAV: NavItem[] = [
  { path: '/app/devices',  icon: Desktop, label: 'Geräte' },
  { path: '/app/settings', icon: Gear,    label: 'Einstellungen' },
]

interface RailProps {
  onExpandedChange?: (expanded: boolean) => void
}

const ADMIN_URL = import.meta.env.VITE_ADMIN_URL ?? 'https://candlescope.de/cs-backstage'

export function Rail({ onExpandedChange }: RailProps) {
  const [pinned, setPinned] = useState(false)
  const [hovered, setHovered] = useState(false)
  const user = useAuthStore((s) => s.user)

  const expanded = pinned || hovered

  const handleMouseEnter = () => {
    setHovered(true)
    onExpandedChange?.(true)
  }

  const handleMouseLeave = () => {
    setHovered(false)
    if (!pinned) onExpandedChange?.(false)
  }

  const togglePin = (e: React.MouseEvent) => {
    e.stopPropagation()
    const next = !pinned
    setPinned(next)
    if (!next && !hovered) onExpandedChange?.(false)
    else onExpandedChange?.(true)
  }

  return (
    <aside
      className={styles.rail}
      data-expanded={expanded ? 'true' : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Logo + Pin */}
      <div className={styles.logoArea}>
        <CandleScopeMarkImage size={24} />
        <span className={styles.logoText}>CandleScope</span>
        <button
          className={`${styles.pinButton} ${pinned ? styles.pinButtonActive : ''}`}
          onClick={togglePin}
          title={pinned ? 'Sidebar einklappen' : 'Sidebar fixieren'}
        >
          {pinned
            ? <PushPinSlash size={12} weight="fill" />
            : <PushPin size={12} weight="fill" />
          }
        </button>
      </div>

      {/* Main nav */}
      <nav className={styles.nav}>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/app/dashboard'}
            className={({ isActive }) =>
              [styles.item, isActive ? styles.itemActive : ''].join(' ')
            }
          >
            <span className={styles.itemIcon}>
              <item.icon size={18} weight="regular" />
            </span>
            <span className={styles.itemLabel}>{item.label}</span>
            {item.badge != null && (
              <span className={styles.itemBadge}>
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className={styles.separator} />

      {/* Bottom nav */}
      <div className={styles.bottomArea}>
        {BOTTOM_NAV.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              [styles.item, isActive ? styles.itemActive : ''].join(' ')
            }
          >
            <span className={styles.itemIcon}>
              <item.icon size={18} weight="regular" />
            </span>
            <span className={styles.itemLabel}>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Admin Panel — nur für Admins */}
      {user && isAdmin(user) && (
        <a
          href={ADMIN_URL}
          className={styles.adminLink}
          title="Admin Panel"
        >
          <span className={styles.itemIcon}><ShieldStar size={18} weight="duotone" /></span>
          <span className={styles.itemLabel}>Admin Panel</span>
        </a>
      )}

      {/* Back to website */}
      <a
        href="https://candlescope.de"
        className={styles.siteLink}
        title="Zurück zur Website"
      >
        <span className={styles.itemIcon}><Globe size={18} weight="regular" /></span>
        <span className={styles.itemLabel}>candlescope.de</span>
      </a>

      {/* User area */}
      <button className={styles.userArea}>
        <Avatar name="Chris Schubert" size="xs" status="online" />
        <span className={styles.userName}>Chris S.</span>
      </button>
    </aside>
  )
}
