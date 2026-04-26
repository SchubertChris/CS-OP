import type { ReactNode } from 'react'
import { ArrowLeft } from '@phosphor-icons/react'
import styles from './Toolbar.module.scss'

interface ToolbarProps {
  title: string
  subtitle?: string
  onBack?: () => void
  actions?: ReactNode
  tabs?: ReactNode
  sticky?: boolean
  border?: boolean
  className?: string
}

export function Toolbar({
  title,
  subtitle,
  onBack,
  actions,
  tabs,
  sticky = false,
  border = true,
  className,
}: ToolbarProps) {
  return (
    <header
      className={[
        styles.toolbar,
        sticky ? styles.sticky : '',
        border ? styles.border : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles.main}>
        {onBack && (
          <button
            type="button"
            className={styles.back}
            onClick={onBack}
            aria-label="Zurück"
          >
            <ArrowLeft size={18} weight="bold" />
          </button>
        )}

        <div className={styles.titleGroup}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>

        {actions && <div className={styles.actions}>{actions}</div>}
      </div>

      {tabs && <div className={styles.tabsSlot}>{tabs}</div>}
    </header>
  )
}
