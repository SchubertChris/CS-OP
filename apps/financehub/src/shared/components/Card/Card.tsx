import type { ReactNode } from 'react'
import styles from './Card.module.scss'

interface CardProps {
  children: ReactNode
  variant?: 'default' | 'titled' | 'elevated' | 'glass' | 'gold'
  title?: string
  icon?: ReactNode
  action?: ReactNode
  footer?: ReactNode
  className?: string
  onClick?: () => void
}

export function Card({
  children,
  variant = 'default',
  title,
  icon,
  action,
  footer,
  className,
  onClick,
}: CardProps) {
  const classes = [styles.card, styles[variant], className, onClick ? styles.clickable : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} onClick={onClick}>
      {title && (
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            {icon && <span className={styles.headerIcon}>{icon}</span>}
            <span className={styles.headerTitle}>{title}</span>
          </div>
          {action && <div className={styles.headerAction}>{action}</div>}
        </div>
      )}
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  )
}
