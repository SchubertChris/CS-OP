import type { ReactNode } from 'react'
import styles from './Divider.module.scss'

interface DividerProps {
  variant?: 'subtle' | 'neutral' | 'gold' | 'gradient'
  label?: ReactNode
  spacing?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Divider({
  variant = 'neutral',
  label,
  spacing = 'md',
  className,
}: DividerProps) {
  const classes = [
    styles.divider,
    styles[variant],
    styles[`spacing-${spacing}`],
    label ? styles.labeled : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (label) {
    return (
      <div className={classes} role="separator">
        <span className={styles.labelText}>{label}</span>
      </div>
    )
  }

  return <hr className={classes} role="separator" />
}
