import type { ReactNode } from 'react'
import styles from './TabBar.module.scss'

interface TabItem {
  id: string
  label: string
  icon?: ReactNode
  badge?: string | number
  disabled?: boolean
}

interface TabBarProps {
  tabs: TabItem[]
  active: string
  onChange: (id: string) => void
  variant?: 'underline' | 'pill'
  size?: 'sm' | 'md'
  className?: string
}

export function TabBar({
  tabs,
  active,
  onChange,
  variant = 'underline',
  size = 'md',
  className,
}: TabBarProps) {
  return (
    <nav
      className={[styles.tabBar, styles[variant], styles[size], className].filter(Boolean).join(' ')}
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={tab.id === active}
          disabled={tab.disabled}
          className={[styles.tab, tab.id === active ? styles.active : ''].filter(Boolean).join(' ')}
          onClick={() => !tab.disabled && onChange(tab.id)}
        >
          {tab.icon && <span className={styles.tabIcon}>{tab.icon}</span>}
          <span className={styles.tabLabel}>{tab.label}</span>
          {tab.badge !== undefined && (
            <span className={styles.tabBadge}>{tab.badge}</span>
          )}
        </button>
      ))}
    </nav>
  )
}
