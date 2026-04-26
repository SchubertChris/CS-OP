import type { ReactNode } from 'react'
import styles from './Badge.module.scss'

type BadgeVariant = 'default' | 'gold' | 'positive' | 'negative' | 'warning' | 'info' | 'neutral'

interface BadgeProps {
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  dot?: boolean
  children?: ReactNode
  className?: string
}

export function Badge({ variant = 'default', size = 'md', dot = false, children, className }: BadgeProps) {
  if (dot) {
    return (
      <span
        className={[styles.dot, styles[variant], className].filter(Boolean).join(' ')}
        aria-hidden="true"
      />
    )
  }

  return (
    <span className={[styles.badge, styles[variant], styles[size], className].filter(Boolean).join(' ')}>
      {children}
    </span>
  )
}
