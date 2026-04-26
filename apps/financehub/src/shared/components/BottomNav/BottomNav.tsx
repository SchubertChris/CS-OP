import type { ReactNode } from 'react'
import styles from './BottomNav.module.scss'

interface BottomNavItem {
  id: string
  label: string
  icon: ReactNode
  badge?: number
  disabled?: boolean
}

interface BottomNavProps {
  items: BottomNavItem[]
  active: string
  onChange: (id: string) => void
  className?: string
}

export function BottomNav({ items, active, onChange, className }: BottomNavProps) {
  return (
    <nav className={[styles.nav, className].filter(Boolean).join(' ')}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          disabled={item.disabled}
          className={[styles.item, item.id === active ? styles.active : ''].filter(Boolean).join(' ')}
          onClick={() => !item.disabled && onChange(item.id)}
        >
          <span className={styles.iconWrap}>
            {item.icon}
            {item.badge !== undefined && item.badge > 0 && (
              <span className={styles.badge}>
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </span>
          <span className={styles.label}>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
